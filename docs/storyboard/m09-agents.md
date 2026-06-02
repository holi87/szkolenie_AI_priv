# Storyboard — M9: Integracje narzędzi i agenty

| Pole | Wartość |
|---|---|
| Moduł | M9 |
| Czas | 45 min |
| Ścieżki | S1: opcjonalny ŚWIADOMOŚCIOWY; S2: opcjonalny; S3: obowiązkowy |
| Element interaktywny | „Agent permission board" (tablica uprawnień agenta) |
| Quiz inline | 8 pytań, Q73–Q80 |

> Storyboard to STRUKTURA ekranów — plan treści w skrócie. Pełna treść powstaje w M4 (faza pisania).
> Wszystkie przykłady danych są SYNTETYCZNE: fikcyjne repozytorium `synt-shop`, skrzynka `qa-bot@przyklad.test`, system testowy `TestRail-SANDBOX`. Zero realnych danych klienta / PII.

## Efekty uczenia

- **E1** — Rozróżnia trzy tryby integracji: chatbot (sam tekst), workflow z narzędziem (wywołanie narzędzia w ustalonym przepływie) i agenta (samodzielnie wybiera i wykonuje kolejne kroki).
- **E2** — Wskazuje ryzyka nadania agentowi dostępu do plików, maila, repozytorium (repository) i systemu testowego (test management system).
- **E3** — Projektuje minimalną kontrolę działania agenta: uprawnienia (permission scope), logi (audit log), zatwierdzanie człowieka (human-in-the-loop) i wycofanie zmian (rollback).
- **E4** — Identyfikuje zadania, w których agent wymaga ograniczeń i audytu (audit), oraz takie, gdzie autonomia jest akceptowalna.

## Sekwencja ekranów

