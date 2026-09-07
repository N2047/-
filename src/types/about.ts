export type AboutSectionType = 
  | 'hero' 
  | 'vision_mandate' 
  | 'mission' 
  | 'objectives' 
  | 'pillars' 
  | 'accessibility' 
  | 'contact' 
  | 'custom';

export type AboutSectionStatus = 'published' | 'draft' | 'hidden' | 'deleted';

export interface AboutSectionItem {
  id: string;
  title_ne: string;
  title_en: string;
  desc_ne: string;
  desc_en: string;
  icon?: string;
  link?: string;
}

export interface AboutSection {
  id: string;
  section_type: AboutSectionType;
  title_ne: string;
  title_en: string;
  subtitle_ne?: string;
  subtitle_en?: string;
  badge_ne?: string;
  badge_en?: string;
  content_ne: string;
  content_en: string;
  image_url?: string;
  image_alt_ne?: string;
  image_alt_en?: string;
  icon?: string;
  items?: AboutSectionItem[];
  status: AboutSectionStatus;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  deleted_at?: string | null;
}

export interface AboutSectionInput {
  section_type: AboutSectionType;
  title_ne: string;
  title_en: string;
  subtitle_ne?: string;
  subtitle_en?: string;
  badge_ne?: string;
  badge_en?: string;
  content_ne: string;
  content_en: string;
  image_url?: string;
  image_alt_ne?: string;
  image_alt_en?: string;
  icon?: string;
  items?: AboutSectionItem[];
  status?: AboutSectionStatus;
  display_order?: number;
}
