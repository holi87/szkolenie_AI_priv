# Propozycja redesignu UX/UI — „Szkolenie GenAI i LLM” (QualityCat)

> **Faza 1 — do akceptacji.** Ten dokument + 5 makiet HTML (`mockup-01…05`). Zmieniamy **wyłącznie warstwę prezentacji**: `tokens.css`, `styles.css` oraz funkcje renderujące `assets/ui/*.js`. **Logika nietknięta** (`app.js`, `core/*`, dane `data/*`, routing, i18n `t()`). Po Twoim „OK” wytwarzam pliki repo (Faza 2).
>
> Punkt wyjścia: realne źródło z repo `holi87/szkolenie_AI_priv@main` (zaimportowane). Wszystkie haki DOM (`id`/klasa/`aria`/`[hidden]`) z poniższej tabeli są zachowane 1:1.

---

## (a) Kierunek wizualny — 6 zdań

1. **Czytelność ponad dekorację** — diagnoza problemu „mało czytelne”: MVP zamyka *wszystko* w ramkach o ciężkim borderze (`#67718a`/`#7c8493`) i renderuje 300-słowne koncepcje tym samym fontem UI co chrome; redesign rozdziela **ramkę dekoracyjną (hairline)** od **ramki interaktywnej (≥3:1)** i wprowadza **serif do czytania** (proza koncepcji) obok sans (UI) i mono (parametry/kod dla S3).
2. **Spokój i premium przez warstwy, nie przez efekty** — mniej widocznych krawędzi, więcej hierarchii: subtelne tła (`surface`/`surface-2`/`surface-3`), miękka elewacja, akcentowa linia tylko tam, gdzie niesie znaczenie (rekomendacja, moduł aktywny).
3. **Akcent zostaje niebieski (zaufanie, nie „AI-slop violet”)** — paleta to *ewolucja*, nie rewolucja: utrzymujemy sprawdzony akcent `#6ea8fe`/`#1d4ed8`, demotujemy gradient niebiesko-fioletowy do opcji dekoracyjnej i domyślnie używamy solidnego akcentu w hero.
4. **Rytm i skala** — większy kontrast w skali typograficznej, „eyebrow” nad nagłówkami sekcji, wyraźny „następny najlepszy krok”, oddech 8-punktowej siatki spacingu (bez zmian nazw tokenów).
5. **Dostępność jest wpisana w tokeny** — każda para tekst/tło ≥ 4.5:1 i każdy element/stan UI ≥ 3:1 zweryfikowane liczbowo w **obu** motywach (sekcja b); statusy zawsze ikona+tekst; focus 3 px o kontraście ≥ 3:1; reflow do 320 px.
6. **Marka podmienialna (P14)** — gniazdo logo + wordmark jako lockup; rebranding QualityCat = edycja `tokens.css`, bez dotykania reguł i logiki.

---

## (b) Zestaw tokenów — ewolucja `tokens.css`

> Format: `--token: wartość` + uzasadnienie. **Aliasy zgodności zachowane** (`--fs-base, --lh, --maxw-content, --radius, --gap, --focus`). Nowe tokeny **dodane**, nic nie usunięte/zmienione z nazwy.

### Kolor — motyw CIEMNY (domyślny)

