// _qa-tools.test.mjs — self-check wspólnych narzędzi testowych (issue #70, QA-2).
// Dowodzi, że _rng.mjs i _snapshot.mjs działają deterministycznie na istniejącym _dom-stub (bez jego modyfikacji),
// oraz że serializeTree realnie nadaje się do kontroli „struktura/role/etykiety nie zniknęły po restylizacji UX".
import "./_dom-stub.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { constantRng, sequenceRng, seededRng } from "./_rng.mjs";
import { serializeTree, countByTag } from "./_snapshot.mjs";
import { bank } from "./_fixtures.mjs";
import { renderQuestion } from "../../assets/ui/quiz-view.js";

// Fisher–Yates identyczny jak w quiz-view.js — dowód, że constantRng(0) daje stałą permutację.
function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

test("constantRng: zawsze ta sama wartość; constantRng(0) + Fisher-Yates => przewidywalna permutacja", () => {
  const r = constantRng(0);
  assert.equal(r(), 0);
  assert.equal(r(), 0);
  // j=floor(0*(i+1))=0 dla każdego i → permutacja deterministyczna i powtarzalna.
  assert.deepEqual(shuffle(["A", "B", "C"], constantRng(0)), ["B", "C", "A"]);
  assert.deepEqual(shuffle(["A", "B", "C"], constantRng(0)), shuffle(["A", "B", "C"], constantRng(0)));
});

test("sequenceRng: oddaje wartości po kolei, cyklicznie", () => {
  const r = sequenceRng([0.1, 0.9]);
  assert.equal(r(), 0.1);
  assert.equal(r(), 0.9);
  assert.equal(r(), 0.1, "po wyczerpaniu zaczyna od początku");
  assert.throws(() => sequenceRng([]), /niepusta/);
});

test("seededRng re-eksportowany z _fixtures (nie duplikowany) — ten sam seed => ta sama sekwencja", () => {
  const a = seededRng(7);
  const b = seededRng(7);
  assert.equal(a(), b());
  assert.equal(a(), b());
});

test("serializeTree: deterministyczny (dwa wywołania == ten sam string) + countByTag liczy poprawnie", () => {
  const d = globalThis.document;
  // Drzewo: fieldset > legend + ul > li*2 (jak prawdziwe pytanie quizu).
  const ul = d.createElement("ul");
  ul.className = "options";
  for (let i = 0; i < 2; i += 1) ul.appendChild(d.createElement("li"));
  const fs = d.createElement("fieldset");
  const legend = d.createElement("legend");
  legend.setAttribute("class", "quiz-question__prompt");
  fs.appendChild(legend);
  fs.appendChild(ul);

  const s1 = serializeTree(fs);
  const s2 = serializeTree(fs);
  assert.equal(s1, s2, "snapshot musi być deterministyczny");
  assert.match(s1, /FIELDSET/);
  assert.match(s1, /LEGEND\[class="quiz-question__prompt"\]/);
  assert.match(s1, /UL\[class="options"\]/);

  const counts = countByTag(fs);
  assert.equal(counts.LI, 2, "countByTag policzył 2x LI");
  assert.equal(counts.FIELDSET, 1);
  assert.equal(counts.LEGEND, 1);
  assert.equal(counts.UL, 1);
});

test("integracja: serializeTree(renderQuestion) wychwytuje fieldset/legend/options + role/for/class (dowód użyteczności)", () => {
  const q = bank.find((qq) => qq.type === "single_choice" && (qq.options || []).length >= 2);
  const node = renderQuestion(q, { rng: seededRng(3) }).node;
  const snap = serializeTree(node);
  // Struktura a11y, którą UX-4 NIE może zgubić przy restylizacji:
  assert.match(snap, /FIELDSET\[class="quiz-question"\]/, "snapshot bez fieldset.quiz-question");
  assert.match(snap, /LEGEND/, "snapshot bez legendy (prompt)");
  assert.match(snap, /UL\[class="options"\]/, "snapshot bez listy opcji");
  assert.match(snap, /\bfor=/, "snapshot bez powiązania etykieta-kontrolka (for)");
  // countByTag: tyle LABEL/INPUT ile opcji.
  const counts = countByTag(node);
  assert.equal(counts.LABEL, q.options.length, "liczba etykiet == liczba opcji");
  assert.equal(counts.INPUT, q.options.length, "liczba inputów == liczba opcji");
});
