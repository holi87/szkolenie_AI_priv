// data-negative.test.mjs — TEST NEGATYWNY (issue #25, kryterium "Testy failują przy pustym module
// lub błędnych danych"). Kopiuje realne dane do katalogu tymczasowego, psuje JEDEN plik i sprawdza,
// że walidator (validate.mjs) kończy się kodem != 0. Bez tego "zielone CI" nic nie gwarantuje —
// musimy udowodnić, że bramka realnie WYKRYWA regresję danych. Pure Node (fs + child_process).
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

// Uruchamia walidator na wskazanym katalogu danych; zwraca { code, output }.
function runValidator(dataDir) {
  try {
    const out = execFileSync(process.execPath, [VALIDATOR], {
      env: { ...process.env, VALIDATE_DATA_DIR: dataDir },
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { code: 0, output: out };
  } catch (e) {
    return { code: e.status ?? 1, output: `${e.stdout || ""}${e.stderr || ""}` };
  }
}

function copyData() {
  const dir = mkdtempSync(join(tmpdir(), "genai-data-"));
  cpSync(DATA, join(dir, "data"), { recursive: true });
  return join(dir, "data");
}

test("walidator PRZECHODZI na nietkniętych, realnych danych (sanity — kontrola odniesienia)", () => {
  const r = runValidator(DATA);
  assert.equal(r.code, 0, `walidator powinien przejść na realnych danych, a zwrócił ${r.code}:\n${r.output}`);
});

test("pusty moduł treści (brak ekranów + module) → walidator FAILUJE (exit != 0)", () => {
  const dataDir = copyData();
  // Psujemy treść M5: usuwamy wymagane pola (module, screens) — symulacja "pustego modułu".
  writeFileSync(join(dataDir, "module-content", "m05.json"), JSON.stringify({ _meta: { note: "pusty" } }, null, 2));
  const r = runValidator(dataDir);
  assert.notEqual(r.code, 0, "walidator MUSI failować na pustym module treści");
  assert.match(r.output, /m05|M5|module-content/, "raport błędu powinien wskazać uszkodzony moduł");
});

test("uszkodzony bank pytań (usunięte pytanie → zła liczba) → walidator FAILUJE", () => {
  const dataDir = copyData();
  const f = join(dataDir, "questions", "m01.json");
  const doc = JSON.parse(readFileSync(f, "utf8"));
  doc.questions = (doc.questions || []).slice(1); // usuń 1 pytanie → liczba per-moduł i total != target
  writeFileSync(f, JSON.stringify(doc, null, 2));
  const r = runValidator(dataDir);
  assert.notEqual(r.code, 0, "walidator MUSI failować przy złej liczbie pytań");
  assert.match(r.output, /pytań|M1\b/, "raport powinien wskazać niezgodność liczby pytań");
});

test("niesyntetyczne dane (realna domena e-mail wstrzyknięta) → walidator FAILUJE (lint syntetyczny)", () => {
  const dataDir = copyData();
  const f = join(dataDir, "questions", "m01.json");
  const doc = JSON.parse(readFileSync(f, "utf8"));
  if (doc.questions && doc.questions[0]) doc.questions[0].prompt = `${doc.questions[0].prompt} kontakt: ktos@gmail.com`;
  writeFileSync(f, JSON.stringify(doc, null, 2));
  const r = runValidator(dataDir);
  assert.notEqual(r.code, 0, "walidator MUSI failować na realnej domenie e-mail (dane muszą być syntetyczne)");
  assert.match(r.output, /syntetyczne|e-mail/, "raport powinien wskazać naruszenie polityki danych syntetycznych");
});

// Hardening lintera (#64): defense-in-depth dla PII/sekretów spoza wąskiej listy webmaili.
for (const c of [
  { name: "firmowy e-mail (spoza allowlisty domen)", inject: "kontakt: jan@mojafirma.io", rx: /e-mail|syntetyczne/ },
  { name: "numer telefonu (PL)", inject: "tel: +48 601 234 567", rx: /telefon|syntetyczne/ },
  { name: "IBAN", inject: "konto: PL61109010140000071219812874", rx: /IBAN|syntetyczne/ },
  { name: "sekret/token API", inject: "klucz: sk-proj-abcdefghijklmnop12", rx: /sekret|token|syntetyczne/ },
]) {
  test(`niesyntetyczne dane: ${c.name} wstrzyknięte → walidator FAILUJE (#64)`, () => {
    const dataDir = copyData();
    const f = join(dataDir, "questions", "m01.json");
    const doc = JSON.parse(readFileSync(f, "utf8"));
    doc.questions[0].prompt = `${doc.questions[0].prompt} ${c.inject}`;
    writeFileSync(f, JSON.stringify(doc, null, 2));
    const r = runValidator(dataDir);
    assert.notEqual(r.code, 0, `walidator MUSI failować na: ${c.name}`);
    assert.match(r.output, c.rx, `raport powinien wskazać kategorię: ${c.name}`);
  });
}
