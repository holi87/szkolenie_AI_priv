// _contrast.mjs — zero-dep helper kontrastu WCAG na tokenach CSS (issue #69, QA-1). NIE jest plikiem testowym.
// Czyta tokens.css JAKO TEKST (wzorzec a11y-static.test.mjs) — bez przeglądarki, bez npm (ADR-0002).
// Służy do AUTOMATYCZNEJ asercji kontrastu obu motywów (UX-1..UX-5 dopisują pary do listy w contrast.test.mjs,
// bez zmiany logiki tego helpera — lista jest deklaratywna).
//
// GRANICE (świadome, weryfikacja RĘCZNA — helper liczy tylko solid hex):
//   - gradient (--grad-accent), background-clip:text — nie da się rozstrzygnąć statycznie,
//   - półprzezroczyste tła (rgba na rgba) — kontrast zależy od warstwy pod spodem.
// contrastRatio przyjmuje WYŁĄCZNIE solid hex (#rgb / #rrggbb); dla innych wartości rzuca (świadomy kontrakt).

/**
 * Parsuje deklaracje --zmiennych z bloków selektorów w tekście CSS.
 * @returns {Record<string, Record<string,string>>} mapa selektor -> { '--nazwa': 'wartość' }
 *   np. { ':root': {...}, ':root[data-theme="light"]': {...} }
 */
export function parseTokens(cssText) {
  const out = {};
  // Usuń komentarze, żeby nie łapać --zmiennych z przykładów w komentarzach.
  const css = cssText.replace(/\/\*[\s\S]*?\*\//g, "");
  // Dopasuj bloki: <selektor> { <ciało> }. Selektory tokenów to :root oraz :root[data-theme="..."].
  const blockRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = blockRe.exec(css)) !== null) {
    const selector = m[1].trim();
    const body = m[2];
    const vars = {};
    const declRe = /(--[\w-]+)\s*:\s*([^;]+);/g;
    let d;
    while ((d = declRe.exec(body)) !== null) vars[d[1]] = d[2].trim();
    if (Object.keys(vars).length) out[selector] = { ...(out[selector] || {}), ...vars };
  }
  return out;
}

/**
 * Rozwiązuje wartość --zmiennej w danym zakresie (selektorze). Podstawia zagnieżdżone var(--x)
 * z guard na cykle (zwraca null zamiast wisieć) i fallbackiem do :root, gdy zmiennej brak w zakresie.
 * @param {Record<string,Record<string,string>>} tokens wynik parseTokens
 * @param {string} scope selektor zakresu (np. ':root' albo ':root[data-theme="light"]')
 * @param {string} name nazwa zmiennej (np. '--color-fg')
 * @returns {string|null} rozwiązana wartość (np. '#e8eaf0') albo null (cykl / brak)
 */
export function resolveVar(tokens, scope, name, _seen = new Set()) {
  if (_seen.has(name)) return null; // cykl — nie zapętlaj się
  _seen.add(name);
  const scoped = tokens[scope] || {};
  const root = tokens[":root"] || {};
  let value = name in scoped ? scoped[name] : root[name];
  if (value == null) return null;
  // Podstaw każde var(--x[, fallback]) w wartości. Jeśli którekolwiek odwołanie jest nierozwiązywalne
  // (cykl / brak) — całość jest nierozwiązywalna → null (nie wisimy, nie zwracamy częściowej wartości).
  const varRe = /var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)/g;
  if (varRe.test(value)) {
    let failed = false;
    const replaced = value.replace(varRe, (_full, ref) => {
      const r = resolveVar(tokens, scope, ref, new Set(_seen));
      if (r == null) { failed = true; return ""; }
      return r;
    });
    if (failed) return null;
    value = replaced;
  }
  return value.trim();
}

/** #rgb / #rrggbb -> {r,g,b} 0..255. Rzuca dla nie-hex (świadomy kontrakt: helper liczy tylko solid hex). */
export function hexToRgb(hex) {
  const s = String(hex).trim();
  let m = /^#([0-9a-f]{6})$/i.exec(s);
  if (m) {
    const n = parseInt(m[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  m = /^#([0-9a-f]{3})$/i.exec(s);
  if (m) {
    const [a, b, c] = m[1].split("");
    return { r: parseInt(a + a, 16), g: parseInt(b + b, 16), b: parseInt(c + c, 16) };
  }
  throw new Error(`hexToRgb: nie-hex (solid) wartość: ${s}`);
}

/** Relative luminance wg WCAG 2.x (1.4.3/1.4.11). */
export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const lin = (c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Współczynnik kontrastu WCAG dwóch solid hex (kolejność nieistotna). Zakres 1..21. */
export function contrastRatio(hexA, hexB) {
  const la = relativeLuminance(hexA);
  const lb = relativeLuminance(hexB);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Kompostuje kolor foreground (hexA) z ratio (0..1) na solid tło (hexB).
 * Modeluje `color-mix(in srgb, hexA ratio*100%, transparent)` nad hexB.
 * Zwraca solid hex wyniku (do dalszego pomiaru kontrastu).
 * @param {string} hexA kolor naniesiony
 * @param {string} hexB kolor podłoża (solid, nieprzezroczysty)
 * @param {number} ratio udział hexA (np. 0.10 dla 10%)
 * @returns {string} solid hex kompozytu
 */
export function mixHex(hexA, hexB, ratio) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(ratio * a.r + (1 - ratio) * b.r);
  const g = Math.round(ratio * a.g + (1 - ratio) * b.g);
  const bl = Math.round(ratio * a.b + (1 - ratio) * b.b);
  return "#" + [r, g, bl].map((x) => x.toString(16).padStart(2, "0")).join("");
}
