# Storyboard — M12: Ewaluacja jakości LLM i RAG

| Pole | Wartość |
|---|---|
| Moduł | M12 |
| Czas | 90 min |
| Ścieżki | S1: opcjonalny; S2: opcjonalny ROZSZERZONY; S3: obowiązkowy |
| Element interaktywny | „Judge calibration lab” (laboratorium kalibracji oceniającego) — porównanie ocen człowieka i LLM jako sędziego (ang. *LLM-as-a-judge*), wykrycie rozjazdów i poprawa rubryki |
| Pula modułu | Q105–Q116 (12 pytań) — zasila również test końcowy |
| Quiz inline | 5–8 pytań losowanych z puli modułu |

> Storyboard to STRUKTURA ekranów — plan treści w skrócie. Pełna treść powstaje w M4 (faza pisania).
>
> Wszystkie przykłady danych są SYNTETYCZNE: fikcyjny korpus „SklepDemo”, zestaw wzorcowy (ang. *golden set*) „GS-SklepDemo”, oceniane odpowiedzi A1–A6, ekspert „QA-ekspert (anon.)”. Zero realnych danych klienta / PII.

> **Konwencja ścieżek w tym storyboardzie.** Zgodnie z `wymagania/06` (autorytatywne, wiersz M12) status ścieżek to **S1: opcjonalny; S2: opcjonalny ROZSZERZONY; S3: obowiązkowy**. Curriculum **nie przypisuje** M12 żadnego wariantu „świadomościowego” ani „skróconego” treści — w przeciwieństwie do np. M6/M9. Dlatego:
> - Ścieżki różnią się **gatingiem (bramkowaniem ukończenia)**, a nie redukcją treści: S3 musi ukończyć moduł i quiz; S1/S2 mają moduł opcjonalny (quiz nie jest bramką).
> - Charakter „ROZSZERZONY” (S2) / „pełny” (S3) realizowany jest przez **włączenie ekranów pogłębionych** (zgodność międzyoceniacza, diagnostyka position bias), a nie przez wycinanie ekranów dla S1.
> - W kolumnie „Ścieżki/wariant” ekrany rdzeniowe są oznaczone `S1,S2,S3`; ekrany pogłębione są oznaczone jako **rozszerzenie S2 (ROZSZERZONE) / S3 (pełne)**. Nie wprowadzam uproszczeń S1 bez etykiety źródłowej — `wymagania/06` jej nie definiuje.

## Efekty uczenia

- **E1** — Uczestnik definiuje zestaw wzorcowy (ang. *golden set*) dla wybranego przypadku użycia (ang. *use case*) QA: co jest wejściem, co poprawnym oczekiwaniem i jak udokumentować źródło prawdy.
- **E2** — Uczestnik dobiera metryki jakości: trafność (ang. *accuracy*), wierność źródłom (ang. *faithfulness*), ugruntowanie w kontekście (ang. *groundedness*), adekwatność do pytania (ang. *relevance*), kompletność (ang. *completeness*) — i wie, którą metrykę stosować do którego pytania jakościowego.
- **E3** — Uczestnik projektuje rubrykę oceny (ang. *evaluation rubric*) dla modelu oceniającego (ang. *LLM-as-a-judge*): kryteria, skala, definicje poziomów i przykłady kotwiczące.
- **E4** — Uczestnik wskazuje ryzyka stronniczości (ang. *bias*), w tym stronniczość pozycyjną (ang. *position bias*), oraz rozbieżności oceny automatycznej z oceną ludzką.
- **E5** — Uczestnik kalibruje ocenę automatyczną przez porównanie z oceną eksperta i interpretuje zgodność międzyoceniacza (ang. *inter-rater agreement*).
- **E6** — Uczestnik ustala próg akceptacji jakości (ang. *acceptance threshold*) i podejmuje decyzję jakościową typu „dalej / wstrzymaj” (ang. *go / no-go*).

## Sekwencja ekranów

