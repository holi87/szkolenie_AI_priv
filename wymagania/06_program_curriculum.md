# Analiza biznesowa szkolenia GenAI i LLM dla QualityCat

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
