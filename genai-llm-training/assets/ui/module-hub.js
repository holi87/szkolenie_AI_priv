// module-hub.js — dedykowany ekran wyboru modułów (issue #88, „główny osobny ekran startowy").
// Zastępuje cienki ekran-menu + wąską boczną szynę jako PODSTAWOWĄ powierzchnię wyboru: pełnowymiarowa
// siatka kart modułów + karta testu końcowego, w centralnej kolumnie (nav ukryty → single column).
// Statusy ZAWSZE ikona + tekst (WCAG 1.4.1). Akcja karty = realny <button> (fokusowalny, klawiatura).
// Zero zależności, budowa przez dom.js (bez innerHTML; ADR-0002). i18n: teksty przez t().
import { el } from "./dom.js";
import { icon } from "./icon.js";
import { t } from "../i18n/i18n.js";
import { STATUS_META, lockedReasonText } from "./shell.js";

// Etykieta CTA zależna od statusu (semantyczny kod → tekst). Moduły są self-paced (bez twardego locka):
// available → start, in_progress → kontynuuj, completed → przejrzyj.
const CTA_KEY = {
  available: "module.hub.cta.start",
  in_progress: "module.hub.cta.continue",
  completed: "module.hub.cta.review",
};

// Czytelna etykieta filaru z kodu semantycznego (np. "qa_practice" → „Praktyka QA"). Fallback do surowego
// kodu, gdy brak klucza w katalogu (t() zwraca wtedy sam klucz) — żeby nowy filar nie pokazał klucza i18n.
function pillarLabel(code) {
  if (!code) return "—";
  const key = `module.pillar.${code}`;
  const label = t(key);
  return label === key ? code : label;
}

/** Plakietka statusu: ikona dekoracyjna + tekst (nośnik informacji, nie sam kolor). */
function statusPill(status) {
  const meta = STATUS_META[status] || STATUS_META.available;
  return el("span", { class: "hub-card__status" }, [
    el("span", { class: "hub-card__status-icon", attrs: { "aria-hidden": "true" } }, [icon(meta.icon)]),
    el("span", { text: t(meta.textKey) }),
  ]);
}

/** Karta pojedynczego modułu. mod = { id, name, status, required, pillar, time, quizPct }. */
function moduleCard(mod, onSelectModule) {
  const meta = el("p", { class: "hub-card__meta", text: t("module.hub.card.meta", {
    variant: mod.required ? t("module.hub.card.required") : t("module.hub.card.optional"),
    pillar: pillarLabel(mod.pillar),
    time: mod.time != null ? mod.time : "—",
  }) });
  const children = [
    el("div", { class: "hub-card__top" }, [
      el("span", { class: "hub-card__id", text: mod.id }),
      statusPill(mod.status),
    ]),
    el("h3", { class: "hub-card__name", text: mod.name }),
    meta,
  ];
  if (mod.status === "completed" && mod.quizPct != null) {
    children.push(el("p", { class: "hub-card__quiz", text: t("module.hub.card.quiz", { pct: mod.quizPct }) }));
  }
  children.push(el("button", {
    class: "btn hub-card__cta", type: "button",
    attrs: { "aria-label": t("module.hub.cta.aria", { cta: t(CTA_KEY[mod.status] || CTA_KEY.available), moduleId: mod.id, moduleName: mod.name }) },
    on: { click: () => onSelectModule(mod.id) },
  }, [t(CTA_KEY[mod.status] || CTA_KEY.available)]));
  return el("article", { class: `hub-card status--${mod.status}` }, children);
}

/** Karta testu końcowego: zablokowany (powód, bez akcji) / dostępny (CTA) / zaliczony (zobacz wynik). */
function finalTestCard(finalTest, onSelectFinalTest) {
  const status = finalTest.passed ? "completed" : finalTest.status === "locked" ? "locked" : "available";
  const children = [
    el("div", { class: "hub-card__top" }, [
      el("span", { class: "hub-card__id", attrs: { "aria-hidden": "true" } }, [icon(finalTest.status === "locked" ? "lock" : "play")]),
      statusPill(status),
    ]),
    el("h3", { class: "hub-card__name", text: t("nav.finalTest.label") }),
  ];
  if (finalTest.status === "locked" && !finalTest.passed) {
    const reason = lockedReasonText(finalTest);
    if (reason) children.push(el("p", { class: "hub-card__meta", text: reason }));
    children.push(el("button", {
      class: "btn hub-card__cta", type: "button", disabled: true,
      attrs: { "aria-disabled": "true", title: reason },
    }, [t("nav.status.locked")]));
  } else {
    const ctaKey = finalTest.passed ? "action.viewResult" : "module.hub.finalTest.cta";
    children.push(el("button", {
      class: "btn hub-card__cta", type: "button",
      on: { click: () => onSelectFinalTest() },
    }, [t(ctaKey)]));
  }
  return el("article", { class: `hub-card hub-card--final status--${status}` }, children);
}

/**
 * Renderuje hub modułów do wstawienia w głównym widoku.
 * @param {object} cfg { pathId, pathName, nextStep, modules[], finalTest, onSelectModule, onSelectFinalTest }
 * @returns {HTMLElement} węzeł .view__content
 */
export function renderModuleHub(cfg) {
  const { pathId, pathName, nextStep, modules, finalTest, onSelectModule, onSelectFinalTest } = cfg;
  const grid = el("div", { class: "hub-grid" }, modules.map((m) => moduleCard(m, onSelectModule)));
  grid.appendChild(finalTestCard(finalTest, onSelectFinalTest));
  // hub-view zdejmuje limit szerokości .view__content (70ch) — siatka kart ma wykorzystać pełną kolumnę.
  return el("div", { class: "view__content hub-view" }, [
    el("h1", { text: pathName
      ? t("module.menu.heading", { pathId, pathName })
      : t("nav.header.pathIndicator", { pathId }) }),
    el("p", { class: "muted", text: t("module.menu.intro") }),
    nextStep
      ? el("div", { class: "next-step", attrs: { role: "status" } }, [
          el("span", { class: "next-step__icon", attrs: { "aria-hidden": "true" } }, [icon("info")]),
          nextStep,
        ])
      : null,
    el("h2", { class: "hub-section-heading", text: t("nav.heading.modules") }),
    grid,
  ]);
}
