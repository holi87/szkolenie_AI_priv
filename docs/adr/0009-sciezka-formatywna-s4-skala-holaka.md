# ADR-0009: Ścieżka formatywna S4 „Skala Holaka" — diagnoza + szkolenie, bez testu/certyfikatu

| Pole | Wartość |
|---|---|
| Status | Zaakceptowana |
| Issue | `#112–#118 [M15]` (ADR + kontrakt ścieżek + kontrakt modułów + przeniesienie MSH + treść + UI + wpięcie) |
| Rola decydenta | Senior Solution Analyst / właściciel |
| Powiązane | ADR-0006 (model ścieżek hybrydowy), ADR-0008 (moduł MSH / maturity-check), ADR-0004 (i18n), `docs/macierz-sciezek.md`, `docs/planning/roadmap-s4-skala-holaka.md` |

---

## Kontekst

Po M14 Skala Holaka była **modułem MSH** wpiętym do ścieżek S1/S2/S3. Życzenie właściciela: wynieść ją do osobnej, **4. ścieżki S4** widocznej na ekranie startowym obok S1/S2/S3 — jako **autodiagnoza (MSH) + dedykowane szkolenie** wchodzenia na wyższe poziomy dojrzałości adopcji AI.

Decyzje właściciela (potwierdzone): **D1** zakres = hybryda (diagnoza + szkolenie); **D2** = ścieżka **FORMATYWNA** (bez testu końcowego, progu, ekranu Wynik, certyfikatu); **D3** = MSH przeniesiony **wyłącznie** do S4 (znika z S1/S2/S3). Poddecyzje: 5 modułów (MSH + MSK1–4), **bez quizów bankowych**, pozycja po S1–S3 (NIE rekomendowana — zostaje S2).

