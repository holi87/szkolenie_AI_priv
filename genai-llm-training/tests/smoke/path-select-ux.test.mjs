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

test("slot przełącznika języka (#71): inertny, ale FOKUSOWALNY (aria-disabled, nie disabled) i opisany", () => {
  const tag = /<button[^>]*id="lang-switch"[^>]*>/.exec(appHtml);
  assert.ok(tag, "brak slotu #lang-switch w app-header__meta");
  const open = tag[0];
  assert.match(open, /aria-disabled="true"/, "lang-switch powinien być aria-disabled (inertny do I18N-3)");
  assert.match(open, /aria-label=/, "lang-switch bez aria-label (opisany dla SR)");
  assert.ok(!open.replace(/aria-disabled="true"/, "").includes(" disabled"),
    "lang-switch NIE może mieć atrybutu disabled — musi zostać w kolejności tab (fokusowalny)");
  // Flaga PL inline (SVG, bez CDN) + tekstowy nośnik „PL".
  assert.match(appHtml, /lang-switch__flag/, "brak inline flagi PL");
  assert.match(appHtml, /lang-switch__label">PL</, "brak tekstu PL przy fladze");
});
