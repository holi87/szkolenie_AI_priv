export const meta = {
  name: 'm17-translate-langs',
  description: 'M17: translate PL training data + UI catalog + privacy page to ES/FR/DE/IT/UK/VI (per-file fan-out, structure-preserving)',
  phases: [{ title: 'Translate' }],
}

const ROOT = '/Users/grzegorzholak/Desktop/GenAI/teaching/szkolenie_AI_priv/genai-llm-training'

// Per-locale config. `prefix` MUSI być byte-identyczny z CRITICAL_PREFIX[<code>] w tests/schema-validation/validate.mjs
// (pytania krytyczne M10: feedbackIncorrect zaczyna się od tego prefiksu — twardy parytet #80).
const LANG = {
  es: { name: 'Español',     english: 'Spanish',    gdpr: 'RGPD',  prefix: 'Esto es un error de seguridad.' },
  fr: { name: 'Français',    english: 'French',     gdpr: 'RGPD',  prefix: 'Ceci est une erreur de sécurité.' },
  de: { name: 'Deutsch',     english: 'German',     gdpr: 'DSGVO', prefix: 'Dies ist ein Sicherheitsfehler.' },
  it: { name: 'Italiano',    english: 'Italian',    gdpr: 'GDPR',  prefix: 'Questo è un errore di sicurezza.' },
  uk: { name: 'Українська',  english: 'Ukrainian',  gdpr: 'GDPR',  prefix: 'Це помилка безпеки.' },
  vi: { name: 'Tiếng Việt',  english: 'Vietnamese', gdpr: 'GDPR',  prefix: 'Đây là lỗi bảo mật.' },
}

// Sterowanie zakresem: pilot = ['es']; po zielonej walidacji ES → wszystkie 6 (resumeFromRunId cache'uje ES).
const ACTIVE = ['es', 'fr', 'de', 'it', 'uk', 'vi']

function common(cfg) {
  return `You translate a Polish JSON file from a static training app into NATURAL, PROFESSIONAL ${cfg.english} (${cfg.name}).
Read the SOURCE file, write the TARGET file with IDENTICAL structure, translating ONLY human-readable display prose.

HARD RULES (a validator enforces these — violations fail CI):
- Output MUST be valid JSON, byte-for-byte same shape: same object keys, same array lengths, same order.
- PRESERVE VERBATIM (never translate, never reorder): every object KEY; every id/code field; all enum values;
  all numbers; all booleans; arrays of ids; the "_meta" object keys.
- Enum/code values that look like Polish words are CODES — DO NOT translate them. In questions, the "type"
  field uses codes such as "single_choice","multiple_choice","dopasowanie","kolejnosc_procesu",
  "scenariusz_decyzyjny","scenariusz","analiza_outputu" — keep EXACTLY as-is.
- PRESERVE interpolation placeholders EXACTLY, e.g. {failedCriteria}, {awarded}, {max}, {pct}, {pathId},
  {moduleId}, {moduleName}, {modules}, {rubrics}, {score}, {accent}, {count}, {current}, {variant}, {pillar}, {time}, {cta}.
- PRESERVE exact leading/trailing whitespace inside string values.
- Keep technical acronyms as-is: GenAI, LLM, ML, RAG, QA, API, PII, JSON, CSV, A4, S1, S2, S3. For "RODO" use the
  local data-protection term "${cfg.gdpr}" where it reads naturally; the acronym GDPR is also acceptable.
- Numbers, emails and domains are SYNTHETIC and must stay verbatim: never invent or alter names, emails, phones,
  IBANs, card numbers, secrets. Preserve any example domains (e.g. example.com, *.invalid) exactly.
- Write ONLY the JSON to the target file (no markdown fences, no commentary). Then return the structured summary.`
}

