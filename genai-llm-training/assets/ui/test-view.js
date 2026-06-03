// test-view.js — przebieg testu końcowego (issue #18).
// Tryb testu (design-baseline §2.2): BRAK feedbacku i podpowiedzi do zakończenia podejścia.
// Renderuje wszystkie wylosowane pytania, zbiera odpowiedzi, oddaje je do scoringu (callback onSubmit).
import { el } from "./dom.js";
import { icon } from "./icon.js";
import { renderQuestion } from "./quiz-view.js";

/**
 * @param {object} selection - wynik selectFinalTest
 * @param {object} opts - { pathName, path, passThresholdPct, attemptInfo, rng?, onSubmit({answers, rubricPointsById}) }
 *   rng opcjonalny — wstrzykiwalny generator do deterministycznego tasowania pozycji opcji w testach (#66).
 * @returns {HTMLElement}
 */
export function renderTest(selection, opts = {}) {
  const controls = [];
  const form = el("form", { class: "view__content", attrs: { novalidate: "" } });

  form.appendChild(el("h1", { text: `Test końcowy — ${opts.pathName || selection.pathId}` }));
  form.appendChild(el("p", { class: "muted", text: `${selection.count} pytań · próg zaliczenia ${opts.passThresholdPct ?? "?"}% · wszystkie pytania krytyczne muszą być poprawne.` }));
  form.appendChild(el("p", { class: "locked-note", attrs: { role: "note" } }, [
    el("span", { class: "locked-note__icon", attrs: { "aria-hidden": "true" } }, [icon("info")]),
    "Tryb testu: feedback i wynik pojawią się dopiero po zakończeniu podejścia.",
  ]));
  if (opts.attemptInfo) form.appendChild(el("p", { class: "quiz-meta", text: opts.attemptInfo }));
  if (opts.practicalNote) {
    form.appendChild(el("p", { class: "locked-note", attrs: { role: "note" } }, [
      el("span", { class: "locked-note__icon", attrs: { "aria-hidden": "true" } }, [icon("warn")]), opts.practicalNote,
    ]));
  }

  const rng = typeof opts.rng === "function" ? opts.rng : undefined; // domyślnie natywny (renderQuestion -> Math.random)
  selection.questions.forEach((q, i) => {
    const r = renderQuestion(q, { index: i, total: selection.count, showMeta: true, rng });
    controls.push({ q, r });
    form.appendChild(r.node);
  });

  const status = el("p", { class: "muted", attrs: { role: "status", "aria-live": "polite" } });
  const submit = el("button", { class: "btn", type: "submit", text: "Zakończ podejście i sprawdź wynik" });
  form.appendChild(el("div", { class: "btn-row" }, [submit]));
  form.appendChild(status);

  const isAnswered = (r) => {
    const a = r.getAnswer();
    if (Array.isArray(a)) return a.length > 0;
    if (a && typeof a === "object") return Object.keys(a).length > 0; // puste dopasowanie {} = brak odpowiedzi
    if (a != null) return true;
    return r.getRubricPoints ? r.getRubricPoints() != null : false; // analiza_outputu: ocena rubryki
  };

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const answered = controls.filter(({ r }) => isAnswered(r)).length;
    if (answered < selection.count) {
      const ok = globalThis.confirm(`Odpowiedziałeś na ${answered} z ${selection.count} pytań. Brakujące będą liczone jako błędne. Zakończyć podejście?`);
      if (!ok) return;
    }
    const answers = {};
    const rubricPointsById = {};
    for (const { q, r } of controls) {
      answers[q.id] = r.getAnswer();
      if (r.getRubricPoints) { const rp = r.getRubricPoints(); if (rp != null) rubricPointsById[q.id] = rp; }
    }
    if (typeof opts.onSubmit === "function") opts.onSubmit({ answers, rubricPointsById });
  });

  return form;
}
