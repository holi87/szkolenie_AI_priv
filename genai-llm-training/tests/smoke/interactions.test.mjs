// interactions.test.mjs — silniki interakcji modułowych (issue #20-#23): classify / rubric / tune.
// Pure logic; testuje też integralność na PRAWDZIWYCH plikach treści (module-content/mNN.json).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { evaluateInteraction, evaluateClassify, evaluateRubric, evaluateTune, evaluateMaturityCheck } from "../../assets/core/interactions/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const content = (m) => JSON.parse(readFileSync(join(HERE, "..", "..", "data", "pl", "module-content", `${m}.json`), "utf8"));

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

// ---------------- M14 (#105): maturity-check (Skala Holaka) — NEUTRALNY, non-gating ----------------

test("maturity-check: passed ZAWSZE null (neutralne); poziom = liczba zaznaczeń; 2 skale agregują się", () => {
  const cfg = { kind: "maturity-check", scales: [
    { id: "org", label: "Org", max: 3, statements: [{ id: "o1", text: "" }, { id: "o2", text: "" }, { id: "o3", text: "" }],
      bands: [{ min: 0, max: 1, label: "niski", advice: "a" }, { min: 2, max: 3, label: "wysoki", advice: "b" }] },
    { id: "person", label: "Os", max: 2, statements: [{ id: "p1", text: "" }, { id: "p2", text: "" }],
      bands: [{ min: 0, max: 2, label: "ok", advice: "c" }] },
  ] };
  const r = evaluateMaturityCheck(cfg, { org: { o1: true, o3: true }, person: { p1: true } });
  assert.equal(r.passed, null, "diagnoza nigdy nie ma pass/fail (neutralna)");
  assert.equal(r.kind, "maturity-check");
  const org = r.scales.find((s) => s.id === "org");
  const per = r.scales.find((s) => s.id === "person");
  assert.equal(org.level, 2, "2 zaznaczenia = poziom 2");
  assert.equal(org.band.label, "wysoki", "poziom 2 → banda 'wysoki'");
  assert.equal(per.level, 1);
  assert.equal(r.score, 3, "suma poziomów 2+1");
  assert.equal(r.max, 5, "suma max 3+2");
});

test("maturity-check: zaznaczenie ponad max klamruje poziom do max; brak odpowiedzi → poziom 0, banda dolna", () => {
  const cfg = { kind: "maturity-check", scales: [
    { id: "s", label: "S", max: 2, statements: [{ id: "a", text: "" }, { id: "b", text: "" }, { id: "c", text: "" }],
      bands: [{ min: 0, max: 2, label: "x", advice: "y" }] },
  ] };
  assert.equal(evaluateMaturityCheck(cfg, { s: { a: true, b: true, c: true } }).scales[0].level, 2, "3 zaznaczenia → clamp do max 2");
  const empty = evaluateInteraction(cfg, {});
  assert.equal(empty.scales[0].level, 0);
  assert.equal(empty.scales[0].band.label, "x", "poziom 0 ma bandę (feedback rozwiązywalny)");
  assert.equal(empty.passed, null);
});

// M16/#122: diagnoza rozdzielona na MSHP (osoba v2.1p, skala "person") i MSHO (organizacja v2.1e, skala "org").
// Każda diagnoza ma DOKŁADNIE 1 skalę, jest neutralna (passed null), a poziom + banda liczą się z własnego klucza.
for (const [mod, scaleId] of [["mshp", "person"], ["msho", "org"]]) {
  test(`integralność ${mod.toUpperCase()} (maturity-check): 1 skala (${scaleId}) daje poziom + bandę, passed null`, () => {
    const ix = content(mod).interaction;
    assert.equal(ix.kind, "maturity-check");
    const empty = evaluateInteraction(ix, {});
    assert.equal(empty.passed, null, `${mod}: diagnoza neutralna (nigdy pass/fail)`);
    assert.equal(empty.scales.length, 1, `${mod}: dokładnie 1 skala (${scaleId})`);
    const s0 = empty.scales[0];
    assert.equal(s0.id, scaleId, `${mod}: skala ma id "${scaleId}"`);
    assert.equal(s0.level, 0, "brak zaznaczeń → poziom 0");
    assert.ok(s0.band && s0.band.label && s0.band.advice, `skala ${s0.id}: poziom 0 ma bandę z label+advice`);
    const sc = ix.scales.find((s) => s.id === scaleId);
    const allChecked = Object.fromEntries(sc.statements.map((st) => [st.id, true]));
    const full = evaluateInteraction(ix, { [scaleId]: allChecked });
    const res = full.scales.find((s) => s.id === scaleId);
    assert.equal(res.level, res.max, "komplet zaznaczeń → poziom = max skali");
    assert.equal(full.passed, null, "nawet komplet nie daje 'zaliczone'");
  });
}

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
