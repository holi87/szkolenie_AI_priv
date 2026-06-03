# data/ — kontrakty danych (JSON)

**Tylko dane. Bez logiki.** Schematy w `schemas/`, walidacja w `../tests/schema-validation/`.

## Układ per-locale (ADR-0004)

Wielojęzyczność: treść tłumaczona leży w katalogach per-locale `data/<lang>/`, **PL jest kanoniczny**.
Struktura krytyczna dla scoringu jest **single-source** (wspólna, nie duplikowana między locale).

```
data/
  modules.json          # WSPÓLNE — struktura modułów (id/order/pillar/timeFullMin/questionRange)
  paths.json            # WSPÓLNE — gating ścieżka×moduł, progi, bramki (gates), warianty
  golden-set.json       # WSPÓLNE — 24 ID referencyjne (language-neutral)
  schemas/              # WSPÓLNE — kontrakty JSON Schema
  pilot/                # WSPÓLNE — syntetyczna próbka pilotażu
  pl/                   # locale kanoniczny
    questions/m01..m12.json     # bank pytań (116) per moduł
    module-content/m01..m12.json# treść + config interakcji per moduł
    rubrics.json                # rubryki zadań praktycznych
    scenarios.json              # scenariusze
    modules.labels.json         # carve-out: prose modułów (name/level/interactiveElement/keyConcepts/learningOutcomes) po ID
    paths.labels.json           # carve-out: prose ścieżek (name/assumedPathTime) po ID
  en/                   # dochodzi w milestone EN (#81+): ten sam układ co pl/
```

`assets/core/data-loader.js` scala strukturę (wspólną) z etykietami (per-locale) **po ID** — kształt danych
dla UI jest identyczny jak przed podziałem (`module.name`, `path.name` itd. działają bez zmian).
Cutover języka: `loadTrainingData({ basePath: "data/", locale })` (domyślnie `pl`).

| Plik | Zakres | Lokalizacja |
|---|---|---|
| `modules.json` | struktura M1–M12 (single-source) | `data/` |
| `paths.json` | macierz S1/S2/S3, progi, bramki (single-source) | `data/` |
| `golden-set.json` | 24 pytania referencyjne (ID, neutralne) | `data/` |
| `<lang>/questions/mNN.json` | bank pytań (116) | `data/<lang>/` |
| `<lang>/module-content/mNN.json` | treść modułów + interakcje | `data/<lang>/` |
| `<lang>/rubrics.json` | rubryki | `data/<lang>/` |
| `<lang>/scenarios.json` | scenariusze | `data/<lang>/` |
| `<lang>/modules.labels.json` | etykiety modułów (carve-out) | `data/<lang>/` |
| `<lang>/paths.labels.json` | etykiety ścieżek (carve-out) | `data/<lang>/` |

Zasady danych (AGENTS.md):
- **Wszystkie przykłady są syntetyczne** — żadnych realnych danych klienta/PII.
- Każda zmiana danych/schematu uruchamia walidację (`../tests/schema-validation/validate.mjs`).
- **Parytet strukturalny** między locale (correct/difficulty/points/paths/isCritical/golden identyczne, PL kanon) — egzekwowany w #80.
- Format ID pytań i konwencje pól: `../../docs/standardy-jakosci.md`.
