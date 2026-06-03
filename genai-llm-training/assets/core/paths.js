// paths.js — macierz ścieżek S1/S2/S3 i gating modułów (issue #15).
// Pure logic, zero DOM. Źródło prawdy: data/paths.json (+ kolejność/nazwy z data/modules.json).
// Gating (AGENTS, konserwatywnie): treść self-paced (moduły dostępne), ale TEST KOŃCOWY jest
// zablokowany dopóki wszystkie moduły wymagane ścieżki nie są ukończone — to egzekwuje
// "nie da się zaliczyć ścieżki z pominięciem wymaganych modułów".

export const PATH_IDS = ["S1", "S2", "S3"];

export function isValidPath(pathId) {
  return PATH_IDS.includes(pathId);
}

export function getPath(pathsData, pathId) {
  const p = pathsData && pathsData.paths && pathsData.paths[pathId];
  if (!p) throw new Error(`Nieznana ścieżka: ${pathId}`);
  return p;
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

/** Czy test końcowy jest odblokowany (wszystkie moduły wymagane ukończone). */
export function isFinalTestUnlocked(progress, pathsData, pathId) {
  return pathCompletionBlockers(progress, pathsData, pathId).length === 0;
}

/**
 * Status sekcji testu końcowego dla nawigacji: locked | available.
 * lockedReason wymienia brakujące moduły wymagane (czytelne oznaczenie blokady — design-baseline §3).
 */
export function finalTestStatus(progress, pathsData, pathId) {
  const blockers = pathCompletionBlockers(progress, pathsData, pathId);
  return blockers.length === 0
    ? { status: "available", lockedReason: null, blockers: [] }
    : {
        status: "locked",
        lockedReason: `Ukończ moduły wymagane: ${blockers.join(", ")}`,
        blockers,
      };
}
