# Language refactor — przegląd językowy treści (plan, bez wdrożenia)

Status: PROPOZYCJA. Kolejność: **PL (kanon) → EN → ES/FR/DE/IT/UK/VI**.
Data: 2026-06-10. Powiązany: `Rebuild.md` (nowa treść P1/P2 powstaje już wg tego styleguide'u).

---

## 1. Inwentarz — co podlega przeglądowi

Na locale (~470 KB tekstu × 8 locale):

| Powierzchnia | Pliki | Charakter |
|---|---|---|
| Treść lekcji | `data/<loc>/module-content/*.json` — 18 plików (m01–m12, mshp, msho, msk1–4) | najwięcej prozy — priorytet |
| Bank pytań | `data/<loc>/questions/*.json` — shardy per moduł (116 pytań) | pytania, dystraktory, feedback |
| Scenariusze | `data/<loc>/scenarios.json` | proza zadaniowa |
| Rubryki | `data/<loc>/rubrics.json` | kryteria oceny |
| Etykiety | `data/<loc>/modules.labels.json`, `paths.labels.json` | krótkie stringi |
| UI | `assets/i18n/<loc>.json` (~146+ kluczy) | przyciski, komunikaty, stany |
| Strony statyczne | `index.html`, `prywatnosc.html` | teksty osadzone |
| Ekran „Wynik" | `assets/core/certificate.js` (nazwa legacy po ADR-0005; stringi przez i18n) | komunikaty zaliczenia/bramek |

Poza zakresem: `docs/`, `wymagania/` (wewnętrzne, nie user-facing).

## 2. Kategorie błędów do wyłapania

### 2.1 Pauzy i myślniki (główny sygnał „tekstu z AI")
- **Polityka PL**: w prozie **półpauza ze spacjami** „tekst – tekst" (typografia polska). Em dash „—" bez spacji = anglicyzm typograficzny. Decyzja do podjęcia: półpauza `–` (rekomendacja, norma PWN) vs em dash ze spacjami (obecny uzus w repo — np. stopka, docs).
- **Nadużycie wtrąceń myślnikowych** — charakterystyczne dla treści generowanych: tam, gdzie naturalniejszy przecinek, dwukropek lub nawias, przepisać. Heurystyka: >1 wtrącenie myślnikowe na akapit = do przeglądu.
- Zakresy liczb: półpauza bez spacji (`6–7 h`, nie `6-7 h`, nie `6 — 7 h`).
- **Polityka EN**: em dash bez spacji (`word—word`) albo konsekwentnie en dash ze spacjami — jedno na cały locale; dziś mieszanka.

### 2.2 Typografia PL
- Cudzysłowy: „drukarskie" `„…”` zamiast prostych `"…"` w prozie (w JSON wymaga escapowania — tylko w wartościach tekstowych, nigdy w kluczach/kodzie).
- Sieroty: jednoliterowe spójniki (a, i, o, u, w, z) na końcu linii — twarda spacja ` ` w prozie lekcji (decyzja: czy wchodzimy w to w JSON-ach treści; rekomendacja: tak dla module-content, nie dla UI labels).
- Trzykropek `…` zamiast `...`; `%` bez spacji po liczbie (`75%`); jednostki ze spacją (`30 min`, `3,5 h`).
- Separator dziesiętny: przecinek w PL (`3,5 h`, nie `3.5 h`).

### 2.3 Język PL (merytorycznie)
- Diakrytyki — brakujące ogonki (część starszych plików pisana bez polskich znaków).
- Kalki z EN: „dedykowany" (=przeznaczony), „adresować problem", „bazując na", „w ramach" (nadużycie), „posiadać" (=mieć).
- `tę/tą`, `wziąć/wziąść`, imiesłowy, interpunkcja zdań podrzędnych.
- Spójność terminologii — **słownik terminów** (deliverable L1): co zostaje po angielsku (prompt, embedding, token, fine-tuning, RAG), co tłumaczymy (halucynacje, osadzenia?, łańcuch myśli?), jedna forma odmiany (promptu/prompta).
- Rejestr: per „ty" vs bezosobowo — jedna konwencja w całym kursie (dziś prawdopodobnie mieszanka).

### 2.4 EN i pozostałe locale
- EN: en-US vs en-GB (rekomendacja: en-US), kapitalizacja nagłówków (rekomendacja: sentence case), spójność z PL kanonem po przeglądzie PL.
- ES/FR/DE/IT/UK/VI: tłumaczone z PL kanonu (workflow M17) — po zmianach PL wymagają **diffowego doszlifowania**, nie pełnego re-tłumaczenia. Specyfika: FR spacje przed `?!:;` (U+202F), DE rzeczowniki wielką literą, UK apostrof `ʼ`, VI diakrytyki tonalne.
- `CRITICAL_PREFIX` i inne mapy per-locale (M17) — weryfikacja po zmianach.

## 3. Tooling — lint językowy (deliverable L2)

Nowy skrypt `tests/lint/lang-lint.mjs` (wzorzec: istniejący cluster-lint), CI-gated dla PL/EN, WARN dla reszty:

| Reguła | Wykrywa | Poziom |
|---|---|---|
| `em-dash-pl` | `—` w wartościach PL (poza allowlistą: stopka wersji) | ERROR |
| `range-dash` | `\d-\d` w zakresach (powinno być `–`) | WARN |
| `straight-quotes-pl` | `"` w prozie PL | ERROR |
| `double-space` | `  ` | ERROR |
| `dot-decimal-pl` | `\d\.\d` w PL (powinien być przecinek) | WARN |
| `ellipsis` | `...` | WARN |
| `dash-density` | >2 wtrącenia `—`/`–` w jednym stringu | WARN (sygnał AI-prozy) |
| `terminology` | formy spoza słownika terminów (configurable map) | WARN |
| Allowlist | URL-e, kod, identyfikatory, klucze JSON | — |

Lint czyta **tylko wartości** JSON (walk po stringach), nigdy klucze. Uwaga środowiskowa: pliki w iCloud bywają „dataless" — lint w kopii zmaterializowanej (znany gotcha).

## 4. Proces przeglądu

Trzy przebiegi na plik, w kolejności:
1. **Mechaniczny**: lint + auto-fix tam, gdzie bezpieczny (cudzysłowy, podwójne spacje, zakresy). Commit osobny — czysty diff mechaniczny.
2. **Redakcyjny (LLM)**: przegląd prozy per plik (18 module-content + scenariusze + pytania) wg styleguide'u i słownika; wynik jako propozycje diff, nie hurtowa podmiana. Commit per grupa plików.
3. **Próbka ludzka**: właściciel czyta golden sample — 2 moduły w całości (M6 + M10, najdłuższy i krytyczny) + 10% pytań losowo. Dopiero po akceptacji próbki przebieg 2 idzie na resztę.

Zasady bezpieczeństwa treści:
- Zero zmian merytorycznych w przebiegach 1–2 — wyłącznie język/typografia. Zmiana znaczenia pytania/dystraktora = osobne issue.
- Pytania krytyczne (M10): każda zmiana brzmienia wymaga jawnego ✓ właściciela.
- Po każdej fazie: `validate` + smoke (treść jest CI-gated dla wszystkich locale od M17).

## 5. Fazowanie (propozycja issues)

| ID | Zakres | Wyjście |
|---|---|---|
| L1 | Styleguide + słownik terminów (`docs/styleguide-jezykowy.md`) — decyzje: półpauza vs em dash, rejestr, en-US | dokument, decyzje właściciela |
| L2 | `lang-lint.mjs` + podpięcie do CI (ERROR dla PL/EN) | tooling + baseline raport |
| L3 | PL przebieg mechaniczny + redakcyjny + golden sample | czysty PL kanon |
| L4 | EN — jak L3, względem nowego PL kanonu | czysty EN |
| L5 | ES/FR/DE/IT/UK/VI — diffowe doszlifowanie po L3 (workflow per locale) | 6 locale |
| L6 | Strony statyczne + certyfikat + prywatność (wszystkie locale) | domknięcie |

L1 blokuje wszystko (bez decyzji o pauzach lint nie ma reguł). L3 blokuje L4/L5. Każda faza = osobny PR, bump wersji wg AGENTS.md.

## 6. Pytania otwarte

- **J1**: półpauza `–` ze spacjami (norma PWN) czy em dash `—` ze spacjami (obecny uzus w repo)? Rekomendacja: **półpauza** w treści kursu; em dash zostaje w docs technicznych.
- **J2**: twarde spacje (sieroty) w module-content — wchodzimy? Rekomendacja: tak, tylko proza lekcji.
- **J3**: rejestr PL — per „ty" (rekomendacja, spójne z tonem kursu) czy bezosobowy?
- **J4**: czy nowa treść z `Rebuild.md` (P1/P2) czeka na L1? Rekomendacja: tak — pisanie od razu wg styleguide'u jest tańsze niż refaktor.
