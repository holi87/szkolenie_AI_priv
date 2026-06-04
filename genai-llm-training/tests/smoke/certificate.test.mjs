// certificate.test.mjs — model ekranu WYNIKU + eksport (issue #19; M12-2 #93: certyfikat usunięty).
// M12-2: brak completionId/pseudonimu/medalu; zostaje wynik %, status zaliczenia (badge ikona+słowo),
// bramki, słabe obszary, retry, eksport anonimowy. Plik zachowuje nazwę (glob CI: tests/smoke/*.test.mjs).
import "./_dom-stub.mjs"; // instaluje document (renderResult tworzy elementy) + (przez _fixtures) rejestruje katalog PL
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildResult, exportJson, exportCsv, weakAreas, buildQuestionStats, exportQuestionStatsCsv } from "../../assets/core/certificate.js";
import { renderResult } from "../../assets/ui/certificate-view.js";
import { queryAll } from "./_dom-stub.mjs";
import { modulesData } from "./_fixtures.mjs";

test("buildResult zaliczony: passed:true, ścieżka, wynik — BEZ completionId/pseudonimu (M12-2 #93)", () => {
  const r = buildResult(
    { pathId: "S2", scorePct: 84, passed: true, weakModules: [] },
    { pathName: "Praktyk QA", modulesData },
  );
  assert.equal(r.passed, true);
  assert.equal(r.path, "S2");
  assert.equal(r.scorePct, 84);
  assert.equal(r.completionId, undefined, "brak completionId (certyfikat usunięty)");
  assert.equal(r.displayName, undefined, "brak pseudonimu/displayName (certyfikat usunięty)");
  assert.equal(r.reason, undefined, "zaliczony nie ma kodu powodu");
});

