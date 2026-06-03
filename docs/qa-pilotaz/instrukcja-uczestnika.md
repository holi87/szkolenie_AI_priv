# Instrukcja dla uczestnika pilotażu

Dziękujemy za udział w pilotażu szkolenia **„GenAI i LLM w pracy testera”**. Pilotaż ma sprawdzić, czy
szkolenie jest zrozumiałe, dobrze wycelowane i czy pytania są sprawiedliwe. Twój udział i feedback wprost
wpłyną na finalną wersję.

Czas: ok. **3,5–10 godzin** zależnie od ścieżki (możesz rozłożyć na kilka sesji — postęp zapisuje się sam).

## 1. Otwórz szkolenie

Otwórz link przekazany przez koordynatora w **przeglądarce na komputerze** (Chrome/Edge/Firefox/Safari).
Szkolenie jest statyczną stroną — nie wymaga logowania ani instalacji.

> Postęp zapisuje się **lokalnie w Twojej przeglądarce** (localStorage). Nie czyść danych przeglądarki w trakcie
> i używaj tego samego komputera + przeglądarki. Tryb prywatny/incognito może nie zapisać postępu.

## 2. Wybierz ścieżkę

Na ekranie startowym wybierz ścieżkę dopasowaną do Twojej roli:

| Ścieżka | Dla kogo | Moduły wymagane | Test końcowy | Próg | Zadanie praktyczne | Czas |
|---|---|---:|---:|---:|---|---|
| **S1 — Nietechniczna / decyzyjna** | Podstawy + bezpieczeństwo, bez technikaliów | 5 | 25 pytań | 75% | — | 3,5–4,5 h |
| **S2 — Praktyk-użytkownik / QA** | Tester używający GenAI w pracy | 8 | 40 pytań | 78% | 1 (prompt, ≥4/5) | 6–7 h |
| **S3 — Inżynier / automatyzacja / techniczny QA** | RAG / ewaluacja / governance | 12 | 55 pytań | 80% | 2 (RAG i ewaluacja, ≥70%) | 9–10 h |

Koordynator wskaże, którą ścieżkę masz przejść (chcemy pokrycia S1–S3 w grupie). Możesz też podać **imię na
certyfikat** (opcjonalnie) — nie podawaj danych wrażliwych, wystarczy imię lub pseudonim.

## 3. Przejdź moduły

- W każdym module: przeczytaj treść, wykonaj **interakcję** (klasyfikacja / rubryka / strojenie parametrów —
  daje feedback) i rozwiąż **quiz inline** (5–8 pytań z natychmiastowym wyjaśnieniem).
- Oznacz moduł jako **ukończony** dopiero po sprawdzeniu wszystkich pytań quizu.
- Na ścieżkach S2/S3 wykonaj **zadanie praktyczne** w odpowiednim module (Prompt clinic w M7 dla S2; RAG w M6
  i ewaluacja w M12 dla S3). Ocena zadania zapisuje się i odblokowuje test końcowy.

## 4. Test końcowy

Po ukończeniu modułów wymaganych odblokuje się **test końcowy**:
- W trybie testu **nie ma podpowiedzi ani feedbacku** do końca podejścia (świadomie).
- Wszystkie **pytania krytyczne (bezpieczeństwo)** muszą być poprawne — to warunek konieczny niezależnie od %.
- Masz **3 podejścia**. Po zaliczeniu zobaczysz wynik i (jeśli zaliczone) certyfikat.

## 5. Pobierz wynik (WAŻNE — przekaż koordynatorowi)

Na ekranie wyniku kliknij **„Pobierz wynik (JSON)”**, **„Pobierz wynik (CSV)”** oraz **„Pobierz odpowiedzi
pytań (CSV)”**. Pobiorą się pliki `wynik-S1.json` / `wynik-S1.csv` oraz `pytania-S1.csv` (analogicznie S2/S3).
**Odeślij wszystkie trzy pliki koordynatorowi** kanałem wskazanym w planie komunikacji. Plik `pytania-*.csv` jest
potrzebny do kalibracji pytań po pilotażu.

> Plik `wynik-*` zawiera tylko: ścieżkę, wynik %, czy zaliczone, czy pytania krytyczne zaliczone, liczbę podejść,
> ID zaliczenia, słabe moduły i wyniki zadań praktycznych. Plik `pytania-*.csv` zawiera, **anonimowo**, dla każdego
> pytania z quizów: id pytania, moduł i 0/1 poprawności (z pierwszej próby). **Żaden plik nie zawiera danych
> osobowych.** Imię na certyfikacie (jeśli podane) zostaje tylko w Twojej przeglądarce — nie ma go w eksportach.

## 6. Wypełnij ankietę feedbacku

Po teście wypełnij krótką ankietę (link od koordynatora) — patrz `formularz-feedbacku.md`. Zgłoś tam każde
pytanie, które było **niejasne** lub dwuznaczne (podaj ID pytania, np. „Q042”) — to klucz do kalibracji.

## Problemy?

- **Nie ładuje się / „Nie udało się załadować”** → otwórz przez link http(s) od koordynatora, nie z pliku.
- **Zgubiony postęp** → upewnij się, że to ta sama przeglądarka i że nie wyczyszczono danych witryny.
- **Chcesz zacząć od nowa** → przycisk „Zacznij od nowa” kasuje postęp w tej przeglądarce (nieodwracalne).
- Inne problemy → kanał wsparcia z planu komunikacji.
