// scoring.test.mjs — wynik ścieżki i bramki zaliczenia dla S1/S2/S3 (issue #18).
import { test } from "node:test";
import assert from "node:assert/strict";
import { selectFinalTest } from "../../assets/core/test-engine.js";
import { scorePath } from "../../assets/core/scoring.js";
import { bank, pathsData, seededRng } from "./_fixtures.mjs";

function correctAnswer(q) {
  switch (q.type) {
    case "single_choice":
    case "scenariusz":
    case "scenariusz_decyzyjny":
      return q.correct[0];
    case "multiple_choice":
      return [...q.correct];
    case "dopasowanie":
      return Object.fromEntries(q.pairs.map((p) => [p.left, p.right]));
    case "kolejnosc_procesu":
      return [...q.sequence];
    default:
      return null;
  }
}
function wrongAnswer(q) {
  const distractor = (q.options || []).find((o) => !q.correct.includes(o.id));
  switch (q.type) {
    case "single_choice":
    case "scenariusz":
    case "scenariusz_decyzyjny":
      return distractor ? distractor.id : "__none__";
    case "multiple_choice":
      return distractor ? [distractor.id] : [];
    case "dopasowanie":
      return {};
    case "kolejnosc_procesu":
      return [...q.sequence].reverse();
    default:
      return "__none__";
  }
}
const allCorrect = (qs) => Object.fromEntries(qs.map((q) => [q.id, correctAnswer(q)]));

const PRACTICAL = {
  S2: [{ rubric: "R1-prompt", score: 4, maxScore: 5, passed: true }],
  S3: [
    { rubric: "R2-rag", score: 4, maxScore: 5, passed: true },
    { rubric: "R3-eval", score: 4, maxScore: 5, passed: true },
  ],
};

test("S1: komplet poprawnych → 100%, zaliczone, krytyczne ok, brak słabych modułów", () => {
  const sel = selectFinalTest(bank, pathsData, "S1", seededRng(11));
  const r = scorePath("S1", sel.questions, allCorrect(sel.questions), pathsData);
  assert.equal(r.scorePct, 100);
  assert.equal(r.passed, true);
  assert.equal(r.criticalPassed, true);
  assert.deepEqual(r.weakModules, []);
  assert.ok(r.gates.every((g) => g.passed));
});

test("S2: bez oceny zadania praktycznego bramka practicalTask NIE zdana → niezaliczone", () => {
  const sel = selectFinalTest(bank, pathsData, "S2", seededRng(12));
  const r = scorePath("S2", sel.questions, allCorrect(sel.questions), pathsData);
  assert.equal(r.scorePct, 100);
  const practicalGate = r.gates.find((g) => g.type === "practicalTask");
  assert.equal(practicalGate.passed, false, "brak oceny → konserwatywnie niespełniona");
  assert.equal(r.passed, false, "mimo 100% w teście brak praktyki blokuje zaliczenie");
});

test("S2: z oceną zadania promptowego >=4/5 → zaliczone", () => {
  const sel = selectFinalTest(bank, pathsData, "S2", seededRng(13));
  const r = scorePath("S2", sel.questions, allCorrect(sel.questions), pathsData, { practicalResults: PRACTICAL.S2 });
  assert.equal(r.passed, true);
});

test("S3: wymaga R2-rag i R3-eval >=70% — bez nich niezaliczone, z nimi zaliczone", () => {
  const sel = selectFinalTest(bank, pathsData, "S3", seededRng(14));
  const ans = allCorrect(sel.questions);
  assert.equal(scorePath("S3", sel.questions, ans, pathsData).passed, false, "brak praktyk → fail");
  const ok = scorePath("S3", sel.questions, ans, pathsData, { practicalResults: PRACTICAL.S3 });
  assert.equal(ok.passed, true);
  assert.equal(ok.scorePct, 100);
});

test("krytyczne błędne → criticalQuestions gate fail, niezaliczone (warunek konieczny)", () => {
  const sel = selectFinalTest(bank, pathsData, "S1", seededRng(15));
  const ans = allCorrect(sel.questions);
  for (const q of sel.questions) if (q.isCritical) ans[q.id] = wrongAnswer(q); // zepsuj tylko krytyczne
  const r = scorePath("S1", sel.questions, ans, pathsData);
  assert.equal(r.criticalPassed, false);
  assert.equal(r.gates.find((g) => g.type === "criticalQuestions").passed, false);
  assert.equal(r.passed, false);
  assert.equal(r.criticalFails.length, 5);
});

test("słabe moduły: moduł z samymi błędami trafia na listę do powtórzenia", () => {
  const sel = selectFinalTest(bank, pathsData, "S3", seededRng(16));
  const ans = allCorrect(sel.questions);
  const target = sel.questions.find((q) => q.module === "M3" && !q.isCritical);
  const targetModule = target ? "M3" : sel.questions.find((q) => !q.isCritical).module;
  for (const q of sel.questions) if (q.module === targetModule) ans[q.id] = wrongAnswer(q);
  const r = scorePath("S3", sel.questions, ans, pathsData, { practicalResults: PRACTICAL.S3 });
  assert.ok(r.weakModules.some((w) => w.module === targetModule), `${targetModule} powinien być słaby`);
});

test("brak bramek → niezaliczone (defensywnie); realne ścieżki mają bramki", () => {
  const sel = selectFinalTest(bank, pathsData, "S1", seededRng(17));
  const fakePaths = { paths: { S1: { ...pathsData.paths.S1, gates: [] } } };
  const r = scorePath("S1", sel.questions, allCorrect(sel.questions), fakePaths);
  assert.equal(r.passed, false, "zero bramek = brak potwierdzenia zaliczenia");
});
