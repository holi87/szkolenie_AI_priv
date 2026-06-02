<claude-mem-context>
# Memory Context

# [szkolenie_AI_priv] recent context, 2026-06-02 8:37pm GMT+2

No previous sessions found.
</claude-mem-context>

# AGENTS.md

Lokalne zasady pracy dla repo `szkolenie_AI_priv`.

## Workflow GitHub

- Kazdy GitHub issue musi byc realizowany na osobnym branchu.
- Nie commituj bezposrednio do `main` i nic nie merguj lokalnie do `main`.
- Kazda zmiana wdrozeniowa konczy sie pull requestem.
- PR musi zamykac realizowane issue slowem kluczowym `Closes #<numer>` w opisie PR (np. `Closes #12`), zeby issue zamknelo sie automatycznie po merge. Dla wielu issue uzyj osobnej linii `Closes` na kazde issue.
- Po wystawieniu PR czekamy na zielone CI oraz review Codexa.
- Nie zamykaj issue i nie uznawaj pracy za zakonczona, dopoki PR nie przejdzie CI i review.
- Przed rozpoczeciem nowego issue zawsze pobierz najnowszy `origin/main`: `git fetch origin`, `git switch main`, `git pull --ff-only origin main`.
- Dla nowego issue zaczynaj od aktualnego `main`, a dopiero potem utworz branch w stylu `issue-12-krotki-opis`.
- Jedno issue = jeden temat. Nie mieszaj refactoru, zmian tresci i zmian architektury w jednym PR, jesli nie sa konieczne do realizacji issue.

## Struktura kodu i plikow

- Nie buduj jednego wielkiego pliku aplikacji.
- Rozdzielaj kod wedlug odpowiedzialnosci: dane, logika quizow, scoring, progres, UI, certyfikat, walidacja, testy.
- Pliki powinny miec zwykle maksymalnie 700-800 LOC.
- Limit 1000 LOC jest dopuszczalny tylko w szczegolnych przypadkach i wymaga jasnego uzasadnienia w PR.
- Gdy plik zbliza sie do limitu, wydziel modul, helper, komponent, dane albo testy.
- Tresci szkoleniowe i dane trzymaj oddzielnie od logiki aplikacji.
- Nie duplikuj duzych blokow logiki; wydziel wspolne funkcje tylko wtedy, gdy realnie upraszczaja kod.

## Programowanie

- Przed implementacja przeczytaj odpowiednie wymagania z `wymagania/` oraz issue z GitHuba.
- Trzymaj zakres scisle zgodny z issue i jego kryteriami akceptacji.
- Preferuj proste, jawne rozwiazania zamiast rozbudowanych abstrakcji.
- Projektuj kod tak, zeby pozniejszy backend wynikow mogl zostac dodany przez adapter, bez przepisywania UI.
- Unikaj ukrytych zaleznosci globalnych; przekazuj dane jawnie albo przez lokalne moduly.
- Waliduj struktury danych kursu, pytan, sciezek i progresu.
- Wszystkie przyklady danych w szkoleniu musza byc syntetyczne.
- Dla funkcji zwiazanych z bezpieczenstwem, scoringiem, pytaniami krytycznymi i certyfikatem stosuj konserwatywne zachowanie domyslne.

## Testowanie i ochrona przed regresja

- Kazda zmiana funkcjonalna powinna miec adekwatna weryfikacje: test jednostkowy, test danych, smoke test, test UI albo checkliste manualna.
- Dla zmian w schematach danych uruchamiaj walidacje danych.
- Dla zmian UI sprawdzaj przynajmniej desktop i mobile 360 px.
- Dla interakcji sprawdzaj obsluge klawiatura i widoczne focus states.
- Dla quizow i testu koncowego sprawdzaj scoring, progi, pytania krytyczne i zapis progresu.
- Dla zmian tresci sprawdzaj powiazanie z modulem, sciezka, efektem uczenia i pytaniami.
- Nie ignoruj failing testow, hookow ani ostrzezen wskazujacych realna regresje.
- Przed PR uruchom realne testy dostepne w repo; jesli testow jeszcze nie ma, wykonaj jawna checkliste manualna i opisz ja w PR.
- Po zmianie shared engine albo danych testuj wszystkie sciezki S1/S2/S3, nie tylko przypadek dotkniety przez issue.

## PR checklist

- Issue jest podlinkowane.
- Zakres PR odpowiada tylko jednemu issue.
- Kryteria akceptacji z issue sa spelnione albo jasno oznaczone jako blokowane.
- Zmiany sa podzielone na sensowne pliki, bez przekroczenia limitow LOC.
- Testy lub checklista manualna sa wykonane i opisane.
- CI jest zielone.
- Review Codexa jest wykonane przed merge.
