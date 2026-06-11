// path-select.js — ekran startowy: hero (pierwsze wrażenie) + wybór ścieżki S1/S2/S3 (issue #15, redesign UX-2 #71).
// Pokazuje zakres ścieżki (wymagane/opcjonalne moduły, czas, próg) i zapisuje wybór (callback onSelect).
import { el } from "./dom.js";
import { t, privacyHref } from "../i18n/i18n.js";
import { PATH_IDS, getPath, levelPathIds, pathLevel, isBonusPath, standalonePathIds } from "../core/paths.js";

// Źródło rekomendacji: stała (paths.json jest "frozen" + schema additionalProperties:false, więc nie
// wstrzykujemy tam flagi). S2 "Praktyk" = główna persona szkolenia QA (wymagania/03) — #171: rekomendacja
// dotyczy POZIOMU w karcie „AI z QA" (domyślnie zaznaczony selektor + badge na karcie grupy).
const RECOMMENDED_PATH = "S2";

function pathCard(pathsData, modulesData, pathId, onSelect) {
  const p = getPath(pathsData, pathId);
  const nameById = Object.fromEntries(modulesData.modules.map((m) => [m.id, m.name]));
  const recommended = pathId === RECOMMENDED_PATH;

  // Ścieżka FORMATYWNA (S4, M15/ADR-0009): diagnoza + szkolenie, BEZ testu/progu/zadań/certyfikatu.
  // Inna karta — meta bez „Test: N · Próg: X%" (pola nie istnieją); lista modułów ścieżki zamiast „wymaganych".
  if (p.formative === true) {
    const moduleNames = Object.keys(p.modules || {}).map((id) => `${id} ${nameById[id] || ""}`.trim());
    return el("article", { class: "path-card path-card--formative" }, [
      el("div", { class: "path-card__head" }, [
        el("span", { class: "path-card__sigil", attrs: { "aria-hidden": "true" }, text: pathId }),
        el("div", {}, [
          el("h3", { class: "path-card__name", text: t("path.card.name", { pathId, pathName: p.name }) }),
          el("span", { class: "path-card__role", text: t(`path.card.role.${pathId}`) }),
        ]),
      ]),
      el("p", { class: "path-card__meta", text: t("path.card.meta.formative", { time: p.assumedPathTime || "—" }) }),
      el("p", { class: "path-card__meta", text: t("path.card.meta.modulesFormative", { count: moduleNames.length }) }),
      el("details", { class: "path-card__details" }, [
        el("summary", { text: t("path.card.showModules") }),
        el("ul", { class: "path-card__list" }, moduleNames.map((n) => el("li", { text: n }))),
      ]),
      el("button", { class: "btn path-card__cta", type: "button", text: t("path.card.cta", { pathId }), on: { click: () => onSelect(pathId) } }),
    ]);
  }

  const requiredNames = (p.requiredModules || []).map((id) => `${id} ${nameById[id] || ""}`.trim());
  // #171: liczba modułów DERYWOWANA z mapy modułów ścieżki (P2 ma 6, poziomy QA 12) — nie hardkoduj 12.
  const totalModules = Object.keys(p.modules || {}).length;
  const optionalCount = totalModules - (p.requiredModules || []).length;

  return el("article", { class: `path-card${recommended ? " path-card--recommended" : ""}` }, [
    // Pasek + plakietka rekomendacji (gradient = sygnał wizualny, słowo = nośnik treści, WCAG 1.4.1).
    recommended ? el("p", { class: "path-card__badge", text: t("path.badge.recommended") }) : null,
    el("div", { class: "path-card__head" }, [
      el("span", { class: "path-card__sigil", attrs: { "aria-hidden": "true" }, text: pathId }),
      el("div", {}, [
        el("h3", { class: "path-card__name", text: t("path.card.name", { pathId, pathName: p.name }) }),
        el("span", { class: "path-card__role", text: t(`path.card.role.${pathId}`) }),
      ]),
    ]),
    el("p", { class: "path-card__meta", text: t("path.card.meta.timeTestThreshold", { time: p.assumedPathTime || "—", questions: p.finalTestQuestions, threshold: p.passThresholdPct }) }),
    el("p", { class: "path-card__meta", text: t("path.card.meta.modulesOf", { required: (p.requiredModules || []).length, total: totalModules, optional: optionalCount }) }),
    el("details", { class: "path-card__details" }, [
      el("summary", { text: t("path.card.showRequired") }),
      el("ul", { class: "path-card__list" }, requiredNames.map((n) => el("li", { text: n }))),
    ]),
    p.practicalTasks ? el("p", { class: "path-card__meta", text: t("path.card.meta.practicalTasks", { tasks: p.practicalTasks }) }) : null,
    el("button", { class: "btn path-card__cta", type: "button", text: t("path.card.cta", { pathId }), on: { click: () => onSelect(pathId) } }),
  ]);
}

