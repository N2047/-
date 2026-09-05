"use client";

import React, { useState, useMemo } from "react";
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
import { translations, Language } from "@/lib/translations";
import { 
  Scale, 
  Search, 
  Building2, 
  FileText, 
  Download, 
  Eye, 
  Filter, 
  Calendar, 
  Globe2, 
  ShieldAlert,
  Layers,
  ArrowRight,
  BookOpen
} from "lucide-react";

export default function LawsPage() {
  const [lang, setLang] = useState<Language>("ne");
  const [activeTab, setActiveTab] = useState<GovLevel>("federal");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDoc, setSelectedDoc] = useState<LawDocument | null>(null);

  const t = translations[lang];

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return LEGAL_DOCUMENTS.filter((doc) => {
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
  }, [activeTab, selectedCategory, selectedProvince, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header lang={lang} onLanguageChange={setLang} />

      {/* MODAL FOR LAW VIEW & PDF PREVIEW */}
      <LawDocumentModal document={selectedDoc} onClose={() => setSelectedDoc(null)} />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-hidden">
        
        {/* Page Hero Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200">
                <Scale className="w-3.5 h-3.5" aria-hidden="true" />
                डिजिटल कानुन भण्डार
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                विद्यमान कानुनहरूको दस्तावेज (Laws & Policies Repository)
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-3xl leading-relaxed">
                नेपाल सरकार तथा प्रदेश सरकार मातहत अपाङ्गता भएका व्यक्तिको हक, अधिकार, संरक्षण तथा समावेशिता सम्बन्धी सम्पूर्ण ऐन, नियमावली, कार्यविधि, निर्देशिका, मार्गदर्शन र परिपत्रहरूको आधिकारिक संग्रह।
              </p>
            </div>

            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <div>
                <span className="text-xs font-semibold text-blue-700 block">कुल कानुनी दस्तावेज</span>
                <span className="text-3xl font-black text-blue-950">{LEGAL_DOCUMENTS.length}</span>
                <span className="text-[11px] text-blue-600 block">PDF ढाँचामा उपलब्ध</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Tabs: संघीय सरकार vs प्रदेश सरकार */}
        <div className="flex border-b-2 border-slate-200 mb-6 gap-2" role="tablist" aria-label="सरकारको तह">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "federal"}
            onClick={() => {
              setActiveTab("federal");
              setSelectedProvince("all");
            }}
            className={`py-3.5 px-6 font-bold text-sm sm:text-base rounded-t-xl transition-all flex items-center gap-2 border-t-2 border-x-2 -mb-0.5 ${
              activeTab === "federal"
                ? "bg-white text-blue-900 border-blue-900 border-b-white shadow-xs"
                : "bg-slate-100 text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>१. संघीय सरकार मातहतका कानुनहरू</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "provincial"}
            onClick={() => setActiveTab("provincial")}
            className={`py-3.5 px-6 font-bold text-sm sm:text-base rounded-t-xl transition-all flex items-center gap-2 border-t-2 border-x-2 -mb-0.5 ${
              activeTab === "provincial"
                ? "bg-white text-blue-900 border-blue-900 border-b-white shadow-xs"
                : "bg-slate-100 text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>२. प्रदेश सरकार मातहतका कानुनहरू (७ प्रदेश)</span>
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <section aria-labelledby="filter-heading" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs mb-8">
          <h2 id="filter-heading" className="sr-only">कानुन खोजी तथा फिल्टर</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className={activeTab === "provincial" ? "lg:col-span-2" : "lg:col-span-2"}>
              <label htmlFor="law-search" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                कानुनको नाम वा विषयबाट खोजी
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                <input
                  id="law-search"
                  type="search"
                  placeholder="ऐन, नियमावली, कार्यविधि वा किवर्ड टाइप गर्नुहोस्..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-medium"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label htmlFor="category-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                दस्तावेजको प्रकार
              </label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="all">सबै प्रकार (All Categories)</option>
                {LAW_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_ne}
                  </option>
                ))}
              </select>
            </div>

            {/* Province Dropdown (Only for Provincial Tab) */}
            {activeTab === "provincial" ? (
              <div>
                <label htmlFor="province-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  प्रदेश छनौट गर्नुहोस्
                </label>
                <select
                  id="province-select"
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  <option value="all">सबै ७ प्रदेश (All Provinces)</option>
                  {NEPAL_PROVINCES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name_ne} ({p.name_en})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  द्रुत फिल्टर
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
                >
                  फिल्टर रिसेट गर्नुहोस्
                </button>
              </div>
            )}
          </div>

          {/* Quick Category Buttons Bar */}
          <div className="pt-4 mt-4 border-t border-slate-200 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-2">द्रुत वर्ग:</span>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                selectedCategory === "all" ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              सबै
            </button>
            {LAW_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  selectedCategory === cat.id ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat.name_ne.split(" ")[0]}
              </button>
            ))}
          </div>
        </section>

        {/* Legal Documents Listing Grid */}
        <section aria-labelledby="documents-list-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="documents-list-heading" className="text-lg font-bold text-slate-900">
              {activeTab === "federal" ? "संघीय सरकारका कानुनी दस्तावेजहरू" : "प्रदेश सरकारका कानुनी दस्तावेजहरू"} ({filteredDocs.length})
            </h2>
            <span className="text-xs text-slate-500">
              दस्तावेज हेर्न वा PDF डाउनलोड गर्न कार्डमा क्लिक गर्नुहोस्।
            </span>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-base font-bold text-slate-800">कुनै कानुनी दस्तावेज फेला परेन।</p>
              <p className="text-xs text-slate-500 mt-1">कृपया खोजी शब्द वा वर्ग फिल्टर परिवर्तन गरी पुनः प्रयास गर्नुहोस्।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredDocs.map((doc) => (
                <article
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Tags Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900">
                          {doc.category_name_ne}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          doc.gov_level === "federal" ? "bg-emerald-50 text-emerald-800" : "bg-purple-50 text-purple-800"
                        }`}>
                          {doc.gov_level === "federal" ? "संघीय सरकार" : doc.province_name_ne || "प्रदेश सरकार"}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        वि.सं. {doc.publication_date_bs}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug">
                      {doc.title_ne}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 mb-3 font-medium">{doc.title_en}</p>

                    {/* Description preview */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                      {doc.description_ne}
                    </p>

                    {/* Authority */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.issuing_authority}</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-slate-400">
                      PDF ({doc.file_size})
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDoc(doc)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-900 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>दस्तावेज पढ्नुहोस्</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedDoc(doc)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title="PDF डाउनलोड गर्नुहोस्"
                        aria-label={`${doc.title_ne} डाउनलोड`}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
