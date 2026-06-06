// reskin-primitives.test.mjs — DOM-regresja haków reskinu (issue #138, STAGE A, M18).
// Blokuje usunięcie/zmianę kluczowych haków DOM wdrożonych w STAGE A:
//   path-card__sigil, result__score-inner, brand__sub, brand__logo (istniejące)
//   eyebrow, hero__row, hero__stat (nowe prymitywy #139)
// Wzorzec: identyczny jak path-select-ux.test.mjs i module-hub.test.mjs — pure Node,
// zero zależności runtime, DOM-stub, node:test. ADR-0002.
import "./_dom-stub.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { serializeTree, countByTag } from "./_snapshot.mjs";
import { queryAll } from "./_dom-stub.mjs";
import { pathsData, modulesData } from "./_fixtures.mjs";
import { renderPathSelect } from "../../assets/ui/path-select.js";
import { renderResult } from "../../assets/ui/certificate-view.js";
import { buildResult } from "../../assets/core/certificate.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = join(HERE, "..", "..");
const appHtml = readFileSync(join(APP, "index.html"), "utf8");
const stylesCss = readFileSync(join(APP, "assets", "styles.css"), "utf8");
const primitivesCss = readFileSync(join(APP, "assets", "styles", "primitives.css"), "utf8");

// --- Haki path-select ---

const pathSelectNode = renderPathSelect(pathsData, modulesData, { onSelect: () => {} });
const pathSelectSnap = serializeTree(pathSelectNode);

test("#138 path-select: eyebrow obecne w hero (prymityw #139)", () => {
  assert.match(pathSelectSnap, /class="[^"]*eyebrow[^"]*"/, "brak .eyebrow w hero (STAGE A prymityw)");
});

test("#138 path-select: hero__row (stats-strip) obecne w hero (prymityw #139)", () => {
  assert.match(pathSelectSnap, /class="[^"]*hero__row[^"]*"/, "brak .hero__row (stats-strip) w hero");
});

test("#138 path-select: hero__stat elementy obecne w stats-strip (prymityw #139)", () => {
  assert.match(pathSelectSnap, /class="[^"]*hero__stat[^"]*"/, "brak .hero__stat w hero__row");
  // Oczekujemy dokładnie 3 statystyki (moduły / ścieżki / czas).
  const stats = pathSelectSnap.match(/class="[^"]*hero__stat[^"]*"/g) || [];
  assert.ok(stats.length >= 3, `oczekiwano >=3 elementów .hero__stat, znaleziono ${stats.length}`);
});

test("#138 path-select: stats-strip zawiera liczby liczbowe (dane derywowane, nie hardkodowane stringi)", () => {
  const txt = pathSelectNode.textContent || "";
  // Muszą być co najmniej dwie liczby (moduły i ścieżki) — liczba zależy od danych
  assert.match(txt, /\d+/, "stats-strip musi zawierać przynajmniej jedną liczbę");
});

test("#138 path-select: path-card__sigil obecne na kartach ścieżek (istniejący hak)", () => {
  assert.match(pathSelectSnap, /class="[^"]*path-card__sigil[^"]*"/, "brak .path-card__sigil na kartach ścieżek");
  // Dokładnie 4 sigile — jeden na kartę (S1/S2/S3/S4)
  const sigils = pathSelectSnap.match(/class="[^"]*path-card__sigil[^"]*"/g) || [];
  assert.equal(sigils.length, 4, `oczekiwano 4 sigili (S1-S4), znaleziono ${sigils.length}`);
});

test("#138 path-select: eyebrow ma akcent kolorowy przez klasę CSS (nie hardkodowany kolor)", () => {
  // .eyebrow kolor pochodzi z tokens.css przez CSS class — nie inline style
  const eyebrowNodes = queryAll(pathSelectNode, (n) => n.className && n.className.split(" ").includes("eyebrow"));
  assert.ok(eyebrowNodes.length >= 1, "brak węzłów .eyebrow");
  for (const n of eyebrowNodes) {
    assert.ok(!n.style || !n.style.color, ".eyebrow nie może mieć inline color (kolor = token CSS)");
  }
});

// --- Hak result__score-inner (ekran wyniku) ---

