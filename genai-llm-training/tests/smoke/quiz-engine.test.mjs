// quiz-engine.test.mjs — scoring per typ pytania, partial credit, pytania krytyczne (issue #17).
import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreQuestion, scoreQuiz, CRITICAL_FAIL_MESSAGE } from "../../assets/core/quiz-engine.js";

const single = { id: "T1", type: "single_choice", points: 1, correct: ["B"], isCritical: false, feedbackCorrect: "ok", feedbackIncorrect: "no" };
const multi = { id: "T2", type: "multiple_choice", points: 2, correct: ["A", "C"], isCritical: false };
const match = { id: "T3", type: "dopasowanie", points: 1, pairs: [{ left: "a", right: "1" }, { left: "b", right: "2" }, { left: "c", right: "3" }, { left: "d", right: "4" }] };
const seq = { id: "T4", type: "kolejnosc_procesu", points: 1, sequence: ["s1", "s2", "s3", "s4"] };
const scen = { id: "T5", type: "scenariusz_decyzyjny", points: 2, correct: ["B"] };
const analysis = { id: "T6", type: "analiza_outputu", points: 3, rubric: "R5-output-analysis" };
const crit = { id: "T7", type: "single_choice", points: 1, correct: ["A"], isCritical: true, feedbackIncorrect: "bezp." };

test("single_choice: pełne punkty za trafienie, 0 za błąd", () => {
  assert.equal(scoreQuestion(single, "B").awarded, 1);
  assert.equal(scoreQuestion(single, "B").isCorrect, true);
  assert.equal(scoreQuestion(single, "A").awarded, 0);
  assert.equal(scoreQuestion(single, ["B", "A"]).awarded, 0, "więcej niż 1 wybór = błąd");
});

test("multiple_choice: pełne 2 tylko za komplet bez błędów; partial credit; błąd obniża", () => {
  assert.equal(scoreQuestion(multi, ["A", "C"]).awarded, 2, "komplet → pełne");
  assert.equal(scoreQuestion(multi, ["A", "C"]).isCorrect, true);
  assert.equal(scoreQuestion(multi, ["A"]).awarded, 1, "1/2 trafione, 0 błędnych → 2*(1-0)/2=1");
  assert.equal(scoreQuestion(multi, ["A"]).isCorrect, false, "niepełne ≠ poprawne");
  assert.equal(scoreQuestion(multi, ["A", "B"]).awarded, 0, "1 trafione 1 błędne → 2*(1-1)/2=0");
  assert.equal(scoreQuestion(multi, ["B", "D"]).awarded, 0, "same błędne → podłoga 0");
});

test("dopasowanie: 0.25 pkt za poprawną parę", () => {
  assert.equal(scoreQuestion(match, { a: "1", b: "2", c: "3", d: "4" }).awarded, 1);
  assert.equal(scoreQuestion(match, { a: "1", b: "2", c: "3", d: "4" }).isCorrect, true);
  assert.equal(scoreQuestion(match, { a: "1", b: "2", c: "9", d: "9" }).awarded, 0.5, "2/4 par → 0.5");
  assert.equal(scoreQuestion(match, {}).awarded, 0);
});

test("kolejnosc_procesu: 1 pełna, 0.5 jeden błąd sąsiedni, 0 inaczej", () => {
  assert.equal(scoreQuestion(seq, ["s1", "s2", "s3", "s4"]).awarded, 1);
  assert.equal(scoreQuestion(seq, ["s2", "s1", "s3", "s4"]).awarded, 0.5, "zamiana sąsiednia → 0.5");
  assert.equal(scoreQuestion(seq, ["s1", "s2", "s4", "s3"]).awarded, 0.5, "inna zamiana sąsiednia → 0.5");
  assert.equal(scoreQuestion(seq, ["s4", "s3", "s2", "s1"]).awarded, 0, "odwrócenie → 0");
  assert.equal(scoreQuestion(seq, ["s1", "s3", "s2", "s4"]).awarded, 0.5, "środkowa zamiana → 0.5");
});

test("scenariusz_decyzyjny: 2 pkt za najlepszą decyzję", () => {
  assert.equal(scoreQuestion(scen, "B").awarded, 2);
  assert.equal(scoreQuestion(scen, "A").awarded, 0);
});

test("analiza_outputu: requiresRubric, ocena 0–3 z rubryki, brak oceny = 0", () => {
  const noScore = scoreQuestion(analysis, null);
  assert.equal(noScore.requiresRubric, true);
  assert.equal(noScore.awarded, 0, "brak oceny → konserwatywnie 0");
  assert.equal(scoreQuestion(analysis, null, { rubricPoints: 3 }).awarded, 3);
  assert.equal(scoreQuestion(analysis, null, { rubricPoints: 9 }).awarded, 3, "clamp do max");
  assert.equal(scoreQuestion(analysis, null, { rubricPoints: 2 }).isCorrect, false, "2/3 ≠ pełne");
});

test("pytanie krytyczne: błędna/pusta odpowiedź → isCriticalFail", () => {
  assert.equal(scoreQuestion(crit, "A").isCriticalFail, false, "poprawne → brak fail");
  assert.equal(scoreQuestion(crit, "B").isCriticalFail, true, "błędne → fail");
  assert.equal(scoreQuestion(crit, null).isCriticalFail, true, "brak odpowiedzi → fail");
  assert.ok(CRITICAL_FAIL_MESSAGE.includes("błąd bezpieczeństwa"));
});

test("scoreQuiz: agreguje wynik %, listę krytycznych porażek", () => {
  const r = scoreQuiz([single, multi, crit], { T1: "B", T2: ["A", "C"], T7: "B" });
  assert.equal(r.awarded, 3, "1 + 2 + 0");
  assert.equal(r.max, 4, "1 + 2 + 1");
  assert.equal(r.scorePct, 75);
  assert.deepEqual(r.criticalFails, ["T7"]);
});
