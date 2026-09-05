import { KOSHI_DISTRICTS, findPalikaById } from "./koshiGeography";
import * as XLSX from "xlsx";

export type ComplaintType = "identified" | "anonymous";
export type RecipientType = "ministry" | "local_government";

export type ComplaintStatus = 
  | "नयाँ"
  | "सम्बन्धित निकायमा पठाइएको"
  | "हेर्दै गरिएको"
  | "समाधान प्रक्रियामा"
  | "समाधान भएको"
  | "अस्वीकृत"
  | "थप विवरण आवश्यक";

export const COMPLAINT_SUBJECTS = [
  "अपाङ्गता परिचयपत्र",
  "सामाजिक सुरक्षा",
  "सहायक सामग्री",
  "शिक्षा",
  "स्वास्थ्य",
  "रोजगार",
  "पहुँचयुक्तता",
  "सेवा प्रवाह",
  "स्थानीय तहको सेवा",
  "सरकारी कार्यक्रम",
  "कर्मचारी सम्बन्धी",
  "अपाङ्गता अधिकार",
  "अन्य"
] as const;

export type ComplaintSubject = typeof COMPLAINT_SUBJECTS[number];

export interface GovernmentContact {
  id: string;
  organization_type: "ministry" | "local_government" | "provincial_office";
  ministry_id?: string;
  district_id?: string;
  local_government_id?: string;
  organization_name_ne: string;
  organization_name_en?: string;
  official_email: string;
  official_phone: string;
  office_address: string;
  is_active: boolean;
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AttachmentData {
  id: string;
  file_type: "document" | "image" | "video";
  file_name: string;
  mime_type: string;
  file_size: number;
  data_url?: string;
  storage_path?: string;
}

export interface Complaint {
  id: string;
  complaint_number: string; // e.g. DIC-2026-000001
  complaint_type: ComplaintType;
  
  // Identified fields
  full_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  
  // Routing Destination
  recipient_type: RecipientType;
  ministry_id?: string;
  district_id?: string;
  local_government_id?: string;
  organization_name: string;
  official_recipient_email: string;
  official_recipient_phone: string;
  
  // Content
  subject: ComplaintSubject;
  other_subject?: string;
  description: string;
  attachments: AttachmentData[];
  
  // Status & Administration
  status: ComplaintStatus;
  admin_remarks?: string;
  
  // Email Routing Status
  email_status: "pending" | "sent" | "failed";
  mandatory_cc_email: string;
  email_sent_at?: string;
  email_error?: string;
  retry_count: number;
  
