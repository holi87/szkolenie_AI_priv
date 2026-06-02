# Analiza biznesowa szkolenia GenAI i LLM dla QualityCat

## 1. **Streszczenie zarządcze**

QualityCat potrzebuje pełnoskalowego, samodzielnego szkolenia HTML, które ujednolici wiedzę o GenAI i LLM u osób nietechnicznych, praktyków korzystających z narzędzi AI oraz inżynierów/QA budujących lub oceniających rozwiązania oparte o LLM. Problem biznesowy polega na tym, że użycie GenAI bez wspólnego języka, zasad bezpieczeństwa, kryteriów jakości i mierzalnej walidacji prowadzi do niespójnych wyników, ryzyka wycieku danych, błędnych decyzji oraz trudności w ocenie kompetencji uczestników. Proponowanym rozwiązaniem jest modularne szkolenie z trzema ścieżkami, testami sprawdzającymi, interaktywnymi symulacjami oraz mechanizmem zaliczenia opartym o bank pytań i golden set pytań wzorcowych. Program obejmuje trzy filary: techniczny, praktyczne wykorzystanie w pracy oraz bezpieczeństwo i governance. Oczekiwany efekt biznesowy to mierzalne podniesienie kompetencji: uczestnik potrafi dobrać właściwe zastosowanie LLM, rozpoznać ograniczenia, przygotować bezpieczny prompt, zweryfikować wynik i wskazać ryzyka dla danych oraz jakości. Szkolenie ma działać jako materiał decyzyjny, onboardingowy i certyfikacyjny, a nie jako ogólna prezentacja marketingowa. Dokument jest specyfikacją wejściową do budowy HTML, banku pytań, scenariuszy interaktywnych i kryteriów zaliczenia.

## 2. **Kontekst i cele biznesowe**

### Kontekst

- Zleceniodawca: QualityCat — firma działająca w obszarze QA/jakości `[ZAŁOŻENIE]`.
- Odbiorcy: uczniowie, pracownicy i współpracownicy o zróżnicowanym poziomie technicznym `[ZAŁOŻENIE]`.
- Format docelowy: samodzielne szkolenie HTML z quizami inline, testem końcowym, śledzeniem postępu i wynikiem zaliczenia.
- Zakres: fundamenty GenAI i LLM, wykorzystanie w QA/jakości, bezpieczeństwo, higiena danych, governance i weryfikacja wyników.
- Punkt odniesienia dla bezpieczeństwa: OWASP LLM Top 10 2025, gdzie prompt injection jest traktowane jako kluczowe ryzyko aplikacji LLM.
- Punkt odniesienia dla governance: NIST AI RMF Generative AI Profile, który wskazuje podejście do identyfikacji i zarządzania ryzykami GenAI.
- Punkt odniesienia dla efektów uczenia: zrewidowana taksonomia Blooma, wykorzystywana do formułowania mierzalnych efektów przez czasowniki operacyjne.
- Punkt odniesienia dla ewaluacji: model Kirkpatricka, obejmujący reakcję, wiedzę, zachowanie i wynik biznesowy.

### Problem, który rozwiązuje szkolenie

| Obszar problemu | Obecny skutek biznesowy | Docelowa zmiana po szkoleniu |
|---|---:|---|
| Brak wspólnego języka GenAI | Uczestnicy używają pojęć typu LLM, RAG, embeddings i hallucination niespójnie | Uczestnik potrafi przypisać pojęcie do praktycznego zastosowania i ograniczenia |
| Niepewność, kiedy używać LLM | LLM może być używany do zadań wymagających deterministycznej kontroli bez walidacji | Uczestnik potrafi wskazać przypadki użycia i przypadki wykluczenia |
| Ryzyko danych | Możliwe wklejanie PII, danych klienta, kodu lub treści objętych poufnością | Uczestnik stosuje checklistę higieny danych przed użyciem narzędzia GenAI |
| Niska jakość promptów | Wyniki są niepowtarzalne, niekompletne i trudne do sprawdzenia | Uczestnik konstruuje prompt z rolą, kontekstem, kryteriami i formatem wyjścia |
| Brak kryteriów oceny outputu | Output LLM bywa akceptowany bez kontroli | Uczestnik potrafi przeprowadzić weryfikację merytoryczną, źródłową i ryzykową |
| Brak systemu certyfikacji | Sponsor nie ma miary ukończenia i kompetencji | System testów mierzy wiedzę, zastosowanie i decyzje w scenariuszach QA |

### Cele biznesowe programu

| ID | Cel biznesowy | Miernik | Wartość docelowa `[ZAŁOŻENIE]` |
|---|---|---:|---:|
| B1 | Ujednolicić podstawowy słownik GenAI i LLM wśród uczestników | Odsetek uczestników z wynikiem >= 75% w części podstawowej | >= 85% uczestników |
| B2 | Zmniejszyć ryzyko niebezpiecznego użycia danych w narzędziach GenAI | Wynik w scenariuszach higieny danych i PII | >= 90% poprawnych decyzji w pytaniach krytycznych |
| B3 | Podnieść jakość promptów używanych w pracy QA | Ocena zadania praktycznego według rubryki promptu | >= 4/5 punktów średnio |
| B4 | Zwiększyć zdolność rozpoznawania halucynacji i błędnych odpowiedzi | Wynik w scenariuszach weryfikacji outputu | >= 80% poprawnych decyzji |
| B5 | Przygotować inżynierów/QA do świadomej oceny RAG i ewaluacji LLM | Wynik ścieżki inżynierskiej | >= 75% w module RAG i ewaluacji |
| B6 | Dostarczyć sponsorowi audytowalny mechanizm zaliczenia | Raport postępu i wynik testu końcowego | 100% uczestników z zapisem statusu |

## 3. **Analiza odbiorców**

### Segmentacja ścieżek

| Ścieżka | Opis | Główny cel ścieżki | Zakładany czas pełnej ścieżki |
|---|---|---|---:|
| S1: Nietechniczna / decyzyjna | Osoby zarządzające, sponsorzy, koordynatorzy, osoby pracujące z dokumentacją i procesami | Umieć podjąć decyzję, czy i jak używać GenAI bez naruszania zasad jakości i bezpieczeństwa | 3,5–4,5 h |
| S2: Praktyk-użytkownik / QA | Testerzy, analitycy QA, osoby tworzące dokumentację, przypadki testowe, checklisty i analizy | Umieć skutecznie używać LLM w codziennej pracy QA, weryfikować output i stosować higienę danych | 6–7 h |
| S3: Inżynier / automatyzacja / techniczny QA | Automatycy, developerzy, architekci testów, osoby oceniające integracje, RAG, agentów i ewaluację | Umieć ocenić techniczny projekt rozwiązania LLM, RAG, ewaluację i ryzyka integracyjne | 9–10 h |

