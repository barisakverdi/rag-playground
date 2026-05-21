import graphData from "@/data/graph.json";

interface Entity {
  id: string;
  name: string;
  type: string;
  confidence: string;
  source_files: string[];
}

interface Relationship {
  source: string;
  target: string;
  type: string;
  confidence: string;
  source_files: string[];
}

interface Graph {
  entities: Entity[];
  relationships: Relationship[];
}

const graph = graphData as Graph;

// Build adjacency map once at module load
const adjacency = new Map<string, Set<string>>();
for (const rel of graph.relationships) {
  if (!adjacency.has(rel.source)) adjacency.set(rel.source, new Set());
  if (!adjacency.has(rel.target)) adjacency.set(rel.target, new Set());
  adjacency.get(rel.source)!.add(rel.target);
  adjacency.get(rel.target)!.add(rel.source);
}

export interface GraphResult {
  file_name: string;
  matched_entities: string[];
  hop: number;
}

function findSeedEntities(query: string): Entity[] {
  const lower = query.toLowerCase();
  const queryWords = lower.split(/\s+/).filter((w) => w.length > 3);

  return graph.entities.filter((e) => {
    const eName = e.name.toLowerCase();
    // Entity name appears in query
    if (lower.includes(eName)) return true;
    // Any significant word of the entity name appears in query (e.g. "Leeds" matches "Leeds Central")
    const entityWords = eName.split(/\s+/).filter((w) => w.length > 3);
    return entityWords.some((ew) => queryWords.some((qw) => qw === ew || qw.includes(ew) || ew.includes(qw)));
  });
}

export function graphSearch(
  query: string,
  depth = 2
): { results: GraphResult[]; matchedEntities: string[]; retrievalMs: number } {
  const start = Date.now();

  const seeds = findSeedEntities(query);
  if (seeds.length === 0) {
    return { results: [], matchedEntities: [], retrievalMs: Date.now() - start };
  }

  // BFS from seed entities
  const visited = new Set<string>();
  const fileScores = new Map<string, { hop: number; entities: Set<string> }>();
  let frontier = seeds.map((e) => e.id);

  for (let hop = 0; hop <= depth; hop++) {
    const nextFrontier: string[] = [];

    for (const entityId of frontier) {
      if (visited.has(entityId)) continue;
      visited.add(entityId);

      const entity = graph.entities.find((e) => e.id === entityId);
      if (!entity) continue;

      for (const file of entity.source_files) {
        if (!fileScores.has(file)) {
          fileScores.set(file, { hop, entities: new Set() });
        }
        const entry = fileScores.get(file)!;
        entry.entities.add(entity.name);
        // Track lowest hop (closest to seed)
        if (hop < entry.hop) entry.hop = hop;
      }

      const neighbours = adjacency.get(entityId);
      if (neighbours && hop < depth) {
        for (const n of neighbours) {
          if (!visited.has(n)) nextFrontier.push(n);
        }
      }
    }

    frontier = nextFrontier;
  }

  const results: GraphResult[] = Array.from(fileScores.entries())
    .map(([file_name, { hop, entities }]) => ({
      file_name,
      matched_entities: Array.from(entities),
      hop,
    }))
    .sort((a, b) => a.hop - b.hop);

  return {
    results,
    matchedEntities: seeds.map((e) => e.name),
    retrievalMs: Date.now() - start,
  };
}
