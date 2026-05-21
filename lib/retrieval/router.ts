export type RetrievalMethod = "semantic" | "graph" | "hybrid";

interface RouterDecision {
  method: RetrievalMethod;
  reason: string;
  signals: string[];
}

const GRAPH_SIGNALS = [
  "connection", "relationship", "related", "between",
  "chain", "trace", "caused", "compound", "led to",
  "how did", "connect", "across", "multiple", "all branches",
  "link", "impact on", "affect", "consequence",
];

const SEMANTIC_SIGNALS = [
  "explain", "what is", "describe", "list",
  "what are the steps", "recommendation", "summarise", "summarize",
  "what does", "when did", "who is",
];

const KNOWN_ENTITIES = [
  "northbrew", "leeds", "manchester", "sheffield",
  "sarah mitchell", "marcus webb", "daniel park", "chloe barnes",
  "james rowley", "lena frost", "dominic ferrara", "rosa chen",
  "kevin holt", "tom okafor", "priya nair", "amara osei",
  "oat milk", "espresso", "mobile ordering", "la marzocca",
  "inc-2024-0312", "bp-lc-em02", "northbrew supplies",
  "apex staffing", "thermalpro", "greenleaf", "probev",
  "wakefield",
];

export function routeQuery(query: string): RouterDecision {
  const lower = query.toLowerCase();
  const signals: string[] = [];

  const graphMatches = GRAPH_SIGNALS.filter((s) => lower.includes(s));
  const semanticMatches = SEMANTIC_SIGNALS.filter((s) => lower.includes(s));
  const entityCount = KNOWN_ENTITIES.filter((e) => lower.includes(e)).length;

  if (graphMatches.length > 0) {
    signals.push(`graph keywords: ${graphMatches.slice(0, 2).join(", ")}`);
  }
  if (entityCount > 0) {
    signals.push(`${entityCount} named entity match${entityCount > 1 ? "es" : ""}`);
  }
  if (semanticMatches.length > 0) {
    signals.push(`semantic keywords: ${semanticMatches.slice(0, 2).join(", ")}`);
  }

  // Graph: relationship keywords OR 2+ named entities
  if (graphMatches.length > 0 || entityCount >= 2) {
    return {
      method: "graph",
      reason: `Graph traversal selected — ${signals.join("; ")}`,
      signals,
    };
  }

  // Semantic: explicit single-doc keywords
  if (semanticMatches.length > 0) {
    return {
      method: "semantic",
      reason: `Semantic search selected — ${signals.join("; ")}`,
      signals,
    };
  }

  // Hybrid: single entity or ambiguous
  return {
    method: "hybrid",
    reason: signals.length > 0
      ? `Hybrid selected — ${signals.join("; ")}`
      : "Hybrid selected — no strong signal detected",
    signals,
  };
}
