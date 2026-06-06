// report.mjs — generator prostego raportu HTML „obok siebie" (produkcja | mockup).
// CELOWO bez pixel-diffa/bramki pass-fail: produkcja jest DZIS swiadomie inna od mockupow
// (to baseline „przed" — #137). Raport ma UJAWNIAC rozbieznosc do oceny per ekran, nie blokowac.
// Zero zaleznosci — czysty string HTML.

/** Escape minimalny do bezpiecznego wstawienia tekstu w HTML raportu. */
function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

/**
 * Buduje HTML raportu z listy ujec.
 * @param {Array<{screenId,screenLabel,theme,widthId,width,prodFile,mockupFile,prodOk,mockupOk,note}>} shots
 * @param {{generatedAt:string, screens:Array, themes:Array, widths:Array}} meta
 */
export function buildReportHtml(shots, meta) {
  const rows = shots.map((s) => {
    const cell = (file, ok, kind) =>
      ok
        ? `<a href="${esc(file)}" target="_blank" rel="noopener"><img loading="lazy" src="${esc(file)}" alt="${esc(kind)} ${esc(s.screenLabel)} ${esc(s.theme)} ${esc(s.widthId)}"></a>`
        : `<div class="missing">— brak (${esc(kind)}) —${s.note ? `<br><small>${esc(s.note)}</small>` : ""}</div>`;
    return `
      <tr>
        <th scope="row">
          <span class="screen">${esc(s.screenLabel)}</span>
          <span class="tag">${esc(s.theme)}</span>
          <span class="tag">${esc(s.widthId)} · ${esc(s.width)}px</span>
        </th>
        <td>${cell(s.prodFile, s.prodOk, "produkcja")}</td>
        <td>${cell(s.mockupFile, s.mockupOk, "mockup")}</td>
      </tr>`;
  }).join("");

  const coverage = meta.screens.map((sc) => `<li><code>${esc(sc.id)}</code> — ${esc(sc.label)} → <code>${esc(sc.mockupUrl)}</code></li>`).join("");

  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Harness wizualny — produkcja vs mockup (#137)</title>
<style>
  :root { color-scheme: dark light; }
  body { font-family: system-ui, sans-serif; margin: 0; background: #0f1117; color: #e8eaed; }
  header { padding: 24px 32px; border-bottom: 1px solid #2a2f3a; }
  h1 { margin: 0 0 6px; font-size: 20px; }
  .meta { color: #9aa3b2; font-size: 13px; line-height: 1.6; }
  .coverage { margin: 12px 0 0; padding: 12px 16px; background: #161922; border: 1px solid #2a2f3a; border-radius: 8px; }
  .coverage ul { margin: 6px 0 0; padding-left: 18px; }
  .coverage code { color: #6ea8fe; }
  table { width: 100%; border-collapse: collapse; }
  thead th { position: sticky; top: 0; background: #161922; padding: 10px 16px; text-align: left; font-size: 13px; border-bottom: 2px solid #2a2f3a; }
  tbody th { text-align: left; padding: 16px; vertical-align: top; white-space: nowrap; border-bottom: 1px solid #1d212b; }
  td { padding: 16px; vertical-align: top; border-bottom: 1px solid #1d212b; width: 50%; }
  .screen { display: block; font-weight: 600; margin-bottom: 6px; }
  .tag { display: inline-block; margin: 0 6px 0 0; padding: 2px 8px; border-radius: 999px; background: #232838; color: #9aa3b2; font-size: 11px; }
  img { display: block; width: 100%; height: auto; border: 1px solid #2a2f3a; border-radius: 8px; background: #fff; }
  .missing { padding: 24px; text-align: center; color: #f0a; border: 1px dashed #6a2a3a; border-radius: 8px; background: #1a1116; }
</style>
</head>
<body>
<header>
  <h1>Harness wizualny — produkcja vs mockup (#137)</h1>
  <p class="meta">
    Wygenerowano: ${esc(meta.generatedAt)} · Ekrany: ${meta.screens.length} ·
    Motywy: ${esc(meta.themes.join(", "))} · Szerokości: ${esc(meta.widths.map((w) => w.id).join(", "))}<br>
    Baseline „<strong>przed</strong>": produkcja jest świadomie różna od mockupów — ten raport ujawnia różnice do oceny per ekran (NIE jest bramką pass/fail).
  </p>
  <div class="coverage">
    <strong>Pokrycie ekranów (brak cichych pominięć):</strong>
    <ul>${coverage}</ul>
  </div>
</header>
<table>
  <thead>
    <tr><th scope="col">Ekran / motyw / szerokość</th><th scope="col">Produkcja (live)</th><th scope="col">Mockup (floor)</th></tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
</body>
</html>`;
}
