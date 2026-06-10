# Rebuild — restrukturyzacja ścieżek (plan, bez wdrożenia)

Status: PROPOZYCJA do decyzji właściciela. Dokument planistyczny — zero zmian w kodzie/danych.
Data: 2026-06-10. Źródła: `genai-llm-training/data/paths.json` (frozen v0.1), `docs/macierz-sciezek.md`, ADR-0006 (hybryda rdzeń+dedykowane), ADR-0009 (S4 formatywna).

---

## 1. Diagnoza — dlaczego S1/S2 są zbędne

Stan obecny: S1/S2/S3 to **trzy konfiguracje tych samych 12 modułów M1–M12**, zagnieżdżone:

| | S1 (nietechniczna) | S2 (praktyk/QA) | S3 (inżynier) |
|---|---|---|---|
| moduły wymagane | 5 (M1,M2,M7,M10,M11) | 8 (S1 + M3,M6,M8) | 12 (wszystkie) |
| warianty | 2 skrócone | pełne | pełne |
| test końcowy | 25 pyt / próg 75% | 40 pyt / 78% | 55 pyt / 80% |
| zadania praktyczne | 0 | 1 (R1-prompt) | 2 (R2-rag, R3-eval) |
| bramki krytyczne | M10 100% | M10 100% | M10 100% + min. 70% M6/M12 |

Wniosek: `requiredModules(S1) ⊂ requiredModules(S2) ⊂ requiredModules(S3)`. S1 i S2 nie wnoszą **treści** — wnoszą tylko **poziom wymagań**. To nie są osobne ścieżki, to poziomy jednej ścieżki. Trzy karty ścieżek na ekranie wyboru sugerują trzy różne programy, a użytkownik dostaje ten sam program z innym sitem.

## 2. Decyzja kierunkowa (propozycja)

Nowa macierz: **4 ścieżki o realnie różnych treściach**, poziomy przeniesione DO ścieżki QA.

| ID | Nazwa | Charakter | Treść |
|---|---|---|---|
| **P1** | AI w domu | formatywna (bez testu) | NOWA — 6 modułów MD1–MD6 |
| **P2** | Bezpieczne używanie AI | zaliczeniowa (lekka) | NOWA — 6 modułów MB1–MB6, częściowy reuse M10/M11 |
| **P3** | AI z QA | zaliczeniowa, **3 poziomy** | istniejące M1–M12 (= scalone S1+S2+S3) |

Bez certyfikatu w całej macierzy — **ADR-0005** (zaakceptowana, M12): artefakt certyfikatu i pseudonim usunięte, charakter = self-assessment; zostaje ekran „Wynik" (badge zaliczenia, % wyniku, bramki, słabe obszary, eksport anonimowy). Bez bazy weryfikacyjnej certyfikat i tak nie byłby sprawdzalny.
| *bonus* | Skala Holaka | formatywna, **poza numeracją P** | bez zmian (= dzisiejsze S4: MSHP/MSHO + MSK1–4) |

### 2.0 Skala Holaka = bonus, nie ścieżka „P" (decyzja 2026-06-10)

P1–P3 to programy nauki — użytkownik wybiera jeden. Skala Holaka to narzędzie diagnostyczne: działa **obok** dowolnej ścieżki, nie zamiast niej. Czwarta karta w tym samym pickerze sugerowałaby wykluczanie się. Dlatego:
- **UI**: ekran wyboru pokazuje 3 karty ścieżek + osobny pasek/sekcję „Bonus: Skala Holaka — zdiagnozuj siebie i organizację" pod nimi (mniejsza karta, inny kształt, badge `bonus`).
- **Dane**: identyfikator `S4` zostaje bez zmian w paths.json/progresie — **zero migracji** dla tej ścieżki (upraszcza R1). Prezentacja „bonus" to wyłącznie warstwa UI + etykiety i18n.
- Wejście w bonus nie koliduje z progresem ścieżki głównej (już dziś tak jest — formative, ADR-0009).

### 2.1 P3 „AI z QA" — wybór poziomu

Dwa rozważone warianty:

- **Wariant A (REKOMENDOWANY): poziom wybierany na starcie ścieżki.** Selektor Podstawowy / Praktyk / Inżynier na karcie ścieżki lub pierwszym ekranie po wejściu. Poziom mapuje się **1:1 na dzisiejsze konfiguracje S1/S2/S3** (wymagane/opcjonalne, warianty, parametry testu, bramki). Silnik scoring/gates/test-engine bez zmian logiki — zmienia się tylko źródło konfiguracji (poziom zamiast ścieżki) i UI. Moduły poza poziomem widoczne jako „opcjonalny" z badge — zachęta do rozszerzania.
- **Wariant B: bez poziomów — rdzeń wymagany + reszta opcjonalna, certyfikat „tier" naliczany z tego, co faktycznie ukończono.** Elastyczniejszy, ale: (1) niejednoznaczny kontrakt certyfikatu, (2) przepisanie bramek i logiki testu końcowego (który zestaw pytań? który próg?), (3) trudniejsza komunikacja wyniku. Odrzucony jako droższy i mniej czytelny.