| # | Tytuł ekranu | Typ | Cel/treść (skrót, ≤300 słów) | Efekt(y) | Ścieżki/wariant |
|---|---|---|---|---|---|
| 1 | Po co testerowi ewaluacja LLM i RAG | treść | Cel modułu i dlaczego ważny dla QA: „działa na oko” nie wystarcza — bez pomiaru nie wiadomo, czy zmiana promptu lub pipeline RAG poprawiła, czy pogorszyła jakość. Tester wnosi to, co umie najlepiej: kryteria akceptacji, powtarzalność, regresję. Zapowiedź: czym jest zestaw wzorcowy (ang. *golden set*), metryki, rubryka, kalibracja, próg decyzyjny. Zapowiedź efektów E1–E6, czasu (90 min) i elementu interaktywnego. Pasek postępu + „następny krok”. | E1–E6 | S1,S2,S3 |
| 2 | Golden set dla przypadku użycia | treść | Definicja E1: zestaw wzorcowy = lista syntetycznych przypadków wejście → oczekiwana odpowiedź + źródło prawdy (ang. *ground truth*). Co go tworzy: reprezentatywne pytania, przypadki brzegowe, znane pułapki. Reguła QA: golden set to „testy regresyjne dla odpowiedzi modelu”. Syntetyczny przykład „GS-SklepDemo”: pytania o limit pozycji w koszyku, politykę zwrotów, kryterium akceptacji WYM-koszyk. Czym golden set NIE jest: nie zbiorem losowych logów, nie danymi produkcyjnymi. | E1 | S1,S2,S3 |
| 3 | Oceń projekt golden setu | ćwiczenie | Utrwalenie E1: 3–4 syntetyczne pozycje kandydujące do golden setu; uczestnik decyduje, które są dobre, a które wadliwe (brak źródła prawdy, niejednoznaczne oczekiwanie, duplikat, pytanie nietestowalne) — radio do każdej + feedback tekstowy. Most do Q105/Q113. | E1 | S1,S2,S3 |
| 4 | Pięć metryk jakości | treść | Wprowadzenie E2: trafność (*accuracy*), wierność źródłom (*faithfulness*), ugruntowanie (*groundedness*), adekwatność (*relevance*), kompletność (*completeness*). Dla każdej: jedno zdanie definicji + co mierzy + typowy objaw braku (np. niska faithfulness = odpowiedź sprzeczna ze źródłem; niska completeness = brak części kryterium akceptacji). Tabela + równoległa lista tekstowa (WCAG 1.1.1). Powiązanie z warstwami błędu RAG z M6. | E2 | S1,S2,S3 |
| 5 | Dobierz metrykę do pytania | decyzja | Jedna decyzja (E2): dla syntetycznego pytania jakościowego wybierz właściwą metrykę (np. „czy odpowiedź cytuje to, co jest w źródle?” → faithfulness/groundedness; „czy odpowiedź pokrywa wszystkie warunki?” → completeness). Feedback tekstowy uzasadnia wybór i wskazuje pułapkę (mylenie relevance z accuracy). Przygotowanie do Q109–Q112. | E2 | S1,S2,S3 |
| 6 | Rubryka dla LLM-as-a-judge | treść | E3: czym jest model oceniający (ang. *LLM-as-a-judge*) i dlaczego potrzebuje rubryki (ang. *evaluation rubric*). Elementy dobrej rubryki: jasne kryterium, skala (np. 0–2 lub 1–5), definicja każdego poziomu, przykłady kotwiczące (ang. *anchor examples*), instrukcja „oceniaj tylko względem źródła”. Anty-mit: „zapytaj model, czy odpowiedź jest dobra” bez rubryki = niepowtarzalna ocena. Syntetyczny szkic rubryki dla faithfulness. | E3 | S1,S2,S3 |
| 7 | Stronniczość oceniającego i position bias | treść | E4: oceniający LLM ma stronniczości (ang. *bias*). Kluczowa dla testera: stronniczość pozycyjna (ang. *position bias*) — przy porównaniu dwóch odpowiedzi model częściej wybiera tę pokazaną jako pierwsza, niezależnie od jakości. Inne: preferencja dłuższych odpowiedzi, „grzecznościowa” zawyżona ocena, rozbieżność z oceną człowieka. Skutek dla QA: ocena automatyczna bez kontroli daje fałszywe „zielone”. Mitygacje (zapowiedź): zamiana kolejności, rubryka, kalibracja. | E4 | S1,S2,S3 |
| 8 | Kalibracja z ekspertem i zgodność oceniaczy | treść | E5: jak ufać ocenie automatycznej — porównaj ją z oceną eksperta na tym samym golden secie i policz zgodność międzyoceniacza (ang. *inter-rater agreement*). Gdzie się rozjeżdżają = sygnał do poprawy rubryki, nie do ignorowania. Pętla: oceń → porównaj → znajdź rozjazd → popraw rubrykę → oceń ponownie. Pogłębienie (S2 ROZSZERZONE / S3): intuicja miar zgodności i dlaczego sama „zgodność %” bywa myląca przy nierównym rozkładzie ocen. | E5 | S1,S2,S3 (pogłębienie miar zgodności: rozszerzenie S2 ROZSZERZONE / S3) |
| 9 | Próg akceptacji i decyzja go/no-go | treść | E6: ustalenie progu akceptacji jakości (ang. *acceptance threshold*) — np. „faithfulness ≥ próg X na golden secie, zero przypadków sprzecznych ze źródłem”. Jak dobrać próg: ryzyko przypadku użycia, koszt błędu, baseline poprzedniej wersji. Decyzja „dalej / wstrzymaj” (ang. *go / no-go*) i rola progu w regresji (porównanie wersji). Konserwatywne domyślne: brak danych → nie zaliczaj automatycznie. | E6 | S1,S2,S3 |
| 10 | Judge calibration lab | interakcja | ELEMENT INTERAKTYWNY (szczegół niżej). Uczestnik porównuje ocenę człowieka i LLM-as-a-judge na syntetycznym zestawie A1–A6, wykrywa rozjazdy (w tym celowo wstrzyknięty position bias), wskazuje, gdzie rubryka jest niejednoznaczna, i proponuje poprawkę. Integruje E3, E4, E5. | E3,E4,E5 | S1,S2,S3 (warstwa pogłębiona: analiza zgodności i diagnoza position bias = rozszerzenie S2 ROZSZERZONE / S3) |
| 11 | Quiz inline (5–8 z puli Q105–Q116) | quiz-inline | 5–8 pytań losowanych z puli modułu (Q105–Q116) z natychmiastowym feedbackiem i wyjaśnieniem (tryb nauki). Pula modułu Q105–Q116 zasila również test końcowy. Zakresy puli: Q105–Q108 single choice (definicje: golden set, metryki, rubryka, terminy bias). Q109–Q112 multiple choice (które sygnały = position bias, które metryki pasują, co należy do golden setu). Q113–Q116 scenariusz ewaluacji (przebieg od kalibracji do progu). Szczegóły w sekcji „Quiz inline”. Pytań krytycznych brak. | E1–E6 | S1,S2,S3 (S3: bramka ukończenia; S1/S2: opcjonalny, nie jest gatingiem) |
| 12 | Podsumowanie i następny krok | podsumowanie | Domknięcie: 1 zdanie na efekt (E1–E6), karta „pętla ewaluacji” do zapamiętania (golden set → metryki → rubryka → kalibracja → próg → decyzja). Lista „co potrafię po M12” zmapowana na E1–E6. „Następny najlepszy krok →” zależny od ścieżki (dla S3 zwykle test końcowy / dodatki). Pasek postępu modułu = 100%. | E1–E6 | S1,S2,S3 |

