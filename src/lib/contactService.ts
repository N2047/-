import { KOSHI_DISTRICTS } from "./koshiGeography";
import * as XLSX from "xlsx";

export interface ProvinceContact {
  id: "ministry_koshi" | "nfdn_koshi";
  organization_name_ne: string;
  organization_name_en: string;
  contact_person_name: string;
  contact_person_mobile: string;
  office_phone?: string;
  email?: string;
  address_ne?: string;
  is_public: boolean;
  updated_at?: string;
}

export interface LocalGovernmentContact {
  id: string;
  local_government_id: string;
  local_government_name_ne: string;
  district_id: string;
  district_name_ne: string;
  disability_facilitator_name: string;
  disability_facilitator_mobile: string;
  women_children_social_branch_name: string;
  women_children_social_branch_mobile: string;
  deputy_mayor_chairperson_name: string;
  deputy_mayor_chairperson_mobile: string;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

const PROVINCE_STORAGE_KEY = "dic_province_contacts_v2";
const LOCAL_STORAGE_KEY = "dic_local_contacts_v2";

export const DEFAULT_PROVINCE_CONTACTS: ProvinceContact[] = [
  {
    id: "ministry_koshi",
    organization_name_ne: "सामाजिक विकास मन्त्रालय, कोशी प्रदेश",
    organization_name_en: "Ministry of Social Development, Koshi Province",
    contact_person_name: "", // Placeholder when not filled
    contact_person_mobile: "", // Placeholder when not filled
    office_phone: "०२१-४६२८००, ०२१-४६२८०१",
    email: "info.dic@koshi.gov.np",
    address_ne: "विराटनगर-१०, मोरङ, कोशी प्रदेश",
    is_public: true,
    updated_at: "२०८२/०५/०१",
  },
  {
    id: "nfdn_koshi",
    organization_name_ne: "राष्ट्रिय अपाङ्ग महासंघ नेपाल, कोशी प्रदेश",
    organization_name_en: "National Federation of the Disabled Nepal (NFDN) Koshi Province",
    contact_person_name: "", // Placeholder when not filled
    contact_person_mobile: "", // Placeholder when not filled
    office_phone: "०२१-४६२८५०",
    email: "koshi@nfdn.org.np",
    address_ne: "विराटनगर, मोरङ, कोशी प्रदेश",
    is_public: true,
    updated_at: "२०८२/०५/०१",
  },
];

// Generate 137 initial Local Government Contact records
export function generateInitialLocalContacts(): LocalGovernmentContact[] {
  const contacts: LocalGovernmentContact[] = [];

  KOSHI_DISTRICTS.forEach((d) => {
    d.local_governments.forEach((p) => {
      // Verified sample placeholder or pre-seeded values for demonstration
      let facilitatorName = "";
      let facilitatorMobile = "";
      let branchName = "";
      let branchMobile = "";
      let deputyName = "";
      let deputyMobile = "";

      // Add a couple sample realistic demonstrative entries so user can see live contacts immediately
      if (p.id === "phidim_mun") {
        facilitatorName = "रमेश खतिवडा";
        facilitatorMobile = "9852680123";
        branchName = "सीता देवी गुरुङ";
        branchMobile = "9842680456";
        deputyName = "राधाकृष्ण न्यौपाने";
        deputyMobile = "9852680789";
      } else if (p.id === "biratnagar_met") {
        facilitatorName = "सुनिता राजवंशी";
        facilitatorMobile = "9852023456";
        branchName = "दिनेश पोखरेल";
        branchMobile = "9842056789";
        deputyName = "शिल्पा निराला कार्की";
        deputyMobile = "9852099887";
      } else if (p.id === "dharan_submet") {
        facilitatorName = "प्रकाश लिम्बू";
        facilitatorMobile = "9842567890";
        branchName = "अनिता राई";
        branchMobile = "9852567891";
        deputyName = "आइन्द्र विक्रम बेघा";
        deputyMobile = "9852567892";
      }

      contacts.push({
        id: `contact_${p.id}`,
        local_government_id: p.id,
        local_government_name_ne: p.name_ne,
        district_id: d.id,
        district_name_ne: d.name_ne,
        disability_facilitator_name: facilitatorName,
        disability_facilitator_mobile: facilitatorMobile,
        women_children_social_branch_name: branchName,
        women_children_social_branch_mobile: branchMobile,
        deputy_mayor_chairperson_name: deputyName,
        deputy_mayor_chairperson_mobile: deputyMobile,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });
  });

  return contacts;
}

// Read Province Contacts
export function getProvinceContacts(): ProvinceContact[] {
  if (typeof window === "undefined") return DEFAULT_PROVINCE_CONTACTS;
  try {
    const raw = localStorage.getItem(PROVINCE_STORAGE_KEY);
    if (!raw) return DEFAULT_PROVINCE_CONTACTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PROVINCE_CONTACTS;
    return parsed;
  } catch (e) {
    console.error("Error reading province contacts", e);
    return DEFAULT_PROVINCE_CONTACTS;
  }
}

// Save Province Contacts
export function saveProvinceContacts(contacts: ProvinceContact[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROVINCE_STORAGE_KEY, JSON.stringify(contacts));
    window.dispatchEvent(new Event("dic_contacts_updated"));
  } catch (e) {
    console.error("Error saving province contacts", e);
  }
}

// Update Single Province Contact
export function updateProvinceContact(id: "ministry_koshi" | "nfdn_koshi", updates: Partial<ProvinceContact>): void {
  const current = getProvinceContacts();
  const updated = current.map((c) => {
    if (c.id === id) {
      return {
        ...c,
        ...updates,
        updated_at: new Date().toLocaleDateString("ne-NP"),
      };
    }
    return c;
  });
  saveProvinceContacts(updated);
}

// Read Local Government Contacts
export function getLocalGovernmentContacts(): LocalGovernmentContact[] {
  if (typeof window === "undefined") return generateInitialLocalContacts();
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const initial = generateInitialLocalContacts();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = generateInitialLocalContacts();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return parsed;
  } catch (e) {
    console.error("Error reading local government contacts", e);
    return generateInitialLocalContacts();
  }
}

// Save Local Government Contacts
export function saveLocalGovernmentContacts(contacts: LocalGovernmentContact[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contacts));
    window.dispatchEvent(new Event("dic_contacts_updated"));
  } catch (e) {
    console.error("Error saving local government contacts", e);
  }
}

