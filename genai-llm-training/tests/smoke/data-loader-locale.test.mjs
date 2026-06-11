// data-loader-locale.test.mjs — układ per-locale (#78). Guard: (1) loader czyta data/pl/ + wspólną
// strukturę bez 404 (ścieżki loadera == układ na dysku), (2) merge etykiet odtwarza kształt sprzed carve
// (brak utraty danych modules/paths — deep-equal do snapshotu), (3) brak locale => reject (Promise.all).
// Pure Node (fs) — fetch wstrzyknięty jako odczyt z dysku.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadTrainingData } from "../../assets/core/data-loader.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "..", "..", "data");
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

// fetch dyskowy: URL == ścieżka pliku. ok:false dla braku (jak HTTP 404 -> ujawnia rozjazd ścieżek).
function diskFetch(url) {
  if (!existsSync(url)) return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
  return Promise.resolve({ ok: true, status: 200, json: async () => readJson(url) });
}

test("loader czyta układ per-locale (pl) bez 404 — ścieżki loadera == układ na dysku", async () => {
  const data = await loadTrainingData({ basePath: `${DATA}/`, locale: "pl", fetchImpl: diskFetch });
  assert.equal(data.questions.length, 152, "kompletny bank z data/pl/questions/ (#171: 116 rdzenia + 36 P2)");
  assert.equal(Object.keys(data.moduleContent).length, 30, "12 kursu + MSHP/MSHO + MSK1-4 + MB1-6 (P2) + MD1-6 (P1) z data/pl/module-content/ (#171)");
  assert.equal(data.modules.modules.length, 30);
  assert.ok(data.scenarios && data.scenarios.scenarios, "scenariusze z data/pl/");
  assert.ok(data.rubrics && data.rubrics.rubrics, "rubryki z data/pl/");
});

test("merge etykiet == snapshot sprzed carve (modules/paths bez utraty danych)", async () => {
  const data = await loadTrainingData({ basePath: `${DATA}/`, locale: "pl", fetchImpl: diskFetch });
  const modulesSnap = readJson(join(HERE, "_snapshots", "modules-merged.json"));
  const pathsSnap = readJson(join(HERE, "_snapshots", "paths-merged.json"));
  assert.deepEqual(data.modules, modulesSnap, "zmergowane modules != oryginał sprzed carve (utrata/zmiana pola)");
  assert.deepEqual(data.paths, pathsSnap, "zmergowane paths != oryginał sprzed carve (utrata/zmiana pola)");
});

test("każdy moduł po merge ma name/level/keyConcepts/learningOutcomes; każda ścieżka name/assumedPathTime", async () => {
  const data = await loadTrainingData({ basePath: `${DATA}/`, locale: "pl", fetchImpl: diskFetch });
  for (const m of data.modules.modules) {
    // Moduł diagnostyczny (MSH, M14/ADR-0008) nie ma puli pytań → bez questionRange. Reszta pól obowiązuje wszystkich.
    const keys = m.scope === "diagnostic"
      ? ["name", "level", "interactiveElement", "keyConcepts", "learningOutcomes", "pillar", "order"]
      : ["name", "level", "interactiveElement", "keyConcepts", "learningOutcomes", "questionRange", "pillar", "order"];
    for (const k of keys) {
      assert.ok(m[k] != null, `${m.id}: brak ${k} po merge`);
    }
  }
  for (const [id, p] of Object.entries(data.paths.paths)) {
    assert.ok(p.name && p.assumedPathTime, `${id}: brak name/assumedPathTime po merge`);
    // Ścieżka FORMATYWNA (S4, M15/ADR-0009) nie ma bramek/testu — gates istnieją tylko dla ścieżek z testem.
    if (!p.formative) assert.ok(Array.isArray(p.gates), `${id}: utracono gates (single-source)`);
  }
});

test("brakujące locale => loader rzuca (Promise.all reject) — fundament wymaga kompletu", async () => {
  await assert.rejects(loadTrainingData({ basePath: `${DATA}/`, locale: "nieistnieje", fetchImpl: diskFetch }));
});
