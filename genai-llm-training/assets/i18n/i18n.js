// i18n.js — lekki helper tłumaczeń t() (issue #77, I18N-2). Zero zależności (ADR-0002, ADR-0004).
// Kontrakt:
//  - t(key, params?) -> string; interpolacja {param} BEZ eval.
//  - fallback KONSERWATYWNY: aktywny locale -> pl -> sam klucz; NIGDY pusty string.
//    Działa też na PUSTEJ wartości (szkielet en.json ma klucze z ""), nie tylko na braku klucza.
//  - katalogi rejestrowane przez registerCatalog (w przeglądarce: po fetch w bootstrapie app.js;
//    w testach: wstrzykiwane bezpośrednio). Brak ukrytego importu JSON (zero-build).
// Klucze są PŁASKIE i namespaced kropką, np. "nav.progress", "feedback.correct".

export const FALLBACK_LOCALE = "pl";
export const LANG_KEY = "genai-training:lang";

// Deklaratywna konfiguracja locale (#79). Dodanie języka = jeden wpis (+ pliki data/<lang>/ i <lang>.json).
// hasData: czy istnieje komplet danych w data/<lang>/ (jeśli nie — UI w tym locale, ale dane z PL; ADR-0004).
export const LOCALES = [
  { code: "pl", name: "Polski", hasData: true },
  { code: "en", name: "English", hasData: true }, // M11: pełne dane EN w data/en/ (#82/#83) → UI i dane po EN
];
export function isSupportedLocale(code) {
  return LOCALES.some((l) => l.code === code);
}
export function localeHasData(code) {
  const l = LOCALES.find((x) => x.code === code);
  return Boolean(l && l.hasData);
}

const catalogs = Object.create(null); // { pl: {...}, en: {...} }
let activeLocale = FALLBACK_LOCALE;

// Storage bezpieczny (tryb prywatny / opaque origin nie może wywracać aplikacji) — jak w theme.js.
function safeStorage() {
  try { return globalThis.localStorage || null; } catch { return null; }
}
function safeGet(storage, key) {
  try { return storage && typeof storage.getItem === "function" ? storage.getItem(key) : null; } catch { return null; }
}
function safeSet(storage, key, value) {
  try { if (storage && typeof storage.setItem === "function") storage.setItem(key, value); } catch { /* zapis niedostępny */ }
}

/**
 * Ustala aktywny locale przy starcie: ?lang= (boot-override, walidowany) > zapis > PL.
 * @param {object} [deps] { search?: string, storage? } — wstrzykiwalne do testów.
 */
export function resolveLang(deps = {}) {
  const search = deps.search != null ? deps.search : (globalThis.location ? globalThis.location.search : "");
  const storage = "storage" in deps ? deps.storage : safeStorage();
  let qp = null;
  try { qp = new URLSearchParams(search || "").get("lang"); } catch { qp = null; }
  if (qp && isSupportedLocale(qp)) return qp;            // ?lang= ma priorytet (boot-override), walidowany
  const saved = safeGet(storage, LANG_KEY);
  if (saved && isSupportedLocale(saved)) return saved;   // zapisana preferencja
  return FALLBACK_LOCALE;                                  // konserwatywnie PL
}

/** Zapisuje wybór locale (tylko wspierany). */
export function persistLang(code, deps = {}) {
  const storage = "storage" in deps ? deps.storage : safeStorage();
  if (isSupportedLocale(code)) safeSet(storage, LANG_KEY, code);
}

/** Rejestruje katalog dla locale (nadpisuje). */
export function registerCatalog(locale, catalog) {
  if (typeof locale === "string" && catalog && typeof catalog === "object") catalogs[locale] = catalog;
}

/** Ustawia aktywny locale (musi być wcześniej zarejestrowany; w innym razie i tak fallback PL). */
export function setLocale(locale) {
  if (typeof locale === "string" && locale) activeLocale = locale;
  return activeLocale;
}

export function getLocale() {
  return activeLocale;
}

/** Czysta wartość z katalogu locale dla klucza, albo null gdy brak / pusta. */
function lookup(locale, key) {
  const c = catalogs[locale];
  if (!c) return null;
  const v = c[key];
  return typeof v === "string" && v !== "" ? v : null;
}

/** Podstawia {param} wartościami z params; nieznane placeholdery zostają nietknięte (bez eval).
    Object.hasOwn — tylko WŁASNE pola (np. {__proto__} nie sięga prototypu, bez podmiany na [object Object]). */
function interpolate(str, params) {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (m, k) => (Object.hasOwn(params, k) && params[k] != null ? String(params[k]) : m));
}

/**
 * Tłumaczenie klucza. @param {string} key @param {object} [params]
 * @returns {string} wartość aktywnego locale, w jego braku PL, w ostateczności sam klucz (nigdy "").
 */
export function t(key, params) {
  const raw = lookup(activeLocale, key) ?? lookup(FALLBACK_LOCALE, key) ?? key;
  return interpolate(raw, params);
}

/** Test/diagnostyka: czy klucz istnieje (niepusty) w danym locale. */
export function hasKey(locale, key) {
  return lookup(locale, key) != null;
}
