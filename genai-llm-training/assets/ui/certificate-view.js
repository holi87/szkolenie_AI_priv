// certificate-view.js — ekran WYNIKU ścieżki + eksport (issue #19; M12-2 #93: certyfikat usunięty).
// M12-2: zniesiono artefakt certyfikatu (medal, completionId, pseudonim, framing „certyfikat/CERT-").
// Zostaje wartość formatywna: wynik %, status zaliczenia (badge ikona+słowo — WCAG 1.4.1, nie sam kolor),
// status bramek, słabe obszary, retry, eksport JSON/CSV (anonimowy). Nazwa pliku zachowana (stabilność importów).
import { el } from "./dom.js";
import { icon } from "./icon.js";
import { t } from "../i18n/i18n.js";
import { exportJson, exportCsv, exportQuestionStatsCsv } from "../core/certificate.js";

// Rozwiązanie KODU powodu niezaliczenia z core (certificate.js zwraca kod, nie prozę — ADR-0004, core zero-i18n).
// Świadomie NIE renderowane (powód był i pozostaje niewidoczny — visible output bez regresji), ale obecne i testowalne.
const RESULT_REASON_LABEL = {
  below_pass_threshold: () => t("result.reason.below_pass_threshold"),
};
export function certReasonText(reasonCode) {
  const resolve = RESULT_REASON_LABEL[reasonCode];
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

const GATE_LABEL = {
  overallThreshold: () => t("result.gate.overallThreshold"),
  criticalQuestions: (g) => t("result.gate.criticalQuestions", { module: g.module }),
  practicalTask: (g) => t("result.gate.practicalTask", { rubric: g.rubric }),
  moduleMinScore: (g) => t("result.gate.moduleMinScore", { module: g.module, rubric: g.rubric }),
};

/** Lista bramek zaliczenia ze statusem — pokazuje, dlaczego ścieżka (nie)zaliczona, mimo wyniku %.
    Status niesie ikona + SŁOWO (spełniona/niespełniona); kolor to wzmocnienie, nie jedyny nośnik (WCAG 1.4.1). */
function gatesBlock(gates) {
  if (!gates || gates.length === 0) return null;
  return el("section", { class: "cert-gates" }, [
    el("h2", { text: t("result.gates.heading") }),
    el("ul", { class: "cert-gates__list" }, gates.map((g) => {
      const label = (GATE_LABEL[g.type] || (() => g.type))(g);
      const status = g.passed ? t("result.gate.status.ok") : t("result.gate.status.fail");
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
    el("h2", { text: t("result.weakAreas.heading") }),
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

/** Status zaliczenia jako badge: ikona (dekoracyjna) + SŁOWO (nośnik). Odróżnia PASS od FAIL bez medalu (WCAG 1.4.1). */
function passBadge() {
  return el("p", { class: "result-status result-status--pass" }, [
    el("span", { class: "result-status__icon", attrs: { "aria-hidden": "true" } }, [icon("check")]),
    el("span", { class: "result-status__label", text: t("result.passed.badge") }),
  ]);
}

/** Duży wynik % + etykieta (centerpiece ekranu Wynik, zarówno PASS jak i FAIL). */
function scoreBlock(scorePct) {
  return el("p", { class: "result__score" }, [
    el("strong", { class: "result__score-value", text: `${scorePct}%` }),
    el("span", { class: "result__score-label", text: t("result.score.label") }),
  ]);
}

// Notka wyniku niezaliczenia: szablon z placeholderem {score}, rozbity tak, by % zostało w <strong>
// (kontrast/wizualnie jak dawniej), a kolejność słów była tłumaczalna (EN może mieć % w środku zdania).
function failNotice(scorePct, hasGates) {
  const tmpl = t(hasGates ? "result.failed.notice.withGates" : "result.failed.notice.noGates");
  const [before, after = ""] = tmpl.split("{score}");
  return el("div", { class: "result-notice result-notice--fail", attrs: { role: "alert" } }, [
    before || null,
    el("strong", { class: "result-notice__score", text: `${scorePct}%` }),
    after ? el("span", { text: after }) : null,
  ]);
}

/**
 * @param {object} result - model z buildResult ({ passed, scorePct, weakAreas, reason? })
 * @param {object} opts - { progress, pathName, gates, canRetry, attemptInfo, onRetry, onBack }
 */
export function renderResult(result, opts = {}) {
  const root = el("div", { class: "view__content" });
  const { progress, pathName } = opts;

  if (result.passed) {
    root.appendChild(el("h1", { text: t("result.passed.heading") }));
    root.appendChild(passBadge());
    root.appendChild(scoreBlock(result.scorePct));
    const gIssued = gatesBlock(opts.gates);
    if (gIssued) root.appendChild(gIssued);
    if (progress) root.appendChild(exportButtons(progress, pathName));
    const wa = weakAreasBlock(result.weakAreas);
    if (wa) root.appendChild(wa);
  } else {
    root.appendChild(el("h1", { text: t("result.failed.heading") }));
    // result.scorePct to WAŻONY wynik ścieżki (quiz inline + test + praktyka), nie sam wynik testu.
    // "spełnij bramki poniżej" tylko gdy lista bramek faktycznie jest renderowana (gates dostępne).
    const gFail = gatesBlock(opts.gates);
    root.appendChild(failNotice(result.scorePct, Boolean(gFail)));
    if (gFail) root.appendChild(gFail);
    const wa = weakAreasBlock(result.weakAreas);
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
