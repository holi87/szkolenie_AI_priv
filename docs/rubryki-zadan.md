# Rubryki zadań praktycznych

| Pole | Wartość |
|---|---|
| Issue | `#7 [07][M1] Zdefiniuj rubryki zadań praktycznych` |
| Milestone | M1 Instructional design |
| Kontrakt danych | `genai-llm-training/data/rubrics.json` |
| Źródła | `wymagania/07` (typy pytań, skale 0–5 i 0–3, progi, feedback), `wymagania/06` (moduły, efekty), `docs/macierz-sciezek.md` (zadania per ścieżka) |

Rubryki oceniają zadania praktyczne i pytania rubryczne. Skale wg `wymagania/07`: **mini-zadanie praktyczne 0–5 pkt**, **analiza outputu 0–3 pkt**. Każde kryterium jest jednoznaczne (obserwowalne) i mierzalne; feedback poniżej progu wskazuje **konkretne brakujące elementy**.

## Mapa zadań na ścieżki

| Zadanie | Moduł | Ścieżka | Skala | Próg zaliczenia |
|---|---|---|---:|---|
| Zadanie promptowe (Prompt clinic) | M7 | **S2** (obowiązkowe), S3 | 0–5 | **min. 4/5** (warunek konieczny S2) |
| Zadanie RAG readiness | M6 | **S3** (obowiązkowe) | 0–5 | **min. 70%** w M6 (≥ 3,5/5) |
| Zadanie ewaluacji (Judge/golden set) | M12 | **S3** (obowiązkowe) | 0–5 | **min. 70%** w M12 (≥ 3,5/5) |
| QA workbench (ocena outputu QA) | M8 | S2, S3 | 0–5 | ćwiczeniowe (wkład do quizu/feedback) |
| Analiza outputu (Output verifier) | M11 | S1, S2, S3 | 0–3 | ćwiczeniowe |

Wagi wyniku ścieżki: zadanie praktyczne = 10% (zob. macierz). S3 ma 2 zadania (RAG + ewaluacja); S2 ma 1 (promptowe).

---

## R1. Zadanie promptowe — Prompt clinic (M7), 0–5

Pięć kryteriów po 1 pkt (suma 0–5). Uczestnik poprawia wadliwy prompt; oceniamy poprawiony prompt.

| # | Kryterium (1 pkt) | Spełnione (1) | Niespełnione (0) |
|---|---|---|---|
| K1 | Rola i cel | Prompt jasno definiuje rolę modelu i cel zadania | Brak roli lub cel niejasny |
| K2 | Kontekst i dane wejściowe | Podany potrzebny kontekst i dane; brak zbędnych danych wrażliwych | Brak kontekstu albo wklejone dane wrażliwe/realne |
| K3 | Ograniczenia i kryteria jakości | Jawne ograniczenia (czego nie robić) i kryteria akceptacji wyniku | Brak ograniczeń lub kryteriów |
| K4 | Format wyjścia | Określony, weryfikowalny format (np. tabela, lista pól) | Format nieokreślony |
| K5 | Bezpieczeństwo i weryfikowalność | Dane syntetyczne/zanonimizowane; wynik da się zweryfikować (źródła, kontrola) | Ryzyko PII albo wynik nieweryfikowalny |

**Próg S2: ≥ 4/5.** Efekty uczenia: M7 (struktura promptu, few-shot, granice promptu).

Feedback poniżej progu (wskaż brakujące K): „Brakuje: {lista K bez punktu}. Uzupełnij rolę/cel, kontekst, ograniczenia i kryteria, format wyjścia oraz higienę danych."

---

## R2. Zadanie RAG readiness (M6), 0–5 — S3

