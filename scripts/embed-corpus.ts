/**
 * Embed corpus files using Voyage AI voyage-3 (1024 dimensions).
 * File-level chunking: each of the 8 markdown files = 1 chunk.
 * Output: data/chunks.json
 *
 * Usage: pnpm tsx scripts/embed-corpus.ts
 */

import fs from "fs";
import path from "path";
import { config } from "dotenv";

config({ path: ".env.local" });

const CORPUS_DIR = path.join(process.cwd(), "corpus");
const OUTPUT_FILE = path.join(process.cwd(), "data", "chunks.json");
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY!;

// voyage-3 pricing: $0.06 per 1M tokens (approx 4 chars per token)
const PRICE_PER_TOKEN = 0.06 / 1_000_000;

const CORPUS_FILES = [
  "01_north_regional_ops_report.md",
  "02_incident_leeds_espresso_failure.md",
  "03_supplier_northbrew_oat_milk.md",
  "04_customer_feedback_north.md",
  "05_staffing_issues_north.md",
  "06_maintenance_report_north.md",
  "07_regional_performance_q1_north.md",
  "08_logistics_mobile_ordering_disruption.md",
];

interface Chunk {
  file_name: string;
  title: string;
  type: string;
  content: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

function parseFrontmatter(raw: string): { metadata: Record<string, string[]>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { metadata: {}, body: raw };

  const metadata: Record<string, string[]> = {};
  for (const line of match[1].split("\n")) {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) {
      const val = rest.join(":").trim().replace(/^"|"$/g, "");
      metadata[key.trim()] = [val];
    }
  }
  return { metadata, body: match[2].trim() };
}

async function embedTexts(texts: string[]): Promise<{ embeddings: number[][]; totalTokens: number }> {
  const response = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "voyage-3",
      input: texts,
      input_type: "document",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Voyage AI error ${response.status}: ${err}`);
  }

  const data = (await response.json()) as {
    data: { embedding: number[] }[];
    usage: { total_tokens: number };
  };

  return {
    embeddings: data.data.map((d) => d.embedding),
    totalTokens: data.usage.total_tokens,
  };
}

async function main() {
  if (!VOYAGE_API_KEY) {
    console.error("VOYAGE_API_KEY not set in .env.local");
    process.exit(1);
  }

  console.log(`\nEmbedding ${CORPUS_FILES.length} corpus files with voyage-3...\n`);

  const texts: string[] = [];
  const fileMetas: { fileName: string; title: string; type: string; metadata: Record<string, unknown> }[] = [];

  for (const fileName of CORPUS_FILES) {
    const raw = fs.readFileSync(path.join(CORPUS_DIR, fileName), "utf-8");
    const { metadata, body } = parseFrontmatter(raw);

    const title = metadata["title"]?.[0] ?? fileName;
    const type = metadata["type"]?.[0] ?? "document";

    // Include filename + title in embedding text for better retrieval signal
    const embeddingText = `File: ${fileName}\nTitle: ${title}\n\n${body}`;

    texts.push(embeddingText);
    fileMetas.push({ fileName, title, type, metadata });
    console.log(`  Prepared: ${fileName} (${embeddingText.length} chars)`);
  }

  console.log("\nCalling Voyage AI...");
  const { embeddings, totalTokens } = await embedTexts(texts);
  const cost = totalTokens * PRICE_PER_TOKEN;

  console.log(`  ${totalTokens} tokens — $${cost.toFixed(5)}`);

  const chunks: Chunk[] = CORPUS_FILES.map((fileName, i) => ({
    file_name: fileName,
    title: fileMetas[i].title,
    type: fileMetas[i].type,
    content: texts[i],
    embedding: embeddings[i],
    metadata: fileMetas[i].metadata,
  }));

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(chunks, null, 2));

  console.log(`\nChunks written to data/chunks.json`);
  console.log(`Embedding dimension: ${embeddings[0].length}`);
  console.log(`Total cost: $${cost.toFixed(5)}`);
}

main().catch(console.error);
