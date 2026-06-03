// classify.js — ocena interakcji typu "klasyfikacja": przypisz każdy element do jednej kategorii (M4).
// Pure logic, zero DOM (testowalne w node:test). Używane przez: M1 (klasyfikator zadań),
// M4 (mapa semantyczna — trafny vs podobny-ale-błędny), M9 (agent permission board),
// M10 (data safety gate), M11 (output verifier). Render i alternatywa klawiaturowa: ui/interactions/classify-view.js.

/**
 * Ocena klasyfikacji elementów do kategorii względem klucza.
 * @param {object} config - { items:[{id,text,correctCategory,rationale}], categories:[{id,label}], passPct? }
 * @param {object} response - mapa { [itemId]: categoryId }; brak klucza = element nieprzypisany.
 * @returns {{kind,score,max,pct,passed,complete,perItem,hardCategories,summary}}
 */
export function evaluateClassify(config, response = {}) {
  const items = (config && config.items) || [];
  const max = items.length;
  const perItem = items.map((it) => {
    const chosen = response[it.id] ?? null;
    const isCorrect = chosen != null && chosen === it.correctCategory;
    return { id: it.id, text: it.text, chosen, correct: it.correctCategory, isCorrect, rationale: it.rationale };
  });
  const score = perItem.filter((r) => r.isCorrect).length;
  const complete = perItem.every((r) => r.chosen != null);
  const pct = max > 0 ? Math.round((score / max) * 10000) / 100 : 0;
  // Domyślnie wymagamy kompletu poprawnych (konserwatywnie, AGENTS) — chyba że treść zezwoli na próg.
  const passPct = typeof config.passPct === "number" ? config.passPct : 100;
  const passed = complete && pct >= passPct;
  // Kategorie z największą liczbą błędów — feedback zbiorczy „co powtórzyć".
  const byCat = {};
  for (const r of perItem) if (r.chosen != null && !r.isCorrect) byCat[r.correct] = (byCat[r.correct] || 0) + 1;
  const hardCategories = Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([c]) => c);
  return { kind: "classify", score, max, pct, passed, complete, perItem, hardCategories, summary: `Trafienia: ${score}/${max}` };
}
