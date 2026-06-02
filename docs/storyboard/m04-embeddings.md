# Storyboard — M4: Embeddings i podobieństwo semantyczne

| Pole | Wartość |
|---|---|
| Moduł | M4 |
| Czas | 50 min |
| Ścieżki | S1: opcjonalny; S2: opcjonalny ROZSZERZONY; S3: obowiązkowy |
| Element interaktywny | „Mapa semantyczna” (wizualizacja embeddings 2D) |
| Quiz inline | 8 pytań, Q25–Q32 (Q25–Q27 single; Q28–Q30 multiple; Q31–Q32 scenariusz diagnostyczny) |

> **Uwaga o gatingu (z curriculum, wymagania/06 — autorytatywne).** M4 **nie ma** wariantu skróconego ani świadomościowego. Gradient głębokości biegnie odwrotnie niż w M2/M6: S2 dostaje wersję **rozszerzoną** (więcej, nie mniej), S3 jest obowiązkowy w pełni. Dlatego nie pomijamy ekranów „w wersji skróconej”. Zamiast tego ekrany **rdzeniowe** są dostępne dla wszystkich ścieżek (S1/S2/S3), a ekrany **pogłębiające** (edge case’y, diagnostyka) oznaczamy jako „pogłębienie: S2 rozszerzony / S3” — to one są opcjonalne dla uczestnika S1.

---

## Efekty uczenia

- **E1** — Uczestnik wyjaśnia embeddings (wektory semantyczne, ang. *embeddings*) jako liczbową reprezentację znaczenia tekstu.
- **E2** — Uczestnik interpretuje cosine similarity (podobieństwo kosinusowe, ang. *cosine similarity*) jako miarę bliskości **kierunku** wektorów, a nie ich długości.
- **E3** — Uczestnik wskazuje **4 przypadki**, w których wysoki wynik podobieństwa **nie oznacza** poprawnej odpowiedzi (semantycznie blisko, biznesowo źle).
- **E4** — Uczestnik dobiera przykładowe zapytanie do wyszukiwania semantycznego (ang. *semantic search*).

---

## Sekwencja ekranów

