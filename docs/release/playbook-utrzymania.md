# Playbook utrzymania treści (proces utrzymania, #32)

Jak utrzymywać treść, bank pytań, golden set i pytania krytyczne **po wdrożeniu**, bez przebudowy całego
kursu i bez łamania bramek danych. Reguły git/PR/LOC są w [`../../AGENTS.md`](../../AGENTS.md) — tu ich nie
powtarzamy, tylko wskazujemy, jak je stosować przy utrzymaniu.

> **Status uczciwości.** Aplikacja **nie przeszła jeszcze realnego pilotażu ani kalibracji** — issue **#28**
> (kalibracja) i **#29** (pilotaż) pozostają otwarte. Narzędzia i metodyka są gotowe i przetestowane na danych
> syntetycznych, ale **golden set NIE jest `validated`**, a żaden próg trudności nie jest potwierdzony empirycznie.
> Wszystkie procedury kalibracji w tym dokumencie opisują stan **przyszły** ("po pilotażu narzędzie oznaczy…"),
> nie zrealizowany. Demonstracyjny raport w [`../qa-pilotaz/raport-kalibracji.md`](../qa-pilotaz/raport-kalibracji.md)
> jest oznaczony `DANE SYNTETYCZNE / DEMO` i **nie jest** wynikiem realnego pilotażu.

