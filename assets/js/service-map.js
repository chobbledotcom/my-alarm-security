/*
 * Service area map.
 *
 * The districts are plain SVG links, so they work without this script. Here we
 * add the name tooltip that follows the pointer (or the district's centre on
 * keyboard focus), and pause the travelling border dots while the map is off
 * screen.
 */

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

  // The dots are SMIL animations, which keep running even when the map is
  // below the fold. Pause them until the map is close to the viewport.
  if (
    "IntersectionObserver" in window &&
    typeof svg.pauseAnimations === "function"
  ) {
    let paused = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && paused) {
          svg.unpauseAnimations();
          paused = false;
        } else if (!entry.isIntersecting && !paused) {
          svg.pauseAnimations();
          paused = true;
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(svg);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initServiceMap, { once: true });
} else {
  initServiceMap();
}