**Liczba ekranów: 12.** Bilans czasu (orientacyjnie, 90 min): ekrany treściowe/decyzyjne 5–7 min, ćwiczenie ~6 min, interakcja „Judge calibration lab” ~15 min, quiz inline (5–8 z puli) ~15 min, podsumowanie ~4 min → ≈90 min. Wszystkie 12 ekranów są wspólne dla S1/S2/S3; ścieżki różnią się **gatingiem** (S3 obowiązkowy z quizem jako bramką; S1/S2 opcjonalne), a charakter ROZSZERZONY/pełny S2/S3 realizują **warstwy pogłębione** na ekranach 8 i 10 (zgodność międzyoceniacza, diagnoza position bias). Brak osobnego wariantu świadomościowego — `wymagania/06` go nie przypisuje.

## Element interaktywny — szczegół

**Nazwa:** „Judge calibration lab” (laboratorium kalibracji oceniającego).

**Cel:** uczestnik łączy E3 (rubryka), E4 (bias / position bias) i E5 (kalibracja, zgodność) w jednym przepływie: porównuje ocenę eksperta-człowieka z oceną LLM-as-a-judge, lokalizuje rozjazdy, diagnozuje ich przyczynę (niejednoznaczna rubryka vs stronniczość) i proponuje poprawioną rubrykę.

