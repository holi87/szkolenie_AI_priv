# Analiza biznesowa szkolenia GenAI i LLM dla QualityCat

## 4. **Analiza potrzeb szkoleniowych (TNA)**

### Luki kompetencyjne per ścieżka

| Ścieżka | Stan obecny `[ZAŁOŻENIE]` | Luka kompetencyjna | Stan docelowy | Sposób pomiaru |
|---|---|---|---|---|
| S1 | Uczestnik zna GenAI jako narzędzie tekstowe, ale nie zna ograniczeń | Nie odróżnia zadania bezpiecznego od zadania wymagającego kontroli, nie zna ryzyk danych | Potrafi sklasyfikować przypadek użycia jako: dozwolony, warunkowo dozwolony, niedozwolony | Scenariusze decyzyjne, min. 80% poprawnych decyzji |
| S1 | Uczestnik nie rozumie, dlaczego LLM może się mylić | Brak modelu mentalnego halucynacji i probabilistycznego charakteru odpowiedzi | Potrafi wskazać 3 powody, dla których output wymaga weryfikacji | Quiz po M1/M11 |
| S2 | Uczestnik używa promptów ad hoc | Brak struktury promptu, kryteriów, przykładów i formatów wyjścia | Tworzy prompt z rolą, celem, kontekstem, ograniczeniami, formatem i kryteriami oceny | Zadanie praktyczne oceniane rubryką |
| S2 | Uczestnik generuje testy, ale nie waliduje ich jakości | Brak checklisty kontroli kompletności, ryzyk i traceability | Potrafi ocenić wygenerowane przypadki testowe względem wymagań i ryzyk | Scenariusz QA + pytania multiple choice |
| S3 | Uczestnik zna ogólnie API/narzędzia, ale nie zna ograniczeń RAG | Brak rozróżnienia między retrieval failure, generation failure i problemem chunkingu | Potrafi zdiagnozować błąd RAG na podstawie objawów i logów koncepcyjnych | Case techniczny w M6 |
| S3 | Uczestnik nie ma procesu ewaluacji LLM | Brak golden setu, metryk, kalibracji LLM-as-a-judge | Potrafi zaprojektować minimalny plan ewaluacji dla use case QA | Zadanie projektowe + test końcowy |
| Wszystkie | Brak wspólnego standardu bezpieczeństwa | Niespójne decyzje o PII, danych klienta, kodzie, IP | Stosowanie checklisty higieny danych i zasad akceptowalnego użycia | Pytania krytyczne z wymogiem 100% poprawności |

### Priorytety szkoleniowe

| Priorytet | Obszar | Uzasadnienie | Wymagane moduły |
|---:|---|---|---|
| 1 | Bezpieczeństwo danych i governance | Najwyższy wpływ ryzyka przy masowym użyciu GenAI | M10, M11 |
| 2 | Praktyczne użycie w QA | Bezpośredni wpływ na produktywność i jakość artefaktów | M7, M8 |
| 3 | Fundamenty i ograniczenia LLM | Warunek poprawnej interpretacji wyników | M1, M2, M3 |
| 4 | RAG, embeddings, vector databases | Potrzebne ścieżce technicznej do oceny rozwiązań | M4, M5, M6 |
| 5 | Ewaluacja i mierzenie jakości | Warunek skalowania rozwiązań GenAI w sposób kontrolowany | M12 |
