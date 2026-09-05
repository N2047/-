export interface FormSection {
  id: number;
  title: string;
  short: string;
  desc: string;
  isCustom?: boolean;
  customType?: "text" | "number" | "table";
  customFields?: Array<{
    id: string;
    label: string;
    type: "text" | "number" | "textarea";
    placeholder?: string;
  }>;
}

export interface FormConfig {
  mainTitle: string;
  subtitle: string;
  fiscalYear: string;
  sections: FormSection[];
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export const DEFAULT_SECTIONS: FormSection[] = [
  { id: 1, title: "१. सामान्य विवरण", short: "Q1-Q9", desc: "जनसांख्यिकी तथा प्रोफाइल स्थिति" },
  { id: 2, title: "२. सेवा प्रवाह", short: "Q10-Q13", desc: "परामर्श, गृहभेट र सहायक सामग्री" },
  { id: 3, title: "३. शिक्षा र बालबालिका", short: "Q14-Q20", desc: "भर्ना, छात्रवृत्ति र बाल क्लब" },
  { id: 4, title: "४. तालिम र उद्यम", short: "Q21-Q23", desc: "व्यवसायिक तालिम र रोजगारी" },
  { id: 5, title: "५. सामाजिक सुरक्षा", short: "Q24-Q27", desc: "भत्ता र परिचयपत्र सम्बन्धी" },
  { id: 6, title: "६. समूह र बिउपुँजी", short: "Q28-Q29", desc: "मिलिजुली समूह, बचत र ऋण" },
  { id: 7, title: "७. संस्थागत र बजेट", short: "Q30-Q33", desc: "OPD, बजेट तथा स्वास्थ्य बीमा" },
  { id: 8, title: "८. १० प्रकारगत वर्गीकरण", short: "Q34", desc: "अपाङ्गताका प्रकार अनुसार" },
  { id: 9, title: "९. कार्ड रंग/गाम्भीर्यता", short: "Q35", desc: "रातो, निलो, पहेलो, सेतो" },
  { id: 10, title: "१०. नीति र प्रबन्ध", short: "Q36-Q44", desc: "कानुनी सहायता, परिपत्र र कार्यकक्ष" },
  { id: 11, title: "अनुसूची १.१ (गृहभेट)", short: "गृहभेट", desc: "गृहभेट गरिएको विवरण तालिका" },
  { id: 12, title: "अनुसूची १.२ (सामग्री)", short: "सामग्री", desc: "सहायक सामग्री वितरण तालिका" },
  { id: 13, title: "१३. समीक्षा र पेश", short: "समीक्षा", desc: "समग्र फारम जाँच तथा सबमिट" },
];

export const DEFAULT_FORM_CONFIG: FormConfig = {
  mainTitle: "अपाङ्गता सहायता सहजकर्ता वार्षिक प्रतिवेदन",
  subtitle: "राष्ट्रिय अपाङ्गता सहायता कक्ष मापदण्ड अनुसार स्थानीय तह कार्यसम्पादन प्रतिवेदन",
  fiscalYear: "२०८२/०८३",
  sections: DEFAULT_SECTIONS,
  lastModifiedBy: "सामाजिक विकास मन्त्रालय, कोशी प्रदेश",
  lastModifiedAt: "२०८२/०५/०१",
};

const STORAGE_KEY = "dic_form_config_v2";

export function getFormConfig(): FormConfig {
  if (typeof window === "undefined") {
    return DEFAULT_FORM_CONFIG;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FORM_CONFIG;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
      return DEFAULT_FORM_CONFIG;
    }
    return parsed;
  } catch (e) {
    console.error("Failed to load form config from localStorage", e);
    return DEFAULT_FORM_CONFIG;
  }
}

export function saveFormConfig(config: FormConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event("dic_form_config_updated"));
  } catch (e) {
    console.error("Failed to save form config", e);
  }
}

