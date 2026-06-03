// _snapshot.mjs — STRUKTURALNY snapshot drzewa DOM-stub (issue #70, QA-2). NIE jest plikiem testowym.
// Działa na istniejącym _dom-stub.mjs (childNodes/_attrs/getAttribute) BEZ jego modyfikacji.
//
// Snapshot jest STRUKTURALNY (tag + wybrane atrybuty + zagnieżdżenie), NIE wizualny — zero screenshot,
// zero przeglądarki (ADR-0002). Nadaje się do asercji „struktura/role/etykiety nie zniknęły po restylizacji
// UX" (UX-2..UX-6), ale NIE zastępuje ręcznej weryfikacji wyglądu na desktop + 360 px.

// Domyślnie atrybuty istotne dla a11y/struktury. dom.js część z nich ustawia jako WŁAŚCIWOŚCI
// (id/name/type/value), nie przez setAttribute — dlatego czytamy property jako fallback (getVal).
const DEFAULT_ATTRS = ["class", "role", "for", "scope", "type", "aria-label", "aria-hidden", "name", "id"];

function getVal(node, attr) {
  const viaAttr = node.getAttribute ? node.getAttribute(attr) : null;
  if (viaAttr != null && viaAttr !== "") return viaAttr;
  const prop = node[attr];
  if (prop != null && prop !== "" && typeof prop !== "object" && typeof prop !== "function") return String(prop);
  return null;
}

/**
 * Serializuje drzewo do STABILNEGO stringu (deterministyczny: dwa wywołania == ten sam wynik).
 * @param {object} node węzeł _dom-stub (El) lub TextNode
 * @param {object} [opts] { attrs?: string[] (które atrybuty zrzucać), text?: boolean (czy zrzucać #text) }
 * @returns {string}
 */
export function serializeTree(node, opts = {}) {
  const attrs = opts.attrs || DEFAULT_ATTRS;
  const lines = [];
  const walk = (n, depth) => {
    if (!n) return;
    const pad = "  ".repeat(depth);
    if (n.nodeType === 3) {
      if (opts.text) {
        const t = (n.textContent || "").trim();
        if (t) lines.push(`${pad}#text ${JSON.stringify(t)}`);
      }
      return;
    }
    if (n.nodeType !== 1) return;
    const pairs = attrs
      .map((a) => [a, getVal(n, a)])
      .filter(([, v]) => v != null)
      .map(([a, v]) => `${a}=${JSON.stringify(String(v))}`);
    lines.push(`${pad}${n.tagName}${pairs.length ? `[${pairs.join(" ")}]` : ""}`);
    for (const c of n.childNodes || []) walk(c, depth + 1);
  };
  walk(node, 0);
  return lines.join("\n");
}

/** Liczy elementy wg tagName w poddrzewie (z węzłem-korzeniem włącznie). @returns {Record<string,number>} */
export function countByTag(node) {
  const counts = {};
  const walk = (n) => {
    if (!n || n.nodeType !== 1) return;
    counts[n.tagName] = (counts[n.tagName] || 0) + 1;
    for (const c of n.childNodes || []) walk(c);
  };
  walk(node);
  return counts;
}
