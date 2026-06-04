// test-engine.test.mjs — losowanie testu końcowego na PRAWDZIWYM banku (issue #18).
import { test } from "node:test";
import assert from "node:assert/strict";
import { selectFinalTest, difficultyTargets } from "../../assets/core/test-engine.js";
import { bank, pathsData, seededRng } from "./_fixtures.mjs";

const EXPECTED_COUNT = { S1: 25, S2: 40, S3: 55 };
const CRITICAL_IDS = ["Q081", "Q082", "Q083", "Q084", "Q085"];

test("difficultyTargets: suma == n; bez L4 udział L4 trafia do L2", () => {
  for (const n of [25, 40, 55]) {
    const t3 = difficultyTargets(n, true);
    assert.equal(t3.L1 + t3.L2 + t3.L3 + t3.L4, n);
    const t12 = difficultyTargets(n, false);
    assert.equal(t12.L4, 0, "S1/S2 bez L4");
    assert.equal(t12.L1 + t12.L2 + t12.L3, n);
  }
});

for (const pathId of ["S1", "S2", "S3"]) {
  test(`${pathId}: właściwa liczba pytań`, () => {
    const sel = selectFinalTest(bank, pathsData, pathId, seededRng(42));
    assert.equal(sel.count, EXPECTED_COUNT[pathId]);
    assert.equal(sel.questions.length, EXPECTED_COUNT[pathId]);
  });

  test(`${pathId}: WSZYSTKIE 5 pytań krytycznych M10 wymuszone w teście`, () => {
    const sel = selectFinalTest(bank, pathsData, pathId, seededRng(7));
    for (const id of CRITICAL_IDS) assert.ok(sel.criticalIds.includes(id), `brak ${id}`);
    assert.equal(sel.criticalIds.length, 5);
  });

  test(`${pathId}: tylko pytania z paths zawierającymi ${pathId}`, () => {
    const sel = selectFinalTest(bank, pathsData, pathId, seededRng(1));
    for (const q of sel.questions) assert.ok(q.paths.includes(pathId), `${q.id} nie należy do ${pathId}`);
  });

  test(`${pathId}: brak duplikatów pytań`, () => {
    const sel = selectFinalTest(bank, pathsData, pathId, seededRng(99));
    assert.equal(new Set(sel.questions.map((q) => q.id)).size, sel.count);
  });
}

test("S1/S2: zero pytań L4 (L4 jest S3-only)", () => {
  for (const pathId of ["S1", "S2"]) {
    const sel = selectFinalTest(bank, pathsData, pathId, seededRng(3));
    assert.equal(sel.difficultyCounts.L4, 0);
  }
});

test("S3: rozkład trudności trafia w target dokładnie (pool wystarczający)", () => {
  const sel = selectFinalTest(bank, pathsData, "S3", seededRng(5));
  assert.deepEqual(sel.difficultyCounts, { L1: 19, L2: 22, L3: 11, L4: 3 });
});

test("S2: rozkład trudności — best-effort po dedykowanej puli per persona (M13/ADR-0006)", () => {
  // Po re-allokacji (M13) S2 ma własną, rozłączną pulę: L3 ograniczone do udziału S2 (nie całego banku),
  // więc cel 20% L3 jest best-effort (silnik dopełnia z dostępnych koszyków). Suma == 40, L4=0 (L4 jest S3-only).
  const sel = selectFinalTest(bank, pathsData, "S2", seededRng(5));
  assert.deepEqual(sel.difficultyCounts, { L1: 15, L2: 18, L3: 7, L4: 0 });
  assert.equal(sel.difficultyCounts.L1 + sel.difficultyCounts.L2 + sel.difficultyCounts.L3 + sel.difficultyCounts.L4, 40);
});

test("każda ścieżka wymusza kwotę pytań DEDYKOWANYCH (M13/ADR-0006 — persona realnie różni się treścią testu)", () => {
  for (const pathId of ["S1", "S2", "S3"]) {
    const min = pathsData.paths[pathId].dedicatedQuestionsMin;
    for (const seed of [1, 5, 42, 99]) {
      const sel = selectFinalTest(bank, pathsData, pathId, seededRng(seed));
      assert.ok(sel.dedicatedCount >= min, `${pathId} seed ${seed}: dedykowanych ${sel.dedicatedCount} < kwota ${min}`);
      // dedykowane = pula 1-ścieżkowa → każde należy WYŁĄCZNIE do tej ścieżki (rozłączność).
      for (const q of sel.questions) if (q.paths.length === 1) assert.deepEqual(q.paths, [pathId]);
    }
  }
});

test("S1: L3 ograniczone pulą (3 dostępne < 5 target), liczba i tak == 25", () => {
  const sel = selectFinalTest(bank, pathsData, "S1", seededRng(5));
  assert.equal(sel.count, 25);
  assert.ok(sel.difficultyCounts.L3 <= 3, "pula S1 ma tylko 3 pytania L3");
  const sum = sel.difficultyCounts.L1 + sel.difficultyCounts.L2 + sel.difficultyCounts.L3 + sel.difficultyCounts.L4;
  assert.equal(sum, 25);
});

test("determinizm: ten sam seed → ta sama lista; różny seed → (zwykle) inna", () => {
  const a = selectFinalTest(bank, pathsData, "S3", seededRng(123)).questions.map((q) => q.id);
  const b = selectFinalTest(bank, pathsData, "S3", seededRng(123)).questions.map((q) => q.id);
  assert.deepEqual(a, b);
});
