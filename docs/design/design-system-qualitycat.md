# System designu QualityCat — Tokens, Komponenty, DOM

> **Dokument**: Referencyjny spis zasobów wizualnych wdrożonych w M18.  
> **Źródło prawdy**: `genai-llm-training/assets/tokens.css`, `genai-llm-training/assets/styles.css` + sekcja `styles/*.css`.  
> **Stack**: HTML/CSS vanilla (ADR-0002), zero buildu, token-driven, oba motywy (ciemny/jasny).  
> **Dostępność**: WCAG 2.1 AA, kontrast CI-gated, focus 3px widoczny, reflow 320–1200 px.

---

## Tokeny — Fundament wizualny (`tokens.css`)

Zmienne CSS zawarte w `:root` (motyw ciemny) i `:root[data-theme="light"]` (motyw jasny). Każdy token to decyzja projektowa — rebranding zmienia tylko wartości, struktura CSS pozostaje stała.

### Paleta kolorów

#### Neutrali (obydwa motywy)

| Token | Ciemny | Jasny | Rola |
|-------|--------|-------|------|
| `--color-bg` | `#0F1219` | `#F5F7FA` | Tło strony, root |
| `--color-surface` | `#161A22` | `#FFFFFF` | Karty, shell, główny container |
| `--color-surface-2` | `#1E232E` | `#EDF0F5` | Zagłębienia, opcje, tła interakcji |
| `--color-surface-3` | `#262C39` | `#E3E8F0` | Element zaznaczony, nested containers |
| `--color-fg` | `#EAEDF3` | `#161922` | Tekst główny, domyślny kolor |
| `--color-muted` | `#A7B0C0` | `#4F5765` | Tekst drugorzędny, meta, etykiety |

**Kontrast tekstowy** (CI-gated przez `contrast.test.mjs`):
- `--color-fg` na `--color-bg`: ciemny **15.98:1**, jasny **16.36:1** ✓
- `--color-muted` na `--color-bg`: ciemny **8.58:1**, jasny **6.79:1** ✓

#### Ramki — Rozdzielenie dekoracyjne vs interakcyjne

| Token | Ciemny | Jasny | Rola | Kontrast CI |
|-------|--------|-------|------|------------|
| `--color-border` | `#6B7588` | `#707A8B` | **Interakcyjny** — kontrolki, opcje, ghost-btn, formularze | `/bg ≥3:1` ✓ |
| `--color-border-strong` | `#6B7588` | `#707A8B` | Alias zgodności (= `--color-border`); interakcyjny |  |
| `--color-border-subtle` | `#2A3140` | `#DCE1EA` | **Dekoracyjny** — separacje kart, tabele, diagramy; WCAG 1.4.11 wyłączony |  |

**Reguła**: Elementy interactive (input, select, option, ghost-btn, sigil) używają `--color-border`. Separacje czysto wizualne (card-edge, table-cell, callout-border) używają `--color-border-subtle`.

#### Akcent — Zaufanie, wzmocnienie, focus

| Token | Ciemny | Jasny | Rola |
|-------|--------|-------|------|
| `--color-accent` | `#6EA8FE` | `#1D4ED8` | Link, button fill, focus outline; /bg ≥7:1 ✓ |
| `--color-accent-fg` | `#07101F` | `#FFFFFF` | Tekst na wypełnieniu akcentu; ≥4.5:1 ✓ |
| `--color-accent-quiet` | `#18233A` | `#E7EDFD` | Tło zaznaczenia, active state; /bg ≥13:1 ✓ |
| `--color-accent-2` | `#9C8CFA` | `#6D3FE0` | Gradient dekoracyjny `--grad-accent`; **nie jako tekst** |

**Gradient**: `--grad-accent: linear-gradient(135deg, var(--color-accent), var(--color-accent-2))` — wyłącznie klasa `.hero__accent--grad` (opcjonalna, STAGE D).

#### Statusy — Ikona + słowo (WCAG 1.4.1)

