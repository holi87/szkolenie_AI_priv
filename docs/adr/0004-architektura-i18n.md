# ADR-0004: Architektura wielojęzyczności (i18n) — układ danych per-locale, parytet, przełącznik, ePrivacy

| Pole | Wartość |
|---|---|
| Status | Zaakceptowana |
| Issue | `#76 [M10] FUNDAMENT: ADR-0004 — architektura i18n (układ danych per-locale, parytet, przełącznik, ePrivacy)` |
| Rola decydenta | Solution Architect / właściciel |
| Powiązane | ADR-0001 (statyczny hosting, localStorage), ADR-0002 (vanilla static, zero buildu/zależności, ścieżki względne), ADR-0003 (brak banera cookie — `localStorage` jako „ściśle niezbędne"), realizacja: `#77` (t() + katalog), `#78` (układ per-locale), `#79` (przełącznik), `#80` (walidacja parytetu), milestone EN `#81`–`#84` |

---

## Kontekst

Kurs jest jednojęzyczny (PL), a wszystkie teksty są zaszyte w kodzie UI oraz w danych (`data/*.json`). Planujemy drugą wersję językową (EN), z architekturą skalowalną do kolejnych (de/fr/es/vi/cs) **bez przepisywania UI ani schematów**. Decyzje trzeba podjąć, zanim powstanie kod (styl ADR-0001..0003), bo dotykają warstwy danych, ładowania i walidacji jednocześnie.

Stan zastany istotny dla decyzji:

- `assets/core/data-loader.js` ma już punkt cutover: `loadTrainingData({ basePath })` (domyślnie `"data/"`, ścieżki **względne** — ADR-0002).
- Dane są **heterogeniczne**:
  - `golden-set.json` — czyste ID pytań + skład liczbowy (**language-neutral**).
  - `questions/`, `module-content/`, `rubrics.json`, `scenarios.json` — **tekstowo-dominujące** (prompt, opcje, feedback, rubryki, scenariusze).
  - `modules.json`, `paths.json` — **mieszane**: struktura krytyczna dla scoringu (gates, progi, `requiredModules`, `variant`, `questionRange`, `order`, `pillar`) + kilka stringów wyświetlanych (`name`, `keyConcepts`, `learningOutcomes`, `level`, `interactiveElement`, `assumedPathTime`).
- `assets/core/*` jest **zero-DOM**, ale niesie 3 user-facing stringi PL: `quiz-engine.js` (`CRITICAL_FAIL_MESSAGE`), `certificate.js` (`reason`), `paths.js` (`finalTestStatus().lockedReason`).
- ADR-0003 ustalił: zapis preferencji UI w `localStorage` = wyjątek „ściśle niezbędne" (art. 5(3) ePrivacy) → bez banera.
- Walidator (`tests/schema-validation/validate.mjs`) ma własny zero-dep mini-JSON-Schema i egzekwuje pokrycie banku 116 pytań, budżet trudności, 5 pytań krytycznych, golden set i parytet `questionRange`.

## Decyzja

Decyzje są **wiążące** dla `#77`–`#84`.

### A. Układ danych — per-locale (A1), PL kanoniczny

Treść tłumaczona trafia do katalogów per-locale `data/<lang>/`, PL jest źródłem kanonicznym:

```
data/
  golden-set.json          # WSPÓLNY (language-neutral: ID pytań + skład)
  modules.json             # WSPÓLNY — struktura (single-source)
  paths.json               # WSPÓLNY — struktura + gates/progi (single-source)
  schemas/                 # WSPÓLNE — kontrakty
  pl/                      # locale kanoniczny
    questions/m01..m12.json
    module-content/m01..m12.json
    rubrics.json
    scenarios.json
    modules.labels.json    # carve-out: prose wyświetlane modułów (po ID)
    paths.labels.json      # carve-out: prose wyświetlane ścieżek (po ID)
  en/                      # dochodzi w milestone EN (#81+), ten sam układ co pl/
```

**Granularność plików mieszanych (`modules.json` / `paths.json`) — carve-out, nie duplikacja.** Konfiguracja scoringowo-krytyczna (gates, progi, `requiredModules`, `variant`, `questionRange`, `order`, `pillar`, `timeFullMin`, `criticalQuestions`) pozostaje **single-source** w `data/modules.json` i `data/paths.json`. Stringi **wyświetlane** są wydzielone do per-locale katalogów etykiet po ID:

- `data/<lang>/modules.labels.json`: `{ "M1": { name, level, interactiveElement, keyConcepts, learningOutcomes }, ... }`
- `data/<lang>/paths.labels.json`: `{ "paths": { "S1": { name, assumedPathTime }, ... } }`

`data-loader.js` łączy strukturę z etykietami **po ID** w locie, więc kształt danych dla UI (`module.name`, `path.name`) jest niezmieniony — warstwa UI nie wie o podziale. Zasada granicy: **carve-out obejmuje wyłącznie prose realnie wyświetlane** (potwierdzone grepem renderów). Nie-wyświetlane metadane PL (`statusLegend`, `pillars` opisy, `estContentTimeNote`, `paths.modules` sub-mapa) **zostają w plikach wspólnych jako materiał referencyjny** — carve-out ich nie obejmuje (zero korzyści, niepotrzebna powierzchnia parytetu).

**Odrzucone alternatywy:**

- **nested-translations** (pola `{ pl, en }` wewnątrz każdego rekordu) — odrzucone: wymaga przepisania wszystkich schematów, puchnie ×N języków w jednym pliku, generuje konflikty merge i miesza języki w jednej jednostce edycji. Sprzeczne z prostotą (ADR-0002).
- **A2 (rozdzielanie struktury od tekstu w każdym pliku danych)** — odrzucone jako zbyt drobnoziarniste: koszt podziału `questions/`/`module-content` nie zwraca się; te pliki są w całości tekstowe → całe idą per-locale.
- **duplikacja `modules.json`/`paths.json` per-locale z lockiem parytetu** — odrzucone: fizycznie duplikuje konfigurację scoringowo-krytyczną (gates/progi) między locale, co `#78` jawnie wyklucza („single-source", „brak duplikacji konfiguracji scoringowo-krytycznej"). Carve-out daje single-source bez tej duplikacji.

### B. Katalog UI + helper `t()` (zero-dep)

- Katalogi `assets/i18n/<lang>.json` (klucze namespaced: `nav.*`, `path.*`, `quiz.*`, `feedback.*`, `cert.*`, `test.*`, `module.*`, `action.*`, `error.*`, `interaction.*`).
- Helper `assets/i18n/i18n.js`: `t(key, params?) → string`, wybór aktywnego locale, interpolacja prostych parametrów (`{pct}`, `{count}`, …) **bez `eval`**, zero zależności npm.
- **Fallback konserwatywny:** brak klucza **lub pusta wartość** w aktywnym locale → wartość z `pl` → sam klucz. **Nigdy pusty string.** (Krytyczne: szkielet `en.json` ma klucze z wartościami pustymi — fallback PL musi zadziałać na pustej wartości, nie tylko na braku klucza.)
- `pl.json` jest kompletny (kanoniczny); `en.json` ma **identyczny zbiór kluczy** (szkielet, wartości puste do czasu milestone EN).

### C. Wybór języka, cutover, URL

- **`localStorage` = źródło prawdy** (klucz `genai-training:lang`, konwencja jak `:theme`/`:progress`), opcjonalny `?lang=` jako **boot-override** walidowany wobec listy locale (wartość spoza listy → ignorowana, fallback do zapisu/PL).
- **`<html lang>` ustawiany dynamicznie** wg aktywnego locale.
- **Odrzucone: duplikacja ścieżek `/en/`** — kłóci się z hostingiem względnym Pages (ADR-0002) i mnoży artefakty.
- **UI-locale i data-locale rozprzęgnięte.** Każdy locale ma flagę `hasData`. Aktywny UI-locale steruje `t()`; dane ładowane są dla `locale` tylko gdy `hasData` (inaczej fallback `pl`). Wymusza to bezpieczeństwo: wczytywanie wymaganych plików to `Promise.all` rejectujące na 404 — wybór EN przy braku `data/en/` **nie może crashować**, więc do czasu dostarczenia `data/en/` (milestone EN) EN renderuje treść PL z katalogiem UI EN (na razie też fallback do PL). Aktywacja danych EN = zmiana `hasData` na jednym wpisie konfiguracji.

### D. Czystość core (zero-i18n) — kody semantyczne

`assets/core/*` pozostaje zero-DOM **i zero-i18n**. Trzy stringi user-facing przechodzą do UI przez kody/flagi semantyczne, rozwiązywane mapą w widoku (wzorzec już w repo: `GATE_LABEL` w `certificate-view.js`):

- `quiz-engine.js` `CRITICAL_FAIL_MESSAGE` — usunięty; flaga `result.isCriticalFail` (już istnieje) **jest** kodem; tekst z `t('feedback.criticalFail.*')` w `quiz-view.js`.
- `certificate.js` `reason` — zwraca kod (`"below_pass_threshold"`), nie prozę; rozwiązanie w `certificate-view.js`.
- `paths.js` `finalTestStatus().lockedReason` — core zwraca dane strukturalne (`blockers`, `missingPractical` — już zwracane); tekst składany w `shell.js` przez `t()`.

### D-policy. Parytet strukturalny (PL kanoniczny)

Walidacja egzekwuje **parytet strukturalny** między locale (twardy błąd, exit 1 — nie ostrzeżenie):

- **Kompletność katalogu UI**: każdy `assets/i18n/<lang>.json` ma **dokładnie ten sam zbiór kluczy** co `pl.json` (brak braków, brak sierot). Sprawdzany jest **zbiór kluczy, nie niepustość wartości** (pusty szkielet EN jest poprawny na etapie fundamentu).
- **Parytet treści**: dla `questions/` identyczne ID i identyczne pola scoringowe (`correct`, `difficulty`, `points`, `paths`, `isCritical`, `golden`, `type`, `module`); różnić mogą się **tylko** pola tekstowe (`prompt`, `options[].text`, `feedback*`, `learningOutcome`). Dla `module-content`/`rubrics`/`scenarios`/etykiet — identyczne ID/struktura, różny tekst.
- **PL kanoniczny**: różnice walidowane względem `pl`.
- **Identyfikatory współdzielone** (nie tłumaczone, te same we wszystkich locale): typy pytań (`scenariusz`, `scenariusz_decyzyjny`, `dopasowanie`, `kolejnosc_procesu`, `single_choice`, `multiple_choice`), filary (`pillar`), warianty (`variant`), ID (`Q###`, `M#`, `S#`). Asercja prefiksu `feedbackIncorrect` pytań krytycznych jest **locale-aware** (per-locale oczekiwany prefiks, np. PL `„To jest błąd bezpieczeństwa."`).

### E. ePrivacy (restate + cross-reference ADR-0003)

Preferencja języka w `localStorage` (`genai-training:lang`) to **„UI customisation"** — wyjątek „ściśle niezbędne" (art. 5(3) dyrektywy ePrivacy 2002/58/WE), tak jak motyw i postęp w **ADR-0003**. Nie wymaga zgody i **nie potrzeba banera cookie**. Warunek trwałości: dopóki nie dochodzi analityka/śledzenie/backend wyników — wtedy temat zgody wraca (jak w ADR-0001/0003). Strony statyczne traktować jako informację art. 13 RODO.

### F. Zero zależności

Cała warstwa i18n (helper `t()`, katalogi, walidacja parytetu) jest **vanilla, zero npm** — spójnie z ADR-0002.

## Konsekwencje

**Pozytywne:**

- Dodanie języka = jeden wpis w deklaratywnej konfiguracji locale (kod + etykieta + flaga + `hasData`) + komplet plików `data/<lang>/` + wypełniony `assets/i18n/<lang>.json`. Bez zmian w UI, loaderze i schematach.
- Konfiguracja scoringowo-krytyczna jest single-source → brak dryfu gates/progów między edycjami językowymi.
- Core zostaje czysty (zero-DOM, zero-i18n) → przyszły backend/edycje nie ruszają logiki.
- Walidacja parytetu wychwytuje mistranslację pola `correct`/`difficulty`/`points` jako twardy błąd CI → brak cichego buga scoringu w EN.

**Negatywne / do zaakceptowania:**

- `data-loader.js`, `validate.mjs` i `_fixtures.mjs` zyskują logikę merge etykiet po ID i świadomość locale — większa złożoność niż płaski układ. Mitygacja: guard deep-equal (zmergowany `modules`/`paths` == snapshot sprzed podziału) + pełny retest ścieżek S1/S2/S3.
- Pliki wspólne (`modules.json`, `paths.json`) zachowują nie-wyświetlane metadane PL (`statusLegend`, `pillars`, `estContentTimeNote`, `paths.modules`) — świadomy kompromis (zero korzyści z carve-outu rzeczy niewyświetlanych).
- Ryzyko rozjazdu ścieżek (CI zielone / runtime 404): `data-loader` i `validate.mjs`/`_fixtures` muszą wskazywać ten sam układ. Mitygacja: test spójności ścieżek (`#78`).

**Wpływ na CI:** walidacja iteruje po locale obecnych na dysku + katalogach UI; na etapie fundamentu (tylko `pl/` w danych, `pl.json`+szkielet `en.json` w UI) parytet jest spełniony trywialnie. Testy negatywne (`#80`) fabrykują `data/en/` pod `VALIDATE_DATA_DIR`, żeby udowodnić wykrywanie rozjazdu — nigdy na realnym drzewie. golden-set sprawdzany względem kanonicznego banku `pl`.

## Relacja do ADR-0002 i ADR-0003

**Refine, nie supersede.** ADR-0004 dokłada warstwę i18n w ramach reguł ADR-0002 (vanilla, zero buildu/zależności, ścieżki względne) i ADR-0003 (preferencja UI = ściśle niezbędne, bez banera). Nie zmienia żadnej z tych decyzji.

## Linki

- `assets/core/data-loader.js` (cutover `basePath` + `locale`)
- `data/golden-set.json` (language-neutral), `data/modules.json`, `data/paths.json` (mieszane → carve-out)
- `tests/schema-validation/validate.mjs` (parytet, locale-aware)
- ADR-0001, ADR-0002, ADR-0003
- Powiązane issue: `#76` (ten ADR), `#77`, `#78`, `#79`, `#80`, `#81`–`#84`
