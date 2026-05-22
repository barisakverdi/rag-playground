import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface RetrievedDoc {
  file_name: string;
  content: string;
  similarity?: number;
  matched_entities?: string[];
}

export async function streamAnswer(
  query: string,
  docs: RetrievedDoc[],
  onChunk: (text: string) => void,
  locale = "en"
): Promise<{ inputTokens: number; outputTokens: number }> {
  const context = docs
    .map((d, i) => `[Document ${i + 1}: ${d.file_name}]\n${d.content}`)
    .join("\n\n---\n\n");

  const systemPrompt = `You are an AI assistant answering questions about BrewPulse Coffee's North England regional operations.
Answer based ONLY on the provided documents. Be concise and specific.
If the documents don't contain enough information to answer, say so clearly.
Reference document names when citing specific facts.${locale === "tr" ? "\n\nPlease respond in Turkish." : ""}`;

  let inputTokens = 0;
  let outputTokens = 0;

  const stream = client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Documents:\n\n${context}\n\n---\n\nQuestion: ${query}`,
      },
    ],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      onChunk(event.delta.text);
    }
    if (event.type === "message_delta" && event.usage) {
      outputTokens = event.usage.output_tokens;
    }
    if (event.type === "message_start" && event.message.usage) {
      inputTokens = event.message.usage.input_tokens;
    }
  }

  return { inputTokens, outputTokens };
}

export function estimateCost(inputTokens: number, outputTokens: number): number {
  // Claude Haiku 4.5: $0.80/M input, $4.00/M output
  return inputTokens * (0.8 / 1_000_000) + outputTokens * (4.0 / 1_000_000);
}
