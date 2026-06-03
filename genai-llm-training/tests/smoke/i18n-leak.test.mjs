// i18n-leak.test.mjs — guard niezgodności nazw parametrów callsite <-> katalog (issue #77).
// Renderuje interpolacyjnie-ciężkie widoki na REALNYCH danych i sprawdza, że w widocznym tekście NIE
// został surowy placeholder {param} ani surowy klucz katalogu (np. "path.card.cta"). Pure Node + DOM-stub.
import "./_dom-stub.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { bank, pathsData, modulesData, rubricsData, moduleContent } from "./_fixtures.mjs"; // rejestruje katalogi PL
import { PATH_IDS, pathModuleList, finalTestStatus, getPath } from "../../assets/core/paths.js";
import { scoreQuestion } from "../../assets/core/quiz-engine.js";
import { buildCertificate } from "../../assets/core/certificate.js";
import { selectFinalTest } from "../../assets/core/test-engine.js";
import { renderPathSelect } from "../../assets/ui/path-select.js";
import { renderQuestion, renderFeedback } from "../../assets/ui/quiz-view.js";
import { renderTest } from "../../assets/ui/test-view.js";
import { renderResult } from "../../assets/ui/certificate-view.js";
import { renderNav } from "../../assets/ui/shell.js";

const LEAK = /\{[A-Za-z]\w*\}/;          // surowy placeholder, np. {pct}
const RAWKEY = /\b[a-z]+(?:\.[a-z]+){2,}/i; // surowy klucz, np. path.card.cta (>=3 segmenty kropkowane)

function assertClean(node, label) {
  const txt = node.textContent || "";
  assert.ok(!LEAK.test(txt), `${label}: wyciek placeholdera -> ${LEAK.exec(txt)?.[0]} w "${txt.slice(0, 120)}"`);
  assert.ok(!RAWKEY.test(txt), `${label}: wyciek surowego klucza -> ${RAWKEY.exec(txt)?.[0]}`);
}

test("path-select: brak wycieku placeholderów/kluczy (hero, karty, currentPath, privacy)", () => {
  const node = renderPathSelect(pathsData, modulesData, { currentPath: "S2", participantName: "Tester" });
  assertClean(node, "path-select");
});

test("feedback (każdy typ pytania): brak wycieku", () => {
  const seen = new Set();
  for (const q of bank) {
    if (seen.has(q.type)) continue;
    seen.add(q.type);
    assertClean(renderQuestion(q, { index: 0, total: 5, showMeta: true }).node, `question:${q.type}`);
    assertClean(renderFeedback(scoreQuestion(q, "__zła__")), `feedback:${q.type}`);
  }
});

test("nav (locked + available) i test-view: brak wycieku", () => {
  for (const pathId of PATH_IDS) {
    const navEl = globalThis.document.createElement("nav");
    const modules = pathModuleList(pathsData, modulesData, pathId, { modules: {}, practicalTasks: [] });
    const ftLocked = finalTestStatus({ modules: {}, practicalTasks: [] }, pathsData, pathId);
    renderNav(navEl, { modules, finalTest: ftLocked, activeModuleId: "M1", onSelectModule: () => {}, onSelectFinalTest: () => {} });
    assertClean(navEl, `nav-locked:${pathId}`);

    const path = getPath(pathsData, pathId);
    const selection = selectFinalTest(bank, pathsData, pathId);
    const node = renderTest(selection, {
      pathName: path.name, path: pathId, passThresholdPct: path.passThresholdPct,
      attemptInfo: "Podejście 1 z 3.",
    });
    assertClean(node, `test-view:${pathId}`);
  }
});

test("certyfikat (issued + failed): brak wycieku", () => {
  const issued = buildCertificate({ pathId: "S2", scorePct: 90, passed: true, weakModules: [] },
    { dateIso: "2024-01-01T00:00:00.000Z", pathName: "Praktyk", modulesData });
  assertClean(renderResult(issued, { pathName: "Praktyk", gates: [{ type: "overallThreshold", passed: true }] }), "cert-issued");

  const failed = buildCertificate({ pathId: "S2", scorePct: 50, passed: false, weakModules: [{ module: "M10", pct: 40 }] },
    { dateIso: "2024-01-01T00:00:00.000Z", pathName: "Praktyk", modulesData });
  assertClean(renderResult(failed, { pathName: "Praktyk", gates: [{ type: "overallThreshold", passed: false }], attemptInfo: "Wykorzystane podejścia: 1." }), "cert-failed");
  assertClean(renderResult(failed, { pathName: "Praktyk" }), "cert-failed-noGates"); // wariant noGates
});

void rubricsData; void moduleContent; // dostępne dla rozszerzeń; nie wymagane w tym guardzie
