// progress-store.test.mjs — zapis progresu, per ścieżka, ostatnie miejsce, reset (issue #16).
import { test } from "node:test";
import assert from "node:assert/strict";
import { createMemoryAdapter, createProgressStore } from "../../assets/core/progress-store.js";

// Stały zegar — deterministyczne timestampy w testach.
const fixedNow = () => "2026-06-03T10:00:00.000Z";
const makeStore = (adapter = createMemoryAdapter()) => createProgressStore(adapter, { now: fixedNow });

test("selectPath tworzy progres zgodny z modelem (wersja, finalTest, wagi 30/60/10)", () => {
  const s = makeStore();
  const p = s.selectPath("S1");
  assert.equal(p.path, "S1");
  assert.equal(p.version, "1.0");
  assert.equal(p.finalTest.attempts, 0);
  assert.equal(p.finalTest.maxAttempts, 3);
  assert.deepEqual(p.scoreWeights, { inlineQuiz: 0.3, finalTest: 0.6, practicalTask: 0.1 });
});

test("setModuleStatus completed ustawia completedAt", () => {
  const s = makeStore();
  s.selectPath("S1");
  s.setModuleStatus("M1", "completed");
  const p = s.getProgress();
  assert.equal(p.modules.M1.status, "completed");
  assert.equal(p.modules.M1.completedAt, fixedNow());
});

test("status modułu zapisuje się PER ŚCIEŻKA (S1 i S2 niezależne)", () => {
  const adapter = createMemoryAdapter();
  const s = makeStore(adapter);
  s.selectPath("S1");
  s.setModuleStatus("M1", "completed");
  s.selectPath("S2"); // zmiana ścieżki nie kasuje S1
  assert.equal(s.getProgress().modules.M1, undefined, "S2 startuje czysto");
  s.selectPath("S1");
  assert.equal(s.getProgress().modules.M1.status, "completed", "S1 zachowane");
});

test("recordQuizResult zapisuje wynik pytania (ID, wynik, próba, feedback) i ustawia in_progress", () => {
  const s = makeStore();
  s.selectPath("S2");
  s.recordQuizResult("M3", { questionId: "Q018", correct: true, attempt: 1, scoreAwarded: 1, feedback: "ok" });
  const m = s.getProgress().modules.M3;
  assert.equal(m.status, "in_progress");
  assert.equal(m.quizResults.length, 1);
  assert.equal(m.quizResults[0].questionId, "Q018");
  assert.equal(m.quizResults[0].feedback, "ok");
  assert.equal(m.quizResults[0].answeredAt, fixedNow());
});

test("finalTest: kolejne próby inkrementują attempts; limit podejść respektowany", () => {
  const s = makeStore();
  s.selectPath("S1");
  assert.equal(s.canAttemptFinalTest(), true);
  s.recordFinalTest({ scorePct: 60, passed: false, criticalPassed: true, weakModules: [{ module: "M2", pct: 40 }] });
  s.recordFinalTest({ scorePct: 70, passed: false, criticalPassed: true, weakModules: [] });
  s.recordFinalTest({ scorePct: 80, passed: true, criticalPassed: true, weakModules: [] });
  const ft = s.getProgress().finalTest;
  assert.equal(ft.attempts, 3);
  assert.equal(ft.passed, true);
  assert.deepEqual(ft.weakModules, [], "weakModules normalizowane do listy id");
  assert.equal(s.canAttemptFinalTest(), false, "3/3 → brak kolejnych podejść");
});

test("recordFinalTest zapisuje per-pytanie (questionResults) zgodnie ze schematem (kalibracja #28)", () => {
  const s = makeStore();
  s.selectPath("S2");
  s.recordFinalTest({
    scorePct: 80, passed: true, criticalPassed: true, weakModules: [],
    questionResults: [{ questionId: "Q069", module: "M8", correct: true }, { questionId: "Q018", module: "M3", correct: false }],
  });
  const ft = s.getProgress().finalTest;
  assert.equal(ft.questionResults.length, 2);
  assert.deepEqual(ft.questionResults[0], { questionId: "Q069", module: "M8", correct: true });
  assert.equal(ft.questionResults[1].correct, false);
});