To **pierwsza ścieżka formatywna** w systemie zamrożonym na 3 ścieżki-z-testem (S1/S2/S3) oraz **4 nowe moduły** w systemie zamrożonym na 12+MSH. Wymusza decyzje kontraktowe PRZED treścią (analogicznie do M14: #113/#114 są warunkiem #116–#118).

## Decyzja

1. **Flaga ścieżki `formative: true` + predykat `isFormativePath(pathsData, id)`.** Analogia do `scope:"diagnostic"` z ADR-0008, ale na poziomie ŚCIEŻKI: wyłącza S4 z kontraktów testu/scoringu/certyfikatu (finalTestQuestions, dedicatedQuestionsMin, passThresholdPct, gates, attempts, pula≥test, kwota dedykowanych, ekran Wynik). Predykat steruje guardami UI i pomijaniem ścieżki w pętlach test-engine/scoringu/walidatora.

2. **Conditional-required w `paths.schema.json`.** Odmrożenie `^S[123]$` → `^S[1-4]$`, `required:[S1,S2,S3]` → `+S4`. Per-ścieżka `required` zredukowane do `["modules"]`; reszta przez `allOf/if/then/else`:
   - `if formative === true` → `then {}` (żadnych pól test-owych wymaganych);
   - `else` (brak/false) → wymusza komplet `[requiredModules, finalTestQuestions, dedicatedQuestionsMin, passThresholdPct, criticalQuestionsRequiredPct, practicalTasks, gates, attempts]` ORAZ `modules` ⊇ M1..M12.
   Dzięki temu S4 (bez pól test-owych) przechodzi, a klasyczna ścieżka bez któregokolwiek pola dalej failuje (testy negatywne w obie strony).

3. **Moduły szkoleniowe `MSK1`–`MSK4`** (`scope:"diagnostic"`, bezpytaniowe). Wzorce id rozszerzono o `^M([1-9]|1[0-2]|SH|SK[1-9])$`; `modules.json` 13 → **17** wpisów (minItems/maxItems 17, order ≤17). Kolejność S4: MSH (diagnoza) → MSK1 (kontekst/koszt) → MSK2 (weryfikowalność/odwracalność) → MSK3 (bezpieczeństwo/governance) → MSK4 (granice 8→9, 10→11). Wszystkie diagnostyczne → exempt-by-construction z `EXPECTED_COUNTS`/`TOTAL=116`/golden/dedykowanych (jak MSH). Interakcja = **`classify` NON-practical** (bez `recordsPractical`/`rubricId`) — S4 nie dotyka rubryk ani bramek.

4. **Przeniesienie MSH do S4 (D3).** MSH usunięty z map `modules` S1/S2/S3, dodany do S4 jako `{required:false, variant:"diagnostyczny"}`. MSK1–4 jako `{required:true, variant:"formatywny"}` (nowy variant ≠ opcjonalny → widoczny w persona-secie S4; moduły kursu M1–M12 nieobecne w mapie S4 → default opcjonalny → ukryte). Mechanika MSH z ADR-0008 (maturity-check, non-gating, neutralność) **bez zmian** — zmienia się tylko UMIEJSCOWIENIE. Testy M14 (#106) **zaktualizowane, nie usunięte**.

5. **`questions.paths` enum NIE poszerzony o S4.** S4 jest bezpytaniowa — żadne pytanie nie taguje S4; schemat **strukturalnie zabrania** pytania w ścieżce formatywnej (defense-in-depth). `TOTAL=116`, golden 24, shardy banku — bez zmian.

6. **Guardy UI (rozproszone — każde miejsce osobno).** Pominięcie jednego dałoby fałszywe „test dostępny" w S4:
   - `path-select`: karta formatywna `path-card--formative` — meta bez „Test: N · Próg: X%", lista modułów ścieżki zamiast „wymaganych";
   - `module-hub`: `if (finalTest)` — formatywna podaje `finalTest:null` → brak karty testu;
   - `shell.renderNav`: `finalTest ? finalTestItem : null` → brak pozycji testu w nav;
   - `app.js`: `showMenu`/`refreshHeaderAndNav` ustawiają `finalTest:null` i `nextStep` formatywny dla S4; `showFinalTest` ma guard `if (isFormativePath) showMenu()` (każde wejście w nieistniejący test → hub).

7. **Walidator.** Predykat `isFormative(p)=p.formative===true`; guard `continue` w pętlach: pula≥finalTestQuestions, kwota dedykowanych, **raport progów** (czytał `p.gates.length` → crash dla S4 bez gates). `loadModuleContent` i `MODULE_CONTENT_SHARDS` rozszerzone o `msk1..msk4.json` (raport „17/17").

8. **i18n.** Treść MSK żyje per-locale w `data/<lang>/module-content/msk{1..4}.json` (PL+EN). Katalog UI dostaje 4 klucze (`path.card.meta.formative`, `path.card.meta.modulesFormative`, `path.card.showModules`, `module.nextStep.formative`) — parytet PL↔EN egzekwowany jak dotąd. Etykiety MSK w `data/<lang>/modules.labels.json` (komplet pól: level/interactiveElement/keyConcepts/learningOutcomes).

## Granice zakresu (świadomie odroczone — wymagają eksperta dziedzinowego, SME)

> Mechanika (kontrakt formatywności, guardy UI, integralność classify) jest egzekwowana testami i walidatorem. „Zielone CI" ≠ „treść zweryfikowana merytorycznie".

- **Treść modułów MSK1–4 jest syntetyczna** i ogólna (zero realnych danych/PII). Dobór osi, przykładów classify i framingu granic 8→9 / 10→11 — do przeglądu SME i potwierdzenia wierności wobec Skali Holaka v2.1e/v2.1p (autor modelu, quality-blog.eu).
- **Brak quizów/punktacji w S4** jest cechą (ścieżka formatywna), nie brakiem. Gdyby w przyszłości S4 miała mieć test, trzeba świadomie cofnąć conditional-required i poszerzyć `questions.paths`.
- **Etykieta „Wymagany/Opcjonalny"** modułów S4 wynika z flagi `required` i w ścieżce formatywnej (bez gatingu) jest jedynie poglądowa.

## Konsekwencje

- System obsługuje **4 ścieżki** (S1/S2/S3 z testem + S4 formatywna) i **17 modułów** (12 bankowych + 5 diagnostycznych: MSH + MSK1–4); kurs nadal ma **116 pytań** i 24-elementowy golden set bez zmian.
- MSH żyje **wyłącznie** w S4 (egzekwowane `paths.test` #115); S1/S2/S3 wracają do 12 modułów w persona-secie.
- S4 daje neutralną autodiagnozę + szkolenie i **nie ma** testu/progu/Wynik/certyfikatu (egzekwowane `s4-formative.test`, `module-hub.test`, `path-select-ux.test`, guard `app.js`/walidator).
- Walidator i smoke zielone; parytet PL+EN utrzymany. Render modułów MSK pokrywa `s4-formative.test` (Node) + walk Playwright (render-smoke iteruje tylko M1–M12).
- Przed wdrożeniem na żywo: **przegląd SME** treści MSK i wierności Skali Holaka — nie-blokujący, opisany wyżej.
