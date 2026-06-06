# ADR-0010: System designu QualityCat — Produkcja = Mockupy

| Pole | Wartość |
|---|---|
| Status | Zaakceptowana |
| Issue | `#149 [M18]` (dokumentacja system designu — design-system.md + ADR-0010) |
| Rola decydenta | Product Owner (wygląd), Solution Architect (technika token-driven) |
| Powiązane | ADR-0002 (stack: vanilla CSS, zero buildu), ADR-0004 (i18n), DESIGN-PROPOSAL.md |

---

## Kontekst

Po M17 aplikacja QualityCat (szkolenie GenAI i LLM) była funkcjonalna, ale wizualnie „boxy i mało czytelne": ciężkie ramki wszędzie, sans-serif do czytania koncepcji 300-słownych, monotoniczna hierarchia, gradient dekoracyjny. Właściciel (Product Owner) zaaprobował propozycję UX/UI (DESIGN-PROPOSAL.md) i zlecił wdrożenie redesignu w M18 — **całość wizualna musi być produkcyjna i spójna z makietami** (mockup-01…05).

Decyzje projektowe są oparte na:
1. **WCAG 2.1 AA** — dostępność jest nienaruszalna (kontrast, focus, motion)
2. **ADR-0002** — zero buildu, czysty CSS Custom Properties, ZERO zależności runtime
3. **i18n na 8 locale** — reflow 320 px bez scrollu horyzontalnego
4. **Podmienność marki (P14)** — rebranding = zmiana tokenów, bez zmian kodu

---

## Decyzja

### 1. Token-driven design system (tokens.css = źródło prawdy)

Wszystkie wartości wizualne (kolor, typografia, spacing, elewacja, motion) są **zmiennymi CSS** w `tokens.css`:

```css
:root {                         /* Motyw CIEMNY */
  --color-bg:      #0F1219;
  --color-surface: #161A22;
  --color-fg:      #EAEDF3;
  /* ...itd */
}

:root[data-theme="light"] {     /* Motyw JASNY */
  --color-bg:      #F5F7FA;
  --color-surface: #FFFFFF;
  --color-fg:      #161922;
  /* ...itd */
}
```

**Rationale**: Zmiana marki/piaskownicy/parametrów stylu polega **wyłącznie** na edycji wartości w `tokens.css`. CSS selektory i HTML struktura pozostają niezmienione. Umożliwia A/B testy, adaptację do kolorów firmowych, adhocowe eksperymenty bez rebuild.

### 2. Rozdzielenie ramki dekoracyjnej od interakcyjnej (border-strategy)

**Propozycja** (DESIGN-PROPOSAL.md) miała:
- `--color-border: #2A3140` = dekoracyjny
- `--color-border-strong: #6B7588` = interakcyjny

**Implementacja** (tokens.css) zmienia nazewnictwo:
- `--color-border: #6B7588` = **interakcyjny** (kontrolki, opcje, inputs)
- `--color-border-strong: #6B7588` = alias zgodności (= `--color-border`)
- `--color-border-subtle: #2A3140` = **dekoracyjny** (separacje kart, linie tabel)

**Rationale**: Nazwa `--color-border-subtle` jest bardziej intuicyjna dla „cichej" separacji; alias `-strong` zachowuje zgodność z makietami bez duplikacji wartości. Wynika to z wdrażania: reguły CSS używają `--color-border` dla kontrolek, `--color-border-subtle` dla sekcji.

**Reguła CI**: `--color-border` i `--color-border-strong` muszą być ≥3:1 kontrastu na `--color-bg` i `--color-surface` (CI-gated przez `contrast.test.mjs`). `--color-border-subtle` jest wyłączony z WCAG 1.4.11 (nie niesie informacji o stanie kontrolki — to czysty separator).

### 3. Typografia — Serif do czytania, sans do chrome

| Kontekst | Font | Rationale |
|----------|------|-----------|
| UI, chrome, labels | `--font-base: system-ui, sans-serif` | Szybkie skanowanie, minimal wagi |
| Proza koncepcji, h1/h2/hero | `--font-reading: Georgia, serif` | Komfort czytania 300+ słów, premium |
| Parametry, kod, ASCII (S3) | `--font-mono: ui-monospace` | Przejrzystość liczb i instrukcji |

**Rationale**: MVP renderował koncepcje w sans 1rem — zmęczające. Serif w "optimal measure" (66ch) + interlinia 1.75 zmniejsza zmęczenie i podkreśla, że to jest czytana treść, nie UI. Mono dla S3 (gdzie każdy bit ma znaczenie) pomaga bez szkoды dla S1/S2.

### 4. Hierarchia typograficzna — 9 skoków (fs-300…fs-900)

