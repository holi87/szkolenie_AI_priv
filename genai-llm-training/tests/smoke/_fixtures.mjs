// _fixtures.mjs — ładowanie realnych danych szkolenia do testów silników (nie jest plikiem testowym).
// Czyta data/*.json z dysku (Node), żeby testy weryfikowały silniki na PRAWDZIWYM banku 116 pytań.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mergeQuestionBank, mergeModuleContent, applyModuleLabels, applyPathLabels } from "../../assets/core/data-loader.js";
import { registerCatalog, setLocale } from "../../assets/i18n/i18n.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "..", "..", "data");
const read = (p) => JSON.parse(readFileSync(join(DATA, p), "utf8"));
// Układ per-locale (ADR-0004, #78): struktura wspólna w data/, treść+etykiety w data/pl/. Scalamy etykiety
// po ID — tak jak data-loader.js — żeby modulesData/pathsData miały name/level/... (render bez zmian).
const LOC = "pl";

// i18n (#77): rejestruj realne katalogi i ustaw PL, żeby render-testy widziały te same teksty co aplikacja.
// Side-effect importu — wykonuje się raz, przed ciałami testów importujących _fixtures (kolejność ESM).
const I18N = join(HERE, "..", "..", "assets", "i18n");
registerCatalog("pl", JSON.parse(readFileSync(join(I18N, "pl.json"), "utf8")));
registerCatalog("en", JSON.parse(readFileSync(join(I18N, "en.json"), "utf8")));
setLocale("pl");

export const pathsData = applyPathLabels(read("paths.json"), read(`${LOC}/paths.labels.json`));
export const modulesData = applyModuleLabels(read("modules.json"), read(`${LOC}/modules.labels.json`));
export const rubricsData = read(`${LOC}/rubrics.json`);
export const scenariosData = read(`${LOC}/scenarios.json`);
export const goldenSetData = read("golden-set.json"); // wspólny (language-neutral)
// #171: bank = rdzeń m01..m12 + shardy P2 mb1..mb6 (Q117..Q152) — ten sam układ co QUESTION_SHARDS loadera.
export const bank = mergeQuestionBank([
  ...Array.from({ length: 12 }, (_, i) => read(`${LOC}/questions/m${String(i + 1).padStart(2, "0")}.json`)),
  ...Array.from({ length: 6 }, (_, i) => read(`${LOC}/questions/mb${i + 1}.json`)),
]);
// Treść modułów scalona po id — tak jak konsumuje ją app.js (data.moduleContent[id]).
// #171: komplet 30 plików (m01..m12 + mshp/msho + msk1..4 + mb1..6 + md1..6) — zgodnie z MODULE_CONTENT_SHARDS.
export const moduleContent = mergeModuleContent([
  ...Array.from({ length: 12 }, (_, i) => read(`${LOC}/module-content/m${String(i + 1).padStart(2, "0")}.json`)),
  read(`${LOC}/module-content/mshp.json`),
  read(`${LOC}/module-content/msho.json`),
  ...Array.from({ length: 4 }, (_, i) => read(`${LOC}/module-content/msk${i + 1}.json`)),
  ...Array.from({ length: 6 }, (_, i) => read(`${LOC}/module-content/mb${i + 1}.json`)),
  ...Array.from({ length: 6 }, (_, i) => read(`${LOC}/module-content/md${i + 1}.json`)),
]);

/** Deterministyczny RNG (mulberry32) — powtarzalne losowanie testu w testach. */
export function seededRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pomocniczo: pierwsze pytanie danego typu z banku. */
export const firstOfType = (type) => bank.find((q) => q.type === type);
