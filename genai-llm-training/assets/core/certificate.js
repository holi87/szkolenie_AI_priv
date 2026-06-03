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
 */
export function generateCompletionId(pathId, dateIso, scorePct, label = "") {
  return `CERT-${pathId}-${yyyymmdd(dateIso)}-${hash(`${pathId}|${dateIso}|${scorePct}|${label}`)}`;
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
    completionId: generateCompletionId(pathId, dateIso, scorePct, displayName || ""),
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
  return {
    path: progress.path,
    pathName: opts.pathName || null,
    scorePct: ft.lastScorePct ?? null,
    passed: Boolean(ft.passed),
    criticalQuestionsPassed: Boolean(ft.criticalQuestionsPassed),
    attempts: ft.attempts ?? 0,
    completionId: cert.completionId || null,
    issuedAt: cert.issuedAt || null,
    weakModules: (ft.weakModules || []).slice(),
    practicalTasks: (progress.practicalTasks || []).map((t) => ({
      rubric: t.rubric,
      score: t.score,
      maxScore: t.maxScore ?? null,
      passed: Boolean(t.passed),
    })),
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
  const cols = ["completionId", "path", "scorePct", "passed", "criticalQuestionsPassed", "attempts", "issuedAt", "weakModules"];
  const row = [
    r.completionId,
    r.path,
    r.scorePct,
    r.passed,
    r.criticalQuestionsPassed,
    r.attempts,
    r.issuedAt,
    r.weakModules.join("; "),
  ];
  return `${cols.join(",")}\n${row.map(csvCell).join(",")}`;
}