test("recordFinalTest zachowuje per-pytanie z PIERWSZEGO podejścia (kalibracja agreguje 1. próbę; Codex #59 r5)", () => {
  const s = makeStore();
  s.selectPath("S1");
  s.recordFinalTest({ scorePct: 60, passed: false, criticalPassed: true, weakModules: ["M10"], questionResults: [{ questionId: "Q081", module: "M10", correct: false }] });
  // 2. podejście: poprawił → ale per-pytanie kalibracji zostaje z 1. próby (false), agregaty z najnowszego.
  s.recordFinalTest({ scorePct: 90, passed: true, criticalPassed: true, weakModules: [], questionResults: [{ questionId: "Q081", module: "M10", correct: true }] });
  const ft = s.getProgress().finalTest;
  assert.equal(ft.attempts, 2);
  assert.equal(ft.lastScorePct, 90, "agregat (wynik) z najnowszego podejścia");
  assert.equal(ft.questionResults[0].correct, false, "per-pytanie zachowane z 1. podejścia (nie zawyża % popr.)");
});

test("ostatnie miejsce: nowy store nad tym samym adapterem wraca do kursora i aktywnej ścieżki", () => {
  const adapter = createMemoryAdapter();
  const s1 = makeStore(adapter);
  s1.selectPath("S3");
  s1.setLastLocation("M6", "ekran-3");
  // symulacja odświeżenia strony: świeży store, ten sam storage
  const s2 = makeStore(adapter);
  assert.equal(s2.getActivePath(), "S3");
  assert.deepEqual(s2.getLastLocation(), { pathId: "S3", moduleId: "M6", screen: "ekran-3" });
  assert.equal(s2.getProgress().modules.M6.lastScreen, "ekran-3");
});

test("reset: aktywna ścieżka czyszczona, inne ścieżki nietknięte; all=true czyści wszystko", () => {
  const adapter = createMemoryAdapter();
  const s = makeStore(adapter);
  s.selectPath("S1");
  s.setModuleStatus("M1", "completed");
  s.selectPath("S2");
  s.setModuleStatus("M2", "completed");
  s.reset(); // czyści aktywną S2
  assert.equal(s.getProgress().modules.M2, undefined);
  s.selectPath("S1");
  assert.equal(s.getProgress().modules.M1.status, "completed", "S1 nietknięte");
  s.reset({ all: true });
  assert.equal(s.getActivePath(), null);
  assert.deepEqual(adapter.keys().filter((k) => k.startsWith("genai-training:")), []);
});

test("uszkodzony wpis w storage nie wywala store (konserwatywnie traktowany jak brak)", () => {
  const adapter = createMemoryAdapter({ "genai-training:cursor": "{ to nie jest json" });
  const s = makeStore(adapter);
  assert.equal(s.getActivePath(), null);
  assert.doesNotThrow(() => s.selectPath("S1"));
});

test("recordInteraction zapisuje wynik interakcji w module (kształt zgodny z progress.schema.json)", () => {
  const s = makeStore();
  s.selectPath("S3");
  s.recordInteraction("M6", { kind: "rubric", score: 4, max: 5, pct: 80, passed: true });
  const ix = s.getProgress().modules.M6.interaction;
  assert.deepEqual(Object.keys(ix).sort(), ["completedAt", "kind", "max", "passed", "pct", "score"]);
  assert.equal(ix.kind, "rubric");
  assert.equal(ix.score, 4);
  assert.equal(ix.max, 5);
  assert.equal(ix.completedAt, fixedNow());
  assert.equal(s.getProgress().modules.M6.status, "in_progress", "interakcja w pustym module ustawia in_progress");
});

test("addModuleTime akumuluje czas modułu (KPI Time to complete) i klamruje wartości ujemne", () => {
  const s = makeStore();
  s.selectPath("S2");
  s.addModuleTime("M3", 30);
  s.addModuleTime("M3", 15.4); // Math.round → 15
  assert.equal(s.getProgress().modules.M3.timeSpentSec, 45);
  s.addModuleTime("M3", -100); // czas ujemny (np. zegar systemowy) → bez zmiany (Math.max(0, …))
  assert.equal(s.getProgress().modules.M3.timeSpentSec, 45);
});

test("certyfikat zapisuje się w progresie", () => {
  const s = makeStore();
  s.selectPath("S1");
  s.recordCertificate({ issued: true, completionId: "CERT-S1-20260603-ABC", scorePct: 88 });
  const c = s.getProgress().certificate;
  assert.equal(c.issued, true);
  assert.equal(c.completionId, "CERT-S1-20260603-ABC");
  assert.equal(c.issuedAt, fixedNow());
});
