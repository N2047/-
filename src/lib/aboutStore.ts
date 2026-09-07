import fs from "fs";
import path from "path";
import { AboutSection, AboutSectionInput } from "@/types/about";
import { logAuditEvent } from "./authStore";

const ABOUT_DB_PATH = path.join(process.cwd(), "src", "lib", "about_db.json");

let inMemoryAboutSections: AboutSection[] | null = null;

// Initial fallback seed in case file reading fails on cold start
const DEFAULT_ABOUT_SECTIONS: AboutSection[] = [
  {
    id: "sec-hero-01",
    section_type: "hero",
    title_ne: "अपाङ्गता सूचना केन्द्र (DIC) को बारेमा",
    title_en: "About Disability Information Center (DIC)",
    subtitle_ne: "कोशी प्रदेश तथा नेपालमा अपाङ्गता सम्बन्धी कानुन, नीति, तथ्यांक र स्थानीय तह कार्यसम्पादनको एकीकृत डिजिटल भण्डार।",
    subtitle_en: "Integrated digital repository for disability laws, policies, data, and local government performance in Koshi Province and Nepal.",
    badge_ne: "संस्थागत परिचय",
    badge_en: "Institutional Profile",
    content_ne: "अपाङ्गता सूचना केन्द्र (DIC) नेपाल सरकार तथा कोशी प्रदेश सरकार मातहत अपाङ्गता क्षेत्रका सम्पूर्ण कानुनी दस्ताबेज, स्थानीय तहको वार्षिक प्रतिवेदन र तथ्यांक व्यवस्थापनलाई पारदर्शी, सुरक्षित र पहुँचयोग्य बनाउने एकीकृत डिजिटल पूर्वाधार हो।",
    content_en: "The Disability Information Center (DIC) is an integrated digital infrastructure operating under the Government of Nepal and Koshi Province Government to ensure disability-related legal archives, municipal annual reports, and demographic data management are transparent, secure, and fully accessible.",
    icon: "Award",
    image_url: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80",
    image_alt_ne: "अपाङ्गता सूचना केन्द्र परिचय तस्बिर",
    image_alt_en: "Disability Information Center Overview Image",
    status: "published",
    display_order: 1,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    created_by: "मुख्य प्रशासक (Super Admin)",
    updated_by: "मुख्य प्रशासक (Super Admin)",
    deleted_at: null
  },
  {
    id: "sec-vision-02",
    section_type: "vision_mandate",
    title_ne: "परिकल्पना तथा मुख्य उद्देश्यहरू (Vision & Core Mandate)",
    title_en: "Vision & Core Mandate",
    subtitle_ne: "नेपालमा अपाङ्गता भएका व्यक्तिहरूसँग सम्बन्धित कानुन, नीति, नियम, निर्देशिका, कार्यविधि, सूचना तथा स्थानीय तहबाट प्राप्त हुने अपाङ्गता सम्बन्धी तथ्यांक र वार्षिक प्रतिवेदनलाई एउटै डिजिटल प्रणालीमा व्यवस्थित गर्ने आधुनिक, सुरक्षित, Accessible र Scalable वेब प्रणाली।",
    subtitle_en: "A modern, secure, accessible, and scalable web portal established to unify and streamline disability-related laws, policies, regulations, directives, guidelines, notifications, and local government annual performance data across Koshi Province and Nepal.",
    badge_ne: "दूरदृष्टि तथा कार्यक्षेत्र",
    badge_en: "Vision & Scope",
    content_ne: "नेपालमा अपाङ्गता भएका व्यक्तिहरूसँग सम्बन्धित कानुन, नीति, नियम, निर्देशिका, कार्यविधि, सूचना तथा स्थानीय तहबाट प्राप्त हुने अपाङ्गता सम्बन्धी तथ्यांक र वार्षिक प्रतिवेदनलाई एउटै डिजिटल प्रणालीमा व्यवस्थित गर्ने आधुनिक, सुरक्षित, Accessible र Scalable वेब प्रणालीको रूपधमा यस केन्द्रको स्थापना गरिएको हो।",
    content_en: "The Disability Information Center (DIC) is established as a modern, accessible, secure, and scalable web portal to unify and streamline disability-related laws, regulations, directives, circulars, notifications, and local government annual performance data across Koshi Province and Nepal.",
    icon: "ShieldCheck",
    items: [
      {
        id: "pillar-1",
        title_ne: "१. कानुनी Digital Repository",
        title_en: "1. Legal Digital Repository",
        desc_ne: "संघीय सरकार तथा ७ वटै प्रदेश सरकारका अपाङ्गता सम्बन्धी ऐन, नियमावली, कार्यविधि र परिपत्रहरूको एकीकृत र खोजीयोग्य डिजिटल भण्डार।",
        desc_en: "Centralized, searchable archive of federal and all 7 provincial acts, regulations, guidelines, and official circulars.",
        icon: "Scale"
      },
      {
        id: "pillar-2",
        title_ne: "२. Local Reporting System",
        title_en: "2. Local Reporting System",
        desc_ne: "कोशी प्रदेशका १४ जिल्लाका १३७ वटै स्थानीय तहबाट अपाङ्गता सहायता सहजकर्ताले वार्षिक कार्यसम्पादन र प्रगति अनलाइन प्रविष्टि गर्ने प्रणाली।",
        desc_en: "Online reporting workflow for disability facilitators across all 137 municipalities in Koshi Province to log annual performance.",
        icon: "Building2"
      },
      {
        id: "pillar-3",
        title_ne: "३. Analytics & Reporting",
        title_en: "3. Analytics & Reporting",
        desc_ne: "लाभग्राही, गृहभेट, सहायक सामग्री र बजेट सम्बन्धी तथ्यांकलाई एकीकृत गरी विषयगत चार्ट, तुलनात्मक विश्लेषण र Downloadable रिपोर्ट निर्माण।",
        desc_en: "Aggregating beneficiary counts, home visits, assistive equipment, and budget indicators into thematic charts and downloadable reports.",
        icon: "BarChart3"
      }
    ],
    status: "published",
    display_order: 2,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    created_by: "मुख्य प्रशासक (Super Admin)",
    updated_by: "मुख्य प्रशासक (Super Admin)",
    deleted_at: null
  },
  {
    id: "sec-a11y-03",
    section_type: "accessibility",
    title_ne: "WCAG 2.2 AA अन्तर्राष्ट्रिय मापदण्ड पालना",
    title_en: "WCAG 2.2 AA International Standards Compliance",
    subtitle_ne: "सबै नागरिकका लागि समान डिजिटल पहुँच सुनिश्चितता",
    subtitle_en: "Ensuring equal digital accessibility for all citizens",
    badge_ne: "पहुँचयुक्तता प्रतिबद्धता",
    badge_en: "Accessibility Commitment",
    content_ne: "यस प्रणालीमा दृष्टिविहीन, न्यून दृष्टि भएका, श्रवण सम्बन्धी समस्या भएका तथा शारीरिक अपाङ्गता भएका सबै प्रयोगकर्ताहरूले सहज पहुँच पाउने गरी स्क्रिन रिडर अनुकूलता, किबोर्ड नेभिगेसन, उच्च कन्ट्रास्ट र फन्ट जुम सुविधाहरू पूर्ण रूपमा सुनिश्चित गरिएको छ।",
    content_en: "This platform is fully optimized for screen reader accessibility, complete keyboard navigation, high contrast modes, and text enlargement scaling to ensure seamless digital inclusion for blind, low-vision, deaf, hard-of-hearing, and physically disabled users.",
    icon: "ShieldCheck",
    items: [
      {
        id: "a11y-1",
        title_ne: "✓ किबोर्ड नेभिगेसन",
        title_en: "✓ Keyboard Navigation",
        desc_ne: "माउस बिना किबोर्डबाटै सम्पूर्ण प्रणाली सञ्चालन गर्न सकिने",
        desc_en: "Full keyboard-accessible workflow without requiring a mouse"
      },
      {
        id: "a11y-2",
        title_ne: "✓ उच्च कन्ट्रास्ट मोड",
        title_en: "✓ High Contrast Mode",
        desc_ne: "न्यून दृष्टि भएकाहरूका लागि स्पष्ट र तीव्र रङ भिन्नता",
        desc_en: "Optimized visual contrast for low-vision readers"
      },
      {
        id: "a11y-3",
        title_ne: "✓ स्क्रिन रिडर लेबलहरू",
        title_en: "✓ Screen Reader Labels",
        desc_ne: "दृष्टिविहीन प्रयोगकर्ताका लागि ARIA semantic लेबलहरू",
        desc_en: "Comprehensive ARIA live regions and semantic tags"
      },
      {
        id: "a11y-4",
        title_ne: "✓ फन्ट जुम स्केलिङ",
        title_en: "✓ Font Zoom Scaling",
        desc_ne: "अक्षरको आकार १८०% सम्म स्पष्टसँग ठूलो बनाउन मिल्ने",
        desc_en: "Instant font scaling up to 180% without broken layouts"
      }
    ],
    status: "published",
    display_order: 3,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    created_by: "मुख्य प्रशासक (Super Admin)",
    updated_by: "मुख्य प्रशासक (Super Admin)",
    deleted_at: null
  },
  {
    id: "sec-contact-04",
    section_type: "contact",
    title_ne: "सम्पर्क तथा सहयोग (Support & Helpdesk)",
    title_en: "Support & Helpdesk",
    subtitle_ne: "कोशी प्रदेश अपाङ्गता सूचना केन्द्र, प्राविधिक शाखा तथा सहजकर्ता सहयोग कक्ष",
    subtitle_en: "Koshi Province Disability Information Center, Technical Division, and Facilitator Helpdesk",
    badge_ne: "नागरिक तथा सहजकर्ता सहायता",
    badge_en: "Citizen & Facilitator Support",
    content_ne: "कुनै जिज्ञासा, कानुनी जानकारी वा प्रतिवेदन प्रविष्टिमा प्राविधिक कठिनाइ भएमा हाम्रा प्रतिनिधिहरूसँग प्रत्यक्ष सम्पर्क गर्न सक्नुहुन्छ।",
    content_en: "For any inquiries, legal guidance, or technical assistance during reporting submission, please contact our helpdesk team directly.",
    icon: "PhoneCall",
    items: [
      {
        id: "contact-address",
        title_ne: "कार्यालय ठेगाना:",
        title_en: "Office Address:",
        desc_ne: "विराटनगर, कोशी प्रदेश, नेपाल",
        desc_en: "Biratnagar, Koshi Province, Nepal",
        icon: "MapPin"
      },
      {
        id: "contact-phone",
        title_ne: "सहजकर्ता हटलाइन:",
        title_en: "Facilitator Hotline:",
        desc_ne: "+977-021-462800 / +977-021-462801",
        desc_en: "+977-021-462800 / +977-021-462801",
        icon: "PhoneCall"
      },
      {
        id: "contact-email",
        title_ne: "आधिकारिक इमेल:",
        title_en: "Official Email:",
        desc_ne: "info.dic@koshi.gov.np",
        desc_en: "info.dic@koshi.gov.np",
        icon: "Mail"
      }
    ],
    status: "published",
    display_order: 4,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    created_by: "मुख्य प्रशासक (Super Admin)",
    updated_by: "मुख्य प्रशासक (Super Admin)",
    deleted_at: null
  }
];

