"use client";

import React, { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LEGAL_DOCUMENTS } from "@/lib/lawsData";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import { translations, Language } from "@/lib/translations";
import { 
  Search, 
  Scale, 
  Building2, 
  Newspaper, 
  FileText, 
  ArrowRight, 
  Layers,
  MapPin
} from "lucide-react";
import Link from "next/link";

export default function SearchPage() {
  const [lang, setLang] = useState<Language>("ne");
  const [query, setQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<'all' | 'laws' | 'palikas' | 'news'>('all');

  const t = translations[lang];

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
          d.name_ne.toLowerCase().includes(q)
        ) {
          palikas.push({ ...p, districtName: d.name_ne });
        }
      });
    });

    // Simulated search news
    const news = [
      { id: "n1", title: "आर्थिक वर्ष २०८२/०८३ को अपाङ्गता सहायता सहजकर्ता वार्षिक प्रतिवेदन प्रविष्टि खुला", category: "सूचना" },
      { id: "n2", title: "कोशी प्रदेशका ५० स्थानीय तहमा निशुल्क सहायक सामग्री वितरण शिविर सम्पन्न", category: "समाचार" },
      { id: "n3", title: "फिदिम नगरपालिकाद्वारा अपाङ्गता परिचयपत्र शतप्रतिशत डिजिटल अभिलेखीकरण सम्पन्न", category: "उपलब्धि" },
    ].filter((n) => n.title.toLowerCase().includes(q));

    return { laws, palikas, news };
  }, [query]);

  const totalResults = results.laws.length + results.palikas.length + results.news.length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header lang={lang} onLanguageChange={setLang} />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 focus:outline-hidden">
        
        {/* Search Hero Box */}
        <div className="bg-linear-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-10 shadow-xl mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-center mb-2">
            केन्द्रीकृत खोजी प्रणाली (Global Search)
          </h1>
          <p className="text-xs sm:text-sm text-blue-200 text-center max-w-xl mx-auto mb-6">
            कानुन, दस्तावेज, स्थानीय तह, प्रतिवेदन तथा समाचारहरू एकै स्थानबाट खोज्नुहोस्।
          </p>

          <div className="relative max-w-2xl mx-auto">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" aria-hidden="true" />
            <input
              type="search"
              autoFocus
              placeholder="खोज्न चाहेको शब्द टाइप गर्नुहोस् (उदा. ऐन, फिदिम, ह्वीलचेयर, २०८२)..."
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              filterType === 'all' ? "bg-blue-900 text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            सबै परिणामहरू ({totalResults})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('laws')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              filterType === 'laws' ? "bg-blue-900 text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            कानुन तथा दस्तावेज ({results.laws.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('palikas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              filterType === 'palikas' ? "bg-blue-900 text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            स्थानीय तहहरू ({results.palikas.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('news')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              filterType === 'news' ? "bg-blue-900 text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            सूचना र समाचार ({results.news.length})
          </button>
        </div>

        {/* Results Area */}
        {!query.trim() ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">खोजी सुरु गर्न माथिको बाकसमा कुनै शब्द टाइप गर्नुहोस्।</p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-xs text-slate-400">सुझावहरू:</span>
              <button type="button" onClick={() => setQuery("अधिकार ऐन")} className="text-xs px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200">
                अधिकार ऐन
              </button>
              <button type="button" onClick={() => setQuery("फिदिम")} className="text-xs px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200">
                फिदिम
              </button>
              <button type="button" onClick={() => setQuery("सहायक सामग्री")} className="text-xs px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200">
                सहायक सामग्री
              </button>
              <button type="button" onClick={() => setQuery("कार्यविधि")} className="text-xs px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200">
                कार्यविधि
              </button>
            </div>
          </div>
        ) : totalResults === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <p className="text-base font-bold text-slate-800">&ldquo;{query}&rdquo; का लागि कुनै परिणाम फेला परेन।</p>
            <p className="text-xs text-slate-500 mt-1">कृपया हिज्जे जाँच गर्नुहोस् वा फरक शब्द प्रयोग गर्नुहोस्।</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Laws Results */}
            {(filterType === 'all' || filterType === 'laws') && results.laws.length > 0 && (
              <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-700" />
                  <span>कानुन तथा नीति दस्तावेजहरू ({results.laws.length})</span>
                </h2>
                <div className="space-y-3">
                  {results.laws.map((l) => (
                    <div key={l.id} className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">{l.category_name_ne}</span>
                        <h3 className="font-bold text-slate-900 text-sm mt-1">{l.title_ne}</h3>
                        <p className="text-xs text-slate-500 line-clamp-1">{l.description_ne}</p>
                      </div>
                      <Link href="/laws" className="p-2 rounded-lg bg-blue-900 text-white hover:bg-blue-800 shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Palikas Results */}
            {(filterType === 'all' || filterType === 'palikas') && results.palikas.length > 0 && (
              <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <span>स्थानीय तहहरू ({results.palikas.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.palikas.map((p) => (
                    <div key={p.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500">{p.districtName} जिल्ला</span>
                        <h3 className="font-bold text-slate-900 text-sm">{p.name_ne}</h3>
                        <span className="text-xs text-slate-500">{p.type}</span>
                      </div>
                      <Link
                        href={`/local-reporting/palika/${p.id}`}
                        className="px-3 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-blue-800"
                      >
                        <span>फारम</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* News Results */}
            {(filterType === 'all' || filterType === 'news') && results.news.length > 0 && (
              <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-rose-700" />
                  <span>सूचना तथा समाचार ({results.news.length})</span>
                </h2>
                <div className="space-y-2">
                  {results.news.map((n) => (
                    <div key={n.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900">{n.category}</span>
                        <h3 className="font-bold text-slate-900 text-sm mt-1">{n.title}</h3>
                      </div>
                      <Link href="/news" className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 shrink-0">
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