Konsekwencje wariantu A:
- poziom można **podnieść** w trakcie (Podstawowy→Praktyk): progres modułów wspólny, do zaliczenia dochodzą brakujące wymagania; **obniżenie** poziomu po zdanym teście — zablokowane (wynik zaliczenia zapisany na poziom).
- ekran „Wynik" (ADR-0005): dochodzi pole „poziom" obok badge zaliczenia; klucze i18n wyniku do przeglądu per locale.
- ekran wyboru ścieżki: 4 karty zamiast 4-prawie-identycznych; karta P3 z selektorem poziomu (mock w `docs/design/refresh-2026-06/mockupy.html`, sekcja 1).

### 2.2 Oznaczanie modułów w ramach poziomu

Na hubie modułów P3 każdy moduł dostaje status zależny od poziomu: `wymagany` / `wymagany (skrócony)` / `opcjonalny` / `opcjonalny (świadomościowy|rozszerzony)` — **dokładnie dzisiejszy `statusLegend` z paths.json**, więc dane wariantów przeżywają bez zmian. UI: badge + filtr „pokaż tylko wymagane".

## 3. P1 „AI w domu" — program (NOWA treść)

Charakter: formatywna jak S4 (ADR-0009) — bez testu końcowego, bez progów, bez certyfikatu; quizy inline opcjonalne jako samosprawdzenie. Odbiorca: osoba nietechniczna, prywatne użycie. Czas: ~2,5–3 h.

| ID | Moduł | Zakres | Czas | Interakcje |
|---|---|---|---|---|
| MD1 | Co AI potrafi dziś | czaty, asystenci, multimodalność, granice możliwości, halucynacje „po ludzku" | 25 min | quiz samosprawdzający |
| MD2 | Prompty na co dzień | pisanie/maile, planowanie, nauka, kuchnia, podróże; iterowanie zamiast „idealnego promptu" | 30 min | interakcja `tune` (reuse silnika) |
| MD3 | AI w telefonie i domu | asystenci głosowi, aplikacje mobilne, smart home, tryby offline | 25 min | classify (reuse) |
| MD4 | Tworzenie: obraz, dźwięk, wideo | generatory, prawa do utworów, znakowanie treści AI | 30 min | galeria + quiz |
| MD5 | AI a dzieci i rodzina | kontrola rodzicielska, edukacja, higiena cyfrowa, rozmowa z dzieckiem o AI | 25 min | scenariusze decyzyjne |
| MD6 | Prywatność domowa | co wkleić wolno a czego nie, ustawienia kont, historia czatów, opt-out z treningu | 30 min | checklist + rubric (reuse) |

Wszystkie przykłady syntetyczne (zasada repo). MD6 celowo zazębia się z P2/MB2 — wersja „domowa" vs „zawodowa".

## 4. P2 „Bezpieczne używanie AI" — program (NOWA treść + reuse)

Charakter: zaliczeniowa lekka — test końcowy ~20 pytań, próg 75%, **pytania krytyczne 100%** (konserwatywne domyślne — zasada repo dla security). Bez zadań praktycznych, bez certyfikatu (ADR-0005) — wynik + badge zaliczenia na ekranie „Wynik". Odbiorca: każdy pracownik. Czas: ~3–3,5 h.

| ID | Moduł | Zakres | Reuse | Czas |
|---|---|---|---|---|
| MB1 | Mapa ryzyk AI | halucynacje, manipulacja, wycieki, nadmierne zaufanie | M11 (fragmenty) | 30 min |
| MB2 | Dane wrażliwe i prywatność | co wolno wkleić do czatu, dane osobowe/firmowe, RODO, AI Act w pigułce | M10 wariant świadomościowy | 35 min |
| MB3 | Prompt injection i socjotechnika | jak atakuje się użytkownika AI, podszywanie, zatrute treści | M10 (sekcja) | 30 min |
| MB4 | Deepfake, scam, dezinformacja | rozpoznawanie, procedura reakcji, zgłaszanie | nowy | 35 min |
| MB5 | AI w pracy: polityki i shadow AI | polityka firmowa, licencje/IP, narzędzia dozwolone | nowy | 30 min |
| MB6 | Weryfikacja treści AI | fact-checking, źródła, kiedy nie ufać | M11 wariant świadomościowy | 30 min |