test("#138 certificate-view: result__score-inner obecne (hak pierścienia score)", () => {
  const passResult = buildResult(
    { pathId: "S2", scorePct: 88, passed: true, weakModules: [] },
    { pathName: "Tester / QA", modulesData },
  );
  const resultNode = renderResult(passResult, {
    progress: { path: "S2", finalTest: { passed: true, lastScorePct: 88 }, practicalTasks: [] },
    pathName: "Tester / QA", gates: [], onBack: () => {},
  });
  assert.ok(resultNode, "renderResult zwrócił null/undefined");
  const snap = serializeTree(resultNode);
  assert.match(snap, /class="[^"]*result__score-inner[^"]*"/, "brak .result__score-inner (hak pierścienia score)");
});

// --- Haki chrome (index.html) — brand__logo + brand__sub ---

test("#138 index.html: brand__logo obecne w chrome (hak logo-slot)", () => {
  assert.match(appHtml, /class="brand__logo"/, "brak .brand__logo w index.html (hak logo-slot)");
});

test("#138 index.html: brand__sub obecne w chrome (hak sub-label marki)", () => {
  assert.match(appHtml, /class="brand__sub"/, "brak .brand__sub w index.html (hak sub-label marki)");
  // brand__sub zawiera tekst „QualityCat" (marka)
  assert.match(appHtml, /brand__sub[^>]*>QualityCat</, "brand__sub musi zawierać 'QualityCat'");
});

// --- CSS: primitives.css definiuje haki prymitywów ---

test("#138 primitives.css: .eyebrow zdefiniowany (CSS prymityw #139)", () => {
  assert.match(primitivesCss, /\.eyebrow\s*\{/, "brak definicji .eyebrow w primitives.css");
  assert.match(primitivesCss, /text-transform:\s*uppercase/, ".eyebrow musi mieć text-transform:uppercase");
  assert.match(primitivesCss, /color:\s*var\(--color-accent\)/, ".eyebrow kolor pochodzi z tokenu --color-accent");
});

test("#138 primitives.css: .hero__row zdefiniowany (stats-strip #139)", () => {
  assert.match(primitivesCss, /\.hero__row\s*\{/, "brak definicji .hero__row w primitives.css");
});

test("#138 primitives.css: .hero__stat zdefiniowany (stats-strip #139)", () => {
  assert.match(primitivesCss, /\.hero__stat\s*\{/, "brak definicji .hero__stat w primitives.css");
});

test("#138 styles.css: importuje primitives.css po tokens.css (łańcuch importów STAGE A)", () => {
  // @import "tokens.css" musi być pierwsze (asercja a11y-static), potem primitives.css.
  const tokensIdx = stylesCss.indexOf('@import "tokens.css"');
  const primitivesIdx = stylesCss.indexOf('@import "styles/primitives.css"');
  assert.ok(tokensIdx > -1, 'styles.css nie importuje tokens.css');
  assert.ok(primitivesIdx > -1, 'styles.css nie importuje styles/primitives.css (STAGE A split)');
  assert.ok(tokensIdx < primitivesIdx, 'tokens.css musi być importowany przed styles/primitives.css');
});

test("#138 tokens.css: --color-border-strong alias istnieje (zgodność z makietami)", () => {
  const tokensCss = readFileSync(join(APP, "assets", "tokens.css"), "utf8");
  assert.match(tokensCss, /--color-border-strong\s*:/, "brak aliasu --color-border-strong w tokens.css");
});

test("#138 styles.css: hero__accent flat-by-default — brak @supports background-clip:text na .hero__accent (M18 DESIGN-PROPOSAL p.3)", () => {
  // DESIGN-PROPOSAL punkt 3: "demotujemy gradient... domyślnie używamy solidnego akcentu w hero".
  // .hero__accent musi mieć tylko solid color — gradient wyłącznie jako klasa dekoracyjna .hero__accent--grad.
  // Ten test blokuje przypadkowy powrót do gradient-as-default (regresja STAGE B).
  assert.match(stylesCss, /\.hero__accent\s*\{\s*color:\s*var\(--color-accent\)/, ".hero__accent musi używać solidnego color:var(--color-accent)");
  // Brak unconditional @supports background-clip:text na .hero__accent bez klasy modyfikatora
  // (gradient jest OK na .hero__accent--grad, ale NIE na base .hero__accent).
  // Sprawdzamy, że @supports block nie ustawia -webkit-text-fill-color na base .hero__accent.
  const supportsGradBlock = stylesCss.match(/@supports[^{]*background-clip[^}]*\{[^}]*\.hero__accent\b[^}]*\}/g) || [];
  assert.equal(supportsGradBlock.length, 0, "styles.css: gradient @supports nie może być na base .hero__accent (tylko .hero__accent--grad) — M18 flat-accent");
});
