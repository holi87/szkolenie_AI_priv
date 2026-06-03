# Recenzja merytoryczna i security przed pilotażem (M5 #26)

> **Status:** ukończona · **Wynik: P0 = 0** · wszystkie trzy kryteria akceptacji #26 **spełnione**.
> **Charakter recenzji:** przeprowadzona przez AI w trzech niezależnych rolach (SME GenAI/LLM, QA/Test Designer,
> Security/Governance). **Przed startem realnego pilotażu rekomendowany jest sign-off człowieka** w rolach SME
> i Security — recenzja AI nie zastępuje akceptacji właściciela merytorycznego (Lead ID + SME GenAI, wymagania/07).

## Zakres

- Bank 116 pytań (`data/questions/m01–m12.json`), w tym 5 pytań krytycznych M10 (Q081–Q085).
- Treść 12 modułów (`data/module-content/m01–m12.json`).
- `data/golden-set.json` (24), `data/rubrics.json` (5), `data/scenarios.json` (8).
- Skan higieny danych syntetycznych: 39 plików JSON + grep repo.

## Metoda

Trzy niezależne „soczewki” recenzenckie, każda czytająca realne dane (read-only), z ustrukturyzowanym
wynikiem (severity P0/P1/P2, lokalizacja, problem, rekomendacja, czy naprawialne chirurgicznie). Severity:
**P0** = błąd faktyczny / pytanie dwuznaczne lub źle zakluczone / treść zachęcająca do niebezpiecznej praktyki;
**P1** = mylące/nieprecyzyjne, do poprawy; **P2** = drobiazg/polish.

## Wyniki według kryteriów akceptacji #26

| Kryterium akceptacji | Werdykt | Dowód |
|---|---|---|
| Pytania krytyczne nie są dwuznaczne | ✅ spełnione | Każde z Q081–Q085 ma **dokładnie jedną** odpowiedź obronną przez osobę świadomą bezpieczeństwa; dystraktory to racjonalizacje (wykonaj wstrzyknięcie, deleguj decyzję modelowi, „token testowy więc nieważny”, „usuń czat później”). Borderline-dystraktory w Q083/Q085 sprawdzone i odrzucone (zasada konserwatywnego domyślnego zachowania + minimalny ślad audytowy). Każdy `feedbackIncorrect` zaczyna się od „To jest błąd bezpieczeństwa." i wskazuje sekcję do powtórki. |
| Przykłady danych są syntetyczne | ✅ spełnione | 0 naruszeń w 39 plikach JSON i grepie repo. Tylko encje syntetyczne (NotkaApp/SklepDemo/PipeDemo, Firma ACME), domena `przyklad.test`, PESEL placeholder `00000000000`, identyfikatory testowe, token `tok_test_...`. Brak realnych domen e-mail, realnych PESEL, 16-cyfrowych kart. Dodatkowo bramkowane automatycznie przez `validate.mjs` (lint FORBIDDEN_PATTERNS). |
| Treść nie zachęca do bezkrytycznego zaufania LLM | ✅ spełnione | Skan leksemów zaufania w 12 modułach + 12 bankach: **żadna** poprawna odpowiedź ani `feedbackCorrect` nie wspiera ślepego zaufania. Wszystkie trafienia to przypomnienia o weryfikacji, ramowanie ryzyka albo **oznaczone dystraktory** (błędne). Treść konsekwentnie pro-weryfikacyjna: M11 „pewny ton ≠ poprawność”, M4 „wysokie podobieństwo ≠ prawda”, M12 wymaga kalibracji judge z ekspertem, M6 uczy weryfikowalnych cytatów. |
| Poprawki P0 zapisane jako issue albo zamknięte | ✅ spełnione (trywialnie) | **P0 = 0** — brak poprawek krytycznych do zapisania. Znaleziska P1/P2 (niezablokujące) zapisane jako follow-up: **#57** (treść), **#58** (dystraktory/monitoring). |

## Podsumowanie znalezisk

| Soczewka | P0 | P1 | P2 | Werdykt |
|---|---:|---:|---:|---|
| SME GenAI/LLM (poprawność techniczna) | 0 | 1 | 4 | Technicznie poprawne do pilotażu |
| QA / Test Designer (jakość oceny) | 0 | 0 | 3 | Bank gotowy do pilotażu/kalibracji; golden set czysty |
| Security / Governance | 0 | 0 | 2 | Wszystkie 3 kryteria bezpieczeństwa spełnione |
| **Razem** | **0** | **1** | **9** | **Gotowe do pilotażu** |

### P1 (1) — zapisane w #57
- **M2 / okno kontekstu** (`module-content/m02.json`, ekran `s3-okno-kontekstu`): przekroczenie okna podane jako uniwersalne „ciche ucinanie”. W praktyce narzędzia bywają różne (błąd / okno przesuwne / „lost in the middle”). Pytania (Q010/Q011/Q015) pozostają jednoznaczne — to nieprecyzyjność narracji, nie błąd oceny. Naprawa: jedna klauzula w narracji.

### P2 (9) — zapisane w #57 / #58
- **#57 (treść):** nota o bliskoznaczności faithfulness/groundedness (M12 `s4`); złagodzenie feedbacku Q035 („netto recall” → „zależy od skali, mierz”).
- **#58 (dystraktory/monitoring):** Q105 opcja D (strawman → near-miss); Q108 opcja C (poza konstruktem); skłonność do słów absolutnych w dystraktorach (monitorować moc dyskryminacyjną w pilotażu, nie edytować masowo); weryfikacja mapowania kodów `M10.x` → ekrany w UI (kosmetyczne).

## Decyzja zakresu (dlaczego nie edytujemy treści w tym PR)

#26 to **recenzja + dyspozycja P0**, nie autoring treści. Ponieważ P0 = 0, kryterium „poprawki P0 zapisane
jako issue albo zamknięte” jest spełnione bez zmian w danych. Edycje treści (P1/P2) to osobny temat
(autoring, terytorium M4/kalibracji) — wprowadzanie ich tutaj mieszałoby zakresy (wbrew AGENTS.md) i ryzykowałoby
twarde bramki `validate.mjs` (liczby/trudność/golden). Dlatego znaleziska trafiły do #57/#58 do realizacji
osobno, a ten PR pozostaje w zakresie QA/pilotażu.

## Rekomendacja przed realnym pilotażem

1. **Sign-off człowieka** w rolach SME GenAI i Security/Governance (akceptacja właściciela merytorycznego).
2. Opcjonalnie zrealizować #57 (P1) przed pilotażem — uściśla treść M2; reszta może iść po pilotażu.
3. P2 z #58 zweryfikować na danych z pilotażu (moc dyskryminacyjna) — naturalnie łączy się z kalibracją (#28).
