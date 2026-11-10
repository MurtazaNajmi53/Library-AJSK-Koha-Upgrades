#!/usr/bin/env node
/* Maktabat Aljamea design system: build step.
   Reads tokens.json and writes:
     tokens.css             every token as a CSS variable, theme overrides, type classes, @font-face
     components/index.json  the component list the gallery reads (name, group, height, subtitle)
   No dependencies. Run from anywhere:  node design-system/scripts/build.mjs
   Add --check to fail (exit 1) when tokens.css is out of date instead of writing it. */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const tokens = JSON.parse(readFileSync(join(root, "tokens.json"), "utf8"));
const warnings = [];

const themes = tokens.color.themes.map((t) => t.id);
const [baseTheme, ...otherThemes] = themes;
const colorNames = new Set(tokens.color.tokens.map((t) => t.name));

/* "{other-token}" becomes var(--other-token); anything else passes through. */
const resolve = (value, owner) =>
  String(value).replace(/\{([A-Za-z0-9][A-Za-z0-9_.-]*)\}/g, (_, name) => {
    if (name === owner) warnings.push(`${owner}: aliases itself`);
    else if (!colorNames.has(name)) warnings.push(`${owner}: alias of missing token {${name}}`);
    return `var(--${name})`;
  });

const comment = (usage) => (usage ? ` /* ${usage.replace(/\*\//g, "* /")} */` : "");
const valueFor = (token, theme) =>
  typeof token.value === "object" ? token.value[theme] : theme === baseTheme ? token.value : undefined;

/* Duplicate names across families: the design system drops the second. */
const seen = new Map();
const familyEntries = (family) =>
  (family?.tokens || []).filter((t) => {
    if (seen.has(t.name)) {
      warnings.push(`${t.name}: duplicate name (already in ${seen.get(t.name)}), skipped`);
      return false;
    }
    seen.set(t.name, family === tokens.color ? "color" : "other");
    return true;
  });

/* Themed families: color and shadow carry a value per theme. */
const themed = [...familyEntries(tokens.color), ...familyEntries(tokens.shadow)];
const plainFamilies = ["spacing", "radius", "size", "duration", "easing", "zIndex", "opacity"];
const plain = plainFamilies.flatMap((f) => familyEntries(tokens[f]));

const out = [];
out.push(`/* ${tokens.name} — generated from tokens.json by scripts/build.mjs. Do not edit: change tokens.json and rebuild. */`);

out.push(`:root, [data-theme="${baseTheme}"] {`);
for (const t of themed) {
  const v = valueFor(t, baseTheme);
  if (v === undefined) { warnings.push(`${t.name}: no ${baseTheme} value, skipped`); continue; }
  out.push(`  --${t.name}: ${resolve(v, t.name)};${comment(t.usage)}`);
}
out.push("}");

for (const theme of otherThemes) {
  out.push(`[data-theme="${theme}"] {`);
  for (const t of themed) {
    const v = valueFor(t, theme);
    if (v !== undefined) out.push(`  --${t.name}: ${resolve(v, t.name)};`);
  }
  out.push("}");
}

out.push(":root {");
for (const t of plain) out.push(`  --${t.name}: ${t.value};${comment(t.usage)}`);
for (const [key, stack] of Object.entries(tokens.type.families)) out.push(`  --font-${key}: ${stack};`);
out.push("}");

/* Type styles become utility classes. A name used twice keeps its first definition. */
const typeSeen = new Set();
for (const group of tokens.type.groups) {
  for (const s of group.styles) {
    if (typeSeen.has(s.name)) { warnings.push(`type style .${s.name} defined twice (group "${group.name}"), second skipped`); continue; }
    typeSeen.add(s.name);
    const family = s.family || group.family;
    out.push(`.${s.name} {`);
    out.push(`  font-family: var(--font-${family});`);
    out.push(`  font-size: ${s.fontSize};`);
    out.push(`  line-height: ${s.lineHeight};`);
    out.push(`  font-weight: ${s.fontWeight};`);
    out.push(`  letter-spacing: ${s.letterSpacing ?? 0};`);
    if (s.fontStyle) out.push(`  font-style: ${s.fontStyle};`);
    out.push("}");
  }
}

for (const f of tokens.type.fonts) {
  if (!existsSync(join(root, f.file))) warnings.push(`font file missing: ${f.file}`);
  out.push("@font-face {");
  out.push(`  font-family: "${f.family}";`);
  out.push(`  src: url("${f.file}") format("woff2");`);
  out.push(`  font-weight: ${f.weight};`);
  out.push(`  font-style: ${f.style || "normal"};`);
  out.push("  font-display: swap;");
  out.push("}");
}

const css = out.join("\n") + "\n";

/* Component index for gallery.html, read from each preview's @dsCard line. */
const compDir = join(root, "components");
const components = readdirSync(compDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(compDir, d.name, "preview.html")))
  .map((d) => {
    const first = readFileSync(join(compDir, d.name, "preview.html"), "utf8").split("\n")[0];
    const attr = (k) => (first.match(new RegExp(`${k}=(?:"([^"]*)"|(\\S+?))(?=\\s|-->)`)) || []).slice(1).find(Boolean);
    return { name: d.name, group: attr("group") || "Cover", height: Number(attr("height")) || 240, subtitle: attr("subtitle") || "" };
  });

const target = join(root, "tokens.css");
if (check) {
  const current = existsSync(target) ? readFileSync(target, "utf8") : "";
  if (current !== css) { console.error("tokens.css is out of date: run node design-system/scripts/build.mjs"); process.exit(1); }
  console.log("tokens.css is up to date.");
} else {
  writeFileSync(target, css);
  writeFileSync(join(compDir, "index.json"), JSON.stringify(components, null, 2) + "\n");
  console.log(`Wrote tokens.css (${themed.length} themed, ${plain.length} other tokens) and components/index.json (${components.length} components).`);
}
for (const w of warnings) console.warn("warning:", w);
