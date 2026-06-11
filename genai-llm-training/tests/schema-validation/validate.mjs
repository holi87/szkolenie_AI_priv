#!/usr/bin/env node
// Walidacja danych szkolenia GenAI/LLM + raport pokrycia (issue #13).
// Pure Node, zero zależności (zgodne z ADR-0002: brak build/runtime aplikacji).
// Uruchom: node tests/schema-validation/validate.mjs   (z roota repo)
// Exit 0 = OK, 1 = błędy walidacji. Działa lokalnie i w CI, bez backendu.

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
// validate.mjs leży w genai-llm-training/tests/schema-validation/ -> dane dwa poziomy wyżej w data/.
// VALIDATE_DATA_DIR pozwala wskazać inny katalog danych (test negatywny #25: walidacja MUSI failować
// na pustym module / błędnych danych — kopiujemy dane, psujemy jeden plik i sprawdzamy exit != 0).
const DATA = process.env.VALIDATE_DATA_DIR || join(HERE, "..", "..", "data");
const SCHEMAS = join(DATA, "schemas");

// Układ per-locale (ADR-0004, #78): struktura WSPÓLNA w DATA/ (modules.json/paths.json/golden-set.json/schemas),
// treść + etykiety per-locale w DATA/<lang>/. Locale = podkatalog z questions/ (kanoniczny "pl" musi istnieć).
function discoverLocales() {
  if (!existsSync(DATA)) return [];
  return readdirSync(DATA, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(DATA, e.name, "questions")))
    .map((e) => e.name)
    .sort();
}
const LOCALES = discoverLocales();
const CANON = LOCALES.includes("pl") ? "pl" : LOCALES[0]; // PL kanoniczny
// Katalogi UI (assets/i18n) — niezależne od locale DANYCH (ADR-0004): walidujemy kompletność kluczy osobno.
// VALIDATE_I18N_DIR pozwala wskazać inny katalog (test negatywny brakującego/sierocego klucza).
const I18N_DIR = process.env.VALIDATE_I18N_DIR || join(DATA, "..", "assets", "i18n");

const load = (p) => JSON.parse(readFileSync(p, "utf8"));

// ---------------- Minimalny walidator JSON Schema (subset draft-07) ----------------
// Wspiera: type, required, properties, additionalProperties:false, patternProperties,
// enum, const, pattern, minItems/maxItems/uniqueItems, minimum/maximum, minLength,
// items, $ref (#/definitions/*), allOf + if/then, anyOf. Nieznane słowa kluczowe ignorowane.
function typeOf(v) {
  if (Array.isArray(v)) return "array";
  if (v === null) return "null";
  if (Number.isInteger(v)) return "integer";
  return typeof v === "number" ? "number" : typeof v;
}
function resolveRef(ref, root) {
  if (!ref.startsWith("#/")) throw new Error("unsupported $ref " + ref);
  return ref.slice(2).split("/").reduce((o, k) => o[k], root);
}
function matches(data, schema, root) {
  return validate(data, schema, root, "$").length === 0;
}
function validate(data, schema, root, path) {
  if (schema.$ref) schema = resolveRef(schema.$ref, root);
  const e = [];
  const T = typeOf(data);
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const ok = types.includes(T) || (types.includes("number") && T === "integer");
    if (!ok) { e.push(`${path}: type ${T} != ${types.join("|")}`); return e; }
  }
  if (schema.enum && !schema.enum.includes(data)) e.push(`${path}: ${JSON.stringify(data)} not in enum`);
  if (schema.const !== undefined && data !== schema.const) e.push(`${path}: ${JSON.stringify(data)} != const ${JSON.stringify(schema.const)}`);
  if (typeof data === "string") {
    if (schema.pattern && !new RegExp(schema.pattern).test(data)) e.push(`${path}: "${data}" !~ /${schema.pattern}/`);
    if (schema.minLength != null && data.length < schema.minLength) e.push(`${path}: shorter than ${schema.minLength}`);
  }
  if (typeof data === "number") {
    if (schema.minimum != null && data < schema.minimum) e.push(`${path}: < ${schema.minimum}`);
    if (schema.maximum != null && data > schema.maximum) e.push(`${path}: > ${schema.maximum}`);
  }
  if (T === "array") {
    if (schema.minItems != null && data.length < schema.minItems) e.push(`${path}: items ${data.length} < ${schema.minItems}`);
    if (schema.maxItems != null && data.length > schema.maxItems) e.push(`${path}: items ${data.length} > ${schema.maxItems}`);
    if (schema.uniqueItems) {
      const seen = new Set(data.map((x) => JSON.stringify(x)));
      if (seen.size !== data.length) e.push(`${path}: items not unique`);
    }
    if (schema.items) data.forEach((it, i) => e.push(...validate(it, schema.items, root, `${path}[${i}]`)));
  }
  if (T === "object") {
    for (const r of schema.required || []) if (!(r in data)) e.push(`${path}: missing required "${r}"`);
    const props = schema.properties || {};
    const patt = schema.patternProperties || {};
    for (const [k, v] of Object.entries(data)) {
      if (props[k]) e.push(...validate(v, props[k], root, `${path}.${k}`));
      else {
        const pk = Object.keys(patt).find((rx) => new RegExp(rx).test(k));
        if (pk) e.push(...validate(v, patt[pk], root, `${path}.${k}`));
        else if (schema.additionalProperties === false) e.push(`${path}: unexpected property "${k}"`);
      }
    }
  }
  for (const sub of schema.allOf || []) {
    if (sub.if) {
      if (matches(data, sub.if, root)) { if (sub.then) e.push(...validate(data, sub.then, root, path)); }
      else if (sub.else) e.push(...validate(data, sub.else, root, path));
    } else e.push(...validate(data, sub, root, path));
  }
  if (schema.anyOf && !schema.anyOf.some((sub) => matches(data, sub, root)))
    e.push(`${path}: nie spełnia żadnego wariantu anyOf`);
  return e;
}

