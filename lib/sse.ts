export type SSEMeta = {
  type: "meta";
  decision: { method: string; reason: string; signals: string[] };
  retrievedDocs?: { file_name: string; similarity?: number }[];
  graphEntities?: string[];
  timings?: { embeddingMs: number; semanticMs: number; graphMs: number };
  semantic?: {
    docs: { file_name: string; similarity?: number }[];
    embeddingMs: number;
    retrievalMs: number;
  };
  graph?: {
    docs: { file_name: string; hop?: number; matched_entities?: string[] }[];
    matchedEntities: string[];
    retrievalMs: number;
  };
};

export type SSEChunk = { type: "chunk"; text: string; side?: "semantic" | "graph" };

export type SSEDone = {
  type: "done";
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  semantic?: { inputTokens: number; outputTokens: number; costUsd: number };
  graph?: { inputTokens: number; outputTokens: number; costUsd: number };
};

export type SSEEvent = SSEMeta | SSEChunk | SSEDone;

export async function streamSSE(
  url: string,
  body: unknown,
  onEvent: (event: SSEEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const event = JSON.parse(line.slice(6)) as SSEEvent;
          onEvent(event);
        } catch {
          // ignore malformed lines
        }
      }
    }
  }
}
