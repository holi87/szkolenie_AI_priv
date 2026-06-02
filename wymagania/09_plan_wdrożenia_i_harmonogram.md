# Analiza biznesowa szkolenia GenAI i LLM dla QualityCat

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