// ---------------- Stałe domenowe (wymagania 06/07) ----------------
// #171: bank = 116 pytań rdzenia M1..M12 (S1/S2/S3) + 36 pytań ścieżki P2 (MB1..MB6, Q117..Q152, dedykowane).
const EXPECTED_COUNTS = { M1:8,M2:9,M3:7,M4:8,M5:8,M6:10,M7:10,M8:12,M9:8,M10:14,M11:10,M12:12, MB1:6,MB2:6,MB3:6,MB4:6,MB5:6,MB6:6 };
// Moduły RDZENIA kursu QA — golden set (kalibracja dryfu) pozostaje 24 pytania wyłącznie z M1..M12 (2/moduł);
// MB poza goldenem (świeża pula bez historii kalibracji, pytania krytyczne MB2 i tak są 100%-bramkowane).
const CORE_MODULES = ["M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M11","M12"];
const TOTAL = 152;
// M14/ADR-0008: moduł diagnostyczny (scope="diagnostic", np. MSH/Skala Holaka) NIE ma puli pytań — wykluczamy go
// z kontroli zależnych od pytań. EXPECTED_COUNTS/golden/per-module iterują po kluczach EXPECTED_COUNTS (MSH tam
// nieobecny → exempt-by-construction); scope-checki iterują po Q (MSH ma 0 pytań → nieosiągalny). Jedyna pętla
// wymagająca JAWNEJ bramki to questionRange (czyta m.questionRange.count, którego diagnostyczny moduł nie ma).
const hasBankQuestions = (m) => Boolean(m) && m.scope !== "diagnostic";
// M15/ADR-0009: ścieżka FORMATYWNA (S4 Skala Holaka) — diagnoza + szkolenie, BEZ testu końcowego/scoringu/certyfikatu.
// Wykluczamy ją z kontroli zależnych od testu (pula>=finalTestQuestions, kwota dedykowanych, progi/bramki) — pól tych
// formatywna nie ma (conditional required w paths.schema), a iteracje czytałyby undefined (np. p.gates.length → crash).
const isFormative = (p) => Boolean(p) && p.formative === true;
// #171: rdzeń 41/46/23/6 + MB 16/14/6/0 (ścieżka świadomościowa P2 — bez L4, L4 pozostaje S3-only).
const DIFF_TARGET = { L1: 57, L2: 60, L3: 29, L4: 6 };
const SCENARIO_TYPES = new Set(["scenariusz", "scenariusz_decyzyjny"]);
const TECHNICAL_MODULES = new Set(["M4", "M5", "M6", "M12"]);
const GOLDEN_DIFF = { L1: 8, L2: 10, L3: 5, L4: 1 };
// Locale-aware prefiks konserwatywnego komunikatu pytania krytycznego (ADR-0004 D-policy; #80).
// Treść jest tłumaczona per-locale, ale MUSI zaczynać się od ostrzeżenia bezpieczeństwa właściwego dla języka.
const CRITICAL_PREFIX = {
  pl: "To jest błąd bezpieczeństwa.", en: "This is a security error.",
  es: "Esto es un error de seguridad.", fr: "Ceci est une erreur de sécurité.", // M17 (#126–#131)
  de: "Dies ist ein Sicherheitsfehler.", it: "Questo è un errore di sicurezza.",
  uk: "Це помилка безпеки.", vi: "Đây là lỗi bảo mật.",
};
// Pola SCORINGOWE pytania — muszą być IDENTYCZNE między locale (parytet strukturalny, PL kanon).
const PARITY_FIELDS = ["correct", "difficulty", "points", "paths", "isCritical", "golden", "type", "module"];
// Lint danych syntetycznych (#64): defense-in-depth, by realne PII/sekrety nie trafiły do repo.
// E-mail egzekwowany ALLOWLISTĄ domen (nie denylistą webmaili) — każdy adres spoza listy = błąd.
const EMAIL_RX = /[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
const EMAIL_ALLOW = /^(przyklad\.test|example\.(com|org|net)|[A-Za-z0-9.-]+\.(invalid|localhost))$/i;
const FORBIDDEN_PATTERNS = [
  { rx: /\b(?!00000000000)\d{11}\b/, why: "potencjalnie prawdziwy PESEL (11 cyfr inny niż placeholder)" },
  { rx: /\b\d{16}\b/, why: "potencjalny numer karty (16 cyfr)" },
  { rx: /\bPL\d{26}\b/i, why: "potencjalny IBAN (PL + 26 cyfr)" },
  // Telefon PL: grupowany (xxx xxx xxx / z prefiksem +48) lub samodzielne 9 cyfr; placeholdery „same cyfry" pomijane.
  { rx: /(?:\+?48[ -]?)?(?<!\d)\d{3}[ -]\d{3}[ -]\d{3}(?!\d)/, why: "potencjalny numer telefonu (PL, grupowany)" },
  { rx: /(?<!\d)(?!(\d)\1{8})\d{9}(?!\d)/, why: "potencjalny numer telefonu (PL, 9 cyfr)" },
  // Sekrety/tokeny API — uwaga: dydaktyczne tok_test_* są dozwolone (nie pasują do tych wzorców).
  { rx: /\b(sk-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{8,})\b/, why: "potencjalny sekret/token API" },
  { rx: /\bBearer\s+[A-Za-z0-9._-]{16,}\b/, why: "potencjalny token Bearer" },
];

/** Lint syntetyczny: denylist regexy + allowlista domen e-mail. Dopisuje błędy przez fail() z etykietą źródła. */
function lintSynthetic(blob, label) {
  for (const f of FORBIDDEN_PATTERNS) if (f.rx.test(blob)) fail(`${label}: ${f.why} — dane muszą być syntetyczne`);
  for (const m of blob.matchAll(EMAIL_RX)) {
    if (!EMAIL_ALLOW.test(m[1])) {
      fail(`${label}: realna domena e-mail "${m[1]}" (dozwolone tylko przyklad.test / example.* / *.invalid / *.localhost) — dane muszą być syntetyczne`);
      break;
    }
  }
}

const errs = [];
const warn = [];
const fail = (m) => errs.push(m);

// ---------------- Wczytaj dane + walidacja schematów ----------------
function checkSchema(file, schemaFile) {
  const dp = join(DATA, file), sp = join(SCHEMAS, schemaFile);
  if (!existsSync(dp)) { fail(`brak pliku danych: ${file}`); return null; }
  if (!existsSync(sp)) { fail(`brak schematu: ${schemaFile}`); return null; }
  const data = load(dp), schema = load(sp);
  const e = validate(data, schema, schema, file);
  e.forEach((x) => fail(`[schema ${file}] ${x}`));
  return data;
}

if (!CANON) fail("brak kanonicznego locale danych (oczekiwano katalogu data/pl/ z questions/)");
// Struktura WSPÓLNA (single-source): modules.json / paths.json. Treść + etykiety per-locale (kanon = CANON).
const modules = checkSchema("modules.json", "modules.schema.json");
const paths = checkSchema("paths.json", "paths.schema.json");
const scenarios = CANON ? checkSchema(`${CANON}/scenarios.json`, "scenarios.schema.json") : null;
const rubrics = CANON ? checkSchema(`${CANON}/rubrics.json`, "rubrics.schema.json") : null;
// Etykiety per-locale (carve-out). Schemat wymusza komplet ID (M1..M12 / S1..S3) → brak etykiety = błąd.
for (const lang of LOCALES) {
  checkSchema(`${lang}/modules.labels.json`, "modules-labels.schema.json");
  checkSchema(`${lang}/paths.labels.json`, "paths-labels.schema.json");
  // M17 follow-up (#133): treść scenariuszy/rubryk non-CANON też bramkowana schematem + lintem syntetycznym
  // (dotąd tylko parytet ID — parityIdSet; ta sama rodzina luk co GAP module-content domknięty w M17). CANON
  // walidowany osobno wyżej (linie 176-177) wraz z kontrolami strukturalnymi/progowymi.
  if (lang !== CANON) {
    const sc = checkSchema(`${lang}/scenarios.json`, "scenarios.schema.json");
    if (sc) lintSynthetic(JSON.stringify(sc), `${lang}/scenarios.json`);
    const ru = checkSchema(`${lang}/rubrics.json`, "rubrics.schema.json");
    if (ru) lintSynthetic(JSON.stringify(ru), `${lang}/rubrics.json`);
  }
}

// Parsowalność WSZYSTKICH schematów objętych CI (kontrakt = data/schemas/**, także podkatalogi
// i schematy bez pliku danych, np. progress) — malformowany kontrakt nie może przejść niezauważony.
function walkSchemaFiles(dir) {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkSchemaFiles(p));
    else if (ent.name.endsWith(".schema.json")) out.push(p);
  }
  return out;
}
for (const sp of walkSchemaFiles(SCHEMAS)) {
  try { load(sp); } catch (e) { fail(`[schema ${relative(SCHEMAS, sp)}] niepoprawny JSON: ${e.message}`); }
}

