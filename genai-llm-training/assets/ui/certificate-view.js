// certificate-view.js — ekran zaliczenia i eksport wyniku (issue #19).
// Certyfikat tylko przy zaliczeniu (model z core/certificate.js). Eksport JSON/CSV jako pobranie pliku.
import { el } from "./dom.js";
import { exportJson, exportCsv } from "../core/certificate.js";

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = el("a", { href: url, attrs: { download: filename } });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function weakAreasBlock(weakAreas) {
  if (!weakAreas || weakAreas.length === 0) return null;
  return el("section", {}, [
    el("h2", { text: "Do powtórzenia" }),
    el("ul", { class: "weak-list" }, weakAreas.map((w) =>
      el("li", { text: `${w.module} — ${w.name}${w.pct != null ? ` (${w.pct}%)` : ""}` }))),
  ]);
}

function exportButtons(progress, pathName) {
  const json = el("button", { class: "btn btn--ghost", type: "button", text: "Pobierz wynik (JSON)",
    on: { click: () => download(`wynik-${progress.path}.json`, exportJson(progress, { pathName }), "application/json") } });
  const csv = el("button", { class: "btn btn--ghost", type: "button", text: "Pobierz wynik (CSV)",
    on: { click: () => download(`wynik-${progress.path}.csv`, exportCsv(progress, { pathName }), "text/csv") } });
  return el("div", { class: "btn-row" }, [json, csv]);
}

/**
 * @param {object} cert - model z buildCertificate
 * @param {object} opts - { progress, pathName, canRetry, attemptInfo, onRetry, onBack }
 */
export function renderResult(cert, opts = {}) {
  const root = el("div", { class: "view__content" });
  const { progress, pathName } = opts;

  if (cert.issued) {
    root.appendChild(el("h1", { text: "Gratulacje — ścieżka zaliczona" }));
    const card = el("section", { class: "certificate" }, [
      el("p", { class: "muted", text: "Certyfikat ukończenia" }),
      cert.displayName ? el("div", { class: "cert-row" }, [el("span", { text: "Uczestnik" }), el("strong", { text: cert.displayName })]) : null,
      el("div", { class: "cert-row" }, [el("span", { text: "Ścieżka" }), el("strong", { text: `${pathName || cert.path} (${cert.path})` })]),
      el("div", { class: "cert-row" }, [el("span", { text: "Wynik" }), el("strong", { text: `${cert.scorePct}%` })]),
      el("div", { class: "cert-row" }, [el("span", { text: "Data" }), el("strong", { text: (cert.date || "").slice(0, 10) })]),
      el("div", { class: "cert-row" }, [el("span", { text: "ID zaliczenia" }), el("span", { class: "certificate__id", text: cert.completionId })]),
    ]);
    root.appendChild(card);
    if (progress) root.appendChild(exportButtons(progress, pathName));
    const wa = weakAreasBlock(cert.weakAreas);
    if (wa) root.appendChild(wa);
  } else {
    root.appendChild(el("h1", { text: "Wynik poniżej progu" }));
    root.appendChild(el("p", { attrs: { role: "alert" }, text: `${cert.reason} Twój wynik: ${cert.scorePct}%.` }));
    const wa = weakAreasBlock(cert.weakAreas);
    if (wa) root.appendChild(wa);
    if (progress) root.appendChild(exportButtons(progress, pathName));
    if (opts.attemptInfo) root.appendChild(el("p", { class: "quiz-meta", text: opts.attemptInfo }));
    if (opts.canRetry && typeof opts.onRetry === "function") {
      root.appendChild(el("div", { class: "btn-row" }, [
        el("button", { class: "btn", type: "button", text: "Podejdź ponownie", on: { click: opts.onRetry } }),
      ]));
    } else if (!opts.canRetry) {
      root.appendChild(el("p", { class: "muted", text: "Wykorzystano wszystkie podejścia do testu." }));
    }
  }

  if (typeof opts.onBack === "function") {
    root.appendChild(el("div", { class: "btn-row" }, [
      el("button", { class: "btn btn--ghost", type: "button", text: "Wróć do modułów", on: { click: opts.onBack } }),
    ]));
  }
  return root;
}
