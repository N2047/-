"use client";

import React, { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { translations, Language } from "@/lib/translations";
import { useAuth } from "@/lib/authContext";
import { NewsArticle, DEFAULT_NEWS_ARTICLES } from "@/types/news";
import NewsEditorModal from "@/components/news/NewsEditorModal";
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
  X,
  PlusCircle,
  Edit3,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Image as ImageIcon,
  Video as VideoIcon,
  PlayCircle
} from "lucide-react";

// Helper to extract YouTube embed URL
function getYouTubeEmbed(url?: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return ytMatch && ytMatch[1] ? `https://www.youtube.com/embed/${ytMatch[1]}` : null;
}

export default function NewsPage() {
  const [lang, setLang] = useState<Language>("ne");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [readingArticle, setReadingArticle] = useState<NewsArticle | null>(null);

  // Authentication & Role Check
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin" || user?.role === "provincial_admin";

  // News Articles state
  const [articles, setArticles] = useState<NewsArticle[]>(DEFAULT_NEWS_ARTICLES);
  const [isLoading, setIsLoading] = useState(true);

  // Editor Modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<NewsArticle | null>(null);

  // Delete Confirmation Modal state
  const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch articles from API on mount
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch("/api/news");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.articles) && data.articles.length > 0) {
            setArticles(data.articles);
          }
        }
      } catch (err) {
        console.error("Failed to fetch news from API:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const t = translations[lang];

  const categories = ["all", "सूचना", "समाचार", "कार्यक्रम", "उपलब्धि", "घोषणा"];

  const filteredNews = useMemo(() => {
    return articles.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        item.title_ne.toLowerCase().includes(q) ||
        item.summary_ne.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setArticleToEdit(null);
    setIsEditorOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (art: NewsArticle) => {
    setArticleToEdit(art);
    setIsEditorOpen(true);
  };

  // Callback when article is saved from modal
  const handleArticleSaved = (savedArticle: NewsArticle, isNew: boolean) => {
    if (isNew) {
      setArticles(prev => [savedArticle, ...prev]);
      showToast("नयाँ सूचना/समाचार सफलतापूर्वक प्रकाशित भयो!");
    } else {
      setArticles(prev => prev.map(a => a.id === savedArticle.id ? savedArticle : a));
      if (readingArticle?.id === savedArticle.id) {
        setReadingArticle(savedArticle);
      }
      showToast("सूचना/समाचार सफलतापूर्वक सच्याइयो!");
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/news?id=${articleToDelete.id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "मेटाउन सकिएन।");

      setArticles(prev => prev.filter(a => a.id !== articleToDelete.id));
      if (readingArticle?.id === articleToDelete.id) {
        setReadingArticle(null);
      }
      showToast("सूचना/समाचार सफलतापूर्वक हटाइयो।");
      setArticleToDelete(null);
    } catch (err: any) {
      alert(err.message || "हटाउन समस्या आयो।");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header lang={lang} onLanguageChange={setLang} />

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-2 bg-emerald-900 text-emerald-50 px-4 py-3 rounded-xl shadow-xl border border-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* NEWS EDITOR MODAL (ADD / EDIT) */}
      <NewsEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        articleToEdit={articleToEdit}
        onSaved={handleArticleSaved}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {articleToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-rose-300 dark:border-rose-900">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">
              यो सूचना/समाचार हटाउन चाहनुहुन्छ?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center mb-4 leading-relaxed">
              &quot;<strong>{articleToDelete.title_ne}</strong>&quot; लाई प्रणालीबाट स्थायी रूपमा हटाइनेछ। यो कार्य फिर्ता गर्न सकिँदैन।
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setArticleToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? "हटाउँदैछ..." : "हो, हटाउनुहोस् (Delete)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ARTICLE READER MODAL */}
      {readingArticle && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-300 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            
            {/* 1. TOP: विषयवस्तुको हेडलाइन तथा विवरण (Headline & Meta) */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300">
                    {readingArticle.category}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">
                    वि.सं. {readingArticle.published_date_bs}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2 leading-snug">
                  {readingArticle.title_ne}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">प्रकाशक: {readingArticle.author}</p>
              </div>
              <button
                type="button"
                onClick={() => setReadingArticle(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                aria-label="बन्द गर्नुहोस्"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. MIDDLE: तस्बिर वा भिडियो (Featured Media - In the middle) */}
            {(readingArticle.video_url || readingArticle.image_url) && (
              <div className="my-5 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 shadow-md">
                {readingArticle.video_url ? (
                  getYouTubeEmbed(readingArticle.video_url) ? (
                    <div className="aspect-video w-full">
                      <iframe
                        src={getYouTubeEmbed(readingArticle.video_url)!}
                        title={readingArticle.title_ne}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video controls className="w-full max-h-96 object-contain bg-black">
                      <source src={readingArticle.video_url} />
                      भिडियो लोड हुन सकेन।
                    </video>
                  )
                ) : readingArticle.image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={readingArticle.image_url}
                    alt={readingArticle.title_ne}
                    className="w-full max-h-96 object-cover"
                  />
                ) : null}
              </div>
            )}

            {/* 3. BELOW: मुनि रहने Text व्यहोरा (Text Content Below Media) */}
            <div className="py-4 space-y-4 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              <p className="font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                {readingArticle.summary_ne}
              </p>
              <div className="whitespace-pre-line leading-relaxed">
                {readingArticle.content_ne}
              </div>
            </div>

            {/* Attachments */}
            {readingArticle.attachment_name && (
              <div className="p-4 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 flex items-center justify-between gap-3 my-4">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-950 dark:text-blue-200">
                  <FileText className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>संलग्न फाइल: {readingArticle.attachment_name} {readingArticle.attachment_size ? `(${readingArticle.attachment_size})` : ""}</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`संलग्न फाइल "${readingArticle.attachment_name}" डाउनलोड सुरु भयो।`)}
                  className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>डाउनलोड</span>
                </button>
              </div>
            )}

            {/* Footer with Tags and Super Admin controls */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {readingArticle.tags.map((t, i) => (
                  <span key={i} className="text-xs px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
                    #{t}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Super Admin Quick Edit Action from Reader Modal */}
                {isSuperAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(readingArticle)}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>सच्याउनुहोस् (Edit)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setArticleToDelete(readingArticle)}
                      className="px-3 py-2 bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>हटाउनुहोस्</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setReadingArticle(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  बन्द गर्नुहोस्
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-hidden">
        
        {/* Page Hero Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 dark:bg-rose-950/50 text-rose-900 dark:text-rose-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-rose-200 dark:border-rose-900">
              <Newspaper className="w-3.5 h-3.5" aria-hidden="true" />
              सूचना तथा समाचार पोर्टल
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              सूचना, समाचार तथा महत्वपूर्ण परिपत्रहरू
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
              अपाङ्गता क्षेत्र, स्थानीय तहका गतिविधि, सरकारी निर्णय, नीतिगत परिपत्र तथा तालिम सम्बन्धी ताजा सूचनाहरू।
            </p>
          </div>

          {/* Super Admin Top Action Button */}
          {isSuperAdmin && (
            <div className="shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer border border-red-500 active:scale-98 transition-all"
              >
                <PlusCircle className="w-5 h-5 text-amber-300" />
                <span>नयाँ सूचना / समाचार थप गर्नुहोस् (+ Add)</span>
              </button>
            </div>
          )}
        </div>

        {/* Super Admin Banner Notice */}
        {isSuperAdmin && (
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 dark:from-amber-950/30 dark:to-amber-900/20 border-2 border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black shadow-xs shrink-0">
                👑
              </div>
              <div>
                <h2 className="text-sm font-black text-amber-950 dark:text-amber-200">
                  सुपर एडमिन सम्पादन तथा व्यवस्थापन मोड (Super Admin Mode)
                </h2>
                <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5">
                  तपाईंले कुनै पनि सूचना वा समाचारमा रहेको <strong>&quot;✏️ सम्पादन (Edit)&quot;</strong> बटन थिचेर शीर्षक, तस्बिर, भिडियो, विवरण वा मिति सच्याउन सक्नुहुन्छ तथा नयाँ थप्न वा हटाउन सक्नुहुन्छ।
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ सूचना थप्नुहोस्</span>
            </button>
          </div>
        )}

        {/* Filter Toolbar */}
        <section aria-labelledby="news-filter-heading" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs mb-8">
          <h2 id="news-filter-heading" className="sr-only">समाचार खोजी तथा फिल्टर</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
              <input
                type="search"
                placeholder="सूचना वा समाचार खोजी गर्नुहोस्..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
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

          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  selectedCategory === c
                    ? "bg-blue-900 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {c === "all" ? "सबै" : c}
              </button>
            ))}
          </div>
        </section>

        {/* News Grid */}
        <section aria-labelledby="news-list-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="news-list-heading" className="text-lg font-bold text-slate-900 dark:text-white">
              हालसालै प्रकाशित सूचना तथा समाचारहरू ({filteredNews.length})
            </h2>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 text-xs font-black text-red-600 dark:text-red-400 hover:underline cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ नयाँ सूचना थप्नुहोस्</span>
              </button>
            )}
          </div>

          {filteredNews.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
              <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold">कुनै पनि सूचना वा समाचार फेला परेन।</p>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="mt-3 px-4 py-2 bg-blue-900 text-white text-xs font-bold rounded-xl"
                >
                  + नयाँ सूचना लेख्नुहोस्
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNews.map((item) => (
                <article
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between group relative"
                >
                  <div>
                    {/* 1. TOP: विषयवस्तुको हेडलाइन तथा वर्ग (Category & Headline) */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300">
                          {item.category}
                        </span>
                        {item.attachment_name && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-blue-600" />
                            <span>PDF</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        वि.सं. {item.published_date_bs}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug mb-3 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors">
                      {item.title_ne}
                    </h3>

                    {/* 2. MIDDLE: तस्बिर वा भिडियो (Featured Media in the middle) */}
                    {item.video_url ? (
                      <div className="my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 aspect-video relative">
                        {getYouTubeEmbed(item.video_url) ? (
                          <iframe
                            src={getYouTubeEmbed(item.video_url)!}
                            title={item.title_ne}
                            className="w-full h-full border-0 pointer-events-none sm:pointer-events-auto"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                            <PlayCircle className="w-10 h-10 text-red-500" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs pointer-events-none">
                          <VideoIcon className="w-3 h-3" />
                          <span>भिडियो</span>
                        </div>
                      </div>
                    ) : item.image_url ? (
                      <div className="my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative bg-slate-100 dark:bg-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url}
                          alt={item.title_ne}
                          className="w-full h-44 object-cover group-hover:scale-102 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs">
                          <ImageIcon className="w-3 h-3" />
                          <span>तस्बिर</span>
                        </div>
                      </div>
                    ) : null}

                    {/* 3. BELOW: मुनि रहने Text (Summary text below media) */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">
                      {item.summary_ne}
                    </p>
                  </div>

                  <div>
                    {/* Super Admin Quick Actions Bar on Card */}
                    {isSuperAdmin && (
                      <div className="mb-3 pt-3 border-t border-dashed border-amber-300/80 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20 -mx-6 px-6 py-2 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                          👑 <span>सुपर एडमिन अधिकार:</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                            title="यो सूचना सच्याउनुहोस् (Edit)"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>सम्पादन (Edit)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setArticleToDelete(item)}
                            className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950/70 hover:bg-rose-200 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="यो सूचना मेटाउनुहोस् (Delete)"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>हटाउनुहोस्</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Bottom Metadata & Read More */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium truncate max-w-[180px] sm:max-w-xs">
                        {item.author}
                      </span>

                      <button
                        type="button"
                        onClick={() => setReadingArticle(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-400 hover:text-blue-700 cursor-pointer"
                      >
                        <span>विस्तृत पढ्नुहोस्</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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
