# Design baseline — szkolenie GenAI i LLM dla QualityCat

| Pole | Wartość |
|---|---|
| Issue | `#4 [04][M0] Zdefiniuj baseline UX, brandingu i dostępności` |
| Milestone | M0 Decyzje i architektura |
| Status | Baseline MVP (do recenzji UX/QA) |
| Zależności | `#1` (karta projektu) |

> **Zasada nadrzędna.** Baseline jest neutralny i samowystarczalny: **nie ma twardej zależności od niedostarczonego brandingu QualityCat** (P14). MVP startuje na neutralnych tokenach; branding podmieniany później bez zmian w strukturze. Dostępność (WCAG 2.1 AA) i czytelność dla zróżnicowanego odbiorcy (S1 nietechniczny → S3 inżynier) są wymogiem, nie dodatkiem.

---

## 1. Reguły treści i ekranu

- **Jeden ekran = jedna koncepcja lub jedna decyzja.** Maks. **250–300 słów** na sekcję ekranu (`wymagania/08`).
- Terminy techniczne po polsku z krótką definicją przy pierwszym użyciu; oryginał terminu w nawiasie.
- Każda tabela i diagram ma **wersję tekstową albo opis alternatywny** (WCAG 1.1.1).
- Motywacja: widoczny postęp procentowy i „następny najlepszy krok" na każdym ekranie modułu.

---

## 2. Layout

