// progress-store.js — zapis progresu uczestnika (issue #16).
// Pure logic + wstrzykiwany adapter storage. Zero bezpośredniego wiązania UI z localStorage
// (AGENTS: przekazuj zależności jawnie; gotowe pod backend adapter po pilotażu — ADR-0001/#2).
// Kształt progresu zgodny z data/schemas/progress.schema.json. Progres trzymany PER ŚCIEŻKA
// (osobny klucz na S1/S2/S3 → "status modułu zapisuje się per ścieżka", obsługa zmiany ścieżki).
// "Ostatnie miejsce" trzymane osobnym kluczem-kursorem (nie zaśmieca obiektu progresu).

const PREFIX = "genai-training";
const PROGRESS_KEY = (pathId) => `${PREFIX}:progress:${pathId}`;
const CURSOR_KEY = `${PREFIX}:cursor`;
const SCHEMA_VERSION = "1.0";
const DEFAULT_WEIGHTS = { inlineQuiz: 0.3, finalTest: 0.6, practicalTask: 0.1 };

/** Adapter in-memory (testy, fallback gdy brak localStorage). */
export function createMemoryAdapter(seed = {}) {
  const mem = new Map(Object.entries(seed));
  return {
    get: (k) => (mem.has(k) ? mem.get(k) : null),
    set: (k, v) => void mem.set(k, v),
    remove: (k) => void mem.delete(k),
    keys: () => [...mem.keys()],
  };
}

/** Adapter localStorage (przeglądarka). storage domyślnie globalThis.localStorage. */
export function createLocalStorageAdapter(storage) {
  const s = storage || (typeof globalThis !== "undefined" ? globalThis.localStorage : null);
  if (!s) throw new Error("Brak localStorage — podaj adapter lub storage");
  return {
    get: (k) => s.getItem(k),
    set: (k, v) => s.setItem(k, v),
    remove: (k) => s.removeItem(k),
    keys: () => Object.keys(s),
  };
}

function newProgress(pathId, maxAttempts, now) {
  return {
    version: SCHEMA_VERSION,
    path: pathId,
    modules: {},
    finalTest: { attempts: 0, maxAttempts: maxAttempts || 3 },
    practicalTasks: [],
    scoreWeights: { ...DEFAULT_WEIGHTS },
    updatedAt: now(),
  };
}

/**
 * Tworzy store progresu nad adapterem storage.
 * @param {object} adapter - { get, set, remove, keys }
 * @param {object} [opts] - { now: ()=>ISOstring, maxAttempts }
 */
