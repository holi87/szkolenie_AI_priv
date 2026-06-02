# Analiza biznesowa szkolenia GenAI i LLM dla QualityCat

## 7. **Specyfikacja systemu testów**

### Cele systemu testów

System testów ma mierzyć nie tylko zapamiętanie pojęć, lecz także zdolność zastosowania wiedzy w decyzjach biznesowych, QA i bezpieczeństwa. Test końcowy musi rozróżniać uczestnika, który zna definicje, od uczestnika, który potrafi bezpiecznie użyć GenAI w pracy.

### Typy pytań

| Typ pytania | Zastosowanie | Przykład ocenianej kompetencji | Punktacja |
|---|---|---|---:|
| Single choice | Definicje, rozróżnienia, najlepsza decyzja | Rozróżnienie RAG vs fine-tuning | 1 pkt |
| Multiple choice | Ryzyka, checklisty, złożone kryteria | Wybór wszystkich danych wymagających anonimizacji | 0–2 pkt; pełne 2 tylko za komplet bez błędów krytycznych |
| Dopasowanie | Pojęcia, parametry, artefakty QA | Dopasowanie temperature/top-p/max tokens do skutku | 0,25 pkt za parę |
| Kolejność procesu | Pipeline techniczny | Ułożenie kroków RAG | 1 pkt za pełną kolejność, 0,5 za jeden błąd sąsiedni |
| Scenariusz decyzyjny | Bezpieczeństwo, QA, governance | Czy wolno wkleić dane klienta do LLM | 2 pkt |
| Analiza outputu | Halucynacje, weryfikacja | Oznaczenie zdań wymagających źródeł | 0–3 pkt według rubryki |
| Mini-zadanie praktyczne | Prompt i ewaluacja | Poprawa promptu lub rubryki judge | 0–5 pkt według rubryki |

### Struktura testów

| Poziom testu | Miejsce w szkoleniu | Cel | Liczba pytań | Wpływ na zaliczenie |
|---|---|---|---:|---:|
| Quiz inline | Po każdym module | Utrwalenie pojęć i szybki feedback | 5–8 z puli modułu | 30% wyniku ścieżki |
| Test końcowy ścieżki | Po ukończeniu wymaganych modułów | Weryfikacja kompetencji ścieżki | S1: 25; S2: 40; S3: 55 | 60% wyniku ścieżki |
| Zadanie praktyczne | Po M7/M8 dla S2, po M12 dla S3 | Sprawdzenie zastosowania | S2: 1 zadanie; S3: 2 zadania | 10% wyniku ścieżki |
| Pytania krytyczne | Głównie M10 | Wymuszenie znajomości zasad bezpieczeństwa | 5 | Warunek konieczny |

### Próg zaliczenia

| Ścieżka | Próg ogólny | Warunek dodatkowy | Liczba podejść `[ZAŁOŻENIE]` |
|---|---:|---|---:|
| S1 | >= 75% | 100% pytań krytycznych z M10 | 3 |
| S2 | >= 78% | 100% pytań krytycznych + min. 4/5 w zadaniu promptowym | 3 |
| S3 | >= 80% | 100% pytań krytycznych + min. 70% w M6 i M12 | 3 |

### Poziomy trudności i kalibracja

| Poziom | Udział w banku | Definicja | Kryterium poprawnego działania pytania |
|---|---:|---|---|
| L1: podstawowy | 35% | Sprawdza rozpoznanie pojęcia lub prostą decyzję | 80–95% poprawnych odpowiedzi w pilotażu |
| L2: zastosowanie | 40% | Wymaga użycia pojęcia w krótkim scenariuszu | 55–80% poprawnych odpowiedzi w pilotażu |
| L3: analiza/ewaluacja | 20% | Wymaga diagnozy przyczyny, oceny ryzyka lub wyboru kompromisu | 35–65% poprawnych odpowiedzi w pilotażu |
| L4: ekspercki | 5% | Wymaga projektowania ewaluacji, RAG lub governance | 20–45% poprawnych odpowiedzi w pilotażu; używane głównie dla S3 |

### Proces kalibracji pytań

