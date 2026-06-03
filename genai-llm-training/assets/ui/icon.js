// icon.js — spójny zestaw ikon inline SVG (issue #75, UX-6). Zastępuje emoji (różny wygląd na platformach)
// jednolitym, dekoracyjnym zestawem. Zero zależności, zero CDN (ADR-0002).
//
// KONTRAKT A11Y/BEZPIECZEŃSTWO (krytyczny):
//   - zwraca ELEMENT <svg> (createElementNS), NIGDY stringa — brak innerHTML (kontrakt dom.js).
//   - SVG zawsze aria-hidden="true" + focusable="false" (dekoracyjny) — informacji NIGDY nie niesie
//     sama ikona: obok zawsze zostaje tekst (status/słowo/tytuł). Kolor przez currentColor (klasy stanu).
import { el } from "./dom.js";

const SVG_NS = "http://www.w3.org/2000/svg";

// Każda ikona = lista prymitywów {tag, attrs} na siatce 16x16. Stroki używają currentColor.
const STROKE = { fill: "none", stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round", "stroke-linejoin": "round" };
const ICONS = {
  check: [{ tag: "path", attrs: { ...STROKE, "stroke-width": "2", d: "M3.5 8.5l3 3 6-7" } }],
  cross: [{ tag: "path", attrs: { ...STROKE, "stroke-width": "2", d: "M4.5 4.5l7 7M11.5 4.5l-7 7" } }],
  dot: [{ tag: "circle", attrs: { cx: "8", cy: "8", r: "3.6", fill: "currentColor" } }],
  circle: [{ tag: "circle", attrs: { ...STROKE, cx: "8", cy: "8", r: "5.5" } }],
  lock: [
    { tag: "rect", attrs: { x: "3.5", y: "7", width: "9", height: "6.5", rx: "1.2", fill: "currentColor" } },
    { tag: "path", attrs: { ...STROKE, d: "M5.5 7V5.4a2.5 2.5 0 0 1 5 0V7" } },
  ],
  play: [{ tag: "path", attrs: { d: "M5 3.5 12.5 8 5 12.5Z", fill: "currentColor" } }],
  warn: [
    { tag: "path", attrs: { ...STROKE, d: "M8 2.6 14.4 13H1.6Z" } },
    { tag: "path", attrs: { ...STROKE, d: "M8 6.4v3" } },
    { tag: "circle", attrs: { cx: "8", cy: "11.3", r: "0.85", fill: "currentColor" } },
  ],
  info: [
    { tag: "circle", attrs: { ...STROKE, cx: "8", cy: "8", r: "6" } },
    { tag: "path", attrs: { ...STROKE, d: "M8 7.4v3.6" } },
    { tag: "circle", attrs: { cx: "8", cy: "5", r: "0.85", fill: "currentColor" } },
  ],
  diamond: [{ tag: "path", attrs: { d: "M8 1.5 14.5 8 8 14.5 1.5 8Z", fill: "currentColor" } }],
};

export const ICON_NAMES = Object.keys(ICONS);

/**
 * Tworzy dekoracyjną ikonę SVG.
 * @param {string} name nazwa z ICON_NAMES (check/dot/circle/lock/play/warn/info/cross/diamond)
 * @param {object} [opts] { size?: string (np. "1.1em"), class?: string }
 * @returns {SVGElement} element <svg> (aria-hidden, focusable=false, currentColor)
 */
export function icon(name, opts = {}) {
  const def = ICONS[name];
  if (!def) throw new Error(`icon: nieznana nazwa "${name}" (dozwolone: ${ICON_NAMES.join(", ")})`);
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("width", opts.size || "1em");
  svg.setAttribute("height", opts.size || "1em");
  svg.setAttribute("fill", "none");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("class", `icon icon--${name}${opts.class ? ` ${opts.class}` : ""}`);
  for (const { tag, attrs } of def) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    svg.appendChild(node);
  }
  return svg;
}

/** Pomocniczo: <span aria-hidden> opakowujący ikonę (gdy potrzebny element-nośnik klasy stanu). */
export function iconSpan(name, spanClass, opts = {}) {
  return el("span", { class: spanClass, attrs: { "aria-hidden": "true" } }, [icon(name, opts)]);
}
