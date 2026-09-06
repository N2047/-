"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  PhoneCall
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

  const navItems = [
    { label: t.nav_home, href: "/", icon: null },
    { label: t.nav_laws, href: "/laws", icon: FileText },
    { label: t.nav_local_reporting, href: "/local-reporting", icon: Building2 },
    { label: t.nav_reports, href: "/reports", icon: BarChart3 },
    { label: t.nav_news, href: "/news", icon: Newspaper },
    { label: t.nav_search, href: "/search", icon: Search },
    { label: t.nav_about, href: "/about", icon: Info },
    { label: t.nav_contact, href: "/contact", icon: PhoneCall },
    { label: t.nav_admin, href: "/admin", icon: Lock, isAction: true },
  ];

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
                  <span>🔐 Sign Up / Sign In</span>
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

        {/* Main Branding Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <Link href="/" className="flex items-center space-x-3.5" aria-label="अपाङ्गता सूचना केन्द्र गृहपृष्ठ">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-linear-to-br from-red-700 via-blue-900 to-indigo-950 text-white rounded-xl flex items-center justify-center font-black text-lg sm:text-xl shadow-md border-2 border-amber-400 shrink-0" aria-hidden="true">
                DIC
              </div>
              <div>
                <span className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight block">
                  {t.app_name}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium block">
                  {t.tagline}
                </span>
              </div>
            </Link>
          </div>

          {/* Action Bar (Accessibility + Prominent Sign In/Out + Mobile Hamburger) */}
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md border border-blue-500/40 hover:border-amber-400 cursor-pointer transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>🔐 Sign Up / Sign In</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-slate-700">
                  {user?.role === "super_admin" || user?.role === "provincial_admin"
                    ? "👑 Super Admin"
                    : user?.role === "employee" || user?.role === "palika_staff"
                    ? `🏛️ ${user?.palika_name || "कर्मचारी"}`
                    : `👤 ${user?.name}`}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsPanelOpen(true)}
              className="lg:hidden flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-xs"
              aria-label="पहुँचयुक्तता सेटिङ्स"
            >
              <span aria-hidden="true">♿</span>
              <span>पहुँचयुक्तता</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-2 focus:ring-blue-600"
              aria-expanded={mobileMenuOpen}
              aria-label="मुख्य मेनु खोल्नुहोस् वा बन्द गर्नुहोस्"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Main Navigation Bar */}
        <nav aria-label="मुख्य नेभिगेसन" className="hidden lg:block bg-blue-900 dark:bg-slate-950 text-white border-t border-blue-950 dark:border-slate-800 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <ul className="flex items-center space-x-1" role="menubar">
              {/* PRIMARY ACCESSIBILITY BUTTON IN MAIN NAVIGATION */}
              <li role="none">
                <button
                  type="button"
                  onClick={() => setIsPanelOpen(true)}
                  role="menuitem"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-black rounded-t-md bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors border-b-2 border-amber-500 shadow-xs cursor-pointer mr-1.5 focus:ring-2 focus:ring-white"
                  aria-label="♿ पहुँचयुक्तता सेटिङ्स प्यानल खोल्नुहोस् (Alt+A)"
                  title="♿ पहुँचयुक्तता सेटिङ्स (Alt+A)"
                >
                  <span className="text-sm" aria-hidden="true">♿</span>
                  <span>पहुँचयुक्तता</span>
                  {audioPin && (
                    <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" title="अडियो पिन सक्रिय" />
                  )}
                </button>
              </li>

              {navItems
                // Filter out Admin button for non-admins to prevent cluttering normal users
                .filter((item) => {
                  if (item.href === "/admin") {
                    return isAuthenticated && (user?.role === "super_admin" || user?.role === "provincial_admin");
                  }
                  return true;
                })
                .map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <li key={idx} role="none">
                      <Link
                        href={item.href}
                        role="menuitem"
                        className={`inline-flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-t-md transition-colors border-b-2 ${
                          item.isAction
                            ? "bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold border-transparent"
                            : "text-slate-100 hover:text-amber-300 hover:bg-blue-800/80 dark:hover:bg-slate-800 border-transparent hover:border-amber-400"
                        }`}
                      >
                        {Icon && <Icon className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />}
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
            </ul>

            {/* Quick Auth status in Nav */}
            <div className="flex items-center text-xs">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-blue-200 dark:text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>
                      {user.role === "super_admin" || user.role === "provincial_admin"
                        ? "Super Admin"
                        : user.role === "employee" || user.role === "palika_staff"
                        ? user.palika_name || "कर्मचारी"
                        : user.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-rose-300 hover:text-white ml-2 text-[11px] underline cursor-pointer"
                  >
                    लगआउट
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3 py-1 rounded-md text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>🔐 Sign Up / Sign In</span>
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
                <div className="flex-1">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span>{user.name}</span>
                  </div>
                  <div className="text-[11px] text-blue-200 mt-0.5">
                    {user.role === "super_admin" || user.role === "provincial_admin"
                      ? "👑 Super Admin"
                      : user.role === "employee" || user.role === "palika_staff"
                      ? `🏛️ ${user.palika_name || "कर्मचारी"}`
                      : `👤 सामान्य प्रयोगकर्ता (${user.role})`}
                  </div>
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
                  <span>🔐 Sign Up / Sign In</span>
                </button>
              )}

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded text-xs font-bold ml-2 shrink-0 cursor-pointer"
                >
                  लगआउट
                </button>
              )}
            </div>

            <ul className="space-y-1">
              {navItems
                .filter((item) => {
                  if (item.href === "/admin") {
                    return isAuthenticated && (user?.role === "super_admin" || user?.role === "provincial_admin");
                  }
                  return true;
                })
                .map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <li key={idx}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center px-3 py-2.5 rounded-md text-sm font-semibold ${
                          item.isAction
                            ? "bg-amber-500 text-slate-950 font-bold mt-2"
                            : "hover:bg-blue-900 dark:hover:bg-slate-800 text-slate-100"
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
