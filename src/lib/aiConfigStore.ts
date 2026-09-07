import fs from "fs";
import path from "path";
import { addAuditLog } from "./authStore";

export interface AiConfig {
  n8n_webhook_url: string;
  n8n_test_webhook_url?: string;
  openai_api_key: string;
  gemini_api_key?: string;
  updated_at: string;
  updated_by?: string;
}

const AI_CONFIG_PATH = path.join(process.cwd(), "src", "lib", "ai_config_db.json");

let inMemoryConfig: AiConfig | null = null;

export function getAiConfig(): AiConfig {
  if (inMemoryConfig) {
    return inMemoryConfig;
  }

  try {
    if (fs.existsSync(AI_CONFIG_PATH)) {
      const raw = fs.readFileSync(AI_CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        inMemoryConfig = {
          n8n_webhook_url: parsed.n8n_webhook_url || process.env.N8N_WEBHOOK_URL || "",
          n8n_test_webhook_url: parsed.n8n_test_webhook_url || "",
          openai_api_key: parsed.openai_api_key || process.env.OPENAI_API_KEY || "",
          gemini_api_key: parsed.gemini_api_key || process.env.GEMINI_API_KEY || "",
          updated_at: parsed.updated_at || new Date().toISOString(),
          updated_by: parsed.updated_by || "system"
        };
        return inMemoryConfig;
      }
    }
  } catch (err) {
    console.error("Failed to read ai_config_db.json:", err);
  }

  inMemoryConfig = {
    n8n_webhook_url: process.env.N8N_WEBHOOK_URL || "",
    n8n_test_webhook_url: "",
    openai_api_key: process.env.OPENAI_API_KEY || "",
    gemini_api_key: process.env.GEMINI_API_KEY || "",
    updated_at: new Date().toISOString(),
    updated_by: "system"
  };
  return inMemoryConfig;
}

export function saveAiConfig(
  updates: Partial<Pick<AiConfig, "n8n_webhook_url" | "n8n_test_webhook_url" | "openai_api_key" | "gemini_api_key">>,
  user?: { id?: string; name?: string }
): AiConfig {
  const current = getAiConfig();

  const newConfig: AiConfig = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
    updated_by: user?.name || "मुख्य प्रशासक (Super Admin)"
  };

  inMemoryConfig = newConfig;

  try {
    const dir = path.dirname(AI_CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(AI_CONFIG_PATH, JSON.stringify(newConfig, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write ai_config_db.json to disk:", err);
  }

  addAuditLog(
    "AI_CONFIG_UPDATED",
    user?.id || "admin-master-001",
    user?.name || "मुख्य प्रशासक",
    "ai-assistant-config",
    "n8n Webhook / OpenAI सेटिङ्स",
    `AI च्याटबोट n8n Webhook तथा OpenAI सेटिङ्स अद्यावधिक गरियो`
  );

  return newConfig;
}
