"use client";

import React from "react";
import { Scale, BookOpen, MapPin, CheckCircle2, Clock, Newspaper, ShieldAlert } from "lucide-react";
import { translations, Language } from "@/lib/translations";
import { useLanguage } from "@/lib/languageContext";

interface StatsCardsProps {
  lang?: Language;
}

export default function StatsCards({ lang: propLang }: StatsCardsProps) {
  const { lang: contextLang } = useLanguage();
  const lang = propLang || contextLang;
  const t = translations[lang];

  // Dynamic statistics indicators matching database requirements
  const stats = [
    {
      title: t.stats_total_laws,
      value: "५२",
      enValue: "52",
      icon: Scale,
      color: "from-blue-600 to-indigo-700",
      textColor: "text-blue-700 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-900",
      desc: t.stats_total_laws_sub
    },
    {
      title: t.stats_federal_laws,
      value: "२८",
      enValue: "28",
      icon: BookOpen,
      color: "from-emerald-600 to-teal-700",
      textColor: "text-emerald-700 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-900",
      desc: t.stats_federal_laws_sub
    },
    {
      title: t.stats_provincial_laws,
      value: "२४",
      enValue: "24",
      icon: MapPin,
      color: "from-purple-600 to-violet-700",
      textColor: "text-purple-700 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-900",
      desc: t.stats_provincial_laws_sub
    },
    {
      title: t.stats_total_palikas,
      value: "१३७",
      enValue: "137",
      icon: MapPin,
      color: "from-sky-600 to-cyan-700",
      textColor: "text-sky-700 dark:text-sky-400",
      borderColor: "border-sky-200 dark:border-sky-900",
      desc: t.stats_total_palikas_sub
    },
    {
      title: t.stats_submitted_reports,
      value: "६४",
      enValue: "64",
      icon: CheckCircle2,
      color: "from-green-600 to-emerald-700",
      textColor: "text-green-700 dark:text-green-400",
      borderColor: "border-green-200 dark:border-green-900",
      desc: t.stats_submitted_reports_sub
    },
    {
      title: t.stats_pending_reports,
      value: "७३",
      enValue: "73",
      icon: Clock,
      color: "from-amber-600 to-yellow-700",
      textColor: "text-amber-700 dark:text-amber-400",
      borderColor: "border-amber-200 dark:border-amber-900",
      desc: t.stats_pending_reports_sub
    },
    {
      title: t.stats_published_news,
      value: "३५",
      enValue: "35",
      icon: Newspaper,
      color: "from-rose-600 to-pink-700",
      textColor: "text-rose-700 dark:text-rose-400",
      borderColor: "border-rose-200 dark:border-rose-900",
      desc: t.stats_published_news_sub
    }
  ];

  return (
    <section aria-labelledby="stats-heading" className="py-8 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="stats-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-blue-700 dark:text-blue-400 inline" aria-hidden="true" />
              <span>{t.stats_heading}</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t.stats_subheading}</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 rounded-full border border-blue-300 dark:border-blue-700">
            {t.stats_fiscal_year}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div 
                key={i}
                className={`bg-white dark:bg-slate-800 rounded-xl p-5 border ${stat.borderColor} shadow-xs hover:shadow-md transition-shadow relative overflow-hidden`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
                    <p className={`text-3xl font-black ${stat.textColor} tracking-tight`}>
                      {lang === "ne" ? stat.value : stat.enValue}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">{stat.desc}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-lg bg-linear-to-br ${stat.color} text-white flex items-center justify-center shadow-xs shrink-0`} aria-hidden="true">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
