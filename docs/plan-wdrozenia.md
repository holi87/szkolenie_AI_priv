# Plan wdrożenia szkolenia GenAI i LLM dla QualityCat

## Cel planu

Ten dokument przekłada wymagania z folderu `wymagania/` na kolejny, wdrażalny backlog GitHub. Celem jest zbudowanie samodzielnego szkolenia HTML o GenAI i LLM dla trzech ścieżek odbiorców:

- S1: nietechniczna / decyzyjna.
- S2: praktyk-użytkownik / QA.
- S3: inżynier / automatyzacja / techniczny QA.

Plan zakłada dostarczenie wersji pilotażowej jako statycznej aplikacji HTML/JS z lokalnym zapisem progresu i eksportem wyniku. Backend raportowy pozostaje świadomie odłożony do decyzji po pilotażu, ale kontrakty danych i architektura mają być przygotowane tak, żeby nie blokować późniejszego wariantu z API.

## Źródła wymagań

- `wymagania/01_streszczenie_zarządcze.md`
- `wymagania/02_kontekst_i_cele_biznesowe.md`
- `wymagania/03_analiza_odbiorców.md`
- `wymagania/04_analiza_potrzeb_szkoleniowych_tna.md`
- `wymagania/05_cele_i_efekty_uczenia.md`
- `wymagania/06_program_curriculum.md`
- `wymagania/07_specyfikacja_systemu_testów.md`
- `wymagania/08_specyfikacja_interaktywnego_szkolenia_html.md`
- `wymagania/09_plan_wdrożenia_i_harmonogram.md`
- `wymagania/10_metryki_sukcesu_i_ewaluacja.md`
- `wymagania/11_ryzyka_i_mitygacje.md`
- `wymagania/12_założenia_i_pytania_otwarte.md`

## Założenia architektoniczne

1. MVP/pilotaż działa bez backendu: statyczne pliki HTML, CSS, JS i JSON.
2. Progres, próby, wyniki i ustawienia ścieżki są zapisywane lokalnie przez adapter `progress-store`.
3. Wynik końcowy może być eksportowany jako plik JSON/CSV i prezentowany jako ekran certyfikatu.
4. Struktura danych jest kontraktowa: `modules.json`, `questions.json`, `golden-set.json`, `scenarios.json`.
5. Logika testów jest oddzielona od UI: `quiz-engine`, `test-engine`, `scoring`.
6. Interakcje drag and drop muszą mieć alternatywę klawiaturową/listową.
7. Każdy przykład danych w szkoleniu jest syntetyczny.
8. WCAG 2.1 AA jest celem jakościowym dla UI, focus states, kontrastu i obsługi klawiaturą.
9. Treść modułów jest modularna, żeby można było utrzymywać ścieżki S1/S2/S3 bez duplikowania całego kursu.
10. Backend raportowy jest osobnym strumieniem po decyzji sponsora, nie warunkiem startu pilotażu.
11. **Wdrożenie jako GitHub Pages jest wiążącym ograniczeniem architektury** — cała technologia musi działać jako statyczny hosting bez serwera (ścieżki względne, brak runtime backendu na Pages, ewentualny backend jako zewnętrzny serwis konsumowany przez statyczny front). To ograniczenie jest nadrzędne wobec samego wyboru HTML.

## Docelowa struktura techniczna

```text
genai-llm-training/
  index.html
  assets/
    styles.css
    app.js
    quiz-engine.js
    test-engine.js
    scoring.js
    progress-store.js
    certificate.js
    accessibility.js
  data/
    modules.json
    questions.json
    golden-set.json
    scenarios.json
    paths.json
  modules/
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
  tests/
    schema-validation/
    smoke/
    accessibility/
```

## Milestone'y GitHub

Backlog został odwzorowany na GitHubie jako issues `#1`-`#33`, w tej samej kolejności co sekcja "Backlog wdrożeniowy". Każde issue ma milestone, label fazy, label typu pracy, priorytet i zależności do wcześniejszych issue.