### Persony odbiorców

| Persona | Typowe role | Poziom wejściowy | Motywacje | Bariery | Priorytetowe moduły |
|---|---|---|---|---|---|
| S1: Nietechniczna / decyzyjna | Manager, sponsor, lider zespołu, osoba operacyjna | Podstawowy, zna narzędzia biurowe i słyszała o ChatGPT | Szybko ocenić ryzyka, zasady użycia i wartość biznesową | Strach przed technicznym żargonem, brak czasu | M1, M2, M8, M9, M10, M11 |
| S2: Praktyk-użytkownik / QA | Tester manualny, analityk QA, analityk biznesowy, dokumentalista | Podstawowy–średni, zna proces testowy i dokumentację | Przyspieszyć pracę, generować lepsze artefakty QA, unikać błędów | Niepewność jakości outputu, trudność w formułowaniu promptów | M1, M2, M3, M7, M8, M9, M10, M11 |
| S3: Inżynier / automatyzacja / techniczny QA | Test Architect, QA Engineer, Automation Engineer, Developer | Średni–zaawansowany technicznie | Rozumieć RAG, embeddings, ewaluację, integracje i ograniczenia agentów | Nadmierne uproszczenia biznesowe, brak technicznych kryteriów jakości | M1–M12, ze szczególnym naciskiem na M4, M5, M6, M12 |

### Mapa filar → moduł

| Filar | Tematy obowiązkowe | Moduły pokrywające temat |
|---|---|---|
| Techniczny | Fundamenty GenAI, różnica LLM vs klasyczny ML | M1 |
| Techniczny | Tokeny, tokenizacja, context window, parametry, transformer | M2 |
| Techniczny | Parametry generacji: temperature, top-p, max tokens | M3 |
| Techniczny | Embeddings, wektory semantyczne, cosine similarity | M4 |
| Techniczny | Vector databases, indeksy, ANN, similarity search, ograniczenia | M5 |
| Techniczny | RAG, chunking, RAG vs fine-tuning | M6 |
| Techniczny | Ewaluacja jakości, LLM-as-a-judge, bias, position bias, golden sets, metryki | M12 |
| Techniczny | Halucynacje: przyczyny, wykrywanie, ograniczanie | M11, M12 |
| Użycie | Prompt engineering, techniki, struktura promptu, few-shot, rola, format wyjścia | M7 |
| Użycie | Zastosowania w QA/jakości: przypadki testowe, analiza, dokumentacja, wsparcie decyzji | M8 |
| Użycie | Integracja narzędzi i agenty | M9 |
| Użycie | Granice zastosowania: kiedy NIE używać LLM | M10, M11 |
| Bezpieczeństwo i governance | Prompt injection, jailbreak, data leakage, PII, OWASP LLM Top 10 | M10 |
| Bezpieczeństwo i governance | Higiena danych, dane wrażliwe, własność intelektualna | M10 |
| Bezpieczeństwo i governance | Zgodność, polityki, akceptowalne użycie, ślad audytowy | M10 |
| Bezpieczeństwo i governance | Weryfikacja wyników, kontrola outputu w QA | M11, M12 |

## 4. **Analiza potrzeb szkoleniowych (TNA)**

### Luki kompetencyjne per ścieżka

| Ścieżka | Stan obecny `[ZAŁOŻENIE]` | Luka kompetencyjna | Stan docelowy | Sposób pomiaru |
|---|---|---|---|---|
| S1 | Uczestnik zna GenAI jako narzędzie tekstowe, ale nie zna ograniczeń | Nie odróżnia zadania bezpiecznego od zadania wymagającego kontroli, nie zna ryzyk danych | Potrafi sklasyfikować przypadek użycia jako: dozwolony, warunkowo dozwolony, niedozwolony | Scenariusze decyzyjne, min. 80% poprawnych decyzji |
| S1 | Uczestnik nie rozumie, dlaczego LLM może się mylić | Brak modelu mentalnego halucynacji i probabilistycznego charakteru odpowiedzi | Potrafi wskazać 3 powody, dla których output wymaga weryfikacji | Quiz po M1/M11 |
| S2 | Uczestnik używa promptów ad hoc | Brak struktury promptu, kryteriów, przykładów i formatów wyjścia | Tworzy prompt z rolą, celem, kontekstem, ograniczeniami, formatem i kryteriami oceny | Zadanie praktyczne oceniane rubryką |
| S2 | Uczestnik generuje testy, ale nie waliduje ich jakości | Brak checklisty kontroli kompletności, ryzyk i traceability | Potrafi ocenić wygenerowane przypadki testowe względem wymagań i ryzyk | Scenariusz QA + pytania multiple choice |
| S3 | Uczestnik zna ogólnie API/narzędzia, ale nie zna ograniczeń RAG | Brak rozróżnienia między retrieval failure, generation failure i problemem chunkingu | Potrafi zdiagnozować błąd RAG na podstawie objawów i logów koncepcyjnych | Case techniczny w M6 |
| S3 | Uczestnik nie ma procesu ewaluacji LLM | Brak golden setu, metryk, kalibracji LLM-as-a-judge | Potrafi zaprojektować minimalny plan ewaluacji dla use case QA | Zadanie projektowe + test końcowy |
| Wszystkie | Brak wspólnego standardu bezpieczeństwa | Niespójne decyzje o PII, danych klienta, kodzie, IP | Stosowanie checklisty higieny danych i zasad akceptowalnego użycia | Pytania krytyczne z wymogiem 100% poprawności |

### Priorytety szkoleniowe

| Priorytet | Obszar | Uzasadnienie | Wymagane moduły |
|---:|---|---|---|
| 1 | Bezpieczeństwo danych i governance | Najwyższy wpływ ryzyka przy masowym użyciu GenAI | M10, M11 |
| 2 | Praktyczne użycie w QA | Bezpośredni wpływ na produktywność i jakość artefaktów | M7, M8 |
| 3 | Fundamenty i ograniczenia LLM | Warunek poprawnej interpretacji wyników | M1, M2, M3 |
| 4 | RAG, embeddings, vector databases | Potrzebne ścieżce technicznej do oceny rozwiązań | M4, M5, M6 |
| 5 | Ewaluacja i mierzenie jakości | Warunek skalowania rozwiązań GenAI w sposób kontrolowany | M12 |

