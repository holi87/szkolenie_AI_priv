// calibration.test.mjs — testy narzędzia kalibracji pytań po pilotażu (issue #28).
// Sprawdza czystą funkcję calibrate() na SYNTETYCZNYM zbiorze (data/pilot/sample-pilot-results.json):
// poprawne wykrycie pytań poza zakresem trudności, krytycznych z niejasnością >10% i statusu golden setu.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { calibrate, renderReport, DIFFICULTY_BANDS } from "../../tools/calibration/calibrate.mjs";
import { bank, goldenSetData } from "./_fixtures.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "..", "..", "data");
const pilot = JSON.parse(readFileSync(join(DATA, "pilot", "sample-pilot-results.json"), "utf8"));

const ctx = {
  questionsById: new Map(bank.map((q) => [q.id, { difficulty: q.difficulty, isCritical: !!q.isCritical, golden: !!q.golden, module: q.module }])),
  goldenIds: goldenSetData.goldenSet.questionIds,
};

const ids = (arr) => arr.map((q) => q.id).sort();

test("zakresy trudności zgodne z wymagania/07 (L1 80–95, L2 55–80, L3 35–65, L4 20–45)", () => {
  assert.deepEqual(DIFFICULTY_BANDS.L1, [0.8, 0.95]);
  assert.deepEqual(DIFFICULTY_BANDS.L2, [0.55, 0.8]);
  assert.deepEqual(DIFFICULTY_BANDS.L3, [0.35, 0.65]);
  assert.deepEqual(DIFFICULTY_BANDS.L4, [0.2, 0.45]);
});

test("pytania poza zakresem: Q017 (za trudne) i Q032 (za łatwe) wykryte; pytania w zakresie pominięte", () => {
  const r = calibrate(pilot, ctx);
  assert.ok(ids(r.outOfBand).includes("Q017"), "Q017 (L3, 25% < 35%) powinno być za trudne");
  assert.ok(ids(r.outOfBand).includes("Q032"), "Q032 (L3, 91,7% > 65%) powinno być za łatwe");
  assert.ok(!ids(r.outOfBand).includes("Q002"), "Q002 (L1, 83% w zakresie) NIE poza zakresem");
  const q017 = r.perQuestion.find((q) => q.id === "Q017");
  assert.equal(q017.direction, "za trudne");
  const q032 = r.perQuestion.find((q) => q.id === "Q032");
  assert.equal(q032.direction, "za łatwe");
});

test("pytania krytyczne wykluczone z reklasyfikacji zakresu (konserwatywnie — są 100%-bramkowane)", () => {
  const r = calibrate(pilot, ctx);
  assert.ok(r.outOfBand.every((q) => !q.isCritical), "żadne krytyczne nie trafia do outOfBand");
});

test("krytyczne z niejasnością >10% do przepisania: Q083 (16,7%) tak, Q085 (8,3%) nie", () => {
  const r = calibrate(pilot, ctx);
  assert.deepEqual(ids(r.criticalsToRewrite), ["Q083"]);
  assert.ok(r.criticalsToRewrite.every((q) => q.id !== "Q085"), "8,3% < 10% nie jest flagowane");
});

test("golden set: status 'wymaga poprawek' gdy są offenderzy (dryf trudności lub niejasność >5%)", () => {
  const r = calibrate(pilot, ctx);
  assert.equal(r.goldenStatus.validated, false);
  const offIds = r.goldenStatus.offenders.map((o) => o.id);
  assert.ok(offIds.includes("Q032"), "Q032 (golden, za łatwe) jest offenderem");
});

test("golden set: status 'validated' gdy brak offenderów (kontrola pozytywna)", () => {
  // Zbiór sztuczny: jedno golden pytanie L1 idealnie w zakresie, bez niejasności.
  const clean = { synthetic: true, pilot: { participants: 10 }, questions: [{ id: "Q001", attempts: 10, correct: 9, ambiguityReports: 0 }] };
  const r = calibrate(clean, ctx);
  assert.equal(r.goldenStatus.validated, true);
});

test("pytania spoza banku są raportowane jako unknown, nie wywalają narzędzia", () => {
  const withUnknown = { synthetic: true, pilot: { participants: 5 }, questions: [{ id: "Q999", attempts: 5, correct: 3, ambiguityReports: 0 }] };
  const r = calibrate(withUnknown, ctx);
  assert.deepEqual(r.coverage.unknownIds, ["Q999"]);
  assert.equal(r.perQuestion.length, 0);
});

test("renderReport produkuje Markdown z sekcjami i oznaczeniem danych syntetycznych", () => {
  const r = calibrate(pilot, ctx);
  const md = renderReport(pilot, r);
  assert.match(md, /# Raport kalibracji/);
  assert.match(md, /DANE SYNTETYCZNE/);
  assert.match(md, /poza zakresem trudności/);
  assert.match(md, /Status golden setu/);
});
