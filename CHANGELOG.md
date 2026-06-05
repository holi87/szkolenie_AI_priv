# Changelog

Format: najnowsze u góry. Wydanie 1.0 to baseline (M6); od M7 prowadzimy wpisy per-milestone (bez nadawania
numeru wydania do czasu kolejnego release). Szczegóły wydania 1.0: [`docs/release/release-notes-1.0.md`](docs/release/release-notes-1.0.md).

## M16 — Rozbudowa Skali Holaka S4 (#120–#124)

Rozszerzenie ścieżki formatywnej S4 i higiena treści; bez wpływu na 116 pytań / golden / scoring (S4 pozostaje formatywna, ADR-0009).

### Dodane
- **Klikalne źródła w treści (#121):** nowe, opcjonalne pole `links` w bloku treści (`module-content.schema.json`) +
  render `<a href>` w `module-view.js` (źródła `quality-blog.eu` jako linki zewnętrzne `https://`, opisowy tekst — WCAG 2.4.4).
- **Pełen wachlarz interakcji w S4 (#124):** MSK2 → `tune` (agenci: autonomia, uprawnienia, human-in-the-loop),
  MSK4 → `rubric` (ocena dojrzałości workflow/skilla); wzbogacona treść MSK1–4 (skille, agenci, MCP/integracje,
  mierzenie wpływu) + więcej ćwiczeń. Wszystko formatywne (bez scoringu/bramek).
- Testy: `s4-rng-links.test.mjs` (determinizm tasowania classify + render linków); aktualizacja `s4-formative` o wachlarz interakcji.

### Zmienione
- **Rozdzielenie diagnozy Skali Holaka (#122):** moduł `MSH` rozbity na **MSHP** (osoba, v2.1p) + **MSHO**
  (organizacja, v2.1e) — wybieralne niezależnie w S4. Kontrakt: 17 → **18 modułów** (`modules.schema`/`paths.schema`/
  `modules-labels.schema` — regex id + liczność), `modules.json`/`paths.json`/etykiety PL+EN, `validate.mjs`,
  `MODULE_CONTENT_SHARDS`, snapshoty i testy zaktualizowane.
- **Losowa kolejność pozycji w `classify` (#123):** `renderClassify` tasuje `items` wstrzykiwanym RNG (wzorzec RND-1
  #66) — koniec przewidywalnego wzoru A-B-A-B / klastrów; scoring po `itemId`, więc niezależny od kolejności.
- **CHANGELOG (#120):** uzupełnienie wpisów M7–M16 (poniżej).

### Usunięte
- Pliki `data/<lang>/module-content/msh.json` (zastąpione przez `mshp.json` + `msho.json`).

## M15 — Ścieżka formatywna S4 „Skala Holaka" (PR #119)
- **Dodane:** ścieżka **S4** formatywna (diagnoza MSH + 4 moduły szkoleniowe MSK1–4, interakcja `classify`),
  flaga `formative` + conditional-required w `paths.schema`, `isFormativePath`, notka autorstwa w treści; ADR-0009.
- **Zmienione:** MSH przeniesiony wyłącznie do S4 (zniknął z persona-setu S1/S2/S3, nadal non-gating); liczba modułów 13 → 17.

## M14 — Moduł Skali Holaka MSH (PR #111)
- **Dodane:** moduł diagnostyczny **MSH** (`scope: diagnostic`, bez puli pytań) + interakcja `maturity-check`
  (neutralna, non-gating, `passed: null`, integralność band) — autodiagnoza dojrzałości AI; ADR-0008.

## M13 — Ścieżki dopasowane do person (PR #110)
- **Dodane/Zmienione:** model hybrydowy `scope` (`core` vs `dedicated`) — rozłączne pule pytań per persona,
  `dedicatedQuestionsMin`, persona-set (`pathVisibleModuleIds`); walidator egzekwuje rozłączność i pokrycie pul; ADR-0006.

## M12 — Odchudzenie UX (PR #108, #109)
- **Usunięte:** pasek postępu i certyfikat self-assessment (ADR-0005).
- **Zmienione:** ekran „Wynik" zamiast certyfikatu; bez `completionId` w eksportach (prywatność).

## M11 — Wersja EN + 2 bugfixy (PR #89, #91/#107)
- **Dodane:** pełne `data/en/` + katalog UI `assets/i18n/en.json` (parytet kluczy wymuszany w `validate.mjs`).
- **Naprawione:** bug i18n (brak flagi locale) oraz bug huba; walidator: guardy brakującego/niekompletnego katalogu UI.

## M10 — Fundament i18n (PR #87)
- **Dodane:** układ per-locale (`data/<lang>/`) ze wspólną strukturą w `data/`, scalanie etykiet po ID; ADR-0004.

## M9 — UX redesign + tooling a11y/QA (PR #86)
- **Dodane:** `tokens.css` (design system, motyw jasny/ciemny, `theme.js` z anty-flashem), `icon.js` (SVG zamiast emoji),
  harness QA (kontrast, snapshot strukturalny, RNG testowy).

## M8 — Randomizacja quizów (PR #85)
- **Dodane:** RND-1 — tasowanie pozycji odpowiedzi przy renderze (wstrzykiwalny RNG, `lockOptionOrder`);
  RND-2 — lint klastrowania pozycji poprawnej (ostrzeżenie, nie błąd).

## M7 — Prywatność (PR #65)
- **Dodane/Zmienione:** audyt prywatności — zero cookies (brak bannera), model nicku tylko w pamięci, usunięcie
  deanonimizacji przez `completionId`; `prywatnosc.html` + ADR-0003; utwardzenie lintu danych syntetycznych.

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
