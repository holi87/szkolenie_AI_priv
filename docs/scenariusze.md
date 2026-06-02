# Syntetyczne scenariusze szkoleniowe

| Pole | Wartość |
|---|---|
| Issue | `#8 [08][M1] Przygotuj syntetyczne scenariusze szkoleniowe` |
| Milestone | M1 Instructional design |
| Kontrakt danych | `genai-llm-training/data/scenarios.json` |
| Źródła | `wymagania/06` (moduły, interakcje), `wymagania/07` (typy pytań), `docs/storyboard/` |

> **Polityka danych (bezpieczeństwo).** Wszystkie scenariusze są **w 100% syntetyczne i fikcyjne**. Domena e-mail: `przyklad.test` (zarezerwowana, nie istnieje). Produkty/firmy fikcyjne (NotkaApp, SklepDemo, PipeDemo). Identyfikatory w formatach jawnie testowych (`KLI-000123`, `ORD-TEST-777`, `tok_test_*`). PESEL/numery to placeholdery **nieprawidłowe** (`00000000000`). Imiona (Jan Kowalski, Anna Nowak) są generycznymi placeholderami. **Zero realnych danych klienta / PII.** Reguła zgodna z AGENTS.md i konserwatywnym podejściem M10 (A16).

## Scenariusze

| ID | Tytuł | Moduł(y) | Ścieżki | Kompetencja | Używany przez |
|---|---|---|---|---|---|
| SC-QA-01 | Generowanie przypadków testowych z wymagania | M8 | S2, S3 | Generuje testy, wykrywa braki | QA workbench, Q61–Q64 |
| SC-PII-01 | Zgłoszenie z PII — decyzja o wklejeniu do LLM | M10 | S1, S2, S3 | Klasyfikuje dane (krytyczne) | Data safety gate, Q81–Q85 |
| SC-PII-02 | Log aplikacji — co anonimizować | M10 | S2, S3 | Wskazuje dane do anonimizacji | Data safety gate, Q86–Q90 |
| SC-RAG-01 | Mini-korpus dokumentacji QA do retrieval/RAG | M4, M5, M6 | S3 | Retrieval, diagnoza, pipeline RAG | Mapa semantyczna, Retrieval debugger, Zbuduj pipeline RAG, Q33–Q50 |
| SC-AGENT-01 | Nadanie uprawnień agentowi QA | M9 | S3 | Minimalna kontrola uprawnień | Agent permission board, Q76–Q78 |
| SC-VERIFY-01 | Odpowiedź LLM z halucynacjami | M11 | S1, S2, S3 | Oznacza zdania outputu | Output verifier, Q95–Q98 |
| SC-PROMPT-01 | Wadliwy prompt do poprawy | M7 | S1, S2, S3 | Poprawia prompt wg rubryki | Prompt clinic, Q57–Q60, rubryka R1 |
| SC-EVAL-01 | Rozjazd oceny człowieka i LLM-as-a-judge | M12 | S3 | Wykrywa bias, kalibruje | Judge calibration lab, Q113–Q116, rubryka R3 |

Pokrycie zakresu issue #8: QA (SC-QA-01), PII/higiena danych (SC-PII-01/02), mini-korpus retrieval/RAG (SC-RAG-01), agenci/uprawnienia (SC-AGENT-01); dodatkowo weryfikacja (SC-VERIFY-01), prompt (SC-PROMPT-01), ewaluacja (SC-EVAL-01). Scenariusze spójne ze storyboardem i mapowaniem pytań.

## Kryteria akceptacji issue #8
- [x] Scenariusze są syntetyczne — polityka danych powyżej; dane jawnie fikcyjne i nieprawidłowe.
- [x] Każdy scenariusz ma moduł, ścieżkę i kompetencję — kolumny tabeli + pola w `scenarios.json`.
- [x] Brak realnych danych klienta — domena `przyklad.test`, fikcyjne produkty, placeholdery nieprawidłowe (do potwierdzenia przez recenzję security w M5, issue #26).
- [x] Gotowe do `data/scenarios.json` — kontrakt już utworzony (`genai-llm-training/data/scenarios.json`).
