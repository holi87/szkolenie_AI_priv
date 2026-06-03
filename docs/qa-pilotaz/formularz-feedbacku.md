# Formularz feedbacku (pilotaż)

Specyfikacja ankiety do wpięcia w narzędzie zewnętrzne (np. Google Forms / MS Forms / Typeform). Aplikacja
jest statyczna i **nie zbiera ankiet sama** — koordynator tworzy formularz z poniższych pól i zbiera odpowiedzi
osobno. Pola pokrywają model ewaluacji Kirkpatricka poz. 1 (reakcja) oraz KPI z wymagania/10 (NPS, przydatność,
trudność, Time to complete) i zasilają kalibrację pytań (#28).

## Metadane (na start ankiety)

1. **Identyfikator uczestnika** (anonimowy, np. „P03” — przydzielony przez koordynatora). *krótki tekst*
2. **Ścieżka** — S1 / S2 / S3. *jednokrotny*
3. **Czy ukończyłeś test końcowy?** — tak / nie / w trakcie. *jednokrotny*
4. **Przybliżony czas spędzony łącznie** (godziny). *liczba* — kontrola KPI „Time to complete”.

## Reakcja i NPS (Kirkpatrick 1)

5. **Na ile prawdopodobne, że polecisz to szkolenie koledze z zespołu?** — skala **0–10** (NPS). *skala*
6. **Przydatność szkolenia w Twojej pracy** — skala **1–5**. *skala* (cel: ≥ 4/5)
7. **Trudność szkolenia** — zdecydowanie za łatwe / trochę za łatwe / w sam raz / trochę za trudne / zdecydowanie
   za trudne. *jednokrotny*
8. **Tempo i długość** — za krótkie / odpowiednie / za długie. *jednokrotny*
9. **Co było najbardziej wartościowe?** *tekst*
10. **Co było mylące lub zbędne?** *tekst*

## Ocena per moduł (tylko moduły, które przeszedłeś)

Dla każdego ukończonego modułu (M1–M12) — macierz:

11. **Zrozumiałość modułu** — 1–5. *skala / wiersz macierzy*
12. **Przydatność modułu** — 1–5. *skala / wiersz macierzy*
13. **Interakcja (ćwiczenie) w module była pomocna?** — tak / częściowo / nie. *jednokrotny / wiersz*

## Pytania i ocena (zasila kalibrację #28)

14. **Czy któreś pytanie było niejasne lub dwuznaczne?** Podaj **ID pytania** (np. „Q042”) i krótko dlaczego.
    *tekst wieloliniowy* — KRYTYCZNE dla kalibracji (liczba zgłoszeń niejasności).
15. **Czy któreś pytanie wydało się błędnie ocenione** (Twoja odpowiedź była poprawna, a oznaczono ją jako złą)?
    Podaj ID i opis. *tekst wieloliniowy*
16. **Pytania krytyczne (bezpieczeństwo)** — czy były jasne? — tak / nie (jeśli nie, podaj ID). *jednokrotny + tekst*
17. **Zadanie praktyczne** (S2/S3) — czy kryteria oceny były jasne? — tak / częściowo / nie. *jednokrotny*

## Zachowanie i wdrożenie (Kirkpatrick 3 — opcjonalnie)

18. **Czy zamierzasz użyć checklisty bezpieczeństwa GenAI w realnej pracy?** — tak / może / nie. *jednokrotny*
19. **Czego zabrakło, byś czuł się pewnie używając GenAI w pracy?** *tekst*

## Techniczne

20. **Problemy techniczne** (ładowanie, zapis postępu, urządzenie/przeglądarka)? *tekst*
21. **Urządzenie i przeglądarka** (np. „MacBook, Chrome”). *krótki tekst*

---

## Follow-up po 30 dniach (retencja — Kirkpatrick 2/3, osobna wysyłka)

- Krótki quiz 5–8 pytań z banku (retencja ≥ 70% pierwotnego wyniku — KPI).
- 1 pytanie: czy realnie użyłeś technik/checklisty w pracy? — tak / nie + przykład.

> **Dane:** ankieta jest **anonimowa** (tylko identyfikator typu „P03”). Nie zbieramy nazwisk, e-maili ani danych
> klienta. Zakres zbieranych danych opisuje `plan-komunikacji.md` (informacja dla sponsora).
