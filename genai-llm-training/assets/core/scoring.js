// scoring.js — scoring testu końcowego i bramek zaliczenia ścieżki (issue #18).
// Pure logic, zero DOM. Bramki z paths.json (gates[]). Wagi wyniku ścieżki: quiz 30 / test 60 / praktyka 10.
// Konserwatywnie (AGENTS): gdy brak danych dla bramki (np. niezłożone zadanie praktyczne) → bramka NIE zdana.

import { scoreQuiz } from "./quiz-engine.js";
import { getPath } from "./paths.js";

const round2 = (n) => Math.round(n * 100) / 100;

// Wagi wyniku ścieżki (wymagania/07): quiz inline 30% / test końcowy 60% / zadanie praktyczne 10%.
const DEFAULT_WEIGHTS = { inlineQuiz: 0.3, finalTest: 0.6, practicalTask: 0.1 };

/** Średni procent z ocen zadań praktycznych (score/maxScore). null gdy brak ocen. */
function practicalAvgPct(practicalResults) {
  const withMax = (practicalResults || []).filter((r) => r && typeof r.score === "number" && r.maxScore);
  if (withMax.length === 0) return null;
  return round2(withMax.reduce((a, r) => a + (r.score / r.maxScore) * 100, 0) / withMax.length);
}

/**
 * Ważony wynik ścieżki. Wagi renormalizowane do komponentów stosowanych w ścieżce
 * (S1 nie ma zadania praktycznego). Komponent stosowany, ale bez danych (np. quiz inline
 * nierozwiązany albo niezłożona praktyka) liczy się jako 0 — konserwatywnie (AGENTS).
 */
function weightedPathPct(finalTestPct, inlineQuizPct, practicalPct, hasPractical, weights) {
  const comps = [
    { w: weights.inlineQuiz, pct: inlineQuizPct },
    { w: weights.finalTest, pct: finalTestPct },
  ];
  if (hasPractical) comps.push({ w: weights.practicalTask, pct: practicalPct });
  const wsum = comps.reduce((a, c) => a + c.w, 0);
  if (wsum === 0) return 0;
  return round2(comps.reduce((a, c) => a + (c.w / wsum) * (typeof c.pct === "number" ? c.pct : 0), 0));
}

/** Wynik per moduł z listy ocen pytań (perQuestion ze scoreQuiz). */
function perModuleScores(perQuestion) {
  const acc = {};
  for (const r of perQuestion) {
    const m = (acc[r.module] = acc[r.module] || { awarded: 0, max: 0 });
    m.awarded += r.awarded;
    m.max += r.max;
  }
  const out = {};
  for (const [mod, v] of Object.entries(acc)) out[mod] = { ...v, pct: v.max > 0 ? round2((v.awarded / v.max) * 100) : 0 };
  return out;
}

function findPractical(practicalResults, rubricId) {
  return (practicalResults || []).find((r) => r.rubric === rubricId) || null;
}

/** Ocena pojedynczej bramki. Zwraca { ...gate, passed, detail }. */
function evalGate(gate, ctx) {
  const { scorePct, criticalCorrectPct, practicalResults } = ctx;
  switch (gate.type) {
    case "overallThreshold":
      return { ...gate, passed: scorePct >= gate.minPct, detail: `wynik ${scorePct}% / próg ${gate.minPct}%` };
    case "criticalQuestions": {
      const passed = criticalCorrectPct >= gate.minPct;
      return { ...gate, passed, detail: `krytyczne ${criticalCorrectPct}% / wymagane ${gate.minPct}%` };
    }
    case "practicalTask": {
      const r = findPractical(practicalResults, gate.rubric);
      const passed = r != null && typeof r.score === "number" && r.score >= gate.minScore;
      return { ...gate, passed, detail: r ? `${r.score}/${gate.maxScore ?? r.maxScore}` : "brak oceny zadania" };
    }
    case "moduleMinScore": {
      const r = findPractical(practicalResults, gate.rubric);
      const pct = r && r.maxScore ? round2((r.score / r.maxScore) * 100) : null;
      const passed = pct != null && pct >= gate.minPct;
      return { ...gate, passed, detail: pct == null ? "brak oceny zadania" : `${pct}% / wymagane ${gate.minPct}%` };
    }
    default:
      // Nieznana bramka — konserwatywnie traktowana jako niespełniona (nie przepuszczać po cichu).
      return { ...gate, passed: false, detail: "nieznany typ bramki" };
  }
}

/**
 * Liczy wynik testu końcowego i status zaliczenia ścieżki.
 * @param {string} pathId
 * @param {object[]} testQuestions - pytania wylosowane przez selectFinalTest
 * @param {object} answers - mapa { [questionId]: answer }
 * @param {object} pathsData - data/paths.json
 * @param {object} [opts]
 * @param {object[]} [opts.practicalResults] - [{ rubric, score, maxScore, passed }]
 * @param {object} [opts.rubricPointsById] - oceny rubryk dla analiza_outputu
 * @returns {{pathId, scorePct, awarded, max, passed, criticalPassed, gates, weakModules, perModule, criticalFails}}
 */
export function scorePath(pathId, testQuestions, answers, pathsData, opts = {}) {
  const path = getPath(pathsData, pathId);
  const weights = opts.weights || DEFAULT_WEIGHTS;
  const quiz = scoreQuiz(testQuestions, answers, opts.rubricPointsById || {});
  const finalTestPct = quiz.scorePct;

  const criticals = testQuestions.filter((q) => q.isCritical);
  const criticalCorrect = criticals.length - quiz.criticalFails.length;
  const criticalCorrectPct = criticals.length > 0 ? round2((criticalCorrect / criticals.length) * 100) : 100;

  // Wynik ścieżki = ważona kompozycja quiz inline / test / praktyka (nie sam test końcowy).
  const hasPractical = (path.practicalTasks || 0) > 0;
  const practicalPct = practicalAvgPct(opts.practicalResults);
  const inlineQuizPct = typeof opts.inlineQuizPct === "number" ? opts.inlineQuizPct : null;
  const pathScorePct = weightedPathPct(finalTestPct, inlineQuizPct, practicalPct, hasPractical, weights);

  const ctx = { scorePct: pathScorePct, criticalCorrectPct, practicalResults: opts.practicalResults };
  const gates = (path.gates || []).map((g) => evalGate(g, ctx));
  const passed = gates.length > 0 && gates.every((g) => g.passed);

  const perModule = perModuleScores(quiz.perQuestion);
  const weakModules = Object.entries(perModule)
    .filter(([, v]) => v.pct < path.passThresholdPct)
    .sort((a, b) => a[1].pct - b[1].pct)
    .map(([mod, v]) => ({ module: mod, pct: v.pct }));

  return {
    pathId,
    scorePct: pathScorePct, // ważony wynik ścieżki (certyfikat)
    finalTestPct, // sam test końcowy
    inlineQuizPct,
    practicalPct,
    awarded: quiz.awarded,
    max: quiz.max,
    passed,
    criticalPassed: criticalCorrectPct >= (path.criticalQuestionsRequiredPct ?? 100),
    gates,
    weakModules,
    perModule,
    criticalFails: quiz.criticalFails,
    // Per-pytanie testu końcowego (sygnał kalibracyjny #28 — obejmuje pytania spoza puli quizu inline, w tym golden).
    questionResults: quiz.perQuestion.map((r) => ({ questionId: r.id, module: r.module, correct: r.isCorrect === true })),
  };
}
