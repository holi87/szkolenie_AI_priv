// certificate-view.js — ekran zaliczenia jako NAGRODA + eksport wyniku (issue #19, redesign UX-5 #74).
// Certyfikat tylko przy zaliczeniu (model z core/certificate.js). Eksport JSON/CSV jako pobranie pliku.
// Kontrakt certificate.js (issued/completionId/eksporty) NIETKNIĘTY — zmiana jest wyłącznie prezentacyjna.
import { el } from "./dom.js";
import { icon } from "./icon.js";
import { t } from "../i18n/i18n.js";
import { exportJson, exportCsv, exportQuestionStatsCsv } from "../core/certificate.js";

const SVG_NS = "http://www.w3.org/2000/svg";

// Rozwiązanie KODU powodu niezaliczenia z core (certificate.js zwraca kod, nie prozę — ADR-0004, core zero-i18n).
// Świadomie NIE renderowane (powód był i pozostaje niewidoczny — visible output bez regresji), ale obecne i testowalne.
const CERT_REASON_LABEL = {
  below_pass_threshold: () => t("cert.reason.below_pass_threshold"),
};
export function certReasonText(reasonCode) {
  const resolve = CERT_REASON_LABEL[reasonCode];
  return resolve ? resolve() : "";
}

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = el("a", { href: url, attrs: { download: filename } });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Dekoracyjny medal (inline SVG, aria-hidden, zero CDN). Kolor przez currentColor (CSS: akcent). */
function medal() {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 48 48");
  svg.setAttribute("width", "60");
  svg.setAttribute("height", "60");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("class", "certificate__medal-svg");
  const add = (tag, attrs) => {
    const n = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    svg.appendChild(n);
    return n;
  };
  add("path", { d: "M17 27 L11 45 L20 41 L24 47 L28 41 L37 45 L31 27 Z", fill: "currentColor", opacity: "0.45" }); // wstążki
  add("circle", { cx: "24", cy: "18", r: "15", fill: "currentColor" });                                          // krążek
  add("circle", { cx: "24", cy: "18", r: "11", fill: "none", stroke: "#ffffff", "stroke-width": "1.4", opacity: "0.7" });
  add("path", { d: "M24 9 l2.9 6 6.6 .9 -4.8 4.6 1.2 6.5 -5.9 -3.1 -5.9 3.1 1.2 -6.5 -4.8 -4.6 6.6 -.9 Z", fill: "#ffffff" }); // gwiazda
  return el("figure", { class: "certificate__medal", attrs: { "aria-hidden": "true" } }, [svg]);
}

const GATE_LABEL = {
  overallThreshold: () => t("cert.gate.overallThreshold"),
  criticalQuestions: (g) => t("cert.gate.criticalQuestions", { module: g.module }),
  practicalTask: (g) => t("cert.gate.practicalTask", { rubric: g.rubric }),
  moduleMinScore: (g) => t("cert.gate.moduleMinScore", { module: g.module, rubric: g.rubric }),
};

/** Lista bramek zaliczenia ze statusem — pokazuje, dlaczego ścieżka (nie)zaliczona, mimo wyniku %.
    Status niesie ikona + SŁOWO (spełniona/niespełniona); kolor to wzmocnienie, nie jedyny nośnik (WCAG 1.4.1). */
function gatesBlock(gates) {
  if (!gates || gates.length === 0) return null;
  return el("section", { class: "cert-gates" }, [
    el("h2", { text: t("cert.gates.heading") }),
    el("ul", { class: "cert-gates__list" }, gates.map((g) => {
      const label = (GATE_LABEL[g.type] || (() => g.type))(g);
      const status = g.passed ? t("cert.gate.status.ok") : t("cert.gate.status.fail");
      return el("li", { class: `cert-gate cert-gate--${g.passed ? "ok" : "fail"}` }, [
        el("span", { class: "cert-gate__icon", attrs: { "aria-hidden": "true" } }, [icon(g.passed ? "check" : "cross")]),
        `${status} — ${label}${g.detail ? `: ${g.detail}` : ""}`,
      ]);
    })),
  ]);
}

function weakAreasBlock(weakAreas) {
  if (!weakAreas || weakAreas.length === 0) return null;
  return el("section", {}, [
    el("h2", { text: t("cert.weakAreas.heading") }),
    el("ul", { class: "weak-list" }, weakAreas.map((w) =>
      el("li", { text: `${w.module} — ${w.name}${w.pct != null ? ` (${w.pct}%)` : ""}` }))),
  ]);
}

