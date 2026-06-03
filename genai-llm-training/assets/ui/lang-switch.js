// lang-switch.js — dostępny przełącznik języka (issue #79, I18N-3). Wzorzec menu (button + popup):
// flaga (dekoracyjna SVG, aria-hidden) ORAZ kod/nazwa (nośnik treści — nie sam kolor/emoji, WCAG 1.4.1).
// Pełna obsługa klawiatury: Enter/Spacja/ArrowDown otwiera; ArrowUp/Down/Home/End nawigują; Enter/Spacja
// wybiera; Esc zamyka i wraca fokus na trigger; Tab zamyka; klik poza zamyka. Zero zależności (ADR-0002).
import { el } from "./dom.js";
import { icon } from "./icon.js";
import { LOCALES } from "../i18n/i18n.js";

const SVG_NS = "http://www.w3.org/2000/svg";

// Dekoracyjna, uproszczona „flaga" per locale (aria-hidden). Treść niesie tekst kodu/nazwy — flaga to tylko
// wizualny sygnał (niezależny od dokładności; dla nieznanych locale globus). Budowana przez createElementNS.
function flagSvg(code) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 20 14");
  svg.setAttribute("width", "20");
  svg.setAttribute("height", "14");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("class", "lang-switch__flag");
  const rect = (x, y, w, h, fill) => {
    const r = document.createElementNS(SVG_NS, "rect");
    r.setAttribute("x", x); r.setAttribute("y", y); r.setAttribute("width", w); r.setAttribute("height", h); r.setAttribute("fill", fill);
    svg.appendChild(r);
  };
  if (code === "pl") { rect(0, 0, 20, 7, "#ffffff"); rect(0, 7, 20, 7, "#dc143c"); }
  else if (code === "en") { // uproszczony GB: granat + biało-czerwony krzyż
    rect(0, 0, 20, 14, "#012169");
    rect(0, 5, 20, 4, "#ffffff"); rect(8, 0, 4, 14, "#ffffff");
    rect(0, 6, 20, 2, "#c8102e"); rect(9, 0, 2, 14, "#c8102e");
  } else { rect(0, 0, 20, 14, "#5b6472"); } // nieznany locale — neutralny kafel
  svg.appendChild(document.createElementNS(SVG_NS, "title")); // bez tekstu (aria-hidden) — tylko poprawny węzeł
  return svg;
}

const codeLabel = (code) => code.toUpperCase();
const nameOf = (code) => (LOCALES.find((l) => l.code === code) || {}).name || code;

/**
 * Inicjalizuje przełącznik w istniejącym slocie headera.
 * @param {object} cfg { wrap, trigger, label, getActive():string, onSelect(code) }
 *   wrap = kontener .lang-switch; trigger = <button> (haspopup); label = <span> z kodem aktywnego.
 * @returns {{ setActive(code:string):void }}
 */
export function initLangSwitch(cfg) {
  const { wrap, trigger, label } = cfg;
  if (!wrap || !trigger) return { setActive() {} };

  // Popup menu (budowane raz). role=menu + menuitemradio (jeden aktywny).
  const items = [];
  // aria-label = stała nazwa CELU menu (chooser języka), nie nazwa aktywnego locale — inaczej etykieta
  // dezaktualizowałaby się przy zmianie języka (P1 review). Spójne z aria-label triggera w setActive().
  const menu = el("div", { class: "lang-switch__menu", attrs: { role: "menu", "aria-label": cfg.ariaLabel || "Język / Language" } });
  menu.hidden = true;
  for (const loc of LOCALES) {
    const check = el("span", { class: "lang-switch__option-check", attrs: { "aria-hidden": "true" } }); // wypełniany ikoną gdy aktywny
    const item = el("button", {
      class: "lang-switch__option", type: "button",
      attrs: { role: "menuitemradio", "aria-checked": "false", "data-code": loc.code, tabindex: "-1" },
    }, [
      el("span", { class: "lang-switch__option-flag", attrs: { "aria-hidden": "true" } }, [flagSvg(loc.code)]),
      el("span", { class: "lang-switch__option-name", text: nameOf(loc.code) }),
      check,
    ]);
    item._check = check; // bezpośredni ref (dom-stub nie ma querySelector)
    item.addEventListener("click", () => select(loc.code));
    items.push(item);
    menu.appendChild(item);
  }
  wrap.appendChild(menu);

  let open = false;
  const setOpen = (v, focusFirst) => {
    open = v;
    menu.hidden = !v;
    trigger.setAttribute("aria-expanded", String(v));
    if (v) {
      const activeIdx = Math.max(0, items.findIndex((it) => it.getAttribute("aria-checked") === "true"));
      (focusFirst ? items[0] : items[activeIdx] || items[0]).focus();
    }
  };
  const close = (returnFocus) => { if (open) { setOpen(false); if (returnFocus) trigger.focus(); } };

  function select(code) {
    close(true);
    if (typeof cfg.onSelect === "function") cfg.onSelect(code);
  }

  function moveFocus(delta) {
    const idx = items.indexOf(document.activeElement);
    const next = (idx + delta + items.length) % items.length;
    items[next].focus();
  }

  trigger.addEventListener("click", () => setOpen(!open, false));
  trigger.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true, true); }
  });
  menu.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); moveFocus(1); break;
      case "ArrowUp": e.preventDefault(); moveFocus(-1); break;
      case "Home": e.preventDefault(); items[0].focus(); break;
      case "End": e.preventDefault(); items[items.length - 1].focus(); break;
      case "Escape": e.preventDefault(); close(true); break;
      case "Tab": close(false); break;
      default: break;
    }
  });
  // Klik poza przełącznikiem zamyka menu.
  if (globalThis.document && globalThis.document.addEventListener) {
    globalThis.document.addEventListener("click", (e) => { if (open && !wrap.contains(e.target)) close(false); });
  }

  function setActive(code) {
    if (label) label.textContent = codeLabel(code);
    if (cfg.triggerFlag) cfg.triggerFlag.replaceChildren(flagSvg(code)); // flaga aktywnego w triggerze
    trigger.setAttribute("aria-label", `${cfg.ariaLabel || "Język / Language"}: ${nameOf(code)}`);
    for (const it of items) {
      const isActive = it.getAttribute("data-code") === code;
      it.setAttribute("aria-checked", String(isActive));
      if (it._check) it._check.replaceChildren(isActive ? icon("check") : el("span"));
    }
  }
  setActive(cfg.getActive ? cfg.getActive() : "pl");
  return { setActive };
}
