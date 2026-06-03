// certificate.test.mjs — ekran zaliczenia i eksport wyniku (issue #19).
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCertificate, generateCompletionId, exportJson, exportCsv, weakAreas, buildQuestionStats, exportQuestionStatsCsv } from "../../assets/core/certificate.js";
import { modulesData } from "./_fixtures.mjs";

const DATE = "2026-06-03T10:00:00.000Z";

test("generateCompletionId: deterministyczne, w formacie CERT-<ścieżka>-<RRRRMMDD>-<hash>", () => {
  const id = generateCompletionId("S1", DATE, 88, "Tester Testowy");
  assert.match(id, /^CERT-S1-20260603-[0-9A-Z]+$/);
  assert.equal(id, generateCompletionId("S1", DATE, 88, "Tester Testowy"), "te same dane → to samo ID");
  assert.notEqual(id, generateCompletionId("S1", DATE, 89, "Tester Testowy"), "inny wynik → inne ID");
});

test("certyfikat WYDANY tylko przy zaliczeniu: zawiera ścieżkę, datę, wynik i ID", () => {
  const cert = buildCertificate(
    { pathId: "S2", scorePct: 84, passed: true, weakModules: [] },
    { dateIso: DATE, participant: { displayName: "Tester Testowy" }, pathName: "Praktyk QA", modulesData },
  );
  assert.equal(cert.issued, true);
  assert.equal(cert.path, "S2");
  assert.equal(cert.scorePct, 84);
  assert.equal(cert.displayName, "Tester Testowy");
  assert.ok(cert.completionId.startsWith("CERT-S2-"));
});

test("wynik poniżej progu NIE generuje certyfikatu zaliczenia", () => {
  const cert = buildCertificate(
    { pathId: "S1", scorePct: 60, passed: false, weakModules: [{ module: "M10", pct: 40 }] },
    { dateIso: DATE, modulesData },
  );
  assert.equal(cert.issued, false);
  assert.equal(cert.completionId, undefined, "brak ID zaliczenia dla niezaliczonego");
  assert.ok(cert.reason.includes("poniżej progu"));
  assert.equal(cert.weakAreas[0].module, "M10");
  assert.ok(cert.weakAreas[0].name.length > 0, "słaby obszar ma nazwę modułu");
});

test("weakAreas mapuje id modułu na nazwę", () => {
  const wa = weakAreas([{ module: "M6", pct: 55 }], modulesData);
  assert.equal(wa[0].module, "M6");
  assert.match(wa[0].name, /RAG/);
  assert.equal(wa[0].pct, 55);
});

const passedProgress = {
  path: "S2",
  finalTest: { attempts: 2, lastScorePct: 84, passed: true, criticalQuestionsPassed: true, weakModules: ["M8"] },
  certificate: { issued: true, completionId: "CERT-S2-20260603-XYZ", issuedAt: DATE },
  practicalTasks: [{ rubric: "R1-prompt", score: 4, maxScore: 5, passed: true, comments: "ok" }],
  participant: { displayName: "Tester Testowy" },
};

test("eksport JSON: minimalny payload raportowy, parsowalny, BEZ PII", () => {
  const json = exportJson(passedProgress, { pathName: "Praktyk QA" });
  const obj = JSON.parse(json);
  assert.equal(obj.path, "S2");
  assert.equal(obj.scorePct, 84);
  assert.equal(obj.passed, true);
  assert.equal(obj.completionId, "CERT-S2-20260603-XYZ");
  assert.deepEqual(obj.weakModules, ["M8"]);
  // brak danych wrażliwych: zero e-maili, brak imienia/displayName w eksporcie
  assert.ok(!json.includes("@"), "brak e-maila");
  assert.equal(obj.displayName, undefined, "displayName nie trafia do eksportu raportowego");
  assert.equal(obj.participant, undefined);
  // praktyczne tylko jako rubric/score (bez komentarzy wrażliwych)
  assert.equal(obj.practicalTasks[0].comments, undefined);
});

test("eksport CSV: nagłówek + 1 wiersz, bez PII, weakModules złączone", () => {
  const csv = exportCsv(passedProgress, { pathName: "Praktyk QA" });
  const lines = csv.split("\n");
  assert.equal(lines.length, 2);
  assert.equal(lines[0], "completionId,path,scorePct,passed,criticalQuestionsPassed,attempts,issuedAt,weakModules");
  assert.ok(lines[1].startsWith("CERT-S2-20260603-XYZ,S2,84,true,true,2,"));
  assert.ok(!csv.includes("@"), "brak e-maila");
  assert.ok(!csv.includes("Tester"), "brak imienia w eksporcie");
});

test("eksport per-pytanie (#28): jeden wiersz na pytanie z 1. próby, anonimowo, bez PII", () => {
  const progress = {
    path: "S2",
    modules: {
      M3: { quizResults: [
        { questionId: "Q018", correct: true, attempt: 1 },
        { questionId: "Q018", correct: false, attempt: 1 }, // 2. podejście tego samego pytania — ignorowane (liczy się pierwsze)
        { questionId: "Q024", correct: false, attempt: 1 },
      ] },
      M1: { quizResults: [{ questionId: "Q001", correct: true, attempt: 1 }] },
    },
  };
  const stats = buildQuestionStats(progress);
  assert.equal(stats.length, 3, "po jednym wierszu na unikalne pytanie");
  const q018 = stats.find((s) => s.questionId === "Q018");
  assert.equal(q018.correct, 1, "liczy się PIERWSZA próba (poprawna)");
  assert.equal(q018.attempts, 1);
  assert.equal(q018.module, "M3");
  const csv = exportQuestionStatsCsv(progress);
  const lines = csv.split("\n");
  assert.equal(lines[0], "questionId,module,attempts,correct,source");
  assert.equal(lines.length, 4, "nagłówek + 3 pytania");
  assert.ok(lines[1].startsWith("Q001,M1,1,1,inline"));
  assert.ok(!csv.includes("@"), "brak PII");
});

test("eksport per-pytanie: pusty progres → tylko nagłówek (brak wyjątku)", () => {
  assert.equal(exportQuestionStatsCsv({ path: "S1", modules: {} }), "questionId,module,attempts,correct,source");
  assert.deepEqual(buildQuestionStats({}), []);
});

test("niezaliczony progres: eksport nie zawiera completionId", () => {
  const failProgress = { path: "S1", finalTest: { attempts: 3, lastScorePct: 70, passed: false, criticalQuestionsPassed: false, weakModules: ["M10"] } };
  const obj = JSON.parse(exportJson(failProgress));
  assert.equal(obj.passed, false);
  assert.equal(obj.completionId, null);
});
