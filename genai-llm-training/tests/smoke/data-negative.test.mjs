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

// ---------------- M13-2 (#95): pokrycie pul per ścieżka (fundament dedykowanych pul, ADR-0006) ----------------

test("pokrycie puli per ścieżka (#95): finalTestQuestions > pula ścieżki → walidator FAILUJE", () => {
  const dataDir = copyData();
  const f = join(dataDir, "paths.json"); // paths.json jest wspólny (top-level data/), nie per-locale
  const doc = JSON.parse(readFileSync(f, "utf8"));
  doc.paths.S1.finalTestQuestions = 999; // pula S1 (~39) < 999 → testu nie da się złożyć z dopasowanej puli
  writeFileSync(f, JSON.stringify(doc, null, 2));
  const r = runValidator(dataDir);
  assert.notEqual(r.code, 0, "pula ścieżki mniejsza niż finalTestQuestions MUSI failować (#95)");
  assert.match(r.output, /pula pytań|finalTestQuestions/, "raport powinien wskazać niedobór puli ścieżki");
});

test("dedykowane (M13/#94): pytanie modułu dedykowanego z >1 ścieżką → walidator FAILUJE (rozłączność pul)", () => {
  const dataDir = copyData();
  for (const loc of ["pl", "en"]) {
    const f = join(dataDir, loc, "questions", "m02.json"); // M2 = dedykowany (scope=dedicated)
    const doc = JSON.parse(readFileSync(f, "utf8"));
    doc.questions.find((x) => x.id === "Q009").paths = ["S1", "S2"]; // dedykowane musi mieć dokładnie 1 ścieżkę
    writeFileSync(f, JSON.stringify(doc, null, 2));
  }
  const r = runValidator(dataDir);
  assert.notEqual(r.code, 0, "dedykowane z 2 ścieżkami MUSI failować (rozłączność)");
  assert.match(r.output, /dedykowany|dokładnie 1 ścieżki/, "raport powinien wskazać złamaną rozłączność");
});

test("rdzeń (M13/#94): pytanie modułu rdzeniowego z 1 ścieżką → walidator FAILUJE (rdzeń musi być wspólny)", () => {
  const dataDir = copyData();
  for (const loc of ["pl", "en"]) {
    const f = join(dataDir, loc, "questions", "m01.json"); // M1 = rdzeń (scope=core)
    const doc = JSON.parse(readFileSync(f, "utf8"));
    doc.questions.find((x) => x.id === "Q002").paths = ["S1"]; // rdzeń musi być wspólny (>=2 ścieżki)
    writeFileSync(f, JSON.stringify(doc, null, 2));
  }
  const r = runValidator(dataDir);
  assert.notEqual(r.code, 0, "rdzeniowe z 1 ścieżką MUSI failować");
  assert.match(r.output, /rdzeniowy|wspólne/, "raport powinien wskazać złamany rdzeń");
});

test("kwota dedykowanych (M13/#94): dedicatedQuestionsMin > pula dedykowanych → walidator FAILUJE", () => {
  const dataDir = copyData();
  const f = join(dataDir, "paths.json");
  const doc = JSON.parse(readFileSync(f, "utf8"));
  doc.paths.S3.dedicatedQuestionsMin = 999; // pula dedykowanych S3 (~54) < 999 → kwota niewykonalna
  writeFileSync(f, JSON.stringify(doc, null, 2));
  const r = runValidator(dataDir);
  assert.notEqual(r.code, 0, "kwota dedykowanych większa niż pula MUSI failować");
  assert.match(r.output, /pula dedykowanych|dedicatedQuestionsMin|niewykonaln/, "raport powinien wskazać niewykonalną kwotę");
});

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

// ---------------- M14 (#102-#106): moduł diagnostyczny MSH (Skala Holaka) ----------------

