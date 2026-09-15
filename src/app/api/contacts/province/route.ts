import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ProvinceContact, DEFAULT_PROVINCE_CONTACTS } from "@/lib/contactService";

const PROVINCE_DB_PATH = path.join(process.cwd(), "src", "lib", "province_contacts_db.json");

function getStoredContacts(): ProvinceContact[] {
  try {
    if (fs.existsSync(PROVINCE_DB_PATH)) {
      const raw = fs.readFileSync(PROVINCE_DB_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading province_contacts_db.json:", err);
  }
  return DEFAULT_PROVINCE_CONTACTS;
}

function saveStoredContacts(contacts: ProvinceContact[]): boolean {
  try {
    fs.writeFileSync(PROVINCE_DB_PATH, JSON.stringify(contacts, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing province_contacts_db.json:", err);
    return false;
  }
}

export async function GET() {
  const contacts = getStoredContacts();
  return NextResponse.json({ success: true, contacts });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id || (id !== "ministry_koshi" && id !== "nfdn_koshi")) {
      return NextResponse.json(
        { error: "अमान्य प्रदेश सम्पर्क ID (ministry_koshi वा nfdn_koshi हुनुपर्छ)" },
        { status: 400 }
      );
    }

    const currentContacts = getStoredContacts();
    const updated = currentContacts.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          ...updates,
          updated_at: new Date().toLocaleDateString("ne-NP"),
        };
      }
      return c;
    });

    saveStoredContacts(updated);

    return NextResponse.json({
      success: true,
      message: "प्रदेश सम्पर्क विवरण सफलतापूर्वक सुरक्षित गरियो।",
      contacts: updated
    });
  } catch (error) {
    console.error("POST /api/contacts/province error:", error);
    return NextResponse.json(
      { error: "प्रदेश सम्पर्क विवरण सुरक्षित गर्न सकिएन।" },
      { status: 500 }
    );
  }
}