## 5. **Cele i efekty uczenia**

### Nadrzędne efekty programu

Po ukończeniu szkolenia uczestnik:

1. Klasyfikuje zadanie jako odpowiednie, warunkowo odpowiednie lub nieodpowiednie dla LLM, uzasadniając decyzję co najmniej dwoma kryteriami: ryzyko, deterministyczność, dane, weryfikowalność.
2. Buduje prompt zawierający rolę, cel, kontekst, ograniczenia, format wyjścia i kryteria jakości oraz potrafi poprawić prompt po analizie nieudanego outputu.
3. Wskazuje, kiedy similarity search może zwrócić błędny wynik i wyjaśnia przyczynę: zły embedding, złe chunking, brak kontekstu, szum w danych lub ograniczenie ANN.
4. Opisuje pipeline RAG i rozróżnia błąd retrieval od błędu generation na podstawie objawów w odpowiedzi.
5. Wykrywa ryzyka prompt injection, data leakage, PII i nieautoryzowanego użycia danych w scenariuszu pracy.
6. Weryfikuje output LLM przez checklistę: zgodność z wymaganiami, kompletność, źródła, ryzyka, halucynacje, możliwość użycia w QA.
7. Projektuje minimalny test jakości rozwiązania LLM: golden set, kryteria oceny, metryki, próg akceptacji i zasady kalibracji sędziego.

### Mapowanie filar → kompetencja → efekt uczenia

| Filar | Kompetencja | Efekt uczenia z czasownikiem operacyjnym | Poziom Blooma |
|---|---|---|---|
| Techniczny | Rozumienie GenAI | Rozróżnia model generatywny, LLM i klasyczny model ML na podstawie wejścia, wyjścia i sposobu użycia | Rozumienie |
| Techniczny | Tokenizacja | Oblicza wpływ długości wejścia na context window w uproszczonym scenariuszu | Zastosowanie |
| Techniczny | Parametry generacji | Dobiera temperature, top-p i max tokens do zadania kreatywnego, analitycznego i formalnego | Zastosowanie |
| Techniczny | Embeddings | Wskazuje przypadek, w którym podobieństwo semantyczne nie oznacza poprawności merytorycznej | Analiza |
| Techniczny | Vector databases | Identyfikuje ograniczenia ANN i similarity search w scenariuszu wyszukiwania wiedzy | Analiza |
| Techniczny | RAG | Projektuje uproszczony pipeline RAG dla dokumentacji QA z chunkingiem i źródłami | Tworzenie |
| Techniczny | Ewaluacja | Definiuje golden set i metryki dla wybranego use case | Tworzenie |
| Użycie | Prompt engineering | Konstruuje prompt spełniający rubrykę 5 elementów jakości | Tworzenie |
| Użycie | QA use cases | Generuje i ocenia przypadki testowe pod kątem wymagań, ryzyk i duplikatów | Ewaluacja |
| Użycie | Granice użycia | Odrzuca użycie LLM, gdy wynik wymaga pełnej deterministyczności lub nie ma możliwości walidacji | Ewaluacja |
| Bezpieczeństwo | Higiena danych | Klasyfikuje dane jako bezpieczne, wymagające anonimizacji albo niedozwolone do wklejenia | Zastosowanie |
| Bezpieczeństwo | Prompt injection | Rozpoznaje ukrytą instrukcję w danych wejściowych i wybiera bezpieczną reakcję | Analiza |
| Governance | Weryfikacja outputu | Stosuje checklistę kontroli wyniku przed użyciem w artefakcie QA | Zastosowanie |

## 6. **Program / curriculum**

### M1. Fundamenty GenAI i LLM

| Pole | Specyfikacja |
|---|---|
| Nazwa | Fundamenty GenAI: czym jest model generatywny i czym LLM różni się od klasycznego ML |
| Poziom | Podstawowy |
| Czas | 35 min |
| Ścieżki | S1: obowiązkowy; S2: obowiązkowy; S3: obowiązkowy |
| Efekty uczenia | Uczestnik rozróżnia GenAI, LLM i klasyczny ML na 5 przykładach; wskazuje, że LLM generuje najbardziej prawdopodobną odpowiedź, a nie gwarantowaną prawdę; klasyfikuje 6 zadań jako generatywne, klasyfikacyjne lub deterministyczne |
| Kluczowe pojęcia | GenAI, LLM, klasyczny ML, probabilistyczny output, training vs inference, halucynacja jako błędny lub nieuzasadniony wynik |
| Element interaktywny | „Klasyfikator zadań”: uczestnik przeciąga przykłady zadań do kategorii: LLM, klasyczny ML, system regułowy, człowiek/ekspert |
| Liczba pytań testowych | 8 |
| Mapowanie na pytania | Q1–Q4: single choice; Q5–Q6: dopasowanie; Q7–Q8: scenariusz decyzyjny |

### M2. Architektura LLM na poziomie praktycznym

| Pole | Specyfikacja |
|---|---|
| Nazwa | Tokeny, tokenizacja, context window, parametry i transformer — intuicja działania LLM |
| Poziom | Podstawowy dla S1/S2; średni dla S3 |
| Czas | 45 min |
| Ścieżki | S1: obowiązkowy w wersji skróconej; S2: obowiązkowy; S3: obowiązkowy |
| Efekty uczenia | Uczestnik wyjaśnia, czym jest token i dlaczego długi dokument może przekroczyć context window; wskazuje 3 skutki zbyt małego kontekstu; opisuje transformer jako mechanizm uczenia relacji między tokenami na poziomie intuicyjnym; rozpoznaje, że liczba parametrów nie jest samodzielną gwarancją jakości |
| Kluczowe pojęcia | Token, tokenizacja, context window, parameters, transformer, attention, inference cost |
| Element interaktywny | „Licznik kontekstu”: symulacja skracania dokumentu, w której uczestnik widzi, które fragmenty wypadają z context window i jakie pytania przestają być możliwe do poprawnej odpowiedzi |
| Liczba pytań testowych | 9 |
| Mapowanie na pytania | Q9–Q11: single choice; Q12–Q13: multiple choice; Q14–Q15: kolejność procesu; Q16–Q17: scenariusz |

