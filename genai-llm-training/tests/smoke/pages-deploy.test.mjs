// pages-deploy.test.mjs — INWARIANTY WDROŻENIA GitHub Pages (issue #33).
// Chroni przed regresją kontrakt hostingu: strona główna domeny przekierowuje do aplikacji
// ścieżką WZGLĘDNĄ (bez wiodącego „/”), aplety aplikacji są względne, a pliki konfiguracji Pages
// (CNAME, .nojekyll) istnieją. Kryterium #33: „Wszystkie ścieżki względne, brak absolutnych korzeni /”.
// Pure Node (fs), zero zależności — ADR-0002.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = join(HERE, "..", "..");        // genai-llm-training/
const ROOT = join(APP, "..");              // repozytorium (korzeń Pages)
const read = (p) => readFileSync(p, "utf8");

const rootHtml = read(join(ROOT, "index.html"));
const appHtml = read(join(APP, "index.html"));

test("root index.html przekierowuje do aplikacji ścieżką WZGLĘDNĄ genai-llm-training/", () => {
  // meta-refresh ALBO redirect JS musi celować w genai-llm-training/.
  const meta = /http-equiv=["']refresh["'][^>]*url=([^"'>\s]+)/i.exec(rootHtml);
  const js = /location\.(?:replace|assign|href\s*=)\(?["']([^"')]+)["']/i.exec(rootHtml);
  const target = (meta && meta[1]) || (js && js[1]);
  assert.ok(target, "brak przekierowania (meta-refresh ani JS) w root index.html");
  assert.match(target, /^genai-llm-training\/?$/, `cel przekierowania musi być względny „genai-llm-training/”, a jest: ${target}`);
});

test("root index.html: zapasowy link bez JS prowadzi do aplikacji (względnie)", () => {
  // Dostępność / brak JS: musi istnieć klikalny <a href="genai-llm-training/">.
  assert.match(rootHtml, /<a[^>]+href=["']genai-llm-training\/?["']/i, "brak zapasowego linku <a href=\"genai-llm-training/\">");
});

test("root index.html: BRAK absolutnych korzeni „/” w przekierowaniu i zasobach (#33)", () => {
  // Żaden href/src/url przekierowania nie może zaczynać się od „/” (złamałoby hosting z podścieżki).
  assert.doesNotMatch(rootHtml, /url=\/genai-llm-training/i, "meta-refresh używa absolutnej ścieżki /genai-llm-training");
  assert.doesNotMatch(rootHtml, /location\.(?:replace|assign|href\s*=)\(?["']\/genai-llm-training/i, "redirect JS używa absolutnej ścieżki /genai-llm-training");
  assert.doesNotMatch(rootHtml, /<a[^>]+href=["']\/genai-llm-training/i, "link zapasowy używa absolutnej ścieżki /genai-llm-training");
});

test("app index.html: aplety (CSS/JS) ładowane WZGLĘDNIE, bez korzenia „/” (#33)", () => {
  assert.match(appHtml, /href=["']assets\/styles\.css["']/, "styles.css musi być ładowany względnie (assets/…)");
  assert.match(appHtml, /src=["']assets\/app\.js["']/, "app.js musi być ładowany względnie (assets/…)");
  // Brak absolutnych korzeni w href/src.
  assert.doesNotMatch(appHtml, /(?:href|src)=["']\/[^/]/, "app index.html zawiera absolutną ścieżkę z korzeniem /");
});

test("strona Prywatność (#62): istnieje, noindex, względne zasoby, brak zewnętrznych hostów, link powrotny", () => {
  const priv = read(join(APP, "prywatnosc.html"));
  assert.match(priv, /<html[^>]*\blang="pl"/, "prywatnosc.html bez lang=pl");
  assert.match(priv, /name="robots"[^>]*noindex/, "prywatnosc.html bez noindex");
  assert.match(priv, /href=["']assets\/styles\.css["']/, "styl ładowany względnie");
  assert.match(priv, /href=["']index\.html["']/, "brak linku powrotnego do aplikacji");
  assert.doesNotMatch(priv, /(?:href|src)=["']\/[^/]/, "prywatnosc.html zawiera absolutną ścieżkę z korzeniem /");
  assert.doesNotMatch(priv, /https?:\/\/(?!www\.w3\.org)/i, "prywatnosc.html nie może ładować zasobów z zewnętrznych hostów");
  // Aplikacja i strona główna linkują do Prywatności (transparentność dostępna z UI).
  assert.match(appHtml, /href=["']prywatnosc\.html["']/, "stopka aplikacji bez linku do Prywatności");
});

test("konfiguracja GitHub Pages: CNAME (domena) i .nojekyll obecne w korzeniu", () => {
  const cnamePath = join(ROOT, "CNAME");
  assert.ok(existsSync(cnamePath), "brak pliku CNAME w korzeniu repo");
  const cname = read(cnamePath).trim();
  assert.ok(cname.length > 0 && /\./.test(cname), `CNAME musi zawierać domenę (jest: „${cname}”)`);
  assert.ok(existsSync(join(ROOT, ".nojekyll")), "brak .nojekyll w korzeniu (Jekyll mógłby pominąć pliki/foldery)");
});
