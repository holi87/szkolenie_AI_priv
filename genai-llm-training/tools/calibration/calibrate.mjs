#!/usr/bin/env node
// calibrate.mjs — kalibracja pytań po pilotażu (issue #28). Pure Node, zero zależności (ADR-0002).
//
// CO ROBI: łączy zagregowane wyniki pilotażu (data/pilot/*.json wg pilot-results.schema.json) z bankiem
// pytań i golden setem, po czym wg wymagania/07 wylicza:
//   • czy odsetek poprawnych mieści się w zakresie dla poziomu trudności (L1 80–95%, L2 55–80%,
//     L3 35–65%, L4 20–45%) — pytania poza zakresem są kandydatami do poprawy/przeniesienia (krok 7);
//   • pytania krytyczne z >10% zgłoszeń niejasności — wymagają przepisania (krok 8);
//   • status golden setu: validated albo wymaga poprawek (golden: niejasność <=5% i brak dryfu zakresu).
//
// CZEGO NIE ROBI: nie przeprowadza pilotażu i nie tworzy realnych danych. `calibrate()` jest czystą funkcją
// (testowalną), CLI dokłada I/O i raport. Realny raport powstaje PO pilotażu na 8–15 osobach.
//
// Użycie:
//   node tools/calibration/calibrate.mjs [ścieżka/do/pilot-results.json]   # raport Markdown na stdout
//   node tools/calibration/calibrate.mjs --self-test                       # kontrola na danych syntetycznych (CI)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Zakresy odsetka poprawnych odpowiedzi wg poziomu trudności (wymagania/07).
export const DIFFICULTY_BANDS = {
  L1: [0.8, 0.95],
  L2: [0.55, 0.8],
  L3: [0.35, 0.65],
  L4: [0.2, 0.45],
};
export const CRITICAL_AMBIGUITY_MAX = 0.1; // >10% niejasności w pytaniu krytycznym → przepisać (krok 8)
export const GOLDEN_AMBIGUITY_MAX = 0.05; // golden set: max 5% zgłoszeń niejasności (proces walidacji golden)

const pct = (x) => `${(x * 100).toFixed(1)}%`;

/**
 * Czysta kalibracja. Nie czyta dysku — wejście wstrzyknięte (testowalność).
 * @param {object} pilot - obiekt zgodny z pilot-results.schema.json
 * @param {object} ctx - { questionsById: Map<id, {difficulty,isCritical,golden,module}>, goldenIds: string[] }
 */