### M3. Parametry generacji i kontrola wyniku

| Pole | Specyfikacja |
|---|---|
| Nazwa | Temperature, top-p i max tokens — wpływ parametrów na output |
| Poziom | Podstawowy/średni |
| Czas | 30 min |
| Ścieżki | S1: opcjonalny; S2: obowiązkowy; S3: obowiązkowy |
| Efekty uczenia | Uczestnik dobiera temperature do zadania kreatywnego i formalnego; wskazuje ryzyko zbyt wysokiej losowości w zadaniach QA; rozpoznaje, kiedy max tokens ucina odpowiedź; porównuje dwa ustawienia generacji i wybiera bezpieczniejsze dla dokumentacji testowej |
| Kluczowe pojęcia | Temperature, top-p, max tokens, deterministyczność pozorna, powtarzalność, kreatywność |
| Element interaktywny | „Suwaki generacji”: uczestnik zmienia temperature i max tokens, a symulowany output pokazuje różnice w formalności, kompletności i ryzyku błędów |
| Liczba pytań testowych | 7 |
| Mapowanie na pytania | Q18–Q21: single choice; Q22–Q23: dopasowanie parametr→skutek; Q24: scenariusz |

### M4. Embeddings i podobieństwo semantyczne

| Pole | Specyfikacja |
|---|---|
| Nazwa | Embeddings: wektory semantyczne, cosine similarity i ograniczenia podobieństwa |
| Poziom | Średni |
| Czas | 50 min |
| Ścieżki | S1: opcjonalny; S2: opcjonalny rozszerzony; S3: obowiązkowy |
| Efekty uczenia | Uczestnik wyjaśnia embeddings jako liczbową reprezentację znaczenia tekstu; interpretuje cosine similarity jako miarę bliskości kierunku wektorów; wskazuje 4 przypadki, w których wysoki wynik podobieństwa nie oznacza poprawnej odpowiedzi; dobiera przykładowe zapytanie do wyszukiwania semantycznego |
| Kluczowe pojęcia | Embeddings, vector, semantic similarity, cosine similarity, embedding model, nearest neighbors |
| Element interaktywny | „Mapa semantyczna”: uczestnik przesuwa zapytania i dokumenty na uproszczonej mapie 2D, obserwując, które fragmenty są podobne semantycznie, ale niekoniecznie poprawne biznesowo |
| Liczba pytań testowych | 8 |
| Mapowanie na pytania | Q25–Q27: single choice; Q28–Q30: multiple choice; Q31–Q32: scenariusz diagnostyczny |

### M5. Vector databases i similarity search

| Pole | Specyfikacja |
|---|---|
| Nazwa | Bazy wektorowe: indeksy, ANN, similarity search i ograniczenia retrieval |
| Poziom | Średni/zaawansowany |
| Czas | 55 min |
| Ścieżki | S1: opcjonalny; S2: opcjonalny; S3: obowiązkowy |
| Efekty uczenia | Uczestnik opisuje rolę vector database w wyszukiwaniu semantycznym; rozróżnia dokładne wyszukiwanie od approximate nearest neighbor; wskazuje wpływ indeksu, filtrowania metadanych i jakości chunków na wynik; diagnozuje, dlaczego similarity search zwrócił fragment podobny, ale nieużyteczny |
| Kluczowe pojęcia | Vector database, ANN, index, similarity search, metadata filtering, recall, precision, top-k |
| Element interaktywny | „Retrieval debugger”: uczestnik wybiera top-k, filtr metadanych i próg podobieństwa, a system pokazuje wpływ na recall i precision w mini-korpusie dokumentacji QA |
| Liczba pytań testowych | 8 |
| Mapowanie na pytania | Q33–Q35: single choice; Q36–Q37: multiple choice; Q38–Q40: scenariusze retrieval |

### M6. RAG: Retrieval-Augmented Generation

| Pole | Specyfikacja |
|---|---|
| Nazwa | RAG: pipeline, chunking, źródła, odpowiedzi z kontekstem i RAG vs fine-tuning |
| Poziom | Średni/zaawansowany |
| Czas | 70 min |
| Ścieżki | S1: opcjonalny w wersji świadomościowej; S2: obowiązkowy w wersji praktycznej; S3: obowiązkowy pełny |
| Efekty uczenia | Uczestnik układa kroki pipeline RAG w poprawnej kolejności; dobiera strategię chunking dla dokumentacji wymagań; rozróżnia przypadek wymagający RAG od przypadku wymagającego fine-tuning; identyfikuje błąd retrieval, błąd generation i błąd źródłowy na podstawie odpowiedzi modelu |
| Kluczowe pojęcia | RAG, retrieval, generation, chunking, overlap, reranking, citations, grounding, fine-tuning |
| Element interaktywny | „Zbuduj pipeline RAG”: uczestnik konfiguruje źródła, chunking, top-k i odpowiedź z cytatami dla scenariusza QA |
| Liczba pytań testowych | 10 |
| Mapowanie na pytania | Q41–Q43: kolejność procesu; Q44–Q46: single choice; Q47–Q49: scenariusz; Q50: multiple choice |

### M7. Prompt engineering w praktyce

| Pole | Specyfikacja |
|---|---|
| Nazwa | Prompt engineering: struktura promptu, role, few-shot, ograniczenia i format wyjścia |
| Poziom | Podstawowy/średni |
| Czas | 65 min |
| Ścieżki | S1: obowiązkowy w wersji skróconej; S2: obowiązkowy; S3: obowiązkowy |
| Efekty uczenia | Uczestnik tworzy prompt zawierający rolę, cel, kontekst, dane wejściowe, ograniczenia, kryteria jakości i format wyjścia; poprawia nieprecyzyjny prompt na podstawie błędnego outputu; stosuje few-shot, gdy format lub styl odpowiedzi musi być powtarzalny; wskazuje, kiedy prompt nie rozwiąże problemu braku danych |
| Kluczowe pojęcia | Prompt, rola, kontekst, few-shot, constraints, output format, rubryka oceny promptu |
| Element interaktywny | „Prompt clinic”: uczestnik poprawia 3 wadliwe prompty i otrzymuje feedback według rubryki: kompletność, bezpieczeństwo, weryfikowalność, format, ograniczenia |
| Liczba pytań testowych | 10 |
| Mapowanie na pytania | Q51–Q53: single choice; Q54–Q56: multiple choice; Q57–Q60: zadania scenariuszowe |

