"use client";

import React from "react";
import { Scale, BookOpen, MapPin, CheckCircle2, Clock, Newspaper, ShieldAlert } from "lucide-react";
import { translations, Language } from "@/lib/translations";

interface StatsCardsProps {
  lang: Language;
}

export default function StatsCards({ lang }: StatsCardsProps) {
  const t = translations[lang];

  // Dynamic statistics indicators matching database requirements
  const stats = [
    {
      title: t.stats_total_laws,
      value: "५२",
      enValue: "52",
      icon: Scale,
      color: "from-blue-600 to-indigo-700",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
      desc: "ऐन, नियमावली, कार्यविधि तथा निर्देशिका"
    },
    {
      title: t.stats_federal_laws,
      value: "२८",
      enValue: "28",
      icon: BookOpen,
      color: "from-emerald-600 to-teal-700",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200",
      desc: "संघीय सरकार मातहतका कानुनी दस्तावेज"
    },
    {
      title: t.stats_provincial_laws,
      value: "२४",
      enValue: "24",
      icon: MapPin,
      color: "from-purple-600 to-violet-700",
      textColor: "text-purple-700",
      borderColor: "border-purple-200",
      desc: "कोशी तथा अन्य प्रदेश सरकारका कानुन"
    },
    {
      title: t.stats_total_palikas,
      value: "१३७",
      enValue: "137",
      icon: MapPin,
      color: "from-sky-600 to-cyan-700",
      textColor: "text-sky-700",
      borderColor: "border-sky-200",
      desc: "कोशी प्रदेशका १४ जिल्लाका सम्पूर्ण स्थानीय तह"
    },
    {
      title: t.stats_submitted_reports,
      value: "६४",
      enValue: "64",
      icon: CheckCircle2,
      color: "from-green-600 to-emerald-700",
      textColor: "text-green-700",
      borderColor: "border-green-200",
      desc: "आर्थिक वर्ष २०८२/०८३ वार्षिक प्रतिवेदन प्राप्त"
    },
    {
      title: t.stats_pending_reports,
      value: "७३",
      enValue: "73",
      icon: Clock,
      color: "from-amber-600 to-yellow-700",
      textColor: "text-amber-700",
      borderColor: "border-amber-200",
      desc: "प्रविष्टि बाँकी रहेका स्थानीय तह"
    },
    {
      title: t.stats_published_news,
      value: "३५",
      enValue: "35",
      icon: Newspaper,
      color: "from-rose-600 to-pink-700",
      textColor: "text-rose-700",
      borderColor: "border-rose-200",
      desc: "सूचना, परिपत्र तथा कार्यक्रम घोषणाहरू"
    }
  ];

  return (
    <section aria-labelledby="stats-heading" className="py-8 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="stats-heading" className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-blue-700 inline" aria-hidden="true" />
              <span>प्रणालीको हालको तथ्यांक सारांश</span>
            </h2>
            <p className="text-sm text-slate-600">कोशी प्रदेशका स्थानीय तह र कानुनी संग्रहको वास्तविक अवस्था</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full border border-blue-300">
            आ.व. २०८२/०८३ अद्यावधिक
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div 
                key={i}
                className={`bg-white rounded-xl p-5 border ${stat.borderColor} shadow-xs hover:shadow-md transition-shadow relative overflow-hidden`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">{stat.title}</p>
                    <p className={`text-3xl font-black ${stat.textColor} tracking-tight`}>
                      {lang === "ne" ? stat.value : stat.enValue}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">{stat.desc}</p>
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
