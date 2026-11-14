/*
 * MyAlarm Security - "signal network" visual effect.
 *
 * Draws a slowly drifting network of connected points (echoing the hexagon
 * network in the brand artwork) with small red "signal" pulses travelling
 * along the links. It runs on any element with a data-network attribute:
 *
 *   data-network="light"  - pale blue network for the white page background
 *   data-network="dark"   - glowing network for dark panels
 *
 * This is decoration only, so it degrades to the plain CSS backgrounds:
 *  - three.js is only fetched (from our own /assets folder) on larger
 *    screens, when the visitor hasn't asked for reduced motion or data
 *    saving, and when the browser has WebGL
 *  - if anything fails (no WebGL, script blocked, context lost) the canvas
 *    is removed and the static CSS background underneath stays as it was
 *  - drawing pauses when the tab is hidden or the panel is off screen
 */

const THREE_URL = new URL("./lib/three/three.module.min.js", import.meta.url)
  .href;

const VARIANTS = {
  light: {
    line: 0x9fc0ea,
    lineOpacity: 0.6,
    node: 0x8fb4e6,
    nodeOpacity: 0.85,
    nodeSize: 0.34,
    pulse: 0xcd1314,
    pulseSize: 0.5,
    pulses: 9,
    additive: false,
  },
  dark: {
    line: 0xffffff,
    lineOpacity: 0.16,
    node: 0xff4a4b,
    nodeOpacity: 0.9,
    nodeSize: 0.42,
    pulse: 0xffffff,
    pulseSize: 0.75,
    pulses: 14,
    additive: true,
  },
};

const CAMERA_Z = 30;
const FOV = 50;
const SPACING = 4.4;
const LINK_DISTANCE = 5.9;
const MIN_FRAME_MS = 28;

const mediaMatches = (query) =>
  typeof window.matchMedia === "function" && window.matchMedia(query).matches;

const shouldRun = () => {
  if (mediaMatches("(prefers-reduced-motion: reduce)")) return false;
  if (!mediaMatches("(min-width: 769px)")) return false;
  const connection = navigator.connection;
  if (connection && connection.saveData) return false;
  if (navigator.deviceMemory && navigator.deviceMemory < 4) return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
};

// Small deterministic random generator so the layout is the same every visit
const seededRandom = (seed) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

const makeDotTexture = (THREE) => {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.45, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.6, "rgba(255,255,255,0.35)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
};

const buildNetwork = (halfWidth, halfHeight) => {
  const random = seededRandom(20180326);
  const nodes = [];
  const rowHeight = SPACING * 0.866;
  const rows = Math.ceil((halfHeight * 2) / rowHeight) + 2;
  const cols = Math.ceil((halfWidth * 2) / SPACING) + 2;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Leave gaps so it reads as a network rather than a full grid
      if (random() < 0.3) continue;
      nodes.push({
        x:
          -halfWidth +
          (col + (row % 2) * 0.5) * SPACING +
          (random() - 0.5) * 1.5 -
          SPACING,
        y: -halfHeight + row * rowHeight + (random() - 0.5) * 1.5 - rowHeight,
        z: (random() - 0.5) * 9,
        phase: random() * Math.PI * 2,
        speed: 0.25 + random() * 0.35,
        links: [],
      });
    }
  }
  const edges = [];
  for (let a = 0; a < nodes.length; a++) {
    for (let b = a + 1; b < nodes.length; b++) {
      const dx = nodes[a].x - nodes[b].x;
      const dy = nodes[a].y - nodes[b].y;
      if (dx * dx + dy * dy > LINK_DISTANCE * LINK_DISTANCE) continue;
      if (nodes[a].links.length > 3 || nodes[b].links.length > 3) continue;
      nodes[a].links.push(b);
      nodes[b].links.push(a);
      edges.push([a, b]);
    }
  }
  return { nodes, edges };
};

