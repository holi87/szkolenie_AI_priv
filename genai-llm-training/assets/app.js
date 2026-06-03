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
import { el, mount } from "./ui/dom.js";
import { renderPathSelect } from "./ui/path-select.js";
import { updateHeader, renderNav } from "./ui/shell.js";
import { renderQuestion, renderFeedback } from "./ui/quiz-view.js";
import { renderTest } from "./ui/test-view.js";
import { renderResult } from "./ui/certificate-view.js";

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

function start(data) {
  const store = makeStore();
  const refs = {
    view: $("view"), nav: $("module-nav"), navToggle: $("nav-toggle"), resetBtn: $("reset-btn"),
    pathIndicator: $("path-indicator"), progress: $("progress"), progressFill: $("progress-fill"),
    progressTrack: document.querySelector(".progress__track"), progressLabel: $("progress-label"),
  };
  const state = { screen: "menu", moduleId: null, test: null };

  const focusView = () => refs.view.focus();

  function refreshHeaderAndNav() {
    const pathId = store.getActivePath();
    if (!pathId) return;
    updateHeader(refs, { pathId, pathName: pathName(data, pathId), progressPct: progressPct(store, data, pathId) });
    refs.nav.hidden = false;
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
      participantName: (store.getProgress() && store.getProgress().participant && store.getProgress().participant.displayName) || "",
      onSelect: (pathId) => { store.selectPath(pathId); state.screen = "menu"; state.moduleId = null; render(); focusView(); },
      onName: (name) => { if (store.getActivePath() && name) store.setParticipant({ displayName: name }); },
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
      el("div", { class: "next-step", attrs: { role: "status" } }, [el("strong", { text: "🧭 " }), nextStep]),
      passed ? el("div", { class: "btn-row" }, [el("button", { class: "btn", type: "button", text: "Zobacz wynik / certyfikat", on: { click: showFinalTest } })]) : null,
    ]));
  }

  function showModule(moduleId) {
    state.screen = "module"; state.moduleId = moduleId;
    if (store.getProgress().modules[moduleId]?.status !== "completed") store.setModuleStatus(moduleId, "in_progress");
    store.setLastLocation(moduleId, "module");
    refreshHeaderAndNav();

    const mod = data.modules.modules.find((m) => m.id === moduleId);
    const pool = questionsForModule(data.questions, moduleId).slice(0, INLINE_QUIZ_MAX);
    const root = el("div", { class: "view__content" });
    root.appendChild(el("h1", { text: `${mod.id} — ${mod.name}` }));
    root.appendChild(el("p", { class: "muted", text: `Filar: ${mod.pillar} · poziom: ${mod.level} · czas: ~${mod.timeFullMin} min · interakcja: ${mod.interactiveElement}` }));
    root.appendChild(el("p", { text: "Pełna treść interaktywna tego modułu powstaje w milestone M4. Poniżej kluczowe pojęcia, efekty uczenia i quiz inline (działający silnik quizów — M3)." }));
    root.appendChild(el("h2", { text: "Kluczowe pojęcia" }));
    root.appendChild(el("ul", {}, (mod.keyConcepts || []).map((c) => el("li", { text: c }))));
    root.appendChild(el("h2", { text: "Czego się nauczysz" }));
    root.appendChild(el("ul", {}, (mod.learningOutcomes || []).map((o) => el("li", { text: o }))));

    root.appendChild(el("h2", { text: `Quiz inline (${pool.length} pytań)` }));
    const answered = new Set();
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
        answered.add(q.id);
        if (answered.size === pool.length) completeBtn.disabled = false;
      });
      mount(block, rq.node, el("div", { class: "btn-row" }, [check]), fb);
      root.appendChild(block);
    });

    const completeBtn = el("button", { class: "btn", type: "button", text: "Oznacz moduł jako ukończony", disabled: pool.length > 0, on: { click: () => {
      store.setModuleStatus(moduleId, "completed");
      showMenu(); refreshHeaderAndNav(); focusView();
    } } });
    root.appendChild(el("div", { class: "next-step" }, [
      el("p", { text: pool.length > 0 ? "Sprawdź wszystkie pytania quizu, aby zakończyć moduł." : "Ten moduł nie ma jeszcze pytań w banku." }),
      el("div", { class: "btn-row" }, [completeBtn, el("button", { class: "btn btn--ghost", type: "button", text: "Wróć do modułów", on: { click: () => { showMenu(); focusView(); } } })]),
    ]));
    mount(refs.view, root);
    focusView();
  }

  function showFinalTest() {
    const pathId = store.getActivePath();
    const prog = store.getProgress();
    if (!isFinalTestUnlocked(prog, data.paths, pathId)) { showMenu(); return; }
    // Jeśli już zaliczony — pokaż wynik zamiast nowego podejścia.
    if (prog.finalTest && prog.finalTest.passed && state.result) { showResult(state.result); return; }
    if (!store.canAttemptFinalTest()) { showResult(state.result || buildResultFromProgress(prog, pathId)); return; }

    state.screen = "test"; state.moduleId = null;
    const path = getPath(data.paths, pathId);
    const selection = selectFinalTest(data.questions, data.paths, pathId);
    state.test = selection;
    refreshHeaderAndNav();
    const ft = prog.finalTest || { attempts: 0, maxAttempts: path.attempts || 3 };
    mount(refs.view, renderTest(selection, {
      pathName: pathName(data, pathId), path: pathId, passThresholdPct: path.passThresholdPct,
      attemptInfo: `Podejście ${(ft.attempts || 0) + 1} z ${ft.maxAttempts || path.attempts || 3}.`,
      onSubmit: ({ answers, rubricPointsById }) => finishTest(pathId, selection, answers, rubricPointsById),
    }));
    focusView();
  }

  function finishTest(pathId, selection, answers, rubricPointsById) {
    // Zadania praktyczne (S2/S3) nie są jeszcze zbierane w UI M3 → bramki praktyczne pozostają niespełnione
    // (konserwatywnie). Wynik testu i bramki krytyczne/progowe liczone w pełni.
    const result = scorePath(pathId, selection.questions, answers, data.paths, { rubricPointsById });
    store.recordFinalTest(result);
    const cert = buildCertificate(result, { participant: store.getProgress().participant, pathName: pathName(data, pathId), modulesData: data.modules });
    if (cert.issued) store.recordCertificate({ issued: true, completionId: cert.completionId, scorePct: cert.scorePct });
    state.result = cert;
    showResult(cert);
    refreshHeaderAndNav();
  }

  function buildResultFromProgress(prog, pathId) {
    const ft = prog.finalTest || {};
    return buildCertificate(
      { pathId, scorePct: ft.lastScorePct ?? 0, passed: Boolean(ft.passed), weakModules: ft.weakModules || [] },
      { participant: prog.participant, pathName: pathName(data, pathId), modulesData: data.modules },
    );
  }

  function showResult(cert) {
    state.screen = "result";
    const pathId = store.getActivePath();
    mount(refs.view, renderResult(cert, {
      progress: store.getProgress(), pathName: pathName(data, pathId),
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
