"use client";

import React, { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { KOSHI_DISTRICTS, TOTAL_KOSHI_PALIKAS } from "@/lib/koshiGeography";
import { translations, Language } from "@/lib/translations";
import { 
  Building2, 
  MapPin, 
  Search, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Filter,
  ExternalLink,
  Info
} from "lucide-react";
import Link from "next/link";

export default function LocalReportingPage() {
  const [lang, setLang] = useState<Language>("ne");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("taplejung");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const t = translations[lang];

  const selectedDistrict = KOSHI_DISTRICTS.find((d) => d.id === selectedDistrictId);

  // Filter palikas based on selected district, search query, and type filter
  const filteredPalikas = useMemo(() => {
    if (!selectedDistrict) return [];
    return selectedDistrict.local_governments.filter((p) => {
      const matchesSearch = 
        p.name_ne.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name_en.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || p.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [selectedDistrict, searchQuery, typeFilter]);

  // Global search across all 137 palikas if query is 2+ chars
  const globalSearchMatches = useMemo(() => {
    if (searchQuery.trim().length < 2) return [];
    const results: { palika: typeof filteredPalikas[0]; district: typeof selectedDistrict }[] = [];
    KOSHI_DISTRICTS.forEach((d) => {
      d.local_governments.forEach((p) => {
        if (
          p.name_ne.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.name_en.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          results.push({ palika: p, district: d });
        }
      });
    });
    return results;
  }, [searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header lang={lang} onLanguageChange={setLang} />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-hidden">
        {/* Page Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200">
                <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                स्थानीय सरकार प्रतिवेदन पोर्टल
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                अपाङ्गता सम्बन्धी कोशी प्रदेश स्थानीय सरकारको प्रतिवेदन
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-3xl">
                कोशी प्रदेशका <strong>१४ जिल्ला</strong> का <strong>१३७ स्थानीय तह</strong> बाट अपाङ्गता सहायता सहजकर्ताले वार्षिक प्रतिवेदन (आर्थिक वर्ष २०८२/०८३) अनलाइन प्रविष्टि तथा सम्पादन गर्ने आधिकारिक प्रणाली।
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center shrink-0">
              <span className="text-xs font-semibold text-blue-700 block">कुल स्थानीय तह</span>
              <span className="text-3xl font-black text-blue-900">{TOTAL_KOSHI_PALIKAS}</span>
              <span className="text-[11px] text-blue-600 block mt-0.5">१४ वटै जिल्लामा आबद्ध</span>
            </div>
          </div>
        </div>

        {/* Dynamic District & Palika Selection Controls */}
        <section aria-labelledby="selection-heading" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs mb-8">
          <h2 id="selection-heading" className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" aria-hidden="true" />
            <span>जिल्ला तथा स्थानीय तह छनौट गर्नुहोस्</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* 1. District Selector */}
            <div>
              <label htmlFor="district-select-main" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                १. जिल्ला छनौट (१४ जिल्ला)
              </label>
              <select
                id="district-select-main"
                value={selectedDistrictId}
                onChange={(e) => {
                  setSelectedDistrictId(e.target.value);
                  setSearchQuery("");
                }}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm font-semibold rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden"
              >
                {KOSHI_DISTRICTS.map((district, idx) => (
                  <option key={district.id} value={district.id}>
                    {idx + 1}. {district.name_ne} ({district.local_governments.length} स्थानीय तह)
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Palika Type Filter */}
            <div>
              <label htmlFor="type-filter" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                २. स्थानीय तहको प्रकार
              </label>
              <select
                id="type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm font-semibold rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden"
              >
                <option value="all">सबै प्रकार (महानगर, उपमहानगर, नगर, गाउँ)</option>
                <option value="महानगरपालिका">महानगरपालिका</option>
                <option value="उपमहानगरपालिका">उपमहानगरपालिका</option>
                <option value="नगरपालिका">नगरपालिका</option>
                <option value="गाउँपालिका">गाउँपालिका</option>
              </select>
            </div>

            {/* 3. Search input */}
            <div>
              <label htmlFor="palika-search-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                ३. नामबाट खोजी गर्नुहोस्
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                <input
                  id="palika-search-input"
                  type="search"
                  placeholder="पालिकाको नाम टाइप गर्नुहोस्..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Quick District Ribbon Tabs */}
          <div className="pt-4 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-500 block mb-2">
              जिल्ला द्रुत छनौट:
            </span>
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="जिल्लाहरूको सूची">
              {KOSHI_DISTRICTS.map((d, i) => (
                <button
                  key={d.id}
                  role="tab"
                  aria-selected={selectedDistrictId === d.id}
                  onClick={() => {
                    setSelectedDistrictId(d.id);
                    setSearchQuery("");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedDistrictId === d.id
                      ? "bg-blue-900 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {i + 1}. {d.name_ne} ({d.local_governments.length})
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Global Search Results if searching across whole province */}
        {searchQuery.trim().length >= 2 && (
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-700" />
              <span>&ldquo;{searchQuery}&rdquo; खोजी परिणामहरू ({globalSearchMatches.length} भेटिए):</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {globalSearchMatches.map(({ palika, district }) => (
                <div key={palika.id} className="bg-white rounded-xl p-4 border border-amber-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {district?.name_ne} जिल्ला
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{palika.name_ne}</h4>
                    <span className="text-xs text-slate-500">{palika.type}</span>
                  </div>
                  <Link
                    href={`/local-reporting/palika/${palika.id}`}
                    className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors"
                    title="फारम भर्नुहोस्"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Local Governments Grid for Selected District */}
        <section aria-labelledby="palika-list-heading" className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <div>
              <h2 id="palika-list-heading" className="text-xl font-bold text-slate-900">
                {selectedDistrict?.name_ne} जिल्ला अन्तर्गतका स्थानीय तहहरू ({filteredPalikas.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                प्रतिवेदन भर्न वा प्रोफाइल हेर्न सम्बन्धित स्थानीय तहको &lsquo;प्रतिवेदन भर्नुहोस्&rsquo; मा थिच्नुहोस्।
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> पेश भएको
              </span>
              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <Clock className="w-3.5 h-3.5" /> पेश हुन बाँकी
              </span>
            </div>
          </div>

          {filteredPalikas.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <Info className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold">कुनै स्थानीय तह फेला परेन।</p>
              <p className="text-xs text-slate-400">कृपया खोजी शब्द वा प्रकार फिल्टर परिवर्तन गर्नुहोस्।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPalikas.map((palika, idx) => (
                <div
                  key={palika.id}
                  className="rounded-xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between bg-slate-50/50 hover:bg-white group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        palika.type === "महानगरपालिका" 
                          ? "bg-purple-100 text-purple-800 border border-purple-200"
                          : palika.type === "उपमहानगरपालिका"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : palika.type === "नगरपालिका"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-slate-200 text-slate-800 border border-slate-300"
                      }`}>
                        {palika.type}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        #{idx + 1}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                      {palika.name_ne}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">{palika.name_en}</p>

                    <div className="bg-white rounded-lg p-2.5 border border-slate-100 mb-4 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>आ.व. २०८२/०८३ स्थिति:</span>
                        <span className="font-bold text-amber-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> पेश हुन बाँकी
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>सहायता सहजकर्ता:</span>
                        <span className="font-medium text-slate-700">तोकिएको</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200/80">
                    <Link
                      href={`/local-reporting/palika/${palika.id}`}
                      className="flex-1 py-2 px-3 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>प्रतिवेदन भर्नुहोस्</span>
                    </Link>
                    <Link
                      href={`/local-reporting/palika/${palika.id}/profile`}
                      className="py-2 px-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors"
                      title="पालिका प्रोफाइल"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
