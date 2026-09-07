"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Image as ImageIcon, 
  Globe, 
  Layers, 
  Search, 
  X, 
  Save, 
  ShieldCheck, 
  Award, 
  Scale, 
  Building2, 
  BarChart3, 
  PhoneCall, 
  Mail, 
  MapPin, 
  BookOpen, 
  HeartHandshake, 
  Target, 
  Users, 
  HelpCircle, 
  FileText, 
  Star, 
  Sparkles, 
  Compass, 
  Lightbulb, 
  Landmark,
  FileCheck,
  Calendar,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { AboutSection, AboutSectionType, AboutSectionStatus, AboutSectionItem } from "@/types/about";
import RichTextEditor, { renderSanitizedContent } from "./RichTextEditor";
import { useAuth } from "@/lib/authContext";

// Available Lucide Icon Registry for About Us
export const AVAILABLE_ICONS: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Award,
  ShieldCheck,
  Scale,
  Building2,
  BarChart3,
  PhoneCall,
  Mail,
  MapPin,
  BookOpen,
  HeartHandshake,
  Target,
  Users,
  HelpCircle,
  FileText,
  Globe,
  Star,
  Sparkles,
  Compass,
  Lightbulb,
  Landmark,
  FileCheck
};

export const SECTION_TYPE_LABELS: Record<AboutSectionType, { ne: string; en: string }> = {
  hero: { ne: "शीर्षक तथा परिचय (Hero Header)", en: "Hero / Introduction" },
  vision_mandate: { ne: "दूरदृष्टि तथा मुख्य उद्देश्य (Vision & Mandate)", en: "Vision & Core Mandate" },
  mission: { ne: "लक्ष्य तथा कार्यनीति (Mission)", en: "Mission" },
  objectives: { ne: "उद्देश्य तथा कार्यहरू (Objectives)", en: "Objectives" },
  pillars: { ne: "मूल स्तम्भहरू (Core Pillars)", en: "Core Pillars" },
  accessibility: { ne: "पहुँचयुक्तता (WCAG 2.2 AA)", en: "Accessibility Standards" },
  contact: { ne: "सम्पर्क तथा हेल्पडेस्क (Contact & Helpdesk)", en: "Contact & Helpdesk" },
  custom: { ne: "अनुकूलित सेक्सन (Custom Section)", en: "Custom Section" }
};