test("buildResult poniżej progu: passed:false + KOD powodu (i18n #77) + słabe obszary", () => {
  const r = buildResult(
    { pathId: "S1", scorePct: 60, passed: false, weakModules: [{ module: "M10", pct: 40 }] },
    { modulesData },
  );
  assert.equal(r.passed, false);
  assert.equal(r.completionId, undefined, "brak ID — certyfikat usunięty");
  assert.equal(r.reason, "below_pass_threshold", "core zwraca KOD powodu (i18n #77), nie prozę");
  assert.equal(r.weakAreas[0].module, "M10");
  assert.ok(r.weakAreas[0].name.length > 0, "słaby obszar ma nazwę modułu");
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
  practicalTasks: [{ rubric: "R1-prompt", score: 4, maxScore: 5, passed: true, comments: "ok" }],
};

test("eksport JSON: minimalny payload raportowy, parsowalny, BEZ PII i BEZ completionId (M12-2 #93)", () => {
  const json = exportJson(passedProgress, { pathName: "Praktyk QA" });
  const obj = JSON.parse(json);
  assert.equal(obj.path, "S2");
  assert.equal(obj.scorePct, 84);
  assert.equal(obj.passed, true);
  assert.deepEqual(obj.weakModules, ["M8"]);
  assert.equal(obj.completionId, undefined, "brak completionId w eksporcie (certyfikat usunięty)");
  assert.ok(!json.includes("completionId"), "pole completionId nie istnieje w payloadzie");
  // brak danych wrażliwych: zero e-maili, zero pseudonimu
  assert.ok(!json.includes("@"), "brak e-maila");
  assert.equal(obj.displayName, undefined, "displayName nie istnieje");
  assert.equal(obj.participant, undefined);
  // praktyczne tylko jako rubric/score (bez komentarzy wrażliwych)
  assert.equal(obj.practicalTasks[0].comments, undefined);
});

test("eksport CSV: nagłówek + 1 wiersz, bez completionId/issuedAt (M12-2 #93), weakModules złączone", () => {
  const csv = exportCsv(passedProgress, { pathName: "Praktyk QA" });
  const lines = csv.split("\n");
  assert.equal(lines.length, 2);
  assert.equal(lines[0], "path,scorePct,passed,criticalQuestionsPassed,attempts,weakModules,totalTimeSec");
  assert.ok(lines[1].startsWith("S2,84,true,true,2,"));
  assert.ok(!csv.includes("completionId"), "CSV bez kolumny completionId");
  assert.ok(!csv.includes("CERT-"), "CSV bez markera CERT-");
  assert.ok(!csv.includes("@"), "brak e-maila");
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

test("eksport per-pytanie łączy quiz inline + test końcowy: test NADPISUje inline i łapie pytania spoza puli (#28, Codex runda 4)", () => {
  const progress = {
    path: "S2",
    modules: { M3: { quizResults: [{ questionId: "Q018", correct: true, attempt: 1 }] } },
    finalTest: { questionResults: [
      { questionId: "Q018", module: "M3", correct: false }, // to samo pytanie z testu → nadpisuje inline (warunki testu)
      { questionId: "Q069", module: "M8", correct: true },   // golden widziane TYLKO w teście → teraz złapane
    ] },
  };
  const stats = buildQuestionStats(progress);
  const q018 = stats.find((s) => s.questionId === "Q018");
  assert.equal(q018.correct, 0, "wynik testu końcowego nadpisuje quiz inline");
  assert.equal(q018.source, "final");
  const q069 = stats.find((s) => s.questionId === "Q069");
  assert.ok(q069, "pytanie tylko z testu końcowego jest w eksporcie (pokrycie golden 24/24 możliwe)");
  assert.equal(q069.source, "final");
});

test("eksport wyniku zawiera czas modułów (KPI Time to complete, Codex runda 4)", () => {
  const progress = { path: "S1", finalTest: { passed: false, attempts: 1 }, modules: { M1: { timeSpentSec: 120 }, M2: { timeSpentSec: 90 } } };
  const obj = JSON.parse(exportJson(progress));
  assert.equal(obj.totalTimeSec, 210);
  assert.deepEqual(obj.moduleTimesSec, { M1: 120, M2: 90 });
});

// ----- Ekran Wynik (M12-2 #93): brak medalu/certyfikatu, status zaliczenia jako badge ikona+słowo -----
test("Wynik ZALICZONY: brak medalu/figure, status badge (ikona+SŁOWO) + duży wynik %, BEZ completionId", () => {
  const r = buildResult(
    { pathId: "S2", scorePct: 88, passed: true, weakModules: [] },
    { pathName: "Praktyk QA", modulesData },
  );
  const node = renderResult(r, { progress: { path: "S2", finalTest: { passed: true }, practicalTasks: [] }, pathName: "Praktyk QA", gates: [], onBack: () => {} });
  assert.equal(queryAll(node, (n) => n.tagName === "FIGURE").length, 0, "medal (figure) musi zniknąć (#93)");
  assert.ok(node.textContent.includes("88%"), "brak dużego wyniku %");
  assert.ok(node.textContent.includes("Zaliczone"), "brak słownego statusu zaliczenia (WCAG 1.4.1, nie sam kolor)");
  assert.ok(!node.textContent.includes("CERT-"), "brak markera certyfikatu CERT-");
});

test("Wynik NIEZALICZONY zachowuje role=alert, retry, powrót i eksporty (kontrakt formatywny)", () => {
  const r = buildResult(
    { pathId: "S1", scorePct: 60, passed: false, weakModules: [{ module: "M10", pct: 40 }] },
    { modulesData },
  );
  const node = renderResult(r, {
    progress: { path: "S1", finalTest: { attempts: 1 }, practicalTasks: [] },
    gates: [{ type: "overallThreshold", passed: false, minPct: 75 }],
    canRetry: true, attemptInfo: "Wykorzystane podejścia: 1.", onRetry: () => {}, onBack: () => {},
  });
  assert.ok(queryAll(node, (n) => n.getAttribute && n.getAttribute("role") === "alert").length > 0, "niezaliczony bez role=alert");
  const texts = queryAll(node, (n) => n.tagName === "BUTTON").map((b) => b.textContent);
  assert.ok(texts.some((t) => t.includes("Podejdź ponownie")), "brak przycisku retry");
  assert.ok(texts.some((t) => t.includes("Wróć do modułów")), "brak przycisku powrotu");
  assert.ok(texts.some((t) => t.includes("JSON")) && texts.some((t) => t.includes("CSV")), "brak przycisków eksportu");
});