const KIND = (cfg) => ({
  questions: `FILE TYPE: question bank shard.
TRANSLATE these prose fields per question: learningOutcome, prompt, options[].text, pairs[].left, pairs[].right,
sequence[] (step labels — translate text, KEEP ORDER), feedbackCorrect, feedbackIncorrect.
PRESERVE: id, module, pillar, paths, difficulty, bloom, type, isCritical, golden, lockOptionOrder, points, rubric,
correct (option ids), references (keep source citations as-is), options[].id.
CRITICAL SECURITY PREFIX: for every question with "isCritical": true, the translated "feedbackIncorrect" MUST begin
with EXACTLY this string (copy these characters verbatim): «${cfg.prefix}» followed by a single space and the
translated remainder. This exact prefix is byte-validated against the canonical Polish "To jest błąd bezpieczeństwa.".`,
  content: `FILE TYPE: module narrative content + interaction config.
TRANSLATE display prose: intro, screen.title, block.text, block.items[], block.term, block.original, block.title,
block.caption, block.headers[], block.rows[][] (table cells), block.textAlt, interaction.title, interaction.intro,
categories[].label, categories[].desc, items[].text, items[].rationale, criteria[].name, criteria[].prompt,
criteria[].hint, criteria[].options[].text, outputLabel, controls[].label, controls[].levels[].label,
controls[].levels[].effect, checkpoint.prompt, checkpoint.options[].text, checkpoint.feedbackCorrect,
checkpoint.feedbackIncorrect, summary.points[], summary.checklist[], summary.checklistTitle, summary.nextStep.
For block.ascii (ASCII diagram): keep the box-drawing/layout/alignment intact; translate embedded human words only
if it does not break alignment, otherwise keep as-is. The textAlt description must be fully translated.
PRESERVE: module, all ids, screen.type, block.kind, block.variant, block.ordered, onlyForPaths, hideForPaths,
interaction.kind, items[].correctCategory, criteria[].correctOptionIds, options[].id, controls[].levels[].value,
checkpoint.type, checkpoint.correct, all numbers (passPct, passThreshold, scaleMax, points), recordsPractical,
rubricId, paths.`,
  rubrics: `FILE TYPE: practical-task rubrics.
TRANSLATE: task, passScope, criteria[].name, levels[].descriptor, belowThresholdFeedback (KEEP placeholders like {failedCriteria}).
PRESERVE: id, module, paths, scaleMax, passThreshold; passScope is prose but may reference S2/S3 — keep those tokens,
criteria[].id, criteria[].points, levels[].points.`,
  scenarios: `FILE TYPE: synthetic training scenarios.
TRANSLATE: title, competency, and every human-readable string VALUE inside the freeform "data" object.
PRESERVE: id, modules, paths, usedBy, all keys inside "data", all numbers/ids inside "data". Keep data synthetic.`,
  modulesLabels: `FILE TYPE: per-locale module display labels, keyed by module id (M1..M12).
TRANSLATE per module: name, level, interactiveElement, keyConcepts[] (keep acronyms; translate ordinary phrases),
learningOutcomes[]. PRESERVE the M1..M12 keys exactly. All 12 module keys must be present.`,
  pathsLabels: `FILE TYPE: per-locale path display labels under "paths" -> S1/S2/S3.
TRANSLATE: name. For assumedPathTime keep the numbers and units (e.g. "6-7 h (A4)") — translate any words only.
PRESERVE the S1/S2/S3 keys.`,
  uiCatalog: `FILE TYPE: UI string catalog (flat dot-namespaced keys). SOURCE is pl.json, TARGET is ${cfg.code}.json.
TRANSLATE every string VALUE to concise UI ${cfg.english}. PRESERVE every key, every {placeholder}, and EXACT leading/
trailing spaces (e.g. a value "  ({awarded}/{max} pkt)" keeps its two leading spaces; " · wymagany" keeps the leading
" · "; "Opis: " keeps the trailing space). Translate the unit "pkt" to the local short form for "points"; "min" stays "min".
Set the "_meta" object to EXACTLY {"locale":"${cfg.code}","name":"${cfg.name}"} (two keys only, like en.json).
Every value MUST be non-empty (this catalog must be fully translated, not a skeleton).`,
  privacy: `FILE TYPE: static privacy page (HTML). SOURCE is the Polish prywatnosc.html; TARGET is privacy-${cfg.code}.html.
TRANSLATE every human-readable text node to ${cfg.english} (${cfg.name}): <title>, <meta name="description"> content,
the skip-link text, brand__name, the back-link "← Wróć do szkolenia", the <h1> and all paragraph/list prose.
PRESERVE the FULL HTML structure and ALL tags/attributes EXCEPT: change <html lang="pl"> to <html lang="${cfg.code}">.
KEEP UNCHANGED: <meta name="robots" content="noindex">, every relative link (href="index.html", href="assets/styles.css"),
all inline SVG (the data: favicon and the brand <svg> path), and do NOT introduce any external host (http/https) other
than the SVG xmlns. Write ONLY the HTML document to the target file (no markdown fences, no commentary).`,
})

