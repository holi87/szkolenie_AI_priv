// a11y-static.test.mjs — statyczne kontrole dostępności i responsywności (issue #25) bez przeglądarki.
// Sprawdza fakty w index.html i styles.css, które są warunkiem WCAG/responsywności (desktop/tablet/mobile):
// lang, viewport, <title>, skip-link, progressbar ARIA, focus-visible, reguła reflow (media query), klasa sr-only.
// Pure Node — czyta pliki z dysku. Uzupełnia render-smoke (drzewo runtime) o kontrolę statycznego shella i CSS.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = join(HERE, "..", ".."); // genai-llm-training/
const read = (p) => readFileSync(join(APP, p), "utf8");

const appHtml = read("index.html");
const css = read("assets/styles.css");
const tokensCss = read("assets/tokens.css");

test("index.html: lang, viewport, <title>, opis — podstawy dostępności i SEO/no-index", () => {
  assert.match(appHtml, /<html[^>]*\blang="pl"/, "brak lang=pl na <html>");
  assert.match(appHtml, /<meta[^>]*name="viewport"[^>]*width=device-width/, "brak meta viewport (responsywność)");
  assert.match(appHtml, /<title>[^<]+<\/title>/, "brak <title>");
});

test("index.html: skip-link jako pierwszy fokusowalny element (WCAG 2.4.1)", () => {
  assert.match(appHtml, /class="skip-link"[^>]*href="#view"/, "brak skip-linku do #view");
  // skip-link musi pojawić się przed <header> w źródle (kolejność tab).
  const skipIdx = appHtml.indexOf("skip-link");
  const headerIdx = appHtml.indexOf("<header");
  assert.ok(skipIdx > -1 && skipIdx < headerIdx, "skip-link nie jest przed <header>");
});

test("index.html: pasek postępu ma pełne ARIA (progressbar + valuemin/max/now)", () => {
  assert.match(appHtml, /role="progressbar"/, "brak role=progressbar");
  for (const a of ["aria-valuemin", "aria-valuemax", "aria-valuenow"]) {
    assert.match(appHtml, new RegExp(a), `brak ${a} na pasku postępu`);
  }
  assert.match(appHtml, /id="view"[^>]*tabindex="-1"/, "główny obszar #view bez tabindex=-1 (cel skip-linku)");
});

test("styles.css: focus-visible jest zdefiniowany (widoczny focus — WCAG 2.4.7)", () => {
  assert.match(css, /:focus-visible\s*\{[^}]*outline/, "brak widocznego outline dla :focus-visible");
  assert.match(css, /\.skip-link:focus/, "skip-link nie ujawnia się na focus");
});

test("styles.css: reflow — media query dla wąskich ekranów + min-width:0 (320 px nie rozpycha layoutu)", () => {
  assert.match(css, /@media\s*\([^)]*max-width:\s*720px\)/, "brak media query reflow (tablet/mobile)");
  assert.match(css, /\.layout\s*\{\s*grid-template-columns:\s*1fr/, "layout nie przechodzi na 1 kolumnę na wąskim ekranie");
  // Krytyczne fixy reflow 320 px (grid/flex blowout): fieldset/legend/option min-width:0 / max-width.
  assert.match(css, /fieldset\s*\{\s*min-width:\s*0/, "fieldset bez min-width:0 (blokuje reflow 320 px)");
  assert.match(css, /legend\s*\{\s*max-width:\s*100%/, "legend bez max-width:100% (długi prompt rozpycha)");
  assert.match(css, /select\s*\{\s*max-width:\s*100%/, "select bez max-width:100% (długie opcje rozpychają)");
});

test("styles.css: klasa visually-hidden (tekst tylko dla czytników) i reduced-motion", () => {
  assert.match(css, /\.visually-hidden\s*\{/, "brak klasy visually-hidden (tekst dla czytników ekranu)");
  assert.match(css, /clip:\s*rect\(/, "visually-hidden bez clip rect (technika ukrycia wizualnego)");
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, "brak obsługi prefers-reduced-motion");
});

// ----- Design system M9 (#68): tokeny w tokens.css, @import, utwardzony reduced-motion -----
test("styles.css: @import \"tokens.css\" jest PIERWSZĄ regułą (ścieżka względna, bez http/CDN)", () => {
  const cssNoComments = css.replace(/\/\*[\s\S]*?\*\//g, "").trim();
  assert.match(cssNoComments, /^@import\s+["']tokens\.css["']\s*;/, "pierwszą regułą styles.css musi być @import \"tokens.css\";");
  assert.doesNotMatch(cssNoComments.slice(0, 80), /https?:|\/\//, "@import nie może wskazywać na http/CDN (ADR-0002, ścieżka względna)");
});

test("reduced-motion utwardzony: blok gasi ZARÓWNO transition JAK I animation (keyframe-safe, #68)", () => {
  const idx = css.indexOf("prefers-reduced-motion");
  assert.ok(idx > -1, "brak bloku prefers-reduced-motion");
  const block = css.slice(idx, idx + 400);
  assert.match(block, /transition:\s*none/, "reduced-motion bez transition:none");
  assert.match(block, /animation:\s*none/, "reduced-motion bez animation:none (utwardzenie pod keyframe UX-4/UX-5)");
});

test("tokens.css: istnieje, definiuje :root z drugim akcentem i gradientem (fundament design systemu #68)", () => {
  assert.match(tokensCss, /:root\s*\{/, "tokens.css bez bloku :root");
  assert.match(tokensCss, /--color-accent-2\s*:/, "brak tokenu --color-accent-2");
  assert.match(tokensCss, /--grad-accent\s*:/, "brak tokenu --grad-accent");
  // Zgodność wstecz: aliasy MVP NIE mogą zniknąć (reguły komponentowe nadal ich używają).
  for (const t of ["--color-bg", "--color-fg", "--color-accent", "--maxw-content", "--radius", "--gap", "--focus", "--fs-base", "--lh"]) {
    assert.match(tokensCss, new RegExp(`${t}\\s*:`), `tokens.css zgubił alias zgodności ${t}`);
  }
});
