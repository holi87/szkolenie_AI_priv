#!/usr/bin/env node
// Walidacja danych szkolenia GenAI/LLM + raport pokrycia (issue #13).
// Pure Node, zero zależności (zgodne z ADR-0002: brak build/runtime aplikacji).
// Uruchom: node tests/schema-validation/validate.mjs   (z roota repo)
// Exit 0 = OK, 1 = błędy walidacji. Działa lokalnie i w CI, bez backendu.

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
// validate.mjs leży w genai-llm-training/tests/schema-validation/ -> dane dwa poziomy wyżej w data/
const DATA = join(HERE, "..", "..", "data");
const SCHEMAS = join(DATA, "schemas");

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
const EXPECTED_COUNTS = { M1:8,M2:9,M3:7,M4:8,M5:8,M6:10,M7:10,M8:12,M9:8,M10:14,M11:10,M12:12 };
const TOTAL = 116;
const DIFF_TARGET = { L1: 41, L2: 46, L3: 23, L4: 6 };
const SCENARIO_TYPES = new Set(["scenariusz", "scenariusz_decyzyjny"]);
const TECHNICAL_MODULES = new Set(["M4", "M5", "M6", "M12"]);
const GOLDEN_DIFF = { L1: 8, L2: 10, L3: 5, L4: 1 };
// Lint danych syntetycznych: wzorce, które nie powinny wystąpić (realne PII/domeny).
const FORBIDDEN_PATTERNS = [
  { rx: /@(gmail|outlook|yahoo|hotmail|wp|onet|interia|o2)\.(com|pl|net)/i, why: "realna domena e-mail" },
  { rx: /\b(?!00000000000)\d{11}\b/, why: "potencjalnie prawdziwy PESEL (11 cyfr inny niż placeholder)" },
  { rx: /\b\d{16}\b/, why: "potencjalny numer karty (16 cyfr)" },
];

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

const modules = checkSchema("modules.json", "modules.schema.json");
const paths = checkSchema("paths.json", "paths.schema.json");
const scenarios = checkSchema("scenarios.json", "scenarios.schema.json");
const rubrics = checkSchema("rubrics.json", "rubrics.schema.json");

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
function loadQuestions() {
  const QDIR = join(DATA, "questions");
  if (!existsSync(QDIR)) return null;
  const files = readdirSync(QDIR).filter((f) => /^m\d{2}\.json$/.test(f)).sort();
  if (files.length === 0) return null;
  const schema = load(join(SCHEMAS, "questions.schema.json"));
  const all = [];
  for (const f of files) {
    const doc = load(join(QDIR, f));
    validate(doc, schema, schema, `questions/${f}`).forEach((x) => fail(`[schema questions/${f}] ${x}`));
    const modFromName = "M" + String(parseInt(f.slice(1, 3), 10));
    for (const q of doc.questions || []) {
      if (q.module !== modFromName) fail(`questions/${f}: ${q.id} ma module=${q.module} != ${modFromName} (plik ma zawierać tylko swój moduł)`);
    }
    all.push(...(doc.questions || []));
  }
  return all;
}
const Qall = loadQuestions();
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
  // criticals
  const crit = Q.filter((q) => q.isCritical);
  if (crit.length !== 5) fail(`pytania krytyczne: ${crit.length} != 5`);
  for (const q of crit) {
    if (q.module !== "M10") fail(`${q.id} krytyczne poza M10`);
    if (q.type !== "scenariusz_decyzyjny") warn.push(`${q.id} krytyczne nie jest scenariusz_decyzyjny`);
    if ((q.correct || []).length !== 1) fail(`${q.id} krytyczne musi mieć dokładnie 1 poprawną odpowiedź`);
    if (!/^To jest błąd bezpieczeństwa\./.test(q.feedbackIncorrect || "")) fail(`${q.id} krytyczne: feedbackIncorrect musi zaczynać się od konserwatywnego komunikatu „To jest błąd bezpieczeństwa." (osłabiony komunikat bezpieczeństwa nie może przejść CI)`);
    if (!q.paths.includes("S1") || !q.paths.includes("S2") || !q.paths.includes("S3")) fail(`${q.id} krytyczne musi obejmować wszystkie ścieżki`);
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
    for (const m of modules.modules) {
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
  }
  // lint danych syntetycznych
  for (const q of Q) {
    const blob = JSON.stringify(q);
    for (const f of FORBIDDEN_PATTERNS) if (f.rx.test(blob)) fail(`${q.id}: ${f.why} — dane muszą być syntetyczne`);
  }
  report.push(`Pytania: ${Q.length} | per-moduł OK | trudność L1=${D.L1}/L2=${D.L2}/L3=${D.L3}/L4=${D.L4}`);
  report.push(`Scenariuszowe/decyzyjne: ${scn}/${TOTAL} = ${(scn/TOTAL*100).toFixed(1)}%`);
  report.push(`Krytyczne (M10): ${crit.map((q)=>q.id).join(",")}`);
  const pillarCount = {}; for (const q of Q) pillarCount[q.pillar] = (pillarCount[q.pillar]||0)+1;
  report.push(`Filary: ${Object.entries(pillarCount).map(([k,v])=>`${k}=${v}`).join(" ")}`);
  // rozkład pozycji poprawnej (anti-gaming) — informacyjnie; rotacja opcji przy wyświetlaniu to wymóg engine (doc 07, M3 #17)
  const posDist = {};
  for (const q of Q) if (["single_choice","scenariusz_decyzyjny","scenariusz"].includes(q.type) && (q.correct||[]).length===1) posDist[q.correct[0]] = (posDist[q.correct[0]]||0)+1;
  report.push(`Pozycje correct (1-poprawne): ${Object.entries(posDist).map(([k,v])=>`${k}=${v}`).join(" ")} — UWAGA: wyświetlanie MUSI rotować opcje (anti-gaming, doc 07; engine M3 #17)`);
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
      for (const m of Object.keys(EXPECTED_COUNTS)) if (gMod[m] !== 2) fail(`golden: ${m}=${gMod[m]||0} != 2 (po 2/moduł)`);
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

// ---------------- Progi ścieżek (raport) ----------------
if (paths) {
  for (const [pid, p] of Object.entries(paths.paths)) {
    report.push(`Ścieżka ${pid}: próg ${p.passThresholdPct}% | test ${p.finalTestQuestions} pyt. | krytyczne ${p.criticalQuestionsRequiredPct}% | zadania ${p.practicalTasks} | bramki ${p.gates.length}`);
  }
}

// ---------------- Scenariusze (lint syntetyczny — cały obiekt, nie tylko data) ----------------
if (scenarios) {
  for (const s of scenarios.scenarios) {
    const blob = JSON.stringify(s);
    for (const f of FORBIDDEN_PATTERNS) if (f.rx.test(blob)) fail(`scenariusz ${s.id}: ${f.why} — dane muszą być syntetyczne`);
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

// ---------------- Wynik ----------------
console.log(report.join("\n"));
if (warn.length) console.log("\n⚠️  OSTRZEŻENIA:\n - " + warn.join("\n - "));
if (errs.length) {
  console.log(`\n❌ ${errs.length} BŁĘDÓW WALIDACJI:\n - ` + errs.join("\n - "));
  process.exit(1);
}
console.log("\n✅ WALIDACJA OK — wszystkie kontrakty i pokrycie spełnione.");
