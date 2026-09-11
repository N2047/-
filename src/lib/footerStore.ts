import fs from "fs";
import path from "path";
import { FooterConfig } from "@/types/footer";
import { DEFAULT_FOOTER_CONFIG } from "./footerConstants";
import { logAuditEvent } from "./authStore";

const FOOTER_DB_PATH = path.join(process.cwd(), "src", "lib", "footer_db.json");

let inMemoryFooterConfig: FooterConfig | null = null;

function loadFromDisk(): FooterConfig {
  try {
    if (fs.existsSync(FOOTER_DB_PATH)) {
      const content = fs.readFileSync(FOOTER_DB_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object" && parsed.app_name_ne) {
        return parsed as FooterConfig;
      }
    }
  } catch (err) {
    console.error("Failed to read footer_db.json from disk:", err);
  }
  return DEFAULT_FOOTER_CONFIG;
}

function saveToDisk(config: FooterConfig): void {
  try {
    const dir = path.dirname(FOOTER_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FOOTER_DB_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write footer_db.json to disk:", err);
  }
}

export function getFooterConfig(): FooterConfig {
  if (!inMemoryFooterConfig) {
    inMemoryFooterConfig = loadFromDisk();
  }
  return inMemoryFooterConfig;
}

export function updateFooterConfig(
  newConfig: Partial<FooterConfig>,
  user?: { id?: string; name?: string; role?: string }
): FooterConfig {
  const current = getFooterConfig();
  const updated: FooterConfig = {
    ...current,
    ...newConfig,
    updated_at: new Date().toISOString(),
    updated_by: user?.name || user?.role || "Super Admin",
  };

  inMemoryFooterConfig = updated;
  saveToDisk(updated);

  try {
    logAuditEvent(
      "UPDATE_FOOTER",
      user?.id || "admin-unknown",
      user?.name || "Super Admin",
      "footer-global",
      "Website Footer",
      "वेबसाइट फुटर (तलको भाग) सामग्री परिमार्जन गरियो।"
    );
  } catch (e) {
    console.warn("Audit logging skipped:", e);
  }

  return updated;
}

export function resetFooterConfig(
  user?: { id?: string; name?: string; role?: string }
): FooterConfig {
  const resetConfig: FooterConfig = {
    ...DEFAULT_FOOTER_CONFIG,
    updated_at: new Date().toISOString(),
    updated_by: `${user?.name || "Admin"} (रिसेट गरिएको)`,
  };

  inMemoryFooterConfig = resetConfig;
  saveToDisk(resetConfig);

  try {
    logAuditEvent(
      "RESET_FOOTER",
      user?.id || "admin-unknown",
      user?.name || "Super Admin",
      "footer-global",
      "Website Footer",
      "वेबसाइट फुटर सामग्रीलाई पूर्वनिर्धारित अवस्थामा रिसेट गरियो।"
    );
  } catch (e) {
    console.warn("Audit logging skipped:", e);
  }

  return resetConfig;
}