### 2.1 Ekran modułu
```
| ⤷ skip-link „Przejdź do treści" — 1. element w tab order   |  ← przed headerem
+------------------------------------------------------------+
| Logo/slot | Ścieżka S? | Progres ▓▓░                       |  ← header (sticky)
+----------------+-------------------------------------------+
| Nawigacja      | H1 tytuł modułu                          |
| modułów        | treść: 1 koncepcja, ≤300 słów            |
| (statusy)      | [interakcja / quiz inline]               |
|                | Feedback / „następny krok →"             |
+----------------+-------------------------------------------+
```
- Desktop: nawigacja boczna. Mobile: nawigacja zwijana (przycisk „Moduły"), treść jednokolumnowa, **brak poziomego scrolla — reflow do 320 px** (WCAG 1.4.10), dodatkowo sprawdzane przy 360 px.

### 2.2 Ekran quizu / testu
- Pytanie → opcje → przycisk zatwierdzenia → feedback.
- **Quiz inline**: feedback i wyjaśnienie natychmiast po odpowiedzi (tryb nauki).
- **Test końcowy**: brak podpowiedzi i feedbacku do zakończenia podejścia (tryb testu).
- Błędy walidacji opisane tekstem przy polu (WCAG 3.3.1/3.3.2), nie tylko kolorem.

---

## 3. Nawigacja i statusy modułów

| Status | Sygnał wizualny | Sygnał nie-kolorowy (wymagany) | ARIA |
|---|---|---|---|
| Ukończony | zielony znacznik | ikona ✓ + tekst „Ukończony" | `aria-label`, `aria-current` poza |
| Aktywny | wyróżnione tło | ikona ● + tekst „W toku", `aria-current="page"` | fokusowalny |
| Zablokowany | wyszarzony | ikona 🔒 + tekst „Zablokowany" + powód | natywnie wyłączony (`disabled`) **albo** zablokowana aktywacja; dodatkowo `aria-disabled="true"` |

Status **nigdy nie jest komunikowany samym kolorem** (WCAG 1.4.1) — zawsze ikona + tekst.

> Element zablokowany musi być **rzeczywiście niemożliwy do aktywacji** myszą i klawiaturą — `aria-disabled="true"` tylko ogłasza stan czytnikom ekranu, nie blokuje kliknięcia ani Enter/Spacji. Użyj natywnego `disabled` (lub jawnego przechwycenia/usunięcia akcji) z zachowaniem tekstu powodu blokady.

---

## 4. Typografia, kolor, kontrast

- Skala typograficzna responsywna; tekst skalowalny do **200% bez utraty treści** (WCAG 1.4.4).
- Bazowy rozmiar treści ≥ 16 px; długość wiersza treści ≤ ~75 znaków dla czytelności.
- **Kontrast (WCAG 1.4.3 / 1.4.11):** tekst ≥ 4.5:1, tekst duży ≥ 3:1, elementy UI i stany fokusu ≥ 3:1.
- Kolory definiowane jako **tokeny CSS** (custom properties) — patrz sekcja 7.

---

## 5. Focus states i obsługa klawiaturą

- **Każdy** element interaktywny osiągalny i obsługiwalny z klawiatury (WCAG 2.1.1), bez pułapek fokusu (2.1.2).
- **Widoczny focus** na każdym elemencie (2.4.7), kontrast obrysu ≥ 3:1.
- Logiczna kolejność Tab zgodna z kolejnością czytania (2.4.3).
- **Skip-link** „Przejdź do treści" jest **pierwszym fokusowalnym elementem strony** — przed headerem i nawigacją (2.4.1), żeby użytkownik klawiatury mógł ominąć powtarzalne kontrolki headera, a nie przez nie przechodzić.
- Kolejność fokusu: **skip-link → header → nawigacja → treść → interakcja → następny krok**.

---

## 6. Interakcje — wymóg alternatywy klawiaturowej

Każda interakcja z `wymagania/08` ma **niedragowy, w pełni klawiaturowy** wariant. Drag & drop = zawsze dodatkowo lista wyboru.

| Interakcja | Moduł | Alternatywa klawiaturowa (wymagana) |
|---|---|---|
| Klasyfikator zadań | M1 | Lista zadań; do każdego radio/`select` kategorii |
| Licznik kontekstu | M2 | Pole liczbowe + suwak natywny (strzałki), wynik tekstowy |
| Suwaki generacji | M3 | `input[type=range]` (klawiatura) + pola liczbowe temperature/top-p/max tokens |
| Mapa semantyczna | M4 | Lista najbliższych fragmentów z wartościami podobieństwa (tekst) |
| Retrieval debugger | M5 | Pola top-k/filtry; wyniki w tabeli precision/recall |
| Zbuduj pipeline RAG | M6 | Lista uporządkowana z przyciskami „w górę/w dół" lub `select` pozycji |
| Prompt clinic | M7 | `textarea` + checklista rubryki; feedback tekstowy element po elemencie |
| QA workbench | M8 | Formularz oceny (checkboxy: braki, ryzyka, duplikaty) |
| Agent permission board | M9 | Tabela uprawnień z checkboxami; ocena ryzyka tekstem |
| Data safety gate | M10 | Radio decyzji: dozwolone / anonimizuj / zakazane |
| Output verifier | M11 | Lista zdań; do każdego radio kategorii ryzyka |
| Judge calibration lab | M12 | Tabela porównań ocen z polami liczbowymi i polem rozjazdu |

Wszystkie warianty: fokusowalne, widoczny focus, **tekstowy feedback** (nie tylko wizualny).

---

## 7. Branding — neutralny i podmienialny (P14)

- Wszystkie kolory, font i logo jako **tokeny CSS** w jednym miejscu (np. `:root { --color-…; --font-… }`), gniazdo na logo.
- MVP używa neutralnej palety i systemowego stosu fontów; brak zależności od dostarczenia brandingu QualityCat.
- Podmiana brandingu = edycja tokenów, **bez** zmian w strukturze, layoutach i logice. To usuwa blokadę MVP wynikającą z P14.

---

## 8. Checklista WCAG 2.1 AA

- [ ] 1.1.1 Treść nietekstowa ma alternatywę tekstową (ikony, diagramy, mapy)
- [ ] 1.3.1 Struktura semantyczna (nagłówki, listy, powiązania pól z etykietami)
- [ ] 1.4.1 Informacja nie jest przekazywana samym kolorem (statusy: ikona + tekst)
- [ ] 1.4.3 Kontrast tekstu ≥ 4.5:1 (duży ≥ 3:1)
- [ ] 1.4.4 Tekst skalowalny do 200% bez utraty treści
- [ ] 1.4.10 Reflow — brak poziomego scrolla przy **320 px** (wymóg WCAG); 360 px = dodatkowy checkpoint projektu
- [ ] 1.4.11 Kontrast elementów nietekstowych i stanów ≥ 3:1
- [ ] 2.1.1 Pełna obsługa klawiaturą każdego elementu
- [ ] 2.1.2 Brak pułapek fokusu
- [ ] 2.4.1 Skip-link „Przejdź do treści"
- [ ] 2.4.3 Logiczna kolejność fokusu
- [ ] 2.4.6 Sensowne nagłówki i etykiety
- [ ] 2.4.7 Widoczny focus na każdym elemencie
- [ ] 3.3.1 / 3.3.2 Błędy identyfikowane tekstem; pola mają etykiety i instrukcje
- [ ] 4.1.2 Nazwa/rola/wartość (ARIA) dla komponentów (statusy, quiz, interakcje)

> Wymagany cel reflow to **320 px** (WCAG 1.4.10) — węższy ekran, więc warunek ostrzejszy niż 360 px. Layout musi działać bez poziomego scrolla już przy 320 px; 360 px z wymagań projektu jest dodatkowym, łagodniejszym punktem kontrolnym.

---

## 9. Kryteria akceptacji issue #4

- [x] Powstaje krótki design baseline — ten dokument.
- [x] Każdy typ interakcji ma wymóg alternatywy klawiaturowej — sekcja 6 (12/12 interakcji).
- [x] Wymagania WCAG 2.1 AA zapisane jako checklista — sekcja 8.
- [x] Brak zależności od niedostarczonego brandingu blokującej MVP — sekcja 7 (neutralne tokeny, podmiana bez zmian struktury).
