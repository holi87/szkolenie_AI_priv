// paths.test.mjs — macierz ścieżek i gating modułów (issue #15).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  pathModuleList,
  requiredModules,
  pathCompletionBlockers,
  isFinalTestUnlocked,
  finalTestStatus,
  moduleStatus,
  requiredPracticalRubrics,
  missingPracticalRubrics,
  pathVisibleModuleIds,
} from "../../assets/core/paths.js";
import { pathsData, modulesData } from "./_fixtures.mjs";

const progressWith = (completed = [], practicalTasks = []) => ({
  modules: Object.fromEntries(completed.map((id) => [id, { status: "completed" }])),
  practicalTasks,
});

test("pathModuleList: 30 modułów (#171: 12 kursu + MSHP/MSHO + 4 MSK + 6 MB + 6 MD) w kolejności, flagi required zgodne z paths.json", () => {
  for (const pathId of ["S1", "S2", "S3"]) {
    const list = pathModuleList(pathsData, modulesData, pathId, progressWith());
    assert.equal(list.length, 30);
    assert.deepEqual(list.map((m) => m.order), [...list.map((m) => m.order)].sort((a, b) => a - b));
    const req = new Set(requiredModules(pathsData, pathId));
    for (const m of list) assert.equal(m.required, req.has(m.id), `${pathId}/${m.id} required mismatch`);
  }
});

test("S3 ma 12 modułów wymaganych; S1 ma podzbiór (5)", () => {
  assert.equal(requiredModules(pathsData, "S3").length, 12);
  assert.deepEqual(requiredModules(pathsData, "S1"), ["M1", "M2", "M7", "M10", "M11"]);
});

test("moduleStatus: completed / in_progress / available", () => {
  const p = { modules: { M1: { status: "completed" }, M2: { status: "in_progress" } } };
  assert.equal(moduleStatus(p, "M1"), "completed");
  assert.equal(moduleStatus(p, "M2"), "in_progress");
  assert.equal(moduleStatus(p, "M9"), "available", "brak wpisu → available (self-paced)");
});

test("test końcowy ZABLOKOWANY dopóki nie ukończono wszystkich modułów wymaganych", () => {
  const path = "S1";
  const req = requiredModules(pathsData, path); // M1,M2,M7,M10,M11
  // pusty progres → wszystkie wymagane to blokery
  assert.deepEqual(pathCompletionBlockers(progressWith(), pathsData, path), req);
  assert.equal(isFinalTestUnlocked(progressWith(), pathsData, path), false);
  assert.equal(finalTestStatus(progressWith(), pathsData, path).status, "locked");
});

test("pominięcie JEDNEGO wymaganego modułu wciąż blokuje test (nie da się zaliczyć z pominięciem)", () => {
  const path = "S1";
  const allButOne = requiredModules(pathsData, path).slice(0, -1); // brak M11
  const st = finalTestStatus(progressWith(allButOne), pathsData, path);
  assert.equal(st.status, "locked");
  assert.deepEqual(st.blockers, ["M11"]); // dane strukturalne (locale-neutral); tekst składa UI przez t()
  assert.deepEqual(st.missingPractical, []);
});

test("ukończenie wszystkich wymaganych → test odblokowany (S1 nie ma zadań praktycznych)", () => {
  const path = "S1";
  const p = progressWith(requiredModules(pathsData, path)); // tylko wymagane, bez opcjonalnych
  assert.deepEqual(pathCompletionBlockers(p, pathsData, path), []);
  assert.deepEqual(requiredPracticalRubrics(pathsData, path), [], "S1 bez zadań praktycznych");
  assert.equal(isFinalTestUnlocked(p, pathsData, path), true);
  assert.equal(finalTestStatus(p, pathsData, path).status, "available");
});

test("rubryki praktyczne wymagane: S1 [], S2 [R1-prompt], S3 [R2-rag, R3-eval]", () => {
  assert.deepEqual(requiredPracticalRubrics(pathsData, "S1"), []);
  assert.deepEqual(requiredPracticalRubrics(pathsData, "S2"), ["R1-prompt"]);
  assert.deepEqual(requiredPracticalRubrics(pathsData, "S3").sort(), ["R2-rag", "R3-eval"]);
});

test("S2: moduły wymagane done, ale BEZ zapisanej praktyki R1-prompt → test ZABLOKOWANY (nie marnuj podejść)", () => {
  const p = progressWith(requiredModules(pathsData, "S2")); // brak practicalTasks
  assert.deepEqual(pathCompletionBlockers(p, pathsData, "S2"), [], "moduły ukończone");
  assert.deepEqual(missingPracticalRubrics(p, pathsData, "S2"), ["R1-prompt"]);
  assert.equal(isFinalTestUnlocked(p, pathsData, "S2"), false, "brak praktyki blokuje test");
  const st = finalTestStatus(p, pathsData, "S2");
  assert.equal(st.status, "locked");
  assert.deepEqual(st.missingPractical, ["R1-prompt"]); // dane strukturalne; tekst powodu składa shell.js przez t()
});

test("S2: po zapisaniu R1-prompt → test odblokowany", () => {
  const p = progressWith(requiredModules(pathsData, "S2"), [{ rubric: "R1-prompt", score: 4, maxScore: 5 }]);
  assert.deepEqual(missingPracticalRubrics(p, pathsData, "S2"), []);
  assert.equal(isFinalTestUnlocked(p, pathsData, "S2"), true);
});

