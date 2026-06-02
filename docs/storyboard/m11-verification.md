# Storyboard — M11: Halucynacje, granice zastosowania i weryfikacja outputu

| Pole | Wartość |
|---|---|
| Moduł | M11 |
| Czas | 60 min |
| Ścieżki | S1: obowiązkowy; S2: obowiązkowy; S3: obowiązkowy |
| Element interaktywny | „Output verifier" (weryfikator odpowiedzi) |
| Pula modułu | Q95–Q104 (10 pytań) |
| Quiz inline | 5–8 pytań dobranych z puli |

> Storyboard to STRUKTURA ekranów — plan treści w skrócie. Pełna treść powstaje w M4 (faza pisania).
>
> **Uwaga o ścieżkach.** M11 jest **obowiązkowy dla wszystkich trzech ścieżek (S1/S2/S3)**, więc **żaden ekran nie jest wycinany przez gating** — nie ma wariantu świadomościowego z pominięciami. Co więcej, kompetencje tego modułu (rozpoznanie halucynacji, checklista weryfikacji, decyzja o odrzuceniu LLM) są krytyczne **najbardziej** dla nietechnicznego testera S1, nie najmniej — dlatego rdzeń jest wspólny i pełny dla S1/S2/S3. Tylko jeden ekran (ekran 3, mechanizm halucynacji na poziomie predykcji tokenów) niesie pogłębienie techniczne i w wersji dla S1 jest **uproszczony** (regulacja głębokości w obrębie modułu obowiązkowego, nie pominięcie).
>
> Wszystkie przykłady danych są **syntetyczne**: fikcyjny system testowy `TestRail-SANDBOX`, repozytorium `synt-shop`, dokumentacja `synt-API v2`. Zero realnych danych klienta / PII.

## Efekty uczenia

Efekty z curriculum (`wymagania/06`) rozbite na ponumerowane pozycje:

- **E1** — Uczestnik wskazuje **pięć przyczyn halucynacji** (*hallucination*): brak danych, konflikt danych, presja promptu (*prompt pressure* — prompt sugeruje odpowiedź, której model nie ma), nieaktualny kontekst (*training cutoff* / stary kontekst), nieprecyzyjne źródła.
- **E2** — Uczestnik stosuje **checklistę weryfikacji outputu** (*verification checklist*): co sprawdzić, w jakiej kolejności i kiedy output uznać za niezweryfikowany.
- **E3** — Uczestnik **odrzuca użycie LLM**, gdy wyniku nie da się sprawdzić (*unverifiable*) lub gdy błąd ma wysoki wpływ (*high-impact / critical decision*).
- **E4** — Uczestnik **oznacza fragmenty odpowiedzi wymagające źródła lub eksperta** (*source / human review*), zamiast akceptować całość lub odrzucać całość.

## Sekwencja ekranów

