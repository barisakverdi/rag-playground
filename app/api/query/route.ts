import { NextRequest } from "next/server";
import { routeQuery } from "@/lib/retrieval/router";
import { semanticSearch } from "@/lib/retrieval/semantic";
import { graphSearch } from "@/lib/retrieval/graph";
import { streamAnswer, estimateCost, RetrievedDoc } from "@/lib/claude";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { query, locale } = await req.json();
  if (!query || typeof query !== "string") {
    return new Response(JSON.stringify({ error: "query required" }), { status: 400 });
  }

  const decision = routeQuery(query);
  const TOP_K = 4;

  // Collect docs based on router decision
  let docs: RetrievedDoc[] = [];
  let semanticMs = 0;
  let graphMs = 0;
  let embeddingMs = 0;
  let graphEntities: string[] = [];

  if (decision.method === "semantic" || decision.method === "hybrid") {
    const sr = await semanticSearch(query, TOP_K);
    embeddingMs = sr.embeddingMs;
    semanticMs = sr.retrievalMs;
    docs = sr.results.map((r) => ({
      file_name: r.file_name,
      content: r.content,
      similarity: r.similarity,
    }));
  }

  if (decision.method === "graph" || decision.method === "hybrid") {
    const gr = graphSearch(query, 2);
    graphMs = gr.retrievalMs;
    graphEntities = gr.matchedEntities;

    // Fetch content for top graph results
    const topFiles = gr.results.slice(0, TOP_K).map((r) => r.file_name);
    const existingFileNames = new Set(docs.map((d) => d.file_name));

    if (topFiles.length > 0) {
      const { data } = await getSupabase()
        .from("chunks")
        .select("file_name, content")
        .in("file_name", topFiles);

      if (data) {
        for (const row of data) {
          if (!existingFileNames.has(row.file_name)) {
            docs.push({ file_name: row.file_name, content: row.content });
          }
        }
      }
    }
  }

  // Limit total docs to TOP_K
  docs = docs.slice(0, TOP_K);

  if (docs.length === 0) {
    return new Response(
      JSON.stringify({ error: "No relevant documents found" }),
      { status: 404 }
    );
  }

  // Stream response back as SSE
  const encoder = new TextEncoder();
  let inputTokens = 0;
  let outputTokens = 0;

  const stream = new ReadableStream({
    async start(controller) {
      // Send metadata first
      const meta = {
        type: "meta",
        decision,
        retrievedDocs: docs.map((d) => ({
          file_name: d.file_name,
          similarity: d.similarity,
        })),
        graphEntities,
        timings: { embeddingMs, semanticMs, graphMs },
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(meta)}\n\n`));

      // Stream LLM answer
      const { inputTokens: iT, outputTokens: oT } = await streamAnswer(
        query,
        docs,
        (chunk) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "chunk", text: chunk })}\n\n`)
          );
        },
        locale ?? "en"
      );
      inputTokens = iT;
      outputTokens = oT;

      // Send final stats
      const done = {
        type: "done",
        inputTokens,
        outputTokens,
        costUsd: estimateCost(inputTokens, outputTokens),
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(done)}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
