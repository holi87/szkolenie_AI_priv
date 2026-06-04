// hub-layout.test.mjs — strażnik fixów layoutu z #88 (regresja „treść raz w lewo, raz w prawo").
// Reguły są czysto-CSS/HTML, więc weryfikujemy je asercją na zawartości plików (jak adr-i18n.test) —
// to zabezpieczenie przed cichym usunięciem kolapsu kolumny i powrotem disclosure'owego nav-toggle.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = join(HERE, "..", "..");
const css = readFileSync(join(APP, "assets", "styles.css"), "utf8");
const html = readFileSync(join(APP, "index.html"), "utf8");

test("layout kolapsuje do jednej kolumny gdy szyna ukryta (koniec ściskania treści w wąski track)", () => {
  assert.match(css, /\.layout:has\(>\s*\.module-nav\[hidden\]\)\s*\{[^}]*grid-template-columns:\s*1fr/,
    "brak reguły kolapsu .layout:has(> .module-nav[hidden]) → grid-template-columns:1fr");
});

test("mobile: boczna szyna ukryta (nawigacja przez hub + przycisk Moduly)", () => {
  assert.match(css, /@media\s*\(max-width:\s*720px\)/, "brak breakpointu mobile 720px");
  assert.match(css, /\.module-nav\s*\{\s*display:\s*none/, "brak ukrycia .module-nav (display:none) na mobile");
});

test("nav-toggle Moduly to nawigacja do hubu, nie disclosure szyny (bez aria-controls/aria-expanded)", () => {
  const tag = /<button[^>]*id="nav-toggle"[^>]*>/.exec(html);
  assert.ok(tag, "brak przycisku #nav-toggle");
  assert.ok(!/aria-controls/.test(tag[0]), "nav-toggle nie jest już disclosure (usuń aria-controls)");
  assert.ok(!/aria-expanded/.test(tag[0]), "nav-toggle nie jest już disclosure (usuń aria-expanded)");
});
