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
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import AuthModal from "@/components/auth/AuthModal";

interface QuickPalikaFinderProps {
  lang: Language;
}

export default function QuickPalikaFinder({ lang }: QuickPalikaFinderProps) {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [selectedPalikaId, setSelectedPalikaId] = useState<string>("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");

  const { user, isAuthenticated, logout } = useAuth();
  const t = translations[lang];

  const currentDistrict = KOSHI_DISTRICTS.find((d) => d.id === selectedDistrictId);
  const palikas = currentDistrict ? currentDistrict.local_governments : [];

  const openAuth = (mode: "login" | "signup") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <section aria-labelledby="quick-finder-heading" className="py-8 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-r from-blue-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-blue-800/40 relative overflow-hidden">
          {/* Subtle background glow decoration */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar: Geography badge + Security Status Option */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-400/30">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              कोशी प्रदेशका १४ जिल्ला र १३७ स्थानीय तह
            </span>

            {/* SECURITY OPTION / AUTHENTICATION STATUS PILL */}
            <div className="flex items-center gap-2">
              {isAuthenticated && user ? (
                <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 px-3 py-1.5 rounded-xl text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-200 font-bold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                    {user.name}
                  </span>
                  <span className="text-emerald-300/80 text-[11px] hidden sm:inline">
                    ({user.role === "provincial_admin" ? "कोशी मुख्य प्रशासक" : user.palikaName || "कर्मचारी"})
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="ml-1 text-[11px] text-red-300 hover:text-red-100 hover:underline cursor-pointer flex items-center gap-1 pl-2 border-l border-emerald-500/30"
                    title="लगआउट गर्नुहोस्"
                  >
                    <LogOut className="w-3 h-3" />
                    <span className="hidden sm:inline">बाहिरिनुहोस्</span>
                  </button>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 p-1 rounded-xl text-xs backdrop-blur-md">
                  <span className="text-amber-300 font-bold px-2 py-0.5 flex items-center gap-1 text-[11px]">
                    <Lock className="w-3 h-3 text-amber-400" />
                    डाटा सुरक्षा:
                  </span>
                  <button
                    type="button"
                    onClick={() => openAuth("login")}
                    className="px-2.5 py-1 bg-blue-900/90 hover:bg-blue-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer border border-blue-700/50"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>कर्मचारी लगइन</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuth("signup")}
                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>नयाँ दर्ता (Sign Up)</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="max-w-3xl mb-6 relative z-10">
            <h2 id="quick-finder-heading" className="text-2xl sm:text-3xl font-black tracking-tight">
              स्थानीय सरकार वार्षिक प्रतिवेदन खोजी तथा प्रविष्टि
            </h2>
            <p className="text-sm sm:text-base text-blue-100 mt-2">
              जिल्ला छनौट गरी सम्बन्धित स्थानीय तहको वार्षिक कार्यसम्पादन प्रतिवेदन भर्नुहोस् वा प्रोफाइल हेर्नुहोस्।
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
                  setSelectedDistrictId(e.target.value);
                  setSelectedPalikaId("");
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
                onChange={(e) => setSelectedPalikaId(e.target.value)}
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

              <Link
                href={selectedPalikaId ? `/local-reporting/palika/${selectedPalikaId}/profile` : "#"}
                aria-disabled={!selectedPalikaId}
                className={`py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all border min-h-[44px] ${
                  selectedPalikaId
                    ? "bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer"
                    : "bg-white/5 text-slate-500 border-white/5 cursor-not-allowed pointer-events-none"
                }`}
                title="पालिका प्रोफाइल मात्र हेर्नुहोस् (खुल्ला विवरण)"
              >
                <Building className="w-3.5 h-3.5 shrink-0" />
                <span>प्रोफाइल</span>
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
                <strong>डाटा सुरक्षा:</strong> प्रत्येक स्थानीय तहको आफ्नै User ID/Password हुनेछ। मुख्य प्रशासकलाई सबै १३७ पालिकाको पूर्ण निरीक्षण अधिकार।
              </span>
            </div>

            {/* Quick staff shortcut if logged in as staff */}
            {isAuthenticated && user && user.role === "palika_staff" && user.palikaId && (
              <Link
                href={`/local-reporting/palika/${user.palikaId}`}
                className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold underline shrink-0"
              >
                <span>👉 मेरो पालिका ({user.palikaName}) को फारम भर्नुहोस्</span>
              </Link>
            )}

            {!isAuthenticated && (
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => openAuth("signup")}
                  className="text-amber-300 hover:text-amber-200 underline font-semibold cursor-pointer"
                >
                  नयाँ कर्मचारी दर्ता
                </button>
                <span className="text-blue-400">•</span>
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="text-white hover:text-slate-200 underline font-semibold cursor-pointer"
                >
                  कर्मचारी लगइन
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        initialPalikaId={selectedPalikaId || undefined}
        initialDistrictId={selectedDistrictId || undefined}
      />
    </section>
  );
}
