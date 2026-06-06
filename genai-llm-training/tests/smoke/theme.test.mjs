// theme.test.mjs — logika przełącznika motywu (issue #72, UX-3). Czysta logika z wstrzykniętymi
// fake-storage / fake-matchMedia / fake-root — bez przeglądarki (ADR-0002).
import { test } from "node:test";
import assert from "node:assert/strict";
import { initTheme, toggleTheme, currentTheme, THEME_KEY } from "../../assets/ui/theme.js";

const makeRoot = () => ({ _a: null, setAttribute(_k, v) { this._a = v; }, getAttribute() { return this._a; } });
const makeStorage = (init = {}) => ({ _v: { ...init }, getItem(k) { return k in this._v ? this._v[k] : null; }, setItem(k, v) { this._v[k] = String(v); } });
const throwingStorage = { getItem() { throw new Error("tryb prywatny"); }, setItem() { throw new Error("tryb prywatny"); } };
const mm = (matches) => () => ({ matches });

test("init bez zapisu: DOMYŚLNIE CIEMNY (M19 #158 — ignoruje prefers-color-scheme)", () => {
  // Decyzja właściciela: dark dla każdego. matchMedia nie wpływa na domyślny motyw.
  const r1 = makeRoot();
  assert.equal(initTheme({ storage: makeStorage(), matchMedia: mm(true), root: r1 }), "dark");
  assert.equal(r1.getAttribute("data-theme"), "dark");
  const r2 = makeRoot();
  assert.equal(initTheme({ storage: makeStorage(), matchMedia: mm(false), root: r2 }), "dark", "prefers light NIE zmienia domyślnego — dark dla każdego");
  assert.equal(r2.getAttribute("data-theme"), "dark");
});

test("storage MA PRIORYTET nad prefers-color-scheme", () => {
  const r = makeRoot();
  // zapis "light" mimo prefers dark => light
  assert.equal(initTheme({ storage: makeStorage({ [THEME_KEY]: "light" }), matchMedia: mm(true), root: r }), "light");
  assert.equal(r.getAttribute("data-theme"), "light");
  // zapis "dark" mimo prefers light => dark
  assert.equal(initTheme({ storage: makeStorage({ [THEME_KEY]: "dark" }), matchMedia: mm(false), root: makeRoot() }), "dark");
});

test("toggle przełącza i ZAPISUJE wybór pod ustalonym kluczem; ponowny init odczytuje zapis", () => {
  const r = makeRoot();
  const storage = makeStorage();
  initTheme({ storage, matchMedia: mm(true), root: r }); // dark
  assert.equal(currentTheme(r), "dark");
  const next = toggleTheme({ storage, root: r });
  assert.equal(next, "light");
  assert.equal(r.getAttribute("data-theme"), "light");
  assert.equal(storage.getItem(THEME_KEY), "light", "wybór zapisany w storage");
  // ponowny init (np. po reloadzie) — storage ma priorytet, więc zostaje light mimo prefers dark
  assert.equal(initTheme({ storage, matchMedia: mm(true), root: makeRoot() }), "light");
});

test("konserwatywnie: storage rzucający wyjątek (tryb prywatny) => brak crasha, fallback do ciemnego", () => {
  const r = makeRoot();
  let theme;
  assert.doesNotThrow(() => { theme = initTheme({ storage: throwingStorage, matchMedia: mm(true), root: r }); });
  assert.equal(theme, "dark", "fallback do domyślnego ciemnego przy niedostępnym storage");
  // toggle też nie może wywalić aplikacji, gdy zapis rzuca
  let toggled;
  assert.doesNotThrow(() => { toggled = toggleTheme({ storage: throwingStorage, root: r }); });
  assert.equal(toggled, "light");
  assert.equal(r.getAttribute("data-theme"), "light", "motyw zastosowany mimo nieudanego zapisu");
});

test("brak matchMedia => domyślny ciemny (nie wywraca się)", () => {
  const r = makeRoot();
  assert.equal(initTheme({ storage: makeStorage(), matchMedia: undefined, root: r }), "dark");
});

test("brak wstrzykniętego storage => DOSTĘP do globalThis.localStorage nie wywraca initTheme/toggleTheme (Codex P2)", () => {
  // Bez deps.storage helper czyta globalThis.localStorage przez safeStorage() (try/catch na samym dostępie).
  const r = makeRoot();
  assert.doesNotThrow(() => initTheme({ matchMedia: mm(true), root: r }), "initTheme bez storage nie może rzucać");
  assert.doesNotThrow(() => toggleTheme({ root: r }), "toggleTheme bez storage nie może rzucać");
});