Powiązane źródła: [`wymagania/07`](../../wymagania/07_specyfikacja_systemu_testów.md) (golden set, pytania krytyczne,
progi, kalibracja), [`wymagania/11`](../../wymagania/11_ryzyka_i_mitygacje.md) (ryzyka — m.in. „Zmiany w
standardach OWASP lub narzędziach GenAI"), [`wymagania/12`](../../wymagania/12_założenia_i_pytania_otwarte.md)
(A9: golden co 6 mies.; P11: cykl aktualizacji; A16: konserwatywna polityka M10),
[`bank-pytan.md`](../bank-pytan.md), [`pytania-krytyczne.md`](../pytania-krytyczne.md),
[`standardy-jakosci.md`](../standardy-jakosci.md).

---

## 1. Cykl przeglądu co 6 miesięcy

Zgodnie z [`wymagania/12`](../../wymagania/12_założenia_i_pytania_otwarte.md) A9 (golden set co 6 mies.) i P11
(cykliczna aktualizacja) oraz [`wymagania/11`](../../wymagania/11_ryzyka_i_mitygacje.md) (przegląd treści co 6 mies.;
oddzielić pojęcia trwałe od przykładów narzędzi).

| Element | Częstotliwość | Zakres przeglądu |
|---|---|---|
| Standardy OWASP LLM Top 10 + governance | co 6 mies. (planowy) | wpływ na M10 i 5 pytań krytycznych — patrz sekcja 2 |
| Golden set (24 pytania) | co 6 mies. (planowy) | aktualność, dryf trudności, niejasność — patrz sekcja 5 |
| Przykłady narzędzi/modeli w treści | co 6 mies. (planowy) | aktualizacja nazw bez zmiany klucza/trudności — patrz sekcja 4 |
| Cały bank pytań | co 6 mies. (planowy) | pytania wycofane, spójność z curriculum — patrz sekcja 3 |

**Kalendarz.** Dwa okna w roku (np. marzec, wrzesień — daty ustala `[właściciel: Lead Instructional Designer]`).
Każde okno: przegląd → lista zmian → osobne PR per temat (sekcja 7) → walidacja → merge.

**Wyzwalacze nadzwyczajne (poza cyklem):**

- Nowa edycja **OWASP LLM Top 10** lub istotna zmiana governance (AI Act / NIST AI RMF) — przegląd M10 + pytań krytycznych.
- Wycofanie/zmiana nazwy narzędzia lub modelu używanego w przykładach — aktualizacja przykładów (sekcja 4).
- Zgłoszenie niejasności pytania krytycznego (>10% w pilotażu lub realnym użyciu) — natychmiastowy przegląd (sekcja 3).
- Zmiana polityki danych QualityCat (rozstrzygnięcie P1/P5, dziś brak — A16) — przegląd M10.

---

## 2. Śledzenie standardów: OWASP LLM Top 10 + governance

`[właściciel: SME Security/Governance]` monitoruje źródła; `[właściciel: Lead Instructional Designer]` decyduje
o zakresie zmian w treści i pytaniach.

| Co monitorujemy | Wpływ na kurs |
|---|---|
| OWASP LLM Top 10 (nowe edycje, rekategoryzacje ryzyk) | M10 i 5 pytań krytycznych Q081–Q085 |
| AI Act / NIST AI RMF (obowiązki, terminologia) | M10 (governance), ew. M11 (kontrola outputu) |
| Acceptable-use / polityka danych QualityCat (P1, P5; dziś brak — A16) | M10, pytania krytyczne, zakazy/zalecenia |

**Mapowanie pytań krytycznych na ryzyka** (z [`pytania-krytyczne.md`](../pytania-krytyczne.md)) — przy zmianie
standardu sprawdź, czy odwzorowanie nadal jest aktualne:

| Pytanie | Ryzyko OWASP-owe | Sprawdzana decyzja |
|---|---|---|
| Q081 | Prompt injection | nie wykonać instrukcji wstrzykniętej w dane |
| Q082 | PII / dane klienta | nie wklejać surowych danych identyfikujących |
| Q083 | Data leakage / sekrety | usunąć token i sekrety przed użyciem publicznego modelu |
| Q084 | Acceptable use | narzędzie spoza listy → zachowawczo nie wgrywać |
| Q085 | Audit trail | minimalny ślad audytowy bez wrażliwej treści |

**Zasada trwałości (z `wymagania/11`).** Oddzielamy **pojęcia trwałe** (prompt injection, PII, sekrety) od
**przykładów narzędzi** (nazwy modeli). Zmiana standardu zwykle dotyka opisu/uzasadnienia, **nie** klucza
odpowiedzi pytania krytycznego. Pytanie krytyczne zmieniamy tylko procedurą wycofania/wymiany (sekcja 3) z
zachowaniem konserwatywnych defaultów: 1 poprawna odpowiedź, `feedbackIncorrect` zaczyna się od
„To jest błąd bezpieczeństwa.", `paths: ["S1","S2","S3"]`, bramka 100% w `paths.json` — wszystko egzekwowane
przez [`validate.mjs`](../../genai-llm-training/tests/schema-validation/validate.mjs).

---

## 3. Pytania wycofane (deprecated): oznaczanie, wymiana, historia

Walidator wymusza **dokładne** liczby: total = 116, count per moduł (M1=8 … M12=12), budżet trudności
(L1=41 / L2=46 / L3=23 / L4=6), 5 pytań krytycznych w M10, udział scenariuszowych ≥ 35%. Dlatego:

- **Nie wolno** usunąć pytania bez wymiany (115 ≠ 116 → CI czerwone).
- **Nie wolno** zostawić flagi `deprecated: true` jako 117. wpisu w `mNN.json` (117 ≠ 116, a plik `mNN.json`
  ma zawierać tylko swój moduł → CI czerwone).

**Procedura wycofania = wymiana 1:1.** Wycofywane pytanie zastępujemy nowym o **tej samej kompetencji** i
zachowujemy metadane utrzymujące wszystkie bramki:

| Atrybut nowego pytania | Musi być równy wycofanemu, bo… |
|---|---|
| `module` | count per moduł i `questionRange` w `modules.json` |
| `difficulty` (L1–L4) | globalny budżet trudności (exact equality) |
| `type` (gdy `scenariusz`/`scenariusz_decyzyjny`) | udział scenariuszowych ≥ 35% |
| `pillar` | pokrycie filarów (m.in. golden) |
| `paths[]` | eligibility testu i pokrycie ścieżek |
| `isCritical` | liczba krytycznych = 5, wszystkie w M10 |
| `golden` | kompozycja golden setu (patrz sekcja 5) |

Nowe pytanie zachowuje konwencje z [`standardy-jakosci.md`](../standardy-jakosci.md): `id` typu `QNNN`
(unikalne), pełen komplet metadanych, dane **syntetyczne** (`przyklad.test`).

**Zachowanie historii.** Archiwum to **git history** (pełna treść wycofanego pytania w diffie PR). Dla
przeglądalności prowadzimy notkę zmian **poza** glob `^m\d{2}\.json$`, którego skanuje `validate.mjs` — np.
tabela w tym dokumencie lub osobny plik `docs/release/wycofane-pytania.md`. **Nigdy** jako dodatkowy wpis w banku.

**Walidacja po wymianie:** `node genai-llm-training/tests/schema-validation/validate.mjs` (oczekiwane:
total 116, budżet trudności bez zmian, golden 24, krytyczne 5).

---

## 4. Aktualizacja przykładów narzędzi (nazwy modeli/narzędzi się starzeją)

Nazwy modeli i narzędzi starzeją się szybciej niż pojęcia (ryzyko z [`wymagania/11`](../../wymagania/11_ryzyka_i_mitygacje.md)).
Aktualizujemy je **bez** dotykania klucza odpowiedzi ani poziomu trudności.

**Gdzie w danych występują przykłady:**

- Treść modułów: `genai-llm-training/data/module-content/mNN.json` (ekrany, interakcje).
- Treść statyczna modułów: `genai-llm-training/modules/` (HTML).
- Scenariusze: `genai-llm-training/data/scenarios.json`.
- Treść pytań: `genai-llm-training/data/questions/mNN.json` — pola `prompt`, `options`, `feedback*` (NIE `correct`/`difficulty`).

**Zasady:**

- Zmieniamy **tekst przykładu** (nazwa narzędzia/modelu), nie `correct`, `difficulty`, `type`, `pillar`, `paths`.
- Preferuj sformułowania trwałe („zatwierdzone narzędzie GenAI", „publiczny model") tam, gdzie konkretna nazwa
  nie jest dydaktycznie potrzebna — mniej częstej aktualizacji.
- Dane pozostają syntetyczne (`przyklad.test`, `NotkaApp`/`SklepDemo`, PESEL placeholder `00000000000`,
  tokeny `tok_test_*`). Lint w `validate.mjs` blokuje realne domeny e-mail, 11-cyfrowe PESEL ≠ placeholder, 16-cyfrowe karty.
- Po zmianie treści pytań sprawdź, czy `learningOutcome` i `references` (ekrany `MNN.x`) nadal pasują.

**Walidacja:** `node genai-llm-training/tests/schema-validation/validate.mjs` (kontrakty + lint syntetyczny);
przy zmianie `module-content/**` walidator sprawdza też integralność interakcji (`classify`/`rubric`/`tune`).

---

## 5. Przegląd i WYMIANA golden setu (24 pytania)

Golden set = 24 pytania (po 2/moduł), skład L1=8 / L2=10 / L3=5 / L4=1, min. 5 bezpieczeństwo / 4 QA /
4 techniczne, pokrycie 3 filarów i 3 ścieżek, **bez** pytań krytycznych (100%-bramkowane nie różnicują).
Kontrakt egzekwuje `validate.mjs`; status `validated` liczy
[`calibrate.mjs`](../../genai-llm-training/tools/calibration/calibrate.mjs).

**Warunki wymiany pytania golden:**

- Dryf trudności w pilotażu (odsetek poprawnych poza zakresem dla poziomu).
- Niejasność > 5% (próg golden w `calibrate.mjs`, `GOLDEN_AMBIGUITY_MAX`).
- Dezaktualizacja merytoryczna (zmiana standardu/narzędzia, gdy nie da się poprawić samym tekstem przykładu).

**Procedura wymiany (zachowanie kompozycji).** Wymieniane pytanie golden zastępujemy innym z **tego samego
modułu** o **tym samym poziomie trudności i filarze**, tak by skład L1/L2/L3/L4, „po 2 na moduł" oraz progi
sec/QA/tech pozostały spełnione. Aktualizujemy zgodnie listę w `genai-llm-training/data/golden-set.json`
(`questionIds`) i flagę `golden` w banku — `validate.mjs` wymaga, by lista golden-set.json **dokładnie**
odpowiadała pytaniom `golden:true` w banku.

**Ponowna walidacja (po pilotażu — stan przyszły):**

```bash
cd genai-llm-training
node tools/calibration/calibrate.mjs ścieżka/do/pilot-results.json > ../docs/qa-pilotaz/raport-kalibracji-<data>.md
node tests/schema-validation/validate.mjs   # kontrakt golden 24 + kompozycja
```

`calibrate.mjs` oznaczy golden jako `validated` **wyłącznie** przy pełnym pokryciu 24/24 w pilotażu, wszystkich
pozycjach w zakresie i niejasności ≤ 5%. **Każda wymiana pytania golden cofa status do „wymaga poprawek", dopóki
świeży pilotaż nie pokryje wszystkich 24.** Dziś — przed pilotażem (#28/#29) — golden **nie jest** `validated`.

---

## 6. Właściciele treści i testów (RACI-lite)

Role jako placeholdery — przypisanie ustala QualityCat (P11 — owner treści; A9/`wymagania/07` — właściciel golden setu).

| Obszar | Odpowiedzialny (R) | Zatwierdza (A) | Konsultowany (C) |
|---|---|---|---|
| Treść modułów (M1–M12) | `[właściciel: Instructional Designer]` | `[właściciel: Lead Instructional Designer]` | `[właściciel: SME GenAI]` |
| Bank pytań + trudność | `[właściciel: Question Author]` | `[właściciel: Lead Instructional Designer]` | `[właściciel: QA Reviewer]` |
| Golden set (24) | `[właściciel: Lead Instructional Designer]` | `[właściciel: SME GenAI]` | `[właściciel: QA Reviewer]` |
| Pytania krytyczne (M10) | `[właściciel: SME Security/Governance]` | `[właściciel: Lead Instructional Designer]` | `[właściciel: QA Reviewer]` |
| Standardy OWASP/governance | `[właściciel: SME Security/Governance]` | `[właściciel: Lead Instructional Designer]` | — |
| Walidacja danych + CI | `[właściciel: Maintainer/QA Eng]` | `[właściciel: Lead Instructional Designer]` | — |

Informowani (I): zespół projektu szkolenia. Walidacja golden setu i pytań krytycznych zawsze przez dwie role
(autor + recenzent), zgodnie z procesem kalibracji w [`wymagania/07`](../../wymagania/07_specyfikacja_systemu_testów.md).

---

## 7. Proces aktualizacji inkrementalnej (jedna zmiana = jeden PR)

Utrzymanie idzie **przyrostowo**, bez przebudowy całego kursu. Zgodnie z [`../../AGENTS.md`](../../AGENTS.md):
jeden temat = jeden branch = jeden PR, `Closes #<numer>`, zielone CI i review Codexa przed merge, limity LOC.

**Kroki dla pojedynczej zmiany utrzymaniowej:**

1. Z aktualnego `main` utwórz branch tematyczny (np. `issue-NN-aktualizacja-przykladow-m07`).
2. Wprowadź **jedną** zmianę (jedno wycofane pytanie / jeden zaktualizowany przykład / jedna wymiana golden).
3. Walidacja danych: `node genai-llm-training/tests/schema-validation/validate.mjs` (kontrakty + pokrycie + lint).
4. Smoke + self-test kalibracji: `node --test genai-llm-training/tests/smoke/*.test.mjs`
   oraz `node genai-llm-training/tools/calibration/calibrate.mjs --self-test`.
5. PR z opisem zakresu i checklistą z [`../../AGENTS.md`](../../AGENTS.md); poczekaj na zielone CI i review.

**Bramki CI (realne workflowy w repo):**

| Workflow | Co uruchamia | Wyzwalacz (paths) |
|---|---|---|
| `validate-data` | `validate.mjs` (116 pytań, budżet trudności, krytyczne, golden, lint syntetyczny) | `genai-llm-training/data/**`, `tests/schema-validation/**` |
| `frontend-tests` | smoke (`node --test`) + `calibrate.mjs --self-test` | `genai-llm-training/**` |

**LOC.** Limit 700–800 LOC/plik (1000 wyjątkowo, z uzasadnieniem — `AGENTS.md`). Bank jest shardowany per moduł;
`m10.json` jest już blisko limitu (≈ 660 linii) — jeśli wymiana pytania powiększy plik ponad limit, wydziel/przenieś
zgodnie z zasadą shardowania (`mNN.json` zawiera wyłącznie moduł `MNN`).

**Czego NIE robimy:** masowej przebudowy banku, zmiany budżetu trudności „przy okazji", łączenia refactoru z
aktualizacją treści w jednym PR, oznaczania golden `validated` bez realnego pilotażu (#28/#29).
