// data-negative.test.mjs — TEST NEGATYWNY (issue #25, kryterium "Testy failują przy pustym module
// lub błędnych danych"). Kopiuje realne dane do katalogu tymczasowego, psuje JEDEN plik i sprawdza,
// że walidator (validate.mjs) kończy się kodem != 0. Bez tego "zielone CI" nic nie gwarantuje —
// musimy udowodnić, że bramka realnie WYKRYWA regresję danych. Pure Node (fs + child_process).
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, writeFileSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = join(HERE, "..", "..");
const DATA = join(APP, "data");
const I18N = join(APP, "assets", "i18n");
const VALIDATOR = join(APP, "tests", "schema-validation", "validate.mjs");

// Uruchamia walidator na wskazanym katalogu danych; zwraca { code, output }. extraEnv = np. VALIDATE_I18N_DIR.
function runValidator(dataDir, extraEnv = {}) {
  try {
    const out = execFileSync(process.execPath, [VALIDATOR], {
      env: { ...process.env, VALIDATE_DATA_DIR: dataDir, ...extraEnv },
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

// Kopia katalogów UI (assets/i18n) do modyfikacji w teście kompletności kluczy (#80).
function copyI18n() {
  const dir = mkdtempSync(join(tmpdir(), "genai-i18n-"));
  cpSync(I18N, join(dir, "i18n"), { recursive: true });
  return join(dir, "i18n");
}

// Fabrykuje drugi locale data/en/ z kanonu pl (parytet). fixPrefix: dopasuj prefiks krytyczny do EN.
function fabricateEn(dataDir, { fixPrefix = true, mutate } = {}) {
  cpSync(join(dataDir, "pl"), join(dataDir, "en"), { recursive: true });
  if (fixPrefix) {
    const m10 = join(dataDir, "en", "questions", "m10.json");
    const doc = JSON.parse(readFileSync(m10, "utf8"));
    for (const q of doc.questions || []) {
      if (q.isCritical && typeof q.feedbackIncorrect === "string") {
        q.feedbackIncorrect = q.feedbackIncorrect.replace(/^To jest błąd bezpieczeństwa\./, "This is a security error.");
      }
    }
    writeFileSync(m10, JSON.stringify(doc, null, 2));
  }
  if (typeof mutate === "function") mutate(dataDir);
}

test("walidator PRZECHODZI na nietkniętych, realnych danych (sanity — kontrola odniesienia)", () => {
  const r = runValidator(DATA);
  assert.equal(r.code, 0, `walidator powinien przejść na realnych danych, a zwrócił ${r.code}:\n${r.output}`);
});

test("pusty moduł treści (brak ekranów + module) → walidator FAILUJE (exit != 0)", () => {
  const dataDir = copyData();
  // Psujemy treść M5: usuwamy wymagane pola (module, screens) — symulacja "pustego modułu".
  writeFileSync(join(dataDir, "pl", "module-content", "m05.json"), JSON.stringify({ _meta: { note: "pusty" } }, null, 2));
  const r = runValidator(dataDir);
  assert.notEqual(r.code, 0, "walidator MUSI failować na pustym module treści");
  assert.match(r.output, /m05|M5|module-content/, "raport błędu powinien wskazać uszkodzony moduł");
});

test("uszkodzony bank pytań (usunięte pytanie → zła liczba) → walidator FAILUJE", () => {
  const dataDir = copyData();
  const f = join(dataDir, "pl", "questions", "m01.json");
  const doc = JSON.parse(readFileSync(f, "utf8"));
  doc.questions = (doc.questions || []).slice(1); // usuń 1 pytanie → liczba per-moduł i total != target
  writeFileSync(f, JSON.stringify(doc, null, 2));
  const r = runValidator(dataDir);
  assert.notEqual(r.code, 0, "walidator MUSI failować przy złej liczbie pytań");
  assert.match(r.output, /pytań|M1\b/, "raport powinien wskazać niezgodność liczby pytań");
});

test("niesyntetyczne dane (realna domena e-mail wstrzyknięta) → walidator FAILUJE (lint syntetyczny)", () => {
  const dataDir = copyData();
  const f = join(dataDir, "pl", "questions", "m01.json");
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
    const f = join(dataDir, "pl", "questions", "m01.json");
    const doc = JSON.parse(readFileSync(f, "utf8"));
    doc.questions[0].prompt = `${doc.questions[0].prompt} ${c.inject}`;
    writeFileSync(f, JSON.stringify(doc, null, 2));
    const r = runValidator(dataDir);
    assert.notEqual(r.code, 0, `walidator MUSI failować na: ${c.name}`);
    assert.match(r.output, c.rx, `raport powinien wskazać kategorię: ${c.name}`);
  });
}

// ---------------- #80: kompletność katalogów UI + parytet strukturalny treści ----------------

test("kompletność UI: BRAKUJĄCY klucz w en.json (obecny w pl) → walidator FAILUJE", () => {
  const i18nDir = copyI18n();
  const enPath = join(i18nDir, "en.json");
  const en = JSON.parse(readFileSync(enPath, "utf8"));
  delete en["feedback.correct"]; // klucz obecny w pl.json
  writeFileSync(enPath, JSON.stringify(en, null, 2));
  const r = runValidator(DATA, { VALIDATE_I18N_DIR: i18nDir });
  assert.notEqual(r.code, 0, "brakujący klucz UI w locale MUSI failować");
  assert.match(r.output, /brak klucza UI|feedback\.correct/, "raport powinien wskazać brakujący klucz");
});

test("kompletność UI: BRAKUJĄCY PLIK en.json przy istniejących data/en/ → walidator FAILUJE (luka false-PASS, M11)", () => {
  const i18nDir = copyI18n();
  rmSync(join(i18nDir, "en.json")); // usuń CAŁY katalog UI EN; dane data/en/ (realne) zostają → locale ma dane, brak UI
  const r = runValidator(DATA, { VALIDATE_I18N_DIR: i18nDir });
  assert.notEqual(r.code, 0, "locale z danymi bez pliku katalogu UI MUSI failować (inaczej 100% nieprzetłumaczone przejdzie CI)");
  assert.match(r.output, /brak katalogu UI|en\.json/, "raport powinien wskazać brakujący katalog UI");
});

test("kompletność UI: klucz-SIEROTA w en.json (nieobecny w pl) → walidator FAILUJE", () => {
  const i18nDir = copyI18n();
  const enPath = join(i18nDir, "en.json");
  const en = JSON.parse(readFileSync(enPath, "utf8"));
  en["x.orphan.key"] = "";
  writeFileSync(enPath, JSON.stringify(en, null, 2));
  const r = runValidator(DATA, { VALIDATE_I18N_DIR: i18nDir });
  assert.notEqual(r.code, 0, "klucz-sierota w locale MUSI failować");
  assert.match(r.output, /sierota|x\.orphan\.key/, "raport powinien wskazać sierotę");
});

test("parytet KONTROLA ODNIESIENIA: poprawnie sfabrykowany en (parzysty, EN-prefiks) → exit 0", () => {
  const dataDir = copyData();
  fabricateEn(dataDir); // identyczna struktura + EN-prefiks krytyczny
  const r = runValidator(dataDir);
  assert.equal(r.code, 0, `parzysty en powinien przejść, a zwrócił ${r.code}:\n${r.output}`);
  assert.match(r.output, /Parytet en/, "raport powinien potwierdzić sprawdzenie parytetu");
});

test("parytet: zmiana pola scoringowego (correct) w data/en/ względem pl → walidator FAILUJE", () => {
  const dataDir = copyData();
  fabricateEn(dataDir, { mutate: (d) => {
    const f = join(d, "en", "questions", "m01.json");
    const doc = JSON.parse(readFileSync(f, "utf8"));
    doc.questions[0].correct = [...(doc.questions[0].options || [{ id: "x" }])].slice(-1).map((o) => o.id); // inna odpowiedź niż pl
    writeFileSync(f, JSON.stringify(doc, null, 2));
  } });
  const r = runValidator(dataDir);
  assert.notEqual(r.code, 0, "rozjazd correct między locale MUSI failować (silent scoring bug)");
  assert.match(r.output, /parytet/, "raport powinien wskazać rozjazd parytetu");
});

test("locale-aware prefiks: krytyczne en z PL-prefiksem (zamiast EN) → walidator FAILUJE", () => {
  const dataDir = copyData();
  fabricateEn(dataDir, { fixPrefix: false }); // en kopiuje PL-prefiks „To jest błąd bezpieczeństwa."
  const r = runValidator(dataDir);
  assert.notEqual(r.code, 0, "EN krytyczne MUSI używać EN-prefiksu (locale-aware)");
  assert.match(r.output, /prefiks|krytyczne|security error/, "raport powinien wskazać niezgodność prefiksu");
});