Pytania krytyczne: nowy zestaw ~4–5 (wzór: M10 ma 5). Bank pytań: ~45–55 nowych + adaptacje z istniejącego banku 116.

## 5. Model danych i silnik — zakres zmian

- **paths.json**: P3 dostaje `levels: { basic, practitioner, engineer }`, każdy poziom = dzisiejszy obiekt S1/S2/S3 (modules, gates, finalTestQuestions, passThresholdPct…). P1/P2 jako nowe ścieżki (P1 z `formative: true` jak S4). Schema `paths.schema.json` rozszerzona o `levels` — **derive, not extend** (pułapka z roadmapy M12–M14: walidator wyprowadza z danych, nie dubluje listy).
- **progress.schema.json**: nowe pole `level` w progresie ścieżki P3 + migracja: istniejący progres `S1/S2/S3` → `P3` z odpowiednim `level`; `S4` bez zmian (bonus — patrz 2.0). Reset niedopuszczalny — mapowanie deterministyczne, stare klucze zachowane jako aliasy odczytu.
- **Silnik**: scoring, quiz-engine, test-engine, gates — bez zmian logiki (wariant A). `paths.js` — resolucja konfiguracji ścieżka+poziom zamiast samej ścieżki. Ekran „Wynik" (`buildResult`) — pole poziomu.
- **Moduły**: M1–M12 bez zmian; nowe MD1–6, MB1–6 jako content-as-data (`data/<locale>/module-content/`), filary (`pillar`) do przypisania (MD* → nowy filar `everyday`? — pytanie otwarte O3).
- **i18n**: każdy nowy moduł × 8 locale (PL kanon → EN → reszta workflow per `m17-translate.workflow.mjs`). Etykiety ścieżek, poziomów, badge statusów. Uwaga: bramka treści w validate obejmuje wszystkie locale (po M17).
- **Testy**: walidacja danych (schemas), smoke wszystkich ścieżek × poziomów (S1/S2/S3 → 1 ścieżka × 3 poziomy + P1 + P2 + bonus S4), kontrast/a11y nowych badge, migracja progresu (test jednostkowy na mapowaniu).

## 6. Fazowanie (propozycja milestone'ów)

| Faza | Zakres | Zależy od |
|---|---|---|
| **R1** | P3 z poziomami: dane (levels), selektor UI, migracja progresu, ekran „Wynik" z poziomem, testy | — |
| **R2** | P1 „AI w domu": treść PL 6 modułów + interakcje (reuse), ścieżka formatywna | R1 (nowy ekran wyboru) |
| **R3** | P2 „Bezpieczne używanie AI": treść PL, bank pytań, pytania krytyczne, test + gates | R1 |
| **R4** | i18n: EN dla R2+R3, potem 6 pozostałych locale (workflow tłumaczeniowy) | R2, R3 |
| **R5** | Sprzątanie: usunięcie martwych konfiguracji S1/S2, aktualizacja docs (macierz-ścieżek, ADR), redirect starych deep-linków | R1–R4 |

Każda faza = osobny milestone z issues per temat (wzorzec repo: jeden PR na milestone albo stacked — decyzja przy wdrożeniu). R1 jest krytyczna i samodzielnie wartościowa — można wydać bez R2/R3.

## 7. Pytania otwarte (do decyzji właściciela)

- **O1**: P1 całkiem bez quizów (czysty self-paced) czy quizy samosprawdzające bez progów? (rekomendacja: quizy bez progów — silnik już jest)
- ~~O2: certyfikat dla P2~~ — ROZSTRZYGNIĘTE 2026-06-10: bez certyfikatu nigdzie (ADR-0005 + brak bazy weryfikacyjnej); P2 dostaje badge zaliczenia na ekranie „Wynik".
- **O3**: nowy filar `everyday` dla MD*, czy mapować na istniejące filary? (rekomendacja: nowy filar — czystsze wykresy wyników)
- **O4**: zmiana poziomu w P3 w dół przed testem — dozwolona? (rekomendacja: tak, do momentu pierwszego podejścia do testu)
- **O5**: nazwy ścieżek finalne? „AI w domu" / „Bezpieczne używanie AI" / „AI z QA" — robocze.

## 8. Ryzyka

- **Migracja progresu** — jedyna operacja niszcząca przy błędzie; wymaga testu na realnych kształtach localStorage i zachowania starych kluczy.
- **Objętość nowej treści**: 12 nowych modułów × 8 locale = duży koszt tłumaczeń; mitygacja: R4 dopiero po stabilizacji PL.
- **Semantyka wyniku**: zapis zaliczenia rozszerza się o poziom (ścieżka→ścieżka+poziom) — stare zapisy „Wynik" w progresie muszą się czytać po migracji.
- **Deep-linki / zakładki** użytkowników na S1/S2 — wymagane aliasy w routerze widoków.