1. Każde pytanie otrzymuje metadane: moduł, ścieżka, filar, efekt uczenia, poziom Blooma, poziom trudności, typ pytania, poprawna odpowiedź, uzasadnienie, ryzyko zgadywania.
2. Autor treści tworzy pytanie i uzasadnienie odpowiedzi.
3. Recenzent merytoryczny sprawdza zgodność z efektem uczenia i brak dwuznaczności.
4. Recenzent QA sprawdza, czy pytanie ma jednoznaczny scoring i czy dystraktory są realistyczne.
5. Pytanie trafia do pilotażu na grupie 8–15 osób `[ZAŁOŻENIE]` reprezentujących ścieżki S1–S3.
6. Po pilotażu liczone są: odsetek poprawnych odpowiedzi, czas odpowiedzi, moc dyskryminacyjna, liczba zgłoszeń niejasności.
7. Pytania z odsetkiem poprawnych odpowiedzi poza zakresem dla poziomu trudności są poprawiane albo przenoszone do innego poziomu.
8. Pytania krytyczne z bezpieczeństwa nie mogą być niejasne; jeżeli w pilotażu więcej niż 10% uczestników interpretuje je inaczej niż autor, pytanie wymaga przepisania.

### Golden set pytań wzorcowych

Golden set to zestaw pytań referencyjnych, które mają stabilnie mierzyć kluczowe kompetencje i służyć do kontroli jakości nowych wersji banku pytań.

| Element golden setu | Specyfikacja |
|---|---|
| Wielkość | 24 pytania: po 2 pytania z każdego modułu |
| Skład | 8 pytań L1, 10 pytań L2, 5 pytań L3, 1 pytanie L4 |
| Minimalne pokrycie | Wszystkie trzy filary, wszystkie ścieżki, 5 pytań bezpieczeństwa, 4 pytania QA, 4 pytania techniczne RAG/embeddings/evaluation |
| Zastosowanie | Kalibracja nowych pytań, porównanie wyników między edycjami, kontrola dryfu trudności |
| Dostępność | Golden set nie powinien być stale eksponowany uczestnikom; używany w losowaniu kontrolnym i pilotażach |
| Właściciel | Lead Instructional Designer + Subject Matter Expert GenAI `[ZAŁOŻENIE]` |

### Proces walidacji golden setu

1. Ekspert merytoryczny oznacza pytania jako referencyjne tylko wtedy, gdy mają jednoznaczny efekt uczenia i stabilną odpowiedź niezależną od dostawcy narzędzia.
2. Golden set jest testowany w pilotażu i nie może mieć więcej niż 5% zgłoszeń niejasności.
3. Wynik golden setu jest porównywany między ścieżkami; pytania podstawowe powinny różnicować osoby przygotowane i nieprzygotowane, a nie osoby techniczne i nietechniczne.
4. Co 6 miesięcy `[ZAŁOŻENIE]` golden set jest przeglądany pod kątem aktualności, szczególnie w obszarze OWASP LLM Top 10, governance i narzędzi.
5. Jeżeli pytanie wymaga aktualizacji z powodu zmiany standardu, zostaje oznaczone jako deprecated i zastąpione pytaniem o tej samej kompetencji oraz zbliżonej trudności.

### Pytania kontrolne anti-gaming

| Mechanizm | Cel | Przykład |
|---|---|---|
| Rotacja wariantów | Ograniczenie uczenia się odpowiedzi na pamięć | Ten sam scenariusz danych, inne PII i inna decyzja |
| Pytania odwrócone | Sprawdzenie zrozumienia, nie wzorca | „Którego z poniższych przypadków NIE należy używać z LLM?” |
| Dystraktory realistyczne | Ograniczenie zgadywania | „Wysokie cosine similarity” jako błędna gwarancja prawdziwości |
| Pytania krytyczne | Wymuszenie znajomości bezpieczeństwa | Wklejenie danych klienta do publicznego modelu bez anonimizacji |
| Analiza outputu | Sprawdzenie praktycznej kontroli | Oznaczenie halucynacji w wygenerowanej dokumentacji QA |

### Feedback dla uczestnika

| Sytuacja | Feedback |
|---|---|
| Odpowiedź poprawna | Krótkie uzasadnienie, dlaczego decyzja jest poprawna |
| Odpowiedź błędna | Wyjaśnienie błędu, wskazanie pojęcia i link do fragmentu modułu |
| Pytanie krytyczne błędne | Komunikat: „To jest błąd bezpieczeństwa. Przed zaliczeniem wróć do sekcji higieny danych i prompt injection.” |
| Zadanie promptowe poniżej progu | Rubryka pokazuje brakujące elementy: kontekst, ograniczenia, format, kryteria, bezpieczeństwo |
| Wynik końcowy poniżej progu | Lista modułów do powtórzenia na podstawie najsłabszych kompetencji |
