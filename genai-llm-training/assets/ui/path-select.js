// path-select.js — ekran wyboru ścieżki S1/S2/S3 (issue #15).
// Pokazuje zakres ścieżki (wymagane/opcjonalne moduły, czas, próg) i zapisuje wybór (callback onSelect).
import { el } from "./dom.js";
import { PATH_IDS, getPath } from "../core/paths.js";

function pathCard(pathsData, modulesData, pathId, onSelect) {
  const p = getPath(pathsData, pathId);
  const nameById = Object.fromEntries(modulesData.modules.map((m) => [m.id, m.name]));
  const requiredNames = (p.requiredModules || []).map((id) => `${id} ${nameById[id] || ""}`.trim());
  const optionalCount = 12 - (p.requiredModules || []).length;

  return el("article", { class: "path-card" }, [
    el("h3", { text: `${pathId} — ${p.name}` }),
    el("p", { class: "path-card__meta", text: `Czas: ${p.assumedPathTime || "—"} · Test: ${p.finalTestQuestions} pytań · Próg: ${p.passThresholdPct}%` }),
    el("p", { class: "path-card__meta", text: `Moduły wymagane: ${(p.requiredModules || []).length}/12 · opcjonalne: ${optionalCount}` }),
    el("details", {}, [
      el("summary", { text: "Pokaż moduły wymagane" }),
      el("ul", { class: "path-card__list" }, requiredNames.map((n) => el("li", { text: n }))),
    ]),
    p.practicalTasks ? el("p", { class: "path-card__meta", text: `Zadania praktyczne: ${p.practicalTasks}` }) : null,
    el("button", { class: "btn", type: "button", text: `Wybierz ${pathId}`, on: { click: () => onSelect(pathId) } }),
  ]);
}

/**
 * @param {object} opts - { onSelect(pathId), currentPath, participantName, onName(name) }
 */
export function renderPathSelect(pathsData, modulesData, opts = {}) {
  const root = el("div", { class: "view__content" });
  root.appendChild(el("h1", { text: "Wybierz swoją ścieżkę" }));
  root.appendChild(el("p", {
    text: "Ścieżka określa, które moduły są obowiązkowe, ile pytań ma test końcowy i jaki jest próg zaliczenia. Możesz ją później zmienić — postęp każdej ścieżki zapisuje się osobno.",
  }));

  if (opts.currentPath) {
    root.appendChild(el("p", { class: "path-badge", text: `Aktualna ścieżka: ${opts.currentPath}` }));
  }

  // Opcjonalne imię uczestnika (do certyfikatu) — bez danych wrażliwych.
  const nameInput = el("input", { type: "text", id: "participant-name", value: opts.participantName || "",
    attrs: { maxlength: "60", autocomplete: "off", placeholder: "np. Tester Testowy" } });
  if (typeof opts.onName === "function") nameInput.addEventListener("change", () => opts.onName(nameInput.value.trim()));
  root.appendChild(el("div", { class: "match-row" }, [
    el("label", { attrs: { for: "participant-name" }, text: "Imię na certyfikacie (opcjonalnie):" }),
    nameInput,
  ]));

  root.appendChild(el("div", { class: "path-cards" }, PATH_IDS.map((id) => pathCard(pathsData, modulesData, id, opts.onSelect))));
  return root;
}
