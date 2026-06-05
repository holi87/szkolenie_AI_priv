// _dom-stub.mjs — minimalny, ZERO-zależnościowy stub DOM do smoke-renderu w Node (issue #25).
// NIE jest plikiem testowym. Pozwala uruchomić realne rendery ui/* (dom.js `el`/`mount`) pod `node --test`
// bez jsdom i bez package.json/npm — zgodnie z ADR-0002 (statyczny hosting, brak buildu, pure Node).
// Stubujemy DOKŁADNIE to, czego dotyka dom.js oraz rendery ui/* (createElement/createTextNode,
// className/textContent/style/dataset, setAttribute, appendChild/removeChild/firstChild, replaceChildren,
// addEventListener, focus). Render ma się WYKONAĆ bez wyjątku — to jest "smoke render" z issue #25.

class TextNode {
  constructor(text) {
    this.nodeType = 3;
    this.textContent = text == null ? "" : String(text);
    this.parentNode = null;
  }
}

class El {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.nodeType = 1;
    this.childNodes = [];
    this._attrs = {};
    this.dataset = {};
    this.style = {};
    this._listeners = {};
    this.parentNode = null;
    this._text = null;
    this._className = "";
  }

  get children() {
    return this.childNodes.filter((n) => n.nodeType === 1);
  }
  get firstChild() {
    return this.childNodes[0] || null;
  }

  set className(v) {
    this._className = v == null ? "" : String(v);
    this._attrs.class = this._className;
  }
  get className() {
    return this._className;
  }

  set textContent(v) {
    this._text = v == null ? "" : String(v);
    this.childNodes = [];
  }
  get textContent() {
    if (this._text != null) return this._text;
    return this.childNodes.map((c) => c.textContent || "").join("");
  }

  setAttribute(k, v) {
    this._attrs[k] = v == null ? "" : String(v);
  }
  getAttribute(k) {
    return k in this._attrs ? this._attrs[k] : null;
  }
  removeAttribute(k) {
    delete this._attrs[k];
  }
  hasAttribute(k) {
    return k in this._attrs;
  }

  appendChild(c) {
    if (c == null) return c;
    c.parentNode = this;
    this.childNodes.push(c);
    this._text = null; // dzieci unieważniają prosty textContent
    return c;
  }
  removeChild(c) {
    const i = this.childNodes.indexOf(c);
    if (i >= 0) this.childNodes.splice(i, 1);
    return c;
  }
  replaceChildren(...nodes) {
    this.childNodes = [];
    this._text = null;
    for (const n of nodes) {
      if (n == null) continue;
      n.parentNode = this;
      this.childNodes.push(n);
    }
  }
  remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }

  addEventListener(type, fn) {
    (this._listeners[type] || (this._listeners[type] = [])).push(fn);
  }
  removeEventListener() {}
  dispatchEvent() {
    return true;
  }
  focus() {}
  click() {}
  querySelector() {
    return null;
  }
  querySelectorAll() {
    return [];
  }
}

export function makeDocument() {
  const doc = {
    createElement: (tag) => new El(tag),
    // createElementNS: rendery SVG (medal certyfikatu #74, ikony #75) muszą używać NS w przeglądarce.
    // Stub ignoruje namespace — zwraca El o tym samym tagu (tagName w UPPERCASE jak createElement).
    createElementNS: (_ns, tag) => new El(tag),
    createTextNode: (t) => new TextNode(t),
    getElementById: () => new El("div"),
    querySelector: () => new El("div"),
    querySelectorAll: () => [],
  };
  doc.body = new El("body");
  doc.documentElement = new El("html"); // <html> — cel atrybutu lang (i18n a11y WCAG 3.1.2; #133 regression-guard)
  return doc;
}

/** Instaluje stub jako globalny `document` (idempotentnie). Zwraca dokument. */
export function installDomStub() {
  if (!globalThis.document || !globalThis.document.__stub) {
    const doc = makeDocument();
    doc.__stub = true;
    globalThis.document = doc;
  }
  return globalThis.document;
}

/** Rekurencyjny obchód drzewa: zwraca wszystkie ELEMENTY spełniające predykat (do asercji a11y). */
export function queryAll(node, predicate) {
  const out = [];
  const walk = (n) => {
    if (!n || n.nodeType !== 1) return;
    if (predicate(n)) out.push(n);
    for (const c of n.childNodes) walk(c);
  };
  walk(node);
  return out;
}

// Instalacja przy imporcie — UI nie dotyka `document` w czasie ewaluacji modułu, więc kolejność importów
// jest bezpieczna, ale instalujemy od razu, by render wywołany zaraz po imporcie miał globalny document.
installDomStub();
