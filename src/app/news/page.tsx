"use client";

import React, { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { translations, Language } from "@/lib/translations";
import { 
  Newspaper, 
  Calendar, 
  Tag, 
  Search, 
  ArrowRight, 
  Download, 
  FileText, 
  Bell, 
  Award, 
  Building2,
  X
} from "lucide-react";

interface NewsArticle {
  id: string;
  title_ne: string;
  title_en: string;
  summary_ne: string;
  content_ne: string;
  published_date_bs: string;
  category: 'सूचना' | 'समाचार' | 'कार्यक्रम' | 'उपलब्धि' | 'घोषणा';
  author: string;
  tags: string[];
  attachment_name?: string;
  attachment_size?: string;
}

const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "news-01",
    title_ne: "आर्थिक वर्ष २०८२/०८३ को अपाङ्गता सहायता सहजकर्ता वार्षिक प्रतिवेदन प्रविष्टि खुला",
    title_en: "Annual Report Entry Open for Fiscal Year 2082/083",
    summary_ne: "कोशी प्रदेशका १४ वटै जिल्लाका १३७ स्थानीय तहका अपाङ्गता सहायता सहजकर्ताहरूलाई वार्षिक कार्यसम्पादन तथा प्रगति प्रतिवेदन अनलाइन प्रणाली मार्फत प्रविष्टि गर्न अनुरोध गरिएको छ।",
    content_ne: "कोशी प्रदेश सामाजिक विकास मन्त्रालय तथा अपाङ्गता सूचना केन्द्र (DIC) को संयुक्त आयोजनामा आर्थिक वर्ष २०८२/०८३ को वार्षिक प्रतिवेदन संकलन कार्य सुरु भएको छ। सम्पूर्ण स्थानीय तहका सहजकर्ताहरूले आफ्नो पालिकाको प्रोफाइलमा गई ४४ वटा प्रश्न तथा अनुसूची १.१ (गृहभेट) र १.२ (सहायक सामग्री) अनिवार्य रूपमा भर्नुहुन सूचित गरिन्छ।",
    published_date_bs: "२०८२/०५/१५",
    category: "सूचना",
    author: "अपाङ्गता सूचना केन्द्र, विराटनगर",
    tags: ["वार्षिक प्रतिवेदन", "२०८२/०८३", "१३७ स्थानीय तह"],
    attachment_name: "प्रतिवेदन_प्रविष्टि_सम्बन्धी_परिपत्र_२०८२.pdf",
    attachment_size: "६२० KB"
  },
  {
    id: "news-02",
    title_ne: "कोशी प्रदेशका ५० स्थानीय तहमा निशुल्क सहायक सामग्री वितरण शिविर सम्पन्न",
    title_en: "Free Assistive Device Distribution Camps Concluded Across 50 Local Governments",
    summary_ne: "झापा, मोरङ, सुनसरी र पाँचथर लगायतका जिल्लाहरूमा १,२०० भन्दा बढी अपाङ्गता भएका व्यक्तिहरूलाई ह्वीलचेयर, सेतो छडी र श्रवण यन्त्र वितरण गरिएको छ।",
    content_ne: "स्थानीय तहको बजेट तथा दातृ निकायहरूको सहकार्यमा विपन्न तथा ग्रामीण क्षेत्रका अपाङ्गता भएका नागरिकहरूलाई लक्षित गरी शिविर सञ्चालन गरिएको थियो। शिविरमा नापजाँच गरी आवश्यकता अनुसार आधुनिक सहायक सामग्री उपलब्ध गराइएको छ।",
    published_date_bs: "२०८२/०४/२८",
    category: "समाचार",
    author: "सामाजिक विकास मन्त्रालय, कोशी प्रदेश",
    tags: ["सहायक सामग्री", "ह्वीलचेयर", "शिविर"],
  },
  {
    id: "news-03",
    title_ne: "अपाङ्गता सहायता सहजकर्ताहरूका लागि डिजिटल क्षमता अभिवृद्धि तालिम सञ्चालन हुँदै",
    title_en: "Digital Capacity Building Training for Disability Facilitators Announced",
    summary_ne: "नयाँ वेब प्रणाली (DIC) मार्फत तथ्यांक संकलन, अनुसूची भर्ने तरिका र रिपोर्ट विश्लेषण सम्बन्धी ३ दिने भर्चुअल तालिम आगामी हप्ता सुरु हुनेछ।",
    content_ne: "सहजकर्ताहरूको डिजिटल क्षमता विकासका लागि तालिम आयोजना गरिएको हो। सहभागीहरूलाई अनलाइन फारम भर्ने, ड्राफ्ट सेभ गर्ने र स्थानीय तथ्यांकको गोपनीयता कायम राख्ने विषयमा व्यवहारिक अभ्यास गराइनेछ।",
    published_date_bs: "२०८२/०४/१०",
    category: "कार्यक्रम",
    author: "DIC प्राविधिक शाखा",
    tags: ["क्षमता अभिवृद्धि", "डिजिटल तालिम", "सहजकर्ता"],
  },
  {
    id: "news-04",
    title_ne: "फिदिम नगरपालिकाद्वारा अपाङ्गता परिचयपत्र शतप्रतिशत डिजिटल अभिलेखीकरण सम्पन्न",
    title_en: "Phidim Municipality Achieves 100% Digital ID Card Archiving",
    summary_ne: "पाँचथर जिल्लाको फिदिम नगरपालिकाले आफ्नो पालिका भित्रका सम्पूर्ण कार्डधारीहरूको विवरण डिजिटल प्रोफाइलमा समावेस गरी कोशी प्रदेशमै पहिलो सफलता हासिल गरेको छ।",
    content_ne: "फिदिम नगरपालिकाको अपाङ्गता सहायता कक्षले ८४० जना कार्डधारीहरूको व्यक्तिगत विवरण, स्वास्थ्य अवस्था र सामाजिक सुरक्षा भत्ता विवरण पूर्ण रूपमा अनलाइन पोर्टलमा समावेस गरेको छ। यसले सेवा प्रवाहलाई थप पारदर्शी बनाएको छ।",
    published_date_bs: "२०८२/०३/२२",
    category: "उपलब्धि",
    author: "फिदिम नगरपालिका, पाँचथर",
    tags: ["फिदिम", "डिजिटल अभिलेख", "उत्कृष्ट कार्य"],
  }
];