| # | Tytuł ekranu | Typ | Cel/treść (skrót, ≤300 słów) | Efekt(y) | Ścieżki/wariant |
|---|---|---|---|---|---|
| 1 | Po co testerowi agenty | treść | Cel modułu i dlaczego to ważne dla QA: narzędzia AI coraz częściej nie tylko odpowiadają, ale działają — czytają pliki, wysyłają maile, otwierają pull requesty, modyfikują dane testowe. Tester musi wiedzieć, kiedy to pomaga, a kiedy tworzy ryzyko bez kontroli. Zapowiedź efektów E1–E4, czasu (45 min) i elementu interaktywnego. Pasek postępu + „następny krok". | E1–E4 | Wszystkie. S1: skrót — zostaje sam komunikat „agent działa, nie tylko mówi → potrzebna kontrola". |
| 2 | Chatbot vs workflow vs agent | treść | Definicje trzech trybów z terminem oryginalnym w nawiasie: chatbot (generuje tekst, nic nie wykonuje), workflow z narzędziem (tool use — model wywołuje 1 ustalone narzędzie w sztywnym przepływie), agent (samodzielnie planuje i wykonuje sekwencję kroków, decyduje które narzędzie i kiedy). Tabela porównawcza: kto decyduje o krokach, czy są skutki uboczne, jak duża powierzchnia ryzyka. Wersja tekstowa tabeli (WCAG 1.1.1). | E1 | Wszystkie. S1: tylko intuicja „kto pociąga za spust" bez szczegółów workflow vs tool use. |
| 3 | Quick check — który to tryb? | decyzja | Mikro-sprawdzenie zrozumienia E1 (nie liczone do quizu): 3 krótkie opisy syntetyczne (np. „bot odpowiada na pytanie o testy", „skrypt woła 1 API i kończy", „narzędzie samo czyta backlog i tworzy 5 PR"). Uczestnik przypisuje: chatbot / workflow / agent. Radio do każdego opisu, feedback tekstowy. | E1 | S2, S3. S1: POMIJANY (świadomościowy — bez ćwiczeń decyzyjnych). |
| 4 | Co agent może dotknąć — mapa dostępów | treść | Cztery typowe powierzchnie dostępu agenta w pracy QA: pliki (file system), mail, repozytorium kodu, system zarządzania testami. Dla każdej krótko: co agent może zrobić i jaki jest najgorszy wiarygodny skutek (np. usunięcie plików, wysłanie maila na zewnątrz, push do gałęzi głównej, masowa zmiana statusów testów). Diagram dostępów + opis alternatywny tekstem. | E2 | Wszystkie. S1: uproszczone — lista 4 obszarów + jedno zdanie ryzyka na obszar, bez analizy „najgorszego skutku". |
| 5 | Skąd bierze się ryzyko | treść | Dlaczego agent jest ryzykowniejszy niż chatbot: działa bez pauzy, łączy kroki (zła decyzja w kroku 1 propaguje się dalej), może paść ofiarą wstrzyknięcia poleceń (prompt injection) z czytanej treści, a skutki są realne i nieodwracalne. Powiązanie z M10 (bezpieczeństwo). Jeden syntetyczny przykład: agent czyta złośliwy komentarz w zgłoszeniu i wykonuje ukryte polecenie. | E2 | S2, S3. S1: skrót do 2 zdań — „agent łączy kroki i ma realne skutki, dlatego potrzebna kontrola". |
| 6 | Cztery dźwignie kontroli | treść | Minimalna kontrola działania agenta — model „4 dźwigni": uprawnienia (permission scope — najmniejszy potrzebny zakres), logi (audit log — co agent zrobił i kiedy), zatwierdzanie człowieka (human-in-the-loop — bramka przed skutkiem nieodwracalnym), wycofanie (rollback — czy da się cofnąć zmianę). Dla każdej dźwigni: pytanie kontrolne, które tester powinien zadać. Tekstowa lista zamiast samej grafiki. | E3 | Wszystkie. S1: uproszczone — same 4 nazwy dźwigni + jedno zdanie po co, bez pytań kontrolnych. |
| 7 | Które zadania wymagają audytu | treść | Klasyfikacja zadań: kiedy autonomia agenta jest akceptowalna (odwracalne, niskie skutki, łatwa weryfikacja), a kiedy konieczne są ograniczenia i audyt (nieodwracalne, dane wrażliwe, wpływ na produkcję/dane testowe, zatwierdzenia). Reguła kciuka: im trudniej cofnąć i im większy skutek, tym mocniejsza bramka HITL i pełniejszy log. Syntetyczne przykłady „zielone" vs „czerwone". | E4 | S2, S3. S1: skrót — sama reguła kciuka „nieodwracalne + duży skutek = bramka + audyt". |
| 8 | Agent permission board | interakcja | ELEMENT INTERAKTYWNY (szczegół niżej). Uczestnik nadaje agentowi uprawnienia dla 5 syntetycznych zadań QA i minimalizuje ryzyko przez ograniczenie dostępu + dobór dźwigni kontroli. Output: ocena ryzyka tekstem dla każdego zadania. | E2, E3, E4 | S2, S3. S1: ZASTĄPIONY wersją demonstracyjną — 1 gotowy przykład „przed/po" z komentarzem, bez samodzielnej konfiguracji. |
| 9 | Quiz inline (Q73–Q80) | quiz-inline | 8 pytań z natychmiastowym feedbackiem i wyjaśnieniem (tryb nauki). Q73–Q75 single choice (rozróżnienie trybów, dźwignie kontroli). Q76–Q78 scenariusz uprawnień (dobór minimalnego zakresu i bramek). Q79–Q80 multiple choice (ryzyka dostępu, elementy audytu). Każde pytanie linkuje do powiązanej sekcji. | E1–E4 | Wszystkie. S1: ten sam zestaw w trybie świadomościowym (wynik nie jest gatingiem — moduł opcjonalny). |
| 10 | Podsumowanie i następny krok | podsumowanie | Domknięcie: 1 zdanie na efekt (E1–E4), karta „4 dźwigni" do zapamiętania, link do M10 (bezpieczeństwo, prompt injection) jako naturalna kontynuacja. „Następny najlepszy krok" zależny od ścieżki. Pasek postępu modułu = 100%. | E1–E4 | Wszystkie. S1: wersja 3-punktowa „co zapamiętać". |

**Liczba ekranów: 10** (orientacyjnie 4–5 min/ekran; ekrany treści krótsze, interakcja i quiz dłuższe — mieści się w 45 min). W wariancie S1 świadomościowym aktywne pozostają ekrany 1, 2, 4, 6, 8 (demo), 9, 10; ekrany 3, 5, 7 są pomijane lub zredukowane do 1–2 zdań.

## Element interaktywny — szczegół

**Nazwa:** „Agent permission board" (tablica uprawnień agenta).

**Działanie:** Uczestnik widzi 5 syntetycznych zadań QA do delegowania agentowi. Dla każdego zadania ustala dwie rzeczy: (1) zakres dostępu — które systemy i z jakim poziomem (odczyt / zapis / brak), (2) dźwignie kontroli — czy włączyć zatwierdzanie człowieka (HITL) i czy zmiana jest odwracalna (rollback). System liczy „poziom ryzyka resztkowego" i zwraca tekstowy komentarz: czy uprawnienia są minimalne, czy nieodwracalna akcja ma bramkę, czy log pokryje audyt.

**DANE WEJŚCIOWE (syntetyczne, 5 zadań — przykłady):**

| Zadanie | Potrzebny dostęp (poprawny minimalny) | Skutek odwracalny? |
|---|---|---|
| Z1: Podsumuj 10 zgłoszeń z `TestRail-SANDBOX` | system testowy: odczyt | tak (brak zmian) |
| Z2: Załóż 5 przypadków testowych z wymagania | system testowy: zapis (+ HITL przed publikacją) | częściowo (wymaga rollback) |
| Z3: Wyślij raport tygodniowy na `qa-team@przyklad.test` | mail: wysyłka (+ HITL: zatwierdź treść) | nie (mail wysłany = nieodwracalny) |
| Z4: Otwórz pull request z poprawką w `synt-shop` | repozytorium: zapis do gałęzi roboczej, NIE do `main` | tak (PR = bramka review) |
| Z5: Uporządkuj katalog `./synt-fixtures` (usuń stare pliki) | pliki: odczyt + zapis ograniczony do katalogu (+ kosz/backup) | warunkowo (zależy od backupu) |

**OUTPUT:** Dla każdego zadania — etykieta ryzyka (niskie / średnie / wysokie) + zdanie uzasadnienia tekstem (np. „Z3: dostęp do wysyłki maila bez bramki HITL = ryzyko wysokie — dodaj zatwierdzanie treści"). Na końcu zbiorcza ocena: ile zadań ma minimalny zakres i właściwe bramki.

**OBOWIĄZKOWA alternatywa klawiaturowa / niedragowa** (zgodnie z `docs/design-baseline.md` §6, wiersz M9: „Tabela uprawnień z checkboxami; ocena ryzyka tekstem"):
- Brak drag & drop. Cała interakcja jako **tabela uprawnień**: dla każdego zadania `select` poziomu dostępu (brak / odczyt / zapis) per system oraz **checkboxy** „zatwierdzanie człowieka (HITL)" i „odwracalne / jest rollback".
- Wszystkie kontrolki **fokusowalne**, w logicznej kolejności Tab (zadanie po zadaniu), z **widocznym focusem** (kontrast obrysu ≥ 3:1).
- **Feedback tekstowy** po zatwierdzeniu każdego wiersza i zbiorczo — nie tylko kolor; etykieta ryzyka zawsze ma słowo + ewentualnie ikonę, nigdy sam kolor (WCAG 1.4.1).
- Etykiety pól powiązane z kontrolkami (WCAG 1.3.1 / 3.3.2); komunikaty błędu/braku wyboru opisane tekstem przy polu.
- **Wariant S1 (świadomościowy):** zamiast samodzielnej konfiguracji — jeden gotowy przykład „przed/po" (np. Z3) z opisem, dlaczego wersja „po" jest bezpieczniejsza; bez wymaganej interakcji, w pełni czytelny z klawiatury.

## Quiz inline

- **8 pytań, Q73–Q80**, natychmiastowy feedback i wyjaśnienie (tryb nauki), każde z linkiem do powiązanej sekcji.
- **Q73–Q75 — single choice:** rozróżnienie chatbot / workflow / agent (E1) i rozpoznanie dźwigni kontroli (E3).
- **Q76–Q78 — scenariusz uprawnień:** dobór minimalnego zakresu dostępu i właściwej bramki dla syntetycznego zadania (E2, E3, E4) — sprawdza transfer z ćwiczenia „permission board".
- **Q79–Q80 — multiple choice:** wskazanie wielu ryzyk dostępu agenta oraz elementów składających się na audyt (E2, E4).
- Pytań krytycznych: **brak** (zgodnie z danymi modułu). Moduł opcjonalny dla S1/S2 — quiz nie jest bramką gatingu.

## Mapowanie na efekty i pytania

| Efekt | Ekrany | Pytania |
|---|---|---|
| E1 — chatbot / workflow / agent | 1, 2, 3 | Q73–Q75 |
| E2 — ryzyka dostępu (pliki/mail/repo/system testowy) | 1, 4, 5, 8 | Q76–Q78, Q79–Q80 |
| E3 — minimalna kontrola (uprawnienia, logi, HITL, rollback) | 1, 6, 8 | Q73–Q75, Q76–Q78 |
| E4 — zadania wymagające ograniczeń i audytu | 1, 7, 8 | Q76–Q78, Q79–Q80 |
