# Service area map generator

`generate-service-area-map.js` builds `_includes/service-area-map.svg` from ONS
ward boundaries.

```sh
bun run generate:service-area-map
```

The generated SVG is committed. Normal site builds do not fetch anything.

## Sources

- Local authority and ward boundaries: ONS Open Geography Portal, May 2024.
  The map uses Bexley, Bromley, Greenwich, Lewisham, Dartford, Gravesham and
  Sevenoaks. Contains OS data © Crown copyright and database right 2024,
  licensed under the Open Government Licence v3.0.
- Town centre coordinates: `service-areas.json`, based on OpenStreetMap place
  nodes (ODbL).

Boundary responses are cached in `.map-cache/` (gitignored). Delete the cache
or pass `--refresh` to fetch the latest data:

```sh
bun run generate:service-area-map -- --refresh
```

## How areas are assigned

1. The ward containing each linked town's centre becomes part of that town.
2. Any unclaimed ward whose centroid is within 1.35 km of a town centre is
   added to the nearest town, so the district covers more than a single ward.
3. Unclaimed wards within 5 km of the coverage hull become non-clickable
   "covered area" districts, grouped by the labels in `gap-labels.json`.
4. Areas are dissolved, simplified and projected to the SVG view box.

## Adding a town

- **With a local page:** add the name and lon/lat to `service-areas.json`, add
  `locations/<slug>.md`, then regenerate. The script fails if the location file
  is missing, so the map cannot point at a dead link.
- **Covered but with no page:** add the unassigned ward name to
  `gap-labels.json`; it becomes a non-clickable red area with a tooltip.

The map's white dots are not part of the SVG. `assets/js/service-map.js` reads
the rendered district outlines, builds their shared border graph and moves the
dots across junctions, switching between districts at random.
