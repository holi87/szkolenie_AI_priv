// quiz-engine.js — scoring pytań inline (issue #17).
// Pure logic, zero DOM, zero zależności. Importowalne w Node (testy) i w przeglądarce (UI).
// Punktacja per typ pytania wg wymagania/07 (sekcja "Typy pytań").
// Zasada AGENTS: konserwatywne zachowanie domyślne — brak odpowiedzi / niejasna odpowiedź = 0 pkt,
// a błędne pytanie krytyczne zawsze sygnalizuje isCriticalFail.
// i18n (ADR-0004): core jest zero-i18n. Komunikat dla błędu krytycznego NIE żyje tu jako proza —
// flaga `result.isCriticalFail` JEST kodem semantycznym; tekst rozwiązuje UI przez t('feedback.criticalFail.*').

/** Typy oceniane automatycznie przez wybór pojedynczej najlepszej opcji (1 poprawna). */
const SINGLE_BEST = new Set(["single_choice", "scenariusz_decyzyjny", "scenariusz"]);

const round2 = (n) => Math.round(n * 100) / 100;

/** Normalizuje odpowiedź wyboru do tablicy stringów (akceptuje string | string[] | null). */
function toIdArray(answer) {
  if (answer == null) return [];
  if (Array.isArray(answer)) return answer.filter((x) => typeof x === "string");
  if (typeof answer === "string") return [answer];
  return [];
}

