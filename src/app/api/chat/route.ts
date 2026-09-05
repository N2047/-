import { NextResponse } from "next/server";
import { 
  searchKnowledgeBase, 
  generateDirectAnswer, 
  getDicAgentSystemPrompt,
  KnowledgeItem 
} from "@/lib/aiKnowledgeBase";

interface ChatRequestBody {
  message: string;
  sessionId?: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  customWebhookUrl?: string;
  customOpenAiKey?: string;
  palikaContext?: string;
}

export async function POST(request: Request) {
  try {
    const body: ChatRequestBody = await request.json();
    const { 
      message, 
      sessionId = `dic-session-${Date.now()}`, 
      conversationHistory = [], 
      customWebhookUrl,
      customOpenAiKey,
      palikaContext 
    } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "सन्देश खाली हुन सक्दैन (Message is required)" },
        { status: 400 }
      );
    }

    // 1. Retrieve most relevant knowledge snippets from DIC knowledge base
    const relevantItems = searchKnowledgeBase(message, 5);

    const sources = relevantItems.map(item => ({
      title: item.title,
      url: item.sourceUrl,
      category: item.categoryLabel
    }));

    // 2. Check for configured n8n Webhook URL
    const n8nWebhookUrl = customWebhookUrl?.trim() || process.env.N8N_WEBHOOK_URL?.trim();

    if (n8nWebhookUrl) {
      try {
        const n8nPayload = {
          message: message.trim(),
          sessionId,
          palikaContext: palikaContext || null,
          conversationHistory: conversationHistory.slice(-6),
          systemPrompt: getDicAgentSystemPrompt(),
          context: {
            retrievedSnippets: relevantItems.map(item => ({
              id: item.id,
              title: item.title,
              category: item.categoryLabel,
              content: item.content,
              url: item.sourceUrl
            }))
          },
          timestamp: new Date().toISOString()
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 14000); // 14s timeout

        const response = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json, text/plain",
          },
          body: JSON.stringify(n8nPayload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const contentType = response.headers.get("content-type") || "";
          let answerText = "";

          if (contentType.includes("application/json")) {
            const data = await response.json();
            answerText = data.output || data.text || data.response || data.answer || data.message || JSON.stringify(data);
          } else {
            answerText = await response.text();
          }

          if (answerText && answerText.trim()) {
            return NextResponse.json({
              answer: answerText.trim(),
              sources,
              provider: "n8n",
              webhookUrl: n8nWebhookUrl,
              success: true
            });
          }
        } else {
          console.warn(`n8n webhook returned status ${response.status}. Falling back to internal engine.`);
        }
      } catch (n8nError) {
        console.warn("n8n Webhook connection timed out or failed. Falling back to direct engine:", n8nError);
      }
    }

    // 3. Check for Direct OpenAI API Key fallback if provided
    const openAiKey = customOpenAiKey?.trim() || process.env.OPENAI_API_KEY?.trim();

    if (openAiKey) {
      try {
        const promptContext = relevantItems
          .map((item, idx) => `[स्रोत ${idx + 1}: ${item.title} (${item.categoryLabel})]\n${item.content}\nलिङ्क: ${item.sourceUrl}`)
          .join("\n\n");

        const messages = [
          {
            role: "system",
            content: `${getDicAgentSystemPrompt()}\n\nसान्दर्भिक तथ्यगत सन्दर्भ (Relevant Knowledge):\n${promptContext}`
          },
          ...conversationHistory.slice(-4),
          {
            role: "user",
            content: message
          }
        ];

        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.3,
            max_tokens: 800
          })
        });

        if (openAiRes.ok) {
          const aiData = await openAiRes.json();
          const answerText = aiData.choices?.[0]?.message?.content;
          if (answerText) {
            return NextResponse.json({
              answer: answerText.trim(),
              sources,
              provider: "openai-direct",
              success: true
            });
          }
        }
      } catch (openAiError) {
        console.warn("Direct OpenAI call failed:", openAiError);
      }
    }

    // 4. Guaranteed Instant Fallback: High-quality Built-in DIC Knowledge Retrieval Engine
    const directResult = generateDirectAnswer(message, relevantItems);

    return NextResponse.json({
      answer: directResult.answer,
      sources: directResult.sources,
      provider: "dic-knowledge-engine",
      note: n8nWebhookUrl 
        ? "n8n Webhook प्रतिक्रिया नआएकाले आन्तरिक नलेज इन्जिनबाट प्रमाणित जवाफ प्रदान गरिएको छ।" 
        : "n8n Webhook कन्फिगर नभएकोले DIC आन्तरिक नलेज इन्जिनबाट जवाफ प्रदान गरिएको छ।",
      success: true
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "प्रक्रियामा प्राविधिक त्रुटि भयो। कृपया पुन: प्रयास गर्नुहोस्।" },
      { status: 500 }
    );
  }
}
