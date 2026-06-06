# Harness wizualny — produkcja vs mockup (#137)

Lokalny, **opt-in** harness Playwright, który zestawia render **produkcyjny**
(`genai-llm-training/index.html`) z **mockupami** Claude-Design
(`docs/design/claude-redesign-2026-06/mockup-0X.html`) — ekran po ekranie,
w obu motywach i trzech szerokościach. Służy do oceny postępu reskinu M18
(„przed" vs floor wyglądu = mockupy).

> **To NIE jest bramka CI.** Zgodnie z ADR-0002 (statyczny hosting, zero runtime-deps,
> zero buildu) ten katalog jest **dev-only**: nie jest wpięty w żaden workflow
> (`frontend-tests.yml`/`validate-data.yml`), nie zawiera plików `*.test.mjs`,
> a `node_modules`/zrzuty PNG są **gitignore'owane**. Produkcja (`genai-llm-training/`)
> nie ma `package.json` i nie zyskuje żadnej zależności.

## Co pokrywa (brak cichych pominięć)

5 ekranów × 2 motywy (`dark`, `light`) × 3 szerokości (`desktop 1280`, `360`, `320`) = **30 par**:

| Ekran | Produkcja | Mockup |
| --- | --- | --- |
| `path-select` | `index.html` (czysty start → wybór ścieżki) | `mockup-01-path-select.html` |
| `module-hub` | seed aktywnej ścieżki S2 → hub | `mockup-02-module-hub.html` |
| `module-view` | hub → klik karty modułu | `mockup-03-module-view.html` |
| `final-test` | seed S1 (moduły ukończone) → klik testu | `mockup-04-final-test.html` |
| `result-certificate` | seed S1 (test zaliczony) → wynik | `mockup-05-result-certificate.html` |

Pary niepełne (gdyby ekran nie dał się osiągnąć) są **jawnie oznaczone w raporcie** — nigdy ciche.

## Jak działa (integracja — seam)

Appka to SPA bez routingu po URL: widoki przełącza stan w `localStorage`
(klucze `genai-training:*`). Harness **nie hardkoduje** kształtu progresu —
seed wykonuje się w stronie i wywołuje **prawdziwy** store produkcji
(`assets/core/progress-store.js`), więc zapis jest zawsze zgodny z logiką aplikacji.
Po boocie, dla ekranów do których router nie wchodzi wprost (moduł/test/wynik),
harness **klika realny CTA** (`.hub-card__cta`, `.hub-card--final .hub-card__cta`) —
najwierniejsze odwzorowanie ścieżki użytkownika.

**Dowód dotarcia (bez cichych pominięć):** przed każdym zrzutem produkcji harness czeka
na element istniejący tylko na docelowym ekranie (`.path-card`, `.hub-card`, `.module-title`,
`.test-title`, `.result__score`). Jeśli seed przegra wyścig z bootem i appka zostanie na złym
ekranie → timeout → para oznaczona **FAIL** w raporcie (nigdy zły zrzut po cichu). `localStorage`
jest czyszczony przed każdym ekranem, więc kolejność ekranów nie jest nośna (deterministyczność).

**Mockupy** renderują się w demo-ramce (`.frame`) z własnym toolbarem (motyw + widok). Harness:
wymusza motyw atrybutem `data-theme` (skrypt mockupa nie inicjalizuje motywu na load — brak nadpisania),
dla wąskich szerokości klika przycisk **„Mobile 360"** mockupa (`[data-vp-btn="mobile"]`, bo układ
mobilny mockupa to klasa `.frame.is-mobile`, nie szerokość okna), i zrzuca **sam ekran** (`#frame`,
bez demo-toolbara) — czyste porównanie 1:1 z produkcją. Motyw produkcji wymuszany kluczem
`genai-training:theme`.

Działa **offline**, bez CDN: jeden statyczny serwer Node serwuje całe repo,
a oba źródła rozwiązują zasoby ścieżkami względnymi.

## Uruchomienie

Wymaga Node 18+ oraz Playwrighta zainstalowanego **lokalnie w tym katalogu**
(nie commitujemy `node_modules`):

```bash
cd genai-llm-training/tests/visual
npm i                          # ściąga playwright (devDependency, gitignore'owany)
npx playwright install chromium
npm run capture                # albo: node capture.mjs
```

Wynik:

- `output/shots/*.png` — pełnostronicowe zrzuty (`<ekran>__<motyw>__<szerokość>__{prod,mockup}.png`),
- `output/report.html` — **raport „obok siebie"** (produkcja | mockup) — otwórz w przeglądarce.

Cały katalog `output/` jest regenerowalny i gitignore'owany.

## Decyzje projektowe

- **Biblioteka `playwright`, nie `@playwright/test`.** Zbieramy własną macierz i
  emitujemy własny raport side-by-side; runner testowy nic tu nie wnosi (i jego raport
  ma złą formę). „Jedna komenda" = `node capture.mjs`. Pliki nazwane `capture.mjs`/`*.mjs`
  (nie `*.test.mjs`) — celowo poza globem smoke (`tests/smoke/*.test.mjs`).
- **Brak pixel-diffa / bramki pass-fail.** Produkcja jest dziś **świadomie** różna od
  mockupów (to baseline „przed"). Próg pikselowy oflagowałby oczekiwaną różnicę jako
  błąd i dołożyłby zbędną zależność. Raport **pokazuje** różnice do oceny człowieka.
- **Zrzuty PNG gitignore'owane (nie commitowane).** Binaria puchną w historii, a repo
  jest na iCloud (churn „dataless 0 B"). Baseline odtwarzasz jedną komendą; minimalizm
  zależności = ADR-0002.
- **`package.json` tylko tutaj, dev-only.** Zakaz dotyczy `package.json` w
  `genai-llm-training/` i committed `node_modules` — ten manifest istnieje wyłącznie,
  by `npm i` w TYM katalogu ściągnął Playwrighta.

## Ograniczenia / uwagi

- Seed „test odblokowany/wynik" używa ścieżki **S1** (jej bramki to overallThreshold +
  criticalQuestions, bez bramek rubrykowych → wystarczy ukończyć `requiredModules`).
  `capture.mjs` waliduje `S1_REQUIRED` względem `data/paths.json` przy starcie i failuje
  głośno, jeśli ścieżka się zmieni (bez cichej rozbieżności).
- Środowisko bez przeglądarki: jeśli Playwright/Chromium nie jest zainstalowany, skrypt
  kończy się czytelnym komunikatem `exit 2` (instrukcja instalacji powyżej), nie crashem.
