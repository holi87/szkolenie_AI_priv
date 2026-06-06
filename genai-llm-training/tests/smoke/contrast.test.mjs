// contrast.test.mjs — automatyczna kontrola kontrastu tokenów obu motywów (issue #69, QA-1).
// Czyta assets/tokens.css JAKO TEKST i asercjonuje pary tekst/tło >=4.5:1 (WCAG 1.4.3) oraz UI/tło >=3:1
// (WCAG 1.4.11) dla :root (ciemny) i — jeśli istnieje — [data-theme="light"] (jasny). Zastępuje "ręcznie" z UX-1..UX-5.
//
// LISTA PAR JEST DEKLARATYWNA I ROZSZERZALNA: UX-2..UX-5 dopisują tu swoje pary (np. tekst na tle feedbacku,
// tekst certyfikatu na solidnym tle) BEZ zmiany logiki helpera _contrast.mjs.
//
// GRANICE (świadome, weryfikacja RĘCZNA — poza asercją automatyczną):
//   - gradient (--grad-accent) i background-clip:text — nierozstrzygalne statycznie,
//   - półprzezroczyste tła (rgba na rgba) — kontrast zależy od warstwy pod spodem.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseTokens, resolveVar, contrastRatio, mixHex } from "./_contrast.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const tokensCss = readFileSync(join(HERE, "..", "..", "assets", "tokens.css"), "utf8");
const tokens = parseTokens(tokensCss);
const LIGHT = ':root[data-theme="light"]';

// Pary TEKST na TLE — wymóg >=4.5:1 (WCAG 1.4.3). [fg, bg].
const TEXT_PAIRS = [
  ["--color-fg", "--color-bg"],
  ["--color-fg", "--color-surface"],
  ["--color-fg", "--color-surface-2"],
  ["--color-accent-fg", "--color-accent"], // tekst na wypełnieniu akcentu (przyciski .btn)
  ["--color-accent", "--color-bg"],        // akcent jako LINK na tle — styles.css `a { color: var(--color-accent) }`
  ["--color-accent", "--color-surface"],
  ["--color-accent", "--color-surface-2"], // status "W toku" (.status--in_progress) jako TEKST na aktywnym/hover module (tło -> surface-2)
  ["--color-muted", "--color-bg"],
  ["--color-muted", "--color-surface"],
  // Kolory statusu używane jako TEKST (M9: pille statusu nav). Pill nie ma własnego tła → pokazuje tło
  // przycisku, które na hover/aria-current robi się surface-2 (styles.css) — dlatego asercja też na surface-2.
  ["--color-ok", "--color-surface"],       // .status--completed .nav-item__status (TEKST "Ukończony")
  ["--color-ok", "--color-surface-2"],
  // UWAGA: --color-locked jako tekst statusu jest ZWOLNIONY z 1.4.3 — występuje wyłącznie na komponencie
  // nieaktywnym (button[disabled]/[aria-disabled], shell.js test końcowy; moduły nie osiągają stanu locked).
];
// Pary UI (granice/ikony) — wymóg >=3:1 (WCAG 1.4.11). [ui, bg].
const UI_PAIRS = [
  ["--color-border", "--color-bg"],
  ["--color-border", "--color-surface"],
];

function ratioFor(scope, a, b) {
  const va = resolveVar(tokens, scope, a);
  const vb = resolveVar(tokens, scope, b);
  assert.ok(va, `${scope}: nierozwiązany ${a}`);
  assert.ok(vb, `${scope}: nierozwiązany ${b}`);
  return contrastRatio(va, vb); // rzuca, jeśli któraś wartość nie jest solid hex (świadomy kontrakt)
}

function assertScope(scope) {
  for (const [a, b] of TEXT_PAIRS) {
    const r = ratioFor(scope, a, b);
    assert.ok(r >= 4.5, `${scope}: tekst ${a} na ${b} = ${r.toFixed(2)}:1 (<4.5, WCAG 1.4.3)`);
  }
  for (const [a, b] of UI_PAIRS) {
    const r = ratioFor(scope, a, b);
    assert.ok(r >= 3, `${scope}: UI ${a} na ${b} = ${r.toFixed(2)}:1 (<3, WCAG 1.4.11)`);
  }
}

test("self-check helpera: znane pary (czarny/biały=21, identyczne=1) + resolveVar 1 poziom i guard na cykl", () => {
  assert.ok(Math.abs(contrastRatio("#000000", "#ffffff") - 21) < 0.1, "czarny/biały powinien dać ~21:1");
  assert.equal(contrastRatio("#777777", "#777777"), 1, "identyczne kolory => 1:1");
  assert.ok(Math.abs(contrastRatio("#000", "#fff") - 21) < 0.1, "skrót #rgb też liczony");
  // resolveVar: 1 poziom + cykl => null (nie wisi).
  const t = parseTokens(":root{--x:var(--y);--y:#abcabc;--a:var(--b);--b:var(--a);}");
  assert.equal(resolveVar(t, ":root", "--x"), "#abcabc", "resolveVar rozwiązuje var() o 1 poziom");
  assert.equal(resolveVar(t, ":root", "--a"), null, "cykl => null (nie zawiesza)");
});

