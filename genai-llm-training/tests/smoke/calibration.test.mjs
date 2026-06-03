// calibration.test.mjs — testy narzędzia kalibracji pytań po pilotażu (issue #28).
// Sprawdza czystą funkcję calibrate() na SYNTETYCZNYM zbiorze (data/pilot/sample-pilot-results.json):
// poprawne wykrycie pytań poza zakresem trudności, krytycznych z niejasnością >10% i statusu golden setu.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { calibrate, renderReport, validatePilot, validatePilotCoverage, DIFFICULTY_BANDS } from "../../tools/calibration/calibrate.mjs";
import { bank, goldenSetData } from "./_fixtures.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "..", "..", "data");
const pilot = JSON.parse(readFileSync(join(DATA, "pilot", "sample-pilot-results.json"), "utf8"));

const ctx = {
  questionsById: new Map(bank.map((q) => [q.id, { difficulty: q.difficulty, isCritical: !!q.isCritical, golden: !!q.golden, module: q.module, paths: q.paths }])),
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

test("golden set: PEŁNE pokrycie 24/24 bez offenderów → validated (kontrola pozytywna)", () => {
  // Pilotaż pokrywający WSZYSTKIE 24 golden id, każdy w środku swojego zakresu, 0 niejasności.
  const mid = { L1: 0.875, L2: 0.675, L3: 0.5, L4: 0.325 };
  const byId = new Map(bank.map((q) => [q.id, q]));
  const questions = ctx.goldenIds.map((id) => {
    const d = byId.get(id).difficulty;
    return { id, attempts: 40, correct: Math.round(mid[d] * 40), ambiguityReports: 0 };
  });
  const r = calibrate({ synthetic: true, version: "t", pilot: { participants: 40 }, questions }, ctx);
  assert.equal(r.goldenStatus.coveredCount, 24);
  assert.deepEqual(r.goldenStatus.missingGolden, []);
  assert.equal(r.goldenStatus.validated, true);
});

test("golden set: pełne pokrycie WYMAGANE — podzbiór bez offenderów NIE jest validated (Codex #59)", () => {
  const clean = { synthetic: true, version: "t", pilot: { participants: 10 }, questions: [{ id: "Q001", attempts: 10, correct: 9, ambiguityReports: 0 }] };
  const r = calibrate(clean, ctx);
  assert.equal(r.goldenStatus.validated, false, "1/24 pokrycia nie może być validated");
  assert.equal(r.goldenStatus.missingGolden.length, 23);
});

test("krytyczne poza zakresem raportowane jako dryf (osobno), ale NIE reklasyfikowane (Codex #59)", () => {
  const r = calibrate(pilot, ctx);
  assert.ok(r.criticalDrift.map((q) => q.id).includes("Q083"), "Q083 (L1, 58,3% — za trudne) w dryfie krytycznych");
  assert.ok(r.criticalDrift.every((q) => q.isCritical), "sekcja dryfu zawiera tylko krytyczne");
  assert.ok(r.outOfBand.every((q) => !q.isCritical), "krytyczne nadal poza reklasyfikacją (outOfBand)");
});

test("validatePilot: odrzuca correct > attempts (>100%) i akceptuje poprawną próbkę (Codex #59)", () => {
  assert.throws(
    () => validatePilot({ version: "x", pilot: { participants: 12 }, questions: [{ id: "Q001", attempts: 12, correct: 99 }] }),
    /correct 99 > attempts 12/,
  );
  assert.throws(() => validatePilot({ version: "x", pilot: { participants: 0 }, questions: [] }), /participants|niepustą/);
  assert.equal(validatePilot(pilot), true, "syntetyczna próbka jest poprawna");
});

test("validatePilot: egzekwuje liczność grupy 8–15 (wymagania/07) — Codex #59 runda 2", () => {
  const qs = [{ id: "Q001", attempts: 5, correct: 4 }];
  assert.throws(() => validatePilot({ version: "x", pilot: { participants: 5 }, questions: qs }), /poza zakresem grupy pilotażowej 8–15/);
  const qsBig = [{ id: "Q001", attempts: 15, correct: 10 }];
  assert.throws(() => validatePilot({ version: "x", pilot: { participants: 30 }, questions: qsBig }), /poza zakresem grupy pilotażowej 8–15/);
});

test("validatePilot: odrzuca duplikaty pytań i attempts > uczestników (Codex #59 runda 2)", () => {
  assert.throws(
    () => validatePilot({ version: "x", pilot: { participants: 12 }, questions: [{ id: "Q001", attempts: 12, correct: 6 }, { id: "Q001", attempts: 12, correct: 7 }] }),
    /zduplikowane pytanie Q001/,
  );
  assert.throws(
    () => validatePilot({ version: "x", pilot: { participants: 12 }, questions: [{ id: "Q001", attempts: 20, correct: 10 }] }),
    /attempts 20 > uczestników 12/,
  );
});

test("validatePilot: odrzuca ułamkowe liczności (Codex #59 runda 3)", () => {
  assert.throws(
    () => validatePilot({ version: "x", pilot: { participants: 12 }, questions: [{ id: "Q001", attempts: 11.5, correct: 10 }] }),
    /attempts musi być liczbą całkowitą/,
  );
  assert.throws(
    () => validatePilot({ version: "x", pilot: { participants: 12 }, questions: [{ id: "Q001", attempts: 12, correct: 10.2 }] }),
    /correct musi być liczbą całkowitą/,
  );
});

test("validatePilotCoverage: attempts > uprawnieni uczestnicy wg byPath (S3-only) → błąd (Codex #59 runda 3)", () => {
  const s3only = bank.find((q) => JSON.stringify(q.paths) === JSON.stringify(["S3"]));
  assert.ok(s3only, "w banku istnieje pytanie tylko-S3 (L4)");
  const pilotBad = { version: "t", pilot: { participants: 12, byPath: { S1: 5, S2: 4, S3: 3 } }, questions: [{ id: s3only.id, attempts: 10, correct: 5 }] };
  assert.throws(() => validatePilotCoverage(pilotBad, ctx.questionsById), /uprawnieni uczestnicy 3/);
  // spójny: attempts <= 3 dla S3-only przy byPath S3=3
  const pilotOk = { version: "t", pilot: { participants: 12, byPath: { S1: 5, S2: 4, S3: 3 } }, questions: [{ id: s3only.id, attempts: 3, correct: 2 }] };
  assert.equal(validatePilotCoverage(pilotOk, ctx.questionsById), true);
  // próbka demo (wszyscy na S3) jest spójna
  assert.equal(validatePilotCoverage(pilot, ctx.questionsById), true);
});

test("golden validated odporne na duplikaty rzędów — duplikat nie zastępuje brakującego id (Codex #59 runda 2)", () => {
  // Dwa rzędy Q001 (golden) + brak Q002 (golden): coveredGoldenIds={Q001}, missingGolden zawiera Q002 → NIE validated.
  const dup = { synthetic: true, version: "t", pilot: { participants: 10 }, questions: [
    { id: "Q001", attempts: 10, correct: 9, ambiguityReports: 0 },
    { id: "Q001", attempts: 10, correct: 9, ambiguityReports: 0 },
  ] };
  const r = calibrate(dup, ctx);
  assert.equal(r.goldenStatus.validated, false, "duplikat jednego golden nie może udawać pełnego pokrycia");
  assert.ok(r.goldenStatus.missingGolden.length >= 22);
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
