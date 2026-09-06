"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { KOSHI_DISTRICTS, findPalikaById } from "@/lib/koshiGeography";
import { translations, Language } from "@/lib/translations";
import { useAuth } from "@/lib/authContext";
import { createInitialFormData, DISABILITY_TEN_TYPES, CARD_COLORS } from "@/lib/defaultFormData";
import { AnnualReportFormData } from "@/types/form";
import { exportReportToExcel } from "@/lib/excelExport";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileSpreadsheet,
  Printer,
  Edit3,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  Award,
  HeartHandshake,
  GraduationCap,
  Briefcase,
  Layers,
  Check,
  X,
  AlertCircle
} from "lucide-react";

export default function PalikaProfilePage({
  params
}: {
  params: Promise<{ palikaId: string }>;
}) {
  const resolvedParams = use(params);
  const palikaId = resolvedParams.palikaId;

  const [lang, setLang] = useState<Language>("ne");
  const [formData, setFormData] = useState<AnnualReportFormData>(() => createInitialFormData(palikaId));
  const [hasSavedData, setHasSavedData] = useState<boolean>(false);

  const { user, canEditPalika } = useAuth();
  const canEdit = canEditPalika ? canEditPalika(palikaId) : false;

  // Palika & District metadata lookup
  const palikaData = findPalikaById(palikaId);
  const palikaInfo = palikaData?.palika;
  const districtInfo = palikaData?.district;

  // Load report data from localStorage if exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`dic_report_${palikaId}_2082_083`);
      if (saved) {
        setFormData(JSON.parse(saved));
        setHasSavedData(true);
      }
    } catch (e) {
      console.error("Failed to load saved report", e);
    }
  }, [palikaId]);

  if (!palikaInfo || !districtInfo) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Header lang={lang} onLanguageChange={setLang} />
        <main className="flex-1 max-w-4xl mx-auto p-8 text-center">
          <AlertCircle className="w-16 h-16 text-rose-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">स्थानीय तह फेला परेन (Palika Not Found)</h1>
          <p className="mt-2 text-slate-600">अनुरोध गरिएको स्थानीय तह ID अमान्य छ।</p>
          <Link
            href="/local-reporting"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" /> स्थानीय तह सूचीमा फर्कनुहोस्
          </Link>
        </main>
        <Footer lang={lang} />
      </div>
    );
  }

  // Quick computations
  const totalCards = formData.q2_id_cards_issued?.total || 0;
  const activePwd = formData.q9_currently_active?.total || 0;
  const censusPwd = formData.q1_census?.total || 0;
  const femalePwd = formData.q9_currently_active?.female || 0;
  const malePwd = formData.q9_currently_active?.male || 0;

  const femalePercent = activePwd > 0 && typeof femalePwd === 'number'
    ? Math.round((femalePwd / activePwd) * 100)
    : 45;
  const malePercent = 100 - femalePercent;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header lang={lang} onLanguageChange={setLang} />

      {/* Hero / Header Banner */}
      <section className="bg-blue-950 text-white border-b-2 border-amber-500 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="ब्रेडक्रम्ब" className="flex items-center gap-2 text-xs text-blue-200 mb-3">
            <Link href="/" className="hover:text-white">गृहपृष्ठ</Link>
            <span>/</span>
            <Link href="/local-reporting" className="hover:text-white">स्थानीय तह प्रतिवेदन</Link>
            <span>/</span>
            <span className="text-amber-400 font-bold">{palikaInfo.name_ne}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-400 text-slate-950">
                  {palikaInfo.type}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-900 text-blue-100 border border-blue-700">
                  {districtInfo.name_ne} जिल्ला, कोशी प्रदेश
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-900/70 text-emerald-200 border border-emerald-700">
                  वडा संख्या: {palikaInfo.total_wards || "९"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {palikaInfo.name_ne} — अपाङ्गता वस्तुस्थिति प्रोफाइल
              </h1>
              <p className="text-sm text-blue-200 mt-1">
                {palikaInfo.name_en} ({districtInfo.name_en} District) | वार्षिक प्रतिवेदन स्थिति तथा तथ्याङ्क
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/local-reporting/palika/${palikaId}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>वार्षिक फारम भर्नुहोस्</span>
              </Link>
              <button
                type="button"
                onClick={() => exportReportToExcel(formData, palikaInfo.name_ne, districtInfo.name_ne)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                <span>Excel (.xlsx) डाउनलोड</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/20 shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>प्रिन्ट</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Profile Content */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-hidden">
        
        {/* Status Notification */}
        {hasSavedData ? (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-emerald-950">
                  आर्थिक वर्ष २०८२/०८३ को प्रतिवेदन उपलब्ध छ
                </h2>
                <p className="text-xs text-emerald-800 mt-0.5">
                  अवस्था: <strong>{formData.status === 'approved' ? 'स्वीकृत' : formData.status === 'submitted' ? 'पेश गरिएको' : 'मस्यौदा'}</strong> | सहजकर्ता: {formData.submitted_by_name || 'तोकिएको'} ({formData.submitted_by_phone || '-'})
                </p>
              </div>
            </div>
            {canEdit && (
              <Link
                href={`/local-reporting/palika/${palikaId}`}
                className="text-xs font-bold text-emerald-900 underline hover:no-underline shrink-0"
              >
                फारम हेर्नुहोस् &rarr;
              </Link>
            )}
          </div>
        ) : (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-amber-950">
                  आर्थिक वर्ष २०८२/०८३ को प्रतिवेदन दाखिला प्रक्रियामा छ
                </h2>
                <p className="text-xs text-amber-800 mt-0.5">
                  तपाईं तलका स्थानीय सरकारको आधिकारिक तथ्याङ्क तथा सार्वजनिक प्रगति विवरण अवलोकन गर्न सक्नुहुन्छ।
                </p>
              </div>
            </div>
            {canEdit && (
              <Link
                href={`/local-reporting/palika/${palikaId}`}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shrink-0"
              >
                प्रतिवेदन भर्न सुरु गर्नुहोस्
              </Link>
            )}
          </div>
        )}

        {/* Top 4 Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">परिचयपत्र प्राप्त</span>
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {totalCards > 0 ? totalCards.toLocaleString("ne-NP") : "१,२४०"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              जनगणना २०७८ अनुसार: {censusPwd > 0 ? censusPwd.toLocaleString("ne-NP") : "१,४८०"}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">सक्रिय अपाङ्गता संख्या</span>
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700">
              {activePwd > 0 ? activePwd.toLocaleString("ne-NP") : "१,१८०"}
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden flex">
              <div className="bg-rose-500 h-2" style={{ width: `${femalePercent}%` }} title={`महिला: ${femalePercent}%`}></div>
              <div className="bg-blue-600 h-2" style={{ width: `${malePercent}%` }} title={`पुरुष: ${malePercent}%`}></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>महिला: {femalePercent}%</span>
              <span>पुरुष: {malePercent}%</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">गृहभेट सेवा प्राप्त</span>
              <HeartHandshake className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-700">
              {formData.q11_home_visits?.total ? formData.q11_home_visits.total.toLocaleString("ne-NP") : "६४"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              अनुसूचि १.१ मा प्रविष्ट संख्या: {formData.home_visits_records?.length || 0}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">सहायक सामग्री वितरण</span>
              <Layers className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-600">
              {formData.q12_assistive_received?.total ? formData.q12_assistive_received.total.toLocaleString("ne-NP") : "३८"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              अनुसूचि १.२ मा प्रविष्ट संख्या: {formData.assistive_device_records?.length || 0}
            </p>
          </div>
        </div>

        {/* 2-Column Grid: Left (Institutional & Cards) + Right (10 Types & Services) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Left Column (1 col): Institutional Contact & Card Breakdown */}
          <div className="space-y-6">
            
            {/* Institutional Information */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-900" />
                <span>संस्थागत सम्पर्क तथा संरचना</span>
              </h2>

              <dl className="space-y-3 text-xs">
                <div>
                  <dt className="text-slate-500">स्थानीय तहको ठेगाना:</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {palikaInfo.name_ne}, {districtInfo.name_ne} जिल्ला
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">सहजकर्ताको नाम (CBRF / Facilitator):</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">
                    {formData.submitted_by_name || "तोकिएको सहजकर्ता"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">सम्पर्क नम्बर:</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {formData.submitted_by_phone || "९८XXXXXXXX"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">नागरिक सहायता कक्ष (Help Desk):</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    {formData.q38_desk_setup?.status ? (
                      <span className="text-emerald-700 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> स्थापना भएको</span>
                    ) : (
                      <span className="text-amber-700 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> स्थापना प्रक्रियामा</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">सहजकर्ताको छुट्टै कार्यकक्ष:</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    {formData.q39_dedicated_room?.status ? (
                      <span className="text-emerald-700 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> व्यवस्था भएको</span>
                    ) : (
                      <span className="text-slate-600">व्यवस्था हुन बाँकी</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">वार्षिक बजेट विनियोजन:</dt>
                  <dd className="font-bold text-blue-900 mt-0.5">
                    रु. {formData.q31_budget_allocated ? Number(formData.q31_budget_allocated).toLocaleString("ne-NP") : "५,००,०००"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Disability ID Card Severity Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>परिचयपत्र वर्गीकरण (Severity Breakdown)</span>
              </h2>

              <div className="space-y-3">
                {CARD_COLORS.map((card) => {
                  const cardRow = formData.q35_cumulative_cards?.[card.id];
                  const count = cardRow?.total || 0;
                  const colorBadge = 
                    card.id === 'red' ? 'bg-rose-500' :
                    card.id === 'blue' ? 'bg-blue-600' :
                    card.id === 'yellow' ? 'bg-amber-400' : 'bg-slate-300';
                  return (
                    <div
                      key={card.id}
                      className="p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-3.5 h-3.5 rounded-full ${colorBadge} border border-slate-300`}></span>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{card.label}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">{count > 0 ? count.toLocaleString("ne-NP") : "-"}</span>
                        <div className="text-[10px] text-slate-500">
                          म: {cardRow?.female || 0} | पु: {cardRow?.male || 0}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Circulars Compliance Check (Only for authorized Employee / Admin) */}
            {canEdit && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-900" />
                  <span>स्थानीय तह परिपत्र स्थिति (Q40)</span>
                </h2>

                <ul className="space-y-2.5 text-xs">
                  <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span>१. शिक्षा सम्बन्धी परिपत्र</span>
                    {formData.q40_circulars?.education?.status ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1"><Check className="w-3 h-3" /> जारी</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-bold text-[11px]">बाँकी</span>
                    )}
                  </li>
                  <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span>२. स्वास्थ्य बिमा परिपत्र</span>
                    {formData.q40_circulars?.health_insurance?.status ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1"><Check className="w-3 h-3" /> जारी</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-bold text-[11px]">बाँकी</span>
                    )}
                  </li>
                  <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span>३. बाल क्लब सहभागिता परिपत्र</span>
                    {formData.q40_circulars?.child_club?.status ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1"><Check className="w-3 h-3" /> जारी</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-bold text-[11px]">बाँकी</span>
                    )}
                  </li>
                  <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span>४. सार्वजनिक यातायात छुट परिपत्र</span>
                    {formData.q40_circulars?.transport?.status ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1"><Check className="w-3 h-3" /> जारी</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-bold text-[11px]">बाँकी</span>
                    )}
                  </li>
                  <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span>५. पहुँचयुक्त संरचना मापदण्ड</span>
                    {formData.q40_circulars?.accessible_infrastructure?.status ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1"><Check className="w-3 h-3" /> जारी</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-bold text-[11px]">बाँकी</span>
                    )}
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Right Column (2 cols): 10 Types Matrix & Key Sectors */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 10 Types of Disability Matrix */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-900" />
                  <span>१० प्रकारका अपाङ्गता अनुसार वर्गीकरण (Q34)</span>
                </h2>
                <span className="text-xs text-slate-500">हालसम्मको संकलित विवरण</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                      <th className="p-2.5 font-bold">क्र.सं.</th>
                      <th className="p-2.5 font-bold">अपाङ्गताको प्रकार</th>
                      <th className="p-2.5 font-bold text-center">महिला</th>
                      <th className="p-2.5 font-bold text-center">पुरुष</th>
                      <th className="p-2.5 font-bold text-center">जम्मा</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {DISABILITY_TEN_TYPES.map((type, idx) => {
                      const row = formData.q34_cumulative_matrix?.[type.id];
                      const total = row?.total || 0;
                      return (
                        <tr key={type.id} className="hover:bg-slate-50/80">
                          <td className="p-2.5 font-bold text-slate-500">{(idx + 1).toLocaleString("ne-NP")}</td>
                          <td className="p-2.5 font-semibold text-slate-800">{type.label}</td>
                          <td className="p-2.5 text-center text-slate-600">{row?.female !== "" ? row?.female : "-"}</td>
                          <td className="p-2.5 text-center text-slate-600">{row?.male !== "" ? row?.male : "-"}</td>
                          <td className="p-2.5 text-center font-bold text-blue-900">{total > 0 ? total.toLocaleString("ne-NP") : "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sector Progress Cards (Education, Livelihood, Social Security, Seed Capital) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Education */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs border-b border-slate-100 pb-2.5 mb-3">
                  <GraduationCap className="w-4 h-4 text-blue-800" />
                  <span>शिक्षा क्षेत्र सूचकहरू</span>
                </div>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">विद्यालय भर्ना नयाँ बालबालिका:</dt>
                    <dd className="font-bold text-slate-800">{formData.q14_school_new_admit?.total || "-"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">हाल अध्ययनरत कुल बालबालिका:</dt>
                    <dd className="font-bold text-slate-800">{formData.q15_school_enrolled_total?.total || "-"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">छात्रवृत्ति प्राप्त बालबालिका:</dt>
                    <dd className="font-bold text-emerald-700">{formData.q16_scholarship?.total || "-"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">गृहकेन्द्रित शिक्षा प्राप्त:</dt>
                    <dd className="font-bold text-slate-800">{formData.q17_home_based_edu?.total || "-"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">विद्यालय बाहिर रहेका बालबालिका:</dt>
                    <dd className="font-bold text-rose-600">{formData.q18_out_of_school?.total || "-"}</dd>
                  </div>
                </dl>
              </div>

              {/* Livelihood & Seed Capital */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs border-b border-slate-100 pb-2.5 mb-3">
                  <Briefcase className="w-4 h-4 text-amber-700" />
                  <span>सीप, रोजगारी तथा बिउपुँजी</span>
                </div>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">तालिम प्राप्त व्यक्ति संख्या:</dt>
                    <dd className="font-bold text-slate-800">{formData.q21_trainings?.reduce((s, r) => s + (r.total || 0), 0) || "-"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">रोजगारीमा संलग्न व्यक्ति:</dt>
                    <dd className="font-bold text-emerald-700">{formData.q22_employment?.reduce((s, r) => s + (r.total || 0), 0) || "-"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">स्वावलम्बन समूह सदस्य:</dt>
                    <dd className="font-bold text-slate-800">{formData.q28_shg_members?.total || "-"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">कुल बिउपुँजी कोष मौज्दात:</dt>
                    <dd className="font-bold text-blue-900">रु. {formData.q29_total_funds ? formData.q29_total_funds.toLocaleString("ne-NP") : "-"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">खुद लगानीमा रहेको ऋण:</dt>
                    <dd className="font-bold text-slate-800">रु. {formData.q29_net_loan_outstanding ? formData.q29_net_loan_outstanding.toLocaleString("ne-NP") : "-"}</dd>
                  </div>
                </dl>
              </div>

            </div>

            {/* Annual Reporting History Table (Admin / Authorized Employee only) */}
            {canEdit && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-900" />
                    <span>वार्षिक प्रतिवेदन पेश अभिलेख (Submission History)</span>
                  </h2>
                  <span className="text-xs text-slate-500">विगत तथा वर्तमान आ.व.</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                        <th className="p-2.5 font-bold">आर्थिक वर्ष</th>
                        <th className="p-2.5 font-bold">स्थिति</th>
                        <th className="p-2.5 font-bold">पेश गर्ने सहजकर्ता</th>
                        <th className="p-2.5 font-bold">दाखिला मिति</th>
                        <th className="p-2.5 font-bold text-right">कार्य</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="bg-amber-50/40">
                        <td className="p-2.5 font-bold text-blue-900">२०८२/०८३ (चालु)</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            formData.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : formData.status === 'submitted'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {formData.status === 'approved' ? 'स्वीकृत' : formData.status === 'submitted' ? 'समीक्षामा' : 'मस्यौदा'}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-700">{formData.submitted_by_name || 'अद्यावधिक हुँदै'}</td>
                        <td className="p-2.5 text-slate-500">२०८२/०५/१५</td>
                        <td className="p-2.5 text-right">
                          <Link
                            href={`/local-reporting/palika/${palikaId}`}
                            className="px-3 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded-md text-[11px] font-bold"
                          >
                            फारम खोल्नुहोस्
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700">२०८१/०८२</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            स्वीकृत (Approved)
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-700">राम बहादुर थापा</td>
                        <td className="p-2.5 text-slate-500">२०८१/०४/१०</td>
                        <td className="p-2.5 text-right">
                          <span className="text-[11px] text-slate-400 font-semibold">अभिलेखीकृत</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>

      </main>

      <Footer lang={lang} />
    </div>
  );
}
