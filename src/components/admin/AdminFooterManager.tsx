"use client";

import React, { useState, useEffect } from "react";
import { useFooter } from "@/lib/footerContext";
import { useAuth } from "@/lib/authContext";
import { FooterConfig, FooterQuickLink } from "@/types/footer";
import Link from "next/link";
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldCheck,
  HeartHandshake,
  PhoneCall,
  Mail,
  MapPin,
  ExternalLink,
  Layers,
  Sparkles,
  Info
} from "lucide-react";

export default function AdminFooterManager() {
  const { user } = useAuth();
  const { footerConfig, isSaving, saveFooterConfig, resetFooterConfigToDefault } = useFooter();

  // Local editable form state
  const [formData, setFormData] = useState<FooterConfig>(footerConfig);
  const [activeLangTab, setActiveLangTab] = useState<"ne" | "en">("ne");
  const [previewLang, setPreviewLang] = useState<"ne" | "en">("ne");
  const [showPreview, setShowPreview] = useState(true);

  // Notification state
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Sync with footerConfig from context when loaded
  useEffect(() => {
    if (footerConfig) {
      setFormData(footerConfig);
    }
  }, [footerConfig]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // RBAC Permission Check
  const isAuthorized = user?.role === "super_admin" || user?.role === "provincial_admin" || user?.id === "admin-master-001";

  if (!isAuthorized) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto text-xl">
          🚫
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">पहुँच अस्वीकृत (Access Restricted)</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          वेबसाइटको फुटर (तलको भाग) सम्पादन गर्न केवल अधिकृत <strong>Super Admin</strong> वा <strong>Provincial Admin</strong> लाई मात्र अनुमति छ।
        </p>
      </div>
    );
  }

  // Handle Input Changes
  const handleTextChange = (field: keyof FooterConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Quick Links Management
  const handleLinkChange = (id: string, field: keyof FooterQuickLink, value: any) => {
    setFormData((prev) => ({
      ...prev,
      quick_links: prev.quick_links.map((link) => (link.id === id ? { ...link, [field]: value } : link)),
    }));
  };

  const handleAddLink = () => {
    const newId = `link-${Date.now()}`;
    const newLink: FooterQuickLink = {
      id: newId,
      label_ne: "नयाँ लिङ्क",
      label_en: "New Link",
      href: "/",
      is_active: true,
      is_external: false,
    };
    setFormData((prev) => ({
      ...prev,
      quick_links: [...prev.quick_links, newLink],
    }));
  };

  const handleDeleteLink = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      quick_links: prev.quick_links.filter((link) => link.id !== id),
    }));
  };

  const handleMoveLink = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= formData.quick_links.length) return;

    const list = [...formData.quick_links];
    const [moved] = list.splice(index, 1);
    list.splice(nextIndex, 0, moved);

    setFormData((prev) => ({
      ...prev,
      quick_links: list,
    }));
  };

  // Save changes
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = await saveFooterConfig(formData);
    if (res.success) {
      showToast(res.message || "वेबसाइट फुटर सफलतापूर्वक सुरक्षित गरियो!", "success");
    } else {
      showToast(res.error || "सुरक्षित गर्दा समस्या आयो।", "error");
    }
  };

  // Reset changes
  const handleReset = async () => {
    setResetConfirmOpen(false);
    const res = await resetFooterConfigToDefault();
    if (res.success) {
      showToast(res.message || "फुटर पूर्वनिर्धारित अवस्थामा रिसेट गरियो।", "info");
    } else {
      showToast(res.error || "रिसेट गर्दा समस्या आयो।", "error");
    }
  };

  // Live Preview Helpers
  const previewIsNe = previewLang === "ne";
  const pAppName = previewIsNe ? formData.app_name_ne : formData.app_name_en;
  const pAppSub = previewIsNe ? formData.app_sub_name_ne : formData.app_sub_name_en;
  const pBrandDesc = previewIsNe ? formData.brand_desc_ne : formData.brand_desc_en;
  const pWcagBadge = previewIsNe ? formData.wcag_badge_ne : formData.wcag_badge_en;
  const pLinksTitle = previewIsNe ? formData.quick_links_title_ne : formData.quick_links_title_en;
  const pActiveLinks = formData.quick_links.filter((l) => l.is_active);
  const pContactTitle = previewIsNe ? formData.contact_title_ne : formData.contact_title_en;
  const pHelpDesk = previewIsNe ? formData.help_desk_name_ne : formData.help_desk_name_en;
  const pPhone = previewIsNe ? formData.phone_ne : formData.phone_en;
  const pEmail = formData.email;
  const pAddress = previewIsNe ? formData.address_ne : formData.address_en;
  const pCopyright = previewIsNe ? formData.copyright_ne : formData.copyright_en;
  const pA11yNote = previewIsNe ? formData.a11y_note_ne : formData.a11y_note_en;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold text-xs rounded-full border border-amber-300 dark:border-amber-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>वेबसाइट व्यवस्थापन (Site CMS)</span>
            </span>
            <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[11px] font-bold rounded-full">
              सबै पेजमा स्वतः लागू हुने
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            वेबसाइट फुटर व्यवस्थापन (Footer CMS)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            यहाँबाट गरिएको परिमार्जन सम्पूर्ण वेब एपका सबै पृष्ठहरूको तलको भाग (Footer) मा तत्काल अपडेट हुनेछ।
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setResetConfirmOpen(true)}
            disabled={isSaving}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-50"
            title="पूर्वनिर्धारित विवरणमा रिसेट गर्नुहोस्"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>रिसेट (Reset)</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "सुरक्षित हुँदैछ..." : "सुरक्षित गर्नुहोस् (Save Changes)"}</span>
          </button>
        </div>
      </div>

      {/* Toast Banner */}
      {toast && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md transition-all animate-in fade-in ${
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              : toast.type === "error"
              ? "bg-rose-50 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200"
              : "bg-blue-50 dark:bg-blue-950 border border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* LIVE INTERACTIVE VISUAL PREVIEW BOX (User's Exact Look) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-black text-sm text-slate-900 dark:text-white">
              प्रत्यक्ष पूर्वावलोकन (Live Visual Preview)
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              - तपाईंले टाइप गर्दा तलको भाग तुरुन्त परिवर्तन देखिनेछ
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setPreviewLang("ne")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  previewLang === "ne" ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                नेपालीमा हेर्नुहोस्
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang("en")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  previewLang === "en" ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                English View
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs text-blue-600 font-bold hover:underline px-2"
            >
              {showPreview ? "पूर्वावलोकन लुकाउनुहोस्" : "पूर्वावलोकन देखाउनुहोस्"}
            </button>
          </div>
        </div>

        {showPreview && (
          <div className="rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl bg-slate-900 text-slate-200">
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
                {/* Brand Column */}
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-linear-to-br from-red-700 to-blue-900 text-white font-black text-lg rounded-xl flex items-center justify-center border border-amber-400 shrink-0 shadow-md">
                      DIC
                    </div>
                    <div>
                      <span className="text-lg font-bold text-white block">{pAppName}</span>
                      <span className="text-xs text-slate-400 block font-medium">{pAppSub}</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed mb-4">
                    {pBrandDesc}
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-xl text-xs font-semibold text-amber-300 border border-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{pWcagBadge}</span>
                  </div>
                </div>

                {/* Quick Links Column */}
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 text-amber-400">
                    {pLinksTitle}
                  </h3>
                  <ul className="space-y-1 text-xs sm:text-sm">
                    {pActiveLinks.map((link) => (
                      <li key={link.id} className="text-slate-300 py-0.5">
                        • {previewIsNe ? link.label_ne : link.label_en}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contact & Support Column */}
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 text-amber-400">
                    {pContactTitle}
                  </h3>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <HeartHandshake className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="font-medium">{pHelpDesk}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="font-mono">{pPhone}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-mono">{pEmail}</span>
                    </li>
                    {pAddress && (
                      <li className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{pAddress}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Bottom Copyright Bar */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
                <p>{pCopyright}</p>
                <p className="text-slate-500">{pA11yNote}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDITING FORM ACCORDION / SECTIONS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        {/* Language Tabs for Form Editing */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <h2 className="font-black text-sm text-slate-900 dark:text-white">
              सम्पादन फारम (Footer Content Editor)
            </h2>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveLangTab("ne")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeLangTab === "ne" ? "bg-blue-900 text-white shadow-xs" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              🇳🇵 नेपाली भाषा
            </button>
            <button
              type="button"
              onClick={() => setActiveLangTab("en")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeLangTab === "en" ? "bg-blue-900 text-white shadow-xs" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              🇬🇧 English Content
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* SECTION 1: BRANDING & WCAG BADGE */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-900 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>ब्रान्ड, नाम, परिचय तथा WCAG ब्याच (Brand & Badge)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  एपको नाम ({activeLangTab === "ne" ? "नेपाली" : "English"}) *
                </label>
                <input
                  type="text"
                  required
                  value={activeLangTab === "ne" ? formData.app_name_ne : formData.app_name_en}
                  onChange={(e) =>
                    handleTextChange(activeLangTab === "ne" ? "app_name_ne" : "app_name_en", e.target.value)
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  उप-शीर्षक ({activeLangTab === "ne" ? "नेपाली" : "English"}) *
                </label>
                <input
                  type="text"
                  required
                  value={activeLangTab === "ne" ? formData.app_sub_name_ne : formData.app_sub_name_en}
                  onChange={(e) =>
                    handleTextChange(activeLangTab === "ne" ? "app_sub_name_ne" : "app_sub_name_en", e.target.value)
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                परिचय विवरण (Brand Description - {activeLangTab === "ne" ? "नेपाली" : "English"}) *
              </label>
              <textarea
                rows={2}
                required
                value={activeLangTab === "ne" ? formData.brand_desc_ne : formData.brand_desc_en}
                onChange={(e) =>
                  handleTextChange(activeLangTab === "ne" ? "brand_desc_ne" : "brand_desc_en", e.target.value)
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                WCAG 2.2 AA ब्याच पाठ ({activeLangTab === "ne" ? "नेपाली" : "English"}) *
              </label>
              <input
                type="text"
                required
                value={activeLangTab === "ne" ? formData.wcag_badge_ne : formData.wcag_badge_en}
                onChange={(e) =>
                  handleTextChange(activeLangTab === "ne" ? "wcag_badge_ne" : "wcag_badge_en", e.target.value)
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
              />
            </div>
          </div>

          {/* SECTION 2: QUICK LINKS (प्रमुख मोड्युलहरू) */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-900 text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>प्रमुख मोड्युलहरू तथा द्रुत लिङ्कहरू (Quick Links)</span>
              </h3>

              <button
                type="button"
                onClick={handleAddLink}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>नयाँ लिङ्क थप्नुहोस्</span>
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                मोड्युल समूहको शीर्षक ({activeLangTab === "ne" ? "नेपाली" : "English"}) *
              </label>
              <input
                type="text"
                required
                value={activeLangTab === "ne" ? formData.quick_links_title_ne : formData.quick_links_title_en}
                onChange={(e) =>
                  handleTextChange(activeLangTab === "ne" ? "quick_links_title_ne" : "quick_links_title_en", e.target.value)
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
              />
            </div>

            {/* List of links */}
            <div className="space-y-2.5 pt-1">
              {formData.quick_links.map((link, idx) => (
                <div
                  key={link.id}
                  className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shadow-xs"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold shrink-0">
                    {idx + 1}
                  </span>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="नेपाली नाम (उदा. १. पालिका प्रतिवेदन)"
                      value={link.label_ne}
                      onChange={(e) => handleLinkChange(link.id, "label_ne", e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="English label (e.g. 1. Palika Report)"
                      value={link.label_en}
                      onChange={(e) => handleLinkChange(link.id, "label_en", e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="URL (/reports, /laws, आदि)"
                      value={link.href}
                      onChange={(e) => handleLinkChange(link.id, "href", e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-medium"
                    />
                  </div>

                  {/* Active Toggle & Order Controls */}
                  <div className="flex items-center gap-1.5 shrink-0 justify-end">
                    <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400 cursor-pointer pr-1">
                      <input
                        type="checkbox"
                        checked={link.is_active}
                        onChange={(e) => handleLinkChange(link.id, "is_active", e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span>सक्रिय</span>
                    </label>

                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveLink(idx, "up")}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                      title="माथि सार्नुहोस्"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={idx === formData.quick_links.length - 1}
                      onClick={() => handleMoveLink(idx, "down")}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                      title="तल सार्नुहोस्"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer"
                      title="यो लिङ्क मेटाउनुहोस्"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: CONTACT & SUPPORT DETAILS */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-900 text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>सम्पर्क तथा सहयोग कक्ष (Contact & Support)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  सम्पर्क सेक्सनको शीर्षक ({activeLangTab === "ne" ? "नेपाली" : "English"}) *
                </label>
                <input
                  type="text"
                  required
                  value={activeLangTab === "ne" ? formData.contact_title_ne : formData.contact_title_en}
                  onChange={(e) =>
                    handleTextChange(activeLangTab === "ne" ? "contact_title_ne" : "contact_title_en", e.target.value)
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  सहयोग कक्षको नाम (Help Desk Name - {activeLangTab === "ne" ? "नेपाली" : "English"}) *
                </label>
                <input
                  type="text"
                  required
                  value={activeLangTab === "ne" ? formData.help_desk_name_ne : formData.help_desk_name_en}
                  onChange={(e) =>
                    handleTextChange(activeLangTab === "ne" ? "help_desk_name_ne" : "help_desk_name_en", e.target.value)
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  फोन नम्बर (Phone - {activeLangTab === "ne" ? "नेपाली" : "English"}) *
                </label>
                <input
                  type="text"
                  required
                  value={activeLangTab === "ne" ? formData.phone_ne : formData.phone_en}
                  onChange={(e) =>
                    handleTextChange(activeLangTab === "ne" ? "phone_ne" : "phone_en", e.target.value)
                  }
                  placeholder="फोन: +९७७-०२१-४६०XXX (कोशी प्रदेश)"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  आधिकारिक इमेल (Official Email) *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleTextChange("email", e.target.value)}
                  placeholder="info.dic@koshi.gov.np"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  कार्यालय ठेगाना (Office Location - {activeLangTab === "ne" ? "नेपाली" : "English"})
                </label>
                <input
                  type="text"
                  value={(activeLangTab === "ne" ? formData.address_ne : formData.address_en) || ""}
                  onChange={(e) =>
                    handleTextChange(activeLangTab === "ne" ? "address_ne" : "address_en", e.target.value)
                  }
                  placeholder="विराटनगर, कोशी प्रदेश, नेपाल"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: COPYRIGHT & A11Y DECLARATION */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-900 text-white text-xs flex items-center justify-center font-bold">4</span>
              <span>प्रतिलिपि अधिकार तथा पादटिप्पणी (Copyright & Accessibility Note)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  प्रतिलिपि अधिकार सन्देश (Copyright - {activeLangTab === "ne" ? "नेपाली" : "English"}) *
                </label>
                <input
                  type="text"
                  required
                  value={activeLangTab === "ne" ? formData.copyright_ne : formData.copyright_en}
                  onChange={(e) =>
                    handleTextChange(activeLangTab === "ne" ? "copyright_ne" : "copyright_en", e.target.value)
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  पहुँचयुक्तता टिप्पणी (Accessibility Note - {activeLangTab === "ne" ? "नेपाली" : "English"}) *
                </label>
                <input
                  type="text"
                  required
                  value={activeLangTab === "ne" ? formData.a11y_note_ne : formData.a11y_note_en}
                  onChange={(e) =>
                    handleTextChange(activeLangTab === "ne" ? "a11y_note_ne" : "a11y_note_en", e.target.value)
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Save Bar at Bottom */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                अन्तिम पटक अपडेट: <strong>{formData.updated_at ? new Date(formData.updated_at).toLocaleString() : "प्रणाली सुरु"}</strong>
                {formData.updated_by ? ` (द्वारा: ${formData.updated_by})` : ""}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(true)}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                पूर्वनिर्धारित रिसेट
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "सुरक्षित हुँदैछ..." : "सुरक्षित गर्नुहोस् (Save Changes)"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center mx-auto text-xl">
              ⚠️
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                पूर्वनिर्धारित फुटर रिसेट पुष्टि
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                के तपाईं वेबसाइट फुटरका सबै विवरणहरूलाई प्रणालीको सुरुवाती आधिकारिक अवस्थामा फर्काउन चाहनुहुन्छ?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                हो, रिसेट गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
