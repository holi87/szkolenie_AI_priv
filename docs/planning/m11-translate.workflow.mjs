export const meta = {
  name: 'm11-translate-en',
  description: 'M11: translate PL training data + UI catalog to EN (per-file fan-out, structure-preserving)',
  phases: [{ title: 'Translate' }, { title: 'Audit' }],
}

const ROOT = '/Users/grzegorzholak/Desktop/GenAI/teaching/szkolenie_AI_priv/genai-llm-training'

// Wspólne, twarde reguły dla KAŻDEGO tłumaczenia (parytet strukturalny + walidator #80/#13).
const COMMON = `You translate a Polish JSON file from a static training app into NATURAL, PROFESSIONAL ENGLISH.
Read the SOURCE file, write the TARGET file with IDENTICAL structure, translating ONLY human-readable display prose.

HARD RULES (a validator enforces these — violations fail CI):
- Output MUST be valid JSON, byte-for-byte same shape: same object keys, same array lengths, same order.
- PRESERVE VERBATIM (never translate, never reorder): every object KEY; every id/code field; all enum values;
  all numbers; all booleans; arrays of ids; the "_meta" object.
- Enum/code values that look like Polish words are CODES — DO NOT translate them. In questions, the "type"
  field uses codes such as "single_choice","multiple_choice","dopasowanie","kolejnosc_procesu",
  "scenariusz_decyzyjny","scenariusz","analiza_outputu" — keep EXACTLY as-is.
- PRESERVE interpolation placeholders EXACTLY, e.g. {failedCriteria}, {awarded}, {max}, {pct}, {pathId},
  {moduleId}, {moduleName}, {modules}, {rubrics}, {score}, {accent}, {count}, {current}, {variant}, {pillar}, {time}, {cta}.
- PRESERVE exact leading/trailing whitespace inside string values.
- Keep technical acronyms as-is: GenAI, LLM, ML, RAG, QA, API, PII, JSON, CSV, A4, S1, S2, S3, RODO/GDPR (use GDPR in EN).
- Synthetic data only: the source is synthetic — keep it synthetic; never invent real names, emails, phones, IBANs, secrets.
- Write ONLY the JSON to the target file (no markdown fences, no commentary). Then return the structured summary.`