// Bank pytań jest shardowany per moduł: data/questions/mNN.json (każdy <800 LOC).
// Każdy plik waliduje się przeciw questions.schema.json (envelope {questions:[...]}).
// Pytania scalamy w jeden zbiór do kontroli pokrycia/agregatów.
function loadQuestions(locale) {
  const QDIR = join(DATA, locale, "questions");
  if (!existsSync(QDIR)) return null;
  // #171: shardy rdzenia m01..m12.json + shardy P2 mb1..mb6.json (moduł derywowany z nazwy pliku).
  const files = readdirSync(QDIR).filter((f) => /^(m\d{2}|mb\d)\.json$/.test(f)).sort();
  if (files.length === 0) return null;
  const schema = load(join(SCHEMAS, "questions.schema.json"));
  const all = [];
  for (const f of files) {
    const doc = load(join(QDIR, f));
    validate(doc, schema, schema, `${locale}/questions/${f}`).forEach((x) => fail(`[schema ${locale}/questions/${f}] ${x}`));
    const modFromName = f.startsWith("mb") ? "MB" + f.slice(2, 3) : "M" + String(parseInt(f.slice(1, 3), 10));
    for (const q of doc.questions || []) {
      if (q.module !== modFromName) fail(`${locale}/questions/${f}: ${q.id} ma module=${q.module} != ${modFromName} (plik ma zawierać tylko swój moduł)`);
    }
    all.push(...(doc.questions || []));
  }
  return all;
}
// Pokrycie/agregaty liczone na kanonicznym banku (PL). Parytet pozostałych locale = #80.
const Qall = CANON ? loadQuestions(CANON) : null;
const goldenDoc = existsSync(join(DATA, "golden-set.json")) ? checkSchema("golden-set.json", "golden-set.schema.json") : null;

const report = [];
report.push("=== WALIDACJA DANYCH SZKOLENIA GenAI/LLM ===");

