# M19 — Dociągnięcie wdrożenia do mockupów (premium parity, 5 ekranów)

**Data:** 2026-06-06
**Branch:** `m19-redesign-mockupy-premium`
**Approach:** A (zatwierdzony przez właściciela) — port kompozycji mockupów na istniejącą paletę Deep Slate, bez zmian DOM/kontraktu.
**Tryb:** wykonanie autonomiczne do PR; review właściciela dopiero na PR.

## Problem (zgłoszenie właściciela)

Live `ai-slop.win` „wygląda jak przed zmianami, nie pasuje do mockupów; treść po lewej, brzydka pusta przestrzeń po prawej". Zweryfikowane renderem (Playwright), NIE cache:

1. **Pusta przestrzeń / treść w lewo** — root cause: `.view__content { max-width: 70ch }` (~620 px) tnie ekran path-select. Karty `.path-cards` (auto-fit) wciskają się w 2×2 w lewej kolumnie ~620 px, reszta `.view` (do 1168 px) pusta. Hub ucieka przez `.hub-view { max-width:none }`; path-select NIE. Mockup-01 robi `view__content` z `max-width:none`.
2. **„Jak przed zmianami"** — `theme.js` + anti-flash w `index.html` defaultują na `prefers-color-scheme`. Jasny OS → light theme, gdzie M18 ≈ pre-M18 (białe karty, niebieski accent). Cała siła redesignu (Deep Slate) jest w DARK, którego użytkownik z jasnym OS nie widzi.
3. **Tytuły kart** — `path.card.name` = „S1 — Nietechniczna / decyzyjna" zamiast czystej nazwy roli z mockupa.

## Kluczowe ustalenie de-riskujące

JS apki **już emituje klasy mockupów** (`path-card__sigil/__name/__role/__badge`, `path-card--recommended/--formative`, `hero__row`, `eyebrow`, `section-head`, `hub-card*`, `path-progress*`). Tokeny w `tokens.css` to **superset** tokenów mockupa (`--color-accent-2`, `--grad-accent`, `--surface-3`, `--accent-quiet`, serif `--font-reading`, `--radius-lg/pill`). Więc redesign = **CSS + 1 default motywu + szablon i18n**, bez przebudowy DOM ani kontraktu.

## Decyzje właściciela (AskUserQuestion)

- Zakres: **wszystkie 5 ekranów**.
- Motyw domyślny: **dark dla każdego** (storage dalej priorytet, toggle działa).
- Nazwy ścieżek: **role jak mockup** — realizacja niskiego ryzyka: drop prefiksu „S1 —" z tytułu (sigil trzyma S1-S4), bez nowych tłumaczeń (`pathName` już w 8 locale).

## Zmiany

### Fundament
- `index.html` (anti-flash, linia 17): fallback `prefers-color-scheme` → `"dark"`.
- `assets/ui/theme.js` (`initTheme`): default `"dark"` (storage priorytet); `prefersDark` zachowany jako helper opcjonalny lub usunięty wraz z testem.
- `tests/smoke/theme.test.mjs`: aktualizacja oczekiwań defaultu na dark.
- `assets/styles.css`: path-select content `max-width:none` (modyfikator `.view__content--full` aplikowany w `path-select.js`); audyt szerokości pozostałych ekranów vs mockupy.

### i18n (8 locale)
- `assets/i18n/*.json`: `path.card.name` „{pathId} — {pathName}" → „{pathName}". Wyłącznie zmiana szablonu (zero nowej treści).

### Parytet per ekran (po render-diff vs mockup, dark)
- 01 path-select, 02 module-hub, 03 module-view, 04 test końcowy, 05 wynik/certyfikat — domknięcie różnic kompozycji/spacingu/elewacji/gradientu względem mockupów `docs/design/claude-redesign-2026-06/`.

### Wersja (ADR-0002, AGENTS „Wersjonowanie strony")
- `#app-version`: `v1.1` → `v1.2` + SHA commitu treści.
- `?v=1.1` → `?v=1.2` na `index.html` (link) ORAZ wszystkich 6 `@import` w `styles.css`.

## Bramki / niezmienniki
- Zero zmian w `data/paths.json`, schematach, ID ścieżek S1-S4, kontrakcie (cert/progress/maturity).
- WCAG: kontrast CI-gated (`contrast.test.mjs`) zielony dla obu motywów; statusy ikona+tekst; focus widoczny; reflow 320 px; reduced-motion.
- Walidacja danych 8 locale; smoke testy; a11y-static; pages-deploy.
- Limity LOC plików (styles.css blisko limitu — w razie potrzeby wydzielić partial zamiast pęcznieć).

## Weryfikacja
- Playwright render-compare każdego z 5 ekranów: app (dark) ↔ mockup (dark), desktop 1280/1920 + mobile 360.
- Pełny `run-tests.sh` zielony przed PR.
- PR: `Closes` issue M19; bump wersji; opis z checklistą i screenshotami przed/po.
