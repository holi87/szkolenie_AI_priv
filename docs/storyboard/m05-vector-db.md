# Storyboard — M5: Vector databases i similarity search

| Pole | Wartość |
|---|---|
| Moduł | M5 |
| Czas | 55 min |
| Ścieżki | S1: opcjonalny; S2: opcjonalny; S3: obowiązkowy |
| Element interaktywny | „Retrieval debugger” (debuger wyszukiwania) |
| Pula modułu | Q33–Q40 (8 pytań) — zasila również test końcowy |
| Quiz inline | 5–8 pytań losowanych z puli |

> Storyboard to STRUKTURA ekranów, nie pełna treść. Opisy ekranów są skrótem planu treści (każdy ≤300 słów); pełne teksty powstają w module wdrożeniowym M4 (issue [21]). Wszystkie dane przykładowe są **syntetyczne** — żadnych realnych danych klienta ani PII. Terminy techniczne po polsku, oryginał w nawiasie przy pierwszym użyciu. Każdy ekran ma widoczny postęp procentowy i „następny najlepszy krok →” (zgodnie z `docs/design-baseline.md`).

## Efekty uczenia

- **E1** — Uczestnik opisuje rolę bazy wektorowej (vector database) w wyszukiwaniu semantycznym.
- **E2** — Uczestnik rozróżnia wyszukiwanie dokładne (exact search) od przybliżonego najbliższego sąsiada (approximate nearest neighbor, ANN).
- **E3** — Uczestnik wskazuje wpływ indeksu (index), filtrowania metadanych (metadata filtering) oraz jakości chunków (chunk quality) na wynik wyszukiwania.
- **E4** — Uczestnik diagnozuje, dlaczego similarity search zwrócił fragment podobny, ale nieużyteczny.

## Sekwencja ekranów