| # | Tytuł ekranu | Typ | Cel/treść (skrót, ≤300 słów) | Efekt(y) | Ścieżki/wariant |
|---|---|---|---|---|---|
| 1 | Po co testerowi embeddings | treść | Cel modułu + dlaczego ważny dla QA. Embeddings i podobieństwo semantyczne stoją pod wyszukiwarką dokumentacji, deduplikacją zgłoszeń i RAG (M5–M6). Tester, który rozumie, czemu „podobne” bywa „błędne”, lepiej diagnozuje wyniki wyszukiwania i nie ufa rankingowi w ciemno. Zapowiedź ścieżki ekranów i elementu „Mapa semantyczna”. | E1 | S1/S2/S3 (rdzeń) |
| 2 | Słowo jako wektor | treść | E1: model embeddingowy (ang. *embedding model*) zamienia tekst na wektor (ang. *vector*) liczb. Bliskie znaczenia → bliskie wektory. Intuicja: „logowanie” i „uwierzytelnianie” lądują blisko, „faktura” daleko. Synt. mini-przykład 3 fraz z umownymi współrzędnymi. Tekstowa wersja diagramu obok rysunku. | E1 | S1/S2/S3 (rdzeń) |
| 3 | Cosine similarity — kierunek, nie długość | treść | E2: cosine similarity mierzy kąt między wektorami; wynik od −1 do 1 (w praktyce 0–1 dla tekstu). Kluczowa intuicja: liczy się **kierunek** znaczenia, nie długość/„siła” tekstu — długi i krótki opis tego samego są blisko. Synt. tabela 3 par fraz z wartościami podobieństwa. | E2 | S1/S2/S3 (rdzeń) |
| 4 | Jak czytać ranking podobieństwa | treść | E2: nearest neighbors (ang. *najbliżsi sąsiedzi*) — lista wyników posortowana malejąco po podobieństwie. Co znaczy 0.91 vs 0.62; że próg jest umowny i zależny od korpusu; że wysoka pozycja ≠ trafność. Most do E3. Synt. lista 5 fragmentów z wynikami. | E2 | S1/S2/S3 (rdzeń) |
| 5 | Pułapka: podobne ≠ poprawne — 4 przypadki | treść | E3 (rdzeń modułu): 4 typy, gdy wysokie podobieństwo myli. (1) **Negacja/antonim** — „logowanie działa” vs „logowanie nie działa” są semantycznie blisko. (2) **Ten sam temat, inna intencja** — opis funkcji vs zgłoszenie błędu tej funkcji. (3) **Wieloznaczność (polisemia)** — „token” bezpieczeństwa vs „token” w LLM. (4) **Nieaktualna wersja** — stary i nowy zapis wymagania bardzo podobne, ale tylko nowy jest poprawny. Wszystkie przykłady syntetyczne. | E3 | S1/S2/S3 (rdzeń) |
| 6 | Pogłębienie: dlaczego model się myli | treść | Pogłębienie E3: krótko skąd biorą się te pułapki — embedding koduje temat/styl mocniej niż drobne, ale krytyczne różnice (negacja, wersja, intencja). Wniosek dla QA: ranking podobieństwa to sygnał, nie wyrok; potrzebna weryfikacja treści. Most do M5 (filtrowanie metadanych) i M11 (weryfikacja). | E3 | pogłębienie: S2 rozszerzony / S3 |
| 7 | Dobór zapytania do wyszukiwania semantycznego | treść | E4: jak formułować zapytanie (ang. *query*), by trafić w intencję — pełna fraza zamiast pojedynczego słowa, doprecyzowanie kontekstu i wersji, unikanie samej negacji jako zapytania. Synt. para „słabe vs lepsze zapytanie” i jak zmienia listę wyników. | E4 | S1/S2/S3 (rdzeń) |
| 8 | Chcesz pogłębić? | decyzja | Decyzja ścieżki: kontynuacja do pełnej „Mapy semantycznej” z przypadkami diagnostycznymi (S2 rozszerzony / S3, zalecane) albo skok do uproszczonej wersji i quizu (S1). Jeden wybór, bez ściany tekstu; widoczny „następny najlepszy krok”. | E3, E4 | decyzja gatingu (rdzeń) |
| 9 | Mapa semantyczna | interakcja | Element interaktywny: uczestnik przesuwa zapytania i fragmenty na mapie 2D i obserwuje, które są blisko semantycznie, ale niepoprawne biznesowo (np. para z negacją z ekranu 5). Pełny opis + alternatywa klawiaturowa w sekcji niżej. | E1, E2, E3, E4 | S1/S2/S3; pełny zestaw przypadków w S2 rozszerzony / S3, uproszczony w S1 |
| 10 | Quiz inline (Q25–Q32) | quiz-inline | 8 pytań w trybie nauki (feedback i wyjaśnienie od razu po odpowiedzi). Q25–Q27 single, Q28–Q30 multiple, Q31–Q32 scenariusz diagnostyczny. Mapowanie kompetencji w sekcji „Quiz inline”. Brak pytań krytycznych. | E1, E2, E3, E4 | S1/S2/S3 (rdzeń); Q31–Q32 oznaczone jako pogłębione |
| 11 | Podsumowanie i następny krok | podsumowanie | Skrót: embeddings = znaczenie jako wektor; cosine = kierunek; 4 pułapki podobieństwa; jak formułować zapytanie. „Następny krok →” do M5 (Vector databases i similarity search). Widoczny postęp procentowy. | E1, E2, E3, E4 | S1/S2/S3 (rdzeń) |

---

## Element interaktywny — szczegół

**Nazwa:** „Mapa semantyczna” (wizualizacja embeddings 2D).

