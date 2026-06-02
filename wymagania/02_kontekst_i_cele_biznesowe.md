# Analiza biznesowa szkolenia GenAI i LLM dla QualityCat

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
