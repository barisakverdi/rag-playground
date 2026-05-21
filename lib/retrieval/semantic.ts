import { getSupabase } from "@/lib/supabase";

export interface SemanticResult {
  file_name: string;
  similarity: number;
  content: string;
  metadata: Record<string, unknown>;
}

async function embedQuery(query: string): Promise<number[]> {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "voyage-3",
      input: [query],
      input_type: "query",
    }),
  });

  if (!res.ok) {
    throw new Error(`Voyage AI error ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { data: { embedding: number[] }[] };
  return data.data[0].embedding;
}

export async function semanticSearch(
  query: string,
  topK = 4
): Promise<{ results: SemanticResult[]; embeddingMs: number; retrievalMs: number }> {
  const embedStart = Date.now();
  const embedding = await embedQuery(query);
  const embeddingMs = Date.now() - embedStart;

  const retrievalStart = Date.now();
  const { data, error } = await getSupabase().rpc("match_chunks", {
    query_embedding: JSON.stringify(embedding),
    match_count: topK,
    min_similarity: 0.0,
  });
  const retrievalMs = Date.now() - retrievalStart;

  if (error) throw new Error(`Supabase RPC error: ${error.message}`);

  const results: SemanticResult[] = (data ?? []).map(
    (row: { file_name: string; similarity: number; content: string; metadata: Record<string, unknown> }) => ({
      file_name: row.file_name,
      similarity: row.similarity,
      content: row.content,
      metadata: row.metadata,
    })
  );

  return { results, embeddingMs, retrievalMs };
}
