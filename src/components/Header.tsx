"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Menu, 
  X, 
  FileText, 
  Building2, 
  BarChart3, 
  Newspaper, 
  Search, 
  Info, 
  Lock,
  Globe
} from "lucide-react";
import { translations, Language } from "@/lib/translations";

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function Header({ lang, onLanguageChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState(16);

  const t = translations[lang];

  useEffect(() => {
    document.documentElement.setAttribute("data-high-contrast", highContrast ? "true" : "false");
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", `${fontScale}px`);
  }, [fontScale]);

  const navItems = [
    { label: t.nav_home, href: "/", icon: null },
    { label: t.nav_laws, href: "/laws", icon: FileText },
    { label: t.nav_local_reporting, href: "/local-reporting", icon: Building2 },
    { label: t.nav_reports, href: "/reports", icon: BarChart3 },
    { label: t.nav_news, href: "/news", icon: Newspaper },
    { label: t.nav_search, href: "/search", icon: Search },
    { label: t.nav_about, href: "/about", icon: Info },
    { label: t.nav_admin, href: "/admin", icon: Lock, isAction: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Skip to Main Content Link for Screen Readers & Keyboard users */}
      <a href="#main-content" className="skip-link">
        {t.skip_to_content}
      </a>

      {/* Top Accessibility Bar */}
      <aside aria-label="Accessibility controls" className="bg-slate-900 text-slate-100 text-xs px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-amber-400">नेपाल सरकार / कोशी प्रदेश सरकार</span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-300">पहुँचयुक्त सूचना प्रणाली (WCAG 2.2 AA)</span>
          </div>

          <div className="flex items-center space-x-3" role="toolbar" aria-label="पहुँच सुविधा नियन्त्रण">
            {/* Font Zoom Controls */}
            <div className="flex items-center bg-slate-800 rounded px-1.5 py-0.5 space-x-1">
              <button
                type="button"
                onClick={() => setFontScale((s) => Math.max(12, s - 2))}
                className="p-1 hover:text-amber-300 focus:text-amber-300 rounded"
                aria-label={t.decrease_font}
                title={t.decrease_font}
              >
                <ZoomOut className="w-3.5 h-3.5 inline mr-0.5" />
                <span className="sr-only sm:not-sr-only text-[11px]">A-</span>
              </button>
              <button
                type="button"
                onClick={() => setFontScale(16)}
                className="p-1 hover:text-amber-300 focus:text-amber-300 rounded text-[11px]"
                aria-label={t.reset_font}
                title={t.reset_font}
              >
                <RotateCcw className="w-3 h-3 inline" />
              </button>
              <button
                type="button"
                onClick={() => setFontScale((s) => Math.min(24, s + 2))}
                className="p-1 hover:text-amber-300 focus:text-amber-300 rounded"
                aria-label={t.increase_font}
                title={t.increase_font}
              >
                <ZoomIn className="w-3.5 h-3.5 inline mr-0.5" />
                <span className="sr-only sm:not-sr-only text-[11px]">A+</span>
              </button>
            </div>

            {/* High Contrast Toggle */}
            <button
              type="button"
              onClick={() => setHighContrast(!highContrast)}
              className={`px-2 py-0.5 rounded flex items-center space-x-1 text-[11px] font-medium transition-colors ${
                highContrast ? "bg-amber-400 text-slate-950 font-bold" : "bg-slate-800 text-slate-200 hover:text-amber-300"
              }`}
              aria-pressed={highContrast}
            >
              <Eye className="w-3.5 h-3.5 inline" />
              <span>{t.high_contrast}</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800 rounded p-0.5">
              <Globe className="w-3 h-3 text-slate-400 ml-1 mr-0.5" aria-hidden="true" />
              <button
                type="button"
                onClick={() => onLanguageChange("ne")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  lang === "ne" ? "bg-blue-600 text-white font-bold" : "text-slate-300 hover:text-white"
                }`}
                aria-pressed={lang === "ne"}
              >
                नेपाली
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange("en")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  lang === "en" ? "bg-blue-600 text-white font-bold" : "text-slate-300 hover:text-white"
                }`}
                aria-pressed={lang === "en"}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Branding Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-linear-to-br from-red-700 via-blue-900 to-indigo-950 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-md border-2 border-amber-400" aria-hidden="true">
            DIC
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
              {t.app_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:ring-2 focus:ring-blue-600"
          aria-expanded={mobileMenuOpen}
          aria-label="मुख्य मेनु खोल्नुहोस् वा बन्द गर्नुहोस्"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Main Navigation Bar */}
      <nav aria-label="मुख्य नेभिगेसन" className="hidden lg:block bg-blue-900 text-white border-t border-blue-950 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <ul className="flex items-center space-x-1" role="menubar">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <li key={idx} role="none">
                  <Link
                    href={item.href}
                    role="menuitem"
                    className={`inline-flex items-center px-3.5 py-3 text-sm font-semibold transition-colors duration-150 border-b-2 ${
                      item.isAction
                        ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border-transparent rounded-sm my-1.5 ml-2"
                        : "border-transparent hover:border-amber-400 hover:bg-blue-800 text-slate-100"
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4 mr-1.5 opacity-90" aria-hidden="true" />}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <nav aria-label="मोबाइल मुख्य नेभिगेसन" className="lg:hidden bg-blue-950 text-white border-t border-blue-900 px-4 py-3 shadow-xl">
          <ul className="space-y-1">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <li key={idx}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-md text-sm font-semibold ${
                      item.isAction
                        ? "bg-amber-500 text-slate-950 font-bold mt-2"
                        : "hover:bg-blue-900 text-slate-100"
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4 mr-2" aria-hidden="true" />}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
