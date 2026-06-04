// maturity-check.js — ocena autodiagnozy „Skala Holaka" (moduł MSH / M14, ADR-0008). Pure logic, zero DOM.
// KONSERWATYWNIE non-gating i NEUTRALNA: passed ZAWSZE null — nie da się jej „oblać" ani „zaliczyć",
// a UI renderuje wynik bez koloru pass/fail (app.js: passed===null → gałąź neutralna). Diagnozuje DWIE
// skale 0–11 (organizacja v2.1e + osoba v2.1p): poziom = liczba zaznaczonych zdań (clamp do max skali).
// Treść skal/zdań/band jest per-locale w data/<lang>/module-content/msh.json; tu liczymy tylko poziom + bandę.

/** Banda dla poziomu = pierwsza, której zakres [min,max] obejmuje level (lub null, gdy brak). */
function bandFor(scale, level) {
  return (scale.bands || []).find((b) => level >= b.min && level <= b.max) || null;
}

/**
 * @param {object} config - { scales: [{ id, label, max, statements:[{id,text}], bands:[{min,max,label,advice}] }] }
 * @param {object} response - mapa { [scaleId]: { [statementId]: true } } (zaznaczone zdania)
 * @returns {{kind, score, max, pct, passed, scales, summary}}
 */
export function evaluateMaturityCheck(config, response = {}) {
  const scales = (config && config.scales) || [];
  const perScale = scales.map((sc) => {
    const max = typeof sc.max === "number" ? sc.max : (sc.statements || []).length;
    const picked = response[sc.id] || {};
    const level = Math.min((sc.statements || []).filter((st) => picked[st.id]).length, max);
    return { id: sc.id, label: sc.label, level, max, band: bandFor(sc, level) };
  });
  const score = perScale.reduce((a, s) => a + s.level, 0);
  const max = perScale.reduce((a, s) => a + s.max, 0);
  const pct = max > 0 ? Math.round((score / max) * 10000) / 100 : 0;
  // passed=null: diagnoza, nie zaliczenie. summary językowo-neutralny (same poziomy) — pełny, lokalizowany
  // feedback per skala składa widok (ui/interactions/maturity-check-view.js) z band w msh.json.
  return {
    kind: "maturity-check", score, max, pct, passed: null, scales: perScale,
    summary: perScale.map((s) => `${s.level}/${s.max}`).join(" · "),
  };
}
