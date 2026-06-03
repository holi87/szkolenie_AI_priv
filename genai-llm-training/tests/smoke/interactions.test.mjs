// interactions.test.mjs — silniki interakcji modułowych (issue #20-#23): classify / rubric / tune.
// Pure logic; testuje też integralność na PRAWDZIWYCH plikach treści (module-content/mNN.json).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { evaluateInteraction, evaluateClassify, evaluateRubric, evaluateTune } from "../../assets/core/interactions/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const content = (m) => JSON.parse(readFileSync(join(HERE, "..", "..", "data", "module-content", `${m}.json`), "utf8"));

// odpowiedzi „w pełni poprawne" wygenerowane z klucza danej interakcji
const allCorrectClassify = (cfg) => Object.fromEntries(cfg.items.map((it) => [it.id, it.correctCategory]));
const allCorrectRubric = (cfg) => Object.fromEntries(cfg.criteria.map((c) => [c.id, [...c.correctOptionIds]]));

test("classify: komplet poprawnych → score=max, passed; brak wyboru → complete=false, passed=false", () => {
  const cfg = { kind: "classify", categories: [{ id: "a", label: "A" }, { id: "b", label: "B" }],
    items: [{ id: "i1", correctCategory: "a" }, { id: "i2", correctCategory: "b" }] };
  const full = evaluateClassify(cfg, { i1: "a", i2: "b" });
  assert.equal(full.score, 2); assert.equal(full.max, 2); assert.equal(full.complete, true); assert.equal(full.passed, true);
  const partial = evaluateClassify(cfg, { i1: "a", i2: "a" });
  assert.equal(partial.score, 1); assert.equal(partial.passed, false, "domyślnie wymagany komplet poprawnych");
  const empty = evaluateClassify(cfg, {});
  assert.equal(empty.complete, false); assert.equal(empty.passed, false);
});

test("classify: passPct pozwala zaliczyć poniżej kompletu, ale wymaga kompletu wyborów", () => {
  const cfg = { kind: "classify", passPct: 50, categories: [{ id: "a", label: "A" }, { id: "b", label: "B" }],
    items: [{ id: "i1", correctCategory: "a" }, { id: "i2", correctCategory: "b" }] };
  assert.equal(evaluateClassify(cfg, { i1: "a", i2: "a" }).passed, true, "1/2 = 50% i komplet wyborów");
  assert.equal(evaluateClassify(cfg, { i1: "a" }).passed, false, "brak drugiego wyboru blokuje mimo 50%");
});

test("rubric: wszystkie kryteria → score=max passed; zaznaczenie wszystkiego NIE zalicza (anti-gaming)", () => {
  const cfg = { kind: "rubric", scaleMax: 2, passThreshold: 2, criteria: [
    { id: "K1", name: "k1", options: [{ id: "a", text: "" }, { id: "b", text: "" }], correctOptionIds: ["a"] },
    { id: "K2", name: "k2", options: [{ id: "a", text: "" }, { id: "b", text: "" }], correctOptionIds: ["b"] },
  ] };
  assert.equal(evaluateRubric(cfg, { K1: ["a"], K2: ["b"] }).score, 2);
  assert.equal(evaluateRubric(cfg, { K1: ["a"], K2: ["b"] }).passed, true);
  const gamed = evaluateRubric(cfg, { K1: ["a", "b"], K2: ["a", "b"] });
  assert.equal(gamed.score, 0, "równość zbiorów: nadmiarowe zaznaczenia psują kryterium");
  assert.equal(gamed.passed, false);
});

test("rubric: brak progu → passed=null (ćwiczeniowe, nie zaliczenie)", () => {
  const cfg = { kind: "rubric", criteria: [{ id: "K1", name: "k", options: [{ id: "a", text: "" }, { id: "b", text: "" }], correctOptionIds: ["a"] }] };
  assert.equal(evaluateRubric(cfg, { K1: ["a"] }).passed, null);
});

test("tune: ocenia tylko checkpoint; poprawny → 1, błędny → 0, niekompletny → complete=false", () => {
  const cfg = { kind: "tune", controls: [], checkpoint: { type: "single_choice", options: [{ id: "A", text: "" }, { id: "B", text: "" }], correct: ["A"] } };
  assert.equal(evaluateTune(cfg, { checkpoint: "A" }).score, 1);
  assert.equal(evaluateTune(cfg, { checkpoint: "A" }).passed, true);
  assert.equal(evaluateTune(cfg, { checkpoint: "B" }).score, 0);
  assert.equal(evaluateTune(cfg, {}).complete, false);
  const multi = { kind: "tune", controls: [], checkpoint: { type: "multiple_choice", options: [{ id: "A", text: "" }, { id: "B", text: "" }, { id: "C", text: "" }], correct: ["A", "B"] } };
  assert.equal(evaluateTune(multi, { checkpoint: ["A", "B"] }).passed, true);
  assert.equal(evaluateTune(multi, { checkpoint: ["A"] }).passed, false, "niepełny zbiór = błąd");
});

test("dispatcher: nieznany kind rzuca (nie przepuszcza po cichu)", () => {
  assert.throws(() => evaluateInteraction({ kind: "nope" }, {}), /Nieznany typ interakcji/);
});

test("integralność egzemplarzy: M1 (classify), M3 (tune), M7 (rubric) oceniają się z własnego klucza", () => {
  const m1 = content("m01").interaction;
  const r1 = evaluateInteraction(m1, allCorrectClassify(m1));
  assert.equal(r1.score, m1.items.length, "M1: komplet poprawnych");
  assert.equal(r1.passed, true);

  const m3 = content("m03").interaction;
  const r3 = evaluateInteraction(m3, { checkpoint: m3.checkpoint.correct[0] });
  assert.equal(r3.passed, true, "M3: poprawny checkpoint");

  const m7 = content("m07").interaction;
  const r7 = evaluateInteraction(m7, allCorrectRubric(m7));
  assert.equal(r7.score, m7.scaleMax, "M7: wszystkie kryteria spełnione = pełna skala");
  assert.equal(r7.passed, true, "M7: >= próg 4/5");
  assert.ok(r7.score >= m7.passThreshold);
});
