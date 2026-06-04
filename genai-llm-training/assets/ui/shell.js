// shell.js — header (ścieżka, progres) i nawigacja modułów (issue #14).
// Statusy modułów ZAWSZE ikona + tekst (WCAG 1.4.1, design-baseline §3), nie sam kolor.
// Element zablokowany jest realnie nieaktywny (disabled) + ma powód blokady.
// i18n (#77): teksty przez t(); STATUS_META trzyma KLUCZE, rozwiązywane przy renderze (nie imporcie).
import { el, mount } from "./dom.js";
import { icon } from "./icon.js";
import { t } from "../i18n/i18n.js";

// icon = NAZWA ikony SVG (icon.js), nie glif. Informacja zawsze w tekście — ikona dekoracyjna (WCAG 1.4.1).
// Eksportowane: hub modułów (#88) reużywa tej samej mapy statusów (ikona + KLUCZ tekstu), żeby nie
// duplikować mapowania statusów między szyną a hubem.
export const STATUS_META = {
  completed: { icon: "check", textKey: "nav.status.completed" },
  in_progress: { icon: "dot", textKey: "nav.status.inProgress" },
  available: { icon: "circle", textKey: "nav.status.available" },
  locked: { icon: "lock", textKey: "nav.status.locked" },
};

/** Składa czytelny powód blokady testu z danych strukturalnych core (paths.js) przez t(). */
export function lockedReasonText(finalTest) {
  const reasons = [];
  if ((finalTest.blockers || []).length) {
    reasons.push(t("test.lockedReason.modules", { modules: finalTest.blockers.join(", ") }));
  }
  if ((finalTest.missingPractical || []).length) {
    reasons.push(t("test.lockedReason.practical", { rubrics: finalTest.missingPractical.join(", ") }));
  }
  return reasons.join("; ");
}

/** Aktualizuje header: ścieżka + pasek postępu (z ARIA). */
export function updateHeader(refs, { pathId, pathName, progressPct }) {
  if (pathId) {
    refs.pathIndicator.hidden = false;
    refs.pathIndicator.textContent = pathName
      ? t("nav.header.pathIndicatorNamed", { pathId, pathName })
      : t("nav.header.pathIndicator", { pathId });
    // Widoczność „Moduły" (navToggle) ustawiają ekrany (app.js): ukryty na hubie, widoczny w module/teście/wyniku
    // jako powrót do hubu (#88). Tu sterujemy tylko trwałymi elementami headera.
    refs.resetBtn.hidden = false;
    refs.progress.hidden = false;
  }
  const pct = Math.round(progressPct || 0);
  refs.progressFill.style.width = `${pct}%`;
  refs.progressTrack.setAttribute("aria-valuenow", String(pct));
  refs.progressLabel.textContent = t("nav.progress", { pct });
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
    el("span", { class: "nav-item__icon", attrs: { "aria-hidden": "true" } }, [icon(meta.icon)]),
    el("span", { class: "nav-item__label" }, [
      el("span", { text: `${mod.id} ${mod.name}` }),
      el("span", { class: "nav-item__variant", text: mod.required ? t("nav.item.required") : t("nav.item.optional") }),
    ]),
    el("span", { class: "nav-item__status", text: t(meta.textKey) }),
  ]);
  return el("div", { class: "nav-item" }, [btn]);
}

function finalTestItem(finalTest, onSelectFinalTest) {
  if (finalTest.status === "locked") {
    const reason = lockedReasonText(finalTest);
    const btn = el("button", {
      class: "nav-item__btn status--locked", type: "button", disabled: true,
      attrs: { "aria-disabled": "true", title: reason },
    }, [
      el("span", { class: "nav-item__icon", attrs: { "aria-hidden": "true" } }, [icon("lock")]),
      el("span", { class: "nav-item__label", text: t("nav.finalTest.label") }),
      el("span", { class: "nav-item__status", text: t("nav.status.locked") }),
    ]);
    return el("div", { class: "nav-item" }, [btn, el("p", { class: "nav-item__variant", attrs: { style: "padding:0 0.6rem" }, text: reason })]);
  }
  return el("div", { class: "nav-item" }, [
    el("button", {
      class: "nav-item__btn status--available", type: "button",
      attrs: { "aria-current": finalTest.active ? "page" : null },
      on: { click: onSelectFinalTest },
    }, [
      el("span", { class: "nav-item__icon", attrs: { "aria-hidden": "true" } }, [icon("play")]),
      el("span", { class: "nav-item__label", text: t("nav.finalTest.label") }),
      el("span", { class: "nav-item__status", text: t("nav.status.available") }),
    ]),
  ]);
}

/** Renderuje listę modułów + pozycję testu końcowego do nawigacji. */
export function renderNav(navEl, { modules, finalTest, activeModuleId, onSelectModule, onSelectFinalTest }) {
  mount(
    navEl,
    el("p", { class: "module-nav__heading", text: t("nav.heading.modules") }),
    ...modules.map((m) => moduleButton(m, { activeModuleId, onSelectModule })),
    finalTestItem(finalTest, onSelectFinalTest),
  );
}