**Działanie:** Uczestnik widzi syntetyczny zestaw 6 ocenianych odpowiedzi (A1–A6) na pytania z golden setu „GS-SklepDemo”. Dla każdej pozycji podana jest: ocena QA-eksperta (anon.) oraz ocena LLM-as-a-judge — wg tej samej rubryki, w rozbiciu na metryki (faithfulness, completeness, relevance). Zestaw zawiera **celowo wstrzyknięty position bias**: w parze porównawczej (np. A3 vs A4) oceniający faworyzuje odpowiedź pokazaną jako pierwsza, choć ekspert ocenił wyżej drugą. Uczestnik: (1) odczytuje rozjazd dla każdej pozycji, (2) klasyfikuje przyczynę rozjazdu, (3) edytuje regułę rubryki i obserwuje, czy po „ponownej ocenie” (symulowanej) rozjazd maleje.

**DANE WEJŚCIOWE (syntetyczne):**

| Poz. | Pytanie z golden setu (skrót) | Ocena eksperta | Ocena LLM-as-a-judge | Uwaga |
|---|---|---|---|---|
| A1 | Limit pozycji w koszyku | faithfulness 2/2 | 2/2 | zgodne |
| A2 | Polityka zwrotów — termin | faithfulness 0/2 (sprzeczne ze źródłem) | 2/2 | rozjazd: judge zawyża |
| A3 | Kryterium WYM-koszyk (wariant 1, pokazany pierwszy) | 1/2 | 2/2 | podejrzenie position bias |
| A4 | Kryterium WYM-koszyk (wariant 2, pokazany drugi) | 2/2 | 1/2 | podejrzenie position bias |
| A5 | Kompletność warunków płatności | completeness 1/2 (brak 1 warunku) | 2/2 | rozjazd: niejednoznaczna rubryka |
| A6 | Pytanie poza zakresem źródła | relevance 0/2 | 0/2 | zgodne |

**OUTPUT (system pokazuje, tekstowo):**
- **Rozjazd** (różnica ocen) per pozycja i metryka — w tabeli tekstowej, z etykietą słowną „zgodne / rozjazd” (nie sam kolor).
- **Zgodność międzyoceniacza** dla całego zestawu (np. liczba pozycji zgodnych / wszystkich) jako wartość + opis tekstowy; w warstwie pogłębionej (S2 ROZSZERZONE / S3) — komentarz, dlaczego sama „% zgodności” może mylić.
- **Diagnoza** dla pozycji rozjazdowych: czy to position bias (zamiana kolejności A3/A4 zmieniłaby werdykt), czy luka w rubryce.
- Po edycji rubryki — **komunikat tekstowy**, czy poprawka zmniejszyła rozjazd (symulowana ponowna ocena), z uzasadnieniem.