test("MSH (#103): luka w bandach maturity-check (poziom bez bandy) → walidator FAILUJE (feedback nierozwiązywalny)", () => {
  const dataDir = copyData();
  const f = join(dataDir, "pl", "module-content", "msh.json");
  const doc = JSON.parse(readFileSync(f, "utf8"));
  const org = doc.interaction.scales.find((s) => s.id === "org");
  org.bands = org.bands.filter((b) => b.min < 9); // usuń bandę 9–11 → poziomy 9..11 bez bandy
  writeFileSync(f, JSON.stringify(doc, null, 2));
  const r = runValidator(dataDir);
  assert.notEqual(r.code, 0, "luka w bandach skali MUSI failować (feedback 'gdzie jesteś' nierozwiązywalny)");
  assert.match(r.output, /bez bandy|skala org/, "raport powinien wskazać poziom bez bandy");
});

test("MSH (#103): scope diagnostic→core (moduł bez puli pytań) → walidator FAILUJE (wymaga questionRange)", () => {
  const dataDir = copyData();
  const f = join(dataDir, "modules.json"); // wspólny (top-level), nie per-locale
  const doc = JSON.parse(readFileSync(f, "utf8"));
  doc.modules.find((m) => m.id === "MSH").scope = "core"; // udaje rdzeń, choć nie ma puli pytań
  writeFileSync(f, JSON.stringify(doc, null, 2));
  const r = runValidator(dataDir);
  assert.notEqual(r.code, 0, "moduł bez pytań ze scope core/dedicated MUSI failować (wyłączenie diagnostic jest load-bearing)");
  assert.match(r.output, /questionRange|MSH/, "raport powinien wskazać brak questionRange dla MSH");
});

test("MSH (#104): maturity-check bez pola scales → walidator FAILUJE (schemat kind)", () => {
  const dataDir = copyData();
  const f = join(dataDir, "pl", "module-content", "msh.json");
  const doc = JSON.parse(readFileSync(f, "utf8"));
  delete doc.interaction.scales;
  writeFileSync(f, JSON.stringify(doc, null, 2));
  const r = runValidator(dataDir);
  assert.notEqual(r.code, 0, "maturity-check bez scales MUSI failować (schema allOf: kind→required scales)");
  assert.match(r.output, /scales|msh\.json/, "raport powinien wskazać brak scales");
});

// ---------------- M15 (#113): ścieżka formatywna S4 — conditional-required (formative vs test) ----------------
// Dwa kierunki gałęzi if/then/else w paths.schema (advisor): (1) ścieżka NIE-formatywna bez pola test-owego MUSI
// failować (else wymaga kompletu), (2) flaga `formative` jest LOAD-BEARING — zdjęcie jej z S4 wrzuca ścieżkę w else
// i też failuje. Kierunek pozytywny (S4 z formative:true przechodzi) pokrywa sanity #62 na realnych danych (zawiera S4).

test("M15 (#113): ścieżka NIE-formatywna bez pola test-owego (finalTestQuestions) → walidator FAILUJE (gałąź else)", () => {
  const dataDir = copyData();
  const f = join(dataDir, "paths.json"); // wspólny (top-level data/)
  const doc = JSON.parse(readFileSync(f, "utf8"));
  delete doc.paths.S2.finalTestQuestions; // S2 nie jest formatywna → else wymaga finalTestQuestions
  writeFileSync(f, JSON.stringify(doc, null, 2));
  const r = runValidator(dataDir);
  assert.notEqual(r.code, 0, "ścieżka z testem bez finalTestQuestions MUSI failować (else conditional-required)");
  assert.match(r.output, /finalTestQuestions|required/i, "raport powinien wskazać brak wymaganego pola test-owego");
});

test("M15 (#113): flaga formative LOAD-BEARING — S4 bez formative:true wpada w gałąź else i FAILUJE", () => {
  const dataDir = copyData();
  const f = join(dataDir, "paths.json");
  const doc = JSON.parse(readFileSync(f, "utf8"));
  doc.paths.S4.formative = false; // zdejmij flagę → S4 traktowana jak ścieżka z testem, której pól (i M1..M12) nie ma
  writeFileSync(f, JSON.stringify(doc, null, 2));
  const r = runValidator(dataDir);
  assert.notEqual(r.code, 0, "S4 bez formative:true MUSI failować (flaga jest load-bearing dla wyłączenia kontraktu testu)");
});
