// paths.js — macierz ścieżek S1/S2/S3 i gating modułów (issue #15).
// Pure logic, zero DOM. Źródło prawdy: data/paths.json (+ kolejność/nazwy z data/modules.json).
// Gating (AGENTS, konserwatywnie): treść self-paced (moduły dostępne), ale TEST KOŃCOWY jest
// zablokowany dopóki wszystkie moduły wymagane ścieżki nie są ukończone — to egzekwuje
// "nie da się zaliczyć ścieżki z pominięciem wymaganych modułów".

// S4 (M15/ADR-0009) = ścieżka FORMATYWNA (Skala Holaka): diagnoza + szkolenie, bez testu/scoringu/certyfikatu.
// #171: P1 „AI w domu" (formatywna) + P2 „Bezpieczne używanie AI" (zaliczeniowa); S1/S2/S3 = POZIOMY ścieżki
// „AI z QA" (pole level w paths.json) grupowane w UI w jedną kartę; S4 = BONUS (bonus:true) poza siatką wyboru.
// Kolejność = kolejność kart na ekranie wyboru (P1, P2, poziomy QA, bonus).
export const PATH_IDS = ["P1", "P2", "S1", "S2", "S3", "S4"];

/** Ścieżki-POZIOMY (#171): mają numeryczne pole level — UI grupuje je w jedną kartę „AI z QA" z selektorem. */
export function levelPathIds(pathsData) {
  return Object.entries((pathsData && pathsData.paths) || {})
    .filter(([, p]) => typeof p.level === "number")
    .sort((a, b) => a[1].level - b[1].level)
    .map(([id]) => id);
}

/** Poziom ścieżki (1..3) lub null, gdy ścieżka nie jest poziomem grupy „AI z QA". */
export function pathLevel(pathsData, pathId) {
  const p = pathsData && pathsData.paths && pathsData.paths[pathId];
  return p && typeof p.level === "number" ? p.level : null;
}

/** Ścieżka BONUSOWA (#171, S4 Skala Holaka): prezentowana poza siatką wyboru (osobny pasek), id bez zmian. */
export function isBonusPath(pathsData, pathId) {
  const p = pathsData && pathsData.paths && pathsData.paths[pathId];
  return Boolean(p && p.bonus === true);
}

/** Ścieżki samodzielne (#171): nie-poziomy i nie-bonus (P1, P2) — własna karta na ekranie wyboru. */
export function standalonePathIds(pathsData) {
  return PATH_IDS.filter((id) => {
    const p = pathsData && pathsData.paths && pathsData.paths[id];
    return p && typeof p.level !== "number" && p.bonus !== true;
  });
}

export function isValidPath(pathId) {
  return PATH_IDS.includes(pathId);
}

export function getPath(pathsData, pathId) {
  const p = pathsData && pathsData.paths && pathsData.paths[pathId];
  if (!p) throw new Error(`Nieznana ścieżka: ${pathId}`);
  return p;
}

/**
 * Czy ścieżka jest FORMATYWNA (M15/ADR-0009): diagnoza + szkolenie, BEZ testu końcowego, progu, scoringu i
 * certyfikatu. Predykat sterujący guardami UI (karta bez „Test/Próg", hub bez karty testu, nav bez testu)
 * oraz pominięciem ścieżki w pętlach test-engine/scoring. Analogiczny do scope:"diagnostic" na poziomie modułu.
 */
export function isFormativePath(pathsData, pathId) {
  const p = pathsData && pathsData.paths && pathsData.paths[pathId];
  return Boolean(p && p.formative === true);
}

/** Lista modułów wymaganych dla ścieżki (kolejność wg requiredModules w paths.json). */
export function requiredModules(pathsData, pathId) {
  return [...(getPath(pathsData, pathId).requiredModules || [])];
}

/** Wariant treści modułu dla ścieżki (full / skrocony / opcjonalny / …). */
export function moduleVariant(pathsData, pathId, moduleId) {
  const m = getPath(pathsData, pathId).modules[moduleId];
  return m ? m.variant : null;
}

function isModuleRequired(pathsData, pathId, moduleId) {
  const m = getPath(pathsData, pathId).modules[moduleId];
  return Boolean(m && m.required);
}

/**
 * Uporządkowana lista modułów dla ścieżki, wzbogacona o status i metadane wyświetlania.
 * @returns {Array<{id,name,order,required,variant,status}>}
 */
export function pathModuleList(pathsData, modulesData, pathId, progress) {
  const path = getPath(pathsData, pathId);
  const ordered = [...modulesData.modules].sort((a, b) => a.order - b.order);
  return ordered.map((mod) => {
    const cfg = path.modules[mod.id] || { required: false, variant: "opcjonalny" };
    return {
      id: mod.id,
      name: mod.name,
      order: mod.order,
      required: Boolean(cfg.required),
      variant: cfg.variant,
      status: moduleStatus(progress, mod.id),
    };
  });
}

