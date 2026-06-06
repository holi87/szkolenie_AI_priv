# Kierunek C — „Signature Serif"

> **Status: PROPOZYCJA.** Decyzja właściciela w review #150. Floor = mockup; ten kierunek celuje wyżej.
> **Teza:** najambitniejszy — marka QualityCat dostaje **rozpoznawalny, sygnaturowy krój** dla
> nagłówków/hero (jeden self-hosted font display, woff2). To JEDYNY kierunek wydający budżet
> `@font-face` (decyzja przekrojowa §2 KIERUNKI.md). Największy blast radius i jedyny z elementem
> one-way-ish (binarka + metryka fontu). Rekomendowany tylko, jeśli właściciel chce sygnaturowej marki.

---

## 1. Charakter

Hero, tytuły modułów, tytuł testu i wartość wyniku dostają wyrazisty display-serif (klasa
Fraunces / Newsreader / Source Serif — variable woff2, OFL). Kontrast z neutralnym chrome
(`system-ui`) i prozą (`Georgia` zostaje systemowa) tworzy markowy, „magazynowy" charakter.
Paleta i mono **bez zmian**. Premium tu robi **krój nagłówków**, nie kolor.

## 2. Delta tokenów

| Token | Live | Kierunek C | Uwaga |
|---|---|---|---|
| `--font-display` (NOWY) | — | `"QC Display", Georgia, "Times New Roman", serif` | `@font-face` woff2, `font-display: swap`, fallback Georgia |
| `--font-reading` | `Georgia…` | **BEZ ZMIAN** | proza zostaje systemowa (komfort, zero FOUT w bloku tekstu) |
| `--font-base` / `--font-mono` | systemowe | **BEZ ZMIAN** | chrome i parametry bez zmian |
| `--fs-900` (hero) | `clamp(2.4rem,5vw,3.4rem)` | `clamp(2.8rem, 6vw, 4rem)` | display-serif udźwignie większą skalę |
| `--fs-800` | `2.2rem` | `2.4rem` | spójny skok |
| paleta (`--color-*`) | — | **BEZ ZMIAN** | C3 spełnione trywialnie, oba motywy |

### Definicja `@font-face` (spec, nie implementacja)

```css
/* tokens.css lub styles/fonts.css — static asset, ADR-0002 (zero buildu, plik w repo). */
@font-face {
  font-family: "QC Display";
  src: url("../fonts/qc-display.woff2") format("woff2"); /* ścieżka WZGLĘDNA — GitHub Pages */
  font-weight: 400 700;            /* variable, jeśli wybrany font wariant ma osie */
  font-display: swap;              /* fallback Georgia widoczny natychmiast, brak FOIT */
  size-adjust: 100%;               /* dostroić, by metryka ≈ Georgia → minimalny reflow przy swap */
}
```

## 3. Nazwane komponenty (TYLKO zmiana `font-family`, zero nowych haków)

| Komponent | Zmiana |
|---|---|
| `.hero__title` | `font-family: var(--font-display)`; `--fs-900` 2.8→4rem |
| `.module-title` | `font-family: var(--font-display)`; `--fs-800` |
| `.test-title` | `font-family: var(--font-display)` |
| `.result__score-value` | `font-family: var(--font-display)` (duża liczba w pierścieniu `.result__score-inner`) |
| `.hub-section-heading`, `.section-head h2` | `font-family: var(--font-display)` |
| `.module-screen p, li` (proza) | **BEZ ZMIAN** — zostaje `--font-reading` (Georgia systemowa) |

> Proza świadomie NIE dostaje display-fontu: bloki 300-słowne na display-serif męczą i powiększają
> ryzyko reflow 320 px. Display-font tylko na krótkich, dużych nagłówkach.

## 4. Motion (CSS-only, C6)

Bez nowego motion. Jedyne „ruchome" to `font-display: swap` (przejście fallback→display) —
to nie jest animacja CSS i nie podlega `prefers-reduced-motion`; `swap` minimalizuje skok przez
`size-adjust` dopasowany do Georgia.

## 5. Jak ten kierunek czyści twarde ograniczenia

