"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import StatsCards from "@/components/StatsCards";
import Footer from "@/components/Footer";
import { translations } from "@/lib/translations";
import { useLanguage } from "@/lib/languageContext";
import { 
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

      </main>

      <Footer lang={lang} />
    </div>
  );
}