// ---------------- Pokrycie pytań ----------------
if (Qall) {
  const Q = Qall;
  const ids = Q.map((q) => q.id);
  // unikalne id
  if (new Set(ids).size !== ids.length) fail("duplikaty id w questions.json");
  // total
  if (Q.length !== TOTAL) fail(`liczba pytań ${Q.length} != ${TOTAL}`);
  // per-module
  const byMod = {};
  for (const q of Q) byMod[q.module] = (byMod[q.module] || 0) + 1;
  for (const [m, c] of Object.entries(EXPECTED_COUNTS)) if (byMod[m] !== c) fail(`${m}: ${byMod[m] || 0} pytań != ${c}`);
  // difficulty global
  const D = { L1: 0, L2: 0, L3: 0, L4: 0 };
  for (const q of Q) D[q.difficulty]++;
  for (const [l, t] of Object.entries(DIFF_TARGET)) if (D[l] !== t) fail(`trudność ${l}=${D[l]} != ${t}`);
  // L4 tylko ścieżki S3-only (wymagania/07: L4 używane głównie dla S3) — twardy błąd, nie ostrzeżenie
  for (const q of Q) if (q.difficulty === "L4" && JSON.stringify(q.paths) !== '["S3"]') fail(`${q.id}: pytanie L4 musi być wyłącznie S3-only, ma paths=${JSON.stringify(q.paths)}`);
  // scenario share
  const scn = Q.filter((q) => SCENARIO_TYPES.has(q.type)).length;
  if (scn / TOTAL < 0.35) fail(`pytania scenariuszowe/decyzyjne ${scn}/${TOTAL} = ${(scn/TOTAL*100).toFixed(1)}% < 35%`);
  // criticals — prefiks bezpieczeństwa LOCALE-AWARE (kanon); pozostałe locale sprawdza checkContentParity.
  // #171: krytyczne żyją w modułach bezpieczeństwa M10 (rdzeń S1-S3) i MB2 (P2). Liczność DERYWOWANA z
  // modules.json (criticalQuestions), pokrycie ścieżek DERYWOWANE z paths.json: pytanie krytyczne musi
  // obejmować KAŻDĄ nieformatywną ścieżkę zawierającą jego moduł (test ścieżki wymusza 100% jej krytycznych).
  const CRITICAL_MODULES = ["M10", "MB2"];
  const crit = Q.filter((q) => q.isCritical);
  if (modules) {
    for (const mid of CRITICAL_MODULES) {
      const declared = (modules.modules.find((m) => m.id === mid) || {}).criticalQuestions || 0;
      const got = crit.filter((q) => q.module === mid).length;
      if (declared === 0) fail(`${mid}: moduł krytyczny bez criticalQuestions w modules.json`);
      if (got !== declared) fail(`pytania krytyczne ${mid}: ${got} != ${declared} (criticalQuestions w modules.json)`);
    }
  }
  const canonPrefix = CRITICAL_PREFIX[CANON] || CRITICAL_PREFIX.pl;
  for (const q of crit) {
    if (!CRITICAL_MODULES.includes(q.module)) fail(`${q.id} krytyczne poza modułami bezpieczeństwa (${CRITICAL_MODULES.join(", ")})`);
    if (q.type !== "scenariusz_decyzyjny") warn.push(`${q.id} krytyczne nie jest scenariusz_decyzyjny`);
    if ((q.correct || []).length !== 1) fail(`${q.id} krytyczne musi mieć dokładnie 1 poprawną odpowiedź`);
    if (!(q.feedbackIncorrect || "").startsWith(canonPrefix)) fail(`${q.id} krytyczne: feedbackIncorrect musi zaczynać się od konserwatywnego komunikatu „${canonPrefix}" (osłabiony komunikat bezpieczeństwa nie może przejść CI)`);
    if (paths) {
      const owning = Object.entries(paths.paths)
        .filter(([, p]) => !isFormative(p) && p.modules && p.modules[q.module])
        .map(([pid]) => pid);
      for (const pid of owning) if (!q.paths.includes(pid)) fail(`${q.id} krytyczne nie obejmuje ścieżki ${pid} (moduł ${q.module} należy do tej ścieżki — jej test wymusza 100% krytycznych)`);
    }
  }
  // type-specific answer integrity
  for (const q of Q) {
    if (["single_choice", "multiple_choice", "scenariusz", "scenariusz_decyzyjny"].includes(q.type)) {
      const optIds = new Set((q.options || []).map((o) => o.id));
      if (optIds.size !== (q.options || []).length) fail(`${q.id}: zduplikowane id opcji`);
      for (const c of q.correct || []) if (!optIds.has(c)) fail(`${q.id}: correct "${c}" spoza options`);
      if (q.type === "single_choice" || q.type === "scenariusz_decyzyjny") { if ((q.correct||[]).length !== 1) fail(`${q.id}: ${q.type} wymaga 1 poprawnej`); }
      if (q.type === "multiple_choice" && (q.correct||[]).length < 2) fail(`${q.id}: multiple_choice wymaga >=2 poprawnych`);
    }
    if (q.type === "dopasowanie" && (q.pairs || []).length < 3) warn.push(`${q.id}: dopasowanie ma <3 par`);
    if (q.type === "kolejnosc_procesu" && (q.sequence || []).length < 3) warn.push(`${q.id}: kolejnosc ma <3 kroków`);
  }
  // modules.json: dokładnie M1..M12, unikalne id i order, zakresy from/to == pierwsze/ostatnie pytanie
  if (modules) {
    const mids = modules.modules.map((m) => m.id);
    const orders = modules.modules.map((m) => m.order);
    if (new Set(mids).size !== mids.length) fail(`modules.json: zduplikowane id modułów`);
    if (new Set(orders).size !== orders.length) fail(`modules.json: zduplikowane order`);
    for (const id of Object.keys(EXPECTED_COUNTS)) if (!mids.includes(id)) fail(`modules.json: brak modułu ${id}`);
    // #171: poziomy ścieżki „AI z QA" (S1/S2/S3) muszą deklarować KOMPLET rdzenia M1..M12 (dawny wymóg
    // paths.schema przeniesiony tu — schemat nie może go wymuszać dla P2, która ma własny zestaw MB1..MB6).
    if (paths) {
      for (const pid of ["S1", "S2", "S3"]) {
        const pm = (paths.paths[pid] || {}).modules || {};
        for (const id of CORE_MODULES) if (!pm[id]) fail(`ścieżka ${pid}: brak modułu rdzenia ${id} w paths.json (poziomy AI z QA wymagają kompletu M1..M12)`);
      }
    }
    for (const m of modules.modules) {
      if (!hasBankQuestions(m) || !m.questionRange) continue; // diagnostyczny (MSH) — bez puli; malformowany core/dedicated bez questionRange łapie schemat (czysty błąd, nie crash) (M14/ADR-0008)
      const inMod = Q.filter((q) => q.module === m.id).map((q) => q.id).sort();
      if (inMod.length !== m.questionRange.count) fail(`${m.id}: questionRange.count ${m.questionRange.count} != ${inMod.length}`);
      if (inMod.length) {
        if (inMod[0] !== m.questionRange.from) fail(`${m.id}: questionRange.from ${m.questionRange.from} != pierwsze pytanie ${inMod[0]}`);
        if (inMod[inMod.length - 1] !== m.questionRange.to) fail(`${m.id}: questionRange.to ${m.questionRange.to} != ostatnie pytanie ${inMod[inMod.length - 1]}`);
      }
    }
  }
  // referencje paths istnieją w macierzy (każda ścieżka pytania ma moduł w curriculum)
  // (spójność z paths.json: pytanie modułu X dla ścieżki S => X jest w paths.S.modules)
  if (paths) {
    for (const q of Q) for (const p of q.paths) {
      const pm = paths.paths[p] && paths.paths[p].modules[q.module];
      if (!pm) fail(`${q.id}: ścieżka ${p} nie zawiera modułu ${q.module} w paths.json`);
    }
    // Pokrycie pul per ścieżka (M13-2 #95): pula ścieżki P = pytania z P w paths[]. Test końcowy ścieżki
    // losuje z TEJ puli, więc pula MUSI mieć >= finalTestQuestions (inaczej testu nie da się złożyć). Wymóg
    // DERYWOWANY z paths.json (deklaracja), egzekwowany na banku — fundament pod dedykowane, rozłączne
    // pule pytań per persona (ADR-0006 #94). Dziś S1⊆S2⊆S3; ten inwariant przeżyje rozłączne pule (M13-3..6).
    const poolReport = [];
    for (const [pid, p] of Object.entries(paths.paths)) {
      if (isFormative(p)) continue; // formatywna (S4) nie ma testu końcowego — pula/kwota nieistotne (M15/ADR-0009)
      const pool = Q.filter((q) => (q.paths || []).includes(pid));
      if (pool.length < p.finalTestQuestions) fail(`ścieżka ${pid}: pula pytań ${pool.length} < finalTestQuestions ${p.finalTestQuestions} (test końcowy nie do złożenia z dopasowanej puli)`);
      poolReport.push(`${pid}=${pool.length}/${p.finalTestQuestions}`);
    }
    report.push(`Pule per ścieżka (pula/test): ${poolReport.join(" ")} — pula >= test (ADR-0006; fundament dedykowanych pul #95)`);

    // Model hybrydowy (M13/ADR-0006 #94): rdzeń (scope=core) vs dedykowane (scope=dedicated).
    // - dedykowane: KAŻDE pytanie należy do dokładnie 1 ścieżki → pule rozłączne per persona;
    // - rdzeń: pytanie wspólne wszystkim ścieżkom (>=2 ścieżki w paths).
    // Plus: pula dedykowanych każdej ścieżki >= dedicatedQuestionsMin (kwota wymuszana w teście przez test-engine),
    //   oraz dedicatedQuestionsMin + krytyczne <= finalTestQuestions (test musi być wykonalny).
    if (modules) {
      const scopeById = Object.fromEntries(modules.modules.map((m) => [m.id, m.scope]));
      for (const q of Q) {
        const sc = scopeById[q.module];
        if (sc === "dedicated" && q.paths.length !== 1) fail(`${q.id}: moduł ${q.module} dedykowany — pytanie musi należeć do dokładnie 1 ścieżki (rozłączność), ma paths=${JSON.stringify(q.paths)}`);
        if (sc === "core" && q.paths.length < 2) fail(`${q.id}: moduł ${q.module} rdzeniowy — pytanie musi być wspólne (>=2 ścieżki), ma paths=${JSON.stringify(q.paths)}`);
      }
      const dedReport = [];
      for (const [pid, p] of Object.entries(paths.paths)) {
        if (isFormative(p)) continue; // formatywna (S4/P1) — bez testu, kwota dedykowanych nieistotna (M15/ADR-0009)
        const ded = Q.filter((q) => scopeById[q.module] === "dedicated" && q.paths.includes(pid)).length;
        const min = p.dedicatedQuestionsMin || 0;
        // #171: krytyczne liczone PER ŚCIEŻKA (test wymusza tylko krytyczne z puli ścieżki) — globalna liczba
        // zawyżałaby wymóg (krytyczne MB2/P2 nie wchodzą do testów S1-S3 i odwrotnie).
        const critP = Q.filter((q) => q.isCritical && q.paths.includes(pid)).length;
        if (ded < min) fail(`ścieżka ${pid}: pula dedykowanych ${ded} < dedicatedQuestionsMin ${min} (kwota dedykowanych niewykonalna)`);
        if (min + critP > p.finalTestQuestions) fail(`ścieżka ${pid}: dedicatedQuestionsMin ${min} + krytyczne ${critP} > finalTestQuestions ${p.finalTestQuestions} (test niewykonalny)`);
        dedReport.push(`${pid}=${ded}/${min}`);
      }
      report.push(`Dedykowane per ścieżka (pula/kwota): ${dedReport.join(" ")} — pule rozłączne (M13/ADR-0006 #94)`);
    }
  }
  // lint danych syntetycznych
  for (const q of Q) {
    const blob = JSON.stringify(q);
    lintSynthetic(blob, q.id);
  }
  report.push(`Pytania: ${Q.length} | per-moduł OK | trudność L1=${D.L1}/L2=${D.L2}/L3=${D.L3}/L4=${D.L4}`);
  report.push(`Scenariuszowe/decyzyjne: ${scn}/${TOTAL} = ${(scn/TOTAL*100).toFixed(1)}%`);
  report.push(`Krytyczne (M10): ${crit.map((q)=>q.id).join(",")}`);
  const pillarCount = {}; for (const q of Q) pillarCount[q.pillar] = (pillarCount[q.pillar]||0)+1;
  report.push(`Filary: ${Object.entries(pillarCount).map(([k,v])=>`${k}=${v}`).join(" ")}`);
  // rozkład pozycji poprawnej + lint klastrowania (anti-gaming, doc 07; RND-2 #67).
  // „Pozycja" = indeks poprawnej opcji w q.options (litera A/B/C..; konwencja banku id==pozycja, ale liczymy z indeksu —
  // odporne na ewentualne przyszłe pytanie z opcjami nie po kolei). Render RND-1 (#66) rotuje pozycje przy wyświetlaniu,
  // więc skos danych NIE dociera do uczącego się; ten lint to higiena autorska + bezpiecznik dla pytań z lockOptionOrder.
  // Klastrowanie daje OSTRZEŻENIE (warn.push), NIE błąd — estetyka autorska nie blokuje CI (AGENTS: fail-safe dotyczy scoringu/krytycznych/certyfikatu).
  const POS_TYPES = new Set(["single_choice","scenariusz_decyzyjny","scenariusz"]);
  const RUN_WARN = 4;     // >=4 ta sama pozycja z rzędu w module (literalna obawa: „3x A potem 3x B...")
  const SKEW_WARN = 0.5;  // najczęstsza pozycja > 50% udziału w module
  const posLetter = (q) => { const i = (q.options||[]).findIndex((o)=>o.id===(q.correct||[])[0]); return i>=0 ? String.fromCharCode(65+i) : "?"; };
  const posDist = {};
  const perMod = {};      // module -> [pozycje w naturalnej kolejności pliku]
  for (const q of Q) {
    if (!(POS_TYPES.has(q.type) && (q.correct||[]).length===1)) continue;
    const p = posLetter(q);
    posDist[p] = (posDist[p]||0)+1;
    (perMod[q.module] || (perMod[q.module]=[])).push(p);
  }
  report.push(`Pozycje correct (1-poprawne): ${Object.entries(posDist).map(([k,v])=>`${k}=${v}`).join(" ")} — UWAGA: wyświetlanie MUSI rotować opcje (anti-gaming, doc 07; engine M3 #17, render RND-1 #66)`);
  const clustered = [];
  for (const [m, seq] of Object.entries(perMod)) {
    if (seq.length < RUN_WARN) continue;
    let maxRun = 1, run = 1, runPos = seq[0];
    for (let i = 1; i < seq.length; i += 1) { if (seq[i] === seq[i-1]) { run += 1; if (run > maxRun) { maxRun = run; runPos = seq[i]; } } else run = 1; }
    const cnt = {}; for (const p of seq) cnt[p] = (cnt[p]||0)+1;
    const [topPos, topN] = Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
    const share = topN / seq.length;
    if (maxRun >= RUN_WARN || share > SKEW_WARN) clustered.push(`${m}: seria ${runPos}=${maxRun}, skos ${topPos} ${(share*100).toFixed(0)}% (${topN}/${seq.length})`);
  }
  if (clustered.length) warn.push(`Klastrowanie pozycji poprawnej (RND-2 #67; próg: seria>=${RUN_WARN} lub skos>${SKEW_WARN*100}%): ${clustered.join(" | ")} — RND-1 (#66) rotuje pozycje przy renderze (niewidoczne dla uczącego się); to higiena autorska / bezpiecznik dla lockOptionOrder. Rozważ redystrybucję pozycji w danych.`);
} else {
  fail("brak banku pytań (data/questions/mNN.json) — na etapie #13/CI bank 116 pytań jest wymagany (nie pomijać)");
}

