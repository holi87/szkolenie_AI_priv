# Macierz ścieżek S1/S2/S3

| Pole | Wartość |
|---|---|
| Issue | `#5 [05][M1] Zamroź macierz ścieżek S1/S2/S3` |
| Milestone | M1 Instructional design |
| Status | Zamrożona (F1 rozstrzygnięta decyzją SA; do merge + recenzji) |
| Kontrakt danych | `genai-llm-training/data/paths.json` |
| Źródła | `wymagania/06` (status i czas modułów — autorytatywne), `wymagania/07` (testy, progi), `wymagania/03` (persony) |

> **Autorytet:** status i czas modułów pochodzą z **curriculum (`wymagania/06`)** — zgodnie z kryterium „brak sprzeczności z curriculum". Tam gdzie inne dokumenty (A4 czasy ścieżek, doc 03 priorytety) rozjeżdżają się z curriculum, rozjazd jest **oznaczony jako flaga** (sekcja „Rozjazdy"), a nie po cichu wymuszony.

---

## 1. Macierz modułów × ścieżki

Legenda: ✅ obowiązkowy · ✂️ obowiązkowy skrócony · ⭕ opcjonalny (ś = świadomościowy, r = rozszerzony)

| Moduł | Czas (pełny) | Pytania | S1 | S2 | S3 |
|---|---:|---:|:--:|:--:|:--:|
| M1 Fundamenty | 35 | 8 | ✅ | ✅ | ✅ |
| M2 Architektura | 45 | 9 | ✂️ | ✅ | ✅ |
| M3 Parametry | 30 | 7 | ⭕ | ✅ | ✅ |
| M4 Embeddings | 50 | 8 | ⭕ | ⭕ r | ✅ |
| M5 Vector DB | 55 | 8 | ⭕ | ⭕ | ✅ |
| M6 RAG | 70 | 10 | ⭕ ś | ✅ (praktyczny) | ✅ (pełny zakres = `full`) |
| M7 Prompt eng. | 65 | 10 | ✂️ | ✅ | ✅ |
| M8 QA use cases | 75 | 12 | ⭕ | ✅ | ✅ |
| M9 Agenty | 45 | 8 | ⭕ ś | ⭕ | ✅ |
| M10 Bezpieczeństwo | 80 | 14 (5 kryt.) | ✅ | ✅ | ✅ |
| M11 Weryfikacja | 60 | 10 | ✅ | ✅ | ✅ |
| M12 Ewaluacja | 90 | 12 | ⭕ | ⭕ r | ✅ |
| **Obowiązkowe** | | | **5** | **8** | **12** |

Status (gating): ✅ i ✂️ = wymagane do zaliczenia; ⭕ = dostępne, niewymagane. Pełne mapowanie maszynowe: `paths.json`.

---

## 2. Czas, testy i progi per ścieżka

| Ścieżka | Profil | Moduły obow. | Czas treści (suma) | Założenie A4 | Test końcowy | Próg | Warunek konieczny | Zadania prakt. | Podejścia |
|---|---|---|---:|---|---:|---:|---|---:|---:|
| S1 | decyzyjna | M1, M2✂️, M7✂️, M10, M11 | ~245 min (≈4,1 h) | 3,5–4,5 h | 25 | ≥75% | 100% pytań krytycznych | 0 | 3 |
| S2 | praktyk QA | M1, M2, M3, M6, M7, M8, M10, M11 | 460 min (≈7,7 h) | 6–7 h | 40 | ≥78% | 100% krytycznych + min. 4/5 zadanie promptowe | 1 | 3 |
| S3 | inżynier | M1–M12 (wszystkie) | 700 min (≈11,7 h) | 9–10 h | 55 | ≥80% | 100% krytycznych + min. 70% w M6 i M12 | 2 | 3 |

Wagi wyniku ścieżki: quiz inline **30%** / test końcowy **60%** / zadanie praktyczne **10%**. Pytania krytyczne (M10, 5 szt.) = warunek konieczny niezależny od %.

