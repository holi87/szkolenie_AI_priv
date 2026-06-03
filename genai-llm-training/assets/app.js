// app.js — bootstrap i router szkolenia (issue #14, spina #15-#19).
// Cienka warstwa orkiestracji: ładuje dane, tworzy store, przełącza ekrany. Logika scoringu/gatingu
// żyje w core/*, render w ui/*. Brak treści szkoleniowej tutaj (separacja — AGENTS / standardy-jakosci).
import { loadTrainingData, questionsForModule } from "./core/data-loader.js";
import { createProgressStore, createLocalStorageAdapter, createMemoryAdapter } from "./core/progress-store.js";
import { pathModuleList, finalTestStatus, requiredModules, getPath, isFinalTestUnlocked } from "./core/paths.js";
import { selectFinalTest } from "./core/test-engine.js";
import { scorePath } from "./core/scoring.js";
import { scoreQuestion } from "./core/quiz-engine.js";
import { buildCertificate } from "./core/certificate.js";
import { evaluateInteraction } from "./core/interactions/index.js";
import { el, mount } from "./ui/dom.js";
import { renderPathSelect } from "./ui/path-select.js";
import { updateHeader, renderNav } from "./ui/shell.js";
import { renderQuestion, renderFeedback } from "./ui/quiz-view.js";
import { renderTest } from "./ui/test-view.js";
import { renderResult } from "./ui/certificate-view.js";
import { renderScreens, renderSummary } from "./ui/module-view.js";
import { renderInteraction } from "./ui/interactions/index.js";

const INLINE_QUIZ_MAX = 8; // wymagania/07: 5–8 pytań z puli modułu
const $ = (id) => document.getElementById(id);

function makeStore() {
  try {
    return createProgressStore(createLocalStorageAdapter());
  } catch {
    return createProgressStore(createMemoryAdapter()); // fallback (np. localStorage zablokowany)
  }
}

function pathName(data, pathId) {
  try { return getPath(data.paths, pathId).name; } catch { return null; }
}

function progressPct(store, data, pathId) {
  const prog = store.getProgress();
  const req = requiredModules(data.paths, pathId);
  const done = req.filter((id) => prog.modules[id] && prog.modules[id].status === "completed").length;
  if (prog.finalTest && prog.finalTest.passed) return 100;
  return req.length ? (done / req.length) * 100 : 0;
}

/** Średni % quizów inline po modułach wymaganych (brak wyniku = 0, konserwatywnie) — wkład 30% do wyniku ścieżki. */
function inlineQuizPctFor(prog, req) {
  if (!req.length) return null;
  const sum = req.reduce((a, id) => a + ((prog.modules[id] && prog.modules[id].inlineQuizScorePct) || 0), 0);
  return Math.round((sum / req.length) * 100) / 100;
}