| Token | Hex | Rola | Kontrast (para → wynik) |
|---|---|---|---|
| `--color-bg` | `#0F1219` | tło aplikacji | — |
| `--color-surface` | `#161A22` | karty, header | — |
| `--color-surface-2` | `#1E232E` | zagłębienia, opcje | — |
| `--color-surface-3` *(nowy)* | `#262C39` | element zaznaczony / nested | — |
| `--color-fg` | `#EAEDF3` | tekst główny | fg/bg → **15.98:1** ✓ |
| `--color-muted` | `#A7B0C0` | tekst drugorzędny | muted/bg → **8.58:1** ✓ |
| `--color-border` *(zmiana: subtelny)* | `#2A3140` | **ramka DEKORACYJNA** (separacja kart) | dekoracyjna — wyłączona z 1.4.11 |
| `--color-border-strong` *(nowy)* | `#6B7588` | **ramka INTERAKCYJNA** (kontrolki, input, ghost) | /bg → **4.04:1** ✓; /surface → **3.76:1** ✓ |
| `--color-accent` | `#6EA8FE` | link-na-tle ORAZ wypełnienie | /bg → **7.76:1** ✓; /surface → **7.22:1** ✓ |
| `--color-accent-fg` | `#07101F` | tekst na wypełnieniu akcentu | na `#6EA8FE` → **7.8:1** ✓ |
| `--color-accent-quiet` *(nowy)* | `#18233A` | tło zaznaczonej opcji/aktywnego stanu | fg/quiet → **13.4:1** ✓ |
| `--color-accent-2` | `#9C8CFA` | tylko gradient/dekoracja (nie tekst) | weryfikacja ręczna |
| `--color-ok` | `#4ADE80` | status „Ukończony” (tekst) | /bg → **10.75:1** ✓ |
| `--color-warn` | `#FBBF24` | ostrzeżenie | /bg → **11.22:1** ✓ |
| `--color-bad` | `#F87171` | błąd / niezaliczone | /bg → **6.77:1** ✓ |
| `--color-locked` | `#6B7280` | wyłączone (exempt) | /bg → **3.88:1** ✓ |

### Kolor — motyw JASNY (`:root[data-theme="light"]`)

| Token | Hex | Rola | Kontrast (para → wynik) |
|---|---|---|---|
| `--color-bg` | `#F5F7FA` | tło | — |
| `--color-surface` | `#FFFFFF` | karty, header | — |
| `--color-surface-2` | `#EDF0F5` | zagłębienia, opcje | — |
| `--color-surface-3` *(nowy)* | `#E3E8F0` | zaznaczone / nested | — |
| `--color-fg` | `#161922` | tekst główny | fg/bg → **16.36:1** ✓ |
| `--color-muted` | `#4F5765` | tekst drugorzędny | muted/bg → **6.79:1** ✓ |
| `--color-border` *(zmiana: subtelny)* | `#DCE1EA` | ramka DEKORACYJNA | dekoracyjna — wyłączona z 1.4.11 |
| `--color-border-strong` *(nowy)* | `#707A8B` | ramka INTERAKCYJNA | /bg → **4.04:1** ✓; /surface(białe) → **4.33:1** ✓ |
| `--color-accent` | `#1D4ED8` | link ORAZ wypełnienie | /bg → **6.24:1** ✓; biały/akcent → **6.70:1** ✓ |
| `--color-accent-fg` | `#FFFFFF` | tekst na akcencie | — |
| `--color-accent-quiet` *(nowy)* | `#E7EDFD` | tło zaznaczenia | fg/quiet → **14.99:1** ✓ |
| `--color-accent-2` | `#6D3FE0` | gradient/dekoracja | weryfikacja ręczna |
| `--color-ok` | `#127334` | status „Ukończony” | /bg → **5.55:1** ✓ |
| `--color-warn` | `#B45309` | ostrzeżenie | /bg → **4.68:1** ✓ |
| `--color-bad` | `#B91C1C` | błąd | /bg → **6.03:1** ✓ |
| `--color-locked` | `#5C6473` *(ciemniej niż MVP `#6b7280`)* | wyłączone | /bg → **5.55:1** ✓ |

> **Najważniejsza decyzja tokenowa:** rozdzielenie `--color-border` (dekoracyjny, cichy) i `--color-border-strong` (interaktywny, ≥3:1). MVP miał jeden ciężki border do wszystkiego — stąd „boxy/mało czytelne”. Reguła: krawędzie identyfikujące **kontrolkę lub jej stan** używają `*-strong` (WCAG 1.4.11); zwykła separacja kart/sekcji używa cichego `--color-border`. Kontrast tekstu i tak liczony do tła, nie do ramki.

### Typografia

