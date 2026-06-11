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

test("#171: 3 karty w siatce (P1, P2, grupa AI z QA) + pasek bonusu (S4); JEDNA rekomendowana", () => {
  // 4 ARTICLE łącznie: 3 karty siatki + 1 bonus-card pod siatką (Skala Holaka poza pickerem).
  assert.equal(countByTag(node).ARTICLE, 4, "3 karty + pasek bonusu = 4 article");
  assert.equal(occ(/path-card--recommended/g), 1, "dokładnie jedna karta rekomendowana (grupa AI z QA)");
  assert.equal(occ(/path-card__badge/g), 1, "dokładnie jedna plakietka rekomendacji");
  assert.equal(occ(/bonus-card"/g), 1, "dokładnie jeden pasek bonusu (S4 Skala Holaka)");
});

test("#171: karta grupy AI z QA — selektor 3 poziomów (aria-pressed), domyślnie Praktyk", () => {
  assert.match(snap, /path-card--group/, "brak karty grupy poziomów");
  assert.match(snap, /level-switch/, "brak selektora poziomu");
  assert.equal(occ(/level-switch__btn/g), 3, "selektor powinien mieć 3 poziomy (S1/S2/S3)");
  // aria-pressed nie jest w domyślnym zestawie atrybutów serializeTree — osobny zrzut z tym atrybutem.
  const pressedSnap = serializeTree(node, { attrs: ["class", "aria-pressed"] });
  assert.equal((pressedSnap.match(/aria-pressed="true"/g) || []).length, 1, "dokładnie jeden poziom zaznaczony (rekomendowany S2)");
});

test("karta FORMATYWNA (P1) + bonus S4: bez progu testu; progi tylko na kartach z testem", () => {
  assert.match(snap, /path-card--formative/, "brak karty formatywnej (P1 AI w domu)");
  // Próg pokazują tylko karty z testem: P2 + karta grupy (meta wybranego poziomu) = 2 wystąpienia.
  assert.equal(occTxt(/Próg:/g), 2, "próg tylko na P2 i karcie grupy; formatywne/bonus bez progu");
  assert.match(txt, /diagnoza \+ rozwój|autodiagnoza/, "bonus S4 opisany jako diagnoza + rozwój");
});

test("karty zachowują CTA + szczegóły modułów (treść nie zniknęła po restylizacji)", () => {
  assert.equal(occ(/path-card__cta/g), 3, "każda karta siatki ma przycisk wyboru (P1, P2, grupa)");
  assert.equal(occ(/bonus-card__cta/g), 1, "pasek bonusu ma własne CTA");
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