/**
 * Karta GRUPY „AI z QA" (#171): poziomy S1/S2/S3 scalone w jedną kartę z selektorem poziomu.
 * Selektor = przyciski z aria-pressed (toggle group); meta i lista wymaganych przerysowują się
 * po zmianie poziomu. CTA wybiera ścieżkę-poziom (id S1/S2/S3 — dane i progres bez zmian, zero migracji).
 */
function qaGroupCard(pathsData, modulesData, onSelect) {
  const ids = levelPathIds(pathsData);
  if (ids.length === 0) return null;
  const nameById = Object.fromEntries(modulesData.modules.map((m) => [m.id, m.name]));
  let selected = ids.includes(RECOMMENDED_PATH) ? RECOMMENDED_PATH : ids[0];

  const meta1 = el("p", { class: "path-card__meta" });
  const meta2 = el("p", { class: "path-card__meta" });
  const metaTasks = el("p", { class: "path-card__meta" });
  const list = el("ul", { class: "path-card__list" });
  const cta = el("button", { class: "btn path-card__cta", type: "button", on: { click: () => onSelect(selected) } });

  const levelButtons = ids.map((id) =>
    el("button", {
      class: "level-switch__btn", type: "button",
      attrs: { "aria-pressed": String(id === selected) },
      text: t(`path.level.${pathLevel(pathsData, id)}`),
      on: { click: (e) => { e.stopPropagation(); selected = id; sync(); } },
    }),
  );

  function sync() {
    const p = getPath(pathsData, selected);
    const total = Object.keys(p.modules || {}).length;
    const req = (p.requiredModules || []).length;
    levelButtons.forEach((b, i) => b.setAttribute("aria-pressed", String(ids[i] === selected)));
    meta1.textContent = t("path.card.meta.timeTestThreshold", { time: p.assumedPathTime || "—", questions: p.finalTestQuestions, threshold: p.passThresholdPct });
    meta2.textContent = t("path.card.meta.modulesOf", { required: req, total, optional: total - req });
    metaTasks.textContent = p.practicalTasks ? t("path.card.meta.practicalTasks", { tasks: p.practicalTasks }) : "";
    metaTasks.hidden = !p.practicalTasks;
    list.textContent = "";
    for (const id of p.requiredModules || []) list.appendChild(el("li", { text: `${id} ${nameById[id] || ""}`.trim() }));
    cta.textContent = t("path.group.cta", { level: t(`path.level.${pathLevel(pathsData, selected)}`) });
  }
  sync();

  return el("article", { class: "path-card path-card--group path-card--recommended" }, [
    el("p", { class: "path-card__badge", text: t("path.badge.recommended") }),
    el("div", { class: "path-card__head" }, [
      el("span", { class: "path-card__sigil", attrs: { "aria-hidden": "true" }, text: "QA" }),
      el("div", {}, [
        el("h3", { class: "path-card__name", text: t("path.group.qa.name") }),
        el("span", { class: "path-card__role", text: t("path.group.qa.role") }),
      ]),
    ]),
    el("div", { class: "level-switch", attrs: { role: "group", "aria-label": t("path.group.level.label") } }, levelButtons),
    meta1, meta2, metaTasks,
    el("details", { class: "path-card__details" }, [
      el("summary", { text: t("path.card.showRequired") }),
      list,
    ]),
    cta,
  ]);
}

/** Pasek BONUSU (#171): ścieżki bonus:true (S4 Skala Holaka) poza siatką wyboru — nie konkurują w pickerze. */
function bonusCard(pathsData, pathId, onSelect) {
  const p = getPath(pathsData, pathId);
  return el("article", { class: "bonus-card" }, [
    el("span", { class: "bonus-card__sigil", attrs: { "aria-hidden": "true" }, text: pathId }),
    el("div", { class: "bonus-card__body" }, [
      el("h3", { class: "bonus-card__name" }, [
        t("path.bonus.heading", { pathName: p.name }),
        el("span", { class: "bonus-card__badge", text: t("path.bonus.badge") }),
      ]),
      el("p", { class: "bonus-card__meta", text: `${t("path.bonus.lead")} · ${t("path.card.meta.formative", { time: p.assumedPathTime || "—" })}` }),
    ]),
    el("button", { class: "btn btn--ghost bonus-card__cta", type: "button", text: t("path.card.cta", { pathId }), on: { click: () => onSelect(pathId) } }),
  ]);
}

/** Czas „pełnego kursu" = górna granica NAJDŁUŻSZEJ ścieżki, derywowana z assumedPathTime (np. „9-10 h (A4)" → 10).
    Wcześniej zahardkodowane „~6 h" zaniżało (najdłuższa ścieżka S3 ≈ 9-10 h, nie 6 h) — niespójność zgłoszona przez
    właściciela (M20 #167). Strip nawiasów „(A4)" przed parsowaniem; fallback „~6 h" gdy brak danych. */
function fullCourseTime(pathsData) {
  let maxH = 0;
  for (const id of PATH_IDS) {
    try {
      const s = String(getPath(pathsData, id).assumedPathTime || "").replace(/\([^)]*\)/g, "");
      const nums = s.match(/\d+(?:[.,]\d+)?/g);
      if (nums) for (const n of nums) maxH = Math.max(maxH, parseFloat(n.replace(",", ".")));
    } catch { /* ścieżka bez czasu — pomiń */ }
  }
  return maxH > 0 ? `~${Number.isInteger(maxH) ? maxH : maxH.toFixed(1)} h` : "~6 h";
}

