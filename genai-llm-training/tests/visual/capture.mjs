// capture.mjs — ORKIESTRATOR harnessu wizualnego live-vs-mockup (#137).
// Jedna komenda (`node capture.mjs`) robi CALOSC:
//   1. startuje lokalny statyczny serwer z korzenia repo (oba zrodla pod sciezkami wzglednymi),
//   2. dla kazdego ekranu × motyw (dark/light) × szerokosc (desktop/360/320):
//        - seeduje stan (localStorage via realny store) i bootuje produkcje, dochodzi do ekranu (klik CTA),
//          robi pelnostronicowy zrzut,
//        - bootuje odpowiadajacy mockup z wymuszonym motywem, robi zrzut,
//   3. generuje raport HTML „obok siebie" (produkcja | mockup),
//   4. zamyka serwer i przegladarke.
//
// OPT-IN / DEV-ONLY: NIE jest bramka CI (ADR-0002, #137). Wymaga lokalnie zainstalowanego Playwrighta
// (patrz README.md). Dziala OFFLINE, bez CDN. Zrzuty + raport laduja w ./output (gitignore).

import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { startStaticServer } from "./lib/server.mjs";
import { buildReportHtml } from "./lib/report.mjs";
import {
  SCREENS, THEMES, WIDTHS, S1_REQUIRED, THEME_KEY,
  MOCKUP_FRAME, MOCKUP_VP_BTN,
} from "./lib/screens.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
// Korzen repo = 4 poziomy w gore: tests/visual → tests → genai-llm-training → <repo-root>.
const REPO_ROOT = join(HERE, "..", "..", "..");
const OUT_DIR = join(HERE, "output");
const SHOTS_DIR = join(OUT_DIR, "shots");

// Playwright importujemy DYNAMICZNIE — gdy nie zainstalowany, dajemy czytelny komunikat zamiast crasha.
async function loadChromium() {
  try {
    const { chromium } = await import("playwright");
    return chromium;
  } catch {
    console.error(
      "\n[#137] Playwright nie jest zainstalowany w tym katalogu.\n" +
      "  Zainstaluj lokalnie (DEV-ONLY, opt-in — patrz README.md):\n" +
      "    cd genai-llm-training/tests/visual && npm i && npx playwright install chromium\n",
    );
    process.exit(2);
  }
}

// Walidacja kontraktu seedu wzgledem danych produkcji: jesli ktos zmieni requiredModules(S1),
// seed „test odblokowany/wynik" przestanie odblokowywac test → tu failujemy GLOSNO, bez cichego mockupa-bez-pary.
async function assertSeedContract() {
  const raw = await readFile(join(REPO_ROOT, "genai-llm-training", "data", "paths.json"), "utf8");
  const paths = JSON.parse(raw).paths || {};
  const actual = (paths.S1 && paths.S1.requiredModules) || [];
  const same = actual.length === S1_REQUIRED.length && actual.every((m) => S1_REQUIRED.includes(m));
  if (!same) {
    throw new Error(
      `Kontrakt seedu nieaktualny: requiredModules(S1) w paths.json = [${actual}], ` +
      `harness zaklada [${S1_REQUIRED}]. Zaktualizuj S1_REQUIRED w lib/screens.mjs.`,
    );
  }
}

/** Zrzut produkcji: seed (opcjonalny) → boot index.html → ewentualny klik CTA → DOWÓD DOTARCIA → screenshot. */
async function captureProd(context, baseUrl, screen, theme, file) {
  const page = await context.newPage();
  try {
    // 1. Wyczysc localStorage PRZED kazdym ekranem → brak wycieku progresu z poprzedniego seedu
    //    (kolejnosc ekranow przestaje byc nosna; kazdy zrzut deterministyczny). Kolejnosc addInitScript
    //    = kolejnosc rejestracji, wiec czyszczenie → motyw → seed wykonaja sie w tej kolejnosci.
    await page.addInitScript(() => { try { localStorage.clear(); } catch { /* noop */ } });
    // 2. Wymus motyw appki (anti-flash w index.html czyta THEME_KEY z localStorage PRZED CSS).
    await page.addInitScript(([key, t]) => {
      try { localStorage.setItem(key, t); } catch { /* noop */ }
    }, [THEME_KEY, theme]);
    // 3. Seed stanu ekranu (opcjonalny) — realny store produkcji.
    if (screen.seed) await page.addInitScript({ content: screen.seed });

    await page.goto(`${baseUrl}${screen.prodUrl}`, { waitUntil: "networkidle" });

    if (screen.reach) {
      // Hub musi sie najpierw wyrenderowac (seed wygral wyscig), zanim klikniemy karte.
      const cta = page.locator(screen.reach).first();
      await cta.waitFor({ state: "visible", timeout: 15000 });
      await cta.click();
      await page.waitForLoadState("networkidle");
    }
    // DOWÓD DOTARCIA: element istniejacy TYLKO na docelowym ekranie. Jesli seed przegral wyscig
    // i appka zostala na zlym ekranie → tu timeout → para oznaczona FAIL (zamiast cichego zlego zrzutu).
    await page.locator(screen.arrival).first().waitFor({ state: "visible", timeout: 15000 });
    // Drobna pauza na domkniecie renderu/asset-ow po przejsciu.
    await page.waitForTimeout(250);
    await page.screenshot({ path: file, fullPage: true });
    return { ok: true };
  } catch (err) {
    return { ok: false, note: `prod: ${err.message.split("\n")[0]}` };
  } finally {
    await page.close();
  }
}

