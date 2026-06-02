# Standardy jakości i konwencje

Standard pracy dla kolejnych issue (issue #3). Reguły git, limity LOC, workflow PR i zasady testowania są w [`../AGENTS.md`](../AGENTS.md) — **tu ich nie powtarzamy**. Ten dokument dodaje konwencje nazw, identyfikatorów i checklisty jakości specyficzne dla aplikacji.

## Separacja odpowiedzialności

| Warstwa | Lokalizacja | Czego NIE może zawierać |
|---|---|---|
| Logika / UI | `genai-llm-training/assets/` | treści szkoleniowej, danych pytań |
| Dane (kontrakty) | `genai-llm-training/data/` | logiki, scoringu |
| Treść szkoleniowa | `genai-llm-training/modules/` | logiki engine, scoringu |
| Walidacja / testy | `genai-llm-training/tests/` | treści produkcyjnej |

## Konwencje nazw

- **Pliki/katalogi:** kebab-case (`quiz-engine.js`, `golden-set.json`).
- **Moduły treści:** `mNN-slug.html`, NN dwucyfrowo (`m01-fundamenty.html` … `m12-evaluation.html`).
- **ID pytania:** `Q` + trzy cyfry, zerowane (`Q001`, `Q081`). Unikalne w całym banku.
- **ID ścieżek:** `S1`, `S2`, `S3`. **Moduły:** `M1`–`M12`. **Poziomy trudności:** `L1`–`L4`.
- **Filary:** `technical`, `usage`, `security_governance`.

## Metadane pytania (kontrakt minimalny)

Każde pytanie ma: `id`, `module`, `pillar`, `paths[]`, `difficulty`, `bloom`, `type`, `isCritical`, `learningOutcome`, `prompt`, `options[]`, `correct[]`, `points`, `feedbackCorrect`, `feedbackIncorrect`, `references[]`. Wzorzec: `wymagania/08` („Minimalny model danych pytania"). Walidacja: `tests/schema-validation/` (issue #13).

## Checklista jakości — kod

- [ ] Jeden plik = jedna odpowiedzialność; brak mieszania treści z logiką.
- [ ] Limity LOC wg AGENTS.md; przy zbliżaniu się — wydzielić moduł/helper.
- [ ] Ścieżki względne (wymóg GitHub Pages); brak korzeni `/`.
- [ ] Dane ładowane przez `fetch()` po http(s); brak założenia o `file://`.
- [ ] Konserwatywne zachowanie domyślne dla scoringu, pytań krytycznych, certyfikatu.
- [ ] Smoke/test/walidacja adekwatne do zmiany; ścieżki S1/S2/S3 nieuszkodzone.

## Checklista jakości — treść

- [ ] Jeden ekran = jedna koncepcja/decyzja; ≤250–300 słów.
- [ ] Termin techniczny zdefiniowany przy pierwszym użyciu.
- [ ] Tabela/diagram ma wersję tekstową lub opis alternatywny.
- [ ] Powiązanie z modułem, ścieżką, efektem uczenia i pytaniami.
- [ ] **Wszystkie przykłady danych syntetyczne** — zero realnych danych klienta/PII.
- [ ] Dostępność interakcji wg `design-baseline.md` (alternatywa klawiaturowa, focus, status nie samym kolorem).

## Powiązane dokumenty

- [`../AGENTS.md`](../AGENTS.md) — git, LOC, PR, testy.
- [`design-baseline.md`](design-baseline.md) — UX, dostępność, branding.
- [`adr/0001-architektura-statycznego-szkolenia.md`](adr/0001-architektura-statycznego-szkolenia.md) — architektura.
- [`plan-wdrozenia.md`](plan-wdrozenia.md) — struktura i backlog.