### M8. Zastosowania GenAI w QA i jakości

| Pole | Specyfikacja |
|---|---|
| Nazwa | Praktyczne zastosowania w QA: przypadki testowe, analiza, dokumentacja i wsparcie decyzji |
| Poziom | Średni |
| Czas | 75 min |
| Ścieżki | S1: opcjonalny; S2: obowiązkowy; S3: obowiązkowy |
| Efekty uczenia | Uczestnik generuje przypadki testowe z wymagania i wskazuje braki w pokryciu; wykrywa duplikaty i testy pozorne; tworzy checklistę ryzyk dla funkcjonalności; ocenia, czy output LLM nadaje się do dokumentacji QA po kontroli merytorycznej; wskazuje zadania QA, gdzie LLM pełni funkcję asystenta, a nie decydenta |
| Kluczowe pojęcia | Test case generation, test data ideas, risk-based testing, traceability, acceptance criteria, review checklist |
| Element interaktywny | „QA workbench”: uczestnik dostaje wymaganie i output LLM, następnie oznacza brakujące testy, błędne założenia, ryzyka i elementy wymagające weryfikacji |
| Liczba pytań testowych | 12 |
| Mapowanie na pytania | Q61–Q64: scenariusz QA; Q65–Q68: multiple choice; Q69–Q72: dopasowanie artefakt→ryzyko |

### M9. Integracje narzędzi i agenty

| Pole | Specyfikacja |
|---|---|
| Nazwa | Integracja narzędzi i agenty: możliwości, ograniczenia i kontrola działania |
| Poziom | Średni |
| Czas | 45 min |
| Ścieżki | S1: opcjonalny świadomościowo; S2: opcjonalny; S3: obowiązkowy |
| Efekty uczenia | Uczestnik rozróżnia chatbot, workflow z narzędziem i agenta wykonującego kroki; wskazuje ryzyka nadania agentowi dostępu do plików, maila, repozytorium lub systemu testowego; projektuje minimalną zasadę kontroli: uprawnienia, logi, zatwierdzanie człowieka, rollback; identyfikuje zadania, w których agent wymaga ograniczeń i audytu |
| Kluczowe pojęcia | Tool use, agent, workflow, human-in-the-loop, permission scope, audit log, rollback |
| Element interaktywny | „Agent permission board”: uczestnik nadaje agentowi uprawnienia dla 5 zadań i musi zminimalizować ryzyko przez ograniczenia dostępu |
| Liczba pytań testowych | 8 |
| Mapowanie na pytania | Q73–Q75: single choice; Q76–Q78: scenariusz uprawnień; Q79–Q80: multiple choice |

### M10. Bezpieczeństwo, higiena danych i governance

| Pole | Specyfikacja |
|---|---|
| Nazwa | Prompt injection, jailbreak, data leakage, PII, OWASP LLM Top 10 i zasady korzystania |
| Poziom | Podstawowy/średni |
| Czas | 80 min |
| Ścieżki | S1: obowiązkowy; S2: obowiązkowy; S3: obowiązkowy |
| Efekty uczenia | Uczestnik rozpoznaje prompt injection i jailbreak w scenariuszu; klasyfikuje dane jako dozwolone, wymagające anonimizacji albo niedozwolone; wskazuje ryzyko data leakage i PII; stosuje politykę akceptowalnego użycia; określa minimalny ślad audytowy dla użycia GenAI w procesie QA |
| Kluczowe pojęcia | Prompt injection, jailbreak, data leakage, PII, IP, acceptable use, audit trail, OWASP LLM Top 10 |
| Element interaktywny | „Data safety gate”: uczestnik decyduje, czy wolno wkleić fragment danych do LLM, czy trzeba go zanonimizować, czy użycie jest zakazane |
| Liczba pytań testowych | 14, w tym 5 pytań krytycznych wymagających poprawnej odpowiedzi |
| Mapowanie na pytania | Q81–Q85: pytania krytyczne; Q86–Q90: scenariusze bezpieczeństwa; Q91–Q94: multiple choice |

### M11. Halucynacje, granice zastosowania i weryfikacja outputu

| Pole | Specyfikacja |
|---|---|
| Nazwa | Halucynacje i kontrola wyników: kiedy nie używać LLM i jak weryfikować odpowiedź |
| Poziom | Podstawowy/średni |
| Czas | 60 min |
| Ścieżki | S1: obowiązkowy; S2: obowiązkowy; S3: obowiązkowy |
| Efekty uczenia | Uczestnik wskazuje przyczyny halucynacji: brak danych, konflikt danych, presja promptu, nieaktualny kontekst, nieprecyzyjne źródła; stosuje checklistę weryfikacji outputu; odrzuca użycie LLM, gdy nie można sprawdzić wyniku lub gdy błąd ma wysoki wpływ; oznacza fragmenty odpowiedzi wymagające źródła lub eksperta |
| Kluczowe pojęcia | Hallucination, verification, source checking, confidence, critical decision, human review |
| Element interaktywny | „Output verifier”: uczestnik analizuje odpowiedź LLM i oznacza zdania jako: poprawne, nieuzasadnione, wymagające źródła, ryzykowne, do odrzucenia |
| Liczba pytań testowych | 10 |
| Mapowanie na pytania | Q95–Q98: scenariusz weryfikacji; Q99–Q101: single choice; Q102–Q104: multiple choice |

### M12. Ewaluacja jakości LLM i RAG

| Pole | Specyfikacja |
|---|---|
| Nazwa | Ewaluacja: LLM-as-a-judge, golden set, kalibracja, bias, metryki i decyzje jakościowe |
| Poziom | Zaawansowany |
| Czas | 90 min |
| Ścieżki | S1: opcjonalny; S2: opcjonalny rozszerzony; S3: obowiązkowy |
| Efekty uczenia | Uczestnik definiuje golden set dla wybranego use case; dobiera metryki: accuracy, faithfulness, groundedness, relevance, completeness; projektuje rubrykę LLM-as-a-judge; wskazuje ryzyka bias, position bias i niezgodności z oceną ludzką; kalibruje ocenę automatyczną przez porównanie z oceną eksperta; ustala próg akceptacji jakości |
| Kluczowe pojęcia | LLM-as-a-judge, golden set, evaluation rubric, bias, position bias, inter-rater agreement, groundedness, faithfulness |
| Element interaktywny | „Judge calibration lab”: uczestnik porównuje oceny człowieka i LLM-as-a-judge, wykrywa rozjazdy i poprawia rubrykę oceny |
| Liczba pytań testowych | 12 |
| Mapowanie na pytania | Q105–Q108: single choice; Q109–Q112: multiple choice; Q113–Q116: scenariusz ewaluacji |

