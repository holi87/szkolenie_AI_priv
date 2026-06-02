# Storyboard — M1: Fundamenty GenAI i LLM

| Pole | Wartość |
|---|---|
| Moduł | M1 |
| Czas | 35 min |
| Ścieżki | S1: obowiązkowy; S2: obowiązkowy; S3: obowiązkowy |
| Element interaktywny | „Klasyfikator zadań" (drag & drop z alternatywą klawiaturową) |
| Pula modułu | Q1–Q8 (8 pytań) |
| Quiz inline | 5–8 z puli |

> **Uwaga o ścieżkach.** M1 jest obowiązkowy dla wszystkich trzech ścieżek (S1/S2/S3), więc **żaden ekran nie jest wycinany przez gating**. Rdzeń (ekrany 1–4, 6–9) jest wspólny i identyczny dla S1/S2/S3. Jeden ekran (ekran 5, „Trening vs. wnioskowanie") niesie pogłębienie techniczne — w wariancie świadomościowym dla S1 jest **uproszczony** (czytany skrótowo, bez szczegółu inference cost), pełny dla S2/S3. To nie jest pominięcie, tylko regulacja głębokości w obrębie obowiązkowego modułu.
>
> Wszystkie przykłady danych w module są **syntetyczne** — żadnych realnych danych klienta ani PII.

## Efekty uczenia

Efekty z curriculum (`wymagania/06`) rozbite na ponumerowane pozycje:

- **E1** — Uczestnik rozróżnia GenAI (sztuczna inteligencja generatywna, *generative AI*), LLM (duży model językowy, *large language model*) i klasyczny ML (uczenie maszynowe, *machine learning*) na **5 przykładach**, na podstawie wejścia, wyjścia i sposobu użycia.
- **E2** — Uczestnik wskazuje, że LLM generuje **najbardziej prawdopodobną odpowiedź** (probabilistyczny output, *probabilistic output*), a **nie gwarantowaną prawdę** — i wiąże to z pojęciem halucynacji (*hallucination*) jako wyniku błędnego lub nieuzasadnionego.
- **E3** — Uczestnik klasyfikuje **6 zadań** jako generatywne, klasyfikacyjne (*classification*) lub deterministyczne (*deterministic / rule-based*) i przypisuje je do właściwego rozwiązania.

## Sekwencja ekranów

| # | Tytuł ekranu | Typ | Cel/treść (skrót, ≤300 słów) | Efekt(y) | Ścieżki/wariant |
|---|---|---|---|---|---|
| 1 | Po co Ci ten moduł | treść | **Cel modułu + dlaczego ważny dla QA.** Otwarcie: tester coraz częściej dostaje output z LLM (raport, przypadek testowy, podsumowanie wymagań) i musi ocenić, czy mu zaufać. Komunikat: bez rozróżnienia GenAI / LLM / klasyczny ML łatwo użyć narzędzia do złego zadania albo uznać zmyśloną odpowiedź za fakt. Co uczestnik będzie umiał po module: rozróżnić trzy rodzaje rozwiązań, rozumieć skąd bierze się odpowiedź LLM, sklasyfikować zadanie do właściwej technologii. Widoczny pasek postępu i „następny krok →". | E1, E2, E3 | rdzeń (S1/S2/S3) |
| 2 | GenAI, LLM i klasyczny ML — mapa pojęć | treść | **Jedna koncepcja: trzy zbiory i ich relacja.** Klasyczny ML = uczy się wzorca i zwykle **klasyfikuje/przewiduje** (np. „spam / nie-spam"). GenAI = **tworzy nową treść** (tekst, obraz, kod). LLM = podzbiór GenAI wyspecjalizowany w języku. Definicje po polsku z oryginałem przy pierwszym użyciu. Diagram zbiorów ma **wersję tekstową** (WCAG 1.1.1). Tu wprowadzamy słownik modułu; bez przykładów decyzyjnych (te na ekranie 3). | E1 | rdzeń (S1/S2/S3) |
| 3 | Pięć przykładów obok siebie | treść | **Jedna koncepcja: rozróżnienie na 5 syntetycznych przykładach** (realizacja E1 „na 5 przykładach"). Tabela: przykład → wejście → wyjście → to GenAI/LLM/klasyczny ML i dlaczego. Przykłady syntetyczne: (1) klasyfikacja zgłoszenia jako „błąd / pytanie / życzenie" = klasyczny ML; (2) wygenerowanie szkicu przypadku testowego z opisu wymagania = LLM/GenAI; (3) wykrycie anomalii w metrykach wydajności = klasyczny ML; (4) streszczenie długiej notatki ze spotkania = LLM; (5) wygenerowanie obrazka do prezentacji = GenAI nie-LLM. Tabela ma opis tekstowy. | E1 | rdzeń (S1/S2/S3) |
| 4 | Skąd bierze się odpowiedź LLM | treść | **Jedna koncepcja: output probabilistyczny, nie gwarantowana prawda** (rdzeń E2). LLM przewiduje najbardziej prawdopodobny kolejny fragment tekstu na podstawie wzorców z treningu — to nie wyszukiwarka prawdy ani baza faktów. Stąd: ta sama prawdopodobna forma może być merytorycznie błędna → **halucynacja** (definicja: wynik brzmiący wiarygodnie, ale nieuzasadniony danymi). Konsekwencja dla QA: każdy output wymaga weryfikacji; pełna checklista weryfikacji jest w M11 (link „następny krok" tylko sygnalizuje, nie powtarza). | E2 | rdzeń (S1/S2/S3) |
| 5 | Trening vs. wnioskowanie | treść | **Jedna koncepcja: training vs inference.** Trening (*training*) = jednorazowe nauczenie modelu na dużym zbiorze, ustala wzorce. Wnioskowanie (*inference*) = każde użycie modelu na Twoim wejściu, tu powstaje odpowiedź. Wniosek dla testera: model nie „douczy się" z Twojego jednego promptu i nie zna zdarzeń po dacie treningu. Dla S2/S3 dodatkowo: koszt wnioskowania (*inference cost*) rośnie z długością wejścia/wyjścia. | E2 | **S1: uproszczony** (świadomościowo, bez inference cost); S2/S3: pełny |
| 6 | Trzy typy zadań: generatywne / klasyfikacyjne / deterministyczne | decyzja | **Jedna decyzja: do którego typu należy zadanie.** Rama przed ćwiczeniem (przygotowanie E3). Generatywne = tworzy nową treść (LLM/GenAI). Klasyfikacyjne = przypisuje etykietę z gotowego zbioru (klasyczny ML). Deterministyczne = ten sam wejściowy → zawsze ten sam wynik wg jawnej reguły (system regułowy, *rule-based*). Pytanie prowadzące do refleksji: „jakiego rodzaju jest zadanie, które masz teraz na biurku?" Bez pełnej listy zadań — to ekran ramujący kategorie, ćwiczenie jest na ekranie 7. | E3 | rdzeń (S1/S2/S3) |
| 7 | Klasyfikator zadań | interakcja | **Element interaktywny.** Uczestnik przyporządkowuje **12 syntetycznych zadań** do **4 kategorii**: LLM / klasyczny ML / system regułowy / człowiek-ekspert. Po zatwierdzeniu: tekstowy feedback z uzasadnieniem przy każdym zadaniu + wynik liczbowy. Szczegół, dane i alternatywa klawiaturowa — w sekcji „Element interaktywny" poniżej. | E1, E3 | rdzeń (S1/S2/S3) |
| 8 | Quiz inline (5–8 z puli Q1–Q8) | quiz-inline | **5–8 pytań losowanych z puli Q1–Q8, z natychmiastowym feedbackiem** (tryb nauki). Q1–Q4 single choice (rozróżnienie pojęć, output probabilistyczny). Q5–Q6 dopasowanie (zadanie → typ/technologia). Q7–Q8 scenariusz decyzyjny QA (wybór właściwego rozwiązania + uzasadnienie). Brak pytań krytycznych. Feedback i wyjaśnienie pojawiają się od razu po każdej odpowiedzi. | E1, E2, E3 | rdzeń (S1/S2/S3) |
| 9 | Podsumowanie i następny krok | podsumowanie | **Domknięcie modułu.** 3–4 zdania syntezy: GenAI tworzy, klasyczny ML klasyfikuje, LLM przewiduje najbardziej prawdopodobny tekst (nie prawdę), a dobór technologii zależy od typu zadania. Mini-checklista „zanim użyjesz LLM". Pasek postępu modułu + „następny krok →": M2 (architektura LLM: tokeny i context window). | E1, E2, E3 | rdzeń (S1/S2/S3) |

**Liczba ekranów: 9** (mieści się w 6–12 dla 35 min: ekrany treści ~3 min, ekran 6 decyzja ~3 min, interakcja ~7 min, quiz ~8 min, podsumowanie ~2 min).

## Element interaktywny — szczegół

**Nazwa:** Klasyfikator zadań (M1).

**Działanie.** Uczestnik klasyfikuje listę syntetycznych zadań do jednej z 4 kategorii. Wersja podstawowa: drag & drop kafelków zadań do kolumn kategorii. Po zatwierdzeniu — feedback tekstowy per zadanie i wynik zbiorczy. Tryb nauki: błędne przypisania można poprawić, każde z wyjaśnieniem.

**Kategorie (4):**
1. **LLM** — zadania językowo-generatywne (np. szkic przypadku testowego, streszczenie notatki).
2. **Klasyczny ML** — klasyfikacja/predykcja z gotowych etykiet (np. kategoryzacja zgłoszenia, wykrycie anomalii metryk).
3. **System regułowy** (*rule-based*) — jawna, deterministyczna reguła (np. walidacja formatu numeru zamówienia, przeliczenie kwoty wg stałego kursu).
4. **Człowiek-ekspert** — decyzja wymagająca odpowiedzialności, kontekstu lub osądu nieweryfikowalnego automatycznie (np. zatwierdzenie krytycznego ryzyka, decyzja o wstrzymaniu wydania).

**DANE WEJŚCIOWE.** Lista **12 syntetycznych zadań** (zgodnie z `wymagania/08`, „Lista 12 zadań"), po ~3 na kategorię, sformułowane w kontekście QA. Przykłady syntetyczne (skrót): „zaproponuj 5 przypadków testowych do wymagania logowania", „oznacz zgłoszenie jako błąd/pytanie/życzenie", „sprawdź, czy kod pocztowy ma format NN-NNN", „zdecyduj, czy wstrzymać wydanie z powodu ryzyka prawnego". Zero realnych danych/PII.

**OUTPUT.** Dla każdego zadania: poprawna kategoria + jedno zdanie uzasadnienia (dlaczego np. „regułowe, bo wynik jest w pełni przewidywalny i nie wymaga generacji"). Zbiorczo: liczba trafień / 12 oraz wskazanie kategorii sprawiających trudność, z linkiem do ekranu 6.

**OBOWIĄZKOWA alternatywa klawiaturowa / niedragowa** (zgodnie z `docs/design-baseline.md`, sekcja 6 — „Klasyfikator zadań → Lista zadań; do każdego radio/`select` kategorii"):
- Zadania prezentowane jako **lista**; przy każdym zadaniu **grupa radio** lub `select` z 4 kategoriami.
- W pełni obsługiwalne klawiaturą: Tab między zadaniami, strzałki/Spacja w obrębie grupy radio, Enter zatwierdza.
- **Widoczny focus** na każdym elemencie (kontrast obrysu ≥ 3:1).
- **Feedback tekstowy** (nie tylko kolor/wizualnie): poprawność i uzasadnienie opisane słownie przy każdym zadaniu; błędy walidacji (brak wyboru) opisane tekstem przy polu.
- Wynik i uzasadnienia identyczne w obu wariantach (drag & drop i lista) — parytet funkcjonalny.

## Quiz inline

- **Pula modułu: Q1–Q8 (8 pytań)** — zasila również test końcowy. **Quiz inline: 5–8 pytań losowanych z puli, dobranych do treści widzianej na danej ścieżce** (wg `wymagania/07`). Mapowanie puli zgodne z danymi modułu (`wymagania/06`): **Q1–Q4** single choice; **Q5–Q6** dopasowanie; **Q7–Q8** scenariusz decyzyjny.
- **Pytania krytyczne: brak.**
- **Co sprawdza:**
  - Q1–Q4 (single choice) — rozumienie pojęć: czym różni się GenAI od klasycznego ML, czym LLM w GenAI, oraz że output jest probabilistyczny, a nie gwarantowaną prawdą (E1, E2).
  - Q5–Q6 (dopasowanie) — przypisanie zadania do typu/technologii (zadanie → generatywne/klasyfikacyjne/deterministyczne lub → LLM/ML/regułowy) (E1, E3).
  - Q7–Q8 (scenariusz decyzyjny) — wybór właściwego rozwiązania dla syntetycznego scenariusza QA i uzasadnienie, w tym rozpoznanie przypadku, w którym LLM nie jest dobrym wyborem (E2, E3).
- **Tryb nauki:** feedback i wyjaśnienie natychmiast po każdej odpowiedzi (`docs/design-baseline.md`, sekcja 2.2).

## Mapowanie na efekty i pytania

| Efekt | Ekrany | Pytania quizu |
|---|---|---|
| **E1** — rozróżnia GenAI / LLM / klasyczny ML (5 przykładów) | 1, 2, 3, 7 | Q1–Q4 (single choice), Q5–Q6 (dopasowanie) |
| **E2** — output probabilistyczny, nie gwarantowana prawda | 1, 4, 5, 8 | Q1–Q4 (część dot. natury outputu), Q7–Q8 (scenariusz: kiedy nie ufać/nie używać) |
| **E3** — klasyfikuje 6 zadań: generatywne / klasyfikacyjne / deterministyczne | 1, 6, 7, 8 | Q5–Q6 (dopasowanie), Q7–Q8 (scenariusz decyzyjny) |

> Każdy z 3 efektów ma pokrycie w treści (ekrany), w ćwiczeniu (ekran 7) i w quizie (ekran 8). Pełna treść tekstowa ekranów powstaje w M4 (faza pisania treści) — ten dokument definiuje strukturę.
