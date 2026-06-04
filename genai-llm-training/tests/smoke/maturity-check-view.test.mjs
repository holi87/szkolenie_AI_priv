// maturity-check-view.test.mjs — render autodiagnozy Skali Holaka (M14/#105). DOM-stub, strukturalnie (ADR-0002):
// dwie skale jako grupy checkboxów (klawiatura: fieldset/legend + label/for), feedback ZAWSZE NEUTRALNY
// (klasa 'feedback' bez --correct/--incorrect, brak słowa „zaliczone"), poziom + banda po sprawdzeniu.
// Domyka lukę pokrycia: interactions.test.mjs pokrywa evaluator (logika), tu pokrywamy WIDOK (render + neutralność).
import "./_dom-stub.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { serializeTree } from "./_snapshot.mjs";
import { queryAll } from "./_dom-stub.mjs";
import "./_fixtures.mjs"; // efekt uboczny: rejestruje katalogi i18n (pl/en) → t() działa
import { renderMaturityCheck } from "../../assets/ui/interactions/maturity-check-view.js";
import { evaluateMaturityCheck } from "../../assets/core/interactions/maturity-check.js";

const CFG = { kind: "maturity-check", id: "t", intro: "Intro diagnozy", scales: [
  { id: "org", label: "Organizacja", intro: "io", max: 3,
    statements: [{ id: "o1", text: "zd org 1" }, { id: "o2", text: "zd org 2" }, { id: "o3", text: "zd org 3" }],
    bands: [{ min: 0, max: 1, label: "niski", advice: "rada A" }, { min: 2, max: 3, label: "wysoki", advice: "rada B" }] },
  { id: "person", label: "Osoba", max: 2,
    statements: [{ id: "p1", text: "zd os 1" }, { id: "p2", text: "zd os 2" }],
    bands: [{ min: 0, max: 2, label: "ok", advice: "rada C" }] },
] };

test("maturity-check view: 2 skale jako fieldset/legend + checkboxy z label/for (klawiatura, WCAG)", () => {
  const v = renderMaturityCheck(CFG);
  const snap = serializeTree(v.node);
  const fieldsets = queryAll(v.node, (e) => e.tagName === "FIELDSET");
  const checkboxes = queryAll(v.node, (e) => e.tagName === "INPUT");
  const labels = queryAll(v.node, (e) => e.tagName === "LABEL");
  assert.equal(fieldsets.length, 2, "każda skala = fieldset (grupa)");
  assert.equal(checkboxes.length, 5, "3 + 2 zdania = 5 checkboxów");
  assert.equal(labels.length, 5, "każdy checkbox ma label tekstowy");
  assert.match(snap, /LEGEND/, "każda skala ma legend (nazwa skali)");
  for (const cb of checkboxes) assert.ok(cb.id, "checkbox ma id (powiązanie label/for, klawiatura)");
});

test("maturity-check view: getResponse zwraca { scaleId: { stmtId: true } } zgodne z evaluatorem", () => {
  const v = renderMaturityCheck(CFG);
  const checkboxes = queryAll(v.node, (e) => e.tagName === "INPUT");
  for (const cb of checkboxes) if (["o1", "o3", "p1"].includes(cb.value)) cb.checked = true;
  const resp = v.getResponse();
  assert.deepEqual(resp, { org: { o1: true, o3: true }, person: { p1: true } }, "kształt odpowiedzi musi pasować do evaluatora");
  const result = evaluateMaturityCheck(CFG, resp);
  assert.equal(result.scales.find((s) => s.id === "org").level, 2, "2 zaznaczenia org → poziom 2");
  assert.equal(result.passed, null);
});

test("maturity-check view: showFeedback NEUTRALNY — 'feedback' bez --correct/--incorrect; poziom + banda; brak 'zaliczone'", () => {
  const v = renderMaturityCheck(CFG);
  const result = evaluateMaturityCheck(CFG, { org: { o1: true, o2: true } }); // org poziom 2 → banda 'wysoki'
  v.showFeedback(result);
  const snap = serializeTree(v.node);
  assert.doesNotMatch(snap, /feedback--correct|feedback--incorrect/, "feedback diagnozy NIE może być pass/fail (kolor)");
  assert.match(snap, /class="[^"]*feedback/, "feedback obecny (neutralny)");
  const txt = v.node.textContent || "";
  assert.match(txt, /wysoki/, "banda dla poziomu 2 (label)");
  assert.match(txt, /rada B/, "advice 'jak wejść wyżej' z bandy");
  assert.doesNotMatch(txt, /zaliczon|passed/i, "brak słowa zaliczone/passed");
});
