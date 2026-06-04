// i18n.test.mjs — kontrakt helpera t() + czystość core (zero-i18n) (issue #77, I18N-2).
// Pure Node + DOM-stub (ADR-0002). Katalogi wstrzykiwane przez registerCatalog (bez fetch).
import "./_dom-stub.mjs"; // ustawia globalThis.document dla renderFeedback
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { t, registerCatalog, setLocale, hasKey, resolveLang, persistLang, LANG_KEY, LOCALES, isSupportedLocale, localeHasData } from "../../assets/i18n/i18n.js";
import { scoreQuestion } from "../../assets/core/quiz-engine.js";
import { renderFeedback } from "../../assets/ui/quiz-view.js";
import { certReasonText } from "../../assets/ui/certificate-view.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = join(HERE, "..", "..");
const readJson = (p) => JSON.parse(readFileSync(join(APP, p), "utf8"));

// --- Kontrakt t(): fallback aktywny -> pl -> klucz; NIGDY pusty; interpolacja bez eval ---

test("t() zwraca wartość aktywnego locale, gdy istnieje", () => {
  registerCatalog("pl", { "x.greeting": "Cześć", "x.only": "tylko-pl" });
  registerCatalog("en", { "x.greeting": "Hi", "x.only": "" });
  setLocale("en");
  assert.equal(t("x.greeting"), "Hi");
});

test("t() FALLBACKuje do PL przy braku klucza ORAZ przy PUSTEJ wartości w aktywnym locale", () => {
  registerCatalog("pl", { "x.only": "tylko-pl", "x.empty": "wartość-pl" });
  registerCatalog("en", { "x.empty": "" }); // szkielet: klucz jest, wartość pusta
  setLocale("en");
  assert.equal(t("x.only"), "tylko-pl", "brak klucza w EN -> PL");
  assert.equal(t("x.empty"), "wartość-pl", "pusta wartość w EN -> PL (nie '')");
});

test("t() przy całkowitym braku klucza zwraca SAM KLUCZ (niepusty), nigdy ''", () => {
  registerCatalog("pl", { "x.a": "A" });
  registerCatalog("en", {});
  setLocale("en");
  const r = t("zupelnie.nieistniejacy.klucz");
  assert.equal(r, "zupelnie.nieistniejacy.klucz");
  assert.notEqual(r, "");
});

test("t() interpoluje {param} bez eval; nieznane placeholdery zostają; params=undefined nie wywraca", () => {
  registerCatalog("pl", { "x.i": "masz {pct}% i {count} szt." });
  setLocale("pl");
  assert.equal(t("x.i", { pct: 80, count: 3 }), "masz 80% i 3 szt.");
  assert.equal(t("x.i", { pct: 80 }), "masz 80% i {count} szt.", "brakujący param -> placeholder zostaje");
  assert.doesNotThrow(() => t("x.i")); // params undefined
  // brak wykonywania wyrażeń: payload nie jest interpretowany
  registerCatalog("pl", { "x.safe": "{__proto__}" });
  assert.equal(t("x.safe", {}), "{__proto__}");
});

test("hasKey rozróżnia istnienie wartości od pustki", () => {
  registerCatalog("pl", { "x.full": "v", "x.empty": "" });
  assert.equal(hasKey("pl", "x.full"), true);
  assert.equal(hasKey("pl", "x.empty"), false);
  assert.equal(hasKey("pl", "x.nope"), false);
});

// --- Realne katalogi: kompletność i parzystość zbioru kluczy (sanity, twarda walidacja w #80) ---

test("realne pl.json/en.json mają identyczny zbiór kluczy (parytet katalogów)", () => {
  const pl = readJson("assets/i18n/pl.json");
  const en = readJson("assets/i18n/en.json");
  assert.deepEqual(Object.keys(pl).sort(), Object.keys(en).sort());
});

// --- Czystość core (zero-i18n): teksty user-facing przez kody, nie prozę w core ---

