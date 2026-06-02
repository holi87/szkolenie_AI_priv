# Storyboard — M3: Parametry generacji i kontrola wyniku

| Pole | Wartość |
|---|---|
| Moduł | M3 |
| Czas | 30 min |
| Ścieżki | S1: opcjonalny; S2: obowiązkowy; S3: obowiązkowy |
| Element interaktywny | „Suwaki generacji” (temperature, top-p, max tokens) |
| Quiz inline | 7 pytań (Q18–Q24) |

## Efekty uczenia
- **E1** — dobiera temperature (temperatura, parametr losowości) do zadania kreatywnego i formalnego.
- **E2** — wskazuje ryzyko zbyt wysokiej losowości w zadaniach QA (brak powtarzalności, dryf treści).
- **E3** — rozpoznaje, kiedy max tokens (maksymalna liczba tokenów odpowiedzi) ucina odpowiedź.
- **E4** — porównuje dwa ustawienia generacji i wybiera bezpieczniejsze dla dokumentacji testowej.

> top-p (nucleus sampling, próg prawdopodobieństwa kumulowanego) nie jest osobno nazwany w efektach, ale jest jednym z trzech kluczowych pojęć modułu, sterownikiem elementu interaktywnego i przedmiotem pytań dopasowania (Q22–Q23) — dlatego ma własne pokrycie ekranowe (ekran 4) i wspiera E2/E4.

## Sekwencja ekranów

| # | Tytuł ekranu | Typ | Cel/treść (skrót, ≤300 słów) | Efekt(y) | Ścieżki/wariant |
|---|---|---|---|---|---|
| 1 | Po co kontrolować generację? | treść | Cel modułu: te same dane wejściowe + ten sam model mogą dać różne odpowiedzi, bo generacją sterują parametry. Dlaczego ważne dla QA: powtarzalność wyniku to fundament wiarygodnej dokumentacji testowej i regresji — niekontrolowane parametry = nieprzewidywalny output. Zapowiedź trzech sterowników: temperature, top-p, max tokens. Zaznaczyć „deterministyczność pozorną” — niska temperatura zmniejsza, ale nie gwarantuje identycznego wyniku. | E1, E2 | S1 opc. · S2 · S3 |
| 2 | Temperature — od formalnego do kreatywnego | treść | Definicja temperature (temperatura) jako sterownika losowości doboru kolejnego tokenu. Intuicja na skali: niska (~0,0–0,3) = odpowiedzi zachowawcze, powtarzalne, formalne; wysoka (~0,8–1,2) = różnorodne, kreatywne, mniej przewidywalne. Mapowanie na zadania: niska do dokumentacji i kroków testowych, wysoka do burzy pomysłów na dane testowe. Krótki syntetyczny przykład: opis kroku test case’a generowany przy temp niskiej vs wysokiej. | E1 | S1 opc. · S2 · S3 |
| 3 | Wysoka losowość a praca QA | treść | Ryzyko wysokiej temperatury w QA: brak powtarzalności (dwa uruchomienia = dwa różne kroki), dryf treści, trudność w przeglądzie i audycie, ryzyko cichych zmian w regresji. Reguła: gdy liczy się powtarzalność i zgodność z wymaganiem — obniż losowość. Syntetyczny kontrast: ten sam prompt o przypadek testowy dwa razy przy wysokiej temperaturze daje rozbieżne wyniki. | E2 | S1 opc. · S2 · S3 |
| 4 | top-p — drugi sterownik losowości | treść | Definicja top-p (nucleus sampling, próg kumulowanego prawdopodobieństwa). Intuicja: zawęża pulę kandydatów na kolejny token do najbardziej prawdopodobnych sumujących się do p. Relacja do temperature: oba sterują różnorodnością, zwykle reguluje się jeden naraz; niskie top-p = węższy, bezpieczniejszy wybór. Przykład syntetyczny: niskie top-p = stabilny słownik terminów QA; wysokie = szersze, ryzykowne sformułowania. | E2, E4 | S1 opc. · S2 · S3 |
| 5 | max tokens — kiedy odpowiedź się urywa | treść | Definicja max tokens (maksymalna liczba tokenów odpowiedzi) jako twardego limitu długości outputu. Skutek przekroczenia: odpowiedź ucięta w połowie zdania/tabeli, brak ostatnich kroków lub kryteriów akceptacji. Jak rozpoznać ucięcie: urwane zdanie, niedomknięta lista, brak podsumowania. Reakcja: zwiększ limit lub poproś o krótszy format. Syntetyczny przykład: lista 10 przypadków testowych ucięta na 6. | E3 | S1 opc. · S2 · S3 |
| 6 | Które ustawienie do dokumentacji testowej? | decyzja | Decyzja: porównanie dwóch presetów dla tego samego zadania (np. spisanie kroków test case’a). Wariant A: temp 0,2 / top-p 0,3 / max tokens wysokie. Wariant B: temp 1,0 / top-p 0,95 / max tokens niskie. Uczestnik wybiera bezpieczniejszy dla dokumentacji i uzasadnia (powtarzalność + brak ucięcia). Konserwatywne domyślne: niższa losowość, zapas na długość. Zasila scenariusz Q24. | E4 | S1 opc. · S2 · S3 |
| 7 | „Suwaki generacji” — eksperyment | interakcja | Element interaktywny: zmiana temperature, top-p i max tokens; symulowany output pokazuje różnice formalności, kompletności i ryzyka błędów. Cel: dotykowe powiązanie parametr→skutek przed quizem. Szczegół działania i alternatywa klawiaturowa w sekcji „Element interaktywny — szczegół”. Dane syntetyczne (zero PII). | E1, E2, E3, E4 | S1 opc. · S2 · S3 |
| 8 | Quiz inline — sprawdź się | quiz-inline | 7 pytań Q18–Q24 z natychmiastowym feedbackiem i wyjaśnieniem (tryb nauki). Q18–Q21 single choice; Q22–Q23 dopasowanie parametr→skutek; Q24 scenariusz wyboru bezpieczniejszego ustawienia. Brak pytań krytycznych. | E1, E2, E3, E4 | S1 opc. · S2 · S3 |
| 9 | Podsumowanie i następny krok | podsumowanie | Skrót: temperature i top-p sterują losowością, max tokens — długością; dla QA preferuj niską losowość i zapas długości; zawsze weryfikuj powtarzalność i kompletność. Postęp procentowy + „następny najlepszy krok”: przejście do M4 (Embeddings) lub kolejnego modułu obowiązkowego ścieżki. | E1, E2, E3, E4 | S1 opc. · S2 · S3 |

