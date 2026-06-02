# Storyboard szkolenia — 12 modułów

| Pole | Wartość |
|---|---|
| Issue | `#6 [06][M1] Przygotuj storyboard 12 modułów` |
| Milestone | M1 Instructional design |
| Zależności | `#5` (macierz ścieżek / `paths.json`) |
| Źródła | `wymagania/06` (curriculum — autorytatywne dla statusu ścieżek i pytań), `docs/design-baseline.md` (UX/dostępność). Kontrakt gatingu `paths.json` dostarcza issue #5 (PR #44) — do czasu jego merge status ścieżek czytaj z curriculum. |

Storyboard rozpisuje moduły M1–M12 na **sekwencje ekranów**. Zasady: jeden ekran = jeden cel lub jedna decyzja; opis ekranu to skrót planu treści (≤250–300 słów), nie pełny tekst (ten powstaje w M4); każdy element interaktywny ma **alternatywę klawiaturową** (design-baseline); wszystkie przykłady syntetyczne. Status ścieżek (obowiązkowy/skrócony/opcjonalny) wg curriculum (`wymagania/06`); maszynowy kontrakt gatingu w `paths.json` z issue #5.

## Moduły

| Moduł | Plik | Ekrany | Quiz inline | Element interaktywny |
|---|---|---:|---|---|
| M1 | [m01-fundamenty.md](m01-fundamenty.md) | 9 | Q1–Q8 | Klasyfikator zadań |
| M2 | [m02-architektura.md](m02-architektura.md) | 9 | Q9–Q17 | Licznik kontekstu |
| M3 | [m03-parametry.md](m03-parametry.md) | 9 | Q18–Q24 | Suwaki generacji |
| M4 | [m04-embeddings.md](m04-embeddings.md) | 11 | Q25–Q32 | Mapa semantyczna |
| M5 | [m05-vector-db.md](m05-vector-db.md) | 11 | Q33–Q40 | Retrieval debugger |
| M6 | [m06-rag.md](m06-rag.md) | 12 | Q41–Q50 | Zbuduj pipeline RAG |
| M7 | [m07-prompt-engineering.md](m07-prompt-engineering.md) | 10 | Q51–Q60 | Prompt clinic |
| M8 | [m08-qa-use-cases.md](m08-qa-use-cases.md) | 10 | Q61–Q72 | QA workbench |
| M9 | [m09-agents.md](m09-agents.md) | 10 | Q73–Q80 | Agent permission board |
| M10 | [m10-security-governance.md](m10-security-governance.md) | 12 | Q81–Q94 (Q81–Q85 krytyczne) | Data safety gate |
| M11 | [m11-verification.md](m11-verification.md) | 11 | Q95–Q104 | Output verifier |
| M12 | [m12-evaluation.md](m12-evaluation.md) | 12 | Q105–Q116 | Judge calibration lab |

Razem 116 pytań (zgodnie z curriculum), w tym 5 pytań krytycznych w M10 (warunek konieczny zaliczenia).

## Kryteria akceptacji issue #6
- [x] Każdy moduł ma strukturę ekranów — 12 plików `mNN-*.md`.
- [x] Każdy ekran ma jeden cel lub decyzję — kolumna „Typ" + „Cel/treść" w sekwencji ekranów.
- [x] Treść nie tworzy ścian tekstu >250–300 słów — opisy ekranów są skrótami planu; pełna treść w M4.
- [x] Storyboard mapuje się na pytania i scenariusze — sekcja „Mapowanie na efekty i pytania" + zakresy Q per moduł zgodne z curriculum.