| Token | Wartość | Dlaczego |
|---|---|---|
| `--font-base` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | UI/chrome — bez zmian, zero CDN |
| `--font-reading` *(nowy)* | `Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif` | **proza koncepcji + duże nagłówki** — komfort czytania, premium, system-only (ADR-0002) |
| `--font-mono` | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` | parametry, kod, ASCII-diagramy (S3) — bez zmian |
| `--fs-300…--fs-800` | `0.8 / 0.9 / 1 / 1.2 / 1.6 / 2.2 rem` | **bez zmian nazw** (zgodność) |
| `--fs-900` *(nowy)* | `clamp(2.4rem, 5vw, 3.4rem)` | hero — większy skok hierarchii |
| `--lh` (alias) | `1.65` *(z 1.6)* | nieco luźniej dla UI |
| `--lh-reading` *(nowy)* | `1.75` | proza koncepcji |
| `--maxw-reading` *(nowy)* | `66ch` | optymalna miara dla serif (≤75 znaków, design-baseline §4) |

### Spacing / Radii / Elevation / Motion

| Token | Wartość | Uwaga |
|---|---|---|
| `--sp-1…--sp-8` | `0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 3 / 4 rem` | bez zmian (siatka 8 px) |
| `--radius` (alias) | `10px` | bez zmian |
| `--radius-sm / -lg / -pill` *(nowe)* | `7px / 16px / 999px` | spójne zaokrąglenia |
| `--shadow-sm/md/lg` | miękkie, warstwowe (ciemny: czerń α; jasny: granat α) | mniej agresywne niż MVP |
| `--ring-accent` | `0 0 0 3px rgba(akcent, .35)` | stan focus/selected |
| `--dur-fast/base/slow`, `--ease` | `120 / 240 / 480 ms`, `cubic-bezier(.4,0,.2,1)` | bez zmian; gaszone `prefers-reduced-motion` |
| `--focus` (alias) | `3px solid var(--color-accent)` | bez zmian; offset 2 px |

---

## (c) Inwentarz komponentów → istniejące haki (drop-in dla JS)

| Komponent (redesign) | Plik render | Hak DOM zachowany | Zmiana prezentacji |
|---|---|---|---|
| Header + lockup marki | `index.html` | `.app-header`, `.brand`, `.brand__logo`, `.brand__name` | gniazdo logo + wordmark, grupowanie meta |
| Wskaźnik ścieżki | `shell.updateHeader` | `#path-indicator.path-badge` `[hidden]` | „eyebrow” pill, spokojniejszy |
| Przełącznik języka | `lang-switch.js` | `#lang-switch`, `#lang-switch-btn`, `#lang-switch-flag`, `.lang-switch__*`, `aria-haspopup/expanded` | restyl menu/triggera |
| Toggle motywu | `index.html` | `#theme-toggle`, `.theme-toggle__icon--dark/--light`, `.theme-toggle__label`, `aria-pressed` | bez zmian struktury |
| „Moduły” / reset | `index.html` | `#nav-toggle`, `#reset-btn`, `[hidden]` | spójne `.btn--ghost` |
| Nawigacja modułów | `shell.renderNav` | `#module-nav`, `.nav-item`, `.nav-item__btn`, `.status--*`, `aria-current`, `disabled`/`aria-disabled` | wyróżnienie aktywnego paskiem+tłem |
| Karta ścieżki | `path-select.js` | `.path-card`, `.path-card--recommended`, `.path-card--formative`, `.path-card__*`, `.btn.path-card__cta` | cicha ramka + akcent-rule rekomendacji |
| Hero | `path-select.hero` | `.hero`, `.hero__title`, `.hero__accent`, `.hero__lead` | serif display, solidny akcent (gradient opcjonalny) |
| Karta modułu (hub) | `module-hub.js` | `.hub-card`, `.hub-card--final`, `.status--*`, `.hub-card__*`, `.btn.hub-card__cta` | warstwa + status-pill ikona+tekst |
| „Następny krok” | `module-hub` / `app.js` | `.next-step`, `role="status"` | wyraźny baner kierunku |
| Treść modułu | `module-view.js` | `.module-screen`, `.definition`, `.callout--info/warn/safe`, `.content-table`, `.diagram`, `.block-links` | **serif proza**, callouty z ikoną |
| Quiz / pytanie | `quiz-view.js` | `fieldset.quiz-question`, `legend.quiz-question__prompt`, `.options`, `.option`, `.quiz-chips`, `.match-row`, `.seq-row`, `.feedback--correct/incorrect/critical` | hit-area ≥44 px, `accent-quiet` na zaznaczeniu |
| Interakcje | `interactions/*-view.js` | `.interaction--classify/rubric/tune/maturity`, `.classify-item`, `.rubric-crit`, `.tune-controls/-output/-checkpoint`, `.maturity-scale` | mono w panelu tune, czytelne fieldsety |
| Wynik | `certificate-view.js` | `.result-status--pass`, `.result__score(-value/-label)`, `.cert-gates`, `.cert-gate--ok/--fail`, `.weak-list`, `.result-notice--fail`, `.btn-row--export` | duży wynik serif, czytelne bramki |
| Footer | `index.html` | `.app-footer`, `#footer-note`, `#footer-privacy-link` | bez zmian struktury |

