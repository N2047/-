"use client";

import React, { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LEGAL_DOCUMENTS } from "@/lib/lawsData";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import { translations } from "@/lib/translations";
import { useLanguage } from "@/lib/languageContext";
import { DEFAULT_NEWS_ARTICLES, NewsArticle, getLocalizedCategory } from "@/types/news";
import { 
  Search, 
  Scale, 
  Building2, 
  Newspaper, 
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function SearchPage() {
  const { lang, setLang } = useLanguage();
  const [query, setQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<'all' | 'laws' | 'palikas' | 'news'>('all');
  const [newsList, setNewsList] = useState<NewsArticle[]>(DEFAULT_NEWS_ARTICLES);

  const t = translations[lang];

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (data.articles && Array.isArray(data.articles)) {
          setNewsList(data.articles);
        }
      })
      .catch(() => {});
  }, []);

  // Search Results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { laws: [], palikas: [], news: [] };

    // Search Laws
    const laws = LEGAL_DOCUMENTS.filter(
      (l) =>
        l.title_ne.toLowerCase().includes(q) ||
        l.title_en.toLowerCase().includes(q) ||
        l.keywords.some((k) => k.toLowerCase().includes(q))
    );

    // Search Palikas
    const palikas: any[] = [];
    KOSHI_DISTRICTS.forEach((d) => {
      d.local_governments.forEach((p) => {
        if (
          p.name_ne.toLowerCase().includes(q) ||
          p.name_en.toLowerCase().includes(q) ||
          d.name_ne.toLowerCase().includes(q) ||
          d.name_en.toLowerCase().includes(q)
        ) {
          palikas.push({ 
            ...p, 
            districtName_ne: d.name_ne,
            districtName_en: d.name_en 
          });
        }
      });
    });

    // Search News
    const news = newsList.filter((n) => {
      const matchNe = n.title_ne?.toLowerCase().includes(q) || n.summary_ne?.toLowerCase().includes(q);
      const matchEn = n.title_en?.toLowerCase().includes(q) || n.summary_en?.toLowerCase().includes(q);
      return matchNe || matchEn;
    });

    return { laws, palikas, news };
  }, [query, newsList]);

  const totalResults = results.laws.length + results.palikas.length + results.news.length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Header lang={lang} onLanguageChange={setLang} />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 focus:outline-hidden">
        
        {/* Search Hero Box */}
        <div className="bg-linear-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-10 shadow-xl mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-center mb-2">
            {t.search.title}
          </h1>
          <p className="text-xs sm:text-sm text-blue-200 text-center max-w-xl mx-auto mb-6">
            {t.search.description}
          </p>

          <div className="relative max-w-2xl mx-auto">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" aria-hidden="true" />
            <input
              type="search"
              autoFocus
              placeholder={t.search.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white text-slate-900 text-base font-semibold rounded-2xl pl-12 pr-4 py-3.5 border-2 border-amber-400 focus:outline-hidden shadow-lg"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filterType === 'all' ? "bg-blue-900 text-white shadow-xs" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            }`}
          >
            {lang === "ne" ? `सबै परिणामहरू (${totalResults})` : `All Results (${totalResults})`}
          </button>
          <button
            type="button"
            onClick={() => setFilterType('laws')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filterType === 'laws' ? "bg-blue-900 text-white shadow-xs" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            }`}
          >
            {lang === "ne" ? `कानुन तथा दस्तावेज (${results.laws.length})` : `Laws & Policies (${results.laws.length})`}
          </button>
          <button
            type="button"
            onClick={() => setFilterType('palikas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filterType === 'palikas' ? "bg-blue-900 text-white shadow-xs" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            }`}
          >
            {lang === "ne" ? `स्थानीय तहहरू (${results.palikas.length})` : `Local Governments (${results.palikas.length})`}
          </button>
          <button
            type="button"
            onClick={() => setFilterType('news')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filterType === 'news' ? "bg-blue-900 text-white shadow-xs" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            }`}
          >
            {lang === "ne" ? `सूचना र समाचार (${results.news.length})` : `Notices & News (${results.news.length})`}
          </button>
        </div>

        {/* Results Area */}
        {!query.trim() ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700">
            <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {lang === "ne" ? "खोजी सुरु गर्न माथिको बाकसमा कुनै शब्द टाइप गर्नुहोस्।" : "Type any keyword above to search the portal."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-xs text-slate-400">{lang === "ne" ? "सुझावहरू:" : "Suggestions:"}</span>
              <button type="button" onClick={() => setQuery(lang === "ne" ? "अधिकार ऐन" : "Rights Act")} className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer">
                {lang === "ne" ? "अधिकार ऐन" : "Rights Act"}
              </button>
              <button type="button" onClick={() => setQuery(lang === "ne" ? "फिदिम" : "Phidim")} className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer">
                {lang === "ne" ? "फिदिम" : "Phidim"}
              </button>
              <button type="button" onClick={() => setQuery(lang === "ne" ? "सहायक सामग्री" : "Assistive Devices")} className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer">
                {lang === "ne" ? "सहायक सामग्री" : "Assistive Devices"}
              </button>
              <button type="button" onClick={() => setQuery(lang === "ne" ? "कार्यविधि" : "Procedure")} className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer">
                {lang === "ne" ? "कार्यविधि" : "Procedure"}
              </button>
            </div>
          </div>
        ) : totalResults === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">
              {lang === "ne" 
                ? `“${query}” का लागि कुनै परिणाम फेला परेन।` 
                : `No results found for “${query}”.`}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {lang === "ne" ? "कृपया हिज्जे जाँच गर्नुहोस् वा फरक शब्द प्रयोग गर्नुहोस्।" : "Please check your spelling or try different keywords."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Laws Results */}
            {(filterType === 'all' || filterType === 'laws') && results.laws.length > 0 && (
              <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>{lang === "ne" ? `कानुन तथा नीति दस्तावेजहरू (${results.laws.length})` : `Laws & Policies (${results.laws.length})`}</span>
                </h2>
                <div className="space-y-3">
                  {results.laws.map((l) => (
                    <div key={l.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-300">
                          {lang === "ne" ? l.category_name_ne : l.category}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                          {lang === "ne" ? l.title_ne : (l.title_en || l.title_ne)}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {lang === "ne" ? l.description_ne : l.title_en}
                        </p>
                      </div>
                      <Link href="/laws" className="p-2 rounded-lg bg-blue-900 text-white hover:bg-blue-800 shrink-0 cursor-pointer">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Palikas Results */}
            {(filterType === 'all' || filterType === 'palikas') && results.palikas.length > 0 && (
              <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>{lang === "ne" ? `स्थानीय तहहरू (${results.palikas.length})` : `Local Governments (${results.palikas.length})`}</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.palikas.map((p) => (
                    <div key={p.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {lang === "ne" ? `${p.districtName_ne} जिल्ला` : `${p.districtName_en} District`}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {lang === "ne" ? p.name_ne : p.name_en}
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{p.type}</span>
                      </div>
                      <Link
                        href={`/local-reporting/palika/${p.id}/profile`}
                        className="px-3 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-blue-800 transition-colors shadow-xs cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>{lang === "ne" ? "पालिका प्रोफाइल" : "Profile"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* News Results */}
            {(filterType === 'all' || filterType === 'news') && results.news.length > 0 && (
              <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                  <span>{lang === "ne" ? `सूचना तथा समाचार (${results.news.length})` : `Notices & News (${results.news.length})`}</span>
                </h2>
                <div className="space-y-2">
                  {results.news.map((n) => (
                    <div key={n.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300">
                          {getLocalizedCategory(n.category, lang)}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                          {lang === "ne" ? n.title_ne : (n.title_en || n.title_ne)}
                        </h3>
                        {n.summary_en && lang === "en" && (
                          <p className="text-xs text-slate-500 line-clamp-1">{n.summary_en}</p>
                        )}
                      </div>
                      <Link href="/news" className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 shrink-0 cursor-pointer">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}

      </main>

      <Footer lang={lang} />
    </div>
  );
}
