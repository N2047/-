"use client";

import React, { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { translations, Language } from "@/lib/translations";
import { useLanguage } from "@/lib/languageContext";
import { useAuth } from "@/lib/authContext";
import { NewsArticle, DEFAULT_NEWS_ARTICLES, getLocalizedCategory, normalizeCategoryKey, NewsCategoryKey } from "@/types/news";
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
  const { lang, isEnglish } = useLanguage();
  const t = translations[lang];
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

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch articles from API on mount
  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch("/api/news");
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            setArticles(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load news from API, using default articles:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadNews();
  }, []);

  const categories: { key: string; label: string }[] = [
    { key: "all", label: t.news?.all || "All" },
    { key: "notice", label: t.news?.notice || "Notice" },
    { key: "news", label: t.news?.news || "News" },
    { key: "program", label: t.news?.program || "Programs" },
    { key: "achievement", label: t.news?.achievement || "Achievements" },
    { key: "announcement", label: t.news?.announcement || "Announcements" }
  ];

  const filteredNews = useMemo(() => {
    return articles.filter((item) => {
      const itemCatKey = normalizeCategoryKey(item.category);
      const matchesCategory = selectedCategory === "all" || itemCatKey === selectedCategory || item.category === selectedCategory;
      
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const titleNe = (item.title_ne || "").toLowerCase();
      const titleEn = (item.title_en || "").toLowerCase();
      const summaryNe = (item.summary_ne || "").toLowerCase();
      const summaryEn = (item.summary_en || "").toLowerCase();
      const tags = (item.tags || []).join(" ").toLowerCase();

      const matchesSearch = isEnglish
        ? titleEn.includes(q) || summaryEn.includes(q) || tags.includes(q)
        : titleNe.includes(q) || summaryNe.includes(q) || tags.includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery, isEnglish]);

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
      showToast(isEnglish ? "Article published successfully!" : "नयाँ सूचना/समाचार सफलतापूर्वक प्रकाशित भयो!");
    } else {
      setArticles(prev => prev.map(a => a.id === savedArticle.id ? savedArticle : a));
      if (readingArticle?.id === savedArticle.id) {
        setReadingArticle(savedArticle);
      }
      showToast(isEnglish ? "Article updated successfully!" : "सूचना/समाचार सफलतापूर्वक सच्याइयो!");
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
      if (!res.ok) throw new Error(data.error || (isEnglish ? "Failed to delete article." : "मेटाउन सकिएन।"));

      setArticles(prev => prev.filter(a => a.id !== articleToDelete.id));
      if (readingArticle?.id === articleToDelete.id) {
        setReadingArticle(null);
      }
      showToast(isEnglish ? "Article deleted successfully." : "सूचना/समाचार सफलतापूर्वक हटाइयो।");
      setArticleToDelete(null);
    } catch (err: any) {
      alert(err.message || (isEnglish ? "Could not delete article." : "हटाउन समस्या आयो।"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />

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
              {isEnglish ? "Delete this article?" : "यो सूचना/समाचार हटाउन चाहनुहुन्छ?"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center mb-4 leading-relaxed">
              &quot;<strong>{isEnglish ? (articleToDelete.title_en || articleToDelete.title_ne) : articleToDelete.title_ne}</strong>&quot; {isEnglish ? "will be permanently deleted. This action cannot be undone." : "लाई प्रणालीबाट स्थायी रूपमा हटाइनेछ। यो कार्य फिर्ता गर्न सकिँदैन।"}
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setArticleToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                {t.common?.cancel || "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? (isEnglish ? "Deleting..." : "हटाउँदैछ...") : (isEnglish ? "Yes, Delete" : "हो, हटाउनुहोस् (Delete)")}
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
            
            {/* 1. TOP: Headline & Meta */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300">
                    {getLocalizedCategory(readingArticle.category, lang)}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">
                    {isEnglish 
                      ? `B.S. ${readingArticle.published_date_en || readingArticle.published_date_bs}`
                      : `वि.सं. ${readingArticle.published_date_bs}`
                    }
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2 leading-snug">
                  {isEnglish 
                    ? (readingArticle.title_en || t.news?.notAvailableEn || "English translation not available")
                    : readingArticle.title_ne
                  }
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isEnglish ? "Publisher / Source: " : "प्रकाशक: "}
                  {isEnglish ? (readingArticle.author_en || readingArticle.author) : readingArticle.author}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReadingArticle(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                aria-label={t.common?.close || "Close"}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. MIDDLE: Media View */}
            {readingArticle.video_url && (
              <div className="my-5 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 aspect-video shadow-md">
                {getYouTubeEmbed(readingArticle.video_url) ? (
                  <iframe
                    src={getYouTubeEmbed(readingArticle.video_url)!}
                    title={readingArticle.title_ne}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                    <PlayCircle className="w-12 h-12 text-red-500 mb-2" />
                    <a
                      href={readingArticle.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 underline font-semibold"
                    >
                      {isEnglish ? "Watch Video on External Source" : "भिडियो बाह्य लिङ्कमा हेर्नुहोस्"}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* MULTI-IMAGE GALLERY OR SINGLE IMAGE */}
            {!readingArticle.video_url && (
              (readingArticle.images && readingArticle.images.length > 0) ? (
                <div className="my-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>{isEnglish ? "Attached Photos" : "संलग्न तस्बिरहरू"} ({readingArticle.images.length})</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {readingArticle.images.map((img, i) => (
                      <div key={i} className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col">
                        <div className="aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={img.caption || `Photo ${i + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition duration-300"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold">
                            #{i + 1}
                          </span>
                        </div>
                        {img.caption && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                            {img.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : readingArticle.image_url ? (
                <div className="my-5 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-96 shadow-md bg-slate-100 dark:bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={readingArticle.image_url}
                    alt={isEnglish ? (readingArticle.title_en || readingArticle.title_ne) : readingArticle.title_ne}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null
            )}

            {/* 3. Content Details */}
            <div className="mt-5 space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  {isEnglish 
                    ? (readingArticle.summary_en || t.news?.notAvailableEn || "English summary not available")
                    : readingArticle.summary_ne
                  }
                </p>
              </div>

              <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line py-2">
                {isEnglish 
                  ? (readingArticle.content_en || t.news?.notAvailableEn || "English content not available")
                  : readingArticle.content_ne
                }
              </div>

              {/* PDF Attachment Download */}
              {readingArticle.attachment_name && (
                <div className="mt-4 p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-red-600 text-white shadow-xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {readingArticle.attachment_name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {t.news?.circularFile} {readingArticle.attachment_size ? `(${readingArticle.attachment_size})` : ""}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/downloads/${readingArticle.attachment_name}`}
                    download
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer self-end sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.news?.downloadFile}</span>
                  </a>
                </div>
              )}

              {/* Tags */}
              {readingArticle.tags && readingArticle.tags.length > 0 && (
                <div className="pt-4 flex items-center gap-1.5 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  {readingArticle.tags.map((tg, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                    >
                      #{tg}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer with Actions */}
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                {isSuperAdmin && (
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-400">
                    👑 Super Admin
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isSuperAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const art = readingArticle;
                        setReadingArticle(null);
                        handleOpenEdit(art);
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{t.news?.editBtn || "Edit"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const art = readingArticle;
                        setReadingArticle(null);
                        setArticleToDelete(art);
                      }}
                      className="px-3 py-1.5 bg-rose-100 dark:bg-rose-950/80 hover:bg-rose-200 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.news?.deleteBtn || "Delete"}</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setReadingArticle(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  {t.common?.close || "Close"}
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
              {t.news?.badge || "Notices & News Portal"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.news?.title || "Notices, News and Important Circulars"}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
              {t.news?.description || "Latest information on disability issues, local government activities, government decisions, policy circulars and training."}
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
                <span>{t.news?.addBtn || "Add New Notice / News"}</span>
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
                  {t.news?.adminModeBanner || "Super Admin Editing and Management Mode"}
                </h2>
                <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5">
                  {t.news?.adminModeDesc || "You can edit titles, images, videos, descriptions or dates on any article, or add new articles and delete outdated ones."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isEnglish ? "+ Add Article" : "+ सूचना थप्नुहोस्"}</span>
            </button>
          </div>
        )}

        {/* Filter Toolbar */}
        <section aria-labelledby="news-filter-heading" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs mb-8">
          <h2 id="news-filter-heading" className="sr-only">
            {t.news?.filterHeading || "Search & Filter News"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
              <input
                type="search"
                placeholder={t.news?.searchPlaceholder || "Search notices or news..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label={t.common?.category || "Category"}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {categories.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  selectedCategory === c.key
                    ? "bg-blue-900 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>

        {/* News Grid */}
        <section aria-labelledby="news-list-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="news-list-heading" className="text-lg font-bold text-slate-900 dark:text-white">
              {t.news?.publishedNews || "Recently Published Notices and News"} ({filteredNews.length})
            </h2>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 text-xs font-black text-red-600 dark:text-red-400 hover:underline cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{isEnglish ? "+ Add New Notice" : "+ नयाँ सूचना थप्नुहोस्"}</span>
              </button>
            )}
          </div>

          {filteredNews.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
              <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold">{t.news?.noResults || "No notices or news articles found."}</p>
              <p className="text-xs text-slate-400 mt-1">{t.news?.noResultsDesc || "Please try adjusting your search terms or category filters."}</p>
              {selectedCategory !== "all" || searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className="mt-3 px-4 py-1.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  {t.news?.resetFilter || "Reset All Filters"}
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNews.map((item) => (
                <article
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between group relative"
                >
                  <div>
                    {/* 1. TOP: Category & Date */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300">
                          {getLocalizedCategory(item.category, lang)}
                        </span>
                        {item.attachment_name && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-blue-600" />
                            <span>PDF</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {isEnglish 
                          ? `B.S. ${item.published_date_en || item.published_date_bs}`
                          : `वि.सं. ${item.published_date_bs}`
                        }
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug mb-3 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors">
                      {isEnglish 
                        ? (item.title_en || t.news?.notAvailableEn || "English translation not available")
                        : item.title_ne
                      }
                    </h3>

                    {/* 2. MIDDLE: Media View */}
                    {item.video_url ? (
                      <div className="my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 aspect-video relative">
                        {getYouTubeEmbed(item.video_url) ? (
                          <iframe
                            src={getYouTubeEmbed(item.video_url)!}
                            title={isEnglish ? (item.title_en || item.title_ne) : item.title_ne}
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
                          <span>{isEnglish ? "Video" : "भिडियो"}</span>
                        </div>
                      </div>
                    ) : (item.image_url || (item.images && item.images.length > 0)) ? (
                      <div className="my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative bg-slate-100 dark:bg-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url || item.images![0].url}
                          alt={isEnglish ? (item.title_en || item.title_ne) : item.title_ne}
                          className="w-full h-44 object-cover group-hover:scale-102 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs">
                          <ImageIcon className="w-3 h-3" />
                          <span>
                            {item.images && item.images.length > 1
                              ? (isEnglish ? `${item.images.length} Photos` : `${item.images.length} तस्बिरहरू`)
                              : (isEnglish ? "Photo" : "तस्बिर")
                            }
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {/* 3. BELOW: Summary */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">
                      {isEnglish 
                        ? (item.summary_en || t.news?.notAvailableEn || "English summary not available")
                        : item.summary_ne
                      }
                    </p>
                  </div>

                  <div>
                    {/* Super Admin Quick Actions Bar on Card */}
                    {isSuperAdmin && (
                      <div className="mb-3 pt-3 border-t border-dashed border-amber-300/80 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20 -mx-6 px-6 py-2 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                          👑 <span>{isEnglish ? "Admin:" : "सुपर एडमिन:"}</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                            title={t.news?.editBtn || "Edit"}
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{t.news?.editBtn || "Edit"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setArticleToDelete(item)}
                            className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950/70 hover:bg-rose-200 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title={t.news?.deleteBtn || "Delete"}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{t.news?.deleteBtn || "Delete"}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Bottom Metadata & Read More */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium truncate max-w-[180px] sm:max-w-xs">
                        {isEnglish ? (item.author_en || item.author) : item.author}
                      </span>

                      <button
                        type="button"
                        onClick={() => setReadingArticle(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-400 hover:text-blue-700 cursor-pointer"
                      >
                        <span>{t.news?.readMore || "Read More"}</span>
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

      <Footer />
    </div>
  );
}
