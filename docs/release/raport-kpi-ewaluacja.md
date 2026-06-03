# Raport KPI i ewaluacji — szablon do uzupełnienia po rolloucie

| Pole | Wartość |
|---|---|
| Issue | `#31 [M6] Przygotuj raport KPI i ewaluacji` |
| Milestone | M6 Release 1.0 i utrzymanie |
| Status | **Szablon (format) do wypełnienia po rolloucie — brak realnych wyników** |
| Źródła | `wymagania/10` (KPI + Kirkpatrick — autorytatywne), `wymagania/09` (fazy, role), `docs/plan-wdrozenia.md`, `docs/qa-pilotaz/raport-kalibracji.md`, `docs/qa-pilotaz/formularz-feedbacku.md`, `genai-llm-training/assets/core/certificate.js` (realnie eksportowane pola) |

> **To jest FORMAT raportu, a nie raport z wynikami.** Wszystkie komórki wyników są oznaczone
> `[do uzupełnienia po rolloucie]`. Aplikacja **nie przeszła** jeszcze realnego pilotażu ani kalibracji —
> issue **#28 (kalibracja) i #29 (poprawki po pilotażu) pozostają otwarte**. Żadnych danych syntetycznych
> z `raport-kalibracji.md` nie wolno przepisywać do komórek wyników (tam były tylko dane DEMO dowodzące, że
> proces działa end-to-end).

---

## 1. Cel i zakres raportu

Raport mierzy efektywność szkolenia GenAI/LLM dla QualityCat w dwóch momentach pomiarowych:

1. **Snapshot jednorazowy** — zebrany bezpośrednio po zakończeniu rolloutu (rollout = produkcyjne uruchomienie
   po pilotażu i poprawkach z #29). Pokrywa Kirkpatricka L1–L2 oraz KPI mierzalne z eksportu aplikacji i ankiety.
2. **Follow-up po 30 dniach** — osobna wysyłka mierząca retencję wiedzy oraz zmianę zachowania (Kirkpatrick L3).
   Sekcja 5 opisuje zakres i kryteria.

Zakres dokumentu:

- definicje, sposób pomiaru, źródło danych, właściciel i cel dla 9 KPI (sekcja 2);
- model ewaluacji Kirkpatricka 1–4 (sekcja 3);
- mapowanie źródeł danych na to, co realnie eksportuje aplikacja vs. co wymaga ankiety/danych zewnętrznych (sekcja 4);
- procedura follow-upu po 30 dniach (sekcja 5);
- **jawne oddzielenie danych pilotażu od danych produkcyjnych** z notą, dlaczego nie wolno ich mieszać (sekcja 6).

Cele KPI pochodzą z `wymagania/10` i są tam oznaczone jako `[ZAŁOŻENIE]` — w tym raporcie pozostają założeniami
do potwierdzenia przez sponsora, a nie twardymi zobowiązaniami.

---

## 2. Tabela KPI

Definicje, sposób pomiaru i cele przepisane wiernie z `wymagania/10`. Kolumna **Źródło danych** wskazuje, czy
KPI jest liczalny z eksportu aplikacji (localStorage → CSV/JSON z `certificate.js`), czy wymaga ankiety / danych
zewnętrznych. Komórki wyników są puste do czasu rolloutu.

| KPI | Definicja | Pomiar | Źródło danych | Właściciel | Cel `[ZAŁOŻENIE]` | Wynik pilotaż | Wynik produkcja |
|---|---|---|---|---|---:|---|---|
| Completion rate | Odsetek osób, które ukończyły wymaganą ścieżkę | Status ukończenia (ukończeni / zapisani) | Licznik: eksport aplikacji (`passed` / `completionId` z `buildReport`). **Mianownik (liczba zapisanych) NIE jest w eksporcie** — pochodzi z listy uczestników koordynatora (zewnętrzne) | `[właściciel: L&D Architect]` | >= 85% | `[do uzupełnienia po rolloucie]` | `[do uzupełnienia po rolloucie]` |
| Pass rate | Odsetek osób z wynikiem powyżej progu | Test końcowy (próg: S1 ≥75%, S2 ≥78%, S3 ≥80%) | Eksport aplikacji: `passed`, `scorePct` (`buildReport`/`exportCsv`) | `[właściciel: QA/Test Designer]` | 75–90%; powyżej 95% oznacza zbyt łatwy test | `[do uzupełnienia po rolloucie]` | `[do uzupełnienia po rolloucie]` |
| Critical safety pass | Odsetek osób z 100% pytań krytycznych | M10 / test końcowy | Eksport aplikacji: `criticalQuestionsPassed` (`buildReport`/`exportCsv`) | `[właściciel: Security/Governance Reviewer]` | 100% wśród zaliczonych | `[do uzupełnienia po rolloucie]` | `[do uzupełnienia po rolloucie]` |
| Knowledge gain | Różnica pre-test vs post-test | Test 15 pytań przed i po | **NIE z eksportu** — eksport zawiera tylko wynik post (`scorePct`), brak pola pre-test. Wymaga osobnego instrumentu pre/post (ankieta/quiz zewnętrzny) | `[właściciel: L&D Architect]` | +25 p.p. średnio | `[do uzupełnienia po rolloucie]` | `[do uzupełnienia po rolloucie]` |
| Retention | Wynik testu po 30 dniach | Follow-up quiz | **NIE ze snapshotu** — wymaga follow-upu po 30 dniach (zewnętrzny quiz, patrz sekcja 5) | `[właściciel: L&D Architect]` | >= 70% pierwotnego wyniku | `[do uzupełnienia po rolloucie]` | `[do uzupełnienia po rolloucie]` |
| Prompt quality | Wynik zadania promptowego | Rubryka 0–5 | Eksport aplikacji: `practicalTasks[].score` / `maxScore` (`buildReport`) | `[właściciel: SME GenAI/LLM]` | >= 4/5 dla S2 i S3 | `[do uzupełnienia po rolloucie]` | `[do uzupełnienia po rolloucie]` |
| RAG/evaluation readiness | Wynik techniczny S3 | M6 + M12 | Eksport **per-pytanie** aplikacji: `pytania-<ścieżka>.csv` (`exportQuestionStatsCsv`), agregacja poprawnych po M6+M12. Zwykły `wynik-*.csv` (agregaty) **nie wystarcza** | `[właściciel: SME GenAI/LLM]` | >= 75% | `[do uzupełnienia po rolloucie]` | `[do uzupełnienia po rolloucie]` |
| NPS szkolenia | Rekomendacja szkolenia | Ankieta po szkoleniu (skala 0–10) | **NIE z eksportu** — ankieta zewnętrzna (`formularz-feedbacku.md`, pyt. 5) | `[właściciel: Business Analyst]` | >= +30 | `[do uzupełnienia po rolloucie]` | `[do uzupełnienia po rolloucie]` |
| Time to complete | Realny czas ukończenia | Dane progresu | Eksport aplikacji: `totalTimeSec` / `moduleTimesSec` (`buildReport`/`exportCsv`). Uzupełniająco: ankieta pyt. 4 (deklarowany czas) | `[właściciel: Business Analyst]` | +/- 20% względem założeń (S1 3,5–4,5 h, S2 6–7 h, S3 9–10 h) | `[do uzupełnienia po rolloucie]` | `[do uzupełnienia po rolloucie]` |

> **Liczalność z eksportu localStorage (`certificate.js`):**
> - **Z eksportu agregatowego** (`wynik-<ścieżka>.json/csv` → `exportJson`/`exportCsv`): Pass rate, Critical safety
>   pass, Prompt quality, Time to complete, oraz licznik Completion rate.
> - **Z eksportu per-pytanie** (`pytania-<ścieżka>.csv` → `exportQuestionStatsCsv`): RAG/evaluation readiness
>   (agregacja M6+M12). To inny artefakt niż agregat — `raport-kalibracji.md` wprost zaznacza, że agregat nie
>   wystarcza do analiz per-pytanie.
> - **Spoza eksportu** (ankieta / dane zewnętrzne): Knowledge gain (brak pre-test w eksporcie), Retention
>   (follow-up 30 dni), NPS (ankieta). Mianownik Completion rate (lista zapisanych) — z listy koordynatora.

---

## 3. Model ewaluacji efektywności według Kirkpatricka

Poziomy, narzędzia i kryteria przepisane z `wymagania/10`. Kryteria sukcesu są tam `[ZAŁOŻENIE]`.

| Poziom | Co mierzymy | Narzędzia | Kiedy | Kryterium `[ZAŁOŻENIE]` | Wynik |
|---|---|---|---|---:|---|
| 1. Reakcja | Czy szkolenie było zrozumiałe, przydatne i adekwatne | Ankieta, NPS, pytania o moduły (`formularz-feedbacku.md`) | Bezpośrednio po szkoleniu | NPS >= +30, średnia przydatność >= 4/5 | `[do uzupełnienia po rolloucie]` |
| 2. Wiedza | Czy uczestnik potrafi zastosować pojęcia i decyzje | Quizy, test końcowy, zadania praktyczne (eksport aplikacji) | W trakcie i na końcu | Progi zaliczenia S1/S2/S3 (≥75/78/80%) | `[do uzupełnienia po rolloucie]` |
| 3. Zachowanie | Czy uczestnik zmienił sposób używania GenAI w pracy | Ankieta po 30 dniach, przegląd przykładów promptów, checklisty QA | 30–60 dni po szkoleniu | >= 60% deklaruje użycie checklisty w realnej pracy | `[do uzupełnienia po rolloucie]` |
| 4. Wynik | Czy szkolenie zmniejsza ryzyko i zwiększa jakość pracy | Liczba incydentów danych, jakość artefaktów QA, czas tworzenia dokumentacji | 60–90 dni po rollout | Spadek błędów bezpieczeństwa i wzrost jakości artefaktów wg audytu | `[do uzupełnienia po rolloucie]` |

> **Uwaga do L4:** wymaga danych z audytu organizacyjnego QualityCat (incydenty, jakość artefaktów) — to dane
> zewnętrzne, niezwiązane z eksportem aplikacji, zbierane w dłuższym horyzoncie (60–90 dni).

---

## 4. Źródła danych i właściciele

Sposób pomiaru przepisany z `wymagania/10` (sekcja „Sposób pomiaru"). Kolumna **Pochodzenie** rozdziela dane
eksportowane przez aplikację (CSV/JSON z `certificate.js`, localStorage) od danych z ankiety / narzędzi zewnętrznych.

| Dane | Źródło (wg wymagań) | Minimalny zakres | Pochodzenie | Właściciel |
|---|---|---|---|---|
| Postęp | HTML localStorage (backend `[ZAŁOŻENIE]`) | Moduł, status, czas, ścieżka | Eksport aplikacji: `moduleTimesSec`, `totalTimeSec`, `path` (`buildReport`) | `[właściciel: Frontend Developer]` |
| Wyniki quizów | Quiz engine | ID pytania, wynik, próba, feedback | Eksport per-pytanie: `pytania-<ścieżka>.csv` (`exportQuestionStatsCsv`, źródło `inline`/`final`) | `[właściciel: QA/Test Designer]` |
| Wyniki testu końcowego | Test engine | Wynik %, pytania krytyczne, moduły słabe | Eksport agregatowy: `scorePct`, `criticalQuestionsPassed`, `weakModules` (`exportCsv`/`exportJson`) | `[właściciel: QA/Test Designer]` |
| Zadania praktyczne | Rubryka oceny | Ocena 0–5, komentarze, obszary poprawy | Eksport aplikacji: `practicalTasks[]` (`score`, `maxScore`, `passed`) | `[właściciel: SME GenAI/LLM]` |
| Ankieta reakcji | Formularz HTML lub zewnętrzny `[ZAŁOŻENIE]` | NPS, przydatność, trudność, komentarze | **Zewnętrzne** — formularz wg `formularz-feedbacku.md` (Google/MS Forms); aplikacja statyczna ankiet nie zbiera | `[właściciel: Business Analyst]` |
| Follow-up | Quiz 30 dni | Retencja wiedzy i użycie w pracy | **Zewnętrzne** — osobny quiz po 30 dniach (sekcja 5) | `[właściciel: L&D Architect]` |
| Lista zapisanych | Rejestr koordynatora pilotażu/rolloutu | Liczba osób zapisanych per ścieżka | **Zewnętrzne** — mianownik dla Completion rate; nie ma go w eksporcie | `[właściciel: koordynator pilotażu/rolloutu]` |

> Role właścicieli pochodzą z `wymagania/09` (sekcja „Role i odpowiedzialności"). Są to **role**, nie konkretne
> osoby — przy realnym rolloucie sponsor przypisuje imiennych właścicieli.

---

## 5. Follow-up po 30 dniach

Osobna wysyłka po ~30 dniach od ukończenia (Kirkpatrick L2 retencja + L3 zachowanie). Zakres wg
`formularz-feedbacku.md` (sekcja „Follow-up po 30 dniach"):

- **Quiz retencyjny 5–8 pytań** z banku — mierzy KPI Retention (cel: >= 70% pierwotnego wyniku).
- **1 pytanie behawioralne**: czy realnie użyłeś technik/checklisty w pracy? (tak/nie + przykład) — zasila
  Kirkpatrick L3 (cel: >= 60% deklaruje użycie checklisty).
- Dane anonimowe (identyfikator typu „P03"), bez nazwisk/e-maili/danych klienta.

| Metryka follow-up | Źródło | Cel `[ZAŁOŻENIE]` | Wynik pilotaż | Wynik produkcja |
|---|---|---:|---|---|
| Retencja wiedzy (quiz 30 dni) | Zewnętrzny quiz | >= 70% pierwotnego wyniku | `[do uzupełnienia po rolloucie]` | `[do uzupełnienia po rolloucie]` |
| Deklarowane użycie w pracy (L3) | Pytanie behawioralne | >= 60% „tak" | `[do uzupełnienia po rolloucie]` | `[do uzupełnienia po rolloucie]` |

> **Pomiar pre→follow-up:** „pierwotny wynik" do porównania to wynik testu końcowego z eksportu aplikacji.
> Powiązanie wymaga zachowania anonimowego identyfikatora między snapshotem a follow-upem (rola koordynatora).

---

## 6. Oddzielenie danych pilotażu od danych produkcyjnych

Dane pilotażu i produkcji są raportowane **w osobnych kolumnach** (sekcje 2, 3, 5) i **nie są agregowane razem**.

| Cecha | Pilotaż | Produkcja (rollout) |
|---|---|---|
| Liczność | 8–15 osób (`wymagania/09`, F6) | Pełna populacja uczestników |
| Cel danych | Kalibracja pytań (#28), wykrycie problemów UX/treści (#29) | Pomiar realnej efektywności (KPI/Kirkpatrick) |
| Status walidacji | Sygnał, nie baseline statystyczny | Podstawa raportowania KPI |
| Golden set | `validated` tylko przy pełnym pokryciu 24/24 (`raport-kalibracji.md`) | Po kalibracji bank uznany za stabilny |
| Wynik w tym raporcie | Kolumna „Wynik pilotaż" | Kolumna „Wynik produkcja" |

**Dlaczego nie wolno ich mieszać:**

- Pilotaż przy N=8–15 jest **sygnałem kalibracyjnym, nie statystycznie ważnym baseline'em KPI**. Przy tak małej
  próbie pojedynczy uczestnik zmienia odsetki o kilka–kilkanaście punktów procentowych.
- Zmieszanie danych pilotażu z produkcją **kontaminuje pomiar produkcyjny**: na pilotażu testowane są wersje
  pytań/treści **sprzed** poprawek (#28/#29), więc wyniki opisują inny artefakt niż wersja produkcyjna.
- Cele biznesowe (Pass rate 75–90%, NPS ≥ +30 itd.) odnoszą się do wdrożenia produkcyjnego; raportowanie ich na
  danych pilotażu wprowadzałoby w błąd sponsora.

> **Stan na dziś (uczciwie):** kolumny „Wynik pilotaż" są puste, bo **realny pilotaż nie został przeprowadzony**
> (#28 otwarte). Demonstracyjny raport w `raport-kalibracji.md` operuje wyłącznie na **danych syntetycznych** i nie
> może zasilać żadnej komórki wyników w tym dokumencie.

---

## 7. Procedura uzupełnienia raportu (po rolloucie)

1. Zbierz eksporty aplikacji od uczestników: `wynik-<ścieżka>.json/csv` (agregaty) oraz `pytania-<ścieżka>.csv`
   (per-pytanie) — przyciski na ekranie wyniku. Dane anonimowe, bez PII.
2. Zbierz odpowiedzi ankiety (`formularz-feedbacku.md`) z narzędzia zewnętrznego (NPS, przydatność, czas, zgłoszenia).
3. Pobierz listę zapisanych od koordynatora (mianownik Completion rate).
4. Wypełnij kolumny „Wynik produkcja" w sekcjach 2, 3; kolumny „Wynik pilotaż" tylko jeśli prowadzony jest
   osobny snapshot pilotażowy — nie mieszaj (sekcja 6).
5. Po 30 dniach uruchom follow-up i wypełnij sekcję 5.
6. Oznacz datę snapshotu i wersję aplikacji (release 1.0) w nagłówku przy wypełnianiu.