---

## (d) Co zostaje BEZ ZMIAN + gdzie redesign konkretnie poprawia UX

**Bez zmian (kontrakt, którego nie dotykam):** `assets/app.js`, `assets/core/*` (scoring, quiz-engine, test-engine, progress-store, paths, data-loader, certificate), routing, `data/*.json`, `i18n/*.json` (treści — wstrzykiwane przez `t()`), wszystkie `id`, klasy-haki, atrybuty `aria-*` ustawiane przez JS, zachowanie `[hidden]`, podpisy/parametry/callbacki funkcji render (`renderPathSelect`, `renderModuleHub`, `renderNav`, `renderScreens`, `renderQuestion`/`renderFeedback`, `renderClassify/Rubric/Tune/MaturityCheck`, `renderResult`). Status formatywny S4 (`finalTest:null`, brak testu/progu/certyfikatu) — uszanowany.

**Konkretne usprawnienia UX:**
- **Czytelność (główny ból):** proza koncepcji w serif, miara 66ch, interlinia 1.75 → mniej zmęczenia; chrome (sans) wizualnie oddzielony od treści (serif).
- **Mniej szumu:** karty/sekcje na cichej ramce + warstwie tła zamiast ciężkiego boxu wszędzie; ramka „mocna” tylko na kontrolkach (czytelny sygnał, gdzie można kliknąć).
- **Hierarchia:** wyraźniejszy hero, „eyebrow” nad sekcjami, mocniejszy „następny najlepszy krok”.
- **Dostępność bez regresji:** wszystkie pary przeliczone w obu motywach (sekcja b); hit-area opcji ≥ 44 px; focus 3 px; statusy ikona+tekst.
- **Spójność:** jeden zestaw promieni/cieni/odstępów; mono dla parametrów/kodu pomaga S3 bez szkody dla S1.

**Świadomy trade-off (a11y/i18n > estetyka):** gradient niebiesko-fioletowy NIE jest nośnikiem informacji i bywa „AI-slop” — demoty­wujemy go do solidnego akcentu (token `--grad-accent` zostaje dla zgodności). Cicha `--color-border` celowo bywa < 3:1 — dlatego krawędzie **interaktywne** zawsze idą przez `--color-border-strong` (≥3:1), a kontrast tekstu liczony jest do tła. Layout projektowany pod **320 px** (twardszy próg WCAG 1.4.10), weryfikowany przy 360 px.

---

## Makiety (Faza 1)
`mockup-01-path-select.html` · `mockup-02-module-hub.html` · `mockup-03-module-view.html` · `mockup-04-final-test.html` · `mockup-05-result-certificate.html`

Każda: jeden samodzielny plik, CSS inline, zero zależności/CDN, kopia w **języku polskim**. U góry pasek **podglądu makiety** (nie część produktu) z przełącznikami: **motyw ciemny/jasny** oraz **widok desktop / mobile 360 px** (realny reflow przez container queries).