export function calibrate(pilot, ctx) {
  const { questionsById, goldenIds } = ctx;
  const goldenSet = new Set(goldenIds || []);
  const perQuestion = [];
  const unknownIds = [];

  for (const r of pilot.questions || []) {
    const meta = questionsById.get(r.id);
    if (!meta) { unknownIds.push(r.id); continue; }
    const pCorrect = r.attempts > 0 ? r.correct / r.attempts : 0;
    const ambiguityPct = r.attempts > 0 ? (r.ambiguityReports || 0) / r.attempts : 0;
    const band = DIFFICULTY_BANDS[meta.difficulty] || null;
    const inBand = band ? pCorrect >= band[0] && pCorrect <= band[1] : true;
    const direction = !band ? "—" : pCorrect < band[0] ? "za trudne" : pCorrect > band[1] ? "za łatwe" : "w zakresie";
    perQuestion.push({
      id: r.id, module: meta.module, difficulty: meta.difficulty,
      isCritical: !!meta.isCritical, golden: goldenSet.has(r.id) || !!meta.golden,
      attempts: r.attempts, correct: r.correct, pCorrect, ambiguityPct,
      avgTimeSec: r.avgTimeSec ?? null, discrimination: r.discrimination ?? null,
      band, inBand, direction,
    });
  }

  // Poza zakresem (reklasyfikacja): tylko pytania NIEkrytyczne. Krytyczne są 100%-bramkowane/konserwatywne —
  // wysoki odsetek poprawnych jest zamierzony i NIE chcemy ich przenosić między poziomami trudności.
  const outOfBand = perQuestion.filter((q) => !q.isCritical && !q.inBand);
  // Ale dryfu krytycznych NIE chowamy: raportujemy je w osobnej sekcji do przeglądu (nie reklasyfikacji).
  const criticalDrift = perQuestion.filter((q) => q.isCritical && !q.inBand);
  // Krytyczne do przepisania: niejasność > 10%.
  const criticalsToRewrite = perQuestion.filter((q) => q.isCritical && q.ambiguityPct > CRITICAL_AMBIGUITY_MAX);

  // Golden set: validated tylko gdy PEŁNE pokrycie (24/24) i wszystkie pokryte w zakresie + niejasność <= 5%.
  // Konserwatywnie: niepełny pilotaż golden setu nie może raportować ✅ validated (kontrola dryfu wymaga kompletu).
  const goldenCovered = perQuestion.filter((q) => q.golden);
  const coveredGoldenIds = new Set(goldenCovered.map((q) => q.id));
  const missingGolden = [...goldenSet].filter((id) => !coveredGoldenIds.has(id));
  const goldenOffenders = goldenCovered.filter((q) => !q.inBand || q.ambiguityPct > GOLDEN_AMBIGUITY_MAX);
  const goldenStatus = {
    coveredCount: goldenCovered.length,
    totalGolden: goldenSet.size,
    missingGolden,
    offenders: goldenOffenders.map((q) => ({ id: q.id, reason: !q.inBand ? `dryf trudności (${q.direction}, ${pct(q.pCorrect)})` : `niejasność ${pct(q.ambiguityPct)} > 5%` })),
    // validated wymaga PEŁNEGO, UNIKALNEGO pokrycia (missingGolden liczone z Set id → odporne na duplikaty rzędów).
    validated: goldenSet.size > 0 && missingGolden.length === 0 && goldenOffenders.length === 0,
  };

  return {
    coverage: { covered: perQuestion.length, unknownIds },
    perQuestion, outOfBand, criticalDrift, criticalsToRewrite, goldenStatus,
    summary: {
      questionsAnalyzed: perQuestion.length,
      outOfBand: outOfBand.length,
      criticalDrift: criticalDrift.length,
      criticalsToRewrite: criticalsToRewrite.length,
      goldenValidated: goldenStatus.validated,
    },
  };
}

// Rozmiar grupy pilotażowej (wymagania/07: pilotaż na grupie 8–15 osób).
export const PILOT_MIN_PARTICIPANTS = 8;
export const PILOT_MAX_PARTICIPANTS = 15;

/**
 * Waliduje plik wyników pilotażu PRZED kalibracją (Codex #59: realny eksport musi przejść kontrolę kontraktu
 * i integralności, inaczej dane niemożliwe — >100%, attempts > uczestników, duplikaty, zła liczność grupy —
 * dałyby mylący raport z exit 0). Rzuca na naruszeniu.
 */