const createScene = (THREE, host, dotTexture) => {
  const variant = VARIANTS[host.dataset.network] || VARIANTS.light;
  const fixed = host.dataset.networkFixed !== undefined;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = "fx-canvas";
  canvas.setAttribute("aria-hidden", "true");
  host.prepend(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 100);
  camera.position.z = CAMERA_Z;
  const group = new THREE.Group();
  scene.add(group);

  const blending = variant.additive
    ? THREE.AdditiveBlending
    : THREE.NormalBlending;
  const lineMaterial = new THREE.LineBasicMaterial({
    color: variant.line,
    transparent: true,
    opacity: variant.lineOpacity,
    depthTest: false,
  });
  const pointMaterial = (color, size, opacity) =>
    new THREE.PointsMaterial({
      color,
      size,
      map: dotTexture,
      transparent: true,
      opacity,
      depthTest: false,
      depthWrite: false,
      sizeAttenuation: true,
      blending,
    });
  const nodeMaterial = pointMaterial(
    variant.node,
    variant.nodeSize,
    variant.nodeOpacity,
  );
  const pulseMaterial = pointMaterial(variant.pulse, variant.pulseSize, 1);

  const state = {
    host,
    canvas,
    renderer,
    visible: true,
    network: null,
    builtHalfWidth: 0,
    builtHalfHeight: 0,
    pointerX: 0,
    pointerY: 0,
    objects: [],
  };

  const rebuild = (halfWidth, halfHeight) => {
    for (const object of state.objects) {
      group.remove(object);
      object.geometry.dispose();
    }
    const network = buildNetwork(halfWidth, halfHeight);
    const nodePositions = new Float32Array(network.nodes.length * 3);
    const linePositions = new Float32Array(network.edges.length * 6);
    const pulsePositions = new Float32Array(variant.pulses * 3);

    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(nodePositions, 3),
    );
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositions, 3),
    );
    const pulseGeometry = new THREE.BufferGeometry();
    pulseGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(pulsePositions, 3),
    );

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    const points = new THREE.Points(nodeGeometry, nodeMaterial);
    const pulses = new THREE.Points(pulseGeometry, pulseMaterial);
    for (const object of [lines, points, pulses]) {
      object.frustumCulled = false;
      group.add(object);
    }
    state.objects = [lines, points, pulses];

    const random = seededRandom(4065);
    network.pulses = Array.from({ length: variant.pulses }, () => {
      const from = Math.floor(random() * network.nodes.length);
      return {
        from,
        to: network.nodes[from].links[0] ?? from,
        progress: random(),
        speed: 0.25 + random() * 0.3,
      };
    });
    network.nodePositions = nodePositions;
    network.linePositions = linePositions;
    network.pulsePositions = pulsePositions;
    state.network = network;
    state.builtHalfWidth = halfWidth;
    state.builtHalfHeight = halfHeight;
  };

  state.resize = () => {
    const width = host.clientWidth;
    const height = fixed ? window.innerHeight : host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // Size of the visible area at the back of the network, plus a margin
    const depth = CAMERA_Z + 5;
    const halfHeight =
      Math.tan((FOV * Math.PI) / 360) * depth * 1.15 + (fixed ? 6 : 1);
    const halfWidth = halfHeight * camera.aspect + 2;
    if (halfWidth > state.builtHalfWidth || halfHeight > state.builtHalfHeight) {
      rebuild(halfWidth * 1.2, halfHeight);
    }
  };

  const nextPulseTarget = (pulse, time) => {
    const links = state.network.nodes[pulse.to].links;
    const previous = pulse.from;
    pulse.from = pulse.to;
    if (links.length === 0) return;
    const pick = Math.floor(Math.abs(Math.sin(time * 12.9898 + pulse.to)) * 997);
    const candidate = links[pick % links.length];
    pulse.to =
      candidate === previous && links.length > 1
        ? links[(pick + 1) % links.length]
        : candidate;
  };

  state.render = (time, delta) => {
    const { nodes, edges, pulses, nodePositions, linePositions, pulsePositions } =
      state.network;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const wave = time * node.speed + node.phase;
      nodePositions[i * 3] = node.x + Math.cos(wave * 0.8) * 0.35;
      nodePositions[i * 3 + 1] = node.y + Math.sin(wave) * 0.45;
      nodePositions[i * 3 + 2] = node.z + Math.sin(wave * 0.6) * 0.8;
    }
    for (let i = 0; i < edges.length; i++) {
      const a = edges[i][0] * 3;
      const b = edges[i][1] * 3;
      linePositions[i * 6] = nodePositions[a];
      linePositions[i * 6 + 1] = nodePositions[a + 1];
      linePositions[i * 6 + 2] = nodePositions[a + 2];
      linePositions[i * 6 + 3] = nodePositions[b];
      linePositions[i * 6 + 4] = nodePositions[b + 1];
      linePositions[i * 6 + 5] = nodePositions[b + 2];
    }
    for (let i = 0; i < pulses.length; i++) {
      const pulse = pulses[i];
      pulse.progress += pulse.speed * delta;
      if (pulse.progress >= 1) {
        pulse.progress = 0;
        nextPulseTarget(pulse, time + i);
      }
      const a = pulse.from * 3;
      const b = pulse.to * 3;
      for (let axis = 0; axis < 3; axis++) {
        pulsePositions[i * 3 + axis] =
          nodePositions[a + axis] +
          (nodePositions[b + axis] - nodePositions[a + axis]) * pulse.progress;
      }
    }
    for (const object of state.objects) {
      object.geometry.attributes.position.needsUpdate = true;
    }

    // Gentle parallax from the pointer, and from scrolling on the page
    // background so the network drifts past more slowly than the content
    camera.position.x += (state.pointerX * 1.6 - camera.position.x) * 0.04;
    camera.position.y += (-state.pointerY * 1.1 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    if (fixed) {
      group.position.y = Math.min(window.scrollY * 0.004, 5);
    }
    group.rotation.z = Math.sin(time * 0.05) * 0.02;

    renderer.render(scene, camera);
  };

  state.destroy = () => {
    state.visible = false;
    canvas.remove();
    renderer.dispose();
    host.classList.remove("fx-ready");
  };

  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    state.destroy();
  });

  state.resize();
  return state;
};