**OBOWIĄZKOWA alternatywa klawiaturowa / niedragowa** (zgodnie z `docs/design-baseline.md` §6, wiersz M12: „Tabela porównań ocen z polami liczbowymi i polem rozjazdu”):
- **Brak drag & drop.** Cała interakcja jako **tabela porównań ocen**: dla każdej pozycji **pola liczbowe** oceny (lub `select` poziomu wg skali rubryki) dla człowieka i dla LLM-judge, **pole „rozjazd”** (różnica) oraz **radio** klasyfikacji przyczyny rozjazdu (zgodne / position bias / niejednoznaczna rubryka / judge zawyża). Edycja rubryki przez `textarea` lub `select` reguły z listy.
- Wszystkie kontrolki **fokusowalne**, logiczna kolejność Tab (pozycja po pozycji, kolumna po kolumnie), **widoczny focus** (kontrast obrysu ≥ 3:1).
- **Feedback tekstowy** (nie tylko wizualny): rozjazd, zgodność i diagnoza opisane słownie; etykieta „zgodne/rozjazd” zawsze ma słowo (+ ewentualnie ikonę), nigdy sam kolor (WCAG 1.4.1).
- Etykiety pól powiązane z kontrolkami (WCAG 1.3.1 / 3.3.2); komunikaty walidacji (np. ocena spoza skali rubryki) opisane tekstem przy polu (WCAG 3.3.1).
- Reflow bez poziomego scrolla do 320 px; dodatkowy checkpoint 360 px (desktop + mobile).

## Quiz inline

**Liczba i mapowanie:** Pula modułu: **Q105–Q116 (12 pytań)** — zasila również test końcowy (zgodnie z curriculum, `wymagania/06`). Quiz inline: **5–8 pytań losowanych z puli, dobranych do treści widzianej na danej ścieżce** (wg `wymagania/07`). Pytań krytycznych: **brak**. Tryb nauki — wynik i wyjaśnienie natychmiast po odpowiedzi (`docs/design-baseline.md` 2.2); obsługa klawiaturą i widoczny focus na opcjach. Moduł obowiązkowy tylko dla S3 — dla S1/S2 quiz nie jest bramką gatingu. Poniższa tabela mapuje zakresy całej puli Q105–Q116 na typy i efekty; quiz inline losuje z nich 5–8 pytań.

| Zakres | Typ | Sprawdzana kompetencja | Efekt |
|---|---|---|---|
| Q105–Q108 | jednokrotnego wyboru (single choice) | definicje i rozpoznanie pojęć: golden set, znaczenie metryk (accuracy/faithfulness/groundedness/relevance/completeness), czym jest rubryka LLM-as-a-judge, terminy bias / position bias | E1,E2,E3,E4 |
| Q109–Q112 | wielokrotnego wyboru (multiple choice) | rozpoznanie wszystkich poprawnych elementów: które sygnały wskazują position bias, które metryki pasują do danego pytania jakościowego, co powinien zawierać dobry golden set, co składa się na rubrykę | E2,E3,E4 |
| Q113–Q116 | scenariusz ewaluacji | zastosowanie pełnego przebiegu w sytuacji QA: zaprojektuj/oceń ewaluację, zinterpretuj rozjazd człowiek–judge, skalibruj i ustal próg akceptacji oraz decyzję go/no-go | E1,E5,E6 |

## Mapowanie na efekty i pytania

| Efekt | Ekrany | Pytania |
|---|---|---|
| E1 — golden set dla use case | 1, 2, 3, 12 | Q105–Q108 (część), Q109–Q112 (część), Q113–Q116 (część) |
| E2 — dobór metryk (accuracy/faithfulness/groundedness/relevance/completeness) | 1, 4, 5, 12 | Q105–Q108 (część), Q109–Q112 (część) |
| E3 — rubryka LLM-as-a-judge | 1, 6, 10, 12 | Q105–Q108 (część), Q109–Q112 (część) |
| E4 — bias i position bias, rozbieżność z człowiekiem | 1, 7, 10, 12 | Q105–Q108 (część), Q109–Q112 (część) |
| E5 — kalibracja z ekspertem, zgodność międzyoceniacza | 1, 8, 10, 12 | Q113–Q116 (część) |
| E6 — próg akceptacji i decyzja go/no-go | 1, 9, 12 | Q113–Q116 (część) |

> Uwaga: dokładny przydział pojedynczych Q (które dokładnie pytanie do którego efektu) w obrębie zakresów Q105–Q116 doprecyzuje moduł autorski pytań / M4 treści; storyboard ustala strukturę i powiązania zakres ↔ efekt ↔ ekran zgodnie z `wymagania/06`.
