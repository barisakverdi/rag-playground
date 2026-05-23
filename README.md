# Adaptive RAG Playground

**Live demo → [rag.barisakverdi.com](https://rag.barisakverdi.com)**

A portfolio project demonstrating multi-document causal reasoning with Retrieval-Augmented Generation. Built to show when semantic search wins, when graph traversal wins, and why — with a router that explains its own decisions.

---

## The problem it solves

Single-document retrieval fails on real enterprise knowledge bases. Incident reports reference supplier updates that explain customer complaints that trace back to a logistics failure — no single document tells the full story.

This demo uses a synthetic corpus (BrewPulse Coffee, 8 operational documents) where every meaningful question requires retrieving across multiple files. The corpus is designed with deliberate failure modes: indirect references, multi-hop causal chains, ambiguous attribution.

---

## Features

- **Comparison mode** — same query, semantic search vs graph traversal, side by side
- **Auto-router** — heuristic classifier that picks the retrieval method and explains why
- **Decision log** — shows seed entities, retrieved documents, retrieval timings
- **20 sample queries** — pre-built to demonstrate different retrieval failure modes
- **Streaming responses** — Claude Haiku 4.5 via SSE

The highlight is **Query 20**: trace the full chain from a Wakefield depot failure to a Google Reviews complaint across 4 documents. Semantic search retrieves fragments; graph traversal reconstructs the complete causal chain.

---

## Architecture

![System architecture](https://rag.barisakverdi.com/architecture.svg)

**Build-time:** BrewPulse corpus → custom graph extractor (Claude tool use) → `graph.json`. Voyage AI `voyage-3` embeddings → pgvector on Supabase.

**Query-time:** Heuristic router classifies the query → retrieval path(s) execute → results fed to Claude Haiku 4.5 for streaming response. Compare mode runs both paths in parallel.

---

## Engineering decisions

**Custom graph extractor instead of Graphify**
Tested Graphify v0.8.13. Found 30–40% entity recall and a streaming bug. Wrote a custom extractor using Claude tool use with a domain-specific entity typology and confidence scoring. Build cost: $0.11.

**pgvector over ChromaDB or Pinecone**
Supabase + pgvector keeps the entire stack on a single Vercel deploy. No separate vector DB service to manage. Postgres is also my primary DBA background — using it here was deliberate.

**Heuristic router over LLM-based router**
An LLM router adds ~300ms latency and ~$0.001 per query. The heuristic (entity count + keyword signals) achieves the same classification on this corpus for free. The decision log makes the router's reasoning transparent to the user.

**Stateless by design**
Each query is an independent RAG call — no conversation history. Keeps latency low and cost predictable (~$0.002/query). Session-scoped entity memory (carrying matched entities across turns) is the natural V2 extension.

**File-level chunking**
Documents are ~640 words each. Sliding-window chunking adds complexity without benefit at this scale. File-level embeddings via Voyage AI. Total embedding cost: $0.0004.

---

## Dataset: BrewPulse Coffee

Synthetic corpus of 8 operational documents simulating a coffee chain's North England region: incident reports, supplier updates, customer feedback, staffing memos, maintenance logs.

**AI-generated, manually curated.** Documents were co-designed with Claude with deliberate retrieval failure modes specified upfront — not left to chance. Each of the 20 demo queries has a manually verified ground truth mapping: expected files, expected retrieval method winner, and the reasoning.

This is disclosed openly because the methodology itself demonstrates the engineering approach. Designing a corpus to *stress-test* a retrieval system is different from just generating documents.

Full dataset documentation: [rag.barisakverdi.com/dataset](https://rag.barisakverdi.com/dataset)

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Next.js 16, Tailwind CSS | Vercel-native, App Router |
| LLM | Claude Haiku 4.5 | Fast, cheap, Anthropic ecosystem |
| Embeddings | Voyage AI `voyage-3` | Anthropic-recommended |
| Vector store | pgvector on Supabase | Postgres + single deploy |
| Graph | Custom BFS on `graph.json` | No external graph DB needed |
| Hosting | Vercel | Automatic HTTPS, custom domain |

---

## Costs

| Item | Cost |
|---|---|
| Graph extraction (8 docs) | $0.11 |
| Embeddings (8 docs) | $0.0004 |
| Per query (retrieval + LLM) | ~$0.002 |
| Hosting | Vercel free tier |

---

## Local setup

```bash
git clone https://github.com/barisakverdi/rag-playground
cd rag-playground
pnpm install
```

Copy `.env.example` to `.env.local` and fill in:

```
ANTHROPIC_API_KEY=
VOYAGE_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

```bash
pnpm dev
```

The corpus, embeddings, and graph are pre-built — no scripts need to run to use the demo. The `scripts/` directory contains the build-time tooling if you want to inspect or re-run the extraction and embedding pipeline.

---

## About

Built by **Mustafa Barış Akverdi** — Senior Oracle APEX/DBA + AI developer, Reading UK.

Available for contract and full-time AI/ML engineering roles.

[LinkedIn](https://www.linkedin.com/in/mustafa-baris-akverdi-a5366012/) · [rag.barisakverdi.com](https://rag.barisakverdi.com)