test("core nie importuje i18n i nie zawiera dawnej prozy user-facing", () => {
  const qe = readFileSync(join(APP, "assets/core/quiz-engine.js"), "utf8");
  const ce = readFileSync(join(APP, "assets/core/certificate.js"), "utf8");
  const pa = readFileSync(join(APP, "assets/core/paths.js"), "utf8");
  for (const [name, src] of [["quiz-engine", qe], ["certificate", ce], ["paths", pa]]) {
    assert.ok(!/i18n\.js/.test(src), `${name} nie może importować i18n (core zero-i18n)`);
  }
  assert.ok(!/CRITICAL_FAIL_MESSAGE/.test(qe), "quiz-engine nie eksportuje prozy krytycznej");
  assert.ok(/below_pass_threshold/.test(ce), "certificate zwraca KOD powodu, nie prozę");
  assert.ok(!/Wynik poniżej progu zaliczenia/.test(ce), "certificate nie zawiera prozy reason");
  assert.ok(!/ukończ moduły wymagane:/.test(pa), "paths nie składa prozy lockedReason");
});

test("renderFeedback dla isCriticalFail produkuje NIEPUSTY komunikat z katalogu (kod -> t())", () => {
  const pl = readJson("assets/i18n/pl.json");
  registerCatalog("pl", pl);
  setLocale("pl");
  // sztuczne pytanie krytyczne, zła odpowiedź -> isCriticalFail
  const q = { id: "QX", type: "single_choice", points: 1, isCritical: true, correct: ["a"], feedbackIncorrect: "" };
  const res = scoreQuestion(q, "b");
  assert.equal(res.isCriticalFail, true);
  const txt = renderFeedback(res).textContent; // agreguje text-prop + dzieci tekstowe (_dom-stub)
  assert.ok(txt.includes(pl["feedback.criticalFail.body"]), "brak treści krytycznej z katalogu");
  assert.ok(txt.includes(pl["feedback.criticalFail.head"]), "brak nagłówka krytycznego z katalogu");
});

test("certificate-view rozwiązuje KOD reason z core przez t() (niepusty)", () => {
  const pl = readJson("assets/i18n/pl.json");
  registerCatalog("pl", pl);
  setLocale("pl");
  assert.equal(certReasonText("below_pass_threshold"), pl["cert.reason.below_pass_threshold"]);
  assert.notEqual(certReasonText("below_pass_threshold"), "");
  assert.equal(certReasonText("nieznany_kod"), ""); // nieznany kod -> pusty (brak prozy w core)
});

test("render PL bez regresji: feedback niesie 'Poprawnie'/'Niepoprawnie' i NIE wycieka surowy klucz", () => {
  const pl = readJson("assets/i18n/pl.json");
  registerCatalog("pl", pl);
  setLocale("pl");
  const q = { id: "QY", type: "single_choice", points: 1, correct: ["a"], feedbackCorrect: "", feedbackIncorrect: "" };
  const okTxt = renderFeedback(scoreQuestion(q, "a")).textContent;
  const noTxt = renderFeedback(scoreQuestion(q, "b")).textContent;
  assert.ok(okTxt.includes("Poprawnie"), "feedback poprawny niesie PL 'Poprawnie'");
  assert.ok(noTxt.includes("Niepoprawnie"), "feedback błędny niesie PL 'Niepoprawnie'");
  // typo w kluczu -> t() oddaje sam klucz; pilnujemy, że klucz NIE pojawia się jako widoczny tekst
  for (const txt of [okTxt, noTxt]) assert.ok(!/feedback\.\w+/.test(txt), `wyciek surowego klucza: ${txt}`);
});

// --- Wybór locale: resolveLang / persistLang (#79, wstrzykiwalne storage+search) ---

const fakeStorage = (init = {}) => ({ _v: { ...init }, getItem(k) { return k in this._v ? this._v[k] : null; }, setItem(k, v) { this._v[k] = String(v); } });
const throwingStorage = { getItem() { throw new Error("prywatny"); }, setItem() { throw new Error("prywatny"); } };

test("resolveLang: brak pref + brak ?lang= => 'pl'", () => {
  assert.equal(resolveLang({ search: "", storage: fakeStorage() }), "pl");
});

