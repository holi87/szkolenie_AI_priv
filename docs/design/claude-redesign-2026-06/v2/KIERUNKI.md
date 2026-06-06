# Kierunki wizualne ponad mockupy (best-possible) — M18 #150

> **Status: PROPOZYCJA DO WYBORU PRZEZ WŁAŚCICIELA.** Ten dokument NIE przesądza wdrożenia.
> Decyzja, który kierunek (jeśli którykolwiek) wdrażają #139–#145 / #151, należy do właściciela
> w review PR. Mockupy = **floor (podłoga)**, nie sufit. Tu celujemy wyżej, w granicach
> twardych ograniczeń, których estetyka NIE może złamać.
>
> **Autor**: Solution Architect (#150, STAGE D). **Deliverable**: wyłącznie dokument (spec, nie kod).
> **Baseline faktów**: `genai-llm-training/assets/tokens.css`, `assets/styles.css` + `assets/styles/*.css`,
> `docs/design/design-system-qualitycat.md` (#149), `docs/design/claude-redesign-2026-06/DESIGN-PROPOSAL.md`,
> `mockup-01..05`. Smoke baseline w chwili pisania: **278 testów, pass 278, fail 0**.

---

## 0. Jak czytać ten dokument (i dlaczego nie ma w nim „mglistego premium")

Kryterium akceptacji #150 brzmi: *„#139–#145 mają jednoznaczny, mierzalny wzorzec do wdrożenia
(nie »mglisty premium«)."* Dlatego **każdy kierunek opisany jest jako mierzalna delta do warstwy
tokenów + nazwane zmiany istniejących komponentów CSS** — nie jako przymiotniki.

`tokens.css` jest udokumentowanym jedynym źródłem prawdy („rebranding = edycja tokenów, struktura
CSS bez zmian" — `design-system-qualitycat.md` §Wdrażanie). To daje nam trzy rzeczy naraz:

1. **Mierzalność** — kierunek = konkretne wartości {paleta hex, skala typo, rytm spacingu, radius,
   elewacja, motion} + lista nazwanych komponentów (w obrębie istniejących haków), które dostają restyl.
2. **Dowodliwa zgodność z ADR-0002** — edycja tokenów to *sankcjonowana* ścieżka zmiany; zero buildu,
   zero zależności runtime.
3. **Dowodliwa zgodność z kontraktem DOM/JS** — restyl tokenu/komponentu nie rusza ani jednego haka
   blokowanego testem.

Kierunek napisany jako „bardziej editorial, bardziej premium" **nie przechodzi** tego kryterium.
Kierunek napisany jako „`--fs-900` → `clamp(2.8rem, 6vw, 4rem)`, akcent → `#5B9BFE` (fg/bg 7.1:1),
głębia surface +1 krok" — **przechodzi**.

---

## 1. Twarde ograniczenia (NIEPRZEKRACZALNE) — wspólne dla WSZYSTKICH kierunków

Tiebreaker przy konflikcie (z brief #150 i z zasadami architekta):
**a11y > i18n > ADR-0002 > estetyka**, a w obrębie estetyki: *najprostsze, co wyczerpuje poprzeczkę
mockupów* i *odwracalność*. Żaden kierunek poniżej nie może naruszyć poniższych punktów — przy każdym
kierunku w §5 jest jawna kolumna „jak ten kierunek to czyści".

| # | Ograniczenie | Twarda granica | Czym egzekwowane |
|---|---|---|---|
| C1 | **ADR-0002 — statyczny hosting** | Zero npm/build/preprocesora/frameworka w `genai-llm-training/`. Czysty HTML/CSS/vanilla-ESM. Dane przez `fetch()`. | review + brak `package.json` w app |
| C2 | **Typografia: tylko stosy systemowe** | Brak Google Fonts / CDN. Jedyna legalna droga do custom-face to **self-hosted `@font-face` woff2** (static asset, bez buildu) — patrz §2, traktowana jako *budżet innowacji*, nie default. | review ADR-0002 |
| C3 | **Kontrast CI-gated, OBA motywy** | Każda para tekst/tło ≥ 4.5:1; każdy `--color-border` / `*-quiet` (UI) ≥ 3:1; dark **i** light. Każdy proponowany hex podany Z liczbą. | `contrast.test.mjs` |
| C4 | **Hero accent flat-by-default** | `.hero__accent { color: var(--color-accent) }`. Zakaz gradientu w `@supports background-clip:text` na **bazowej** `.hero__accent`. Gradient tylko jako opcjonalna `.hero__accent--grad`. | `reskin-primitives.test.mjs` (test „flat-accent") |
| C5 | **Haki strukturalne — restyl TAK, usunięcie NIE** | Muszą istnieć i renderować się: `.eyebrow`, `.hero__row` + **3×** `.hero__stat`, **4×** `.path-card__sigil` (S1–S4), `.result__score-inner`, `.brand__logo`, `.brand__sub`="QualityCat". | `reskin-primitives.test.mjs` |
| C6 | **Motion = CSS-only + reduced-motion** | Zero nowego JS (warstwa prezentacji). Brak scroll-reveal wymagającego IntersectionObserver. Gradient/motion nie niesie informacji. `prefers-reduced-motion: reduce` gasi wszystkie `transition`/`animation`. | `a11y-static`, review |
| C7 | **i18n 8 locale × reflow 320 px** | Zero hardkodowanych stringów user-facing (`i18n/*.json`). Brak poziomego scrolla przy **320 px** i 360 px — także dla najdłuższego locale (DE/FR compounds przy dużym display-type). | `a11y-static.test.mjs` (320 px), audyt locale |
| C8 | **Focus 3 px** | `:focus-visible` outline ≥ 3 px o kontraście ≥ 3:1, widoczny w obu motywach, offset 2 px. | `a11y-static` |
| C9 | **Higiena plików** | ~700–800 LOC/plik; nowy look → nowa sekcja `styles/*.css` + `@import`, bez buildu. | AGENTS.md, review |
| C10 | **Dane wyłącznie syntetyczne** | Stats-strip i wszystkie liczby derywowane z danych kursu, nie hardkodowane. | `reskin-primitives.test.mjs` |

**Wniosek architektoniczny dla wszystkich kierunków:** „best-possible" jest tu osiągane przez
**skalę, rytm, głębię warstw i precyzję koloru** — a NIE przez efekty, które łamią a11y lub ADR-0002.
To jest cecha, nie ograniczenie: ekran szkoleniowy czytany 2–6 h zyskuje na spokoju i hierarchii
bardziej niż na ozdobach.

---

## 2. Decyzja przekrojowa: czy `@font-face` mieści się w ADR-0002?

Rozstrzygam to **raz, dla wszystkich kierunków**, żeby żaden nie zakładał po cichu fontów z CDN:

- **CDN / Google Fonts: NIE.** Łamie ADR-0002 (zewnętrzna zależność runtime, third-party, prywatność).
- **Self-hosted `@font-face` woff2 (plik w repo, `font-display: swap`): DOPUSZCZALNE, ale budżetowane.**
  Technicznie zgodne z ADR-0002 (static asset, zero buildu, zero runtime-dep), ALE ma realny koszt:
  binarka w repo (iCloud „dataless" gotcha dotyczy też woff2), render-blocking/FOUT (`swap` łagodzi),
  weryfikacja licencji, +1 plik do utrzymania, ryzyko reflow 320 px przy innej metryce fontu.

**Reguła budżetu innowacji:** *najwyżej JEDEN* kierunek może wydać ten token, i musi jawnie nazwać
koszt. Pozostałe dwa kierunki zostają **wyłącznie na stosach systemowych** (`Georgia` serif / `system-ui`
sans / `ui-monospace` mono — dokładnie jak `--font-reading` / `--font-base` / `--font-mono` dziś).
„Premium" na stosach systemowych jest osiągalne — premium robi skala i rytm, nie krój pisma.

---

## 3. Punkt odniesienia: co JEST dziś na live (po STAGE A–C)

Istotne dla porównania: **live już implementuje floor mockupów.** STAGE A–C jest wdrożone —
split CSS (`styles/primitives.css`, `quiz-test.css`, `interactions.css`, `result-cert.css`),
prymitywy (`eyebrow`, `hero__row`, `hero__stat`, `section-head`), serif do prozy, rozdział
ramki dekoracyjnej/interakcyjnej, flat-accent hero. To NIE jest stara, „mało czytelna" produkcja —
to mockup-floor w kodzie. Każdy kierunek poniżej jest deltą **ponad ten zaimplementowany floor**.

**Fundament dziś (z `tokens.css`), do którego liczone są delty:**

| Wymiar | Wartość live (dark / light) |
|---|---|
| Tło / surface / surface-2 / surface-3 | `#0F1219` / `#161A22` / `#1E232E` / `#262C39` (dark) · `#F5F7FA` / `#FFFFFF` / `#EDF0F5` / `#E3E8F0` (light) |
| fg / muted | `#EAEDF3` / `#A7B0C0` (dark) · `#161922` / `#4F5765` (light) |
| accent / accent-2 | `#6EA8FE` / `#9C8CFA` (dark) · `#1D4ED8` / `#6D3FE0` (light) |
| Skala typo | `--fs-300..900`: `0.8 / 0.9 / 1 / 1.2 / 1.6 / 2.2 / clamp(2.4,5vw,3.4)rem` |
| Serif treść / sans chrome / mono | `Georgia…` / `system-ui…` / `ui-monospace…` |
| Radius | `7 / 10 / 16 / 999 px` (sm/base/lg/pill) |
| Elewacja | `shadow-sm/md/lg` miękkie warstwowe; `ring-accent 3px α0.35` |
| Motion | `120 / 240 / 480 ms`, `cubic-bezier(.4,0,.2,1)` |
| Mierniki | `--maxw-content 70ch`, `--maxw-reading 66ch` |

---

## 4. Trzy kierunki (każdy = mierzalna delta tokenów + nazwane komponenty)

Pełne specyfikacje per-kierunek w osobnych plikach. Tu skrót i delty kluczowe.

### Kierunek A — „Editorial Calm" (ewolucja floor, najniższy blast radius) → `KIERUNEK-A-editorial-calm.md`

Premium przez **rytm typograficzny i oddech**, nie przez nowe kolory. Serif zostaje `Georgia`,
sans zostaje `system-ui` — zero nowych fontów. Podbicie skali display, większe interlinie nagłówków,
hojniejszy spacing sekcji, hairline-akcent zamiast wypełnień.

**Delta tokenów (mierzalna):**

| Token | Live | Kierunek A | Powód |
|---|---|---|---|
| `--fs-900` | `clamp(2.4rem,5vw,3.4rem)` | `clamp(2.6rem,5.5vw,3.8rem)` | mocniejszy skok hero, wciąż 320-safe |
| `--lh-tight` | `1.2` | `1.12` | ciaśniejsze duże nagłówki = editorial |
| `--sp-8` (sekcje) | `4rem` | `5rem` (nowy alias `--sp-9: 5rem`) | więcej oddechu między blokami |
| `--maxw-reading` | `66ch` | `62ch` | krótsza miara serif = wyższy komfort |
| akcenty koloru | bez zmian | **bez zmian** (C3 spełnione trywialnie) | paleta zostaje, ratio niezmienione |
| `--radius-lg` | `16px` | `14px` | mniej „bąbelkowo", bardziej druk |

**Nazwane komponenty:** `.hero__title` (display +rytm), `.section-head` (eyebrow z większym
letter-spacing 0.16em), `.module-screen p/li` (interlinia 1.8, miara 62ch), `.path-card`
(hairline + cień zamiast koloru ramki na hover). Brak nowych klas; restyl istniejących.

### Kierunek B — „Deep Slate Premium" (głębia warstw + chłodniejszy akcent) → `KIERUNEK-B-deep-slate.md`

Premium przez **głębię tła (dark-tech)** i precyzyjne przesunięcie akcentu. Ciemny motyw schodzi
głębiej (bogatszy granat-slate), akcent lekko chłodniejszy/jaśniejszy dla „high-end tech" sznytu —
**z zachowanym ratio**. Light pozostaje konserwatywny (a11y > estetyka).

**Delta tokenów (mierzalna, z kontrastem):**

| Token (dark) | Live | Kierunek B | Kontrast (do nowego bg) |
|---|---|---|---|
| `--color-bg` | `#0F1219` | `#0B0E15` | głębsze tło |
| `--color-surface` | `#161A22` | `#13182240` → `#141923` | warstwa czytelna |
| `--color-surface-3` | `#262C39` | `#2A3142` | wyraźniejsza elewacja selected |
| `--color-accent` | `#6EA8FE` | `#5B9BFE` | fg-accent/bg ≈ **7.9:1** ✓ (do zweryfikowania CI) |
| `--color-fg` | `#EAEDF3` | `#EDF0F6` | fg/bg ≈ **16.5:1** ✓ |
| `--color-muted` | `#A7B0C0` | `#AAB3C3` | muted/bg ≈ **8.7:1** ✓ |

> Wszystkie nowe hexy: docelowo zweryfikowane liczbowo przez `contrast.test.mjs` PRZED wdrożeniem.
> Light motyw: **bez zmian** (już konserwatywny i CI-zielony) — zmieniamy tylko dark.

**Nazwane komponenty:** `.app-header` / `.view` / `.module-nav` (głębsza elewacja `shadow-md`),
`.path-card--recommended` (akcent-rule wyrazistsza), `.result__score-inner` (pierścień na nowym
akcencie). Motion bez zmian (C6).

### Kierunek C — „Signature Serif" (jedyny z budżetem `@font-face`) → `KIERUNEK-C-signature-serif.md`

Najambitniejszy: **jeden self-hosted font display** dla hero/nagłówków (np. Fraunces/Newsreader-klasy
serif variable, woff2), reszta na stosach systemowych. Wydaje JEDYNY token budżetu fontów (§2).
Premium przez wyrazisty, markowy krój nagłówków + kontrast z neutralnym chrome.

**Delta tokenów (mierzalna):**

| Token | Live | Kierunek C |
|---|---|---|
| `--font-display` (NOWY) | — | `"QC Display", Georgia, serif` — `@font-face` woff2, `font-display: swap` |
| `--font-reading` | `Georgia…` | **bez zmian** (proza zostaje systemowa) |
| `--fs-900` | `clamp(2.4,5vw,3.4)` | `clamp(2.8rem,6vw,4rem)` (font display udźwignie) |
| `--color-accent` / paleta | bez zmian | **bez zmian** (ratio zachowane trywialnie) |

**Koszt jawny (C2):** +1 binarka woff2 w repo (iCloud-dataless ryzyko), render-blocking/FOUT
złagodzony `font-display: swap` + fallback `Georgia` z dopasowaną metryką (`size-adjust` jeśli trzeba),
weryfikacja licencji OFL, ryzyko reflow 320 px przy innej szerokości glifów (wymaga testu locale DE/FR).
**To jednorazowy koszt one-way-ish** (font w repo, ale usuwalny — fallback systemowy zawsze działa).

**Nazwane komponenty:** wyłącznie `.hero__title`, `.module-title`, `.test-title`, `.result__score-value`,
`hub-section-heading` (zmiana `font-family` na `--font-display`). Proza (`.module-screen`) NIE rusza.

---

## 5. Porównanie: każdy kierunek vs LIVE (po STAGE A–C) vs MOCKUP (floor)

| Wymiar | MOCKUP (floor) | LIVE dziś | Kierunek A | Kierunek B | Kierunek C |
|---|---|---|---|---|---|
| **Typografia** | serif+sans+mono, fs-900 clamp(2.4,5,3.4) | = mockup (wdrożone) | rytm+, fs-900↑, lh-tight 1.12 | = live | **+1 display woff2**, fs-900 clamp(2.8,6,4) |
| **Kolor (dark)** | accent `#6EA8FE`, bg `#0F1219` | = mockup | = live (paleta niezmienna) | bg `#0B0E15`, accent `#5B9BFE` | = live |
| **Kolor (light)** | accent `#1D4ED8` | = mockup | = live | **= live (świadomie nietknięty)** | = live |
| **Layout** | hero+stats, karty auto-fill | = mockup | oddech sekcji +25% (`--sp-9`) | = live | = live |
| **Hierarchia** | eyebrow, hero, next-step | = mockup | mocniejszy skok display | głębia warstw sygnalizuje rangę | markowy krój nagłówków |
| **Motion** | hover/focus 240ms | = mockup | = live (CSS only) | = live | = live |
| **Detale premium** | flat-accent, hairline | = mockup | hairline+cień zamiast koloru ramki | bogata elewacja dark-tech | signature heading |
| **Blast radius** | — | — | **najmniejszy** (tylko tokeny+restyl) | średni (paleta dark, ratio recompute) | **największy** (binarka, FOUT, licencja, 320px-retest) |
| **Ryzyko a11y/i18n** | bazowe | bazowe | ~zero (paleta niezmienna) | wymaga recompute kontrastu dark | wymaga retestu reflow 320 px (metryka fontu) |
| **Odwracalność** | — | — | pełna (tylko wartości) | pełna (tylko wartości) | częściowa (fallback ratuje, ale binarka zostaje) |

**Wszystkie trzy ≥ mockup** (kryterium akceptacji #150: „co najmniej dorównuje mockupom, celuje
wyżej"). Floor jest spełniony przez sam live; każdy kierunek dokłada deltę ponad floor.

---

## 6. Jak każdy kierunek czyści twarde ograniczenia (jawnie)

| Ograniczenie | Kierunek A | Kierunek B | Kierunek C |
|---|---|---|---|
| C1 ADR-0002 build | ✓ tylko edycja tokenów | ✓ tylko edycja tokenów | ✓ woff2 = static asset, zero buildu |
| C2 fonty systemowe | ✓ zero nowych fontów | ✓ zero nowych fontów | ⚠ wydaje 1 budżet (`@font-face`), koszt nazwany §4 |
| C3 kontrast OBA motywy | ✓ paleta niezmienna → ratio zachowane | ⚠ wymaga recompute dark (hexy podane, do CI) | ✓ paleta niezmienna |
| C4 hero flat-accent | ✓ nietknięte | ✓ nietknięte | ✓ nietknięte |
| C5 haki strukturalne | ✓ restyl, nie usunięcie | ✓ restyl, nie usunięcie | ✓ restyl `font-family`, haki zostają |
| C6 motion CSS-only | ✓ | ✓ | ✓ |
| C7 i18n × 320 px | ✓ skala 320-safe | ✓ bez zmian layoutu | ⚠ wymaga retestu 320 px (metryka glifów DE/FR) |
| C8 focus 3 px | ✓ | ✓ (recompute ring na nowym accent) | ✓ |
| C9 higiena plików | ✓ | ✓ | ✓ (+1 asset, w limicie) |
| C10 dane syntetyczne | ✓ | ✓ | ✓ |

Legenda: ✓ czyści trywialnie · ⚠ czyści, ale wymaga jawnej pracy/weryfikacji przed wdrożeniem.

---

## 7. Rekomendacja (DECYZJA NALEŻY DO WŁAŚCICIELA)

**Rekomenduję Kierunek A — „Editorial Calm".**

Uzasadnienie wg tiebreakera *a11y > i18n > ADR-0002 > estetyka* + *najprostsze, co wyczerpuje
poprzeczkę, i odwracalność*:

1. **Najniższe ryzyko a11y/i18n** — paleta i fonty niezmienne, więc kontrast CI pozostaje zielony bez
   recompute, a reflow 320 px nie zmienia metryki. Zero nowych powierzchni awarii.
2. **Najmniejszy blast radius** — wyłącznie wartości tokenów + restyl istniejących komponentów;
   dowodliwie w kontrakcie DOM i ADR-0002. Najtańsze do wdrożenia przez #139–#145.
3. **Pełna odwracalność** — żadnego one-way-door (brak binarki, brak palety do przeliczenia).
4. **Realny zysk premium** — ekran czytany godzinami zyskuje najwięcej na rytmie i oddechu;
   „best-possible" dla treningu to czytelność i spokój, nie efekt.

**Kierunek B** to dobry wybór, jeśli właściciel chce wyraźnie „dark-tech premium" i akceptuje
jednorazowy koszt przeliczenia kontrastu dark (hexy już podane). **Kierunek C** rekomenduję tylko,
jeśli marka QualityCat ma mieć **rozpoznawalny, sygnaturowy krój** — wtedy świadomie wydajemy budżet
`@font-face` i płacimy retestem 320 px oraz utrzymaniem binarki.

> **Jednoznacznie: ten dokument nie przesądza wdrożenia.** Wybór kierunku to **one-way-ish door**
> (zwłaszcza C — binarka i metryka fontu). Decyzja należy do właściciela w review PR #150.
> Po wyborze: kierunek staje się mierzalnym wzorcem dla #139–#145 / #151; wszystkie nowe hexy
> kierunku B przechodzą `contrast.test.mjs` PRZED merge.

---

## 8. Pliki

- `docs/design/claude-redesign-2026-06/v2/KIERUNKI.md` — ten dokument (przegląd + porównanie + rekomendacja)
- `docs/design/claude-redesign-2026-06/v2/KIERUNEK-A-editorial-calm.md` — pełna spec A
- `docs/design/claude-redesign-2026-06/v2/KIERUNEK-B-deep-slate.md` — pełna spec B
- `docs/design/claude-redesign-2026-06/v2/KIERUNEK-C-signature-serif.md` — pełna spec C
