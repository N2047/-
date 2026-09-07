"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Scale, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  UploadCloud, 
  Link as LinkIcon, 
  X, 
  Building2, 
  Globe2, 
  Layers, 
  FileCheck,
  Check
} from "lucide-react";
import { LawDocument, LawCategory, GovLevel, LAW_CATEGORIES, NEPAL_PROVINCES } from "@/lib/lawsData";
import { useAuth } from "@/lib/authContext";
import { useLanguage } from "@/lib/languageContext";

export default function AdminLawManager() {
  const { user } = useAuth();
  const { lang } = useLanguage();

  // Laws State
  const [laws, setLaws] = useState<LawDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDoc, setEditingDoc] = useState<LawDocument | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [docToDelete, setDocToDelete] = useState<LawDocument | null>(null);

  // Upload Method Tab inside Modal: 'file' or 'url'
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");

  // Toast Notification
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success"
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Form State
  const [formData, setFormData] = useState({
    title_ne: "",
    title_en: "",
    category: "act" as LawCategory,
    gov_level: "federal" as GovLevel,
    province_id: "koshi",
    province_name_ne: "कोशी प्रदेश",
    issuing_authority: "नेपाल सरकार, संघीय संसद्",
    publication_date_bs: "२०८२/०५/२१",
    effective_date_bs: "२०८२/०५/२१",
    is_amended: false,
    amendment_date_bs: "",
    description_ne: "",
    keywords: "कानुन, अपाङ्गता, कोशी प्रदेश",
    pdf_url: "",
    file_size: "१.५ MB",
    source: "राजपत्र / मन्त्रालय अभिलेख"
  });

  // Fetch Laws from API
  const fetchLaws = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/laws");
      if (res.ok) {
        const data = await res.json();
        setLaws(data.laws || []);
      }
    } catch (err) {
      console.error("Failed to load laws:", err);
      showToast("कानुन दस्तावेजहरू लोड गर्न सकिएन।", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaws();
  }, []);

  // Filtered Laws
  const filteredLaws = useMemo(() => {
    return laws.filter((doc) => {
      const matchSearch =
        doc.title_ne.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description_ne.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchLevel = levelFilter === "all" ? true : doc.gov_level === levelFilter;
      const matchCat = categoryFilter === "all" ? true : doc.category === categoryFilter;

      return matchSearch && matchLevel && matchCat;
    });
  }, [laws, searchQuery, levelFilter, categoryFilter]);

  // Handle open Add Modal
  const handleOpenAddModal = () => {
    setEditingDoc(null);
    setFormData({
      title_ne: "",
      title_en: "",
      category: "act",
      gov_level: "federal",
      province_id: "koshi",
      province_name_ne: "कोशी प्रदेश",
      issuing_authority: "नेपाल सरकार, संघीय संसद्",
      publication_date_bs: "२०८२/०५/२१",
      effective_date_bs: "२०८२/०५/२१",
      is_amended: false,
      amendment_date_bs: "",
      description_ne: "",
      keywords: "कानुन, अपाङ्गता, कोशी प्रदेश",
      pdf_url: "",
      file_size: "१.५ MB",
      source: "राजपत्र / मन्त्रालय अभिलेख"
    });
    setUploadMethod("file");
    setIsModalOpen(true);
  };

  // Handle open Edit Modal
  const handleOpenEditModal = (doc: LawDocument) => {
    setEditingDoc(doc);
    setFormData({
      title_ne: doc.title_ne || "",
      title_en: doc.title_en || "",
      category: doc.category || "act",
      gov_level: doc.gov_level || "federal",
      province_id: doc.province_id || "koshi",
      province_name_ne: doc.province_name_ne || "कोशी प्रदेश",
      issuing_authority: doc.issuing_authority || "",
      publication_date_bs: doc.publication_date_bs || "२०८२/०५/२१",
      effective_date_bs: doc.effective_date_bs || doc.publication_date_bs || "२०८२/०५/२१",
      is_amended: Boolean(doc.is_amended),
      amendment_date_bs: doc.amendment_date_bs || "",
      description_ne: doc.description_ne || "",
      keywords: Array.isArray(doc.keywords) ? doc.keywords.join(", ") : doc.keywords || "",
      pdf_url: doc.pdf_url || "",
      file_size: doc.file_size || "१.५ MB",
      source: doc.source || "राजपत्र / मन्त्रालय अभिलेख"
    });
    setUploadMethod(doc.pdf_url && doc.pdf_url.startsWith("http") ? "url" : "file");
    setIsModalOpen(true);
  };

  // Handle File Upload (PDF / Document)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (< 15MB)
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = `${sizeInMB} MB`;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      setFormData(prev => ({
        ...prev,
        pdf_url: dataUrl,
        file_size: sizeStr
      }));
      showToast(`फाइल "${file.name}" (${sizeStr}) संलग्न भयो।`, "success");
    };
    reader.readAsDataURL(file);
  };

  // Handle Save / Post
  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_ne.trim()) {
      showToast("कृपया दस्तावेजको नेपाली शीर्षक अनिवार्य लेख्नुहोस्।", "error");
      return;
    }

    try {
      const payload = {
        ...formData,
        user: {
          id: user?.id || "admin-master-001",
          name: user?.name || "मुख्य प्रशासक",
          role: user?.role || "super_admin"
        }
      };

      if (editingDoc) {
        // PUT update
        const res = await fetch("/api/laws", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingDoc.id, ...payload })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(data.message || "कानुन दस्तावेज सफलतापूर्वक सच्याइयो।", "success");
          setIsModalOpen(false);
          fetchLaws();
        } else {
          showToast(data.error || "अपडेट गर्न सकिएन।", "error");
        }
      } else {
        // POST create
        const res = await fetch("/api/laws", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          showToast(data.message || "नयाँ कानुन दस्तावेज सफलतापूर्वक थप गरियो।", "success");
          setIsModalOpen(false);
          fetchLaws();
        } else {
          showToast(data.error || "थप गर्न सकिएन।", "error");
        }
      }
    } catch (err) {
      console.error("Save law error:", err);
      showToast("सर्भरमा समस्या आयो।", "error");
    }
  };

  // Handle Delete
  const confirmDelete = async () => {
    if (!docToDelete) return;
    try {
      const res = await fetch(`/api/laws?id=${docToDelete.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: docToDelete.id,
          user: { id: user?.id, name: user?.name, role: user?.role }
        })
      });

      if (res.ok) {
        showToast("कानुन दस्तावेज सफलतापूर्वक हटाइयो।", "success");
        setDeleteModalOpen(false);
        setDocToDelete(null);
        fetchLaws();
      } else {
        showToast("हटाउन सकिएन।", "error");
      }
    } catch {
      showToast("सर्भरमा समस्या आयो।", "error");
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Toast Alert */}
      {toast.show && (
        <div 
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-in slide-in-from-bottom-5 text-xs font-bold text-white ${
            toast.type === "success" 
              ? "bg-emerald-700 border-emerald-500" 
              : "bg-rose-700 border-rose-500"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <AlertTriangle className="w-4 h-4 text-rose-300" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Banner & Add Button */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            <span>कानुन तथा कानुनी दस्तावेज व्यवस्थापन (Legal Documents Management)</span>
          </h2>
          <p className="text-xs text-slate-500">
            संघीय तथा प्रादेशिक ऐन, नियमावली, कार्यविधि, निर्देशिका र परिपत्रहरूको अभिलेख
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-1.5 text-xs shadow-md cursor-pointer transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ दस्तावेज थप्नुहोस् (Add Law/Doc)</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="कानुनको नाम वा कुञ्जीशब्द खोज्नुहोस्..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium cursor-pointer"
          >
            <option value="all">सबै तह (All Levels)</option>
            <option value="federal">संघीय कानुन (Federal)</option>
            <option value="provincial">प्रदेश कानुन (Provincial)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium cursor-pointer"
          >
            <option value="all">सबै वर्ग (All Categories)</option>
            <option value="act">ऐन (Acts)</option>
            <option value="rule">नियमावली (Rules)</option>
            <option value="procedure">कार्यविधि (Procedures)</option>
            <option value="directive">निर्देशिका (Directives)</option>
            <option value="guideline">मार्गदर्शन (Guidelines)</option>
            <option value="circular">परिपत्र (Circulars)</option>
          </select>

          <span className="text-[11px] text-slate-500 font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            कुल: {filteredLaws.length}
          </span>
        </div>
      </div>

      {/* Laws Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            कानुन दस्तावेजहरू लोड हुँदैछ...
          </div>
        ) : filteredLaws.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              कुनै कानुनी दस्तावेज फेला परेन।
            </p>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-3.5 py-1.5 bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              + नयाँ दस्तावेज थप्नुहोस्
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="कानुनी दस्तावेज तालिका">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="p-3.5">दस्तावेजको नाम</th>
                  <th className="p-3.5">वर्ग (Category)</th>
                  <th className="p-3.5">तह (Level)</th>
                  <th className="p-3.5">जारी मिति (BS)</th>
                  <th className="p-3.5">फाइल</th>
                  <th className="p-3.5 text-right">कार्य (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredLaws.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white max-w-sm">
                      <div>{doc.title_ne}</div>
                      {doc.title_en && (
                        <div className="text-[11px] text-slate-400 font-normal italic truncate">
                          {doc.title_en}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-300 font-bold text-[11px] border border-indigo-200 dark:border-indigo-900">
                        {doc.category_name_ne}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {doc.gov_level === "federal" ? "🏛️ संघीय सरकार" : `🏔️ ${doc.province_name_ne || "प्रदेश सरकार"}`}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                      {doc.publication_date_bs}
                    </td>
                    <td className="p-3.5">
                      {doc.pdf_url && doc.pdf_url !== "#" ? (
                        <a
                          href={doc.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-bold text-[11px]"
                        >
                          <FileText className="w-3.5 h-3.5 text-red-500" />
                          <span>PDF ({doc.file_size || "डाउनलोड"})</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">उपलब्ध छ</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(doc)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold transition cursor-pointer"
                        title="सम्पादन गर्नुहोस्"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDocToDelete(doc);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-bold transition cursor-pointer"
                        title="हटाउनुहोस्"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT LAW MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900/80 rounded-t-3xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-700 text-white flex items-center justify-center shadow-xs">
                  <Scale className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {editingDoc ? "कानुनी दस्तावेज सम्पादन गर्नुहोस्" : "नयाँ कानुन दस्तावेज थप्नुहोस् (Add Law)"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    संघीय वा प्रादेशिक कानुन, ऐन, नियमावली, कार्यविधि तथा PDF अपलोड
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Form */}
            <form onSubmit={handleSaveDoc} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {/* 1. LEVEL SELECTION (Federal vs Provincial) */}
              <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-900 space-y-2.5">
                <label className="block font-black text-indigo-950 dark:text-indigo-200">
                  १. कानुनको तह छनौट गर्नुहोस् (Select Government Level) *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      gov_level: "federal",
                      issuing_authority: "नेपाल सरकार, संघीय संसद्"
                    }))}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                      formData.gov_level === "federal"
                        ? "bg-indigo-700 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-400/50"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-indigo-50"
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>🏛️ संघीय कानुन (Federal Law)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      gov_level: "provincial",
                      province_id: prev.province_id || "koshi",
                      province_name_ne: prev.province_name_ne || "कोशी प्रदेश",
                      issuing_authority: "सामाजिक विकास मन्त्रालय, कोशी प्रदेश"
                    }))}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                      formData.gov_level === "provincial"
                        ? "bg-indigo-700 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-400/50"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-indigo-50"
                    }`}
                  >
                    <Globe2 className="w-4 h-4" />
                    <span>🏔️ प्रदेश कानुन (Provincial Law)</span>
                  </button>
                </div>

                {/* If Provincial, select which Province */}
                {formData.gov_level === "provincial" && (
                  <div className="pt-2 animate-in fade-in">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      सम्बन्धित प्रदेश छनौट गर्नुहोस् (Select Province) *
                    </label>
                    <select
                      value={formData.province_id}
                      onChange={(e) => {
                        const prov = NEPAL_PROVINCES.find(p => p.id === e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          province_id: e.target.value,
                          province_name_ne: prov?.name_ne || "कोशी प्रदेश",
                          issuing_authority: `सामाजिक विकास मन्त्रालय, ${prov?.name_ne || "कोशी प्रदेश"}`
                        }));
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                    >
                      {NEPAL_PROVINCES.map((p) => (
                        <option key={p.id} value={p.id}>{p.name_ne} ({p.name_en})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 2. CATEGORY SELECTION (Act, Rule, Procedure, Directive, Guideline, Circular) */}
              <div className="space-y-1.5">
                <label className="block font-black text-slate-800 dark:text-slate-200">
                  २. कानुनको प्रकार / वर्ग छनौट गर्नुहोस् (Select Law Category) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LAW_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        formData.category === cat.id
                          ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/40 font-bold"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{cat.name_ne}</span>
                        {formData.category === cat.id && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {cat.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. DOCUMENT TITLES */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    दस्तावेजको पूरा नाम / शीर्षक (नेपाली) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. अपाङ्गता भएका व्यक्तिको अधिकार सम्बन्धी ऐन, २०७४"
                    value={formData.title_ne}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_ne: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Document Title (English / वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rights of Persons with Disabilities Act, 2017"
                    value={formData.title_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* 4. DATES & ISSUING AUTHORITY */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    जारी गर्ने निकाय (Authority)
                  </label>
                  <input
                    type="text"
                    value={formData.issuing_authority}
                    onChange={(e) => setFormData(prev => ({ ...prev, issuing_authority: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    जारी मिति (BS) *
                  </label>
                  <input
                    type="text"
                    placeholder="२०८२/०५/२१"
                    value={formData.publication_date_bs}
                    onChange={(e) => setFormData(prev => ({ ...prev, publication_date_bs: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    लागू मिति (BS)
                  </label>
                  <input
                    type="text"
                    placeholder="२०८२/०५/२१"
                    value={formData.effective_date_bs}
                    onChange={(e) => setFormData(prev => ({ ...prev, effective_date_bs: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              {/* 5. AMENDMENT CHECKBOX */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <label className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_amended}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_amended: e.target.checked }))}
                    className="rounded-sm text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <span>यो कानुन संशोधन भएको छ (Is Amended)?</span>
                </label>

                {formData.is_amended && (
                  <input
                    type="text"
                    placeholder="संशोधन मिति (उदा. २०७८/०१/१०)"
                    value={formData.amendment_date_bs}
                    onChange={(e) => setFormData(prev => ({ ...prev, amendment_date_bs: e.target.value }))}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs"
                  />
                )}
              </div>

              {/* 6. DESCRIPTION & KEYWORDS */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  दस्तावेजको मुख्य व्यहोरा तथा उद्देश्य (Description / Overview)
                </label>
                <textarea
                  rows={3}
                  placeholder="यस कानुनमा भएका मुख्य व्यवस्था, अपाङ्गता सम्बन्धी अधिकार, वर्गीकरण, प्रावधानहरू..."
                  value={formData.description_ne}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_ne: e.target.value }))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-indigo-600 focus:outline-hidden resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  खोजीका लागि कुञ्जीशब्दहरू (Keywords, अल्पविरामले छुट्याउनुहोस्)
                </label>
                <input
                  type="text"
                  placeholder="उदा. अपाङ्गता, ऐन, परिचयपत्र, कोशी, सहायता सामग्री"
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
                />
              </div>

              {/* 7. PDF / DOCUMENT UPLOAD SECTION */}
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border-2 border-amber-300/80 dark:border-amber-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-amber-600" />
                    <span>दस्तावेज / कानुन PDF संलग्न गर्नुहोस् (PDF / Document Upload) *</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                    PDF वा Web Link
                  </span>
                </div>

                {/* Upload Method Switch */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadMethod("file")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      uploadMethod === "file"
                        ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>कम्प्युटरबाट PDF फाइल छान्नुहोस्</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadMethod("url")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      uploadMethod === "url"
                        ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>अनलाइन PDF लिङ्क (URL)</span>
                  </button>
                </div>

                {uploadMethod === "file" ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept=".pdf, application/pdf, .doc, .docx"
                      onChange={handleFileChange}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                    />
                    {formData.pdf_url && (
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          <span>फाइल सफलतापूर्वक संलग्न गरियो (आकार: {formData.file_size})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, pdf_url: "" }))}
                          className="text-rose-600 text-xs hover:underline cursor-pointer"
                        >
                          हटाउनुहोस्
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                      PDF को अनलाइन वेब लिङ्क (Web URL):
                    </label>
                    <input
                      type="url"
                      placeholder="https://lawcommission.gov.np/wp-content/uploads/...pdf"
                      value={formData.pdf_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, pdf_url: e.target.value }))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer Buttons */}
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900/80 rounded-b-3xl -mx-6 -mb-6 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  रद्द गर्नुहोस् (Cancel)
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 text-amber-300" />
                  <span>{editingDoc ? "परिवर्तन सुरक्षित गर्नुहोस्" : "💾 कानुन दस्तावेज पोस्ट गर्नुहोस् (Publish Law)"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteModalOpen && docToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                के तपाईं यो कानुन दस्तावेज हटाउन चाहनुहुन्छ?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                दस्तावेज <strong>"{docToDelete.title_ne}"</strong> प्रणालीबाट हटाइनेछ।
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDocToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-100"
              >
                रद्द गर्नुहोस् (Cancel)
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                हटाउनुहोस् (Delete)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