function setEquals(a, b) {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

/** Wynik dla single_choice / scenariusz / scenariusz_decyzyjny: pełne punkty tylko za dokładne trafienie. */
function scoreSingleBest(q, answer) {
  const selected = toIdArray(answer);
  const correct = q.correct || [];
  const isCorrect = selected.length === 1 && correct.length === 1 && selected[0] === correct[0];
  return { awarded: isCorrect ? q.points : 0, isCorrect };
}

/**
 * multiple_choice (wymagania/07: 0–2 pkt, pełne tylko za komplet bez błędów).
 * Partial credit: punkty * (trafione − błędne) / |poprawne|, podłoga 0; każdy błędny wybór obniża poniżej pełnych.
 */
function scoreMultiple(q, answer) {
  const selected = new Set(toIdArray(answer));
  const correct = new Set(q.correct || []);
  if (correct.size === 0) return { awarded: 0, isCorrect: false };
  let hits = 0;
  let wrong = 0;
  for (const id of selected) (correct.has(id) ? (hits += 1) : (wrong += 1));
  const exact = setEquals(selected, correct);
  if (exact) return { awarded: q.points, isCorrect: true };
  const awarded = Math.max(0, round2((q.points * (hits - wrong)) / correct.size));
  return { awarded, isCorrect: false };
}

/** dopasowanie (wymagania/07: 0,25 pkt za parę). answer = mapa { left: right }. */
function scoreMatching(q, answer) {
  const pairs = q.pairs || [];
  if (pairs.length === 0) return { awarded: 0, isCorrect: false };
  const map = answer && typeof answer === "object" && !Array.isArray(answer) ? answer : {};
  const perPair = q.points / pairs.length; // = 0,25 przy 4 parach / 1 pkt (zgodne z wymagania/07)
  let correctPairs = 0;
  for (const p of pairs) if (map[p.left] === p.right) correctPairs += 1;
  const isCorrect = correctPairs === pairs.length;
  return { awarded: round2(perPair * correctPairs), isCorrect };
}

/** Czy `answer` różni się od `correct` dokładnie jedną zamianą sąsiednich elementów. */
function isOneAdjacentSwap(answer, correct) {
  if (answer.length !== correct.length) return false;
  const diff = [];
  for (let i = 0; i < correct.length; i += 1) if (answer[i] !== correct[i]) diff.push(i);
  if (diff.length !== 2) return false;
  const [i, j] = diff;
  return j === i + 1 && answer[i] === correct[j] && answer[j] === correct[i];
}

/** kolejnosc_procesu (wymagania/07: 1 pkt pełna kolejność, 0,5 za jeden błąd sąsiedni). */
function scoreSequence(q, answer) {
  const correct = q.sequence || [];
  const given = Array.isArray(answer) ? answer.filter((x) => typeof x === "string") : [];
  if (correct.length > 0 && given.length === correct.length && given.every((v, i) => v === correct[i])) {
    return { awarded: q.points, isCorrect: true };
  }
  if (isOneAdjacentSwap(given, correct)) return { awarded: round2(q.points * 0.5), isCorrect: false };
  return { awarded: 0, isCorrect: false };
}

/**
 * Ocenia pojedyncze pytanie. Zwraca jednolity wynik niezależnie od typu.
 * @param {object} question - pytanie zgodne z data/schemas/questions.schema.json
 * @param {*} answer - odpowiedź uczestnika (kształt zależny od typu; patrz funkcje powyżej)
 * @param {object} [opts] - { rubricPoints } dla analiza_outputu (ocena 0–3 wg rubryki R5)
 * @returns {{type:string, awarded:number, max:number, isCorrect:boolean|null,
 *            isCriticalFail:boolean, requiresRubric:boolean, feedback:string}}
 */
export function scoreQuestion(question, answer, opts = {}) {
  const max = typeof question.points === "number" ? question.points : 0;
  let res;
  let requiresRubric = false;

  if (SINGLE_BEST.has(question.type)) {
    res = scoreSingleBest(question, answer);
  } else if (question.type === "multiple_choice") {
    res = scoreMultiple(question, answer);
  } else if (question.type === "dopasowanie") {
    res = scoreMatching(question, answer);
  } else if (question.type === "kolejnosc_procesu") {
    res = scoreSequence(question, answer);
  } else if (question.type === "analiza_outputu") {
    // Oceniane rubryką R5 (0–3) — w MVP wymaga oceny (rubricPoints); domyślnie 0 (konserwatywnie).
    requiresRubric = true;
    const rp = typeof opts.rubricPoints === "number" ? opts.rubricPoints : null;
    const awarded = rp == null ? 0 : Math.max(0, Math.min(max, rp));
    res = { awarded, isCorrect: rp == null ? null : awarded >= max };
  } else {
    res = { awarded: 0, isCorrect: false };
  }

  const isCorrect = res.isCorrect;
  const isCriticalFail = Boolean(question.isCritical) && isCorrect !== true;
  const feedback = isCorrect === true ? question.feedbackCorrect : question.feedbackIncorrect;

  return {
    type: question.type,
    awarded: res.awarded,
    max,
    isCorrect,
    isCriticalFail,
    requiresRubric,
    feedback: feedback || "",
  };
}

/**
 * Ocenia zestaw pytań (quiz inline). answers: mapa { [questionId]: answer }.
 * rubricPointsById: opcjonalna mapa { [questionId]: number } dla analiza_outputu.
 * @returns {{awarded:number, max:number, scorePct:number, perQuestion:object[],
 *            criticalFails:string[], requiresRubric:string[]}}
 */
export function scoreQuiz(questions, answers = {}, rubricPointsById = {}) {
  const perQuestion = [];
  let awarded = 0;
  let max = 0;
  const criticalFails = [];
  const requiresRubric = [];

  for (const q of questions) {
    const r = scoreQuestion(q, answers[q.id], { rubricPoints: rubricPointsById[q.id] });
    awarded += r.awarded;
    max += r.max;
    if (r.isCriticalFail) criticalFails.push(q.id);
    if (r.requiresRubric) requiresRubric.push(q.id);
    perQuestion.push({ id: q.id, module: q.module, ...r });
  }

  const scorePct = max > 0 ? round2((awarded / max) * 100) : 0;
  return { awarded: round2(awarded), max: round2(max), scorePct, perQuestion, criticalFails, requiresRubric };
}
