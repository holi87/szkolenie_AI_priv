// path-select.js — ekran startowy: hero (pierwsze wrażenie) + wybór ścieżki S1/S2/S3 (issue #15, redesign UX-2 #71).
// Pokazuje zakres ścieżki (wymagane/opcjonalne moduły, czas, próg) i zapisuje wybór (callback onSelect).
import { el } from "./dom.js";
import { PATH_IDS, getPath } from "../core/paths.js";

// Źródło rekomendacji: stała (paths.json jest "frozen" + schema additionalProperties:false, więc nie
// wstrzykujemy tam flagi). S2 "Praktyk-użytkownik / QA" = główna persona szkolenia QA (wymagania/03).
const RECOMMENDED_PATH = "S2";

function pathCard(pathsData, modulesData, pathId, onSelect) {
  const p = getPath(pathsData, pathId);
  const nameById = Object.fromEntries(modulesData.modules.map((m) => [m.id, m.name]));
  const requiredNames = (p.requiredModules || []).map((id) => `${id} ${nameById[id] || ""}`.trim());
  const optionalCount = 12 - (p.requiredModules || []).length;
  const recommended = pathId === RECOMMENDED_PATH;

  return el("article", { class: `path-card${recommended ? " path-card--recommended" : ""}` }, [
    // Pasek + plakietka rekomendacji (gradient = sygnał wizualny, słowo = nośnik treści, WCAG 1.4.1).
    recommended ? el("p", { class: "path-card__badge", text: "Rekomendowana" }) : null,
    el("h3", { class: "path-card__name", text: `${pathId} — ${p.name}` }),
    el("p", { class: "path-card__meta", text: `Czas: ${p.assumedPathTime || "—"} · Test: ${p.finalTestQuestions} pytań · Próg: ${p.passThresholdPct}%` }),
    el("p", { class: "path-card__meta", text: `Moduły wymagane: ${(p.requiredModules || []).length}/12 · opcjonalne: ${optionalCount}` }),
    el("details", { class: "path-card__details" }, [
      el("summary", { text: "Pokaż moduły wymagane" }),
      el("ul", { class: "path-card__list" }, requiredNames.map((n) => el("li", { text: n }))),
    ]),
    p.practicalTasks ? el("p", { class: "path-card__meta", text: `Zadania praktyczne: ${p.practicalTasks}` }) : null,
    el("button", { class: "btn path-card__cta", type: "button", text: `Wybierz ${pathId}`, on: { click: () => onSelect(pathId) } }),
  ]);
}

/** Sekcja hero — pierwsze wrażenie. Tytuł z gradientowym akcentem na słowie kluczowym (fallback solid color w CSS). */
function hero() {
  return el("section", { class: "hero" }, [
    el("h1", { class: "hero__title" }, [
      "Opanuj ",
      el("span", { class: "hero__accent", text: "GenAI i LLM" }),
      " w pracy QA",
    ]),
    el("p", { class: "hero__lead", text: "Interaktywne, samodzielne szkolenie: ścieżka dopasowana do Twojej roli, quizy z natychmiastowym feedbackiem i certyfikat na koniec. Wszystko w przeglądarce — bez kont, bez wysyłki danych." }),
  ]);
}

/**
 * @param {object} opts - { onSelect(pathId), currentPath, participantName, onName(name) }
 */
export function renderPathSelect(pathsData, modulesData, opts = {}) {
  const root = el("div", { class: "view__content" });
  root.appendChild(hero());

  root.appendChild(el("h2", { class: "path-select__heading", text: "Wybierz swoją ścieżkę" }));
  root.appendChild(el("p", {
    text: "Ścieżka określa, które moduły są obowiązkowe, ile pytań ma test końcowy i jaki jest próg zaliczenia. Możesz ją później zmienić — postęp każdej ścieżki zapisuje się osobno.",
  }));

  if (opts.currentPath) {
    root.appendChild(el("p", { class: "path-badge", text: `Aktualna ścieżka: ${opts.currentPath}` }));
  }

  // Opcjonalny PSEUDONIM na certyfikat (#63 model C): trzymany tylko w pamięci sesji — NIE zapisywany.
  // Label celowo mówi „pseudonim", nie „imię" — minimalizacja danych (RODO art. 5(1)(c)), bez prawdziwego nazwiska.
  const nameInput = el("input", { type: "text", id: "participant-name", value: opts.participantName || "",
    attrs: { maxlength: "60", autocomplete: "off", placeholder: "np. Tester01 — nie podawaj prawdziwego nazwiska" } });
  if (typeof opts.onName === "function") nameInput.addEventListener("change", () => opts.onName(nameInput.value.trim()));
  root.appendChild(el("div", { class: "match-row" }, [
    el("label", { attrs: { for: "participant-name" }, text: "Pseudonim na certyfikacie (opcjonalnie):" }),
    nameInput,
  ]));
  // Nota informacyjna (nie zgoda): pseudonim sesyjny + lokalny zapis postępu. Bez cookies, nic nie wysyłamy.
  root.appendChild(el("p", { class: "muted privacy-note" }, [
    el("span", { text: "Pseudonim widać tylko na certyfikacie w tej sesji — nie zapisujemy go. Postęp i wyniki zapisują się lokalnie w Twojej przeglądarce; nic nie wysyłamy na serwer i nie używamy cookies. " }),
    el("a", { href: "prywatnosc.html", text: "Szczegóły: Prywatność" }),
  ]));

  root.appendChild(el("div", { class: "path-cards" }, PATH_IDS.map((id) => pathCard(pathsData, modulesData, id, opts.onSelect))));
  return root;
}
