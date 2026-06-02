# Analiza biznesowa szkolenia GenAI i LLM dla QualityCat

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