export function loadAboutFromDb(): AboutSection[] {
  if (inMemoryAboutSections && inMemoryAboutSections.length > 0) {
    return inMemoryAboutSections;
  }

  try {
    if (fs.existsSync(ABOUT_DB_PATH)) {
      const raw = fs.readFileSync(ABOUT_DB_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryAboutSections = parsed;
        return inMemoryAboutSections!;
      }
    }
  } catch (err) {
    console.error("Failed to load about_db.json, using default seed:", err);
  }

  inMemoryAboutSections = [...DEFAULT_ABOUT_SECTIONS];
  saveAboutToDb(inMemoryAboutSections);
  return inMemoryAboutSections;
}

export function saveAboutToDb(sections: AboutSection[]): boolean {
  inMemoryAboutSections = sections;
  try {
    const dir = path.dirname(ABOUT_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ABOUT_DB_PATH, JSON.stringify(sections, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to persist about sections to disk:", err);
    return false;
  }
}

/**
 * Get all sections with optional filtering
 */
export function getAllAboutSections(options?: { includeDeleted?: boolean; onlyPublished?: boolean }): AboutSection[] {
  const all = loadAboutFromDb();
  let result = [...all];

  if (options?.onlyPublished) {
    result = result.filter(s => s.status === 'published' && !s.deleted_at);
  } else if (!options?.includeDeleted) {
    result = result.filter(s => s.status !== 'deleted' && !s.deleted_at);
  }

  return result.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

/**
 * Get published sections for public About Us page
 */
export function getPublishedAboutSections(): AboutSection[] {
  return getAllAboutSections({ onlyPublished: true });
}

/**
 * Get single section by ID
 */
export function getAboutSectionById(id: string): AboutSection | undefined {
  const all = loadAboutFromDb();
  return all.find(s => s.id === id);
}

/**
 * Create a new section
 */
export function createAboutSection(
  input: AboutSectionInput,
  user?: { id?: string; name?: string }
): AboutSection {
  const all = loadAboutFromDb();
  const maxOrder = all.reduce((max, s) => Math.max(max, s.display_order || 0), 0);
  const now = new Date().toISOString();

  const newSection: AboutSection = {
    id: `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    section_type: input.section_type || "custom",
    title_ne: input.title_ne.trim(),
    title_en: input.title_en.trim(),
    subtitle_ne: input.subtitle_ne?.trim() || "",
    subtitle_en: input.subtitle_en?.trim() || "",
    badge_ne: input.badge_ne?.trim() || "",
    badge_en: input.badge_en?.trim() || "",
    content_ne: input.content_ne || "",
    content_en: input.content_en || "",
    image_url: input.image_url?.trim() || undefined,
    image_alt_ne: input.image_alt_ne?.trim() || undefined,
    image_alt_en: input.image_alt_en?.trim() || undefined,
    icon: input.icon || "Award",
    items: Array.isArray(input.items) ? input.items : undefined,
    status: input.status || "published",
    display_order: typeof input.display_order === "number" ? input.display_order : maxOrder + 1,
    created_at: now,
    updated_at: now,
    created_by: user?.name || "मुख्य प्रशासक (Super Admin)",
    updated_by: user?.name || "मुख्य प्रशासक (Super Admin)",
    deleted_at: null
  };

  const updated = [...all, newSection];
  saveAboutToDb(updated);

  logAuditEvent(
    "ABOUT_SECTION_CREATED",
    user?.id || "admin-master-001",
    user?.name || "मुख्य प्रशासक",
    newSection.id,
    newSection.title_ne,
    `नयाँ सेक्सन "${newSection.title_ne}" सिर्जना गरियो (Status: ${newSection.status}, Order: ${newSection.display_order})`
  );

  return newSection;
}

/**
 * Update an existing section
 */
export function updateAboutSection(
  id: string,
  updates: Partial<AboutSectionInput>,
  user?: { id?: string; name?: string }
): AboutSection | null {
  const all = loadAboutFromDb();
  const index = all.findIndex(s => s.id === id);
  if (index === -1) return null;

  const existing = all[index];
  const now = new Date().toISOString();

  const updatedSection: AboutSection = {
    ...existing,
    ...updates,
    updated_at: now,
    updated_by: user?.name || existing.updated_by || "मुख्य प्रशासक (Super Admin)"
  };

  all[index] = updatedSection;
  saveAboutToDb(all);

  logAuditEvent(
    "ABOUT_SECTION_UPDATED",
    user?.id || "admin-master-001",
    user?.name || "मुख्य प्रशासक",
    id,
    updatedSection.title_ne,
    `सेक्सन "${updatedSection.title_ne}" सम्पादन गरियो (Status: ${updatedSection.status})`
  );

  return updatedSection;
}

/**
 * Soft delete a section (moves to trash)
 */
export function softDeleteAboutSection(
  id: string,
  user?: { id?: string; name?: string }
): boolean {
  const all = loadAboutFromDb();
  const index = all.findIndex(s => s.id === id);
  if (index === -1) return false;

  const target = all[index];
  const now = new Date().toISOString();

  all[index] = {
    ...target,
    status: "deleted",
    deleted_at: now,
    updated_at: now,
    updated_by: user?.name || "मुख्य प्रशासक (Super Admin)"
  };

  saveAboutToDb(all);

  logAuditEvent(
    "ABOUT_SECTION_DELETED",
    user?.id || "admin-master-001",
    user?.name || "मुख्य प्रशासक",
    id,
    target.title_ne,
    `सेक्सन "${target.title_ne}" रद्दीटोकरी (Trash) मा सारियो`
  );

  return true;
}

/**
 * Restore a soft-deleted section from trash
 */
export function restoreAboutSection(
  id: string,
  user?: { id?: string; name?: string }
): boolean {
  const all = loadAboutFromDb();
  const index = all.findIndex(s => s.id === id);
  if (index === -1) return false;

  const target = all[index];
  const now = new Date().toISOString();

  all[index] = {
    ...target,
    status: "published", // restore to published
    deleted_at: null,
    updated_at: now,
    updated_by: user?.name || "मुख्य प्रशासक (Super Admin)"
  };

  saveAboutToDb(all);

  logAuditEvent(
    "ABOUT_SECTION_RESTORED",
    user?.id || "admin-master-001",
    user?.name || "मुख्य प्रशासक",
    id,
    target.title_ne,
    `सेक्सन "${target.title_ne}" रद्दीटोकरीबाट पुनःस्थापना गरियो`
  );

  return true;
}

/**
 * Permanently purge a section
 */
export function permanentDeleteAboutSection(
  id: string,
  user?: { id?: string; name?: string }
): boolean {
  const all = loadAboutFromDb();
  const index = all.findIndex(s => s.id === id);
  if (index === -1) return false;

  const target = all[index];
  const updated = all.filter(s => s.id !== id);
  saveAboutToDb(updated);

  logAuditEvent(
    "ABOUT_SECTION_PURGED",
    user?.id || "admin-master-001",
    user?.name || "मुख्य प्रशासक",
    id,
    target.title_ne,
    `सेक्सन "${target.title_ne}" स्थायी रूपमा मेटाइयो (Permanently Deleted)`
  );

  return true;
}

/**
 * Reorder sections by an ordered list of IDs
 */
export function reorderAboutSections(
  orderedIds: string[],
  user?: { id?: string; name?: string }
): AboutSection[] {
  const all = loadAboutFromDb();
  const now = new Date().toISOString();

  orderedIds.forEach((id, newOrder) => {
    const section = all.find(s => s.id === id);
    if (section) {
      section.display_order = newOrder + 1;
      section.updated_at = now;
      if (user?.name) section.updated_by = user.name;
    }
  });

  saveAboutToDb(all);

  logAuditEvent(
    "ABOUT_SECTIONS_REORDERED",
    user?.id || "admin-master-001",
    user?.name || "मुख्य प्रशासक",
    "all",
    "क्रम परिवर्तन",
    `About Us सेक्सनहरूको क्रम परिवर्तन गरियो (${orderedIds.length} सेक्सन)`
  );

  return getAllAboutSections();
}

/**
 * Reset about sections to default seed
 */
export function resetAboutToDefault(user?: { id?: string; name?: string }): AboutSection[] {
  const cloned = JSON.parse(JSON.stringify(DEFAULT_ABOUT_SECTIONS));
  saveAboutToDb(cloned);

  logAuditEvent(
    "ABOUT_SECTIONS_RESET",
    user?.id || "admin-master-001",
    user?.name || "मुख्य प्रशासक",
    "all",
    "डिफल्ट रिसेट",
    "About Us सामग्री प्रारम्भिक अवस्थामा रिसेट गरियो"
  );

  return cloned;
}