  created_at: string;
  updated_at: string;
}

export interface GrievanceSettings {
  mandatory_cc_email: string;
  is_mandatory_cc_active: boolean;
  allow_anonymous: boolean;
  max_doc_size_mb: number;
  max_img_size_mb: number;
  max_video_size_mb: number;
  allowed_doc_formats: string[];
  smtp_configured?: boolean;
}

// Default Settings
export const DEFAULT_GRIEVANCE_SETTINGS: GrievanceSettings = {
  mandatory_cc_email: "grievance.mosd@koshi.gov.np",
  is_mandatory_cc_active: true,
  allow_anonymous: true,
  max_doc_size_mb: 10,
  max_img_size_mb: 8,
  max_video_size_mb: 30,
  allowed_doc_formats: ["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png"],
};

// Seed Koshi Province Ministries
export const INITIAL_KOSHI_MINISTRIES: GovernmentContact[] = [
  {
    id: "min_mosd",
    organization_type: "ministry",
    ministry_id: "mosd_koshi",
    organization_name_ne: "सामाजिक विकास मन्त्रालय, कोशी प्रदेश",
    organization_name_en: "Ministry of Social Development, Koshi Province",
    official_email: "grievance.mosd@koshi.gov.np",
    official_phone: "०२१-४६२८००, ०२१-४६२८०१",
    office_address: "विराटनगर-१०, मोरङ, कोशी प्रदेश",
    is_active: true,
    is_verified: true,
  },
  {
    id: "min_health",
    organization_type: "ministry",
    ministry_id: "moh_koshi",
    organization_name_ne: "स्वास्थ्य मन्त्रालय, कोशी प्रदेश",
    organization_name_en: "Ministry of Health, Koshi Province",
    official_email: "info.health@koshi.gov.np",
    official_phone: "०२१-४६३२००, ०२१-४६३२०१",
    office_address: "विराटनगर, मोरङ, कोशी प्रदेश",
    is_active: true,
    is_verified: true,
  },
  {
    id: "min_moia",
    organization_type: "ministry",
    ministry_id: "moia_koshi",
    organization_name_ne: "आन्तरिक मामिला तथा कानुन मन्त्रालय, कोशी प्रदेश",
    organization_name_en: "Ministry of Internal Affairs and Law, Koshi Province",
    official_email: "info.moial@koshi.gov.np",
    official_phone: "०२१-४६२९१०",
    office_address: "विराटनगर, मोरङ, कोशी प्रदेश",
    is_active: true,
    is_verified: true,
  },
  {
    id: "min_mopid",
    organization_type: "ministry",
    ministry_id: "mopid_koshi",
    organization_name_ne: "भौतिक पूर्वाधार विकास मन्त्रालय, कोशी प्रदेश",
    organization_name_en: "Ministry of Physical Infrastructure Development, Koshi Province",
    official_email: "info.mopid@koshi.gov.np",
    official_phone: "०२१-४६२५५०",
    office_address: "विराटनगर, मोरङ, कोशी प्रदेश",
    is_active: true,
    is_verified: true,
  },
  {
    id: "min_moea",
    organization_type: "ministry",
    ministry_id: "moea_koshi",
    organization_name_ne: "आर्थिक मामिला तथा योजना मन्त्रालय, कोशी प्रदेश",
    organization_name_en: "Ministry of Economic Affairs and Planning, Koshi Province",
    official_email: "info.moeap@koshi.gov.np",
    official_phone: "०२१-४६११००",
    office_address: "विराटनगर, मोरङ, कोशी प्रदेश",
    is_active: true,
    is_verified: true,
  },
  {
    id: "min_moald",
    organization_type: "ministry",
    ministry_id: "moald_koshi",
    organization_name_ne: "उद्योग, कृषि तथा सहकारी मन्त्रालय, कोशी प्रदेश",
    organization_name_en: "Ministry of Industry, Agriculture and Cooperatives, Koshi Province",
    official_email: "info.moald@koshi.gov.np",
    official_phone: "०२१-४६२७००",
    office_address: "विराटनगर, मोरङ, कोशी प्रदेश",
    is_active: true,
    is_verified: true,
  },
  {
    id: "min_mowrie",
    organization_type: "ministry",
    ministry_id: "mowrie_koshi",
    organization_name_ne: "खानेपानी, सिँचाइ तथा ऊर्जा मन्त्रालय, कोशी प्रदेश",
    organization_name_en: "Ministry of Water Resources, Irrigation and Energy, Koshi Province",
    official_email: "info.mowrie@koshi.gov.np",
    official_phone: "०२१-४६२१५०",
    office_address: "विराटनगर, मोरङ, कोशी प्रदेश",
    is_active: true,
    is_verified: true,
  },
  {
    id: "min_mofe",
    organization_type: "ministry",
    ministry_id: "mofe_koshi",
    organization_name_ne: "पर्यटन, वन तथा वातावरण मन्त्रालय, कोशी प्रदेश",
    organization_name_en: "Ministry of Tourism, Forests and Environment, Koshi Province",
    official_email: "info.mofe@koshi.gov.np",
    official_phone: "०२१-४६०३५०",
    office_address: "विराटनगर, मोरङ, कोशी प्रदेश",
    is_active: true,
    is_verified: true,
  },
  {
    id: "min_ocmcm",
    organization_type: "ministry",
    ministry_id: "ocmcm_koshi",
    organization_name_ne: "मुख्यमन्त्री तथा मन्त्रिपरिषद्को कार्यालय, कोशी प्रदेश",
    organization_name_en: "Office of the Chief Minister and Council of Ministers, Koshi Province",
    official_email: "info@ocmcm.koshi.gov.np",
    official_phone: "०२१-४६२४४४",
    office_address: "विराटनगर, मोरङ, कोशी प्रदेश",
    is_active: true,
    is_verified: true,
  },
  {
    id: "min_pa",
    organization_type: "ministry",
    ministry_id: "pa_koshi",
    organization_name_ne: "प्रदेश सभा सचिवालय, कोशी प्रदेश",
    organization_name_en: "Provincial Assembly Secretariat, Koshi Province",
    official_email: "info@pradeshsabha.koshi.gov.np",
    official_phone: "०२१-४६०४५०",
    office_address: "विराटनगर, मोरङ, कोशी प्रदेश",
    is_active: true,
    is_verified: true,
  },
];

// Generate Initial 137 Local Government Master Contacts
export function generateInitialLocalGovContacts(): GovernmentContact[] {
  const contacts: GovernmentContact[] = [];

  KOSHI_DISTRICTS.forEach((d) => {
    d.local_governments.forEach((p) => {
      // Standardized official email pattern for local government
      const cleanSlug = p.name_en
        .toLowerCase()
        .replace(/ rural municipality| municipality| sub-metropolitan city| metropolitan city/g, "")
        .replace(/[^a-z0-9]/g, "");

      contacts.push({
        id: `lg_${p.id}`,
        organization_type: "local_government",
        district_id: d.id,
        local_government_id: p.id,
        organization_name_ne: `${p.name_ne}, ${d.name_ne}`,
        organization_name_en: `${p.name_en}, ${d.name_en}`,
        official_email: `ito.${cleanSlug}mun@gmail.com`,
        official_phone: "०२१-५२XXXX, ०२३-४XXXXX",
        office_address: `${p.name_ne}, ${d.name_ne}, कोशी प्रदेश`,
        is_active: true,
        is_verified: true,
      });
    });
  });

  return contacts;
}

// STORAGE KEYS
const SETTINGS_KEY = "dic_grievance_settings_v1";
const GOV_CONTACTS_KEY = "dic_government_contacts_v1";
const COMPLAINTS_KEY = "dic_complaints_v1";
const COMPLAINT_COUNTER_KEY = "dic_complaint_seq_v1";

// 1. SETTINGS METHODS
export function getGrievanceSettings(): GrievanceSettings {
  if (typeof window === "undefined") return DEFAULT_GRIEVANCE_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_GRIEVANCE_SETTINGS;
    return { ...DEFAULT_GRIEVANCE_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error("Failed to load grievance settings", e);
    return DEFAULT_GRIEVANCE_SETTINGS;
  }
}

export function saveGrievanceSettings(settings: GrievanceSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("dic_grievance_settings_updated", { detail: settings }));
  } catch (e) {
    console.error("Failed to save grievance settings", e);
  }
}

