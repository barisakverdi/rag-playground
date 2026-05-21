/**
 * Manual retrieval test — 5 queries across semantic, graph, hybrid.
 * Usage: pnpm tsx scripts/test-retrieval.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { semanticSearch } from "@/lib/retrieval/semantic";
import { graphSearch } from "@/lib/retrieval/graph";
import { routeQuery } from "@/lib/retrieval/router";

const TEST_QUERIES = [
  // Q3 — semantic (single doc)
  "Had NorthBrew Supplies caused problems before the Q1 2024 incident?",
  // Q6 — graph (causal chain Leeds+Manchester)
  "What is the relationship between the equipment fault at Leeds and the one at Manchester?",
  // Q14 — graph (compound causal)
  "How did understaffing compound the equipment failure at Leeds Central?",
  // Q20 — graph (WOW demo)
  "Trace the full chain from the Wakefield depot failure to the Google Reviews impact",
  // Q19 — hybrid (synthesis)
  "What is the most significant systemic risk facing the North England region?",
];

async function main() {
  for (const query of TEST_QUERIES) {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`QUERY: ${query}`);

    const decision = routeQuery(query);
    console.log(`ROUTER → ${decision.method.toUpperCase()} | ${decision.reason}`);

    if (decision.method === "semantic" || decision.method === "hybrid") {
      const { results, embeddingMs, retrievalMs } = await semanticSearch(query, 3);
      console.log(`\nSEMANTIC (embed: ${embeddingMs}ms, retrieval: ${retrievalMs}ms):`);
      for (const r of results) {
        console.log(`  [${r.similarity.toFixed(3)}] ${r.file_name}`);
      }
    }

    if (decision.method === "graph" || decision.method === "hybrid") {
      const { results, matchedEntities, retrievalMs } = graphSearch(query);
      console.log(`\nGRAPH (${retrievalMs}ms) — seed entities: ${matchedEntities.join(", ") || "none"}`);
      for (const r of results) {
        console.log(`  [hop ${r.hop}] ${r.file_name} — via: ${r.matched_entities.slice(0, 3).join(", ")}`);
      }
    }
  }
}

main().catch(console.error);
