/**
 * Seed Supabase pgvector with embedded corpus chunks.
 * Reads data/chunks.json and upserts into public.documents + public.chunks.
 *
 * Usage: pnpm tsx scripts/seed-pgvector.ts
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CHUNKS_FILE = path.join(process.cwd(), "data", "chunks.json");

interface Chunk {
  file_name: string;
  title: string;
  type: string;
  content: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase env vars not set in .env.local");
    process.exit(1);
  }

  const chunks: Chunk[] = JSON.parse(fs.readFileSync(CHUNKS_FILE, "utf-8"));
  console.log(`\nSeeding ${chunks.length} documents into Supabase (schema: public)...\n`);

  for (const chunk of chunks) {
    const { data: doc, error: docError } = await supabase
            .from("documents")
      .upsert(
        {
          file_name: chunk.file_name,
          title: chunk.title,
          content: chunk.content,
          metadata: { type: chunk.type, ...chunk.metadata },
        },
        { onConflict: "file_name" }
      )
      .select("id")
      .single();

    if (docError) {
      console.error(`  ERROR inserting document ${chunk.file_name}:`, docError.message);
      continue;
    }

    const { error: chunkError } = await supabase.from("chunks").upsert(
      {
        document_id: doc.id,
        file_name: chunk.file_name,
        content: chunk.content,
        embedding: JSON.stringify(chunk.embedding),
        metadata: { type: chunk.type, title: chunk.title },
      },
      { onConflict: "file_name" }
    );

    if (chunkError) {
      console.error(`  ERROR inserting chunk ${chunk.file_name}:`, chunkError.message);
      continue;
    }

    console.log(`  ✓ ${chunk.file_name} (doc_id: ${doc.id})`);
  }

  console.log("\nDone. Verifying row counts...");

  const { count: docCount } = await supabase
        .from("documents")
    .select("*", { count: "exact", head: true });

  const { count: chunkCount } = await supabase
        .from("chunks")
    .select("*", { count: "exact", head: true });

  console.log(`  rag.documents: ${docCount} rows`);
  console.log(`  rag.chunks:    ${chunkCount} rows`);
}

main().catch(console.error);
