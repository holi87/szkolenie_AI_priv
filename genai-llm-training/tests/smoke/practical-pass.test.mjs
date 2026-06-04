// practical-pass.test.mjs — DOWÓD odblokowania M4: zadania praktyczne (recordPracticalTask) sprawiają,
// że S2 i S3 są realnie zaliczalne (do M3 bramki praktyczne pozostawały niespełnione, więc S2/S3 nie zaliczały).
// Łańcuch: recordPracticalTask → scorePath (bramki) → buildResult → result.passed === true (M12-2 #93).
import { test } from "node:test";
import assert from "node:assert/strict";
import { selectFinalTest } from "../../assets/core/test-engine.js";
import { scorePath } from "../../assets/core/scoring.js";
import { buildResult } from "../../assets/core/certificate.js";
import { createMemoryAdapter, createProgressStore } from "../../assets/core/progress-store.js";
import { bank, pathsData, modulesData, seededRng } from "./_fixtures.mjs";

function correctAnswer(q) {
  switch (q.type) {
    case "single_choice": case "scenariusz": case "scenariusz_decyzyjny": return q.correct[0];
    case "multiple_choice": return [...q.correct];
    case "dopasowanie": return Object.fromEntries(q.pairs.map((p) => [p.left, p.right]));
    case "kolejnosc_procesu": return [...q.sequence];
    default: return null;
  }
}
const allCorrect = (qs) => Object.fromEntries(qs.map((q) => [q.id, correctAnswer(q)]));
const makeStore = () => createProgressStore(createMemoryAdapter(), { now: () => "2026-06-03T10:00:00.000Z" });

test("S2 zaliczalne: zadanie praktyczne R1-prompt 4/5 (przez recordPracticalTask) → certyfikat wydany", () => {
  const store = makeStore();
  store.selectPath("S2");
  // interakcja Prompt clinic (M7) zapisuje wynik praktyczny tak, jak robi to app.js
  store.recordPracticalTask({ rubric: "R1-prompt", score: 4, maxScore: 5, passed: true });
  const practicalResults = store.getProgress().practicalTasks;
  assert.equal(practicalResults.length, 1);

  const sel = selectFinalTest(bank, pathsData, "S2", seededRng(31));
  const r = scorePath("S2", sel.questions, allCorrect(sel.questions), pathsData, { practicalResults, inlineQuizPct: 100 });
  assert.equal(r.criticalPassed, true);
  assert.equal(r.passed, true, "S2 z praktyką + 100% testu + quizy inline = zaliczone");
  const res = buildResult(r, { pathName: "Praktyk", modulesData });
  assert.equal(res.passed, true, "ścieżka zaliczona dopiero gdy spełnione bramki (M12-2 #93)");
});

test("S2 bez zadania praktycznego → bramka practicalTask niespełniona → certyfikat NIE wydany", () => {
  const sel = selectFinalTest(bank, pathsData, "S2", seededRng(32));
  const r = scorePath("S2", sel.questions, allCorrect(sel.questions), pathsData, { inlineQuizPct: 100 });
  assert.equal(r.passed, false, "brak praktyki blokuje S2 (konserwatywnie)");
  const res = buildResult(r, { pathName: "Praktyk", modulesData });
  assert.equal(res.passed, false);
});

test("S3 zaliczalne: R2-rag i R3-eval >=70% (M6/M12) → certyfikat wydany", () => {
  const store = makeStore();
  store.selectPath("S3");
  store.recordPracticalTask({ rubric: "R2-rag", score: 4, maxScore: 5, passed: true }); // 80% >= 70%
  store.recordPracticalTask({ rubric: "R3-eval", score: 4, maxScore: 5, passed: true });
  const practicalResults = store.getProgress().practicalTasks;

  const sel = selectFinalTest(bank, pathsData, "S3", seededRng(33));
  const r = scorePath("S3", sel.questions, allCorrect(sel.questions), pathsData, { practicalResults, inlineQuizPct: 100 });
  assert.equal(r.passed, true, "S3 z dwoma zadaniami praktycznymi + 100% testu = zaliczone");
  const res = buildResult(r, { pathName: "Inżynier", modulesData });
  assert.equal(res.passed, true);
});

test("S3 z R2-rag poniżej progu (2/5=40%) → moduleMinScore niespełniona → niezaliczone", () => {
  const store = makeStore();
  store.selectPath("S3");
  store.recordPracticalTask({ rubric: "R2-rag", score: 2, maxScore: 5, passed: false });
  store.recordPracticalTask({ rubric: "R3-eval", score: 4, maxScore: 5, passed: true });
  const sel = selectFinalTest(bank, pathsData, "S3", seededRng(34));
  const r = scorePath("S3", sel.questions, allCorrect(sel.questions), pathsData, { practicalResults: store.getProgress().practicalTasks, inlineQuizPct: 100 });
  assert.equal(r.passed, false, "R2-rag 40% < 70% blokuje S3");
});