**Działanie.** Na uproszczonej mapie 2D rozłożone są punkty: zapytania i fragmenty dokumentacji. Uczestnik przesuwa zapytanie/fragment i obserwuje, jak zmienia się lista najbliższych semantycznie fragmentów oraz ich wartości podobieństwa. Cel dydaktyczny: pokazać pary, które są blisko siebie (wysokie cosine similarity), ale **niepoprawne biznesowo** — zwłaszcza przypadki z ekranu 5 (negacja, inna intencja, wieloznaczność, nieaktualna wersja).

- **Dane wejściowe (syntetyczne):** zestaw zapytań i fragmentów dokumentacji QA, np. zapytanie „logowanie nie działa po aktualizacji” oraz fragmenty: „instrukcja logowania v1”, „logowanie działa poprawnie”, „znany błąd: logowanie blokuje się po update v2”. Zero realnych danych klienta / PII.
- **Output:** dla wybranego punktu — lista najbliższych fragmentów z wartością podobieństwa przy każdym (np. 0.88, 0.74, 0.61), oraz tekstowe oznaczenie, czy najbliższy wynik jest poprawny biznesowo, czy to pułapka (z odwołaniem do typu z ekranu 5).

**Alternatywa klawiaturowa / niedragowa (OBOWIĄZKOWA, zgodnie z docs/design-baseline.md §6).**
Wariant w pełni klawiaturowy bez przeciągania: **lista wyboru zapytania** (radio/`select`) + wynikowa **lista najbliższych fragmentów z wartościami podobieństwa podanymi tekstem**. Uczestnik wybiera zapytanie z klawiatury, a system wypisuje uporządkowaną listę fragmentów z wynikiem liczbowym i tekstowym komentarzem (poprawny / pułapka + typ). To dokładnie wariant z baseline (M4: „Lista najbliższych fragmentów z wartościami podobieństwa (tekst)”).

- Każdy element fokusowalny, logiczna kolejność Tab, **widoczny focus** (kontrast ≥ 3:1).
- **Feedback tekstowy**, nie tylko wizualny: wynik liczbowy + zdanie wyjaśniające, dlaczego wynik bywa mylący.
- Mapa 2D ma **opis alternatywny / wersję tekstową** (WCAG 1.1.1) — ta sama informacja co na rysunku dostępna jako lista.
- Reflow bez poziomego scrolla do 320 px; sprawdzenie też przy 360 px.

---

## Quiz inline

- **Liczba pytań:** 8. **Identyfikatory:** Q25–Q32. **Pytania krytyczne:** brak.
- **Typy i mapowanie:**
  - **Q25–Q27 — single choice:** rozpoznanie pojęć — embeddings jako reprezentacja znaczenia (E1), cosine similarity jako miara kierunku (E2).
  - **Q28–Q30 — multiple choice:** rozróżnianie poprawnych i mylących sygnałów podobieństwa; cechy dobrego zapytania semantycznego (E2, E3, E4).
  - **Q31–Q32 — scenariusz diagnostyczny:** uczestnik diagnozuje, dlaczego wysoki wynik podobieństwa zwrócił fragment niepoprawny biznesowo, i wskazuje typ pułapki (E3) — najsilniej powiązane z elementem interaktywnym.
- **Tryb nauki:** feedback i wyjaśnienie natychmiast po odpowiedzi (zgodnie z design-baseline §2.2), z linkiem do powiązanej sekcji.

---

## Mapowanie na efekty i pytania

| Efekt | Ekrany | Pytania |
|---|---|---|
| **E1** — embeddings jako liczbowa reprezentacja znaczenia | 1, 2, 9 | Q25–Q27 (single) |
| **E2** — cosine similarity jako bliskość kierunku wektorów | 3, 4, 9 | Q25–Q27 (single); Q28–Q30 (multiple) |
| **E3** — 4 przypadki: wysokie podobieństwo ≠ poprawna odpowiedź | 5, 6, 8, 9 | Q28–Q30 (multiple); Q31–Q32 (scenariusz diagnostyczny) |
| **E4** — dobór zapytania do wyszukiwania semantycznego | 7, 8, 9 | Q28–Q30 (multiple) |