| Token | Ciemny | Jasny | Rola |
|-------|--------|-------|------|
| `--color-ok` | `#4ADE80` | `#127334` | Status ukończony, zaznaczenie; /bg ≥10:1 ✓ |
| `--color-warn` | `#FBBF24` | `#B45309` | Ostrzeżenie, krytyczne; /bg ≥11:1 ✓ |
| `--color-bad` | `#F87171` | `#B91C1C` | Błąd, niezaliczone; /bg ≥6:1 ✓ |
| `--color-locked` | `#6B7280` | `#5C6473` | Wyłączone (exempt WCAG 1.4.3); /bg ≥3:1 ✓ |

### Typografia

| Token | Wartość | Zastosowanie |
|-------|---------|---|
| `--font-base` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | UI, chrome, chrome interakcji |
| `--font-reading` | `Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif` | Proza koncepcji, nagłówki h1/h2, hero-title, module-title, stat__b |
| `--font-mono` | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` | Parametry, kod, ASCII-diagramy (S3), module-meta |

**Skalowania**:

| Token | Wartość | Użycie |
|-------|---------|--------|
| `--fs-300` | `0.8rem` | Etykiety, eyebrow, meta |
| `--fs-400` | `0.9rem` | Tekst UI |
| `--fs-500` | `1rem` | (alias: `--fs-base`) — domyślny |
| `--fs-600` | `1.2rem` | Nagłówki subsekcji |
| `--fs-700` | `1.6rem` | Nagłówki sekcji (h2, hub-h1, module-title) |
| `--fs-800` | `2.2rem` | Duże nagłówki modułu/wyniku |
| `--fs-900` | `clamp(2.4rem, 5vw, 3.4rem)` | Hero-title (path-select, wynik) |

**Linie**:

| Token | Wartość | Użycie |
|-------|---------|--------|
| `--lh` | `1.65` | UI, kody, listy |
| `--lh-tight` | `1.2` | Nagłówki (h1, h2, h3) |
| `--lh-reading` | `1.75` | Proza koncepcji (`.module-screen p/li`) |

### Spacing — Siatka 8 px

| Token | Wartość | |
|-------|---------|---|
| `--sp-1` | `0.25rem` | Mikro-spacing |
| `--sp-2` | `0.5rem` | Minimal |
| `--sp-3` | `0.75rem` | Tight |
| `--sp-4` | `1rem` | **Base** (= `--gap`) |
| `--sp-5` | `1.5rem` | |
| `--sp-6` | `2rem` | |
| `--sp-7` | `3rem` | |
| `--sp-8` | `4rem` | Large sections |

### Wymiary (aliasy zgodności)

| Token | Wartość | Rola |
|-------|---------|------|
| `--radius` | `10px` | Domyślne zaokrąglenie (przyciski, karty) |
| `--radius-sm` | `7px` | Małe elementy |
| `--radius-lg` | `16px` | Duże karty, sidebar |
| `--radius-pill` | `999px` | Całkowicie okrągłe (badge, chip) |
| `--maxw-content` | `70ch` | Szerokość kontentu UI |
| `--maxw-reading` | `66ch` | Optymalna miara dla serif (WCAG 2.1 3.3.2) |
| `--gap` | `var(--sp-4)` | Główna przerwa grid'ów |

### Elewacja (cienie)

| Token | Wartość | Użycie |
|-------|---------|--------|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0, 0.30/0.10)` | Subtelny, baseline |
| `--shadow-md` | `0 8px 24px rgba(0,0,0, 0.36/0.10)` | Karty, hover |
| `--shadow-lg` | `0 20px 48px rgba(0,0,0, 0.48/0.16)` | Modali (zarezerwowane) |
| `--ring-accent` | `0 0 0 3px rgba(110,168,254, 0.35)` | Focus ring alternative |

### Motion (gesture-aware)

| Token | Wartość | Rola |
|-------|---------|------|
| `--dur-fast` | `120ms` | Mikro-animacje (icon flip, color blend) |
| `--dur-base` | `240ms` | Standardowa przejście (hover, state) |
| `--dur-slow` | `480ms` | Emphasis (enter animation, large transition) |
| `--ease` | `cubic-bezier(0.4, 0, 0.2, 1)` | Ease-in-out, materiał design |

