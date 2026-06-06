// screens.mjs — KONTRAKT harnessu: definicja 5 ekranów = pojedyncze zrodlo prawdy laczace
// render PRODUKCYJNY z odpowiadajacym MOCKUPEM. Kazdy wpis deklaruje:
//   - id / label            : nazwa ekranu (do raportu i nazw plikow),
//   - prodUrl               : sciezka produkcji serwowana z korzenia repo,
//   - mockupUrl             : sciezka mockupa (FLOOR wygladu) serwowana z korzenia repo,
//   - seed                  : (opcjonalnie) snippet wykonywany W STRONIE PRZED bootem appki —
//                             uzywa REALNEGO store/paths z produkcji (import dynamiczny), wiec
//                             ksztalt progresu zawsze zgadza sie z logika produkcji (zero hand-rollu),
//   - reach                 : (opcjonalnie) selektor CTA do klikniecia PO boocie, gdy appka startuje
//                             na innym ekranie (router bootuje tylko path-select/hub — patrz app.js:126/167).
//   - arrival               : selektor DOWODU DOTARCIA — element istniejacy TYLKO na docelowym ekranie.
//                             Czekamy na niego TUZ PRZED zrzutem. Bez tego seed (async addInitScript,
//                             ktorego Playwright nie awaituje) moglby przegrac wyscig z bootem i CICHO
//                             zrzucic zly ekran (np. path-select zamiast hubu) — #137 zakazuje cichych pominiec.
//                             Gdy ekran nie dotrze → arrival.waitFor() timeoutuje → para oznaczona FAIL w raporcie.
//
// Dlaczego klikamy zamiast deep-linkowac: app.js przy boocie ustawia state.screen="menu" na sztywno
// (linia 126) i render() routuje wylacznie po getActivePath() (167–174) — NIE przywraca cursor.screen.
// Wiec module-view / test / wynik osiagamy realnym przejsciem UI (klik karty), co jest zarazem
// najwierniejszym odwzorowaniem sciezki uzytkownika.
//
// Wybor sciezek do seedu:
//   - S1 dla test-view i wyniku: jej bramki to overallThreshold + criticalQuestions (BEZ bramek
//     rubrykowych), wiec isFinalTestUnlocked() spelnia samo ukonczenie requiredModules — nie trzeba
//     recordPracticalTask. requiredModules(S1) = M1,M2,M7,M10,M11 (z data/paths.json).
//   - S2 dla hubu/modulu: bogatszy zestaw kart (lepszy material porownawczy).

export const PROD_INDEX = "/genai-llm-training/index.html";
const MOCKUP_DIR = "/docs/design/claude-redesign-2026-06";

// Wymagane moduly S1 — TYLKO do seedu „test odblokowany / wynik". Trzymane tu jawnie, ale walidowane
// w capture.mjs wzgledem data/paths.json (fail-fast, gdyby ktos zmienil sciezke S1) — bez cichej rozbieznosci.
export const S1_REQUIRED = ["M1", "M2", "M7", "M10", "M11"];

// --- Snippety seedu (string'i wykonywane jako addInitScript W KONTEKSCIE STRONY) ---
// Uruchamiaja sie ZANIM app.js wystartuje (addInitScript = po utworzeniu dokumentu, przed skryptami).
// Importuja PRODUKCYJNY store, wiec zapis do localStorage ma format identyczny z produkcja.

const seedActivePath = (pathId) => `
  (async () => {
    const { createProgressStore, createLocalStorageAdapter } =
      await import('/genai-llm-training/assets/core/progress-store.js');
    const store = createProgressStore(createLocalStorageAdapter());
    store.selectPath(${JSON.stringify(pathId)});
  })();
`;

const seedUnlockedFinalTest = (pathId, requiredModules) => `
  (async () => {
    const { createProgressStore, createLocalStorageAdapter } =
      await import('/genai-llm-training/assets/core/progress-store.js');
    const store = createProgressStore(createLocalStorageAdapter());
    store.selectPath(${JSON.stringify(pathId)});
    for (const id of ${JSON.stringify(requiredModules)}) {
      store.setModuleStatus(id, 'completed');
      store.setInlineQuizScore(id, 100); // wklad quizu inline; bez wplywu na samo odblokowanie
    }
  })();
`;

