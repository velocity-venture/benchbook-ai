#!/usr/bin/env node
/**
 * Pre-build Legal Corpus for Cloudflare Workers
 *
 * Cloudflare Workers don't have filesystem access, so we pre-process the
 * legal corpus at build time into a JSON file that gets bundled with the
 * worker. This runs before `next build` in the CI/CD pipeline.
 *
 * Output: app/src/lib/legal-corpus-data.json
 *
 * V1 scope is locked to TCA Titles 36 and 37, TRJPP, DCS policies, and
 * optional private local rules handled outside the global build artifact.
 */

const fs = require("fs");
const path = require("path");

const CORPUS_DIR = path.join(__dirname, "..", "legal-corpus");
const OUTPUT_PATH = path.join(__dirname, "..", "app", "src", "lib", "legal-corpus-data.json");
const V1_TCA_TITLES = new Set(["36", "37"]);

function extractTextFromHtml(html) {
  return html
    .replace(/<script[^>]*>.*?<\/script>/gis, "")
    .replace(/<style[^>]*>.*?<\/style>/gis, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Recursively find all files matching extensions in a directory.
 */
function findFiles(dir, extensions) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, extensions));
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

async function main() {
  console.log("Pre-building legal corpus for Cloudflare Workers...\n");

  let existingCorpus = {};
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      existingCorpus = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
    } catch (e) {
      console.warn("  Existing corpus JSON could not be read as fallback:", e.message);
    }
  }

  const corpus = {
    tcaTitle37: "",
    tcaTitle36: "",
    trjppRules: "",
    dcsText: "",
    buildDate: existingCorpus.buildDate || new Date().toISOString(),
  };

  // TCA Title 37 (Juveniles) — always loaded
  try {
    const html = fs.readFileSync(path.join(CORPUS_DIR, "tca", "title-37.html"), "utf-8");
    corpus.tcaTitle37 = extractTextFromHtml(html);
    console.log(`  TCA Title 37: ${Math.round(corpus.tcaTitle37.length / 1024)}KB`);
  } catch (e) {
    if (typeof existingCorpus.tcaTitle37 === "string" && existingCorpus.tcaTitle37.length > 0) {
      corpus.tcaTitle37 = existingCorpus.tcaTitle37;
      console.warn("  TCA Title 37 source missing. Preserved existing prebuilt corpus text.");
    } else {
      console.error("  Failed to load TCA Title 37:", e.message);
    }
  }

  // TCA Title 36 (Domestic Relations)
  try {
    const html = fs.readFileSync(path.join(CORPUS_DIR, "tca", "title-36.html"), "utf-8");
    corpus.tcaTitle36 = extractTextFromHtml(html);
    console.log(`  TCA Title 36: ${Math.round(corpus.tcaTitle36.length / 1024)}KB`);
  } catch (e) {
    if (typeof existingCorpus.tcaTitle36 === "string" && existingCorpus.tcaTitle36.length > 0) {
      corpus.tcaTitle36 = existingCorpus.tcaTitle36;
      console.warn("  TCA Title 36 source missing. Preserved existing prebuilt corpus text.");
    } else {
      console.error("  Failed to load TCA Title 36:", e.message);
    }
  }

  // Do not dynamically add TCA Titles outside the V1 scope lock.
  const tcaDir = path.join(CORPUS_DIR, "tca");
  const additionalTca = findFiles(tcaDir, [".html", ".txt", ".md"])
    .filter(f => !f.endsWith("title-37.html") && !f.endsWith("title-36.html"));

  for (const file of additionalTca) {
    try {
      const name = path.basename(file);
      const titleMatch = name.match(/title-(\d+)/i);
      const titleNum = titleMatch ? titleMatch[1] : undefined;
      if (!titleNum || !V1_TCA_TITLES.has(titleNum)) {
        console.log(`  Skipped out-of-scope TCA file (${name})`);
        continue;
      }
      const content = fs.readFileSync(file, "utf-8");
      const text = file.endsWith(".html") ? extractTextFromHtml(content) : content.trim();
      if (text.length > 100) {
        corpus.tcaTitle36 += `\n\n=== Additional TCA: ${name} ===\n${text}`;
        console.log(`  Additional TCA (${name}): ${Math.round(text.length / 1024)}KB`);
      }
    } catch (e) {
      console.error(`  Failed to load ${file}:`, e.message);
    }
  }

  if (!corpus.tcaTitle37 || !corpus.tcaTitle36) {
    throw new Error("V1 corpus build failed: TCA Title 36 and Title 37 are required.");
  }

  // TRJPP Rules — load all-rules.txt or dynamically discover individual rule files
  try {
    const allRulesPath = path.join(CORPUS_DIR, "trjpp", "all-rules.txt");
    if (fs.existsSync(allRulesPath)) {
      corpus.trjppRules = fs.readFileSync(allRulesPath, "utf-8");
      console.log(`  TRJPP Rules: ${Math.round(corpus.trjppRules.length / 1024)}KB`);
    } else {
      // Fall back to loading individual rule files
      const ruleFiles = findFiles(path.join(CORPUS_DIR, "trjpp"), [".txt", ".md"]);
      let rulesContent = "";
      for (const file of ruleFiles.sort()) {
        rulesContent += fs.readFileSync(file, "utf-8") + "\n\n";
      }
      corpus.trjppRules = rulesContent.trim();
      console.log(`  TRJPP Rules: ${Math.round(corpus.trjppRules.length / 1024)}KB (${ruleFiles.length} files)`);
    }
  } catch (e) {
    console.error("  Failed to load TRJPP:", e.message);
  }

  // DCS Policies — load .txt files (PDFs require pre-extraction)
  try {
    const dcsDir = path.join(CORPUS_DIR, "dcs");
    const textFiles = findFiles(dcsDir, [".txt", ".md"]);
    let dcsContent = "";

    for (const file of textFiles) {
      const text = fs.readFileSync(file, "utf-8").trim();
      if (text.length > 0) {
        const name = path.basename(file);
        dcsContent += `=== DCS Policy: ${name} ===\n${text}\n\n`;
      }
    }

    if (dcsContent.length > 0) {
      console.log(`  DCS Policies: ${Math.round(dcsContent.length / 1024)}KB (${textFiles.length} text files)`);
    } else {
      console.log("  DCS Policies: Skipped (PDFs need pre-extraction to .txt format)");
    }

    corpus.dcsText = dcsContent;
  } catch (e) {
    console.error("  Failed to load DCS policies:", e.message);
  }

  // Dynamically load any files in additional corpus directories
  const additionalDirs = fs.readdirSync(CORPUS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && !["tca", "trjpp", "dcs", "local-rules", "_processed"].includes(d.name));

  for (const dir of additionalDirs) {
    const dirPath = path.join(CORPUS_DIR, dir.name);
    const files = findFiles(dirPath, [".html", ".txt", ".md"]);
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, "utf-8");
        const text = file.endsWith(".html") ? extractTextFromHtml(content) : content.trim();
        if (text.length > 100) {
          const name = path.basename(file);
          corpus.dcsText += `\n\n=== ${dir.name}: ${name} ===\n${text}`;
          console.log(`  ${dir.name}/${name}: ${Math.round(text.length / 1024)}KB`);
        }
      } catch (e) {
        console.error(`  Failed to load ${file}:`, e.message);
      }
    }
  }

  // Write output
  const json = JSON.stringify(corpus);
  fs.writeFileSync(OUTPUT_PATH, json);
  console.log(`\nCorpus written to: ${OUTPUT_PATH}`);
  console.log(`Total size: ${Math.round(json.length / 1024)}KB`);

  // Size check for Cloudflare Workers limits
  const sizeMB = json.length / (1024 * 1024);
  if (sizeMB > 20) {
    console.warn(`\nWARNING: Corpus is ${sizeMB.toFixed(1)}MB — may approach Workers limits.`);
    console.warn("Consider using Cloudflare R2 or KV for large corpus storage.");
  } else {
    console.log(`\nCorpus size (${sizeMB.toFixed(1)}MB) is within Cloudflare Workers limits.`);
  }
}

main().catch(console.error);
