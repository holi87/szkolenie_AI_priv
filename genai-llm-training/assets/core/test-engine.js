// test-engine.js — losowanie testu końcowego ścieżki (issue #18).
// Pure logic, zero DOM. RNG wstrzykiwalny (domyślnie Math.random) — determinizm w testach.
// Reguły (wymagania/07 + paths.json), konserwatywnie (AGENTS):
//  - liczba pytań wg ścieżki: S1=25, S2=40, S3=55 (paths.json.finalTestQuestions),
//  - WSZYSTKIE pytania krytyczne ścieżki są wymuszone w teście (warunek gate 100% krytycznych),
//  - tylko pytania, których paths[] zawiera daną ścieżkę,
//  - rozkład trudności docelowo L1/L2/L3/L4 = 35/40/20/5; L4 tylko S3 (dla S1/S2 udział L4 → L2).

import { getPath } from "./paths.js";

const DIFFICULTY_MIX = { L1: 0.35, L2: 0.4, L3: 0.2, L4: 0.05 };

/** Fisher–Yates z wstrzykiwanym rng (czysty — nie mutuje wejścia). */
function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Docelowy rozkład trudności dla n pytań. Gdy ścieżka nie ma L4 (S1/S2), udział L4 trafia do L2.
 * Suma zawsze == n (reszta po zaokrągleniu korygowana na L2).
 */
export function difficultyTargets(n, hasL4) {
  const mix = { ...DIFFICULTY_MIX };
  if (!hasL4) {
    mix.L2 += mix.L4;
    mix.L4 = 0;
  }
  const t = { L1: Math.round(n * mix.L1), L2: Math.round(n * mix.L2), L3: Math.round(n * mix.L3), L4: Math.round(n * mix.L4) };
  const sum = t.L1 + t.L2 + t.L3 + t.L4;
  t.L2 += n - sum; // korekta zaokrągleń na największym koszyku
  return t;
}

function byDifficulty(list) {
  const g = { L1: [], L2: [], L3: [], L4: [] };
  for (const q of list) if (g[q.difficulty]) g[q.difficulty].push(q);
  return g;
}

/**
 * Losuje test końcowy dla ścieżki.
 * @param {object[]} questions - płaski bank pytań (mergeQuestionBank)
 * @param {object} pathsData - data/paths.json
 * @param {string} pathId - S1 | S2 | S3
 * @param {Function} [rng=Math.random] - generator [0,1)
 * @returns {{pathId:string, count:number, questions:object[], criticalIds:string[], difficultyCounts:object}}
 */
export function selectFinalTest(questions, pathsData, pathId, rng = Math.random) {
  const path = getPath(pathsData, pathId);
  const n = path.finalTestQuestions;
  const pool = questions.filter((q) => Array.isArray(q.paths) && q.paths.includes(pathId));

  // 1. Wymuś wszystkie pytania krytyczne ścieżki (warunek konieczny — nie mogą wypaść z losowania).
  const criticals = pool.filter((q) => q.isCritical);
  const selected = [...criticals];
  const selectedIds = new Set(selected.map((q) => q.id));

  // 2. Dobierz resztę wg rozkładu trudności, licząc już wybrane krytyczne do ich koszyków.
  const hasL4 = pool.some((q) => q.difficulty === "L4");
  const targets = difficultyTargets(n, hasL4);
  const remainingByDiff = byDifficulty(pool.filter((q) => !selectedIds.has(q.id)));

  for (const lvl of ["L1", "L2", "L3", "L4"]) {
    const already = selected.filter((q) => q.difficulty === lvl).length;
    const need = Math.max(0, targets[lvl] - already);
    for (const q of shuffle(remainingByDiff[lvl], rng).slice(0, need)) {
      selected.push(q);
      selectedIds.add(q.id);
    }
  }

  // 3. Uzupełnij do n z dowolnej trudności, gdy koszyki nie wypełniły liczby (np. niedobór w koszyku).
  if (selected.length < n) {
    const leftover = shuffle(pool.filter((q) => !selectedIds.has(q.id)), rng);
    for (const q of leftover) {
      if (selected.length >= n) break;
      selected.push(q);
      selectedIds.add(q.id);
    }
  }

  // 4. Gdy krytyczne + koszyki przekroczyły n, przytnij do n — ale NIGDY nie usuwaj krytycznych.
  let final = selected;
  if (selected.length > n) {
    const keepCritical = selected.filter((q) => q.isCritical);
    const trimmable = selected.filter((q) => !q.isCritical);
    final = [...keepCritical, ...trimmable].slice(0, Math.max(n, keepCritical.length));
  }

  // Wymieszaj kolejność prezentacji — żeby pytania krytyczne (na początku) nie były rozpoznawalne po pozycji.
  final = shuffle(final, rng);

  const difficultyCounts = { L1: 0, L2: 0, L3: 0, L4: 0 };
  for (const q of final) if (difficultyCounts[q.difficulty] != null) difficultyCounts[q.difficulty] += 1;

  return {
    pathId,
    count: final.length,
    questions: final,
    criticalIds: final.filter((q) => q.isCritical).map((q) => q.id),
    difficultyCounts,
  };
}
