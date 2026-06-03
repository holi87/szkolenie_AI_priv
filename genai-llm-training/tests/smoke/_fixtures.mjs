// _fixtures.mjs — ładowanie realnych danych szkolenia do testów silników (nie jest plikiem testowym).
// Czyta data/*.json z dysku (Node), żeby testy weryfikowały silniki na PRAWDZIWYM banku 116 pytań.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mergeQuestionBank, mergeModuleContent } from "../../assets/core/data-loader.js";
import { registerCatalog, setLocale } from "../../assets/i18n/i18n.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "..", "..", "data");
const read = (p) => JSON.parse(readFileSync(join(DATA, p), "utf8"));

// i18n (#77): rejestruj realne katalogi i ustaw PL, żeby render-testy widziały te same teksty co aplikacja.
// Side-effect importu — wykonuje się raz, przed ciałami testów importujących _fixtures (kolejność ESM).
const I18N = join(HERE, "..", "..", "assets", "i18n");
registerCatalog("pl", JSON.parse(readFileSync(join(I18N, "pl.json"), "utf8")));
registerCatalog("en", JSON.parse(readFileSync(join(I18N, "en.json"), "utf8")));
setLocale("pl");

export const pathsData = read("paths.json");
export const modulesData = read("modules.json");
export const rubricsData = read("rubrics.json");
export const scenariosData = read("scenarios.json");
export const goldenSetData = read("golden-set.json");
export const bank = mergeQuestionBank(
  Array.from({ length: 12 }, (_, i) => read(`questions/m${String(i + 1).padStart(2, "0")}.json`)),
);
// Treść modułów scalona po id (M1..M12) — tak jak konsumuje ją app.js (data.moduleContent[id]).
export const moduleContent = mergeModuleContent(
  Array.from({ length: 12 }, (_, i) => read(`module-content/m${String(i + 1).padStart(2, "0")}.json`)),
);

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
