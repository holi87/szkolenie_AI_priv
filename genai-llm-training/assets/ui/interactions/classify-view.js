// classify-view.js — render interakcji "klasyfikacja" (M4). Wariant w pełni klawiaturowy:
// każdy element to lista z grupą radio kategorii (design-baseline §6 — alternatywa dla drag&drop).
// Feedback tekstowy per element (nie sam kolor, WCAG 1.4.1): ✓/✗ + uzasadnienie.
import { el } from "../dom.js";

export function renderClassify(config) {
  const items = config.items || [];
  const categories = config.categories || [];
  const groups = []; // { itemId, inputs:[], fbNode }
  const firstInputs = [];

  const legend = categories.length
    ? el("div", { class: "classify-legend" }, [
        el("p", { class: "muted", text: "Kategorie:" }),
        el("ul", {}, categories.map((c) => el("li", {}, [el("strong", { text: c.label }), c.desc ? ` — ${c.desc}` : null]))),
      ])
    : null;

  const rows = items.map((it, i) => {
    const name = `cls-${config.id || "ix"}-${it.id}`;
    const inputs = [];
    const opts = categories.map((c) => {
      const id = `${name}-${c.id}`;
      const input = el("input", { type: "radio", name, id, value: c.id });
      inputs.push(input);
      return el("span", { class: "option option--inline" }, [input, el("label", { attrs: { for: id }, text: c.label })]);
    });
    if (inputs[0]) firstInputs.push(inputs[0]);
    const fbNode = el("div", { class: "classify-item__fb" });
    groups.push({ itemId: it.id, inputs, fbNode });
    return el("fieldset", { class: "classify-item" }, [
      el("legend", { class: "classify-item__text", text: `${i + 1}. ${it.text}` }),
      el("div", { class: "classify-item__opts", attrs: { role: "radiogroup", "aria-label": `Kategoria dla: ${it.text}` } }, opts),
      fbNode,
    ]);
  });

  const node = el("div", { class: "interaction interaction--classify" }, [
    config.intro ? el("p", { text: config.intro }) : null,
    legend,
    ...rows,
  ]);

  const getResponse = () => {
    const r = {};
    for (const g of groups) {
      const checked = g.inputs.find((inp) => inp.checked);
      if (checked) r[g.itemId] = checked.value;
    }
    return r;
  };

  const labelOf = (catId) => (categories.find((c) => c.id === catId) || {}).label || catId;

  const showFeedback = (result) => {
    const byId = new Map(result.perItem.map((p) => [p.id, p]));
    for (const g of groups) {
      const p = byId.get(g.itemId);
      if (!p) continue;
      const cls = p.chosen == null ? "feedback" : p.isCorrect ? "feedback feedback--correct" : "feedback feedback--incorrect";
      const head = p.chosen == null ? "○ Brak wyboru" : p.isCorrect ? "✓ Poprawnie" : "✗ Niepoprawnie";
      g.fbNode.replaceChildren(el("div", { class: cls, attrs: { role: "status" } }, [
        el("p", { class: "feedback__head" }, [el("span", { attrs: { "aria-hidden": "true" }, text: p.chosen == null ? "○ " : p.isCorrect ? "✓ " : "✗ " }), head]),
        el("p", { text: p.chosen != null && !p.isCorrect ? `Poprawna kategoria: ${labelOf(p.correct)}. ${p.rationale || ""}` : (p.rationale || `Poprawna kategoria: ${labelOf(p.correct)}.`) }),
      ]));
    }
  };

  return { node, getResponse, showFeedback, focusFirst: () => firstInputs[0]?.focus() };
}