| # | Tytuł ekranu | Typ | Cel/treść (skrót, ≤300 słów) | Efekt(y) | Ścieżki/wariant |
|---|---|---|---|---|---|
| 1 | Po co testerowi baza wektorowa? | treść | Cel modułu i dlaczego to ważne dla QA: gdy zespół buduje wyszukiwarkę po dokumentacji testowej albo RAG, jakość odpowiedzi zależy od tego, **co** retrieval w ogóle znalazł. Tester musi umieć ocenić, czy zwrócone fragmenty są trafne, i zdiagnozować, dlaczego nie. Zapowiedź: rola bazy wektorowej, exact vs ANN, indeks/metadane/chunki, debuger wyszukiwania, quiz. | E1 | Wszystkie ścieżki. |
| 2 | Czym jest baza wektorowa | treść | Definicja: baza wektorowa (vector database) przechowuje embeddingi (z M4) i pozwala szybko znaleźć najbardziej podobne. Rola w wyszukiwaniu semantycznym (semantic search): od zapytania → embedding → najbliższe wektory → fragmenty tekstu. Krótko: czym różni się od wyszukiwania po słowach kluczowych. Diagram z opisem tekstowym (WCAG 1.1.1). Syntetyczny przykład: mini-korpus 6 notatek QA. | E1 | Wszystkie ścieżki. |
| 3 | Dokładne czy przybliżone? | decyzja | Jedna decyzja: kiedy wystarczy ANN, a kiedy potrzeba wyszukiwania dokładnego (exact / brute force). Uczestnik wybiera między dwoma scenariuszami (mały korpus, pełna trafność vs duży korpus, szybkość). Krótki feedback prowadzi do ekranu 4. | E2 | Wszystkie ścieżki. |
| 4 | Exact vs ANN — kompromis | treść | Wyjaśnienie: exact przegląda wszystko (dokładne, wolne); ANN używa indeksu, by szukać szybciej kosztem ryzyka pominięcia trafnych wyników. Wprowadza recall (kompletność trafień) i precision (czystość trafień) jako parę miar. Tabela porównawcza z opisem tekstowym. | E2, E3 | S1/S2 (opcjonalny pass świadomościowy): **uproszczony** — sama intuicja „szybciej vs dokładniej”, bez szczegółów indeksu. S3: pełny. |
| 5 | Indeks i jego wpływ | treść | Indeks (index) jako struktura przyspieszająca ANN; parametry indeksu przesuwają punkt między recall a szybkością/precision. Bez matematyki — intuicja na syntetycznym przykładzie. Wskazuje, że „nic nie znaleziono” może być winą indeksu, nie danych. | E3 | S1/S2: **pomijany** w passie świadomościowym (zaawansowane). S3: obowiązkowy. |
| 6 | Filtrowanie metadanych | treść | Metadane (metadata): np. `typ_dokumentu`, `modul`, `wersja` (syntetyczne). Filtrowanie metadanych zawęża zbiór przed/po podobieństwie → podnosi precision, ale zbyt ostry filtr obniża recall (gubi trafne). Przykład: filtr „tylko regresja” wycina pasujący przypadek smoke. | E3 | Wszystkie ścieżki (kluczowe dla diagnozy). |
| 7 | Jakość chunków | treść | Chunk = fragment dokumentu zaindeksowany jako jednostka. Zła granica chunku (urwane zdanie, zlepek dwóch wymagań) daje wektor o rozmytym znaczeniu → podobny, ale bezużyteczny wynik. Krótko: za duży vs za mały chunk. Łączy się z E4. | E3, E4 | S1/S2: **uproszczony** (jedno zdanie intuicji). S3: pełny. |
| 8 | Podobny, ale nieużyteczny — diagnoza | ćwiczenie | Mini-ćwiczenie diagnostyczne (niepunktowane): syntetyczne zapytanie + 3 zwrócone fragmenty z wysokim podobieństwem, z których 2 są bezużyteczne. Uczestnik wybiera przyczynę (zły chunk / brak filtra metadanych / ANN pominął lepszy / podobieństwo ≠ trafność). Tekstowy feedback z linkiem do ekranu źródłowego. Przygotowuje do interakcji. | E4 | Wszystkie ścieżki. |
| 9 | Retrieval debugger | interakcja | Element interaktywny: uczestnik dobiera top-k, filtr metadanych i próg podobieństwa (similarity threshold) na syntetycznym mini-korpusie QA i obserwuje wpływ na recall i precision. Szczegół i alternatywa klawiaturowa — sekcja „Element interaktywny”. | E2, E3, E4 | Wszystkie ścieżki. S1/S2: zachęta do min. 1 przebiegu; bez wymogu eksploracji wszystkich kombinacji. |
| 10 | Quiz inline (5–8 z puli Q33–Q40) | quiz-inline | 5–8 z puli Q33–Q40, natychmiastowy feedback i wyjaśnienie (tryb nauki). Sprawdza E1–E4. Szczegół — sekcja „Quiz inline”. Brak pytań krytycznych w tym module. | E1, E2, E3, E4 | Wszystkie ścieżki. |
| 11 | Podsumowanie i następny krok | podsumowanie | 4–5 zdań: baza wektorowa = co znaleziono; exact vs ANN = kompromis recall/szybkość; indeks, metadane i chunki sterują precision/recall; „podobny ≠ użyteczny”. Następny krok → M6 RAG: jak z dobrego retrieval zbudować odpowiedź z cytatami. | E1, E2, E3, E4 | Wszystkie ścieżki. |

**Liczba ekranów:** 11 (≈5 min/ekran przy 55 min). W passie świadomościowym S1/S2 efektywnie krótszy: ekran 5 pomijany, ekrany 4 i 7 uproszczone.

## Element interaktywny — szczegół

**Nazwa:** „Retrieval debugger” (debuger wyszukiwania) — ekran 9.

**Działanie:** Uczestnik bada syntetyczny mini-korpus dokumentacji QA (np. 12 fragmentów: przypadki testowe, fragmenty wymagań, notatki z retrospektywy — wszystko zmyślone, bez PII). Ustawia parametry retrievalu i widzi, jak zmienia się zestaw zwróconych fragmentów oraz miary jakości. Cel: poczuć kompromis recall ↔ precision i powiązać go z indeksem/metadanymi/chunkami (E3) oraz z diagnozą „podobny, ale nieużyteczny” (E4).

