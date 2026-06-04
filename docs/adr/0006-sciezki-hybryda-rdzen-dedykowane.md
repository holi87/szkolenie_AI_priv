# ADR-0006: Ścieżki dopasowane do person — model hybrydowy (rdzeń + moduły/pytania dedykowane)

| Pole | Wartość |
|---|---|
| Status | Zaakceptowana |
| Issue | `#94 [M13-1] ADR-0006 + macierz docelowa person↔moduły` |
| Rola decydenta | Senior Solution Analyst + Senior UX Designer / właściciel |
| Powiązane | `docs/macierz-sciezek.md` (#5, zamrożona), ADR-0001 (model danych), `wymagania/03` (persony), #95–#101 (M13-2…8), `docs/planning/roadmap-m12-m14.md` |

---

## Kontekst

- **Życzenie właściciela #3:** „każda ścieżka »S« ma mieć INNE moduły dopasowane do celu — nie te same pytania podzielone tylko wymaganiami".
- **Stan obecny (zmierzony 2026-06-04 na `data/pl/questions/`):** ścieżki to **zagnieżdżone nadzbiory**, nie zestawy dopasowane. Pula ścieżki = pytania tagowane `paths[]` zawierającym daną ścieżkę:
  - S1 pool=49 (0 pytań wyłącznych dla S1), S2 pool=79 (0 wyłącznych dla S2), S3 pool=116 (37 wyłącznych — L4 + S3-only), 79 pytań wspólnych dla wielu ścieżek.
  - Efekt: S1 ⊆ S2 ⊆ S3 — każda persona dostaje **podzbiór** tych samych 116 pytań, filtrowany progiem/`finalTestQuestions`. To dokładnie model, który właściciel chce porzucić.
- Walidator (`tests/schema-validation/validate.mjs`) zamraża ten model twardymi stałymi: `TOTAL=116`, `EXPECTED_COUNTS` per moduł, `DIFF_TARGET` globalny, golden 24 = 2/moduł, L4=S3-only, parytet strukturalny PL↔EN.

## Decyzja

1. **Model HYBRYDOWY.** Moduły dzielą się na:
   - **Rdzeniowe (core):** identyczna treść i pytania we WSZYSTKICH ścieżkach. Kandydaci uniwersalni dla każdej persony: **M1 Fundamenty, M10 Bezpieczeństwo (z 5 pytaniami krytycznymi), M11 Weryfikacja/halucynacje**.
   - **Dedykowane (dedicated):** realnie różna treść i **rozłączna pula pytań** dopasowana do persony — S1 (decyzyjna/nietechniczna: decyzje, ryzyka, governance), S2 (praktyk-użytkownik/QA: prompt engineering, zastosowania QA, praktyczny RAG, podstawy ewaluacji), S3 (inżynier: architektura, embeddings, vector DB, RAG, agenty, ewaluacja LLM/RAG — pełna głębia).
2. **Klasyfikacja core/dedicated** zadeklarowana w `data/modules.json` (np. pole `scope: "core" | "dedicated"`) — single source, z którego walidator i UI wyprowadzają zachowanie. (Implementacja: M13-2.)
3. **Reprezentacja on-disk: zachowujemy układ per-locale + per-moduł** (`data/<lang>/questions/mNN.json`, `data/<lang>/module-content/mNN.json` — ADR-0004). Dyskryminator per-ścieżka **w obrębie sharda**:
   - pytanie **rdzeniowe** → `paths[]` = ścieżki, w których moduł rdzeniowy występuje;
   - pytanie **dedykowane** → przypisane do **dokładnie jednej** ścieżki (`dedicatedPath`), `paths` = `[ta ścieżka]`.
   - Pula ścieżki P = (pytania rdzeniowe stosowalne do P) ∪ (pytania dedykowane z `dedicatedPath === P`).
   - **Uzasadnienie odejścia od „pliki per-path"** (rekomendacja z hardeningu roadmapy): tamto rozwiązanie eliminowało kolizję **3 równoległych PR** na tym samym `mNN.json`. W tym wydaniu M12+M13 idą **jednym branchem** (decyzja właściciela /goal) → kolizja równoległych PR nie występuje → wybieramy mniej inwazyjny dyskryminator in-shard zamiast przebudowy układu plików.
4. **Inwariant TESTOWALNY „dedykowane"** (zastępuje nieweryfikowalne „realnie różne"): zbiory id pytań dedykowanych są **rozłączne** między ścieżkami; każda pula ścieżki ma ≥ `finalTestQuestions`; budżet trudności i golden-set liczone **per ścieżka** (M13-6).
5. **`onlyForPaths` / `hideForPaths` / `isItemVisible` (`module-view.js`) WSPÓŁISTNIEJĄ** z modelem — to narzędzie wariancji treści *w obrębie* modułu (np. skrócony wariant ekranu dla S1). Hybryda dokłada per-path **pule pytań** i dedykowaną **przynależność modułów**; nie wycofujemy wariancji treści.
6. **Golden / bramki / scoring:** pytania **krytyczne (M10, 5 szt.) pozostają rdzeniowe** — obejmują wszystkie ścieżki, niezmienione. Golden-set przechodzi na **per ścieżka** (lub kotwiczy na modułach rdzeniowych) — rozstrzygnięcie i przeliczenie w **M13-6**. Wagi wyniku (quiz 30 / test 60 / praktyka 10) bez zmian.
7. **Parytet EN (D2):** każda treść i pytanie dedykowane powstaje od razu w **PL i EN**; walidator rozszerza parytet na strukturę per-ścieżka (M13-2/M13-6).

## Konsekwencje

- **Ten ADR jest bramką dla M13-2…M13-8 (#95–#101).** Ustala model, reprezentację danych i inwariant „dedykowane", zanim powstanie treść.
- **Przejście to zmiana danych ALL-OR-NOTHING.** Uczynienie pul rozłącznymi łamie jednocześnie: golden-24/2-per-moduł, `TOTAL=116`, `DIFF_TARGET` globalny, `EXPECTED_COUNTS`, selekcję w `test-engine` i scoring. Dlatego re-alokacja banku (M13-6) i treść dedykowana (M13-3/4/5) muszą wejść **w komplecie**, nie częściowo — częściowy split = czerwone CI bez stanu pośredniego do wylądowania.
- **Zakres dostarczony w tym PR (jeden branch M12+M13):** (a) **ten ADR** (design), (b) **M13-2 część** — walidator wyprowadza wymóg pokrycia per-ścieżka z `paths.json` (`finalTestQuestions`) i **egzekwuje** go na obecnym wspólnym banku 116 (zielono), plus test negatywny. **Odroczone do osobnych PR:** schemat dedykowanych pytań + inwariant rozłączności (M13-2 reszta), treść S1/S2/S3 (#96–#98), re-alokacja banku/golden/bramki (#99), UI per-ścieżka (#100), QA (#101) — bo wymagają kompletnej, rozłącznej puli (one-way door).
- **Macierz `docs/macierz-sciezek.md` (#5) pozostaje zamrożona** jako kontrakt struktury modułów/gatingu; ADR-0006 dokłada warstwę core-vs-dedicated (sekcja 5 macierzy = forward-pointer tutaj), nie zmienia sekcji 1–4.