/** Pasek statystyk (stats-strip) — hero__row z trzema liczbami (moduły / ścieżki / czas).
    Liczby derywowane z danych (PATH_IDS.length, MODULE_COUNT, max assumedPathTime), nie hardkodowane.
    Etykiety przez t() dla i18n. Klasy: hero__row / hero__stat (makieta 01 floor). */
function heroStats(pathsData, modulesData) {
  const moduleCount = modulesData && modulesData.modules ? modulesData.modules.length : 12;
  // #171: liczba „ścieżek" w hero = karty wyboru (samodzielne + 1 grupa poziomów + bonusy), nie surowe PATH_IDS
  // (poziomy S1/S2/S3 to jedna ścieżka „AI z QA" w trzech konfiguracjach).
  const pathCount = standalonePathIds(pathsData).length
    + (levelPathIds(pathsData).length > 0 ? 1 : 0)
    + PATH_IDS.filter((id) => isBonusPath(pathsData, id)).length;
  const stats = [
    { value: String(moduleCount),     label: t("path.hero.stat.modules") },
    { value: String(pathCount),       label: t("path.hero.stat.paths") },
    { value: fullCourseTime(pathsData), label: t("path.hero.stat.time") },
  ];
  return el("div", { class: "hero__row" },
    stats.map((s) => el("span", { class: "hero__stat" }, [
      el("b", { text: s.value }),
      el("span", { text: s.label }),
    ])),
  );
}

/** Sekcja hero — pierwsze wrażenie. Tytuł z gradientowym akcentem na słowie kluczowym (fallback solid color w CSS).
    Szablon z placeholderem {accent} rozbity tak, by akcent został w <span> (styl), a kolejność słów była tłumaczalna.
    Eyebrow (klasa .eyebrow) nad tytułem — prymityw wizualny (STAGE A, #139). */
function hero(pathsData, modulesData) {
  const [before, after = ""] = t("path.hero.title.template").split("{accent}");
  return el("section", { class: "hero" }, [
    el("p", { class: "eyebrow", text: t("path.hero.eyebrow") }),
    el("h1", { class: "hero__title" }, [
      before || null,
      el("span", { class: "hero__accent", text: t("path.hero.title.accent") }),
      after || null,
    ]),
    el("p", { class: "hero__lead", text: t("path.hero.lead") }),
    heroStats(pathsData, modulesData),
  ]);
}

/**
 * @param {object} opts - { onSelect(pathId), currentPath }
 */
export function renderPathSelect(pathsData, modulesData, opts = {}) {
  // view__content--full: zdejmuje cap 70ch (max-width:none), żeby hero + siatka kart wypełniły szerokość
  // widoku (jak makieta 01). Bez tego treść wciska się w lewy ~620px słup, prawy bok pusty (M19 #159).
  const root = el("div", { class: "view__content view__content--full" });
  root.appendChild(hero(pathsData, modulesData));

  // Section-head: eyebrow (krok) + h2 w jednym wierszu (wzorzec makiety 01 .section-head).
  // Eyebrow „Wybierz ścieżkę" zamiast „Krok 1 z 5" — nie hardkodujemy numeracji kroków (sekwencja nieokreślona w danych).
  root.appendChild(el("div", { class: "section-head" }, [
    el("div", {}, [
      el("h2", { class: "path-select__heading", text: t("path.select.heading") }),
    ]),
  ]));
  root.appendChild(el("p", { text: t("path.select.intro") }));

  if (opts.currentPath) {
    root.appendChild(el("p", { class: "path-badge", text: t("path.select.currentPath", { pathId: opts.currentPath }) }));
  }

  // Nota informacyjna (nie zgoda): lokalny zapis postępu w przeglądarce. Bez cookies, nic nie wysyłamy.
  // M12-2 (#93): zniesiono input pseudonimu (certyfikat usunięty) — nota prywatności i link zostają.
  root.appendChild(el("p", { class: "muted privacy-note" }, [
    el("span", { text: t("path.privacy.note") }),
    el("a", { href: privacyHref(), text: t("path.privacy.link") }),
  ]));

  // #171: siatka = ścieżki samodzielne (P1, P2) + karta grupy „AI z QA" (poziomy S1/S2/S3);
  // bonus (S4 Skala Holaka) pod siatką jako osobny pasek — nie konkuruje w pickerze.
  const cards = [
    ...standalonePathIds(pathsData).map((id) => pathCard(pathsData, modulesData, id, opts.onSelect)),
    qaGroupCard(pathsData, modulesData, opts.onSelect),
  ].filter(Boolean);
  root.appendChild(el("div", { class: "path-cards" }, cards));
  for (const id of PATH_IDS.filter((x) => isBonusPath(pathsData, x))) {
    root.appendChild(bonusCard(pathsData, id, opts.onSelect));
  }
  return root;
}