| Token | Wartość | Użycie |
|-------|---------|--------|
| `--fs-300` | `0.8rem` | Etykiety, eyebrow, meta |
| `--fs-400` | `0.9rem` | Tekst UI |
| `--fs-500` | `1rem` | Domyślny, alias `--fs-base` |
| `--fs-600` | `1.2rem` | Subheading |
| `--fs-700` | `1.6rem` | Section heading (h2) |
| `--fs-800` | `2.2rem` | Module/result title |
| `--fs-900` | `clamp(2.4, 5vw, 3.4rem)` | **Hero display** (path-select, result) |

**Nowy**: `--fs-900` umożliwia **wyraźny hero** w path-select i na ekranie wyniku, skalujący się płynnie z viewportem. Responsive bez media query.

### 5. Prymitywy wizualne — STAGE A wpisane na stałe

**Issue #139** wprowadził trzy nowe prymitywy (w `primitives.css`), które stały się standardowymi hasłami designu:

- `.eyebrow` — UPPERCASE etykieta 0.8rem nad nagłówkami sekcji (np. „Twoja ścieżka" nad h1)
- `.hero__row` + `.hero__stat` — pasek liczbowy w hero (liczba modułów, ścieżek, czas nauki)
- `.section-head` — flex headera + eyebrow razem

**Reguła**: Te klasy są **haki DOM testowane** w `reskin-primitives.test.mjs` (issue #138). Ich usunięcie/zmiana przerwie CI. To celowe — zapobiegają regresji wizualnej między ekranami.

### 6. Akcent — Solidny domyślnie, gradient opcjonalnie

**DESIGN-PROPOSAL punkt 3**: Gradient niebiesko-fioletowy (`--grad-accent`) bywa „AI-slop" i w trybie `forced-colors` (wysoki kontrast, dostępność) jest niewidoczny (`background-clip:text`).

**Decyzja**:
- `.hero__accent` domyślnie: `color: var(--color-accent)` = solidny niebieski
- `.hero__accent--grad` = klasa dekoracyjna (STAGE D, `premium-polish`)
- Gradient nigdy nie jest nośnikiem informacji

**Reguła CSS**: Test `reskin-primitives.test.mjs` blokuje `@supports background-clip:text` na base `.hero__accent` — regresja do gradientu na domyślnym zostanie złapana.

### 7. Dostępność jako standard, nie opcja (WCAG 2.1 AA)

**Kontrast tekstowy**:
- `--color-fg` × `--color-bg`: **15.98:1 dark / 16.36:1 light** ✓ (AAA)
- `--color-muted` × `--color-bg`: **8.58:1 dark / 6.79:1 light** ✓ (AA)

**Kontrast UI**:
- `--color-border` × `--color-bg/surface`: **≥3:1** (CI-gated)
- `--color-accent` × tła: **≥6:1** (AA)
- `--color-ok/warn/bad`: **≥5:1** (AA)

**Statuses**: Zawsze **ikona + słowo**, nigdy sam kolor (WCAG 1.4.1). Np. status „completed" = zielona ikona + tekst „Ukończono".

**Focus**: `3px solid var(--color-accent)` + `outline-offset: 2px`, widoczny w obu motywach. Testowany ręcznie, asercja w `a11y-static.test.mjs`.

**Motion**: Wszystkie transakcje gaszone przez `@media (prefers-reduced-motion: reduce)` — żaden gradient/animation nie jest nośnikiem informacji.

**Reflow**: Layout poprawny przy **320 px** (WCAG 1.4.10) — brak horyzontalnego scrolla, touch targets ≥44 px.

### 8. i18n — Token-agnosticzny, content-driven

Zmienne CSS nie zawierają tekstu (strumienia UI). Każdy tekst pochodzi z `i18n/*.json` i wstrzykiwany przez `t()` w JS/HTML szablonach.

**Reguła**: Design system jest niezmienny dla wszystkich 8 locale (pl en es fr de it uk vi). Jeśli zmiana layoutu wymagana dla konkretnego locale (np. RTL w przyszłości), definiuj nowy token lub media query per-lang, **nie hardkoduj wartości**.

### 9. CSS split — Section-scoped modules (bez nanoszenia spaghetti)

Zamiast jednego 1500+ LOC `styles.css`, struktura:

```
styles.css
  ├─ @import "tokens.css"           [zmienne]
  ├─ @import "styles/primitives.css" [eyebrow, stats-strip, section-head]
  ├─ @import "styles/quiz-test.css"  [quiz + test]
  ├─ @import "styles/interactions.css" [blok interakcji, next-step-link]
  ├─ @import "styles/result-cert.css" [wynik, certyfikat]
  └─ [base + layout + nav + view + content + footer]
```

**Rationale**: Każdy `@import` to logiczne życzenie (prymitywy STAGE A, quiz+test STAGE B itd.). Umożliwia równoległy wdrażanie bez merge-conflicts i jasne śledzenie zależności. Wszystkie `@import` są **relative**, zgodnie z ADR-0002.

### 10. Motyw jasny + ciemny — Pełny override neutrali + akcentu

Zmienne w `:root[data-theme="light"]` **całkowicie zastępują** ciemne wartości — żaden `@media (prefers-color-scheme)` (user preference), tylko jawny toggle.

**Rationale**: User control (theme-toggle.js) jest bardziej jawny niż system preference. Obie palety weryfikowane CI — brak asymetrii dostępności.

### 11. Aliasy zgodności (immutable)

Nazwane tokeny (`--fs-base`, `--lh`, `--gap`, `--radius`, `--maxw-content`, `--focus`) to **stare wartości** ze starego MVP. Nigdy się nie usuwają, nawet jeśli są „aliasami" (`--fs-base = --fs-500`).

**Rationale**: Stary CSS (MVP, issue #3) odwołuje się do `--fs-base`. Złamanie aliasu = łamanie kontraktu z wdrażaniem MVP. Nowy CSS używa `--fs-700` itd., stary CSS kontynuuje `--fs-base`. Harmonijne rozdzielenie.

---

## Konsekwencje

- **Wizualna spójność**: Wszystkie 5 ekranów (path-select, module-hub, module-view, quiz+test, certificate) wygląda jednolicie — ta sama paleta, typografia, spacing, elewacja.
- **Dostępność**: Kontrast CI-gated, focus 3px testowany, motion gasony dla `prefers-reduced-motion`, reflow 320 px veryfikowany. WCAG 2.1 AA bez wyjątków.
- **Podmienność**: Rebrand (np. firma X zamiast QualityCat) = edycja `tokens.css`, bez zmian CSS/HTML/JS.
- **Performance**: Zero buildu (ADR-0002), CSS native custom properties (browser-native, zero JS overhead), gzip ~12 KB dla `styles.css` + `tokens.css`.
- **i18n**: 8 locale renderuje identycznie wizualnie; tekst pochodzi z JSON, nie CSS.
- **Test-driven**: `contrast.test.mjs` blokuje regresję koloru; `reskin-primitives.test.mjs` blokuje usunięcie haków DOM; `a11y-static.test.mjs` asercja reflow + focus.
- **Łatwa obsługa**: Jeden dev może zmienić wygląd bez npm/build — edytuj CSS, refresh browser.

---

## Relacja do innych ADR

- **ADR-0002** (stack vanilla): Potwierdzenie — CSS Custom Properties są native CSS, zero toolchaina. Struktura @import jest legalna per spec CSS.
- **ADR-0004** (i18n): System designu jest agnostyczny wobec locale — żaden token nie zawiera tekstu.
- **ADR-0006** (model ścieżek): Design nie zmienia kontraktu (S1/S2/S3/S4 reszta API). Typ ścieżki (`formative`) jest sygnalizowany klasą CSS (`.path-card--formative`).
- **ADR-0008** (maturity-check/MSH): Nie dotyczy — design system nie ma opinii o semantyce modułów.
- **ADR-0009** (S4 formatywna): Design system respektuje `finalTest:null` na S4 — test card jest pomijany w `module-hub` (brak `.hub-card--final`).

---

## Uwagi implementacyjne

- **Ścieżka relative**: Wszystkie `@import` w `styles.css` są **relative** (`"tokens.css"`, `"styles/primitives.css"`). GitHub Pages służy z roota — działa.
- **Fallback**: Żaden modern browser (Chrome, Firefox, Safari, Edge 2021+) nie wspiera CSS Custom Properties poniżej — fallback nie potrzebny. IE11 nieobsługiwany (ADR-0002).
- **Print**: Ekran wyniku jest drukowalny — `@media print` gaszy header/nav, pierścień score, scale wartość na czarno.
- **RTL**: Obecny CSS nie jest RTL-aware (nie ma flexów z `flex-direction: rtl-column` itp.). Gdyby dodać AR/HE w przyszłości, trzeba by dodać `[dir="rtl"]` selektor.

---

## Świadome decyzje projektowe (trade-offs)

1. **Gradient dekoracyjny NIE jest domyślny** — mogą być nieminne w forced-colors i mogą wyglądać jak AI-slop. Solidny akcent jest bardziej profesjonalny.
2. **Serif dla proz, nie dla całości UI** — sans dla chrome unika "czytelnej ale wolnej" wrażenia UI. Rozdział jasny.
3. **Kontrast > estetyka** — Jeśli piękna ikona ma < 3:1 kontrastu, idzie do CSS-sprite + dodatkowy tekst (WCAG 1.4.1).
4. **Reflow 320 px (WCAG 1.4.10)** — Twardszy próg niż 375 px (iPhone 6), ale zalecony standardowo. Testujemy przy 320, dopuszczamy 360 (real mobile).
5. **Brak gradient-text na `.hero__accent`** — background-clip:text jest niewidoczny w trybie high-contrast (dostępność wygrywa).

---

## Zatwierdzenie

- Właściciel potwierdza wygląd poprzez mockupy (DESIGN-PROPOSAL.md, mockup-01…05).
- Solution Architect potwierdza technikę (token-driven, @import, ADR-0002).
- Implementacja w M18 (issues #137…#151) — ten ADR to dokumentacja decyzji, które już wdrożone.
