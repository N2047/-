export interface FooterQuickLink {
  id: string;
  label_ne: string;
  label_en: string;
  href: string;
  is_active: boolean;
  is_external?: boolean;
}

export interface FooterConfig {
  // Brand details
  app_name_ne: string;
  app_name_en: string;
  app_sub_name_ne: string;
  app_sub_name_en: string;
  brand_desc_ne: string;
  brand_desc_en: string;
  wcag_badge_ne: string;
  wcag_badge_en: string;

  // Quick Links Section (प्रमुख मोड्युलहरू)
  quick_links_title_ne: string;
  quick_links_title_en: string;
  quick_links: FooterQuickLink[];

  // Contact & Support Section (सम्पर्क तथा सहयोग)
  contact_title_ne: string;
  contact_title_en: string;
  help_desk_name_ne: string;
  help_desk_name_en: string;
  phone_ne: string;
  phone_en: string;
  email: string;
  address_ne?: string;
  address_en?: string;

  // Copyright & Compliance Footer Bar
  copyright_ne: string;
  copyright_en: string;
  a11y_note_ne: string;
  a11y_note_en: string;

  // Metadata
  updated_at?: string;
  updated_by?: string;
}
