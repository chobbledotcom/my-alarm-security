#!/usr/bin/env bun

/*
 * Generates _includes/service-area-map.svg.
 *
 * The map is a static asset: run this script when a location or the ONS
 * boundary data changes, then commit the regenerated SVG. Normal site builds
 * do not fetch anything.
 *
 *   bun run generate:service-area-map
 *   bun run generate:service-area-map -- --refresh
 *
 * Clickable districts come from the location pages listed in
 * service-areas.json. Each town's district is the ONS ward containing its
 * centre, plus any nearby ward whose centroid is within 1.35 km. Remaining
 * wards near the coverage are grouped into non-clickable "covered area"
 * districts using gap-labels.json.
 *
 * Boundary data: ONS Open Geography Portal, May 2024, Open Government
 * Licence v3.0. Contains OS data © Crown copyright and database right 2024.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as turf from "@turf/turf";

const ROOT = join(import.meta.dir, "../..");
const CACHE = join(ROOT, ".map-cache");
const OUTPUT = join(ROOT, "_includes/service-area-map.svg");
const SERVICE_AREAS = JSON.parse(
  readFileSync(join(import.meta.dir, "service-areas.json"), "utf8"),
);
const GAP_LABELS = JSON.parse(
  readFileSync(join(import.meta.dir, "gap-labels.json"), "utf8"),
);

const FRAME = { lonMin: -0.11, lonMax: 0.5, latMin: 51.22, latMax: 51.545 };
const PAD = 24;
const OUT_W = 1000;
const COS = Math.cos(51.4 * (Math.PI / 180));
const SCALE = (OUT_W - PAD * 2) / ((FRAME.lonMax - FRAME.lonMin) * COS);
const OUT_H = Math.round((FRAME.latMax - FRAME.latMin) * SCALE + PAD * 2);

const MASK_CODES = new Set([
  "E09000004", // Bexley
  "E09000006", // Bromley
  "E09000011", // Greenwich
  "E09000023", // Lewisham
  "E07000107", // Dartford
  "E07000109", // Gravesham
  "E07000111", // Sevenoaks
]);

const REFRESH = process.argv.includes("--refresh");

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const escapeXml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const project = ([lon, lat]) => [
  PAD + (lon - FRAME.lonMin) * COS * SCALE,
  PAD + (FRAME.latMax - lat) * SCALE,
];
const fmt = (value) => (Math.round(value * 10) / 10).toString();
const ringPath = (ring) =>
  ring
    .map(([lon, lat], index) => {
      const [x, y] = project([lon, lat]);
      return `${index === 0 ? "M" : "L"}${fmt(x)},${fmt(y)}`;
    })
    .join(" ") + "Z";
const geomPath = (parts) =>
  parts.map((poly) => poly.map(ringPath).join(" ")).join(" ");

const boundaryUrl = (service, fields) => {
  const params = new URLSearchParams({
    where: "1=1",
    geometry: "-0.5,51.1,1.0,51.7",
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: fields,
    outSR: "4326",
    f: "geojson",
  });
  return `https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/${service}/FeatureServer/0/query?${params}`;
};

const loadBoundaries = async (service, fields, cacheName) => {
  const cacheFile = join(CACHE, cacheName);
  if (!REFRESH && existsSync(cacheFile)) {
    return JSON.parse(readFileSync(cacheFile, "utf8"));
  }

  console.log(`Fetching ${service}...`);
  const response = await fetch(boundaryUrl(service, fields));
  if (!response.ok) {
    throw new Error(`${service}: HTTP ${response.status}`);
  }
  const data = await response.json();
  if (data.exceededTransferLimit) {
    throw new Error(`${service}: query exceeded the transfer limit`);
  }
  mkdirSync(CACHE, { recursive: true });
  writeFileSync(cacheFile, JSON.stringify(data));
  return data;
};

console.log("Loading boundary data...");
const lads = await loadBoundaries(
  "Local_Authority_Districts_May_2024_Boundaries_UK_BGC",
  "LAD24CD,LAD24NM",
  "lads-may-2024.json",
);
const wards = await loadBoundaries(
  "Wards_May_2024_Boundaries_UK_BGC",
  "WD24CD,WD24NM",
  "wards-may-2024.json",
);

const mask = turf.union(
  turf.featureCollection(
    lads.features.filter((feature) =>
      MASK_CODES.has(feature.properties.LAD24CD),
    ),
  ),
);
const localWards = wards.features.filter((ward) =>
  turf.booleanIntersects(ward, mask),
);

const points = SERVICE_AREAS.map((area) => {
  const slug = slugify(area.name);
  if (!existsSync(join(ROOT, "locations", `${slug}.md`))) {
    throw new Error(
      `No locations/${slug}.md for "${area.name}" - update service-areas.json`,
    );
  }
  return { ...area, slug };
});
console.log(`Assigning ${localWards.length} wards to ${points.length} areas...`);
const assigned = new Map(points.map((area) => [area.slug, []]));
for (const ward of localWards) {
  const centroid = turf.centroid(ward);
  let nearest = null;
  for (const area of points) {
    const point = turf.point([area.lon, area.lat]);
    const km = turf.distance(centroid, point, { units: "kilometers" });
    if (!nearest || km < nearest.km) nearest = { area, km };
  }

  let owner = null;
  for (const area of points) {
    if (turf.booleanPointInPolygon([area.lon, area.lat], ward)) {
      owner = area;
      break;
    }
  }
  if (!owner && nearest.km <= 1.35) owner = nearest.area;

  if (owner && !assigned.get(owner.slug).includes(ward)) {
    assigned.get(owner.slug).push(ward);
  }
}

// A town centre can fall in a ward already claimed by a neighbouring area.
// Give any empty area its nearest unclaimed ward so it still has a shape.
for (const area of points) {
  if (assigned.get(area.slug).length > 0) continue;
  let best = null;
  for (const ward of localWards) {
    const used = [...assigned.values()].some((list) => list.includes(ward));
    if (used) continue;
    const km = turf.distance(turf.centroid(ward), turf.point([area.lon, area.lat]), {
      units: "kilometers",
    });
    if (!best || km < best.km) best = { ward, km };
  }
  if (best && best.km <= 3) assigned.get(area.slug).push(best.ward);
}

const simplifyParts = (feature, tolerance) => {
  const simplified = turf.simplify(feature, {
    tolerance,
    highQuality: true,
  });
  return simplified.geometry.type === "Polygon"
    ? [simplified.geometry.coordinates]
    : simplified.geometry.coordinates;
};

const cells = [];
for (const area of points) {
  const list = assigned.get(area.slug);
  if (list.length === 0) {
    throw new Error(`No wards found for ${area.name}`);
  }
  const merged =
    list.length === 1 ? list[0] : turf.union(turf.featureCollection(list));
  cells.push({
    name: area.name,
    slug: area.slug,
    static: false,
    parts: simplifyParts(merged, 0.00025),
  });
}

const usedCodes = new Set();
for (const list of assigned.values()) {
  for (const ward of list) usedCodes.add(ward.properties.WD24CD);
}

const unassigned = localWards.filter(
  (ward) =>
    !usedCodes.has(ward.properties.WD24CD) &&
    turf.booleanPointInPolygon(turf.centroid(ward), mask),
);

const cellPoints = cells.map((cell) =>
  turf.centroid(
    cell.parts.length === 1
      ? turf.polygon(cell.parts[0])
      : turf.multiPolygon(cell.parts),
  ),
);
const coverage = turf.buffer(
  turf.convex(turf.featureCollection(cellPoints)),
  5,
  { units: "kilometers", steps: 48 },
);

const gapGroups = new Map();
for (const ward of unassigned) {
  if (!turf.booleanPointInPolygon(turf.centroid(ward), coverage)) continue;
  const label = GAP_LABELS[ward.properties.WD24NM];
  if (!label) {
    console.warn(
      `No gap label for "${ward.properties.WD24NM}" - add it to gap-labels.json`,
    );
    continue;
  }
  if (!gapGroups.has(label)) gapGroups.set(label, []);
  gapGroups.get(label).push(ward);
}

const gaps = [];
for (const [label, list] of gapGroups) {
  const merged =
    list.length === 1 ? list[0] : turf.union(turf.featureCollection(list));
  gaps.push({
    name: label,
    slug: `gap-${slugify(label)}`,
    static: true,
    parts: simplifyParts(merged, 0.0004),
  });
}

console.log(`Built ${cells.length} linked areas and ${gaps.length} gap areas.`);

const overlapsFrame = (bbox) =>
  bbox[0] <= FRAME.lonMax &&
  bbox[2] >= FRAME.lonMin &&
  bbox[1] <= FRAME.latMax &&
  bbox[3] >= FRAME.latMin;

const basePaths = [];
for (const feature of lads.features) {
  if (!overlapsFrame(turf.bbox(feature))) continue;
  basePaths.push(geomPath(simplifyParts(feature, 0.0008)));
}

const areaBody = (cell) => {
  const d = geomPath(cell.parts);
  return `          <path id="sa-border-${cell.slug}" class="sa-map-region" d="${d}" fill-rule="evenodd"/>
          <g class="sa-map-shine" clip-path="url(#sa-clip-${cell.slug})" aria-hidden="true">
            <g transform="rotate(18)">
              <rect class="sa-map-shine-bar" x="-520" y="-700" width="210" height="2100"/>
            </g>
          </g>`;
};

const linkedMarkup = cells
  .map(
    (cell) => `      <g class="sa-map-area" data-name="${escapeXml(cell.name)}" data-slug="${cell.slug}">
        <a href="/pages/${cell.slug}/#content" aria-label="${escapeXml(cell.name)}">
${areaBody(cell)}
        </a>
      </g>`,
  )
  .join("\n");

const gapMarkup = gaps
  .map(
    (cell) => `      <g class="sa-map-area sa-map-area--static" data-name="${escapeXml(cell.name)}" data-slug="${cell.slug}">
        <title>${escapeXml(cell.name)} — covered area</title>
${areaBody(cell)}
      </g>`,
  )
  .join("\n");

const clipMarkup = [...gaps, ...cells]
  .map(
    (cell) =>
      `      <clipPath id="sa-clip-${cell.slug}"><use href="#sa-border-${cell.slug}" xlink:href="#sa-border-${cell.slug}"/></clipPath>`,
  )
  .join("\n");

const label = (text, lon, lat, className = "") => {
  const [x, y] = project([lon, lat]);
  return `      <text class="sa-map-label ${className}" x="${fmt(x)}" y="${fmt(y)}">${text}</text>`;
};

const svg = `<!-- Generated by scripts/map/generate-service-area-map.js - do not edit by hand. -->
<svg class="sa-map-svg" viewBox="0 0 ${OUT_W} ${OUT_H}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="group" aria-labelledby="sa-map-title" aria-describedby="sa-map-desc">
  <title id="sa-map-title">Our service areas across South East London and Kent</title>
  <desc id="sa-map-desc">A map of South East London and Kent with the towns we cover outlined in red. Linked towns open a local page.</desc>
  <defs>
    <linearGradient id="sa-shine-gradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="0.45" stop-color="#ffffff" stop-opacity="0.5"/>
      <stop offset="0.55" stop-color="#ffffff" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
${clipMarkup}
  </defs>
  <rect class="sa-map-water" width="${OUT_W}" height="${OUT_H}"/>
  <g class="sa-map-base" aria-hidden="true">
${basePaths.map((d) => `    <path d="${d}"/>`).join("\n")}
  </g>
  <g class="sa-map-labels" aria-hidden="true">
${label("LONDON", -0.085, 51.525, "sa-map-label--wide")}
${label("KENT", 0.435, 51.245, "sa-map-label--wide")}
  </g>
  <g class="sa-map-gaps">
${gapMarkup}
  </g>
  <g class="sa-map-areas">
${linkedMarkup}
  </g>
  <g class="sa-map-dots" aria-hidden="true"></g>
</svg>
`;

writeFileSync(OUTPUT, svg);
console.log(
  `Wrote ${OUTPUT} (${svg.length} bytes, ${OUT_W}x${OUT_H}, ${basePaths.length} base paths).`,
);