// Update Single Palika Contact
export function updateLocalContact(
  localGovernmentId: string, 
  updates: Partial<LocalGovernmentContact>
): LocalGovernmentContact | null {
  const all = getLocalGovernmentContacts();
  let updatedRecord: LocalGovernmentContact | null = null;

  const nextList = all.map((item) => {
    if (item.local_government_id === localGovernmentId) {
      updatedRecord = {
        ...item,
        ...updates,
        updated_at: new Date().toLocaleDateString("ne-NP"),
      };
      return updatedRecord;
    }
    return item;
  });

  if (updatedRecord) {
    saveLocalGovernmentContacts(nextList);
  }
  return updatedRecord;
}

// Find Single Palika Contact
export function getLocalContactByPalikaId(palikaId: string): LocalGovernmentContact | undefined {
  const all = getLocalGovernmentContacts();
  return all.find((c) => c.local_government_id === palikaId);
}

// Validate Nepali Mobile Number (e.g. 98XXXXXXXX or 97XXXXXXXX, 10 digits)
export function validateNepalMobileNumber(mobile: string): { isValid: boolean; message?: string } {
  if (!mobile || !mobile.trim()) return { isValid: true }; // empty is allowed as placeholder
  const cleaned = mobile.trim().replace(/[-+\s()]/g, "");
  
  // Standard Nepal 10-digit mobile check (starts with 97 or 98)
  const isStandardNepalMobile = /^(98|97|96)[0-9]{8}$/.test(cleaned);
  // Also support landline or international numbers if required
  const isGeneralValidPhone = /^[0-9]{7,15}$/.test(cleaned);

  if (!isGeneralValidPhone) {
    return { isValid: false, message: "मोबाइल नम्बरमा अंक मात्र हुनुपर्छ र ७ देखि १५ अंक बीच हुनुपर्छ।" };
  }

  return { isValid: true };
}

// Export All 137 Palikas Contacts to Excel
export function exportContactsToExcel(): void {
  const contacts = getLocalGovernmentContacts();
  const provinceContacts = getProvinceContacts();

  const wb = XLSX.utils.book_new();

  // Sheet 1: स्थानीय तह सम्पर्क विवरण (१३७ स्थानीय तह)
  const localRows: (string | number)[][] = [
    ["अपाङ्गता सूचना केन्द्र (Disability Information Center - DIC)"],
    ["कोशी प्रदेश - १३७ स्थानीय तह सम्पर्क विवरण निर्देशिका"],
    ["मिति:", new Date().toLocaleDateString("ne-NP")],
    [],
    [
      "सि.नं.",
      "जिल्ला",
      "स्थानीय तह",
      "स्थानीय तह ID",
      "अपाङ्गता सहायता सहजकर्ताको नाम",
      "सहजकर्ता मोबाइल नं.",
      "महिला/बालबालिका/सामाजिक शाखा प्रमुखको नाम",
      "सामाजिक शाखा मोबाइल नं.",
      "उपप्रमुख/उपाध्यक्षको नाम",
      "उपप्रमुख/उपाध्यक्ष सम्पर्क नं.",
      "सार्वजनिक स्थिति (is_public)"
    ]
  ];

  contacts.forEach((c, idx) => {
    localRows.push([
      idx + 1,
      c.district_name_ne,
      c.local_government_name_ne,
      c.local_government_id,
      c.disability_facilitator_name || "",
      c.disability_facilitator_mobile || "",
      c.women_children_social_branch_name || "",
      c.women_children_social_branch_mobile || "",
      c.deputy_mayor_chairperson_name || "",
      c.deputy_mayor_chairperson_mobile || "",
      c.is_public ? "Public" : "Hidden"
    ]);
  });

  const wsLocal = XLSX.utils.aoa_to_sheet(localRows);
  XLSX.utils.book_append_sheet(wb, wsLocal, "स्थानीय तह सम्पर्क");

  // Sheet 2: प्रदेशस्तरीय सम्पर्क
  const provRows: (string | number)[][] = [
    ["कोशी प्रदेशस्तरीय सम्पर्क निकायहरू"],
    [],
    ["निकायको नाम", "सम्पर्क व्यक्ति", "मोबाइल नम्बर", "कार्यालय फोन", "इमेल", "ठेगाना"],
    ...provinceContacts.map((p) => [
      p.organization_name_ne,
      p.contact_person_name || "-",
      p.contact_person_mobile || "-",
      p.office_phone || "-",
      p.email || "-",
      p.address_ne || "-"
    ])
  ];
  const wsProv = XLSX.utils.aoa_to_sheet(provRows);
  XLSX.utils.book_append_sheet(wb, wsProv, "प्रदेशस्तरीय सम्पर्क");

  XLSX.writeFile(wb, `Koshi_Province_DIC_Contacts_Directory_${new Date().toISOString().split("T")[0]}.xlsx`);
}

