// data-loader.js — ładowanie i scalanie kontraktów danych (issue #14/#16).
// Czysta funkcja scalania (mergeQuestionBank) jest testowalna w Node bez sieci.
// loadTrainingData to cienki wrapper na fetch() — ścieżki WZGLĘDNE (wymóg GitHub Pages, ADR-0002).

/** Shardy banku pytań: data/questions/m01.json … m12.json (po jednym na moduł). */
export const QUESTION_SHARDS = Array.from({ length: 12 }, (_, i) => `m${String(i + 1).padStart(2, "0")}.json`);

/** Shardy treści modułów: data/module-content/m01.json … m12.json + msh.json (moduł diagnostyczny Skali Holaka,
 * M14/ADR-0008) + msk1..msk4.json (moduły szkoleniowe ścieżki formatywnej S4, M15/ADR-0009 — treść + interakcje,
 * bez puli pytań). Wszystkie diagnostyczne (scope="diagnostic"): poza bankiem/golden/scoringiem. */
export const MODULE_CONTENT_SHARDS = [
  ...Array.from({ length: 12 }, (_, i) => `m${String(i + 1).padStart(2, "0")}.json`),
  "msh.json",
  ...Array.from({ length: 4 }, (_, i) => `msk${i + 1}.json`),
];

/** Scala pliki treści modułów w mapę { M1: {...}, … } po polu `module`. */
export function mergeModuleContent(contentObjects) {
  const map = {};
  for (const c of contentObjects) {
    if (c && c.module) map[c.module] = c;
  }
  return map;
}

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

/** Scala strukturę modułów (single-source) z etykietami per-locale po ID → kształt jak dawne modules.json. */
export function applyModuleLabels(modulesStruct, labels = {}) {
  return {
    ...modulesStruct,
    modules: (modulesStruct.modules || []).map((m) => ({ ...m, ...(labels[m.id] || {}) })),
  };
}

/** Scala strukturę ścieżek (single-source) z etykietami per-locale po ID → kształt jak dawne paths.json. */
export function applyPathLabels(pathsStruct, labels = {}) {
  const labelPaths = (labels && labels.paths) || {};
  const paths = {};
  for (const [id, p] of Object.entries(pathsStruct.paths || {})) paths[id] = { ...p, ...(labelPaths[id] || {}) };
  return { ...pathsStruct, paths };
}

async function fetchJson(url, fetchImpl) {
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`Nie udało się załadować ${url}: HTTP ${res.status}`);
  return res.json();
}

/**
 * Ładuje wszystkie dane szkolenia przez fetch (przeglądarka / serwer statyczny).
 * Układ per-locale (ADR-0004): struktura WSPÓLNA w `${base}` (modules.json/paths.json), treść i etykiety
 * w `${base}${locale}/`. Etykiety scalane po ID → kształt zwracany jak dawniej (UI bez zmian).
 * @param {object} [opts]
 * @param {string} [opts.basePath="data/"] - WZGLĘDNA baza danych (działa z podścieżki Pages)
 * @param {string} [opts.locale="pl"] - locale treści/etykiet (katalog `${base}${locale}/`)
 * @param {Function} [opts.fetchImpl=fetch] - wstrzykiwalny fetch (testowalność)
 * @returns {Promise<{modules, paths, rubrics, scenarios, questions, moduleContent}>}
 */
export async function loadTrainingData(opts = {}) {
  const base = opts.basePath || "data/";
  const locale = opts.locale || "pl";
  const loc = `${base}${locale}/`;
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== "function") throw new Error("Brak fetch — podaj opts.fetchImpl");

  // Wymagane: struktura (wspólna) + etykiety i treść (per-locale) + bank pytań.
  const [modulesStruct, pathsStruct, modulesLabels, pathsLabels, rubrics, scenarios, ...questionShards] = await Promise.all([
    fetchJson(`${base}modules.json`, fetchImpl),
    fetchJson(`${base}paths.json`, fetchImpl),
    fetchJson(`${loc}modules.labels.json`, fetchImpl),
    fetchJson(`${loc}paths.labels.json`, fetchImpl),
    fetchJson(`${loc}rubrics.json`, fetchImpl),
    fetchJson(`${loc}scenarios.json`, fetchImpl),
    ...QUESTION_SHARDS.map((f) => fetchJson(`${loc}questions/${f}`, fetchImpl)),
  ]);
  // Treść modułów jest TOLERANCYJNA: brak/niepoprawny plik nie wywala aplikacji — moduł dostaje fallback
  // (kluczowe pojęcia z etykiet modułów). Komplet 12 plików egzekwuje walidator danych (CI), nie runtime.
  const contentShards = await Promise.all(
    MODULE_CONTENT_SHARDS.map((f) => fetchJson(`${loc}module-content/${f}`, fetchImpl).catch(() => null)),
  );

  return {
    modules: applyModuleLabels(modulesStruct, modulesLabels),
    paths: applyPathLabels(pathsStruct, pathsLabels),
    rubrics, scenarios,
    questions: mergeQuestionBank(questionShards),
    moduleContent: mergeModuleContent(contentShards.filter(Boolean)),
  };
}
