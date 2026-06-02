# Analiza biznesowa szkolenia GenAI i LLM dla QualityCat

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