// ---------------- Golden set ----------------
if (goldenDoc) {
  const g = goldenDoc.goldenSet;
  const gids = g.questionIds;
  if (Qall) {
    const map = new Map(Qall.map((q) => [q.id, q]));
    const gq = [];
    for (const id of gids) {
      const q = map.get(id);
      if (!q) { fail(`golden: id ${id} nie istnieje w questions.json`); continue; }
      if (!q.golden) fail(`golden: ${id} nie ma golden:true w questions.json`);
      gq.push(q);
    }
    // wszystkie golden:true z banku są na liście
    const bankGolden = Qall.filter((q) => q.golden).map((q) => q.id).sort();
    if (JSON.stringify(bankGolden) !== JSON.stringify([...gids].sort())) fail(`golden: lista golden-set.json != pytania golden:true w banku`);
    if (gq.length === 24) {
      const gMod = {}; for (const q of gq) gMod[q.module] = (gMod[q.module]||0)+1;
      // #171: golden pokrywa wyłącznie rdzeń M1..M12 (CORE_MODULES) — moduły MB poza goldenem (bez historii kalibracji).
      for (const m of CORE_MODULES) if (gMod[m] !== 2) fail(`golden: ${m}=${gMod[m]||0} != 2 (po 2/moduł)`);
      for (const q of gq) if (!CORE_MODULES.includes(q.module)) fail(`golden: ${q.id} z modułu ${q.module} spoza rdzenia M1..M12`);
      const gD = { L1:0,L2:0,L3:0,L4:0 }; for (const q of gq) gD[q.difficulty]++;
      for (const [l,t] of Object.entries(GOLDEN_DIFF)) if (gD[l] !== t) fail(`golden trudność ${l}=${gD[l]} != ${t}`);
      const gSec = gq.filter((q)=>q.pillar==="security_governance").length;
      const gQA = gq.filter((q)=>q.pillar==="qa_practice").length;
      const gTech = gq.filter((q)=>TECHNICAL_MODULES.has(q.module)).length;
      if (gSec < 5) fail(`golden: bezpieczeństwo ${gSec} < 5`);
      if (gQA < 4) fail(`golden: QA ${gQA} < 4`);
      if (gTech < 4) fail(`golden: techniczne ${gTech} < 4`);
      const gPaths = new Set(); for (const q of gq) q.paths.forEach((p)=>gPaths.add(p));
      if (gPaths.size !== 3) fail(`golden: pokrycie ścieżek ${[...gPaths]} != 3`);
      if (new Set(gq.map((q)=>q.pillar)).size !== 3) fail(`golden: pokrycie filarów != 3`);
      // pytania krytyczne są 100%-bramkowane i stale eksponowane -> ~100% poprawnych -> brak
      // mocy dyskryminacyjnej; nie nadają się do golden setu (kontrola dryfu trudności, doc 07).
      if (gq.some((q)=>q.isCritical)) fail(`golden: zawiera pytanie krytyczne — krytyczne nie różnicują (100%-bramkowane, stale eksponowane) i nie powinny wchodzić do golden setu`);
      report.push(`Golden: 24 | po 2/moduł | L1=${gD.L1}/L2=${gD.L2}/L3=${gD.L3}/L4=${gD.L4} | sec=${gSec} QA=${gQA} tech=${gTech} | filary=3 ścieżki=3`);
    }
  }
  if (g.size !== 24) fail(`golden: size ${g.size} != 24`);
  if (gids.length !== 24) fail(`golden: ${gids.length} id != 24`);
} else {
  fail("brak golden-set.json — na etapie #13/CI golden set 24 pytań jest wymaganym kontraktem (nie pomijać)");
}

