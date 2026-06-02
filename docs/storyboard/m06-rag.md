# Storyboard — M6: RAG: Retrieval-Augmented Generation

| Pole | Wartość |
|---|---|
| Moduł | M6 |
| Czas | 70 min |
| Ścieżki | S1: opcjonalny ŚWIADOMOŚCIOWY; S2: obowiązkowy PRAKTYCZNY; S3: obowiązkowy PEŁNY |
| Element interaktywny | „Zbuduj pipeline RAG" (konfiguracja źródeł, chunking, top-k, odpowiedź z cytatami dla scenariusza QA) |
| Pula modułu | Q41–Q50 (10 pytań) |
| Quiz inline | 5–8 z puli modułu |

> **Konwencja ścieżek w tym storyboardzie.** Każdy ekran ma oznaczenie wariantu:
> - **S1 (ŚWIADOMOŚCIOWY)** — moduł opcjonalny; wersja skrócona: tylko ekrany koncepcyjne i decyzyjne, bez technicznych szczegółów chunkingu i bez konfiguracji pełnego pipeline. Część ekranów pomijana (P) lub uproszczona (U).
> - **S2 (PRAKTYCZNY)** — obowiązkowy; pełny przebieg z elementem interaktywnym i quizem, bez najgłębszych dygresji inżynierskich.
> - **S3 (PEŁNY)** — obowiązkowy; wszystkie ekrany plus pogłębienia inżynierskie (reranking, grounding, diagnoza warstw błędu).
>
> Wszystkie przykłady danych są **syntetyczne** (fikcyjny korpus QA „SklepDemo"); zero realnych danych klienta i PII.

## Efekty uczenia
- **E1** — Uczestnik układa kroki pipeline RAG (ang. *Retrieval-Augmented Generation*) w poprawnej kolejności.
- **E2** — Uczestnik dobiera strategię dzielenia na fragmenty (ang. *chunking*) dla dokumentacji wymagań.
- **E3** — Uczestnik rozróżnia przypadek wymagający RAG od przypadku wymagającego dostrajania modelu (ang. *fine-tuning*).
- **E4** — Uczestnik identyfikuje błąd wyszukiwania (ang. *retrieval*), błąd generacji (ang. *generation*) i błąd źródłowy na podstawie odpowiedzi modelu.

## Sekwencja ekranów

| # | Tytuł ekranu | Typ | Cel/treść (skrót, ≤300 słów) | Efekt(y) | Ścieżki/wariant |
|---|---|---|---|---|---|
| 1 | Po co testerowi RAG | treść | Cel modułu i dlaczego ważny dla QA: LLM bez dostępu do firmowej dokumentacji zmyśla szczegóły wymagań. RAG (ang. *Retrieval-Augmented Generation*) = „daj modelowi szukać w naszych dokumentach i odpowiadać na ich podstawie". Przykłady QA: odpowiedzi o wymaganiach, pomoc w pisaniu przypadków testowych z odwołaniem do specyfikacji, szybkie znajdowanie reguły akceptacji. Zapowiedź efektów E1–E4. | E1,E2,E3,E4 | S1,S2,S3 (S1: U — tylko wartość biznesowa i „kiedy w ogóle myśleć o RAG", bez detali technicznych) |
| 2 | Pipeline RAG od końca do końca | treść | Mapa całego procesu na jednym ekranie: dokumenty źródłowe → dzielenie na fragmenty (*chunking*) → osadzenia (ang. *embeddings*) → indeks/baza wektorowa → zapytanie użytkownika → wyszukiwanie najbliższych fragmentów (*retrieval*, top-k) → (opcjonalnie) przesortowanie (*reranking*) → wstrzyknięcie kontekstu do promptu → generacja odpowiedzi z cytatami (*citations*). Diagram + równoległa **lista tekstowa kroków** (WCAG 1.1.1). Podkreślenie: odpowiedź ma być „ugruntowana" (ang. *grounding*) w źródłach, nie w pamięci modelu. | E1 | S1,S2,S3 (S1: U — diagram poglądowy, bez embeddings/reranking) |
| 3 | Kolejność kroków ma znaczenie | ćwiczenie | Mini-ćwiczenie utrwalające E1: pomieszane kroki pipeline do ułożenia w poprawnej kolejności (wariant listy z przyciskami „w górę/w dół"). Natychmiastowy feedback tekstowy: dlaczego np. chunking musi być przed osadzeniami, a retrieval przed generacją. Most do późniejszych pytań Q41–Q43 (kolejność procesu). | E1 | S2,S3 (S1: P — pominięty; w wersji świadomościowej wystarcza diagram z ekranu 2) |
| 4 | Chunking dla dokumentacji wymagań | treść | Czym jest dzielenie na fragmenty i dlaczego nie da się wrzucić całego dokumentu naraz. Parametry: rozmiar fragmentu, zazębienie (ang. *overlap*), granice logiczne (sekcja/wymaganie/krok). Reguła QA: jedno wymaganie lub jeden scenariusz = jeden spójny fragment; zachowaj nagłówki i identyfikatory (np. „WYM-014") w metadanych. Skutki złego chunkingu: ucięte kryterium akceptacji, fragment bez kontekstu. Synt. przykład dokumentu „SklepDemo — koszyk". | E2 | S2,S3 (S1: P — szczegół techniczny poza zakresem świadomościowym) |
| 5 | Dobierz chunking — szybka decyzja | decyzja | Jedna decyzja: dla podanego syntetycznego fragmentu specyfikacji wybierz strategię chunkingu (po sekcjach / stały rozmiar z overlapem / po pojedynczym wymaganiu). Feedback tekstowy uzasadnia wybór i pokazuje konsekwencję dla retrievalu. Przygotowanie do pytań scenariuszowych Q47–Q49. | E2 | S2,S3 (S1: P) |
| 6 | RAG czy fine-tuning | decyzja | Kluczowe rozróżnienie E3: RAG = świeża, zmienna wiedza i potrzeba cytowania źródeł; fine-tuning (dostrajanie) = stały styl/format/zachowanie modelu, nie nowa faktografia. Tabela porównawcza + równoległy opis tekstowy. Decyzja na 2–3 syntetycznych przypadkach QA (np. „odpowiedzi muszą cytować aktualną specyfikację" → RAG; „model ma zawsze zwracać raport w naszym formacie" → fine-tuning). Anty-mit: „fine-tuning nauczy model naszej dokumentacji" — nie, do faktów używaj RAG. | E3 | S1,S2,S3 (S1: U — sama tabela „kiedy RAG / kiedy fine-tuning" jako wskazówka decyzyjna, bez konfiguracji) |
| 7 | Trzy warstwy błędu w RAG | treść | Wprowadzenie E4: ta sama zła odpowiedź może mieć różne źródła. Błąd wyszukiwania (*retrieval*) — nie znaleziono właściwego fragmentu. Błąd generacji (*generation*) — fragment był dobry, ale model i tak zmyślił lub źle podsumował. Błąd źródłowy — sam dokument źródłowy był błędny/nieaktualny. Dlaczego tester musi rozróżniać: inna naprawa dla każdej warstwy (lepszy retrieval vs lepszy prompt vs poprawa dokumentacji). | E4 | S1,S2,S3 (S1: U — koncept „skąd wziął się błąd", bez diagnostyki krok po kroku) |
| 8 | Diagnoza: która warstwa zawiodła | ćwiczenie | Utrwalenie E4: 2–3 syntetyczne odpowiedzi modelu z widocznym pobranym kontekstem i cytatami. Dla każdej wybierz warstwę błędu (radio: retrieval / generation / źródłowy / brak błędu). Feedback tekstowy tłumaczy sygnały: brak właściwego cytatu = retrieval; cytat poprawny, ale wniosek sprzeczny = generation; cytat poprawny, ale treść w dokumencie błędna = źródłowy. Most do Q44–Q49. | E4 | S2,S3 (S1: P — diagnostyka warstwowa to kompetencja praktyczna/inżynierska) |
| 9 | Pogłębienie inżynierskie: reranking i grounding | treść | Tylko S3. Przesortowanie wyników (*reranking*) po wstępnym retrievalu — poprawa trafności top-k. Ugruntowanie odpowiedzi (*grounding*) i wymuszanie cytatów: jak weryfikować, że każde zdanie odpowiedzi ma oparcie w pobranym fragmencie. Krótko o pomiarach jakości RAG jako zapowiedź M12 (ewaluacja). Bez powtarzania metryk retrievalu z M5. | E1,E4 | S3 (S1: P; S2: P — poza zakresem praktycznym) |
| 10 | Zbuduj pipeline RAG | interakcja | Element interaktywny modułu — patrz sekcja „Element interaktywny". Uczestnik konfiguruje źródła, chunking i top-k dla scenariusza QA na korpusie „SklepDemo" i ogląda odpowiedź z cytatami. Integruje E1, E2, E4. | E1,E2,E4 | S2,S3 (S1: U — w wersji świadomościowej demonstracja „gotowego" pipeline tylko do obejrzenia, bez samodzielnej konfiguracji; konfiguracja opcjonalna) |
| 11 | Quiz inline M6 | quiz-inline | 5–8 z puli Q41–Q50 z natychmiastowym feedbackiem i wyjaśnieniem (tryb nauki). Szczegóły w sekcji „Quiz inline". Pytań krytycznych brak. | E1,E2,E3,E4 | S2,S3 (S1: U — w wersji świadomościowej quiz opcjonalny/nieobowiązkowy do zaliczenia) |
| 12 | Podsumowanie i następny krok | podsumowanie | Skrót czterech wniosków (kolejność pipeline, dobór chunkingu, RAG vs fine-tuning, trzy warstwy błędu). Lista „co potrafię po M6" zmapowana na E1–E4. „Następny krok →": przejście do M7 (prompt engineering) — jak pisać prompt korzystający z pobranego kontekstu. Widoczny postęp procentowy modułu. | E1,E2,E3,E4 | S1,S2,S3 |

**Bilans czasu (orientacyjnie):** 12 ekranów; ekrany treściowe/decyzyjne 4–6 min, ćwiczenia ~5 min, interakcja ~10 min, quiz ~12 min → ≈70 min dla S2/S3. Wersja S1 (ŚWIADOMOŚCIOWA) korzysta z ekranów 1, 2, 6, 7, 12 (+ opcjonalnie 10 jako demo i 11 jako quiz nieobowiązkowy), co skraca moduł do orientacyjnie 25–30 min.

## Element interaktywny — szczegół

**Nazwa:** „Zbuduj pipeline RAG".

**Cel:** uczestnik łączy E1 (kolejność), E2 (chunking) i E4 (czytanie błędów) w jednym przepływie konfiguracyjnym dla scenariusza QA.

**Scenariusz (syntetyczny):** korpus „SklepDemo" — kilka fikcyjnych dokumentów: specyfikacja koszyka (WYM-koszyk), polityka zwrotów (WYM-zwroty), checklisty testów płatności. Pytanie użytkownika: „Jakie jest kryterium akceptacji dla limitu pozycji w koszyku?".

**DANE WEJŚCIOWE (konfiguracja przez uczestnika):**
- **Źródła** — wybór, które dokumenty z korpusu włączyć do indeksu (checkboxy: koszyk / zwroty / płatności).
- **Chunking** — strategia (lista wyboru: po sekcji / stały rozmiar + overlap / po pojedynczym wymaganiu) oraz rozmiar i zazębienie jako pola liczbowe.
- **Top-k** — liczba pobieranych fragmentów (pole liczbowe + suwak natywny, strzałki klawiatury).
- (S3 opcjonalnie) **Reranking** — włącz/wyłącz przesortowanie wyników.

**OUTPUT (system pokazuje):**
- Lista pobranych fragmentów (*retrieval*) z wartością podobieństwa i identyfikatorem źródła — w **tabeli tekstowej**.
- Wygenerowana odpowiedź z **cytatami** wskazującymi fragment źródłowy (np. „[WYM-koszyk §3]").
- Tekstowy komunikat diagnostyczny: czy odpowiedź jest ugruntowana, a jeśli nie — która warstwa zawiodła (retrieval/generation/źródłowy). Np. zbyt małe top-k lub wyłączone właściwe źródło → brak cytatu → błąd retrieval; zły chunking ucinający kryterium → niepełna odpowiedź.

**OBOWIĄZKOWA alternatywa klawiaturowa / niedragowa** (zgodnie z `docs/design-baseline.md`, sekcja 6 — pozycja „Zbuduj pipeline RAG"):
- Brak drag & drop. Kolejność/konfiguracja realizowana przez **listę uporządkowaną z przyciskami „w górę/w dół"** oraz `select`/radio dla wyboru strategii, gdzie dotyczy.
- Wszystkie pola (źródła, chunking, top-k, reranking) w pełni obsługiwalne **klawiaturą**; logiczna kolejność Tab; **widoczny focus** (kontrast ≥ 3:1).
- **Feedback tekstowy** (nie tylko wizualny): wynik retrievalu w tabeli, diagnoza błędu opisana słownie. Komunikaty walidacji (np. top-k = 0) opisane tekstem przy polu (WCAG 3.3.1).
- Reflow bez poziomego scrolla do 320 px; sprawdzane też przy 360 px (desktop + mobile).

## Quiz inline

**Liczba i mapowanie:** Pula modułu: Q41–Q50 (10 pytań) — zasila również test końcowy. Quiz inline: 5–8 pytań losowanych z puli, dobranych do treści widzianej na danej ścieżce (wg `wymagania/07`). Mapowanie zakresów zgodnie z curriculum (`wymagania/06`). Pytań krytycznych brak.

| Zakres | Typ | Sprawdzana kompetencja | Efekt |
|---|---|---|---|
| Q41–Q43 | kolejność procesu (uporządkowanie) | poprawna sekwencja kroków pipeline RAG | E1 |
| Q44–Q46 | jednokrotnego wyboru (single choice) | pojęcia: chunking/overlap, RAG vs fine-tuning, warstwy błędu | E2,E3,E4 |
| Q47–Q49 | scenariusz | zastosowanie w sytuacji QA: dobór chunkingu, decyzja RAG/fine-tuning, rozpoznanie warstwy błędu | E2,E3,E4 |
| Q50 | wielokrotnego wyboru (multiple choice) | rozpoznanie wszystkich poprawnych elementów (np. które sygnały wskazują błąd retrieval; co należy do pipeline) | E1,E4 |

**Tryb:** quiz inline — wynik i wyjaśnienie natychmiast po odpowiedzi (tryb nauki, `docs/design-baseline.md` 2.2). Obsługa klawiaturą i widoczny focus na opcjach.

## Mapowanie na efekty i pytania

| Efekt | Ekrany | Pytania |
|---|---|---|
| E1 — kolejność pipeline RAG | 1, 2, 3, 9, 10, 12 | Q41–Q43, Q50 |
| E2 — chunking dla dokumentacji wymagań | 1, 4, 5, 10, 12 | Q44–Q46 (część), Q47–Q49 (część) |
| E3 — RAG vs fine-tuning | 1, 6, 12 | Q44–Q46 (część), Q47–Q49 (część) |
| E4 — błąd retrieval / generation / źródłowy | 1, 7, 8, 9, 10, 12 | Q44–Q46 (część), Q47–Q49 (część), Q50 |

> Uwaga: dokładny przydział pojedynczych Q (które dokładnie pytanie do którego efektu) w obrębie zakresów Q44–Q49 doprecyzuje moduł autorski pytań / M4 treści; storyboard ustala strukturę i powiązania zakres ↔ efekt ↔ ekran zgodnie z `wymagania/06`.