**Gaszone przez** `@media (prefers-reduced-motion: reduce)` — wszystkie `transition` i `animation` ustawiane na `none`.

### Focus

| Token | Wartość | Specyfika |
|-------|---------|-----------|
| `--focus` | `3px solid var(--color-accent)` | Alias dla `:focus-visible` outline |

---

## Struktura CSS — Warstwy modułu

```
index.html
  ↓ <link href="assets/styles.css">
    ├─ @import "tokens.css"  [zmienne, obydwa motywy]
    ├─ @import "styles/primitives.css"  [prymitywy: eyebrow, stats-strip, section-head]
    ├─ @import "styles/quiz-test.css"  [quiz + test: test-title, test-meta, quiz-chip--crit, path-badge--eyebrow]
    ├─ @import "styles/interactions.css"  [interakcje: block, block__eyebrow, next-step-link, tune-output__label]
    ├─ @import "styles/result-cert.css"  [wynik/cert: result-hero, result-hero__main, result-status--fail, attempt-note]
    └─ [reguły base, header, buttons, layout, nav, view, cards, hero, content, feedback]
```

**Zasada**: `tokens.css` zawsze pierwszy (spec CSS). Sekcja-scoped CSS (`styles/*.css`) importowana kolejno — umożliwia logiczne grupowanie bez nadmiarowego mergowania.

---

## Komponenty — Mapa DOM do CSS

### Shell (index.html, theme.js, lang-switch.js)