export function validatePilot(pilot) {
  const e = [];
  if (!pilot || typeof pilot !== "object" || Array.isArray(pilot)) throw new Error("Niepoprawny plik wyników pilotażu: nie jest obiektem");
  if (typeof pilot.version !== "string") e.push("brak/nieprawidłowe pole version");
  const participants = pilot.pilot && pilot.pilot.participants;
  const okParticipants = typeof participants === "number" && Number.isInteger(participants) && participants >= 1;
  if (!okParticipants) e.push("pilot.participants musi być liczbą całkowitą >= 1");
  else if (participants < PILOT_MIN_PARTICIPANTS || participants > PILOT_MAX_PARTICIPANTS)
    e.push(`pilot.participants ${participants} poza zakresem grupy pilotażowej ${PILOT_MIN_PARTICIPANTS}–${PILOT_MAX_PARTICIPANTS} (wymagania/07)`);
  // byPath (rozkład uczestników): każda ścieżka całkowita >= 0 i suma == participants (inaczej kontrola
  // pokrycia byłaby zafałszowana — np. ujemna liczność „domyka" sumę przy zawyżeniu innej ścieżki).
  const byPath = pilot.pilot && pilot.pilot.byPath;
  if (byPath && okParticipants) {
    let badCounts = false;
    for (const p of ["S1", "S2", "S3"]) {
      if (byPath[p] != null && (!Number.isInteger(byPath[p]) || byPath[p] < 0)) { e.push(`byPath.${p} musi być liczbą całkowitą >= 0`); badCounts = true; }
    }
    if (!badCounts) {
      const sum = ["S1", "S2", "S3"].reduce((s, p) => s + (Number.isInteger(byPath[p]) ? byPath[p] : 0), 0);
      if (sum !== participants) e.push(`byPath sumuje się do ${sum}, a uczestników jest ${participants} (rozkład niespójny)`);
    }
  }
  if (!Array.isArray(pilot.questions) || pilot.questions.length === 0) e.push("questions musi być niepustą tablicą");
  else {
    const seen = new Set();
    for (const q of pilot.questions) {
      const id = q && q.id;
      if (typeof id !== "string" || !/^Q[0-9]{3}$/.test(id)) { e.push(`pytanie z nieprawidłowym id: ${JSON.stringify(id)}`); continue; }
      if (seen.has(id)) e.push(`zduplikowane pytanie ${id} (każde pytanie raz)`); else seen.add(id);
      // Liczności muszą być CAŁKOWITE (liczba osób), nie ułamkowe — inaczej np. attempts=11.5 dałoby fałszywe %.
      if (!Number.isInteger(q.attempts) || q.attempts < 1) e.push(`${id}: attempts musi być liczbą całkowitą >= 1`);
      if (!Number.isInteger(q.correct) || q.correct < 0) e.push(`${id}: correct musi być liczbą całkowitą >= 0`);
      if (Number.isInteger(q.attempts) && Number.isInteger(q.correct) && q.correct > q.attempts) e.push(`${id}: correct ${q.correct} > attempts ${q.attempts} (>100%)`);
      if (okParticipants && Number.isInteger(q.attempts) && q.attempts > participants) e.push(`${id}: attempts ${q.attempts} > uczestników ${participants} (niemożliwe)`);
      if (q.ambiguityReports != null && (!Number.isInteger(q.ambiguityReports) || q.ambiguityReports < 0 || q.ambiguityReports > q.attempts)) e.push(`${id}: ambiguityReports musi być całkowite w [0, attempts]`);
      // Metryki opcjonalne (jak w schemacie): avgTimeSec >= 0, discrimination w [-1, 1].
      if (q.avgTimeSec != null && (typeof q.avgTimeSec !== "number" || q.avgTimeSec < 0)) e.push(`${id}: avgTimeSec musi być liczbą >= 0`);
      if (q.discrimination != null && (typeof q.discrimination !== "number" || q.discrimination < -1 || q.discrimination > 1)) e.push(`${id}: discrimination musi być liczbą w [-1, 1]`);
    }
  }
  if (e.length) throw new Error("Niepoprawny plik wyników pilotażu:\n - " + e.join("\n - "));
  return true;
}

/**
 * Sprawdza spójność attempts z liczbą uprawnionych uczestników wg byPath (Codex #59 runda 3):
 * pytanie widoczne tylko na S3 nie może mieć więcej prób niż uczestników ścieżek, które je widzą.
 * Pomijane, gdy brak byPath albo metadanych ścieżek pytania.
 */
export function validatePilotCoverage(pilot, questionsById) {
  const byPath = pilot && pilot.pilot && pilot.pilot.byPath;
  if (!byPath) return true;
  const e = [];
  for (const q of pilot.questions || []) {
    const meta = questionsById.get(q.id);
    if (!meta || !Array.isArray(meta.paths)) continue;
    const eligible = meta.paths.reduce((s, p) => s + (byPath[p] || 0), 0);
    if (Number.isInteger(q.attempts) && q.attempts > eligible)
      e.push(`${q.id}: attempts ${q.attempts} > uprawnieni uczestnicy ${eligible} (ścieżki ${meta.paths.join("/")} wg byPath)`);
  }
  if (e.length) throw new Error("Niespójność attempts vs byPath:\n - " + e.join("\n - "));
  return true;
}