// 2. GOVERNMENT CONTACTS METHODS
export function getGovernmentContacts(): GovernmentContact[] {
  if (typeof window === "undefined") {
    return [...INITIAL_KOSHI_MINISTRIES, ...generateInitialLocalGovContacts()];
  }
  try {
    const raw = localStorage.getItem(GOV_CONTACTS_KEY);
    if (!raw) {
      const initial = [...INITIAL_KOSHI_MINISTRIES, ...generateInitialLocalGovContacts()];
      localStorage.setItem(GOV_CONTACTS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = [...INITIAL_KOSHI_MINISTRIES, ...generateInitialLocalGovContacts()];
      localStorage.setItem(GOV_CONTACTS_KEY, JSON.stringify(initial));
      return initial;
    }
    return parsed;
  } catch (e) {
    console.error("Failed to load government contacts", e);
    return [...INITIAL_KOSHI_MINISTRIES, ...generateInitialLocalGovContacts()];
  }
}

export function saveGovernmentContacts(contacts: GovernmentContact[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GOV_CONTACTS_KEY, JSON.stringify(contacts));
    window.dispatchEvent(new CustomEvent("dic_gov_contacts_updated", { detail: contacts }));
  } catch (e) {
    console.error("Failed to save government contacts", e);
  }
}

