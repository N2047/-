"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { translations, Language } from "@/lib/translations";
import { 
  Building2, 
  Scale, 
  BarChart3, 
  ShieldCheck, 
  Award, 
  HeartHandshake, 
  PhoneCall, 
  Mail, 
  MapPin, 
  CheckCircle2,
  Users
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const [lang, setLang] = useState<Language>("ne");
  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header lang={lang} onLanguageChange={setLang} />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 focus:outline-hidden">
        
        {/* About Header */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-xs mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-100 text-blue-900 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-blue-200">
            <Award className="w-4 h-4 text-amber-500" />
            <span>हाम्रो बारेमा (About DIC)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            अपाङ्गता सूचना केन्द्र (Disability Information Center)
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-3 max-w-3xl leading-relaxed">
            “अपाङ्गता सम्बन्धी सूचना, कानुन, तथ्यांक तथा प्रतिवेदनको एकीकृत डिजिटल केन्द्र”
          </p>
        </div>

        {/* Vision & Mission */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs mb-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-200">
            <ShieldCheck className="w-6 h-6 text-blue-700" />
            <span>परिकल्पना तथा मुख्य उद्देश्यहरू (Vision & Core Mandate)</span>
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed text-justify">
            नेपालमा अपाङ्गता भएका व्यक्तिहरूसँग सम्बन्धित कानुन, नीति, नियम, निर्देशिका, कार्यविधि, सूचना तथा स्थानीय तहबाट प्राप्त हुने अपाङ्गता सम्बन्धी तथ्यांक र वार्षिक प्रतिवेदनलाई एउटै डिजिटल प्रणालीमा व्यवस्थित गर्ने आधुनिक, सुरक्षित, Accessible र Scalable वेब प्रणालीको रूपमा यस केन्द्रको स्थापना गरिएको हो।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-200">
              <Scale className="w-8 h-8 text-blue-800 mb-3" />
              <h3 className="font-bold text-slate-900 text-base mb-2">१. कानुनी Digital Repository</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                संघीय सरकार तथा ७ वटै प्रदेश सरकारका अपाङ्गता सम्बन्धी ऐन, नियमावली, कार्यविधि र परिपत्रहरूको एकीकृत र खोजीयोग्य डिजिटल भण्डार।
              </p>
            </div>

            <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200">
              <Building2 className="w-8 h-8 text-emerald-800 mb-3" />
              <h3 className="font-bold text-slate-900 text-base mb-2">२. Local Reporting System</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                कोशी प्रदेशका १४ जिल्लाका १३७ वटै स्थानीय तहबाट अपाङ्गता सहायता सहजकर्ताले वार्षिक कार्यसम्पादन र प्रगति अनलाइन प्रविष्टि गर्ने प्रणाली।
              </p>
            </div>

            <div className="p-5 rounded-xl bg-purple-50/50 border border-purple-200">
              <BarChart3 className="w-8 h-8 text-purple-800 mb-3" />
              <h3 className="font-bold text-slate-900 text-base mb-2">३. Analytics & Reporting</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                लाभग्राही, गृहभेट, सहायक सामग्री र बजेट सम्बन्धी तथ्यांकलाई एकीकृत गरी विषयगत चार्ट, तुलनात्मक विश्लेषण र Downloadable रिपोर्ट निर्माण।
              </p>
            </div>
          </div>
        </section>

        {/* WCAG Accessibility Commitment */}
        <section className="bg-linear-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">पहुँचयुक्तता प्रतिबद्धता</span>
          </div>
          <h2 className="text-xl font-black mb-3">WCAG 2.2 AA अन्तर्राष्ट्रिय मापदण्ड पालना</h2>
          <p className="text-sm text-blue-100 leading-relaxed mb-4">
            यस प्रणालीमा दृष्टिविहीन, न्यून दृष्टि भएका, श्रवण सम्बन्धी समस्या भएका तथा शारीरिक अपाङ्गता भएका सबै प्रयोगकर्ताहरूले सहज पहुँच पाउने गरी स्क्रिन रिडर अनुकूलता, किबोर्ड नेभिगेसन, उच्च कन्ट्रास्ट र फन्ट जुम सुविधाहरू पूर्ण रूपमा सुनिश्चित गरिएको छ।
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-blue-200">
            <div className="p-2.5 bg-white/10 rounded-lg">✓ किबोर्ड नेभिगेसन</div>
            <div className="p-2.5 bg-white/10 rounded-lg">✓ उच्च कन्ट्रास्ट मोड</div>
            <div className="p-2.5 bg-white/10 rounded-lg">✓ स्क्रिन रिडर लेबलहरू</div>
            <div className="p-2.5 bg-white/10 rounded-lg">✓ फन्ट जुम स्केलिङ</div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-4 pb-3 border-b border-slate-200">
            सम्पर्क तथा सहयोग (Support & Helpdesk)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">कार्यालय ठेगाना:</span>
                <span className="text-xs text-slate-600">विराटनगर, कोशी प्रदेश, नेपाल</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <PhoneCall className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">सहजकर्ता हटलाइन:</span>
                <span className="text-xs text-slate-600">+९७७-०२१-४६XXXX / ९८xxxxxxxx</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">आधिकारिक इमेल:</span>
                <span className="text-xs text-slate-600">info.dic@koshi.gov.np</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer lang={lang} />
    </div>
  );
}
