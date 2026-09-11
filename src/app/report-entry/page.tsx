"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuickPalikaFinder from "@/components/QuickPalikaFinder";
import { translations } from "@/lib/translations";
import { useLanguage } from "@/lib/languageContext";
import { useAuth } from "@/lib/authContext";
import UnifiedAuthModal from "@/components/auth/UnifiedAuthModal";
import { 
  Building2, 
  BarChart3, 
  FileEdit, 
  ShieldCheck, 
  ArrowRight, 
  FileCheck2, 
  Lock, 
  Info,
  CheckCircle2,
  LogIn,
  KeyRound
} from "lucide-react";

export default function ReportEntryPage() {
  const { lang, setLang } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signin");

  const t = translations[lang];
  const isEmployee = user?.role === "employee" || user?.role === "palika_staff";
  const assignedPalikaId = user?.palika_id || user?.palikaId;
  const assignedPalikaName = user?.palika_name || user?.palikaName;

  const openAuth = (tab: "signin" | "signup") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header lang={lang} onLanguageChange={setLang} />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-hidden">
        
        {/* 3-WAY REPORT NAVIGATION SWITCHER: १. प्रतिवेदन प्रविष्टि | २. स्थानीयतहगत प्रतिवेदन | ३. स्थानीय तहको एकीकृत प्रतिवेदन */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center p-1.5 gap-1.5 sm:gap-1 bg-slate-200/90 dark:bg-slate-800 rounded-2xl max-w-3xl mx-auto mb-8 shadow-xs border border-slate-300 dark:border-slate-700">
          {/* १. प्रतिवेदन प्रविष्टि (Active) */}
          <Link
            href="/report-entry"
            className="flex-1 py-3 px-3.5 sm:px-4 min-h-[46px] rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 bg-indigo-900 text-white shadow-sm transition-all"
            aria-current="page"
          >
            <FileEdit className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{lang === 'ne' ? '१. प्रतिवेदन प्रविष्टि' : '1. Report Entry'}</span>
          </Link>

          {/* २. स्थानीयतहगत प्रतिवेदन */}
          <Link
            href="/local-reporting"
            className="flex-1 py-3 px-3.5 sm:px-4 min-h-[46px] rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-900 hover:bg-white/60 dark:hover:bg-slate-700 transition-all"
          >
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{lang === 'ne' ? '२. स्थानीयतहगत प्रतिवेदन' : '2. Local Body Report'}</span>
          </Link>

          {/* ३. स्थानीय तहको एकीकृत प्रतिवेदन */}
          <Link
            href="/reports"
            className="flex-1 py-3 px-3.5 sm:px-4 min-h-[46px] rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300 hover:text-emerald-900 hover:bg-white/60 dark:hover:bg-slate-700 transition-all"
          >
            <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{lang === 'ne' ? '३. स्थानीय तहको एकीकृत प्रतिवेदन' : '3. Integrated Report'}</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-300 rounded-full text-xs font-black uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
                  <FileEdit className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" aria-hidden="true" />
                  {lang === 'en' ? 'Local Government Annual Reporting Portal' : 'स्थानीय सरकार वार्षिक प्रतिवेदन प्रविष्टि पोर्टल'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  {lang === 'en' ? 'Role-Based Secure Submission' : 'रोल-आधारित सुरक्षित प्रविष्टि'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {lang === 'en' ? 'Annual Performance Report Entry' : 'स्थानीय तह वार्षिक प्रतिवेदन प्रविष्टि'}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
                {lang === 'en'
                  ? 'Official online portal for local government focal persons and staff to submit annual performance reports, manage data drafts, and track submission status across Koshi Province.'
                  : 'कोशी प्रदेशका १४ जिल्लाका १३७ स्थानीय तहका अधिकृत कर्मचारी तथा अपाङ्गता सम्पर्क व्यक्ति (फोकल पर्सन) का लागि वार्षिक कार्यसम्पादन प्रतिवेदन प्रविष्टि, मस्यौदा सुरक्षित गर्ने र अन्तिम पेश गर्ने आधिकारिक पोर्टल।'}
              </p>
            </div>

            {/* Quick Login / Status Card */}
            {!isAuthenticated ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-center sm:text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-2 font-medium">
                  {lang === 'ne' ? 'कर्मचारी लगइन आवश्यक छ?' : 'Staff Login Required?'}
                </span>
                <button
                  type="button"
                  onClick={() => openAuth("signin")}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{lang === 'ne' ? 'कर्मचारी लगइन / दर्ता' : 'Staff Login / Register'}</span>
                </button>
              </div>
            ) : isEmployee && assignedPalikaId ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300 dark:border-emerald-800 text-left">
                <div className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'ne' ? 'स्वीकृत अधिकृत कर्मचारी' : 'Authorized Staff'}</span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  🏛️ {assignedPalikaName}
                </div>
                <Link
                  href={`/local-reporting/palika/${assignedPalikaId}`}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>{lang === 'ne' ? 'मेरो फारम खोल्नुहोस्' : 'Open My Form'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : null}
          </div>

          {/* 3 Step Guidance Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                १
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                  {lang === 'ne' ? 'जिल्ला र स्थानीय तह छनौट' : 'Select District & Palika'}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {lang === 'ne' ? 'आफ्नो सम्बन्धित जिल्ला र स्थानीय तह सूचीबाट छनौट गर्नुहोस्।' : 'Pick your assigned district and local body.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                २
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                  {lang === 'ne' ? 'अधिकृत लगइन र पहुँच' : 'Authorized Login & Access'}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {lang === 'ne' ? 'स्वीकृत कर्मचारी खाताबाट लगइन गरी प्रतिवेदन सम्पादन सुरु गर्नुहोस्।' : 'Log in with approved staff credentials to edit.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                ३
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                  {lang === 'ne' ? 'तथ्यांक प्रविष्टि र पेश' : 'Data Entry & Submission'}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {lang === 'ne' ? '८ वटै खण्डका फारम भरी मस्यौदा सुरक्षित वा अन्तिम पेश गर्नुहोस्।' : 'Fill form sections and save draft or submit.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* REPORT ENTRY / QUICK PALIKA FINDER WIDGET */}
        <div className="mb-8">
          <QuickPalikaFinder lang={lang} />
        </div>
      </main>

      <Footer lang={lang} />

      {/* UNIFIED AUTH MODAL */}
      <UnifiedAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
        initialRole="employee"
      />
    </div>
  );
}
