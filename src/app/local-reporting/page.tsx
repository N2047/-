"use client";

import React, { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { KOSHI_DISTRICTS, TOTAL_KOSHI_PALIKAS, getAllPalikas, findPalikaById } from "@/lib/koshiGeography";
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
  Info,
  Edit3,
  ShieldCheck,
  Lock,
  UserCheck,
  BarChart3,
  Calendar,
  Users,
  Eye,
  RotateCcw
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";

export default function LocalReportingPage() {
  const [lang, setLang] = useState<Language>("ne");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("taplejung");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Single Palika focused view state
  const [selectedSinglePalikaId, setSelectedSinglePalikaId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"all" | "single">("all");

  const { user, isAuthenticated } = useAuth();
  const isSuperAdmin = user?.role === "super_admin" || user?.role === "provincial_admin";
  const isEmployee = user?.role === "employee" || user?.role === "palika_staff";
  const isNormalUser = user?.role === "normal_user";
  const assignedPalikaId = user?.palika_id || user?.palikaId;
  const assignedPalikaName = user?.palika_name || user?.palikaName;

  const t = translations[lang];

  const selectedDistrict = KOSHI_DISTRICTS.find((d) => d.id === selectedDistrictId);
  const selectedSinglePalikaData = selectedSinglePalikaId ? findPalikaById(selectedSinglePalikaId) : null;

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
        
        {/* DUAL REPORT NAVIGATION SWITCHER: १. पालिका प्रतिवेदन vs २. समग्र प्रतिवेदन */}
        <div className="flex items-center justify-center p-1.5 bg-slate-200/90 dark:bg-slate-800 rounded-2xl max-w-2xl mx-auto mb-8 shadow-xs border border-slate-300 dark:border-slate-700">
          <Link
            href="/local-reporting"
            className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 bg-blue-900 text-white shadow-sm transition-all"
            aria-current="page"
          >
            <Building2 className="w-4 h-4 text-amber-300 shrink-0" />
            <span>१. पालिका प्रतिवेदन (स्थानीय तहगत)</span>
          </Link>
          <Link
            href="/reports"
            className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 text-slate-700 hover:text-blue-900 hover:bg-white/60 transition-all"
          >
            <BarChart3 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>२. समग्र प्रतिवेदन (सबै १३७ पालिका कम्पाइल)</span>
          </Link>
        </div>

        {/* PROMINENT ASSIGNED PALIKA BANNER FOR EMPLOYEE (Requirement 32-34) */}
        {isAuthenticated && isEmployee && assignedPalikaId && (
          <div className="mb-8 bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border-2 border-emerald-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-md">
                🏛️ तपाईंको तोकिएको स्थानीय तह
              </span>
              <h2 className="text-xl sm:text-2xl font-black mt-1.5 text-white">
                {assignedPalikaName} — वार्षिक प्रतिवेदन सम्पादन
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                तपाईंलाई यस स्थानीय तहको प्रतिवेदन भर्न, मस्यौदा सुरक्षित गर्न र अन्तिम पेश गर्ने अधिकृत पहुँच छ।
              </p>
            </div>
            <Link
              href={`/local-reporting/palika/${assignedPalikaId}`}
              className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-md flex items-center gap-2 shrink-0 transition-transform transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>मेरो पालिकाको फारम खोल्नुहोस्</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

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
                कोशी प्रदेशका <strong>१४ जिल्ला</strong> का <strong>१३७ स्थानीय तह</strong> बाट प्रत्येक पालिकाको छुट्टाछुट्टै प्रतिवेदन वा कुनै सेलेक्ट गरिएको पालिकाको प्रतिवेदन मात्र हेर्ने र प्रविष्टि गर्ने प्रणाली।
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center shrink-0">
              <span className="text-xs font-semibold text-blue-700 block">कुल स्थानीय तह</span>
              <span className="text-3xl font-black text-blue-900">{TOTAL_KOSHI_PALIKAS}</span>
              <span className="text-[11px] text-blue-600 block mt-0.5">१४ वटै जिल्लामा आबद्ध</span>
            </div>
          </div>
        </div>

        {/* 🎯 SINGLE PALIKA SELECTOR & FOCUS MODE: "सेलेक्ट गरिएको पालिकाको प्रतिवेदन मात्र हेर्नुहोस्" */}
        <section aria-labelledby="single-select-heading" className="p-5 sm:p-6 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white rounded-3xl mb-8 shadow-xl border-2 border-blue-500/40 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-lg text-xl">
                🎯
              </div>
              <div>
                <h2 id="single-select-heading" className="font-black text-base sm:text-lg text-white flex items-center gap-2">
                  <span>सेलेक्ट गरिएको पालिकाको प्रतिवेदन मात्र हेर्नुहोस्</span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold border border-amber-400/40">
                    द्रुत फिल्टर
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-blue-200 mt-1">
                  कोशी प्रदेशका १३७ स्थानीय तहमध्ये कुनै एक पालिका छान्नुहोस् र सोही पालिकाको मात्र प्रतिवेदन हेर्नुहोस्:
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1.5 bg-blue-900/60 p-1 rounded-xl border border-blue-700 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "all" ? "bg-amber-400 text-slate-950 shadow-xs" : "text-blue-200 hover:text-white"
                }`}
              >
                📋 सबै १३७ पालिका
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!selectedSinglePalikaId) {
                    setSelectedSinglePalikaId("phidim_mun");
                  }
                  setViewMode("single");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "single" ? "bg-amber-400 text-slate-950 shadow-xs" : "text-blue-200 hover:text-white"
                }`}
              >
                🎯 सेलेक्ट गरिएको पालिका मात्र
              </button>
            </div>
          </div>

          {/* Selector Dropdown */}
          <div className="mt-5 pt-4 border-t border-blue-800/60 flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:flex-1">
              <label htmlFor="single-palika-select" className="sr-only">स्थानीय तह छनौट गर्नुहोस्</label>
              <select
                id="single-palika-select"
                value={selectedSinglePalikaId}
                onChange={(e) => {
                  setSelectedSinglePalikaId(e.target.value);
                  setViewMode("single");
                }}
                className="w-full bg-slate-900/95 border-2 border-blue-400/60 text-white text-xs sm:text-sm font-bold rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:outline-hidden cursor-pointer shadow-inner"
              >
                <option value="">-- कुनै एक स्थानीय तह छनौट गर्नुहोस् (१४ जिल्लाका १३७ पालिका) --</option>
                {KOSHI_DISTRICTS.map((d) => (
                  <optgroup key={d.id} label={`📍 ${d.name_ne} जिल्ला (${d.local_governments.length} स्थानीय तह)`}>
                    {d.local_governments.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name_ne} ({p.type}) - {d.name_ne} जिल्ला
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {selectedSinglePalikaId && (
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <Link
                  href={`/local-reporting/palika/${selectedSinglePalikaId}/profile`}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
                  title="यो पालिकाको पूर्ण प्रतिवेदन खोल्नुहोस्"
                >
                  <FileText className="w-4 h-4" />
                  <span>📄 यो पालिकाको प्रतिवेदन खोल्नुहोस्</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {viewMode === "single" && (
                  <button
                    type="button"
                    onClick={() => setViewMode("all")}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer border border-slate-700"
                    title="सबै पालिकाको सूचीमा फर्कनुहोस्"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden md:inline">सबै हेर्नुहोस्</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* FOCUSED SINGLE PALIKA REPORT CARD: Shown when viewMode === 'single' */}
        {viewMode === "single" && selectedSinglePalikaData && (
          <section className="bg-gradient-to-br from-white to-blue-50/40 rounded-3xl p-6 sm:p-8 border-2 border-blue-600 shadow-xl mb-8 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-blue-200">
              <div>
                <span className="text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-950 px-2.5 py-1 rounded-lg border border-blue-300">
                  🎯 सेलेक्ट गरिएको पालिकाको प्रतिवेदन
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                  {selectedSinglePalikaData.palika.name_ne}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  {selectedSinglePalikaData.palika.name_en} | {selectedSinglePalikaData.district.name_ne} जिल्ला, कोशी प्रदेश
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  आ.व. २०८२/०८३ वार्षिक विवरण
                </span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-500 block">तहको प्रकार</span>
                <span className="text-sm sm:text-base font-black text-slate-900 mt-1 block">
                  {selectedSinglePalikaData.palika.type}
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-500 block">जिल्ला</span>
                <span className="text-sm sm:text-base font-black text-blue-900 mt-1 block">
                  {selectedSinglePalikaData.district.name_ne} जिल्ला
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-500 block">अपाङ्गता सहायता सहजकर्ता</span>
                <span className="text-sm sm:text-base font-black text-emerald-800 mt-1 block">
                  तोकिएको (सक्रिय)
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-500 block">प्रतिवेदन स्थिति</span>
                <span className="text-sm sm:text-base font-black text-amber-700 mt-1 block">
                  मस्यौदा / पेश गर्न सकिने
                </span>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
              <Link
                href={`/local-reporting/palika/${selectedSinglePalikaData.palika.id}/profile`}
                className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black text-sm shadow-md flex items-center gap-2 transition-transform transform hover:-translate-y-0.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>📄 {selectedSinglePalikaData.palika.name_ne} को पूर्ण प्रतिवेदन हेर्नुहोस्</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {(!isNormalUser && (isSuperAdmin || (isEmployee && assignedPalikaId === selectedSinglePalikaData.palika.id))) && (
                <Link
                  href={`/local-reporting/palika/${selectedSinglePalikaData.palika.id}`}
                  className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md flex items-center gap-2 transition-transform transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>फारम भर्नुहोस् / सम्पादन गर्नुहोस्</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => setViewMode("all")}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-300 ml-auto cursor-pointer"
              >
                📋 सबै १३७ स्थानीय तह सूचीमा फर्कनुहोस्
              </button>
            </div>
          </section>
        )}

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
                    href={`/local-reporting/palika/${palika.id}/profile`}
                    className="px-3 py-1.5 rounded-lg bg-blue-900 text-white hover:bg-blue-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="पालिका प्रतिवेदन हेर्नुहोस्"
                  >
                    <Building2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>📄 पालिका प्रतिवेदन</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
                सम्बन्धित स्थानीय तहको अपाङ्गता विवरण, प्रोफाइल तथा सार्वजनिक तथ्याङ्क प्रतिवेदन हेर्न &lsquo;पालिका प्रोफाइल&rsquo; मा थिच्नुहोस्।
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

                  {(() => {
                    const canEditThisPalika = !isNormalUser && (
                      isSuperAdmin || 
                      (isEmployee && user?.account_status === "approved" && assignedPalikaId === palika.id)
                    );

                    return (
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-200/80">
                        {/* Show form edit button ONLY for Super Admin OR assigned Employee */}
                        {canEditThisPalika && (
                          <Link
                            href={`/local-reporting/palika/${palika.id}`}
                            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                              isSuperAdmin
                                ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                                : "bg-emerald-700 hover:bg-emerald-600 text-white"
                            }`}
                          >
                            {isSuperAdmin ? (
                              <>
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>डाटा सच्याउनुहोस्</span>
                              </>
                            ) : (
                              <>
                                <FileText className="w-3.5 h-3.5" />
                                <span>मेरो पालिका फारम</span>
                              </>
                            )}
                          </Link>
                        )}

                        {/* Palika Report Button: Always visible, clearly displaying 'पालिका प्रतिवेदन हेर्नुहोस्' */}
                        <Link
                          href={`/local-reporting/palika/${palika.id}/profile`}
                          className={`py-2.5 px-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                            !canEditThisPalika
                              ? "w-full flex-1 bg-blue-900 hover:bg-blue-800 text-white shadow-md hover:shadow-lg"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
                          }`}
                          title={`${palika.name_ne} को वार्षिक प्रतिवेदन तथा तथ्याङ्क हेर्नुहोस्`}
                        >
                          <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>📄 पालिका प्रतिवेदन हेर्नुहोस्</span>
                          {!canEditThisPalika && (
                            <ArrowRight className="w-4 h-4 ml-auto text-blue-200 shrink-0" />
                          )}
                        </Link>

                        {/* Quick Focus Button to isolate only this palika */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSinglePalikaId(palika.id);
                            setViewMode("single");
                            window.scrollTo({ top: 120, behavior: "smooth" });
                          }}
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-950 border border-slate-200 transition-colors cursor-pointer"
                          title={`${palika.name_ne} को मात्र प्रतिवेदन हेर्नुहोस् (फोकस मोड)`}
                        >
                          <Eye className="w-4 h-4 text-blue-700" />
                        </button>
                      </div>
                    );
                  })()}
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