| Milestone | Cel | Kryterium zamknięcia |
|---|---|---|
| M0 Decyzje i architektura | Potwierdzić zakres, decyzje sponsora i fundament techniczny | Zatwierdzone ADR, otwarte pytania skategoryzowane, repo gotowe do budowy |
| M1 Instructional design | Zamrozić ścieżki, moduły, efekty uczenia i storyboard | Storyboard 12 modułów, macierz ścieżek, rubryki i UX flow zatwierdzone |
| M2 Assessment i dane | Przygotować kontrakty danych, bank pytań i golden set | Schematy danych, min. 116 pytań, 24 pytania golden set, 5 pytań krytycznych |
| M3 Frontend core | Zbudować statyczny shell szkolenia i mechanizmy wspólne | Nawigacja, ścieżki, progres, quiz engine, test końcowy i certyfikat działają |
| M4 Moduły i interakcje | Wdrożyć treści i interakcje dla M1-M12 | Wszystkie moduły mają treść, quiz inline i wymaganą interakcję |
| M5 QA i pilotaż | Zweryfikować jakość, dostępność, treść i pytania na grupie pilotażowej | Raport QA, dane pilotażu, lista poprawek i skalibrowane pytania |
| M6 Release 1.0 i utrzymanie | Opublikować stabilny pakiet oraz proces utrzymania | Wersja 1.0, instrukcja uruchomienia, raport KPI i plan przeglądów |

## Backlog wdrożeniowy

### M0 Decyzje i architektura

1. `[M0] Uzgodnij kartę projektu i decyzje sponsora`
   - Cel: zebrać decyzje P1-P15 z wymagań i oznaczyć blokery.
   - Akceptacja: karta projektu zawiera zakres, ścieżki, wariant techniczny, politykę danych, certyfikat, hosting i kryteria zaliczenia.

2. `[M0] Przygotuj ADR architektury statycznego szkolenia`
   - Cel: opisać wariant statyczny, eksport wyników i przyszły backend.
   - Akceptacja: ADR wskazuje decyzję MVP, konsekwencje, ryzyka i warunki przejścia do backendu.

3. `[M0] Utwórz repo structure i standardy jakości`
   - Cel: przygotować katalogi, konwencje plików, zasady commitów, testów i walidacji danych.
   - Akceptacja: repo ma strukturę pod aplikację, dokument standardów i minimalną ścieżkę uruchomienia.

4. `[M0] Zdefiniuj baseline UX, brandingu i dostępności`
   - Cel: ustalić layout szkolenia, skalę typografii, komponenty, focus states i zasady WCAG.
   - Akceptacja: powstaje krótki design system oraz lista wymagań dostępności dla interakcji.

### M1 Instructional design

5. `[M1] Zamroź macierz ścieżek S1/S2/S3`
   - Cel: określić moduły obowiązkowe, skrócone i opcjonalne dla każdej ścieżki.
   - Akceptacja: `paths.json` albo dokument macierzy zawiera czas, moduły, wymagane testy i progi.

6. `[M1] Przygotuj storyboard 12 modułów`
   - Cel: rozpisać każdy moduł na ekrany, decyzje, ćwiczenia, quiz i linki do efektów uczenia.
   - Akceptacja: każdy moduł M1-M12 ma strukturę ekranów bez sekcji powyżej 250-300 słów.

7. `[M1] Zdefiniuj rubryki zadań praktycznych`
   - Cel: przygotować rubryki dla prompt clinic, QA workbench, RAG/evaluation i scoringu 0-5.
   - Akceptacja: rubryki są jednoznaczne, mierzą efekty uczenia i mają feedback dla uczestnika.

8. `[M1] Przygotuj syntetyczne scenariusze szkoleniowe`
   - Cel: stworzyć bezpieczne przykłady danych dla QA, PII, RAG, agentów i weryfikacji outputu.
   - Akceptacja: scenariusze nie zawierają realnych danych klienta i są powiązane z modułami.

### M2 Assessment i dane

9. `[M2] Zdefiniuj schematy danych kursu`
   - Cel: przygotować kontrakty `modules`, `paths`, `questions`, `golden-set`, `scenarios`, `progress`.
   - Akceptacja: schematy walidują wymagane pola, typy pytań, ścieżki, progi i metadane.

10. `[M2] Utwórz bank 116 pytań z metadanymi`
    - Cel: dostarczyć pytania zgodne z mapą M1-M12 i poziomami L1-L4.
    - Akceptacja: bank zawiera 116 pytań, feedback, punkty, poziom Blooma, trudność i referencje.

11. `[M2] Utwórz 5 pytań krytycznych M10`
    - Cel: zbudować pytania bezpieczeństwa wymagane do zaliczenia.
    - Akceptacja: każde pytanie ma jednoznaczną odpowiedź, uzasadnienie i negatywny feedback bezpieczeństwa.

12. `[M2] Utwórz golden set 24 pytań`
    - Cel: przygotować zestaw referencyjny do pilotażu i kontroli jakości.
    - Akceptacja: golden set obejmuje 12 modułów, 3 filary, 5 pytań bezpieczeństwa i rozkład L1-L4.

