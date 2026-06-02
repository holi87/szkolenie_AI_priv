# Storyboard — M8: Zastosowania GenAI w QA i jakości

| Pole | Wartość |
|---|---|
| Moduł | M8 |
| Czas | 75 min |
| Ścieżki | S1: opcjonalny; S2: obowiązkowy; S3: obowiązkowy |
| Element interaktywny | „QA workbench" |
| Quiz inline | 12 pytań, Q61–Q72 |

> **Uwaga o wariantach ścieżek.** Curriculum (`wymagania/06`) określa dla M8 status S1 jako po prostu **opcjonalny** — bez kwalifikatora „w wersji skróconej" ani „świadomościowej" (inaczej niż np. M2 czy M6). Dlatego M8 **nie ma** wariantu skróconego ani świadomościowego: moduł jest przerabiany w całości albo pomijany. Dla S2 i S3 (obowiązkowe) obowiązują wszystkie ekrany; dla S1 cały moduł jest do wyboru, ale jeśli uczestnik go podejmuje, przechodzi tę samą sekwencję. Kolumna „Ścieżki/wariant" nie zawiera więc pomijania pojedynczych ekranów.

## Efekty uczenia

Rozbicie opisu efektów z curriculum na ponumerowane, mierzalne efekty:

- **E1** — Generuje przypadki testowe (test cases) z wymagania i wskazuje braki w pokryciu (coverage gaps).
- **E2** — Wykrywa duplikaty i testy pozorne (testy bez realnej wartości weryfikacyjnej).
- **E3** — Tworzy checklistę ryzyk (risk-based testing) dla funkcjonalności.
- **E4** — Ocenia, czy output LLM nadaje się do dokumentacji QA po kontroli merytorycznej (review checklist).
- **E5** — Wskazuje zadania QA, w których LLM pełni funkcję asystenta, a nie decydenta (human-in-the-loop).

## Sekwencja ekranów

