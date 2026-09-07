export type NewsCategoryKey = 'notice' | 'news' | 'program' | 'achievement' | 'announcement';

export interface NewsImageItem {
  url: string;
  caption?: string;
}

export interface NewsArticle {
  id: string;
  title_ne: string;
  title_en?: string;
  summary_ne: string;
  summary_en?: string;
  content_ne: string;
  content_en?: string;
  published_date_bs: string;
  published_date_en?: string;
  category: 'सूचना' | 'समाचार' | 'कार्यक्रम' | 'उपलब्धि' | 'घोषणा' | NewsCategoryKey;
  author: string;
  author_en?: string;
  tags: string[];
  // Optional Media fields
  image_url?: string;
  images?: NewsImageItem[];
  video_url?: string;
  attachment_name?: string;
  attachment_size?: string;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "news-01",
    title_ne: "आर्थिक वर्ष २०८२/०८३ को अपाङ्गता सहायता सहजकर्ता वार्षिक प्रतिवेदन प्रविष्टि खुला",
    title_en: "Annual Performance Report Submissions Opened for FY 2082/083",
    summary_ne: "कोशी प्रदेशका १४ वटै जिल्लाका १३७ स्थानीय तहका अपाङ्गता सहायता सहजकर्ताहरूलाई वार्षिक कार्यसम्पादन तथा प्रगति प्रतिवेदन अनलाइन प्रणाली मार्फत प्रविष्टि गर्न अनुरोध गरिएको छ।",
    summary_en: "Disability facilitators across all 137 local governments of Koshi Province are invited to submit their annual performance reports online through the integrated portal.",
    content_ne: "कोशी प्रदेश सामाजिक विकास मन्त्रालय तथा अपाङ्गता सूचना केन्द्र (DIC) को संयुक्त आयोजनामा आर्थिक वर्ष २०८२/०८३ को वार्षिक प्रतिवेदन संकलन कार्य सुरु भएको छ। सम्पूर्ण स्थानीय तहका सहजकर्ताहरूले आफ्नो पालिकाको प्रोफाइलमा गई ४४ वटा प्रश्न तथा अनुसूची १.१ (गृहभेट) र १.२ (सहायक सामग्री) अनिवार्य रूपमा भर्नुहुन सूचित गरिन्छ।",
    content_en: "The Ministry of Social Development of Koshi Province and Disability Information Center (DIC) have jointly launched the annual reporting submission for FY 2082/083. Facilitators from all 137 municipalities are instructed to complete the 44 core performance questions, Annex 1.1 (Home Visits), and Annex 1.2 (Assistive Devices).",
    published_date_bs: "२०८२/०५/१५",
    published_date_en: "2082/05/15",
    category: "सूचना",
    author: "अपाङ्गता सूचना केन्द्र, विराटनगर",
    author_en: "Disability Information Center, Biratnagar",
    tags: ["वार्षिक प्रतिवेदन", "२०८२/०८३", "१३७ स्थानीय तह"],
    attachment_name: "प्रतिवेदन_प्रविष्टि_सम्बन्धी_परिपत्र_२०८२.pdf",
    attachment_size: "६२० KB",
    created_at: "2026-05-15T00:00:00.000Z"
  },
  {
    id: "news-02",
    title_ne: "कोशी प्रदेशका ५० स्थानीय तहमा निशुल्क सहायक सामग्री वितरण शिविर सम्पन्न",
    title_en: "Free Assistive Device Distribution Camps Concluded in 50 Municipalities",
    summary_ne: "झापा, मोरङ, सुनसरी र पाँचथर लगायतका जिल्लाहरूमा १,२०० भन्दा बढी अपाङ्गता भएका व्यक्तिहरूलाई ह्वीलचेयर, सेतो छडी र श्रवण यन्त्र वितरण गरिएको छ।",
    summary_en: "Over 1,200 persons with disabilities received wheelchairs, white canes, and hearing aids across Jhapa, Morang, Sunsari, and Panchthar districts.",
    content_ne: "स्थानीय तहको बजेट तथा दातृ निकायहरूको सहकार्यमा विपन्न तथा ग्रामीण क्षेत्रका अपाङ्गता भएका नागरिकहरूलाई लक्षित गरी शिविर सञ्चालन गरिएको थियो। शिविरमा नापजाँच गरी आवश्यकता अनुसार आधुनिक सहायक सामग्री उपलब्ध गराइएको छ। कार्यक्रममा जनप्रतिनिधिहरू, स्वास्थ्यकर्मीहरू र स्थानीय अपाङ्गता अगुवाहरूको सक्रिय सहभागिता रहेको थियो।",
    content_en: "In partnership with local government budgets and development partners, specialized distribution camps were organized for citizens in rural and underprivileged communities. Medical assessments were conducted and modern mobility devices were distributed with active participation from local representatives.",
    published_date_bs: "२०८२/०४/२८",
    published_date_en: "2082/04/28",
    category: "समाचार",
    author: "सामाजिक विकास मन्त्रालय, कोशी प्रदेश",
    author_en: "Ministry of Social Development, Koshi Province",
    tags: ["सहायक सामग्री", "ह्वीलचेयर", "शिविर"],
    image_url: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80",
    created_at: "2026-04-28T00:00:00.000Z"
  },
  {
    id: "news-03",
    title_ne: "अपाङ्गता सहायता सहजकर्ताहरूका लागि डिजिटल क्षमता अभिवृद्धि तालिम सञ्चालन हुँदै",
    title_en: "Digital Capacity Building Training Announced for Disability Facilitators",
    summary_ne: "नयाँ वेब प्रणाली (DIC) मार्फत तथ्यांक संकलन, अनुसूची भर्ने तरिका र रिपोर्ट विश्लेषण सम्बन्धी ३ दिने भर्चुअल तालिम आगामी हप्ता सुरु हुनेछ।",
    summary_en: "A 3-day virtual capacity building workshop on digital data entry, annex verification, and analytics under the new DIC portal will commence next week.",
    content_ne: "सहजकर्ताहरूको डिजिटल क्षमता विकासका लागि तालिम आयोजना गरिएको हो। सहभागीहरूलाई अनलाइन फारम भर्ने, ड्राफ्ट सेभ गर्ने र स्थानीय तथ्यांकको गोपनीयता कायम राख्ने विषयमा व्यवहारिक अभ्यास गराइनेछ। भर्चुअल माध्यमबाट सञ्चालन हुने यस तालिममा १४ जिल्लाका सम्पूर्ण सहजकर्ताहरूको उपस्थिति अनिवार्य गरिएको छ।",
    content_en: "The workshop focuses on equipping municipal facilitators with hands-on practice in digital form submission, data privacy, and report generation. Mandatory attendance is required for all focal persons across 14 districts of Koshi Province.",
    published_date_bs: "२०८२/०४/१०",
    published_date_en: "2082/04/10",
    category: "कार्यक्रम",
    author: "DIC प्राविधिक शाखा",
    author_en: "DIC Technical Division",
    tags: ["क्षमता अभिवृद्धि", "डिजिटल तालिम", "सहजकर्ता"],
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    created_at: "2026-04-10T00:00:00.000Z"
  },
  {
    id: "news-04",
    title_ne: "फिदिम नगरपालिकाद्वारा अपाङ्गता परिचयपत्र शतप्रतिशत डिजिटल अभिलेखीकरण सम्पन्न",
    title_en: "Phidim Municipality Completes 100% Digital Archiving of Disability ID Cards",
    summary_ne: "पाँचथर जिल्लाको फिदिम नगरपालिकाले आफ्नो पालिका भित्रका सम्पूर्ण कार्डधारीहरूको विवरण डिजिटल प्रोफाइलमा समावेस गरी कोशी प्रदेशमै पहिलो सफलता हासिल गरेको छ।",
    summary_en: "Phidim Municipality of Panchthar becomes the first local government in Koshi Province to fully digitize all disability ID cardholder records.",
    content_ne: "फिदिम नगरपालिकाको अपाङ्गता सहायता कक्षले ८४० जना कार्डधारीहरूको व्यक्तिगत विवरण, स्वास्थ्य अवस्था र सामाजिक सुरक्षा भत्ता विवरण पूर्ण रूपमा अनलाइन पोर्टलमा समावेस गरेको छ। यसले सेवा प्रवाहलाई थप पारदर्शी बनाएको छ।",
    content_en: "Phidim Municipality's Disability Helpdesk has successfully uploaded profiles for all 840 cardholders, including health conditions and social security allowance verification, setting a benchmark for transparent service delivery.",
    published_date_bs: "२०८२/०३/२२",
    published_date_en: "2082/03/22",
    category: "उपलब्धि",
    author: "फिदिम नगरपालिका, पाँचथर",
    author_en: "Phidim Municipality, Panchthar",
    tags: ["फिदिम", "डिजिटल अभिलेख", "उत्कृष्ट कार्य"],
    image_url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
    created_at: "2026-03-22T00:00:00.000Z"
  }
];