/** Buduje raport Markdown z wyniku calibrate(). */
export function renderReport(pilot, result) {
  const L = [];
  L.push(`# Raport kalibracji pytań${pilot.synthetic ? " (DANE SYNTETYCZNE / DEMO)" : ""}`);
  L.push("");
  if (pilot.synthetic) L.push("> ⚠️ **To raport demonstracyjny na danych syntetycznych.** Realny raport powstaje po pilotażu na 8–15 osobach (wymagania/07).");
  L.push(`- Uczestnicy: **${pilot.pilot?.participants ?? "—"}** · okno: ${pilot.pilot?.window ?? "—"}`);
  L.push(`- Pytań przeanalizowanych: **${result.summary.questionsAnalyzed}** (z ${pilot.questions?.length ?? 0} w pliku)`);
  if (result.coverage.unknownIds.length) L.push(`- ⚠️ Pytania spoza banku (zignorowane): ${result.coverage.unknownIds.join(", ")}`);
  L.push("");
  L.push("## Pytania poza zakresem trudności");
  if (!result.outOfBand.length) L.push("Brak — wszystkie niekrytyczne pytania w zakresie dla swojego poziomu.");
  else {
    L.push("| Pytanie | Moduł | Poziom | % popr. | Zakres | Diagnoza |");
    L.push("|---|---|---|---:|---|---|");
    for (const q of result.outOfBand) L.push(`| ${q.id} | ${q.module} | ${q.difficulty} | ${pct(q.pCorrect)} | ${pct(q.band[0])}–${pct(q.band[1])} | **${q.direction}** → popraw lub przenieś |`);
  }
  L.push("");
  L.push("## Pytania krytyczne z niejasnością > 10% (do przepisania)");
  if (!result.criticalsToRewrite.length) L.push("Brak — żadne pytanie krytyczne nie przekracza progu 10% zgłoszeń niejasności.");
  else {
    L.push("| Pytanie | Moduł | % niejasności | % popr. |");
    L.push("|---|---|---:|---:|");
    for (const q of result.criticalsToRewrite) L.push(`| ${q.id} | ${q.module} | **${pct(q.ambiguityPct)}** | ${pct(q.pCorrect)} |`);
  }
  L.push("");
  L.push("## Pytania krytyczne poza zakresem trudności (do przeglądu, nie reklasyfikacji)");
  L.push("> Krytyczne są 100%-bramkowane — wysoki odsetek poprawnych jest zwykle zamierzony. Sekcja informacyjna: potwierdź, że trudność jest celowa.");
  if (!result.criticalDrift.length) L.push("Brak — wszystkie pytania krytyczne w zakresie dla swojego poziomu.");
  else {
    L.push("| Pytanie | Moduł | Poziom | % popr. | Zakres | Kierunek |");
    L.push("|---|---|---|---:|---|---|");
    for (const q of result.criticalDrift) L.push(`| ${q.id} | ${q.module} | ${q.difficulty} | ${pct(q.pCorrect)} | ${pct(q.band[0])}–${pct(q.band[1])} | ${q.direction} |`);
  }
  L.push("");
  L.push("## Status golden setu");
  const gs = result.goldenStatus;
  L.push(`- Pokrycie w pilotażu: ${gs.coveredCount}/${gs.totalGolden}${gs.missingGolden.length ? ` (brakuje: ${gs.missingGolden.join(", ")})` : ""}`);
  L.push(`- **Status: ${gs.validated ? "✅ validated" : "⚠️ wymaga poprawek"}**`);
  if (!gs.validated && gs.coveredCount < gs.totalGolden) L.push(`  - niepełne pokrycie golden setu (${gs.coveredCount}/${gs.totalGolden}) — validated wymaga 24/24`);
  if (gs.offenders.length) for (const o of gs.offenders) L.push(`  - ${o.id}: ${o.reason}`);
  L.push("");
  L.push("---");
  L.push("_Wygenerowano: `node tools/calibration/calibrate.mjs`. Zakresy trudności i progi wg wymagania/07._");
  return L.join("\n");
}

