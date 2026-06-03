// tune-view.js — render interakcji "strojenie parametrów" (M2/M3/M5). Parametry jako natywne <select>
// (klawiatura: strzałki; design-baseline §6). Panel outputu aktualizuje się na żywo z AUTORSKICH efektów
// poziomów (aria-live — czytnik ekranu ogłasza zmianę). Checkpoint (radio/checkbox) jest scorowany.
import { el } from "../dom.js";
import { icon } from "../icon.js";

export function renderTune(config) {
  const controls = config.controls || [];
  const selects = []; // { control, sel }

  const outPanel = el("div", { class: "tune-output", attrs: { role: "status", "aria-live": "polite" } });

  const renderOutput = () => {
    const lines = selects.map(({ control, sel }) => {
      const lvl = (control.levels || [])[Number(sel.value)] || {};
      return el("div", { class: "tune-output__row" }, [
        el("strong", { text: `${control.label}: ${lvl.label || "—"}` }),
        lvl.effect ? el("p", { text: lvl.effect }) : null,
      ]);
    });
    outPanel.replaceChildren(
      el("p", { class: "muted", text: config.outputLabel || "Wynik dla wybranych ustawień:" }),
      ...lines,
    );
  };

  const controlNodes = controls.map((control) => {
    const id = `tune-${config.id || "ix"}-${control.id}`;
    const sel = el("select", { id, attrs: { "aria-label": control.label } },
      (control.levels || []).map((lvl, i) => el("option", { value: String(i), text: lvl.label })));
    sel.addEventListener("change", renderOutput);
    selects.push({ control, sel });
    return el("div", { class: "tune-control" }, [el("label", { attrs: { for: id }, text: control.label }), sel]);
  });

  // Checkpoint scorowany (jedyny element oceniany przez evaluator).
  const cp = config.checkpoint || {};
  const cpMultiple = cp.type === "multiple_choice";
  const cpInputs = [];
  const cpName = `tune-${config.id || "ix"}-cp`;
  const cpOptions = (cp.options || []).map((o) => {
    const id = `${cpName}-${o.id}`;
    const input = el("input", { type: cpMultiple ? "checkbox" : "radio", name: cpName, id, value: o.id });
    cpInputs.push(input);
    return el("li", { class: "option" }, [input, el("label", { attrs: { for: id }, text: o.text })]);
  });
  const cpFb = el("div", { class: "tune-checkpoint__fb" });
  const checkpointNode = el("fieldset", { class: "tune-checkpoint" }, [
    el("legend", { class: "quiz-question__prompt", text: cp.prompt || "Checkpoint" }),
    el("ul", { class: "options" }, cpOptions),
    cpFb,
  ]);

  const node = el("div", { class: "interaction interaction--tune" }, [
    config.intro ? el("p", { text: config.intro }) : null,
    el("div", { class: "tune-controls" }, controlNodes),
    outPanel,
    checkpointNode,
  ]);

  renderOutput(); // stan początkowy

  const getResponse = () => {
    const picked = cpInputs.filter((i) => i.checked).map((i) => i.value);
    return {
      params: Object.fromEntries(selects.map(({ control, sel }) => [control.id, Number(sel.value)])),
      checkpoint: cpMultiple ? picked : picked[0] ?? null,
    };
  };

  const showFeedback = (result) => {
    const ok = result.checkpointCorrect;
    cpFb.replaceChildren(el("div", { class: `feedback ${ok ? "feedback--correct" : "feedback--incorrect"}`, attrs: { role: "status" } }, [
      el("p", { class: "feedback__head" }, [el("span", { attrs: { "aria-hidden": "true" } }, [icon(ok ? "check" : "cross")]), ok ? "Poprawnie" : "Niepoprawnie"]),
      el("p", { text: ok ? (cp.feedbackCorrect || "") : (cp.feedbackIncorrect || "") }),
    ]));
  };

  return { node, getResponse, showFeedback, focusFirst: () => selects[0]?.sel.focus() };
}