const KIND = {
  questions: `FILE TYPE: question bank shard.
TRANSLATE these prose fields per question: learningOutcome, prompt, options[].text, pairs[].left, pairs[].right,
sequence[] (step labels — translate text, KEEP ORDER), feedbackCorrect, feedbackIncorrect.
PRESERVE: id, module, pillar, paths, difficulty, bloom, type, isCritical, golden, lockOptionOrder, points, rubric,
correct (option ids), references (keep source citations as-is), options[].id.
CRITICAL SECURITY PREFIX: for every question with "isCritical": true, the English "feedbackIncorrect" MUST begin
with EXACTLY "This is a security error." (a translation of the Polish "To jest błąd bezpieczeństwa.") followed by a
space and the translated remainder. This exact prefix is validated.`,
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
PRESERVE: id, module, paths, scaleMax, passThreshold, passScope is prose but may reference S2/S3 — keep those tokens,
criteria[].id, criteria[].points, levels[].points.`,
  scenarios: `FILE TYPE: synthetic training scenarios.
TRANSLATE: title, competency, and every human-readable string VALUE inside the freeform "data" object.
PRESERVE: id, modules, paths, usedBy, all keys inside "data", all numbers/ids inside "data". Keep data synthetic.`,
  modulesLabels: `FILE TYPE: per-locale module display labels, keyed by module id (M1..M12).
TRANSLATE per module: name, level, interactiveElement, keyConcepts[] (keep acronyms; translate phrases like
"klasyczny ML"->"classic ML", "halucynacja"->"hallucination"), learningOutcomes[].
PRESERVE the M1..M12 keys exactly. All 12 module keys must be present.`,
  pathsLabels: `FILE TYPE: per-locale path display labels under "paths" -> S1/S2/S3.
TRANSLATE: name. For assumedPathTime keep the numbers and units (e.g. "6-7 h (A4)") — translate any words only.
PRESERVE the S1/S2/S3 keys.`,
  uiCatalog: `FILE TYPE: UI string catalog (flat dot-namespaced keys). SOURCE is pl.json, TARGET is en.json.
TRANSLATE every string VALUE to concise UI English. PRESERVE every key, every {placeholder}, and EXACT leading/
trailing spaces (e.g. "  ({awarded}/{max} pkt)" -> "  ({awarded}/{max} pts)" keeping the two leading spaces;
" · wymagany" -> " · required" keeping the leading " · "; "Opis: " -> "Description: " keeping the trailing space).
Translate units: "pkt"->"pts", "min" stays "min". Keep the "_meta" object but set it to {"locale":"en","name":"English"}.
Every value MUST be non-empty (this catalog must be fully translated, not a skeleton).`,
}

const mods = Array.from({ length: 12 }, (_, i) => `m${String(i + 1).padStart(2, '0')}`)
const TASKS = [
  ...mods.map((m) => ({ label: `q:${m}`, kind: 'questions', src: `${ROOT}/data/pl/questions/${m}.json`, dst: `${ROOT}/data/en/questions/${m}.json` })),
  ...mods.map((m) => ({ label: `c:${m}`, kind: 'content', src: `${ROOT}/data/pl/module-content/${m}.json`, dst: `${ROOT}/data/en/module-content/${m}.json` })),
  { label: 'rubrics', kind: 'rubrics', src: `${ROOT}/data/pl/rubrics.json`, dst: `${ROOT}/data/en/rubrics.json` },
  { label: 'scenarios', kind: 'scenarios', src: `${ROOT}/data/pl/scenarios.json`, dst: `${ROOT}/data/en/scenarios.json` },
  { label: 'modules.labels', kind: 'modulesLabels', src: `${ROOT}/data/pl/modules.labels.json`, dst: `${ROOT}/data/en/modules.labels.json` },
  { label: 'paths.labels', kind: 'pathsLabels', src: `${ROOT}/data/pl/paths.labels.json`, dst: `${ROOT}/data/en/paths.labels.json` },
  { label: 'ui.en.json', kind: 'uiCatalog', src: `${ROOT}/assets/i18n/pl.json`, dst: `${ROOT}/assets/i18n/en.json` },
]

const SUMMARY_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    file: { type: 'string' },
    wrote: { type: 'boolean' },
    structurePreserved: { type: 'boolean' },
    criticalsPrefixed: { type: 'integer', description: 'count of isCritical questions given the EN security prefix (0 if file has none)' },
    leftoverPolishRisk: { type: 'boolean', description: 'true if unsure any prose may still be Polish' },
    notes: { type: 'string' },
  },
  required: ['file', 'wrote', 'structurePreserved', 'leftoverPolishRisk', 'notes'],
}

phase('Translate')
const results = await parallel(TASKS.map((tk) => () =>
  agent(
    `${COMMON}\n\n${KIND[tk.kind]}\n\nSOURCE (read this): ${tk.src}\nTARGET (write this): ${tk.dst}\n\nDo it now: read the source, translate per the rules, write the target file, then return the summary.`,
    { label: tk.label, phase: 'Translate', agentType: 'general-purpose', schema: SUMMARY_SCHEMA },
  ).then((r) => ({ ...r, label: tk.label })),
))

const ok = results.filter(Boolean)
return {
  total: TASKS.length,
  wrote: ok.filter((r) => r.wrote).length,
  structureIssues: ok.filter((r) => !r.structurePreserved).map((r) => r.label),
  polishRisk: ok.filter((r) => r.leftoverPolishRisk).map((r) => r.label),
  criticalsPrefixedTotal: ok.reduce((a, r) => a + (r.criticalsPrefixed || 0), 0),
  perFile: ok.map((r) => ({ label: r.label, wrote: r.wrote, struct: r.structurePreserved, polishRisk: r.leftoverPolishRisk })),
}
