// tune.js — ocena interakcji typu "strojenie parametrów". Uczestnik zmienia parametry i obserwuje
// AUTORSKIE efekty (treść w danych, nie obliczenia), a potem odpowiada na scorowany checkpoint.
// Evaluator ocenia WYŁĄCZNIE checkpoint — to utrzymuje silnik mały i testowalny; symulacja outputu
// żyje w danych (controls[].levels[].effect). M2 (licznik kontekstu), M3 (suwaki generacji), M5 (retrieval debugger).

/**
 * @param {object} config - { controls:[...], checkpoint:{ type:"single_choice"|"multiple_choice", options, correct:[...] } }
 * @param {object} response - { checkpoint: answer }  (answer: optionId | [optionId...] wg typu checkpointu)
 * @returns {{kind,score,max,pct,passed,complete,checkpointCorrect,summary}}
 */
export function evaluateTune(config, response = {}) {
  const cp = (config && config.checkpoint) || {};
  const ans = response.checkpoint;
  const multiple = cp.type === "multiple_choice";
  const correct = cp.correct || [];
  const complete = multiple ? Array.isArray(ans) && ans.length > 0 : ans != null && ans !== "";
  const ok = multiple
    ? Array.isArray(ans) && ans.length === correct.length && correct.every((c) => ans.includes(c))
    : correct.length === 1 && ans === correct[0];
  return {
    kind: "tune", score: ok ? 1 : 0, max: 1, pct: ok ? 100 : 0, passed: ok, complete,
    checkpointCorrect: ok, summary: ok ? "Checkpoint: poprawnie" : "Checkpoint: jeszcze nie",
  };
}
