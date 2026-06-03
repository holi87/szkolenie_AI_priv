# Kalibracja pytań po pilotażu (M5 #28)

> **Status: narzędzie i metodyka gotowe; realna kalibracja czeka na dane z pilotażu.**
> Issue **#28 pozostaje otwarte** do czasu przeprowadzenia pilotażu na 8–15 osobach — wszystkie kryteria
> akceptacji #28 wymagają **realnych odpowiedzi uczestników** (odsetek poprawnych vs zakres trudności,
> >10% niejasności pytań krytycznych, walidacja golden setu). Poniżej dostarczamy gotowe narzędzie, metodykę
> i **raport demonstracyjny na danych syntetycznych** dowodzący, że proces działa end-to-end.

## Co jest dostarczone (gotowe do uruchomienia na realnych danych)

| Element | Plik |
|---|---|
| Narzędzie kalibracji (CLI + czysta funkcja) | `genai-llm-training/tools/calibration/calibrate.mjs` |
| Kontrakt wejścia (wyniki pilotażu) | `genai-llm-training/data/schemas/pilot-results.schema.json` |
| Przykład syntetyczny (demo) | `genai-llm-training/data/pilot/sample-pilot-results.json` |
| Testy narzędzia | `genai-llm-training/tests/smoke/calibration.test.mjs` + `--self-test` w CI |

## Metodyka (wymagania/07, proces kalibracji)

Dla każdego pytania liczymy odsetek poprawnych odpowiedzi i porównujemy z zakresem dla poziomu trudności:

| Poziom | Zakres poprawnych (pilotaż) | Poza zakresem → |
|---|---|---|
| L1 podstawowy | 80–95% | popraw lub przenieś poziom |
| L2 zastosowanie | 55–80% | popraw lub przenieś poziom |
| L3 analiza/ewaluacja | 35–65% | popraw lub przenieś poziom |
| L4 ekspercki | 20–45% | popraw lub przenieś poziom |

Zasady:
- **Pytania krytyczne** są wyłączone z reklasyfikacji trudności (są 100%-bramkowane i konserwatywne — wysoki
  odsetek poprawnych jest zamierzony). Dla nich liczy się **niejasność**: >10% zgłoszeń → pytanie do przepisania.