test("praktyka zapisana PONIŻEJ progu nadal blokuje test (nie marnuj podejść na pewną porażkę bramki)", () => {
  // S2: R1-prompt 2/5 < próg 4
  const s2low = progressWith(requiredModules(pathsData, "S2"), [{ rubric: "R1-prompt", score: 2, maxScore: 5 }]);
  assert.deepEqual(missingPracticalRubrics(s2low, pathsData, "S2"), ["R1-prompt"]);
  assert.equal(isFinalTestUnlocked(s2low, pathsData, "S2"), false);
  // S3: R2-rag 3/5 = 60% < 70%
  const s3low = progressWith(requiredModules(pathsData, "S3"), [
    { rubric: "R2-rag", score: 3, maxScore: 5 },
    { rubric: "R3-eval", score: 4, maxScore: 5 },
  ]);
  assert.deepEqual(missingPracticalRubrics(s3low, pathsData, "S3"), ["R2-rag"]);
  assert.equal(isFinalTestUnlocked(s3low, pathsData, "S3"), false);
});

test("S3: wymaga zapisanych R2-rag i R3-eval; brak choćby jednej → zablokowany", () => {
  const reqMods = requiredModules(pathsData, "S3");
  const onlyOne = progressWith(reqMods, [{ rubric: "R2-rag", score: 4, maxScore: 5 }]);
  assert.deepEqual(missingPracticalRubrics(onlyOne, pathsData, "S3"), ["R3-eval"]);
  assert.equal(isFinalTestUnlocked(onlyOne, pathsData, "S3"), false);
  const both = progressWith(reqMods, [{ rubric: "R2-rag", score: 4, maxScore: 5 }, { rubric: "R3-eval", score: 4, maxScore: 5 }]);
  assert.equal(isFinalTestUnlocked(both, pathsData, "S3"), true);
});

// ---------------- M14→M15→M16 (#106/#115/#122): moduły diagnostyczne MSHP/MSHO (Skala Holaka) — non-gating ----------------
// M16/#122: diagnoza MSH rozdzielona na MSHP (osoba v2.1p) + MSHO (organizacja v2.1e), obie w ścieżce formatywnej S4.
// Mechanika (non-gating, neutralność) bez zmian — zmienia się tylko liczba modułów diagnostycznych. Non-gating dla
// S1/S2/S3 nadal musi zachodzić, a widoczność MSHP/MSHO jest w S4 (wraz z 4 modułami szkoleniowymi MSK).

test("MSHP/MSHO NIEWRAŻLIWE na gating (#106/#122): isFinalTestUnlocked bez zmian niezależnie od ich statusu; nigdy blokerem", () => {
  const practicalsByPath = {
    S1: [],
    S2: [{ rubric: "R1-prompt", score: 5, maxScore: 5 }],
    S3: [{ rubric: "R2-rag", score: 5, maxScore: 5 }, { rubric: "R3-eval", score: 5, maxScore: 5 }],
  };
  for (const pathId of ["S1", "S2", "S3"]) {
    const req = requiredModules(pathsData, pathId);
    const practicals = practicalsByPath[pathId];
    const baseline = isFinalTestUnlocked(progressWith(req, practicals), pathsData, pathId);
    const withDiag = isFinalTestUnlocked(progressWith([...req, "MSHP", "MSHO"], practicals), pathsData, pathId);
    assert.equal(baseline, true, `${pathId}: wymagane + praktyki → odblokowany (kontrola odniesienia)`);
    assert.equal(withDiag, baseline, `${pathId}: ukończenie/pominięcie MSHP/MSHO NIE może zmieniać odblokowania testu`);
    const blockers = pathCompletionBlockers(progressWith(req, practicals), pathsData, pathId);
    for (const id of ["MSHP", "MSHO"]) assert.ok(!blockers.includes(id), `${pathId}: ${id} nie może być blokerem zaliczenia`);
  }
});

test("D3 (#115/#122): MSHP+MSHO w S4 — widoczne z modułami MSK, NIEOBECNE w persona-set S1/S2/S3", () => {
  // S4 (formatywna): MSHP + MSHO (2 diagnozy) + 4 moduły szkoleniowe MSK widoczne (variant != opcjonalny); moduły kursu poza S4.
  const s4 = pathVisibleModuleIds(pathsData, "S4");
  for (const id of ["MSHP", "MSHO"]) assert.ok(s4.has(id), `S4: ${id} (diagnoza) widoczny`);
  for (const id of ["MSK1", "MSK2", "MSK3", "MSK4"]) assert.ok(s4.has(id), `S4: ${id} widoczny (szkolenie)`);
  for (const id of ["M1", "M6", "M12"]) assert.ok(!s4.has(id), `S4: moduł kursu ${id} NIE należy do ścieżki formatywnej`);
  // S1/S2/S3: diagnozy w S4 i nigdy nie były wymagane.
  for (const pathId of ["S1", "S2", "S3"]) {
    for (const id of ["MSHP", "MSHO"]) {
      assert.ok(!pathVisibleModuleIds(pathsData, pathId).has(id), `${pathId}: ${id} w S4 (nieobecny w persona-set)`);
      assert.ok(!requiredModules(pathsData, pathId).includes(id), `${pathId}: ${id} poza requiredModules`);
    }
  }
});
