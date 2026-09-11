"use client";

import React, { useState } from "react";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import { translations, Language } from "@/lib/translations";
import { useLanguage } from "@/lib/languageContext";
import { 
  Search, 
  MapPin, 
  Building, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  KeyRound, 
  LogIn, 
  UserPlus, 
  LogOut,
  Sparkles,
  ExternalLink,
  FileCheck2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { useAccessibility } from "@/lib/accessibilityContext";
import UnifiedAuthModal from "@/components/auth/UnifiedAuthModal";

interface QuickPalikaFinderProps {
  lang?: Language;
}

export default function QuickPalikaFinder({ lang: propLang }: QuickPalikaFinderProps) {
  const { lang: contextLang } = useLanguage();
  const lang = propLang || contextLang;
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [selectedPalikaId, setSelectedPalikaId] = useState<string>("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signin");
  const [authModalRole, setAuthModalRole] = useState<"normal_user" | "employee">("normal_user");

  const { user, isAuthenticated, logout } = useAuth();
  const { announceLive, speakText } = useAccessibility();
  const t = translations[lang];

  const currentDistrict = KOSHI_DISTRICTS.find((d) => d.id === selectedDistrictId);
  const palikas = currentDistrict ? currentDistrict.local_governments : [];

  const openAuth = (tab: "signin" | "signup", role: "normal_user" | "employee" = "normal_user") => {
    setAuthModalTab(tab);
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  const isEmployee = user?.role === "employee" || user?.role === "palika_staff";
  const isSuperAdmin = user?.role === "super_admin" || user?.role === "provincial_admin";
  const isNormalUser = user?.role === "normal_user";
  const assignedPalikaId = user?.palika_id || user?.palikaId;
  const assignedPalikaName = user?.palika_name || user?.palikaName;

  // Strict Rule: Normal users MUST NEVER see or access the yellow "प्रतिवेदन फारम" button.
  // Only Super Admin OR an approved Employee assigned to this selected palika can access it.
  const canAccessForm = !isNormalUser && (
    isSuperAdmin || 
    (isEmployee && user?.account_status === "approved" && selectedPalikaId === assignedPalikaId)
  );

  const getLocalizedPalikaType = (type: string) => {
    if (lang === "ne") return type;
    switch (type) {
      case "महानगरपालिका": return "Metropolitan City";
      case "उपमहानगरपालिका": return "Sub-Metropolitan City";
      case "नगरपालिका": return "Municipality";
      case "गाउँपालिका": return "Rural Municipality";
      default: return type;
    }
  };

  return (
    <section aria-labelledby="quick-finder-heading" className="py-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* PROMINENT EMPLOYEE ASSIGNED REPORT BANNER (When approved employee is logged in) */}
        {isAuthenticated && isEmployee && assignedPalikaId && (
          <div className="mb-6 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-5 text-white shadow-lg border-2 border-emerald-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  {lang === "ne" ? "🏛️ तपाईंको कार्यक्षेत्र (Assigned Local Government)" : "🏛️ Your Assigned Local Government"}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {assignedPalikaName} — {lang === "ne" ? "वार्षिक प्रतिवेदन प्रविष्टि" : "Annual Report Entry"}
                </h3>
                <p className="text-xs text-emerald-100">
                  {lang === "ne" 
                    ? "आ.व. २०८२/०८३ को कार्यसम्पादन तथ्यांक भर्नुहोस्, ड्राफ्ट सुरक्षित गर्नुहोस् वा पेश गर्नुहोस्।" 
                    : "Fill FY 2082/083 performance data, save drafts, or submit."}
                </p>
              </div>
            </div>
            <Link
              href={`/local-reporting/palika/${assignedPalikaId}`}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center gap-2 shadow-md shrink-0 transition-transform transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{lang === "ne" ? "मेरो पालिकाको प्रतिवेदन खोल्नुहोस्" : "Open My Palika Report"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        <div className="bg-linear-to-r from-blue-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-blue-800/40 relative overflow-hidden">
          {/* Subtle background glow decoration */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar: Geography badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-400/30">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              {t.quick_finder_badge}
            </span>
          </div>

          <div className="max-w-3xl mb-6 relative z-10">
            <h2 id="quick-finder-heading" className="text-2xl sm:text-3xl font-black tracking-tight">
              {t.quick_finder_title}
            </h2>
            <p className="text-sm sm:text-base text-blue-100 mt-2">
              {t.quick_finder_desc}
            </p>
          </div>

          {/* PALIKA SELECT FORM */}
          <form 
            onSubmit={(e) => e.preventDefault()}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 relative z-10"
          >
            {/* 1. District Select */}
            <div>
              <label htmlFor="district-select" className="block text-xs font-bold text-amber-300 mb-1.5 uppercase tracking-wider">
                {t.quick_step_1}
              </label>
              <select
                id="district-select"
                value={selectedDistrictId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedDistrictId(val);
                  setSelectedPalikaId("");
                  if (val) {
                    const dist = KOSHI_DISTRICTS.find((d) => d.id === val);
                    if (dist) {
                      const msg = lang === "ne"
                        ? `${dist.name_ne} जिल्लाका ${dist.local_governments.length} स्थानीय तह उपलब्ध छन्।`
                        : `${dist.name_en} District has ${dist.local_governments.length} local governments available.`;
                      announceLive(msg);
                      speakText(msg);
                    }
                  }
                }}
                className="w-full bg-slate-900 text-white text-base sm:text-sm rounded-xl px-4 py-3 min-h-[48px] border border-slate-700 focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-medium cursor-pointer"
              >
                <option value="">{t.select_district}</option>
                {KOSHI_DISTRICTS.map((district) => (
                  <option key={district.id} value={district.id}>
                    {lang === "ne" ? district.name_ne : district.name_en} ({district.local_governments.length} {t.palika_count_suffix})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Palika Select */}
            <div>
              <label htmlFor="palika-select" className="block text-xs font-bold text-amber-300 mb-1.5 uppercase tracking-wider">
                {t.quick_step_2}
              </label>
              <select
                id="palika-select"
                disabled={!selectedDistrictId}
                value={selectedPalikaId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedPalikaId(val);
                  if (val) {
                    const p = palikas.find((item) => item.id === val);
                    if (p) {
                      const msg = lang === "ne" ? `${p.name_ne} स्थानीय तह छानियो।` : `Selected ${p.name_en} local government.`;
                      announceLive(msg);
                      speakText(msg);
                    }
                  }
                }}
                className={`w-full text-base sm:text-sm rounded-xl px-4 py-3 min-h-[48px] border focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-medium ${
                  selectedDistrictId 
                    ? "bg-slate-900 text-white border-slate-700 cursor-pointer" 
                    : "bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed opacity-60"
                }`}
              >
                <option value="">
                  {selectedDistrictId ? t.select_palika : (lang === "ne" ? "-- पहिले जिल्ला छान्नुहोस् --" : "-- Select District First --")}
                </option>
                {palikas.map((palika) => (
                  <option key={palika.id} value={palika.id}>
                    {lang === "ne" ? palika.name_ne : palika.name_en} ({getLocalizedPalikaType(palika.type)})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Action Buttons: Form Fill (Secure) + Profile */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-end w-full">
              {/* Show yellow "प्रतिवेदन फारम" ONLY for Super Admin OR Employee of this assigned palika */}
              {canAccessForm && (
                <Link
                  href={selectedPalikaId ? `/local-reporting/palika/${selectedPalikaId}` : "#"}
                  aria-disabled={!selectedPalikaId}
                  className={`flex-1 py-3 px-3 rounded-xl font-bold text-sm sm:text-sm flex items-center justify-center gap-2 transition-all text-center min-h-[48px] ${
                    selectedPalikaId 
                      ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20 cursor-pointer" 
                      : "bg-slate-700/60 text-slate-400 cursor-not-allowed pointer-events-none"
                  }`}
                >
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>{lang === "ne" ? "प्रतिवेदन फारम" : "Reporting Form"}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </Link>
              )}

              {/* Public Profile & Report Button: Always visible for normal users and visitors */}
              <Link
                href={selectedPalikaId ? `/local-reporting/palika/${selectedPalikaId}/profile` : "#"}
                aria-disabled={!selectedPalikaId}
                className={`w-full flex-1 py-3 px-4 rounded-xl font-bold text-sm sm:text-sm flex items-center justify-center gap-2 transition-all border min-h-[48px] ${
                  selectedPalikaId
                    ? "bg-blue-600/50 hover:bg-blue-600/70 text-white border-blue-400/50 hover:border-blue-300 shadow-md cursor-pointer"
                    : "bg-white/5 text-slate-400 border-white/10 cursor-not-allowed pointer-events-none"
                }`}
                title={lang === "ne" ? "पालिका प्रतिवेदन हेर्नुहोस् (खुल्ला विवरण)" : "View palika public report"}
              >
                <Building className="w-4 h-4 shrink-0 text-amber-300" />
                <span>
                  {canAccessForm 
                    ? (lang === "ne" ? "प्रतिवेदन" : "Report") 
                    : (lang === "ne" ? "📄 पालिका प्रतिवेदन हेर्नुहोस्" : "📄 View Palika Report")}
                </span>
                {!canAccessForm && <ArrowRight className="w-4 h-4 shrink-0 text-amber-300 ml-1" />}
              </Link>
            </div>
          </form>

          {/* Quick palika badges when district selected (Touch-Friendly) */}
          {currentDistrict && (
            <div className="mt-5 pt-4 border-t border-white/10 relative z-10">
              <p className="text-xs sm:text-sm font-bold text-amber-300 mb-3">
                {lang === "ne" ? `📍 ${currentDistrict.name_ne} जिल्लाका स्थानीय तहहरू (ट्याप गर्नुहोस्):` : `📍 Local governments in ${currentDistrict.name_en} District (tap to select):`}
              </p>
              <div className="flex flex-wrap gap-2">
                {palikas.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPalikaId(p.id)}
                    className={`text-xs sm:text-sm px-3.5 py-2 min-h-[40px] rounded-xl border transition-all cursor-pointer active:scale-95 flex items-center justify-center font-semibold ${
                      selectedPalikaId === p.id
                        ? "bg-amber-400 text-slate-950 font-black border-amber-300 shadow-md ring-2 ring-amber-300"
                        : "bg-white/10 text-slate-100 border-white/20 hover:bg-white/20"
                    }`}
                  >
                    {lang === "ne" ? p.name_ne : p.name_en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SECURITY & ROLE ARCHITECTURE FOOTER NOTE */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-200/90 relative z-10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>{lang === "ne" ? "रोल-आधारित सुरक्षा:" : "Role-Based Access:"}</strong>{" "}
                {lang === "ne" 
                  ? "स्वीकृत कर्मचारीले आफ्नो स्थानीय तहको प्रतिवेदन भर्न पाउनेछन्। मुख्य प्रशासकलाई सबै १३७ पालिकाको पूर्ण निरीक्षण र स्वीकृत/पुनरावलोकन अधिकार।"
                  : "Authorized staff can fill reports for their assigned palika. Super Admin has full oversight and review rights for all 137 palikas."}
              </span>
            </div>

            {/* Quick staff shortcut if logged in as staff */}
            {isAuthenticated && isEmployee && assignedPalikaId && (
              <Link
                href={`/local-reporting/palika/${assignedPalikaId}`}
                className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold underline shrink-0"
              >
                <span>{lang === "ne" ? `👉 मेरो पालिका (${assignedPalikaName}) को फारम भर्नुहोस्` : `👉 Fill Form for My Palika (${assignedPalikaName})`}</span>
              </Link>
            )}

            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => openAuth("signin")}
                className="text-amber-300 hover:text-amber-200 underline font-semibold cursor-pointer shrink-0"
              >
                🔐 {t.common.signInRegister}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* UNIFIED AUTH MODAL */}
      <UnifiedAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
        initialRole={authModalRole}
      />
    </section>
  );
}
