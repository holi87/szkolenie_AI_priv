// path-select.js — ekran startowy: hero (pierwsze wrażenie) + wybór ścieżki S1/S2/S3 (issue #15, redesign UX-2 #71).
// Pokazuje zakres ścieżki (wymagane/opcjonalne moduły, czas, próg) i zapisuje wybór (callback onSelect).
import { el } from "./dom.js";
import { t, getLocale } from "../i18n/i18n.js";
import { PATH_IDS, getPath } from "../core/paths.js";

// Strona prywatności jest statyczna i per-locale (EN: privacy.html, PL: prywatnosc.html) — #81.
const privacyHref = () => (getLocale() === "en" ? "privacy.html" : "prywatnosc.html");

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
    recommended ? el("p", { class: "path-card__badge", text: t("path.badge.recommended") }) : null,
    el("h3", { class: "path-card__name", text: t("path.card.name", { pathId, pathName: p.name }) }),
    el("p", { class: "path-card__meta", text: t("path.card.meta.timeTestThreshold", { time: p.assumedPathTime || "—", questions: p.finalTestQuestions, threshold: p.passThresholdPct }) }),
    el("p", { class: "path-card__meta", text: t("path.card.meta.modules", { required: (p.requiredModules || []).length, optional: optionalCount }) }),
    el("details", { class: "path-card__details" }, [
      el("summary", { text: t("path.card.showRequired") }),
      el("ul", { class: "path-card__list" }, requiredNames.map((n) => el("li", { text: n }))),
    ]),
    p.practicalTasks ? el("p", { class: "path-card__meta", text: t("path.card.meta.practicalTasks", { tasks: p.practicalTasks }) }) : null,
    el("button", { class: "btn path-card__cta", type: "button", text: t("path.card.cta", { pathId }), on: { click: () => onSelect(pathId) } }),
  ]);
}

/** Sekcja hero — pierwsze wrażenie. Tytuł z gradientowym akcentem na słowie kluczowym (fallback solid color w CSS).
    Szablon z placeholderem {accent} rozbity tak, by akcent został w <span> (styl), a kolejność słów była tłumaczalna. */
function hero() {
  const [before, after = ""] = t("path.hero.title.template").split("{accent}");
  return el("section", { class: "hero" }, [
    el("h1", { class: "hero__title" }, [
      before || null,
      el("span", { class: "hero__accent", text: t("path.hero.title.accent") }),
      after || null,
    ]),
    el("p", { class: "hero__lead", text: t("path.hero.lead") }),
  ]);
}

/**
 * @param {object} opts - { onSelect(pathId), currentPath, participantName, onName(name) }
 */
export function renderPathSelect(pathsData, modulesData, opts = {}) {
  const root = el("div", { class: "view__content" });
  root.appendChild(hero());

  root.appendChild(el("h2", { class: "path-select__heading", text: t("path.select.heading") }));
  root.appendChild(el("p", { text: t("path.select.intro") }));

  if (opts.currentPath) {
    root.appendChild(el("p", { class: "path-badge", text: t("path.select.currentPath", { pathId: opts.currentPath }) }));
  }

  // Opcjonalny PSEUDONIM na certyfikat (#63 model C): trzymany tylko w pamięci sesji — NIE zapisywany.
  // Label celowo mówi „pseudonim", nie „imię" — minimalizacja danych (RODO art. 5(1)(c)), bez prawdziwego nazwiska.
  const nameInput = el("input", { type: "text", id: "participant-name", value: opts.participantName || "",
    attrs: { maxlength: "60", autocomplete: "off", placeholder: t("path.name.placeholder") } });
  if (typeof opts.onName === "function") nameInput.addEventListener("change", () => opts.onName(nameInput.value.trim()));
  root.appendChild(el("div", { class: "match-row" }, [
    el("label", { attrs: { for: "participant-name" }, text: t("path.name.label") }),
    nameInput,
  ]));
  // Nota informacyjna (nie zgoda): pseudonim sesyjny + lokalny zapis postępu. Bez cookies, nic nie wysyłamy.
  root.appendChild(el("p", { class: "muted privacy-note" }, [
    el("span", { text: t("path.privacy.note") }),
    el("a", { href: privacyHref(), text: t("path.privacy.link") }),
  ]));

  root.appendChild(el("div", { class: "path-cards" }, PATH_IDS.map((id) => pathCard(pathsData, modulesData, id, opts.onSelect))));
  return root;
}