| Komponent | Klasa CSS | Token | Rola |
|-----------|-----------|-------|------|
| Header sticky | `.app-header` | `surface`, `shadow-sm` | Zawiera brand + meta |
| Brand lockup | `.brand` | — | Flex: logo + name/sub |
| **Logo slot** (hak #138) | `.brand__logo` | `accent-quiet` border | 34×34px, `svg` wewnątrz |
| Brand name | `.brand__name` | `fg` | BOLD, 0.97rem |
| **Brand sub** (hak #138) | `.brand__sub` | `muted` | 0.68rem, UPPERCASE, "QualityCat" |
| Path badge | `.path-badge` | `surface-2` border | Pill, 0.22rem padding |
| Lang menu | `.lang-switch__*` | `surface`, `border` | Dropdown + flags |
| Theme toggle | `.theme-toggle__*` | `fg` | Icon swap light/dark |
| Footer | `.app-footer` | `muted`, `border-subtle` | Border-top separator |

### Layout & Navigation (shell.js)

| Element | Klasa | Token | Rola |
|---------|-------|-------|------|
| Layout grid | `.layout` | — | 2-col: nav (220–270px) + view; reflow 720px → 1-col |
| Module nav sidebar | `.module-nav` | `surface`, `border-subtle`, `shadow-sm` | Sticky-start, section-head |
| Nav item button | `.nav-item__btn` | `fg`, `accent-quiet` | Min-height 44px, inset accent-bar na active |
| Status icon | `.status--completed/in_progress/locked` | `ok/accent/locked` | Icon + badge color (WCAG 1.4.1) |
| Main view | `.view` | `surface`, `border-subtle`, `shadow-sm` | min-height 60vh |

### Path Select (path-select.js)

| Element | Klasa | Token | Rola |
|---------|-------|-------|------|
| Hero section | `.hero` | `border-subtle` separator | Serif title `--fs-900` |
| Hero accent | `.hero__accent` | `accent` solid | WCAG forced-colors: nie `background-clip:text` |
| Hero accent gradient (optional) | `.hero__accent--grad` | `grad-accent` | Klasa dekoracyjna, STAGE D only |
| **Eyebrow** (hak #138) | `.eyebrow` | `accent`, UPPERCASE | `fs-300`, `fw-bold`, letter-spacing 0.14em |
| **Stats strip** (hak #138) | `.hero__row` | — | Flex wrap, gap 1.4rem |
| **Stat item** (hak #138) | `.hero__stat` | `reading` font | `b` = `fs-700`, `span` = `fs-300` `muted` |
| Path cards grid | `.path-cards` | — | Auto-fill 240px minmax |
| Path card | `.path-card` | `surface`, `border-subtle` | Hover/focus-within transform + shadow |
| **Path card sigil** (hak #138 ×4) | `.path-card__sigil` | `surface-2`, `border` | 40×40px, S1/S2/S3/S4 ID |
| Card — rekomendowana | `.path-card--recommended` | `accent` + `border` color-mix | Top 3px rule `::before` |
| Card — formatywna S4 | `.path-card--formative` | `border` dashed, `accent-quiet` sigil | Wyraźne rozróżnienie |

### Module Hub (module-hub.js)

| Element | Klasa | Token | Rola |
|---------|-------|-------|------|
| Hub container | `.hub-view` | — | max-width none |
| Section heading | `.hub-section-heading` | `reading` font | `fs-700` |
| **Section head** (prymityw #139) | `.section-head` | — | Flex between, gap 1rem, flex-wrap |
| Hub card grid | `.hub-grid` | — | Auto-fill 15rem |
| Hub card | `.hub-card` | `surface`, `border-subtle` | Hover transform + `border` color |
| Card final (test) | `.hub-card--final` | `surface-2`, `border` dashed | Wyróżnienie testu |
| Status badge | `.hub-card__status` | `border-subtle`, `muted` | Pill z ikoną |
| Next step banner | `.next-step` | `accent-quiet`, `accent` border-left | `role="status"` |

### Module View (module-view.js)

| Element | Klasa | Token | Rola |
|---------|-------|-------|------|
| Screen wrapper | `.module-screen` | `border-subtle` separator | Serif prose: `lh-reading`, `maxw-reading` |
| Prose (p, li) | `.module-screen p/li` | `reading` font | `fs-reading` 1.1rem |
| Decision block | `.module-screen--decision` | `surface-2`, `accent` border-left | Highlighted callout |
| Definition | `.definition` | `surface-2`, `border-subtle` + `accent` accent-left | Serif, 1.05rem |
| Callout (info/warn/safe) | `.callout--*` | `warn/ok/accent` icon-color | `border-subtle` edge, `color-mix` tło |
| Module title | `.module-title` | `reading` font | `fs-800` |
| Module meta | `.module-meta` | `mono` font, `muted`, `border-subtle` | Monospace shards, `fs-300` |

### Quiz & Test (quiz-view.js, test-view.js)

| Element | Klasa | Token | Rola |
|---------|-------|-------|------|
| Test title | `.test-title` | `reading` font | `fs-800`, serif |
| Test meta | `.test-meta` | `muted` | "X pytań · Próg Y%" |
| Quiz item | `.quiz-item` | — | Margin wrapper |
| Question | `.quiz-question` | `surface`, `border-subtle` | Fieldset border wrapper |
| Prompt (legend) | `.quiz-question__prompt` | `fg`, `fw-medium` | `fs-600` |
| Question chip | `.quiz-chip` | `border-subtle`, `surface-2` | `fs-300`, pill |
| **Critical chip** (hak) | `.quiz-chip--crit` | `warn` border + bg | `color-mix` 10% |
| **Path badge eyebrow** (hak) | `.path-badge--eyebrow` | `accent`, `accent-quiet` | Uppercase, letter-spacing 0.08em |
| Options list | `.options` | — | Grid gap 0.5rem |
| Option | `.option` | `surface-2`, `border` | Min-height 44px, hover/focus `accent` |
| Option checked | `:has(input:checked)` | `accent-quiet`, `accent` border | Inset box-shadow |
| Feedback (correct/incorrect) | `.feedback--*` | `ok/bad/warn` border | Border-left 4px, `color-mix` tło |

### Interakcje modułowe (interactions/*-view.js)

| Element | Klasa | Token | Rola |
|---------|-------|-------|------|
| **Block chrome** | `.block` | `border` top, separator | margin-top 1.8rem, padding-top 1.4rem |
| **Block eyebrow** | `.block__eyebrow` | `accent`, UPPERCASE | Flex + icon, `fs-300` |
| **Next-step link** | `.next-step-link` | `border-strong` (interactive) | Flex row, `surface-2` bg, hover `accent-quiet` |
| Next-step label | `.next-step-link__label` | `muted` | UPPERCASE, letter-spacing 0.08em |
| Classify item | `.classify-item` | `border-subtle` | Flex col, `fw-medium` text |
| Rubric criterion | `.rubric-crit` | `border-subtle` | Name + prompt (muted) + feedback |
| Tune controls | `.tune-controls` | — | Grid auto-fit 180px |
| Tune control select | `select` | `surface`, `border` | Min-height 44px, `mono` font |
| **Tune output label** | `.tune-output__label` | `muted` | `fs-300`, UPPERCASE |
| Tune output | `.tune-output` | `surface-2`, `border-subtle` | Derywacja parametrów |
| Maturity scale | `.maturity-scale` | `border-subtle` | Radio grid, lista opcji |

### Certificate View (certificate-view.js)

| Element | Klasa | Token | Rola |
|---------|-------|-------|------|
| **Result hero** (hak) | `.result-hero` | — | Flex row/wrap 1.8rem gap; reflow <560px → col |
| **Result hero main** (hak) | `.result-hero__main` | — | Flex col, title + badge |
| **Score ring** (hak #138) | `.result__score-inner` | — | Z-index 1, center flex, relative |
| Score value | `.result__score-value` | `reading` font | `fs-2.4rem`, BOLD |
| Score label | `.result__score-label` | `muted` | UPPERCASE, letter-spacing 0.08em |
| **Result status fail** (hak) | `.result-status--fail` | `warn` | Ikona + "Niezaliczone" |
| Cert gates list | `.cert-gates__list` | — | Grid gap 0.45rem |
| Gate (ok/fail) | `.cert-gate` | `ok/bad` border-left | Icon + label, `color-mix` tło na fail |
| **Attempt note** | `.attempt-note` | `muted` | `fs-300`, "Wykorzystano X z Y podejść" |
| Weak modules list | `.weak-list` | `muted`, `maxw-reading` | Bullet points, `fs-300` |
| Export button row | `.btn-row--export` | `border-subtle` top sep | margin-top 1.4rem |

### Tabele, Diagramy, Listy

| Element | Klasa | Token | Rola |
|---------|-------|-------|------|
| Table wrapper | `.content-table__wrap` | — | Overflow-x auto |
| Table | `.content-table` | `border-subtle` cell | Collapse layout |
| Table th | `th` | `surface-2` bg | Bold header |
| Diagram ASCII | `.diagram__ascii` | `surface-2`, `border-subtle` | `mono` font |
| Block links | `.block-links` | — | Unordered ul, padding-left 1.1rem |

### Utilities

| Klasa | Rola |
|-------|------|
| `.loading` | `muted`, italic |
| `.muted` | `color: var(--color-muted)` |
| `.visually-hidden` | Dostępność, screen reader only |
| `.skip-link` | Focus-visible, top position on `:focus` |

---

## Responsywność

### Breakpoints (reflow WCAG 1.4.10)

| Widoczność | Próg | Zmiana |
|-----------|------|--------|
| **Desktop** | ≥720px | 2-col layout (nav + view) |
| **Tablet** | 480–720px | 1-col, nav hidden (toggle w header) |
| **Mobile** | <480px | Scaled reflow: hero `fs-700`, result-hero → col, next-step-link → col |
| **Minimal** | **320px** (CI-asserted) | Reflow testowany, brak horizontal scroll |

### Key sizes — Touch targets (WCAG 2.5.5)

- `.option`: min-height **44px** ✓
- `.nav-item__btn`: min-height **44px** ✓
- `.lang-switch__option`: min-height **44px** ✓
- `.tune-control select`: min-height **44px** ✓
- Button `.btn`: min-height **44px** ✓

---

## Dostępność — Wskaźniki

### Kontrast (CI-gated przez `contrast.test.mjs`)

- **Tekst × Tło**: wszystkie pary `≥4.5:1` (AA)
- **UI element × Tło**: wszystkie `--color-border` i `--color-*-quiet` `≥3:1` (AA)
- **Statusy**: zawsze **ikona + słowo**, nie sam kolor (WCAG 1.4.1)
- **Dekoracyjne**: `--color-border-subtle` wyłączone z WCAG 1.4.11 (separacje kart, linie tabel)

### Focus (`:focus-visible`)

- Outline: `3px solid var(--color-accent)` + `outline-offset: 2px`
- Border-radius: `4px`
- Widoczny w obu motywach

### Motion (prefers-reduced-motion)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition: none !important;
    animation: none !important;
    scroll-behavior: auto !important;
  }
}
```

Wszystkie `--dur-*` transakcje gaszone; gradient `--grad-accent` pominięty w forced-colors.

### Keyboard navigation

- Fieldsets bez border (min-width: 0)
- Legends max-width: 100%
- Selects max-width: 100%
- Wszystkie `role="status"` asynchronicznie aktualizowane

### Semantyka

- `<fieldset>` dla sekcji form
- `<legend>` dla `.quiz-question__prompt`
- `aria-current="page"` na `.nav-item__btn` active
- `aria-disabled="true"` na lockade nav items
- `aria-pressed` na `.theme-toggle` (state button)
- `role="status"` na `.next-step` (live region)

---

## Print (ekran wyniku)

```css
@media print {
  .app-header, .app-footer, .module-nav, .btn-row { display: none !important; }
  .result__score { background: none !important; }
  .result__score-value { color: #1d4ed8 !important; }
}
```

Pierścień score niedrukoway; wartość pozostaje czytelna na białym papierze.

---

## Konwencje CSS

1. **Zmienne zamiast wartości stałych** — żadnych hardkodowanych kolorów poza komentarzami
2. **Aliasy zgodności** — `--fs-base`, `--lh`, `--gap`, `--radius`, `--maxw-content`, `--focus` **nieusuwalne**
3. **Klasy BEM dla kompleksu** — `.component__part--variant` (np. `.hub-card__status`, `.result-status--fail`)
4. **Selektory min — specificity 1** — typ + klasa zamiast zagnieżdżenia
5. **Brak `!important`** poza `:focus-visible` i `@media print` (obrona)
6. **`color-mix()` dla przezroczystych tła** — `color-mix(in srgb, var(--color-X) %Y, transparent)`

---

## Wdrażanie i rozszerzalność

- **Zmiana marki**: edytuj `tokens.css` :root + :root[data-theme="light"], pozostaw CSS bez zmian
- **Nowe komponenty**: dodaj nową sekcję w `styles.css` albo nowy plik `styles/feature.css` + `@import` w `styles.css`
- **Zmiana responsywności**: rozszerz/zmień `@media` breakpoints, testuj przy 320, 480, 720, 1200 px
- **Dostępność**: zawsze testuj kontrast w `contrast.test.mjs` przed commit; fokus 3px weryfikuj keyboard nav

---

## Źródła

- `tokens.css` — zmienne CSS, obydwa motywy
- `styles.css` — reguły base, header, buttons, layout, nav, view, cards, hero, content, feedback, animations, print
- `styles/primitives.css` — eyebrow, hero__row, hero__stat, section-head
- `styles/quiz-test.css` — test-title, test-meta, quiz-chip--crit, path-badge--eyebrow
- `styles/interactions.css` — block, block__eyebrow, next-step-link, tune-output__label
- `styles/result-cert.css` — result-hero, result-hero__main, result-status--fail, attempt-note
- `contrast.test.mjs` — CI-gated kontrast wszystkich par
- `a11y-static.test.mjs` — reflow 320px, focus, fieldset min-width