// Helper to get localized category name
export function getLocalizedCategory(category: string, lang: 'ne' | 'en'): string {
  const map: Record<string, { ne: string; en: string }> = {
    'all': { ne: 'सबै', en: 'All' },
    'notice': { ne: 'सूचना', en: 'Notice' },
    'सूचना': { ne: 'सूचना', en: 'Notice' },
    'news': { ne: 'समाचार', en: 'News' },
    'समाचार': { ne: 'समाचार', en: 'News' },
    'program': { ne: 'कार्यक्रम', en: 'Programs' },
    'कार्यक्रम': { ne: 'कार्यक्रम', en: 'Programs' },
    'achievement': { ne: 'उपलब्धि', en: 'Achievements' },
    'उपलब्धि': { ne: 'उपलब्धि', en: 'Achievements' },
    'announcement': { ne: 'घोषणा', en: 'Announcements' },
    'घोषणा': { ne: 'घोषणा', en: 'Announcements' }
  };
  return map[category]?.[lang] || category;
}

// Helper to normalize category for filtering
export function normalizeCategoryKey(category: string): NewsCategoryKey {
  if (category === 'सूचना' || category === 'notice') return 'notice';
  if (category === 'समाचार' || category === 'news') return 'news';
  if (category === 'कार्यक्रम' || category === 'program') return 'program';
  if (category === 'उपलब्धि' || category === 'achievement') return 'achievement';
  if (category === 'घोषणा' || category === 'announcement') return 'announcement';
  return 'notice';
}
