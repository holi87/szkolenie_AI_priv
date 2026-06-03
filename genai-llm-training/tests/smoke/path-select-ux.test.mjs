// path-select-ux.test.mjs — redesign ekranu startowego (issue #71, UX-2): hero, karta rekomendowana,
// slot przełącznika języka. Strukturalnie (serializeTree/countByTag z QA-2) — NIE wizualnie (ADR-0002).
import "./_dom-stub.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { serializeTree, countByTag } from "./_snapshot.mjs";
import { pathsData, modulesData } from "./_fixtures.mjs";
import { renderPathSelect } from "../../assets/ui/path-select.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const appHtml = readFileSync(join(HERE, "..", "..", "index.html"), "utf8");

const node = renderPathSelect(pathsData, modulesData, { onSelect: () => {}, onName: () => {} });
const snap = serializeTree(node);
const occ = (re) => (snap.match(re) || []).length;

test("hero: sekcja + tytuł z akcentem + lead (pierwsze wrażenie)", () => {
  assert.match(snap, /class="hero"/, "brak sekcji .hero");
  assert.match(snap, /hero__accent/, "brak słowa-akcentu w hero (gradient + fallback solid)");
  assert.match(snap, /hero__lead/, "brak podtytułu hero");
});

test("3 karty ścieżek; dokładnie JEDNA rekomendowana z plakietką", () => {
  assert.equal(countByTag(node).ARTICLE, 3, "powinny być 3 karty ścieżek");
  assert.equal(occ(/path-card--recommended/g), 1, "dokładnie jedna karta rekomendowana");
  assert.equal(occ(/path-card__badge/g), 1, "dokładnie jedna plakietka rekomendacji");
});

test("karty zachowują CTA + szczegóły wymaganych modułów (treść nie zniknęła po restylizacji)", () => {
  assert.equal(occ(/path-card__cta/g), 3, "każda karta ma przycisk wyboru");
  assert.match(snap, /path-card__details/, "karta bez szczegółów modułów");
  // Pseudonim: kontrolka z etykietą nadal obecna (a11y, #63).
  assert.match(snap, /INPUT\[[^\]]*id="participant-name"/, "zgubiono pole pseudonimu");
});

test("przełącznik języka (#79): AKTYWNY trigger (menu, fokusowalny), opisany, z flagą + kodem", () => {
  assert.match(appHtml, /<div[^>]*class="lang-switch"[^>]*id="lang-switch"/, "brak kontenera #lang-switch");
  const tag = /<button[^>]*id="lang-switch-btn"[^>]*>/.exec(appHtml);
  assert.ok(tag, "brak triggera #lang-switch-btn w app-header__meta");
  const open = tag[0];
  assert.match(open, /aria-haspopup="menu"/, "trigger powinien mieć aria-haspopup=menu");
  assert.match(open, /aria-expanded=/, "trigger bez aria-expanded");
  assert.match(open, /aria-label=/, "trigger bez aria-label (opisany dla SR)");
  assert.ok(!/aria-disabled/.test(open), "trigger nie jest już inertny (#79 wpięło logikę)");
  assert.ok(!open.includes(" disabled"), "trigger musi zostać w kolejności tab (fokusowalny)");
  // Flaga (slot wypełniany przez JS) + tekstowy nośnik kodu „PL" (a11y: nie sam kolor/emoji).
  assert.match(appHtml, /lang-switch__flag-wrap/, "brak slotu flagi");
  assert.match(appHtml, /lang-switch__label"[^>]*>PL</, "brak tekstu PL");
});