// Find contact by Ministry ID or Local Government ID
export function findContactByRecipient(
  type: RecipientType,
  id: string
): GovernmentContact | undefined {
  const allContacts = getGovernmentContacts();
  if (type === "ministry") {
    return allContacts.find((c) => c.organization_type === "ministry" && (c.ministry_id === id || c.id === id));
  } else {
    return allContacts.find(
      (c) => c.organization_type === "local_government" && (c.local_government_id === id || c.id === id)
    );
  }
}

// 3. COMPLAINTS MANAGEMENT
export function generateComplaintNumber(): string {
  const year = new Date().getFullYear();
  let seq = 1;

  if (typeof window !== "undefined") {
    try {
      const current = localStorage.getItem(COMPLAINT_COUNTER_KEY);
      if (current) {
        seq = parseInt(current, 10) + 1;
      }
      localStorage.setItem(COMPLAINT_COUNTER_KEY, seq.toString());
    } catch (e) {
      seq = Math.floor(1000 + Math.random() * 9000);
    }
  } else {
    seq = Math.floor(1000 + Math.random() * 9000);
  }

  const paddedSeq = seq.toString().padStart(6, "0");
  return `DIC-${year}-${paddedSeq}`;
}

export function getComplaints(): Complaint[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COMPLAINTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load complaints", e);
    return [];
  }
}

export function saveComplaint(complaint: Complaint): void {
  if (typeof window === "undefined") return;
  try {
    const list = getComplaints();
    const existingIndex = list.findIndex((c) => c.id === complaint.id || c.complaint_number === complaint.complaint_number);

    if (existingIndex >= 0) {
      list[existingIndex] = complaint;
    } else {
      list.unshift(complaint);
    }

    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("dic_complaints_updated", { detail: list }));
  } catch (e) {
    console.error("Failed to save complaint", e);
  }
}

export function updateComplaintStatus(
  complaintId: string,
  newStatus: ComplaintStatus,
  adminRemarks?: string
): Complaint | null {
  const list = getComplaints();
  const complaint = list.find((c) => c.id === complaintId || c.complaint_number === complaintId);
  if (!complaint) return null;

  complaint.status = newStatus;
  if (adminRemarks !== undefined) {
    complaint.admin_remarks = adminRemarks;
  }
  complaint.updated_at = new Date().toISOString();

  saveComplaint(complaint);
  return complaint;
}

export function findComplaintByNumber(complaintNumber: string): Complaint | undefined {
  const list = getComplaints();
  const cleanNumber = complaintNumber.trim().toUpperCase();
  return list.find((c) => c.complaint_number.toUpperCase() === cleanNumber);
}