### Zbiorcze pokrycie pytań

| Moduł | Liczba pytań | Udział pytań scenariuszowych | Pytania krytyczne |
|---|---:|---:|---:|
| M1 | 8 | 25% | 0 |
| M2 | 9 | 22% | 0 |
| M3 | 7 | 14% | 0 |
| M4 | 8 | 25% | 0 |
| M5 | 8 | 38% | 0 |
| M6 | 10 | 30% | 0 |
| M7 | 10 | 40% | 0 |
| M8 | 12 | 67% | 0 |
| M9 | 8 | 38% | 0 |
| M10 | 14 | 36% | 5 |
| M11 | 10 | 40% | 0 |
| M12 | 12 | 33% | 0 |
| Razem | 116 | ok. 36% | 5 |

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

## 8. **Specyfikacja interaktywnego szkolenia HTML**

### Wymagane funkcje

| Funkcja | Wymaganie minimalne | Kryterium akceptacji |
|---|---|---|
| Nawigacja modułowa | Menu boczne lub górne z modułami i statusem ukończenia | Uczestnik widzi ukończone, aktywne i zablokowane sekcje |
| Ścieżki użytkownika | Wybór S1/S2/S3 na początku szkolenia | System pokazuje moduły obowiązkowe i opcjonalne dla wybranej ścieżki |
| Progres | Zapisywanie postępu lokalnie lub w backendzie `[ZAŁOŻENIE]` | Po odświeżeniu strony uczestnik wraca do ostatniego miejsca |
| Quiz inline | Pytania po sekcjach i modułach | Wynik i feedback pojawiają się od razu po odpowiedzi |
| Test końcowy | Losowanie pytań z banku według ścieżki i trudności | Każdy test ma właściwą liczbę pytań i udział poziomów trudności |
| Scoring | Liczenie punktów, progu, pytań krytycznych i zadań praktycznych | Wynik końcowy pokazuje: %, status, słabe obszary |
| Certyfikat/zaliczenie | Generowany ekran lub PDF zaliczenia `[ZAŁOŻENIE]` | Certyfikat zawiera imię, ścieżkę, datę, wynik i ID zaliczenia |
| Responsywność | Działanie na desktopie, tablecie i telefonie | Brak poziomego scrolla dla szerokości 360 px |
| Dostępność | WCAG 2.1 AA jako cel `[ZAŁOŻENIE]` | Nawigacja klawiaturą, kontrast, tekst alternatywny, focus states |
| Brak backendu | Możliwa wersja statyczna z localStorage `[ZAŁOŻENIE]` | Szkolenie działa z plików statycznych lub hostingu bez serwera |
| Opcjonalny backend | API do zapisu wyników i certyfikatów `[ZAŁOŻENIE]` | Wyniki są zapisywane centralnie i możliwe do eksportu CSV |

### Zakres zależności od backendu

| Wariant | Zakres | Zalety | Ograniczenia | Rekomendacja |
|---|---|---|---|---|
| Wariant A: statyczny HTML + JS + localStorage | Progres i wynik zapisane lokalnie | Szybka budowa, brak infrastruktury | Brak centralnego raportowania, łatwiejsze manipulowanie wynikiem | Dobry dla pilotażu |
| Wariant B: statyczny HTML + eksport wyniku | Lokalny wynik + pobieralny plik JSON/CSV/PDF | Nadal prosty, daje artefakt zaliczenia | Sponsor musi zebrać wyniki ręcznie | Dobry dla małej grupy |
| Wariant C: backend wyników | Logowanie, zapis progresu, wyniki, certyfikaty, raporty | Audytowalność i raportowanie | Większy koszt i czas | Rekomendowany dla rollout firmowego |

### Elementy interaktywne do zbudowania

| Element | Moduł | Opis działania | Dane wejściowe | Output |
|---|---|---|---|---|
| Klasyfikator zadań | M1 | Drag & drop przykładów zadań do kategorii | Lista 12 zadań | Wynik + uzasadnienie |
| Licznik kontekstu | M2 | Symulacja context window i utraty fragmentów | Tekst wymagań + limit tokenów | Pokazanie, które pytania tracą podstawę |
| Suwaki generacji | M3 | Zmiana parametrów wpływa na przykładowy output | Temperature, top-p, max tokens | Porównanie outputów |
| Mapa semantyczna | M4 | Wizualizacja embeddings 2D | Zapytania i fragmenty tekstu | Najbliższe semantycznie fragmenty |
| Retrieval debugger | M5 | Zmiana top-k i filtrów | Mini-korpus QA | Precision/recall w uproszczeniu |
| Zbuduj pipeline RAG | M6 | Układanie pipeline i konfiguracja chunking | Dokumentacja wymagań | Ocena konfiguracji |
| Prompt clinic | M7 | Poprawa promptów według rubryki | Wadliwe prompty | Feedback element po elemencie |
| QA workbench | M8 | Ocena wygenerowanych przypadków testowych | Wymaganie + output LLM | Braki, ryzyka, duplikaty |
| Agent permission board | M9 | Nadawanie uprawnień agentowi | Zadania i systemy | Ocena ryzyka i kontroli |
| Data safety gate | M10 | Decyzja o danych | Próbki danych | Dozwolone / anonimizuj / zakazane |
| Output verifier | M11 | Oznaczanie zdań outputu | Odpowiedź LLM | Kategorie ryzyka |
| Judge calibration lab | M12 | Porównanie ocen człowieka i LLM-as-a-judge | Odpowiedzi i rubryka | Rozjazdy, bias, poprawiona rubryka |

### Wymagania UX

