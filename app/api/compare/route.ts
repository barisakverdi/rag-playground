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
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      // Run semantic + graph in parallel
      const [sr, gr] = await Promise.all([
        semanticSearch(query, TOP_K),
        Promise.resolve(graphSearch(query, 2)),
      ]);

      // Fetch content for graph results
      const graphFileNames = gr.results.slice(0, TOP_K).map((r) => r.file_name);
      let graphDocs: RetrievedDoc[] = [];
      if (graphFileNames.length > 0) {
        const { data } = await getSupabase()
          .from("chunks")
          .select("file_name, content")
          .in("file_name", graphFileNames);
        if (data) {
          graphDocs = data.map((row) => ({
            file_name: row.file_name,
            content: row.content,
          }));
        }
      }

      const semanticDocs: RetrievedDoc[] = sr.results.map((r) => ({
        file_name: r.file_name,
        content: r.content,
        similarity: r.similarity,
      }));

      // Send metadata for both sides
      send({
        type: "meta",
        decision,
        semantic: {
          docs: semanticDocs.map((d) => ({ file_name: d.file_name, similarity: d.similarity })),
          embeddingMs: sr.embeddingMs,
          retrievalMs: sr.retrievalMs,
        },
        graph: {
          docs: gr.results.slice(0, TOP_K).map((r) => ({
            file_name: r.file_name,
            hop: r.hop,
            matched_entities: r.matched_entities,
          })),
          matchedEntities: gr.matchedEntities,
          retrievalMs: gr.retrievalMs,
        },
      });

      // Stream both answers in parallel — interleave chunks with side tag
      let semanticIn = 0, semanticOut = 0, graphIn = 0, graphOut = 0;

      await Promise.all([
        streamAnswer(query, semanticDocs, (chunk) =>
          send({ type: "chunk", side: "semantic", text: chunk }), locale ?? "en"
        ).then(({ inputTokens, outputTokens }) => {
          semanticIn = inputTokens;
          semanticOut = outputTokens;
        }),
        streamAnswer(query, graphDocs, (chunk) =>
          send({ type: "chunk", side: "graph", text: chunk }), locale ?? "en"
        ).then(({ inputTokens, outputTokens }) => {
          graphIn = inputTokens;
          graphOut = outputTokens;
        }),
      ]);

      send({
        type: "done",
        semantic: {
          inputTokens: semanticIn,
          outputTokens: semanticOut,
          costUsd: estimateCost(semanticIn, semanticOut),
        },
        graph: {
          inputTokens: graphIn,
          outputTokens: graphOut,
          costUsd: estimateCost(graphIn, graphOut),
        },
      });

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
