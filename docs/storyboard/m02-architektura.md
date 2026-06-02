# Storyboard — M2: Architektura LLM na poziomie praktycznym

| Pole | Wartość |
|---|---|
| Moduł | M2 |
| Czas | 45 min |
| Ścieżki | S1: obowiązkowy SKRÓCONY; S2: obowiązkowy; S3: obowiązkowy |
| Element interaktywny | „Licznik kontekstu” (symulacja skracania dokumentu) |
| Pula modułu | Q9–Q17 (9 pytań) — zasila również test końcowy |
| Quiz inline | 5–8 pytań losowanych z puli modułu |

## Efekty uczenia

- **E1** — Uczestnik wyjaśnia, czym jest token (token) i dlaczego długi dokument może przekroczyć okno kontekstu (context window).
- **E2** — Uczestnik wskazuje 3 skutki zbyt małego kontekstu.
- **E3** — Uczestnik opisuje transformer (transformer) intuicyjnie, jako mechanizm uczenia relacji między tokenami za pomocą uwagi (attention).
- **E4** — Uczestnik rozpoznaje, że liczba parametrów (parameters) nie jest samodzielną gwarancją jakości.

## Sekwencja ekranów

| # | Tytuł ekranu | Typ | Cel/treść (skrót, ≤300 słów) | Efekt(y) | Ścieżki/wariant |
|---|---|---|---|---|---|
| 1 | Po co testerowi architektura LLM | treść | Cel modułu i dlaczego to ważne dla QA: model nie „czyta” dokumentu jak człowiek — pracuje na tokenach i ma skończone okno kontekstu. Konsekwencje praktyczne: ucięty wymóg, pominięty fragment specyfikacji, halucynacja przy zbyt długim wejściu. Zapowiedź 4 efektów (E1–E4) i interakcji „Licznik kontekstu”. Bez żargonu — obietnica intuicji, nie matematyki. | E1,E2,E3,E4 | Wszystkie. S1: skrócony — krótszy wstęp, akcent na ryzyko biznesowe i decyzję „czy zmieści się dokument”. |
| 2 | Token i tokenizacja | treść | Co to token (token): nie słowo, lecz fragment tekstu (część słowa, znak, spacja). Tokenizacja (tokenization) = rozbicie tekstu na tokeny przed przetwarzaniem. Przykład syntetyczny: zdanie z fikcyjnego raportu testowego „Zlecenie ZX-204 nie przeszło walidacji” → ile to ~tokenów (orientacyjnie). Wskazówka: 1 token ≈ kilka znaków, język polski bywa „droższy” w tokenach niż angielski. Po co testerowi: koszt (inference cost) i limit liczy się w tokenach, nie w stronach. | E1 | Wszystkie. S1: skrócony — tylko definicja + „liczymy w tokenach, nie w słowach”, bez przykładu liczbowego. |
| 3 | Okno kontekstu — dlaczego długi dokument nie wchodzi w całości | treść | Okno kontekstu (context window) = maksymalna liczba tokenów, jaką model „widzi” naraz (wejście + odpowiedź). Gdy dokument + pytanie + odpowiedź przekraczają limit, część wejścia musi wypaść. Analogia: biurko o stałej powierzchni — nowe kartki spychają stare. Przykład syntetyczny: fikcyjna specyfikacja 80 stron vs. okno modelu. Wniosek: „wkleiłem cały dokument” ≠ „model to przeczytał”. | E1 | Wszystkie. S1: skrócony — analogia biurka + jedna zasada decyzyjna („sprawdź, czy dokument mieści się w oknie”). |
| 4 | Trzy skutki zbyt małego kontekstu | treść | Konkretnie 3 skutki, gdy istotny fragment wypada z okna: (1) pominięcie informacji — model odpowiada bez kluczowego wymogu; (2) niespójność — model „zapomina” wcześniejsze ustalenia w długiej rozmowie; (3) halucynacja/zgadywanie — brak danych zastąpiony zmyśleniem. Każdy skutek z mini-przykładem QA (syntetyczny). To bezpośredni materiał do Q12–Q13 (multiple choice). | E2 | Wszystkie. S1: skrócony — lista 3 skutków bez rozbudowanych przykładów; akcent: „dlaczego to ryzyko dla jakości decyzji”. |
| 5 | Transformer i uwaga — intuicja | treść | Transformer (transformer) intuicyjnie: mechanizm, który uczy się, które tokeny są ze sobą powiązane, niezależnie od odległości w tekście. Uwaga (attention) = „na co model patrzy”, łącząc np. zaimek z rzeczownikiem sprzed wielu zdań. Bez wzorów: schemat „każdy token waży powiązanie z innymi”. Tu rodzi się porządek kroków procesu (materiał do Q14–Q15: kolejność). Wersja tekstowa diagramu obowiązkowa (WCAG 1.1.1). | E3 | S2, S3 pełne. **S1: UPROSZCZONY** — jedno zdanie „model uczy się powiązań między fragmentami”, bez pojęcia attention i bez diagramu kroków. S3: dodatkowy akapit o kosztach uwagi przy długim kontekście (inference cost). |
| 6 | Więcej parametrów ≠ lepsza jakość | treść | Parametry (parameters) = „pojemność” modelu, ale liczba parametrów nie gwarantuje trafności dla konkretnego zadania QA. Co realnie decyduje: dopasowanie do zadania, jakość danych, długość okna kontekstu, sposób promptowania. Przykład syntetyczny: większy model myli się na fikcyjnym formacie ID defektu, mniejszy z lepszym kontekstem trafia. Antywzorzec: wybór modelu „bo ma więcej miliardów parametrów”. | E4 | Wszystkie. S1: skrócony — jedno zdanie + zasada zakupowa/decyzyjna („nie kupuj po liczbie parametrów”). |
| 7 | Interakcja: Licznik kontekstu | interakcja | Symulacja skracania dokumentu: uczestnik zmniejsza okno kontekstu i widzi, które fragmenty syntetycznej specyfikacji wypadają oraz jakie pytania przestają być możliwe do poprawnej odpowiedzi. Łączy E1 (mechanizm okna) i E2 (skutki). Szczegóły i alternatywa klawiaturowa w sekcji „Element interaktywny”. | E1,E2 | Wszystkie. S1: skrócony — start z gotowym scenariuszem i 2 fragmentami zamiast pełnej listy; ten sam mechanizm i wnioski. |
| 8 | Quiz inline (5–8 z puli Q9–Q17) | quiz-inline | 5–8 pytań losowanych z puli modułu (Q9–Q17), z natychmiastowym feedbackiem i wyjaśnieniem (tryb nauki, zgodnie z design-baseline). Pula: Q9–Q11 single, Q12–Q13 multiple, Q14–Q15 kolejność procesu, Q16–Q17 scenariusz. Sprawdza E1–E4. Brak pytań krytycznych w tym module. | E1,E2,E3,E4 | Wszystkie ścieżki — 5–8 z puli Q9–Q17, dobranych do treści widzianej na danej ścieżce. S1 (SKRÓCONY): dobór pomija pytania o kolejność procesu (Q14–Q15), spójnie z uproszczeniem ekranu 5. |
| 9 | Podsumowanie i następny krok | podsumowanie | Domknięcie: token i okno kontekstu → 3 skutki za małego kontekstu → transformer/uwaga intuicyjnie → parametry to nie jakość. Widoczny postęp i „następny najlepszy krok”: M3 — parametry generacji (temperature, top-p, max tokens). | E1,E2,E3,E4 | Wszystkie. S1: skrócony — 4 zdania kluczowe + wskazanie dalszej ścieżki. |

