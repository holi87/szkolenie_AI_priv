# Analiza biznesowa szkolenia GenAI i LLM dla QualityCat

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
