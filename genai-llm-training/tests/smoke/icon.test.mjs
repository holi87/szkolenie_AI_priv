// icon.test.mjs — zestaw ikon inline SVG (issue #75, UX-6). DOM-stub (ADR-0002).
// Pilnuje kontraktu bezpieczeństwa: icon() zwraca ELEMENT <svg> (nie string, nie innerHTML),
// dekoracyjny (aria-hidden + focusable=false), skalowalny przez em.
import "./_dom-stub.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { icon, iconSpan, ICON_NAMES } from "../../assets/ui/icon.js";

const EXPECTED = ["check", "dot", "circle", "lock", "play", "warn", "info", "cross", "diamond"];

test("zestaw zawiera wymagane nazwy", () => {
  for (const n of EXPECTED) assert.ok(ICON_NAMES.includes(n), `brak ikony "${n}"`);
});

test("każda ikona: element SVG (nie string), aria-hidden + focusable=false, ma kształty, em-skalowalna", () => {
  for (const name of ICON_NAMES) {
    const svg = icon(name);
    assert.notEqual(typeof svg, "string", `${name}: NIE wolno zwracać stringa (kontrakt bez innerHTML)`);
    assert.equal(svg.tagName, "SVG", `${name}: tagName powinno być SVG (createElementNS)`);
    assert.equal(svg.getAttribute("aria-hidden"), "true", `${name}: ikona musi być aria-hidden (dekoracyjna)`);
    assert.equal(svg.getAttribute("focusable"), "false", `${name}: ikona musi mieć focusable=false`);
    assert.equal(svg.getAttribute("width"), "1em", `${name}: domyślny rozmiar em (dziedziczy font-size)`);
    assert.ok(svg.childNodes.length > 0, `${name}: ikona bez kształtów`);
  }
});

test("nieznana nazwa rzuca (nie przepuszcza po cichu)", () => {
  assert.throws(() => icon("nope"), /nieznana nazwa/);
});

test("opts.size nadpisuje rozmiar; iconSpan opakowuje w span aria-hidden", () => {
  assert.equal(icon("check", { size: "1.3em" }).getAttribute("width"), "1.3em");
  const span = iconSpan("check", "nav-item__icon");
  assert.equal(span.tagName, "SPAN");
  assert.equal(span.getAttribute("aria-hidden"), "true");
  assert.equal(span.childNodes[0].tagName, "SVG");
});
