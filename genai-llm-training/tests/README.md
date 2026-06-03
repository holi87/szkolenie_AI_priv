# tests/ — walidacja i testy

Weryfikacja aplikacji i danych przed pilotażem (issue #13, #25). Pure Node (`node:test` + skrypty),
zero zależności, brak przeglądarki/jsdom — zgodnie z ADR-0002 (statyczny hosting, brak buildu).

## Jak uruchomić wszystko lokalnie

```bash
cd genai-llm-training
node --test tests/smoke/*.test.mjs                      # silniki + smoke render + a11y + test negatywny + kalibracja
node tests/schema-validation/validate.mjs               # walidacja danych + raport pokrycia (exit 1 = błąd)
node tools/calibration/calibrate.mjs --self-test        # kontrola narzędzia kalibracji (dane syntetyczne)
```

Exit 0 = OK. Te same komendy uruchamia CI (`.github/workflows/frontend-tests.yml`, `validate-data.yml`).
Pełny opis dla osoby wdrażającej: `../../docs/qa-pilotaz/raport-testow.md`.

## Co pokrywają testy

| Plik / katalog | Cel | Issue |
|---|---|---|
| `schema-validation/validate.mjs` | Kontrakty i pokrycie `../data/*.json`: pola, typy pytań, ścieżki, progi, golden set, treść modułów, próbka pilotażu; lint danych syntetycznych | #13, #25, #28 |
| `smoke/*.test.mjs` (silniki) | quiz-engine, test-engine, scoring, paths/gating, progress-store, certificate, interactions, practical-pass — na realnym banku 116 pytań, ścieżki S1/S2/S3 | M3 #17-#19, M4 |
| `smoke/render-smoke.test.mjs` | **Smoke render**: realne rendery `ui/*` na prawdziwych danych pod stubem DOM — każdy ekran, interakcja, pytanie, test, certyfikat, nawigacja renderuje się bez wyjątku; asercje a11y na drzewie (etykiety, legendy, scope, opis diagramu) | #25, #24 |
| `smoke/a11y-static.test.mjs` | Statyczne kontrole `index.html`/`styles.css`: lang, viewport, skip-link, ARIA paska postępu, focus-visible, reguła reflow, klasa dla czytników | #25, #24 |
| `smoke/data-negative.test.mjs` | **Test negatywny**: psuje kopię danych (pusty moduł, zła liczba pytań, niesyntetyczne dane) i dowodzi, że walidator failuje (exit != 0) | #25 |
| `smoke/calibration.test.mjs` + `tools/calibration/calibrate.mjs` | Kalibracja pytań po pilotażu: zakresy trudności L1–L4, krytyczne >10% niejasności, status golden setu | #28 |
| `_dom-stub.mjs`, `_fixtures.mjs` | Pomocnicze (nie pliki testowe): stub DOM zero-zależnościowy, ładowanie realnych danych | — |

## Zakres ekranów (responsywność)

Automatyczny smoke render działa bez wymiarów (logika). Sprawdzenie **desktop / tablet 768 / mobile 360–320 px**,
nawigacji klawiaturą i widocznych focus states wykonuje się wg checklisty manualnej:
`../../docs/qa-pilotaz/checklist-manualna.md` (wyniki weryfikacji w `raport-testow.md`).

## Zasady (AGENTS.md)

- Zmiana schematu/danych → uruchom `schema-validation/` (+ próbka pilotażu).
- Zmiana shared engine/danych → testuj wszystkie ścieżki S1/S2/S3.
- Dla UI: desktop i mobile (reflow 320 px, checkpoint 360 px — `../../docs/design-baseline.md`).
- Nowy plik testowy w `smoke/` jest automatycznie uruchamiany przez CI (glob `*.test.mjs`); narzędzia w `tools/` wymagają jawnego kroku w workflow.
