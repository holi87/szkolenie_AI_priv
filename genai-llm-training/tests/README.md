# tests/ — walidacja i testy

Miejsce na weryfikację (budowa w M2/M5, issue #13, #25). Trzy obszary:

| Katalog | Cel | Issue |
|---|---|---|
| `schema-validation/` | Walidacja `../data/*.json`: wymagane pola, typy pytań, ścieżki, progi, metadane; raport pokrycia (liczba pytań, krytycznych, golden set) | #13 |
| `smoke/` | Testy silników (`*.test.mjs`, node:test): quiz-engine, test-engine, scoring, paths/gating, progress-store, certificate — na realnym banku, wszystkie ścieżki S1/S2/S3 (M3, #17-#19). Pełna automatyzacja render/przepływu/responsywności dochodzi w #25 | #25, M3 |
| `accessibility/` | WCAG 2.1 AA: nawigacja klawiaturą, kontrast, focus states, alternatywy interakcji | #24, #25 |

Zasady (AGENTS.md):
- Zmiana schematu danych → uruchom `schema-validation/`.
- Zmiana shared engine/danych → testuj wszystkie ścieżki S1/S2/S3.
- Dla UI sprawdzaj desktop i mobile (reflow 320 px, checkpoint 360 px — zob. `../../docs/design-baseline.md`).