| Ograniczenie | Status | Jak |
|---|---|---|
| C1 ADR-0002 build | ✓ | woff2 = static asset, ścieżka względna, zero buildu/CDN/runtime-dep |
| C2 fonty systemowe | ⚠ | **wydaje 1 budżet `@font-face`** (§2 KIERUNKI.md); koszt nazwany §6 |
| C3 kontrast oba motywy | ✓ | paleta niezmienna → `contrast.test.mjs` zielony (font nie zmienia ratio) |
| C4 hero flat-accent | ✓ | `.hero__accent` zostaje `color: var(--color-accent)` solid — tylko font się zmienia |
| C5 haki strukturalne | ✓ | zmiana `font-family`, haki (eyebrow/hero__stat/sigil/score-inner/brand__*) zostają |
| C6 motion CSS-only | ✓ | zero nowego JS; `swap` nie jest animacją |
| C7 i18n × 320 px | ⚠ | **wymaga retestu reflow 320 px** — display-font ma inną szerokość glifów; długie DE/FR + `fs-900 4rem` to ryzyko overflow. `size-adjust` + clamp łagodzą; test obowiązkowy |
| C8 focus 3 px | ✓ | `--focus` nietknięte |
| C9 higiena plików | ✓ | +1 plik fontu (`assets/fonts/`), `@font-face` w `tokens.css`/`styles/fonts.css`, w limicie |
| C10 dane syntetyczne | ✓ | bez zmian |

## 6. Koszt jawny (budżet innowacji — to jest cena tego kierunku)

1. **Binarka woff2 w repo** — podlega iCloud „dataless" gotcha (plik bywa 0 B; `cat`/`git status`
   materializuje). +1 asset do utrzymania i wersjonowania.
2. **Licencja** — wymagany font OFL/permissive (Fraunces/Newsreader/Source Serif są OFL). Weryfikacja
   licencji to gate przed wdrożeniem.
3. **FOUT / render** — `font-display: swap` daje fallback Georgia natychmiast; skok przy zamianie
   minimalizowany przez `size-adjust`. Bez `swap` byłby FOIT (niewidoczny tekst) — niedopuszczalne.
4. **Reflow 320 px** — display-font + większy `--fs-900` zwiększa ryzyko poziomego scrolla przy
   najdłuższych locale (DE/FR compounds). **Obowiązkowy retest 320/360 px na wszystkich 8 locale.**
5. **One-way-ish** — usunięcie fontu możliwe (fallback Georgia zawsze działa), ALE binarka i decyzja
   markowa to zobowiązanie; wpisuje się w „decyzje odwracalne, dopóki nie są".

## 7. Trade-offy (jawnie)

- **Plus:** jedyny kierunek dający **rozpoznawalną, sygnaturową markę** — najsilniejszy „wow" i
  najbardziej „best-possible ponad mockupy" wizualnie.
- **Minus:** największy blast radius i jedyny z realnym kosztem operacyjnym (binarka, licencja,
  retest 320 px, FOUT). Najmniej odwracalny z trzech.
- **Ryzyko:** jeśli `size-adjust` nie dostroi metryki, swap da widoczny skok layoutu — gorsze
  wrażenie niż brak custom-fontu. Wymaga staranności wdrożeniowej.

## 8. Wzorzec dla wdrożenia (#139–#145, #148)

1. Wybrać font OFL (rekomendacja: variable serif klasy Newsreader/Fraunces), pobrać woff2,
   umieścić w `genai-llm-training/assets/fonts/qc-display.woff2`.
2. Dodać `@font-face` (§2) + `--font-display` do `tokens.css` (lub `styles/fonts.css` + `@import`).
3. Zmienić `font-family` na `var(--font-display)` w komponentach z §3; podbić `--fs-900`/`--fs-800`.
4. Dostroić `size-adjust` tak, by metryka ≈ Georgia (minimalny skok przy `swap`).
5. **Obowiązkowo:** smoke `fail 0`, contrast zielony (niezmieniony — font nie rusza koloru),
   **retest reflow 320/360 px na wszystkich 8 locale** (to jest gate tego kierunku).