| # | Tytuł ekranu | Typ | Cel/treść (skrót, ≤300 słów) | Efekt(y) | Ścieżki/wariant |
|---|---|---|---|---|---|
| 1 | Po co Ci ten moduł | treść | **Cel modułu + dlaczego ważny dla QA.** Tester dostaje od LLM gotowy artefakt (raport z testów, przypadek testowy, podsumowanie wymagań, fragment dokumentacji) brzmiący wiarygodnie — i musi zdecydować, czy mu zaufać. Komunikat: LLM zwraca najbardziej prawdopodobny tekst, nie gwarantowaną prawdę (nawiązanie do M1) — więc bez nawyku weryfikacji łatwo przepuścić zmyśloną treść jako fakt. Co uczestnik będzie umiał po module: rozpoznać skąd bierze się halucynacja, przejść checklistę weryfikacji, odrzucić LLM gdy nie da się sprawdzić wyniku, oznaczyć fragmenty wymagające źródła/eksperta. Zapowiedź E1–E4, czasu (60 min), elementu interaktywnego „Output verifier" i quizu. Pasek postępu + „następny krok →". | E1–E4 | rdzeń (S1/S2/S3) |
| 2 | Czym jest halucynacja (a czym nie) | treść | **Jedna koncepcja: definicja halucynacji.** Halucynacja (*hallucination*) = output brzmiący wiarygodnie, ale **nieuzasadniony danymi** (zmyślony fakt, nieistniejące źródło, błędny szczegół podany pewnym tonem). Odróżnienie od: błędu użytkownika (zły prompt), niejasnej odpowiedzi (model sygnalizuje niepewność) i poprawnej odpowiedzi, której tylko nie zweryfikowano. Kluczowe: pewny ton ≠ poprawność. Jeden syntetyczny przykład: LLM cytuje „sekcję 7.4 `synt-API v2`", która nie istnieje. | E1 | rdzeń (S1/S2/S3) |
| 3 | Skąd biorą się halucynacje — mechanizm | treść | **Jedna koncepcja: dlaczego model zmyśla.** Model przewiduje najbardziej prawdopodobny kolejny token na podstawie wzorców z treningu — gdy brak wzorca/danych, „dopowiada" wiarygodnie zamiast przyznać niewiedzę; nie ma wbudowanego sygnału „nie wiem". Stąd halucynacja to skutek mechanizmu, nie awarii. Dla S2/S3 dodatkowo: rola temperatury i braku dostępu do źródeł w czasie generacji. | E1 | **S1: uproszczony** (świadomościowo: „model dopowiada gdy nie wie", bez szczegółu predykcji tokenów); S2/S3: pełny |
| 4 | Pięć przyczyn halucynacji | treść | **Jedna koncepcja: katalog 5 przyczyn (rdzeń E1).** Tabela: przyczyna → mechanizm → syntetyczny sygnał ostrzegawczy. (1) **Brak danych** — pytanie poza wiedzą modelu. (2) **Konflikt danych** — sprzeczne informacje w kontekście/treningu. (3) **Presja promptu** (*prompt pressure*) — prompt zakłada odpowiedź, której model nie ma („podaj numer wersji", gdy go nie zna). (4) **Nieaktualny kontekst** (*training cutoff*) — pytanie o stan po dacie treningu lub o nieaktualny dokument. (5) **Nieprecyzyjne źródła** — model miesza/uśrednia podobne dokumenty. Tabela ma opis tekstowy (WCAG 1.1.1). | E1 | rdzeń (S1/S2/S3) |
| 5 | Checklista weryfikacji outputu | treść | **Jedna koncepcja: checklista (rdzeń E2).** Uporządkowane kroki, co sprawdzić zanim zaufasz odpowiedzi: (a) czy są **konkretne, sprawdzalne twierdzenia** (liczby, nazwy, cytaty, kroki); (b) czy **źródło istnieje i mówi to co model**; (c) czy treść **nie jest przeterminowana** względem aktualnego stanu; (d) czy są **wewnętrzne sprzeczności**; (e) czy fragment dotyczy **decyzji krytycznej** (próg „muszę sprawdzić u eksperta"). Wynik: każdy fragment trafia do jednej z 5 kategorii (zapowiedź interakcji). Lista tekstowa, gotowa do zapamiętania. | E2 | rdzeń (S1/S2/S3) |
| 6 | Kiedy NIE używać LLM | decyzja | **Jedna decyzja: użyć LLM czy odrzucić (rdzeń E3).** Rama przed interakcją. Dwie osie: czy wynik da się **sprawdzić** (*verifiable*) oraz jaki jest **wpływ błędu** (odwracalny/niski vs nieodwracalny/wysoki — *high-impact / critical decision*). Reguła kciuka: **nie da się sprawdzić LUB błąd ma wysoki wpływ → nie polegaj na LLM** (odrzuć albo wymagaj weryfikacji człowieka/źródła). Pytanie prowadzące: „gdyby ta odpowiedź była zmyślona, jaki byłby najgorszy wiarygodny skutek i czy bym to wychwycił?". Syntetyczne „zielone" vs „czerwone" zastosowania. | E3 | rdzeń (S1/S2/S3) |
| 7 | Oznaczanie fragmentów: źródło / ekspert | treść | **Jedna koncepcja: granulacja zamiast zero-jedynkowości (rdzeń E4).** Odpowiedź LLM rzadko jest w całości dobra albo zła — częściej miesza fragmenty pewne, niepewne i ryzykowne. Tester oznacza fragmenty: **wymaga źródła** (twierdzenie sprawdzalne, brak cytatu) lub **wymaga eksperta** (decyzja krytyczna / dziedzinowa poza weryfikacją testera). Wprowadzenie 5 kategorii oznaczeń używanych w interakcji: poprawne, nieuzasadnione, wymagające źródła, ryzykowne, do odrzucenia. | E4 | rdzeń (S1/S2/S3) |
| 8 | Output verifier | interakcja | **Element interaktywny** (szczegół niżej). Uczestnik analizuje jedną syntetyczną odpowiedź LLM rozbitą na zdania i oznacza każde zdanie jedną z 5 kategorii: **poprawne / nieuzasadnione / wymagające źródła / ryzykowne / do odrzucenia**. Po zatwierdzeniu: tekstowy feedback per zdanie (z przyczyną halucynacji z E1) + ocena zbiorcza, czy fragmenty krytyczne zostały złapane. Dane i alternatywa klawiaturowa — w sekcji poniżej. | E1, E2, E4 | rdzeń (S1/S2/S3) |
| 9 | Quiz inline (5–8 z puli Q95–Q104) | quiz-inline | **5–8 pytań losowanych z puli Q95–Q104 z natychmiastowym feedbackiem i wyjaśnieniem** (tryb nauki), każde z linkiem do powiązanej sekcji. Pula obejmuje: Q95–Q98 scenariusz weryfikacji (analiza syntetycznego outputu: która przyczyna, jaka kategoria, użyć czy odrzucić). Q99–Q101 single choice (definicja halucynacji, przyczyny, próg odrzucenia). Q102–Q104 multiple choice (elementy checklisty, sygnały ostrzegawcze, kategorie oznaczeń). Pytań krytycznych: brak. | E1–E4 | rdzeń (S1/S2/S3) |
| 10 | Karta weryfikacji do pracy | treść | **Jedna koncepcja: transfer do codziennej pracy.** Skondensowana karta-ściąga: 5 przyczyn (skrót), checklista (a–e), reguła „kiedy nie używać LLM", 5 kategorii oznaczeń. Do zachowania/wydruku — most między szkoleniem a stanowiskiem testera. Bez nowej treści (tylko synteza ekranów 4–7). | E1–E4 | rdzeń (S1/S2/S3) |
| 11 | Podsumowanie i następny krok | podsumowanie | **Domknięcie modułu.** 1 zdanie syntezy na efekt (E1–E4): halucynacja wynika z mechanizmu (5 przyczyn), checklista chroni przed zaufaniem zmyślonej treści, brak weryfikowalności lub wysoki wpływ = odrzuć LLM, a odpowiedź oznaczamy fragmentami, nie zero-jedynkowo. „Następny najlepszy krok →": M12 (ewaluacja jakości LLM i RAG). Pasek postępu modułu = 100%. | E1–E4 | rdzeń (S1/S2/S3) |

**Liczba ekranów: 11.** Mieści się w 6–12 dla 60 min: ekrany treści ~3–4 min, ekran 6 (decyzja) ~3 min, interakcja „Output verifier" ~10 min, quiz 10 pytań ~12 min, karta + podsumowanie ~2–3 min. W obrębie modułu obowiązkowego dla S1/S2/S3 wycinany jest tylko nadmiar głębokości technicznej na ekranie 3 (S1 uproszczony) — żaden ekran nie znika przez gating.

## Element interaktywny — szczegół

**Nazwa:** „Output verifier" (weryfikator odpowiedzi LLM).

**Działanie:** Uczestnik widzi jedną syntetyczną odpowiedź LLM rozbitą na **ponumerowane zdania**. Zadanie: oznaczyć każde zdanie jedną z **5 kategorii** — **poprawne**, **nieuzasadnione**, **wymagające źródła**, **ryzykowne**, **do odrzucenia**. System porównuje wybory z kluczem, zwraca tekstowy feedback przy każdym zdaniu (z powiązaną przyczyną halucynacji z E1) i ocenę zbiorczą: czy fragmenty „ryzykowne / do odrzucenia" (decyzje krytyczne) zostały wychwycone.

**DANE WEJŚCIOWE (syntetyczne — odpowiedź LLM na pytanie „Jak skonfigurować logowanie w `synt-API v2`?", przykładowe zdania):**

| # | Zdanie (syntetyczne) | Oczekiwana kategoria | Dlaczego (przyczyna z E1) |
|---|---|---|---|
| Z1 | „`synt-API v2` udostępnia endpoint `/health` zwracający status." | poprawne | zgodne z dokumentacją `synt-API v2` |
| Z2 | „Domyślny poziom logów to `DEBUG`." | wymagające źródła | sprawdzalne twierdzenie bez cytatu (nieprecyzyjne źródła) |
| Z3 | „Konfigurację opisuje sekcja 7.4 dokumentacji." | do odrzucenia | sekcja nie istnieje — zmyślone źródło (brak danych) |
| Z4 | „W wersji 2.5 dodano rotację logów co 24 h." | nieuzasadnione | stan po dacie treningu / brak wersji 2.5 (nieaktualny kontekst) |
| Z5 | „Możesz bezpiecznie wyłączyć logowanie błędów na produkcji." | ryzykowne | decyzja o wysokim wpływie — wymaga eksperta (presja promptu) |

**OUTPUT:** Dla każdego zdania — etykieta kategorii + zdanie uzasadnienia tekstem (np. „Z3: cytuje nieistniejącą sekcję → do odrzucenia; przyczyna: brak danych"). Na końcu ocena zbiorcza: ile zdań poprawnie zaklasyfikowano oraz wyraźny sygnał, czy złapano zdania krytyczne (Z3, Z5).

**OBOWIĄZKOWA alternatywa klawiaturowa / niedragowa** (zgodnie z `docs/design-baseline.md` §6, wiersz M11: „Lista zdań; do każdego radio kategorii ryzyka"):
- **Brak drag & drop.** Cała interakcja jako **lista zdań**; przy każdym zdaniu **grupa radio** z 5 kategoriami (poprawne / nieuzasadnione / wymagające źródła / ryzykowne / do odrzucenia).
- Wszystkie kontrolki **fokusowalne**, w logicznej kolejności Tab (zdanie po zdaniu, w obrębie grupy strzałkami), z **widocznym focusem** (kontrast obrysu ≥ 3:1).
- **Feedback tekstowy** po zatwierdzeniu — przy każdym zdaniu i zbiorczo; kategoria zawsze ma **słowo** (ewentualnie ikonę), nigdy sam kolor (WCAG 1.4.1).
- Etykiety radio powiązane z każdym zdaniem (WCAG 1.3.1 / 3.3.2); brak wyboru przy zdaniu komunikowany tekstem przy polu (WCAG 3.3.1).
- Reflow bez poziomego scrolla do 320 px (lista zdań jednokolumnowa); dodatkowy checkpoint 360 px.

## Quiz inline

- **Pula modułu: Q95–Q104 (10 pytań) — zasila również test końcowy. Quiz inline: 5–8 pytań losowanych z puli, dobranych do treści widzianej na danej ścieżce (wg `wymagania/07`).** Natychmiastowy feedback i wyjaśnienie (tryb nauki, *formative*), każde z linkiem do powiązanej sekcji. Quiz jest **formatywny w module obowiązkowym** — utrwala kompetencje E1–E4; właściwa weryfikacja kompetencji odbywa się w teście końcowym ścieżki.
- **Q95–Q98 — scenariusz weryfikacji:** analiza syntetycznego outputu LLM — wskazanie przyczyny halucynacji (E1), nadanie kategorii zdaniu (E4) oraz decyzja „użyć / wymagać źródła / odrzucić" (E2, E3). Sprawdza transfer z ćwiczenia „Output verifier".
- **Q99–Q101 — single choice:** definicja halucynacji vs niepewność (E1), rozpoznanie pojedynczej przyczyny (E1), próg odrzucenia LLM (E3).
- **Q102–Q104 — multiple choice:** wybór wszystkich elementów checklisty weryfikacji (E2), wszystkich sygnałów ostrzegawczych halucynacji (E1), wszystkich fragmentów wymagających źródła/eksperta (E4). Punktacja 0–2 zgodnie z `wymagania/07` (pełne 2 tylko za komplet bez błędów).
- **Pytań krytycznych: brak** (zgodnie z danymi modułu — pytania krytyczne bezpieczeństwa są w M10). „Brak pytań krytycznych" nie oznacza, że moduł jest opcjonalny: M11 pozostaje obowiązkowy dla S1/S2/S3.

## Mapowanie na efekty i pytania

| Efekt | Ekrany | Pytania |
|---|---|---|
| E1 — pięć przyczyn halucynacji | 1, 2, 3, 4, 8 | Q95–Q98, Q99–Q101, Q102–Q104 |
| E2 — checklista weryfikacji outputu | 1, 5, 8, 10 | Q95–Q98, Q102–Q104 |
| E3 — odrzuca LLM (brak weryfikacji / wysoki wpływ) | 1, 6, 10 | Q95–Q98, Q99–Q101 |
| E4 — oznacza fragmenty wymagające źródła / eksperta | 1, 7, 8, 10 | Q95–Q98, Q102–Q104 |
