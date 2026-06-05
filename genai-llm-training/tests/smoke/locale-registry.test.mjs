// locale-registry.test.mjs — sprzężenie rejestru locale (i18n.js) z danymi na dysku (#133, follow-up M17).
// Po M17 LOCALES i PRIVACY_PAGES są hardcodowane w i18n.js, a walidator danych derywuje zbiór locale z filesystemu
// osobno (validate.mjs discoverLocales) — nic ich nie krzyżowało. Ten test wiąże oba światy: żaden kolejny język
// nie może po cichu rozjechać rejestru runtime, danych szkolenia i stron prywatności. Pure Node (fs) — ADR-0002.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { LOCALES, PRIVACY_PAGES, localeHasData } from "../../assets/i18n/i18n.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = join(HERE, "..", ".."); // genai-llm-training/
const DATA = join(APP, "data");

// Locale „z danymi" = podkatalog data/<lang>/ zawierający questions/ (ta sama definicja co validate.mjs discoverLocales).
const dataLocales = readdirSync(DATA, { withFileTypes: true })
  .filter((e) => e.isDirectory() && existsSync(join(DATA, e.name, "questions")))
  .map((e) => e.name).sort();

test("każde locale z danymi (data/<lang>/questions) jest w LOCALES z hasData:true", () => {
  assert.ok(dataLocales.length >= 2, `oczekiwano >=2 locale z danymi (PL + min. 1), jest: ${dataLocales.join(",")}`);
  for (const code of dataLocales) {
    assert.ok(LOCALES.some((l) => l.code === code), `data/${code}/ istnieje, ale brak wpisu w LOCALES (i18n.js)`);
    assert.equal(localeHasData(code), true, `LOCALES["${code}"].hasData musi być true (istnieją dane data/${code}/)`);
  }
});

test("każdy wpis LOCALES z hasData:true ma katalog data/<lang>/questions na dysku", () => {
  for (const l of LOCALES.filter((x) => x.hasData)) {
    assert.ok(existsSync(join(DATA, l.code, "questions")), `LOCALES["${l.code}"].hasData=true, ale brak data/${l.code}/questions/`);
  }
});

test("każdy wpis LOCALES ma klucz PRIVACY_PAGES wskazujący na istniejący plik strony prywatności", () => {
  for (const l of LOCALES) {
    const file = PRIVACY_PAGES[l.code];
    assert.ok(file, `brak PRIVACY_PAGES["${l.code}"] — privacyHref() zwróciłby fallback dla tego locale`);
    assert.ok(existsSync(join(APP, file)), `PRIVACY_PAGES["${l.code}"] = "${file}", ale plik nie istnieje na dysku`);
  }
});

test("a11y i18n: setLanguage ustawia <html lang> na aktywny locale (regression-guard #133, WCAG 3.1.2)", () => {
  // Strażnik źródła (wzorzec a11y-static.test.mjs dla index.html): broni przed cichym usunięciem ustawiania
  // document.documentElement.lang przy zmianie języka — inaczej czytnik ekranu zapowiada treść w złym języku.
  const appJs = readFileSync(join(APP, "assets", "app.js"), "utf8");
  assert.match(
    appJs,
    /document\.documentElement[\s\S]{0,80}setAttribute\(\s*["']lang["']\s*,\s*code\s*\)/,
    "app.js: setLanguage musi ustawiać document.documentElement.setAttribute(\"lang\", code)",
  );
});
