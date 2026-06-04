// index.js — dyspozytor oceny interakcji modułowych (issue #20-#23).
// Trzy generyczne typy (kind) pokrywają 12 interakcji z wymagania/08:
//   classify — przypisz elementy do kategorii (M1, M4, M9, M10, M11)
//   rubric   — kryteria spełnione wyborem opcji (M6, M7, M8, M12); może zasilać zadanie praktyczne
//   tune     — strojenie parametrów + scorowany checkpoint (M2, M3, M5)
import { evaluateClassify } from "./classify.js";
import { evaluateRubric } from "./rubric.js";
import { evaluateTune } from "./tune.js";
import { evaluateMaturityCheck } from "./maturity-check.js";

const EVALUATORS = { classify: evaluateClassify, rubric: evaluateRubric, tune: evaluateTune, "maturity-check": evaluateMaturityCheck };

/** Ocena interakcji wg config.kind. Nieznany kind → błąd (nie przepuszczać po cichu — konserwatywnie). */
export function evaluateInteraction(config, response) {
  const fn = EVALUATORS[config && config.kind];
  if (!fn) throw new Error(`Nieznany typ interakcji: ${config && config.kind}`);
  return fn(config, response);
}

export { evaluateClassify, evaluateRubric, evaluateTune, evaluateMaturityCheck };