> **Wariant ścieżek.** M3 nie ma wersji skróconej ani świadomościowej na poziomie ekranu (w przeciwieństwie do M2 „w wersji skróconej” czy M6 „w wersji świadomościowej”). Dla S1 cały moduł jest **opcjonalny** — różnicowanie odbywa się na poziomie modułu (gating), nie przez pomijanie pojedynczych ekranów. Dlatego kolumna Ścieżki/wariant jest jednolita dla wszystkich ekranów i żaden ekran nie jest indywidualnie pomijany ani upraszczany.

## Element interaktywny — szczegół

**Nazwa:** „Suwaki generacji”.

**Działanie:** uczestnik ustawia trzy parametry i obserwuje symulowany (prerenderowany, nie z żywego modelu) output dla jednego syntetycznego zadania QA — np. „wypisz kroki testowe dla logowania użytkownika”. Output jest mapowany na presety parametrów, więc każda kombinacja daje deterministyczny, opisany przykład — bez realnego wywołania LLM i bez danych klienta.

**Dane wejściowe:**
- `temperature` — zakres 0,0–1,5 (krok 0,1).
- `top-p` — zakres 0,0–1,0 (krok 0,05).
- `max tokens` — zakres np. 32–512 (krok 32).

**Output (tekstowy, obowiązkowy obok wizualnego):**
- Przykładowa odpowiedź dopasowana do presetu (formalna i powtarzalna przy niskich wartościach; różnorodna/kreatywna przy wysokich).
- Etykiety skutku słowem, nie tylko kolorem: „Formalność: wysoka/niska”, „Kompletność: pełna/ucięta”, „Ryzyko błędów: niskie/wysokie”.
- Przy niskim `max tokens` output jest jawnie oznaczony jako „⚠ Odpowiedź ucięta — zwiększ limit” (komunikat tekstowy).

**Alternatywa klawiaturowa / niedragowa (OBOWIĄZKOWA, wg `docs/design-baseline.md` sekcja 6):**
> `input[type=range]` (obsługa z klawiatury strzałkami) **+ pola liczbowe** temperature/top-p/max tokens.

- Każdy suwak ma sparowane pole liczbowe (`input[type=number]`) z etykietą — wartość zmienialna strzałkami lub wpisaniem; brak operacji wyłącznie myszą/drag.
- Wszystkie kontrolki fokusowalne, z **widocznym focusem** (kontrast ≥ 3:1) i logiczną kolejnością Tab.
- **Feedback tekstowy** po każdej zmianie (nie tylko wizualny): zaktualizowany output + etykiety skutku odczytywalne przez czytnik ekranu (np. `aria-live`).
- Komunikat o ucięciu opisany tekstem przy wyniku (WCAG 1.4.1, 3.3.1) — nie samym kolorem.

## Quiz inline

- **Liczba pytań:** 7, identyfikatory **Q18–Q24** (mapowanie z `wymagania/06`).
- **Typy i sprawdzane kompetencje:**
  - **Q18–Q21 — single choice:** rozumienie pojedynczych parametrów — dobór temperature do zadania kreatywnego/formalnego (E1), ryzyko wysokiej losowości w QA (E2), rozpoznanie ucięcia przez max tokens (E3).
  - **Q22–Q23 — dopasowanie parametr→skutek:** połączenie temperature / top-p / max tokens z ich efektem na output (formalność, różnorodność, długość) — domyka pokrycie top-p (E2, E4).
  - **Q24 — scenariusz:** wybór bezpieczniejszego ustawienia generacji dla dokumentacji testowej i uzasadnienie (E4).
- **Tryb nauki:** wynik i wyjaśnienie natychmiast po odpowiedzi (`docs/design-baseline.md` 4.1, `wymagania/08`).
- **Pytania krytyczne:** brak.

## Mapowanie na efekty i pytania

| Efekt | Ekrany | Pytania |
|---|---|---|
| E1 — temperature do zadania kreatywnego/formalnego | 1, 2, 7 | Q18–Q21 (single), Q22–Q23 (dopasowanie) |
| E2 — ryzyko wysokiej losowości w QA | 1, 3, 4, 7 | Q18–Q21 (single), Q22–Q23 (dopasowanie) |
| E3 — rozpoznanie ucięcia przez max tokens | 5, 7 | Q18–Q21 (single), Q22–Q23 (dopasowanie) |
| E4 — wybór bezpieczniejszego ustawienia dla dokumentacji | 4, 6, 7 | Q22–Q23 (dopasowanie), Q24 (scenariusz) |
