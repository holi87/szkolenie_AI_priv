// dom.js — minimalne, bezpieczne helpery DOM (issue #14).
// Budujemy węzły programowo (textContent, nie innerHTML) — brak ryzyka wstrzyknięcia treści.

/**
 * Tworzy element. props: atrybuty/własności (class, attrs:{}, on:{event:fn}, text, html-zabronione).
 * children: węzeł | string | tablica.
 */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k === "attrs") for (const [a, av] of Object.entries(v)) { if (av != null) node.setAttribute(a, av); }
    else if (k === "on") for (const [ev, fn] of Object.entries(v)) node.addEventListener(ev, fn);
    else if (k === "dataset") for (const [d, dv] of Object.entries(v)) node.dataset[d] = dv;
    else node[k] = v;
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

/** Usuwa dzieci węzła. */
export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

/** Podmienia zawartość węzła na nowe dzieci. */
export function mount(node, ...children) {
  clear(node);
  for (const c of children.flat()) if (c != null) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  return node;
}