/**
 * Moduły WIDOCZNE dla ścieżki. #171 (decyzja właściciela, Rebuild.md §2.2): w ramach poziomu „AI z QA"
 * moduły opcjonalne są WIDOCZNE z badge „opcjonalny" (zachęta do rozszerzania) — koniec ukrywania
 * persona-set z M13/ADR-0006 (poziom gra rolę dawnej persony; pełna lista 12 modułów + oznaczenia).
 * Gating niezmieniony: required decyduje o blokerach testu; opcjonalne nie blokują zaliczenia.
 */
export function pathVisibleModuleIds(pathsData, pathId) {
  const mm = getPath(pathsData, pathId).modules || {};
  return new Set(Object.keys(mm));
}

/** Status modułu z progresu: completed | in_progress | available (self-paced, brak twardego locka). */
export function moduleStatus(progress, moduleId) {
  const st = progress && progress.modules && progress.modules[moduleId] && progress.modules[moduleId].status;
  if (st === "completed") return "completed";
  if (st === "in_progress") return "in_progress";
  return "available";
}

/** Moduły wymagane, które NIE są jeszcze ukończone — blokery zaliczenia ścieżki. */
export function pathCompletionBlockers(progress, pathsData, pathId) {
  return requiredModules(pathsData, pathId).filter((id) => moduleStatus(progress, id) !== "completed");
}

/** Rubryki zadań praktycznych wymagane przez ścieżkę (z bramek practicalTask/moduleMinScore w paths.json). */
export function requiredPracticalRubrics(pathsData, pathId) {
  return (getPath(pathsData, pathId).gates || [])
    .filter((g) => (g.type === "practicalTask" || g.type === "moduleMinScore") && g.rubric)
    .map((g) => g.rubric);
}

/** Zapisany wynik zadania praktycznego dla danej rubryki (lub null). */
function practicalResultFor(progress, rubric) {
  return ((progress && progress.practicalTasks) || []).find((t) => t.rubric === rubric) || null;
}

/** Czy zapisany wynik praktyczny SPEŁNIA próg swojej bramki (autorytatywnie wg paths.json, nie wg flagi passed). */
function practicalGateSatisfied(gate, result) {
  if (!result || typeof result.score !== "number") return false; // brak wyniku → niespełniona
  if (gate.type === "practicalTask") return result.score >= gate.minScore;
  if (gate.type === "moduleMinScore") {
    const max = result.maxScore || gate.maxScore;
    const pct = max ? (result.score / max) * 100 : 0;
    return pct >= gate.minPct;
  }
  return false;
}

/**
 * Wymagane rubryki praktyczne, których bramka NIE jest jeszcze SPEŁNIONA (brak wyniku ALBO wynik poniżej progu).
 * Konserwatywnie blokują test końcowy: dopóki bramka praktyczna nie przejdzie, każde podejście i tak nie zaliczy
 * ścieżki, a zużyłoby limit prób (po wyczerpaniu prób certyfikat byłby nieosiągalny). Zadanie praktyczne można
 * powtarzać bez limitu, więc lepiej zablokować test do czasu zaliczenia praktyki niż marnować podejścia do testu.
 */
export function missingPracticalRubrics(progress, pathsData, pathId) {
  return (getPath(pathsData, pathId).gates || [])
    .filter((g) => (g.type === "practicalTask" || g.type === "moduleMinScore") && g.rubric)
    .filter((g) => !practicalGateSatisfied(g, practicalResultFor(progress, g.rubric)))
    .map((g) => g.rubric);
}

/** Czy test końcowy jest odblokowany (moduły wymagane ukończone ORAZ wymagane praktyki zapisane). */
export function isFinalTestUnlocked(progress, pathsData, pathId) {
  return pathCompletionBlockers(progress, pathsData, pathId).length === 0
    && missingPracticalRubrics(progress, pathsData, pathId).length === 0;
}

/**
 * Status sekcji testu końcowego dla nawigacji: locked | available.
 * Zwraca DANE STRUKTURALNE (blockers = brakujące moduły wymagane, missingPractical = niewykonane
 * zadania praktyczne; design-baseline §3) — same ID, locale-neutral. i18n (ADR-0004): core zostaje
 * zero-i18n, czytelny powód blokady składa UI (shell.js) z tych pól przez t('test.lockedReason.*').
 */
export function finalTestStatus(progress, pathsData, pathId) {
  const blockers = pathCompletionBlockers(progress, pathsData, pathId);
  const missingPractical = missingPracticalRubrics(progress, pathsData, pathId);
  const status = blockers.length === 0 && missingPractical.length === 0 ? "available" : "locked";
  return { status, blockers, missingPractical };
}