export default function AdminAboutManagement() {
  const { user } = useAuth();

  // Main State
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "hidden">("all");
  const [activeView, setActiveView] = useState<"active" | "trash">("active");

  // Trash State
  const [trashSections, setTrashSections] = useState<AboutSection[]>([]);
  const [trashLoading, setTrashLoading] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<AboutSection | null>(null);
  const [formLangTab, setFormLangTab] = useState<"ne" | "en">("ne");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState("");

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    section: AboutSection | null;
    isPermanent: boolean;
  }>({ open: false, section: null, isPermanent: false });

  // Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewLang, setPreviewLang] = useState<"ne" | "en">("ne");
  const [previewSection, setPreviewSection] = useState<AboutSection | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Form State
  const [formData, setFormData] = useState({
    section_type: "custom" as AboutSectionType,
    title_ne: "",
    title_en: "",
    subtitle_ne: "",
    subtitle_en: "",
    badge_ne: "",
    badge_en: "",
    content_ne: "",
    content_en: "",
    image_url: "",
    image_alt_ne: "",
    image_alt_en: "",
    icon: "Award",
    status: "published" as AboutSectionStatus,
    display_order: 1,
    items: [] as AboutSectionItem[]
  });

  // Fetch active sections
  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/about");
      if (res.ok) {
        const data = await res.json();
        setSections(data.sections || []);
      }
    } catch (err) {
      console.error("Failed to load about sections:", err);
      showToast("सेक्सनहरू लोड गर्न सकिएन।", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch soft-deleted trash sections
  const fetchTrash = async () => {
    try {
      setTrashLoading(true);
      const res = await fetch("/api/admin/about?trash=true");
      if (res.ok) {
        const data = await res.json();
        // filter deleted
        const deleted = (data.sections || []).filter((s: AboutSection) => s.status === "deleted" || s.deleted_at);
        setTrashSections(deleted);
      }
    } catch (err) {
      console.error("Failed to load trash:", err);
    } finally {
      setTrashLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (activeView === "trash") {
      fetchTrash();
    }
  }, [activeView]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: sections.length,
      published: sections.filter(s => s.status === "published").length,
      draft: sections.filter(s => s.status === "draft").length,
      hidden: sections.filter(s => s.status === "hidden").length,
      trash: trashSections.length
    };
  }, [sections, trashSections]);

  // Filtered Sections
  const filteredSections = useMemo(() => {
    return sections.filter(sec => {
      const matchSearch = 
        sec.title_ne.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sec.subtitle_ne && sec.subtitle_ne.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sec.subtitle_en && sec.subtitle_en.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === "all" ? true : sec.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [sections, searchQuery, statusFilter]);

  // Handle open Add Modal
  const handleOpenAddModal = () => {
    const nextOrder = sections.reduce((max, s) => Math.max(max, s.display_order || 0), 0) + 1;
    setEditingSection(null);
    setFormData({
      section_type: "custom",
      title_ne: "",
      title_en: "",
      subtitle_ne: "",
      subtitle_en: "",
      badge_ne: "",
      badge_en: "",
      content_ne: "",
      content_en: "",
      image_url: "",
      image_alt_ne: "",
      image_alt_en: "",
      icon: "Award",
      status: "published",
      display_order: nextOrder,
      items: []
    });
    setFormLangTab("ne");
    setIsModalOpen(true);
  };

  // Handle open Edit Modal
  const handleOpenEditModal = (section: AboutSection) => {
    setEditingSection(section);
    setFormData({
      section_type: section.section_type || "custom",
      title_ne: section.title_ne || "",
      title_en: section.title_en || "",
      subtitle_ne: section.subtitle_ne || "",
      subtitle_en: section.subtitle_en || "",
      badge_ne: section.badge_ne || "",
      badge_en: section.badge_en || "",
      content_ne: section.content_ne || "",
      content_en: section.content_en || "",
      image_url: section.image_url || "",
      image_alt_ne: section.image_alt_ne || "",
      image_alt_en: section.image_alt_en || "",
      icon: section.icon || "Award",
      status: section.status || "published",
      display_order: section.display_order || 1,
      items: section.items ? JSON.parse(JSON.stringify(section.items)) : []
    });
    setFormLangTab("ne");
    setIsModalOpen(true);
  };

  // Handle Image Upload (Converts to Data URL with preview and size check)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (< 3MB)
    if (file.size > 3 * 1024 * 1024) {
      showToast("तस्बिरको आकार ३ MB भन्दा सानो हुनुपर्छ।", "error");
      return;
    }

    if (!file.type.startsWith("image/")) {
      showToast("कृपया वैध तस्बिर फाइल छान्नुहोस् (JPG, PNG, WebP)।", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      if (result) {
        setFormData(prev => ({ ...prev, image_url: result }));
        showToast("तस्बिर सफलतापूर्वक अपलोड गरियो।", "info");
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Form Submit (Save / Update)
  const handleSaveSection = async (forcedStatus?: AboutSectionStatus) => {
    if (!formData.title_ne.trim()) {
      showToast("कृपया सेक्सनको नेपाली शीर्षक लेख्नुहोस्।", "error");
      setFormLangTab("ne");
      return;
    }

    const finalStatus = forcedStatus || formData.status;
    const payload = {
      ...formData,
      status: finalStatus,
      user: {
        id: user?.id || "admin-master-001",
        name: user?.name || "मुख्य प्रशासक (Super Admin)",
        role: user?.role || "super_admin"
      }
    };

    try {
      if (editingSection) {
        // PUT update
        const res = await fetch("/api/admin/about", {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "x-admin-role": user?.role || "super_admin"
          },
          body: JSON.stringify({ id: editingSection.id, ...payload })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(data.message || "सेक्सन सफलतापूर्वक अपडेट भयो।", "success");
          setIsModalOpen(false);
          fetchSections();
        } else {
          showToast(data.error || "अपडेट गर्न समस्या आयो।", "error");
        }
      } else {
        // POST create
        const res = await fetch("/api/admin/about", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-admin-role": user?.role || "super_admin"
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          showToast(data.message || "नयाँ सेक्सन सिर्जना भयो।", "success");
          setIsModalOpen(false);
          fetchSections();
        } else {
          showToast(data.error || "सिर्जना गर्न समस्या आयो।", "error");
        }
      }
    } catch (err) {
      console.error("Save section error:", err);
      showToast("सर्भरमा समस्या आयो।", "error");
    }
  };

  // Quick Status Toggle
  const handleToggleStatus = async (section: AboutSection) => {
    const nextStatus: AboutSectionStatus = 
      section.status === "published" ? "hidden" : section.status === "hidden" ? "draft" : "published";

    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-role": user?.role || "super_admin"
        },
        body: JSON.stringify({
          id: section.id,
          status: nextStatus,
          user: { id: user?.id, name: user?.name, role: user?.role }
        })
      });

      if (res.ok) {
        showToast(`स्थिति परिवर्तन भयो: ${nextStatus === "published" ? "Published (सार्वजनिक)" : nextStatus === "hidden" ? "Hidden (गोप्य)" : "Draft (ड्राफ्ट)"}`, "success");
        setSections(prev => prev.map(s => s.id === section.id ? { ...s, status: nextStatus } : s));
      } else {
        showToast("स्थिति परिवर्तन गर्न सकिएन।", "error");
      }
    } catch {
      showToast("सर्भरमा समस्या आयो।", "error");
    }
  };

  // Move Section Up or Down (Reorder)
  const handleMoveSection = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sections.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Optimistically update UI
    setSections(newSections);

    const orderedIds = newSections.map(s => s.id);
    try {
      const res = await fetch("/api/admin/about", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-role": user?.role || "super_admin"
        },
        body: JSON.stringify({
          action: "reorder",
          orderedIds,
          user: { id: user?.id, name: user?.name, role: user?.role }
        })
      });

      if (res.ok) {
        showToast("सेक्सनहरूको क्रम सुरक्षित गरियो।", "success");
      } else {
        showToast("क्रम सुरक्षित गर्न सकिएन।", "error");
        fetchSections();
      }
    } catch {
      showToast("सर्भरमा समस्या आयो।", "error");
      fetchSections();
    }
  };

  // Confirm Delete
  const confirmDelete = async () => {
    if (!deleteModal.section) return;
    const { section, isPermanent } = deleteModal;

    try {
      const url = `/api/admin/about?id=${section.id}${isPermanent ? "&permanent=true" : ""}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": user?.role || "super_admin"
        },
        body: JSON.stringify({
          id: section.id,
          user: { id: user?.id, name: user?.name, role: user?.role }
        })
      });

      if (res.ok) {
        showToast(
          isPermanent ? "सेक्सन स्थायी रूपमा मेटाइयो।" : "सेक्सन रद्दीटोकरी (Trash) मा सारियो।",
          "success"
        );
        setDeleteModal({ open: false, section: null, isPermanent: false });
        fetchSections();
        fetchTrash();
      } else {
        showToast("हटाउन सकिएन।", "error");
      }
    } catch {
      showToast("सर्भरमा समस्या आयो।", "error");
    }
  };

  // Restore Section from Trash
  const handleRestoreSection = async (section: AboutSection) => {
    try {
      const res = await fetch("/api/admin/about", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": user?.role || "super_admin"
        },
        body: JSON.stringify({
          action: "restore",
          id: section.id,
          user: { id: user?.id, name: user?.name, role: user?.role }
        })
      });

      if (res.ok) {
        showToast(`सेक्सन "${section.title_ne}" पुनःस्थापना भयो।`, "success");
        fetchSections();
        fetchTrash();
      } else {
        showToast("पुनःस्थापना गर्न सकिएन।", "error");
      }
    } catch {
      showToast("सर्भरमा समस्या आयो।", "error");
    }
  };

  // Dynamic Sub-item / Cards handlers
  const handleAddCardItem = () => {
    const newItem: AboutSectionItem = {
      id: `item-${Date.now()}`,
      title_ne: "",
      title_en: "",
      desc_ne: "",
      desc_en: "",
      icon: "ShieldCheck"
    };
    setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
  };

  const handleUpdateCardItem = (index: number, field: keyof AboutSectionItem, val: string) => {
    setFormData(prev => {
      const newItems = [...(prev.items || [])];
      newItems[index] = { ...newItems[index], [field]: val };
      return { ...prev, items: newItems };
    });
  };

  const handleRemoveCardItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index)
    }));
  };

  // Selected Icon Component
  const SelectedIconComponent = AVAILABLE_ICONS[formData.icon] || Award;

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toast.show && (
        <div 
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-in slide-in-from-bottom-5 text-xs font-bold text-white ${
            toast.type === "success" 
              ? "bg-emerald-700 border-emerald-500" 
              : toast.type === "error" 
                ? "bg-rose-700 border-rose-500" 
                : "bg-blue-800 border-blue-600"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <AlertTriangle className="w-4 h-4 text-rose-300" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-blue-300" />
              <span>CMS प्रणाली (About Us Management)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              हाम्रो बारेमा (About Us) सामग्री व्यवस्थापन
            </h1>
            <p className="text-xs text-blue-200/90 max-w-2xl leading-relaxed">
              वेबसाइटको About Us पेजका सम्पूर्ण शीर्षक, स्तम्भ, उद्देश्य, तस्बिर र विवरणहरू Admin Panel बाटै सम्पादन, पुनःक्रम र प्रकाशन गर्नुहोस्।
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setPreviewSection(null);
                setPreviewModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition border border-white/20 cursor-pointer shadow-xs"
            >
              <Eye className="w-4 h-4 text-blue-300" />
              <span>पृष्ठ पूर्वावलोकन (Preview)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ नयाँ सेक्सन थप्नुहोस्</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="bg-white/10 rounded-2xl p-3 border border-white/10 text-center">
            <div className="text-lg font-black">{stats.total}</div>
            <div className="text-[11px] text-blue-200">कुल सेक्सनहरू</div>
          </div>
          <div className="bg-emerald-500/20 rounded-2xl p-3 border border-emerald-400/30 text-center text-emerald-200">
            <div className="text-lg font-black text-emerald-300">{stats.published}</div>
            <div className="text-[11px]">सार्वजनिक (Published)</div>
          </div>
          <div className="bg-amber-500/20 rounded-2xl p-3 border border-amber-400/30 text-center text-amber-200">
            <div className="text-lg font-black text-amber-300">{stats.draft}</div>
            <div className="text-[11px]">ड्राफ्ट (Draft)</div>
          </div>
          <div className="bg-slate-500/20 rounded-2xl p-3 border border-slate-400/30 text-center text-slate-300">
            <div className="text-lg font-black">{stats.hidden}</div>
            <div className="text-[11px]">गोप्य (Hidden)</div>
          </div>
          <button
            type="button"
            onClick={() => setActiveView(activeView === "active" ? "trash" : "active")}
            className={`rounded-2xl p-3 border text-center transition cursor-pointer ${
              activeView === "trash"
                ? "bg-rose-500/40 border-rose-400 text-white ring-2 ring-rose-400"
                : "bg-white/10 hover:bg-white/20 border-white/10 text-slate-200"
            }`}
          >
            <div className="text-lg font-black text-rose-300">{stats.trash}</div>
            <div className="text-[11px] flex items-center justify-center gap-1">
              <Trash2 className="w-3 h-3" />
              <span>रद्दीटोकरी (Trash)</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Area: Active List OR Trash List */}
      {activeView === "active" ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          
          {/* Controls Bar: Search & Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="शीर्षक वा विवरण खोज्नुहोस्..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">स्थिति:</span>
              {(["all", "published", "draft", "hidden"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer capitalize ${
                    statusFilter === st
                      ? "bg-blue-900 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {st === "all" ? "सबै (All)" : st === "published" ? "Published" : st === "draft" ? "Draft" : "Hidden"}
                </button>
              ))}
            </div>
          </div>

          {/* Reorder instructions tip */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <ArrowUp className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
              <ArrowDown className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
              <span>
                <strong>क्रम परिवर्तन:</strong> सेक्सनको स्थान परिवर्तन गर्न दायाँपट्टिको <strong>↑</strong> र <strong>↓</strong> बटन प्रयोग गर्नुहोस्। नयाँ क्रम तत्काल वेबसाइटमा लागू हुन्छ।
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              कुल {filteredSections.length} वटा सेक्सन
            </span>
          </div>

          {/* Sections List */}
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              सेक्सनहरू लोड हुँदैछ, कृपया पर्खनुहोस्...
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                कुनै सेक्सन फेला परेन।
              </p>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                + पहिलो सेक्सन थप्नुहोस्
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSections.map((sec, idx) => {
                const IconComp = AVAILABLE_ICONS[sec.icon || "Award"] || Award;
                const isEnglishMissing = !sec.title_en || !sec.content_en;

                return (
                  <div
                    key={sec.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    {/* Left Info */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      
                      {/* Order & Icon Box */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black flex items-center justify-center border border-slate-300 dark:border-slate-700">
                          {idx + 1}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center border border-blue-200 dark:border-blue-900 shadow-xs">
                          <IconComp className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Titles & Metadata */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {SECTION_TYPE_LABELS[sec.section_type]?.ne || sec.section_type}
                          </span>

                          {sec.badge_ne && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              🏷️ {sec.badge_ne}
                            </span>
                          )}

                          {/* Status Badge */}
                          <span 
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              sec.status === "published"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300"
                                : sec.status === "draft"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300"
                                  : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-400"
                            }`}
                          >
                            {sec.status === "published" ? "✓ Published" : sec.status === "draft" ? "📝 Draft" : "🙈 Hidden"}
                          </span>

                          {/* Missing English Warning */}
                          {isEnglishMissing && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>English translation missing</span>
                            </span>
                          )}
                        </div>

                        {/* Title Nepali */}
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {sec.title_ne}
                        </h2>

                        {/* Title English */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic truncate">
                          {sec.title_en || "(No English title provided)"}
                        </p>

                        {/* Additional info pills */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                          <span>अपडेट: {new Date(sec.updated_at).toLocaleDateString("ne-NP")}</span>
                          {sec.items && sec.items.length > 0 && (
                            <span>• {sec.items.length} उप-स्तम्भहरू (Cards)</span>
                          )}
                          {sec.image_url && (
                            <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" /> तस्बिर संलग्न
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Actions: Reorder Buttons & Operation Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      
                      {/* Reorder Up/Down */}
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 mr-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveSection(idx, "up")}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                          title="माथि सार्नुहोस् (Move Up)"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === sections.length - 1}
                          onClick={() => handleMoveSection(idx, "down")}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                          title="तल सार्नुहोस् (Move Down)"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Quick Toggle Status */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(sec)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                        title="स्थिति परिवर्तन गर्नुहोस् (Toggle Published/Draft/Hidden)"
                      >
                        {sec.status === "published" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                        <span className="hidden md:inline">स्थिति</span>
                      </button>

                      {/* Preview Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewSection(sec);
                          setPreviewModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                        title="पूर्वावलोकन हेर्नुहोस्"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">हेर्नुहोस्</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(sec)}
                        className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>सम्पादन</span>
                      </button>

                      {/* Soft Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDeleteModal({ open: true, section: sec, isPermanent: false })}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition cursor-pointer"
                        title="रद्दीटोकरीमा सार्नुहोस्"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* TRASH / DELETED ITEMS VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  रद्दीटोकरी / मेटाइएका सेक्सनहरू (Trash & Deleted Sections)
                </h2>
                <p className="text-xs text-slate-500">
                  यी सामग्रीहरू वेबसाइटमा देखिँदैनन् तर सुरक्षित छन्। यहाँबाट पुनःस्थापना वा स्थायी रूपमा मेटाउन सक्नुहुन्छ।
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveView("active")}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200"
            >
              ← मुख्य सूचीमा फर्कनुहोस्
            </button>
          </div>

          {trashLoading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              रद्दीटोकरी लोड हुँदैछ...
            </div>
          ) : trashSections.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              रद्दीटोकरी खाली छ। कुनै मेटाइएका सेक्सन छैनन्।
            </div>
          ) : (
            <div className="space-y-3">
              {trashSections.map((sec) => (
                <div
                  key={sec.id}
                  className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200">
                        Deleted
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {sec.title_ne}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 italic">
                      {sec.title_en}
                    </p>
                    <div className="text-[10px] text-slate-400">
                      हटाइएको मिति: {sec.deleted_at ? new Date(sec.deleted_at).toLocaleString("ne-NP") : "पहिले"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRestoreSection(sec)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>पुनःस्थापना (Restore)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteModal({ open: true, section: sec, isPermanent: true })}
                      className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>स्थायी मेटाउनुहोस् (Purge)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT SECTION MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
                  {editingSection ? <Edit3 className="w-4 h-4 text-amber-400" /> : <Plus className="w-5 h-5 text-amber-400" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {editingSection ? "About Us सेक्सन सम्पादन गर्नुहोस्" : "नयाँ About Us सेक्सन थप्नुहोस्"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    नेपाली तथा अंग्रेजी सामग्री, तस्बिर, आइकन र उप-स्तम्भहरू व्यवस्थापन
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

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              
              {/* Row 1: Section Type, Icon & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                
                {/* Section Type */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    सेक्सनको प्रकार (Section Type) *
                  </label>
                  <select
                    value={formData.section_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, section_type: e.target.value as AboutSectionType }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    {Object.entries(SECTION_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label.ne}</option>
                    ))}
                  </select>
                </div>

                {/* Icon Selector Button */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    प्रतीक चिन्ह (Icon)
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIconPickerOpen(!iconPickerOpen)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 flex items-center justify-between font-medium cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <SelectedIconComponent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>{formData.icon}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* Icon Dropdown Grid */}
                    {iconPickerOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl p-3 shadow-2xl space-y-2 max-h-56 overflow-y-auto">
                        <input
                          type="text"
                          value={iconSearch}
                          onChange={(e) => setIconSearch(e.target.value)}
                          placeholder="आइकन खोज्नुहोस्..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                        />
                        <div className="grid grid-cols-4 gap-1.5">
                          {Object.entries(AVAILABLE_ICONS)
                            .filter(([name]) => name.toLowerCase().includes(iconSearch.toLowerCase()))
                            .map(([name, Comp]) => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, icon: name }));
                                  setIconPickerOpen(false);
                                }}
                                className={`p-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition ${
                                  formData.icon === name
                                    ? "bg-blue-100 border-blue-600 text-blue-900 dark:bg-blue-950 dark:text-blue-300"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent"
                                }`}
                              >
                                <Comp className="w-4 h-4" />
                                <span className="text-[9px] truncate max-w-[50px]">{name}</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Display Order */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    प्रदर्शन क्रम (Display Order)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Language Switch Tabs (Nepali vs English) */}
              <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormLangTab("ne")}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                      formLangTab === "ne"
                        ? "bg-blue-900 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    <span>🇳🇵 नेपाली सामग्री (Nepali)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormLangTab("en")}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                      formLangTab === "en"
                        ? "bg-blue-900 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    <span>🇬🇧 English Content</span>
                    {(!formData.title_en || !formData.content_en) && (
                      <span className="w-2 h-2 rounded-full bg-rose-500" title="English translation required" />
                    )}
                  </button>
                </div>

                <span className="text-[11px] text-slate-400">
                  {formLangTab === "ne" ? "नेपाली संस्करण सम्पादन हुँदैछ" : "Editing English translation"}
                </span>
              </div>

              {/* BILINGUAL FIELDS */}
              {formLangTab === "ne" ? (
                /* NEPALI FIELDS */
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        ब्याच / ट्याग (Badge)
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. संस्थागत परिचय"
                        value={formData.badge_ne}
                        onChange={(e) => setFormData(prev => ({ ...prev, badge_ne: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        सेक्सनको शीर्षक (Title) *
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. अपाङ्गता सूचना केन्द्र (DIC) को बारेमा"
                        value={formData.title_ne}
                        onChange={(e) => setFormData(prev => ({ ...prev, title_ne: e.target.value }))}
                        required
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      संक्षिप्त उपशीर्षक वा भूमिका (Subtitle / Short Description)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="सेक्सनको मुख्य सारांश वा सानो परिचय..."
                      value={formData.subtitle_ne}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle_ne: e.target.value }))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 focus:outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <RichTextEditor
                      label="पूर्ण व्यहोरा तथा विवरण (Full Content with Rich Text Editor)"
                      value={formData.content_ne}
                      onChange={(val) => setFormData(prev => ({ ...prev, content_ne: val }))}
                      lang="ne"
                      placeholder="यहाँ बुलेट पोइन्ट, बोल्ड, इटालिक, लिंक र अनुच्छेद सहित विस्तृत सामग्री लेख्नुहोस्..."
                    />
                  </div>
                </div>
              ) : (
                /* ENGLISH FIELDS */
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Badge (English)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Institutional Profile"
                        value={formData.badge_en}
                        onChange={(e) => setFormData(prev => ({ ...prev, badge_en: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Section Title (English) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. About Disability Information Center (DIC)"
                        value={formData.title_en}
                        onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Subtitle / Short Description (English)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief introductory summary in English..."
                      value={formData.subtitle_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle_en: e.target.value }))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 focus:outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <RichTextEditor
                      label="Full Content (English Rich Text)"
                      value={formData.content_en}
                      onChange={(val) => setFormData(prev => ({ ...prev, content_en: val }))}
                      lang="en"
                      placeholder="Write rich formatted content in English..."
                    />
                  </div>
                </div>
              )}

              {/* MEDIA / IMAGE MANAGEMENT SECTION */}
              <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>तस्बिर व्यवस्थापन (Featured Media / Image)</span>
                  </div>
                  {formData.image_url && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: "", image_alt_ne: "", image_alt_en: "" }))}
                      className="text-rose-600 text-xs font-bold hover:underline cursor-pointer"
                    >
                      तस्बिर हटाउनुहोस्
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                      तस्बिरको वेब लिङ्क (Image URL):
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                      वा कम्प्युटरबाट फाइल छान्नुहोस् (Upload File):
                    </label>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageFileChange}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 cursor-pointer"
                    />
                  </div>
                </div>

                {formData.image_url && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 h-24 bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                        तस्बिर विवरण (Nepali Alt Text):
                      </label>
                      <input
                        type="text"
                        placeholder="दृष्टिविहीन प्रयोगकर्ताका लागि तस्बिरको वर्णन..."
                        value={formData.image_alt_ne}
                        onChange={(e) => setFormData(prev => ({ ...prev, image_alt_ne: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                        English Alt Text:
                      </label>
                      <input
                        type="text"
                        placeholder="Image description for screen readers..."
                        value={formData.image_alt_en}
                        onChange={(e) => setFormData(prev => ({ ...prev, image_alt_en: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SUB-CARDS / PILLARS / HIGHLIGHTS SECTION */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>उप-स्तम्भहरू तथा मुख्य बुँदाहरू (Sub-cards / Pillars / Items)</span>
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Vision का ३ वटा स्तम्भहरू वा WCAG का ४ वटा बुँदाहरू जस्ता कार्डहरू यहाँबाट व्यवस्थापन गर्नुहोस्
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCardItem}
                    className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-900 dark:text-blue-300 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ कार्ड थप्नुहोस्</span>
                  </button>
                </div>

                {formData.items && formData.items.length > 0 ? (
                  <div className="space-y-2.5 pt-1">
                    {formData.items.map((item, cIdx) => (
                      <div
                        key={item.id || cIdx}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-500">कार्ड #{cIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCardItem(cIdx)}
                            className="text-rose-600 hover:text-rose-800 text-xs font-bold cursor-pointer"
                          >
                            हटाउनुहोस्
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="कार्ड शीर्षक (नेपाली) *"
                            value={item.title_ne}
                            onChange={(e) => handleUpdateCardItem(cIdx, "title_ne", e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                          />
                          <input
                            type="text"
                            placeholder="Card Title (English)"
                            value={item.title_en}
                            onChange={(e) => handleUpdateCardItem(cIdx, "title_en", e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <textarea
                            rows={2}
                            placeholder="कार्ड विवरण (नेपाली)..."
                            value={item.desc_ne}
                            onChange={(e) => handleUpdateCardItem(cIdx, "desc_ne", e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs resize-none"
                          />
                          <textarea
                            rows={2}
                            placeholder="Card Description (English)..."
                            value={item.desc_en}
                            onChange={(e) => handleUpdateCardItem(cIdx, "desc_en", e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-slate-400 text-[11px] italic">
                    कुनै उप-स्तम्भ कार्ड छैन (वैकल्पिक)।
                  </div>
                )}
              </div>

              {/* Status Selector */}
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  प्रकाशन स्थिति (Publish Status):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: "published" }))}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      formData.status === "published"
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    ✓ Published
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: "draft" }))}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      formData.status === "draft"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    📝 Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: "hidden" }))}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      formData.status === "hidden"
                        ? "bg-slate-700 text-white shadow-xs"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    🙈 Hidden
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900/60 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                रद्द गर्नुहोस् (Cancel)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveSection("draft")}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer shadow-xs"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveSection("published")}
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>सुरक्षित गर्नुहोस् (Publish)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE / TRASH CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteModal.open && deleteModal.section && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {deleteModal.isPermanent
                  ? "स्थायी रूपमा मेटाउने निश्चित हुनुहुन्छ?"
                  : "के तपाईं यो सेक्सन हटाउन चाहनुहुन्छ?"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {deleteModal.isPermanent
                  ? "यो कार्य फिर्ता गर्न सकिने छैन। सेक्सन डाटाबेसबाट सधैंका लागि मेटिनेछ।"
                  : `सेक्सन "${deleteModal.section.title_ne}" रद्दीटोकरी (Trash) मा सारिनेछ र पछि आवश्यक परे पुनःस्थापना गर्न सकिनेछ।`}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, section: null, isPermanent: false })}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-100"
              >
                रद्द गर्नुहोस् (Cancel)
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                {deleteModal.isPermanent ? "स्थायी मेटाउनुहोस्" : "हटाउनुहोस् (Move to Trash)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIVE ADMIN PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-300 dark:border-slate-800 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            
            {/* Preview Header Bar */}
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 rounded-t-3xl flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-300 flex items-center justify-center font-bold">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    सार्वजनिक पृष्ठ पूर्वावलोकन (Live Public Preview)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    वेबसाइटमा आगन्तुकहरूले देख्ने ठ्याक्कै वास्तविक रूप
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Switch */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setPreviewLang("ne")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      previewLang === "ne" ? "bg-blue-900 text-white shadow-xs" : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    🇳🇵 नेपाली
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewLang("en")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      previewLang === "en" ? "bg-blue-900 text-white shadow-xs" : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    🇬🇧 English
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {(previewSection ? [previewSection] : sections.filter(s => s.status === "published")).map((sec) => {
                const IconComp = AVAILABLE_ICONS[sec.icon || "Award"] || Award;
                const title = previewLang === "ne" ? sec.title_ne : (sec.title_en || sec.title_ne);
                const subtitle = previewLang === "ne" ? sec.subtitle_ne : (sec.subtitle_en || sec.subtitle_ne);
                const badge = previewLang === "ne" ? sec.badge_ne : (sec.badge_en || sec.badge_ne);
                const content = previewLang === "ne" ? sec.content_ne : (sec.content_en || sec.content_ne);

                return (
                  <div
                    key={sec.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                  >
                    {badge && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                        <IconComp className="w-3.5 h-3.5 text-amber-500" />
                        <span>{badge}</span>
                      </div>
                    )}

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                      {!badge && <IconComp className="w-6 h-6 text-blue-700 dark:text-blue-400" />}
                      <span>{title}</span>
                    </h2>

                    {subtitle && (
                      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        {subtitle}
                      </p>
                    )}

                    {sec.image_url && (
                      <div className="rounded-2xl overflow-hidden max-h-64 border border-slate-200 dark:border-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sec.image_url}
                          alt={previewLang === "ne" ? sec.image_alt_ne || title : sec.image_alt_en || title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {content && (
                      <div className="pt-2">
                        {renderSanitizedContent(content)}
                      </div>
                    )}

                    {/* Sub-cards */}
                    {sec.items && sec.items.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
                        {sec.items.map((item, iIdx) => {
                          const itemTitle = previewLang === "ne" ? item.title_ne : (item.title_en || item.title_ne);
                          const itemDesc = previewLang === "ne" ? item.desc_ne : (item.desc_en || item.desc_ne);
                          const ItemIcon = AVAILABLE_ICONS[item.icon || "ShieldCheck"] || ShieldCheck;

                          return (
                            <div
                              key={item.id || iIdx}
                              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                            >
                              <ItemIcon className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                                {itemTitle}
                              </h3>
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                {itemDesc}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
