"use client";

import React, { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LawDocumentModal from "@/components/laws/LawDocumentModal";
import { 
  LEGAL_DOCUMENTS, 
  LAW_CATEGORIES, 
  NEPAL_PROVINCES, 
  LawDocument, 
  LawCategory, 
  GovLevel 
} from "@/lib/lawsData";
import { LAW_THEMES, getLawTheme } from "@/lib/lawTheme";
import { translations } from "@/lib/translations";
import { useLanguage } from "@/lib/languageContext";
import { 
  Scale, 
  Search, 
  Building2, 
  FileText, 
  Download, 
  Eye, 
  Globe2
} from "lucide-react";

export default function LawsPage() {
  const { lang, setLang } = useLanguage();
  const [docs, setDocs] = useState<LawDocument[]>(LEGAL_DOCUMENTS);
  const [activeTab, setActiveTab] = useState<GovLevel>("federal");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDoc, setSelectedDoc] = useState<LawDocument | null>(null);

  useEffect(() => {
    fetch("/api/laws")
      .then((res) => res.json())
      .then((data) => {
        if (data?.laws && Array.isArray(data.laws) && data.laws.length > 0) {
          setDocs(data.laws);
        }
      })
      .catch((err) => console.error("Failed to load live laws:", err));
  }, []);

  const t = translations[lang];

  const getLocalizedCategoryName = (catId: LawCategory) => {
    if (lang === "ne") {
      switch (catId) {
        case "act": return "ऐन";
        case "rule": return "नियमावली";
        case "procedure": return "कार्यविधि";
        case "directive": return "निर्देशिका";
        case "guideline": return "मार्गदर्शन";
        case "circular": return "परिपत्र";
        default: return catId;
      }
    }
    switch (catId) {
      case "act": return "Act";
      case "rule": return "Regulation";
      case "procedure": return "Procedure";
      case "directive": return "Directive";
      case "guideline": return "Guideline";
      case "circular": return "Circular";
      default: return catId;
    }
  };

  const getLocalizedProvinceName = (provId?: string) => {
    const p = NEPAL_PROVINCES.find(pr => pr.id === provId);
    if (!p) return lang === "ne" ? "प्रदेश सरकार" : "Provincial Government";
    return lang === "ne" ? p.name_ne : p.name_en;
  };

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return docs.filter((doc) => {
      // Tab filter (federal vs provincial)
      if (activeTab === "federal" && doc.gov_level !== "federal") return false;
      if (activeTab === "provincial" && doc.gov_level !== "provincial") return false;

      // Province filter (if provincial tab)
      if (activeTab === "provincial" && selectedProvince !== "all") {
        if (doc.province_id !== selectedProvince) return false;
      }

      // Category filter
      if (selectedCategory !== "all" && doc.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = doc.title_ne.toLowerCase().includes(q) || doc.title_en.toLowerCase().includes(q);
        const matchesDesc = doc.description_ne.toLowerCase().includes(q);
        const matchesKeywords = doc.keywords.some((k) => k.toLowerCase().includes(q));
        const matchesAuthority = doc.issuing_authority.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesKeywords || matchesAuthority;
      }

      return true;
    });
  }, [docs, activeTab, selectedCategory, selectedProvince, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Header lang={lang} onLanguageChange={setLang} />

      {/* MODAL FOR LAW VIEW & PDF PREVIEW */}
      <LawDocumentModal document={selectedDoc} onClose={() => setSelectedDoc(null)} />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl 2xl:max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-hidden">
        
        {/* Page Hero Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200 dark:border-blue-800">
                <Scale className="w-3.5 h-3.5" aria-hidden="true" />
                {t.laws.badge}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {t.laws.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-3xl leading-relaxed">
                {t.laws.description}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center">
              <div>
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 block">
                  {lang === 'en' ? 'Total Documents' : 'कुल दस्तावेजहरू'}
                </span>
                <span className="text-3xl font-black text-blue-950 dark:text-white">{docs.length}</span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 block">
                  {lang === 'en' ? 'PDF & Digital Copies' : 'PDF र डिजिटल प्रति'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Tabs: संघीय सरकार vs प्रदेश सरकार */}
        <div className="flex border-b-2 border-slate-200 dark:border-slate-800 mb-6 gap-2" role="tablist" aria-label="Government Level">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "federal"}
            onClick={() => {
              setActiveTab("federal");
              setSelectedProvince("all");
            }}
            className={`py-3.5 px-6 font-bold text-sm sm:text-base rounded-t-xl transition-all flex items-center gap-2 border-t-2 border-x-2 -mb-0.5 cursor-pointer ${
              activeTab === "federal"
                ? "bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-400 border-blue-900 dark:border-blue-600 border-b-white dark:border-b-slate-900 shadow-xs"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{t.laws.federalTab}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "provincial"}
            onClick={() => setActiveTab("provincial")}
            className={`py-3.5 px-6 font-bold text-sm sm:text-base rounded-t-xl transition-all flex items-center gap-2 border-t-2 border-x-2 -mb-0.5 cursor-pointer ${
              activeTab === "provincial"
                ? "bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-400 border-blue-900 dark:border-blue-600 border-b-white dark:border-b-slate-900 shadow-xs"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>{t.laws.provincialTab}</span>
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <section aria-labelledby="filter-heading" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs mb-8">
          <h2 id="filter-heading" className="sr-only">{lang === 'en' ? 'Filters' : 'फिल्टरहरू'}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className={activeTab === "provincial" ? "lg:col-span-2" : "lg:col-span-2"}>
              <label htmlFor="law-search" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {lang === 'en' ? 'Search by Keyword / Title' : 'कानुनको नाम वा कुञ्जीशब्दबाट खोजी'}
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                <input
                  id="law-search"
                  type="search"
                  placeholder={t.laws.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-medium"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label htmlFor="category-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {lang === 'en' ? 'Document Category' : 'दस्तावेजको श्रेणी'}
              </label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-semibold focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="all">{t.laws.categoryAll}</option>
                {LAW_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getLocalizedCategoryName(c.id)}
                  </option>
                ))}
              </select>
            </div>

            {/* Province Dropdown (Only for Provincial Tab) */}
            {activeTab === "provincial" ? (
              <div>
                <label htmlFor="province-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {lang === 'en' ? 'Select Province' : 'प्रदेश छनौट गर्नुहोस्'}
                </label>
                <select
                  id="province-select"
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-semibold focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  <option value="all">{lang === 'en' ? 'All 7 Provinces' : 'सबै ७ प्रदेशहरू'}</option>
                  {NEPAL_PROVINCES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {lang === "ne" ? p.name_ne : p.name_en}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {lang === 'en' ? 'Quick Actions' : 'द्रुत कार्य'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
                >
                  {lang === 'en' ? 'Reset Filters' : 'फिल्टर रिसेट गर्नुहोस्'}
                </button>
              </div>
            )}
          </div>

          {/* Category Filter Bar - Full Line Width, Prominent Typography, Exact Requested Colors */}
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 sm:gap-3 w-full">
              {/* Category Prefix Label matching user's screenshot */}
              <div className="flex items-center gap-1.5 shrink-0 self-start lg:self-center">
                <span className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5 whitespace-nowrap">
                  <span>⚖️</span>
                  <span>{lang === 'en' ? 'Category:' : 'श्रेणी:'}</span>
                </span>
              </div>

              {/* 7-column responsive grid spanning the entire remaining width of the line */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5 flex-1 w-full">
                {/* 1. All Button */}
                {(() => {
                  const allTheme = LAW_THEMES.all;
                  const isAllActive = selectedCategory === "all";
                  return (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className={`min-h-[46px] px-2.5 py-2 rounded-xl text-xs sm:text-sm md:text-[15px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 w-full ${
                        isAllActive ? allTheme.btnActive : allTheme.btnInactive
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-600 dark:bg-slate-300 shrink-0" aria-hidden="true" />
                      <span>{t.common.all}</span>
                    </button>
                  );
                })()}

                {/* 2-7 Category Buttons with exact assigned colors */}
                {LAW_CATEGORIES.map((cat) => {
                  const theme = getLawTheme(cat.id);
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`min-h-[46px] px-2.5 py-2 rounded-xl text-xs sm:text-sm md:text-[15px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 w-full ${
                        isActive ? theme.btnActive : theme.btnInactive
                      }`}
                      title={`${getLocalizedCategoryName(cat.id)} — ${theme.colorName_ne}`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${theme.dotColor}`} aria-hidden="true" />
                      <span>{getLocalizedCategoryName(cat.id)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Legal Documents Listing Grid (6 Columns on Desktop) */}
        <section aria-labelledby="documents-list-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="documents-list-heading" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>
                {activeTab === "federal" 
                  ? (lang === "ne" ? "संघीय सरकारका कानुनी दस्तावेजहरू" : "Federal Government Legal Documents")
                  : (lang === "ne" ? "प्रदेश सरकारका कानुनी दस्तावेजहरू" : "Provincial Government Legal Documents")} ({filteredDocs.length})
              </span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'en' ? 'Click card to preview or download' : 'विवरण तथा PDF हेर्न कार्डमा क्लिक गर्नुहोस्'}
            </span>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">{t.laws.noLawsFound}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'en' ? 'Please adjust your search keywords or category filters.' : 'कृपया खोजी शब्द वा श्रेणी परिवर्तन गरी पुनः प्रयास गर्नुहोस्।'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-3.5">
              {filteredDocs.map((doc) => {
                const theme = getLawTheme(doc.category);
                return (
                  <article
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`rounded-2xl border p-3.5 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group relative overflow-hidden cursor-pointer ${theme.cardClasses}`}
                  >
                    {/* Top Spine / Accent Stripe */}
                    <div className={`h-1.5 w-full absolute top-0 left-0 ${theme.spineColor}`} />

                    <div>
                      {/* Tags Bar */}
                      <div className="flex items-center justify-between gap-1.5 pt-1 mb-2">
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${theme.badgeClasses}`}>
                          {getLocalizedCategoryName(doc.category)}
                        </span>
                        <span className="text-[10px] font-mono opacity-75 font-semibold truncate">
                          {doc.publication_date_bs}
                        </span>
                      </div>

                      {/* Gov Level Badge */}
                      <div className="mb-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${theme.levelBadgeClasses}`}>
                          {doc.gov_level === "federal" 
                            ? (lang === "ne" ? "🏛️ संघीय सरकार" : "🏛️ Federal") 
                            : `🏔️ ${getLocalizedProvinceName(doc.province_id)}`}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className={`text-xs sm:text-[13px] font-black leading-snug line-clamp-3 transition-colors ${theme.titleHoverClasses}`}>
                        {lang === "ne" ? doc.title_ne : (doc.title_en || doc.title_ne)}
                      </h3>
                      {doc.title_en && (
                        <p className="text-[10px] opacity-70 italic line-clamp-1 mt-0.5">
                          {doc.title_en}
                        </p>
                      )}

                      {/* Description preview */}
                      <p className="text-[11px] opacity-85 leading-relaxed line-clamp-2 mt-2 mb-2">
                        {doc.description_ne}
                      </p>
                    </div>

                    {/* Authority & Actions */}
                    <div className="pt-2 mt-auto border-t border-black/10 dark:border-white/10 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1 text-[10px] opacity-75 truncate">
                        <Building2 className="w-3 h-3 shrink-0 opacity-70" />
                        <span className="truncate">{doc.issuing_authority}</span>
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-1">
                        <span className="text-[10px] font-mono font-medium opacity-70">
                          {doc.file_size || "PDF"}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/80 dark:bg-slate-800/80 text-[11px] font-bold shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Eye className="w-3 h-3" />
                            <span>{lang === "ne" ? "हेर्नुहोस्" : "View"}</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDoc(doc);
                            }}
                            className="p-1 rounded-md bg-white/80 dark:bg-slate-800/80 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                            title={t.laws.downloadPdf}
                            aria-label="Download PDF"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
