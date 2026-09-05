"use client";

import React, { useState } from "react";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import { translations, Language } from "@/lib/translations";
import { Search, MapPin, Building, ArrowRight } from "lucide-react";
import Link from "next/link";

interface QuickPalikaFinderProps {
  lang: Language;
}

export default function QuickPalikaFinder({ lang }: QuickPalikaFinderProps) {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [selectedPalikaId, setSelectedPalikaId] = useState<string>("");

  const t = translations[lang];

  const currentDistrict = KOSHI_DISTRICTS.find((d) => d.id === selectedDistrictId);
  const palikas = currentDistrict ? currentDistrict.local_governments : [];

  return (
    <section aria-labelledby="quick-finder-heading" className="py-10 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
          <div className="max-w-3xl mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-amber-400/30">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              कोशी प्रदेशका १४ जिल्ला र १३७ स्थानीय तह
            </span>
            <h2 id="quick-finder-heading" className="text-2xl sm:text-3xl font-black tracking-tight">
              स्थानीय सरकार वार्षिक प्रतिवेदन खोजी तथा प्रविष्टि
            </h2>
            <p className="text-sm sm:text-base text-blue-100 mt-2">
              जिल्ला छनौट गरी सम्बन्धित स्थानीय तहको वार्षिक कार्यसम्पादन प्रतिवेदन भर्नुहोस् वा प्रोफाइल हेर्नुहोस्।
            </p>
          </div>

          <form 
            onSubmit={(e) => e.preventDefault()}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20"
          >
            {/* District Select */}
            <div>
              <label htmlFor="district-select" className="block text-xs font-bold text-amber-300 mb-1.5">
                १. जिल्ला छनौट गर्नुहोस्
              </label>
              <select
                id="district-select"
                value={selectedDistrictId}
                onChange={(e) => {
                  setSelectedDistrictId(e.target.value);
                  setSelectedPalikaId("");
                }}
                className="w-full bg-slate-900 text-white text-sm rounded-lg px-3.5 py-2.5 border border-slate-700 focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
              >
                <option value="">{t.select_district}</option>
                {KOSHI_DISTRICTS.map((district) => (
                  <option key={district.id} value={district.id}>
                    {lang === "ne" ? district.name_ne : district.name_en} ({district.local_governments.length} स्थानीय तह)
                  </option>
                ))}
              </select>
            </div>

            {/* Palika Select */}
            <div>
              <label htmlFor="palika-select" className="block text-xs font-bold text-amber-300 mb-1.5">
                २. स्थानीय तह छनौट गर्नुहोस्
              </label>
              <select
                id="palika-select"
                disabled={!selectedDistrictId}
                value={selectedPalikaId}
                onChange={(e) => setSelectedPalikaId(e.target.value)}
                className={`w-full text-sm rounded-lg px-3.5 py-2.5 border focus:ring-2 focus:ring-amber-400 focus:outline-hidden ${
                  selectedDistrictId 
                    ? "bg-slate-900 text-white border-slate-700" 
                    : "bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed opacity-60"
                }`}
              >
                <option value="">
                  {selectedDistrictId ? t.select_palika : "-- पहिले जिल्ला छान्नुहोस् --"}
                </option>
                {palikas.map((palika) => (
                  <option key={palika.id} value={palika.id}>
                    {lang === "ne" ? palika.name_ne : palika.name_en} ({palika.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Action Button */}
            <div className="flex items-end">
              <Link
                href={selectedPalikaId ? `/local-reporting/palika/${selectedPalikaId}` : "#"}
                aria-disabled={!selectedPalikaId}
                className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  selectedPalikaId 
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer" 
                    : "bg-slate-700 text-slate-400 cursor-not-allowed pointer-events-none"
                }`}
              >
                <span>{t.go_to_palika}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </form>

          {/* Quick palika badges when district selected */}
          {currentDistrict && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs font-semibold text-slate-300 mb-2">
                {currentDistrict.name_ne} जिल्लाका स्थानीय तहहरू:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {palikas.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPalikaId(p.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selectedPalikaId === p.id
                        ? "bg-amber-400 text-slate-950 font-bold border-amber-300"
                        : "bg-white/5 text-slate-200 border-white/10 hover:bg-white/15"
                    }`}
                  >
                    {p.name_ne}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
