// theme.js — logika przełącznika motywu jasny/ciemny (issue #72, UX-3). Zero zależności (ADR-0002).
// Kontrakt: [data-theme] na <html>; zapis wyboru w localStorage; przy pierwszym wejściu respekt dla
// prefers-color-scheme. STORAGE MA PIERWSZEŃSTWO nad media (świadomy wybór > preferencja systemu).
// Konserwatywnie: storage rzucający wyjątek (tryb prywatny) => brak crasha, fallback do prefers-color-scheme.
// Domyślny motyw to ciemny (:root); dla spójności z anty-flash skryptem ustawiamy data-theme JAWNIE ("dark"/"light").

export const THEME_KEY = "genai-training:theme";
const VALID = new Set(["dark", "light"]);

function safeGet(storage, key) {
  try { return storage && typeof storage.getItem === "function" ? storage.getItem(key) : null; }
  catch { return null; } // np. tryb prywatny — nie wywracaj aplikacji
}
function safeSet(storage, key, value) {
  try { if (storage && typeof storage.setItem === "function") storage.setItem(key, value); }
  catch { /* zapis niedostępny — wybór zadziała na czas sesji, bez crasha */ }
}
function prefersDark(matchMedia) {
  try {
    if (typeof matchMedia !== "function") return true; // brak matchMedia => zostań przy domyślnym ciemnym
    return Boolean(matchMedia("(prefers-color-scheme: dark)").matches);
  } catch { return true; }
}
function resolveRoot(root) {
  return root || (globalThis.document && globalThis.document.documentElement) || null;
}

/** Ustawia motyw na <html> (jawnie data-theme="dark"|"light"). */
export function applyTheme(root, theme) {
  const el = resolveRoot(root);
  if (el && typeof el.setAttribute === "function") el.setAttribute("data-theme", VALID.has(theme) ? theme : "dark");
  return theme;
}

/** Aktualny motyw z <html> (domyślnie "dark", bo :root jest ciemny). */
export function currentTheme(root) {
  const el = resolveRoot(root);
  const v = el && typeof el.getAttribute === "function" ? el.getAttribute("data-theme") : null;
  return v === "light" ? "light" : "dark";
}

/**
 * Inicjalizuje motyw: zapis (storage) ma priorytet; w jego braku prefers-color-scheme.
 * @param {object} [deps] { storage, matchMedia, root } — wstrzykiwalne do testów
 * @returns {"dark"|"light"} ustalony motyw
 */
export function initTheme(deps = {}) {
  const storage = "storage" in deps ? deps.storage : globalThis.localStorage;
  const mm = "matchMedia" in deps ? deps.matchMedia : globalThis.matchMedia;
  const saved = safeGet(storage, THEME_KEY);
  const theme = VALID.has(saved) ? saved : (prefersDark(mm) ? "dark" : "light");
  applyTheme(deps.root, theme);
  return theme;
}

/**
 * Przełącza motyw i zapisuje wybór. @returns {"dark"|"light"} nowy motyw.
 */
export function toggleTheme(deps = {}) {
  const storage = "storage" in deps ? deps.storage : globalThis.localStorage;
  const next = currentTheme(deps.root) === "dark" ? "light" : "dark";
  applyTheme(deps.root, next);
  safeSet(storage, THEME_KEY, next);
  return next;
}
