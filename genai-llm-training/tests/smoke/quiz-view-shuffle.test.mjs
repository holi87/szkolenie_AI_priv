// quiz-view-shuffle.test.mjs — tasowanie POZYCJI odpowiedzi przy renderze (issue #66, anti-gaming).
// Pod stubem DOM (pure Node, zero zależności — ADR-0002). RNG deterministyczny (seededRng z _fixtures),
// żeby asercje były powtarzalne. Scoring jest po ID opcji (quiz-engine) — tu dowodzimy, że tasowanie
// pozycji NIE psuje scoringu, że jest deterministyczne przy danym seedzie i zmienne między seedami,
// że focus idzie za kolejnością WIZUALNĄ, że lockOptionOrder wyłącza tasowanie i że dane brzegowe nie wywalają renderu.
import "./_dom-stub.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { queryAll } from "./_dom-stub.mjs";
import { bank, seededRng } from "./_fixtures.mjs";
import { renderQuestion } from "../../assets/ui/quiz-view.js";
import { scoreQuestion } from "../../assets/core/quiz-engine.js";

const isTag = (...t) => (n) => t.includes(n.tagName);

// Kolejność opcji choice odczytana z atrybutu `for` etykiet (id = `${q.id}-${opt.id}`), w kolejności WIZUALNEJ DOM.
function optionOrder(node, q) {
  return queryAll(node, isTag("LABEL")).map((l) => l.getAttribute("for")).filter(Boolean)
    .filter((f) => f.startsWith(`${q.id}-`)).map((f) => f.slice(q.id.length + 1));
}
const orderForSeed = (q, seed) => optionOrder(renderQuestion(q, { rng: seededRng(seed) }).node, q);

const single = bank.find((q) => q.type === "single_choice" && (q.options || []).length >= 3);
const dataIds = single.options.map((o) => o.id);

// Seed dający kolejność != dane (dla >=3 opcji prawie każdy seed) — baza dla asercji „pozycja się zmienia".
function seedDifferingFromData(q) {
  const base = q.options.map((o) => o.id).join("");
  for (let s = 1; s < 200; s += 1) if (orderForSeed(q, s).join("") !== base) return s;
  return null;
}

test("single_choice (>=3 opcji): kolejność po tasowaniu != kolejność danych", () => {
  const seed = seedDifferingFromData(single);
  assert.ok(seed != null, "powinien istnieć seed dający permutację != dane");
  assert.notDeepEqual(orderForSeed(single, seed), dataIds);
});

test("determinizm: ten sam seed => identyczna permutacja (powtarzalność dla QA)", () => {
  const seed = seedDifferingFromData(single);
  assert.deepEqual(orderForSeed(single, seed), orderForSeed(single, seed));
});

test("dwa różne seedy => co najmniej jedna inna pozycja (pozycja poprawnej NIE jest stała)", () => {
  // Indeks poprawnej opcji bywa różny między renderami — szukamy pary seedów, które go zmieniają.
  const correctId = single.correct[0];
  const idxFor = (seed) => orderForSeed(single, seed).indexOf(correctId);
  const positions = new Set(Array.from({ length: 40 }, (_, s) => idxFor(s + 1)));
  assert.ok(positions.size >= 2, "pozycja poprawnej odpowiedzi powinna się zmieniać między seedami");
});

test("scoring po ID nienaruszony po tasowaniu — single/multiple/krytyczny scenariusz_decyzyjny", () => {
  const seed = seedDifferingFromData(single) ?? 1;
  // single_choice: zaznacz poprawną opcję PO JEJ ID (nie pozycji) na potasowanym renderze.
  const ctl = renderQuestion(single, { rng: seededRng(seed) });
  const inputs = queryAll(ctl.node, isTag("INPUT"));
  inputs.find((i) => i.value === single.correct[0]).checked = true;
  const ans = ctl.getAnswer();
  assert.equal(ans, single.correct[0]);
  assert.deepEqual(scoreQuestion(single, ans), scoreQuestion(single, single.correct[0])); // render-niezależny

  // multiple_choice: komplet poprawnych = pełne punkty; +1 błędny = partial < pełne (po tasowaniu też).
  const multi = bank.find((q) => q.type === "multiple_choice" && (q.options || []).length >= 3);
  if (multi) {
    const full = scoreQuestion(multi, [...multi.correct]);
    assert.equal(full.awarded, multi.points);
    const wrongId = multi.options.map((o) => o.id).find((id) => !multi.correct.includes(id));
    const partial = scoreQuestion(multi, [...multi.correct, wrongId]);
    assert.ok(partial.awarded < full.awarded, "błędny wybór musi obniżyć punkty");
  }

  // krytyczny scenariusz_decyzyjny: poprawna => brak crit-fail; błędna => isCriticalFail=true (ścieżka krytyczna).
  const crit = bank.find((q) => q.isCritical);
  assert.equal(scoreQuestion(crit, crit.correct[0]).isCriticalFail, false);
  const badId = crit.options.map((o) => o.id).find((id) => id !== crit.correct[0]);
  assert.equal(scoreQuestion(crit, badId).isCriticalFail, true);
});

