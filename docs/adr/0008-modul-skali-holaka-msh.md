# ADR-0008: Moduł Skali Holaka (MSH) — diagnostyczny, non-gating, interakcja maturity-check

| Pole | Wartość |
|---|---|
| Status | Zaakceptowana |
| Issue | `#102–#106 [M14]` (projekt + kontrakt + dane + interakcja + wpięcie) |
| Rola decydenta | Senior Solution Analyst / właściciel |
| Powiązane | ADR-0001 (architektura), ADR-0004 (i18n), ADR-0006 (model ścieżek), `docs/macierz-sciezek.md` |

> **Numeracja:** issue #102 zapowiadało „ADR-0007”, ale numer 0007 został zużyty przez M13 (`0007-m13-sciezki-dedykowane-as-built.md`). Ten dokument to jego następnik = ADR-0008; realizuje intencję #102 bez zmiany treści.

---

## Kontekst

Życzenie właściciela: dodać moduł oparty o **Skalę Holaka** — model dojrzałości adopcji AI (0–11) w dwóch wersjach: **v2.1e** (organizacja) i **v2.1p** (osoba). Atrybucja: quality-blog.eu/pl/blog/skala-holaka oraz `/skala-holaka-private`.

To **13. moduł** w systemie zamrożonym na 12 (M1–M12) i **4. typ interakcji** w enumie zamrożonym na 3 (`classify`/`rubric`/`tune`). Moduł jest **formatywny**: diagnoza „gdzie jesteś / jak wejść wyżej”, której z definicji **nie da się oblać**. To wymusza decyzje kontraktowe PRZED treścią (issue #103 jest warunkiem #104–#106).

## Decyzja

1. **Id modułu `MSH`** (litery, nie „M13”). Wzorce id rozszerzono o alternatywę literową `^M([1-9]|1[0-2]|SH)$` — NIE o zakres cyfr `1[0-3]` (model danych nie ma i nie chce numerycznego „M13”; „M13” to etykieta milestone’u, nie moduł kursu).

2. **`scope: "diagnostic"`** — trzecia wartość enuma `scope` (obok core/dedicated). Oznacza moduł **bez puli pytań**. Walidator derywuje z niej predykat `hasBankQuestions(m) = m.scope !== "diagnostic"` i wyłącza moduł diagnostyczny z każdej kontroli zależnej od pytań:
   - `EXPECTED_COUNTS`/`TOTAL=116`/golden 2-na-moduł — exempt-by-construction (iterują po kluczach `EXPECTED_COUNTS`, w których MSH nie istnieje);
   - kontrole rdzeń/dedykowane (ADR-0006) — exempt-by-construction (iterują po pytaniach, których MSH nie ma);
   - **`questionRange`** — jedyna pętla z jawną bramką (`hasBankQuestions || !questionRange → continue`); schemat czyni `questionRange` wymaganym tylko dla core/dedicated (allOf if-then na `scope`).
   MSH NIE jest dodany do `EXPECTED_COUNTS`, `TOTAL`, golden-set ani shardów pytań — kurs nadal ma **dokładnie 116 pytań / 12 modułów bankowych**.

3. **Non-gating (konserwatywnie).** Zbiór bramkujący ścieżki to **tablica `requiredModules[]`** w `paths.json`, NIE flaga `required` per moduł. MSH:
   - jest w mapie `modules` KAŻDEJ ścieżki jako `{ required: false, variant: "diagnostyczny" }`;
   - **nigdy** nie trafia do `requiredModules[]` → `isFinalTestUnlocked` jest strukturalnie niewrażliwy na status MSH.
   Dodatkowo **świadomie NIE poszerzono** wzorców `requiredModules.items` ani `gates[].module` w `paths.schema.json` — schemat **strukturalnie zabrania** MSH bramkować lub być punktowaną bramką (defense-in-depth dla „non-gating”).

4. **Widoczność = nowy variant `diagnostyczny`.** `pathVisibleModuleIds` ukrywa tylko `variant === "opcjonalny"`. MSH jest `required:false`, więc by był WIDOCZNY w hubie/nawigacji każdej persony, dostał variant `diagnostyczny` (≠ opcjonalny). Etykieta wyświetlana wynika z flagi `required` („Opcjonalny”), więc variant nie wymaga lokalizacji.

5. **Interakcja `maturity-check`** — czwarty typ, NEUTRALNY i non-gating:
   - rejestr w `core/interactions` i `ui/interactions` (oba dyspozytory) oraz w obu enumach kind (`module-content.schema.json` = autorstwo, `progress.schema.json` = zapis wyniku);
   - evaluator zwraca **`passed: null` na stałe** → UI renderuje wynik bez koloru pass/fail (gałąź neutralna `app.js`); brak słowa „zaliczone”;
   - `recordInteraction` zapisuje tylko display-only blob (kind/score/max/pct), nie zasila scoringu/bramek;
   - dwie skale **0–11** (org v2.1e + osoba v2.1p): poziom = liczba zaznaczonych zdań (clamp do `max`), banda mapuje poziom → label + „jak wejść wyżej”. Integralność: walidator sprawdza, że każdy poziom 0..max trafia do **dokładnie jednej** bandy (feedback zawsze rozwiązywalny).

6. **i18n.** Treść skal/zdań/band żyje per-locale w `data/<lang>/module-content/msh.json` (PL+EN). Katalog UI (`assets/i18n/<lang>.json`) dostaje tylko kilka kluczy chrome (`maturity.*`) — parytet PL↔EN egzekwowany jak dotąd. Etykieta modułu w `data/<lang>/modules.labels.json` (PL+EN).

## Granice zakresu (świadomie odroczone — wymagają eksperta dziedzinowego, SME)

> Mechanika (kontrakt, gating, neutralność, integralność band) jest egzekwowana testami i walidatorem. „Zielone CI” ≠ „treść zweryfikowana merytorycznie”.

- **Heurystyka punktacji jest uproszczona:** poziom = liczba zaznaczonych zdań. To orientacyjne, nie psychometryczne — zakłada w przybliżeniu kumulatywny charakter zdań. Mapowanie zdanie↔poziom oraz progi band (granice 8→9, 10→11) **do przeglądu SME**.
- **Zdania self-checku i opisy band są syntetyczne** i ogólne (zero realnych danych/PII). Wierność wobec oryginalnej Skali Holaka v2.1e/v2.1p — do potwierdzenia z autorem modelu.
- **Brak osobnej puli pytań** dla MSH jest cechą (moduł formatywny), nie brakiem; gdyby w przyszłości MSH miał pytania bankowe, trzeba świadomie poszerzyć kontrakt 116/golden.

## Konsekwencje

- System obsługuje **13 modułów** (12 bankowych + 1 diagnostyczny) i **4 typy interakcji**; kurs nadal ma 116 pytań i 24-elementowy golden set bez zmian.
- MSH jest widoczny w S1/S2/S3 w obu locale, daje neutralną autodiagnozę i **nie wpływa** na zaliczenie ścieżki ani na test końcowy (egzekwowane testem `paths.test` #106).
- Walidator, smoke i kalibracja są zielone; parytet PL+EN utrzymany.
- Przed wdrożeniem szkolenia na żywo: **przegląd SME** alokacji zdań↔poziom, progów band i atrybucji — nie-blokujący, opisany wyżej.
