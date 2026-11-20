/*
 * Service area map.
 *
 * The districts are plain SVG links, so they work without this script. Here we
 * add the name tooltip that follows the pointer (or the district's centre on
 * keyboard focus), and animate a handful of white dots along the shared border
 * network. At junctions the dots pick a random outgoing border, so they cross
 * between districts instead of looping one outline forever.
 */

const SVG_NS = "http://www.w3.org/2000/svg";
const DOT_SPEED = 16;

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Small deterministic random generator so the dots start the same every visit
const seededRandom = (seed) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

const parsePath = (data) => {
  const subpaths = [];
  let current = null;
  const tokens = data.match(/[MLZ]|-?(?:\d+\.?\d*|\.\d+)/gi) || [];

  for (let i = 0; i < tokens.length; ) {
    const command = tokens[i++].toUpperCase();
    if (command === "M" || command === "L") {
      if (i + 1 >= tokens.length) break;
      const x = Number(tokens[i++]);
      const y = Number(tokens[i++]);
      if (command === "M" || !current) {
        current = [];
        subpaths.push(current);
      }
      current.push({ x, y });
    } else if (command === "Z") {
      if (current && current.length > 0) current.push({ ...current[0] });
      current = null;
    }
  }

  return subpaths.filter((subpath) => subpath.length > 1);
};

const buildBorderGraph = (svg) => {
  const nodes = new Map();
  const edges = [];
  const edgeIndex = new Map();
  const edgesByArea = [];

  const nodeFor = (x, y) => {
    const roundedX = Math.round(x * 10) / 10;
    const roundedY = Math.round(y * 10) / 10;
    const key = `${roundedX},${roundedY}`;
    let node = nodes.get(key);
    if (!node) {
      node = { key, x: roundedX, y: roundedY, neighbours: new Set() };
      nodes.set(key, node);
    }
    return node;
  };

  for (const area of svg.querySelectorAll(".sa-map-area")) {
    const path = area.querySelector(".sa-map-region");
    if (!path) {
      edgesByArea.push([]);
      continue;
    }

    const areaEdges = new Set();
    for (const subpath of parsePath(path.getAttribute("d") || "")) {
      for (let i = 0; i < subpath.length - 1; i++) {
        const a = nodeFor(subpath[i].x, subpath[i].y);
        const b = nodeFor(subpath[i + 1].x, subpath[i + 1].y);
        if (a.key === b.key) continue;

        const key =
          a.key < b.key ? `${a.key}|${b.key}` : `${b.key}|${a.key}`;
        let index = edgeIndex.get(key);
        if (index === undefined) {
          index = edges.length;
          edges.push({
            a: a.key,
            b: b.key,
            length: Math.hypot(b.x - a.x, b.y - a.y),
          });
          edgeIndex.set(key, index);
          a.neighbours.add(b.key);
          b.neighbours.add(a.key);
        }
        areaEdges.add(index);
      }
    }
    edgesByArea.push([...areaEdges]);
  }

  return { nodes, edges, edgeIndex, edgesByArea };
};

const startBorderDots = (svg, graph) => {
  const group = svg.querySelector(".sa-map-dots");
  if (!group) return null;

  const random = seededRandom(20261120);
  const dots = [];

  // One dot on every other district: a quarter of the old two-per-district
  // count, spread across the map rather than clustered in one half.
  graph.edgesByArea.forEach((areaEdges, areaIndex) => {
    if (areaIndex % 2 !== 0 || areaEdges.length === 0) return;

    const edge = graph.edges[areaEdges[Math.floor(random() * areaEdges.length)]];
    const forward = random() < 0.5;
    const element = document.createElementNS(SVG_NS, "circle");
    element.setAttribute("class", "sa-map-dot");
    element.setAttribute("r", "1.5");
    group.append(element);

    dots.push({
      edge,
      fromKey: forward ? edge.a : edge.b,
      toKey: forward ? edge.b : edge.a,
      distance: random() * edge.length,
      speed: DOT_SPEED * (0.8 + random() * 0.4),
      element,
    });
  });

  if (dots.length === 0) return null;

  const placeDot = (dot) => {
    const from = graph.nodes.get(dot.fromKey);
    const to = graph.nodes.get(dot.toKey);
    if (!from || !to) return;
    const ratio = dot.edge.length === 0 ? 0 : dot.distance / dot.edge.length;
    dot.element.setAttribute(
      "cx",
      (from.x + (to.x - from.x) * ratio).toFixed(1),
    );
    dot.element.setAttribute(
      "cy",
      (from.y + (to.y - from.y) * ratio).toFixed(1),
    );
  };

  for (const dot of dots) placeDot(dot);

  const moveDot = (dot, delta) => {
    let move = dot.speed * delta;
    let guard = 0;

    while (move > 0 && guard++ < 8) {
      const remaining = dot.edge.length - dot.distance;
      if (move < remaining) {
        dot.distance += move;
        break;
      }
      move -= remaining;

      const node = graph.nodes.get(dot.toKey);
      if (!node) return;

      // Leave the edge we arrived on out of the choices. At a junction this
      // is where a dot changes lane; at a simple corner there is only one
      // way on, and at a dead end it turns back.
      const options = [...node.neighbours].filter(
        (key) => key !== dot.fromKey,
      );
      let nextKey = null;
      if (options.length > 0) {
        nextKey = options[Math.floor(random() * options.length)];
      } else if (node.neighbours.has(dot.fromKey)) {
        nextKey = dot.fromKey;
      }
      if (!nextKey) return;

      const key =
        dot.toKey < nextKey
          ? `${dot.toKey}|${nextKey}`
          : `${nextKey}|${dot.toKey}`;
      const nextIndex = graph.edgeIndex.get(key);
      if (nextIndex === undefined) return;

      dot.fromKey = dot.toKey;
      dot.toKey = nextKey;
      dot.edge = graph.edges[nextIndex];
      dot.distance = 0;
    }

    placeDot(dot);
  };

  let running = false;
  let last = 0;
  let frame = 0;

  const tick = (now) => {
    if (!running) return;
    frame = requestAnimationFrame(tick);
    if (document.hidden) {
      last = 0;
      return;
    }
    if (!last) last = now;
    const delta = Math.min((now - last) / 1000, 0.1);
    last = now;
    for (const dot of dots) moveDot(dot, delta);
  };

  return {
    start() {
      if (running) return;
      running = true;
      last = 0;
      frame = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(frame);
    },
  };
};

