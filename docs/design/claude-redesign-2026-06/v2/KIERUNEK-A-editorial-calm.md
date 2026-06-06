# Kierunek A — „Editorial Calm"

> **Status: PROPOZYCJA.** Decyzja właściciela w review #150. Floor = mockup; ten kierunek celuje wyżej.
> **Teza:** premium dla ekranu czytanego godzinami robi **rytm typograficzny, oddech i hierarchia** —
> nie nowe kolory ani nowe fonty. Najniższy blast radius z trzech kierunków; zero ryzyka a11y/i18n.

---

## 1. Charakter (opisowo, ale zakotwiczony w liczbach)

Estetyka druku/editorial: duży, spokojny display-serif w hero i tytułach; hojny oddech między
sekcjami; akcent niesie znaczenie tylko tam, gdzie trzeba (rekomendacja, moduł aktywny, next-step).
Ramki dekoracyjne schodzą do hairline; rozróżnienie kart robi **cień i tło**, nie kolor obramowania.
Paleta i fonty **pozostają z live** — dzięki temu kontrast CI jest zielony bez przeliczania.

## 2. Delta tokenów (mierzalna — to jest wzorzec do wdrożenia)

| Token | Live | Kierunek A | Uzasadnienie |
|---|---|---|---|
| `--fs-900` (hero) | `clamp(2.4rem, 5vw, 3.4rem)` | `clamp(2.6rem, 5.5vw, 3.8rem)` | mocniejszy skok hierarchii; górny clamp 3.8 testowany 320 px |
| `--fs-800` | `2.2rem` | `2.3rem` | spójny skok między 700→900 |
| `--lh-tight` | `1.2` | `1.12` | ciaśniejsze duże nagłówki = editorial density |
| `--lh-reading` | `1.75` | `1.8` | dłuższy oddech prozy serif |
| `--sp-9` (NOWY) | — | `5rem` | oddech między sekcjami hub/module (alias, nie zmiana istniejących) |
| `--maxw-reading` | `66ch` | `62ch` | krótsza miara serif = wyższy komfort (≤70 znaków) |
| `--radius-lg` | `16px` | `14px` | mniej „bąbelkowo", bliżej druku |
| `--ls-eyebrow` (NOWY) | — | `0.16em` | mocniejszy letter-spacing eyebrow (live ~0.14em) |
| paleta (wszystkie `--color-*`) | — | **BEZ ZMIAN** | C3 spełnione trywialnie: ratio niezmienione, oba motywy |
| fonty (`--font-*`) | — | **BEZ ZMIAN** | C2 spełnione: zero nowych fontów |

> Nowe tokeny (`--sp-9`, `--ls-eyebrow`) **dodawane**, nic nie usuwane ani nie zmieniane z nazwy —
> aliasy zgodności (`--fs-base`, `--lh`, `--gap`, `--radius`, `--maxw-content`, `--focus`) nietknięte.

## 3. Nazwane komponenty (restyl istniejących klas, zero nowych haków)

| Komponent (klasa) | Zmiana prezentacji |
|---|---|
| `.hero__title` | `--fs-900` + `line-height: 1.05`, `letter-spacing: -0.02em`; większy `margin-bottom` (`--sp-5`) |
| `.section-head h2` / `.hub-section-heading` | `--fs-700`, serif, `letter-spacing: -0.01em` |
| `.eyebrow` | `letter-spacing: var(--ls-eyebrow)`; `margin-bottom: --sp-3` (więcej powietrza nad nagłówkiem) |
| `.hero__row` / `.hero__stat` | gap `--sp-6`; `.hero__stat b` na `--fs-700` serif (zachowane 3× stat) |
| `.module-screen p, .module-screen li` | `line-height: 1.8`, `max-width: var(--maxw-reading)` (62ch) |
| `.path-card` | hover/focus-within: `--shadow-md` + `transform: translateY(-2px)`, ramka zostaje hairline `--color-border-subtle` (kolor NIE niesie hovera) |
| `.hub-card` | jw.: cień+lift zamiast zmiany koloru ramki |
| `.definition`, `.callout--*` | większy `padding` (`--sp-5`), akcent-left 3 px |
| `.result__score-value` | serif, `--fs-800`+ ; pierścień `.result__score-inner` bez zmian struktury |

## 4. Motion (CSS-only, C6)

- Hover/focus: `transition: transform var(--dur-base) var(--ease), box-shadow var(--dur-base) var(--ease)`.
- Brak nowego JS, brak scroll-reveal. Gradient nie jest nośnikiem informacji.
- `@media (prefers-reduced-motion: reduce)`: wszystkie `transition`/`animation` → `none` (już w styles.css).

## 5. Jak ten kierunek czyści twarde ograniczenia

| Ograniczenie | Status | Jak |
|---|---|---|
| C1 ADR-0002 | ✓ | tylko edycja tokenów + restyl istniejących reguł, zero buildu |
| C2 fonty systemowe | ✓ | zero nowych fontów (Georgia/system-ui/mono zostają) |
| C3 kontrast oba motywy | ✓ | paleta niezmienna → `contrast.test.mjs` zielony bez recompute |
| C4 hero flat-accent | ✓ | `.hero__accent { color: var(--color-accent) }` nietknięte |
| C5 haki strukturalne | ✓ | restyl, nie usunięcie: eyebrow / 3×hero__stat / 4×sigil / score-inner / brand__* zostają |
| C6 motion CSS-only | ✓ | transitions w CSS, reduced-motion gasi |
| C7 i18n × 320 px | ✓ | clamp górny 3.8rem testowany 320 px; brak zmian layoutu; długie DE/FR mieszczą się (miara prozy krótsza) |
| C8 focus 3 px | ✓ | `--focus` nietknięte |
| C9 higiena plików | ✓ | delty mieszczą się w istniejących `styles/*.css`; ew. nowa sekcja editorial |
| C10 dane syntetyczne | ✓ | stats-strip derywowany z danych (bez zmian) |

## 6. Trade-offy (jawnie)

- **Plus:** najtańszy do wdrożenia, zero ryzyka regresji a11y/i18n, pełna odwracalność (same wartości).
- **Minus:** najmniej „efektowny" wizualnie — różnica vs floor jest subtelna (rytm, nie kolor).
  Jeśli właściciel oczekuje wyraźnego „wow" przy pierwszym spojrzeniu, B lub C dają mocniejszy sygnał.
- **Ryzyko `--lh-tight: 1.12`:** zbyt ciasne dla wielowierszowych nagłówków w długich locale —
  weryfikacja przy DE/FR na 320 px (jeśli kolizja: cofnąć do 1.15).

## 7. Wzorzec dla wdrożenia (#139–#145)

1. Dodać `--sp-9`, `--ls-eyebrow` do `tokens.css` (oba motywy dziedziczą; to nie kolory).
2. Zmienić wartości: `--fs-900`, `--fs-800`, `--lh-tight`, `--lh-reading`, `--maxw-reading`, `--radius-lg`.
3. Restyl komponentów z §3 w odpowiednich `styles/*.css` (hero/section w `primitives.css`/`styles.css`).
4. Uruchomić smoke (`fail 0`), `contrast.test.mjs` (zielony — paleta niezmienna), audyt 320/360 px DE/FR.
