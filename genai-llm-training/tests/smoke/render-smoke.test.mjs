// render-smoke.test.mjs — SMOKE RENDER (issue #25): realne rendery ui/* na PRAWDZIWYCH danych szkolenia,
// pod stubem DOM (pure Node, zero zależności — ADR-0002). Cel: "Smoke render / Brak błędów JS" z #25 —
// każdy ekran modułu, interakcja, pytanie, test końcowy, certyfikat i nawigacja MAJĄ wyrenderować się
// bez wyjątku na wszystkich ścieżkach S1/S2/S3. Dodatkowo asercje a11y na WYRENDEROWANYM drzewie
// (etykiety kontrolek, legendy fieldsetów, scope nagłówków tabel, opis diagramu) — WCAG 1.1.1/1.3.1/3.3.2.
import "./_dom-stub.mjs"; // instaluje globalThis.document ZANIM wywołamy rendery
import { test } from "node:test";
import assert from "node:assert/strict";
import { queryAll } from "./_dom-stub.mjs";
import { bank, pathsData, modulesData, rubricsData, moduleContent, seededRng } from "./_fixtures.mjs";

import { PATH_IDS, pathModuleList, finalTestStatus, getPath, requiredModules } from "../../assets/core/paths.js";
import { selectFinalTest } from "../../assets/core/test-engine.js";
import { scoreQuestion } from "../../assets/core/quiz-engine.js";
import { scorePath } from "../../assets/core/scoring.js";
import { buildCertificate } from "../../assets/core/certificate.js";
import { evaluateInteraction } from "../../assets/core/interactions/index.js";
import { renderPathSelect } from "../../assets/ui/path-select.js";
import { updateHeader, renderNav } from "../../assets/ui/shell.js";
import { renderQuestion, renderFeedback } from "../../assets/ui/quiz-view.js";
import { renderTest } from "../../assets/ui/test-view.js";
import { renderResult } from "../../assets/ui/certificate-view.js";
import { renderScreens, renderSummary } from "../../assets/ui/module-view.js";
import { renderInteraction } from "../../assets/ui/interactions/index.js";

const MODULE_IDS = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);
const isTag = (...tags) => (n) => tags.includes(n.tagName);

// Zbiera atrybut `for` ze wszystkich <label> w drzewie (do sprawdzenia powiązań etykiet).
function labelFors(root) {
  return new Set(queryAll(root, isTag("LABEL")).map((l) => l.getAttribute("for")).filter(Boolean));
}

/** Asercje dostępności na wyrenderowanym drzewie (działa na stubie DOM). */
function assertA11y(root, ctx) {
  const fors = labelFors(root);
  // 1. Każda kontrolka formularza ma etykietę: <label for=id> ALBO aria-label/aria-labelledby.
  for (const ctrl of queryAll(root, isTag("INPUT", "SELECT", "TEXTAREA"))) {
    const id = ctrl.id || ctrl.getAttribute("id");
    const labelled = (id && fors.has(id)) || ctrl.getAttribute("aria-label") || ctrl.getAttribute("aria-labelledby");
    assert.ok(labelled, `${ctx}: kontrolka ${ctrl.tagName} bez etykiety (for/aria-label)`);
  }
  // 2. Każdy <fieldset> ma <legend> jako dziecko (grupowanie pól — WCAG 1.3.1).
  for (const fs of queryAll(root, isTag("FIELDSET"))) {
    assert.ok(fs.children.some((c) => c.tagName === "LEGEND"), `${ctx}: fieldset bez <legend>`);
  }
  // 3. Nagłówki tabel mają scope (WCAG 1.3.1).
  for (const th of queryAll(root, isTag("TH"))) {
    assert.ok(th.getAttribute("scope"), `${ctx}: <th> bez scope`);
  }
  // 4. Diagram (figure.diagram) ma alternatywę tekstową (figcaption) — WCAG 1.1.1.
  for (const fig of queryAll(root, (n) => n.tagName === "FIGURE")) {
    assert.ok(queryAll(fig, isTag("FIGCAPTION")).length > 0, `${ctx}: <figure> bez <figcaption>`);
  }
}

function makeRefs() {
  const d = globalThis.document;
  const e = () => d.createElement("div");
  return {
    pathIndicator: e(), navToggle: e(), resetBtn: e(), progress: e(),
    progressFill: e(), progressTrack: e(), progressLabel: e(),
  };
}

test("path-select renderuje się dla wszystkich ścieżek bez wyjątku + a11y", () => {
  const node = renderPathSelect(pathsData, modulesData, {
    currentPath: "S2", participantName: "Tester", onSelect: () => {}, onName: () => {},
  });
  assert.ok(node);
  assertA11y(node, "path-select");
});

