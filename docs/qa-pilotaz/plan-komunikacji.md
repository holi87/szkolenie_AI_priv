# Plan komunikacji i wsparcia pilotażu

Pilotaż: **8–15 osób** reprezentujących ścieżki S1–S3 (wymagania/07). Cel: walidacja treści, pytań i UX przed
release 1.0; zebranie wyników, czasu, ścieżki i feedbacku do kalibracji (#28).

## Role

| Rola | Odpowiedzialność |
|---|---|
| Koordynator pilotażu | Rekrutacja, przydział ścieżek, wysyłka instrukcji/ankiety, zbiórka plików wyników, eskalacje |
| Lead Instructional Designer + SME | Sign-off merytoryczny przed startem (#26), analiza kalibracji po pilotażu (#28) |
| Security/Governance | Sign-off bezpieczeństwa przed startem (pytania krytyczne, dane) |
| Sponsor | Akceptacja zakresu danych zbieranych w pilotażu; decyzja go/no-go do release |

## Harmonogram (orientacyjnie, 2 tygodnie)

| Krok | Kiedy | Działanie |
|---|---|---|
| T-3 dni | przed startem | Sign-off SME + Security; wysłanie instrukcji uczestnika i linku |
| Dzień 0 | start | Krótki kick-off (15 min): cel, jak pobrać wynik, kanał wsparcia |
| Dni 1–10 | realizacja | Uczestnicy przechodzą szkolenie we własnym tempie; koordynator monitoruje, wspiera |
| Dzień 7 | przypomnienie | Przypomnienie o ukończeniu + ankiecie |
| Dni 11–12 | zbiórka | Zbiórka plików `wynik-*.json/csv` + ankiet; sanity check kompletności |
| Dzień 13+ | kalibracja | Agregacja → `pilot-results.json` → `node tools/calibration/calibrate.mjs` → raport (#28) |
| +30 dni | follow-up | Quiz retencji + pytanie o użycie w pracy (Kirkpatrick 2/3) |

## Kanały

- **Wsparcie techniczne/merytoryczne:** wskazany kanał (np. dedykowany wątek Slack/Teams lub adres koordynatora).
- **Zbiórka wyników:** uczestnik odsyła `wynik-<ścieżka>.json`, `.csv` **oraz** `pytania-<ścieżka>.csv`
  (eksport per-pytanie, potrzebny do kalibracji) koordynatorowi (kanał jak wyżej).
- **Ankieta:** link do formularza (z `formularz-feedbacku.md`) — anonimowa, identyfikator typu „P03”.

## Zbiórka i agregacja danych do kalibracji

> Sam `wynik-*.json/csv` to agregaty (wynik %, ścieżka, słabe moduły) i **nie wystarcza** do kalibracji pytań.
> Per-pytanie `attempts`/`correct` pochodzą z eksportu **`pytania-<ścieżka>.csv`** (anonimowo, źródło: quiz inline).

1. Koordynator zbiera od każdego uczestnika `pytania-<ścieżka>.csv` (per-pytanie) + `wynik-*` + ankiety.
2. Z ankiet (pole „pytania niejasne”) liczy **zgłoszenia niejasności per pytanie**.
3. **Sumuje eksporty per-pytanie między uczestnikami** i buduje `pilot-results.json` wg
   `genai-llm-training/data/schemas/pilot-results.schema.json` (per pytanie: `attempts` = liczba odpowiadających,
   `correct` = liczba poprawnych z 1. próby; `ambiguityReports` z ankiet; `byPath` = rozkład uczestników;
   `synthetic: false`). **Dane zagregowane, bez PII.**
4. Uruchamia `node genai-llm-training/tools/calibration/calibrate.mjs ścieżka/do/pilot-results.json` → raport
   kalibracji (patrz `raport-kalibracji.md`). Narzędzie najpierw waliduje plik (8–15 osób, liczby całkowite,
   `correct<=attempts<=uczestnicy`, spójność z `byPath`) i przy niemożliwych danych kończy `exit 1`.

---

## Informacja dla sponsora — jakie dane zbieramy

> Do uzgodnienia ze sponsorem **przed startem**.

**Zbieramy (zagregowane, na potrzeby walidacji szkolenia):**
- Z eksportu wyniku: ścieżka, wynik %, zaliczenie (tak/nie), zaliczenie pytań krytycznych, liczba podejść,
  ID zaliczenia (deterministyczny skrót, nie zawiera danych osobowych), słabe moduły, wyniki zadań praktycznych,
  czas spędzony w modułach (KPI Time to complete).
- Z eksportu per-pytanie (`pytania-*.csv`): id pytania, moduł, 0/1 poprawności z 1. próby (anonimowo) — do kalibracji.
- Z ankiety: NPS, przydatność, trudność, oceny per moduł, zgłoszenia niejasności pytań, komentarze, identyfikator
  anonimowy (np. „P03”).

**NIE zbieramy:**
- Nazwisk, e-maili, danych klienta ani żadnych PII. Imię na certyfikacie (opcjonalne) pozostaje **wyłącznie
  w przeglądarce uczestnika** — nie ma go w eksportach.
- Treści odpowiedzi otwartych ani wpisywanych w polach. Eksport per-pytanie zawiera tylko id pytania i 0/1
  poprawności (nie zawiera wybranych opcji ani treści).

**Gdzie są dane:**
- Postęp uczestnika: **localStorage** jego przeglądarki (MVP, bez backendu — ADR-0001). Uczestnik kontroluje
  swoje dane i może je skasować przyciskiem „Zacznij od nowa”.
- Wyniki przekazane koordynatorowi: pliki, które uczestnik świadomie pobiera i odsyła.

**Zgodność z polityką danych:** wszystkie przykłady w szkoleniu są syntetyczne (NotkaApp/SklepDemo/PipeDemo,
domena `przyklad.test`); zweryfikowane automatycznie (lint w `validate.mjs`) i w recenzji security (#26).
