# Release 1.0 — szkolenie GenAI i LLM (QualityCat)

| Pole | Wartość |
|---|---|
| Wersja | **1.0** |
| Issue | `#30 [M6] Przygotuj release 1.0` |
| Milestone | M6 Release 1.0 i utrzymanie |
| Typ | Statyczna aplikacja webowa (GitHub Pages, bez backendu, bez buildu — ADR-0002) |
| Hosting | `https://ai-slop.win/` → przekierowanie do `genai-llm-training/` (patrz [`deploy-github-pages.md`](deploy-github-pages.md)) |

> ## Status uczciwie: baseline DO pilotażu, a nie wersja po pilotażu
>
> Release 1.0 to **kompletny, przetestowany technicznie baseline gotowy do przekazania sponsorowi i do
> uruchomienia pilotażu**. **NIE** jest to wersja po realnym pilotażu ani po kalibracji pytań.
>
> - **#28 (kalibracja pytań po pilotażu)** — OTWARTE. Progi trudności i golden set **nie są** potwierdzone
>   empirycznie; golden set **nie ma** statusu `validated` (wymaga pełnego pokrycia 24/24 w realnym pilotażu).
> - **#29 (poprawki po pilotażu)** — OTWARTE. Poprawki *wynikające z obserwacji uczestników* powstaną dopiero po
>   pilotażu. Dostępne pre-pilotażowe poprawki z recenzji (#57/#58) **są** w tym wydaniu.
>
> Demonstracyjne dane w `docs/qa-pilotaz/raport-kalibracji.md` są **syntetyczne (DEMO)** i nie stanowią wyników
> realnego pilotażu. Żadne KPI nie ma jeszcze realnych wartości (patrz [`raport-kpi-ewaluacja.md`](raport-kpi-ewaluacja.md)).

---

## 1. Co zawiera wydanie

- **12 modułów** treści (M1–M12), narracja filtrowana per ścieżka.
- **116 pytań** z metadanymi (trudność L1–L4, filary, ścieżki, golden, krytyczne), shardowane per moduł.
- **3 ścieżki** uczenia: S1 (decyzyjna, 3,5–4,5 h), S2 (praktyk/QA, 6–7 h), S3 (inżynier, 9–10 h).
- **Quizy modułowe** + **interakcje** (`classify` / `rubric` / `tune`) + **zadania praktyczne** (S2/S3).
- **Test końcowy** ze scoringiem (progi S1 ≥75% / S2 ≥78% / S3 ≥80%), bramką pytań krytycznych (100%) i limitem 3 podejść.
- **Certyfikat** + eksport wyników: agregat (`wynik-<ścieżka>.json/csv`) i per-pytanie (`pytania-<ścieżka>.csv`).
- **Progres lokalny** (localStorage), per ścieżka, z powrotem do ostatniego miejsca i pomiarem czasu modułu.
- **Dostępność**: skip-link, ARIA progressbar, etykiety kontrolek, focus states, responsywność do 360 px,
  `prefers-reduced-motion`.
- **Dane wyłącznie syntetyczne** (`przyklad.test`, `NotkaApp`/`SklepDemo`, PESEL placeholder `00000000000`).
- **Pakiet pilotażowy** (`docs/qa-pilotaz/`), **narzędzie kalibracji** (`tools/calibration/calibrate.mjs`),
  **format raportu KPI** ([`raport-kpi-ewaluacja.md`](raport-kpi-ewaluacja.md)) i **playbook utrzymania**
  ([`playbook-utrzymania.md`](playbook-utrzymania.md)).

Uruchomienie: [`instrukcja-uruchomienia.md`](instrukcja-uruchomienia.md). Wdrożenie/aktualizacja: [`deploy-github-pages.md`](deploy-github-pages.md).

---

## 2. Checklist jakości (stan na wydanie)

| Bramka | Wynik | Dowód |
|---|---|---|
| Walidacja danych (`validate.mjs`) | ✅ exit 0 | 116 pytań, budżet trudności L1=41/L2=46/L3=23/L4=6, 5 krytycznych w M10, golden 24, lint syntetyczny |
| Testy silników + smoke render + a11y + dane negatywne (`node --test`) | ✅ 122/122 | CI `frontend-tests` |
| Self-test narzędzia kalibracji (`calibrate.mjs --self-test`) | ✅ exit 0 | CI `frontend-tests` |
| Smoke wdrożonej wersji — desktop + mobile 360 px | ✅ | `ai-slop.win/genai-llm-training/`: render path-select, dane po https, **0 błędów JS** (patrz [`deploy-github-pages.md`](deploy-github-pages.md)) |
| Recenzja merytoryczna i security (3 soczewki AI) | ✅ P0 = 0 | `docs/qa-pilotaz/recenzja-merytoryczna-security.md` |
| Dane syntetyczne | ✅ | lint w `validate.mjs` (e-mail/PESEL/karty) |

> **Rekomendacja przed użyciem produkcyjnym:** sign-off człowieka (SME merytoryczny + Security/Governance) przed
> wpuszczeniem uczestników. Recenzja AI jest doradcza, nie zastępuje akceptacji właściciela treści.

---

## 3. Znane ograniczenia

- **Brak backendu wyników.** Progres i wyniki żyją wyłącznie w `localStorage` przeglądarki: brak synchronizacji
  między urządzeniami, dane znikają po wyczyszczeniu danych przeglądarki. Eksport wyników jest **ręczny** (przyciski
  na ekranie wyniku). Backend można dołożyć adapterem bez przepisywania UI (założenie architektury).
- **Wymaga serwera http(s).** Dane `data/*.json` ładują się przez `fetch()` — otwarcie przez `file://` nie zadziała
  (CORS). Lokalnie: dowolny statyczny serwer (patrz instrukcja).
- **Nie skalibrowane empirycznie (#28).** Progi trudności i golden set opierają się na ocenie eksperckiej, nie na
  danych z pilotażu. Golden set **nie jest** `validated`.
- **Brak realnych KPI (#29/#31).** Raport KPI to format do uzupełnienia po rolloucie; kolumny wyników są puste.
- **Brak pre-testu w aplikacji.** KPI „Knowledge gain” (pre/post) wymaga osobnego instrumentu — aplikacja eksportuje
  tylko wynik końcowy.
- **`noindex`.** Strony mają `robots: noindex` (materiał szkoleniowy, nie treść do indeksacji).
- **Monitoring pilotażowy otwarty (#58):** skłonność do słów absolutnych w dystraktorach i mapowanie kodów `M10.x`
  na slugi ekranów — do obserwacji w pilotażu, nieblokujące (wskaźniki prozą już działają).

---

## 4. Stan milestone M6 po tym wydaniu

| Issue | Stan | Uwaga |
|---|---|---|
| #30 Release 1.0 | ✅ zamknięte tym PR | to wydanie |
| #31 Raport KPI | ✅ zamknięte tym PR | format do uzupełnienia po rolloucie |
| #32 Proces utrzymania | ✅ zamknięte tym PR | playbook |
| #33 Wdrożenie na GitHub Pages | ✅ zamknięte tym PR | przekierowanie + dokumentacja + smoke |
| #57 / #58 Follow-up recenzji | ✅ zamknięte tym PR | chirurgiczne poprawki treści pre-pilotażowe |
| #28 Kalibracja po pilotażu | ⏳ OTWARTE | wymaga realnych danych pilotażu (8–15 osób) |
| #29 Poprawki po pilotażu | ⏳ OTWARTE | wymaga przeprowadzonego pilotażu |

**Kolejność a uczciwość:** plan zakładał pilotaż → release, ale realny pilotaż (na ludziach) nie został
przeprowadzony. Release 1.0 jest świadomie baseline’em, który **idzie do** pilotażu/sponsora; poprawki po
pilotażu (#28/#29) nastąpią po nim. Dlatego #28/#29 pozostają otwarte — nie udajemy, że wersja jest „po pilotażu”.
