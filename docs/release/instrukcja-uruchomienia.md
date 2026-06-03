# Instrukcja uruchomienia — szkolenie GenAI i LLM (release 1.0)

Aplikacja jest **statyczna** (HTML + CSS + ES modules, bez buildu, bez zależności — ADR-0002). Dane `data/*.json`
ładują się przez `fetch()`, więc wymaga **serwera http(s)** — otwarcie przez `file://` nie zadziała (CORS).

## A. Wersja wdrożona (dla uczestnika)

Nic nie instalujesz — wejdź na **`https://ai-slop.win/`** (przekieruje do aplikacji). Postęp zapisuje się lokalnie
w przeglądarce (localStorage). Szczegóły dla uczestnika pilotażu: [`../qa-pilotaz/instrukcja-uczestnika.md`](../qa-pilotaz/instrukcja-uczestnika.md).

## B. Uruchomienie lokalne (od zera)

Wymagany dowolny statyczny serwer http. Z katalogu aplikacji `genai-llm-training/`:

```bash
cd genai-llm-training

# Python (zwykle preinstalowany)
python3 -m http.server 8000
#   → http://localhost:8000/

# albo Node (bez instalacji paczek)
npx --yes serve -l 8000 .
#   → http://localhost:8000/
```

Otwórz `http://localhost:8000/` — zobaczysz ekran wyboru ścieżki. To wszystko; nie ma kroku „build”.

> Otwierając z **korzenia repozytorium** (a nie z `genai-llm-training/`), wejdź na
> `http://localhost:8000/genai-llm-training/` — albo skorzystaj z przekierowania w `index.html` korzenia.

## C. Weryfikacja (dla utrzymujących)

Z korzenia repozytorium:

```bash
# Walidacja kontraktów i pokrycia danych (116 pytań, golden 24, krytyczne, lint syntetyczny)
node genai-llm-training/tests/schema-validation/validate.mjs

# Testy silników + smoke render + a11y + dane negatywne (pure Node, zero zależności)
node --test genai-llm-training/tests/smoke/*.test.mjs

# Self-test narzędzia kalibracji
node genai-llm-training/tools/calibration/calibrate.mjs --self-test
```

Oczekiwane: walidacja `exit 0`, testy `pass` (122), self-test `exit 0`. Te same bramki uruchamia CI
(`validate-data`, `frontend-tests`).

## D. Wymagania środowiska

- **Przeglądarka:** nowoczesna z obsługą ES modules i `localStorage` (Chrome/Edge/Firefox/Safari aktualne).
- **Lokalnie:** Node 20+ (testy/serwer) **lub** Python 3 (serwer). Do samego uruchomienia aplikacji wystarczy
  dowolny statyczny serwer http.
- **Brak** instalacji paczek do uruchomienia aplikacji (zero `npm install`).
