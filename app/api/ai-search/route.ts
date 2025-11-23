import { NextRequest, NextResponse } from "next/server";

// Helper function to chunk content for better performance
function chunkContent(content: string, maxChunkSize: number = 2000): string[] {
  if (content.length <= maxChunkSize) return [content];
  
  const chunks: string[] = [];
  let currentChunk = "";
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ". " : "") + sentence;
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

// Helper function to create a focused prompt
function createPrompt(question: string, content: string): string {
  return `Answer this question based on the content below. Be concise and direct.

Content: ${content}

Question: ${question}

Answer:`;
}

export async function POST(req: NextRequest) {
  try {
    const { question, content, model = "gemma3", stream = false } = await req.json();
    
    if (!question || !question.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    // Use provided content or fallback to general knowledge prompt
    const contentToAnalyze = content && content.trim() ? content : "No specific file content provided. Please answer based on your general knowledge.";

    // Chunk content for better performance
    const chunks = chunkContent(contentToAnalyze);

    // Combine responses from multiple chunks
    if (stream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const ollamaUrl = process.env.OLLAMA_API_URL || "http://localhost:11434";
            for (const chunkContent of chunks) {
              const prompt = createPrompt(question, chunkContent);
              const response = await fetch(`${ollamaUrl}/api/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                  model, 
                  prompt, 
                  stream: true,
                  options: {
                    temperature: 0.3,
                    top_p: 0.8,
                    max_tokens: 500,
                    num_predict: 500,
                    repeat_penalty: 1.1,
                    top_k: 40
                  }
                }),
              });

              if (!response.ok) {
                const error = await response.text();
                controller.error(new Error(`Ollama error: ${error}`));
                return;
              }

              const reader = response.body?.getReader();
              if (!reader) {
                controller.error(new Error("No response body"));
                return;
              }

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());
                
                for (const line of lines) {
                  try {
                    const data = JSON.parse(line);
                    if (data.response) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: data.response })}\n\n`));
                    }
                    if (data.done) {
                      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                      controller.close();
                      return;
                    }
                  } catch (e) {
                    // Skip invalid JSON lines
                  }
                }
              }
            }
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response (fallback)
      const ollamaUrl = process.env.OLLAMA_API_URL || "http://localhost:11434";
      let combinedResponse = "";
      for (const chunkContent of chunks) {
        const prompt = createPrompt(question, chunkContent);
        const ollamaRes = await fetch(`${ollamaUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            model, 
            prompt, 
            stream: false,
            options: {
              temperature: 0.3,
              top_p: 0.8,
              max_tokens: 500,
              num_predict: 500,
              repeat_penalty: 1.1,
              top_k: 40
            }
          }),
        });

        if (!ollamaRes.ok) {
          const err = await ollamaRes.text();
          return NextResponse.json({ error: `Ollama error: ${err}` }, { status: 500 });
        }

        const data = await ollamaRes.json();
        combinedResponse += data.response + "\n";
      }

      return NextResponse.json({ answer: combinedResponse.trim() });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
