# ADR-0003: Brak banera cookie; transparentność przez notę prywatności

| Pole | Wartość |
|---|---|
| Status | Zaakceptowana |
| Issue | `#62 [M7] Dodaj notę prywatności (prawo UE) + info o localStorage; bez banera cookie` |
| Rola decydenta | Solution Architect / właściciel |
| Powiązane | ADR-0001 (statyczny hosting, localStorage), ADR-0002 (vanilla static), #61, #63, audyt prywatności (M7) |

---

## Kontekst

- Audyt prywatności (M7) potwierdził empirycznie: aplikacja ma **zero cookies**, zero `sessionStorage`/`indexedDB`, zero żądań do zewnętrznych hostów, zero analityki/CDN/fontów. Cały ruch jest same-origin (`data/*.json`).
- Jedyny mechanizm trwałego stanu to `localStorage` (postęp, wyniki, czasy; klucze `genai-training:progress:*`, `genai-training:cursor`). Pseudonim po #63 nie jest persystowany (tylko pamięć sesji).
- Stan prawny UE:
  - **ePrivacy 2002/58/WE art. 5(3)** jest technologicznie neutralny i obejmuje `localStorage` tak jak cookies (EDPB Guidelines 2/2023; Planet49 C-673/17). ALE zapis postępu i pseudonimu to klasyczny wyjątek *strictly necessary* („user-input” / „UI customisation”, WP29 Opinion 04/2012) — usługa wprost zażądana przez użytkownika → **zgoda nie jest wymagana**.
  - Przy zero cookies śledzących i zero trackingu **baner zgody na cookies nie jest wymagany**.
  - Pozostaje obowiązek **informacji** (art. 5(3) ePrivacy + art. 13 RODO).

## Decyzja

1. **NIE dodajemy banera/CMP zgody na cookies.** Byłby prawnie zbędny i mylący — sugerowałby śledzenie, którego nie ma.
2. **Transparentność realizujemy notą prywatności:** strona `genai-llm-training/prywatnosc.html` (co trzymamy lokalnie, że nic nie wysyłamy, jak usunąć, podstawa prawna) + lekka nota informacyjna w UI przy polu pseudonimu i w stopce, z linkiem do tej strony.
3. **Minimalizacja danych:** pseudonim, nie prawdziwe imię (label + mikrokopia, #63); pseudonim nie jest persystowany ani eksportowany; `completionId` nie koduje pseudonimu (#61).

## Konsekwencje

- Zgodność z prawem UE bez frykcji banera; brak zewnętrznego CMP (spójne z ADR-0002 „vanilla static, zero zależności”).
- **Warunek trwałości decyzji:** jeśli kiedykolwiek pojawią się cookies, analityka, third-party (np. CDN/fonty), osadzone ramki albo backend wyników z transmisją danych — tę decyzję trzeba **ponownie rozpatrzyć** (wtedy zgoda/baner mogą być wymagane). Utrzymanie pilnuje tego w przeglądzie (`docs/release/playbook-utrzymania.md`).
- Test regresji wdrożenia (`tests/smoke/pages-deploy.test.mjs`) pilnuje braku zewnętrznych zasobów i poprawności strony prywatności.
