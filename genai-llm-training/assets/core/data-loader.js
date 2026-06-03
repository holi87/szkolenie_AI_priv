// data-loader.js — ładowanie i scalanie kontraktów danych (issue #14/#16).
// Czysta funkcja scalania (mergeQuestionBank) jest testowalna w Node bez sieci.
// loadTrainingData to cienki wrapper na fetch() — ścieżki WZGLĘDNE (wymóg GitHub Pages, ADR-0002).

/** Shardy banku pytań: data/questions/m01.json … m12.json (po jednym na moduł). */
export const QUESTION_SHARDS = Array.from({ length: 12 }, (_, i) => `m${String(i + 1).padStart(2, "0")}.json`);

/**
 * Scala shardy { questions: [...] } w jedną płaską tablicę pytań.
 * Wykrywa duplikaty id (konserwatywnie — rzuca, bo scoring zależy od unikalności).
 * @param {object[]} shardObjects - sparsowane obiekty plików mNN.json
 * @returns {object[]} płaski bank pytań
 */
export function mergeQuestionBank(shardObjects) {
  const bank = [];
  const seen = new Set();
  for (const shard of shardObjects) {
    const qs = (shard && shard.questions) || [];
    for (const q of qs) {
      if (seen.has(q.id)) throw new Error(`Duplikat id pytania: ${q.id}`);
      seen.add(q.id);
      bank.push(q);
    }
  }
  return bank;
}

/** Zwraca pytania danego modułu, posortowane po id (stabilna kolejność puli quizu). */
export function questionsForModule(bank, moduleId) {
  return bank.filter((q) => q.module === moduleId).sort((a, b) => a.id.localeCompare(b.id));
}

async function fetchJson(url, fetchImpl) {
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`Nie udało się załadować ${url}: HTTP ${res.status}`);
  return res.json();
}

/**
 * Ładuje wszystkie dane szkolenia przez fetch (przeglądarka / serwer statyczny).
 * @param {object} [opts]
 * @param {string} [opts.basePath="data/"] - WZGLĘDNA baza do data/ (działa z podścieżki Pages)
 * @param {Function} [opts.fetchImpl=fetch] - wstrzykiwalny fetch (testowalność)
 * @returns {Promise<{modules, paths, rubrics, scenarios, questions}>}
 */
export async function loadTrainingData(opts = {}) {
  const base = opts.basePath || "data/";
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== "function") throw new Error("Brak fetch — podaj opts.fetchImpl");

  const [modules, paths, rubrics, scenarios, ...shards] = await Promise.all([
    fetchJson(`${base}modules.json`, fetchImpl),
    fetchJson(`${base}paths.json`, fetchImpl),
    fetchJson(`${base}rubrics.json`, fetchImpl),
    fetchJson(`${base}scenarios.json`, fetchImpl),
    ...QUESTION_SHARDS.map((f) => fetchJson(`${base}questions/${f}`, fetchImpl)),
  ]);

  return { modules, paths, rubrics, scenarios, questions: mergeQuestionBank(shards) };
}