// ---------------- Kompletność katalogów UI (assets/i18n) — D-policy #80 ----------------
// Każdy locale musi mieć DOKŁADNIE ten sam ZBIÓR kluczy co PL (kanon): brak braków, brak sierot.
// Sprawdzamy ZBIÓR KLUCZY, nie niepustość wartości — pusty szkielet en.json jest poprawny (fundament).
function checkI18nCatalogs() {
  if (!existsSync(I18N_DIR)) return; // brak katalogów UI (np. izolowany test danych) — pomiń
  const files = readdirSync(I18N_DIR).filter((f) => /^[a-z]{2}\.json$/.test(f));
  const catalogs = {};
  for (const f of files) {
    try { catalogs[f.slice(0, 2)] = load(join(I18N_DIR, f)); }
    catch (e) { fail(`[i18n ${f}] niepoprawny JSON: ${e.message}`); }
  }
  const pl = catalogs.pl;
  if (!pl) { fail("brak kanonicznego katalogu UI assets/i18n/pl.json"); return; }
  // Locale z KOMPLETEM danych (data/<lang>/) MUSI mieć plik katalogu UI. Bez tego pętla niżej (po istniejących
  // plikach) nigdy by go nie zobaczyła → locale ze 100% nieprzetłumaczonym UI (cichy fallback PL) przeszedłby
  // CI. To luka gorsza niż pusta wartość, którą łapiemy poniżej — zamykamy ją twardo (#81).
  for (const lang of LOCALES) {
    if (lang === CANON) continue;
    if (!catalogs[lang]) fail(`brak katalogu UI assets/i18n/${lang}.json — locale ${lang} ma dane data/${lang}/, więc wymaga katalogu UI (inaczej 100% nieprzetłumaczone, cichy fallback PL)`);
  }
  const keySet = (o) => new Set(Object.keys(o).filter((k) => k !== "_meta"));
  const plKeys = keySet(pl);
  for (const [lang, cat] of Object.entries(catalogs)) {
    if (lang === "pl") continue;
    const k = keySet(cat);
    for (const key of plKeys) if (!k.has(key)) fail(`i18n ${lang}.json: brak klucza UI "${key}" (locale niekompletny wzgl. pl)`);
    for (const key of k) if (!plKeys.has(key)) fail(`i18n ${lang}.json: klucz-sierota "${key}" (nieobecny w pl.json)`);
    // Locale z KOMPLETEM danych (data/<lang>/) musi mieć katalog UI w PEŁNI przetłumaczony — nie szkielet.
    // #80 sprawdza tylko ZBIÓR kluczy; puste wartości fallbackują cicho do PL i przeszłyby niezauważone (#81).
    if (LOCALES.includes(lang)) {
      for (const key of plKeys) {
        const v = cat[key];
        if (typeof v !== "string" || v.trim() === "") {
          fail(`i18n ${lang}.json: pusta wartość dla "${key}" — locale ${lang} ma dane data/${lang}/, więc katalog UI musi być przetłumaczony (nie pusty szkielet)`);
        }
      }
    }
  }
  report.push(`Katalogi UI: ${Object.keys(catalogs).sort().join(",")} | klucze PL=${plKeys.size} (kompletność zbioru wzgl. pl)`);
}
checkI18nCatalogs();

// ---------------- Parytet strukturalny treści między locale (PL kanon) — D-policy #80 ----------------
// Pola scoringowe pytań MUSZĄ być identyczne między locale (różni się tylko tekst). Twardy błąd (exit 1).
function parityIdSet(file, idsOf, label) {
  const canonPath = join(DATA, CANON, file);
  if (!existsSync(canonPath)) return;
  const canonIds = new Set(idsOf(load(canonPath)));
  for (const lang of LOCALES) {
    if (lang === CANON) continue;
    const fp = join(DATA, lang, file);
    if (!existsSync(fp)) { fail(`parytet ${lang}: brak ${file}`); continue; }
    const ids = new Set(idsOf(load(fp)));
    for (const id of canonIds) if (!ids.has(id)) fail(`parytet ${lang}: brak ${label} ${id} w ${file}`);
    for (const id of ids) if (!canonIds.has(id)) fail(`parytet ${lang}: ${label} sierota ${id} w ${file} (spoza kanonu)`);
  }
}
function checkContentParity() {
  if (!Qall || !CANON) return;
  const canonById = new Map(Qall.map((q) => [q.id, q]));
  for (const lang of LOCALES) {
    if (lang === CANON) continue;
    const lq = loadQuestions(lang);
    if (!lq) { fail(`parytet ${lang}: brak banku pytań`); continue; }
    const lById = new Map(lq.map((q) => [q.id, q]));
    for (const id of canonById.keys()) if (!lById.has(id)) fail(`parytet ${lang}: brak pytania ${id} (kanon ${CANON})`);
    for (const q of lq) {
      const c = canonById.get(q.id);
      if (!c) { fail(`parytet ${lang}: pytanie ${q.id} spoza kanonu ${CANON}`); continue; }
      for (const f of PARITY_FIELDS) {
        if (JSON.stringify(q[f]) !== JSON.stringify(c[f]))
          fail(`parytet ${lang}: ${q.id}.${f}=${JSON.stringify(q[f])} != kanon ${JSON.stringify(c[f])} (pole scoringowe musi być identyczne)`);
      }
    }
    const prefix = CRITICAL_PREFIX[lang];
    if (!prefix) fail(`parytet ${lang}: brak prefiksu krytycznego CRITICAL_PREFIX dla locale ${lang}`);
    else for (const q of lq.filter((x) => x.isCritical)) {
      if (!(q.feedbackIncorrect || "").startsWith(prefix)) fail(`parytet ${lang}: ${q.id} krytyczne feedbackIncorrect musi zaczynać się od „${prefix}" (locale-aware)`);
    }
    report.push(`Parytet ${lang}↔${CANON}: ${lq.length} pytań — pola scoringowe + prefiks krytyczny OK`);
  }
  parityIdSet("rubrics.json", (d) => (d.rubrics || []).map((r) => r.id), "rubryki");
  parityIdSet("scenarios.json", (d) => (d.scenarios || []).map((s) => s.id), "scenariusza");
}
checkContentParity();

// ---------------- Progi ścieżek (raport) ----------------
if (paths) {
  for (const [pid, p] of Object.entries(paths.paths)) {
    if (isFormative(p)) { report.push(`Ścieżka ${pid}: FORMATYWNA (diagnoza + szkolenie) — bez testu/progu/bramek/certyfikatu (M15/ADR-0009)`); continue; }
    report.push(`Ścieżka ${pid}: próg ${p.passThresholdPct}% | test ${p.finalTestQuestions} pyt. | krytyczne ${p.criticalQuestionsRequiredPct}% | zadania ${p.practicalTasks} | bramki ${p.gates.length}`);
  }
}