// ---------------- CLI / I/O ----------------
function loadBankAndGolden(dataDir) {
  const read = (p) => JSON.parse(readFileSync(join(dataDir, p), "utf8"));
  const questionsById = new Map();
  // Bank kanoniczny (PL) — pola scoringowe są parytetowo zamrożone między locale (ADR-0004), więc
  // kalibracja trudności/golden działa na kanonie. golden-set.json jest wspólny (language-neutral).
  for (let i = 1; i <= 12; i += 1) {
    for (const q of read(`pl/questions/m${String(i).padStart(2, "0")}.json`).questions || []) {
      questionsById.set(q.id, { difficulty: q.difficulty, isCritical: !!q.isCritical, golden: !!q.golden, module: q.module, paths: q.paths });
    }
  }
  const goldenIds = read("golden-set.json").goldenSet.questionIds || [];
  return { questionsById, goldenIds };
}

function main(argv) {
  const HERE = dirname(fileURLToPath(import.meta.url));
  const DATA = join(HERE, "..", "..", "data");
  const ctx = loadBankAndGolden(DATA);
  const selfTest = argv.includes("--self-test");
  const fileArg = argv.find((a) => !a.startsWith("--"));
  const pilotPath = fileArg || join(DATA, "pilot", "sample-pilot-results.json");
  const pilot = JSON.parse(readFileSync(pilotPath, "utf8"));
  // Walidacja kontraktu + integralności + spójności ze ścieżkami PRZED kalibracją (fail fast na złych danych).
  try { validatePilot(pilot); validatePilotCoverage(pilot, ctx.questionsById); } catch (err) { process.stderr.write(`${err.message}\n`); process.exit(1); }
  const result = calibrate(pilot, ctx);

  if (selfTest) {
    const ids = (arr) => arr.map((q) => q.id).sort();
    const checks = [
      [ids(result.outOfBand).includes("Q108"), "Q108 (L3 za trudne) poza zakresem"],
      [ids(result.outOfBand).includes("Q032"), "Q032 (L3 golden za łatwe) poza zakresem"],
      [ids(result.criticalsToRewrite).includes("Q083"), "Q083 (krytyczne, 16,7% niejasności) do przepisania"],
      [result.criticalsToRewrite.every((q) => q.id !== "Q085"), "Q085 (8,3% < 10%) NIE jest flagowane"],
      [ids(result.criticalDrift).includes("Q083"), "Q083 (krytyczne poza zakresem) raportowane w sekcji dryfu"],
      [result.outOfBand.every((q) => !q.isCritical), "krytyczne NIE są reklasyfikowane (poza outOfBand)"],
      [result.goldenStatus.validated === false, "golden set oznaczony jako wymaga poprawek (niepełne pokrycie + offenderzy)"],
      [result.coverage.unknownIds.length === 0, "brak pytań spoza banku w próbce"],
    ];
    const failed = checks.filter(([ok]) => !ok);
    for (const [ok, msg] of checks) process.stdout.write(`${ok ? "✅" : "❌"} ${msg}\n`);
    if (failed.length) { process.stderr.write(`\n❌ self-test: ${failed.length} kontroli nie przeszło\n`); process.exit(1); }
    process.stdout.write("\n✅ self-test kalibracji OK (dane syntetyczne).\n");
    return;
  }
  process.stdout.write(`${renderReport(pilot, result)}\n`);
}

// Uruchom tylko jako skrypt (import nie wywołuje I/O).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main(process.argv.slice(2));