13. `[M2] Dodaj walidację danych i raport pokrycia`
    - Cel: wykrywać braki w pytaniach, modułach, referencjach i proporcjach trudności.
    - Akceptacja: test walidacji zwraca raport liczby pytań, scenariuszy, krytycznych pytań i golden setu.

### M3 Frontend core

14. `[M3] Zbuduj statyczny shell szkolenia`
    - Cel: stworzyć `index.html`, layout, nawigację modułową i ładowanie danych.
    - Akceptacja: użytkownik widzi ścieżki, moduły, statusy ukończenia i responsywny ekran startowy.

15. `[M3] Wdroż wybór ścieżki i gating modułów`
    - Cel: pokazywać obowiązkowe, opcjonalne i zablokowane sekcje dla S1/S2/S3.
    - Akceptacja: po wyborze ścieżki aplikacja pokazuje poprawny zakres i zapisuje wybór.

16. `[M3] Wdroż progress-store`
    - Cel: zapisywać lokalnie moduł, status, wynik, próbę i ostatnie miejsce.
    - Akceptacja: po odświeżeniu strony użytkownik wraca do ostatniego miejsca i widzi progres.

17. `[M3] Wdroż quiz engine dla quizów inline`
    - Cel: obsłużyć typy pytań, punktację, feedback i link do sekcji modułu.
    - Akceptacja: quiz inline liczy wynik, pokazuje feedback i zapisuje wynik cząstkowy.

18. `[M3] Wdroż test końcowy i scoring ścieżki`
    - Cel: losować pytania według ścieżki, trudności, typu i zasad pytań krytycznych.
    - Akceptacja: S1 ma 25 pytań, S2 40, S3 55; scoring uwzględnia progi, krytyczne pytania i zadania praktyczne.

19. `[M3] Wdroż certyfikat i eksport wyniku`
    - Cel: przygotować ekran zaliczenia i eksport JSON/CSV dla pilotażu.
    - Akceptacja: wynik zawiera imię, ścieżkę, datę, wynik, ID zaliczenia i słabe obszary.

### M4 Moduły i interakcje

20. `[M4] Wdroż moduły M1-M2`
    - Cel: fundamenty GenAI/LLM i architektura LLM na poziomie praktycznym.
    - Akceptacja: M1 i M2 mają treść, quiz inline, klasyfikator zadań i licznik kontekstu.

21. `[M4] Wdroż moduły M3-M6`
    - Cel: parametry, embeddings, vector databases i RAG.
    - Akceptacja: M3-M6 mają treść, quiz inline, suwaki generacji, mapę semantyczną, retrieval debugger i RAG pipeline.

22. `[M4] Wdroż moduły M7-M9`
    - Cel: prompt engineering, QA use cases i agenty.
    - Akceptacja: M7-M9 mają treść, quiz inline, prompt clinic, QA workbench i agent permission board.

23. `[M4] Wdroż moduły M10-M12`
    - Cel: bezpieczeństwo, weryfikacja outputu i ewaluacja LLM/RAG.
    - Akceptacja: M10-M12 mają treść, quiz inline, data safety gate, output verifier i judge calibration lab.

24. `[M4] Dodaj alternatywy dostępnościowe dla interakcji`
    - Cel: zapewnić obsługę klawiaturą i wariant niedragowy dla każdej interakcji.
    - Akceptacja: wszystkie interakcje działają bez myszy, mają focus states i tekstowy feedback.

### M5 QA i pilotaż

25. `[M5] Przygotuj automatyczne testy smoke, danych i dostępności`
    - Cel: sprawdzać render, brak błędów JS, walidację danych, responsywność i podstawowe WCAG.
    - Akceptacja: testy obejmują desktop, tablet, 360 px mobile, keyboard navigation i kontrast/focus.

26. `[M5] Przeprowadź recenzję merytoryczną i security`
    - Cel: zweryfikować treść techniczną, governance, PII, prompt injection i pytania krytyczne.
    - Akceptacja: recenzja daje listę poprawek, a pytania krytyczne nie są dwuznaczne.

27. `[M5] Przygotuj pakiet pilotażowy`
    - Cel: uruchomić szkolenie dla 8-15 osób z instrukcją i sposobem zbierania wyników.
    - Akceptacja: pakiet zawiera instrukcję, formularz feedbacku, eksport wyników i scenariusz pilotażu.