export function createProgressStore(adapter, opts = {}) {
  const now = opts.now || (() => new Date().toISOString());
  const maxAttempts = opts.maxAttempts || 3;

  const readJson = (key) => {
    const raw = adapter.get(key);
    if (raw == null) return null;
    try {
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return null; // uszkodzony wpis — traktuj jak brak (konserwatywnie, bez wywalania appki)
    }
  };
  const writeJson = (key, val) => adapter.set(key, JSON.stringify(val));

  let cursor = readJson(CURSOR_KEY) || { pathId: null, moduleId: null, screen: null };
  let activePath = cursor.pathId;
  let progress = activePath ? readJson(PROGRESS_KEY(activePath)) : null;

  const persist = () => {
    progress.updatedAt = now();
    writeJson(PROGRESS_KEY(activePath), progress);
  };
  const persistCursor = () => writeJson(CURSOR_KEY, cursor);
  const ensureActive = () => {
    if (!progress) throw new Error("Brak wybranej ścieżki — wywołaj selectPath() najpierw");
  };
  const ensureModule = (moduleId) => {
    if (!progress.modules[moduleId]) progress.modules[moduleId] = { status: "available" };
    return progress.modules[moduleId];
  };

  return {
    /** Wybiera/ustawia aktywną ścieżkę; ładuje (lub tworzy) jej progres. Zmiana ścieżki nie kasuje innych. */
    selectPath(pathId) {
      activePath = pathId;
      progress = readJson(PROGRESS_KEY(pathId)) || newProgress(pathId, maxAttempts, now);
      cursor = { ...cursor, pathId };
      persist();
      persistCursor();
      return progress;
    },
    getActivePath: () => activePath,
    getProgress: () => (progress ? JSON.parse(JSON.stringify(progress)) : null),
    hasProgress: () => Boolean(activePath && adapter.get(PROGRESS_KEY(activePath)) != null),

    setParticipant(participant) {
      ensureActive();
      progress.participant = { ...(progress.participant || {}), ...participant };
      persist();
    },

    setModuleStatus(moduleId, status) {
      ensureActive();
      const m = ensureModule(moduleId);
      m.status = status;
      if (status === "completed") m.completedAt = now();
      persist();
    },

    addModuleTime(moduleId, sec) {
      ensureActive();
      const m = ensureModule(moduleId);
      m.timeSpentSec = (m.timeSpentSec || 0) + Math.max(0, Math.round(sec));
      persist();
    },

    /** Zapis wyniku pojedynczego pytania quizu inline (ID, wynik, próba, feedback — wymagania/10). */
    recordQuizResult(moduleId, result) {
      ensureActive();
      const m = ensureModule(moduleId);
      m.quizResults = m.quizResults || [];
      m.quizResults.push({
        questionId: result.questionId,
        correct: Boolean(result.correct),
        attempt: result.attempt || 1,
        ...(result.scoreAwarded != null ? { scoreAwarded: result.scoreAwarded } : {}),
        ...(result.feedbackShown != null ? { feedbackShown: result.feedbackShown } : {}),
        ...(result.feedback ? { feedback: result.feedback } : {}),
        answeredAt: now(),
      });
      if (m.status === "available") m.status = "in_progress";
      persist();
    },

    setInlineQuizScore(moduleId, pct) {
      ensureActive();
      ensureModule(moduleId).inlineQuizScorePct = pct;
      persist();
    },

    /** Zapis wyniku interakcji modułowej (klasyfikator / rubryka / strojenie) — "feedback i zapis wyniku" (#20). */
    recordInteraction(moduleId, result) {
      ensureActive();
      const m = ensureModule(moduleId);
      m.interaction = {
        kind: result.kind,
        score: result.score,
        max: result.max,
        ...(result.pct != null ? { pct: result.pct } : {}),
        ...(result.passed != null ? { passed: result.passed } : {}),
        completedAt: now(),
      };
      if (m.status === "available") m.status = "in_progress";
      persist();
    },

    recordFinalTest(result) {
      ensureActive();
      const prev = progress.finalTest || { attempts: 0, maxAttempts };
      progress.finalTest = {
        attempts: (prev.attempts || 0) + 1,
        maxAttempts: prev.maxAttempts || maxAttempts,
        lastScorePct: result.scorePct,
        criticalQuestionsPassed: Boolean(result.criticalPassed),
        passed: Boolean(result.passed),
        weakModules: (result.weakModules || []).map((w) => (typeof w === "string" ? w : w.module)),
      };
      persist();
      return progress.finalTest;
    },

    canAttemptFinalTest() {
      ensureActive();
      const ft = progress.finalTest || { attempts: 0, maxAttempts };
      return (ft.attempts || 0) < (ft.maxAttempts || maxAttempts);
    },

    recordPracticalTask(task) {
      ensureActive();
      progress.practicalTasks = progress.practicalTasks || [];
      const entry = {
        rubric: task.rubric,
        score: task.score,
        ...(task.maxScore != null ? { maxScore: task.maxScore } : {}),
        ...(task.passed != null ? { passed: task.passed } : {}),
        ...(task.comments ? { comments: task.comments } : {}),
        ...(task.areasForImprovement ? { areasForImprovement: task.areasForImprovement } : {}),
      };
      const i = progress.practicalTasks.findIndex((t) => t.rubric === task.rubric);
      if (i >= 0) progress.practicalTasks[i] = entry;
      else progress.practicalTasks.push(entry);
      persist();
    },

    recordCertificate(cert) {
      ensureActive();
      progress.certificate = {
        issued: Boolean(cert.issued),
        ...(cert.completionId ? { completionId: cert.completionId } : {}),
        ...(cert.scorePct != null ? { scorePct: cert.scorePct } : {}),
        issuedAt: cert.issuedAt || now(),
      };
      persist();
    },

    /** Kursor "ostatnie miejsce" — UI wraca tu po odświeżeniu (osobny klucz, poza obiektem progresu). */
    setLastLocation(moduleId, screen) {
      cursor = { pathId: activePath, moduleId, screen: screen || null };
      persistCursor();
      if (moduleId) {
        const m = ensureModule(moduleId);
        if (screen) m.lastScreen = screen;
        persist();
      }
    },
    getLastLocation: () => ({ ...cursor }),

    /** Reset progresu: aktywnej ścieżki lub (all=true) wszystkich ścieżek + kursora. */
    reset({ all = false } = {}) {
      if (all) {
        for (const k of adapter.keys().filter((x) => x.startsWith(`${PREFIX}:`))) adapter.remove(k);
        cursor = { pathId: null, moduleId: null, screen: null };
        activePath = null;
        progress = null;
        return;
      }
      ensureActive();
      adapter.remove(PROGRESS_KEY(activePath));
      progress = newProgress(activePath, maxAttempts, now);
      persist();
    },
  };
}