> Czas treści = suma czasów modułów obowiązkowych z curriculum. **Nie zawiera** quizów inline, testu końcowego ani zadań praktycznych — realny czas ścieżki jest wyższy. Czas S1 zakłada skrócone M2 (~30 min) i M7 (~40 min); pełne wersje dałyby ~285 min. Dokładny czas wersji skróconych doprecyzowuje storyboard (#6).

---

## 3. Rozjazdy do reconcyliacji (flagi)

### F1 — Czas ścieżek vs założenie A4 (istotny)
Suma czasów modułów obowiązkowych (curriculum, doc 06) **przekracza** czasy zakładane w A4 (`wymagania/12`), już **przed** doliczeniem quizów/testu/zadań:
- S1 ≈ 4,1 h (wersje skrócone) — **mieści się** w A4 (3,5–4,5 h). ✅
- S2 ≈ 7,7 h vs A4 6–7 h — **przekroczone** o ~40–100 min. ⚠️
- S3 ≈ 11,7 h vs A4 9–10 h — **przekroczone** o ~1,7–2,7 h. ⚠️

**Decyzja (Senior Solution Architect, delegacja właściciela) — flaga ROZSTRZYGNIĘTA:** A4 jest `[ZAŁOŻENIE]`, więc ustępuje realiom curriculum. Przyjęte:
1. **Czasy z curriculum są wiążące** (źródło dla buildu: `paths.json`); A4 oznaczone jako superseded w `wymagania/12` i `00`.
2. **Ścieżki są self-paced i wielosesyjne** — czas to suma skumulowana przez moduły (30–90 min każdy), nie jeden zasiad; dłuższe totalne czasy S2/S3 są akceptowalne dla samodzielnej nauki.
3. **Bez przycinania modułów** — zakres 12 modułów jest uzasadniony efektami uczenia; trim pod arbitralny czas zaszkodziłby nauce.

Realne orientacyjne czasy treści: **S1 ~4 h, S2 ~7,7 h, S3 ~11,7 h** (+ quizy inline, test końcowy, zadania praktyczne). Storyboard (#6) rozpisuje moduły jako samodzielne sesje, z jawnym czasem na moduł.

### F2 — doc 03 „priorytetowe moduły" vs doc 06 ścieżki (niski)
Persony (`wymagania/03`) podają „priorytetowe moduły" rozbieżne z obowiązkowymi w curriculum:
- **S1**: doc 03 wymienia M8, M9 jako priorytetowe, pomija M7; curriculum ma M7 obowiązkowy (skrócony), a M8/M9 opcjonalne.
- **S2**: doc 03 wymienia M9 jako priorytetowy i pomija M6; curriculum ma M6 obowiązkowy (praktyczny), a M9 opcjonalny.

Macierz przyjmuje **curriculum (doc 06) jako wiążące** (zgodnie z kryterium akceptacji #5). doc 03 traktować jako miękką wskazówkę personową. Rekomendacja: ujednolicić doc 03 z curriculum przy storyboardzie (#6).

---

## 4. Kryteria akceptacji issue #5

- [x] Macierz zawiera moduły, czas, status i próg dla każdej ścieżki — sekcje 1–2.
- [x] Macierz może zostać przeniesiona do `paths.json` — `genai-llm-training/data/paths.json` (kontrakt już utworzony).
- [x] Brak sprzeczności z curriculum M1-M12 — macierz wyprowadzona z `wymagania/06`; rozjazdy z A4/doc 03 oznaczone jako flagi (sekcja 3), curriculum ma pierwszeństwo.
- [x] Macierz blokuje późniejszy gating modułów — `required: true/false` per moduł/ścieżka w `paths.json` jest kontraktem gatingu dla #15.

> Flaga **F1 rozstrzygnięta** (decyzja Senior SA: realne czasy z curriculum, self-paced, bez trimu). Macierz jest **zamrożona** — struktura modułów (status/gating) i czasy są wiążące dla dalszych prac. **F2** (doc 03 vs curriculum) do kosmetycznego ujednolicenia przy storyboardzie (#6); nie blokuje.

---

## 5. M13 — model hybrydowy: rdzeń vs dedykowane (docelowy, patrz ADR-0006)

> Dokładka M13 (#94) do zamrożonej macierzy #5: **NIE zmienia** sekcji 1–4 (status/gating/progi pozostają kontraktem). Dokłada warstwę: które moduły mają **identyczną** treść+pytania we wszystkich ścieżkach (rdzeń), a które **realnie różną** treść i **rozłączną pulę pytań** per persona (dedykowane). Design, reprezentacja danych i inwariant „dedykowane": **ADR-0006**.

| Moduł | Rdzeń / dedykowany | Uzasadnienie (persona-efekt) |
|---|---|---|
| M1 Fundamenty | **rdzeń** | wspólny fundament pojęciowy dla każdej persony |
| M10 Bezpieczeństwo (5 kryt.) | **rdzeń** | bezpieczeństwo + pytania krytyczne identyczne dla wszystkich (warunek konieczny) |
| M11 Weryfikacja/halucynacje | **rdzeń** | higiena weryfikacji outputu uniwersalna |
| M2 Architektura | dedykowany | S1 świadomość ograniczeń vs S2/S3 głębia techniczna |
| M3 Parametry | dedykowany | S2 praktyczne strojenie vs S3 pełny zakres |
| M4 Embeddings / M5 Vector DB | dedykowany (gł. S3) | wewnętrzne szczegóły tylko dla inżyniera |
| M6 RAG | dedykowany | S1 świadomościowy · S2 praktyczny · S3 pełny |
| M7 Prompt eng. | dedykowany | S1 skrócony/decyzyjny vs S2/S3 warsztatowy |
| M8 QA use cases | dedykowany | nacisk QA (S2) vs automatyzacja (S3) |
| M9 Agenty | dedykowany (gł. S3) | architektura agentowa dla inżyniera |
| M12 Ewaluacja | dedykowany (gł. S3) | ewaluacja LLM/RAG techniczna |

**Docelowy efekt:** S1 (decyzyjna), S2 (praktyk/QA), S3 (inżynier) dostają w modułach dedykowanych **inną treść i osobne pytania**, nie podzbiór wspólnego banku. Rozłączność pul, liczby per (moduł×ścieżka), golden i bramki per ścieżka — domykane w M13-2…M13-6 (#95–#99); patrz ADR-0006 „Konsekwencje" (zmiana ALL-OR-NOTHING).
