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
} from "../../assets/core/paths.js";
import { pathsData, modulesData } from "./_fixtures.mjs";

const progressWith = (completed = []) => ({
  modules: Object.fromEntries(completed.map((id) => [id, { status: "completed" }])),
});

test("pathModuleList: 12 modułów w kolejności, flagi required zgodne z paths.json", () => {
  for (const pathId of ["S1", "S2", "S3"]) {
    const list = pathModuleList(pathsData, modulesData, pathId, progressWith());
    assert.equal(list.length, 12);
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
  assert.deepEqual(st.blockers, ["M11"]);
  assert.ok(st.lockedReason.includes("M11"));
});

test("ukończenie wszystkich wymaganych → test odblokowany (moduły opcjonalne nie blokują)", () => {
  const path = "S1";
  const p = progressWith(requiredModules(pathsData, path)); // tylko wymagane, bez opcjonalnych
  assert.deepEqual(pathCompletionBlockers(p, pathsData, path), []);
  assert.equal(isFinalTestUnlocked(p, pathsData, path), true);
  assert.equal(finalTestStatus(p, pathsData, path).status, "available");
});