| # | Tytuł ekranu | Typ | Cel/treść (skrót, ≤300 słów) | Efekt(y) | Ścieżki/wariant |
|---|---|---|---|---|---|
| 1 | Po co GenAI w QA — i gdzie kończy się jego rola | treść | Cel modułu i dlaczego jest ważny dla testera: LLM przyspiesza tworzenie i analizę artefaktów QA (przypadki testowe, checklisty ryzyk, przegląd dokumentacji), ale generuje najbardziej prawdopodobny tekst, nie zweryfikowaną prawdę. Zapowiedź pięciu efektów (E1–E5) i zasady przewodniej: LLM jako asystent (assistant), tester jako decydent. Krótko, czym ten moduł różni się od M7 (prompt engineering): tu skupiamy się na zastosowaniu i ocenie outputu w realnych zadaniach QA. | E1,E2,E3,E4,E5 | S1/S2/S3 — wszystkie |
| 2 | Generowanie przypadków testowych z wymagania | treść | Jak z syntetycznego wymagania (np. „Pole hasła: min. 8 znaków, min. 1 cyfra") poprosić LLM o przypadki testowe (test case generation). Pokaz dobrego promptu wejściowego i przykładowego outputu (3–4 syntetyczne przypadki: poprawne, graniczne, negatywne). Powiązanie z kryteriami akceptacji (acceptance criteria) i śladem powiązań (traceability) wymaganie→test. Wniosek: LLM daje szybki szkielet, nie gotowy zestaw. | E1 | S1/S2/S3 — wszystkie |
| 3 | Braki w pokryciu — czego LLM nie wymyślił | treść | Jak czytać output pod kątem luk w pokryciu (coverage gaps): brak przypadków granicznych, brak ścieżek błędu, pominięte stany, brak danych testowych dla wartości skrajnych. Krótka technika: zestaw wygenerowanych przypadków z listą kategorii ryzyka i szukaj pustych pól. Syntetyczny przykład: LLM pokrył „happy path", pominął lockout po 5 próbach. | E1 | S1/S2/S3 — wszystkie |
| 4 | Duplikaty i testy pozorne | treść | Jak rozpoznać dwa problemy jakości outputu: duplikaty (te same warunki innym opisem) i testy pozorne (asercja nic nie sprawdza, „test zawsze przejdzie", brak oczekiwanego rezultatu). Syntetyczne pary przykładów „prawie identyczne" oraz „pozornie sensowne, faktycznie puste". Wniosek: większa liczba przypadków ≠ lepsze pokrycie. | E2 | S1/S2/S3 — wszystkie |
| 5 | Checklista ryzyk dla funkcjonalności | treść | Jak użyć LLM do szkicu checklisty ryzyk (risk-based testing): kategorie (bezpieczeństwo, dane, wydajność, dostępność, zgodność), ryzyko + wpływ + obszar do testu. Syntetyczny przykład checklisty dla funkcji „reset hasła". Podkreślenie: LLM proponuje kategorie, tester priorytetyzuje i odrzuca nietrafione. | E3 | S1/S2/S3 — wszystkie |
| 6 | Czy ten output nadaje się do dokumentacji QA? | treść | Kryteria kontroli merytorycznej (review checklist) przed wklejeniem outputu do dokumentacji: zgodność z wymaganiem, kompletność, brak zmyślonych faktów (halucynacji), weryfikowalność, brak danych wrażliwych. Krótka rubryka „dopuść / popraw / odrzuć". Łącznik do M11 (weryfikacja) i M10 (dane). | E4 | S1/S2/S3 — wszystkie |
| 7 | Asystent czy decydent — gdzie postawić granicę | decyzja | Decyzja: które zadania QA LLM może wspierać jako asystent (szkic, draft, burza pomysłów), a gdzie decyzję podejmuje człowiek (human-in-the-loop): akceptacja przypadków, ocena ryzyka krytycznego, zatwierdzenie do release. Krótkie zestawienie „asystent vs decydent" z 3 syntetycznymi sytuacjami; uczestnik wskazuje granicę. | E5 | S1/S2/S3 — wszystkie |
| 8 | QA workbench — oceń output LLM | interakcja | Element interaktywny. Uczestnik dostaje syntetyczne wymaganie i syntetyczny output LLM (zestaw przypadków + założeń), po czym oznacza: brakujące testy, błędne założenia, ryzyka i elementy wymagające weryfikacji. Feedback tekstowy wskazuje trafienia i przeoczenia oraz linkuje do ekranów 2–7. Szczegół działania i alternatywa klawiaturowa — sekcja „Element interaktywny". | E1,E2,E3,E4,E5 | S1/S2/S3 — wszystkie |
| 9 | Quiz inline — Q61–Q72 | quiz-inline | 12 pytań w trybie nauki: feedback i wyjaśnienie natychmiast po odpowiedzi. Q61–Q64 scenariusz QA (analiza outputu, pokrycie, decyzja asystent/decydent); Q65–Q68 multiple choice (kompletność, duplikaty, kryteria dopuszczenia do dokumentacji); Q69–Q72 dopasowanie artefakt→ryzyko (checklista ryzyk). Mapowanie pytań — sekcja „Quiz inline". | E1,E2,E3,E4,E5 | S1/S2/S3 — wszystkie |
| 10 | Podsumowanie i następny krok | podsumowanie | Synteza pięciu efektów w jednym zdaniu na efekt; przypomnienie zasady „asystent, nie decydent". „Następny najlepszy krok": M9 (integracje i agenty) dla S3 i opcjonalnie S2; dla S1 — powrót do ścieżki obowiązkowej. Widoczny postęp procentowy modułu. | E1,E2,E3,E4,E5 | S1/S2/S3 — wszystkie |

## Element interaktywny — szczegół

**Nazwa:** „QA workbench" (warsztat QA).

**Działanie.** Uczestnik widzi dwa panele:
1. **DANE WEJŚCIOWE** — syntetyczne wymaganie (np. „Formularz rejestracji: e-mail wymagany i unikalny; hasło min. 8 znaków; po 5 nieudanych próbach logowania konto blokowane na 15 minut") oraz syntetyczny output LLM: lista 4–5 wygenerowanych przypadków testowych wraz z założeniami (część celowo wadliwa — brak testu blokady konta, duplikat dwóch przypadków, jedno błędne założenie „e-mail może się powtarzać", jeden przypadek pozorny bez oczekiwanego rezultatu).
2. **PANEL OCENY** — uczestnik oznacza w outputie cztery kategorie: brakujące testy, błędne założenia, ryzyka, elementy do weryfikacji.

**OUTPUT.** Po zatwierdzeniu: tekstowy feedback z trafieniami i przeoczeniami w każdej kategorii, krótkie uzasadnienie dla każdej oczekiwanej pozycji oraz linki do ekranów 2–7. Wynik nie blokuje przejścia dalej (tryb nauki).

**OBOWIĄZKOWA alternatywa klawiaturowa/niedragowa** (zgodnie z `docs/design-baseline.md`, sekcja 6 — wariant dla M8: „Formularz oceny (checkboxy: braki, ryzyka, duplikaty)"):
- Brak drag & drop. Ocena realizowana jako **formularz z grupami checkboxów** — każda wygenerowana pozycja outputu ma zestaw checkboxów: „brakujący test", „błędne założenie", „ryzyko", „do weryfikacji".
- Wszystkie pola w pełni obsługiwalne klawiaturą (Tab między polami, Spacja zaznacza), logiczna kolejność fokusu, **widoczny focus** (kontrast obrysu ≥ 3:1).
- **Feedback wyłącznie tekstowy** (nie tylko kolor): etykiety „trafione / przeoczone / błędnie oznaczone" plus opis. Etykiety pól i komunikaty walidacji opisane tekstem (WCAG 3.3.1).
- Wszystkie dane przykładowe **syntetyczne** — zero realnych danych klienta i PII.

## Quiz inline

**Liczba pytań:** 12 (Q61–Q72), tryb nauki (feedback natychmiast po odpowiedzi).

| Zakres Q | Typ | Sprawdzana kompetencja |
|---|---|---|
| Q61–Q64 | scenariusz QA | Analiza wygenerowanego outputu, wskazanie braków w pokryciu, decyzja asystent vs decydent (E1, E2, E5). |
| Q65–Q68 | multiple choice | Kompletność przypadków, rozpoznanie duplikatów/testów pozornych, kryteria dopuszczenia outputu do dokumentacji QA (E2, E4). |
| Q69–Q72 | dopasowanie artefakt→ryzyko | Przypisanie artefaktu/funkcjonalności do właściwego ryzyka — checklista ryzyk (E3). |

Pytania krytyczne: **brak** (zgodnie z danymi modułu). Identyfikatory zgodne z curriculum; nie wprowadzamy nowych liczb ani typów.

## Mapowanie na efekty i pytania

| Efekt | Ekrany | Pytania |
|---|---|---|
| E1 — generuje przypadki testowe, wskazuje braki pokrycia | 1, 2, 3, 8, 10 | Q61–Q64 |
| E2 — wykrywa duplikaty i testy pozorne | 1, 4, 8, 9, 10 | Q61–Q64, Q65–Q68 |
| E3 — tworzy checklistę ryzyk | 1, 5, 8, 9, 10 | Q69–Q72 |
| E4 — ocenia przydatność outputu do dokumentacji QA | 1, 6, 8, 9, 10 | Q65–Q68 |
| E5 — wskazuje, gdzie LLM jest asystentem, nie decydentem | 1, 7, 8, 9, 10 | Q61–Q64 |

Pokrycie pytań: Q61–Q72 (12/12) ujęte. Element interaktywny (ekran 8) i quiz (ekran 9) dotykają wszystkich pięciu efektów; ekran 1 (cel) i ekran 10 (podsumowanie) spinają całość.
