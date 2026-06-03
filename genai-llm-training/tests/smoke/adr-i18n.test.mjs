// adr-i18n.test.mjs — lekka strażnica istnienia i struktury ADR-0004 (issue #76, I18N-1).
// ADR to artefakt referencyjny dla #77..#84 — test pilnuje, że decyzje są spisane w spójnym formacie.
// Pure Node (fs), zero zależności — ADR-0002.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
// tests/smoke -> tests -> genai-llm-training -> repo root -> docs/adr
const ADR = join(HERE, "..", "..", "..", "docs", "adr", "0004-architektura-i18n.md");

test("ADR-0004 istnieje", () => {
  assert.ok(existsSync(ADR), `brak pliku ADR: ${ADR}`);
});

test("ADR-0004 ma nagłówek tabelaryczny i wymagane sekcje (spójnie z ADR-0001..0003)", () => {
  const md = readFileSync(ADR, "utf8");
  assert.match(md, /^# ADR-0004:/m, "brak nagłówka H1 'ADR-0004:'");
  assert.match(md, /\|\s*Pole\s*\|\s*Wartość\s*\|/, "brak nagłówka tabelarycznego | Pole | Wartość |");
  assert.match(md, /^\|\s*Status\s*\|/m, "brak wiersza Status w tabeli");
  assert.match(md, /^## Kontekst/m, "brak sekcji Kontekst");
  assert.match(md, /^## Decyzja/m, "brak sekcji Decyzja");
  assert.match(md, /^## Konsekwencje/m, "brak sekcji Konsekwencje");
});

test("ADR-0004 zawiera kluczowe decyzje (per-locale, parytet, cross-ref ADR-0003)", () => {
  const md = readFileSync(ADR, "utf8");
  assert.match(md, /per-locale/i, "ADR musi opisywać układ per-locale");
  assert.match(md, /parytet/i, "ADR musi definiować parytet strukturalny");
  assert.match(md, /ADR-0003/, "ADR musi mieć cross-referencję do ADR-0003 (ePrivacy)");
  assert.match(md, /ePrivacy/i, "ADR musi mieć akapit ePrivacy");
});