test("DARK (:root): tekst >=4.5:1, UI >=3:1 — automatycznie na tokens.css", () => {
  assertScope(":root");
});

test("LIGHT ([data-theme=light]): te same pary >=4.5/3:1 — jeśli motyw istnieje (inaczej pomiń bez fałszywego failu)", () => {
  if (!tokens[LIGHT]) {
    // Motyw jasny jeszcze nie wprowadzony — nie zgłaszaj fałszywego błędu (warunkowy zakres z #69).
    return;
  }
  assertScope(LIGHT);
});

// ----- WARN-AS-TEXT: kontrast --color-warn-text na TŁE KOMPOZYTOWYM (#146, M18 STAGE C) -----
// `.quiz-chip--crit` i `.result-status--fail` używają koloru warn jako TEKSTU nad tłem
// `color-mix(in srgb, --color-warn 10%/12%, transparent)` nałożonym na solid powierzchnię.
// Asercja liczy rzeczywisty kontrast: tekst (warn-text) vs. skompozytowane tło (mixHex).
// Cel: >=4.5:1 wg WCAG 1.4.3 (tekst). Worst-case: surface-2 jako podłoże.
test("WARN-AS-TEXT (:root/dark): --color-warn-text na kompozytowym tle chip/badge (10%/12% warn) >=4.5:1", () => {
  const warnText = resolveVar(tokens, ":root", "--color-warn-text");
  const warn = resolveVar(tokens, ":root", "--color-warn");
  const surface = resolveVar(tokens, ":root", "--color-surface");
  const surface2 = resolveVar(tokens, ":root", "--color-surface-2");
  assert.ok(warnText, ":root: nierozwiązany --color-warn-text");
  assert.ok(warn, ":root: nierozwiązany --color-warn");
  // quiz-chip--crit: 10% warn na surface-2 (worst-case parent)
  const chipBg = mixHex(warn, surface2, 0.10);
  const chipRatio = contrastRatio(warnText, chipBg);
  assert.ok(chipRatio >= 4.5, `:root quiz-chip--crit: warn-text na kompozycie = ${chipRatio.toFixed(2)}:1 (<4.5, WCAG 1.4.3)`);
  // result-status--fail: 12% warn na surface (hero siedzi na surface)
  const failBg = mixHex(warn, surface, 0.12);
  const failRatio = contrastRatio(warnText, failBg);
  assert.ok(failRatio >= 4.5, `:root result-status--fail: warn-text na kompozycie = ${failRatio.toFixed(2)}:1 (<4.5, WCAG 1.4.3)`);
});

test("WARN-AS-TEXT (light): --color-warn-text na kompozytowym tle chip/badge (10%/12% warn) >=4.5:1", () => {
  if (!tokens[LIGHT]) return; // motyw jasny jeszcze nie wprowadzony
  const warnText = resolveVar(tokens, LIGHT, "--color-warn-text");
  const warn = resolveVar(tokens, LIGHT, "--color-warn");
  const surface = resolveVar(tokens, LIGHT, "--color-surface");
  const surface2 = resolveVar(tokens, LIGHT, "--color-surface-2");
  assert.ok(warnText, `${LIGHT}: nierozwiązany --color-warn-text`);
  assert.ok(warn, `${LIGHT}: nierozwiązany --color-warn`);
  // quiz-chip--crit: 10% warn na surface-2 (worst-case)
  const chipBg = mixHex(warn, surface2, 0.10);
  const chipRatio = contrastRatio(warnText, chipBg);
  assert.ok(chipRatio >= 4.5, `light quiz-chip--crit: warn-text na kompozycie = ${chipRatio.toFixed(2)}:1 (<4.5, WCAG 1.4.3)`);
  // result-status--fail: 12% warn na surface (worst-case dla badge)
  const failBg = mixHex(warn, surface, 0.12);
  const failRatio = contrastRatio(warnText, failBg);
  assert.ok(failRatio >= 4.5, `light result-status--fail: warn-text na kompozycie = ${failRatio.toFixed(2)}:1 (<4.5, WCAG 1.4.3)`);
});

test("mixHex self-check: 100% → hexA, 0% → hexB, 50% → środek", () => {
  assert.equal(mixHex("#ff0000", "#0000ff", 1.0), "#ff0000", "100% hexA -> hexA");
  assert.equal(mixHex("#ff0000", "#0000ff", 0.0), "#0000ff", "0% hexA -> hexB");
  const mid = mixHex("#ff0000", "#0000ff", 0.5);
  assert.equal(mid, "#800080", "50% mix czerwony/niebieski (Math.round 255*0.5=128=0x80)");
});
