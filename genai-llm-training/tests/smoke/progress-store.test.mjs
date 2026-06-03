// progress-store.test.mjs — zapis progresu, per ścieżka, ostatnie miejsce, reset (issue #16).
import { test } from "node:test";
import assert from "node:assert/strict";
import { createMemoryAdapter, createProgressStore } from "../../assets/core/progress-store.js";
import { buildCertificate } from "../../assets/core/certificate.js";
import { modulesData } from "./_fixtures.mjs";

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

test("pseudonim (model C #63): tylko w pamięci sesji — NIE persystowany do localStorage", () => {
  const adapter = createMemoryAdapter();
  const s = makeStore(adapter);
  s.setParticipant({ displayName: "Tester01" }); // bez wybranej ścieżki — nie rzuca
  assert.deepEqual(s.getParticipant(), { displayName: "Tester01" });
  s.selectPath("S2");
  // nick NIE trafia do obiektu progresu ani do storage
  assert.equal(s.getProgress().participant, undefined, "participant nie jest w persystowanym progresie");
  const raw = adapter.get("genai-training:progress:S2") || "";
  assert.ok(!raw.includes("Tester01"), "pseudonim nie może znaleźć się w localStorage");
  // odświeżenie strony: świeży store nad tym samym storage → brak pseudonimu (żył tylko w sesji)
  const s2 = makeStore(adapter);
  assert.equal(s2.getParticipant(), null, "po odświeżeniu pseudonim znika (in-memory)");
});

test("reset czyści pseudonim sesji (#63)", () => {
  const s = makeStore();
  s.setParticipant({ displayName: "Tester01" });
  s.selectPath("S1");
  s.reset({ all: true });
  assert.equal(s.getParticipant(), null, "reset all=true kasuje pseudonim sesji");
});

test("model C end-to-end (#63/#61): pseudonim sesji trafia na certyfikat, po odświeżeniu znika, completionId stały", () => {
  const adapter = createMemoryAdapter();
  const s = makeStore(adapter);
  s.selectPath("S1");
  s.setParticipant({ displayName: "Sesyjny01" });
  const passResult = { pathId: "S1", scorePct: 88, passed: true, weakModules: [] };
  // Dokładnie wiring z app.js: buildCertificate(result, { participant: store.getParticipant() }).
  const inSession = buildCertificate(passResult, { dateIso: fixedNow(), participant: s.getParticipant(), pathName: "Decyzyjna", modulesData });
  assert.equal(inSession.displayName, "Sesyjny01", "pseudonim z sesji widoczny na certyfikacie w trakcie sesji");
  // Odświeżenie: świeży store nad tym samym storage → pseudonim zniknął (model C).
  const s2 = makeStore(adapter);
  s2.selectPath("S1");
  const afterReload = buildCertificate(passResult, { dateIso: fixedNow(), participant: s2.getParticipant(), pathName: "Decyzyjna", modulesData });
  assert.equal(afterReload.displayName, undefined, "po odświeżeniu certyfikat bez pseudonimu (model C)");
  assert.equal(inSession.completionId, afterReload.completionId, "completionId niezależny od pseudonimu (#61)");
});

test("migracja (#63): legacy participant czyszczony z WSZYSTKICH ścieżek przy starcie, nie tylko aktywnej (Codex #65)", () => {
  const legacy = (path, nick) => JSON.stringify({ version: "1.0", path, modules: {}, finalTest: { attempts: 0, maxAttempts: 3 }, practicalTasks: [], updatedAt: fixedNow(), participant: { displayName: nick } });
  const adapter = createMemoryAdapter({
    "genai-training:cursor": JSON.stringify({ pathId: "S1", moduleId: null, screen: null }), // aktywna: S1
    "genai-training:progress:S1": legacy("S1", "NickS1"),
    "genai-training:progress:S2": legacy("S2", "NickS2"), // NIEAKTYWNA — też musi zostać oczyszczona
  });
  const s = makeStore(adapter); // sweep startowy czyści i ZAPISUJE wszystkie progress:* od razu
  assert.equal(s.getProgress().participant, undefined, "aktywna ścieżka bez participant");
  assert.ok(!(adapter.get("genai-training:progress:S1") || "").includes("NickS1"), "S1 oczyszczona w storage od razu");
  assert.ok(!(adapter.get("genai-training:progress:S2") || "").includes("NickS2"),
    "NIEAKTYWNA S2 też oczyszczona w storage przy starcie (bez wybierania jej)");
});
