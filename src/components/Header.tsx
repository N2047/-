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
  ChevronDown 
} from "lucide-react";
import { translations, Language } from "@/lib/translations";
import { useAuth } from "@/lib/authContext";
import { useAccessibility } from "@/lib/accessibilityContext";
import UnifiedAuthModal from "@/components/auth/UnifiedAuthModal";
import AccessibilityPanel from "@/components/accessibility/AccessibilityPanel";
import LiveAnnouncer from "@/components/accessibility/LiveAnnouncer";

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function Header({ lang, onLanguageChange }: HeaderProps) {
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

  const { user, isAuthenticated, logout } = useAuth();
  const { 
    isPanelOpen, 
    setIsPanelOpen, 
    audioPin, 
    darkMode, 
    toggleDarkMode, 
    fontSize 
  } = useAccessibility();
  const t = translations[lang];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors print:hidden">
        {/* Skip to Main Content Link for Screen Readers & Keyboard users */}
        <a href="#main-content" className="skip-link">
          {t.skip_to_content}
        </a>

        {/* Top Accessibility & Authentication Bar */}
        <aside aria-label="Accessibility and security controls" className="bg-slate-900 text-slate-100 text-xs px-4 py-1.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-amber-400">नेपाल सरकार / कोशी प्रदेश सरकार</span>
              <span className="hidden sm:inline text-slate-400">|</span>
              <span className="hidden sm:inline text-slate-300">अपाङ्गता सूचना केन्द्र (DIC)</span>
            </div>

            <div className="flex items-center space-x-2.5" role="toolbar" aria-label="पहुँच तथा सुरक्षा नियन्त्रण">
              {/* Main Accessibility Trigger Button in Top Bar */}
              <button
                type="button"
                onClick={() => setIsPanelOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] shadow-xs cursor-pointer transition-all focus:ring-2 focus:ring-white"
                aria-label="पहुँचयुक्तता सेटिङ्स प्यानल खोल्नुहोस् (Alt+A)"
                title="पहुँचयुक्तता सेटिङ्स (Alt+A)"
              >
                <span className="text-xs" aria-hidden="true">♿</span>
                <span>पहुँचयुक्तता</span>
                {audioPin && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" title="अडियो पिन सक्रिय" />
                )}
              </button>

              {/* Quick Dark Mode Switcher */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`px-2 py-0.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 text-[11px] font-bold ${
                  darkMode
                    ? "bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-xs"
                    : "bg-slate-800 text-slate-200 hover:text-amber-300 hover:bg-slate-700 border border-slate-700"
                }`}
                aria-label={darkMode ? "डार्क मोड सक्रिय छ, लाइट मोडमा जान क्लिक गर्नुहोस्" : "लाइट मोड सक्रिय छ, डार्क मोडमा जान क्लिक गर्नुहोस्"}
                title={darkMode ? "डार्क मोड: अन" : "डार्क मोड: अफ"}
              >
                {darkMode ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-slate-950 fill-amber-500" />
                    <span className="hidden sm:inline">डार्क: अन</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-300" />
                    <span className="hidden sm:inline">डार्क मोड</span>
                  </>
                )}
              </button>

              {/* User Authentication Status */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-2.5 py-1 border border-slate-700">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span className="max-w-[120px] sm:max-w-[160px] truncate">{user.name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold hidden sm:inline-flex items-center gap-1 bg-blue-900/90 text-blue-100 border border-blue-700">
                    {user.role === "super_admin" || user.role === "provincial_admin" ? (
                      <>👑 Super Admin</>
                    ) : user.role === "employee" || user.role === "palika_staff" ? (
                      <>🏛️ {user.palika_name || "कर्मचारी"}</>
                    ) : (
                      <>👤 नागरिक</>
                    )}
                  </span>
                  {/* Shortcut for Super Admin or Employee */}
                  {(user.role === "super_admin" || user.role === "provincial_admin") && (
                    <Link
                      href="/admin"
                      className="text-[10px] bg-amber-400 text-slate-950 hover:bg-amber-300 font-extrabold px-1.5 py-0.5 rounded shadow-xs"
                      title="Admin Dashboard"
                    >
                      एडमिन
                    </Link>
                  )}
                  {(user.role === "employee" || user.role === "palika_staff") && user.palika_id && (
                    <Link
                      href={`/local-reporting/palika/${user.palika_id}`}
                      className="text-[10px] bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold px-1.5 py-0.5 rounded shadow-xs"
                      title="मेरो स्थानीय तहको प्रतिवेदन"
                    >
                      प्रतिवेदन
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={logout}
                    className="text-[11px] text-rose-300 hover:text-white flex items-center gap-0.5 cursor-pointer ml-1 font-semibold"
                    title="लगआउट गर्नुहोस्"
                  >
                    <LogOut className="w-3 h-3" />
                    <span className="hidden sm:inline">लगआउट</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="header-sign-in-btn"
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white text-[11px] font-extrabold transition-all shadow-sm cursor-pointer border border-blue-500/50 hover:border-amber-400 focus:ring-2 focus:ring-amber-400"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>🔐 लगइन / दर्ता</span>
                </button>
              )}

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
                  नेपा
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange("en")}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    lang === "en" ? "bg-blue-600 text-white font-bold" : "text-slate-300 hover:text-white"
                  }`}
                  aria-pressed={lang === "en"}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Branding Section (Nepal Gov Logo on Left - DIC in Center - NFD-N Logo on Right) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Nepal Government Emblem */}
          <div className="flex items-center shrink-0">
            <Link href="/" title="नेपाल सरकार निसान छाप" className="block focus:outline-hidden focus:ring-2 focus:ring-red-500 rounded-lg">
              <img
                src="/images/emblem-nepal.svg"
                alt="नेपाल सरकार निसान छाप"
                className="h-12 sm:h-16 w-auto object-contain drop-shadow-xs hover:scale-105 transition-transform"
                loading="eager"
              />
            </Link>
          </div>

          {/* Center: DIC Branding Title & Tagline */}
          <Link
            href="/"
            className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-2.5 sm:gap-4 group cursor-pointer mx-auto"
            aria-label="अपाङ्गता सूचना केन्द्र गृहपृष्ठ"
          >
            <div
              className="w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-br from-red-700 via-blue-900 to-indigo-950 text-white rounded-2xl flex items-center justify-center font-black text-lg sm:text-2xl shadow-lg border-2 border-amber-400 shrink-0 group-hover:scale-105 transition-transform"
              aria-hidden="true"
            >
              DIC
            </div>
            <div className="text-center sm:text-left">
              <span className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight text-red-600 dark:text-red-400 leading-tight block">
                {t.app_name}
              </span>
              <span className="text-[11px] sm:text-xs lg:text-sm text-slate-800 dark:text-slate-200 font-semibold block mt-0.5">
                {t.tagline}
              </span>
            </div>
          </Link>

          {/* Right: NFD-N Logo & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="https://www.nfdn.org.np"
              target="_blank"
              rel="noopener noreferrer"
              title="राष्ट्रिय अपाङ्ग महासंघ नेपाल (NFD-N)"
              className="block focus:outline-hidden focus:ring-2 focus:ring-blue-500 rounded-lg"
            >
              <img
                src="/images/nfdn-logo.png"
                alt="राष्ट्रिय अपाङ्ग महासंघ नेपाल (NFD-N) लोगो"
                className="h-11 sm:h-15 w-auto object-contain drop-shadow-xs hover:scale-105 transition-transform"
                loading="eager"
              />
            </a>

            {/* Mobile Right Hamburger Button */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-2 focus:ring-blue-600 cursor-pointer"
                aria-expanded={mobileMenuOpen}
                aria-label="मुख्य मेनु खोल्नुहोस् वा बन्द गर्नुहोस्"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Main Navigation Bar */}
        <nav aria-label="मुख्य नेभिगेसन" className="hidden lg:block bg-blue-900 dark:bg-slate-950 text-white border-t border-blue-950 dark:border-slate-800 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <ul className="flex items-center space-x-1" role="menubar">
              {/* १. गृहपृष्ठ */}
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

              {/* २. हाम्रो बारेमा */}
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

              {/* ३. विद्यमान कानुनको दस्तावेज */}
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

              {/* ४. प्रतिवेदन (Dropdown) */}
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
                    pathname.startsWith("/local-reporting") || pathname.startsWith("/reports") || reportsDropdownOpen
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
                  className={`absolute top-full left-0 w-72 bg-white dark:bg-slate-900 rounded-b-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-slate-900 dark:text-slate-100 transition-all duration-150 ${
                    reportsDropdownOpen ? "block" : "hidden group-hover:block"
                  }`}
                  role="menu"
                  aria-label="प्रतिवेदन उप-मेनु"
                >
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
                        १. पालिका प्रतिवेदन
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        १३७ वटै स्थानीय तहका प्रोफाइल तथा वस्तुस्थिति विवरण
                      </span>
                    </div>
                  </Link>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

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
                        २. समग्र प्रतिवेदन
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        कोशी प्रदेश स्तरीय विषयगत तथा तुलनात्मक तथ्याङ्क
                      </span>
                    </div>
                  </Link>
                </div>
              </li>

              {/* ५. सूचना/समाचार */}
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

              {/* ६. सम्पर्क */}
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

              {/* ७. खोजी */}
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

              {/* ८. Super Admin Panel (Only visible to Super Admin - Hidden from public and employees) */}
              {user && (user.role === "super_admin" || user.role === "provincial_admin") && (
                <li role="none">
                  <Link
                    href="/admin"
                    role="menuitem"
                    className={`inline-flex items-center px-3 py-2 text-xs font-black rounded-lg transition-all border shadow-sm ${
                      pathname.startsWith("/admin")
                        ? "text-amber-300 border-amber-400 bg-amber-500/20 shadow-xs ring-1 ring-amber-400"
                        : "text-amber-300 hover:text-amber-200 bg-amber-950/70 hover:bg-amber-900/80 border-amber-400/60 hover:border-amber-300"
                    }`}
                    aria-label="Super Admin Panel"
                    title="मुख्य प्रशासकीय प्यानल (Super Admin Dashboard)"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-400 shrink-0" aria-hidden="true" />
                    <span>👑 Admin</span>
                  </Link>
                </li>
              )}
            </ul>

            {/* लगइन / लगआउट Right Section */}
            <div className="flex items-center text-xs">
              {isAuthenticated && user ? (
                <button
                  type="button"
                  onClick={logout}
                  className="bg-blue-800/80 hover:bg-rose-800 text-rose-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-blue-700/60 hover:border-rose-600 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="प्रणालीबाट लगआउट गर्नुहोस्"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>लगआउट</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all focus:ring-2 focus:ring-white"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>🔐 लगइन / दर्ता</span>
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <nav aria-label="मोबाइल मुख्य नेभिगेसन" className="lg:hidden bg-blue-950 dark:bg-slate-950 text-white border-t border-blue-900 dark:border-slate-800 px-4 py-3 shadow-xl space-y-3">
            {/* Mobile Accessibility & Dark Mode Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsPanelOpen(true);
                }}
                className="py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <span className="text-base" aria-hidden="true">♿</span>
                <span>पहुँचयुक्तता</span>
              </button>
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all ${
                  darkMode
                    ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                    : "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                }`}
              >
                {darkMode ? <Sun className="w-4 h-4 text-slate-950 fill-amber-500" /> : <Moon className="w-4 h-4 text-slate-300" />}
                <span>{darkMode ? "डार्क: अन" : "डार्क: अफ"}</span>
              </button>
            </div>

            {/* Mobile Auth Status */}
            <div className="p-3 rounded-xl bg-blue-900/70 dark:bg-slate-900 border border-blue-800 dark:border-slate-800 flex items-center justify-between">
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between w-full">
                  <div className="text-xs text-slate-300">
                    अवस्था: <span className="text-emerald-400 font-bold">सक्रिय लगइन</span>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded text-xs font-bold cursor-pointer flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>लगआउट</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-lg text-xs font-black flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>🔐 लगइन / दर्ता</span>
                </button>
              )}
            </div>

            {/* Mobile Nav Links in Exact Requested Order */}
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-md text-sm font-semibold ${
                    pathname === "/" ? "bg-blue-900 text-amber-400 font-bold" : "hover:bg-blue-900 dark:hover:bg-slate-800 text-slate-100"
                  }`}
                >
                  <span>{t.nav_home}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-md text-sm font-semibold ${
                    pathname === "/about" ? "bg-blue-900 text-amber-400 font-bold" : "hover:bg-blue-900 dark:hover:bg-slate-800 text-slate-100"
                  }`}
                >
                  <Info className="w-4 h-4 mr-2" aria-hidden="true" />
                  <span>{t.nav_about}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/laws"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-md text-sm font-semibold ${
                    pathname === "/laws" ? "bg-blue-900 text-amber-400 font-bold" : "hover:bg-blue-900 dark:hover:bg-slate-800 text-slate-100"
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
                  <span>{t.nav_laws}</span>
                </Link>
              </li>

              {/* Mobile Reports Accordion */}
              <li>
                <button
                  type="button"
                  onClick={() => setMobileReportsOpen(!mobileReportsOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-semibold hover:bg-blue-900 dark:hover:bg-slate-800 text-slate-100"
                >
                  <span className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" aria-hidden="true" />
                    <span>{t.nav_reports}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileReportsOpen ? "rotate-180 text-amber-400" : ""}`} />
                </button>
                {mobileReportsOpen && (
                  <div className="pl-6 pr-2 py-1 space-y-1 bg-blue-900/40 rounded-lg mt-1">
                    <Link
                      href="/local-reporting"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded text-xs font-semibold text-blue-100 hover:text-white hover:bg-blue-800"
                    >
                      <Building2 className="w-3.5 h-3.5 text-blue-300" />
                      <span>१. पालिका प्रतिवेदन</span>
                    </Link>
                    <Link
                      href="/reports"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded text-xs font-semibold text-blue-100 hover:text-white hover:bg-blue-800"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>२. समग्र प्रतिवेदन</span>
                    </Link>
                  </div>
                )}
              </li>

              <li>
                <Link
                  href="/news"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-md text-sm font-semibold ${
                    pathname === "/news" ? "bg-blue-900 text-amber-400 font-bold" : "hover:bg-blue-900 dark:hover:bg-slate-800 text-slate-100"
                  }`}
                >
                  <Newspaper className="w-4 h-4 mr-2" aria-hidden="true" />
                  <span>{t.nav_news}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-md text-sm font-semibold ${
                    pathname === "/contact" ? "bg-blue-900 text-amber-400 font-bold" : "hover:bg-blue-900 dark:hover:bg-slate-800 text-slate-100"
                  }`}
                >
                  <PhoneCall className="w-4 h-4 mr-2" aria-hidden="true" />
                  <span>{t.nav_contact}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-md text-sm font-semibold ${
                    pathname === "/search" ? "bg-blue-900 text-amber-400 font-bold" : "hover:bg-blue-900 dark:hover:bg-slate-800 text-slate-100"
                  }`}
                >
                  <Search className="w-4 h-4 mr-2" aria-hidden="true" />
                  <span>{t.nav_search}</span>
                </Link>
              </li>
              {/* Super Admin Panel (Only visible to Super Admin - Hidden from public and employees) */}
              {user && (user.role === "super_admin" || user.role === "provincial_admin") && (
                <li>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-md text-sm font-black border border-amber-400/60 shadow-xs ${
                      pathname.startsWith("/admin") ? "bg-amber-950/90 text-amber-300 ring-1 ring-amber-400" : "bg-amber-950/60 hover:bg-amber-900/80 text-amber-300"
                    }`}
                    aria-label="Super Admin Panel"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2 text-amber-400" aria-hidden="true" />
                    <span>👑 Admin Dashboard</span>
                  </Link>
                </li>
              )}
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
