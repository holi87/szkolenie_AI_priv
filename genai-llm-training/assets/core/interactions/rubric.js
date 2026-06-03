// rubric.js — ocena interakcji typu "rubryka": każde kryterium spełnione przez wybór właściwych opcji.
// Pure logic, zero DOM. M6 (RAG, R2-rag), M7 (prompt clinic, R1-prompt), M8 (QA workbench, R4),
// M12 (judge calibration, R3-eval). Gdy interakcja zasila zadanie praktyczne (config.rubricId +
// config.recordsPractical), app.js zapisuje wynik przez recordPracticalTask, a scoring ścieżki go konsumuje.

/** Zbiory równe (kolejność bez znaczenia). */
function setEq(a, b) {
  const A = new Set(a || []);
  const B = new Set(b || []);
  return A.size === B.size && [...A].every((x) => B.has(x));
}

/**
 * Kryterium spełnione, gdy zaznaczony zbiór == correctOptionIds DOKŁADNIE.
 * Równość (nie podzbiór) jest anti-gaming: zaznaczenie wszystkich opcji nie zalicza, bo dystraktory psują równość.
 * @param {object} config - { scaleMax?, passThreshold?, criteria:[{id,name,options,correctOptionIds,points?,hint?}] }
 * @param {object} response - { [criterionId]: [optionId...] }
 * @returns {{kind,score,max,pct,passed,perCriterion,failedCriteria,summary}}
 */
export function evaluateRubric(config, response = {}) {
  const criteria = (config && config.criteria) || [];
  const max = typeof config.scaleMax === "number" ? config.scaleMax : criteria.reduce((a, c) => a + (c.points || 1), 0);
  const perCriterion = criteria.map((c) => {
    const selected = response[c.id] || [];
    const satisfied = setEq(selected, c.correctOptionIds || []);
    return { id: c.id, name: c.name, points: c.points || 1, satisfied, selected, hint: c.hint };
  });
  const score = perCriterion.filter((c) => c.satisfied).reduce((a, c) => a + c.points, 0);
  const pct = max > 0 ? Math.round((score / max) * 10000) / 100 : 0;
  const threshold = config.passThreshold;
  // passed=null dla rubryk ćwiczeniowych (brak progu) — UI traktuje to jako feedback, nie zaliczenie.
  const passed = typeof threshold === "number" ? score >= threshold : null;
  const failedCriteria = perCriterion.filter((c) => !c.satisfied).map((c) => c.name);
  return {
    kind: "rubric", score, max, pct, passed, perCriterion, failedCriteria,
    summary: `Wynik: ${score}/${max}${threshold != null ? ` (próg ${threshold})` : ""}`,
  };
}