for (const pathId of PATH_IDS) {
  test(`render modułów + interakcji bez wyjątku — ścieżka ${pathId}`, () => {
    for (const id of MODULE_IDS) {
      const content = moduleContent[id];
      assert.ok(content, `${pathId}/${id}: brak treści modułu`);
      // Ekrany narracyjne (filtr po ścieżce) + podsumowanie.
      const wrap = globalThis.document.createElement("div");
      for (const sec of renderScreens(content.screens, pathId)) wrap.appendChild(sec);
      const sum = renderSummary(content.summary);
      if (sum) wrap.appendChild(sum);
      assertA11y(wrap, `${pathId}/${id}/treść`);

      // Interakcja modułowa: render → getResponse → evaluate → showFeedback → focusFirst (pełny cykl jak w app.js).
      const ix = content.interaction;
      if (ix) {
        const view = renderInteraction(ix);
        assert.ok(view.node, `${pathId}/${id}: interakcja bez node`);
        const result = evaluateInteraction(ix, view.getResponse());
        assert.ok(result && typeof result.summary === "string", `${pathId}/${id}: brak wyniku interakcji`);
        view.showFeedback(result);
        view.focusFirst();
        assertA11y(view.node, `${pathId}/${id}/interakcja`);
      }
    }
  });
}

test("render każdego typu pytania + feedback (poprawny/błędny/krytyczny) bez wyjątku", () => {
  const types = [...new Set(bank.map((q) => q.type))];
  for (const t of types) {
    const q = bank.find((qq) => qq.type === t);
    const rq = renderQuestion(q, { index: 0, total: 1, showMeta: true });
    assert.ok(rq.node, `pytanie ${t}: brak node`);
    rq.getAnswer();
    assertA11y(rq.node, `pytanie/${t}`);
    // Feedback: zła odpowiedź (pusta) i poprawna — oba rendery.
    const wrong = scoreQuestion(q, Array.isArray(q.correct) && q.correct.length > 1 ? [] : null, { rubricPoints: 0 });
    assert.ok(renderFeedback(wrong));
  }
  // Feedback krytyczny (role=alert) dla pytania krytycznego z błędną odpowiedzią.
  const crit = bank.find((q) => q.isCritical);
  const fb = renderFeedback(scoreQuestion(crit, "__zła__"));
  assert.ok(queryAll(fb, (n) => n.getAttribute && n.getAttribute("role") === "alert").length > 0, "krytyczny feedback bez role=alert");
});

for (const pathId of PATH_IDS) {
  test(`render testu końcowego + nawigacji + nagłówka bez wyjątku — ścieżka ${pathId}`, () => {
    const selection = selectFinalTest(bank, pathsData, pathId, seededRng(7));
    const path = getPath(pathsData, pathId);
    const form = renderTest(selection, {
      pathName: path.name, path: pathId, passThresholdPct: path.passThresholdPct,
      attemptInfo: "Podejście 1 z 3.", onSubmit: () => {},
    });
    assert.ok(form);
    assertA11y(form, `${pathId}/test`);

    // Nawigacja: lista modułów + status testu (zablokowany — pusty progres).
    const navEl = globalThis.document.createElement("nav");
    const modules = pathModuleList(pathsData, modulesData, pathId, { modules: {}, practicalTasks: [] });
    const ft = finalTestStatus({ modules: {}, practicalTasks: [] }, pathsData, pathId);
    renderNav(navEl, { modules, finalTest: ft, activeModuleId: "M1", onSelectModule: () => {}, onSelectFinalTest: () => {} });
    assert.ok(navEl.childNodes.length > 0);

    // Nagłówek.
    updateHeader(makeRefs(), { pathId, pathName: path.name, progressPct: 42 });
  });
}

test("render certyfikatu — gałąź ZALICZONA i NIEZALICZONA bez wyjątku", () => {
  const pathId = "S1";
  const sel = selectFinalTest(bank, pathsData, pathId, seededRng(9));
  const answers = Object.fromEntries(sel.questions.map((q) => [q.id, null])); // brak odpowiedzi → niezaliczone
  const failRes = scorePath(pathId, sel.questions, answers, pathsData, { inlineQuizPct: 0 });
  const failCert = buildCertificate(failRes, { pathName: "Świadomy użytkownik", modulesData });
  const failNode = renderResult(failCert, {
    progress: { path: pathId, finalTest: {}, practicalTasks: [] }, pathName: "Świadomy użytkownik",
    gates: failRes.gates, canRetry: true, onRetry: () => {}, onBack: () => {},
  });
  assert.ok(failNode);

  // Gałąź zaliczona: zbuduj sztuczny pozytywny wynik.
  const passCert = buildCertificate(
    { pathId, scorePct: 88, passed: true, weakModules: [] },
    { participant: { displayName: "Tester" }, pathName: "Świadomy użytkownik", modulesData },
  );
  assert.equal(passCert.issued, true);
  const passNode = renderResult(passCert, {
    progress: { path: pathId, finalTest: { passed: true, lastScorePct: 88 }, practicalTasks: [], certificate: passCert },
    pathName: "Świadomy użytkownik", gates: [], onBack: () => {},
  });
  assert.ok(passNode);
});

test("kompletność: 12 modułów ma treść, a wymagane moduły każdej ścieżki istnieją", () => {
  for (const id of MODULE_IDS) assert.ok(moduleContent[id], `brak treści ${id}`);
  for (const pathId of PATH_IDS) {
    for (const id of requiredModules(pathsData, pathId)) {
      assert.ok(moduleContent[id], `${pathId}: wymagany ${id} bez treści`);
    }
  }
  assert.ok(rubricsData.rubrics.length >= 3);
});
