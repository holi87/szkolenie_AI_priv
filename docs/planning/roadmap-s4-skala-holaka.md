# Roadmap — M15: Ścieżka S4 „Skala Holaka" (formatywna)

> **Status: PLANOWANIE (nie implementacja).** Decyzje właściciela potwierdzone 2026-06-04.
> Następny krok: review tego dokumentu → utworzenie milestone M15 + issues (S4-1…S4-7) → realizacja jak M14 (kontrakt-first, PR per branch wg AGENTS, lub 1 branch na życzenie).

## Cel

Wynieść Skalę Holaka z poziomu **modułu w S1/S2/S3** (stan po M14) do osobnej, **4. ścieżki S4** widocznej na ekranie startowym obok S1/S2/S3. S4 = autodiagnoza (MSH) **+** dedykowane szkolenie wchodzenia na wyższe poziomy dojrzałości adopcji AI.

## Decyzje właściciela (potwierdzone)

| # | Decyzja | Wybór | Konsekwencja |
|---|---|---|---|
| D1 | Zakres treści S4 | **Hybryda: diagnoza + szkolenie** | MSH (self-check) + nowe, dedykowane moduły szkoleniowe uczące osi dojrzałości |
| D2 | Test/certyfikat | **Formatywna, bez testu** | Brak testu końcowego, progu, ekranu Wynik, certyfikatu. Scoring/golden/EXPECTED_COUNTS **nietknięte** |
| D3 | MSH w S1/S2/S3 | **Przenieść wyłącznie do S4** | MSH znika z hubów S1/S2/S3; żyje tylko w S4. Cofa #106 (wpięcie do 3 ścieżek), zmienia testy M14 |

## Kluczowa idea architektoniczna

S4 to **pierwsza ścieżka formatywna**. Analogia do M14: tak jak `scope:"diagnostic"` + predykat `hasBankQuestions` wyłączyły MSH z kontraktów pytań, tu wprowadzamy **flagę ścieżki `formative: true`** + predykat `isFormative(path)`, który wyłącza S4 z kontraktów testu/scoringu/certyfikatu (finalTestQuestions, dedicatedQuestionsMin, passThresholdPct, gates, attempts, pula≥test, Wynik, certyfikat).

**Moduły szkoleniowe S4 są bezpytaniowe** (`scope:"diagnostic"` jak MSH) — treść + interakcje (classify/rubric/maturity-check), **bez quizów bankowych**. Dzięki temu: TOTAL=116, golden=24, EXPECTED_COUNTS, enum `paths` w pytaniach (`S1/S2/S3`) — **wszystko bez zmian**. Żadne pytanie nie taguje S4.

## Powierzchnie kontraktowe (frozen-at-3 → 4 ścieżki)

Path-id zamrożony na `S1/S2/S3` w (analogicznie do frozen-at-12 z M14):

1. **`paths.schema.json`** — `required:[S1,S2,S3]` + `^S[123]$` (→ `^S[1-4]$`). KRYTYCZNE: per-ścieżka `required:[modules, requiredModules, finalTestQuestions, dedicatedQuestionsMin, passThresholdPct, criticalQuestionsRequiredPct, practicalTasks, gates, attempts]` zakłada ścieżkę-z-testem. Formatywna S4 NIE ma tych pól → **conditional required** (allOf: `if formative !== true then required:[finalTestQuestions, …]`), tak jak `questionRange` warunkowy dla scope w M14.
2. **`paths-labels.schema.json`** — `required:[S1,S2,S3]` + `^S[123]$`.
3. **`progress.schema.json`** — `path` enum `[S1,S2,S3]` → +S4. (finalTest opcjonalne — formatywna po prostu go nie zapisuje.)
4. **`questions.schema.json`** — `paths` items enum `[S1,S2,S3]` → **BEZ ZMIAN** (S4 bezpytaniowa; żadne pytanie nie taguje S4). Konserwatywnie: nie poszerzamy, więc schemat strukturalnie zabrania pytania w S4.
5. **`pilot-results.schema.json`** — `byPath {S1,S2,S3}` → +S4 opcjonalnie (S4 bez pytań → pilot nieistotny; można pominąć).
6. **`modules.schema.json`** — id regex `^M([1-9]|1[0-2]|SH)$` → +nowe id modułów szkoleniowych S4 (np. `MSK\d`). Odmrożenie analogiczne do MSH; minItems/maxItems rośnie o liczbę nowych modułów.

Kod:

