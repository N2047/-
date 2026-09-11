"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X, 
  FileText, 
  Building2, 
  BarChart3, 
  Newspaper, 
  Search, 
  Info, 
  Lock, 
  Globe, 
  User, 
  LogOut, 
  ShieldCheck, 
  Volume2, 
  Moon, 
  Sun, 
  Sliders, 
  PhoneCall, 
  ChevronDown,
  FileEdit 
} from "lucide-react";
import { translations, Language } from "@/lib/translations";
import { useLanguage } from "@/lib/languageContext";
import { useAuth } from "@/lib/authContext";
import { useAccessibility } from "@/lib/accessibilityContext";
import UnifiedAuthModal from "@/components/auth/UnifiedAuthModal";
import AccessibilityPanel from "@/components/accessibility/AccessibilityPanel";
import LiveAnnouncer from "@/components/accessibility/LiveAnnouncer";

interface HeaderProps {
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export default function Header({ lang: propLang, onLanguageChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [mobileReportsOpen, setMobileReportsOpen] = useState(false);

  const pathname = usePathname();
  const reportsDropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (reportsDropdownRef.current && !reportsDropdownRef.current.contains(event.target as Node)) {
        setReportsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { lang: contextLang, setLang } = useLanguage();
  const activeLang = propLang || contextLang || "ne";
  const t = translations[activeLang] || translations.ne;

  const handleLanguageSwitch = (newLang: Language) => {
    setLang(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  const { user, isAuthenticated, logout } = useAuth();
  const { 
    isPanelOpen, 
    setIsPanelOpen, 
    audioPin, 
    darkMode, 
    toggleDarkMode 
  } = useAccessibility();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors print:hidden">
        {/* Skip to Main Content Link for Screen Readers & Keyboard users */}
        <a href="#main-content" className="skip-link">
          {t.skip_to_content}
        </a>

        {/* Top Accessibility & Authentication Bar */}
        <aside aria-label={activeLang === 'ne' ? "पहुँच तथा सुरक्षा नियन्त्रण" : "Accessibility and security controls"} className="bg-slate-900 text-slate-100 text-xs px-3 sm:px-4 py-2 sm:py-1.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-amber-400 text-xs sm:text-xs tracking-wide">{t.common.nepalGov}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300 text-[11px] sm:text-xs">{t.common.dicCenter}</span>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-2.5 ml-auto" role="toolbar" aria-label={t.common.accessibility}>
              {/* Main Accessibility Trigger Button in Top Bar */}
              <button
                type="button"
                onClick={() => setIsPanelOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-1 rounded-lg bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-black text-xs shadow-xs cursor-pointer transition-all focus:ring-2 focus:ring-white min-h-[36px] sm:min-h-[32px]"
                aria-label={activeLang === 'ne' ? "पहुँचयुक्तता सेटिङ्स प्यानल खोल्नुहोस् (Alt+A)" : "Open Accessibility Settings Panel (Alt+A)"}
                title={activeLang === 'ne' ? "पहुँचयुक्तता सेटिङ्स (Alt+A)" : "Accessibility Settings (Alt+A)"}
              >
                <span className="text-sm" aria-hidden="true">♿</span>
                <span className="hidden xs:inline">{t.common.accessibility}</span>
                {audioPin && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" title="Audio Pin Active" />
                )}
              </button>

              {/* Quick Dark Mode Switcher */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`px-2.5 py-1.5 sm:py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1 text-xs font-bold min-h-[36px] sm:min-h-[32px] ${
                  darkMode
                    ? "bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-xs"
                    : "bg-slate-800 text-slate-200 hover:text-amber-300 hover:bg-slate-700 border border-slate-700"
                }`}
                aria-label={darkMode ? (activeLang === 'ne' ? "डार्क मोड सक्रिय छ, लाइट मोडमा जान क्लिक गर्नुहोस्" : "Dark mode active, click for light mode") : (activeLang === 'ne' ? "लाइट मोड सक्रिय छ, डार्क मोडमा जान क्लिक गर्नुहोस्" : "Light mode active, click for dark mode")}
                title={darkMode ? t.common.darkModeOn : t.common.darkModeOff}
              >
                {darkMode ? (
                  <>
                    <Sun className="w-4 h-4 text-slate-950 fill-amber-500" />
                    <span className="hidden md:inline">{t.common.darkModeOn}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-300" />
                    <span className="hidden md:inline">{t.common.darkMode}</span>
                  </>
                )}
              </button>

              {/* User Authentication Status (Desktop & Tablet) */}
              {isAuthenticated && user ? (
                <div className="hidden sm:flex items-center gap-2 bg-slate-800 rounded-lg px-2.5 py-1 border border-slate-700 min-h-[32px]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span className="max-w-[120px] sm:max-w-[150px] truncate">{user.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-xs text-rose-300 hover:text-white flex items-center gap-0.5 cursor-pointer ml-1 font-semibold"
                    title={t.common.logout}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{t.common.logout}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="header-sign-in-btn"
                  onClick={() => setAuthModalOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 sm:py-1 rounded-lg bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-extrabold transition-all shadow-sm cursor-pointer border border-blue-500/50 hover:border-amber-400 focus:ring-2 focus:ring-amber-400 min-h-[32px]"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t.common.signInRegister}</span>
                </button>
              )}

              {/* Global Language Switcher */}
              <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700" role="group" aria-label="Language selector">
                <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" aria-hidden="true" />
                <button
                  type="button"
                  id="lang-switcher-ne"
                  onClick={() => handleLanguageSwitch("ne")}
                  className={`px-2.5 py-1 sm:py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer min-h-[32px] sm:min-h-[28px] ${
                    activeLang === "ne" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
                  }`}
                  aria-pressed={activeLang === "ne"}
                >
                  नेपाली
                </button>
                <button
                  type="button"
                  id="lang-switcher-en"
                  onClick={() => handleLanguageSwitch("en")}
                  className={`px-2.5 py-1 sm:py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer min-h-[32px] sm:min-h-[28px] ${
                    activeLang === "en" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
                  }`}
                  aria-pressed={activeLang === "en"}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Branding Section (Nepal Gov Logo on Left - DIC in Center - NFD-N Logo & Hamburger on Right) */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Nepal Government Emblem */}
          <div className="flex items-center shrink-0">
            <Link href="/" title={t.common.nepalGov} className="block focus:outline-hidden focus:ring-2 focus:ring-red-500 rounded-lg">
              <img
                src="/images/emblem-nepal.svg"
                alt={t.common.nepalGov}
                className="h-10 sm:h-14 md:h-16 w-auto object-contain drop-shadow-xs hover:scale-105 transition-transform"
                loading="eager"
              />
            </Link>
          </div>

          {/* Center: DIC Branding Title & Tagline (Fluid & Accessible) */}
          <Link
            href="/"
            className="flex items-center text-left gap-2 sm:gap-3.5 group cursor-pointer flex-1 min-w-0 mx-1.5 sm:mx-4 justify-center sm:justify-start"
            aria-label={t.app_name}
          >
            <div
              className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-red-700 via-blue-900 to-indigo-950 text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-sm sm:text-xl md:text-2xl shadow-md border-2 border-amber-400 shrink-0 group-hover:scale-105 transition-transform"
              aria-hidden="true"
            >
              DIC
            </div>
            <div className="min-w-0">
              <span className="text-sm sm:text-xl lg:text-2xl xl:text-3xl font-black tracking-tight text-red-600 dark:text-red-400 leading-tight block truncate sm:whitespace-normal">
                {t.app_name}
              </span>
              <span className="text-[10px] sm:text-xs lg:text-sm text-slate-700 dark:text-slate-300 font-medium block truncate sm:whitespace-normal leading-tight mt-0.5">
                {t.tagline}
              </span>
              <span className="hidden sm:block text-[11px] lg:text-xs text-blue-900 dark:text-blue-300 font-bold mt-0.5">
                {t.gov_province}
              </span>
            </div>
          </Link>

          {/* Right: NFD-N Logo & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="https://www.nfdn.org.np"
              target="_blank"
              rel="noopener noreferrer"
              title="National Federation of the Disabled Nepal (NFD-N)"
              className="hidden xs:block focus:outline-hidden focus:ring-2 focus:ring-blue-500 rounded-lg"
            >
              <img
                src="/images/nfdn-logo.png"
                alt="NFD-N Logo"
                className="h-9 sm:h-12 md:h-14 w-auto object-contain drop-shadow-xs hover:scale-105 transition-transform"
                loading="eager"
              />
            </a>

            {/* Mobile Hamburger Button with 48x48px Touch Target */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-xs active:scale-95 transition-all"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? t.common.close : "Menu"}
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-red-600" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Main Navigation Bar */}
        <nav aria-label={t.common.home} className="hidden lg:block bg-blue-900 dark:bg-slate-950 text-white border-t border-blue-950 dark:border-slate-800 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <ul className="flex items-center space-x-1" role="menubar">
              {/* १. Home */}
              <li role="none">
                <Link
                  href="/"
                  role="menuitem"
                  className={`inline-flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-t-md transition-colors border-b-2 ${
                    pathname === "/"
                      ? "text-amber-300 font-bold border-amber-400 bg-blue-800/60"
                      : "text-slate-100 hover:text-amber-300 hover:bg-blue-800/80 dark:hover:bg-slate-800 border-transparent hover:border-amber-400"
                  }`}
                >
                  <span>{t.nav_home}</span>
                </Link>
              </li>

              {/* २. About Us */}
              <li role="none">
                <Link
                  href="/about"
                  role="menuitem"
                  className={`inline-flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-t-md transition-colors border-b-2 ${
                    pathname === "/about"
                      ? "text-amber-300 font-bold border-amber-400 bg-blue-800/60"
                      : "text-slate-100 hover:text-amber-300 hover:bg-blue-800/80 dark:hover:bg-slate-800 border-transparent hover:border-amber-400"
                  }`}
                >
                  <Info className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  <span>{t.nav_about}</span>
                </Link>
              </li>

              {/* ३. Legal Documents */}
              <li role="none">
                <Link
                  href="/laws"
                  role="menuitem"
                  className={`inline-flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-t-md transition-colors border-b-2 ${
                    pathname === "/laws"
                      ? "text-amber-300 font-bold border-amber-400 bg-blue-800/60"
                      : "text-slate-100 hover:text-amber-300 hover:bg-blue-800/80 dark:hover:bg-slate-800 border-transparent hover:border-amber-400"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  <span>{t.nav_laws}</span>
                </Link>
              </li>

              {/* ४. Reports Dropdown */}
              <li
                ref={reportsDropdownRef}
                className="relative group"
                onMouseEnter={() => setReportsDropdownOpen(true)}
                onMouseLeave={() => setReportsDropdownOpen(false)}
                role="none"
              >
                <button
                  type="button"
                  onClick={() => setReportsDropdownOpen((prev) => !prev)}
                  role="menuitem"
                  aria-expanded={reportsDropdownOpen}
                  aria-haspopup="true"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-t-md transition-colors border-b-2 cursor-pointer ${
                    pathname.startsWith("/report-entry") || pathname.startsWith("/local-reporting") || pathname.startsWith("/reports") || reportsDropdownOpen
                      ? "text-amber-300 font-bold border-amber-400 bg-blue-800/60"
                      : "text-slate-100 hover:text-amber-300 hover:bg-blue-800/80 dark:hover:bg-slate-800 border-transparent hover:border-amber-400"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 mr-0.5" aria-hidden="true" />
                  <span>{t.nav_reports}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${reportsDropdownOpen ? "rotate-180 text-amber-400" : "group-hover:rotate-180 text-blue-200"}`} />
                </button>

                {/* Dropdown Menu */}
                <div
                  className={`absolute top-full left-0 w-80 bg-white dark:bg-slate-900 rounded-b-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-slate-900 dark:text-slate-100 transition-all duration-150 ${
                    reportsDropdownOpen ? "block" : "hidden group-hover:block"
                  }`}
                  role="menu"
                  aria-label={t.nav_reports}
                >
                  {/* १. प्रतिवेदन प्रविष्टि */}
                  <Link
                    href="/report-entry"
                    role="menuitem"
                    onClick={() => setReportsDropdownOpen(false)}
                    className={`flex items-start gap-2.5 px-3.5 py-2.5 transition-colors group/item ${
                      pathname.startsWith("/report-entry")
                        ? "bg-indigo-50 dark:bg-slate-800/90"
                        : "hover:bg-indigo-50 dark:hover:bg-slate-800/70"
                    }`}
                  >
                    <FileEdit className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover/item:text-indigo-700 dark:group-hover/item:text-amber-400 block">
                        {activeLang === 'ne' ? '१. ' : '1. '}{t.nav_report_entry}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        {activeLang === 'ne' ? "स्थानीय तहका कर्मचारी तथा फोकल पर्सनका लागि प्रतिवेदन प्रविष्टि" : "Annual report submission portal for authorized palika staff"}
                      </span>
                    </div>
                  </Link>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                  {/* २. स्थानीयतहगत प्रतिवेदन */}
                  <Link
                    href="/local-reporting"
                    role="menuitem"
                    onClick={() => setReportsDropdownOpen(false)}
                    className={`flex items-start gap-2.5 px-3.5 py-2.5 transition-colors group/item ${
                      pathname.startsWith("/local-reporting")
                        ? "bg-blue-50 dark:bg-slate-800/90"
                        : "hover:bg-blue-50 dark:hover:bg-slate-800/70"
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover/item:text-blue-700 dark:group-hover/item:text-amber-400 block">
                        {activeLang === 'ne' ? '२. ' : '2. '}{t.nav_palika_report}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        {activeLang === 'ne' ? "१३७ वटै स्थानीय तहका प्रोफाइल तथा वस्तुस्थिति विवरण" : "Profiles and performance of all 137 local bodies"}
                      </span>
                    </div>
                  </Link>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                  {/* ३. स्थानीय तहको एकीकृत प्रतिवेदन */}
                  <Link
                    href="/reports"
                    role="menuitem"
                    onClick={() => setReportsDropdownOpen(false)}
                    className={`flex items-start gap-2.5 px-3.5 py-2.5 transition-colors group/item ${
                      pathname.startsWith("/reports")
                        ? "bg-blue-50 dark:bg-slate-800/90"
                        : "hover:bg-blue-50 dark:hover:bg-slate-800/70"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover/item:text-emerald-700 dark:group-hover/item:text-amber-400 block">
                        {activeLang === 'ne' ? '३. ' : '3. '}{t.nav_overall_report}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        {activeLang === 'ne' ? "कोशी प्रदेश स्तरीय विषयगत तथा तुलनात्मक एकीकृत तथ्याङ्क" : "Province-wide thematic and comparative analytics"}
                      </span>
                    </div>
                  </Link>
                </div>
              </li>

              {/* ५. News & Notices */}
              <li role="none">
                <Link
                  href="/news"
                  role="menuitem"
                  className={`inline-flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-t-md transition-colors border-b-2 ${
                    pathname === "/news"
                      ? "text-amber-300 font-bold border-amber-400 bg-blue-800/60"
                      : "text-slate-100 hover:text-amber-300 hover:bg-blue-800/80 dark:hover:bg-slate-800 border-transparent hover:border-amber-400"
                  }`}
                >
                  <Newspaper className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  <span>{t.nav_news}</span>
                </Link>
              </li>

              {/* ६. Contact */}
              <li role="none">
                <Link
                  href="/contact"
                  role="menuitem"
                  className={`inline-flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-t-md transition-colors border-b-2 ${
                    pathname === "/contact"
                      ? "text-amber-300 font-bold border-amber-400 bg-blue-800/60"
                      : "text-slate-100 hover:text-amber-300 hover:bg-blue-800/80 dark:hover:bg-slate-800 border-transparent hover:border-amber-400"
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  <span>{t.nav_contact}</span>
                </Link>
              </li>

              {/* ७. Search */}
              <li role="none">
                <Link
                  href="/search"
                  role="menuitem"
                  className={`inline-flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-t-md transition-colors border-b-2 ${
                    pathname === "/search"
                      ? "text-amber-300 font-bold border-amber-400 bg-blue-800/60"
                      : "text-slate-100 hover:text-amber-300 hover:bg-blue-800/80 dark:hover:bg-slate-800 border-transparent hover:border-amber-400"
                  }`}
                >
                  <Search className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  <span>{t.nav_search}</span>
                </Link>
              </li>

              {/* ८. Admin Panel Button */}
              <li role="none">
                <Link
                  href="/admin"
                  role="menuitem"
                  className={`inline-flex items-center px-3 py-2 text-xs font-black rounded-lg transition-all border shadow-sm ${
                    pathname.startsWith("/admin")
                      ? "text-amber-300 border-amber-400 bg-amber-500/20 shadow-xs ring-1 ring-amber-400"
                      : "text-amber-300 hover:text-amber-200 bg-amber-950/70 hover:bg-amber-900/80 border-amber-400/60 hover:border-amber-300"
                  }`}
                  aria-label={t.common.adminPanel}
                  title={t.common.adminPanel}
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-400 shrink-0" aria-hidden="true" />
                  <span>{t.common.adminPanel}</span>
                </Link>
              </li>
            </ul>

            {/* Login / Logout Right Section */}
            <div className="flex items-center text-xs">
              {isAuthenticated && user ? (
                <button
                  type="button"
                  onClick={logout}
                  className="bg-blue-800/80 hover:bg-rose-800 text-rose-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-blue-700/60 hover:border-rose-600 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title={t.common.logout}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.common.logout}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all focus:ring-2 focus:ring-white"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t.common.signInRegister}</span>
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile Drawer Navigation (Slide-down & Fully Accessible) */}
        {mobileMenuOpen && (
          <nav aria-label="Mobile Navigation" className="lg:hidden bg-blue-950 dark:bg-slate-950 text-white border-t border-blue-900 dark:border-slate-800 px-4 py-4 shadow-2xl space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Quick Language Switcher for Mobile */}
            <div className="bg-blue-900/60 dark:bg-slate-900 p-2 rounded-2xl border border-blue-800/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-blue-200 dark:text-slate-400 block mb-1.5 px-1 uppercase tracking-wider">
                🌐 {activeLang === 'ne' ? "भाषा छनौट (Select Language)" : "Select Language"}
              </span>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Mobile Language selector">
                <button
                  type="button"
                  onClick={() => handleLanguageSwitch("ne")}
                  className={`min-h-[44px] rounded-xl text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeLang === "ne"
                      ? "bg-blue-600 text-white shadow-md ring-2 ring-amber-400"
                      : "bg-blue-950/80 text-slate-300 hover:text-white hover:bg-blue-800"
                  }`}
                  aria-pressed={activeLang === "ne"}
                >
                  <span>🇳🇵 नेपाली (Nepali)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageSwitch("en")}
                  className={`min-h-[44px] rounded-xl text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeLang === "en"
                      ? "bg-blue-600 text-white shadow-md ring-2 ring-amber-400"
                      : "bg-blue-950/80 text-slate-300 hover:text-white hover:bg-blue-800"
                  }`}
                  aria-pressed={activeLang === "en"}
                >
                  <span>🇬🇧 English</span>
                </button>
              </div>
            </div>

            {/* Mobile Accessibility & Dark Mode Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsPanelOpen(true);
                }}
                className="min-h-[48px] bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                aria-label={activeLang === 'ne' ? "पहुँचयुक्तता सेटिङ्स (Alt+A)" : "Accessibility Settings (Alt+A)"}
              >
                <span className="text-lg" aria-hidden="true">♿</span>
                <span>{t.common.accessibility}</span>
              </button>
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`min-h-[48px] rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all ${
                  darkMode
                    ? "bg-amber-400 text-slate-950 shadow-xs"
                    : "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5 text-slate-950 fill-amber-500" /> : <Moon className="w-5 h-5 text-slate-300" />}
                <span>{darkMode ? t.common.darkModeOn : t.common.darkModeOff}</span>
              </button>
            </div>

            {/* Mobile Auth Status */}
            <div className="p-3.5 rounded-2xl bg-blue-900/60 dark:bg-slate-900 border border-blue-800 dark:border-slate-800">
              {isAuthenticated && user ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{user.name}</div>
                        <div className="text-[11px] text-amber-300 font-semibold">
                          {user.role === "super_admin" || user.role === "provincial_admin" ? (
                            <>{t.common.superAdminRole}</>
                          ) : user.role === "employee" || user.role === "palika_staff" ? (
                            <>🏛️ {user.palika_name || (activeLang === 'ne' ? "कर्मचारी" : "Staff")}</>
                          ) : (
                            <>{t.common.citizenRole}</>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={logout}
                      className="min-h-[40px] px-3.5 bg-rose-900/80 hover:bg-rose-800 text-rose-100 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.common.logout}</span>
                    </button>
                  </div>
                  {/* Shortcuts */}
                  {(user.role === "super_admin" || user.role === "provincial_admin") && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-h-[44px] w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{activeLang === 'ne' ? "मुख्य प्रशासकीय ड्यासबोर्ड (Admin Panel)" : "Admin Dashboard"}</span>
                    </Link>
                  )}
                  {(user.role === "employee" || user.role === "palika_staff") && user.palika_id && (
                    <Link
                      href={`/local-reporting/palika/${user.palika_id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-h-[44px] w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>{activeLang === 'ne' ? "मेरो स्थानीय तहको प्रतिवेदन भर्नुहोस्" : "Fill Municipality Report"}</span>
                    </Link>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="min-h-[48px] w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-md cursor-pointer border border-blue-500/60"
                >
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>{t.common.signInRegister}</span>
                </button>
              )}
            </div>

            {/* Mobile Nav Links with 48px Minimum Touch Targets */}
            <ul className="space-y-1.5 pt-1">
              <li>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`min-h-[48px] flex items-center px-4 py-3 rounded-xl text-base font-bold transition-all ${
                    pathname === "/"
                      ? "bg-blue-900 text-amber-300 font-black shadow-xs ring-1 ring-amber-400/40"
                      : "hover:bg-blue-900/60 dark:hover:bg-slate-800 text-slate-100"
                  }`}
                >
                  <span>{t.nav_home}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`min-h-[48px] flex items-center px-4 py-3 rounded-xl text-base font-bold transition-all ${
                    pathname === "/about"
                      ? "bg-blue-900 text-amber-300 font-black shadow-xs ring-1 ring-amber-400/40"
                      : "hover:bg-blue-900/60 dark:hover:bg-slate-800 text-slate-100"
                  }`}
                >
                  <Info className="w-5 h-5 mr-3 text-amber-400" aria-hidden="true" />
                  <span>{t.nav_about}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/laws"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`min-h-[48px] flex items-center px-4 py-3 rounded-xl text-base font-bold transition-all ${
                    pathname === "/laws"
                      ? "bg-blue-900 text-amber-300 font-black shadow-xs ring-1 ring-amber-400/40"
                      : "hover:bg-blue-900/60 dark:hover:bg-slate-800 text-slate-100"
                  }`}
                >
                  <FileText className="w-5 h-5 mr-3 text-amber-400" aria-hidden="true" />
                  <span>{t.nav_laws}</span>
                </Link>
              </li>

              {/* Mobile Reports Accordion */}
              <li>
                <button
                  type="button"
                  onClick={() => setMobileReportsOpen(!mobileReportsOpen)}
                  className="min-h-[48px] w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-bold hover:bg-blue-900/60 dark:hover:bg-slate-800 text-slate-100 cursor-pointer"
                  aria-expanded={mobileReportsOpen}
                >
                  <span className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-amber-400" aria-hidden="true" />
                    <span>{t.nav_reports}</span>
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${mobileReportsOpen ? "rotate-180 text-amber-400" : ""}`} />
                </button>
                {mobileReportsOpen && (
                  <div className="pl-4 pr-2 py-2 space-y-2 bg-blue-900/40 dark:bg-slate-900/60 rounded-2xl mt-1 border border-blue-800/40">
                    {/* १. प्रतिवेदन प्रविष्टि */}
                    <Link
                      href="/report-entry"
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-h-[48px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-blue-100 hover:text-white hover:bg-blue-800/80 transition-colors"
                    >
                      <FileEdit className="w-4 h-4 text-amber-300 shrink-0" />
                      <div>
                        <span>{activeLang === 'ne' ? '१. ' : '1. '}{t.nav_report_entry}</span>
                        <span className="block text-[11px] text-blue-300 font-normal">
                          {activeLang === 'ne' ? "वार्षिक प्रतिवेदन प्रविष्टि पोर्टल" : "Annual report submission portal"}
                        </span>
                      </div>
                    </Link>

                    {/* २. स्थानीयतहगत प्रतिवेदन */}
                    <Link
                      href="/local-reporting"
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-h-[48px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-blue-100 hover:text-white hover:bg-blue-800/80 transition-colors"
                    >
                      <Building2 className="w-4 h-4 text-blue-300 shrink-0" />
                      <div>
                        <span>{activeLang === 'ne' ? '२. ' : '2. '}{t.nav_palika_report}</span>
                        <span className="block text-[11px] text-blue-300 font-normal">
                          {activeLang === 'ne' ? "१३७ वटै स्थानीय तहका प्रोफाइल तथा विवरण" : "Individual palika reports"}
                        </span>
                      </div>
                    </Link>

                    {/* ३. स्थानीय तहको एकीकृत प्रतिवेदन */}
                    <Link
                      href="/reports"
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-h-[48px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-blue-100 hover:text-white hover:bg-blue-800/80 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4 text-emerald-300 shrink-0" />
                      <div>
                        <span>{activeLang === 'ne' ? '३. ' : '3. '}{t.nav_overall_report}</span>
                        <span className="block text-[11px] text-emerald-300 font-normal">
                          {activeLang === 'ne' ? "सबै १३७ पालिका एकीकृत तथ्याङ्क" : "All 137 palikas integrated"}
                        </span>
                      </div>
                    </Link>
                  </div>
                )}
              </li>

              <li>
                <Link
                  href="/news"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`min-h-[48px] flex items-center px-4 py-3 rounded-xl text-base font-bold transition-all ${
                    pathname === "/news"
                      ? "bg-blue-900 text-amber-300 font-black shadow-xs ring-1 ring-amber-400/40"
                      : "hover:bg-blue-900/60 dark:hover:bg-slate-800 text-slate-100"
                  }`}
                >
                  <Newspaper className="w-5 h-5 mr-3 text-amber-400" aria-hidden="true" />
                  <span>{t.nav_news}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`min-h-[48px] flex items-center px-4 py-3 rounded-xl text-base font-bold transition-all ${
                    pathname === "/contact"
                      ? "bg-blue-900 text-amber-300 font-black shadow-xs ring-1 ring-amber-400/40"
                      : "hover:bg-blue-900/60 dark:hover:bg-slate-800 text-slate-100"
                  }`}
                >
                  <PhoneCall className="w-5 h-5 mr-3 text-amber-400" aria-hidden="true" />
                  <span>{t.nav_contact}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`min-h-[48px] flex items-center px-4 py-3 rounded-xl text-base font-bold transition-all ${
                    pathname === "/search"
                      ? "bg-blue-900 text-amber-300 font-black shadow-xs ring-1 ring-amber-400/40"
                      : "hover:bg-blue-900/60 dark:hover:bg-slate-800 text-slate-100"
                  }`}
                >
                  <Search className="w-5 h-5 mr-3 text-amber-400" aria-hidden="true" />
                  <span>{t.nav_search}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`min-h-[48px] flex items-center px-4 py-3 rounded-xl text-base font-black border border-amber-400/60 shadow-xs transition-all ${
                    pathname.startsWith("/admin")
                      ? "bg-amber-950 text-amber-300 ring-2 ring-amber-400"
                      : "bg-amber-950/70 hover:bg-amber-900/90 text-amber-300"
                  }`}
                  aria-label={t.common.adminPanel}
                >
                  <ShieldCheck className="w-5 h-5 mr-3 text-amber-400" aria-hidden="true" />
                  <span>{t.common.adminPanel}</span>
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>

      {/* Global Accessibility Settings Panel Modal */}
      <AccessibilityPanel />

      {/* Global Screen Reader Live Region Announcer */}
      <LiveAnnouncer />

      {/* Global Unified Auth Modal */}
      <UnifiedAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
