"use client";

import React from "react";
import Link from "next/link";
import { translations, Language } from "@/lib/translations";
import { useLanguage } from "@/lib/languageContext";
import { ShieldCheck, HeartHandshake, PhoneCall, Mail } from "lucide-react";

interface FooterProps {
  lang?: Language;
}

export default function Footer({ lang: propLang }: FooterProps) {
  const { lang: contextLang } = useLanguage();
  const activeLang = propLang || contextLang || "ne";
  const t = translations[activeLang] || translations.ne;

  return (
    <footer className="bg-slate-900 text-slate-200 border-t-4 border-amber-500 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-linear-to-br from-red-700 to-blue-900 text-white font-black text-lg rounded-lg flex items-center justify-center border border-amber-400">
                DIC
              </div>
              <div>
                <span className="text-lg font-bold text-white block">{t.app_name}</span>
                <span className="text-xs text-slate-400 block">{t.app_sub_name}</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-4">
              {t.footer?.brandDesc || t.tagline}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-xs font-semibold text-amber-300 border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>{t.footer?.wcagBadge || "WCAG 2.2 AA Standard Compliant System"}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 text-amber-400">
              {t.footer?.quickLinksTitle || "Quick Links"}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/laws" className="hover:text-amber-300 transition-colors">
                  {t.nav_laws}
                </Link>
              </li>
              <li>
                <Link href="/local-reporting" className="hover:text-amber-300 transition-colors">
                  {t.nav_palika_report}
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-amber-300 transition-colors">
                  {t.nav_overall_report}
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-amber-300 transition-colors">
                  {t.nav_news}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-300 transition-colors">
                  {t.nav_about}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-300 transition-colors font-semibold text-amber-300">
                  {t.nav_contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 text-amber-400">
              {t.footer?.contactSupportTitle || "Contact & Support"}
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
                <span>{t.footer?.helpDeskName || "Disability Facilitator Support Desk"}</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
                <span>{t.footer?.phone || "Phone: +977-021-460XXX"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                <span>{t.footer?.email || "Email: info.dic@koshi.gov.np"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{t.footer?.copy || "© 2082/083 Disability Information Center (DIC). All Rights Reserved."}</p>
          <p>{t.footer?.a11yNote || "WCAG 2.2 AA compliant digital portal."}</p>
        </div>
      </div>
    </footer>
  );
}