28. `[M5] Skalibruj pytania po pilotażu`
    - Cel: przeanalizować poprawność, czas odpowiedzi, trudność, dyskryminację i zgłoszenia niejasności.
    - Akceptacja: pytania poza zakresem trudności są poprawione, oznaczone albo przeniesione.

### M6 Release 1.0 i utrzymanie

29. `[M6] Wdroż poprawki po pilotażu`
    - Cel: zamknąć poprawki UX, treści, pytań i scoringu po danych pilotażowych.
    - Akceptacja: wszystkie krytyczne i wysokie poprawki z pilotażu są zamknięte.

30. `[M6] Przygotuj release 1.0`
    - Cel: dostarczyć finalny pakiet szkolenia i instrukcję uruchomienia.
    - Akceptacja: release zawiera działającą aplikację, dokument uruchomieniowy, znane ograniczenia i checklistę jakości.

31. `[M6] Przygotuj raport KPI i ewaluacji`
    - Cel: mierzyć completion rate, pass rate, safety pass, knowledge gain, NPS i time to complete.
    - Akceptacja: raport ma format do uzupełnienia po rolloucie i wskazuje źródła danych.

32. `[M6] Ustal proces utrzymania treści`
    - Cel: zdefiniować przegląd co 6 miesięcy, właścicieli i procedurę aktualizacji pytań.
    - Akceptacja: jest playbook aktualizacji OWASP/governance/narzędzi oraz reguła wymiany pytań deprecated.

33. `[M6] Wdróż szkolenie na GitHub Pages`
    - Cel: opublikować statyczną aplikację jako GitHub Pages, zgodnie z wiążącym modelem hostingu (założenie architektoniczne #11).
    - Akceptacja: aplikacja działa pod adresem GitHub Pages, ścieżki są względne, dane ładują się przez http(s), brak zależności od serwera; opisany sposób deployu (branch + folder albo GitHub Actions → Pages) i obsługa podścieżki repo.

## Zależności krytyczne

- Issue 1 blokuje decyzje P1-P15 i powinno być zamknięte przed budową treści i implementacji.
- Issue 2 blokuje finalny kształt `progress-store`, certyfikatu i eksportu.
- Issue 5 blokuje implementację gatingu ścieżek.
- Issue 9 blokuje budowę quiz engine i walidacji banku pytań.
- Issue 10-12 blokują test końcowy i scoring.
- Issue 20-23 blokują pilotaż.
- Issue 25-28 blokują release 1.0.

## Definicja ukończenia issue

Każde issue wdrożeniowe jest ukończone dopiero, gdy:

1. Zakres jest zgodny z wymaganiami i linkuje właściwe dokumenty z `wymagania/`.
2. Artefakty są zapisane w repo, nie tylko opisane w rozmowie.
3. Dla kodu istnieje minimalna weryfikacja: smoke/test/schema/manual checklist odpowiednia do zakresu.
4. Dla treści istnieje recenzja merytoryczna albo jawny status `do recenzji`.
5. Nie ma regresji w ścieżkach S1/S2/S3.
6. Issue ma uzupełnione kryteria akceptacji i jest zamknięte dopiero po ich spełnieniu.

## Proponowane label GitHub

- `phase:m0`, `phase:m1`, `phase:m2`, `phase:m3`, `phase:m4`, `phase:m5`, `phase:m6`
- `type:decision`
- `type:architecture`
- `type:content`
- `type:assessment`
- `type:frontend`
- `type:qa`
- `type:security`
- `type:pilot`
- `type:release`
- `priority:p0`
- `priority:p1`
- `dependency`

## Kolejność realizacji

Pracę należy realizować sekwencyjnie milestone po milestone. W ramach milestone'u można równoleglić tylko zadania bez zależności:

1. M0: issue 1-4.
2. M1: issue 5-8.
3. M2: issue 9-13.
4. M3: issue 14-19.
5. M4: issue 20-24.
6. M5: issue 25-28.
7. M6: issue 29-33.

## Decyzje do potwierdzenia przed startem implementacji

1. Czy wersja pilotażowa ma zostać statyczna z eksportem wyników, czy od razu budujemy backend wyników?
2. Czy certyfikat ma mieć formalną wartość wewnętrzną, czy tylko informacyjną?
3. Czy QualityCat ma gotową politykę użycia GenAI, czy trzeba przygotować konserwatywną wersję domyślną?
4. Czy szkolenie ma działać offline/intranetowo?
5. Czy branding QualityCat jest dostępny przed projektowaniem UI?
6. Czy ścieżka S3 ma mieć obowiązkowe zadanie praktyczne z RAG/evaluation?