## Element interaktywny — szczegół

**Nazwa:** „Licznik kontekstu” — symulacja skracania dokumentu.

**Działanie:** Uczestnik ustawia rozmiar okna kontekstu (w tokenach) dla syntetycznej specyfikacji testowej. W miarę zmniejszania okna kolejne fragmenty „wypadają” (są wyszarzone z etykietą tekstową „poza kontekstem”), a lista pytań kontrolnych aktualizuje status: „możliwe do odpowiedzi” / „niemożliwe — brak fragmentu X”. Cel: pokazać związek okna kontekstu z realną zdolnością modelu do odpowiedzi (E1, E2).

**Dane wejściowe (syntetyczne, zero PII):**
- Fikcyjna specyfikacja: 6 sekcji (np. „Zakres ZX-204”, „Kryteria akceptacji”, „Dane testowe”, „Środowisko”, „Ryzyka”, „Słownik”), każda z orientacyjną liczbą tokenów.
- Suwak/pole „rozmiar okna kontekstu (tokeny)”.
- Zestaw 4–5 pytań kontrolnych powiązanych z konkretnymi sekcjami.

**Output:**
- Wizualizacja: które sekcje są w oknie, a które wypadły (kolor + ikona + etykieta tekstowa — nie sam kolor, WCAG 1.4.1).
- Lista pytań z aktualnym statusem i tekstowym uzasadnieniem („to pytanie wymaga sekcji »Kryteria akceptacji«, która wypadła z okna”).
- Licznik: „X z Y tokenów w oknie”, „Z pytań nadal możliwych”.

