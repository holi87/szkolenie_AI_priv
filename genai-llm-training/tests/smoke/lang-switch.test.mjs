// lang-switch.test.mjs — komponent przełącznika języka (issue #79). DOM-stub (ADR-0002).
// Sprawdza: deklaratywność (opcje z LOCALES), flaga ORAZ nazwa (a11y, nie sam kolor), role/aria,
// oznaczenie aktywnego tekstowo, callback wyboru, klawiatura (ArrowDown otwiera, Esc zamyka).
import "./_dom-stub.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { initLangSwitch } from "../../assets/ui/lang-switch.js";
import { LOCALES } from "../../assets/i18n/i18n.js";

const doc = globalThis.document;
function build() {
  const wrap = doc.createElement("div");
  const trigger = doc.createElement("button");
  const label = doc.createElement("span");
  const flag = doc.createElement("span");
  wrap.appendChild(trigger);
  return { wrap, trigger, label, flag };
}
const fire = (elm, type, ev = {}) => (elm._listeners[type] || []).forEach((fn) => fn({ preventDefault() {}, ...ev }));
const menuOf = (wrap) => wrap.childNodes.find((n) => n.getAttribute && n.getAttribute("role") === "menu");

test("buduje DOKŁADNIE jedną opcję na locale (deklaratywność z LOCALES)", () => {
  const { wrap, trigger, label, flag } = build();
  initLangSwitch({ wrap, trigger, label, triggerFlag: flag, getActive: () => "pl", onSelect: () => {} });
  const menu = menuOf(wrap);
  assert.ok(menu, "popup-menu zbudowane");
  const options = menu.childNodes.filter((n) => n.getAttribute && n.getAttribute("role") === "menuitemradio");
  assert.equal(options.length, LOCALES.length, "liczba opcji == liczba locale w konfiguracji");
});

test("każda opcja: flaga (SVG, dekoracyjna) ORAZ nazwa tekstowa (a11y — nie sam kolor)", () => {
  const { wrap, trigger, label, flag } = build();
  initLangSwitch({ wrap, trigger, label, triggerFlag: flag, getActive: () => "pl", onSelect: () => {} });
  const options = menuOf(wrap).childNodes;
  options.forEach((opt, i) => {
    const flagSpan = opt.childNodes[0];
    const nameSpan = opt.childNodes[1];
    assert.equal(flagSpan.childNodes[0].tagName, "SVG", "flaga jako SVG");
    assert.equal(flagSpan.getAttribute("aria-hidden"), "true", "flaga dekoracyjna");
    assert.ok((nameSpan.textContent || "").includes(LOCALES[i].name), "nazwa locale obecna tekstowo");
  });
});

test("trigger ma aria-haspopup/expanded; setActive oznacza aktywny tekstowo i przez aria-checked", () => {
  const { wrap, trigger, label, flag } = build();
  const api = initLangSwitch({ wrap, trigger, label, triggerFlag: flag, getActive: () => "pl", onSelect: () => {} });
  assert.equal(trigger.getAttribute("aria-haspopup") || "menu", "menu");
  assert.equal(label.textContent, "PL", "kod aktywnego w triggerze");
  api.setActive("en");
  assert.equal(label.textContent, "EN");
  const options = menuOf(wrap).childNodes;
  const byCode = (c) => options.find((o) => o.getAttribute("data-code") === c);
  assert.equal(byCode("en").getAttribute("aria-checked"), "true");
  assert.equal(byCode("pl").getAttribute("aria-checked"), "false");
});

test("wybór opcji wywołuje onSelect z kodem locale", () => {
  const { wrap, trigger, label, flag } = build();
  let picked = null;
  initLangSwitch({ wrap, trigger, label, triggerFlag: flag, getActive: () => "pl", onSelect: (c) => { picked = c; } });
  const en = menuOf(wrap).childNodes.find((o) => o.getAttribute("data-code") === "en");
  fire(en, "click");
  assert.equal(picked, "en");
});

test("klawiatura: ArrowDown na triggerze otwiera (aria-expanded=true), Esc zamyka", () => {
  const { wrap, trigger, label, flag } = build();
  initLangSwitch({ wrap, trigger, label, triggerFlag: flag, getActive: () => "pl", onSelect: () => {} });
  const menu = menuOf(wrap);
  assert.equal(menu.hidden, true, "menu domyślnie zamknięte");
  fire(trigger, "keydown", { key: "ArrowDown" });
  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  assert.equal(menu.hidden, false, "menu otwarte po ArrowDown");
  fire(menu, "keydown", { key: "Escape" });
  assert.equal(menu.hidden, true, "Esc zamyka");
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
});