function exportButtons(progress, pathName) {
  const json = el("button", { class: "btn btn--ghost", type: "button", text: t("action.exportJson"),
    on: { click: () => download(`wynik-${progress.path}.json`, exportJson(progress, { pathName }), "application/json") } });
  const csv = el("button", { class: "btn btn--ghost", type: "button", text: t("action.exportCsv"),
    on: { click: () => download(`wynik-${progress.path}.csv`, exportCsv(progress, { pathName }), "text/csv") } });
  // Per-pytanie (anonimowo) — sygnał do kalibracji pilotażu (#28). Bez PII; do odesłania koordynatorowi.
  const qstats = el("button", { class: "btn btn--ghost", type: "button", text: t("action.exportQuestionStatsCsv"),
    on: { click: () => download(`pytania-${progress.path}.csv`, exportQuestionStatsCsv(progress), "text/csv") } });
  return el("div", { class: "btn-row btn-row--export" }, [json, csv, qstats]);
}

// Notka wyniku niezaliczenia: szablon z placeholderem {score}, rozbity tak, by % zostało w <strong>
// (kontrast/wizualnie jak dawniej), a kolejność słów była tłumaczalna (EN może mieć % w środku zdania).
function failNotice(scorePct, hasGates) {
  const tmpl = t(hasGates ? "cert.failed.notice.withGates" : "cert.failed.notice.noGates");
  const [before, after = ""] = tmpl.split("{score}");
  return el("div", { class: "result-notice result-notice--fail", attrs: { role: "alert" } }, [
    before || null,
    el("strong", { class: "result-notice__score", text: `${scorePct}%` }),
    after ? el("span", { text: after }) : null,
  ]);
}

/**
 * @param {object} cert - model z buildCertificate
 * @param {object} opts - { progress, pathName, canRetry, attemptInfo, onRetry, onBack }
 */
export function renderResult(cert, opts = {}) {
  const root = el("div", { class: "view__content" });
  const { progress, pathName } = opts;

  if (cert.issued) {
    root.appendChild(el("h1", { text: t("cert.passed.heading") }));
    // Karta-nagroda: gradientowa ramka (.certificate) + solidne wnętrze (.certificate__inner, kontrast tekstu OK).
    const inner = el("div", { class: "certificate__inner" }, [
      medal(),
      el("p", { class: "certificate__eyebrow", text: t("cert.eyebrow") }),
      el("p", { class: "certificate__score" }, [
        el("strong", { class: "certificate__score-value", text: `${cert.scorePct}%` }),
        el("span", { class: "certificate__score-label", text: t("cert.score.label") }),
      ]),
      cert.displayName ? el("div", { class: "cert-row" }, [el("span", { text: t("cert.row.participant") }), el("strong", { text: cert.displayName })]) : null,
      el("div", { class: "cert-row" }, [el("span", { text: t("cert.row.path") }), el("strong", { text: `${pathName || cert.path} (${cert.path})` })]),
      el("div", { class: "cert-row" }, [el("span", { text: t("cert.row.date") }), el("strong", { text: (cert.date || "").slice(0, 10) })]),
      el("div", { class: "cert-row" }, [el("span", { text: t("cert.row.completionId") }), el("span", { class: "certificate__id", text: cert.completionId })]),
    ]);
    root.appendChild(el("section", { class: "certificate certificate--issued" }, [inner]));
    const gIssued = gatesBlock(opts.gates);
    if (gIssued) root.appendChild(gIssued);
    if (progress) root.appendChild(exportButtons(progress, pathName));
    const wa = weakAreasBlock(cert.weakAreas);
    if (wa) root.appendChild(wa);
  } else {
    root.appendChild(el("h1", { text: t("cert.failed.heading") }));
    // cert.scorePct to WAŻONY wynik ścieżki (quiz inline + test + praktyka), nie sam wynik testu.
    // "spełnij bramki poniżej" tylko gdy lista bramek faktycznie jest renderowana (gates dostępne).
    const gFail = gatesBlock(opts.gates);
    root.appendChild(failNotice(cert.scorePct, Boolean(gFail)));
    if (gFail) root.appendChild(gFail);
    const wa = weakAreasBlock(cert.weakAreas);
    if (wa) root.appendChild(wa);
    if (progress) root.appendChild(exportButtons(progress, pathName));
    if (opts.attemptInfo) root.appendChild(el("p", { class: "quiz-meta", text: opts.attemptInfo }));
    if (opts.canRetry && typeof opts.onRetry === "function") {
      root.appendChild(el("div", { class: "btn-row" }, [
        el("button", { class: "btn", type: "button", text: t("action.retry"), on: { click: opts.onRetry } }),
      ]));
    } else if (!opts.canRetry) {
      root.appendChild(el("p", { class: "muted", text: t("test.allAttemptsUsed") }));
    }
  }

  if (typeof opts.onBack === "function") {
    root.appendChild(el("div", { class: "btn-row" }, [
      el("button", { class: "btn btn--ghost", type: "button", text: t("action.backToModules"), on: { click: opts.onBack } }),
    ]));
  }
  return root;
}
