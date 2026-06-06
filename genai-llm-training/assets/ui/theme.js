// theme.js — logika przełącznika motywu jasny/ciemny (issue #72, UX-3; default dark M19 #158). Zero zależności (ADR-0002).
// Kontrakt: [data-theme] na <html>; zapis wyboru w localStorage; przy pierwszym wejściu DOMYŚLNIE CIEMNY.
// STORAGE MA PIERWSZEŃSTWO (świadomy wybór > domyślny). Decyzja właściciela M19: dark dla każdego (mockup jest
// ciemny, redesign Deep Slate żyje w trybie ciemnym) — NIE czytamy prefers-color-scheme do ustalenia domyślnego.
// Konserwatywnie: storage rzucający wyjątek (tryb prywatny) => brak crasha, fallback do ciemnego.
// Spójne z anty-flash skryptem w index.html; ustawiamy data-theme JAWNIE ("dark"/"light").

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
// UWAGA: sam DOSTĘP do globalThis.localStorage RZUCA w części środowisk (opaque origin, storage
// zablokowany jako throwing getter) — dlatego czytamy go w try, nie tylko getItem/setItem (Codex P2).
function safeStorage() {
  try { return globalThis.localStorage || null; } catch { return null; }
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
 * Inicjalizuje motyw: zapis (storage) ma priorytet; w jego braku DOMYŚLNIE CIEMNY (decyzja właściciela M19).
 * Nie czytamy prefers-color-scheme — dark jest domyślny dla każdego; użytkownik zmienia toggle (zapis w storage).
 * @param {object} [deps] { storage, root } — wstrzykiwalne do testów
 * @returns {"dark"|"light"} ustalony motyw
 */
export function initTheme(deps = {}) {
  const storage = "storage" in deps ? deps.storage : safeStorage();
  const saved = safeGet(storage, THEME_KEY);
  const theme = VALID.has(saved) ? saved : "dark";
  applyTheme(deps.root, theme);
  return theme;
}

/**
 * Przełącza motyw i zapisuje wybór. @returns {"dark"|"light"} nowy motyw.
 */
export function toggleTheme(deps = {}) {
  const storage = "storage" in deps ? deps.storage : safeStorage();
  const next = currentTheme(deps.root) === "dark" ? "light" : "dark";
  applyTheme(deps.root, next);
  safeSet(storage, THEME_KEY, next);
  return next;
}
