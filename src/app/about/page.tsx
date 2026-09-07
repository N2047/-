"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/languageContext";
import { AboutSection } from "@/types/about";
import { AVAILABLE_ICONS } from "@/components/admin/AdminAboutManagement";
import { renderSanitizedContent } from "@/components/admin/RichTextEditor";
import { 
  Award, 
  ShieldCheck, 
  Scale, 
  Building2, 
  BarChart3, 
  PhoneCall, 
  Mail, 
  MapPin,
  FileText
} from "lucide-react";

// Pre-seeded fallback data for instant zero-flicker first render
const INITIAL_FALLBACK_SECTIONS: AboutSection[] = [
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
    updated_at: "2026-01-01T00:00:00.000Z"
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
    content_ne: "नेपालमा अपाङ्गता भएका व्यक्तिहरूसँग सम्बन्धित कानुन, नीति, नियम, निर्देशिका, कार्यविधि, सूचना तथा स्थानीय तहबाट प्राप्त हुने अपाङ्गता सम्बन्धी तथ्यांक र वार्षिक प्रतिवेदनलाई एउटै डिजिटल प्रणालीमा व्यवस्थित गर्ने आधुनिक, सुरक्षित, Accessible र Scalable वेब प्रणालीको रूपमा यस केन्द्रको स्थापना गरिएको हो।",
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
    updated_at: "2026-01-01T00:00:00.000Z"
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
    updated_at: "2026-01-01T00:00:00.000Z"
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
    updated_at: "2026-01-01T00:00:00.000Z"
  }
];