const initServiceMap = () => {
  const frame = document.querySelector("[data-service-map]");
  if (!frame) return;

  const tooltip = frame.querySelector(".service-map-tooltip");
  const svg = frame.querySelector(".sa-map-svg");
  if (!tooltip || !svg) return;

  let active = null;
  let activeSource = null;
  let frameRect = null;

  const place = (clientX, clientY) => {
    if (!frameRect) frameRect = frame.getBoundingClientRect();
    const half = tooltip.offsetWidth / 2 + 10;
    let x = clientX - frameRect.left;
    let y = clientY - frameRect.top;
    x = Math.min(Math.max(x, half), frameRect.width - half);
    const below = y < tooltip.offsetHeight + 30;
    tooltip.classList.toggle("is-below", below);
    if (below) y += 12;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  };

  const show = (area, clientX, clientY, source) => {
    active = area;
    activeSource = source;
    frameRect = frame.getBoundingClientRect();
    tooltip.textContent = area.dataset.name;
    tooltip.classList.add("is-visible");
    place(clientX, clientY);
  };

  const hide = () => {
    active = null;
    activeSource = null;
    tooltip.classList.remove("is-visible");
  };

  const placeFromFocus = () => {
    if (!active || activeSource !== "focus") return;
    const box = active.getBoundingClientRect();
    frameRect = frame.getBoundingClientRect();
    place(box.left + box.width / 2, box.top + box.height / 2);
  };

  for (const area of svg.querySelectorAll(".sa-map-area")) {
    const link = area.querySelector("a");
    if (!link) continue;

    const track = (event) => {
      if (event.pointerType === "touch") return;
      if (active !== area) {
        show(area, event.clientX, event.clientY, "pointer");
      } else {
        place(event.clientX, event.clientY);
      }
    };

    link.addEventListener("pointerenter", track);
    link.addEventListener("pointermove", track);
    link.addEventListener("pointerleave", () => {
      if (activeSource === "pointer") hide();
    });
    link.addEventListener("focus", () => {
      const box = area.getBoundingClientRect();
      show(area, box.left + box.width / 2, box.top + box.height / 2, "focus");
    });
    link.addEventListener("blur", () => {
      if (activeSource === "focus") hide();
    });
  }

  // A scrolled page or map moves the districts under the pointer, so put the
  // pointer tooltip away and let the next pointer move bring it back. A
  // keyboard-focused district keeps its tooltip and moves it along.
  window.addEventListener(
    "scroll",
    () => {
      frameRect = null;
      if (activeSource === "pointer") {
        hide();
      } else if (activeSource === "focus") {
        requestAnimationFrame(placeFromFocus);
      }
    },
    { passive: true, capture: true },
  );
  window.addEventListener("resize", () => {
    frameRect = null;
    placeFromFocus();
  });

  if (prefersReducedMotion()) return;

  const graph = buildBorderGraph(svg);
  const animation = startBorderDots(svg, graph);
  if (!animation) return;

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animation.start();
        } else {
          animation.stop();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(svg);
  } else {
    animation.start();
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initServiceMap, { once: true });
} else {
  initServiceMap();
}
