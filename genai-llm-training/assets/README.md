# assets/ — logika i style

**Tylko logika i prezentacja. Bez treści szkoleniowej i bez danych pytań** (te są w `../modules/` i `../data/`).

Dostarczone w M3 (issue #14–#19). Podział: `core/` = czysta logika (zero DOM, testowalna w Node), `ui/` = render DOM, `app.js` = orkiestracja, `styles.css` = style/tokeny.

## `core/` — logika (pure, ES modules, zero zależności)

| Plik | Odpowiedzialność | Issue |
|---|---|---|
| `data-loader.js` | Ładowanie i scalanie kontraktów danych (shardy banku pytań); ścieżki względne | #14/#16 |
| `paths.js` | Macierz ścieżek S1/S2/S3, gating modułów, blokada testu końcowego | #15 |
| `progress-store.js` | Model progresu + adapter storage (localStorage/in-memory; granica pod backend — ADR-0001) | #16 |
| `quiz-engine.js` | Punktacja per typ pytania, partial credit, pytania krytyczne, feedback | #17 |
| `test-engine.js` | Losowanie testu końcowego wg ścieżki/trudności; wymuszenie pytań krytycznych | #18 |
| `scoring.js` | Wynik ścieżki, bramki zaliczenia (próg, krytyczne, praktyczne), słabe moduły | #18 |
| `certificate.js` | Model certyfikatu (tylko gdy zaliczone), eksport JSON/CSV bez PII | #19 |

## `ui/` — render DOM + style

| Plik | Odpowiedzialność | Issue |
|---|---|---|
| `dom.js` | Bezpieczne helpery DOM (textContent, nie innerHTML) | #14 |
| `shell.js` | Header (ścieżka, progres) + nawigacja modułów ze statusami | #14 |
| `path-select.js` | Ekran wyboru ścieżki + macierz modułów | #15 |
| `quiz-view.js` | Render pytania (każdy typ, klawiaturowo) + feedback | #17 |
| `test-view.js` | Przebieg testu końcowego (tryb testu: brak feedbacku do końca) | #18 |
| `certificate-view.js` | Ekran wyniku/zaliczenia + pobranie eksportu JSON/CSV | #19 |

`app.js` — bootstrap, router ekranów, spięcie `core/` z `ui/`. `styles.css` — style i tokeny brandingu (podmienne, `../../docs/design-baseline.md` §7).

Testy silników: `../tests/smoke/*.test.mjs` (node:test, CI `frontend-tests.yml`). Dostępność interakcji: `../../docs/design-baseline.md`.
Zasady: jeden plik = jedna odpowiedzialność; limity LOC i konwencje — `../../docs/standardy-jakosci.md` i `AGENTS.md`.
