# Pytania krytyczne bezpieczeństwa (M10)

| Pole | Wartość |
|---|---|
| Issue | `#11 [11][M2] Utwórz 5 pytań krytycznych M10` |
| Milestone | M2 Assessment i dane |
| Dane | `genai-llm-training/data/questions/m10.json` (Q081–Q085, `isCritical: true`) |
| Źródła | `wymagania/06` (M10), `wymagania/07` (warunek konieczny), `docs/storyboard/m10-security-governance.md`, `scenarios.json` (SC-PII-01, SC-PII-02) |

## Reguła zaliczenia (warunek konieczny)

Pytania krytyczne to **warunek konieczny zaliczenia każdej ścieżki** (S1/S2/S3): wymagane **100% poprawnych odpowiedzi**. Niezależnie od wyniku ogólnego, błąd w którymkolwiek pytaniu krytycznym = brak zaliczenia. Bramka jest zapisana strukturalnie w `paths.json` (`gates[].type = "criticalQuestions", module: "M10", minPct: 100`) dla wszystkich trzech ścieżek.

Wszystkie 5 pytań ma `paths: ["S1","S2","S3"]` — każdy uczestnik je widzi i musi zaliczyć.

## Konserwatywne defaulty (bezpieczeństwo)

Dla pytań krytycznych stosujemy konserwatywne zachowanie domyślne (AGENTS.md):

- **Dokładnie jedna** jednoznacznie poprawna i bezpieczna odpowiedź (`type: scenariusz_decyzyjny`, `correct` = 1 opcja).
- Dystraktory to **realistyczne niebezpieczne zachowania** (nie absurdy) — odwzorowują typowe błędy.
- `feedbackIncorrect` zaczyna się od **„To jest błąd bezpieczeństwa.”** i kieruje do higieny danych / prompt injection.
- Bez dwuznaczności — jeśli w pilotażu >10% uczestników zinterpretuje pytanie inaczej niż autor, pytanie jest przepisywane (`wymagania/07`).
- Wszystkie dane **syntetyczne** (przyklad.test, NotkaApp/SklepDemo, PESEL placeholder `00000000000`, tokeny `tok_test_*`).

## Pokrycie ryzyk

| ID | Trudność | Filar ryzyka (OWASP LLM- owe) | Sprawdzana decyzja |
|---|---|---|---|
| Q081 | L2 | Prompt injection | Rozpoznać instrukcję wstrzykniętą w dane zgłoszenia i jej **nie wykonać** (potraktować jako dane, zgłosić). |
| Q082 | L2 | PII / dane klienta | **Nie wklejać** surowych danych identyfikujących; anonimizacja albo zatwierdzone narzędzie z kontrolami. |
| Q083 | L1 | Data leakage / sekrety | **Usunąć token i sekrety** przed użyciem publicznego modelu — sekret nigdy nie trafia do LLM. |
| Q084 | L1 | Acceptable use | Narzędzie spoza listy zatwierdzonych + nieznana retencja → **zachowawczo nie wgrywać**, pytać o zgodność. |
| Q085 | L1 | Audit trail | Odnotować minimalny ślad audytowy (kto/kiedy/narzędzie/cel/kategoria danych/weryfikacja) **bez wrażliwej treści**. |

## Weryfikacja

Egzekwowane automatycznie przez walidator (`#13`): liczba krytycznych = 5, wszystkie w M10, dokładnie 1 poprawna odpowiedź, obecność konserwatywnego feedbacku, pokrycie wszystkich ścieżek, bramka 100% w `paths.json`. Dodatkowo przeszły adversarial review treści (0 uwag dla M10).
