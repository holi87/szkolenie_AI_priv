// certificate.js — ekran zaliczenia i eksport wyniku (issue #19).
// Pure logic, zero DOM. Konserwatywnie (AGENTS): certyfikat zaliczenia powstaje WYŁĄCZNIE gdy passed.
// Eksport = minimalny payload raportowy do pilotażu, BEZ danych wrażliwych (zero e-mail/PII).

const round2 = (n) => Math.round(n * 100) / 100;

/** Deterministyczny skrót (djb2) — stabilne ID zaliczenia bez losowości i bez kolizji wejścia. */
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h.toString(36).toUpperCase();
}

const yyyymmdd = (iso) => (iso || "").slice(0, 10).replace(/-/g, "");

/**
 * Generuje ID zaliczenia. Deterministyczne dla tych samych danych wejściowych.
 * Format: CERT-<ścieżka>-<RRRRMMDD>-<hash>.
 * PRYWATNOŚĆ (#61): pseudonim NIE wchodzi do preimage. Pełny znacznik czasu (dateIso, ms) sam zapewnia
 * unikalność wydania, a brak nicku uniemożliwia odzyskanie pseudonimu z eksportu atakiem słownikowym po
 * znanej liście uczestników (path/scorePct/data są jawne — nick był jedyną niewiadomą hasha).
 */
export function generateCompletionId(pathId, dateIso, scorePct) {
  return `CERT-${pathId}-${yyyymmdd(dateIso)}-${hash(`${pathId}|${dateIso}|${scorePct}`)}`;
}

/** Mapuje słabe moduły na obiekty z nazwą (do listy "do powtórzenia"). */
export function weakAreas(weakModules, modulesData) {
  const nameById = {};
  for (const m of (modulesData && modulesData.modules) || []) nameById[m.id] = m.name;
  return (weakModules || []).map((w) => {
    const id = typeof w === "string" ? w : w.module;
    const pct = typeof w === "object" && w.pct != null ? w.pct : null;
    return { module: id, name: nameById[id] || id, ...(pct != null ? { pct } : {}) };
  });
}

/**
 * Buduje model certyfikatu / ekranu zaliczenia.
 * @returns {{issued:boolean, completionId?:string, displayName?:string, path:string, pathName?:string,
 *            date:string, scorePct:number, weakAreas:object[], reason?:string}}
 * Gdy nie zaliczono — issued:false, brak completionId, zwraca powód i obszary do powtórzenia.
 */
export function buildCertificate(scoreResult, opts = {}) {
  const { pathId, scorePct, passed, weakModules } = scoreResult;
  const dateIso = opts.dateIso || new Date().toISOString();
  const displayName = (opts.participant && opts.participant.displayName) || null;
  const wa = weakAreas(weakModules, opts.modulesData);

  if (!passed) {
    return {
      issued: false,
      path: pathId,
      pathName: opts.pathName || null,
      date: dateIso,
      scorePct,
      weakAreas: wa,
      reason: "Wynik poniżej progu zaliczenia — certyfikat nie został wydany.",
    };
  }
  return {
    issued: true,
    completionId: generateCompletionId(pathId, dateIso, scorePct),
    // displayName (pseudonim) służy WYŁĄCZNIE do wyświetlenia na ekranie certyfikatu w trakcie sesji.
    // Nie wchodzi do completionId (#61) ani do eksportu (buildReport go pomija) — pseudonim nie wycieka.
    ...(displayName ? { displayName } : {}),
    path: pathId,
    pathName: opts.pathName || null,
    date: dateIso,
    scorePct,
    weakAreas: wa,
  };
}

