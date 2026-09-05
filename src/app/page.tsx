"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import StatsCards from "@/components/StatsCards";
import QuickPalikaFinder from "@/components/QuickPalikaFinder";
import Footer from "@/components/Footer";
import { translations, Language } from "@/lib/translations";
import { 
  FileText, 
  Building2, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  Award, 
  Scale, 
  Layers, 
  DownloadCloud,
  FileCheck2
} from "lucide-react";

export default function HomePage() {
  const [lang, setLang] = useState<Language>("ne");
  const t = translations[lang];

  return (
    <div className="flex-1 flex flex-col">
      <Header lang={lang} onLanguageChange={setLang} />

      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-hidden">
        {/* HERO SECTION */}
        <section aria-labelledby="hero-title" className="relative bg-linear-to-b from-slate-900 via-blue-950 to-slate-900 text-white py-16 sm:py-24 overflow-hidden border-b-4 border-amber-500">
          {/* Subtle decorative background glow */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" aria-hidden="true" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-800/60 border border-blue-400/40 rounded-full text-xs font-semibold text-amber-300 mb-6 backdrop-blur-xs">
              <Award className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>नेपालको एकीकृत अपाङ्गता सूचना तथा तथ्यांक व्यवस्थापन प्रणाली</span>
            </div>

            <h1 id="hero-title" className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
              {t.hero_title}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-blue-200 mt-4 font-medium max-w-3xl mx-auto">
              {t.hero_subtitle}
            </p>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-3">
              कोशी प्रदेशका १४ जिल्लाका १३७ स्थानीय तहबाट वार्षिक प्रतिवेदन संकलन, संघीय तथा प्रदेश कानुनको डिजिटल भण्डार र विस्तृत विषयगत विश्लेषण।
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/laws"
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <FileText className="w-5 h-5" aria-hidden="true" />
                <span>{t.hero_btn_laws}</span>
              </Link>
              <Link
                href="/local-reporting"
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/20 flex items-center gap-2 border border-blue-400/30 transition-all transform hover:-translate-y-0.5"
              >
                <Building2 className="w-5 h-5" aria-hidden="true" />
                <span>{t.hero_btn_reporting}</span>
              </Link>
              <Link
                href="/reports"
                className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-base border border-slate-600 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <BarChart3 className="w-5 h-5 text-amber-400" aria-hidden="true" />
                <span>{t.hero_btn_reports}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* DYNAMIC STATISTICS SECTION */}
        <StatsCards lang={lang} />

        {/* THREE CORE PILLARS SECTION */}
        <section aria-labelledby="pillars-heading" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 id="pillars-heading" className="text-2xl sm:text-3xl font-black text-slate-900">
                {t.section_pillars}
              </h2>
              <p className="text-base text-slate-600 mt-2">
                अपाङ्गता क्षेत्रमा नीतिगत स्पष्टता, स्थानीय तहको जवाफदेहिता र प्रमाणमा आधारित निर्णय निर्माण
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Pillar 1: Law Repository */}
              <div className="rounded-2xl border border-slate-200 p-7 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Scale className="w-7 h-7" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {t.pillar_laws_title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {t.pillar_laws_desc}
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 mb-6 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>संघीय ऐन, नियमावली, कार्यविधि र निर्देशिका</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>कोशी सहित सबै ७ प्रदेशका कानुनहरू</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>PDF पूर्वावलोकन तथा तुरुन्त डाउनलोड</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/laws"
                  className="inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-900 gap-1.5"
                >
                  <span>कानुनी दस्तावेज खोल्नुहोस्</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Pillar 2: Local Reporting System */}
              <div className="rounded-2xl border-2 border-blue-600/30 p-7 bg-blue-50/30 hover:bg-white hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  मुख्य प्रणाली
                </div>
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md">
                    <FileCheck2 className="w-7 h-7" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {t.pillar_reporting_title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {t.pillar_reporting_desc}
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 mb-6 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>आर्थिक वर्ष २०८२/०८३ वार्षिक प्रतिवेदन (४४ प्रश्न)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>अनुसूची १.१ (गृहभेट) र १.२ (सहायक सामग्री)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>महिला+पुरुष स्वचालित हिसाब तथा Save Draft</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/local-reporting"
                  className="inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-900 gap-1.5"
                >
                  <span>प्रतिवेदन प्रणालीमा प्रवेश गर्नुहोस्</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Pillar 3: Subject-Wise Reports & Analytics */}
              <div className="rounded-2xl border border-slate-200 p-7 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-7 h-7" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {t.pillar_analytics_title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {t.pillar_analytics_desc}
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 mb-6 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>विषयगत छुट्टाछुट्टै चार्ट तथा Accessible तालिकाहरू</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>कोशी प्रदेश समग्र र जिल्लागत तुलना</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Excel (मूल ढाँचा) तथा PDF रिपोर्ट डाउनलोड</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/reports"
                  className="inline-flex items-center text-sm font-bold text-purple-700 hover:text-purple-900 gap-1.5"
                >
                  <span>तथ्यांक विश्लेषण हेर्नुहोस्</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK PALIKA FINDER SECTION */}
        <QuickPalikaFinder lang={lang} />
      </main>

      <Footer lang={lang} />
    </div>
  );
}
