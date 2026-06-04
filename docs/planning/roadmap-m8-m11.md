# Roadmap M8–M11 (UX · randomizacja · i18n EN)

> Plan wygenerowany 2026-06-03 z udziałem 5 ról (UX, BA, Solution Architect, QA Architect, Lead).
> Artefakt referencyjny — źródłem prawdy są issues na GitHubie (#66–#84). Plik nieskomitowany; commit ewentualnie przez PR.

## Milestone'y i kolejność realizacji: **M8 → M9 → M10 → M11**

| Milestone | Temat | Issues |
|---|---|---|
| **M8** Randomizacja i anty-gaming quizów | Tasowanie pozycji odpowiedzi (RNG wstrzykiwalny, scoring po ID) + lint klastrowania pozycji w banku | #66, #67 |
| **M9** UX redesign i tooling a11y/QA | Design tokens, hero, header/progress, mikrointerakcje quizu, certyfikat, ikonografia SVG + QA-tooling (kontrast WCAG, RNG/snapshot) | #68–#75 |
| **M10** i18n — fundament wielojęzyczności | ADR-0004, ekstrakcja stringów + t(), przełącznik z flagą, data/pl/, walidacja parytetu | #76–#80 |
| **M11** i18n — wersja angielska (EN) | Katalog UI EN + strony statyczne, bank 116 pytań + module-content, rubryki/scenariusze, aktywacja EN + QA | #81–#84 |

## Tickety w kolejności wdrożenia (topologicznie)

| # | Issue | M | Typ | Prio | Zależy od |
|---|---|---|---|---|---|
| 1 | #66 RND-1 Losowanie pozycji odpowiedzi (wstrzykiwalny RNG) | M8 | frontend | p1 | — |
| 2 | #67 RND-2 Walidator rozkładu pozycji poprawnej odpowiedzi (lint) | M8 | assessment | p1 | — |
| 3 | #68 UX-1 Fundament design systemu (tokens.css, typografia, motion) | M9 | ux | p1 | — |
| 4 | #69 QA-1 Helper kontrastu WCAG na tokenach | M9 | qa | p1 | #68 |
| 5 | #70 QA-2 Deterministyczny RNG asercyjny + snapshot DOM-stub | M9 | qa | p1 | — |
| 6 | #71 UX-2 Hero + wybór ścieżki + slot przełącznika języka | M9 | ux | p2 | #68 |
| 7 | #72 UX-3 Header, nawigacja, progress + toggle motywu | M9 | frontend | p2 | #68, #71 |
| 8 | #73 UX-4 Widok quizu: mikrointerakcje + stany feedbacku | M9 | frontend | p2 | #68 |
| 9 | #74 UX-5 Certyfikat-nagroda (print/screenshot-safe) | M9 | frontend | p2 | #68 |
| 10 | #75 UX-6 Ikonografia inline SVG (status/feedback) | M9 | frontend | p2 | #68 |
| 11 | #76 I18N-1 ADR-0004 architektura i18n | M10 | architecture | p1 | — |
| 12 | #77 I18N-2 Ekstrakcja stringów UI + helper t() | M10 | i18n | p1 | #76 |
| 13 | #78 I18N-4 Przeniesienie treści do data/pl/ + carve-out | M10 | i18n | p1 | #76 |
| 14 | #79 I18N-3 Przełącznik języka (flaga + html lang + ?lang=) | M10 | i18n | p1 | #76, #77 |
| 15 | #80 I18N-5 Walidacja kompletności i parytetu locale | M10 | i18n | p1 | #76, #77, #78 |
| 16 | #81 I18N-6 Tłumaczenie UI EN + strony statyczne | M11 | content | p2 | #77, #79, #80 |
| 17 | #82 I18N-7 Tłumaczenie 116 pytań + module-content EN | M11 | content | p2 | #78, #80 |
| 18 | #83 I18N-8 Tłumaczenie rubryk/scenariuszy/etykiet EN | M11 | content | p2 | #78, #80 |
| 19 | #84 I18N-9 Aktywacja EN + QA obu wersji | M11 | qa | p2 | #81, #82, #83 |

## Ścieżka krytyczna

`#76 → #77 → #80 → #82 → #84` (I18N-1 → I18N-2 → I18N-5 → I18N-7 → I18N-9)

I18N-7 (#82, 116 pytań + 12 module-content, ~436K treści) = operacyjny bottleneck → ticket dopuszcza podział na 2 PR (questions vs module-content); parytet egzekwuje walidator z I18N-5.

## Decyzje architektoniczne (do potwierdzenia przy realizacji ADR-0004 / #76)

- **Układ danych i18n: A1 — katalogi per-locale `data/<lang>/`, PL kanoniczny.** Cutover = ~jedna linia (`data-loader.js` już ma `opts.basePath`). Odrzucone: nested-translations (przepisanie schematów, puchnięcie ×6 języków), ścieżki `/en/` (kłóci się z relatywnym hostingiem Pages, ADR-0002).
- `golden-set.json` **wspólny** (language-neutral ID). `modules.json`/`paths.json` mieszane → struktura gatingu single-source, stringi wyświetlane per-locale.
- **Parytet strukturalny** to sedno: `correct[]`, difficulty budget, 5 krytycznych, points, paths, gates identyczne PL↔EN. PL kanon, twardy błąd przy rozjeździe.
- **Core zostaje zero-i18n**: 2 stringi user-facing z core (`quiz-engine.js:9`, `certificate.js:61`) przechodzą do UI przez kody semantyczne.
- **ePrivacy**: preferencja języka w localStorage = „UI customisation" = strictly-necessary → spójne z ADR-0003, **bez banera** (jawny cross-ref w ADR-0004).

## Zależności miękkie (SOFT — nie modelowane jako hard dep, ważne przy realizacji)

- **UX → i18n**: żaden ticket I18N nie ma kodowej zależności od UX. M9 przed M10 wyłącznie po to, by **nie ekstrahować stringów dwa razy** po redesignie. Gdyby były wolne ręce, M9 i M10 mogą iść równolegle, ale ekstrakcja (#77) czeka na ustabilizowany UX.
- **UX-2 vs I18N-3**: UX-2 (#71) **rezerwuje** inertny slot `.lang-switch` w `app-header__meta`. I18N-3 (#79) ma **wpiąć logikę w istniejący slot**, nie tworzyć kontrolki od zera (treść #79 pisana, gdy slotu jeszcze nie było).
- **RND-1 → UX-4** (SOFT): RND-1 (#66) wprowadza sygnatury RNG w `renderQuestion/choiceList/matching` zanim UX-4 (#73) zmieni render w tym samym `quiz-view.js` → czystsze scalanie.

## Zasady wykonawcze (AGENTS.md)

- Każdy milestone = osobny branch + osobny PR; PR zamyka issue `Closes #N` (osobna linia per issue).
- M8: oba tickety (#66+#67) w jednym PR. M9: redesign + QA-tooling jeden PR. M10 fundament jeden PR. M11 EN — I18N-7 dopuszcza 2 PR.
- Pliki ≤700–800 LOC; UX-1 wydziela `tokens.css` (a11y-static czyta tylko `styles.css` — reguły komponentowe ZOSTAJĄ w styles.css, do tokens.css idzie TYLKO `:root`).
- Po zmianie shared engine/danych: testy WSZYSTKICH ścieżek S1/S2/S3.
