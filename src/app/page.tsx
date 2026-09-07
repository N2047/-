"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import StatsCards from "@/components/StatsCards";
import QuickPalikaFinder from "@/components/QuickPalikaFinder";
import Footer from "@/components/Footer";
import { translations } from "@/lib/translations";
import { useLanguage } from "@/lib/languageContext";
import { 
  FileText, 
  Building2, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Award, 
  Scale, 
  FileCheck2
} from "lucide-react";

export default function HomePage() {
  const { lang, setLang } = useLanguage();
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
              <span>{t.hero_banner_tag}</span>
            </div>

            <h1 id="hero-title" className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
              {t.hero_title}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-blue-200 mt-4 font-medium max-w-3xl mx-auto">
              {t.hero_subtitle}
            </p>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-3">
              {t.hero_desc}
            </p>

            {/* Action Buttons: कानुन, १. पालिका प्रतिवेदन, २. समग्र प्रतिवेदन */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/laws"
                className="px-5 sm:px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <FileText className="w-5 h-5" aria-hidden="true" />
                <span>{t.hero_btn_laws}</span>
              </Link>

              {/* १. पालिका प्रतिवेदन (प्रत्येक वा सेलेक्ट गरिएको पालिका) */}
              <Link
                href="/local-reporting"
                className="px-5 sm:px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/25 flex items-center gap-2 border border-blue-400/40 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                title={lang === "ne" ? "प्रत्येक पालिका वा सेलेक्ट गरिएको पालिकाको प्रतिवेदन हेर्नुहोस्" : "View local government report"}
              >
                <Building2 className="w-5 h-5 text-amber-300" aria-hidden="true" />
                <div className="text-left">
                  <span>{t.hero_btn_reporting}</span>
                  <span className="block text-[10px] text-blue-200 font-normal">{t.hero_reporting_sub}</span>
                </div>
              </Link>

              {/* २. समग्र प्रतिवेदन (सबै १३७ पालिकाको कम्पाइल प्रतिवेदन) */}
              <Link
                href="/reports"
                className="px-5 sm:px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 flex items-center gap-2 border border-emerald-400/40 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                title={lang === "ne" ? "सबै १३७ स्थानीय तहको एकीकृत कम्पाइल प्रतिवेदन तथा विषयगत विश्लेषण" : "Compiled report of all 137 palikas"}
              >
                <BarChart3 className="w-5 h-5 text-amber-300" aria-hidden="true" />
                <div className="text-left">
                  <span>{t.hero_btn_reports}</span>
                  <span className="block text-[10px] text-emerald-200 font-normal">{t.hero_reports_sub}</span>
                </div>
              </Link>
            </div>

            {/* Sub-Banner Quick Indicator */}
            <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-xs text-slate-300">
              <span className="font-bold text-amber-400">{t.hero_classification}</span>
              <Link href="/local-reporting" className="hover:text-amber-300 underline font-medium">
                {t.hero_classification_palika}
              </Link>
              <span className="text-slate-500">|</span>
              <Link href="/reports" className="hover:text-amber-300 underline font-medium">
                {t.hero_classification_overall}
              </Link>
            </div>
          </div>
        </section>

        {/* DYNAMIC STATISTICS SECTION */}
        <StatsCards lang={lang} />

        {/* THREE CORE PILLARS SECTION */}
        <section aria-labelledby="pillars-heading" className="py-16 bg-white dark:bg-slate-900 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 id="pillars-heading" className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {t.section_pillars}
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-300 mt-2">
                {t.section_pillars_sub}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Pillar 1: Law Repository */}
              <div className="a11y-card rounded-2xl border border-slate-200 dark:border-slate-800 p-7 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Scale className="w-7 h-7" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {t.pillar_laws_title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {t.pillar_laws_desc}
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 mb-6 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t.pillar_laws_b1}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t.pillar_laws_b2}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t.pillar_laws_b3}</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/laws"
                  className="inline-flex items-center text-sm font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 gap-1.5"
                >
                  <span>{t.pillar_laws_btn}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Pillar 2: Local Reporting System */}
              <div className="a11y-card rounded-2xl border-2 border-blue-600/30 dark:border-blue-500/40 p-7 bg-blue-50/30 dark:bg-blue-950/20 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {t.pillar_reporting_badge}
                </div>
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md">
                    <FileCheck2 className="w-7 h-7" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {t.pillar_reporting_title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {t.pillar_reporting_desc}
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 mb-6 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t.pillar_reporting_b1}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t.pillar_reporting_b2}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t.pillar_reporting_b3}</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/local-reporting"
                  className="inline-flex items-center text-sm font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 gap-1.5"
                >
                  <span>{t.pillar_reporting_btn}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Pillar 3: Subject-Wise Reports & Analytics */}
              <div className="a11y-card rounded-2xl border border-slate-200 dark:border-slate-800 p-7 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-7 h-7" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {t.pillar_analytics_title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {t.pillar_analytics_desc}
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 mb-6 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t.pillar_analytics_b1}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t.pillar_analytics_b2}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t.pillar_analytics_b3}</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/reports"
                  className="inline-flex items-center text-sm font-bold text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 gap-1.5"
                >
                  <span>{t.pillar_analytics_btn}</span>
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