const mods = Array.from({ length: 12 }, (_, i) => `m${String(i + 1).padStart(2, '0')}`)
const contentFiles = [...mods, 'mshp', 'msho', 'msk1', 'msk2', 'msk3', 'msk4'] // 18 (M4 m01..m12 + MSHP/MSHO + MSK1-4)

function tasksFor(code) {
  const cfg = { ...LANG[code], code }
  const K = KIND(cfg)
  const C = common(cfg)
  const mk = (label, kind, src, dst) => ({ code, label: `${code}:${label}`, prompt:
    `${C}\n\n${K[kind]}\n\nSOURCE (read this): ${src}\nTARGET (write this): ${dst}\n\nDo it now: read the source, translate per the rules, write the target file, then return the summary.` })
  return [
    ...mods.map((m) => mk(`q:${m}`, 'questions', `${ROOT}/data/pl/questions/${m}.json`, `${ROOT}/data/${code}/questions/${m}.json`)),
    ...contentFiles.map((f) => mk(`c:${f}`, 'content', `${ROOT}/data/pl/module-content/${f}.json`, `${ROOT}/data/${code}/module-content/${f}.json`)),
    mk('rubrics', 'rubrics', `${ROOT}/data/pl/rubrics.json`, `${ROOT}/data/${code}/rubrics.json`),
    mk('scenarios', 'scenarios', `${ROOT}/data/pl/scenarios.json`, `${ROOT}/data/${code}/scenarios.json`),
    mk('modules.labels', 'modulesLabels', `${ROOT}/data/pl/modules.labels.json`, `${ROOT}/data/${code}/modules.labels.json`),
    mk('paths.labels', 'pathsLabels', `${ROOT}/data/pl/paths.labels.json`, `${ROOT}/data/${code}/paths.labels.json`),
    mk('ui', 'uiCatalog', `${ROOT}/assets/i18n/pl.json`, `${ROOT}/assets/i18n/${code}.json`),
    mk('privacy', 'privacy', `${ROOT}/prywatnosc.html`, `${ROOT}/privacy-${code}.html`),
  ]
}

const SUMMARY_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    file: { type: 'string' },
    wrote: { type: 'boolean' },
    structurePreserved: { type: 'boolean' },
    criticalsPrefixed: { type: 'integer', description: 'count of isCritical questions given the security prefix (0 if file has none)' },
    leftoverPolishRisk: { type: 'boolean', description: 'true if unsure any prose may still be Polish' },
    notes: { type: 'string' },
  },
  required: ['file', 'wrote', 'structurePreserved', 'leftoverPolishRisk', 'notes'],
}

phase('Translate')
const TASKS = ACTIVE.flatMap((code) => tasksFor(code))
log(`M17: ${ACTIVE.join(',')} — ${TASKS.length} plików do tłumaczenia (per-file fan-out)`)

const results = await parallel(TASKS.map((tk) => () =>
  agent(tk.prompt, { label: tk.label, phase: 'Translate', agentType: 'general-purpose', schema: SUMMARY_SCHEMA })
    .then((r) => ({ ...r, label: tk.label, code: tk.code }))
))

const ok = results.filter(Boolean)
const byCode = {}
for (const c of ACTIVE) byCode[c] = ok.filter((r) => r.code === c).length
return {
  active: ACTIVE,
  total: TASKS.length,
  wrote: ok.filter((r) => r.wrote).length,
  perLangWritten: byCode,
  structureIssues: ok.filter((r) => !r.structurePreserved).map((r) => r.label),
  polishRisk: ok.filter((r) => r.leftoverPolishRisk).map((r) => r.label),
  criticalsPrefixedTotal: ok.reduce((a, r) => a + (r.criticalsPrefixed || 0), 0),
}
