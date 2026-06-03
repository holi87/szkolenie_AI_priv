# Changelog

Format: jeden wpis na wydanie, najnowsze u góry. Szczegóły wydania 1.0: [`docs/release/release-notes-1.0.md`](docs/release/release-notes-1.0.md).

## [1.0] — Release 1.0 i utrzymanie (M6)

**Baseline gotowy do pilotażu/sponsora.** NIE jest to wersja po realnym pilotażu — kalibracja (#28) i poprawki
po pilotażu (#29) pozostają otwarte. Pełny kontekst: release notes.

### Dodane
- **Wdrożenie GitHub Pages (#33):** strona główna `index.html` (korzeń) przekierowuje do aplikacji
  `genai-llm-training/` ścieżką względną; inline SVG favicon (koniec 404); test regresji inwariantów wdrożenia
  (`tests/smoke/pages-deploy.test.mjs`); dokumentacja deployu i smoke ([`docs/release/deploy-github-pages.md`](docs/release/deploy-github-pages.md)).
- **Release 1.0 (#30):** release notes, instrukcja uruchomienia, znane ograniczenia, checklist jakości
  ([`docs/release/`](docs/release/)).
- **Raport KPI i ewaluacji (#31):** format do uzupełnienia po rolloucie (9 KPI + Kirkpatrick 1–4, oddzielenie
  pilotaż/produkcja) — [`docs/release/raport-kpi-ewaluacja.md`](docs/release/raport-kpi-ewaluacja.md).
- **Proces utrzymania (#32):** playbook (cykl 6-mies., OWASP/governance, wycofywanie i wymiana pytań, wymiana
  golden setu, RACI-lite, proces inkrementalny) — [`docs/release/playbook-utrzymania.md`](docs/release/playbook-utrzymania.md).

### Zmienione (chirurgiczne poprawki treści z recenzji M5)
- **#57:** M2 (okno kontekstu) — nota o zmienności mechanizmu (błąd / okno przesuwne / „lost in the middle”);
  M12 (pięć metryk) — nota faithfulness vs groundedness; Q035 — złagodzony feedback („mierz, nie zakładaj”).
- **#58:** Q105 (opcja D) i Q108 (opcja C) — mocniejsze near-miss zamiast łatwych dystraktorów; klucz, trudność,
  liczba pytań i kompozycja golden setu **bez zmian** (`validate.mjs` zielone).

### Wdrożenie
- CI `frontend-tests` rozszerzone o wyzwalacze `index.html`/`CNAME`/`.nojekyll` (zmiany wdrożenia gatowane testem).
