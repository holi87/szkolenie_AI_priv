# ADR-0011: Rebuild ścieżek — poziomy „AI z QA", nowe ścieżki P1/P2, Skala Holaka jako bonus

| Pole | Wartość |
|---|---|
| Status | Zaakceptowana |
| Issue | `#171` (plan: `docs/planning/Rebuild.md`, PR #170) |
| Rola decydenta | Właściciel |
| Powiązane | ADR-0005 (bez certyfikatu), ADR-0006/0007 (hybryda i persona-set — częściowo zastąpione), ADR-0009 (ścieżka formatywna) |

## Kontekst

S1/S2/S3 były trzema konfiguracjami tych samych 12 modułów M1–M12 (`requiredModules(S1) ⊂ S2 ⊂ S3`) — różniły się tylko sitem wymagań, nie treścią. Trzy karty na ekranie wyboru sugerowały trzy programy, a użytkownik dostawał ten sam program z innym progiem. Decyzja właściciela (Rebuild.md): poziomy zamiast pseudo-ścieżek + dwie ścieżki o realnie nowej treści + Skala Holaka jako bonus.

## Decyzja

1. **Poziomy zamiast ścieżek (wariant A, zero migracji).** S1/S2/S3 ZOSTAJĄ w danych i progresie pod dotychczasowymi id — dostają pole `level: 1|2|3` i są prezentowane jako JEDNA karta „AI z QA" z selektorem poziomu (Podstawowy/Praktyk/Inżynier). Silnik (test-engine, scoring, gates, bank pytań `paths[]`) bez zmian logiki; etykiety per-locale niosą nazwę z poziomem. Progres pozostaje per poziom (klucze `genai-training:progress:S1..S3` nietknięte).
2. **P1 „AI w domu"** — nowa ścieżka FORMATYWNA (wzorzec ADR-0009): 6 modułów MD1–MD6 (`scope: diagnostic`, bez puli pytań), filar `everyday`, bez testu/progu/zaliczenia.
3. **P2 „Bezpieczne używanie AI"** — nowa ścieżka zaliczeniowa: 6 modułów MB1–MB6 z dedykowaną pulą 36 pytań (Q117–Q152), test końcowy 20 pytań, próg 75%, **4 pytania krytyczne w MB2 bramkowane 100%** (konserwatywnie, jak M10).
4. **Skala Holaka = bonus.** S4 dostaje `bonus: true` i jest prezentowana POZA siatką wyboru (osobny pasek) — narzędzie diagnostyczne obok dowolnej ścieżki, nie alternatywa. Id, dane i progres bez zmian.
5. **Moduły opcjonalne WIDOCZNE.** `pathVisibleModuleIds` zwraca pełną mapę modułów ścieżki; w poziomach „AI z QA" moduły opcjonalne dostają badge „opcjonalny" zamiast ukrycia. To świadome wycofanie ukrywania persona-set z ADR-0006 (rolę persony pełni poziom); gating bez zmian (opcjonalne nie blokują testu).
6. **Pytania krytyczne per moduł bezpieczeństwa.** Inwariant „dokładnie 5 krytycznych w M10" uogólniony: liczność krytycznych DERYWOWANA z `modules.json` (`criticalQuestions`), pokrycie ścieżek DERYWOWANE z `paths.json` (pytanie krytyczne obejmuje każdą nieformatywną ścieżkę zawierającą jego moduł). Golden set pozostaje 24 pytania wyłącznie z rdzenia M1–M12.
7. **Bez certyfikatu wszędzie** — potwierdzenie ADR-0005; P2 kończy się ekranem „Wynik" z badge zaliczenia.

## Konsekwencje

- **Zero migracji** danych użytkowników: wszystkie dotychczasowe klucze progresu czytane bez zmian; nowe ścieżki dostają własne klucze (`:P1`, `:P2`).
- Bank pytań: 116 → 152 (inwarianty walidatora: TOTAL, DIFF_TARGET, EXPECTED_COUNTS rozszerzone; udział scenariuszy ≥35% utrzymany — 40,8%).
- Moduły: 18 → 30; treść per locale 30 plików (bramka CI dla wszystkich 8 locale, jak po M17).
- UI: karta grupy z selektorem poziomu, pasek bonusu, wykresy na ekranie Wynik (bary per moduł/filar), celebracja zaliczenia (konfetti, `prefers-reduced-motion`-safe) — refresh wg mockupu `docs/design/refresh-2026-06/mockupy.html`.
- ADR-0006/0007 (persona-set przez ukrywanie modułów) — częściowo zastąpione przez pkt 5; rozłączność pul dedykowanych i kwoty `dedicatedQuestionsMin` pozostają w mocy.
- Ekran wyboru: hero liczy „ścieżki" jako karty wyboru (3 + bonus), nie surowe PATH_IDS.
