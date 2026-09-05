import fs from "fs";
import path from "path";
import { 
  GovernmentContact, 
  INITIAL_KOSHI_MINISTRIES, 
  generateInitialLocalGovContacts 
} from "./grievanceService";
import { KOSHI_DISTRICTS } from "./koshiGeography";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "lib", "government_contacts_db.json");

// In-memory cache
let inMemoryContacts: GovernmentContact[] | null = null;

/**
 * Initialize default contacts
 */
function getInitialContacts(): GovernmentContact[] {
  return [...INITIAL_KOSHI_MINISTRIES, ...generateInitialLocalGovContacts()];
}

/**
 * Read all contacts from persistent file or fallback to initial defaults
 */
export function getServerContacts(): GovernmentContact[] {
  if (inMemoryContacts && inMemoryContacts.length > 0) {
    return inMemoryContacts;
  }

  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryContacts = parsed;
        return inMemoryContacts!;
      }
    }
  } catch (err) {
    console.warn("Could not read government_contacts_db.json, using defaults:", err);
  }

  inMemoryContacts = getInitialContacts();
  // Attempt to write initial file for subsequent fast access
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(inMemoryContacts, null, 2), "utf-8");
  } catch {
    // Ignore if running in a read-only environment
  }

  return inMemoryContacts;
}

/**
 * Save contacts to persistent storage & update memory cache
 */
export function saveServerContacts(contacts: GovernmentContact[]): boolean {
  if (!Array.isArray(contacts)) return false;

  inMemoryContacts = contacts;
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(contacts, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to write government_contacts_db.json:", err);
    return false;
  }
}

export interface UpsertContactInput {
  organization_type: "ministry" | "local_government" | "provincial_office";
  organization_name_ne: string;
  organization_name_en?: string;
  official_email: string;
  official_phone?: string;
  office_address?: string;
  district_id?: string;
  local_government_id?: string;
  ministry_id?: string;
}

/**
 * Upsert a single contact (Ministry or Palika) and automatically link it
 */
export function upsertServerContact(input: UpsertContactInput): { contact: GovernmentContact; isNew: boolean } {
  const allContacts = [...getServerContacts()];
  const cleanEmail = input.official_email.trim();
  const cleanPhone = input.official_phone?.trim() || "उपलब्ध छैन";
  const now = new Date().toISOString();

  let existingIndex = -1;

  if (input.organization_type === "ministry") {
    // Match by ministry_id or exact/similar name
    existingIndex = allContacts.findIndex(
      (c) =>
        c.organization_type === "ministry" &&
        ((input.ministry_id && (c.ministry_id === input.ministry_id || c.id === input.ministry_id)) ||
          c.organization_name_ne.trim().toLowerCase() === input.organization_name_ne.trim().toLowerCase())
    );
  } else {
    // Palika: match by local_government_id or (district_id + organization_name)
    existingIndex = allContacts.findIndex((c) => {
      if (c.organization_type !== "local_government") return false;
      if (input.local_government_id && c.local_government_id === input.local_government_id) return true;
      if (input.district_id && c.district_id === input.district_id) {
        const cName = c.organization_name_ne.toLowerCase().replace(/,/g, "").trim();
        const inName = input.organization_name_ne.toLowerCase().replace(/,/g, "").trim();
        return cName.includes(inName) || inName.includes(cName);
      }
      return false;
    });
  }

  if (existingIndex >= 0) {
    // Update existing contact
    const existing = allContacts[existingIndex];
    const updated: GovernmentContact = {
      ...existing,
      organization_name_ne: input.organization_name_ne.trim() || existing.organization_name_ne,
      organization_name_en: input.organization_name_en?.trim() || existing.organization_name_en,
      official_email: cleanEmail,
      official_phone: cleanPhone,
      office_address: input.office_address?.trim() || existing.office_address,
      district_id: input.district_id || existing.district_id,
      local_government_id: input.local_government_id || existing.local_government_id,
      ministry_id: input.ministry_id || existing.ministry_id,
      is_active: true,
      is_verified: true,
      updated_at: now
    };
    allContacts[existingIndex] = updated;
    saveServerContacts(allContacts);
    return { contact: updated, isNew: false };
  } else {
    // Create new contact
    const newId = input.organization_type === "ministry" 
      ? `min_${Date.now()}` 
      : `lg_custom_${Date.now()}`;

    const newContact: GovernmentContact = {
      id: newId,
      organization_type: input.organization_type,
      ministry_id: input.ministry_id || (input.organization_type === "ministry" ? newId : undefined),
      district_id: input.district_id || undefined,
      local_government_id: input.local_government_id || (input.organization_type === "local_government" ? newId : undefined),
      organization_name_ne: input.organization_name_ne.trim(),
      organization_name_en: input.organization_name_en?.trim() || "",
      official_email: cleanEmail,
      official_phone: cleanPhone,
      office_address: input.office_address?.trim() || "कोशी प्रदेश",
      is_active: true,
      is_verified: true,
      created_at: now,
      updated_at: now
    };

    allContacts.unshift(newContact);
    saveServerContacts(allContacts);
    return { contact: newContact, isNew: true };
  }
}

/**
 * Delete a contact by id
 */
export function deleteServerContact(id: string): boolean {
  const all = [...getServerContacts()];
  const filtered = all.filter((c) => c.id !== id && c.ministry_id !== id && c.local_government_id !== id);
  if (filtered.length !== all.length) {
    saveServerContacts(filtered);
    return true;
  }
  return false;
}

/**
 * Find contact for complaint routing
 */
export function findServerContactByRecipient(
  type: "ministry" | "local_government",
  id: string,
  districtId?: string
): GovernmentContact | undefined {
  const allContacts = getServerContacts();

  if (type === "ministry") {
    return allContacts.find(
      (c) => c.organization_type === "ministry" && (c.ministry_id === id || c.id === id)
    );
  } else {
    // Match by local_government_id or custom ID
    let found = allContacts.find(
      (c) => c.organization_type === "local_government" && (c.local_government_id === id || c.id === id)
    );
    if (!found && districtId) {
      found = allContacts.find(
        (c) => c.organization_type === "local_government" && c.district_id === districtId && (c.local_government_id === id || c.id === id)
      );
    }
    return found;
  }
}