// 4. EXCEL IMPORT / EXPORT FOR MASTER CONTACT DATA
export interface ExcelContactRow {
  प्रकार: string;
  जिल्ला: string;
  स्थानीय_तह_वा_मन्त्रालय: string;
  आधिकारिक_Email: string;
  आधिकारिक_फोन: string;
  ठेगाना?: string;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePhone(phone: string): boolean {
  const clean = phone.replace(/[^0-9०-९]/g, "");
  return clean.length >= 7;
}

export function parseContactsExcel(fileBuffer: ArrayBuffer): {
  validContacts: GovernmentContact[];
  errors: string[];
  totalRows: number;
} {
  const wb = XLSX.read(fileBuffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(ws);

  const validContacts: GovernmentContact[] = [];
  const errors: string[] = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const typeStr = (row["प्रकार"] || row["Type"] || "").toString().trim().toLowerCase();
    const districtStr = (row["जिल्ला"] || row["District"] || "").toString().trim();
    const nameStr = (row["स्थानीय_तह_वा_मन्त्रालय"] || row["कार्यालय/मन्त्रालय"] || row["Name"] || "").toString().trim();
    const emailStr = (row["आधिकारिक_Email"] || row["Email"] || "").toString().trim();
    const phoneStr = (row["आधिकारिक_फोन"] || row["Phone"] || "").toString().trim();
    const addressStr = (row["ठेगाना"] || row["Address"] || "").toString().trim();

    if (!nameStr) {
      errors.push(`पङ्क्ति ${rowNum}: कार्यालय/मन्त्रालयको नाम खाली छ।`);
      return;
    }

    if (!emailStr || !validateEmail(emailStr)) {
      errors.push(`पङ्क्ति ${rowNum} (${nameStr}): अमान्य इमेल ढाँचा "${emailStr}"।`);
      return;
    }

    if (!phoneStr || !validatePhone(phoneStr)) {
      errors.push(`पङ्क्ति ${rowNum} (${nameStr}): अमान्य फोन नम्बर "${phoneStr}"।`);
      return;
    }

    const isMinistry = typeStr.includes("मन्त्रालय") || typeStr.includes("ministry");

    let palikaId: string | undefined = undefined;
    let districtId: string | undefined = undefined;

    if (!isMinistry) {
      // Find matching district and palika
      const matchedDistrict = KOSHI_DISTRICTS.find(
        (d) => d.name_ne.includes(districtStr) || districtStr.includes(d.name_ne)
      );
      if (matchedDistrict) {
        districtId = matchedDistrict.id;
        const matchedPalika = matchedDistrict.local_governments.find(
          (p) => p.name_ne.includes(nameStr) || nameStr.includes(p.name_ne)
        );
        if (matchedPalika) {
          palikaId = matchedPalika.id;
        }
      }
    }

    validContacts.push({
      id: isMinistry ? `min_custom_${Date.now()}_${idx}` : `lg_${palikaId || `custom_${idx}`}`,
      organization_type: isMinistry ? "ministry" : "local_government",
      ministry_id: isMinistry ? `custom_${idx}` : undefined,
      district_id: districtId,
      local_government_id: palikaId,
      organization_name_ne: nameStr,
      official_email: emailStr,
      official_phone: phoneStr,
      office_address: addressStr || (districtStr ? `${nameStr}, ${districtStr}` : nameStr),
      is_active: true,
      is_verified: true,
    });
  });

  return {
    validContacts,
    errors,
    totalRows: rows.length,
  };
}

export function exportGovernmentContactsToExcel(contacts: GovernmentContact[]): void {
  const data = contacts.map((c) => ({
    "प्रकार": c.organization_type === "ministry" ? "मन्त्रालय/निकाय" : "स्थानीय तह",
    "जिल्ला": c.district_id ? KOSHI_DISTRICTS.find((d) => d.id === c.district_id)?.name_ne || c.district_id : "कोशी प्रदेश",
    "कार्यालय/मन्त्रालय": c.organization_name_ne,
    "आधिकारिक Email": c.official_email,
    "आधिकारिक फोन": c.official_phone,
    "कार्यालयको ठेगाना": c.office_address,
    "स्थिति": c.is_active ? "सक्रिय" : "निष्क्रिय",
    "प्रमाणीकरण": c.is_verified ? "Verified" : "Unverified",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "सरकारी सम्पर्क विवरण");
  XLSX.writeFile(wb, `DIC_Government_Contacts_${new Date().toISOString().split("T")[0]}.xlsx`);
}
