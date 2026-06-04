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

const node = renderPathSelect(pathsData, modulesData, { onSelect: () => {} });
const snap = serializeTree(node);
const txt = node.textContent || "";              // serializeTree zrzuca tagi+klasy, NIE tekst → tekst sprawdzaj na textContent
const occ = (re) => (snap.match(re) || []).length;
const occTxt = (re) => (txt.match(re) || []).length;

test("hero: sekcja + tytuł z akcentem + lead (pierwsze wrażenie)", () => {
  assert.match(snap, /class="hero"/, "brak sekcji .hero");
  assert.match(snap, /hero__accent/, "brak słowa-akcentu w hero (gradient + fallback solid)");
  assert.match(snap, /hero__lead/, "brak podtytułu hero");
});

test("4 karty ścieżek (S1-S3 + formatywna S4); dokładnie JEDNA rekomendowana z plakietką", () => {
  assert.equal(countByTag(node).ARTICLE, 4, "powinny być 4 karty ścieżek (M15: +S4 formatywna)");
  assert.equal(occ(/path-card--recommended/g), 1, "dokładnie jedna karta rekomendowana (S2)");
  assert.equal(occ(/path-card__badge/g), 1, "dokładnie jedna plakietka rekomendacji");
});

test("karta S4 FORMATYWNA (M15): inny meta bez progu testu, widoczna jako formatywna", () => {
  assert.match(snap, /path-card--formative/, "brak karty formatywnej S4");
  // Tylko 3 ścieżki z testem (S1/S2/S3) pokazują próg; karta S4 formatywna nie ma progu (pole nie istnieje).
  assert.equal(occTxt(/Próg:/g), 3, "próg tylko na kartach S1-S3; S4 formatywna bez progu");
  assert.match(txt, /diagnoza \+ rozwój|autodiagnoza/, "karta S4 opisana jako diagnoza + rozwój");
});

test("karty zachowują CTA + szczegóły modułów (treść nie zniknęła po restylizacji)", () => {
  assert.equal(occ(/path-card__cta/g), 4, "każda karta ma przycisk wyboru (4 ścieżki)");
  assert.match(snap, /path-card__details/, "karta bez szczegółów modułów");
  // M12-2 (#93): pole pseudonimu USUNIĘTE (certyfikat zniesiony) — asercja ODWRÓCONA: input nie może istnieć.
  assert.doesNotMatch(snap, /id="participant-name"/, "pole pseudonimu powinno zniknąć (#93)");
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
