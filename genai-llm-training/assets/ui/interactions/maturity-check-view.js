// maturity-check-view.js — render autodiagnozy „Skala Holaka" (MSHP/MSHO / M14, ADR-0008; rozdzielone M16/#122).
// NON-gating, NEUTRALNY: zero kolorów pass/fail (klasa „feedback" bez --correct/--incorrect), zero słowa „zaliczone".
// Skale 0–11 (MSHP: osoba; MSHO: organizacja) jako grupy checkboxów — w pełni klawiaturowe (WCAG 1.3.1/2.1.1).
// Po sprawdzeniu: orientacyjny poziom + „gdzie jesteś / jak wejść wyżej" (label + advice z band w per-locale mshp/msho.json).
import { el } from "../dom.js";
import { icon } from "../icon.js";
import { t } from "../../i18n/i18n.js";

export function renderMaturityCheck(config) {
  const scales = config.scales || [];
  const groups = []; // { scaleId, inputs:[{id,input}], fbNode }
  const firstInputs = [];

  const scaleBlocks = scales.map((sc) => {
    const inputs = [];
    const rows = (sc.statements || []).map((st) => {
      const id = `msh-${config.id || "ix"}-${sc.id}-${st.id}`;
      const input = el("input", { type: "checkbox", id, value: st.id });
      inputs.push({ id: st.id, input });
      return el("li", { class: "option option--inline" }, [input, el("label", { attrs: { for: id }, text: st.text })]);
    });
    if (inputs[0]) firstInputs.push(inputs[0].input);
    const fbNode = el("div", { class: "maturity-scale__fb" });
    groups.push({ scaleId: sc.id, inputs, fbNode });
    return el("fieldset", { class: "maturity-scale" }, [
      el("legend", { class: "maturity-scale__label", text: sc.label }),
      sc.intro ? el("p", { class: "muted", text: sc.intro }) : null,
      el("ul", { class: "maturity-scale__items", attrs: { "aria-label": t("maturity.statementsLegend") } }, rows),
      fbNode,
    ]);
  });

  const node = el("div", { class: "interaction interaction--maturity" }, [
    config.intro ? el("p", { text: config.intro }) : null,
    el("p", { class: "muted", text: t("maturity.disclaimer") }),
    ...scaleBlocks,
  ]);

  const getResponse = () => {
    const r = {};
    for (const g of groups) {
      const picked = {};
      for (const it of g.inputs) if (it.input.checked) picked[it.id] = true;
      r[g.scaleId] = picked;
    }
    return r;
  };

  // NEUTRALNY feedback: klasa „feedback" (bez --correct/--incorrect), ikona informacyjna, brak słowa „zaliczone".
  const showFeedback = (result) => {
    const byId = new Map((result.scales || []).map((s) => [s.id, s]));
    for (const g of groups) {
      const s = byId.get(g.scaleId);
      if (!s) continue;
      const band = s.band || {};
      g.fbNode.replaceChildren(el("div", { class: "feedback", attrs: { role: "status" } }, [
        el("p", { class: "feedback__head" }, [
          el("span", { attrs: { "aria-hidden": "true" } }, [icon("info")]),
          t("maturity.level", { level: s.level, max: s.max }),
        ]),
        band.label ? el("p", {}, [el("strong", { text: band.label })]) : null,
        band.advice ? el("p", {}, [el("strong", { text: t("maturity.howToLevelUp") }), ` ${band.advice}`]) : null,
      ]));
    }
  };

  return { node, getResponse, showFeedback, focusFirst: () => firstInputs[0]?.focus() };
}
