# Roadmap M12–M14 (odchudzenie UX · ścieżki dopasowane do person · Skala Holaka)

> Plan z 2026-06-04, role: Senior Business Analyst + Senior Solution Analyst + Senior UX Designer.
> Artefakt referencyjny — źródłem prawdy są issues na GitHubie. Wygenerowany na podstawie 4 życzeń właściciela
> oraz analizy obecnego stanu kodu (`genai-llm-training/`), macierzy ścieżek (`data/paths.json`) i wymagań (`wymagania/`).

## ⚠ Stan wyjściowy / GATE (zweryfikowany 2026-06-04)

`main` = **2f98bd7** (merge #89: bug1 flaga + bug2 hub). **M11 EN NIE jest na `main`** — PR #91 zmergowano do bazy `issue-88-modul-hub` (nie do `main`), bo user wmergował #89 do main ZANIM #91 trafiło do swojej bazy. Skutek: praca M11 (pełne `data/en/`, przetłumaczony `en.json`) leży w branchu **`m11-i18n-en` @ b2f07d8** (i `issue-88-modul-hub`), `data/en/` na main = **404**, `en.json` = skeleton 4500 B, issues **#81-84 OPEN**.

**To bramkuje decyzję D2** („parytet PL+EN utrzymany; treść buduje na `data/en/`"). **Rekomendacja: najpierw sprowadź M11 na `main`** (nowy PR `m11-i18n-en` → `main`; PR #91 jest już MERGED, więc rebase `--onto origin/main` + świeży PR, nie re-edycja #91). Dopiero potem M12-M14 jak zaplanowano. Jeśli M11 NIE wraca na main → D2 i kryteria parytetu EN w M13-2/M13-3-5/M14 wymagają rewizji (baseline staje się PL-only).

## Cztery życzenia właściciela (wejście)

1. **Moduł ze Skali Holaka** — self-check + self-learning, „tak jak tech" (jak moduły M1–M12). Źródło:
   [v2.1e enterprise](https://quality-blog.eu/pl/blog/skala-holaka/) + [v2.1p private](https://quality-blog.eu/pl/blog/skala-holaka-private/).
2. **Pozbycie się paska postępu** — „wygląda tragicznie".
3. **Każda ścieżka „S" ma mieć INNE moduły dopasowane do celu** — nie te same pytania podzielone tylko wymaganiami.
4. **Usunięcie certyfikatu i podawania imienia** — „zbędne całkowicie".

## Decyzje produktowe (potwierdzone z właścicielem 2026-06-04)

| # | Pytanie | Decyzja | Skutek dla zakresu |
|---|---|---|---|
| D1 | Jak głęboko rozdzielić ścieżki (item 3)? | **Hybryda: rdzeń uniwersalny + moduły dedykowane** | Rdzeń (fundamenty, bezpieczeństwo, halucynacje) wspólny; reszta z realnie różną treścią i pulą pytań per persona. ~8 issues (M13). |
| D2 | Polityka i18n dla nowej pracy? | **PL+EN równolegle, parytet utrzymany** | Walidator zostaje surowy; każdy moduł/treść/usunięcie od razu w PL i EN. ~2× nakład treści, zero długu i18n. |
| D3 | Która Skala Holaka jako podstawa self-checku? | **Oba: v2.1e (organizacja) + v2.1p (osoba)** | Moduł pokrywa diagnozę firmową i osobistą (obie skale 0–11). Najbogatszy poznawczo. |

### Decyzje senior „do potwierdzenia" (przyjęte domyślnie, w treści issues)

- **Pasek postępu (item 2):** usuwamy WIZUALNY pasek z headera; **`core/progress-store.js` zostaje** (status modułów napędza gating testu końcowego i pille statusu w hubie). Zastąpienie: nic / opcjonalny cichy licznik „X/Y modułów" w hubie (bez paska). Brak utraty informacji (WCAG) — status nadal w hubie.
- **Certyfikat + imię (item 4):** usuwamy **artefakt certyfikatu** (medal, `completionId`, `displayName`, framing „CERT-…", nagłówki „certyfikat") oraz **input pseudonimu**. **Zostaje czysty ekran „Wynik"** (wynik %, słabe obszary, status bramek, retry, eksport anonimowy) — to wartość formatywna. Model bramek/gatingu testu końcowego przeżywa bez wrappera certyfikatu.
- **Tension do odnotowania (ADR):** `wymagania/00_pelna_analiza.md` definiuje szkolenie jako „certyfikacyjne". Usunięcie certyfikatu zmienia charakter na **self-assessment-only** — świadoma decyzja właściciela, udokumentowana w ADR-0005.
- **Skala Holaka (item 1):** self-check **formatywny, NON-gating** (nie da się „oblać" diagnozy dojrzałości; nie wpływa na zaliczenie ścieżki). Umiejscowienie: **moduł rdzeniowy (uniwersalny), dostępny we wszystkich ścieżkach**. Wszystkie przykłady **syntetyczne** (AGENTS). Atrybucja do quality-blog.eu.

## Milestone'y i kolejność realizacji: **M12 → M13 → M14**

| Milestone | Temat | Issues | Niezależność |
|---|---|---|---|
| **M12** Odchudzenie UX | Usuń pasek postępu (wizual) + usuń certyfikat i pseudonim → zostaw „Wynik" | M12-1, M12-2 | Niezależny — **ship first** (szybkie efekty) |
| **M13** Ścieżki dopasowane do person | Hybryda: rdzeń uniwersalny + moduły/pytania dedykowane S1/S2/S3, schemat danych, re-alokacja banku, UI, QA | M13-1…M13-8 | Największy; dekomponowany; bazuje na M12 (czysty ekran Wynik) |
| **M14** Moduł Skali Holaka | Self-check + self-learning dojrzałości AI (v2.1e org + v2.1p osoba) | M14-1…M14-4 | Po M13 (architektura modułów/ścieżek); non-gating |

Uzasadnienie kolejności: M12 to dwa odchudzenia niskiego ryzyka (szybka wartość, czyszczą ekran końcowy pod M13). M13 to rdzeń życzenia (item 3) — duży, dekomponowany, stacked PR. M14 (nowy moduł) zależy od architektury modułów ustalonej w M13 i osadza się jako moduł rdzeniowy.

### Mapa slug → GitHub issue (utworzone 2026-06-04)

| Slug | Issue | Slug | Issue | Slug | Issue |
|---|---|---|---|---|---|
| M12-1 | #92 | M13-3 | #96 | M13-8 | #101 |
| M12-2 | #93 | M13-4 | #97 | M14-1 | #102 |
| M13-1 | #94 | M13-5 | #98 | M14-2 | #103 |
| M13-2 | #95 | M13-6 | #99 | M14-3 | #104 |
|  |  | M13-7 | #100 | M14-4 | #105 |
|  |  |  |  | M14-5 | #106 |

Milestone'y GitHub: **M12 Odchudzenie UX** (#13) · **M13 Ścieżki dopasowane do person** (#14) · **M14 Moduł Skali Holaka** (#15).

---

## Specyfikacje issues

Każde issue: `Closes #<n>` w PR, osobny branch (AGENTS), pliki ≤700–800 LOC, dane syntetyczne, **parytet PL+EN + `validate-data` zielone + testy** w kryteriach akceptacji.

### M12 — Odchudzenie UX

#### M12-1 [type:ux, priority:p2] Usuń wizualny pasek postępu z headera
- **Kontekst:** Pasek postępu w headerze („Postęp: X%") oceniony jako „tragiczny" wizualnie. Status modułów i tak jest w hubie (pille completed/in_progress).
- **Zakres:** Usuń markup paska z `index.html` (`#progress`, `progressTrack`/`progressFill`/`progressLabel`), kod paska z `assets/ui/shell.js` (`updateHeader` → blok `progressPct`/`progressFill.style.width`/`aria-valuenow`), powiązane style w `assets/styles.css`. Usuń `refs` paska z `app.js`. **Nie ruszaj `core/progress-store.js`** (gating + status w hubie).
- **Decyzja (do potwierdzenia):** zastąpienie = nic (czysty header). Opcjonalnie cichy licznik „X/Y modułów ukończonych" w hubie (tekst, nie pasek).
- **i18n (PL+EN):** usuń klucz `nav.progress` z `assets/i18n/pl.json` i `en.json` (parytet — inaczej walidator zgłosi sierotę/brak).
- **Kryteria akceptacji:** brak paska na desktop i mobile 360px; brak `role="progressbar"` w DOM; status modułów nadal widoczny w hubie; smoke (header/shell snapshot, a11y) zaktualizowane i zielone; `validate-data` zielone (parytet i18n); brak martwych kluczy/refs.
- **Zależności:** —

#### M12-2 [type:ux, type:security, priority:p2] Usuń certyfikat i pseudonim; zostaw ekran „Wynik"
- **Kontekst:** Certyfikat i wpisywanie pseudonimu uznane za zbędne. Wartość formatywna (wynik, słabe obszary, bramki) ma zostać.
- **Zakres:**
  - Usuń input pseudonimu z `assets/ui/path-select.js` (`participant-name`, label, nota) + `pendingName`/`setParticipant`/`getParticipant` z `app.js`.
  - Przemianuj/odchudź `assets/ui/certificate-view.js` → ekran „Wynik": usuń medal, `completionId`, `displayName`, framing „certyfikat/CERT-". **Zostaw:** wynik %, słabe obszary, status bramek, retry, eksport JSON/CSV (anonimowy — i tak bez PII).
  - `core/certificate.js`: usuń `displayName`/`completionId`/`generateCompletionId` ze ścieżki wyniku (zostaw `buildCertificate`→`buildResult`: issued/passed/scorePct/weakAreas/gates).
  - `core/progress-store.js`: usuń `recordCertificate` (lub odchudź do `recordResult` bez completionId); zaktualizuj `data/schemas/progress.schema.json`.
  - i18n: usuń klucze `cert.*` i `path.name.*` z `pl.json` + `en.json` (parytet); przemianuj `cert.passed/failed.heading` → `result.*` jeśli treść zostaje.
  - **ADR-0005:** udokumentuj zmianę charakteru „certyfikacyjny → self-assessment" + tension z `wymagania/00`.
- **Decyzja (do potwierdzenia):** eksport wyniku JSON/CSV **zostaje** (anonimowy, przydatny do kalibracji #28). Imię i tak nigdy nie było w eksporcie.
- **Kryteria akceptacji:** brak inputu pseudonimu i brak certyfikatu w żadnej ścieżce/wersji; gating testu końcowego (progi, pytania krytyczne, bramki praktyczne) działa bez zmian; ekran „Wynik" pokazuje wynik+słabe obszary+bramki+retry; brak `completionId`/`displayName` w kodzie, schemacie i eksportach; ADR-0005 dodany; testy (certificate/result, progress schema, data-negative) i `validate-data` zielone; parytet PL+EN.
- **Zależności:** —

### M13 — Ścieżki dopasowane do person (hybryda)

> **Model docelowy (hybryda):** moduły **rdzeniowe** = identyczna treść we wszystkich ścieżkach (kandydaci: M1 Fundamenty, M10 Bezpieczeństwo, M11 Halucynacje — uniwersalne dla każdej persony). Moduły **dedykowane** = realnie różna treść i **osobna pula pytań** dopasowana do persony: S1 (decyzyjna/nietechniczna), S2 (praktyk-użytkownik/QA), S3 (inżynier/automatyzacja). Koniec z modelem „te same 116 pytań tagowane `paths` + filtr `onlyForPaths`".

#### M13-1 [type:decision, type:architecture, priority:p1, dependency] ADR-0006 + macierz docelowa person↔moduły
- **Kontekst:** Trzeba zamrozić, które moduły są rdzeniowe (wspólne), a które dedykowane (per ścieżka), i jak dane reprezentują treść/pytania per ścieżka — zanim powstanie treść.
- **Zakres:** ADR-0006 (model hybrydowy: rdzeń vs dedykowane, reprezentacja danych per-ścieżka, wpływ na golden-set/bramki/scoring, strategia parytetu EN). Zaktualizowana `docs/macierz-sciezek.md`: per-persona efekty uczenia, lista modułów rdzeniowych vs dedykowanych dla S1/S2/S3, docelowe liczby pytań per moduł/ścieżka. Plan zmiany schematów (bez kodu).
- **Kryteria akceptacji:** ADR-0006 zaakceptowany; macierz pokrywa wszystkie 3 ścieżki + rdzeń; jednoznaczne, które moduły dedykowane i jakie persona-efekty; review Codex.
- **Zależności:** — (bramka dla reszty M13)

#### M13-2 [type:architecture, type:assessment, priority:p1, dependency] Schematy + walidator pod treść/pytania per-ścieżka
- **Zakres:** Rozszerz `data/schemas/questions.schema.json` i `module-content.schema.json` o reprezentację per-ścieżka (np. pytania dedykowane przypisane do dokładnie jednej ścieżki + pytania rdzeniowe wspólne; treść modułu dedykowana per ścieżka). Rozszerz `tests/schema-validation/validate.mjs`: liczby pytań per (moduł × ścieżka), golden-set per ścieżka, parytet PL↔EN dla nowej struktury, brak „sierot". Testy negatywne (`data-negative.test.mjs`).
- **Kryteria akceptacji:** schemat opisuje rdzeń vs dedykowane; walidator failuje przy niezgodnej liczbie/parytecie per ścieżka; testy negatywne zielone; `validate-data` zielone na danych przejściowych.
- **Zależności:** M13-1

#### M13-3 [type:content, priority:p2] S1 (decyzyjna): moduły dedykowane — treść + pytania (PL+EN)
- **Zakres:** Treść i pula pytań dedykowanych dla S1 (persona nietechniczna/decyzyjna): nacisk na decyzje, ryzyka, governance, świadomość ograniczeń; BEZ wewnętrznych szczegółów embeddings/vector-db/eval. PL+EN parytet. Dane syntetyczne.
- **Kryteria akceptacji:** moduły dedykowane S1 mają treść i pytania różne od S2/S3 (nie tagowany podzbiór); efekty uczenia zgodne z macierzą (M13-1); PL+EN parytet; `validate-data` zielone.
- **Zależności:** M13-2

#### M13-4 [type:content, priority:p2] S2 (praktyk/QA): moduły dedykowane — treść + pytania (PL+EN)
- **Zakres:** Treść + pytania dla S2 (praktyk-użytkownik/QA): praktyczny prompt engineering, zastosowania w QA, praktyczny RAG, podstawy ewaluacji. PL+EN parytet, dane syntetyczne.
- **Kryteria akceptacji:** jak M13-3 dla persony S2; parytet; walidacja zielona.
- **Zależności:** M13-2

#### M13-5 [type:content, priority:p2] S3 (inżynier): moduły dedykowane — treść + pytania (PL+EN)
- **Zakres:** Treść + pytania dla S3 (inżynier/automatyzacja/techniczny QA): pełna głębia techniczna — architektura, embeddings, vector db, RAG, agenty, ewaluacja LLM/RAG. PL+EN parytet, dane syntetyczne.
- **Kryteria akceptacji:** jak M13-3 dla persony S3; parytet; walidacja zielona.
- **Zależności:** M13-2

#### M13-6 [type:assessment, priority:p1] Re-alokacja banku, golden-set, test końcowy i bramki per ścieżka
- **Zakres:** Po powstaniu pul dedykowanych: przelicz rozkład trudności, golden-set per ścieżka, `finalTestQuestions`, progi i `gates` w `data/paths.json` tak, by test końcowy losował z właściwej (dopasowanej) puli. Pytania krytyczne (M10) zostają. Aktualizacja `data/golden-set.json`.
- **Kryteria akceptacji:** test końcowy każdej ścieżki losuje z dopasowanej puli; budżet trudności i golden-set spójne per ścieżka; bramki krytyczne nienaruszone; scoring engine zielony; `validate-data` zielone.
- **Zależności:** M13-3, M13-4, M13-5

#### M13-7 [type:frontend, priority:p1] path-select + hub renderują dopasowane zestawy modułów per ścieżka
- **Zakres:** `assets/ui/path-select.js` i `assets/ui/module-hub.js` + `core/paths.js`: hub pokazuje per-ścieżkę zestaw (rdzeń + dedykowane), warianty/etykiety, `pillarLabel`; nawigacja modułów per ścieżka. Weryfikacja, że `pathModuleList`/gating działają na nowym modelu.
- **Kryteria akceptacji:** każda ścieżka pokazuje swój zestaw modułów (różny realnie); hub poprawny desktop+360px, a11y (focus/klawiatura); smoke (module-hub, hub-layout) zielone; PL+EN.
- **Zależności:** M13-2 (a treść z M13-3/4/5 do pełnego QA)

#### M13-8 [type:qa, priority:p1] QA wszystkich ścieżek S1/S2/S3 (PL+EN) + a11y + walidacja
- **Zakres:** Pełny przejazd S1/S2/S3 w PL i EN: treść, quizy inline, test końcowy, bramki, ekran Wynik. a11y desktop+360 (focus, klawiatura, kontrast). `validate-data` + smoke + calibrate zielone. Wizualne QA (Playwright).
- **Kryteria akceptacji:** wszystkie 3 ścieżki przechodzą end-to-end w obu locale; zero regresji scoringu/bramek; checklisty a11y i QA opisane w PR.
- **Zależności:** M13-6, M13-7

### M14 — Moduł Skali Holaka (self-check dojrzałości AI)

> **Kontekst kontraktowy (z review):** moduł to **13. moduł** w systemie zamrożonym na 12. Cały stos kontraktów (7 schematów + walidator) pinuje `^M([1-9]|1[0-2])$`, `minItems/maxItems:12`, `modules-labels required M1..M12`, walidator `loadModuleContent` loop `i=1..12`, `EXPECTED_COUNTS`, `golden 2/moduł`, `questionRange`. Self-check jest **bez pytań bankowych** (nie spełnia `questionRange`/count/golden) i wprowadza **nowy typ interakcji `maturity-check`** (poza enumem `[classify,rubric,tune]`). Dlatego praca kontraktowa (M14-2) poprzedza treść.

#### M14-1 [type:decision, priority:p2, dependency] ADR-0007: projekt modułu Skali Holaka
- **Zakres:** ADR-0007: zakres (v2.1e org 0–11 + v2.1p osoba 0–11; osie oceny od L4: zarządzanie kontekstem, świadomość modelu, oszczędność tokenów, weryfikowalność, odwracalność, bezpieczeństwo/prywatność); charakter **NON-gating** (formatywny, nie da się „oblać"); **id modułu** = dedykowany, NIE-kolidujący z labelką milestone (rekomendacja: `MSH` — Moduł Skali Holaka — nie „M13"); umiejscowienie **`required:false` we WSZYSTKICH ścieżkach** (widoczny, ale poza `requiredModules[]` → nie bramkuje testu); **reguła UI neutralnego framingu** (poziom 0–11 to diagnoza, NIE ocena — bez kolorów pass/fail green/red, copy „gdzie jesteś / jak wejść wyżej"); jak moduł bez pytań żyje w kontraktach (wyłączenie z `questionRange`/count/golden). Atrybucja quality-blog.eu, dane syntetyczne.
- **Kryteria akceptacji:** ADR-0007 zaakceptowany; jednoznaczne id modułu, polityka non-gating (`isFinalTestUnlocked` niewrażliwy na ten moduł), reguła neutralnego framingu UI; review Codex.
- **Zależności:** M13-1 (architektura modułów)

#### M14-2 [type:architecture, priority:p1, dependency] Kontrakt: rozszerz schematy + walidator pod 13. moduł i `maturity-check`
- **Zakres:** Odmróź kontrakty zamrożone na 12: `modules.schema.json` (minItems/maxItems → 13; dopuść id `MSH`), `modules-labels.schema.json` (required + nowy id), `questions/module-content/paths/progress/rubrics/scenarios.schema.json` (rozszerz wzorzec id modułu). `module-content.schema.json` + `progress.schema.json`: dodaj `maturity-check` do enuma `interaction.kind` + gałąź `allOf/if-then` z wymaganymi polami. `validate.mjs`: pętla `loadModuleContent` poza 1..12, wyłączenie modułu bez pytań z `EXPECTED_COUNTS`/`questionRange`/golden-2, gałąź integralności dla `maturity-check`. Testy negatywne (`data-negative.test.mjs`) na nowy moduł i nowy kind.
- **Kryteria akceptacji:** rejestracja modułu `MSH` w `modules.json` + labels przechodzi schema-validation; `maturity-check` w danych przechodzi walidację; moduł bez pytań nie failuje count/golden/questionRange; testy negatywne (zły kind, brak EN modułu) zielone; `validate-data` zielone.
- **Zależności:** M14-1

#### M14-3 [type:content, priority:p2] Dane modułu: module-content + self-check (PL+EN)
- **Zakres:** `data/pl` + `data/en`: module-content (czym jest skala, mapa poziomów 0–11 obu wersji, Bariera/Sukces/Pułapka, granice 8→9 i 10→11, osie oceny), pozycje self-checku diagnozujące poziom (organizacja v2.1e + osoba v2.1p). Nowe klucze UI (etykiety poziomów, feedback „gdzie jesteś / jak wejść wyżej") w **obu** `pl.json` i `en.json` (set-parytet wg `i18n.test.mjs`, brak pustych EN). Wszystko syntetyczne.
- **Kryteria akceptacji:** treść uczy obu skal; self-check mapuje odpowiedzi na poziom 0–11 per skala; każdy nowy klucz UI w pl.json I en.json (parytet), brak pustych EN, `i18n-leak` zielony; `validate-data` zielone.
- **Zależności:** M14-2

#### M14-4 [type:frontend, priority:p2] Interakcja `maturity-check` (neutralna, non-gating) + zapis
- **Zakres:** Nowy typ interakcji w `assets/ui/interactions` + dispatcher `core/interactions`: użytkownik odpowiada → wyliczony poziom (org + osoba) + feedback diagnostyczny. **NON-gating + NEUTRALNY framing**: `evaluateInteraction` zwraca `passed:null` (istniejąca neutralna gałąź `app.js:364`) lub dedykowany komponent — BEZ `feedback--correct/incorrect` (green/red), bez „zdałeś". `progress-store.recordInteraction` bez wpływu na bramki/scoring. Testy: pozytywny (wylicza poziom), negatywny (zły kształt), neutralność scoringu, brak kolorów pass/fail.
- **Kryteria akceptacji:** self-check pokazuje poziom obu skal z neutralnym feedbackiem; brak stylowania pass/fail; `isFinalTestUnlocked` niewrażliwy; klawiatura/focus a11y; smoke (interactions) zielone; PL+EN.
- **Zależności:** M14-3

#### M14-5 [type:frontend, type:qa, priority:p2] Wpięcie modułu w hub/ścieżki + QA (PL+EN, a11y)
- **Zakres:** Moduł `MSH` jako `required:false` we wszystkich ścieżkach (hub + nawigacja). Pełne QA PL+EN, a11y desktop+360, `validate-data`/smoke/calibrate zielone, wizualne QA.
- **Kryteria akceptacji:** moduł dostępny w S1/S2/S3 w obu locale; self-check end-to-end; `isFinalTestUnlocked` niewrażliwy na status tego modułu; checklisty QA/a11y w PR.
- **Zależności:** M14-4, M13-7 (model hubu)

---

## Kolejność wdrożenia (topologicznie) i ścieżka krytyczna

| # | Issue | M | Typ | Prio | Zależy od |
|---|---|---|---|---|---|
| 1 | M12-1 Usuń pasek postępu | M12 | ux | p2 | — |
| 2 | M12-2 Usuń certyfikat + pseudonim → Wynik | M12 | ux/security | p2 | — |
| 3 | M13-1 ADR-0006 + macierz person↔moduły | M13 | decision/arch | p1 | — |
| 4 | M13-2 Schematy + walidator per-ścieżka | M13 | arch/assessment | p1 | M13-1 |
| 5 | M13-3 S1 treść + pytania | M13 | content | p2 | M13-2 |
| 6 | M13-4 S2 treść + pytania | M13 | content | p2 | M13-2 |
| 7 | M13-5 S3 treść + pytania | M13 | content | p2 | M13-2 |
| 8 | M13-6 Re-alokacja banku/golden/bramki | M13 | assessment | p1 | M13-3,4,5 |
| 9 | M13-7 UI path-select + hub per ścieżka | M13 | frontend | p1 | M13-2 |
| 10 | M13-8 QA S1/S2/S3 PL+EN + a11y | M13 | qa | p1 | M13-6, M13-7 |
| 11 | M14-1 ADR-0007 projekt modułu | M14 | decision | p2 | M13-1 |
| 12 | M14-2 Kontrakt: schematy + walidator (13. moduł, maturity-check) | M14 | architecture | p1 | M14-1 |
| 13 | M14-3 Dane self-check (PL+EN) | M14 | content | p2 | M14-2 |
| 14 | M14-4 Interakcja maturity-check (neutralna, non-gating) | M14 | frontend | p2 | M14-3 |
| 15 | M14-5 Wpięcie w hub + QA | M14 | frontend/qa | p2 | M14-4, M13-7 |

**Ścieżka krytyczna:** M13-1 → M13-2 → {M13-3/4/5} → M13-6 → M13-8 (rdzeń item 3); M14: M14-1 → M14-2 (kontrakt) → M14-3 → M14-4 → M14-5, zawieszone na M13-1 (i M13-7 dla hubu). **M12 idzie pierwszy; M13/M14 startują z `main` PO merge M12** (nie równolegle z M12 — kolizja na `path-select.js`/`validate.mjs`).

## Hardening po adversarial review (2026-06-04, 4 soczewki)

Review zestawu issues przeciw realnemu kodowi. Ustalenia kontraktowe wpisane w body issues:

**M12-1 (pasek postępu) — pełny zasięg:** usuń też ścieżkę OBLICZANIA — `progressPct()` (`app.js:41-47`), arg w `updateHeader` (`app.js:152`, `shell.js:32,43-46`), refs `progress/progressFill/progressTrack/progressLabel` (`app.js:60-70,176`). Testy do edycji: `a11y-static.test.mjs` (asercje role=progressbar :33-39 + `.progress__fill` gradient :94-96 — usunąć, dodać asercję BRAKU), `render-smoke.test.mjs` (`makeRefs` progress + `updateHeader({progressPct:42})` :57-64,138). **To NIE jest utrata WCAG** — status modułów żyje w hubie (ikona+tekst); ginie tylko sygnał „jak daleko ogółem".

**M12-2 (certyfikat+imię) — podział kluczy i18n (KRYTYCZNE):**
- **REMOVE:** `cert.eyebrow`, `cert.passed.heading`, `cert.score.label`, `cert.row.participant`, `cert.row.path`, `cert.row.date`, `cert.row.completionId`, `path.name.*`.
- **KEEP+RENAME→`result.*`:** `cert.gates.heading`, `cert.gate.overallThreshold/criticalQuestions/practicalTask/moduleMinScore`, `cert.gate.status.ok/fail`, `cert.weakAreas.heading`, `cert.failed.heading`, `cert.failed.notice.withGates/noGates`, `cert.reason.below_pass_threshold` (zachowane — zasilają „Wynik": bramki, słabe obszary, retry).
- **REWRITE proza (oba locale):** `action.viewResult`, `path.hero.lead`, `chrome.metaDescription` (usuń słowo „certyfikat/certificate").
- **Blast radius testów (7+, wszystkie w smoke CI):** `certificate.test.mjs` (medal/completionId/displayName/eyebrow), `i18n.test.mjs` (`certReasonText` + `cert.reason` + asercja kodu `below_pass_threshold`), `progress-store.test.mjs` (5 testów recordCertificate/participant :151-208), `path-select-ux.test.mjs:36` (asercja ODWRÓCONA — wymaga inputu pseudonimu), `render-smoke.test.mjs`, `i18n-leak.test.mjs`, `practical-pass.test.mjs` (`cert.issued`).
- **Kod:** `core/certificate.js` `buildReport` completionId :96, `exportCsv` kolumny :126-128; `app.js` import/wywołania :10,413-414,422-424; zachowaj eksporty `export*` (certificate-view zależy). Legacy `certificate` w localStorage: strip przy load (jak sweep `participant` :80-84) lub zostaw pole w schemacie (backward-compat).
- **UX:** PASS musi być rozróżnialny od FAIL bez medalu → status-badge „zaliczone" (ikona+tekst WCAG 1.4.1), inny akcent, podsumowanie bramek all-green.

**M13-1 (ADR-0006) — musi rozstrzygnąć reprezentację on-disk:** jeden-plik-na-moduł z rozszerzonymi blokami per-path vs pliki per-path; oraz los `onlyForPaths`/`hideForPaths` + `isItemVisible` (`module-view.js`) — wycofać czy współistnieć. Bez tego M13-3/4/5 nie mają formatu docelowego. **Rekomendacja:** layout per-path (osobne pliki/subkatalogi) — eliminuje kolizję 3 równoległych PR na tym samym `mNN.json`.

**M13-2 (kontrakt danych) — ZASTĄP, nie „rozszerz":** twarde stałe walidatora → derywacja per-(moduł×ścieżka): `TOTAL=116`/`EXPECTED_COUNTS`, `DIFF_TARGET` (L1/L2/L3/L4 + reguła L4=S3-only), `GOLDEN_DIFF`/golden-2-per-moduł/single `golden-set.json` → per-ścieżka, `questionRange` contiguity, shard discovery `^m\d{2}\.json$`. **module-content NIE ma dziś parytetu EN** (`loadModuleContent` tylko CANON) → pętla po `LOCALES` + parytet strukturalny. Zdefiniuj TESTOWALNY inwariant „dedykowane" (rozłączne zbiory id pytań per ścieżka, ≥N na ścieżkę) — zastępuje nieweryfikowalne „realnie różne". Zaktualizuj helpery `cluster-lint.test.mjs` (copyData/rmSync data/en, rewriteM1) i `data-negative.test.mjs` (fabricateEn) pod nowy layout. Decyzja layoutu plików = TU (rozwiązuje kolizję M13-3/4/5).

**M13-7 (UI) — rozdziel zachowanie:** „różny zestaw per ścieżka" = albo etykiety required/variant (już wspierane), albo NOWA reguła w `core/paths.js` ukrywająca dedykowane moduły spoza ścieżki (strukturalna, dotyka `requiredModules`/gating). Spec musi to nazwać; AC rozdzielić na strukturalne (weryfikowalne na fixtures M13-2) vs treściowe (za M13-3/4/5).

**Cross-cutting (AGENTS):** issues dotykające `path-select.js`/`module-hub.js`/`paths.json`/`validate.mjs` (M13-2, M13-7, M14-*) muszą startować z `main` PO merge M12 — inaczej kolizja na `path-select.js` (M12-2 usuwa input pseudonimu, M13-7 zmienia hub) i regresja (powrót usuniętego UI).

## Ryzyka i mitygacje

| Ryzyko | Wpływ | Mitygacja |
|---|---|---|
| Eksplozja korpusu (item 3 dedykowane × persona × PL+EN) | Wysoki nakład | Hybryda (rdzeń wspólny) ogranicza dublowanie; per-ścieżka tylko tam, gdzie persona realnie wymaga innej treści; generacja wspierana, ale z twardymi inwariantami walidatora |
| Rozjazd parytetu PL↔EN przy dużej treści | CI czerwone / dług | D2 (równolegle); walidator parytetu rozszerzony w M13-2 przed treścią |
| Re-alokacja banku zaburza golden-set / pytania krytyczne | Regresja scoringu | M13-6 osobno, po treści; pytania krytyczne M10 zamrożone; testy scoringu |
| Usunięcie certyfikatu łamie gating (cert = artefakt zaliczenia) | Regresja zaliczeń | M12-2: zachować model bramek bez wrappera cert; testy gatingu; ADR-0005 |
| Zmiana charakteru „certyfikacyjny→self-assessment" sprzeczna z wymaganiami/00 | Niespójność dokumentacji | ADR-0005 odnotowuje świadomą decyzję; aktualizacja wymagań w zakresie M12-2 |
| Self-check Skali sugeruje „ocenę/zaliczenie" | Nieporozumienie UX | NON-gating jawnie; framing diagnostyczny „gdzie jesteś", nie „zdałeś" |

## Następne kroki (wdrożenie — poza tym planem)

0. **GATE (najpierw):** sprowadź M11 EN na `main` — patrz „Stan wyjściowy / GATE". Bez tego `data/en/` nie ma na main i parytet (D2) jest pusty.
1. Po M11-na-main: `git fetch origin`, start każdego MX z aktualnego `main`, branch `issue-<n>-…`, jeden PR per issue z `Closes #<n>`, CI zielone + review Codex przed merge (AGENTS).
2. Kolejność: **M12 → (merge) → M13 → M14**. M13/M14 startują z `main` PO merge M12 (kolizja `path-select.js`/`validate.mjs`).
