// quiz-view.js — render pojedynczego pytania + feedback (issue #17).
// Każdy typ ma w pełni klawiaturowy wariant (design-baseline §6): radio/checkbox/select.
// renderQuestion zwraca { node, getAnswer } — getAnswer oddaje kształt odpowiedzi dla quiz-engine.
import { el } from "./dom.js";
import { CRITICAL_FAIL_MESSAGE } from "../core/quiz-engine.js";

const TYPE_LABEL = {
  single_choice: "Wybór jednokrotny",
  multiple_choice: "Wybór wielokrotny",
  dopasowanie: "Dopasowanie",
  kolejnosc_procesu: "Ułóż kolejność",
  scenariusz_decyzyjny: "Scenariusz decyzyjny",
  scenariusz: "Scenariusz",
  analiza_outputu: "Analiza outputu (rubryka)",
};

// Fisher–Yates z wstrzykiwanym rng (czysty — nie mutuje wejścia), wzorzec test-engine.js:14-21.
// Anti-gaming pozycji odpowiedzi (#66): tasujemy DANE przed map(), więc kolejność DOM = wizualna =
// focus/tab/odczyt SR (a11y zachowane). Scoring jest po ID opcji (quiz-engine), więc niezależny od pozycji.
function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Tasuj pozycje opcji, chyba że pytanie ma lockOptionOrder (np. opcje typu „wszystkie powyższe")
// albo opcji <2 / któraś bez id (konserwatywnie: brak tasowania, bez wyjątku).
function ordered(opts, q, rng) {
  if (q.lockOptionOrder || opts.length < 2 || !opts.every((o) => o && typeof o.id === "string" && o.id.length)) return [...opts];
  return shuffle(opts, rng);
}

function choiceList(q, multiple, rng = Math.random) {
  const inputs = [];
  const list = el("ul", { class: "options" }, ordered(q.options || [], q, rng).map((opt) => {
    const id = `${q.id}-${opt.id}`;
    const input = el("input", { type: multiple ? "checkbox" : "radio", name: q.id, id, value: opt.id });
    inputs.push(input);
    return el("li", { class: "option" }, [input, el("label", { attrs: { for: id }, text: opt.text })]);
  }));
  const getAnswer = () => {
    const picked = inputs.filter((i) => i.checked).map((i) => i.value);
    return multiple ? picked : picked[0] ?? null;
  };
  return { node: list, getAnswer, focusFirst: () => inputs[0]?.focus() };
}

function matching(q, rng = Math.random) {
  // Tasuj kolejność „rights" w dropdownie — bez tego wiersz i-ty ma poprawną odpowiedź na i-tej pozycji
  // (gaming po przekątnej). Mapowanie left->right w getAnswer jest po wartości, więc niezależne od kolejności.
  const rights = shuffle([...new Set(q.pairs.map((p) => p.right))], rng);
  const selects = [];
  const rows = q.pairs.map((p, i) => {
    const sel = el("select", { attrs: { "aria-label": `Dopasuj: ${p.left}` } }, [
      el("option", { value: "", text: "— wybierz —" }),
      ...rights.map((r) => el("option", { value: r, text: r })),
    ]);
    selects.push({ left: p.left, sel });
    return el("div", { class: "match-row" }, [el("label", { attrs: { for: `${q.id}-m${i}` }, text: p.left, id: `${q.id}-m${i}` }), sel]);
  });
  const getAnswer = () => Object.fromEntries(selects.filter((s) => s.sel.value).map((s) => [s.left, s.sel.value]));
  return { node: el("div", {}, rows), getAnswer, focusFirst: () => selects[0]?.sel.focus() };
}

// Kolejność prezentacji ZDECYDOWANIE różna od klucza (q.sequence) — inaczej można odtworzyć
// poprawną odpowiedź 1..n z góry na dół bez znajomości procesu (anti-gaming).
// Tasujemy tym samym wstrzykiwanym rng co reszta renderu (#66) — bez podwajania tasowania.
function shuffledForDisplay(items, rng) {
  if (items.length < 2) return [...items];
  const a = shuffle(items, rng);
  if (a.every((v, i) => v === items[i])) a.push(a.shift()); // gdy wypadła kolejność klucza — przesuń
  return a;
}

function sequence(q, rng = Math.random) {
  const n = q.sequence.length;
  const selects = [];
  // Prezentujemy elementy w losowej kolejności; uczestnik nadaje pozycję (1..n) — wariant klawiaturowy.
  const rows = shuffledForDisplay(q.sequence, rng).map((label, i) => {
    const sel = el("select", { attrs: { "aria-label": `Pozycja kroku: ${label}` } }, [
      el("option", { value: "", text: "—" }),
      ...Array.from({ length: n }, (_, k) => el("option", { value: String(k), text: String(k + 1) })),
    ]);
    selects.push({ label, sel });
    return el("div", { class: "seq-row" }, [sel, el("span", { class: "seq-row__pos", text: `krok` }), el("span", { text: label })]);
  });
  const getAnswer = () => {
    const placed = selects.filter((s) => s.sel.value !== "").map((s) => ({ label: s.label, pos: Number(s.sel.value) }));
    placed.sort((a, b) => a.pos - b.pos);
    return placed.map((p) => p.label);
  };
  return { node: el("div", {}, rows), getAnswer, focusFirst: () => selects[0]?.sel.focus() };
}

function rubricSelfRate(q) {
  const ta = el("textarea", { rows: 4, attrs: { "aria-label": "Twoja analiza outputu", style: "width:100%" } });
  const radios = [];
  const scale = el("fieldset", {}, [
    el("legend", { text: "Samoocena wg rubryki (0–3)" }),
    ...[0, 1, 2, 3].map((v) => {
      const id = `${q.id}-r${v}`;
      const input = el("input", { type: "radio", name: `${q.id}-rubric`, id, value: String(v) });
      radios.push(input);
      return el("span", { class: "option" }, [input, el("label", { attrs: { for: id }, text: String(v) })]);
    }),
  ]);
  const getAnswer = () => null; // ocena wraca przez rubricPoints
  const getRubricPoints = () => {
    const r = radios.find((x) => x.checked);
    return r ? Number(r.value) : null;
  };
  return { node: el("div", {}, [ta, scale]), getAnswer, getRubricPoints, focusFirst: () => ta.focus() };
}

/**
 * Renderuje pytanie. opts: { index, total, showMeta, rng }.
 * rng (domyślnie Math.random) — wstrzykiwalny generator do tasowania pozycji opcji (#66);
 * jedno losowanie na instancję pytania (renderQuestion wołane raz), stabilne przy re-renderze feedbacku.
 * @returns {{node, getAnswer, getRubricPoints?, focusFirst}}
 */
export function renderQuestion(question, opts = {}) {
  const rng = typeof opts.rng === "function" ? opts.rng : Math.random;
  let control;
  switch (question.type) {
    case "multiple_choice": control = choiceList(question, true, rng); break;
    case "single_choice":
    case "scenariusz":
    case "scenariusz_decyzyjny": control = choiceList(question, false, rng); break;
    case "dopasowanie": control = matching(question, rng); break;
    case "kolejnosc_procesu": control = sequence(question, rng); break;
    case "analiza_outputu": control = rubricSelfRate(question); break;
    default: control = choiceList(question, false, rng);
  }

  const header = [];
  if (opts.index != null && opts.total != null) {
    header.push(el("p", { class: "quiz-meta", text: `Pytanie ${opts.index + 1} z ${opts.total}` }));
  }
  if (opts.showMeta) {
    header.push(el("p", { class: "quiz-meta", text: `${TYPE_LABEL[question.type] || question.type} · ${question.difficulty} · ${question.points} pkt` }));
  }

  const fieldset = el("fieldset", { class: "quiz-question" }, [
    el("legend", { class: "quiz-question__prompt", text: question.prompt }),
    ...header,
    control.node,
  ]);

  return { node: fieldset, getAnswer: control.getAnswer, getRubricPoints: control.getRubricPoints, focusFirst: control.focusFirst };
}

/** Buduje węzeł feedbacku po ocenie pytania (tryb nauki — quiz inline). */
export function renderFeedback(result) {
  if (result.isCriticalFail) {
    return el("div", { class: "feedback feedback--critical", attrs: { role: "alert" } }, [
      el("p", { class: "feedback__head" }, [el("span", { attrs: { "aria-hidden": "true" }, text: "⚠️ " }), "Błąd bezpieczeństwa"]),
      el("p", { text: CRITICAL_FAIL_MESSAGE }),
      result.feedback ? el("p", { text: result.feedback }) : null,
    ]);
  }
  const ok = result.isCorrect === true;
  return el("div", { class: `feedback ${ok ? "feedback--correct" : "feedback--incorrect"}`, attrs: { role: "status" } }, [
    el("p", { class: "feedback__head" }, [
      el("span", { attrs: { "aria-hidden": "true" }, text: ok ? "✓ " : "✗ " }),
      ok ? "Poprawnie" : "Niepoprawnie",
      el("span", { class: "quiz-meta", text: `  (${result.awarded}/${result.max} pkt)` }),
    ]),
    el("p", { text: result.feedback || "" }),
  ]);
}
