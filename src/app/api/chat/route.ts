import { NextResponse } from "next/server";
import { 
  searchKnowledgeBase, 
  generateDirectAnswer, 
  getDicAgentSystemPrompt,
  KnowledgeItem 
} from "@/lib/aiKnowledgeBase";
import { getAiConfig } from "@/lib/aiConfigStore";

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

    // Load server-side secured AI configuration
    const serverAiConfig = getAiConfig();

    // 2. Check for configured n8n Webhook URL with automatic failover between production and test endpoints
    const candidateUrls: string[] = [];
    if (customWebhookUrl?.trim()) candidateUrls.push(customWebhookUrl.trim());
    if (serverAiConfig.n8n_webhook_url?.trim()) candidateUrls.push(serverAiConfig.n8n_webhook_url.trim());
    if (serverAiConfig.n8n_test_webhook_url?.trim()) candidateUrls.push(serverAiConfig.n8n_test_webhook_url.trim());
    if (process.env.N8N_WEBHOOK_URL?.trim()) candidateUrls.push(process.env.N8N_WEBHOOK_URL.trim());

    // Automatically pair webhook and webhook-test endpoints if only one was registered
    for (const url of [...candidateUrls]) {
      if (url.includes("/webhook-test/")) {
        const prod = url.replace("/webhook-test/", "/webhook/");
        if (!candidateUrls.includes(prod)) candidateUrls.push(prod);
      } else if (url.includes("/webhook/")) {
        const test = url.replace("/webhook/", "/webhook-test/");
        if (!candidateUrls.includes(test)) candidateUrls.push(test);
      }
    }

    // Deduplicate candidate URLs
    const uniqueWebhookUrls = Array.from(new Set(candidateUrls));

    if (uniqueWebhookUrls.length > 0) {
      const n8nPayload = {
        message: message.trim(),
        chatInput: message.trim(),
        query: message.trim(),
        prompt: message.trim(),
        input: message.trim(),
        sessionId: sessionId || "dic-user-session",
        conversationId: sessionId || "dic-user-session",
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

      for (const targetUrl of uniqueWebhookUrls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout per endpoint

          const response = await fetch(targetUrl, {
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
              let target = data;
              if (Array.isArray(data) && data.length > 0) {
                target = data[0];
              }
              if (target && typeof target === "object" && target.json) {
                target = target.json;
              }
              answerText = 
                target?.output || 
                target?.reply || 
                target?.response || 
                target?.message || 
                target?.text || 
                target?.answer || 
                (typeof target === "string" ? target : "");

              if (!answerText && typeof data === "object") {
                answerText = data?.output || data?.reply || data?.response || data?.message || data?.text || data?.answer || "";
              }
            } else {
              answerText = await response.text();
            }

            if (answerText && answerText.trim()) {
              return NextResponse.json({
                answer: answerText.trim(),
                sources,
                provider: "n8n",
                success: true
              });
            }
          }
        } catch (n8nError) {
          // Log and try next candidate or fall back
          console.warn(`Attempt with n8n endpoint ${targetUrl} failed:`, n8nError);
        }
      }
    }

    // 3. Check for Direct Gemini API Key fallback if provided
    const geminiApiKey = serverAiConfig.gemini_api_key?.trim() || process.env.GEMINI_API_KEY?.trim();
    if (geminiApiKey) {
      try {
        const promptContext = relevantItems
          .map((item, idx) => `[स्रोत ${idx + 1}: ${item.title} (${item.categoryLabel})]\n${item.content}\nलिङ्क: ${item.sourceUrl}`)
          .join("\n\n");

        const contents = [
          {
            role: "user",
            parts: [
              {
                text: `${getDicAgentSystemPrompt()}\n\nसान्दर्भिक तथ्यगत सन्दर्भ (Relevant Knowledge):\n${promptContext}\n\nप्रयोगकर्ताको प्रश्न:\n${message}`
              }
            ]
          }
        ];

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents })
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const answerText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (answerText && answerText.trim()) {
            return NextResponse.json({
              answer: answerText.trim(),
              sources,
              provider: "gemini-direct",
              success: true
            });
          }
        }
      } catch (geminiErr) {
        console.warn("Direct Gemini API error:", geminiErr);
      }
    }

    // 4. Check for Direct OpenAI API Key fallback if provided
    const openAiKey = customOpenAiKey?.trim() || serverAiConfig.openai_api_key?.trim() || process.env.OPENAI_API_KEY?.trim();

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
      } catch (openAiErr) {
        console.warn("Direct OpenAI API error:", openAiErr);
      }
    }
    const directResult = generateDirectAnswer(message, relevantItems);

    return NextResponse.json({
      answer: directResult.answer,
      sources: directResult.sources,
      provider: "dic-knowledge-engine",
      note: uniqueWebhookUrls.length > 0 
        ? "n8n Webhook प्रतिक्रिया नआएकाले आन्तरिक नलेज इन्जिनबाट प्रमाणित जवाफ प्रदान गरिएको छ।" 
        : "DIC आन्तरिक नलेज इन्जिनबाट जवाफ प्रदान गरिएको छ।",
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
