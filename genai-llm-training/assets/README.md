# assets/ — logika i style

**Tylko logika i prezentacja. Bez treści szkoleniowej i bez danych pytań** (te są w `../modules/` i `../data/`).

Planowane moduły (budowa w M3, issue #14–#19):

| Plik | Odpowiedzialność |
|---|---|
| `styles.css` | Style, tokeny brandingu (zob. `../../docs/design-baseline.md` §7) |
| `app.js` | Bootstrap aplikacji, routing modułów, ładowanie danych |
| `quiz-engine.js` | Quizy inline: typy pytań, punktacja, feedback |
| `test-engine.js` | Test końcowy: losowanie wg ścieżki/trudności, pytania krytyczne |
| `scoring.js` | Liczenie wyniku, progi, bramka pytań krytycznych, zadania praktyczne |
| `progress-store.js` | Adapter progresu (localStorage; granica pod przyszły backend — ADR-0001) |
| `certificate.js` | Ekran/PDF zaliczenia, eksport JSON/CSV |
| `accessibility.js` | Wsparcie klawiatury, focus, alternatywy interakcji |

Zasady: jeden plik = jedna odpowiedzialność; limity LOC i konwencje — `../../docs/standardy-jakosci.md` i `AGENTS.md`.