const start = async () => {
  const hosts = [...document.querySelectorAll("[data-network]")];
  if (hosts.length === 0 || !shouldRun()) return;

  const THREE = await import(THREE_URL);
  const dotTexture = makeDotTexture(THREE);
  const scenes = [];
  for (const host of hosts) {
    try {
      scenes.push(createScene(THREE, host, dotTexture));
    } catch {
      // WebGL refused for this element - the CSS background remains
    }
  }
  if (scenes.length === 0) return;

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const scene = scenes.find((item) => item.host === entry.target);
        if (scene) scene.visible = entry.isIntersecting;
      }
    });
    for (const scene of scenes) observer.observe(scene.host);
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      for (const scene of scenes) {
        scene.pointerX = x;
        scene.pointerY = y;
      }
    },
    { passive: true },
  );

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      for (const scene of scenes) scene.resize();
    }, 150);
  });

  let last = 0;
  const frame = (now) => {
    requestAnimationFrame(frame);
    if (document.hidden || now - last < MIN_FRAME_MS) return;
    const delta = Math.min((now - last) / 1000, 0.1);
    last = now;
    for (const scene of scenes) {
      if (!scene.visible || !scene.canvas.isConnected) continue;
      scene.render(now / 1000, delta);
      scene.host.classList.add("fx-ready");
    }
  };
  requestAnimationFrame(frame);
};

const whenIdle = (callback) =>
  "requestIdleCallback" in window
    ? window.requestIdleCallback(callback, { timeout: 2500 })
    : window.setTimeout(callback, 600);

const boot = () =>
  whenIdle(() => {
    start().catch(() => {
      // three.js failed to load - leave the static backgrounds in place
    });
  });

if (document.readyState === "complete") {
  boot();
} else {
  window.addEventListener("load", boot, { once: true });
}