const seedPassedFinalTest = (pathId, requiredModules) => `
  (async () => {
    const { createProgressStore, createLocalStorageAdapter } =
      await import('/genai-llm-training/assets/core/progress-store.js');
    const store = createProgressStore(createLocalStorageAdapter());
    store.selectPath(${JSON.stringify(pathId)});
    for (const id of ${JSON.stringify(requiredModules)}) {
      store.setModuleStatus(id, 'completed');
      store.setInlineQuizScore(id, 100);
    }
    // Zaliczony test koncowy → hub pokaze „zobacz wynik", a showFinalTest() zrutuje na ekran wyniku
    // (app.js: finalTest.passed → showResult(buildResultFromProgress(...))). Dane SYNTETYCZNE.
    store.recordFinalTest({
      scorePct: 88,
      passed: true,
      criticalPassed: true,
      weakModules: [],
      questionResults: [],
    });
  })();
`;

export const SCREENS = [
  {
    id: "path-select",
    label: "Wybór ścieżki",
    prodUrl: PROD_INDEX,
    mockupUrl: `${MOCKUP_DIR}/mockup-01-path-select.html`,
    // Bez seedu: czysty localStorage → brak aktywnej sciezki → app bootuje na path-select.
    arrival: ".path-card",
  },
  {
    id: "module-hub",
    label: "Hub modułów",
    prodUrl: PROD_INDEX,
    mockupUrl: `${MOCKUP_DIR}/mockup-02-module-hub.html`,
    seed: seedActivePath("S2"),
    // Aktywna sciezka → app bootuje na hub (render(): getActivePath() → showMenu()).
    arrival: ".hub-card",
  },
  {
    id: "module-view",
    label: "Widok modułu",
    prodUrl: PROD_INDEX,
    mockupUrl: `${MOCKUP_DIR}/mockup-03-module-view.html`,
    seed: seedActivePath("S2"),
    // Boot → hub; klik pierwszej karty modulu → widok modulu.
    reach: ".hub-card:not(.hub-card--final) .hub-card__cta",
    arrival: ".module-title",
  },
  {
    id: "final-test",
    label: "Test końcowy",
    prodUrl: PROD_INDEX,
    mockupUrl: `${MOCKUP_DIR}/mockup-04-final-test.html`,
    seed: seedUnlockedFinalTest("S1", S1_REQUIRED),
    // Boot → hub z ODBLOKOWANYM testem; klik CTA karty testu koncowego → ekran testu.
    reach: ".hub-card--final .hub-card__cta",
    arrival: ".test-title",
  },
  {
    id: "result-certificate",
    label: "Wynik / certyfikat",
    prodUrl: PROD_INDEX,
    mockupUrl: `${MOCKUP_DIR}/mockup-05-result-certificate.html`,
    seed: seedPassedFinalTest("S1", S1_REQUIRED),
    // Boot → hub z ZALICZONYM testem; klik „zobacz wynik" → ekran wyniku/certyfikatu.
    reach: ".hub-card--final .hub-card__cta",
    arrival: ".result__score",
  },
];

// Motywy i szerokosci macierzy (wymog #137: dark+light, desktop/360/320).
export const THEMES = ["dark", "light"];
// `mockupVp` = ktory przycisk widoku w demo-toolbarze mockupa wcisnac, by mockup pokazal swoj uklad
// mobilny. Mockupy renderuja sie w demo-ramce (`.frame`) z wlasnym przelacznikiem `[data-vp-btn]` —
// uklad „mobile" NIE wynika z szerokosci viewportu, lecz z klasy `.frame.is-mobile` (toggle przyciskiem).
// Wiec dla waskich szerokosci wymuszamy mockupowi widok mobile, inaczej zrzut mockupa pokazywalby
// desktopowa ramke (mylace porownanie). Produkcja jest responsywna realnie → reaguje na sam viewport.
export const WIDTHS = [
  { id: "desktop", width: 1280, height: 900, mockupVp: "desktop" },
  { id: "w360", width: 360, height: 800, mockupVp: "mobile" },
  { id: "w320", width: 320, height: 800, mockupVp: "mobile" },
];

// Selektor realnego ekranu wewnatrz demo-ramki mockupa (bez toolbara `.mk-bar`) — cel zrzutu mockupa.
export const MOCKUP_FRAME = "#frame";
// Selektor przycisku widoku w toolbarze mockupa (wartosc = mockupVp powyzej).
export const MOCKUP_VP_BTN = (vp) => `[data-vp-btn="${vp}"]`;

// Klucz localStorage motywu appki (anti-flash w index.html czyta go PRZED CSS) — patrz assets/ui/theme.js.
export const THEME_KEY = "genai-training:theme";
