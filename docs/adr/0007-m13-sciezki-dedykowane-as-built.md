# ADR-0007: M13 ścieżki dopasowane do person — realizacja (as-built) i granice zakresu

| Pole | Wartość |
|---|---|
| Status | Zaakceptowana |
| Issue | `#95–#101 [M13-2…M13-8]` (realizacja modelu z ADR-0006) |
| Rola decydenta | Senior Solution Analyst / właściciel |
| Powiązane | ADR-0006 (model hybrydowy — design), `docs/macierz-sciezek.md` §5, #94 |

---

## Kontekst

ADR-0006 zamroził model hybrydowy (rdzeń vs dedykowane). Ten ADR zapisuje **jak** zrealizowano go w jednym PR (#95–#101) oraz **świadome granice zakresu** — żeby „zielone CI" nie było mylone z „treść zweryfikowana przez eksperta".

Stan wyjściowy (zmierzony): ścieżki były zagnieżdżonymi nadzbiorami (S1⊆S2⊆S3; 0 pytań wyłącznych dla S1/S2) — model „te same 116 pytań filtrowane wymaganiami", który życzenie #3 odrzuca.

## Decyzja (as-built)

1. **Klasyfikacja `scope` w `modules.json`:** rdzeń = M1, M10 (5 krytycznych), M11; dedykowane = M2–M9, M12.
2. **Re-homing (NIE generowanie):** istniejące, **zweryfikowane** 116 pytań przeniesiono — pytania modułów dedykowanych dostały **dokładnie 1 ścieżkę** (`paths`), rdzeń pozostał wspólny (`paths`=[S1,S2,S3]). Reguła: round-robin per (moduł × poziom trudności) między ścieżkami, z których moduł realnie korzysta; L4→S3; L3 nie trafia do S1 (S1 = persona decyzyjna, konceptualna). Efekt: **rozłączne pule per persona**, zero pytań syntetycznych. Audyt mapowania: opis PR.
   - Wynik: S1 pula 39 (ded. 7), S2 pula 55 (ded. 23), S3 pula 86 (ded. 54). Profile trudności persona-adekwatne (S1 konceptualna, S3 pełny spread).
3. **Kwota dedykowanych w teście (`dedicatedQuestionsMin`):** S1=5, S2=12, S3=25. `test-engine.selectFinalTest` wymusza ≥ kwota pytań dedykowanych. **To kluczowy element #3:** rdzeń S1 (32) > test S1 (25), więc bez kwoty test mógłby wylosować całość z rdzenia i persony byłyby identyczne mimo dedykowanych pul.
4. **Walidator (kontrakt egzekwowany):** dedykowane → dokładnie 1 ścieżka (rozłączność); rdzeń → ≥2 ścieżki; pula dedykowanych ≥ kwota; kwota+krytyczne ≤ finalTestQuestions; pula ≥ finalTestQuestions; parytet PL↔EN (paths to pole scoringowe — identyczne w obu locale). Testy negatywne pokrywają każdy nowy inwariant.
5. **Persona-set w UI (`pathVisibleModuleIds`):** hub i nawigacja pokazują INNY zestaw modułów per ścieżka (pomija czysto opcjonalne; S1≈7, S2≈10, S3=12) — wykorzystuje istniejące warianty z `paths.json`, bez nowych danych. Gating (requiredModules / `isFinalTestUnlocked`) niezmieniony.

## Granice zakresu (świadomie odroczone — wymagają eksperta dziedzinowego)

> Pule pytań są **realne i zweryfikowane** (re-homing istniejącego banku), więc NIE jest to treść auto-generowana. Niemniej:

- **Alokacja persona←pytanie jest heurystyczna** (round-robin po trudności). Która dokładnie persona dostaje dane pytanie — **do przeglądu SME** (czy treść pytania pasuje do roli, nie tylko poziom trudności).
- **Treść modułów (prose) nie jest przepisana per persona.** Zróżnicowanie person realizują: (a) rozłączne pule pytań, (b) różne zestawy modułów, (c) istniejący mechanizm `onlyForPaths` w ekranach treści. Głębsza, bespoke treść per persona = przyszłe wzbogacenie.
- **Golden-set pozostaje GLOBALNY** (24 = 2/moduł) — nadal poprawna kontrola dryfu trudności *między* edycjami. Golden per-ścieżka świadomie odroczony (nie blokuje #3; nie psuje obecnej kontroli).
- Profile trudności per ścieżka są **best-effort** (silnik dopełnia z dostępnych koszyków), bo rozłączna pula ogranicza dostępność L3/L4 danej persony — to cecha, nie błąd (persona-adekwatność).

## Konsekwencje

- Życzenie #3 spełnione strukturalnie i weryfikowalnie: każda persona ma inny zestaw modułów ORAZ inną, rozłączną pulę pytań, a test końcowy realnie losuje pytania dedykowane (kwota). Egzekwowane przez walidator + test-engine + testy.
- `validate-data` / smoke / calibrate zielone; parytet PL+EN utrzymany.
- Przed wdrożeniem szkolenia na żywo: **przegląd SME** alokacji pytań per persona oraz (opcjonalnie) wzbogacenie treści per persona i golden per-ścieżka — wszystko nie-blokujące, opisane wyżej.
