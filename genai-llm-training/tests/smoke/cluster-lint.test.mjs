// cluster-lint.test.mjs — lint klastrowania pozycji poprawnej (issue #67, RND-2).
// Semantyka ODWROTNA niż data-negative: klaster daje OSTRZEŻENIE, więc walidator kończy się exit 0
// (estetyka autorska nie blokuje CI). Tu udowadniamy, że lint DYSKRYMINUJE w obie strony — bo realny bank
// pali WARN na każdym module, więc samo „WARN obecny" nic nie weryfikuje. Kontrast na JEDNYM module (M1),
// niezależny od stanu reszty banku: rozkład rozproszony => M1 NIE raportowany; klaster wstrzyknięty => M1 raportowany
// z długością serii wynikającą z wstrzyknięcia. Wzorzec izolacji danych: cpSync + VALIDATE_DATA_DIR (jak data-negative).
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, writeFileSync, mkdtempSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = join(HERE, "..", "..");
const DATA = join(APP, "data");
const VALIDATOR = join(APP, "tests", "schema-validation", "validate.mjs");
const SINGLE = new Set(["single_choice", "scenariusz_decyzyjny", "scenariusz"]);

function runValidator(dataDir) {
  try {
    const out = execFileSync(process.execPath, [VALIDATOR], {
      env: { ...process.env, VALIDATE_DATA_DIR: dataDir }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    });
    return { code: 0, output: out };
  } catch (e) {
    return { code: e.status ?? 1, output: `${e.stdout || ""}${e.stderr || ""}` };
  }
}
function copyData() {
  const dir = mkdtempSync(join(tmpdir(), "genai-cluster-"));
  cpSync(DATA, join(dir, "data"), { recursive: true });
  return join(dir, "data");
}
// Ustawia pozycję poprawnej (correct) dla kolejnych single-correct pytań M1 wg `pick(i, options)`.
// Zwraca liczbę zmodyfikowanych pytań (długość serii w teście klastra).
function rewriteM1(dataDir, pick) {
  const f = join(dataDir, "pl", "questions", "m01.json");
  const doc = JSON.parse(readFileSync(f, "utf8"));
  let i = 0;
  for (const q of doc.questions) {
    if (SINGLE.has(q.type) && (q.correct || []).length === 1 && Array.isArray(q.options)) {
      q.correct = [pick(i, q.options)];
      i += 1;
    }
  }
  writeFileSync(f, JSON.stringify(doc, null, 2));
  return i;
}

test("kontrola odniesienia: realny bank => exit 0 (klaster = WARN, nie błąd) i WARN klastrowania obecny", () => {
  const r = runValidator(DATA);
  assert.equal(r.code, 0, `realny bank musi przejść (WARN dozwolone):\n${r.output}`);
  assert.match(r.output, /Klastrowanie pozycji/, "realny bank jest skośny (A-biased) => lint MUSI to ujawnić jako WARN");
});

test("rozkład ROZPROSZONY w M1 => M1 NIE jest raportowany jako klaster (exit 0)", () => {
  const dataDir = copyData();
  const cyc = ["A", "B", "C", "D"]; // wszystkie istnieją w pytaniach M1 (ABCD)
  rewriteM1(dataDir, (i, opts) => (opts.some((o) => o.id === cyc[i % 4]) ? cyc[i % 4] : opts[i % opts.length].id));
  const r = runValidator(dataDir);
  assert.equal(r.code, 0, `WARN nie może failować CI:\n${r.output}`);
  assert.doesNotMatch(r.output, /M1: /, "rozproszony M1 (max-seria 1, skos ~33%) nie powinien być w liście klastrów");
});

test("KLASTER wstrzyknięty w M1 (wszystkie na pozycji A) => M1 raportowany z długością serii = liczba pytań (exit 0)", () => {
  const dataDir = copyData();
  const n = rewriteM1(dataDir, (_i, opts) => opts[0].id); // opts[0].id == "A" w całym banku
  const r = runValidator(dataDir);
  assert.equal(r.code, 0, `klaster to WARN, nie błąd — exit musi być 0:\n${r.output}`);
  assert.match(r.output, /Klastrowanie pozycji/, "WARN klastrowania powinien się pojawić");
  assert.match(r.output, new RegExp(`M1: seria A=${n}`), `M1 raportowany z serią A=${n} (specyficzną dla wstrzyknięcia, != naturalnej)`);
});