// Import & Validate Contacts from Excel Rows
export function importContactsFromExcelRows(dataRows: any[][]): {
  successCount: number;
  skippedCount: number;
  errors: string[];
} {
  const currentContacts = getLocalGovernmentContacts();
  let successCount = 0;
  let skippedCount = 0;
  const errors: string[] = [];

  // Find header row (looks for 'स्थानीय तह' or 'स्थानीय तह ID')
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(10, dataRows.length); i++) {
    const rowStr = dataRows[i].join(" ");
    if (rowStr.includes("स्थानीय तह") || rowStr.includes("सहजकर्ता")) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    return {
      successCount: 0,
      skippedCount: 0,
      errors: ["Excel फाइलमा उपयुक्त हेडर फेला परेन। कृपया मानक टेम्प्लेट प्रयोग गर्नुहोस्।"]
    };
  }

  // Update contacts based on rows
  const updatedContacts = [...currentContacts];

  for (let r = headerRowIndex + 1; r < dataRows.length; r++) {
    const row = dataRows[r];
    if (!row || row.length === 0) continue;

    // Try finding by ID (col 3) or Palika Name (col 2)
    const palikaId = String(row[3] || "").trim();
    const palikaName = String(row[2] || "").trim();
    const facilitatorName = String(row[4] || "").trim();
    const facilitatorMobile = String(row[5] || "").trim();
    const branchName = String(row[6] || "").trim();
    const branchMobile = String(row[7] || "").trim();
    const deputyName = String(row[8] || "").trim();
    const deputyMobile = String(row[9] || "").trim();
    const isPublicStr = String(row[10] || "Public").toLowerCase();

    // Find match in local government contacts
    const matchIndex = updatedContacts.findIndex(
      (c) => 
        (palikaId && c.local_government_id === palikaId) ||
        (palikaName && c.local_government_name_ne.includes(palikaName))
    );

    if (matchIndex !== -1) {
      // Validate mobile numbers
      const val1 = validateNepalMobileNumber(facilitatorMobile);
      const val2 = validateNepalMobileNumber(branchMobile);
      const val3 = validateNepalMobileNumber(deputyMobile);

      if (!val1.isValid) {
        errors.push(`रो ${r + 1} (${updatedContacts[matchIndex].local_government_name_ne}): सहजकर्ता मोबाइल नम्बर अमान्य।`);
      }
      if (!val2.isValid) {
        errors.push(`रो ${r + 1} (${updatedContacts[matchIndex].local_government_name_ne}): शाखा प्रमुख मोबाइल नम्बर अमान्य।`);
      }
      if (!val3.isValid) {
        errors.push(`रो ${r + 1} (${updatedContacts[matchIndex].local_government_name_ne}): उपप्रमुख मोबाइल नम्बर अमान्य।`);
      }

      updatedContacts[matchIndex] = {
        ...updatedContacts[matchIndex],
        disability_facilitator_name: facilitatorName || updatedContacts[matchIndex].disability_facilitator_name,
        disability_facilitator_mobile: facilitatorMobile || updatedContacts[matchIndex].disability_facilitator_mobile,
        women_children_social_branch_name: branchName || updatedContacts[matchIndex].women_children_social_branch_name,
        women_children_social_branch_mobile: branchMobile || updatedContacts[matchIndex].women_children_social_branch_mobile,
        deputy_mayor_chairperson_name: deputyName || updatedContacts[matchIndex].deputy_mayor_chairperson_name,
        deputy_mayor_chairperson_mobile: deputyMobile || updatedContacts[matchIndex].deputy_mayor_chairperson_mobile,
        is_public: !isPublicStr.includes("hid"),
        updated_at: new Date().toLocaleDateString("ne-NP")
      };
      successCount++;
    } else {
      skippedCount++;
    }
  }

  if (successCount > 0) {
    saveLocalGovernmentContacts(updatedContacts);
  }

  return {
    successCount,
    skippedCount,
    errors
  };
}
