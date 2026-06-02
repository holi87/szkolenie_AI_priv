# ADR-0001: Architektura statycznego szkolenia na GitHub Pages

| Pole | Wartość |
|---|---|
| Status | Zaakceptowana dla MVP (warunki backendu odroczone do decyzji po pilotażu) |
| Issue | `#2 [02][M0] Przygotuj ADR architektury statycznego szkolenia` |
| Zależności | `#1` (karta projektu — zmergowana) |
| Źródła | `wymagania/08` (warianty A/B/C, hosting), `wymagania/12` (P2–P4, P10, P15, A10–A12), `docs/karta-projektu.md` §4 |

---

## Kontekst

Szkolenie ma być samodzielną aplikacją dostępną dla trzech ścieżek (S1/S2/S3). Karta projektu (#1, §4.1) ustaliła **GitHub Pages jako wiążący model hostingu** — nadrzędny wobec samego faktu, że treść jest w HTML. `wymagania/08` opisuje trzy warianty zależności od backendu (A: statyczny + localStorage, B: statyczny + eksport, C: backend wyników) oraz wymaganie „Szkolenie działa ze statycznych plików". `wymagania/12` pozostawia otwarte decyzje sponsora o raportowaniu (P2), logowaniu (P3), wartości certyfikatu (P4), śledzeniu wyników (P10) i dystrybucji (P15).

Potrzebna jest jedna decyzja architektoniczna, która: (a) odblokuje budowę MVP bez czekania na decyzje sponsora, (b) nie zamknie drogi do późniejszego backendu raportowego, (c) jawnie nazwie ryzyka wynikające z braku serwera.

## Decyzja

MVP/pilotaż realizujemy jako **wariant A + element B**: statyczne HTML/CSS/JS + JSON, progres w `localStorage`, wynik eksportowalny do JSON/CSV, certyfikat jako ekran/PDF — **serwowane przez GitHub Pages**.

Wiążące reguły architektury (z §4.1 karty):

1. Cała aplikacja jest klient-side; brak kodu serwerowego w runtime.
2. Dostęp do danych i progresu przez **adaptery**, nie bezpośrednio: `progress-store` (zapis/odczyt progresu) i loader danych (`modules/questions/golden-set/scenarios/paths`). To granica, za którą można później podstawić backend.
3. Ścieżki względne (działanie z podścieżki `https://<user>.github.io/<repo>/`).
4. `data/*.json` ładowane przez `fetch()` po http(s); uruchomienie lokalne wymaga statycznego serwera (zob. issue #3), nie `file://`.

## Co jest MVP, a co przyszłym rozszerzeniem

| Obszar | MVP (teraz) | Przyszłe rozszerzenie |
|---|---|---|
| Progres | `localStorage` przez `progress-store` | Synchronizacja do backendu przez ten sam adapter |
| Wynik | Liczone lokalnie + eksport JSON/CSV | Zapis server-side, raporty per osoba/grupa (P10) |
| Certyfikat | Ekran/PDF, ID informacyjne | Certyfikat o wartości formalnej, podpisany (P4) |
| Tożsamość | Anonimowo, bez kont (P3 default) | Logowanie / SSO (P3) |
| Audyt | Brak (statyczny) | Log prób, czasów, wyników, śladu audytowego |
| Hosting | GitHub Pages (statyczny) | Pages dla frontu + **zewnętrzny** serwis backendu |

## Alternatywy rozważone

- **B-only (tylko eksport, bez localStorage):** odrzucone — gorszy UX, brak powrotu do ostatniego miejsca i progresu między sesjami.
- **C teraz (backend od razu):** odrzucone dla MVP — większy koszt i czas, blokuje start pilotażu decyzjami sponsora (P2/P3/P4/P10), sprzeczne z planem („backend osobnym strumieniem po decyzji").
- **A + B (wybrane):** najszybsza droga do pilotażu, zgodna z GitHub Pages, z adapterem gotowym na backend.

## Warunki przejścia do backendu wyników

Przejście do wariantu C uruchamiamy, gdy zajdzie **co najmniej jeden** z warunków (mapowanie na pytania sponsora):

1. Sponsor wymaga **centralnego raportowania** wyników/postępów (P2, P10).
2. Certyfikat ma mieć **wartość formalną** / audytowalne ID zaliczenia (P4).
3. Wymagany jest **ślad audytowy** prób i wyników (governance, zgodność).
4. Potrzebna jest **tożsamość uczestnika** / logowanie (P3).

Architektura przejścia (bez przepisywania UI):

- Backend jest **zewnętrznym serwisem poza GitHub Pages**; front pozostaje statyczny na Pages i woła API przez HTTPS (CORS).
- Wymiana implementacji `progress-store` (localStorage → klient API) za tym samym interfejsem; UI i logika quizów/scoringu bez zmian.
- **Kontrakty danych** (`questions`, `paths`, `progress`, wynik) muszą być stabilne od M2, żeby backend je przyjął bez migracji modelu.
- Warunki wdrożeniowe: uwierzytelnianie, polityka danych (P1/P6 — dane uczestnika), zgodność, koszt utrzymania, owner serwisu.

## Ryzyka audytu i manipulacji wynikiem

Architektura statyczna ma **z założenia** słabą wiarygodność wyniku — to świadomy koszt MVP, nie błąd:

| Ryzyko | Skutek | Mitygacja w MVP | Co rozwiązuje backend |
|---|---|---|---|
| `localStorage` jest edytowalny przez użytkownika | Wynik/progres można podrobić w przeglądarce | Wynik MVP jest **informacyjny** (P4 default), nie formalne zaliczenie | Scoring i zapis po stronie serwera |
| Eksport JSON/CSV podrabialny | Sponsor nie może ufać przekazanemu plikowi jako dowodowi | Komunikat, że plik to artefakt informacyjny; brak wartości formalnej | Podpisany wynik / certyfikat z serwera |
| Brak centralnego logu prób | Brak śladu audytowego, liczby podejść, czasu | Świadomie poza zakresem MVP; zbierane ręcznie w pilotażu | Log prób, czasów, wersji pytań |
| Podejrzenie banku pytań w kodzie/danych | Anti-gaming osłabione (pytania widoczne w `data/`) | Bramka **pytań krytycznych** (warunek konieczny) niezależna od % oraz golden set kontrolny; rotacja wariantów (§7) | Losowanie i walidacja po stronie serwera |

Konserwatywny default zgodny z AGENTS.md: dla scoringu, pytań krytycznych i certyfikatu zachowanie ostrożne; wynik MVP nie jest traktowany jako formalne zaliczenie do czasu decyzji sponsora i ewentualnego backendu.

## Konsekwencje

**Pozytywne:** szybki start pilotażu, brak infrastruktury, zgodność z GitHub Pages, czysta granica adaptera pod przyszły backend, stabilne kontrakty danych od M2.

**Negatywne / do zaakceptowania:** wynik niewiarygodny dla celów formalnych, brak audytu i raportowania centralnego, ograniczenie `file://` (wymaga statycznego serwera lokalnie), anti-gaming oparty wyłącznie na konstrukcji pytań i bramce krytycznej.

## Linki

- `wymagania/08_specyfikacja_interaktywnego_szkolenia_html.md` (warianty A/B/C, sekcja „Hosting i wdrożenie — GitHub Pages")
- `wymagania/12_założenia_i_pytania_otwarte.md` (P2, P3, P4, P10, P15, A10–A12, A16)
- `docs/karta-projektu.md` §4.1 (decyzja GitHub Pages), §5 (statusy P)
- Powiązane issue: #33 (deploy na GitHub Pages), #35/PR #36 (GitHub Pages w wymaganiach), #16 (`progress-store`), #9 (schematy danych)
