// quiz-ux.test.mjs — redesign widoku quizu (issue #73, UX-4): chipy meta + stany feedbacku.
// Strukturalnie pod DOM-stub (ADR-0002). Stany feedbacku rozróżnialne SŁOWEM + role (nie samym kolorem; WCAG 1.4.1).
import "./_dom-stub.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { queryAll } from "./_dom-stub.mjs";
import { bank } from "./_fixtures.mjs";
import { renderQuestion, renderFeedback } from "../../assets/ui/quiz-view.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(HERE, "..", "..", "assets", "styles.css"), "utf8");

const isTag = (...t) => (n) => t.includes(n.tagName);
const chips = (root) => queryAll(root, (n) => n.className && n.className.split(" ").includes("quiz-chip"));
const roleOf = (root, role) => queryAll(root, (n) => n.getAttribute && n.getAttribute("role") === role);

test("meta jako 3 chipy (typ/trudność/punkty) — treść zachowana, w trybie showMeta", () => {
  const q = bank.find((qq) => qq.type === "single_choice");
  const node = renderQuestion(q, { index: 0, total: 1, showMeta: true }).node;
  const cs = chips(node);
  assert.equal(cs.length, 3, "powinny być 3 chipy meta (typ/trudność/punkty)");
  const text = node.textContent;
  assert.ok(text.includes(String(q.difficulty)), "chip trudności zgubił treść");
  assert.ok(text.includes(`${q.points} pkt`), "chip punktów zgubił treść");
});

test("brak meta gdy showMeta=false (tryb minimalny) — chipy się nie pojawiają", () => {
  const q = bank.find((qq) => qq.type === "single_choice");
  assert.equal(chips(renderQuestion(q, {}).node).length, 0);
});

test("3 stany feedbacku rozróżnialne SŁOWEM + role (nie samym kolorem); ikona to inline SVG (UX-6)", () => {
  const svgCount = (n) => queryAll(n, isTag("SVG")).length;
  const ok = renderFeedback({ isCorrect: true, awarded: 2, max: 2, feedback: "ok" });
  assert.ok(ok.textContent.includes("Poprawnie"), "correct bez słowa 'Poprawnie'");
  assert.equal(roleOf(ok, "status").length, 1, "correct powinien mieć role=status");
  assert.ok(svgCount(ok) >= 1, "correct: ikona to inline SVG (nie emoji)");

  const bad = renderFeedback({ isCorrect: false, awarded: 0, max: 2, feedback: "x" });
  assert.ok(bad.textContent.includes("Niepoprawnie"), "incorrect bez słowa 'Niepoprawnie'");
  assert.equal(roleOf(bad, "status").length, 1, "incorrect powinien mieć role=status");
  assert.ok(svgCount(bad) >= 1, "incorrect: ikona to inline SVG");

  const crit = renderFeedback({ isCriticalFail: true, feedback: "x" });
  assert.ok(crit.textContent.includes("Błąd bezpieczeństwa"), "critical bez słowa 'Błąd bezpieczeństwa'");
  assert.equal(roleOf(crit, "alert").length, 1, "critical MUSI mieć role=alert (krytyczne)");
  assert.ok(svgCount(crit) >= 1, "critical: ikona to inline SVG");
});

test("a11y/static: feedback animuje transform/opacity (keyframe) i jest gaszony reduced-motion", () => {
  assert.match(css, /@keyframes\s+feedback-in\s*\{/, "brak @keyframes feedback-in");
  assert.match(css, /\.feedback\s*\{[^}]*animation:\s*feedback-in/, ".feedback nie używa keyframe feedback-in");
  assert.match(css, /feedback-in\s*\{[\s\S]*?(opacity|transform)[\s\S]*?\}/, "keyframe nie używa opacity/transform");
  // reduced-motion (utwardzony w #68) gasi WSZYSTKIE animacje — w tym tę.
  const rm = css.slice(css.indexOf("prefers-reduced-motion"), css.indexOf("prefers-reduced-motion") + 400);
  assert.match(rm, /animation:\s*none/, "reduced-motion nie gasi animacji (a więc i feedbacku)");
});

test("lewy pasek stanu: feedback ma grubszą lewą krawędź w kolorze stanu (sygnał nie tylko kolorem)", () => {
  assert.match(css, /\.feedback\s*\{[^}]*border-left-width:\s*4px/, "feedback bez lewego paska 4px");
});