export function resetFormConfig(): FormConfig {
  if (typeof window === "undefined") return DEFAULT_FORM_CONFIG;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("dic_form_config_updated"));
  return DEFAULT_FORM_CONFIG;
}

export function updateMainTitle(
  mainTitle: string, 
  subtitle: string, 
  fiscalYear?: string, 
  modifiedBy?: string
): FormConfig {
  const current = getFormConfig();
  const updated: FormConfig = {
    ...current,
    mainTitle: mainTitle.trim() || current.mainTitle,
    subtitle: subtitle.trim() || current.subtitle,
    fiscalYear: fiscalYear?.trim() || current.fiscalYear,
    lastModifiedBy: modifiedBy || "कोशी प्रदेश मुख्य प्रशासक",
    lastModifiedAt: new Date().toLocaleDateString("ne-NP"),
  };
  saveFormConfig(updated);
  return updated;
}

export function renameSection(
  sectionId: number,
  newTitle: string,
  newShort: string,
  newDesc: string,
  modifiedBy?: string
): FormConfig {
  const current = getFormConfig();
  const updatedSections = current.sections.map((s) => {
    if (s.id === sectionId) {
      return {
        ...s,
        title: newTitle.trim() || s.title,
        short: newShort.trim() || s.short,
        desc: newDesc.trim() || s.desc,
      };
    }
    return s;
  });

  const updated: FormConfig = {
    ...current,
    sections: updatedSections,
    lastModifiedBy: modifiedBy || "कोशी प्रदेश मुख्य प्रशासक",
    lastModifiedAt: new Date().toLocaleDateString("ne-NP"),
  };
  saveFormConfig(updated);
  return updated;
}

export function addSection(
  title: string,
  short: string,
  desc: string,
  customType: "text" | "number" | "table" = "text",
  modifiedBy?: string
): FormConfig {
  const current = getFormConfig();
  const maxId = current.sections.reduce((max, s) => (s.id > max ? s.id : max), 0);
  const newSection: FormSection = {
    id: maxId + 1,
    title: title.trim(),
    short: short.trim() || `F-${maxId + 1}`,
    desc: desc.trim() || "थप गरिएको फारम खण्ड",
    isCustom: true,
    customType,
    customFields: [
      { id: "f1", label: "विवरण वा शीर्षक", type: "text", placeholder: "यहाँ खुलाउनुहोस्..." },
      { id: "f2", label: "सङ्ख्या / परिणाम", type: "number", placeholder: "०" },
      { id: "f3", label: "विशेष कैफियत", type: "textarea", placeholder: "थप कैफियत भए उल्लेख गर्नुहोस्..." },
    ],
  };

  // Insert before review section if review is last
  const reviewIdx = current.sections.findIndex((s) => s.short === "समीक्षा");
  let nextSections: FormSection[];
  if (reviewIdx !== -1) {
    nextSections = [
      ...current.sections.slice(0, reviewIdx),
      newSection,
      ...current.sections.slice(reviewIdx),
    ];
  } else {
    nextSections = [...current.sections, newSection];
  }

  const updated: FormConfig = {
    ...current,
    sections: nextSections,
    lastModifiedBy: modifiedBy || "कोशी प्रदेश मुख्य प्रशासक",
    lastModifiedAt: new Date().toLocaleDateString("ne-NP"),
  };
  saveFormConfig(updated);
  return updated;
}

export function deleteSection(sectionId: number, modifiedBy?: string): FormConfig {
  const current = getFormConfig();
  const updatedSections = current.sections.filter((s) => s.id !== sectionId);
  const updated: FormConfig = {
    ...current,
    sections: updatedSections,
    lastModifiedBy: modifiedBy || "कोशी प्रदेश मुख्य प्रशासक",
    lastModifiedAt: new Date().toLocaleDateString("ne-NP"),
  };
  saveFormConfig(updated);
  return updated;
}