test("focus = pierwsza WIZUALNA opcja (nie options[0] z danych)", () => {
  // Seed, dla którego głowa kolejności != options[0] — wtedy focusFirst musi celować w nową głowę.
  let seed = null;
  for (let s = 1; s < 200 && seed == null; s += 1) if (orderForSeed(single, s)[0] !== dataIds[0]) seed = s;
  assert.ok(seed != null, "powinien istnieć seed zmieniający pierwszą pozycję");
  const node = renderQuestion(single, { rng: seededRng(seed) }).node;
  const firstInput = queryAll(node, isTag("INPUT"))[0];
  const firstFor = queryAll(node, isTag("LABEL")).map((l) => l.getAttribute("for"))[0];
  assert.equal(firstInput.id, firstFor, "pierwszy input i pierwsza etykieta opisują tę samą (wizualnie pierwszą) opcję");
  assert.notEqual(firstInput.id, `${single.id}-${dataIds[0]}`, "głowa nie jest już opcją [0] z danych");
});

test("lockOptionOrder=true => kolejność == dane, niezależnie od seeda", () => {
  const locked = { ...single, lockOptionOrder: true };
  for (const s of [1, 7, 42]) assert.deepEqual(optionOrder(renderQuestion(locked, { rng: seededRng(s) }).node, locked), dataIds);
});

test("konserwatywnie: brak options / 1 opcja / opcja bez id => brak wyjątku i brak tasowania", () => {
  assert.doesNotThrow(() => renderQuestion({ ...single, options: undefined }, { rng: seededRng(1) }));
  const one = { ...single, options: [single.options[0]] };
  assert.deepEqual(optionOrder(renderQuestion(one, { rng: seededRng(2) }).node, one), [dataIds[0]]);
  const noId = { ...single, options: [{ text: "x" }, ...single.options.slice(1)] };
  assert.doesNotThrow(() => renderQuestion(noId, { rng: seededRng(3) }));
});

test("kolejnosc_procesu: tasowane raz, wynik != klucz (zabezpieczenie linii); matching: mapowanie left->right po wartości", () => {
  const seq = bank.find((q) => q.type === "kolejnosc_procesu");
  if (seq) {
    const node = renderQuestion(seq, { rng: seededRng(3) }).node;
    // Etykiety kroków są w spanach (ostatni span wiersza) — czytamy kolejność prezentacji.
    const shown = queryAll(node, isTag("SPAN")).map((s) => s.textContent).filter((t) => seq.sequence.includes(t));
    assert.equal(shown.length, seq.sequence.length, "każdy krok wyświetlony raz");
    assert.notDeepEqual(shown, seq.sequence, "kolejność prezentacji != klucz (anti-gaming)");
  }
  const matchQ = bank.find((q) => q.type === "dopasowanie");
  if (matchQ) {
    const ctl = renderQuestion(matchQ, { rng: seededRng(5) });
    const selects = queryAll(ctl.node, isTag("SELECT"));
    matchQ.pairs.forEach((p, i) => { selects[i].value = p.right; }); // wybierz poprawne wartości
    assert.deepEqual(scoreQuestion(matchQ, ctl.getAnswer()).isCorrect, true, "poprawne wartości => komplet, mimo potasowanych opcji");
  }
});

test("a11y po tasowaniu: każdy input ma wiążącą etykietę (for), grupowanie radio po name=q.id", () => {
  const node = renderQuestion(single, { rng: seededRng(11) }).node;
  const fors = new Set(queryAll(node, isTag("LABEL")).map((l) => l.getAttribute("for")));
  for (const input of queryAll(node, isTag("INPUT"))) {
    assert.ok(fors.has(input.id), `input ${input.id} bez wiążącej etykiety po tasowaniu`);
    assert.equal(input.name, single.id, "radio zgrupowane po name=q.id (pozycyjnie niezależne)");
  }
});
