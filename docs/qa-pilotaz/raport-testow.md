# Raport testów dla osoby wdrażającej (M5 #25)

Powtarzalna weryfikacja aplikacji i danych przed pilotażem. Wszystko **pure Node, bez zależności i bez
przeglądarki** (ADR-0002). Te same komendy uruchamia CI.

## Uruchom wszystko (3 komendy)

```bash
cd genai-llm-training
node --test tests/smoke/*.test.mjs                 # silniki + smoke render + a11y + test negatywny + kalibracja
node tests/schema-validation/validate.mjs          # walidacja danych + raport pokrycia
node tools/calibration/calibrate.mjs --self-test   # narzędzie kalibracji (dane syntetyczne)
```

Exit 0 = OK; exit 1 = błąd (czytelny opis w wyjściu). Brak Node? `setup-node@v4` w CI używa Node 20.

## Wynik referencyjny (2026-06-03, na `main` + ten PR)

| Bramka | Wynik |
|---|---|
| `node --test tests/smoke/*.test.mjs` | **102 testy, 102 pass, 0 fail** (12 plików) |
| `validate.mjs` | **✅ WALIDACJA OK** — 116 pytań, trudność 41/46/23/6, 5 krytycznych, golden 24, treść 12/12, próbka pilotażu OK |
| `calibrate.mjs --self-test` | **✅ self-test kalibracji OK** |

## Co bramkuje każdy gate

| Plik / komenda | Sprawdza | Failuje gdy |
|---|---|---|
| `validate.mjs` | Kontrakty `data/*.json`, pokrycie (liczby pytań/trudność/krytyczne/golden), treść 12 modułów, próbka pilotażu, **lint danych syntetycznych** | Złe pola/typy, zła liczba pytań, pusty moduł, realne PII/domeny |
| `smoke/*.test.mjs` (silniki) | quiz-engine, test-engine, scoring, paths/gating, progress-store, certificate, interactions, practical-pass — na realnym banku, ścieżki S1/S2/S3 | Regresja logiki scoringu/gatingu/progresu |
| `smoke/render-smoke.test.mjs` | Realny render `ui/*` na prawdziwych danych pod stubem DOM (ekrany, interakcje, pytania, test, certyfikat, nawigacja) + a11y drzewa (etykiety, legendy, scope, opis diagramu) | Render rzuca wyjątek; kontrolka bez etykiety; fieldset bez legendy; tabela bez scope; diagram bez opisu |
| `smoke/a11y-static.test.mjs` | `index.html`/`styles.css`: lang, viewport, skip-link, ARIA paska postępu, focus-visible, reguła reflow, klasa dla czytników | Brak któregokolwiek elementu dostępności/responsywności |
| `smoke/data-negative.test.mjs` | **Dowód, że walidator wykrywa regresję** (pusty moduł, zła liczba pytań, dane niesyntetyczne) | Walidator NIE failuje na uszkodzonych danych |
| `smoke/calibration.test.mjs` + `calibrate.mjs` | Kalibracja: zakresy trudności L1–L4, krytyczne >10% niejasności, status golden setu | Błędne flagi kalibracji |

## Zakres urządzeń (desktop / tablet / mobile)

Render automatyczny działa bez wymiarów (logika + a11y drzewa). Sprawdzenie wizualne **desktop / tablet 768 /
mobile 360 / wąski 320 px**, nawigacji klawiaturą i widocznego focus → checklista manualna
[`checklist-manualna.md`](checklist-manualna.md). Status z 2026-06-03: **wszystkie pozycje zaliczone**
(zweryfikowane Playwright: skip-link na pierwszy Tab; reflow M7 w 320 px bez rozpychania; 0 błędów JS poza
favicon 404).

## CI

| Workflow | Co uruchamia | Trigger (paths) |
|---|---|---|
| `.github/workflows/frontend-tests.yml` | `node --test tests/smoke/*.test.mjs` + `calibrate.mjs --self-test` | `genai-llm-training/**` |
| `.github/workflows/validate-data.yml` | `validate.mjs` | `genai-llm-training/data/**`, `tests/schema-validation/**` |

> Nowy plik w `tests/smoke/*.test.mjs` jest **automatycznie** uruchamiany przez CI (glob). Narzędzia w `tools/`
> wymagają jawnego kroku w workflow — pamiętaj o tym, dodając kolejne narzędzia (inaczej „zielone CI” nie
> będzie nic gwarantować dla nieuruchamianego pliku).