// ---------------- Scenariusze (lint syntetyczny — cały obiekt, nie tylko data) ----------------
if (scenarios) {
  for (const s of scenarios.scenarios) {
    const blob = JSON.stringify(s);
    lintSynthetic(blob, `scenariusz ${s.id}`);
  }
  report.push(`Scenariusze: ${scenarios.scenarios.length}`);
}

// ---------------- Rubryki: próg osiągalny (cross-field, poza draft-07) + referencje w bramkach ----------------
if (rubrics) {
  // passThreshold <= scaleMax — próg niemożliwy do osiągnięcia tworzyłby martwą bramkę zaliczenia.
  for (const r of rubrics.rubrics) {
    if (typeof r.passThreshold === "number" && typeof r.scaleMax === "number" && r.passThreshold > r.scaleMax)
      fail(`rubryka ${r.id}: passThreshold ${r.passThreshold} > scaleMax ${r.scaleMax} (próg niemożliwy do osiągnięcia)`);
  }
}
if (paths && rubrics) {
  const rubricIds = new Set(rubrics.rubrics.map((r) => r.id));
  for (const [pid, p] of Object.entries(paths.paths)) {
    for (const g of p.gates || []) {
      if (g.rubric && !rubricIds.has(g.rubric)) fail(`ścieżka ${pid}: bramka ${g.type} referuje nieistniejącą rubrykę "${g.rubric}" (dostępne: ${[...rubricIds].join(", ")})`);
    }
  }
  report.push(`Rubryki: ${rubrics.rubrics.length} (referencje bramek OK; progi <= skala)`);
}

// ---------------- Treść modułów (module-content/mNN.json) — schemat + integralność + lint syntetyczny ----------------
// Treść modułów M4: po jednym pliku na moduł, walidowana przeciw module-content.schema.json.
// Integralność: klucze interakcji wskazują na istniejące kategorie/opcje; zadanie praktyczne → istniejąca rubryka.
function loadModuleContent(locale) {
  const CDIR = join(DATA, locale, "module-content");
  if (!existsSync(CDIR)) { fail(`brak treści modułów (data/${locale}/module-content/) — wymaga 12 plików mNN.json + mshp.json + msho.json + msk1..msk4.json + mb1..mb6.json + md1..md6.json`); return null; }
  const schema = load(join(SCHEMAS, "module-content.schema.json"));
  const rubricIds = new Set((rubrics ? rubrics.rubrics : []).map((r) => r.id));
  const rubricById = new Map((rubrics ? rubrics.rubrics : []).map((r) => [r.id, r]));
  const present = [];
  // 12 modułów kursu (m01..m12 → M1..M12) + 2 moduły diagnostyczne Skali Holaka (mshp.json → MSHP osoba v2.1p,
  // msho.json → MSHO organizacja v2.1e; M16/#122 rozdzielone z dawnego MSH; ADR-0008) + 4 moduły szkoleniowe
  // ścieżki formatywnej S4 (msk1..msk4.json → MSK1..MSK4; M15/ADR-0009). MSHP+MSHO+MSK bez puli pytań.
  const contentFiles = [
    ...Array.from({ length: 12 }, (_, i) => ({ f: `m${String(i + 1).padStart(2, "0")}.json`, expectMod: "M" + (i + 1) })),
    { f: "mshp.json", expectMod: "MSHP" },
    { f: "msho.json", expectMod: "MSHO" },
    ...Array.from({ length: 4 }, (_, i) => ({ f: `msk${i + 1}.json`, expectMod: "MSK" + (i + 1) })),
    // #171: P2 „Bezpieczne używanie AI" (MB1..MB6, z pulą pytań) + P1 „AI w domu" (MD1..MD6, formatywne bez puli).
    ...Array.from({ length: 6 }, (_, i) => ({ f: `mb${i + 1}.json`, expectMod: "MB" + (i + 1) })),
    ...Array.from({ length: 6 }, (_, i) => ({ f: `md${i + 1}.json`, expectMod: "MD" + (i + 1) })),
  ];
  for (const { f, expectMod } of contentFiles) {
    const fp = join(CDIR, f);
    if (!existsSync(fp)) { fail(`brak treści modułu: ${locale}/module-content/${f}`); continue; }
    const c = load(fp);
    validate(c, schema, schema, `${locale}/module-content/${f}`).forEach((x) => fail(`[schema ${locale}/module-content/${f}] ${x}`));
    if (c.module !== expectMod) fail(`${locale}/module-content/${f}: module=${c.module} != ${expectMod}`);
    present.push(c.module);
    // lint syntetyczny — cały obiekt treści (żadnych realnych PII/domen)
    const blob = JSON.stringify(c);
    lintSynthetic(blob, `${locale}/module-content/${f}`);
    // integralność interakcji
    const ix = c.interaction || {};
    if (ix.kind === "classify") {
      const catIds = new Set((ix.categories || []).map((k) => k.id));
      for (const it of ix.items || []) if (!catIds.has(it.correctCategory)) fail(`module-content/${f}: item ${it.id} correctCategory "${it.correctCategory}" spoza categories`);
    } else if (ix.kind === "rubric") {
      for (const cr of ix.criteria || []) {
        const optIds = new Set((cr.options || []).map((o) => o.id));
        for (const ok of cr.correctOptionIds || []) if (!optIds.has(ok)) fail(`module-content/${f}: kryterium ${cr.id} correctOptionId "${ok}" spoza options`);
      }
      if (ix.recordsPractical) {
        if (!ix.rubricId) fail(`module-content/${f}: recordsPractical=true wymaga rubricId`);
        else if (!rubricIds.has(ix.rubricId)) fail(`module-content/${f}: rubricId "${ix.rubricId}" nie istnieje w rubrics.json`);
        else if (rubricById.get(ix.rubricId).module !== c.module) fail(`module-content/${f}: rubryka ${ix.rubricId} należy do ${rubricById.get(ix.rubricId).module}, nie ${c.module}`);
        if (typeof ix.scaleMax !== "number" || typeof ix.passThreshold !== "number") fail(`module-content/${f}: zadanie praktyczne wymaga scaleMax i passThreshold`);
      }
    } else if (ix.kind === "tune") {
      const cp = ix.checkpoint || {};
      const optIds = new Set((cp.options || []).map((o) => o.id));
      for (const ck of cp.correct || []) if (!optIds.has(ck)) fail(`module-content/${f}: checkpoint correct "${ck}" spoza options`);
      if (cp.type === "single_choice" && (cp.correct || []).length !== 1) fail(`module-content/${f}: checkpoint single_choice wymaga 1 poprawnej`);
      if (cp.type === "multiple_choice" && (cp.correct || []).length < 1) fail(`module-content/${f}: checkpoint multiple_choice wymaga >=1 poprawnej`);
    } else if (ix.kind === "maturity-check") {
      // Integralność autodiagnozy (M14/ADR-0008): KAŻDY poziom 0..max każdej skali musi trafić do DOKŁADNIE jednej
      // bandy (feedback „gdzie jesteś / jak wejść wyżej" zawsze rozwiązywalny, bez luk i nakładek). Ostrzeż, gdy
      // liczba zdań < max (najwyższy poziom skali nieosiągalny przy punktacji = liczba zaznaczeń).
      for (const sc of ix.scales || []) {
        const maxLvl = typeof sc.max === "number" ? sc.max : (sc.statements || []).length;
        for (let lvl = 0; lvl <= maxLvl; lvl += 1) {
          const hit = (sc.bands || []).filter((b) => lvl >= b.min && lvl <= b.max).length;
          if (hit === 0) fail(`module-content/${f}: skala ${sc.id} — poziom ${lvl} bez bandy (feedback nierozwiązywalny)`);
          if (hit > 1) fail(`module-content/${f}: skala ${sc.id} — poziom ${lvl} w ${hit} bandach (zakresy band nakładają się)`);
        }
        if ((sc.statements || []).length < maxLvl) warn.push(`module-content/${f}: skala ${sc.id} ma ${(sc.statements || []).length} zdań < max ${maxLvl} (najwyższy poziom nieosiągalny)`);
      }
    }
  }
  return present;
}
const contentMods = CANON ? loadModuleContent(CANON) : null;
if (contentMods) report.push(`Treść modułów: ${contentMods.length}/30 (${contentMods.join(",")})`);
// M17 (#126–#131): bramkujemy treść modułów dla WSZYSTKICH locale (nie tylko CANON) — schemat + integralność
// interakcji + lint syntetyczny. Zamyka znany GAP M16 (treść nie-CANON dotąd poza bramką CI). Parytet ID rubryk
// (parityIdSet rubrics.json) gwarantuje, że rubricId w treści nie-CANON wskazuje na istniejącą rubrykę CANON.
for (const lang of LOCALES) {
  if (lang === CANON) continue;
  const mods = loadModuleContent(lang);
  if (mods && mods.length !== 30) fail(`treść modułów ${lang}: ${mods.length}/30 plików`);
  else if (mods) report.push(`Treść modułów ${lang}: ${mods.length}/30 — schemat + integralność + lint OK`);
}

