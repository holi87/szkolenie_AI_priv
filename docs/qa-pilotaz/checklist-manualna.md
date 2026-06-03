# Checklista manualna: responsywność i dostępność (M5 #25)

Uzupełnia testy automatyczne (`tests/smoke/*`) o to, czego pure-Node nie sprawdzi: realne wymiary
(desktop/tablet/mobile), nawigację klawiaturą i widoczny focus. Zgodnie z ADR-0002 nie wprowadzamy
przeglądarki do CI — tę checklistę wykonuje QA lokalnie przed wdrożeniem.

## Jak uruchomić lokalnie

```bash
cd genai-llm-training
python3 -m http.server 8077
# otwórz http://localhost:8077/index.html
```

## Breakpoints do sprawdzenia

| Profil | Szerokość | Oczekiwane |
|---|---|---|
| Desktop | ≥ 1024 px | Layout 2-kolumnowy (nawigacja + treść), max-width treści ograniczony |
| Tablet | 768 px | Layout 1-kolumnowy (≤720 px), przycisk „Moduły” pokazuje/chowa nawigację |
| Mobile | 360 px | 1 kolumna, brak poziomego scrolla, kontrolki pełnej szerokości |
| Wąski | 320 px | Brak rozpychania (reflow): fieldset/legend/select/option się zawijają |

## Checklista

### Responsywność
- [x] Desktop: ekran wyboru ścieżki i moduł renderują się w 2 kolumnach.
- [x] ≤720 px: layout przechodzi na 1 kolumnę (CSS `@media (max-width:720px)`), nawigacja sterowana przyciskiem „Moduły” (`aria-expanded`).
- [x] 360 px: brak poziomego paska przewijania na ekranie modułu i testu.
- [x] **320 px: brak rozpychania layoutu** — treść M7 (narracja + rubryka + quiz inline) mieści się w jednej kolumnie (zob. dowód niżej).
- [x] Długie opcje/legendy/tabele zawijają się (`min-width:0`, `max-width:100%`); tabela ma własny scroll poziomy (`.content-table__wrap`).

### Klawiatura i focus (WCAG 2.1.1, 2.4.1, 2.4.7)
- [x] **Tab z góry strony fokusuje najpierw skip-link** „Przejdź do treści” (zweryfikowane Playwright — element `[active]` po pierwszym Tab).
- [x] Skip-link prowadzi do `#view` (główna treść, `tabindex="-1"`).
- [x] Wszystkie kontrolki to natywne elementy (radio/checkbox/select/button) — dostępne z klawiatury bez dodatkowego kodu; powiązania `label[for]`/`aria-label` weryfikuje `render-smoke.test.mjs`.
- [x] Focus jest widoczny (`:focus-visible { outline }` — weryfikuje `a11y-static.test.mjs`).
- [x] Element zablokowany (test końcowy przed spełnieniem bramek) jest realnie `disabled` + ma `title`/powód blokady.

### Brak błędów JS (kryterium #25)
- [x] Konsola po załadowaniu: **brak błędów JS**. Jedyny wpis to `favicon.ico 404` (brak ikony, nie błąd skryptu) — nieszkodliwy.
- [x] Przejście ścieżka → moduł → interakcja → quiz → (gating testu) bez wyjątków w konsoli.

### Treść/gating (spójność z danymi)
- [x] Powód blokady testu renderuje moduły i zadania praktyczne, np. S2: „ukończ moduły wymagane: M1, M2, M3, M6, M7, M8, M10, M11; zalicz zadania praktyczne (wymagany próg): R1-prompt”.

## Dowód (weryfikacja Playwright, 2026-06-03)

- **Boot (desktop):** ekran wyboru ścieżki renderuje S1/S2/S3 z poprawnymi nazwami, czasami, progami i liczbą pytań. Konsola: 0 błędów JS (poza favicon 404).
- **Klawiatura:** pierwszy `Tab` ustawia focus na skip-linku „Przejdź do treści” (`link [active]`).
- **320 px / M7 (S2):** pełny moduł — treść, interakcja rubryki (kryteria z checkboxami), quiz inline — w jednej kolumnie, bez poziomego rozpychania. Screenshot wykonano i zweryfikowano w trakcie recenzji (artefakt nie jest commitowany do repo).
- **Gating:** test końcowy `disabled` z czytelnym powodem blokady (moduły + zadanie praktyczne R1-prompt).

> Wynik: **wszystkie pozycje checklisty zaznaczone**. Brak blokerów responsywności/dostępności do pilotażu.
> Pozostałe automatyczne kontrole a11y (etykiety, legendy, scope, opisy diagramów, ARIA) pokrywają
> `render-smoke.test.mjs` i `a11y-static.test.mjs` w CI.
