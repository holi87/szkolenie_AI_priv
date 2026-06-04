# ADR-0005: Usunięcie certyfikatu i pseudonimu — szkolenie jako self-assessment

| Pole | Wartość |
|---|---|
| Status | Zaakceptowana |
| Issue | `#93 [M12-2] Usuń certyfikat i pseudonim; zostaw ekran „Wynik"` |
| Rola decydenta | Solution Architect / właściciel |
| Powiązane | ADR-0001 (statyczny hosting, model progresu), ADR-0003 (nota prywatności, pseudonim), `wymagania/00_pelna_analiza.md` (charakter „certyfikacyjny"), #61, #63 |

---

## Kontekst

- Właściciel uznał **certyfikat ukończenia** oraz **wpisywanie pseudonimu** za zbędne („zbędne całkowicie"). Wartość formatywna (wynik %, słabe obszary, status bramek, możliwość powtórki) ma zostać.
- Dotychczasowy artefakt certyfikatu obejmował: medal (dekoracyjny SVG), `completionId` (deterministyczny marker `CERT-<ścieżka>-<dzień>-<hash>`), opcjonalny `displayName` (pseudonim sesyjny, model C #63), framing „Certyfikat ukończenia / Gratulacje".
- **Napięcie z wymaganiami:** `wymagania/00_pelna_analiza.md` opisuje szkolenie jako **„certyfikacyjne"**. Usunięcie certyfikatu zmienia charakter na **self-assessment** (samoocena formatywna). To świadoma decyzja właściciela, sprzeczna z literą wymagań/00 — odnotowana tutaj, bo zmienia kontrakt produktu.
- **Model bramek/gatingu testu końcowego przeżywa bez wrappera certyfikatu**: progi, pytania krytyczne (M10), bramki praktyczne i scoring ścieżki działają identycznie — certyfikat był tylko prezentacją wyniku zaliczenia, nie warunkiem zaliczenia.

## Decyzja

1. **Usuwamy artefakt certyfikatu i pseudonim.** Znikają: medal, `completionId`, `generateCompletionId`, `displayName`, input pseudonimu (`participant-name`) na ekranie wyboru ścieżki, `store.setParticipant/getParticipant`, `store.recordCertificate` oraz pole `certificate` w `progress.schema.json`. Klucze i18n `cert.*`, `path.name.*` usunięte/przemianowane (PL+EN parytet).
2. **Zostaje ekran „Wynik"** (`renderResult`, `buildResult`): wynik %, **status zaliczenia jako badge ikona+SŁOWO** (WCAG 1.4.1 — „Zaliczone", nie sam kolor/medal), status bramek, słabe obszary, retry, **eksport anonimowy** JSON/CSV (i tak nigdy nie zawierał pseudonimu; teraz też bez `completionId`).
3. **Backward-compat prywatności:** sweep legacy `participant` z `localStorage` (sprzed M12-2) **zostaje** — starsze zapisy mogą go trzymać; nowy kod nigdy go nie tworzy ani nie czyta.
4. **Charakter szkolenia:** oficjalnie **self-assessment / formatywne**, nie certyfikacyjne. Dalsze materiały (wymagania/00) traktujemy jako historyczne w tym zakresie; przy ewentualnym powrocie certyfikatu trzeba tę decyzję cofnąć świadomie.

## Konsekwencje

- **Prywatność jeszcze mocniejsza** (spójne z ADR-0003): brak pseudonimu w UI = brak jakichkolwiek danych wpisywanych przez użytkownika; eksport pozostaje anonimowy i bez `completionId`. Nota prywatności i `prywatnosc.html` zostają (link w stopce + na ekranie wyboru ścieżki), ale bez wzmianki o pseudonimie.
- **Nazwy plików `certificate.js` / `certificate-view.js` zachowane** dla stabilności importów (mniejszy blast radius); semantyka i nagłówki opisują „Wynik". Funkcja `buildCertificate`→`buildResult`, zwraca `passed` zamiast `issued`/`completionId`.
- **Brak regresji gatingu:** scoring, bramki, pytania krytyczne i golden-set nietknięte; testy `practical-pass`, `scoring`, `certificate` (przemianowane na semantykę Wyniku) zielone, `validate-data` zielone, parytet PL+EN utrzymany.
- **Warunek trwałości:** jeśli wróci potrzeba certyfikatu/akredytacji, ten ADR i `wymagania/00` wymagają rewizji (przywrócenie `completionId`/artefaktu + ponowna ocena prywatności względem ADR-0003).
