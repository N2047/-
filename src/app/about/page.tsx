"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { translations } from "@/lib/translations";
import { useLanguage } from "@/lib/languageContext";
import { 
  Building2, 
  Scale, 
  BarChart3, 
  ShieldCheck, 
  Award, 
  PhoneCall, 
  Mail, 
  MapPin
} from "lucide-react";

export default function AboutPage() {
  const { lang, setLang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Header lang={lang} onLanguageChange={setLang} />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 focus:outline-hidden">
        
        {/* About Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xs mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-blue-200 dark:border-blue-800">
            <Award className="w-4 h-4 text-amber-500" />
            <span>{t.about.badge}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.about.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-3 max-w-3xl leading-relaxed">
            {t.about.description}
          </p>
        </div>

        {/* Vision & Mission */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs mb-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <ShieldCheck className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            <span>{lang === "ne" ? "परिकल्पना तथा मुख्य उद्देश्यहरू (Vision & Core Mandate)" : "Vision & Core Mandate"}</span>
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
            {lang === "ne" 
              ? "नेपालमा अपाङ्गता भएका व्यक्तिहरूसँग सम्बन्धित कानुन, नीति, नियम, निर्देशिका, कार्यविधि, सूचना तथा स्थानीय तहबाट प्राप्त हुने अपाङ्गता सम्बन्धी तथ्यांक र वार्षिक प्रतिवेदनलाई एउटै डिजिटल प्रणालीमा व्यवस्थित गर्ने आधुनिक, सुरक्षित, Accessible र Scalable वेब प्रणालीको रूपमा यस केन्द्रको स्थापना गरिएको हो।"
              : "The Disability Information Center (DIC) is established as a modern, accessible, secure, and scalable web portal to unify and streamline disability-related laws, regulations, directives, circulars, notifications, and local government annual performance data across Koshi Province and Nepal."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
              <Scale className="w-8 h-8 text-blue-800 dark:text-blue-400 mb-3" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                {lang === "ne" ? "१. कानुनी Digital Repository" : "1. Legal Digital Repository"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang === "ne" 
                  ? "संघीय सरकार तथा ७ वटै प्रदेश सरकारका अपाङ्गता सम्बन्धी ऐन, नियमावली, कार्यविधि र परिपत्रहरूको एकीकृत र खोजीयोग्य डिजिटल भण्डार।"
                  : "Centralized, searchable archive of federal and all 7 provincial acts, regulations, guidelines, and official circulars."}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
              <Building2 className="w-8 h-8 text-emerald-800 dark:text-emerald-400 mb-3" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                {lang === "ne" ? "२. Local Reporting System" : "2. Local Reporting System"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang === "ne" 
                  ? "कोशी प्रदेशका १४ जिल्लाका १३७ वटै स्थानीय तहबाट अपाङ्गता सहायता सहजकर्ताले वार्षिक कार्यसम्पादन र प्रगति अनलाइन प्रविष्टि गर्ने प्रणाली।"
                  : "Online reporting workflow for disability facilitators across all 137 municipalities in Koshi Province to log annual performance."}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900">
              <BarChart3 className="w-8 h-8 text-purple-800 dark:text-purple-400 mb-3" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                {lang === "ne" ? "३. Analytics & Reporting" : "3. Analytics & Reporting"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang === "ne" 
                  ? "लाभग्राही, गृहभेट, सहायक सामग्री र बजेट सम्बन्धी तथ्यांकलाई एकीकृत गरी विषयगत चार्ट, तुलनात्मक विश्लेषण र Downloadable रिपोर्ट निर्माण।"
                  : "Aggregating beneficiary counts, home visits, assistive equipment, and budget indicators into thematic charts and downloadable reports."}
              </p>
            </div>
          </div>
        </section>

        {/* WCAG Accessibility Commitment */}
        <section className="bg-linear-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              {lang === "ne" ? "पहुँचयुक्तता प्रतिबद्धता" : "Accessibility Commitment"}
            </span>
          </div>
          <h2 className="text-xl font-black mb-3">
            {lang === "ne" ? "WCAG 2.2 AA अन्तर्राष्ट्रिय मापदण्ड पालना" : "WCAG 2.2 AA International Standards Compliance"}
          </h2>
          <p className="text-sm text-blue-100 leading-relaxed mb-4">
            {lang === "ne"
              ? "यस प्रणालीमा दृष्टिविहीन, न्यून दृष्टि भएका, श्रवण सम्बन्धी समस्या भएका तथा शारीरिक अपाङ्गता भएका सबै प्रयोगकर्ताहरूले सहज पहुँच पाउने गरी स्क्रिन रिडर अनुकूलता, किबोर्ड नेभिगेसन, उच्च कन्ट्रास्ट र फन्ट जुम सुविधाहरू पूर्ण रूपमा सुनिश्चित गरिएको छ।"
              : "This platform is fully optimized for screen reader accessibility, complete keyboard navigation, high contrast modes, and text enlargement scaling to ensure seamless digital inclusion for blind, low-vision, deaf, hard-of-hearing, and physically disabled users."}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-blue-200">
            <div className="p-2.5 bg-white/10 rounded-lg">{lang === "ne" ? "✓ किबोर्ड नेभिगेसन" : "✓ Keyboard Navigation"}</div>
            <div className="p-2.5 bg-white/10 rounded-lg">{lang === "ne" ? "✓ उच्च कन्ट्रास्ट मोड" : "✓ High Contrast Mode"}</div>
            <div className="p-2.5 bg-white/10 rounded-lg">{lang === "ne" ? "✓ स्क्रिन रिडर लेबलहरू" : "✓ Screen Reader Labels"}</div>
            <div className="p-2.5 bg-white/10 rounded-lg">{lang === "ne" ? "✓ फन्ट जुम स्केलिङ" : "✓ Font Zoom Scaling"}</div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            {lang === "ne" ? "सम्पर्क तथा सहयोग (Support & Helpdesk)" : "Support & Helpdesk"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  {lang === "ne" ? "कार्यालय ठेगाना:" : "Office Address:"}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {lang === "ne" ? "विराटनगर, कोशी प्रदेश, नेपाल" : "Biratnagar, Koshi Province, Nepal"}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <PhoneCall className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  {lang === "ne" ? "सहजकर्ता हटलाइन:" : "Facilitator Hotline:"}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  +977-021-462800 / +977-021-462801
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  {lang === "ne" ? "आधिकारिक इमेल:" : "Official Email:"}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  info.dic@koshi.gov.np
                </span>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer lang={lang} />
    </div>
  );
}
