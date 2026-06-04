// s4-formative.test.mjs — ścieżka FORMATYWNA S4 „Skala Holaka" (M15/ADR-0009). DOM-stub, strukturalnie (ADR-0002).
// Pokrywa specyfikę S4, której render-smoke nie dotyka (MODULE_IDS = tylko M1-M12): moduły szkoleniowe MSK1-4
// (treść + interakcja classify, pełny cykl render→evaluate→feedback), izolacja persona-setu S4 oraz brak testu
// końcowego w hubie i nav (finalTest=null). Diagnoza MSH (maturity-check) ma własny test (maturity-check-view).
import "./_dom-stub.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { serializeTree } from "./_snapshot.mjs";
import { queryAll } from "./_dom-stub.mjs";
import { pathsData, modulesData } from "./_fixtures.mjs"; // rejestruje katalogi i18n (pl/en)
import { isFormativePath, pathVisibleModuleIds, pathModuleList } from "../../assets/core/paths.js";
import { renderInteraction } from "../../assets/ui/interactions/index.js";
import { evaluateInteraction } from "../../assets/core/interactions/index.js";
import { renderScreens, renderSummary } from "../../assets/ui/module-view.js";
import { renderModuleHub } from "../../assets/ui/module-hub.js";
import { renderNav } from "../../assets/ui/shell.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const CDIR = join(HERE, "..", "..", "data", "pl", "module-content");
const readContent = (id) => JSON.parse(readFileSync(join(CDIR, `${id}.json`), "utf8"));
const MSK_IDS = ["msk1", "msk2", "msk3", "msk4"];

test("S4 jest ścieżką formatywną; persona-set = MSH + 4 MSK (moduły kursu M1-M12 wykluczone)", () => {
  assert.equal(isFormativePath(pathsData, "S4"), true, "S4 musi mieć formative:true");
  for (const pathId of ["S1", "S2", "S3"]) assert.equal(isFormativePath(pathsData, pathId), false, `${pathId} nie jest formatywna`);
  const vis = pathVisibleModuleIds(pathsData, "S4");
  assert.deepEqual([...vis].sort(), ["MSH", "MSK1", "MSK2", "MSK3", "MSK4"], "persona-set S4 = diagnoza + 4 moduły szkoleniowe");
  for (const id of ["M1", "M6", "M10", "M12"]) assert.ok(!vis.has(id), `moduł kursu ${id} poza ścieżką formatywną S4`);
});

test("MSK1-4: treść + interakcja classify renderują się i zaliczają pełny cykl (render→evaluate→feedback) bez wyjątku", () => {
  for (const id of MSK_IDS) {
    const c = readContent(id);
    assert.equal(c.interaction.kind, "classify", `${id}: moduł szkoleniowy S4 używa interakcji classify (non-practical)`);
    assert.ok(!c.interaction.recordsPractical, `${id}: interakcja NIE może być zadaniem praktycznym (S4 nie dotyka rubryk/bramek)`);
    // Integralność classify (jak walidator): correctCategory każdego itemu wskazuje istniejącą kategorię.
    const catIds = new Set(c.interaction.categories.map((k) => k.id));
    for (const it of c.interaction.items) assert.ok(catIds.has(it.correctCategory), `${id}: item ${it.id} correctCategory spoza categories`);

    const wrap = globalThis.document.createElement("div");
    for (const sec of renderScreens(c.screens, "S4")) wrap.appendChild(sec);
    if (c.summary) wrap.appendChild(renderSummary(c.summary));

    const view = renderInteraction(c.interaction);
    assert.ok(view.node, `${id}: interakcja bez node`);
    const result = evaluateInteraction(c.interaction, view.getResponse());
    assert.ok(result && typeof result.summary === "string", `${id}: brak wyniku interakcji`);
    view.showFeedback(result);
    view.focusFirst();
  }
});

test("hub S4 (finalTest=null): brak karty testu końcowego; nav S4: brak pozycji testu", () => {
  const modules = pathModuleList(pathsData, modulesData, "S4", { modules: {}, practicalTasks: [] })
    .filter((m) => pathVisibleModuleIds(pathsData, "S4").has(m.id))
    .map((m) => ({ id: m.id, name: m.name, status: m.status, required: m.required, pillar: "—", time: 30, quizPct: null }));

  const hub = renderModuleHub({
    pathId: "S4", pathName: "Skala Holaka — diagnoza i rozwój",
    intro: "Ścieżka formatywna — bez testu końcowego i certyfikatu.", nextStep: "Zacznij od autodiagnozy.",
    modules, finalTest: null, onSelectModule: () => {}, onSelectFinalTest: () => {},
  });
  assert.doesNotMatch(serializeTree(hub), /hub-card--final/, "hub formatywny nie może mieć karty testu końcowego");
  assert.match(hub.textContent || "", /bez testu końcowego/, "hub formatywny używa intro przekazanego (bez wzmianki o odblokowaniu testu)");
  assert.doesNotMatch(hub.textContent || "", /odblokuje się/, "intro formatywny nie może obiecywać odblokowania testu");

  const navEl = globalThis.document.createElement("nav");
  renderNav(navEl, { modules, finalTest: null, activeModuleId: "MSH", onSelectModule: () => {}, onSelectFinalTest: () => {} });
  assert.doesNotMatch(navEl.textContent || "", /Test końcowy/, "nav formatywny nie może mieć pozycji testu końcowego");
  assert.equal(queryAll(navEl, (e) => e.tagName === "BUTTON").length, modules.length, "nav = przyciski tylko modułów (bez testu)");
});
