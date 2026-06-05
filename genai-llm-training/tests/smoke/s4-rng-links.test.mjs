// s4-rng-links.test.mjs — #123 (losowa kolejność pozycji w classify, RNG wstrzykiwalny) + #121 (klikalne źródła
// w treści jako <a href>). DOM-stub, strukturalnie (ADR-0002). Determinizm testów: RNG wstrzykiwany (constantRng),
// więc asercjonujemy DOKŁADNĄ permutację bez zgadywania (wzorzec _rng.mjs / RND-1 #66).
import "./_dom-stub.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { queryAll } from "./_dom-stub.mjs";
import "./_fixtures.mjs"; // efekt uboczny: rejestruje katalogi i18n (pl/en) → t() działa
import { constantRng } from "./_rng.mjs";
import { renderClassify } from "../../assets/ui/interactions/classify-view.js";
import { renderInteraction } from "../../assets/ui/interactions/index.js";
import { renderScreens } from "../../assets/ui/module-view.js";

const CLASSIFY = {
  kind: "classify", id: "t",
  categories: [{ id: "a", label: "A" }, { id: "b", label: "B" }],
  items: [
    { id: "i1", text: "p1", correctCategory: "a" },
    { id: "i2", text: "p2", correctCategory: "b" },
    { id: "i3", text: "p3", correctCategory: "a" },
    { id: "i4", text: "p4", correctCategory: "b" },
    { id: "i5", text: "p5", correctCategory: "a" },
    { id: "i6", text: "p6", correctCategory: "b" },
  ],
};

// Odzyskaj kolejność pozycji z DOM: id inputu = `cls-t-<itemId>-<catId>` → unikalne itemId w kolejności renderu.
function itemOrder(node) {
  const seen = [];
  for (const inp of queryAll(node, (e) => e.tagName === "INPUT")) {
    const m = String(inp.id || "").match(/^cls-t-(i\d+)-/);
    if (m && !seen.includes(m[1])) seen.push(m[1]);
  }
  return seen;
}

test("#123 classify: kolejność pozycji jest tasowana wstrzykiwanym RNG (nie jest kolejnością danych)", () => {
  const order = itemOrder(renderClassify(CLASSIFY, { rng: constantRng(0) }).node);
  const dataOrder = CLASSIFY.items.map((it) => it.id);
  assert.equal(order.length, 6, "wszystkie pozycje wyrenderowane");
  assert.deepEqual([...order].sort(), [...dataOrder].sort(), "ten sam ZBIÓR pozycji (nic nie zginęło)");
  assert.notDeepEqual(order, dataOrder, "kolejność wyświetlania ≠ kolejność danych (anti-gaming wzoru A-B-A-B)");
});

test("#123 classify: ten sam seed → ta sama permutacja (RNG wstrzykiwalny, determinizm testów)", () => {
  const a = itemOrder(renderClassify(CLASSIFY, { rng: constantRng(0) }).node);
  const b = itemOrder(renderClassify(CLASSIFY, { rng: constantRng(0) }).node);
  assert.deepEqual(a, b, "deterministyczne dla ustalonego RNG");
});

test("#123 classify: scoring niezależny od tasowania — getResponse mapuje po itemId", () => {
  const view = renderClassify(CLASSIFY, { rng: constantRng(0) });
  // zaznacz poprawną kategorię dla każdego itemu po jego id (niezależnie od pozycji w DOM)
  for (const inp of queryAll(view.node, (e) => e.tagName === "INPUT")) {
    const m = String(inp.id || "").match(/^cls-t-(i\d+)-(\w+)$/);
    if (!m) continue;
    const it = CLASSIFY.items.find((x) => x.id === m[1]);
    if (it && it.correctCategory === m[2]) inp.checked = true;
  }
  const resp = view.getResponse();
  assert.deepEqual(resp, { i1: "a", i2: "b", i3: "a", i4: "b", i5: "a", i6: "b" }, "odpowiedź po itemId niezależna od kolejności renderu");
});

test("#123 classify przez renderInteraction: opts.rng przekazywane do renderera", () => {
  const order = itemOrder(renderInteraction(CLASSIFY, { rng: constantRng(0) }).node);
  assert.equal(order.length, 6, "renderInteraction(config, {rng}) tasuje pozycje jak renderClassify");
});

test("#121 treść: blok z polem links renderuje klikalne <a href> (źródło zewnętrzne)", () => {
  const screens = [{
    id: "s", title: "Źródła", type: "content", blocks: [
      { kind: "callout", variant: "info", title: "Skąd model", text: "Atrybucja modelu.", links: [
        { label: "Skala Holaka (quality-blog.eu)", href: "https://quality-blog.eu/pl/blog/skala-holaka" },
      ] },
      { kind: "paragraph", text: "Akapit ze źródłem.", links: [
        { label: "Wymiar osobisty (quality-blog.eu)", href: "https://quality-blog.eu/pl/blog/skala-holaka-private" },
      ] },
    ],
  }];
  const wrap = globalThis.document.createElement("div");
  for (const sec of renderScreens(screens, "S4")) wrap.appendChild(sec);
  const anchors = queryAll(wrap, (e) => e.tagName === "A");
  assert.equal(anchors.length, 2, "każdy blok z links daje jeden klikalny <a>");
  const hrefs = anchors.map((a) => a.getAttribute("href"));
  assert.ok(hrefs.includes("https://quality-blog.eu/pl/blog/skala-holaka"), "href calloutu obecny i absolutny https");
  assert.ok(hrefs.includes("https://quality-blog.eu/pl/blog/skala-holaka-private"), "href akapitu obecny i absolutny https");
  for (const a of anchors) {
    assert.ok((a.textContent || "").length > 0, "link ma opisowy tekst (WCAG 2.4.4, nie „kliknij tu”)");
    assert.equal(a.getAttribute("rel"), "noopener noreferrer", "link zewnętrzny ma rel bezpieczeństwa");
  }
});
