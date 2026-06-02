# Storyboard — M7: Prompt engineering w praktyce

| Pole | Wartość |
|---|---|
| Moduł | M7 |
| Czas | 65 min |
| Ścieżki | S1: obowiązkowy SKRÓCONY; S2: obowiązkowy; S3: obowiązkowy |
| Element interaktywny | „Prompt clinic" — poprawa 3 wadliwych promptów z feedbackiem wg rubryki |
| Pula modułu | Q51–Q60 (10 pytań) |
| Quiz inline | 5–8 pytań z puli |

> Wszystkie przykłady danych w tym module są **syntetyczne** (fikcyjna aplikacja „SklepDemo", zmyślone wymagania, brak realnych danych klienta i PII). Terminy techniczne podawane po polsku z oryginałem w nawiasie przy pierwszym użyciu. Pełna treść ekranów powstaje w M4 wdrożenia — tu opisany jest tylko plan struktury (skrót ≤300 słów na ekran).

## Efekty uczenia

- **E1** — Tworzy prompt zawierający siedem elementów: rolę (role), cel, kontekst, dane wejściowe, ograniczenia (constraints), kryteria jakości i format wyjścia (output format).
- **E2** — Poprawia nieprecyzyjny prompt na podstawie błędnego outputu, korzystając z rubryki oceny.
- **E3** — Stosuje few-shot (kilka przykładów w prompcie), gdy format lub styl odpowiedzi musi być powtarzalny.
- **E4** — Wskazuje, kiedy prompt nie rozwiąże problemu — np. gdy brakuje danych — i co wtedy zrobić zamiast „dopieszczać" prompt.

## Sekwencja ekranów

| # | Tytuł ekranu | Typ | Cel/treść (skrót, ≤300 słów) | Efekt(y) | Ścieżki/wariant |
|---|---|---|---|---|---|
| 1 | Po co testerowi prompt engineering | treść | Cel modułu: nauczyć się pisać prompty, które dają powtarzalny, weryfikowalny output do pracy QA. Dlaczego ważne dla QA: niejasny prompt = niejasny wynik = zmarnowany czas na poprawki i ryzyko, że tester uzna halucynację za fakt. Dobry prompt zwiększa kontrolę nad modelem i ułatwia weryfikację. Zapowiedź: anatomia promptu, poprawa złego promptu, few-shot, granice promptu. Wskaźnik postępu + „następny krok →". | E1 | Wszystkie ścieżki (pełny) |
| 2 | Anatomia promptu: 7 elementów | treść | Przegląd siedmiu elementów dobrego promptu: rola, cel, kontekst, dane wejściowe, ograniczenia, kryteria jakości, format wyjścia. Każdy element = jedno zdanie wyjaśnienia + mikro-przykład na syntetycznym zadaniu QA (np. „wygeneruj przypadki testowe do logowania w SklepDemo"). Tabela elementów ma wersję tekstową (WCAG 1.1.1). Ekran przeglądowy — wprowadza ramę, której detale rozwijają ekrany 3–4. | E1 | Wszystkie ścieżki. **S1 SKRÓCONY: pozostaje, ale jako lista 7 elementów z 1 łącznym przykładem zamiast 7.** |
| 3 | Pierwsza połowa: rola, cel, kontekst, dane | treść | Pogłębienie 4 elementów wejściowych. Rola = z czyjej perspektywy odpowiada model (np. „jesteś inżynierem QA"). Cel = co ma powstać. Kontekst = tło, którego model nie zna (fragment syntetycznego wymagania). Dane wejściowe = konkretny materiał do przetworzenia. Pokaz: ten sam cel z kontekstem i bez — różnica w jakości outputu. | E1 | S2, S3 (pełny). **S1 SKRÓCONY: POMINIĘTY — połączony z ekranem 4 w jeden uproszczony.** |
| 4 | Druga połowa: ograniczenia, kryteria jakości, format | treść | Ograniczenia = czego model ma NIE robić / limity (np. „nie wymyślaj pól, których nie ma w wymaganiu"). Kryteria jakości = po czym poznamy, że output jest dobry (mierzalne, weryfikowalne). Format wyjścia = struktura (tabela, lista, JSON) ułatwiająca dalszą weryfikację. Akcent QA: ograniczenia + kryteria to dźwignia weryfikowalności i bezpieczeństwa. | E1 | S2, S3 (pełny). **S1 SKRÓCONY: scalony z ekranem 3 w jeden ekran „Ograniczenia, kryteria i format — minimum", bez pokazów porównawczych.** |
| 5 | Few-shot: kiedy pokazać przykłady | treść | Few-shot (kilka przykładów w prompcie) = wstawienie 1–3 wzorcowych par wejście→wyjście, gdy format lub styl musi być powtarzalny (np. zawsze ten sam układ przypadku testowego). Kontrast z zero-shot (bez przykładów). Zasada: few-shot dla powtarzalności formatu, nie dla „uzupełnienia brakującej wiedzy". Syntetyczny przykład: 2 wzorcowe przypadki testowe → model trzyma format dla kolejnych. | E3 | S2, S3 (pełny). **S1 SKRÓCONY: uproszczony do 1 akapitu „kiedy warto dać przykład", bez kontrastu zero-shot vs few-shot.** |
| 6 | Naprawa złego promptu wg rubryki | treść | Jak poprawiać nieprecyzyjny prompt na podstawie błędnego outputu. Rubryka oceny promptu (5 osi): kompletność, bezpieczeństwo, weryfikowalność, format, ograniczenia. Pętla: zły output → diagnoza wg rubryki → konkretna poprawka → lepszy output. Syntetyczny przykład „przed/po" jednego promptu. Ten ekran przygotowuje wprost do elementu interaktywnego. | E2 | Wszystkie ścieżki (pełny). **S1 SKRÓCONY: pozostaje — kluczowy dla S1, ale 1 oś rubryki = 1 zdanie.** |
| 7 | Granice promptu: kiedy prompt nie pomoże | decyzja | Decyzja: prompt to nie magia. Gdy brakuje danych (model nie ma informacji w kontekście), żadne „dopieszczanie" promptu nie wygeneruje prawdy — powstanie halucynacja. Co zrobić zamiast tego: dostarczyć dane (kontekst/RAG), sięgnąć do źródła, oddać zadanie człowiekowi/ekspertowi. Sygnały ostrzegawcze: prompt rośnie, a output dalej zmyśla. Link do M11 (halucynacje). | E4 | Wszystkie ścieżki (pełny). **S1 SKRÓCONY: pozostaje — świadomościowo ważny, skrót do 1 zasady + 1 przykładu.** |
| 8 | Prompt clinic (interakcja) | interakcja | Element interaktywny: uczestnik poprawia 3 wadliwe syntetyczne prompty i otrzymuje feedback tekstowy wg rubryki (kompletność, bezpieczeństwo, weryfikowalność, format, ograniczenia). Szczegóły i alternatywa klawiaturowa — sekcja „Element interaktywny" poniżej. | E1, E2, E3, E4 | Wszystkie ścieżki. **S1 SKRÓCONY: 2 z 3 promptów (pomija prompt few-shot), pozostawia poprawę kompletności i bezpieczeństwa.** |
| 9 | Quiz inline (5–8 z puli Q51–Q60) | quiz-inline | 5–8 z puli Q51–Q60, dobranych do treści widzianej na danej ścieżce, z natychmiastowym feedbackiem i wyjaśnieniem (tryb nauki). Pula modułu Q51–Q60 zasila również test końcowy. Typy w puli: Q51–Q53 single choice; Q54–Q56 multiple choice; Q57–Q60 zadania scenariuszowe. Mapowanie kompetencji — sekcja „Quiz inline" poniżej. Brak pytań krytycznych w M7. | E1, E2, E3, E4 | Wszystkie ścieżki (quiz inline = 5–8 z puli, dobranych do treści danej ścieżki). |
| 10 | Podsumowanie i następny krok | podsumowanie | 4 kluczowe wnioski (7 elementów promptu, rubryka 5 osi, few-shot dla powtarzalności, granice promptu przy braku danych). Mostek do M8 (zastosowania GenAI w QA — generowanie i ocena przypadków testowych). Widoczny postęp + „następny krok →". | E1, E2, E3, E4 | Wszystkie ścieżki (pełny) |

**Wariant S1 (obowiązkowy SKRÓCONY):** ekrany 3 i 4 scalone w jeden uproszczony ekran; ekran 5 (few-shot) zredukowany do akapitu; Prompt clinic na 2 promptach. Ekrany 1, 2, 6, 7, 9, 10 zostają (rdzeń: anatomia, naprawa promptu, granice, quiz). Szacunek czasu S1 ≈ 35–40 min, S2/S3 pełne ≈ 65 min (1 ekran ≈ 5–7 min z interakcją i quizem).

## Element interaktywny — szczegół

**Nazwa:** „Prompt clinic" (klinika promptów).

**Działanie:** Uczestnik dostaje kolejno 3 wadliwe, syntetyczne prompty (np. „napisz testy do logowania" — brak roli, kontekstu, ograniczeń, formatu, kryteriów). Edytuje każdy prompt, a system ocenia poprawioną wersję wg rubryki 5 osi i zwraca **feedback tekstowy oś po osi** (co spełnione, czego brakuje, sugestia poprawki).

- **DANE WEJŚCIOWE:** 3 syntetyczne prompty z różnymi brakami:
  1. brak kompletności (chybiona rola/cel/kontekst) — np. zadanie generowania przypadków testowych dla SklepDemo bez podanego wymagania,
  2. brak bezpieczeństwa/ograniczeń (prompt zachęca do zmyślania pól lub kusi wklejeniem „prawdziwych danych użytkownika") — uczy dodać ograniczenie i zasadę danych syntetycznych,
  3. brak powtarzalnego formatu (output ma być listą przypadków w stałym układzie) — naturalne miejsce na few-shot.
- **OUTPUT:** dla każdej osi rubryki — status (spełnione / brak / częściowo) + krótkie zdanie uzasadnienia + sugestia; na końcu zbiorczy komentarz, czy prompt jest „gotowy do użycia w QA". Bez oceny punktowej blokującej (to ćwiczenie, nie test).

**Rubryka (5 osi):** kompletność · bezpieczeństwo · weryfikowalność · format · ograniczenia.

**Alternatywa klawiaturowa / niedragowa (OBOWIĄZKOWA, zgodnie z docs/design-baseline.md sek. 6):**
- Interfejs oparty na `textarea` (edycja promptu) + checklista rubryki — **bez drag & drop**, więc natywnie obsługiwalny klawiaturą.
- Każda oś rubryki to fokusowalny element; feedback **tekstowy** (nie tylko kolor/ikona), opisany przy elemencie (WCAG 1.4.1, 3.3.1).
- Pełna obsługa Tab/Shift+Tab i Enter; **widoczny focus** (kontrast ≥ 3:1); brak pułapki fokusu; logiczna kolejność: textarea → przycisk „Oceń prompt" → lista feedbacku oś po osi → „następny prompt →".
- Każdy z 3 promptów dostępny sekwencyjnie z poziomu klawiatury; powrót do poprzedniego promptu możliwy bez myszy.

## Quiz inline

- **Pula modułu:** Q51–Q60 (10 pytań) — zasila również test końcowy. **Quiz inline:** 5–8 pytań losowanych z puli, dobranych do treści widzianej na danej ścieżce (wg wymagania/07).
- **Typy (w puli Q51–Q60):** Q51–Q53 single choice; Q54–Q56 multiple choice; Q57–Q60 zadania scenariuszowe (40% pytań scenariuszowych — zgodnie z curriculum).
- **Brak pytań krytycznych** w M7.
- **Sprawdzane kompetencje:**
  - Q51–Q53 (single): rozpoznanie elementów dobrego promptu, definicje (rola, kontekst, format, ograniczenia, kryteria) — E1.
  - Q54–Q56 (multiple): wybór wszystkich braków w wadliwym prompcie / wszystkich sytuacji uzasadniających few-shot / wszystkich osi rubryki, które prompt narusza — E1, E2, E3.
  - Q57–Q60 (scenariusze): dany błędny output → wskaż najlepszą poprawkę promptu (E2); dany wymóg powtarzalnego formatu → zdecyduj o few-shot (E3); dany brak danych → rozpoznaj, że prompt nie pomoże i wybierz właściwe działanie (E4); zbuduj/uzupełnij prompt z 7 elementów dla zadania QA (E1).
- **Tryb nauki:** feedback i wyjaśnienie natychmiast po odpowiedzi (design-baseline sek. 2.2).

## Mapowanie na efekty i pytania

| Efekt | Ekrany | Pytania |
|---|---|---|
| E1 — prompt z 7 elementów (rola/cel/kontekst/dane/ograniczenia/kryteria/format) | 1, 2, 3, 4, 8, 9, 10 | Q51–Q53, Q54, Q60 |
| E2 — poprawa nieprecyzyjnego promptu wg rubryki | 6, 8, 9, 10 | Q55, Q57 |
| E3 — few-shot dla powtarzalnego formatu/stylu | 5, 8, 9, 10 | Q56, Q58 |
| E4 — granice promptu (prompt nie naprawi braku danych) | 7, 8, 9, 10 | Q59 |
