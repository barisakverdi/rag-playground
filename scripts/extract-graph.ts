/**
 * Custom graph extractor using Claude Haiku 4.5 + tool use.
 * Usage:
 *   pnpm tsx scripts/extract-graph.ts --file 02_incident_leeds_espresso_failure.md
 *   pnpm tsx scripts/extract-graph.ts --all
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { config } from "dotenv";

config({ path: ".env.local" });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const CORPUS_DIR = path.join(process.cwd(), "corpus");
const OUTPUT_FILE = path.join(process.cwd(), "data", "graph.json");

// Haiku 4.5 pricing (per 1M tokens)
const PRICE_INPUT = 0.8 / 1_000_000;
const PRICE_OUTPUT = 4.0 / 1_000_000;

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

type EntityType =
  | "Person"
  | "Role"
  | "Branch"
  | "Organisation"
  | "Equipment"
  | "Incident"
  | "Date"
  | "Concept";

type Confidence = "EXTRACTED" | "INFERRED";

interface Entity {
  id: string;
  name: string;
  type: EntityType;
  confidence: Confidence;
  source_files: string[];
}

interface Relationship {
  source: string;
  target: string;
  type: string;
  confidence: Confidence;
  source_files: string[];
}

interface Graph {
  entities: Entity[];
  relationships: Relationship[];
  meta: {
    extracted_at: string;
    total_cost_usd: number;
    files_processed: string[];
  };
}

const extractionTool: Anthropic.Tool = {
  name: "extract_entities_and_relationships",
  description:
    "Extract named entities and relationships from an operational document. Be thorough and specific — prefer concrete names over generic labels.",
  input_schema: {
    type: "object" as const,
    properties: {
      entities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description:
                "Unique snake_case slug, e.g. person_sarah_mitchell, branch_leeds_central",
            },
            name: { type: "string", description: "Exact name as it appears in the document" },
            type: {
              type: "string",
              enum: [
                "Person",
                "Role",
                "Branch",
                "Organisation",
                "Equipment",
                "Incident",
                "Date",
                "Concept",
              ],
            },
            confidence: {
              type: "string",
              enum: ["EXTRACTED", "INFERRED"],
              description:
                "EXTRACTED = explicitly named. INFERRED = implied but not literally stated.",
            },
          },
          required: ["id", "name", "type", "confidence"],
        },
      },
      relationships: {
        type: "array",
        items: {
          type: "object",
          properties: {
            source: { type: "string", description: "Entity id of the source node" },
            target: { type: "string", description: "Entity id of the target node" },
            type: {
              type: "string",
              enum: [
                "caused_by",
                "compounded_by",
                "affects",
                "reported_by",
                "escalated_to",
                "references",
                "transferred_to",
                "mentioned_in",
                "supplies_to",
                "manages",
                "located_at",
                "employed_by",
                "involves",
                "occurred_at",
              ],
            },
            confidence: { type: "string", enum: ["EXTRACTED", "INFERRED"] },
          },
          required: ["source", "target", "type", "confidence"],
        },
      },
    },
    required: ["entities", "relationships"],
  },
};

async function extractFromFile(
  fileName: string
): Promise<{ entities: Entity[]; relationships: Relationship[]; cost: number }> {
  const filePath = path.join(CORPUS_DIR, fileName);
  const content = fs.readFileSync(filePath, "utf-8");

  const systemPrompt = `You are an entity extraction engine for operational business documents.
Extract ALL named entities and relationships. Be comprehensive — missing an entity is worse than including one.

Entity type guide:
- Person: named individuals (Sarah Mitchell, Marcus Webb, Daniel Park, etc.)
- Role: job titles / positions (Regional Operations Manager, Duty Manager, In-House Technician)
- Branch: physical locations (Leeds Central, Manchester Piccadilly, Sheffield Meadowhall)
- Organisation: companies / teams (NorthBrew Supplies, GreenLeaf Provisions, Apex Staffing Solutions, ThermalPro Services, ProBev Engineering, Orda, Square)
- Equipment: machines / systems / assets (La Marzocca Linea PB, BP-LC-EM02, Bar 2 espresso machine)
- Incident: specific events / issues (INC-2024-0312, Wakefield depot failure, modifier sync bug, valve seal failure)
- Date: specific dates or periods (15 February 2024, Q1 2024, Easter trading)
- Concept: abstract operational themes (mobile ordering rollout, dual-sourcing review, CSS score, shift pattern dissatisfaction)

For each entity id use snake_case with type prefix: person_sarah_mitchell, branch_leeds_central, etc.
Extract relationships between entities you find. Use the provided relationship types.

Relationship direction rules (source → target):
- reported_by: incident → person (the incident was reported BY the person)
- escalated_to: incident/issue → person (escalated TO the person)
- manages: person → branch/team
- located_at: branch/equipment → location
- affects: cause → affected entity
- caused_by: effect → cause
- supplies_to: organisation → branch/equipment`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system: systemPrompt,
    tools: [extractionTool],
    tool_choice: { type: "any" },
    messages: [
      {
        role: "user",
        content: `Extract all entities and relationships from this document (file: ${fileName}):\n\n${content}`,
      },
    ],
  });

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const cost = inputTokens * PRICE_INPUT + outputTokens * PRICE_OUTPUT;

  console.log(
    `  ${fileName}: ${inputTokens} in / ${outputTokens} out — $${cost.toFixed(5)}`
  );

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    console.warn(`  WARNING: No tool_use block for ${fileName}`);
    return { entities: [], relationships: [], cost };
  }

  const result = toolUse.input as { entities: Entity[]; relationships: Relationship[] };

  // Attach source_file to each entity and relationship
  const entities: Entity[] = result.entities.map((e) => ({
    ...e,
    source_files: [fileName],
  }));
  const relationships: Relationship[] = result.relationships.map((r) => ({
    ...r,
    source_files: [fileName],
  }));

  return { entities, relationships, cost };
}

function mergeGraph(
  results: { fileName: string; entities: Entity[]; relationships: Relationship[] }[]
): Graph {
  const entityMap = new Map<string, Entity>();
  const relMap = new Map<string, Relationship>();

  for (const { fileName, entities, relationships } of results) {
    for (const entity of entities) {
      if (entityMap.has(entity.id)) {
        const existing = entityMap.get(entity.id)!;
        if (!existing.source_files.includes(fileName)) {
          existing.source_files.push(fileName);
        }
      } else {
        entityMap.set(entity.id, { ...entity });
      }
    }

    for (const rel of relationships) {
      const key = `${rel.source}__${rel.type}__${rel.target}`;
      if (relMap.has(key)) {
        const existing = relMap.get(key)!;
        if (!existing.source_files.includes(fileName)) {
          existing.source_files.push(fileName);
        }
      } else {
        relMap.set(key, { ...rel });
      }
    }
  }

  return {
    entities: Array.from(entityMap.values()),
    relationships: Array.from(relMap.values()),
    meta: {
      extracted_at: new Date().toISOString(),
      total_cost_usd: 0,
      files_processed: results.map((r) => r.fileName),
    },
  };
}

async function main() {
  const args = process.argv.slice(2);
  const fileArg = args.indexOf("--file");
  const allMode = args.includes("--all");

  if (!allMode && fileArg === -1) {
    console.error("Usage: tsx scripts/extract-graph.ts --file <name> | --all");
    process.exit(1);
  }

  const filesToProcess = allMode
    ? CORPUS_FILES
    : [args[fileArg + 1]];

  console.log(`\nExtracting from ${filesToProcess.length} file(s)...\n`);

  let totalCost = 0;
  const results: { fileName: string; entities: Entity[]; relationships: Relationship[] }[] = [];

  for (const fileName of filesToProcess) {
    const { entities, relationships, cost } = await extractFromFile(fileName);
    totalCost += cost;
    results.push({ fileName, entities, relationships });
    console.log(`  → ${entities.length} entities, ${relationships.length} relationships`);
  }

  const graph = mergeGraph(results);
  graph.meta.total_cost_usd = totalCost;

  if (allMode) {
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(graph, null, 2));
    console.log(`\nGraph written to data/graph.json`);
  } else {
    // Single file: pretty print to console for inspection
    console.log("\n--- ENTITIES ---");
    for (const e of graph.entities) {
      console.log(`  [${e.type}] ${e.name} (${e.id}) — ${e.confidence}`);
    }
    console.log("\n--- RELATIONSHIPS ---");
    for (const r of graph.relationships) {
      console.log(`  ${r.source} --[${r.type}]--> ${r.target} — ${r.confidence}`);
    }
  }

  console.log(`\nTotal cost: $${totalCost.toFixed(5)}`);
  console.log(
    `Summary: ${graph.entities.length} entities, ${graph.relationships.length} relationships`
  );
}

main().catch(console.error);
