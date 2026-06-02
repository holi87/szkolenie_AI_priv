# Karta projektu — szkolenie GenAI i LLM dla QualityCat

| Pole | Wartość |
|---|---|
| Issue | `#1 [01][M0] Uzgodnij kartę projektu i decyzje sponsora` |
| Milestone | M0 Decyzje i architektura |
| Status karty | **Do zatwierdzenia przez sponsora** (rekomendacje zespołu wykonawczego) |
| Wersja | 0.1 (draft pod review) |
| Właściciel dokumentu | Business Analyst |

> **Jak czytać tę kartę.** Issue #1 zbiera decyzje sponsora (P1–P15). Zespół wykonawczy nie zastępuje sponsora — dla pytań biznesowych karta podaje **rekomendację + konserwatywny default**, którym można bezpiecznie pracować do czasu decyzji. Tylko fundamenty realnie zamrożone planem wdrożenia mają status `zatwierdzone`. Formalna akceptacja P1–P15 następuje przez review tego dokumentu / PR, nie przez treść karty.

---

## 1. Cel i zakres projektu

Zbudować samodzielne, interaktywne szkolenie HTML o GenAI i LLM dla QualityCat, w trzech ścieżkach odbiorców o różnym poziomie technicznym. Wersja pilotażowa (MVP) jako statyczna aplikacja HTML/JS z lokalnym zapisem progresu i eksportem wyniku. Backend raportowy świadomie odłożony do decyzji po pilotażu, ale kontrakty danych przygotowane tak, aby nie blokować późniejszego wariantu z API.

Źródła decyzji: `wymagania/01`–`wymagania/12`, `docs/plan-wdrozenia.md`.

---

## 2. Ścieżki S1/S2/S3 — zakres `[zatwierdzone — default projektu]`

| Ścieżka | Profil odbiorcy | Czas `[ZAŁOŻENIE]` | Test końcowy | Zadanie praktyczne |
|---|---|---:|---:|---:|
| S1 | nietechniczna / decyzyjna | 3,5–4,5 h | 25 pytań | brak |
| S2 | praktyk-użytkownik / QA | 6–7 h | 40 pytań | 1 zadanie (po M7/M8) |
| S3 | inżynier / automatyzacja / techniczny QA | 9–10 h | 55 pytań | 2 zadania (po M12) |

Zakres modułów obowiązkowych/skróconych/opcjonalnych per ścieżka zostaje zamrożony w issue #5 (`paths.json`). Tu potwierdzamy istnienie trzech ścieżek, ich czasy i strukturę testu końcowego (źródło: `wymagania/03`, `wymagania/06`, `wymagania/07`).

---

## 3. Kryteria zaliczenia S1/S2/S3 — potwierdzone `[zatwierdzone — default projektu]`

Potwierdzone względem `wymagania/07_specyfikacja_systemu_testów.md`. **Pytania krytyczne z bezpieczeństwa (M10, 5 szt.) są warunkiem koniecznym ponad progiem procentowym** — brak 100% pytań krytycznych = brak zaliczenia, niezależnie od wyniku ogólnego.

| Ścieżka | Próg ogólny | Warunek dodatkowy (bramka konieczna) | Podejścia `[ZAŁOŻENIE]` |
|---|---:|---|---:|
| S1 | ≥ 75% | 100% pytań krytycznych M10 | 3 |
| S2 | ≥ 78% | 100% pytań krytycznych + min. 4/5 w zadaniu promptowym | 3 |
| S3 | ≥ 80% | 100% pytań krytycznych + min. 70% w M6 i M12 | 3 |

Wagi wyniku ścieżki: quiz inline 30% / test końcowy 60% / zadanie praktyczne 10%. Pytania krytyczne — warunek konieczny (nie wchodzą do wagi jako punkty, lecz jako bramka).

> Formalna akceptacja progów i bramki krytycznej zależy od **P12** (sponsor akceptuje obowiązkowe pytania krytyczne jako warunek zaliczenia). Do czasu decyzji obowiązuje konserwatywny default zgodny ze specyfikacją testów.

---

## 4. Hosting i wariant techniczny `[zatwierdzone — default projektu]`

### 4.1 Wdrożenie na GitHub Pages — wiążące ograniczenie architektury

