# Wdrożenie na GitHub Pages (issue #33)

Wiążący model hostingu: **GitHub Pages** (nadrzędne ograniczenie architektury — ADR-0002, `wymagania/08`
sekcja „Hosting i wdrożenie”). Aplikacja jest statyczna, bez backendu w runtime; ewentualny backend wyników
to osobny serwis poza Pages.

## 1. Aktualna konfiguracja

| Parametr | Wartość |
|---|---|
| Tryb publikacji | „Deploy from a branch” (legacy) — źródło `main`, katalog `/` (korzeń) |
| Domena | własna `ai-slop.win` (plik `CNAME` w korzeniu) |
| HTTPS | wymuszony, certyfikat zarządzany przez GitHub |
| `.nojekyll` | obecny w korzeniu — wyłącza Jekyll (foldery i pliki serwowane 1:1) |
| Strona główna | `index.html` w korzeniu → przekierowanie do `genai-llm-training/` |
| Aplikacja | `genai-llm-training/` (HTML + `assets/` + `data/`) |

Domena serwuje treść z **korzenia**, więc aplikacja działa pod `https://ai-slop.win/genai-llm-training/`,
a strona główna `https://ai-slop.win/` natychmiast przekierowuje do aplikacji (meta-refresh + link zapasowy bez
JS + `location.replace`).

## 2. Ścieżki względne (kryterium #33)

Wszystkie odwołania są **względne**, bez absolutnego korzenia `/`:

- `genai-llm-training/index.html`: `href="assets/styles.css"`, `src="assets/app.js"`.
- Dane: `assets/core/data-loader.js` używa bazy `"data/"` (względna) — działa też z podścieżki repo
  `https://<user>.github.io/<repo>/`, gdyby zrezygnowano z własnej domeny.
- Przekierowanie w korzeniu celuje w `genai-llm-training/` (bez wiodącego `/`).

Inwariant chroniony testem regresji: `genai-llm-training/tests/smoke/pages-deploy.test.mjs` (CI `frontend-tests`,
wyzwalany też przez zmiany `index.html`/`CNAME`/`.nojekyll`).

## 3. Jak aktualizować wdrożenie

Publikacja jest automatyczna z gałęzi `main`:

1. Zmiana przez PR (zasady w `AGENTS.md`: jeden temat = jeden PR, zielone CI, review).
2. Po merge do `main` GitHub Pages **przebudowuje** stronę automatycznie (zwykle do ~1–2 min).
3. Weryfikacja po wdrożeniu: otwórz `https://ai-slop.win/` (przekierowanie) i `…/genai-llm-training/` (aplikacja).

Brak kroku „build” — repo jest publikowane takie, jakie jest (statyczne pliki). Gdyby przejść na tryb „GitHub
Actions → Pages”, dodaje się workflow z `actions/deploy-pages`; **dziś niepotrzebny** (legacy branch build działa,
certyfikat HTTPS aktywny) i celowo nie zmieniamy działającej konfiguracji.

## 4. Smoke test wdrożonej wersji

Wykonany na **żywej** wersji `https://ai-slop.win/genai-llm-training/` (Playwright):

| Sprawdzenie | Desktop | Mobile 360 px |
|---|---|---|
| Strona ładuje się (HTTP 200, tytuł poprawny) | ✅ | ✅ |
| Render ekranu wyboru ścieżki (S1/S2/S3, pole imienia) | ✅ | ✅ |
| Dane `data/*.json` ładowane przez https (`paths.json` 200) | ✅ | ✅ |
| Layout bez przepełnienia w poziomie | ✅ | ✅ |
| Błędy JS w konsoli | **0** (aplikacja) | **0** (aplikacja) |

Jedyny wpis w konsoli to kosmetyczne `404 /favicon.ico` — **naprawione w tym wydaniu** (favicon inline SVG w
`genai-llm-training/index.html`). Po merge i przebudowie Pages konsola jest czysta.

> **Weryfikowane po merge:** przekierowanie z korzenia `https://ai-slop.win/` → aplikacja. Smoke powyżej dotyczy
> aktualnie wdrożonej aplikacji (podścieżka), która działa niezależnie od zmiany strony głównej. Po merge Pages
> przebuduje korzeń i strona główna przestanie pokazywać placeholder „w budowie”.
