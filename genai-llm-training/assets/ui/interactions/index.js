// index.js — registry rendererów interakcji (kind → renderer). Zwracają wspólny kontrakt:
// { node, getResponse(), showFeedback(result), focusFirst() }. app.js spina to z evaluateInteraction (core).
import { renderClassify } from "./classify-view.js";
import { renderRubric } from "./rubric-view.js";
import { renderTune } from "./tune-view.js";
import { renderMaturityCheck } from "./maturity-check-view.js";

const RENDERERS = { classify: renderClassify, rubric: renderRubric, tune: renderTune, "maturity-check": renderMaturityCheck };

/** Renderuje interakcję wg config.kind. opts (np. { rng } dla classify, #123) przekazywane do renderera.
 * Nieznany kind → błąd (spójnie z evaluateInteraction). */
export function renderInteraction(config, opts = {}) {
  const fn = RENDERERS[config && config.kind];
  if (!fn) throw new Error(`Nieznany typ interakcji (render): ${config && config.kind}`);
  return fn(config, opts);
}
