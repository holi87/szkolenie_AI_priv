# Walidacja danych i raport pokrycia

| Pole | Wartość |
|---|---|
| Issue | `#13 [13][M2] Dodaj walidację danych i raport pokrycia` |
| Milestone | M2 Assessment i dane |
| Skrypt | `genai-llm-training/tests/schema-validation/validate.mjs` (pure Node, zero zależności) |
| CI | `.github/workflows/validate-data.yml` |

Walidator wykrywa braki i niespójności w danych szkolenia: waliduje **schematy** (kontrakty z `#9`) oraz **pokrycie i rozkłady** (`wymagania/06`/`07`). Działa lokalnie i w CI, bez backendu i bez zależności (zgodne z ADR-0002: statyczny hosting, brak buildu aplikacji).

## Uruchomienie

```bash
node genai-llm-training/tests/schema-validation/validate.mjs
```

Exit `0` = OK, `1` = błędy walidacji. Skrypt wypisuje **raport pokrycia** (liczby pytań per moduł, rozkład trudności, udział scenariuszowych, pytania krytyczne, kompozycja golden setu, progi ścieżek) oraz listę błędów/ostrzeżeń.

## Co sprawdza

**Schematy (struktura)** — każdy plik danych przeciw `data/schemas/*.schema.json`: wymagane pola, typy, enumy, wzorce id, struktura odpowiedzi zależna od typu pytania.

**Pokrycie i agregaty (`data/questions/mNN.json`, scalane)**
- Każdy plik `mNN.json` zawiera wyłącznie moduł `MNN` (per-file invariant) i waliduje się przeciw `questions.schema.json`.
- 116 pytań łącznie, unikalne id, liczby per moduł zgodne z curriculum.
- Rozkład trudności L1=41 / L2=46 / L3=23 / L4=6; L4 tylko na ścieżkach S3-only.
- Pytania scenariuszowe/decyzyjne ≥ 35%.
- 5 pytań krytycznych, wszystkie w M10, dokładnie 1 poprawna, konserwatywny feedback, wszystkie ścieżki.
- Integralność odpowiedzi: `correct` ⊆ `options`; multiple ≥2 poprawne; single/decyzyjne dokładnie 1.
- Spójność z `paths.json`: każda ścieżka pytania ma swój moduł w macierzy.
- Spójność z `modules.json`: liczby pytań zgadzają się z `questionRange`.

**Golden set (`golden-set.json`)**
- 24 id istnieją w banku i mają `golden: true`; lista = zbiór `golden:true` z banku.
- Po 2 pytania na moduł; rozkład 8 L1 / 10 L2 / 5 L3 / 1 L4.
- Pokrycie: ≥5 bezpieczeństwa, ≥4 QA, ≥4 techniczne, wszystkie 3 filary, wszystkie 3 ścieżki.

**Lint danych syntetycznych** (`data/questions/mNN.json`, `scenarios.json`)
- Blokuje realne domeny e-mail, potencjalne PESEL (11 cyfr inny niż placeholder), numery kart (16 cyfr).

## Integracja CI

Workflow `validate-data.yml` uruchamia walidator przy `pull_request` i `push` do `main` dotykających `genai-llm-training/data/**`, `genai-llm-training/tests/schema-validation/**` lub samego workflow. Czerwone CI = realna regresja danych (brakujące metadane, zły rozkład, zepsuta referencja, niesyntetyczne dane).
