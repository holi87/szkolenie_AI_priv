# Pakiet QA i pilotażu (M5)

Komplet materiałów do weryfikacji szkolenia przed wdrożeniem i do przeprowadzenia pilotażu na grupie
8–15 osób (wymagania/07, /09, /10). Dotyczy aplikacji w `genai-llm-training/`.

## Spis

| Plik | Dla kogo | Issue |
|---|---|---|
| [instrukcja-uczestnika.md](instrukcja-uczestnika.md) | Uczestnik pilotażu | #27 |
| [formularz-feedbacku.md](formularz-feedbacku.md) | Uczestnik / koordynator (do wpięcia w narzędzie ankietowe) | #27 |
| [plan-komunikacji.md](plan-komunikacji.md) | Koordynator + sponsor (w tym informacja o zbieranych danych) | #27 |
| [raport-testow.md](raport-testow.md) | Osoba wdrażająca (jak uruchomić testy, co bramkują) | #25 |
| [checklist-manualna.md](checklist-manualna.md) | QA (desktop/tablet/mobile + klawiatura + focus) | #25 |
| [recenzja-merytoryczna-security.md](recenzja-merytoryczna-security.md) | SME / Security / sponsor | #26 |
| [raport-kalibracji.md](raport-kalibracji.md) | Lead ID + SME (po pilotażu) | #28 |

## Status milestone M5

| Issue | Stan | Uwaga |
|---|---|---|
| #25 Automatyczne testy smoke/danych/dostępności | ✅ dostarczone | `tests/smoke/*.test.mjs` + `validate.mjs` + self-test kalibracji; CI zielone |
| #26 Recenzja merytoryczna i security | ✅ dostarczone | P0=0, 3 kryteria spełnione; follow-up P1/P2: #57, #58; rekomendowany sign-off człowieka |
| #27 Pakiet pilotażowy | ✅ dostarczone | Instrukcja, formularz, plan komunikacji, eksport wyniku, pomiar czasu |
| #28 Kalibracja pytań po pilotażu | ⏳ **narzędzie gotowe, kalibracja czeka na realny pilotaż** | `tools/calibration/calibrate.mjs` + schemat + raport-template + demo na danych syntetycznych. **Issue #28 pozostaje otwarte** — pełna kalibracja wymaga realnych wyników pilotażu (8–15 osób). |

> **Dlaczego #28 pozostaje otwarte:** wszystkie kryteria akceptacji #28 wymagają realnych danych z pilotażu
> (odsetek poprawnych vs zakres trudności, >10% niejasności pytań krytycznych, walidacja golden setu na
> uczestnikach). AI nie może przeprowadzić pilotażu na ludziach, więc dostarczamy **narzędzie i metodykę**
> gotowe do uruchomienia na realnych danych, a samo #28 zamknie się dopiero po pilotażu. To świadoma,
> uczciwa decyzja zakresu — nie zamykamy issue, którego wejście (odpowiedzi uczestników) nie istnieje.
