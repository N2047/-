"use client";

import React from "react";
import Link from "next/link";
import { translations, Language } from "@/lib/translations";
import { ShieldCheck, HeartHandshake, PhoneCall, Mail } from "lucide-react";

interface FooterProps {
  lang: Language;
}

export default function Footer({ lang }: FooterProps) {
  const t = translations[lang];

  return (
    <footer className="bg-slate-900 text-slate-200 border-t-4 border-amber-500">
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
              {t.tagline}। नेपाल सरकार तथा प्रदेश सरकार मातहत अपाङ्गता सवालका कानुन, नीति, स्थानीय तह वार्षिक कार्यसम्पादन र तथ्यांक व्यवस्थापनको एकीकृत पोर्टल।
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-xs font-semibold text-amber-300 border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>WCAG 2.2 AA पहुँचयुक्त प्रणाली प्रमाणित</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 text-amber-400">
              प्रमुख मोड्युलहरू
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/laws" className="hover:text-amber-300 transition-colors">
                  विद्यमान कानुनहरूको दस्तावेज
                </Link>
              </li>
              <li>
                <Link href="/local-reporting" className="hover:text-amber-300 transition-colors">
                  कोशी प्रदेश स्थानीय सरकार प्रतिवेदन
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-amber-300 transition-colors">
                  विषयगत रिपोर्ट तथा विश्लेषण
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-amber-300 transition-colors">
                  सूचना तथा समाचार
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-300 transition-colors">
                  हाम्रो बारेमा
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 text-amber-400">
              सम्पर्क तथा सहयोग
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
                <span>अपाङ्गता सहायता सहजकर्ता सहयोग कक्ष</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
                <span>फोन: +९७७-०२१-XXXXXX (कोशी प्रदेश)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                <span>इमेल: info.dic@koshi.gov.np</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{t.footer_copy}</p>
          <p>{t.footer_accessibility_note}</p>
        </div>
      </div>
    </footer>
  );
}
