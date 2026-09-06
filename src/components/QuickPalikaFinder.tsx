"use client";

import React, { useState } from "react";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import { translations, Language } from "@/lib/translations";
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
  lang: Language;
}

export default function QuickPalikaFinder({ lang }: QuickPalikaFinderProps) {
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
                  🏛️ तपाईंको कार्यक्षेत्र (Assigned Local Government)
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {assignedPalikaName} — वार्षिक प्रतिवेदन प्रविष्टि
                </h3>
                <p className="text-xs text-emerald-100">
                  आ.व. २०८२/०८३ को कार्यसम्पादन तथ्यांक भर्नुहोस्, ड्राफ्ट सुरक्षित गर्नुहोस् वा पेश गर्नुहोस्।
                </p>
              </div>
            </div>
            <Link
              href={`/local-reporting/palika/${assignedPalikaId}`}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center gap-2 shadow-md shrink-0 transition-transform transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>मेरो पालिकाको प्रतिवेदन खोल्नुहोस्</span>
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
              कोशी प्रदेशका १४ जिल्ला र १३७ स्थानीय तह
            </span>
          </div>

          <div className="max-w-3xl mb-6 relative z-10">
            <h2 id="quick-finder-heading" className="text-2xl sm:text-3xl font-black tracking-tight">
              स्थानीय सरकार वार्षिक प्रतिवेदन खोजी तथा प्रविष्टि
            </h2>
            <p className="text-sm sm:text-base text-blue-100 mt-2">
              जिल्ला छनौट गरी सम्बन्धित स्थानीय तहको वार्षिक कार्यसम्पादन प्रतिवेदन वा सार्वजनिक प्रोफाइल हेर्नुहोस्।
            </p>
          </div>

          {/* PALIKA SELECT FORM */}
          <form 
            onSubmit={(e) => e.preventDefault()}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 relative z-10"
          >
            {/* 1. District Select */}
            <div>
              <label htmlFor="district-select" className="block text-xs font-bold text-amber-300 mb-1.5">
                १. जिल्ला छनौट गर्नुहोस्
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
                      const msg = `${dist.name_ne} जिल्लाका ${dist.local_governments.length} स्थानीय तह उपलब्ध छन्।`;
                      announceLive(msg);
                      speakText(msg);
                    }
                  }
                }}
                className="w-full bg-slate-900 text-white text-sm rounded-xl px-3.5 py-2.5 border border-slate-700 focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
              >
                <option value="">{t.select_district}</option>
                {KOSHI_DISTRICTS.map((district) => (
                  <option key={district.id} value={district.id}>
                    {lang === "ne" ? district.name_ne : district.name_en} ({district.local_governments.length} स्थानीय तह)
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Palika Select */}
            <div>
              <label htmlFor="palika-select" className="block text-xs font-bold text-amber-300 mb-1.5">
                २. स्थानीय तह छनौट गर्नुहोस्
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
                      const msg = `${p.name_ne} स्थानीय तह छानियो।`;
                      announceLive(msg);
                      speakText(msg);
                    }
                  }
                }}
                className={`w-full text-sm rounded-xl px-3.5 py-2.5 border focus:ring-2 focus:ring-amber-400 focus:outline-hidden ${
                  selectedDistrictId 
                    ? "bg-slate-900 text-white border-slate-700" 
                    : "bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed opacity-60"
                }`}
              >
                <option value="">
                  {selectedDistrictId ? t.select_palika : "-- पहिले जिल्ला छान्नुहोस् --"}
                </option>
                {palikas.map((palika) => (
                  <option key={palika.id} value={palika.id}>
                    {lang === "ne" ? palika.name_ne : palika.name_en} ({palika.type})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Action Buttons: Form Fill (Secure) + Profile */}
            <div className="flex flex-col sm:flex-row gap-2 items-end">
              {/* Show yellow "प्रतिवेदन फारम" ONLY for Super Admin OR Employee of this assigned palika */}
              {/* STRICTLY HIDDEN for Normal Users (सामान्य युजर्स) to prevent unauthorized editing */}
              {canAccessForm && (
                <Link
                  href={selectedPalikaId ? `/local-reporting/palika/${selectedPalikaId}` : "#"}
                  aria-disabled={!selectedPalikaId}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all text-center min-h-[44px] ${
                    selectedPalikaId 
                      ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20 cursor-pointer" 
                      : "bg-slate-700/60 text-slate-400 cursor-not-allowed pointer-events-none"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>प्रतिवेदन फारम</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </Link>
              )}

              {/* Public Profile & Report Button: Always visible for normal users and visitors */}
              <Link
                href={selectedPalikaId ? `/local-reporting/palika/${selectedPalikaId}/profile` : "#"}
                aria-disabled={!selectedPalikaId}
                className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border min-h-[44px] ${
                  !canAccessForm ? "w-full flex-1" : ""
                } ${
                  selectedPalikaId
                    ? "bg-blue-600/30 hover:bg-blue-600/50 text-white border-blue-400/40 hover:border-blue-300 shadow-md cursor-pointer"
                    : "bg-white/5 text-slate-500 border-white/5 cursor-not-allowed pointer-events-none"
                }`}
                title="पालिका प्रोफाइल हेर्नुहोस् (खुल्ला विवरण)"
              >
                <Building className="w-4 h-4 shrink-0 text-amber-300" />
                <span>{canAccessForm ? "प्रोफाइल" : "🏛️ पालिका प्रोफाइल हेर्नुहोस्"}</span>
                {!canAccessForm && <ArrowRight className="w-4 h-4 shrink-0 text-amber-300 ml-1" />}
              </Link>
            </div>
          </form>

          {/* Quick palika badges when district selected */}
          {currentDistrict && (
            <div className="mt-4 pt-4 border-t border-white/10 relative z-10">
              <p className="text-xs font-semibold text-slate-300 mb-2">
                {currentDistrict.name_ne} जिल्लाका स्थानीय तहहरू:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {palikas.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPalikaId(p.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                      selectedPalikaId === p.id
                        ? "bg-amber-400 text-slate-950 font-bold border-amber-300"
                        : "bg-white/5 text-slate-200 border-white/10 hover:bg-white/15"
                    }`}
                  >
                    {p.name_ne}
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
                <strong>रोल-आधारित सुरक्षा:</strong> स्वीकृत कर्मचारीले आफ्नो स्थानीय तहको प्रतिवेदन भर्न पाउनेछन्। मुख्य प्रशासकलाई सबै १३७ पालिकाको पूर्ण निरीक्षण र स्वीकृत/पुनरावलोकन अधिकार।
              </span>
            </div>

            {/* Quick staff shortcut if logged in as staff */}
            {isAuthenticated && isEmployee && assignedPalikaId && (
              <Link
                href={`/local-reporting/palika/${assignedPalikaId}`}
                className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold underline shrink-0"
              >
                <span>👉 मेरो पालिका ({assignedPalikaName}) को फारम भर्नुहोस्</span>
              </Link>
            )}

            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => openAuth("signin")}
                className="text-amber-300 hover:text-amber-200 underline font-semibold cursor-pointer shrink-0"
              >
                🔐 Sign Up / Sign In
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
