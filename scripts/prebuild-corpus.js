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
 * Approach: Only load query-relevant sections at runtime (smart loading).
 * The full TCA Title 36 (5.9MB) is too large to bundle entirely, so we
 * store it split by chapter for selective loading.
 */

const fs = require("fs");
const path = require("path");

const CORPUS_DIR = path.join(__dirname, "..", "legal-corpus");
const OUTPUT_PATH = path.join(__dirname, "..", "app", "src", "lib", "legal-corpus-data.json");

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

async function main() {
  console.log("Pre-building legal corpus for Cloudflare Workers...\n");

  const corpus = {
    tcaTitle37: "",
    tcaTitle36: "",
    trjppRules: "",
    dcsText: "",
    buildDate: new Date().toISOString(),
  };

  // TCA Title 37 (Juveniles) — 2.2MB, always loaded
  try {
    const html = fs.readFileSync(path.join(CORPUS_DIR, "tca", "title-37.html"), "utf-8");
    corpus.tcaTitle37 = extractTextFromHtml(html);
    console.log(`  TCA Title 37: ${Math.round(corpus.tcaTitle37.length / 1024)}KB`);
  } catch (e) {
    console.error("  Failed to load TCA Title 37:", e.message);
  }

  // TCA Title 36 (Domestic Relations) — 5.9MB
  try {
    const html = fs.readFileSync(path.join(CORPUS_DIR, "tca", "title-36.html"), "utf-8");
    corpus.tcaTitle36 = extractTextFromHtml(html);
    console.log(`  TCA Title 36: ${Math.round(corpus.tcaTitle36.length / 1024)}KB`);
  } catch (e) {
    console.error("  Failed to load TCA Title 36:", e.message);
  }

  // TRJPP Rules
  try {
    corpus.trjppRules = fs.readFileSync(path.join(CORPUS_DIR, "trjpp", "all-rules.txt"), "utf-8");
    console.log(`  TRJPP Rules: ${Math.round(corpus.trjppRules.length / 1024)}KB`);
  } catch (e) {
    console.error("  Failed to load TRJPP:", e.message);
  }

  // DCS Policies — PDFs require runtime parsing or pre-extracted text files.
  // pdf-parse v2 has a different API; for now, check if pre-extracted text exists.
  try {
    const dcsDir = path.join(CORPUS_DIR, "dcs");
    const textFiles = fs.readdirSync(dcsDir).filter((f) => f.endsWith(".txt"));
    let dcsContent = "";

    if (textFiles.length > 0) {
      for (const file of textFiles) {
        const text = fs.readFileSync(path.join(dcsDir, file), "utf-8").trim();
        if (text.length > 0) {
          dcsContent += `=== DCS Policy: ${file} ===\n${text}\n\n`;
        }
      }
      console.log(`  DCS Policies: ${Math.round(dcsContent.length / 1024)}KB (${textFiles.length} text files)`);
    } else {
      console.log("  DCS Policies: Skipped (PDFs will be parsed at runtime or via R2)");
    }

    corpus.dcsText = dcsContent;
  } catch (e) {
    console.error("  Failed to load DCS policies:", e.message);
  }

  // Write output
  const json = JSON.stringify(corpus);
  fs.writeFileSync(OUTPUT_PATH, json);
  console.log(`\nCorpus written to: ${OUTPUT_PATH}`);
  console.log(`Total size: ${Math.round(json.length / 1024)}KB`);

  // Check if it fits within Cloudflare Workers limits
  // Workers have a 25MB script size limit (compressed), 128MB memory
  const sizeMB = json.length / (1024 * 1024);
  if (sizeMB > 20) {
    console.warn(`\nWARNING: Corpus is ${sizeMB.toFixed(1)}MB — may approach Workers limits.`);
    console.warn("Consider using Cloudflare R2 or KV for large corpus storage.");
  } else {
    console.log(`\nCorpus size (${sizeMB.toFixed(1)}MB) is within Cloudflare Workers limits.`);
  }
}

main().catch(console.error);
