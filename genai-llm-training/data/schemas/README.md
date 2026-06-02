# Schematy danych kursu (kontrakty)

| Pole | Wartość |
|---|---|
| Issue | `#9 [09][M2] Zdefiniuj schematy danych kursu` |
| Milestone | M2 Assessment i dane |
| Format | JSON Schema draft-07 |
| Egzekwowanie | walidator `tests/schema-validation/validate.mjs` (issue #13) — pure Node, bez zależności |

Schematy definiują **kontrakty danych** szkolenia. Są nadrzędne wobec konkretnych plików `data/*.json`: każda zmiana danych musi nadal spełniać schemat. Egzekwowanie strukturalne i agregatowe (liczby, rozkłady, pokrycie) realizuje walidator z issue #13, uruchamiany lokalnie i w CI.

## Pliki

| Schemat | Waliduje | Kluczowe reguły |
|---|---|---|
| `modules.schema.json` | `modules.json` | 12 modułów; `id` `M1..M12`; `pillar` ∈ {foundations_technical, qa_practice, security_governance}; `questionRange` |
| `paths.schema.json` | `paths.json` (#5) | ścieżki S1/S2/S3; gating moduł×ścieżka; progi; `gates[]` (overallThreshold/criticalQuestions/practicalTask/moduleMinScore) |
| `questions.schema.json` | `questions/mNN.json` (#10/#11; shard per moduł) | `id` `^Q[0-9]{3}$`; typy pytań; struktura odpowiedzi zależna od typu; `isCritical` tylko w M10 |
| `golden-set.schema.json` | `golden-set.json` (#12) | 24 `id`; referencje do banku; kompozycja |
| `scenarios.schema.json` | `scenarios.json` (#8) | scenariusze syntetyczne; `id` `^SC-[A-Z]+-[0-9]{2}$` |
| `rubrics.schema.json` | `rubrics.json` (#7) | rubryki R1–R5; `criteria` lub `levels`; `scaleMax`, `passThreshold`; bramki `paths.json` referują `id` |
| `progress.schema.json` | model progresu (localStorage / przyszły backend) | kształt progresu, wyniki quizu per pytanie, test końcowy, zadania, certyfikat |

## Struktura odpowiedzi wg typu pytania (`questions.schema.json`)

| Typ | Pola odpowiedzi | Reguła |
|---|---|---|
| `single_choice` | `options` + `correct` | dokładnie 1 poprawna |
| `multiple_choice` | `options` + `correct` | ≥2 poprawne |
| `scenariusz`, `scenariusz_decyzyjny` | `options` + `correct` | 1 poprawna (decyzyjne); scenariusz = najlepsza decyzja |
| `dopasowanie` | `pairs` | pary w poprawnym dopasowaniu |
| `kolejnosc_procesu` | `sequence` | kroki w poprawnej kolejności |
| `analiza_outputu` | (rubryka R5, 0–3) | typ oceniany rubryką (Output verifier); zarezerwowany — bank M11 używa `scenariusz` wg mapy `wymagania/06` |

Pytanie krytyczne (`isCritical: true`) jest dozwolone wyłącznie w module `M10` (warunek konieczny zaliczenia, 100% poprawnych).

## Model progresu i przyszły backend

`progress.schema.json` definiuje **kształt** progresu, nie implementację. MVP zapisuje go w `localStorage` (ADR-0001). Ten sam payload (moduły, test końcowy, zadania praktyczne, certyfikat, wagi wyniku 30/60/10) może zostać przyjęty przez zewnętrzny backend wyników po pilotażu — bez zmian w UI (kontrakt-first). To realizuje wymóg „kontrakt wspiera późniejszy backend".

## Filary (3)

- `foundations_technical` — fundamenty i techniczne rozumienie (M1–M6, M12)
- `qa_practice` — zastosowanie w QA (M7, M8, M11)
- `security_governance` — bezpieczeństwo, governance, agenty (M9, M10)

Filar jest przypisany **per pytanie** (moduł ma filar primary; pojedyncze pytanie może mieć inny — np. pytanie governance o odrzucenie LLM przy wysokim wpływie w M11).