**Decyzja hostingowa (zakres issue #1):** szkolenie jest wdrażane i serwowane jako **GitHub Pages**. To jest nadrzędne ograniczenie architektury — **ważniejsze niż sam fakt, że treść jest w HTML**. HTML/CSS/JS/localStorage to *konsekwencja* hostingu statycznego, a nie cel sam w sobie. Cała technologia musi działać w modelu GitHub Pages.

Wiążące konsekwencje dla całego stacku:

1. **Tylko statyczny hosting** — brak kodu serwerowego w czasie serwowania. Cała aplikacja jest klient-side (HTML/CSS/JS/JSON).
2. **Brak backendu na Pages** — progres przez `localStorage`. Ewentualny przyszły backend wyników (zob. P2) to **zewnętrzny serwis poza GitHub Pages**, wołany z frontu przez HTTPS API; Pages nigdy nie hostuje backendu, front pozostaje statyczny.
3. **Ścieżki względne** — aplikacja serwowana z podścieżki projektu (`https://<user>.github.io/<repo>/`), więc bez absolutnych korzeni `/`; wszystkie linki do assetów/danych/modułów względne.
4. **Build/deploy z repo** — pliki gotowe do serwowania (branch + folder albo GitHub Actions → Pages). Brak serwerowego kroku runtime.
5. **Niuans `file://`** — `fetch()` plików `data/*.json` działa przez http(s) na Pages, ale może nie działać przy otwarciu `index.html` lokalnie przez `file://`. Konsekwencja dla offline (P15) i dla ADR (#2): „offline" wymaga lokalnego statycznego serwowania albo inline'owania danych.

### 4.2 Warianty i decyzja MVP

| Wariant | Opis | Decyzja |
|---|---|---|
| A. Statyczny + localStorage | HTML/CSS/JS + JSON, progres lokalny, eksport JSON/CSV, certyfikat jako ekran/PDF | **MVP / pilotaż na GitHub Pages** ✅ |
| B. Statyczny + eksport do pliku | jak A, wynik eksportowany do pliku przekazywanego ręcznie | element A (eksport wyniku) ✅ |
| C. Backend raportowy (API) | centralne raportowanie wyników, logowanie, audyt | **odłożony** — jako zewnętrzny serwis poza Pages, decyzja po pilotażu (zob. P2) |

Konsekwencje zamrożone: progres przez adapter `progress-store` (kontrakt gotowy na późniejszy zewnętrzny backend), wynik eksportowalny (JSON/CSV), certyfikat jako ekran/PDF. Szczegóły, warunki przejścia do backendu i niuans `file://` = issue #2 (ADR). Wdrożenie GitHub Pages jako osobne issue na końcu backlogu (M6). Dane wszystkich przykładów: **syntetyczne** (reguła AGENTS.md + plan #7).

---

## 5. Decyzje sponsora P1–P15

Status: `zatwierdzone` = zamrożone jako default projektu; `odroczone` = czeka na sponsora, **zastosowano konserwatywny default, nie blokuje pracy**; `blokujące` = brak decyzji blokuje wskazaną fazę. Kolumna „Blokuje fazę” = `wymagania/12` (Wymagane przed fazą).

| ID | Pytanie | Rekomendacja / konserwatywny default | Właściciel | Status | Blokuje fazę |
|---|---|---|---|---|---|
| P1 | Formalna polityka użycia GenAI? | Przyjąć własną konserwatywną politykę governance do czasu dostarczenia firmowej | Security/Governance Reviewer | odroczone | F2 |
| P2 | Centralne raportowanie czy wersja statyczna? | **Statyczny MVP na GitHub Pages + eksport; ewentualny backend jako zewnętrzny serwis po pilotażu** | Sponsor + Architect | **zatwierdzone** | F4 (tylko wariant backend) |
| P3 | Logowanie czy anonimowo? | Anonimowo, progres lokalny (bez kont) w MVP | Sponsor + UX | odroczone | F4 |
| P4 | Certyfikat o wartości formalnej? | Informacyjny w MVP; formalny dopiero z backendem | Sponsor | odroczone | F4 |
| P5 | Jakie narzędzia GenAI dozwolone? | Przykłady neutralne narzędziowo; konkretne zakazy po decyzji | Sponsor + SME | odroczone | F2 |
| P6 | Wolno używać realnych projektów po anonimizacji? | **Nie** — wyłącznie dane syntetyczne (konserwatywnie) | Security/Governance | odroczone | F2 |
| P7 | Konkretne narzędzia (ChatGPT/Copilot/Gemini/Claude)? | Demonstracje vendor-neutral, nazwy jako przykłady wymienne | SME | odroczone | F2 |
| P8 | Pytania testowe dostępne w trybie nauki po zaliczeniu? | Nie eksponować banku (anti-gaming); osobny tryb powtórki bez pełnej puli | Test Designer | odroczone | F4 |
| P9 | Minimalny wymagany poziom dostępności? | WCAG 2.1 AA jako cel jakościowy | UX + QA | odroczone | F4 |
| P10 | Śledzenie per osoba / grupa / status? | Tylko status zaliczenia, lokalnie (MVP) | Sponsor + BA | odroczone | F4 |
| P11 | Aktualizacja cykliczna co 6 miesięcy? | Tak, przegląd co 6 mies. (zgodnie z A9) | L&D Architect | odroczone | F1 |
| P12 | Obowiązkowe pytania krytyczne jako warunek zaliczenia? | Tak, 100% pytań krytycznych = warunek konieczny | Sponsor + Test Designer | odroczone | F1 |
| P13 | S3 z obowiązkowym zadaniem RAG/evaluation? | Tak, 2 zadania praktyczne, min. 70% w M6 i M12 | L&D Architect + SME | odroczone | F2 |
| P14 | Branding QualityCat i własny styl? | Styl neutralny jako baseline; branding podmienialny, brak twardej zależności blokującej MVP | UX | odroczone | F4 |
| P15 | Działanie offline / w intranecie? | GitHub Pages (publiczny HTTPS); intranet przez GitHub Enterprise Pages lub własny statyczny serwing; offline z zastrzeżeniem `file://` (zob. 4.1) | Architect | odroczone | F4 |

**Żadne P1–P15 nie blokuje pracy M0.** P11 i P12 są „wymagane przed F1" — przyjęto dla nich konserwatywne defaulty, dzięki czemu formalne domknięcie F1 czeka na sponsora, ale **kolejne issue M0 (#2 ADR, #3 repo, #4 UX baseline) ruszają bez blokady**. P1/P5/P6/P7/P13 dotyczą F2 (treść), P2/P3/P4/P8/P9/P10/P14/P15 — F4 (implementacja); wszystkie do decyzji przed odpowiednią fazą, nie przed M0.

---

## 6. Założenia bazowe A1–A16

Przyjęte jako default projektu (źródło: `wymagania/12`). Kluczowe dla MVP: A4 (czasy ścieżek), A7 (progi), A8 (3 podejścia), A10 (statyczny HTML + localStorage), A13 (WCAG 2.1 AA), A14 (≤250–300 słów/ekran), A16 (konserwatywne podejście do PII/IP wobec braku polityki danych). Pełna lista i „łatwość korekty" — `wymagania/12`. Założenia o niskiej łatwości korekty (A3, A7, A10, A11, A13, A16 — „Średnia") są kandydatami do potwierdzenia z sponsorem razem z powiązanymi P.

---

## 7. Blokery i ryzyka decyzyjne

Blokery opisane jako ryzyka decyzyjne — żaden nie wstrzymuje M0.

| Blokujący | Powiązane P | Faza zagrożona | Mitygacja w MVP |
|---|---|---|---|
| Brak polityki danych QualityCat | P1, P5, P6 | F2 (treść M10, pytania krytyczne) | Konserwatywny default: dane syntetyczne, brak realnych danych klienta, własna polityka governance |
| Brak decyzji backend vs statyczny | P2, P3, P4, P10 | F4 (backend wyników) | MVP statyczny na GitHub Pages; kontrakt `progress-store` gotowy na zewnętrzny adapter backendu bez przepisania UI |
| Brak brandingu QualityCat | P14 | F4 (UI, certyfikat) | Baseline neutralny, branding podmienialny; brak twardej zależności (kryterium issue #4) |
| Brak formalnej akceptacji bramki krytycznej | P12 | F1 (domknięcie) → scoring | Default: 100% pytań krytycznych wymagane; komunikacja do uczestnika gotowa w spec testów |
| Brak decyzji o cyklu aktualizacji | P11 | F1 (budżet utrzymania) | Default: przegląd co 6 mies.; owner treści = L&D Architect |

---

## 8. Role i właściciele decyzji

Sponsor QualityCat (cele, zakres, polityki, próg, rollout) · Business Analyst (wymagania, założenia, ryzyka, akceptacja) · L&D Architect (struktura, efekty uczenia) · SME GenAI/LLM (treści techniczne, RAG, ewaluacja, bezpieczeństwo) · QA/Test Designer (pytania, scoring, golden set) · UX Designer (interakcje, dostępność) · Frontend Developer (HTML, engine, progres, certyfikat) · Security/Governance Reviewer (dane, PII, prompt injection, acceptable use). Przypisania osobowe `[ZAŁOŻENIE]` — do uzupełnienia przez sponsora.

---

## 9. Kryteria akceptacji issue #1

- [x] Powstaje karta projektu z decyzjami i właścicielami — ten dokument.
- [x] Każde pytanie P1–P15 ma status (zatwierdzone / odroczone / blokujące) — sekcja 5.
- [x] Blokery opisane jako osobne ryzyka/decyzje — sekcja 7.
- [x] Kryteria zaliczenia S1/S2/S3 potwierdzone względem `wymagania/07` — sekcja 3.

**Granica decyzyjna.** Karta dostarcza rekomendacje i konserwatywne defaulty; formalne zatwierdzenie P1–P15 należy do sponsora i następuje przez review tego dokumentu. Do tego czasu praca M0/M1 prowadzona jest na defaultach z sekcji 5.