| Obszar | Wymaganie |
|---|---|
| Język | Całość po polsku; terminy techniczne w oryginale z krótką definicją przy pierwszym użyciu |
| Struktura ekranu | Jeden ekran = jedna decyzja lub jedna koncepcja; bez ścian tekstu dłuższych niż 250–300 słów `[ZAŁOŻENIE]` |
| Feedback | Feedback natychmiastowy po ćwiczeniu, z linkiem do powiązanej sekcji |
| Tryb nauki | Uczestnik może podejrzeć wyjaśnienie po quizie inline |
| Tryb testu | W teście końcowym brak podpowiedzi do czasu zakończenia podejścia |
| Dostępność | Każda interakcja musi mieć alternatywę klawiaturową; drag & drop musi mieć wariant listy wyboru |
| Czytelność | Tabele i diagramy muszą mieć wersję tekstową albo opis alternatywny |
| Motywacja | Pokazywać postęp procentowy i „następny najlepszy krok” |
| Bezpieczeństwo | Przykłady danych muszą być syntetyczne; brak prawdziwych danych klientów |

### Minimalna struktura plików HTML `[ZAŁOŻENIE]`

```text
/genai-llm-training
  index.html
  /assets
    styles.css
    app.js
    quiz-engine.js
    progress-store.js
    certificate.js
  /data
    modules.json
    questions.json
    golden-set.json
    scenarios.json
  /modules
    m01-fundamenty.html
    m02-architektura.html
    m03-parametry.html
    m04-embeddings.html
    m05-vector-db.html
    m06-rag.html
    m07-prompt-engineering.html
    m08-qa-use-cases.html
    m09-agents.html
    m10-security-governance.html
    m11-verification.html
    m12-evaluation.html
```

### Minimalny model danych pytania `[ZAŁOŻENIE]`

```json
{
  "id": "Q081",
  "module": "M10",
  "pillar": "security_governance",
  "paths": ["S1", "S2", "S3"],
  "difficulty": "L2",
  "bloom": "analysis",
  "type": "scenario_single_choice",
  "isCritical": true,
  "learningOutcome": "Klasyfikuje dane jako dozwolone, wymagające anonimizacji albo niedozwolone",
  "prompt": "Uczestnik chce wkleić do publicznego narzędzia LLM fragment zgłoszenia zawierający imię, nazwisko, e-mail i numer klienta. Co powinien zrobić?",
  "options": [
    { "id": "A", "text": "Wkleić bez zmian, jeśli celem jest analiza błędu" },
    { "id": "B", "text": "Zanonimizować dane albo użyć zatwierdzonego narzędzia z odpowiednimi kontrolami" },
    { "id": "C", "text": "Dodać do promptu prośbę, aby model nie zapamiętywał danych" },
    { "id": "D", "text": "Wkleić tylko wtedy, gdy model odpowie, że dane są bezpieczne" }
  ],
  "correct": ["B"],
  "points": 2,
  "feedbackCorrect": "Poprawnie: dane identyfikujące osobę wymagają anonimizacji lub zatwierdzonego środowiska.",
  "feedbackIncorrect": "To błąd bezpieczeństwa: sam prompt nie jest kontrolą ochrony danych.",
  "references": ["M10.2", "M10.4"]
}
```

## 9. **Plan wdrożenia i harmonogram**

### Fazy wdrożenia

| Faza | Czas `[ZAŁOŻENIE]` | Zakres | Produkty | Role |
|---|---:|---|---|---|
| F1. Doprecyzowanie zakresu | 3–5 dni roboczych | Potwierdzenie ścieżek, zasad QualityCat, polityki danych i formy hostingu | Zatwierdzona karta projektu, lista założeń, decyzja backend/statyczny | Sponsor, BA, L&D Architect, SME GenAI |
| F2. Projekt szczegółowy treści | 7–10 dni | Storyboard modułów, efekty uczenia, scenariusze interaktywne | Storyboard 12 modułów, mapa efektów, rubryki | L&D Architect, SME, QA Reviewer |
| F3. Budowa treści i banku pytań | 12–18 dni | Teksty modułów, ćwiczenia, pytania, feedback | Treść HTML-ready, questions.json, golden-set.json | Content Designer, SME, Test Designer |
| F4. Implementacja HTML | 12–20 dni | Frontend, quiz engine, progres, interakcje | Działająca wersja alpha | Frontend Developer, UX Designer |
| F5. Recenzja merytoryczna i QA | 5–8 dni | Testy treści, pytań, UX, dostępności | Lista poprawek, raport QA | SME, QA, Accessibility Reviewer |
| F6. Pilotaż | 5–7 dni | Uruchomienie na grupie testowej 8–15 osób `[ZAŁOŻENIE]` | Wyniki pilotażu, kalibracja pytań | Sponsor, Pilot Users, BA |
| F7. Poprawki i rollout | 5–10 dni | Poprawki po pilotażu, finalny pakiet | Wersja 1.0, instrukcja uruchomienia, raport | Zespół wykonawczy, Sponsor |

### Kamienie milowe

| Milestone | Kryterium ukończenia |
|---|---|
| M0: Decyzja projektowa | Sponsor zatwierdza ścieżki, zakres i wariant techniczny |
| M1: Curriculum freeze | Moduły, efekty uczenia i mapa pytań zatwierdzone |
| M2: Question bank alpha | Min. 116 pytań z metadanymi i feedbackiem |
| M3: HTML alpha | Wszystkie moduły działają, quizy inline liczą wynik |
| M4: Golden set validated | Golden set przechodzi recenzję i pilotaż |
| M5: Pilot complete | Zebrane dane: wyniki, czas, błędy, feedback |
| M6: Release 1.0 | Szkolenie opublikowane i gotowe do użycia |

### Role i odpowiedzialności

| Rola | Odpowiedzialność |
|---|---|
| Sponsor QualityCat | Zatwierdza cele, zakres, polityki, próg zaliczenia i rollout |
| Business Analyst | Utrzymuje wymagania, założenia, ryzyka, decyzje i akceptację |
| L&D Architect | Projektuje strukturę modułów, efekty uczenia, mierzenie i ewaluację |
| SME GenAI/LLM | Waliduje treści techniczne, RAG, embeddings, ewaluację i bezpieczeństwo |
| QA/Test Designer | Projektuje pytania, scoring, kalibrację, golden set i testy anti-gaming |
| UX Designer | Projektuje interakcje, dostępność i czytelność szkolenia |
| Frontend Developer | Implementuje HTML, JS, quiz engine, progres, certyfikat |
| Security/Governance Reviewer | Waliduje zasady danych, PII, prompt injection, acceptable use |
| Pilot Users | Testują zrozumiałość, czas, trudność i UX |

### Zależności