// ---------------- Leak-gate: brak resztek języka źródłowego (PL) w przetłumaczonych locale (#133) ----------------
// Wyciek prozy PL do danych locale wystąpił realnie w M17 (łapany dotąd tylko ręcznie). Bramka skanuje pola pod
// kątem znaków SPECYFICZNYCH dla polskiego — świadomie BEZ ó/ć (legalne w ES i in.; dałyby fałszywe alarmy).
// Pomijamy poddrzewo "_meta" (notki autorskie PL celowo zachowane we wszystkich locale). Skan obejmuje
// data/<lang>/**.json oraz katalog UI assets/i18n/<lang>.json. Tylko non-CANON (CANON = język źródłowy).
(function checkResidualSourceLang() {
  const PL_ONLY = /[łąęńśżźĄĘŁŃŚŻŹ]/;
  // Positive control (kultura „testu negatywnego", por. #25): czysty skan jest nieodróżnialny od zepsutego regexu/
  // ścieżki/zbyt szerokiego wykluczenia _meta. Udowadniamy, że detektor w ogóle wykrywa polski.
  if (!PL_ONLY.test("zażółć gęślą jaźń")) { fail("leak-gate: positive control nie wykrył polskiego — detektor zepsuty"); return; }
  const walk = (node, path, label) => {
    if (typeof node === "string") { if (PL_ONLY.test(node)) fail(`${label}: resztka języka źródłowego (PL) w ${path} → ${JSON.stringify(node.slice(0, 80))}`); return; }
    if (Array.isArray(node)) { node.forEach((v, i) => walk(v, `${path}[${i}]`, label)); return; }
    if (node && typeof node === "object") for (const k of Object.keys(node)) { if (k === "_meta") continue; walk(node[k], `${path}.${k}`, label); }
  };
  const collectJson = (dir) => {
    const out = [];
    if (!existsSync(dir)) return out;
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, ent.name);
      if (ent.isDirectory()) out.push(...collectJson(p));
      else if (ent.name.endsWith(".json")) out.push(p);
    }
    return out;
  };
  let scanned = 0;
  for (const lang of LOCALES) {
    if (lang === CANON) continue;
    const files = collectJson(join(DATA, lang));
    const cat = join(I18N_DIR, `${lang}.json`);
    if (existsSync(cat)) files.push(cat);
    for (const f of files) { walk(load(f), "", relative(DATA, f)); scanned += 1; }
  }
  report.push(`Leak-gate języka źródłowego (PL): ${scanned} plików non-CANON przeskanowanych — brak resztek poza _meta`);
})();

// ---------------- Próbka wyników pilotażu (kalibracja #28) — schemat + integralność + lint syntetyczny ----------------
// W repo trzymamy WYŁĄCZNIE syntetyczny przykład (realne wyniki pilotażu powstają poza repo).
// Walidujemy go, by narzędzie kalibracji (tools/calibration) miało stabilny, poprawny kontrakt wejścia.
(function checkPilotSample() {
  const fp = join(DATA, "pilot", "sample-pilot-results.json");
  if (!existsSync(fp)) return; // próbka opcjonalna
  const sp = join(SCHEMAS, "pilot-results.schema.json");
  if (!existsSync(sp)) { fail("brak schematu pilot-results.schema.json (wymagany, gdy istnieje próbka pilotażu)"); return; }
  const doc = load(fp), schema = load(sp);
  validate(doc, schema, schema, "pilot/sample-pilot-results.json").forEach((x) => fail(`[schema pilot] ${x}`));
  if (doc.synthetic !== true) fail("pilot/sample-pilot-results.json: musi mieć synthetic:true (w repo tylko dane syntetyczne)");
  for (const q of doc.questions || []) {
    if (typeof q.correct === "number" && typeof q.attempts === "number" && q.correct > q.attempts)
      fail(`pilot: ${q.id} correct ${q.correct} > attempts ${q.attempts}`);
    if (typeof q.ambiguityReports === "number" && typeof q.attempts === "number" && q.ambiguityReports > q.attempts)
      fail(`pilot: ${q.id} ambiguityReports ${q.ambiguityReports} > attempts ${q.attempts}`);
    if (Qall && !Qall.some((bq) => bq.id === q.id)) warn.push(`pilot: ${q.id} nie istnieje w banku (zostanie zignorowane przy kalibracji)`);
  }
  const blob = JSON.stringify(doc);
  lintSynthetic(blob, "pilot/sample-pilot-results.json");
  report.push(`Pilotaż (próbka syntetyczna): ${(doc.questions || []).length} pytań, ${doc.pilot?.participants ?? "?"} uczestników`);
})();

// ---------------- Wynik ----------------
console.log(report.join("\n"));
if (warn.length) console.log("\n⚠️  OSTRZEŻENIA:\n - " + warn.join("\n - "));
if (errs.length) {
  console.log(`\n❌ ${errs.length} BŁĘDÓW WALIDACJI:\n - ` + errs.join("\n - "));
  process.exit(1);
}
console.log("\n✅ WALIDACJA OK — wszystkie kontrakty i pokrycie spełnione.");