function start(data) {
  const store = makeStore();
  const refs = {
    view: $("view"), nav: $("module-nav"), navToggle: $("nav-toggle"), resetBtn: $("reset-btn"),
    pathIndicator: $("path-indicator"), progress: $("progress"), progressFill: $("progress-fill"),
    progressTrack: document.querySelector(".progress__track"), progressLabel: $("progress-label"),
  };
  const state = { screen: "menu", moduleId: null, test: null };
  // Imię na certyfikat może być wpisane PRZED wyborem ścieżki (gdy brak aktywnej ścieżki nie ma gdzie zapisać).
  let pendingName = (store.getProgress() && store.getProgress().participant && store.getProgress().participant.displayName) || "";

  const focusView = () => refs.view.focus();

  function refreshHeaderAndNav() {
    const pathId = store.getActivePath();
    if (!pathId) return;
    updateHeader(refs, { pathId, pathName: pathName(data, pathId), progressPct: progressPct(store, data, pathId) });
    refs.nav.hidden = false;
    refs.navToggle.setAttribute("aria-expanded", "true"); // nav widoczny po wyborze ścieżki — spójny stan z toggle
    const modules = pathModuleList(data.paths, data.modules, pathId, store.getProgress());
    const ft = finalTestStatus(store.getProgress(), data.paths, pathId);
    ft.active = state.screen === "test";
    renderNav(refs.nav, {
      modules, finalTest: ft, activeModuleId: state.moduleId,
      onSelectModule: showModule,
      onSelectFinalTest: () => (isFinalTestUnlocked(store.getProgress(), data.paths, pathId) ? showFinalTest() : null),
    });
  }

  function render() {
    const pathId = store.getActivePath();
    if (!pathId) return showPathSelect();
    refreshHeaderAndNav();
    if (state.screen === "menu") showMenu();
    else if (state.screen === "module") showModule(state.moduleId);
    else if (state.screen === "test") showFinalTest();
    else if (state.screen === "result") showResult(state.result);
  }

  // ----- Ekrany -----
  function showPathSelect() {
    refs.pathIndicator.hidden = true; refs.progress.hidden = true; refs.nav.hidden = true;
    refs.navToggle.hidden = true; refs.resetBtn.hidden = true;
    mount(refs.view, renderPathSelect(data.paths, data.modules, {
      currentPath: store.getActivePath(),
      participantName: pendingName,
      onSelect: (pathId) => {
        store.selectPath(pathId);
        if (pendingName) store.setParticipant({ displayName: pendingName }); // przenieś imię wpisane przed wyborem
        state.screen = "menu"; state.moduleId = null; render(); focusView();
      },
      onName: (name) => {
        pendingName = name;
        if (store.getActivePath() && name) store.setParticipant({ displayName: name });
      },
    }));
  }

  function showMenu() {
    state.screen = "menu"; state.moduleId = null;
    const pathId = store.getActivePath();
    const prog = store.getProgress();
    const req = requiredModules(data.paths, pathId);
    const nextReq = req.find((id) => !(prog.modules[id] && prog.modules[id].status === "completed"));
    const unlocked = isFinalTestUnlocked(prog, data.paths, pathId);
    const passed = prog.finalTest && prog.finalTest.passed;

    let nextStep;
    if (passed) nextStep = "Ścieżka zaliczona. Możesz pobrać wynik na ekranie testu.";
    else if (nextReq) nextStep = `Następny krok: rozpocznij moduł ${nextReq}.`;
    else if (unlocked) nextStep = "Następny krok: podejdź do testu końcowego.";
    else nextStep = "Ukończ moduły wymagane, aby odblokować test.";

    mount(refs.view, el("div", { class: "view__content" }, [
      el("h1", { text: `Ścieżka ${pathId} — ${pathName(data, pathId)}` }),
      el("p", { text: "Wybierz moduł z listy po lewej. Po module rozwiąż quiz inline z natychmiastowym feedbackiem. Test końcowy odblokuje się po ukończeniu modułów wymaganych." }),
      el("div", { class: "next-step", attrs: { role: "status" } }, [el("span", { attrs: { "aria-hidden": "true" }, text: "🧭 " }), nextStep]),
      passed ? el("div", { class: "btn-row" }, [el("button", { class: "btn", type: "button", text: "Zobacz wynik / certyfikat", on: { click: showFinalTest } })]) : null,
    ]));
  }

  function showModule(moduleId) {
    state.screen = "module"; state.moduleId = moduleId;
    if (store.getProgress().modules[moduleId]?.status !== "completed") store.setModuleStatus(moduleId, "in_progress");
    store.setLastLocation(moduleId, "module");
    refreshHeaderAndNav();

    const pathId = store.getActivePath();
    const mod = data.modules.modules.find((m) => m.id === moduleId);
    const content = (data.moduleContent && data.moduleContent[moduleId]) || null;
    // Filtr po ścieżce: quiz inline pokazuje tylko pytania należące do aktywnej ścieżki (paths[]).
    const pool = questionsForModule(data.questions, moduleId).filter((q) => q.paths.includes(pathId)).slice(0, INLINE_QUIZ_MAX);
    const alreadyDone = store.getProgress().modules[moduleId]?.status === "completed";

    const root = el("div", { class: "view__content" });
    root.appendChild(el("h1", { text: `${mod.id} — ${mod.name}` }));
    root.appendChild(el("p", { class: "muted", text: `Filar: ${mod.pillar} · poziom: ${mod.level} · czas: ~${mod.timeFullMin} min · interakcja: ${mod.interactiveElement}` }));

    // ----- Treść (ekrany z danych, filtr po ścieżce — wariant S1 skrócony obsłużony przez onlyForPaths) -----
    if (content) {
      if (content.intro) root.appendChild(el("p", { text: content.intro }));
      for (const sec of renderScreens(content.screens, pathId)) root.appendChild(sec);
    } else {
      // Fallback (brak pliku treści): kluczowe pojęcia + efekty z modules.json.
      root.appendChild(el("h2", { text: "Kluczowe pojęcia" }));
      root.appendChild(el("ul", {}, (mod.keyConcepts || []).map((c) => el("li", { text: c }))));
      root.appendChild(el("h2", { text: "Czego się nauczysz" }));
      root.appendChild(el("ul", {}, (mod.learningOutcomes || []).map((o) => el("li", { text: o }))));
    }

    // ----- Gating ukończenia: wymagamy zarówno quizu, jak i interakcji (jeśli istnieją) -----
    const ixConfig = content && content.interaction;
    let interactionDone = alreadyDone || Boolean(store.getProgress().modules[moduleId]?.interaction);
    const moduleResults = new Map(); // qid → { awarded, max } z ostatniego sprawdzenia (do % quizu inline)
    const quizComplete = () => pool.length === 0 || moduleResults.size === pool.length;
    const interactionComplete = () => !ixConfig || interactionDone;
    const updateCompleteState = () => { completeBtn.disabled = !alreadyDone && !(quizComplete() && interactionComplete()); };

    // ----- Interakcja modułowa -----
    if (ixConfig) {
      root.appendChild(el("h2", { text: ixConfig.title || mod.interactiveElement }));
      const ix = renderInteraction(ixConfig);
      const ixFb = el("div");
      const ixBtn = el("button", { class: "btn", type: "button", text: ixConfig.kind === "rubric" ? "Oceń" : "Sprawdź" });
      ixBtn.addEventListener("click", () => {
        const result = evaluateInteraction(ixConfig, ix.getResponse());
        ix.showFeedback(result);
        store.recordInteraction(moduleId, result);
        mount(ixFb, interactionSummary(result, ixConfig, pathId));
        // Zadanie praktyczne: zapis dla ścieżek, których rubryka dotyczy → odblokowuje zaliczenie S2/S3 (scoring konsumuje practicalTasks).
        if (ixConfig.kind === "rubric" && ixConfig.recordsPractical && ixConfig.rubricId && (!ixConfig.paths || ixConfig.paths.includes(pathId))) {
          store.recordPracticalTask({ rubric: ixConfig.rubricId, score: result.score, maxScore: result.max, passed: result.passed === true });
        }
        interactionDone = true;
        updateCompleteState();
      });
      root.appendChild(ix.node);
      root.appendChild(el("div", { class: "btn-row" }, [ixBtn]));
      root.appendChild(ixFb);
    }

    // ----- Quiz inline (zachowane wiring scoringu — setInlineQuizScore zasila 30% wyniku ścieżki) -----
    root.appendChild(el("h2", { text: `Quiz inline (${pool.length} pytań)` }));
    pool.forEach((q) => {
      const block = el("div", { class: "quiz-question" });
      const rq = renderQuestion(q, { showMeta: true });
      const fb = el("div");
      const check = el("button", { class: "btn", type: "button", text: "Sprawdź odpowiedź" });
      check.addEventListener("click", () => {
        const ans = rq.getAnswer();
        const rp = rq.getRubricPoints ? rq.getRubricPoints() : undefined;
        const result = scoreQuestion(q, ans, { rubricPoints: rp });
        mount(fb, renderFeedback(result));
        store.recordQuizResult(moduleId, { questionId: q.id, correct: result.isCorrect === true, attempt: 1, scoreAwarded: result.awarded, feedbackShown: true, feedback: result.feedback });
        moduleResults.set(q.id, { awarded: result.awarded, max: result.max });
        updateCompleteState();
      });
      mount(block, rq.node, el("div", { class: "btn-row" }, [check]), fb);
      root.appendChild(block);
    });

    const completeBtn = el("button", { class: "btn", type: "button", text: "Oznacz moduł jako ukończony", on: { click: () => {
      // % quizu inline zapisz tylko po komplecie odpowiedzi — nie nadpisuj wcześniejszego wyniku przy ponownej wizycie.
      if (pool.length > 0 && moduleResults.size === pool.length) {
        const tot = [...moduleResults.values()].reduce((a, r) => ({ awarded: a.awarded + r.awarded, max: a.max + r.max }), { awarded: 0, max: 0 });
        store.setInlineQuizScore(moduleId, tot.max > 0 ? Math.round((tot.awarded / tot.max) * 10000) / 100 : 0);
      }
      store.setModuleStatus(moduleId, "completed");
      showMenu(); refreshHeaderAndNav(); focusView();
    } } });
    updateCompleteState();

    // ----- Podsumowanie + następny krok -----
    if (content && content.summary) root.appendChild(renderSummary(content.summary));
    const gateHint = !quizComplete() && pool.length > 0
      ? "Sprawdź wszystkie pytania quizu, aby zakończyć moduł."
      : !interactionComplete()
        ? "Wykonaj interakcję modułową, aby zakończyć moduł."
        : "Możesz oznaczyć moduł jako ukończony.";
    root.appendChild(el("div", { class: "next-step" }, [
      el("p", { text: content && content.summary && content.summary.nextStep ? content.summary.nextStep : gateHint }),
      el("div", { class: "btn-row" }, [completeBtn, el("button", { class: "btn btn--ghost", type: "button", text: "Wróć do modułów", on: { click: () => { showMenu(); focusView(); } } })]),
    ]));
    mount(refs.view, root);
    focusView();
  }

  /** Zbiorczy feedback interakcji: wynik + (dla zadania praktycznego) próg i informacja, że liczy się do zaliczenia. */
  function interactionSummary(result, config, pathId) {
    const lines = [el("p", { class: "feedback__head", text: result.summary })];
    if (config.kind === "rubric" && config.recordsPractical && config.rubricId && (!config.paths || config.paths.includes(pathId))) {
      const ok = result.passed === true;
      lines.push(el("p", { attrs: { role: "status" }, text: ok
        ? `Zadanie praktyczne zaliczone (${result.score}/${result.max}) — liczy się do zaliczenia ścieżki ${pathId}.`
        : `Zadanie praktyczne poniżej progu (${result.score}/${result.max}). Popraw kryteria i oceń ponownie — wynik liczy się do zaliczenia ścieżki ${pathId}.` }));
    }
    return el("div", { class: `feedback ${result.passed === false ? "feedback--incorrect" : "feedback--correct"}` }, lines);
  }

  function showFinalTest() {
    const pathId = store.getActivePath();
    const prog = store.getProgress();
    if (!isFinalTestUnlocked(prog, data.paths, pathId)) { showMenu(); return; }
    // Już zaliczony — pokaż wynik, bez kolejnego podejścia (działa też po odświeżeniu strony).
    if (prog.finalTest && prog.finalTest.passed) { showResult(state.result || buildResultFromProgress(prog, pathId)); return; }
    if (!store.canAttemptFinalTest()) { showResult(state.result || buildResultFromProgress(prog, pathId)); return; }

    state.screen = "test"; state.moduleId = null;
    const path = getPath(data.paths, pathId);
    const selection = selectFinalTest(data.questions, data.paths, pathId);
    state.test = selection;
    refreshHeaderAndNav();
    const ft = prog.finalTest || { attempts: 0, maxAttempts: path.attempts || 3 };
    // Moduły z zadaniem praktycznym tej ścieżki (z bramek rubrykowych) — gdzie ocena praktyczna powstaje.
    const practicalModules = [...new Set((path.gates || [])
      .filter((g) => g.rubric)
      .map((g) => (data.rubrics.rubrics || []).find((r) => r.id === g.rubric))
      .filter(Boolean)
      .map((r) => r.module))];
    mount(refs.view, renderTest(selection, {
      pathName: pathName(data, pathId), path: pathId, passThresholdPct: path.passThresholdPct,
      attemptInfo: `Podejście ${(ft.attempts || 0) + 1} z ${ft.maxAttempts || path.attempts || 3}.`,
      practicalNote: practicalModules.length
        ? `Pełne zaliczenie tej ścieżki wymaga też oceny zadania praktycznego — wykonaj interakcję w module: ${practicalModules.join(", ")} (interakcja zapisuje wynik praktyczny).`
        : null,
      onSubmit: ({ answers, rubricPointsById }) => finishTest(pathId, selection, answers, rubricPointsById),
    }));
    focusView();
  }

  function finishTest(pathId, selection, answers, rubricPointsById) {
    const prog = store.getProgress();
    // Wynik ścieżki = ważona kompozycja: quiz inline (z progresu) 30% + test 60% + zadania praktyczne 10%.
    // Zadania praktyczne (M4): interakcje rubrykowe (M6/M7/M12) zapisują practicalTasks przez recordPracticalTask,
    // więc bramki practicalTask/moduleMinScore mogą być spełnione i S2/S3 są realnie zaliczalne.
    const result = scorePath(pathId, selection.questions, answers, data.paths, {
      rubricPointsById,
      inlineQuizPct: inlineQuizPctFor(prog, requiredModules(data.paths, pathId)),
      practicalResults: prog.practicalTasks,
    });
    store.recordFinalTest(result);
    const cert = buildCertificate(result, { participant: store.getProgress().participant, pathName: pathName(data, pathId), modulesData: data.modules });
    if (cert.issued) store.recordCertificate({ issued: true, completionId: cert.completionId, scorePct: cert.scorePct });
    state.result = cert;
    showResult(cert, result.gates);
    refreshHeaderAndNav();
  }

  function buildResultFromProgress(prog, pathId) {
    const ft = prog.finalTest || {};
    return buildCertificate(
      { pathId, scorePct: ft.lastScorePct ?? 0, passed: Boolean(ft.passed), weakModules: ft.weakModules || [] },
      { participant: prog.participant, pathName: pathName(data, pathId), modulesData: data.modules },
    );
  }

  function showResult(cert, gates) {
    state.screen = "result";
    const pathId = store.getActivePath();
    mount(refs.view, renderResult(cert, {
      progress: store.getProgress(), pathName: pathName(data, pathId), gates,
      canRetry: !cert.issued && store.canAttemptFinalTest(),
      attemptInfo: `Wykorzystane podejścia: ${(store.getProgress().finalTest || {}).attempts || 0}.`,
      onRetry: () => { showFinalTest(); focusView(); },
      onBack: () => { showMenu(); focusView(); },
    }));
    refreshHeaderAndNav();
    focusView();
  }

  // ----- Globalne kontrolki -----
  refs.resetBtn.addEventListener("click", () => {
    if (globalThis.confirm("Zresetować cały postęp tej przeglądarki? Tej operacji nie można cofnąć.")) {
      store.reset({ all: true });
      state.screen = "menu"; state.moduleId = null; state.result = null; state.test = null;
      render();
    }
  });
  refs.navToggle.addEventListener("click", () => {
    const expanded = refs.navToggle.getAttribute("aria-expanded") === "true";
    refs.navToggle.setAttribute("aria-expanded", String(!expanded));
    refs.nav.hidden = expanded;
  });

  render();
}

// ----- Boot -----
loadTrainingData()
  .then(start)
  .catch((err) => {
    const view = $("view");
    mount(view, el("div", { class: "view__content" }, [
      el("h1", { text: "Nie udało się załadować szkolenia" }),
      el("p", { text: "Dane (data/*.json) ładują się przez fetch() i wymagają serwera http(s) — nie otwieraj pliku przez file://." }),
      el("p", { class: "muted", text: "Uruchom lokalnie: python3 -m http.server 8000 w katalogu genai-llm-training, potem otwórz http://localhost:8000" }),
      el("pre", { class: "muted", text: String(err && err.message ? err.message : err) }),
    ]));
  });
