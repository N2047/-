import fs from "fs";
import path from "path";
import { LawDocument, LEGAL_DOCUMENTS, LawCategory, GovLevel } from "@/lib/lawsData";
import { addAuditLog } from "./authStore";

const LAWS_DB_PATH = path.join(process.cwd(), "src", "lib", "laws_db.json");

let inMemoryLaws: LawDocument[] | null = null;

export function loadLawsFromDb(): LawDocument[] {
  if (inMemoryLaws && inMemoryLaws.length > 0) {
    return inMemoryLaws;
  }

  try {
    if (fs.existsSync(LAWS_DB_PATH)) {
      const raw = fs.readFileSync(LAWS_DB_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryLaws = parsed;
        return inMemoryLaws!;
      }
    }
  } catch (err) {
    console.error("Failed to read laws_db.json, using seed:", err);
  }

  inMemoryLaws = JSON.parse(JSON.stringify(LEGAL_DOCUMENTS));
  saveLawsToDb(inMemoryLaws!);
  return inMemoryLaws!;
}

export function saveLawsToDb(docs: LawDocument[]): boolean {
  inMemoryLaws = docs;
  try {
    const dir = path.dirname(LAWS_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LAWS_DB_PATH, JSON.stringify(docs, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to write laws_db.json to disk:", err);
    return false;
  }
}

export function getAllLaws(filter?: { category?: string; gov_level?: string; query?: string }): LawDocument[] {
  let list = loadLawsFromDb();

  if (filter?.category && filter.category !== "all") {
    list = list.filter(d => d.category === filter.category);
  }

  if (filter?.gov_level && filter.gov_level !== "all") {
    list = list.filter(d => d.gov_level === filter.gov_level);
  }

  if (filter?.query) {
    const q = filter.query.toLowerCase().trim();
    list = list.filter(d => 
      d.title_ne.toLowerCase().includes(q) ||
      d.title_en.toLowerCase().includes(q) ||
      d.description_ne.toLowerCase().includes(q) ||
      d.keywords.some(k => k.toLowerCase().includes(q))
    );
  }

  return list;
}

export function getLawById(id: string): LawDocument | undefined {
  const all = loadLawsFromDb();
  return all.find(d => d.id === id);
}

export function createLaw(
  data: Omit<LawDocument, "id">,
  user?: { id?: string; name?: string }
): LawDocument {
  const all = loadLawsFromDb();
  const prefix = data.gov_level === "federal" ? "law-fed" : "law-prov";
  const newId = `${prefix}-${Date.now()}`;

  const newDoc: LawDocument = {
    ...data,
    id: newId,
  };

  const updated = [newDoc, ...all];
  saveLawsToDb(updated);

  addAuditLog(
    "LAW_DOCUMENT_CREATED",
    user?.id || "admin-master-001",
    user?.name || "मुख्य प्रशासक",
    newDoc.id,
    newDoc.title_ne,
    `नयाँ कानुन दस्तावेज "${newDoc.title_ne}" (${newDoc.category_name_ne}, ${newDoc.gov_level}) थप गरियो`
  );

  return newDoc;
}

export function updateLaw(
  id: string,
  updates: Partial<Omit<LawDocument, "id">>,
  user?: { id?: string; name?: string }
): LawDocument | null {
  const all = loadLawsFromDb();
  const index = all.findIndex(d => d.id === id);
  if (index === -1) return null;

  const updatedDoc: LawDocument = {
    ...all[index],
    ...updates,
  };

  all[index] = updatedDoc;
  saveLawsToDb(all);

  addAuditLog(
    "LAW_DOCUMENT_UPDATED",
    user?.id || "admin-master-001",
    user?.name || "मुख्य प्रशासक",
    id,
    updatedDoc.title_ne,
    `कानुन दस्तावेज "${updatedDoc.title_ne}" सम्पादन गरियो`
  );

  return updatedDoc;
}

export function deleteLaw(
  id: string,
  user?: { id?: string; name?: string }
): boolean {
  const all = loadLawsFromDb();
  const index = all.findIndex(d => d.id === id);
  if (index === -1) return false;

  const target = all[index];
  const updated = all.filter(d => d.id !== id);
  saveLawsToDb(updated);

  addAuditLog(
    "LAW_DOCUMENT_DELETED",
    user?.id || "admin-master-001",
    user?.name || "मुख्य प्रशासक",
    id,
    target.title_ne,
    `कानुन दस्तावेज "${target.title_ne}" हटाइयो`
  );

  return true;
}

export function resetLawsToDefault(user?: { id?: string; name?: string }): LawDocument[] {
  const resetDocs = JSON.parse(JSON.stringify(LEGAL_DOCUMENTS));
  saveLawsToDb(resetDocs);

  addAuditLog(
    "LAW_DOCUMENTS_RESET",
    user?.id || "admin-master-001",
    user?.name || "मुख्य प्रशासक",
    "all",
    "कानुन सूची",
    "कानुनी दस्तावेज सूची प्रारम्भिक अवस्थामा रिसेट गरियो"
  );

  return resetDocs;
}
