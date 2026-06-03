// app.js — bootstrap i router szkolenia (issue #14, spina #15-#19).
// Cienka warstwa orkiestracji: ładuje dane, tworzy store, przełącza ekrany. Logika scoringu/gatingu
// żyje w core/*, render w ui/*. Brak treści szkoleniowej tutaj (separacja — AGENTS / standardy-jakosci).
import { loadTrainingData, questionsForModule } from "./core/data-loader.js";
import { createProgressStore, createLocalStorageAdapter, createMemoryAdapter } from "./core/progress-store.js";
import { pathModuleList, finalTestStatus, requiredModules, getPath, isFinalTestUnlocked, requiredPracticalRubrics } from "./core/paths.js";
import { selectFinalTest } from "./core/test-engine.js";
import { scorePath } from "./core/scoring.js";
import { scoreQuestion } from "./core/quiz-engine.js";
import { buildCertificate } from "./core/certificate.js";
import { evaluateInteraction } from "./core/interactions/index.js";
import { el, mount } from "./ui/dom.js";
import { icon } from "./ui/icon.js";
import { t, registerCatalog, setLocale, resolveLang, persistLang, localeHasData } from "./i18n/i18n.js";
import { renderPathSelect } from "./ui/path-select.js";
import { updateHeader, renderNav } from "./ui/shell.js";
import { initTheme, toggleTheme } from "./ui/theme.js";
import { initLangSwitch } from "./ui/lang-switch.js";
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

