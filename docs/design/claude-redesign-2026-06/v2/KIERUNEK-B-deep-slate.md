# Kierunek B — „Deep Slate Premium"

> **Status: PROPOZYCJA.** Decyzja właściciela w review #150. Floor = mockup; ten kierunek celuje wyżej.
> **Teza:** premium „dark-tech" przez **głębię warstw** (bogatsze, głębsze tło) i precyzyjne
> przesunięcie akcentu na chłodniejszy/jaśniejszy odcień — Z ZACHOWANYM ratio kontrastu.
> Light motyw świadomie nietknięty (a11y > estetyka). Średni blast radius: paleta dark do recompute.

---

## 1. Charakter

Ciemny motyw schodzi głębiej (granat-slate zamiast neutralnej czerni), warstwy `surface`
zyskują wyraźniejszą separację głębią i miękką elewacją, akcent dostaje chłodniejszy, lekko jaśniejszy
ton dla „high-end tech" sznytu. Wrażenie: spokojny, głęboki interfejs produktowy (dashboard premium),
gdzie hierarchia czytana jest przez **głębię i światło**, nie przez obwódki. Light pozostaje
konserwatywny i czytelny — zmieniamy WYŁĄCZNIE dark.

## 2. Delta tokenów — TYLKO motyw ciemny (light bez zmian)

> **WAŻNE:** każdy hex poniżej to *kandydat* — ostateczne wartości przechodzą `contrast.test.mjs`
> PRZED merge. Podane ratio są przybliżeniem do weryfikacji liczbowej w CI.

| Token (dark) | Live | Kierunek B | Kontrast docelowy (do CI) |
|---|---|---|---|
| `--color-bg` | `#0F1219` | `#0B0E15` | (tło — odniesienie) |
| `--color-surface` | `#161A22` | `#141923` | fg/surface ≈ 15.5:1 ✓ |
| `--color-surface-2` | `#1E232E` | `#1C2230` | warstwa interakcji |
| `--color-surface-3` | `#262C39` | `#2A3142` | selected/nested wyraźniejsze |
| `--color-fg` | `#EAEDF3` | `#EDF0F6` | fg/bg ≈ 16.5:1 ✓ |
| `--color-muted` | `#A7B0C0` | `#AAB3C3` | muted/bg ≈ 8.7:1 ✓ |
| `--color-border` (interakcyjny) | `#6B7588` | `#6E7890` | /bg ≈ 4.0:1 ✓, /surface ≈ 3.7:1 ✓ |
| `--color-border-subtle` (dekor.) | `#2A3140` | `#28303F` | dekoracyjny (1.4.11 N/D) |
| `--color-accent` | `#6EA8FE` | `#5B9BFE` | /bg ≈ 7.9:1 ✓, /surface ≈ 7.3:1 ✓ |
| `--color-accent-quiet` | `#18233A` | `#15233C` | fg/quiet ≈ 13.5:1 ✓ |
| `--color-accent-2` (gradient/dekor) | `#9C8CFA` | `#8E84F8` | weryfikacja ręczna (nie tekst) |
| `--shadow-md` | `0 8px 24px rgba(0,0,0,.36)` | `0 10px 28px rgba(0,0,0,.42)` | głębsza elewacja dark |

**Light motyw (`:root[data-theme="light"]`): BEZ ZMIAN** — już konserwatywny i CI-zielony.
Statusy (`--color-ok/warn/bad/locked`) **bez zmian** w obu motywach (semantyka).

## 3. Nazwane komponenty (restyl, zero nowych haków)

| Komponent | Zmiana prezentacji |
|---|---|
| `.app-header`, `.view`, `.module-nav` | `--shadow-md` głębszy; tło `surface` na nowym, głębszym bg = mocniejsza separacja warstw |
| `.path-card`, `.hub-card` | tło `surface`, hover lift + głębszy cień (głębia robi hierarchię) |
| `.path-card--recommended` | akcent-rule (`::before` 3px) na nowym `--color-accent` `#5B9BFE` — wyrazistsza |
| `.nav-item__btn[aria-current]` | inset accent-bar na nowym akcencie; tło `--color-accent-quiet` głębsze |
| `.result__score-inner` (pierścień) | pierścień score rysowany nowym akcentem; struktura haka bez zmian |
| `.option:has(input:checked)`, `.feedback--*` | `accent-quiet` głębszy, border na nowym akcencie |
| `.hero__accent` | **flat** `color: var(--color-accent)` (C4) — tylko nowy odcień, nadal solid |

## 4. Motion (CSS-only, C6)

Bez zmian względem live — głębia jest statyczna (cień+tło), nie animowana. `prefers-reduced-motion`
respektowane (już w styles.css). `--ring-accent` recompute na nowy akcent (alpha bez zmian).

## 5. Jak ten kierunek czyści twarde ograniczenia

| Ograniczenie | Status | Jak |
|---|---|---|
| C1 ADR-0002 | ✓ | tylko edycja tokenów, zero buildu |
| C2 fonty systemowe | ✓ | zero nowych fontów |
| C3 kontrast oba motywy | ⚠ → ✓ | dark recompute: **wszystkie nowe hexy przez `contrast.test.mjs` przed merge**; light nietknięty (już zielony) |
| C4 hero flat-accent | ✓ | `.hero__accent` zostaje solid color (nowy odcień, nie gradient) |
| C5 haki strukturalne | ✓ | restyl, nie usunięcie; wszystkie haki zostają |
| C6 motion CSS-only | ✓ | bez nowego JS; reduced-motion gasi |
| C7 i18n × 320 px | ✓ | brak zmian layoutu/typografii → reflow niezmieniony |
| C8 focus 3 px | ✓ | `--focus`/`--ring-accent` recompute na nowy akcent, ≥3:1 |
| C9 higiena plików | ✓ | zmiany w `tokens.css` + drobny restyl, w limicie |
| C10 dane syntetyczne | ✓ | bez zmian |

## 6. Trade-offy (jawnie)

- **Plus:** wyraźny, „premium dark-tech" sygnał przy pierwszym spojrzeniu; głębia daje hierarchię
  bez dodawania obwódek (zgodne z duchem DESIGN-PROPOSAL: „mniej krawędzi, więcej warstw").
- **Minus / koszt:** **wymaga przeliczenia kontrastu dark** dla każdej zmienionej pary — to praca
  do wykonania i zazielenienia w `contrast.test.mjs` przed merge (hexy są kandydatami, nie pewnikami).
- **Asymetria motywów:** light nietknięty, dark pogłębiony — różnica charakteru między motywami
  rośnie. Świadomy trade-off (a11y/konserwatyzm light > spójność estetyczna).
- **Ryzyko `#5B9BFE`:** jaśniejszy akcent na głębszym tle musi nadal dawać ≥4.5:1 dla tekstu-linku
  na `surface-2`/`surface-3` — do potwierdzenia CI (kandydat ~6.5:1, prawdopodobnie OK).

## 7. Wzorzec dla wdrożenia (#139–#145)

1. Podmienić wartości dark w `tokens.css` (`:root`) wg §2; **nie ruszać** `:root[data-theme="light"]`.
2. Recompute i potwierdzić kontrast: dopisać/uruchomić `contrast.test.mjs` na nowych parach dark —
   wszystkie ≥4.5:1 (tekst) / ≥3:1 (UI). Korekta hexów, jeśli któraś para nie wyjdzie.
3. Restyl komponentów z §3 (elewacja, akcent-rule) w `styles.css`/`styles/*.css`.
4. Smoke `fail 0`, contrast zielony (dark+light), audyt 320/360 px (layout niezmieniony — sanity).
