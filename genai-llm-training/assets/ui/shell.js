// shell.js — header (ścieżka, progres) i nawigacja modułów (issue #14).
// Statusy modułów ZAWSZE ikona + tekst (WCAG 1.4.1, design-baseline §3), nie sam kolor.
// Element zablokowany jest realnie nieaktywny (disabled) + ma powód blokady.
import { el, mount } from "./dom.js";

const STATUS_META = {
  completed: { icon: "✓", text: "Ukończony" },
  in_progress: { icon: "●", text: "W toku" },
  available: { icon: "○", text: "Dostępny" },
  locked: { icon: "🔒", text: "Zablokowany" },
};

/** Aktualizuje header: ścieżka + pasek postępu (z ARIA). */
export function updateHeader(refs, { pathId, pathName, progressPct }) {
  if (pathId) {
    refs.pathIndicator.hidden = false;
    refs.pathIndicator.textContent = `Ścieżka ${pathId}${pathName ? ` — ${pathName}` : ""}`;
    refs.navToggle.hidden = false;
    refs.resetBtn.hidden = false;
    refs.progress.hidden = false;
  }
  const pct = Math.round(progressPct || 0);
  refs.progressFill.style.width = `${pct}%`;
  refs.progressTrack.setAttribute("aria-valuenow", String(pct));
  refs.progressLabel.textContent = `Postęp: ${pct}%`;
}

function moduleButton(mod, { activeModuleId, onSelectModule }) {
  const meta = STATUS_META[mod.status] || STATUS_META.available;
  const isActive = mod.id === activeModuleId;
  const btn = el("button", {
    class: `nav-item__btn status--${mod.status}`,
    type: "button",
    attrs: { "aria-current": isActive ? "page" : null },
    on: { click: () => onSelectModule(mod.id) },
  }, [
    el("span", { class: "nav-item__icon", attrs: { "aria-hidden": "true" }, text: meta.icon }),
    el("span", { class: "nav-item__label" }, [
      el("span", { text: `${mod.id} ${mod.name}` }),
      el("span", { class: "nav-item__variant", text: mod.required ? " · wymagany" : " · opcjonalny" }),
    ]),
    el("span", { class: "nav-item__status", text: meta.text }),
  ]);
  return el("div", { class: "nav-item" }, [btn]);
}

function finalTestItem(finalTest, onSelectFinalTest) {
  if (finalTest.status === "locked") {
    const btn = el("button", {
      class: "nav-item__btn status--locked", type: "button", disabled: true,
      attrs: { "aria-disabled": "true", title: finalTest.lockedReason },
    }, [
      el("span", { class: "nav-item__icon", attrs: { "aria-hidden": "true" }, text: "🔒" }),
      el("span", { class: "nav-item__label", text: "Test końcowy" }),
      el("span", { class: "nav-item__status", text: "Zablokowany" }),
    ]);
    return el("div", { class: "nav-item" }, [btn, el("p", { class: "nav-item__variant", attrs: { style: "padding:0 0.6rem" }, text: finalTest.lockedReason })]);
  }
  return el("div", { class: "nav-item" }, [
    el("button", {
      class: "nav-item__btn status--available", type: "button",
      attrs: { "aria-current": finalTest.active ? "page" : null },
      on: { click: onSelectFinalTest },
    }, [
      el("span", { class: "nav-item__icon", attrs: { "aria-hidden": "true" }, text: "▶" }),
      el("span", { class: "nav-item__label", text: "Test końcowy" }),
      el("span", { class: "nav-item__status", text: "Dostępny" }),
    ]),
  ]);
}

/** Renderuje listę modułów + pozycję testu końcowego do nawigacji. */
export function renderNav(navEl, { modules, finalTest, activeModuleId, onSelectModule, onSelectFinalTest }) {
  mount(
    navEl,
    el("p", { class: "module-nav__heading", text: "Moduły" }),
    ...modules.map((m) => moduleButton(m, { activeModuleId, onSelectModule })),
    finalTestItem(finalTest, onSelectFinalTest),
  );
}