| Zależność | Wpływ | Decyzja wymagana przed |
|---|---|---|
| Polityka danych QualityCat | Kształt M10 i pytań krytycznych | F2 |
| Decyzja backend vs statyczny HTML | Architektura progresu i raportowania | F4 |
| Branding QualityCat | Wygląd certyfikatu i UI | F4 |
| Lista narzędzi GenAI dozwolonych w firmie | Przykłady i governance | F2 |
| Wymagany poziom audytu | Zakres logów i raportów | F4 |

## 10. **Metryki sukcesu i ewaluacja**

### KPI szkolenia

| KPI | Definicja | Pomiar | Cel `[ZAŁOŻENIE]` |
|---|---|---|---:|
| Completion rate | Odsetek osób, które ukończyły wymaganą ścieżkę | Status ukończenia | >= 85% |
| Pass rate | Odsetek osób z wynikiem powyżej progu | Test końcowy | 75–90%; powyżej 95% oznacza zbyt łatwy test |
| Critical safety pass | Odsetek osób z 100% pytań krytycznych | M10/test końcowy | 100% wśród zaliczonych |
| Knowledge gain | Różnica pre-test vs post-test | Test 15 pytań przed i po | +25 p.p. średnio |
| Retention | Wynik testu po 30 dniach | Follow-up quiz | >= 70% pierwotnego wyniku |
| Prompt quality | Wynik zadania promptowego | Rubryka 0–5 | >= 4/5 dla S2 i S3 |
| RAG/evaluation readiness | Wynik techniczny S3 | M6 + M12 | >= 75% |
| NPS szkolenia | Rekomendacja szkolenia | Ankieta po szkoleniu | >= +30 |
| Time to complete | Realny czas ukończenia | Dane progresu | +/- 20% względem założeń |

### Model ewaluacji efektywności według Kirkpatricka

| Poziom | Co mierzymy | Narzędzia | Kiedy | Kryterium sukcesu `[ZAŁOŻENIE]` |
|---|---|---|---|---:|
| 1. Reakcja | Czy szkolenie było zrozumiałe, przydatne i adekwatne | Ankieta, NPS, pytania o moduły | Bezpośrednio po szkoleniu | NPS >= +30, średnia przydatność >= 4/5 |
| 2. Wiedza | Czy uczestnik potrafi zastosować pojęcia i decyzje | Quizy, test końcowy, zadania praktyczne | W trakcie i na końcu | Progi zaliczenia S1/S2/S3 |
| 3. Zachowanie | Czy uczestnik zmienił sposób używania GenAI w pracy | Ankieta po 30 dniach, przegląd przykładów promptów, checklisty QA | 30–60 dni po szkoleniu | >= 60% deklaruje użycie checklisty w realnej pracy |
| 4. Wynik | Czy szkolenie zmniejsza ryzyko i zwiększa jakość pracy | Liczba incydentów danych, jakość artefaktów QA, czas tworzenia dokumentacji | 60–90 dni po rollout | Spadek błędów bezpieczeństwa i wzrost jakości artefaktów według audytu |

### Sposób pomiaru

| Dane | Źródło | Minimalny zakres |
|---|---|---|
| Postęp | HTML localStorage lub backend `[ZAŁOŻENIE]` | Moduł, status, czas, ścieżka |
| Wyniki quizów | Quiz engine | ID pytania, wynik, próba, feedback |
| Wyniki testu końcowego | Test engine | Wynik %, pytania krytyczne, moduły słabe |
| Zadania praktyczne | Rubryka oceny | Ocena 0–5, komentarze, obszary poprawy |
| Ankieta reakcji | Formularz HTML lub zewnętrzny `[ZAŁOŻENIE]` | NPS, przydatność, trudność, komentarze |
| Follow-up | Quiz 30 dni | Retencja wiedzy i użycie w pracy |

## 11. **Ryzyka i mitygacje**

| Ryzyko | Prawdopodobieństwo | Wpływ | Mitygacja |
|---|---:|---:|---|
| Szkolenie stanie się zbyt techniczne dla S1 | Średnie | Średni | Oddzielić wersję świadomościową i pełną; w S1 używać decyzji biznesowych zamiast szczegółów implementacyjnych |
| Szkolenie będzie zbyt ogólne dla S3 | Średnie | Wysoki | Dodać moduły M4–M6 i M12 jako obowiązkowe, z case studies RAG/evaluation |
| Pytania będą sprawdzać definicje zamiast decyzji | Średnie | Wysoki | Minimum 35% pytań scenariuszowych i zadania praktyczne dla S2/S3 |
| Uczestnicy nauczą się odpowiedzi na pamięć | Średnie | Średni | Rotacja wariantów, anti-gaming, większy bank pytań niż test końcowy |
| Pytania krytyczne będą dwuznaczne | Niskie/średnie | Wysoki | Recenzja security + pilotaż; pytania krytyczne z jasnym uzasadnieniem |
| Brak polityki danych QualityCat przed budową | Średnie | Wysoki | Oznaczyć M10 jako wymagający zatwierdzenia; użyć domyślnej konserwatywnej polityki do czasu decyzji |
| Zmiany w standardach OWASP lub narzędziach GenAI | Wysokie | Średni | Przegląd treści co 6 miesięcy; oddzielić pojęcia trwałe od przykładów narzędzi |
| Brak backendu utrudni raportowanie | Średnie | Średni | Wybrać wariant C dla rollout lub wariant B z eksportem wyników dla pilotażu |
| Interakcje HTML będą niedostępne dla użytkowników klawiatury | Średnie | Wysoki | Wymagać alternatywy dla drag & drop i testów WCAG |
| Uczestnicy zaufają outputowi LLM po szkoleniu bardziej niż przed | Niskie/średnie | Wysoki | W każdym module wzmacniać zasadę: output wymaga kontroli; M11 obowiązkowy dla wszystkich |
| Przykłady danych przypadkowo będą realistycznie wrażliwe | Niskie | Wysoki | Używać wyłącznie danych syntetycznych i recenzji security |
| Za mała grupa pilotażowa nie skalibruje trudności | Średnie | Średni | Zebrać minimum 8–15 osób lub wykonać drugi pilotaż po pierwszym rolloucie |
| Nadmierna liczba modułów obniży completion rate | Średnie | Średni | Ścieżki modułowe, progres, krótkie sekcje, jasne rozróżnienie obowiązkowe/opcjonalne |

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
