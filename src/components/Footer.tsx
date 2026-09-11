"use client";

import React from "react";
import Link from "next/link";
import { Language } from "@/lib/translations";
import { useLanguage } from "@/lib/languageContext";
import { useFooter } from "@/lib/footerContext";
import { ShieldCheck, HeartHandshake, PhoneCall, Mail, MapPin } from "lucide-react";

interface FooterProps {
  lang?: Language;
}

export default function Footer({ lang: propLang }: FooterProps) {
  const { lang: contextLang } = useLanguage();
  const { footerConfig } = useFooter();
  const activeLang = propLang || contextLang || "ne";
  const isNe = activeLang === "ne";

  // Dynamic values based on active language
  const appName = (isNe ? footerConfig.app_name_ne : footerConfig.app_name_en) || "अपाङ्गता सूचना केन्द्र";
  const appSubName = (isNe ? footerConfig.app_sub_name_ne : footerConfig.app_sub_name_en) || "Disability Information Center (DIC)";
  const brandDesc = (isNe ? footerConfig.brand_desc_ne : footerConfig.brand_desc_en) || "";
  const wcagBadge = (isNe ? footerConfig.wcag_badge_ne : footerConfig.wcag_badge_en) || "WCAG 2.2 AA Standard Compliant System";

  const quickLinksTitle = (isNe ? footerConfig.quick_links_title_ne : footerConfig.quick_links_title_en) || "प्रमुख मोड्युलहरू";
  const activeQuickLinks = (footerConfig.quick_links || []).filter((l) => l.is_active);

  const contactTitle = (isNe ? footerConfig.contact_title_ne : footerConfig.contact_title_en) || "सम्पर्क तथा सहयोग";
  const helpDeskName = (isNe ? footerConfig.help_desk_name_ne : footerConfig.help_desk_name_en) || "अपाङ्गता सहायता सहजकर्ता सहयोग कक्ष";
  const phone = (isNe ? footerConfig.phone_ne : footerConfig.phone_en) || "फोन: +९७७-०२१-४६०XXX";
  const email = footerConfig.email || "info.dic@koshi.gov.np";
  const address = isNe ? footerConfig.address_ne : footerConfig.address_en;

  const copyright = (isNe ? footerConfig.copyright_ne : footerConfig.copyright_en) || "© २०८२/०८३ अपाङ्गता सूचना केन्द्र (DIC)। सम्पूर्ण अधिकार सुरक्षित।";
  const a11yNote = (isNe ? footerConfig.a11y_note_ne : footerConfig.a11y_note_en) || "WCAG 2.2 AA compliant digital portal.";

  return (
    <footer className="bg-slate-900 text-slate-200 border-t-4 border-amber-500 print:hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-linear-to-br from-red-700 to-blue-900 text-white font-black text-lg rounded-xl flex items-center justify-center border border-amber-400 shrink-0 shadow-md">
                DIC
              </div>
              <div>
                <span className="text-lg font-bold text-white block tracking-tight">{appName}</span>
                <span className="text-xs text-slate-400 block font-medium">{appSubName}</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed mb-4">
              {brandDesc}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 rounded-xl text-xs font-semibold text-amber-300 border border-slate-700 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>{wcagBadge}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 text-amber-400">
              {quickLinksTitle}
            </h3>
            <ul className="space-y-1 text-xs sm:text-sm">
              {activeQuickLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    target={link.is_external ? "_blank" : undefined}
                    rel={link.is_external ? "noopener noreferrer" : undefined}
                    className="py-1.5 block hover:text-amber-300 transition-colors"
                  >
                    {isNe ? link.label_ne : link.label_en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 text-amber-400">
              {contactTitle}
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <HeartHandshake className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span className="font-medium leading-snug">{helpDeskName}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
                <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="hover:text-amber-300 transition-colors font-mono">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                <a href={`mailto:${email}`} className="hover:text-amber-300 transition-colors font-mono">
                  {email}
                </a>
              </li>
              {address && (
                <li className="flex items-center gap-2.5 text-slate-400">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>{address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 sm:pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>{copyright}</p>
          <p className="text-slate-500">{a11yNote}</p>
        </div>
      </div>
    </footer>
  );
}
