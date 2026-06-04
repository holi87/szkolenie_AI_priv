// module-hub.test.mjs — dedykowany ekran wyboru modułów (issue #88). DOM-stub, strukturalnie (ADR-0002):
// siatka kart (jedna na moduł + test końcowy), status ikona+tekst (WCAG 1.4.1), CTA jako <button> z etykietą
// zależną od statusu, callbacki wyboru, stany testu (zablokowany bez akcji / dostępny → callback).
import "./_dom-stub.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { serializeTree, countByTag } from "./_snapshot.mjs";
import { queryAll } from "./_dom-stub.mjs";
import "./_fixtures.mjs"; // efekt uboczny: rejestruje katalogi i18n (pl/en) → t() działa
import { renderModuleHub } from "../../assets/ui/module-hub.js";

const MODULES = [
  { id: "M1", name: "Fundamenty GenAI i LLM", status: "available", required: true, pillar: "Podstawy", time: 60, quizPct: null },
  { id: "M2", name: "Architektura LLM", status: "in_progress", required: true, pillar: "Podstawy", time: 45, quizPct: null },
  { id: "M4", name: "Embeddings i podobieństwo", status: "completed", required: false, pillar: "Wektory", time: 30, quizPct: 88 },
];
const buttons = (n) => queryAll(n, (e) => e.tagName === "BUTTON");
const fire = (e, type) => (e._listeners[type] || []).forEach((fn) => fn({ preventDefault() {} }));
function build(finalTest, hooks = {}) {
  return renderModuleHub({
    pathId: "S2", pathName: "Praktyk-użytkownik / QA", nextStep: "Następny krok: rozpocznij moduł M1.",
    modules: MODULES,
    finalTest: finalTest || { status: "available", blockers: [], missingPractical: [], passed: false },
    onSelectModule: hooks.onSelectModule || (() => {}),
    onSelectFinalTest: hooks.onSelectFinalTest || (() => {}),
  });
}

test("siatka: jedna karta na moduł + karta testu końcowego (pełnowymiarowy hub)", () => {
  const node = build();
  assert.equal(countByTag(node).ARTICLE, MODULES.length + 1, "kart = moduły + test końcowy");
  const snap = serializeTree(node);
  assert.match(snap, /class="[^"]*hub-grid/, "brak siatki hubu");
  assert.match(snap, /class="[^"]*hub-card--final/, "brak karty testu końcowego");
  assert.match(snap, /class="[^"]*hub-view/, "hub musi zdejmować limit szerokości treści (.view__content 70ch)");
});

test("ścieżka FORMATYWNA (M15, finalTest=null): hub BEZ karty testu końcowego", () => {
  const node = renderModuleHub({
    pathId: "S4", pathName: "Skala Holaka — diagnoza i rozwój", nextStep: "Zacznij od autodiagnozy.",
    modules: MODULES, finalTest: null, onSelectModule: () => {}, onSelectFinalTest: () => {},
  });
  assert.equal(countByTag(node).ARTICLE, MODULES.length, "tylko karty modułów — brak karty testu (formatywna)");
  assert.doesNotMatch(serializeTree(node), /hub-card--final/, "karta testu nie może istnieć w ścieżce formatywnej");
});

test("status: ZAWSZE ikona + tekst (WCAG 1.4.1) — nie sam kolor", () => {
  const node = build();
  assert.match(serializeTree(node), /hub-card__status-icon/, "brak ikony statusu");
  const txt = node.textContent || "";
  assert.match(txt, /Dostępny/, "status available jako tekst");
  assert.match(txt, /W toku/, "status in_progress jako tekst");
  assert.match(txt, /Ukończony/, "status completed jako tekst");
});

test("CTA każdej karty = <button>, etykieta zależna od statusu", () => {
  const node = build();
  assert.equal(buttons(node).length, MODULES.length + 1, "CTA na każdy moduł + test końcowy");
  const txt = node.textContent || "";
  assert.match(txt, /Rozpocznij/, "available → Rozpocznij");
  assert.match(txt, /Kontynuuj/, "in_progress → Kontynuuj");
  assert.match(txt, /Przejrzyj ponownie/, "completed → Przejrzyj ponownie");
});

test("klik CTA modułu → onSelectModule(id) (pierwsza karta = M1)", () => {
  let picked = null;
  const node = build(null, { onSelectModule: (id) => { picked = id; } });
  fire(buttons(node)[0], "click");
  assert.equal(picked, "M1");
});

test("karta completed pokazuje wynik quizu", () => {
  assert.match(build().textContent || "", /88%/, "wynik quizu na karcie completed");
});

test("test końcowy ZABLOKOWANY: akcja nieaktywna + powód, brak wywołania callbacku", () => {
  let called = false;
  const node = build({ status: "locked", blockers: ["M1", "M2"], missingPractical: [], passed: false }, { onSelectFinalTest: () => { called = true; } });
  assert.match(serializeTree(node, { attrs: ["class", "aria-disabled"] }), /aria-disabled="true"/, "zablokowany test → przycisk nieaktywny");
  const b = buttons(node);
  fire(b[b.length - 1], "click");
  assert.equal(called, false, "zablokowany test nie woła onSelectFinalTest");
});

test("test końcowy DOSTĘPNY: CTA → onSelectFinalTest", () => {
  let called = false;
  const node = build({ status: "available", blockers: [], missingPractical: [], passed: false }, { onSelectFinalTest: () => { called = true; } });
  const b = buttons(node);
  fire(b[b.length - 1], "click");
  assert.equal(called, true, "dostępny test → onSelectFinalTest");
});