/**
 * Zrzut mockupa: boot standalone HTML → wymus motyw (data-theme) → przelacz widok mockupa
 * na desktop/mobile jego wlasnym przyciskiem → screenshot SAMEGO ekranu (`.frame`, bez demo-toolbara).
 */
async function captureMockup(context, baseUrl, screen, theme, width, file) {
  const page = await context.newPage();
  try {
    // Mockupy maja reguly [data-theme] + domyslnie dark; wymuszamy motyw atrybutem na <html> przed renderem.
    // Mockupowy skrypt NIE inicjalizuje motywu na load (tylko on-click) → nasze wymuszenie nie jest nadpisywane.
    await page.addInitScript((t) => {
      const apply = () => document.documentElement.setAttribute("data-theme", t);
      apply();
      document.addEventListener("DOMContentLoaded", apply);
    }, theme);
    await page.goto(`${baseUrl}${screen.mockupUrl}`, { waitUntil: "networkidle" });

    // Przelacz demo-viewport mockupa (desktop/mobile) jego wlasnym przyciskiem — uklad mobilny mockupa
    // wynika z klasy .frame.is-mobile (toggle przyciskiem), nie z szerokosci okna.
    const vpBtn = page.locator(MOCKUP_VP_BTN(width.mockupVp));
    if (await vpBtn.count()) await vpBtn.first().click();

    await page.waitForTimeout(250);
    // Zrzut samego ekranu w ramce (bez .mk-bar) — czyste porownanie 1:1 z produkcja.
    const frame = page.locator(MOCKUP_FRAME).first();
    const target = (await frame.count()) ? frame : page;
    await target.screenshot({ path: file });
    return { ok: true };
  } catch (err) {
    return { ok: false, note: `mockup: ${err.message.split("\n")[0]}` };
  } finally {
    await page.close();
  }
}

async function main() {
  await assertSeedContract();

  // Czysty start: skasuj poprzednie zrzuty (regenerowalne), odtworz katalogi.
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(SHOTS_DIR, { recursive: true });

  const chromium = await loadChromium();
  const { baseUrl, close } = await startStaticServer(REPO_ROOT);
  console.log(`[#137] Serwer statyczny: ${baseUrl} (korzeń: repo)`);

  const browser = await chromium.launch();
  const shots = [];
  try {
    for (const width of WIDTHS) {
      // Osobny kontekst per szerokosc = czysty localStorage (bez wycieku seedu miedzy ekranami) + viewport.
      for (const theme of THEMES) {
        const context = await browser.newContext({
          viewport: { width: width.width, height: width.height },
          colorScheme: theme, // fallback dla prefers-color-scheme; appka i tak czyta THEME_KEY
          deviceScaleFactor: 1,
        });
        for (const screen of SCREENS) {
          const stem = `${screen.id}__${theme}__${width.id}`;
          const prodRel = `shots/${stem}__prod.png`;
          const mockupRel = `shots/${stem}__mockup.png`;
          const prodAbs = join(OUT_DIR, prodRel);
          const mockupAbs = join(OUT_DIR, mockupRel);

          const prod = await captureProd(context, baseUrl, screen, theme, prodAbs);
          const mockup = await captureMockup(context, baseUrl, screen, theme, width, mockupAbs);

          const status = `${prod.ok ? "OK" : "FAIL"}/${mockup.ok ? "OK" : "FAIL"}`;
          console.log(`  ${stem.padEnd(40)} prod:${prod.ok ? "OK" : "FAIL"} mockup:${mockup.ok ? "OK" : "FAIL"}`);

          shots.push({
            screenId: screen.id, screenLabel: screen.label, theme,
            widthId: width.id, width: width.width,
            prodFile: prodRel, mockupFile: mockupRel,
            prodOk: prod.ok, mockupOk: mockup.ok,
            note: [prod.note, mockup.note].filter(Boolean).join(" · "),
          });
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
    await close();
  }

  const reportHtml = buildReportHtml(shots, {
    generatedAt: new Date().toISOString(),
    screens: SCREENS.map((s) => ({ id: s.id, label: s.label, mockupUrl: s.mockupUrl })),
    themes: THEMES, widths: WIDTHS,
  });
  const reportPath = join(OUT_DIR, "report.html");
  await writeFile(reportPath, reportHtml, "utf8");

  const okCount = shots.filter((s) => s.prodOk && s.mockupOk).length;
  console.log(`\n[#137] Gotowe: ${okCount}/${shots.length} par pełnych. Raport: ${reportPath}`);
  if (okCount < shots.length) {
    console.log("[#137] Niepełne pary są oznaczone w raporcie (brak cichych pominięć).");
  }
}

main().catch((err) => {
  console.error("[#137] Błąd harnessu:", err);
  process.exit(1);
});
