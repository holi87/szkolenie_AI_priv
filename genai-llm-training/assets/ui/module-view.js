// module-view.js — render treści modułu z danych (data/module-content/mNN.json). Zero treści w kodzie
// (AGENTS: treść oddzielnie od logiki). Ekrany i bloki filtrowane po ścieżce (wariant S1 skrócony: bloki/ekrany
// z onlyForPaths). Tabele i diagramy MAJĄ wersję tekstową (WCAG 1.1.1, design-baseline §1).
import { el } from "./dom.js";
import { icon } from "./icon.js";
import { t } from "../i18n/i18n.js";

/** Czy element treści jest widoczny na danej ścieżce (onlyForPaths/hideForPaths). */
function visibleForPath(item, pathId) {
  if (item.onlyForPaths && !item.onlyForPaths.includes(pathId)) return false;
  if (item.hideForPaths && item.hideForPaths.includes(pathId)) return false;
  return true;
}

function renderBlock(b, pathId) {
  if (!visibleForPath(b, pathId)) return null;
  switch (b.kind) {
    case "paragraph":
      return el("p", { text: b.text });
    case "list":
      return el(b.ordered ? "ol" : "ul", {}, (b.items || []).map((it) => el("li", { text: it })));
    case "definition":
      return el("p", { class: "definition" }, [
        el("strong", { text: b.term }),
        b.original ? el("em", { text: ` (${b.original})` }) : null,
        ` — ${b.text}`,
      ]);
    case "callout":
      return el("div", { class: `callout callout--${b.variant || "info"}`, attrs: { role: "note" } }, [
        b.title ? el("p", { class: "callout__title" }, [el("span", { class: "callout__icon", attrs: { "aria-hidden": "true" } }, [icon(calloutIcon(b.variant))]), b.title]) : null,
        el("p", { text: b.text }),
      ]);
    case "table":
      return renderTable(b);
    case "diagram":
      // Diagram dekoracyjny (aria-hidden); NOŚNIKIEM treści jest opis tekstowy (WCAG 1.1.1).
      return el("figure", { class: "diagram" }, [
        b.ascii ? el("pre", { class: "diagram__ascii", attrs: { "aria-hidden": "true" }, text: b.ascii }) : null,
        el("figcaption", { class: "diagram__alt" }, [el("strong", { text: t("module.diagram.descLabel") }), b.textAlt]),
      ]);
    default:
      return el("p", { text: b.text || "" });
  }
}

// Zwraca NAZWĘ ikony SVG (icon.js) dla wariantu calloutu — informacja nadal w tytule/treści (WCAG 1.4.1).
function calloutIcon(variant) {
  return variant === "warn" ? "warn" : variant === "safe" ? "check" : "info";
}

function renderTable(b) {
  const headers = b.headers || [];
  const rows = b.rows || [];
  const table = el("table", { class: "content-table" }, [
    b.caption ? el("caption", { text: b.caption }) : null,
    el("thead", {}, [el("tr", {}, headers.map((h) => el("th", { attrs: { scope: "col" }, text: h })))]),
    el("tbody", {}, rows.map((r) => el("tr", {}, r.map((cell) => el("td", { text: String(cell) }))))),
  ]);
  // Wersja tekstowa tabeli (WCAG 1.1.1) — krótki opis alternatywny pod tabelą.
  return el("div", { class: "content-table__wrap" }, [table, b.textAlt ? el("p", { class: "muted", text: t("module.table.descLabel", { alt: b.textAlt }) }) : null]);
}

/** Renderuje ekrany narracyjne modułu (filtr po ścieżce). Zwraca tablicę węzłów <section>. */
export function renderScreens(screens, pathId) {
  return (screens || [])
    .filter((s) => visibleForPath(s, pathId))
    .map((s) =>
      el("section", { class: `module-screen module-screen--${s.type || "content"}` }, [
        s.title ? el("h2", { text: s.title }) : null,
        ...(s.blocks || []).map((b) => renderBlock(b, pathId)),
      ]));
}

/** Renderuje podsumowanie modułu: synteza + checklista + „następny krok". */
export function renderSummary(summary) {
  if (!summary) return null;
  return el("section", { class: "module-summary" }, [
    el("h2", { text: t("module.summary.heading") }),
    ...((summary.points || []).length ? [el("ul", {}, summary.points.map((p) => el("li", { text: p })))] : []),
    (summary.checklist || []).length
      ? el("div", { class: "callout callout--safe", attrs: { role: "note" } }, [
          el("p", { class: "callout__title" }, [el("span", { class: "callout__icon", attrs: { "aria-hidden": "true" } }, [icon("check")]), summary.checklistTitle || t("module.summary.checklistTitle")]),
          el("ul", {}, summary.checklist.map((c) => el("li", { text: c }))),
        ])
      : null,
  ]);
}