test("resolveLang: ?lang=en => 'en' (boot-override)", () => {
  assert.equal(resolveLang({ search: "?lang=en", storage: fakeStorage() }), "en");
});

test("resolveLang: zapis 'en', brak ?lang= => 'en'", () => {
  assert.equal(resolveLang({ search: "", storage: fakeStorage({ [LANG_KEY]: "en" }) }), "en");
});

test("resolveLang: ?lang= MA PRIORYTET nad zapisem", () => {
  assert.equal(resolveLang({ search: "?lang=pl", storage: fakeStorage({ [LANG_KEY]: "en" }) }), "pl");
});

test("resolveLang: ?lang= spoza listy locale => ignorowane, fallback do zapisu/PL (walidacja wejścia)", () => {
  assert.equal(resolveLang({ search: "?lang=zz", storage: fakeStorage({ [LANG_KEY]: "en" }) }), "en");
  assert.equal(resolveLang({ search: "?lang=../etc", storage: fakeStorage() }), "pl");
});

test("resolveLang: storage rzucający (tryb prywatny) => brak crasha, fallback 'pl'", () => {
  let r;
  assert.doesNotThrow(() => { r = resolveLang({ search: "", storage: throwingStorage }); });
  assert.equal(r, "pl");
});

test("persistLang zapisuje wspierany locale pod LANG_KEY; resolveLang go odczytuje; niewspierany ignorowany", () => {
  const s = fakeStorage();
  persistLang("en", { storage: s });
  assert.equal(s.getItem(LANG_KEY), "en");
  assert.equal(resolveLang({ search: "", storage: s }), "en");
  persistLang("zz", { storage: s }); // niewspierany — bez zapisu
  assert.equal(s.getItem(LANG_KEY), "en");
});

test("konfiguracja locale deklaratywna: pl i en mają komplet danych (hasData=true) — M11", () => {
  assert.ok(LOCALES.some((l) => l.code === "pl") && LOCALES.some((l) => l.code === "en"));
  assert.equal(localeHasData("pl"), true);
  assert.equal(localeHasData("en"), true, "EN ma własne dane data/en/ (#82/#83) → UI i dane po EN");
  assert.equal(isSupportedLocale("zz"), false);
});

test("aktywny EN (realny katalog) renderuje treść po ANGIELSKU — pipeline end-to-end (#81)", () => {
  registerCatalog("pl", readJson("assets/i18n/pl.json"));
  registerCatalog("en", readJson("assets/i18n/en.json")); // M11: pełne tłumaczenie EN
  setLocale("en");
  const q = { id: "QZ", type: "single_choice", points: 1, correct: ["a"], feedbackCorrect: "", feedbackIncorrect: "" };
  const okTxt = renderFeedback(scoreQuestion(q, "a")).textContent;
  assert.ok(okTxt.includes("Correct"), "aktywny EN -> render po angielsku");
  assert.ok(!okTxt.includes("Poprawnie"), "brak polskiej prozy gdy EN kompletny");
  assert.ok(!/feedback\.\w+/.test(okTxt), "brak wycieku surowego klucza przy aktywnym EN");
});

test("fallback t(): locale z BRAKUJĄCĄ wartością → PL; render bez wycieku klucza (mechanizm niezależny od kompletności EN)", () => {
  registerCatalog("pl", readJson("assets/i18n/pl.json"));
  registerCatalog("en", {}); // celowo niekompletny katalog (synthetic) — wymusza fallback do PL
  setLocale("en");
  const q = { id: "QZ", type: "single_choice", points: 1, correct: ["a"], feedbackCorrect: "", feedbackIncorrect: "" };
  const okTxt = renderFeedback(scoreQuestion(q, "a")).textContent;
  assert.ok(okTxt.includes("Poprawnie"), "brak klucza w aktywnym locale → fallback PL widoczny");
  assert.ok(!/feedback\.\w+/.test(okTxt), "brak wycieku surowego klucza przy fallbacku");
  setLocale("pl"); // przywróć kanon dla ewentualnych kolejnych testów
});