export default function AboutPage() {
  const { lang, setLang } = useLanguage();
  const [sections, setSections] = useState<AboutSection[]>(INITIAL_FALLBACK_SECTIONS);
  const [loading, setLoading] = useState(true);

  // Fetch real-time published sections from CMS API
  useEffect(() => {
    async function loadSections() {
      try {
        const res = await fetch("/api/about", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.sections) && data.sections.length > 0) {
            setSections(data.sections);
          }
        }
      } catch (err) {
        console.error("Failed to fetch published about sections:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSections();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Header lang={lang} onLanguageChange={setLang} />

      <main 
        id="main-content" 
        tabIndex={-1} 
        className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 focus:outline-hidden space-y-8"
      >
        {/* If no published sections found */}
        {!loading && sections.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {lang === "ne" ? "हाल कुनै सामग्री प्रकाशित गरिएको छैन।" : "No About Us content has been published yet."}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === "ne" ? "कृपया केही समयपछि पुनः हेर्नुहोस्।" : "Please check back later."}
            </p>
          </div>
        ) : (
          sections.map((section, idx) => {
            const IconComp = AVAILABLE_ICONS[section.icon || "Award"] || Award;
            
            // Bilingual content resolution
            const title = lang === "ne" ? section.title_ne : (section.title_en || section.title_ne);
            const subtitle = lang === "ne" ? section.subtitle_ne : (section.subtitle_en || section.subtitle_ne);
            const badge = lang === "ne" ? section.badge_ne : (section.badge_en || section.badge_ne);
            const content = lang === "ne" ? section.content_ne : (section.content_en || section.content_ne);
            const altText = lang === "ne" ? (section.image_alt_ne || title) : (section.image_alt_en || title);

            // =========================================================================
            // 1. HERO SECTION TYPE
            // =========================================================================
            if (section.section_type === "hero" || idx === 0) {
              return (
                <section 
                  key={section.id} 
                  className="bg-white dark:bg-slate-900 rounded-2xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xs text-center sm:text-left space-y-4"
                >
                  {badge && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                      <IconComp className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{badge}</span>
                    </div>
                  )}

                  <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {title}
                  </h1>

                  {subtitle && (
                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                      {subtitle}
                    </p>
                  )}

                  {section.image_url && (
                    <div className="pt-2 rounded-2xl overflow-hidden max-h-80 w-full border border-slate-200 dark:border-slate-800 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={section.image_url} 
                        alt={altText}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {content && (
                    <div className="pt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                      {renderSanitizedContent(content)}
                    </div>
                  )}
                </section>
              );
            }

            // =========================================================================
            // 2. ACCESSIBILITY / WCAG SPECIAL SECTION
            // =========================================================================
            if (section.section_type === "accessibility") {
              return (
                <section 
                  key={section.id}
                  className="bg-linear-to-br from-slate-900 via-slate-900 to-blue-950 text-white rounded-2xl p-8 shadow-lg space-y-4 border border-blue-900/50"
                >
                  <div className="flex items-center gap-2">
                    <IconComp className="w-6 h-6 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      {badge || (lang === "ne" ? "पहुँचयुक्तता प्रतिबद्धता" : "Accessibility Commitment")}
                    </span>
                  </div>

                  <h2 className="text-xl font-black text-white">
                    {title}
                  </h2>

                  {subtitle && (
                    <p className="text-sm text-blue-200 font-medium leading-relaxed">
                      {subtitle}
                    </p>
                  )}

                  {content && (
                    <div className="text-sm text-blue-100 leading-relaxed text-justify">
                      {renderSanitizedContent(content)}
                    </div>
                  )}

                  {/* Accessibility feature pill cards */}
                  {section.items && section.items.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-blue-200 pt-2">
                      {section.items.map((item, iIdx) => {
                        const itemTitle = lang === "ne" ? item.title_ne : (item.title_en || item.title_ne);
                        const itemDesc = lang === "ne" ? item.desc_ne : (item.desc_en || item.desc_ne);

                        return (
                          <div 
                            key={item.id || iIdx} 
                            className="p-3 bg-white/10 rounded-xl border border-white/10 hover:bg-white/15 transition"
                          >
                            <div className="font-bold text-white mb-0.5">{itemTitle}</div>
                            {itemDesc && <div className="text-[11px] text-blue-200/90">{itemDesc}</div>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            }

            // =========================================================================
            // 3. CONTACT & HELPDESK SECTION
            // =========================================================================
            if (section.section_type === "contact") {
              return (
                <section 
                  key={section.id} 
                  className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <IconComp className="w-6 h-6 text-blue-700 dark:text-blue-400 shrink-0" />
                      <span>{title}</span>
                    </h2>
                    {badge && (
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                        {badge}
                      </span>
                    )}
                  </div>

                  {subtitle && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {subtitle}
                    </p>
                  )}

                  {content && (
                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {renderSanitizedContent(content)}
                    </div>
                  )}

                  {/* Contact channels 3-column grid */}
                  {section.items && section.items.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-slate-700 dark:text-slate-300 pt-2">
                      {section.items.map((item, iIdx) => {
                        const itemTitle = lang === "ne" ? item.title_ne : (item.title_en || item.title_ne);
                        const itemDesc = lang === "ne" ? item.desc_ne : (item.desc_en || item.desc_ne);
                        const ItemIcon = AVAILABLE_ICONS[item.icon || "PhoneCall"] || PhoneCall;
                        
                        // Icon accent color
                        const iconColor = iIdx === 0 ? "text-red-600" : iIdx === 1 ? "text-sky-600" : "text-amber-600";

                        return (
                          <div key={item.id || iIdx} className="flex items-start gap-3">
                            <ItemIcon className={`w-5 h-5 ${iconColor} shrink-0 mt-0.5`} />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                                {itemTitle}
                              </span>
                              <span className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 block leading-relaxed">
                                {itemDesc}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            }

            // =========================================================================
            // 4. VISION / MANDATE / MISSION / PILLARS / CUSTOM SECTIONS
            // =========================================================================
            return (
              <section 
                key={section.id} 
                className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <IconComp className="w-6 h-6 text-blue-700 dark:text-blue-400 shrink-0" />
                    <span>{title}</span>
                  </h2>
                  {badge && (
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-full">
                      {badge}
                    </span>
                  )}
                </div>

                {subtitle && (
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                    {subtitle}
                  </p>
                )}

                {section.image_url && (
                  <div className="rounded-2xl overflow-hidden max-h-72 w-full border border-slate-200 dark:border-slate-800 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={section.image_url} 
                      alt={altText}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {content && (
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                    {renderSanitizedContent(content)}
                  </div>
                )}

                {/* Sub-cards / Pillars Grid */}
                {section.items && section.items.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    {section.items.map((item, iIdx) => {
                      const itemTitle = lang === "ne" ? item.title_ne : (item.title_en || item.title_ne);
                      const itemDesc = lang === "ne" ? item.desc_ne : (item.desc_en || item.desc_ne);
                      const ItemIcon = AVAILABLE_ICONS[item.icon || "Scale"] || Scale;
                      
                      // Card accent styling
                      const bgClasses = iIdx === 0 
                        ? "bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-400"
                        : iIdx === 1
                          ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400"
                          : "bg-purple-50/50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900 text-purple-800 dark:text-purple-400";

                      return (
                        <div 
                          key={item.id || iIdx} 
                          className={`p-5 rounded-xl border ${bgClasses}`}
                        >
                          <ItemIcon className="w-8 h-8 mb-3" />
                          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                            {itemTitle}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {itemDesc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })
        )}
      </main>

      <Footer lang={lang} />
    </div>
  );
}