**Dane wejściowe (kontrolki):**
- `top-k` — liczba zwracanych fragmentów (np. 1–10).
- Filtr metadanych — np. `typ_dokumentu` ∈ {wymaganie, przypadek_testowy, notatka}, `modul` (syntetyczne wartości).
- Próg podobieństwa (similarity threshold) — minimalny wynik, by fragment trafił do wyniku.
- Stałe zapytanie referencyjne (syntetyczne), opcjonalnie do wyboru z listy 3 zapytań.

**Output:**
- Lista zwróconych fragmentów z wynikiem podobieństwa i metadanymi.
- Tabela jakości: **precision** i **recall** (uproszczone, liczone względem wbudowanego z góry zbioru „trafnych” dla zapytania).
- Tekstowy komentarz diagnostyczny, np. „Próg za wysoki — utracono 2 trafne fragmenty (recall ↓)” albo „Filtr odciął właściwy moduł (precision ↑, recall ↓)”.

**Alternatywa klawiaturowa / niedragowa (OBOWIĄZKOWA, zgodna z `docs/design-baseline.md` sekcja 6):**
- Brak drag&drop. Wszystkie kontrolki to natywne pola formularza: `top-k` jako `input[type=number]` lub `select`; filtr metadanych jako lista checkboxów/`select`; próg podobieństwa jako `input[type=range]` z dostępnością strzałkami **oraz** towarzyszące pole liczbowe.
- Pełna obsługa klawiaturą (Tab/Shift+Tab, strzałki, Enter/Spacja), brak pułapki fokusu, **widoczny focus** (obrys ≥ 3:1).
- Wynik zawsze jako **tabela tekstowa** precision/recall + lista fragmentów + tekstowy komentarz diagnostyczny — żadna informacja nie jest przekazywana samym kolorem (WCAG 1.4.1).
- Każda zmiana parametru daje natychmiastowy **tekstowy feedback**; etykiety i instrukcje przy polach (WCAG 1.3.1 / 3.3.2).

## Quiz inline

- **Liczba i mapowanie:** Pula modułu: **Q33–Q40** (8 pytań, zgodnie z curriculum, `wymagania/06`) — zasila również test końcowy. Quiz inline: **5–8 pytań** losowanych z puli, dobranych do treści widzianej na danej ścieżce (wg `wymagania/07`).
  - **Q33–Q35** — single choice (jednokrotny wybór): rola bazy wektorowej; exact vs ANN; pojęcia recall/precision/top-k.
  - **Q36–Q37** — multiple choice (wielokrotny wybór): czynniki wpływające na wynik (indeks, filtr metadanych, jakość chunków, próg).
  - **Q38–Q40** — scenariusze retrieval: dana odpowiedź/zestaw zwróconych fragmentów → uczestnik diagnozuje przyczynę nietrafności lub dobiera korektę parametrów.
- **Sprawdzane kompetencje:** rozumienie roli retrievalu (E1), rozróżnienie exact/ANN (E2), wpływ indeksu/metadanych/chunków (E3), diagnoza „podobny ≠ użyteczny” (E4).
- **Tryb:** feedback i wyjaśnienie natychmiast po odpowiedzi (tryb nauki, `docs/design-baseline.md` 4.2). **Brak pytań krytycznych** w tym module.

## Mapowanie na efekty i pytania

| Efekt | Ekrany | Pytania |
|---|---|---|
| **E1** — rola bazy wektorowej | 1, 2 | Q33; (wsparcie scen. Q38–Q40) |
| **E2** — exact vs ANN | 3, 4, 9 | Q34, Q35 |
| **E3** — wpływ indeksu / metadanych / chunków | 5, 6, 7, 9 | Q36, Q37 |
| **E4** — diagnoza „podobny, ale nieużyteczny” | 7, 8, 9 | Q38, Q39, Q40 |

> Każde z pytań Q33–Q40 jest powiązane z co najmniej jednym efektem i co najmniej jednym ekranem treści; każdy efekt jest sprawdzany interaktywnie (ekran 9) i quizem (ekran 10).