**Alternatywa klawiaturowa / niedragowa (obowiązkowa, zgodnie z docs/design-baseline.md, sekcja 6):**
- Rozmiar okna ustawiany przez **pole liczbowe + natywny suwak `input[type=range]`** obsługiwany strzałkami (Home/End, PageUp/PageDown) — bez drag&drop.
- Wynik w pełni **tekstowy**: lista sekcji ze statusem „w oknie / poza kontekstem” oraz lista pytań „możliwe / niemożliwe” z uzasadnieniem.
- Widoczny focus na każdym kontrolce, logiczna kolejność Tab, feedback tekstowy po każdej zmianie (WCAG 2.1.1, 2.4.7, 3.3.1).
- Wersja tekstowa zastępuje wszelką wizualizację graficzną (WCAG 1.1.1).

## Quiz inline

- **Pula modułu:** Q9–Q17 (9 pytań) — zasila również test końcowy. **Quiz inline:** 5–8 pytań losowanych z puli, dobranych do treści widzianej na danej ścieżce (wg wymagania/07). Identyfikatory puli **Q9–Q17** zgodnie z curriculum (wymagania/06).
- **Mapowanie typów:**
  - **Q9–Q11** — single choice: rozpoznanie pojęć (token, tokenizacja, okno kontekstu, parametry).
  - **Q12–Q13** — multiple choice: skutki zbyt małego kontekstu (E2).
  - **Q14–Q15** — kolejność procesu: ułożenie kroków „od tekstu do odpowiedzi” (tokenizacja → okno kontekstu → przetwarzanie/uwaga → odpowiedź) (E3).
  - **Q16–Q17** — scenariusz: decyzja QA na podstawie sytuacji (np. długi dokument vs. okno; wybór modelu mimo większej liczby parametrów) (E1, E2, E4).
- **Sprawdzane kompetencje:** rozumienie tokenizacji i okna kontekstu, identyfikacja skutków za małego kontekstu, intuicja transformera/uwagi, świadomość, że parametry ≠ jakość.
- **Tryb:** inline (nauka) — natychmiastowy feedback i wyjaśnienie po każdej odpowiedzi (design-baseline 2.2).
- **Dobór dla S1 (SKRÓCONY):** dobór 5–8 pytań dla S1 **jawnie pomija pytania o kolejność procesu (Q14–Q15)**, spójnie z uproszczeniem ekranu 5 (attention/transformer bez diagramu kolejności kroków). Dzięki temu S1 nie jest oceniany z treści, której nie uczył. Treść attention i pula Q14–Q15 pozostają pełne dla S2/S3.
- **Pytania krytyczne:** brak w tym module.

## Mapowanie na efekty i pytania

| Efekt | Ekrany | Pytania |
|---|---|---|
| **E1** — token, tokenizacja, okno kontekstu, dlaczego długi dokument przekracza okno | 1, 2, 3, 7 | Q9–Q11, Q16–Q17 |
| **E2** — 3 skutki zbyt małego kontekstu | 1, 4, 7 | Q12–Q13, Q16–Q17 |
| **E3** — transformer i uwaga intuicyjnie | 1, 5 | Q14–Q15 |
| **E4** — liczba parametrów ≠ gwarancja jakości | 1, 6 | Q16–Q17 |
