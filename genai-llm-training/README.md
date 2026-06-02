# genai-llm-training

Statyczna aplikacja szkolenia GenAI i LLM dla QualityCat. Bazowa struktura (issue #3); treść i logika dochodzą w kolejnych milestone'ach (M2–M4).

## Architektura w skrócie

Statyczny HTML/CSS/JS + JSON, progres w `localStorage`, eksport wyniku, serwowane przez **GitHub Pages**. Pełna decyzja: [`../docs/adr/0001-architektura-statycznego-szkolenia.md`](../docs/adr/0001-architektura-statycznego-szkolenia.md). Hosting i ograniczenia: [`../docs/karta-projektu.md`](../docs/karta-projektu.md) §4.1.

## Struktura katalogów

```text
genai-llm-training/
  index.html        # shell aplikacji (placeholder; rozwijany w M3)
  assets/           # LOGIKA: engine + UI (JS), style (CSS) — bez treści szkoleniowej
  data/             # KONTRAKTY DANYCH (JSON): modules, questions, golden-set, scenarios, paths
  modules/          # TREŚĆ: m01–m12 (HTML) — bez logiki engine
  tests/
    schema-validation/  # walidacja danych z data/
    smoke/              # render, brak błędów JS, podstawowy przepływ
    accessibility/      # WCAG: klawiatura, kontrast, focus (zob. ../docs/design-baseline.md)
```

**Zasada separacji (AGENTS.md):** treść szkoleniowa (`modules/`, `data/`) jest oddzielona od logiki (`assets/`). Engine nie zawiera treści; treść nie zawiera logiki scoringu.

## Uruchomienie lokalne

Aplikacja ładuje dane z `data/*.json` przez `fetch()`, co **nie działa przez `file://`**. Uruchom lokalny statyczny serwer:

```bash
cd genai-llm-training
python3 -m http.server 8000
# otwórz http://localhost:8000
```

> Nie otwieraj `index.html` bezpośrednio (podwójnym kliknięciem) — `fetch()` plików JSON zablokuje schemat `file://`. Zawsze przez serwer http(s). Alternatywy: `npx serve`, dowolny statyczny serwer.

## Wdrożenie

Docelowo **GitHub Pages** (issue #33). Ścieżki w aplikacji muszą być względne, żeby działać z podścieżki `https://<user>.github.io/<repo>/`.

## Walidacja i testy

Katalog `tests/` ma miejsce na walidację danych (`schema-validation/`), smoke testy (`smoke/`) i testy dostępności (`accessibility/`). Konwencje i checklisty: [`../docs/standardy-jakosci.md`](../docs/standardy-jakosci.md).
