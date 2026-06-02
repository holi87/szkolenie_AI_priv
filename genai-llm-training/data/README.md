# data/ — kontrakty danych (JSON)

**Tylko dane. Bez logiki.** Schematy i walidacja powstają w M2 (issue #9–#13); walidatory w `../tests/schema-validation/`.

Planowane kontrakty:

| Plik | Zawartość | Issue |
|---|---|---|
| `paths.json` | Macierz ścieżek S1/S2/S3: moduły, czas, testy, progi | #5 |
| `modules.json` | Metadane modułów M1–M12, struktura ekranów | #6, #9 |
| `questions.json` | Bank pytań (≥116) z metadanymi i feedbackiem | #9, #10 |
| `golden-set.json` | 24 pytania referencyjne do kalibracji | #12 |
| `scenarios.json` | Syntetyczne scenariusze szkoleniowe | #8 |

Zasady danych (AGENTS.md):
- **Wszystkie przykłady są syntetyczne** — żadnych realnych danych klienta/PII.
- Każda zmiana schematu uruchamia walidację danych (`../tests/schema-validation/`).
- Format ID pytań i konwencje pól: `../../docs/standardy-jakosci.md`.