export default function NewsPage() {
  const [lang, setLang] = useState<Language>("ne");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [readingArticle, setReadingArticle] = useState<NewsArticle | null>(null);

  const t = translations[lang];

  const categories = ["all", "सूचना", "समाचार", "कार्यक्रम", "उपलब्धि", "घोषणा"];

  const filteredNews = useMemo(() => {
    return NEWS_ARTICLES.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        item.title_ne.toLowerCase().includes(q) ||
        item.summary_ne.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header lang={lang} onLanguageChange={setLang} />

      {/* ARTICLE READER MODAL */}
      {readingArticle && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-300 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900">
                  {readingArticle.category}
                </span>
                <span className="text-xs text-slate-500 ml-2">
                  वि.सं. {readingArticle.published_date_bs}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 leading-snug">
                  {readingArticle.title_ne}
                </h2>
                <p className="text-xs text-slate-500 mt-1">प्रकाशक: {readingArticle.author}</p>
              </div>
              <button
                type="button"
                onClick={() => setReadingArticle(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                aria-label="बन्द गर्नुहोस्"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 space-y-4 text-sm text-slate-800 leading-relaxed">
              <p className="font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {readingArticle.summary_ne}
              </p>
              <p>{readingArticle.content_ne}</p>
            </div>

            {readingArticle.attachment_name && (
              <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 flex items-center justify-between gap-3 my-4">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <span>संलग्न फाइल: {readingArticle.attachment_name} ({readingArticle.attachment_size})</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`संलग्न फाइल "${readingArticle.attachment_name}" डाउनलोड सुरु भयो।`)}
                  className="px-3 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>डाउनलोड</span>
                </button>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {readingArticle.tags.map((t, i) => (
                  <span key={i} className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                    #{t}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setReadingArticle(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-hidden">
        
        {/* Page Hero Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-900 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-rose-200">
            <Newspaper className="w-3.5 h-3.5" aria-hidden="true" />
            सूचना तथा समाचार पोर्टल
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            सूचना, समाचार तथा महत्वपूर्ण परिपत्रहरू
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-3xl leading-relaxed">
            अपाङ्गता क्षेत्र, स्थानीय तहका गतिविधि, सरकारी निर्णय, नीतिगत परिपत्र तथा तालिम सम्बन्धी ताजा सूचनाहरू।
          </p>
        </div>

        {/* Filter Toolbar */}
        <section aria-labelledby="news-filter-heading" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs mb-8">
          <h2 id="news-filter-heading" className="sr-only">समाचार खोजी तथा फिल्टर</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
              <input
                type="search"
                placeholder="सूचना वा समाचार खोजी गर्नुहोस्..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="all">सबै वर्ग (All Categories)</option>
                <option value="सूचना">सूचना (Notices)</option>
                <option value="समाचार">समाचार (News)</option>
                <option value="कार्यक्रम">कार्यक्रम (Programs)</option>
                <option value="उपलब्धि">उपलब्धि (Achievements)</option>
                <option value="घोषणा">घोषणा (Announcements)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  selectedCategory === c
                    ? "bg-blue-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {c === "all" ? "सबै" : c}
              </button>
            ))}
          </div>
        </section>

        {/* News Grid */}
        <section aria-labelledby="news-list-heading">
          <h2 id="news-list-heading" className="text-lg font-bold text-slate-900 mb-4">
            हालसालै प्रकाशित सूचना तथा समाचारहरू ({filteredNews.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNews.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      वि.सं. {item.published_date_bs}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-2 hover:text-blue-900 transition-colors">
                    {item.title_ne}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                    {item.summary_ne}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium truncate max-w-xs">
                    {item.author}
                  </span>

                  <button
                    type="button"
                    onClick={() => setReadingArticle(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-700 cursor-pointer"
                  >
                    <span>विस्तृत पढ्नुहोस्</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>

      <Footer lang={lang} />
    </div>
  );
}
