# Analiza biznesowa szkolenia GenAI i LLM dla QualityCat

## 12. **Założenia i pytania otwarte**

### Zebrane założenia

| ID | Założenie | Miejsce użycia | Łatwość korekty |
|---|---|---|---|
| A1 | QualityCat działa w obszarze QA/jakości | Sekcje 1–4 | Wysoka |
| A2 | Odbiorcami są uczniowie, pracownicy i współpracownicy o zróżnicowanym poziomie technicznym | Sekcje 2–4 | Wysoka |
| A3 | Program ma trzy ścieżki: nietechniczna, praktyk-użytkownik/QA, inżynier/techniczny QA | Sekcje 3–6 | Średnia |
| A4 | Czas ścieżek: S1 3,5–4,5 h, S2 6–7 h, S3 9–10 h | Sekcje 3 i 6 | Wysoka |
| A5 | Cele ilościowe, np. completion rate >= 85%, pass rate 75–90%, NPS >= +30, są wartościami domyślnymi | Sekcje 2 i 10 | Wysoka |
| A6 | Grupa pilotażowa ma 8–15 osób | Sekcje 7 i 9 | Wysoka |
| A7 | Próg zaliczenia: S1 >= 75%, S2 >= 78%, S3 >= 80% | Sekcja 7 | Średnia |
| A8 | Uczestnik ma 3 podejścia do testu | Sekcja 7 | Wysoka |
| A9 | Golden set jest przeglądany co 6 miesięcy | Sekcja 7 | Wysoka |
| A10 | Wersja pilotażowa może działać jako statyczny HTML z localStorage | Sekcja 8 | Średnia |
| A11 | Wariant docelowy może wymagać backendu do raportowania wyników i certyfikatów | Sekcja 8 | Średnia |
| A12 | Certyfikat może być generowany jako ekran lub PDF | Sekcja 8 | Wysoka |
| A13 | Celem dostępności jest WCAG 2.1 AA | Sekcja 8 | Średnia |
| A14 | Jedna sekcja ekranu nie powinna przekraczać 250–300 słów | Sekcja 8 | Wysoka |
| A15 | Minimalna struktura plików i JSON jest propozycją techniczną, nie narzuconym stackiem | Sekcja 8 | Wysoka |
| A16 | Polityka danych QualityCat nie została dostarczona, więc M10 opiera się na konserwatywnym podejściu do PII, IP i danych klienta | Sekcje 6–8, 11 | Średnia |

### Pytania otwarte do sponsora przed startem budowy

| ID | Pytanie | Wpływ na projekt | Wymagane przed fazą |
|---|---|---|---|
| P1 | Czy QualityCat ma formalną politykę użycia narzędzi GenAI? | Treść M10, pytania krytyczne, governance | F2 |
| P2 | Czy szkolenie ma mieć centralne raportowanie wyników, czy wystarczy wersja statyczna? | Architektura HTML i backend | F4 |
| P3 | Czy uczestnicy mają się logować, czy szkolenie ma być anonimowe? | Progres, certyfikat, audyt | F4 |
| P4 | Czy certyfikat ma mieć wartość formalną wewnątrz firmy? | Progi, audyt, identyfikator zaliczenia | F4 |
| P5 | Jakie narzędzia GenAI są dozwolone w QualityCat? | Przykłady, governance, zakazy | F2 |
| P6 | Czy wolno używać przykładów z realnych projektów po anonimizacji? | Jakość scenariuszy i bezpieczeństwo | F2 |
| P7 | Czy szkolenie ma obejmować konkretne narzędzia, np. ChatGPT, Copilot, Gemini, Claude? | Zakres demonstracji i utrzymanie aktualności | F2 |
| P8 | Czy pytania testowe mają być dostępne w trybie nauki po zaliczeniu? | Ryzyko anti-gaming i UX | F4 |
| P9 | Jaki minimalny poziom dostępności jest wymagany formalnie? | UX, testy, koszt implementacji | F4 |
| P10 | Czy QualityCat chce śledzić wyniki per osoba, per grupa, czy tylko status zaliczenia? | Model danych i raporty | F4 |
| P11 | Czy program ma być aktualizowany cyklicznie, np. co 6 miesięcy? | Budżet utrzymania i owner treści | F1 |
| P12 | Czy sponsor akceptuje obowiązkowe pytania krytyczne z bezpieczeństwa jako warunek zaliczenia? | System scoringu i komunikacja do uczestników | F1 |
| P13 | Czy ścieżka S3 ma wymagać zadania praktycznego z projektowania ewaluacji RAG/LLM? | Czas ścieżki i ocena | F2 |
| P14 | Czy w szkoleniu ma być użyty branding QualityCat i własny styl wizualny? | UI, certyfikat, szablony | F4 |
| P15 | Czy szkolenie ma działać offline lub w intranecie? | Architektura dystrybucji | F4 |
