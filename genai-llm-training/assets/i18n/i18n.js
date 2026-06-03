// i18n.js — lekki helper tłumaczeń t() (issue #77, I18N-2). Zero zależności (ADR-0002, ADR-0004).
// Kontrakt:
//  - t(key, params?) -> string; interpolacja {param} BEZ eval.
//  - fallback KONSERWATYWNY: aktywny locale -> pl -> sam klucz; NIGDY pusty string.
//    Działa też na PUSTEJ wartości (szkielet en.json ma klucze z ""), nie tylko na braku klucza.
//  - katalogi rejestrowane przez registerCatalog (w przeglądarce: po fetch w bootstrapie app.js;
//    w testach: wstrzykiwane bezpośrednio). Brak ukrytego importu JSON (zero-build).
// Klucze są PŁASKIE i namespaced kropką, np. "nav.progress", "feedback.correct".

export const FALLBACK_LOCALE = "pl";

const catalogs = Object.create(null); // { pl: {...}, en: {...} }
let activeLocale = FALLBACK_LOCALE;

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
