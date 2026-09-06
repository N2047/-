"use client";

import React, { useState, useEffect } from "react";
import { NewsArticle } from "@/types/news";
import { 
  X, 
  Save, 
  PlusCircle, 
  Edit3, 
  FileText, 
  Calendar, 
  Tag, 
  Building2, 
  AlertCircle,
  Paperclip,
  CheckCircle2,
  Image as ImageIcon,
  Video as VideoIcon,
  PlayCircle,
  Trash2,
  Sparkles,
  Link2
} from "lucide-react";

interface NewsEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleToEdit: NewsArticle | null;
  onSaved: (savedArticle: NewsArticle, isNew: boolean) => void;
}

// Quick sample images for convenient testing
const SAMPLE_IMAGES = [
  { label: "शिविर तथा वितरण", url: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80" },
  { label: "डिजिटल तालिम", url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80" },
  { label: "प्रशासकीय बैठक", url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80" }
];

export default function NewsEditorModal({
  isOpen,
  onClose,
  articleToEdit,
  onSaved
}: NewsEditorModalProps) {
  const isEditMode = Boolean(articleToEdit);

  // Section 1: Headline & Classification
  const [category, setCategory] = useState<NewsArticle['category']>("सूचना");
  const [titleNe, setTitleNe] = useState("");
  const [publishedDateBs, setPublishedDateBs] = useState("२०८२/०५/२१");
  const [author, setAuthor] = useState("अपाङ्गता सूचना केन्द्र, विराटनगर");

  // Section 2: Media (Image or Video - Optional)
  const [mediaType, setMediaType] = useState<"none" | "image" | "video">("none");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Section 3: Text Content Below Media
  const [summaryNe, setSummaryNe] = useState("");
  const [contentNe, setContentNe] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentSize, setAttachmentSize] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Populate form when modal opens or articleToEdit changes
  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      setSuccessMessage("");
      if (articleToEdit) {
        setCategory(articleToEdit.category);
        setTitleNe(articleToEdit.title_ne);
        setPublishedDateBs(articleToEdit.published_date_bs || "२०८२/०५/२१");
        setAuthor(articleToEdit.author || "अपाङ्गता सूचना केन्द्र, विराटनगर");
        
        // Media setup
        setImageUrl(articleToEdit.image_url || "");
        setVideoUrl(articleToEdit.video_url || "");
        if (articleToEdit.video_url) {
          setMediaType("video");
        } else if (articleToEdit.image_url) {
          setMediaType("image");
        } else {
          setMediaType("none");
        }

        setSummaryNe(articleToEdit.summary_ne);
        setContentNe(articleToEdit.content_ne);
        setTagsStr(articleToEdit.tags?.join(", ") || "");
        setAttachmentName(articleToEdit.attachment_name || "");
        setAttachmentSize(articleToEdit.attachment_size || "");
      } else {
        // Reset to default for new article
        setCategory("सूचना");
        setTitleNe("");
        setPublishedDateBs("२०८२/०५/२१");
        setAuthor("अपाङ्गता सूचना केन्द्र, विराटनगर");
        setMediaType("none");
        setImageUrl("");
        setVideoUrl("");
        setSummaryNe("");
        setContentNe("");
        setTagsStr("सूचना, अपाङ्गता, कोशी प्रदेश");
        setAttachmentName("");
        setAttachmentSize("");
      }
    }
  }, [isOpen, articleToEdit]);

  if (!isOpen) return null;

  // Helper to extract YouTube embed URL
  const getYouTubeEmbed = (url: string) => {
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return ytMatch && ytMatch[1] ? `https://www.youtube.com/embed/${ytMatch[1]}` : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!titleNe.trim()) {
      setErrorMessage("कृपया विषयवस्तुको हेडलाइन / शीर्षक अनिवार्य लेख्नुहोस्।");
      return;
    }
    if (!summaryNe.trim()) {
      setErrorMessage("कृपया संक्षिप्त सारांश अनिवार्य लेख्नुहोस्।");
      return;
    }
    if (!contentNe.trim()) {
      setErrorMessage("कृपया विस्तृत व्यहोरा अनिवार्य लेख्नुहोस्।");
      return;
    }

    const tags = tagsStr
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    setIsSubmitting(true);

    const payload = {
      category,
      title_ne: titleNe.trim(),
      published_date_bs: publishedDateBs.trim(),
      author: author.trim(),
      // Media is optional
      image_url: mediaType === "image" && imageUrl.trim() ? imageUrl.trim() : undefined,
      video_url: mediaType === "video" && videoUrl.trim() ? videoUrl.trim() : undefined,
      summary_ne: summaryNe.trim(),
      content_ne: contentNe.trim(),
      tags,
      attachment_name: attachmentName.trim() || undefined,
      attachment_size: attachmentSize.trim() || undefined,
    };

    try {
      if (isEditMode && articleToEdit) {
        // Update existing article
        const res = await fetch("/api/news", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: articleToEdit.id,
            ...payload
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "सच्याउन सकिएन।");

        setSuccessMessage("सूचना सफलतापूर्वक सच्याइयो!");
        setTimeout(() => {
          onSaved(data.article, false);
          onClose();
        }, 500);

      } else {
        // Create new article
        const res = await fetch("/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "नयाँ सूचना थप्न सकिएन।");

        setSuccessMessage("नयाँ सूचना सफलतापूर्वक प्रकाशित भयो!");
        setTimeout(() => {
          onSaved(data.article, true);
          onClose();
        }, 500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "प्रक्रिया असफल भयो। पुनः प्रयास गर्नुहोस्।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-editor-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {isEditMode ? (
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <Edit3 className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <PlusCircle className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 id="news-editor-title" className="text-lg sm:text-xl font-black tracking-wide text-white">
                {isEditMode ? "सूचना / समाचार सच्याउनुहोस् (Edit Notice / News)" : "नयाँ सूचना / समाचार थप गर्नुहोस् (Add New Notice / News)"}
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                क्रम: १. मुख्य हेडलाइन &nbsp;→&nbsp; २. तस्बिर वा भिडियो (वैकल्पिक) &nbsp;→&nbsp; ३. विवरण तथा टेक्स्ट
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800 dark:text-slate-200">
          
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 1: विषयवस्तुको हेडलाइन (HEADLINE AT TOP) */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs font-black flex items-center justify-center">
                १
              </span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                विषयवस्तुको हेडलाइन तथा वर्गीकरण (Headline & Details)
              </h3>
            </div>

            {/* Headline / Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                मुख्य हेडलाइन / शीर्षक <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                placeholder="उदा. आर्थिक वर्ष २०८२/०८३ को अपाङ्गता सहायता सहजकर्ता वार्षिक प्रतिवेदन प्रविष्टि खुला"
                value={titleNe}
                onChange={(e) => setTitleNe(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            {/* Category, Date & Author */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  वर्ग (Category) <span className="text-rose-600">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NewsArticle['category'])}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  <option value="सूचना">सूचना (Notice)</option>
                  <option value="समाचार">समाचार (News)</option>
                  <option value="कार्यक्रम">कार्यक्रम (Program)</option>
                  <option value="उपलब्धि">उपलब्धि (Achievement)</option>
                  <option value="घोषणा">घोषणा (Announcement)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  प्रकाशन मिति (वि.सं.) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="२०८२/०५/२१"
                  value={publishedDateBs}
                  onChange={(e) => setPublishedDateBs(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  प्रकाशक निकाय
                </label>
                <input
                  type="text"
                  placeholder="अपाङ्गता सूचना केन्द्र"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: तस्बिर वा भिडियो (MEDIA IN THE MIDDLE - OPTIONAL) */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border-2 border-amber-300/80 dark:border-amber-700/60 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-black flex items-center justify-center">
                  २
                </span>
                <h3 className="text-sm font-black text-amber-950 dark:text-amber-200">
                  तस्बिर वा भिडियो (Featured Media)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-full">
                वैकल्पिक / Optional
              </span>
            </div>

            {/* Media Type Selector Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMediaType("none")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  mediaType === "none"
                    ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-amber-50"
                }`}
              >
                <span>❌ मिडिया नराख्ने</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaType("image")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  mediaType === "image"
                    ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-amber-50"
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>🖼️ तस्बिर (Image)</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaType("video")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  mediaType === "video"
                    ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-amber-50"
                }`}
              >
                <VideoIcon className="w-4 h-4" />
                <span>🎥 भिडियो (Video)</span>
              </button>
            </div>

            {/* A. If Image Chosen */}
            {mediaType === "image" && (
              <div className="space-y-2.5 pt-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  तस्बिरको वेब लिङ्क (Image URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="px-2.5 py-2 bg-rose-100 text-rose-700 rounded-xl hover:bg-rose-200 text-xs font-bold cursor-pointer"
                      title="तस्बिर हटाउनुहोस्"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Quick Sample Image Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-500 font-semibold">नमुना तस्बिरहरू:</span>
                  {SAMPLE_IMAGES.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImageUrl(img.url)}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold border border-amber-300 cursor-pointer"
                    >
                      + {img.label}
                    </button>
                  ))}
                </div>

                {/* Live Image Preview */}
                {imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 max-h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-48 object-cover"
                      onError={() => alert("तस्बिर लोड गर्न सकिएन, कृपया सही लिङ्क जाँच्नुहोस्।")}
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded-md font-semibold">
                      तस्बिर पूर्वावलोकन (Preview)
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* B. If Video Chosen */}
            {mediaType === "video" && (
              <div className="space-y-2.5 pt-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  YouTube वा भिडियो लिङ्क (Video URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="उदा. https://www.youtube.com/watch?v=... वा MP4 भिडियो लिङ्क"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                  {videoUrl && (
                    <button
                      type="button"
                      onClick={() => setVideoUrl("")}
                      className="px-2.5 py-2 bg-rose-100 text-rose-700 rounded-xl hover:bg-rose-200 text-xs font-bold cursor-pointer"
                      title="भिडियो हटाउनुहोस्"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-semibold">नमुना भिडियो:</span>
                  <button
                    type="button"
                    onClick={() => setVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold border border-amber-300 cursor-pointer"
                  >
                    + YouTube भिडियो लिङ्क जोड्नुहोस्
                  </button>
                </div>

                {/* Live Video Preview */}
                {videoUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-black aspect-video max-h-56 w-full flex items-center justify-center">
                    {getYouTubeEmbed(videoUrl) ? (
                      <iframe
                        src={getYouTubeEmbed(videoUrl)!}
                        title="YouTube Video Preview"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video controls className="w-full h-full object-contain">
                        <source src={videoUrl} />
                        भिडियो लोड गर्न सकिएन।
                      </video>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: तस्बिर/भिडियोको मुनि TEXT विवरण (TEXT BELOW MEDIA) */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs font-black flex items-center justify-center">
                ३
              </span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                मुनि रहने टेक्स्ट विवरण (Text Content Below Media)
              </h3>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                संक्षिप्त सारांश (Short Summary) <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="हेडलाइन र तस्बिरको मुनि देखिने मुख्य २-३ वाक्यको सार..."
                value={summaryNe}
                onChange={(e) => setSummaryNe(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden resize-none"
              />
            </div>

            {/* Full Detailed Text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                विस्तृत व्यहोरा / पूर्ण विवरण (Full Content Body) <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={6}
                placeholder="सम्पूर्ण विवरण, बुँदाहरू वा निर्णयको पूर्ण व्यहोरा यहाँ प्रविष्टि गर्नुहोस्..."
                value={contentNe}
                onChange={(e) => setContentNe(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                ट्यागहरू (अल्पविरामले छुट्याउनुहोस्)
              </label>
              <input
                type="text"
                placeholder="उदा. परिपत्र, २०८२/०८३, स्थानीय तह, तालिम"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            {/* Attachment File info */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                संलग्न फाइल विवरण (वैकल्पिक Attachment Details)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    फाइलको नाम (PDF/DOC)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. सुचना_परिपत्र_२०८२.pdf"
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    फाइल साइज
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. ५४० KB वा १.२ MB"
                    value={attachmentSize}
                    onChange={(e) => setAttachmentSize(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              रद्द गर्नुहोस्
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 text-xs font-black rounded-xl text-white shadow-md flex items-center gap-2 cursor-pointer transition-all ${
                isEditMode
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-blue-900 hover:bg-blue-800"
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <span>प्रक्रिया हुँदैछ...</span>
              ) : isEditMode ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>सच्याइएको सुरक्षित गर्नुहोस् (Save Changes)</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>नयाँ प्रकाशित गर्नुहोस् (Publish Notice)</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