function start(initialData, ctx = {}) {
  let data = initialData;                 // mutable: zmiana języka może przeładować dane (gdy locale ma własne data/)
  let dataLocale = ctx.dataLocale || "pl";
  const store = makeStore();
  const refs = {
    view: $("view"), nav: $("module-nav"), navToggle: $("nav-toggle"), resetBtn: $("reset-btn"),
    pathIndicator: $("path-indicator"), progress: $("progress"), progressFill: $("progress-fill"),
    progressTrack: document.querySelector(".progress__track"), progressLabel: $("progress-label"),
    themeToggle: $("theme-toggle"),
    langWrap: $("lang-switch"), langBtn: $("lang-switch-btn"), langLabel: $("lang-switch-label"), langFlag: $("lang-switch-flag"),
  };

  // Motyw jasny/ciemny (UX-3): anty-flash skrypt w <head> ustawił już [data-theme]; tu synchronizujemy
  // stan przycisku (aria-pressed) i wpinamy toggle. Storage ma priorytet nad prefers-color-scheme (theme.js).
  if (refs.themeToggle) {
    const syncToggle = (theme) => refs.themeToggle.setAttribute("aria-pressed", String(theme === "light"));
    syncToggle(initTheme());
    refs.themeToggle.addEventListener("click", () => syncToggle(toggleTheme()));
  }

  // Przełącznik języka (I18N-3 #79). Zmiana: rejestruj katalog locale (jeśli trzeba), przeładuj dane TYLKO gdy
  // zmienia się data-locale (locale z hasData), ustaw <html lang>, zapisz preferencję, odśwież ekran w miejscu.
  let langApi = null;
  async function setLanguage(code) {
    setLocale(code);
    persistLang(code);
    if (globalThis.document && globalThis.document.documentElement) globalThis.document.documentElement.setAttribute("lang", code);
    if (typeof ctx.ensureCatalog === "function") { try { await ctx.ensureCatalog(code); } catch { /* fallback PL */ } }
    const nextDataLocale = localeHasData(code) ? code : "pl";
    if (nextDataLocale !== dataLocale && typeof ctx.loadData === "function") {
      try { data = await ctx.loadData(nextDataLocale); dataLocale = nextDataLocale; } catch { /* zostań przy obecnych danych */ }
    }
    if (langApi) langApi.setActive(code);
    render();
  }
  if (refs.langBtn && refs.langWrap) {
    langApi = initLangSwitch({
      wrap: refs.langWrap, trigger: refs.langBtn, label: refs.langLabel, triggerFlag: refs.langFlag,
      getActive: () => ctx.uiLocale || "pl",
      onSelect: (code) => { setLanguage(code); },
    });
  }
  const state = { screen: "menu", moduleId: null, test: null };
  // Imię na certyfikat może być wpisane PRZED wyborem ścieżki (gdy brak aktywnej ścieżki nie ma gdzie zapisać).
  let pendingName = (store.getParticipant() && store.getParticipant().displayName) || ""; // pseudonim tylko z pamięci sesji (#63)

  const focusView = () => refs.view.focus();

  // ----- Czas w module (KPI "Time to complete", wymagania/10) -----
  // Mierzymy realny czas spędzony w module i zapisujemy go przy WYJŚCIU z modułu (zmiana ekranu).
  // Minimalnie: jeden aktywny licznik; bez detekcji bezczynności. store.addModuleTime klamruje wartości ujemne.
  const timer = { moduleId: null, enterMs: 0 };
  function flushModuleTime() {
    if (timer.moduleId && timer.enterMs) {
      try { store.addModuleTime(timer.moduleId, (Date.now() - timer.enterMs) / 1000); } catch { /* brak aktywnej ścieżki — pomiń */ }
    }
    timer.moduleId = null; timer.enterMs = 0;
  }
  function startModuleTimer(moduleId) {
    flushModuleTime(); // domknij poprzedni moduł, zanim zacznie się nowy
    timer.moduleId = moduleId; timer.enterMs = Date.now();
  }
  // Zamknięcie/przeładowanie karty w trakcie modułu — domknij czas, by nie zgubić pomiaru.
  if (globalThis.addEventListener) globalThis.addEventListener("beforeunload", flushModuleTime);

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
    flushModuleTime();
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
    flushModuleTime(); // wyjście z modułu → zapisz czas
    state.screen = "menu"; state.moduleId = null;
    const pathId = store.getActivePath();
    const prog = store.getProgress();
    const req = requiredModules(data.paths, pathId);
    const nextReq = req.find((id) => !(prog.modules[id] && prog.modules[id].status === "completed"));
    const unlocked = isFinalTestUnlocked(prog, data.paths, pathId);
    const passed = prog.finalTest && prog.finalTest.passed;

    let nextStep;
    if (passed) nextStep = t("module.nextStep.passed");
    else if (nextReq) nextStep = t("module.nextStep.startModule", { module: nextReq });
    else if (unlocked) nextStep = t("module.nextStep.goToTest");
    else nextStep = t("module.nextStep.completeRequired");

    mount(refs.view, el("div", { class: "view__content" }, [
      el("h1", { text: t("module.menu.heading", { pathId, pathName: pathName(data, pathId) }) }),
      el("p", { text: t("module.menu.intro") }),
      el("div", { class: "next-step", attrs: { role: "status" } }, [el("span", { class: "next-step__icon", attrs: { "aria-hidden": "true" } }, [icon("info")]), nextStep]),
      passed ? el("div", { class: "btn-row" }, [el("button", { class: "btn", type: "button", text: t("action.viewResult"), on: { click: showFinalTest } })]) : null,
    ]));
  }

  function showModule(moduleId) {
    state.screen = "module"; state.moduleId = moduleId;
    startModuleTimer(moduleId); // start pomiaru czasu w module (KPI Time to complete)
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
    root.appendChild(el("h1", { text: t("module.title", { moduleId: mod.id, moduleName: mod.name }) }));
    root.appendChild(el("p", { class: "muted", text: t("module.meta", { pillar: mod.pillar, level: mod.level, time: mod.timeFullMin, interaction: mod.interactiveElement }) }));

    // ----- Treść (ekrany z danych, filtr po ścieżce — wariant S1 skrócony obsłużony przez onlyForPaths) -----
    if (content) {
      if (content.intro) root.appendChild(el("p", { text: content.intro }));
      for (const sec of renderScreens(content.screens, pathId)) root.appendChild(sec);
    } else {
      // Fallback (brak pliku treści): kluczowe pojęcia + efekty z modules.json.
      root.appendChild(el("h2", { text: t("module.keyConcepts") }));
      root.appendChild(el("ul", {}, (mod.keyConcepts || []).map((c) => el("li", { text: c }))));
      root.appendChild(el("h2", { text: t("module.learningOutcomes") }));
      root.appendChild(el("ul", {}, (mod.learningOutcomes || []).map((o) => el("li", { text: o }))));
    }

    // ----- Gating ukończenia: gatuje TYLKO quiz inline (self-paced). Interakcja renderuje się na każdej
    // ścieżce, na której moduł jest widoczny (to ćwiczenie modułu — wg storyboardu np. S1 też robi Prompt clinic),
    // daje feedback i zapisuje wynik, ale NIE blokuje ukończenia. Czy liczy się jako ZADANIE PRAKTYCZNE
    // (recordPracticalTask) wynika z bramek paths.json (autorytatywne), nie z pola w treści.
    const ixConfig = content && content.interaction;
    const ixRecordsPractical = Boolean(
      ixConfig && ixConfig.kind === "rubric" && ixConfig.recordsPractical && ixConfig.rubricId &&
      requiredPracticalRubrics(data.paths, pathId).includes(ixConfig.rubricId),
    );
    const moduleResults = new Map(); // qid → { awarded, max } z ostatniego sprawdzenia (do % quizu inline)
    const quizComplete = () => pool.length === 0 || moduleResults.size === pool.length;
    const stepHint = el("p", {});
    const refreshHint = () => {
      stepHint.textContent = !alreadyDone && pool.length > 0 && !quizComplete()
        ? t("module.hint.checkAllQuestions")
        : (content && content.summary && content.summary.nextStep) || t("module.hint.canComplete");
    };
    const updateCompleteState = () => { completeBtn.disabled = !alreadyDone && !quizComplete(); refreshHint(); };

    // ----- Interakcja modułowa -----
    if (ixConfig) {
      root.appendChild(el("h2", { text: ixConfig.title || mod.interactiveElement }));
      const ix = renderInteraction(ixConfig);
      const ixFb = el("div");
      const ixBtn = el("button", { class: "btn", type: "button", text: ixConfig.kind === "rubric" ? t("action.evaluate") : t("action.check") });
      ixBtn.addEventListener("click", () => {
        const result = evaluateInteraction(ixConfig, ix.getResponse());
        ix.showFeedback(result);
        store.recordInteraction(moduleId, result);
        mount(ixFb, interactionSummary(result, ixRecordsPractical, pathId));
        // Zadanie praktyczne zapisywane tylko gdy rubryka jest bramką tej ścieżki → nie zaniża średniej praktyk
        // na ścieżkach bez tej bramki (np. R1-prompt liczy się dla S2, a na S3 to tylko ćwiczenie).
        if (ixRecordsPractical) {
          store.recordPracticalTask({ rubric: ixConfig.rubricId, score: result.score, maxScore: result.max, passed: result.passed === true });
          refreshHeaderAndNav(); // zapisana praktyka może odblokować test końcowy (gating)
        }
      });
      root.appendChild(ix.node);
      root.appendChild(el("div", { class: "btn-row" }, [ixBtn]));
      root.appendChild(ixFb);
    }

    // ----- Quiz inline (zachowane wiring scoringu — setInlineQuizScore zasila 30% wyniku ścieżki) -----
    root.appendChild(el("h2", { text: t("quiz.inline.heading", { count: pool.length }) }));
    pool.forEach((q) => {
      // Wrapper grupujący pytanie+przycisk+feedback. Karta wizualna to fieldset.quiz-question (UX-4 #73);
      // osobna klasa, by nie dublować ramki/karty wokół fieldsetu.
      const block = el("div", { class: "quiz-item" });
      const rq = renderQuestion(q, { showMeta: true });
      const fb = el("div");
      const check = el("button", { class: "btn", type: "button", text: t("action.checkAnswer") });
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

    const completeBtn = el("button", { class: "btn", type: "button", text: t("action.markCompleted"), on: { click: () => {
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
    refreshHint(); // hint zależny od stanu quizu (gdy completeBtn zablokowany → instrukcja, inaczej → następny krok)
    root.appendChild(el("div", { class: "next-step" }, [
      stepHint,
      el("div", { class: "btn-row" }, [completeBtn, el("button", { class: "btn btn--ghost", type: "button", text: t("action.backToModules"), on: { click: () => { showMenu(); focusView(); } } })]),
    ]));
    mount(refs.view, root);
    focusView();
  }

  /** Zbiorczy feedback interakcji: wynik + (dla zadania praktycznego) próg i informacja, że liczy się do zaliczenia. */
  function interactionSummary(result, recordsPractical, pathId) {
    const lines = [el("p", { class: "feedback__head", text: result.summary })];
    if (recordsPractical) {
      const ok = result.passed === true;
      lines.push(el("p", { attrs: { role: "status" }, text: ok
        ? t("interaction.practical.passed", { score: result.score, max: result.max, pathId })
        : t("interaction.practical.belowThreshold", { score: result.score, max: result.max, pathId }) }));
    }
    // passed: true→zielony, false→czerwony, null (rubryka bez progu, np. QA workbench)→neutralny (nie ogłaszaj „poprawnie").
    const cls = result.passed === true ? " feedback--correct" : result.passed === false ? " feedback--incorrect" : "";
    return el("div", { class: `feedback${cls}` }, lines);
  }

  function showFinalTest() {
    flushModuleTime(); // wejście do testu z modułu → zapisz czas modułu
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
      attemptInfo: t("test.attemptInfo", { current: (ft.attempts || 0) + 1, max: ft.maxAttempts || path.attempts || 3 }),
      practicalNote: practicalModules.length
        ? t("test.practicalNote", { modules: practicalModules.join(", ") })
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
    const cert = buildCertificate(result, { participant: store.getParticipant(), pathName: pathName(data, pathId), modulesData: data.modules });
    if (cert.issued) store.recordCertificate({ issued: true, completionId: cert.completionId, scorePct: cert.scorePct });
    state.result = cert;
    showResult(cert, result.gates);
    refreshHeaderAndNav();
  }

  function buildResultFromProgress(prog, pathId) {
    const ft = prog.finalTest || {};
    return buildCertificate(
      { pathId, scorePct: ft.lastScorePct ?? 0, passed: Boolean(ft.passed), weakModules: ft.weakModules || [] },
      { participant: store.getParticipant(), pathName: pathName(data, pathId), modulesData: data.modules },
    );
  }

  function showResult(cert, gates) {
    state.screen = "result";
    const pathId = store.getActivePath();
    mount(refs.view, renderResult(cert, {
      progress: store.getProgress(), pathName: pathName(data, pathId), gates,
      canRetry: !cert.issued && store.canAttemptFinalTest(),
      attemptInfo: t("test.attemptsUsed", { attempts: (store.getProgress().finalTest || {}).attempts || 0 }),
      onRetry: () => { showFinalTest(); focusView(); },
      onBack: () => { showMenu(); focusView(); },
    }));
    refreshHeaderAndNav();
    focusView();
  }

  // ----- Globalne kontrolki -----
  refs.resetBtn.addEventListener("click", () => {
    if (globalThis.confirm(t("action.resetConfirm"))) {
      timer.moduleId = null; timer.enterMs = 0; // porzuć licznik — reset i tak czyści progres
      store.reset({ all: true });
      pendingName = ""; // wyczyść pseudonim trzymany w UI (#63) — inaczej wróciłby na ekran wyboru i kolejny certyfikat
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
// Katalogi i18n ładowane przez fetch (jak dane) i rejestrowane PRZED renderem, żeby t() działało od pierwszego
// ekranu. PL kanoniczny zawsze; aktywny locale dodatkowo (fallback PL przy braku/pustej wartości). Ścieżki
// względne (Pages, ADR-0002). ensureCatalog jest idempotentne — używane też przy zmianie języka (#79).
const catalogFetch = async (url) => {
  const res = await globalThis.fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
};
const loadedCatalogs = new Set();
async function ensureCatalog(code) {
  if (loadedCatalogs.has(code)) return;
  registerCatalog(code, await catalogFetch(`assets/i18n/${code}.json`));
  loadedCatalogs.add(code);
}
const loadData = (locale) => loadTrainingData({ locale });

function renderLoadError(err) {
  // Edge file://: jeśli i NIE udało się pobrać katalogu i18n (ten sam fetch), t() zwróci klucze — ale <pre>
  // z realnym błędem nadal wskazuje przyczynę. Na hostingu http(s) (Pages) katalog i dane ładują się poprawnie.
  mount($("view"), el("div", { class: "view__content" }, [
    el("h1", { text: t("error.load.heading") }),
    el("p", { text: t("error.load.body") }),
    el("p", { class: "muted", text: t("error.load.hint") }),
    el("pre", { class: "muted", text: String(err && err.message ? err.message : err) }),
  ]));
}

(async () => {
  const uiLocale = resolveLang();                              // ?lang= (walidowany) > zapis > PL
  const dataLocale = localeHasData(uiLocale) ? uiLocale : "pl"; // brak danych locale -> dane PL (bez crasha)
  setLocale(uiLocale);
  if (globalThis.document && globalThis.document.documentElement) globalThis.document.documentElement.setAttribute("lang", uiLocale);
  try { await ensureCatalog("pl"); } catch { /* katalog niedostępny — t() zwróci klucze */ }
  if (uiLocale !== "pl") { try { await ensureCatalog(uiLocale); } catch { /* fallback PL */ } }
  try {
    const data = await loadData(dataLocale);
    start(data, { uiLocale, dataLocale, ensureCatalog, loadData });
  } catch (err) { renderLoadError(err); }
})();
