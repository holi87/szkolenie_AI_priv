# Bank pytań — rozkład i metodyka

| Pole | Wartość |
|---|---|
| Issue | `#10 [10][M2] Utwórz bank 116 pytań z metadanymi` |
| Milestone | M2 Assessment i dane |
| Dane | `genai-llm-training/data/questions/mNN.json` (12 plików, shard per moduł; kontrakt: `schemas/questions.schema.json`) |
| Źródła | `wymagania/06` (rozkład, typy, efekty), `wymagania/07` (typy/punktacja/trudności), `docs/storyboard/`, `scenarios.json` |

Bank zawiera **116 pytań** zgodnych z mapą curriculum M1–M12. Metadane (typ, trudność, ścieżki, filar, punkty, `isCritical`, `golden`) pochodzą z **master allocation** — alokacji rozwiązanej globalnie tak, by wszystkie ograniczenia ilościowe były spełnione **jednocześnie** (nie da się ich domykać per moduł niezależnie).

Bank jest **shardowany per moduł** (`data/questions/m01.json … m12.json`) — każdy plik trzyma pytania jednego modułu i mieści się poniżej limitu LOC z AGENTS (najw. `m10.json` ≈ 660 linii). Walidator (`#13`) scala 12 plików i kontroluje pokrycie na całości oraz wymusza, że plik `mNN.json` zawiera wyłącznie moduł `MNN`.

## Rozkład

| Moduł | Pytania | L1 | L2 | L3 | L4 | Scen/dec | Krytyczne | Golden |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| M1 | 8 | 6 | 2 | 0 | 0 | 2 | 0 | 2 |
| M2 | 9 | 4 | 4 | 1 | 0 | 2 | 0 | 2 |
| M3 | 7 | 5 | 2 | 0 | 0 | 1 | 0 | 2 |
| M4 | 8 | 1 | 4 | 3 | 0 | 2 | 0 | 2 |
| M5 | 8 | 0 | 4 | 3 | 1 | 3 | 0 | 2 |
| M6 | 10 | 1 | 4 | 5 | 0 | 3 | 0 | 2 |
| M7 | 10 | 5 | 5 | 0 | 0 | 4 | 0 | 2 |
| M8 | 12 | 2 | 6 | 4 | 0 | 4 | 0 | 2 |
| M9 | 8 | 4 | 3 | 1 | 0 | 3 | 0 | 2 |
| M10 | 14 | 8 | 5 | 1 | 0 | 10 | 5 | 2 |
| M11 | 10 | 5 | 4 | 1 | 0 | 4 | 0 | 2 |
| M12 | 12 | 0 | 3 | 4 | 5 | 4 | 0 | 2 |
| **Razem** | **116** | **41** | **46** | **23** | **6** | **42** (36,2%) | **5** | **24** |

## Spełnione ograniczenia (`wymagania/07`)

- **Liczba pytań per moduł** zgodna z curriculum (`wymagania/06`): M1=8 … M12=12, razem 116.
- **Rozkład trudności** (globalny budżet): L1 41 (35%), L2 46 (40%), L3 23 (20%), L4 6 (5%).
- **L4 tylko na materiale S3** — pytania L4 wyłącznie w modułach obowiązkowych jedynie dla S3 (M5, M12), zgodnie z „L4 używane głównie dla S3”.
- **Pytania scenariuszowe/decyzyjne ≥ 35%**: 42/116 = 36,2% (`scenariusz` + `scenariusz_decyzyjny`).
- **Pytania krytyczne**: 5 (Q081–Q085, M10) — szczegóły `docs/pytania-krytyczne.md`.

## Typy pytań i punktacja (`wymagania/07`)

| Typ | Liczba | Punkty (max) | Struktura odpowiedzi |
|---|--:|--:|---|
| `single_choice` | 33 | 1 | `options` + 1 `correct` |
| `multiple_choice` | 28 | 2 | `options` + ≥2 `correct` |
| `scenariusz` | 35 | 2 | `options` + `correct` (najlepsza decyzja) |
| `scenariusz_decyzyjny` | 7 | 2 | `options` + 1 `correct` (m.in. 5 krytycznych) |
| `dopasowanie` | 8 | 1 | `pairs` (4 pary) |
| `kolejnosc_procesu` | 5 | 1 | `sequence` (kroki w kolejności) |

Każde pytanie ma: `learningOutcome`, `bloom` (remember…create), `feedbackCorrect`, `feedbackIncorrect`, `references` (ekrany modułu `MNN.x`).

## Ścieżki (eligibility testu końcowego)

`paths` pytania = ścieżki, których test końcowy może je losować (moduł obowiązkowy danej ścieżki). Wyjątki per pytanie:
- **Q014–Q015** (kolejność procesu, M2) — bez S1 (S1 ma M2 w wersji skróconej, bez kolejności procesu).
- **Q043** (reranking + grounding, M6) — tylko S3 (materiał pogłębienia inżynierskiego M6.9, poza zakresem praktycznym S2).

Pula spełnia rozmiary testów: S1 25/49+ dostępnych, S2 40/79, S3 55/116.

## Filary

`foundations_technical` 62 · `qa_practice` 31 · `security_governance` 23 (per pytanie; moduł ma filar primary).

## Dane syntetyczne

Wszystkie przykłady są syntetyczne i fikcyjne (przyklad.test, NotkaApp/SklepDemo/PipeDemo, identyfikatory testowe, PESEL placeholder `00000000000`). Lint danych w walidatorze (`#13`) blokuje realne domeny, PESEL i numery kart.

## Jakość

Treść powstała w procesie autorskim per moduł, a następnie przeszła adversarial review (poszukiwanie błędnych odpowiedzi, dwuznaczności, duplikatów, słabych dystraktorów, niespójności danych). Uwagi zostały naniesione przed scaleniem. Kalibracja empiryczna (odsetek poprawnych vs poziom trudności) nastąpi w pilotażu (`wymagania/07`).