7. **`assets/core/paths.js`** — `PATH_IDS=[S1,S2,S3]` → +S4. `isFinalTestUnlocked`/`pathCompletionBlockers`/`requiredModules` muszą gracefully no-opować dla formatywnej (brak requiredModules/testu). Nowy helper `isFormativePath(pathsData, id)`.
8. **`assets/ui/path-select.js`** — karta S4 z INNYM meta (bez „Test: N pytań · Próg: X%"; `optionalCount=12-required` nie pasuje do S4). RECOMMENDED_PATH bez zmian (S2).
9. **`assets/ui/module-hub.js` + `app.js showMenu`** — dla S4 **NIE renderować karty testu końcowego** (`finalTestStatus(S4)` dałby fałszywe „dostępny" → klik w nieistniejący test). Guard `if (!formative) renderFinalTestCard`.
10. **`assets/ui/shell.js`** — pozycja „Test końcowy" w nav: ukryć dla S4.
11. **`app.js` showFinalTest/showResult + certificate** — guard dla S4 (formatywna nie wchodzi w test/Wynik/eksport).
12. **`validate.mjs`** — pętle per-ścieżka (pula≥finalTestQuestions, dedicatedQuestionsMin, scope core/dedicated) muszą pomijać formatywną (`if (isFormative(p)) continue`). Schemat paths.json z conditional required. Nowe moduły S4 (scope diagnostic) już exempt via `hasBankQuestions`.

Dane + i18n + testy:

13. **`paths.json`** — wpis S4: `formative:true`, mapa `modules` (MSH + moduły szkoleniowe, wszystkie widoczne, variant niе-opcjonalny), BEZ requiredModules/finalTestQuestions/gates (lub puste).
14. **`paths.labels.json` PL+EN** — nazwa S4 + assumedPathTime.
15. **`modules.json` + `modules.labels.json` PL+EN** — nowe moduły szkoleniowe S4.
16. **`module-content/*.json` PL+EN** — treść nowych modułów (osie: zarządzanie kontekstem, świadomość modelu, oszczędność tokenów, weryfikowalność, odwracalność, bezpieczeństwo/prywatność).
17. **`data-loader.js`** — MODULE_CONTENT_SHARDS +nowe moduły.
18. **`assets/i18n/*.json`** — nowe klucze chrome (jeśli potrzeba), parytet PL+EN.
19. **Testy + snapshoty** — `PATH_IDS` 3→4, liczby modułów rosną, snapshoty modules-merged/paths-merged regen, paths.test/render-smoke/data-loader-locale/path-select-ux aktualizacja, +testy formatywności (S4 bez testu, MSH tylko w S4).

## Przeniesienie MSH (D3)

- Usunąć `MSH` z map `modules` w S1/S2/S3 w `paths.json` (zostaje tylko w S4).
- Zaktualizować testy M14: `paths.test` #106 (MSH-insensitivity) → teraz dotyczy S4; `pathModuleList` count w S1/S2/S3 wraca do 12; `pathVisibleModuleIds` S1/S2/S3 bez MSH.
- ADR-0008 (M14) pozostaje ważny dla MECHANIKI MSH (maturity-check, non-gating, neutralność) — zmienia się tylko UMIEJSCOWIENIE (S4 zamiast S1-S3). Odnotować w ADR-0009.

## Sekwencja — milestone M15 (#16), kontrakt-first jak M14

> **UTWORZONE na GitHubie:** S4-1=#112 · S4-2=#113 · S4-3=#114 · S4-4=#115 · S4-5=#116 · S4-6=#117 · S4-7=#118 (milestone „M15 Ścieżka S4 — Skala Holaka (formatywna)" #16).

| Issue | Temat | Zależy od |
|---|---|---|
| **S4-1** | ADR-0009: ścieżka formatywna S4, flaga `formative`, przeniesienie MSH, id modułów szkoleniowych, brak testu/certyfikatu | — |
| **S4-2** | Kontrakt ścieżek: odmrożenie `^S[123]$`→S4, conditional required (formative), `PATH_IDS`, walidator path-loop exemption, progress/labels/pilot schema, testy negatywne | S4-1 |
| **S4-3** | Kontrakt modułów szkoleniowych: regex id `MSK\d`, modules.json/labels, data-loader shards, scope diagnostic | S4-1 |
| **S4-4** | Przeniesienie MSH do S4: usunięcie z S1/S2/S3, aktualizacja testów M14 (#106→S4) | S4-2, S4-3 |
| **S4-5** | Treść szkoleniowa S4: moduły osi dojrzałości PL+EN + interakcje + i18n (syntetyczne, atrybucja quality-blog.eu) | S4-3 |
| **S4-6** | UI ścieżki formatywnej: karta S4 (bez test/próg), hub bez karty testu, nav bez testu, guard scoring/Wynik/certyfikat | S4-2 |
| **S4-7** | Wpięcie + QA: S4 w path-select, e2e PL+EN, a11y, Playwright, snapshoty regen, pełny sweep testów | S4-4, S4-5, S4-6 |

## Poddecyzje — ZABLOKOWANE (właściciel, 2026-06-04)

1. **Moduły S4 = MSH + 4 szkoleniowe (=5 modułów).** Id i zakres:
   - `MSH` — Autodiagnoza Skali Holaka (maturity-check) — ISTNIEJE, przenoszony z S1-S3.
   - `MSK1` — Zarządzanie kontekstem i koszt (osie: zarządzanie kontekstem, oszczędność tokenów).
   - `MSK2` — Weryfikowalność i odwracalność (osie: weryfikowalność outputu, odwracalność decyzji).
   - `MSK3` — Bezpieczeństwo, prywatność i governance pod AI (oś: bezpieczeństwo/prywatność).
   - `MSK4` — Wchodzenie wyżej: granice 8→9 i 10→11 (praktyka przejścia poziomów).
   - **Regex id modułu:** `^M([1-9]|1[0-2]|SH|SK[1-9])$`. **modules.json: 13 → 17 wpisów** (minItems/maxItems 17). Kolejność S4: MSH (diagnoza) → MSK1..MSK4 (szkolenie).
2. **Bez quizów.** Wszystkie moduły S4 bezpytaniowe (`scope:"diagnostic"`) — zero ekspansji banku/golden/EXPECTED_COUNTS. Self-check/ćwiczenia przez interakcje (classify/rubric/maturity-check), nie scorowane quizy.
3. **Formatywna, pozycjonowana po S1-S3, bez egzaminów.** NIE „Rekomendowana" (zostaje S2). Karta z opisem „diagnoza + rozwój, bez egzaminu/certyfikatu".
4. **assumedPathTime S4 ≈ 2,5–3 h.** Szacunek: MSH ~20 min + 4 moduły szkoleniowe ~30 min każdy = ~140 min ≈ 2,5 h (bez quizów; treść + interakcje).

## Estymata realizacji (milestone M15)

- **Skala:** ~M14 × 1,5 (kontrakt ścieżki szerszy niż moduł + 5 modułów treści PL+EN zamiast 1).
- **Rozkład nakładu wg issue:**
  - S4-1 (ADR) — mały (dokument).
  - S4-2 (kontrakt ścieżek) — średni; mechaniczny, w pełni weryfikowalny testami (conditional required to główna pułapka).
  - S4-3 (kontrakt modułów) — mały-średni; analogiczny do M14 contract, wzorzec znany.
  - S4-4 (przeniesienie MSH) — mały; usunięcie z 3 map + aktualizacja testów M14.
  - S4-5 (treść szkoleniowa) — **NAJWIĘKSZY**; 4 moduły × 2 locale × (ekrany + interakcja + integralność). To dominanta nakładu.
  - S4-6 (UI formatywne) — średni; guardy w path-select/hub/nav/scoring/cert (wiele miejsc, każde małe).
  - S4-7 (wpięcie + QA) — średni; Playwright PL+EN + snapshoty + pełny sweep.
- **Realistycznie:** kontrakt+UI (S4-1,2,3,4,6) ≈ 1 solidna sesja; treść (S4-5) ≈ 1 sesja; QA+wpięcie (S4-7) ≈ 0,5 sesji. Razem ~2–3 sesje robocze, 1 milestone, 1–2 PR (stacked albo 1 branch na życzenie).
- **Główne ryzyka:** (a) conditional-required w paths.schema (formatywna vs test) — testy negatywne obowiązkowe; (b) UI guardy rozproszone (path-select/hub/nav/cert) — łatwo przeoczyć jeden → fałszywy „test dostępny" w S4; (c) przeniesienie MSH cofa #106 — testy aktualizować, nie usuwać.

## Nakład / ryzyko

- Skala porównywalna z M14, ale **bardziej rozległa w kodzie** — kontrakt ŚCIEŻKI dotyka path-select / scoring / certyfikat / nav / test (więcej powierzchni niż moduł). Konserwatywna flaga `formative` ogranicza to (S4 omija test/scoring), ale UI guardy są w wielu miejscach.
- Główny knob nakładu = **D1 (treść szkoleniowa)**: liczba i głębia nowych modułów (poddecyzja 1).
- Ryzyko regresji: przeniesienie MSH (D3) cofa #106 — testy M14 wymagają aktualizacji, nie usunięcia (mechanika MSH zostaje).
- Konserwatywnie (jak M14): NIE poszerzać `questions.paths` o S4 (S4 bezpytaniowa) — schemat strukturalnie broni przed pytaniem w formatywnej ścieżce.