/** Minimalny obiekt raportowy do eksportu (bez PII). */
function buildReport(progress, opts = {}) {
  const ft = progress.finalTest || {};
  const cert = progress.certificate || {};
  // Czas per moduł (KPI Time to complete) — bez tego eksport nie pozwala policzyć KPI z pobranych plików.
  const moduleTimesSec = {};
  let totalTimeSec = 0;
  for (const [moduleId, m] of Object.entries(progress.modules || {})) {
    if (typeof m.timeSpentSec === "number" && m.timeSpentSec > 0) { moduleTimesSec[moduleId] = m.timeSpentSec; totalTimeSec += m.timeSpentSec; }
  }
  return {
    path: progress.path,
    pathName: opts.pathName || null,
    scorePct: ft.lastScorePct ?? null,
    passed: Boolean(ft.passed),
    criticalQuestionsPassed: Boolean(ft.criticalQuestionsPassed),
    attempts: ft.attempts ?? 0,
    completionId: cert.completionId || null,
    // PRYWATNOŚĆ (#61): w eksporcie skracamy znacznik do daty. Pełny timestamp ms + path + wyniki + czasy
    // modułów byłby quasi-identyfikatorem deanonimizującym względem listy obecności. Pełny issuedAt zostaje
    // tylko lokalnie/na ekranie, nie w pobieranym pliku.
    issuedAt: cert.issuedAt ? String(cert.issuedAt).slice(0, 10) : null,
    weakModules: (ft.weakModules || []).slice(),
    practicalTasks: (progress.practicalTasks || []).map((t) => ({
      rubric: t.rubric,
      score: t.score,
      maxScore: t.maxScore ?? null,
      passed: Boolean(t.passed),
    })),
    moduleTimesSec,
    totalTimeSec,
  };
}

/** Eksport JSON (string) — minimalny payload raportowy pilotażu. */
export function exportJson(progress, opts = {}) {
  return JSON.stringify(buildReport(progress, opts), null, 2);
}

const csvCell = (v) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Eksport CSV (string, nagłówek + 1 wiersz) — pola złożone łączone "; ", bez PII. */
export function exportCsv(progress, opts = {}) {
  const r = buildReport(progress, opts);
  const cols = ["completionId", "path", "scorePct", "passed", "criticalQuestionsPassed", "attempts", "issuedAt", "weakModules", "totalTimeSec"];
  const row = [
    r.completionId,
    r.path,
    r.scorePct,
    r.passed,
    r.criticalQuestionsPassed,
    r.attempts,
    r.issuedAt,
    r.weakModules.join("; "),
    r.totalTimeSec,
  ];
  return `${cols.join(",")}\n${row.map(csvCell).join(",")}`;
}

/**
 * Per-pytanie (anonimowo) — sygnał kalibracyjny do pilotażu (#27/#28). Jeden wiersz na pytanie: poprawność
 * z quizu inline (1. próba) ORAZ z testu końcowego (test nadpisuje inline — warunki oceny, i obejmuje pytania
 * spoza puli quizu, w tym golden → walidacja golden 24/24). Agregat per uczestnik (attempts=1); koordynator
 * sumuje między uczestnikami → pilot-results.json. BEZ PII (tylko id pytania, moduł, 0/1, źródło).
 */
export function buildQuestionStats(progress) {
  const byQ = new Map();
  // 1) Quiz inline — poprawność z pierwszej próby.
  for (const [moduleId, m] of Object.entries((progress && progress.modules) || {})) {
    for (const r of m.quizResults || []) {
      if (!r || typeof r.questionId !== "string") continue;
      if (!byQ.has(r.questionId)) byQ.set(r.questionId, { questionId: r.questionId, module: moduleId, attempts: 1, correct: r.correct === true ? 1 : 0, source: "inline" });
    }
  }
  // 2) Test końcowy — sygnał oceny; NADPISUJE inline (warunki testu) i obejmuje pytania spoza puli quizu
  //    (w tym golden widziane tylko w teście), dzięki czemu możliwa jest walidacja golden setu 24/24.
  for (const qr of (progress && progress.finalTest && progress.finalTest.questionResults) || []) {
    if (!qr || typeof qr.questionId !== "string") continue;
    const prev = byQ.get(qr.questionId);
    byQ.set(qr.questionId, { questionId: qr.questionId, module: qr.module || (prev && prev.module) || null, attempts: 1, correct: qr.correct === true ? 1 : 0, source: "final" });
  }
  return [...byQ.values()].sort((a, b) => a.questionId.localeCompare(b.questionId));
}

/** Eksport JSON per-pytanie (anonimowy) — wejście do agregacji pilotażu (#28). */
export function exportQuestionStatsJson(progress) {
  return JSON.stringify({ path: (progress && progress.path) || null, source: "inline-quiz", questions: buildQuestionStats(progress) }, null, 2);
}

/** Eksport CSV per-pytanie (anonimowy). */
export function exportQuestionStatsCsv(progress) {
  const cols = ["questionId", "module", "attempts", "correct", "source"];
  const rows = buildQuestionStats(progress).map((r) => [r.questionId, r.module, r.attempts, r.correct, r.source]);
  return [cols.join(","), ...rows.map((row) => row.map(csvCell).join(","))].join("\n");
}
