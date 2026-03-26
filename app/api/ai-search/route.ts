import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Use edge runtime for reliable streaming on Vercel
export const runtime = "edge";

// Initialize the Google Generative AI instance
// This requires the GEMINI_API_KEY environment variable to be set
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { question, content, stream = false } = await req.json();
    
    if (!question || !question.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is not set. Please configure it in your Vercel deployment or .env.local file." }, 
        { status: 500 }
      );
    }

    // Use provided content or fallback to general knowledge prompt
    const contentToAnalyze = content && content.trim() 
      ? content 
      : "No specific file content provided. Please answer based on your general knowledge.";

    // Use modern gemini-1.5-flash which is fast, cheap/free, and has a 1 million token context window.
    // This entirely removes the need for manual chunking that was required by local Ollama models.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Answer the following question based on the provided content. Be concise, direct, and helpful.

Content:
${contentToAnalyze}

Question:
${question}

Answer:`;

    if (stream) {
      const encoder = new TextEncoder();
      
      const streamResponse = new ReadableStream({
        async start(controller) {
          try {
            const result = await model.generateContentStream(prompt);

            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              if (chunkText) {
                // Ensure text is properly JSON encoded before sending
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`)
                );
              }
            }
            
            // Signal completion to the frontend
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            controller.close();
          } catch (error: any) {
            console.error("Gemini stream error:", error);
            controller.error(error);
          }
        },
      });

      return new Response(streamResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      return NextResponse.json({ answer: responseText.trim() });
    }
  } catch (e: any) {
    console.error("API route error:", e);
    return NextResponse.json({ error: e.message || "An error occurred" }, { status: 500 });
  }
}