- **Golden set**: oznaczany `validated` tylko gdy **pełne pokrycie 24/24** w pilotażu, wszystkie golden w
  zakresie i niejasność ≤ 5%; w przeciwnym razie `wymaga poprawek` (niepełne pokrycie, dryf trudności lub
  niejasność). Niepełny pilotaż golden setu nie może raportować ✅ (kontrola dryfu wymaga kompletu — Codex #59).
- Pytania spoza banku w pliku pilotażu są raportowane jako `unknown` i pomijane (narzędzie nie wywala się).

## Procedura po pilotażu

1. Zbierz od uczestników **eksporty per-pytanie** `pytania-<ścieżka>.csv` (przycisk „Pobierz odpowiedzi pytań (CSV)"
   na ekranie wyniku — anonimowo, bez PII, źródło: quiz inline) oraz ankiety (zgłoszenia niejasności).
   > Uwaga: zwykły `wynik-<ścieżka>.json/csv` zawiera agregaty (wynik %, ścieżka, słabe moduły, łączny czas) — **nie**
   > wystarcza do kalibracji per-pytanie. Per-pytanie `attempts`/`correct` pochodzą z eksportu `pytania-*.csv`,
   > który łączy quiz inline **oraz test końcowy** (per-pytanie) — dzięki temu łapane są też pytania widziane tylko
   > w teście (w tym golden), co umożliwia walidację golden setu 24/24. `avgTimeSec` jest opcjonalny (MVP mierzy
   > czas per moduł — w eksporcie wyniku — nie per pytanie).
2. Zsumuj eksporty per-pytanie między uczestnikami i zbuduj plik wg `pilot-results.schema.json`
   (per pytanie: `attempts` = liczba uczestników, którzy odpowiedzieli; `correct` = liczba poprawnych z 1. próby;
   `ambiguityReports` z ankiet; `synthetic: false`; `byPath` = rozkład uczestników). **Dane zagregowane, bez PII.**
   Narzędzie waliduje plik przed kalibracją i odrzuca dane niemożliwe: liczność grupy poza 8–15 (wymagania/07),
   liczby ułamkowe, `correct > attempts` (>100%), `attempts > uczestników`, `attempts >` uprawnieni wg `byPath`,
   duplikaty pytań, złe id — wtedy `exit 1` z opisem (zamiast mylącego raportu).
3. Uruchom (z katalogu repo lub z `genai-llm-training/` z poprawną ścieżką wyjścia):
   ```bash
   cd genai-llm-training
   node tools/calibration/calibrate.mjs ścieżka/do/pilot-results.json > ../docs/qa-pilotaz/raport-kalibracji-<data>.md
   ```
4. Zrealizuj wskazane akcje: popraw/przenieś pytania poza zakresem, przepisz krytyczne z >10% niejasności,
   oznacz golden set (`validated` albo zgłoś poprawki). Każda zmiana banku → `node tests/schema-validation/validate.mjs`.
5. Zamknij **#28** dopiero po wykonaniu kalibracji na realnych danych i naniesieniu wniosków.

## Kryteria akceptacji #28 a stan obecny

| Kryterium #28 | Stan | Czego brakuje |
|---|---|---|
| Pytania poza zakresem poprawione/przeniesione | ⏳ | realne % poprawnych z pilotażu |
| Krytyczne z >10% niejasności przepisane | ⏳ | realne zgłoszenia niejasności |
| Golden set oznaczony validated/wymaga poprawek | ⏳ | wynik golden na uczestnikach |
| Raport kalibracji powstaje | ✅ (narzędzie) | uruchomienie na realnych danych |

---

## Raport demonstracyjny (DANE SYNTETYCZNE)

Wygenerowany przez narzędzie na `data/pilot/sample-pilot-results.json` — pokazuje, że proces wykrywa wszystkie
trzy typy problemów. **To nie są wyniki realnego pilotażu.**

```
# Raport kalibracji pytań (DANE SYNTETYCZNE / DEMO)

- Uczestnicy: 12 · okno: demo (dane syntetyczne)
- Pytań przeanalizowanych: 16 (z 16 w pliku)

## Pytania poza zakresem trudności
| Pytanie | Moduł | Poziom | % popr. | Zakres        | Diagnoza                       |
|---------|-------|--------|--------:|---------------|--------------------------------|
| Q017    | M2    | L3     |  25.0%  | 35.0%–65.0%   | za trudne → popraw lub przenieś |
| Q032    | M4    | L3     |  91.7%  | 35.0%–65.0%   | za łatwe → popraw lub przenieś  |

## Pytania krytyczne z niejasnością > 10% (do przepisania)
| Pytanie | Moduł | % niejasności | % popr. |
|---------|-------|--------------:|--------:|
| Q083    | M10   |       16.7%   |  58.3%  |

## Pytania krytyczne poza zakresem trudności (do przeglądu, nie reklasyfikacji)
> Krytyczne są 100%-bramkowane — wysoki odsetek poprawnych jest zwykle zamierzony. Sekcja informacyjna.
| Pytanie | Moduł | Poziom | % popr. | Zakres      | Kierunek  |
|---------|-------|--------|--------:|-------------|-----------|
| Q081    | M10   | L2     |  91.7%  | 55.0%–80.0% | za łatwe  |
| Q082    | M10   | L2     | 100.0%  | 55.0%–80.0% | za łatwe  |
| Q083    | M10   | L1     |  58.3%  | 80.0%–95.0% | za trudne |
| Q084    | M10   | L1     | 100.0%  | 80.0%–95.0% | za łatwe  |
| Q085    | M10   | L1     | 100.0%  | 80.0%–95.0% | za łatwe  |

## Status golden setu
- Pokrycie w pilotażu: 7/24 (brakuje 17 pytań golden)
- Status: wymaga poprawek
  - niepełne pokrycie golden setu (7/24) — validated wymaga 24/24
  - Q009: niejasność 8.3% > 5%
  - Q032: dryf trudności (za łatwe, 91.7%)
```

> Interpretacja demo: Q017 (L3) za trudne, Q032 (L3, golden) za łatwe (dryf golden setu); krytyczne Q083 ma
> 16,7% niejasności → do przepisania, a wszystkie krytyczne są wypisane w sekcji dryfu do potwierdzenia, że ich
> trudność jest celowa (nie reklasyfikujemy ich automatycznie). Golden set NIE jest `validated` — wymaga pełnego
> pokrycia 24/24 (tu pilotaż objął tylko 7) oraz braku offenderów. Na realnych danych analogiczny raport będzie
> podstawą zamknięcia #28.
