// rubric-view.js — render interakcji "rubryka" (M6/M7/M8/M12). Każde kryterium to fieldset z legendą
// (pytanie) i polami wyboru (checkbox — kryterium może mieć wiele poprawnych opcji). W pełni klawiaturowe
// (design-baseline §6). Feedback per kryterium (ikona SVG + słowo + podpowiedź) + wynik zbiorczy z progiem (zadanie praktyczne).
import { el } from "../dom.js";
import { icon } from "../icon.js";
import { t } from "../../i18n/i18n.js";

export function renderRubric(config) {
  const criteria = config.criteria || [];
  const groups = []; // { id, inputs:[], fbNode }
  const firstInputs = [];

  const rows = criteria.map((c, i) => {
    const name = `rub-${config.id || "ix"}-${c.id}`;
    const inputs = [];
    const opts = (c.options || []).map((o) => {
      const id = `${name}-${o.id}`;
      const input = el("input", { type: "checkbox", name, id, value: o.id });
      inputs.push(input);
      return el("li", { class: "option" }, [input, el("label", { attrs: { for: id }, text: o.text })]);
    });
    if (inputs[0]) firstInputs.push(inputs[0]);
    const fbNode = el("div", { class: "rubric-crit__fb" });
    groups.push({ id: c.id, inputs, fbNode });
    return el("fieldset", { class: "rubric-crit" }, [
      el("legend", { class: "rubric-crit__name" }, [el("strong", { text: t("interaction.rubric.criterionName", { index: i + 1, name: c.name }) })]),
      c.prompt ? el("p", { class: "rubric-crit__prompt", text: c.prompt }) : null,
      el("ul", { class: "options" }, opts),
      fbNode,
    ]);
  });

  const node = el("div", { class: "interaction interaction--rubric" }, [
    config.intro ? el("p", { text: config.intro }) : null,
    ...rows,
  ]);

  const getResponse = () => {
    const r = {};
    for (const g of groups) r[g.id] = g.inputs.filter((inp) => inp.checked).map((inp) => inp.value);
    return r;
  };

  const showFeedback = (result) => {
    const byId = new Map(result.perCriterion.map((p) => [p.id, p]));
    for (const g of groups) {
      const p = byId.get(g.id);
      if (!p) continue;
      const cls = p.satisfied ? "feedback feedback--correct" : "feedback feedback--incorrect";
      g.fbNode.replaceChildren(el("div", { class: cls, attrs: { role: "status" } }, [
        el("p", { class: "feedback__head" }, [el("span", { attrs: { "aria-hidden": "true" } }, [icon(p.satisfied ? "check" : "cross")]), p.satisfied ? t("feedback.satisfied") : t("feedback.notSatisfied")]),
        p.satisfied ? null : el("p", { text: p.hint || t("interaction.rubric.defaultHint") }),
      ]));
    }
  };

  return { node, getResponse, showFeedback, focusFirst: () => firstInputs[0]?.focus() };
}