| # | Kryterium (1 pkt) | Spełnione (1) |
|---|---|---|
| K1 | Źródła i grounding | Dobrane właściwe źródła, odpowiedź ma być osadzona w źródłach (grounding) |
| K2 | Chunking | Strategia chunking + overlap adekwatna do dokumentacji wymagań |
| K3 | Retrieval (top-k, filtry) | Sensowne top-k i filtrowanie metadanych; uzasadnienie |
| K4 | Cytaty / weryfikowalność | Odpowiedź z cytatami umożliwiającymi kontrolę |
| K5 | Diagnoza błędów | Rozpoznanie ryzyka błędu retrieval / generation / źródłowego |

**Próg S3: ≥ 3,5/5 (70%) — warunek konieczny w M6.** Efekty: M6 (pipeline, chunking, RAG vs fine-tuning, warstwy błędu).

Feedback: „Poniżej progu w M6. Brakuje: {K bez punktu}. Wróć do ekranów pipeline/chunking/diagnozy błędów."

---

## R3. Zadanie ewaluacji — Judge/golden set (M12), 0–5 — S3

| # | Kryterium (1 pkt) | Spełnione (1) |
|---|---|---|
| K1 | Golden set | Zdefiniowany golden set adekwatny do use case |
| K2 | Metryki | Dobrane metryki (np. faithfulness, groundedness, relevance, completeness) z uzasadnieniem |
| K3 | Rubryka judge | Jednoznaczna rubryka LLM-as-a-judge |
| K4 | Bias i kalibracja | Uwzględniony bias/position bias; kalibracja przez porównanie z oceną eksperta |
| K5 | Próg akceptacji | Ustalony i uzasadniony próg jakości |

**Próg S3: ≥ 3,5/5 (70%) — warunek konieczny w M12.** Efekty: M12.

Feedback: „Poniżej progu w M12. Brakuje: {K bez punktu}. Wróć do golden set / metryk / rubryki / kalibracji."

---

## R4. QA workbench (M8), 0–5 — ćwiczeniowe

| # | Kryterium (1 pkt) | Spełnione (1) |
|---|---|---|
| K1 | Pokrycie testów | Wskazane przypadki testowe pokrywające wymaganie |
| K2 | Braki pokrycia | Wykryte luki w pokryciu |
| K3 | Testy pozorne / duplikaty | Oznaczone duplikaty i testy pozorne |
| K4 | Ryzyka | Zidentyfikowane ryzyka / błędne założenia |
| K5 | Granica decyzji | Wskazane, co wymaga weryfikacji człowieka (LLM = asystent) |

Feedback: „Brakuje: {K bez punktu}."

---

## R5. Analiza outputu — Output verifier (M11), 0–3

Ocena poprawności klasyfikacji zdań outputu (poprawne / nieuzasadnione / wymagające źródła / ryzykowne / do odrzucenia).

| Pkt | Poziom |
|---:|---|
| 3 | Wszystkie kluczowe zdania sklasyfikowane poprawnie; ryzykowne i nieuzasadnione wyłapane |
| 2 | Większość poprawna; pojedynczy błąd niekrytyczny |
| 1 | Częściowo; pominięte istotne ryzyko lub błędna klasyfikacja krytycznego zdania |
| 0 | Brak rozpoznania ryzyka / akceptacja nieuzasadnionych treści |

Efekty: M11 (przyczyny halucynacji, checklista weryfikacji). Feedback przy <2: „Przeoczono: {kategorie}. Wróć do checklisty weryfikacji outputu."

---

## Kryteria akceptacji issue #7
- [x] Rubryki jednoznaczne i mierzalne — kryteria obserwowalne (spełnione/niespełnione), skale 0–5 i 0–3.
- [x] Kryteria minimum dla S2 i S3 — S2: promptowe ≥4/5; S3: RAG ≥70% (M6) i ewaluacja ≥70% (M12).
- [x] Feedback wskazuje brakujące elementy — każda rubryka ma feedback „Brakuje: {kryteria bez punktu}".
- [x] Rubryki da się odwzorować w danych — `genai-llm-training/data/rubrics.json`.
