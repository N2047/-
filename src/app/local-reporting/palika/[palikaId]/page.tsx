"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GenderNumberInput from "@/components/reporting/GenderNumberInput";
import YesNoRadio from "@/components/reporting/YesNoRadio";
import HomeVisitTable from "@/components/reporting/HomeVisitTable";
import AssistiveDeviceTable from "@/components/reporting/AssistiveDeviceTable";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import { translations, Language } from "@/lib/translations";
import { exportReportToExcel } from "@/lib/excelExport";
import { 
  createInitialFormData, 
  DISABILITY_TEN_TYPES, 
  CARD_COLORS 
} from "@/lib/defaultFormData";
import { AnnualReportFormData, GenderRow, TrainingRow, EmploymentRow } from "@/types/form";
import { 
  ArrowLeft, 
  Save, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Printer, 
  FileSpreadsheet, 
  Building2,
  Calendar,
  Layers,
  HelpCircle,
  Plus,
  Trash2
} from "lucide-react";

const SECTIONS = [
  { id: 1, title: "१. सामान्य विवरण", short: "Q1-Q9", desc: "जनसांख्यिकी तथा प्रोफाइल स्थिति" },
  { id: 2, title: "२. सेवा प्रवाह", short: "Q10-Q13", desc: "परामर्श, गृहभेट र सहायक सामग्री" },
  { id: 3, title: "३. शिक्षा र बालबालिका", short: "Q14-Q20", desc: "भर्ना, छात्रवृत्ति र बाल क्लब" },
  { id: 4, title: "४. तालिम र उद्यम", short: "Q21-Q23", desc: "व्यवसायिक तालिम र रोजगारी" },
  { id: 5, title: "५. सामाजिक सुरक्षा", short: "Q24-Q27", desc: "भत्ता र परिचयपत्र सम्बन्धी" },
  { id: 6, title: "६. समूह र बिउपुँजी", short: "Q28-Q29", desc: "मिलिजुली समूह, बचत र ऋण" },
  { id: 7, title: "७. संस्थागत र बजेट", short: "Q30-Q33", desc: "OPD, बजेट तथा स्वास्थ्य बीमा" },
  { id: 8, title: "८. १० प्रकारगत वर्गीकरण", short: "Q34", desc: "अपाङ्गताका प्रकार अनुसार" },
  { id: 9, title: "९. कार्ड रंग/गाम्भीर्यता", short: "Q35", desc: "रातो, निलो, पहेलो, सेतो" },
  { id: 10, title: "१०. नीति र प्रबन्ध", short: "Q36-Q44", desc: "कानुनी सहायता, परिपत्र र कार्यकक्ष" },
  { id: 11, title: "अनुसूची १.१ (गृहभेट)", short: "गृहभेट", desc: "गृहभेट गरिएको विवरण तालिका" },
  { id: 12, title: "अनुसूची १.२ (सामग्री)", short: "सामग्री", desc: "सहायक सामग्री वितरण तालिका" },
  { id: 13, title: "१३. समीक्षा र पेश", short: "समीक्षा", desc: "समग्र फारम जाँच तथा सबमिट" },
];

export default function AnnualReportFormPage({
  params,
}: {
  params: Promise<{ palikaId: string }>;
}) {
  const resolvedParams = use(params);
  const palikaId = resolvedParams.palikaId;

  const [lang, setLang] = useState<Language>("ne");
  const [activeSection, setActiveSection] = useState<number>(1);
  const [formData, setFormData] = useState<AnnualReportFormData>(() => createInitialFormData(palikaId));
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [reportSubmissionId, setReportSubmissionId] = useState<string>("");

  // Find palika info
  let palikaInfo: any = null;
  let districtInfo: any = null;
  for (const d of KOSHI_DISTRICTS) {
    const found = d.local_governments.find((p) => p.id === palikaId);
    if (found) {
      palikaInfo = found;
      districtInfo = d;
      break;
    }
  }

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`dic_report_${palikaId}_2082_083`);
      if (saved) {
        setFormData(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, [palikaId]);

  // Save Draft handler
  const handleSaveDraft = () => {
    try {
      localStorage.setItem(`dic_report_${palikaId}_2082_083`, JSON.stringify(formData));
      setSaveMessage("प्रतिवेदनको मस्यौदा सुरक्षित भयो!");
      setTimeout(() => setSaveMessage(""), 4000);
    } catch (e) {
      console.error(e);
      setSaveMessage("मस्यौदा सुरक्षित गर्न सकिएन।");
    }
  };

  // Submit Final handler
  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionId = "DIC-KP-" + Math.floor(100000 + Math.random() * 900000);
    const updated = {
      ...formData,
      status: "submitted" as const,
    };
    setFormData(updated);
    setReportSubmissionId(submissionId);
    setIsSubmitted(true);
    localStorage.setItem(`dic_report_${palikaId}_2082_083`, JSON.stringify(updated));
  };

  // Mathematical Auto-calculation for Q9: Active = Q2 - (Q7 + Q8)
  useEffect(() => {
    const q2_tot = formData.q2_id_cards_issued.total || 0;
    const q7_tot = formData.q7_migrated_out.total || 0;
    const q8_tot = formData.q8_deceased.total || 0;
    const active = Math.max(0, q2_tot - (q7_tot + q8_tot));

    if (formData.q9_currently_active.total !== active) {
      setFormData((prev) => ({
        ...prev,
        q9_currently_active: {
          ...prev.q9_currently_active,
          total: active,
        },
      }));
    }
  }, [
    formData.q2_id_cards_issued.total,
    formData.q7_migrated_out.total,
    formData.q8_deceased.total,
  ]);

  // Mathematical Auto-calculation for Q29: Financial relations
  useEffect(() => {
    const dprp = typeof formData.q29_seed_dprp === "number" ? formData.q29_seed_dprp : 0;
    const other = typeof formData.q29_seed_other === "number" ? formData.q29_seed_other : 0;
    const savings = typeof formData.q29_member_savings === "number" ? formData.q29_member_savings : 0;
    const interest = typeof formData.q29_interest_earned === "number" ? formData.q29_interest_earned : 0;
    const totalFunds = dprp + other + savings + interest;

    const loanInv = typeof formData.q29_loan_invested === "number" ? formData.q29_loan_invested : 0;
    const badLoan = typeof formData.q29_bad_loans === "number" ? formData.q29_bad_loans : 0;
    const netLoan = Math.max(0, loanInv - badLoan);

    if (
      formData.q29_total_funds !== totalFunds ||
      formData.q29_net_loan_outstanding !== netLoan
    ) {
      setFormData((prev) => ({
        ...prev,
        q29_total_funds: totalFunds,
        q29_net_loan_outstanding: netLoan,
      }));
    }
  }, [
    formData.q29_seed_dprp,
    formData.q29_seed_other,
    formData.q29_member_savings,
    formData.q29_interest_earned,
    formData.q29_loan_invested,
    formData.q29_bad_loans,
  ]);

  if (!palikaInfo) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header lang={lang} onLanguageChange={setLang} />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900">स्थानीय तह फेला परेन</h1>
          <p className="text-sm text-slate-600 mt-2 mb-6">तपाईंले खोज्नुभएको पालिका ID फेला पर्न सकेन।</p>
          <Link href="/local-reporting" className="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-bold">
            पालिका सूचीमा फर्कनुहोस्
          </Link>
        </main>
        <Footer lang={lang} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header lang={lang} onLanguageChange={setLang} />

      {/* SUBMISSION CONFIRMATION MODAL */}
      {isSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-4 border-emerald-500 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              सफलतापूर्वक पेश भयो
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-3">
              तपाईंको वार्षिक प्रतिवेदन सफलतापूर्वक पेश भयो।
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              अपाङ्गता सहायता सहजकर्ता वार्षिक प्रतिवेदन (आ.व. २०८२/०८३)
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-6 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">प्रतिवेदन ID:</span>
                <span className="font-mono font-bold text-blue-900">{reportSubmissionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">स्थानीय तह:</span>
                <span className="font-bold text-slate-900">{palikaInfo.name_ne} ({districtInfo.name_ne} जिल्ला)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">आर्थिक वर्ष:</span>
                <span className="font-bold text-slate-900">२०८२/०८३</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">स्थिति:</span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Submitted (समीक्षाको पर्खाइमा)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>प्रतिवेदन छाप्नुहोस्</span>
              </button>
              <Link
                href="/local-reporting"
                className="flex-1 py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>स्थानीय पोर्टलमा फर्कनुहोस्</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner with Palika Details */}
      <section className="bg-blue-950 text-white border-b-2 border-amber-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Link
                href="/local-reporting"
                className="p-2 bg-blue-900 hover:bg-blue-800 rounded-lg text-slate-200 hover:text-white transition-colors"
                title="फर्कनुहोस्"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                    {palikaInfo.type}
                  </span>
                  <span className="text-xs text-blue-200">
                    {districtInfo.name_ne} जिल्ला, कोशी प्रदेश
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black mt-0.5">
                  {palikaInfo.name_ne} — अपाङ्गता सहायता सहजकर्ता वार्षिक प्रतिवेदन
                </h1>
                <p className="text-xs text-blue-200">
                  आर्थिक वर्ष: <strong>२०८२/०८३</strong> | ढाँचा: राष्ट्रिय अपाङ्गता सहायता कक्ष मापदण्ड
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/local-reporting/palika/${palikaId}/profile`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-900/80 hover:bg-blue-800 text-blue-100 text-xs font-bold border border-blue-700/60 transition-all shadow-xs"
              >
                <Building2 className="w-4 h-4 text-sky-300" />
                <span>पालिका प्रोफाइल</span>
              </Link>
              <button
                type="button"
                onClick={() => exportReportToExcel(formData, palikaInfo.name_ne, districtInfo.name_ne)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold border border-emerald-500/50 transition-all shadow-xs cursor-pointer"
                title="३ वटै अनुसूचि सहित एक्सेल फाइल डाउनलोड गर्नुहोस्"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                <span>एक्सेल निर्यात (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all shadow-xs cursor-pointer"
                title="प्रिन्ट वा PDF सुरक्षित गर्नुहोस्"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>प्रिन्ट / PDF</span>
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>मस्यौदा सुरक्षित</span>
              </button>
            </div>
          </div>

          {saveMessage && (
            <div className="mt-3 py-2 px-3 bg-emerald-500/20 border border-emerald-400 text-emerald-200 rounded-lg text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{saveMessage}</span>
            </div>
          )}
        </div>
      </section>

      {/* Main Layout: Left Stepper Sidebar + Right Active Section Content */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* SECTION STEPPER SIDEBAR */}
          <aside className="lg:col-span-1 bg-white rounded-2xl p-4 border border-slate-200 shadow-xs sticky top-24">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">
              प्रतिवेदन खण्डहरू (Sections)
            </h2>
            <nav aria-label="फारम खण्ड नेभिगेसन" className="space-y-1">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                    activeSection === sec.id
                      ? "bg-blue-900 text-white shadow-xs"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="truncate mr-2">
                    <span className="block truncate">{sec.title}</span>
                    <span className={`text-[10px] font-normal block truncate ${
                      activeSection === sec.id ? "text-blue-200" : "text-slate-400"
                    }`}>
                      {sec.desc}
                    </span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                    activeSection === sec.id ? "bg-blue-800 text-amber-300" : "bg-slate-100 text-slate-500"
                  }`}>
                    {sec.short}
                  </span>
                </button>
              ))}
            </nav>
          </aside>

          {/* ACTIVE SECTION FORM CONTENT */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            
            {/* SECTION 1: Demographics Q1 - Q9 */}
            {activeSection === 1 && (
              <section aria-labelledby="sec1-heading" className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">खण्ड १</span>
                  <h2 id="sec1-heading" className="text-xl font-bold text-slate-900 mt-1">
                    सामान्य विवरण तथा व्यक्तिगत प्रोफाइल (Q1 - Q9)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    जनगणना, पहिचान, परिचयपत्र वितरण, प्रोफाइल र हाल कायम अपाङ्गता भएका व्यक्तिको संख्या
                  </p>
                </div>

                <div className="space-y-4">
                  <GenderNumberInput
                    id="q1"
                    questionNumber={1}
                    label="पालिकामा रहेको अपाङ्गता भएका व्यक्तिको कुल संख्या (जनगणना २०७८ अनुसार)"
                    subLabel="राष्ट्रिय जनगणना २०७८ को आधिकारिक तथ्यांक"
                    value={formData.q1_census}
                    onChange={(val) => setFormData({ ...formData, q1_census: val })}
                  />

                  <GenderNumberInput
                    id="q2"
                    questionNumber={2}
                    label="हालसम्म पालिकामा अपाङ्गता परिचयपत्र प्राप्त व्यक्तिहरुको जम्मा संख्या"
                    subLabel="ढड्ढा अनुसार वितरण भएको कुल परिचयपत्र संख्या"
                    value={formData.q2_id_cards_issued}
                    onChange={(val) => setFormData({ ...formData, q2_id_cards_issued: val })}
                  />

                  <GenderNumberInput
                    id="q3"
                    questionNumber={3}
                    label="हालसम्म पालिकामा पहिचान भएको अपाङ्गता भएको व्यक्तिहरुको संख्या"
                    value={formData.q3_identified_pwd}
                    onChange={(val) => setFormData({ ...formData, q3_identified_pwd: val })}
                  />

                  <GenderNumberInput
                    id="q4"
                    questionNumber={4}
                    label="पालिकामा अपाङ्गता परिचयपत्र प्राप्त गर्न बाँकी रहेका व्यक्तिहरुको जम्मा संख्या"
                    subLabel="रिचिङ्ग टु मिसिङ्ग (Reaching to Missing) बाट पहिचान भई कार्ड पाउन बाँकी संख्या"
                    value={formData.q4_id_card_pending}
                    onChange={(val) => setFormData({ ...formData, q4_id_card_pending: val })}
                  />

                  <GenderNumberInput
                    id="q5"
                    questionNumber={5}
                    label="पालिकामा अपाङ्गता भएका व्यक्तिको व्यक्तिगत प्रोफाइल तयार भएका जम्मा संख्या"
                    subLabel="कागजी फारम र MIS के मा रहेको कैफियतमा खुलाउने"
                    value={formData.q5_profile_completed}
                    onChange={(val) => setFormData({ ...formData, q5_profile_completed: val })}
                  />

                  <GenderNumberInput
                    id="q6"
                    questionNumber={6}
                    label="पालिकामा अपाङ्गता भएका व्यक्तिको व्यक्तिगत प्रोफाइल तयार नभएका जम्मा संख्या"
                    subLabel="हाल कायम भएको अपाङ्गता संख्या अनुसार बन्न बाँकी संख्या"
                    value={formData.q6_profile_pending}
                    onChange={(val) => setFormData({ ...formData, q6_profile_pending: val })}
                  />

                  <GenderNumberInput
                    id="q7"
                    questionNumber={7}
                    label="हालसम्म बसाइँसराइ गरेर गएका अपाङ्गता भएका व्यक्तिहरुको संख्या"
                    subLabel="परिचयपत्र पाएका व्यक्तिहरू मध्यबाट"
                    value={formData.q7_migrated_out}
                    onChange={(val) => setFormData({ ...formData, q7_migrated_out: val })}
                  />

                  <GenderNumberInput
                    id="q8"
                    questionNumber={8}
                    label="हालसम्म मृत्यु भएका जम्मा अपाङ्गता भएका व्यक्तिहरु"
                    subLabel="परिचयपत्र पाएका व्यक्तिहरू मध्यबाट"
                    value={formData.q8_deceased}
                    onChange={(val) => setFormData({ ...formData, q8_deceased: val })}
                  />

                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <GenderNumberInput
                      id="q9"
                      questionNumber={9}
                      label="हालसम्म कायम रहेका अपाङ्गता भएका व्यक्तिहरुको संख्या (स्वचालित हिसाब)"
                      subLabel="सूत्र: ढड्ढाको संख्या (Q2) बाट मृत्यु (Q8) र बसाइँसराइ (Q7) घटाई बाँकी संख्या"
                      value={formData.q9_currently_active}
                      onChange={(val) => setFormData({ ...formData, q9_currently_active: val })}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 2: Service Delivery Q10 - Q13 */}
            {activeSection === 2 && (
              <section aria-labelledby="sec2-heading" className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">खण्ड २</span>
                  <h2 id="sec2-heading" className="text-xl font-bold text-slate-900 mt-1">
                    सेवा प्रवाह तथा कार्यसम्पादन विवरण (Q10 - Q13)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    परामर्श, गृहभेट, सहायक सामग्री र स्वास्थ्य उपचार
                  </p>
                </div>

                <div className="space-y-4">
                  <GenderNumberInput
                    id="q10"
                    questionNumber={10}
                    label="आ.व. ०८१/०८२ मा अपाङ्गता सहायता कक्षबाट परामर्श तथा सहायता सेवा प्रदान गरेको व्यक्तिको संख्या"
                    value={formData.q10_counselling}
                    onChange={(val) => setFormData({ ...formData, q10_counselling: val })}
                  />

                  <GenderNumberInput
                    id="q11"
                    questionNumber={11}
                    label="आ.व. ०८१/०८२ मा अपाङ्गता सहायता सहजकर्ताले पालिका भित्र गृहभेट गरिएको जम्मा संख्या"
                    subLabel="अपाङ्गता भएको व्यक्तिको घरमै गई कुनै सहयोग, परामर्श वा जानकारी दिएको संख्या"
                    value={formData.q11_home_visits}
                    onChange={(val) => setFormData({ ...formData, q11_home_visits: val })}
                  />

                  <GenderNumberInput
                    id="q12"
                    questionNumber={12}
                    label="पालिका भित्र आ.व. ०८१/०८२ मा सहायक सामग्री प्राप्त गरेका अपाङ्गता भएका व्यक्तिहरुको संख्या"
                    value={formData.q12_assistive_received}
                    onChange={(val) => setFormData({ ...formData, q12_assistive_received: val })}
                  />

                  <GenderNumberInput
                    id="q13"
                    questionNumber={13}
                    label="आ.व. ०८१/०८२ मा उपचार प्राप्त गरेका अपाङ्गता भएका व्यक्तिहरुको संख्या"
                    value={formData.q13_treatment_received}
                    onChange={(val) => setFormData({ ...formData, q13_treatment_received: val })}
                  />
                </div>
              </section>
            )}

            {/* SECTION 3: Education & Child Clubs Q14 - Q20 */}
            {activeSection === 3 && (
              <section aria-labelledby="sec3-heading" className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">खण्ड ३</span>
                  <h2 id="sec3-heading" className="text-xl font-bold text-slate-900 mt-1">
                    शिक्षा तथा बालबालिका सम्बन्धी विवरण (Q14 - Q20)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    विद्यालय भर्ना, छात्रवृत्ति, घरमा आधारित शिक्षा, विद्यालय बाहिर र बाल क्लब
                  </p>
                </div>

                <div className="space-y-4">
                  <GenderNumberInput
                    id="q14"
                    questionNumber={14}
                    label="विद्यालयमा नयाँ भर्ना भएका अपाङ्गता भएका बालबालिकाहरुको संख्या (शैक्षिक सत्र २०८१ को)"
                    value={formData.q14_school_new_admit}
                    onChange={(val) => setFormData({ ...formData, q14_school_new_admit: val })}
                  />

                  <GenderNumberInput
                    id="q15"
                    questionNumber={15}
                    label="विद्यालयमा अध्ययनरत कुल अपाङ्गता भएका बालबालिकाहरुको संख्या (शैक्षिक सत्र २०८१ को)"
                    value={formData.q15_school_enrolled_total}
                    onChange={(val) => setFormData({ ...formData, q15_school_enrolled_total: val })}
                  />

                  <GenderNumberInput
                    id="q16"
                    questionNumber={16}
                    label="शैक्षिक सत्र २०८१ मा विद्यालयबाट छात्रवृत्ति पाएका बालबालिकाहरुको संख्या"
                    value={formData.q16_scholarship}
                    onChange={(val) => setFormData({ ...formData, q16_scholarship: val })}
                  />

                  <GenderNumberInput
                    id="q17"
                    questionNumber={17}
                    label="शैक्षिक सत्र २०८१ मा घरमा आधारित शिक्षा प्राप्त गरेका बालबालिकाहरुको संख्या"
                    value={formData.q17_home_based_edu}
                    onChange={(val) => setFormData({ ...formData, q17_home_based_edu: val })}
                  />

                  <GenderNumberInput
                    id="q18"
                    questionNumber={18}
                    label="हालसम्म १८ वर्ष मुनिका विद्यालय बाहिर रहेका अपाङ्गता भएका बालबालिकाहरुको संख्या"
                    value={formData.q18_out_of_school}
                    onChange={(val) => setFormData({ ...formData, q18_out_of_school: val })}
                  />

                  {/* Q19: Child clubs total */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label htmlFor="q19-input" className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <span className="bg-blue-900 text-white text-xs px-2 py-0.5 rounded-sm font-bold">19</span>
                      <span>पालिकामा हाल रहेको कुल बाल क्लबहरुको संख्या</span>
                    </label>
                    <input
                      id="q19-input"
                      type="number"
                      min="0"
                      placeholder="कुल बाल क्लब संख्या..."
                      value={formData.q19_child_clubs_total}
                      onChange={(e) => setFormData({ ...formData, q19_child_clubs_total: parseInt(e.target.value, 10) || "" })}
                      className="w-full sm:w-64 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                    />
                  </div>

                  <GenderNumberInput
                    id="q20"
                    questionNumber={20}
                    label="हाल बाल क्लबमा आबद्ध अपाङ्गता भएका बालबालिकाहरुको संख्या"
                    value={formData.q20_child_club_pwd}
                    onChange={(val) => setFormData({ ...formData, q20_child_club_pwd: val })}
                  />
                </div>
              </section>
            )}

            {/* SECTION 4: Training & Employment Q21 - Q23 */}
            {activeSection === 4 && (
              <section aria-labelledby="sec4-heading" className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">खण्ड ४</span>
                  <h2 id="sec4-heading" className="text-xl font-bold text-slate-900 mt-1">
                    सीप, व्यवसायिक तालिम, उद्यम तथा रोजगारी (Q21 - Q23)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    व्यवसायिक तालिम, स्वरोजगार र जागिरमा संलग्न विवरण
                  </p>
                </div>

                {/* Q21 Dynamic Table */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="bg-blue-900 text-white text-xs px-2 py-0.5 rounded-sm font-bold">21</span>
                      <span>आ.व. ०८१/०८२ मा व्यवसायिक तालिम प्राप्त गरेका व्यक्ति तथा परिवार संख्या</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newTr: TrainingRow = {
                          name: "",
                          duration: "",
                          female: "",
                          male: "",
                          total: 0,
                          remarks: "",
                        };
                        setFormData({
                          ...formData,
                          q21_trainings: [...formData.q21_trainings, newTr],
                        });
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ अर्को तालिम थप्नुहोस्</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs border border-slate-200 bg-white rounded-lg">
                      <thead className="bg-slate-100 text-slate-800 font-bold">
                        <tr>
                          <th className="p-2 text-left">तालिमको नाम</th>
                          <th className="p-2 text-left w-28">अवधि</th>
                          <th className="p-2 text-left w-20">महिला</th>
                          <th className="p-2 text-left w-20">पुरुष</th>
                          <th className="p-2 text-left w-24">जम्मा (Auto)</th>
                          <th className="p-2 text-left">कैफियत</th>
                          <th className="p-2 text-center w-10">हटाउनुहोस्</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {formData.q21_trainings.map((tr, idx) => (
                          <tr key={idx}>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={tr.name}
                                placeholder="तालिमको नाम..."
                                onChange={(e) => {
                                  const updated = [...formData.q21_trainings];
                                  updated[idx].name = e.target.value;
                                  setFormData({ ...formData, q21_trainings: updated });
                                }}
                                className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={tr.duration}
                                placeholder="जस्तै ३ महिना"
                                onChange={(e) => {
                                  const updated = [...formData.q21_trainings];
                                  updated[idx].duration = e.target.value;
                                  setFormData({ ...formData, q21_trainings: updated });
                                }}
                                className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="number"
                                min="0"
                                value={tr.female}
                                placeholder="0"
                                onChange={(e) => {
                                  const updated = [...formData.q21_trainings];
                                  const f = e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0;
                                  const m = typeof updated[idx].male === "number" ? updated[idx].male : 0;
                                  updated[idx].female = f;
                                  updated[idx].total = (typeof f === "number" ? f : 0) + m;
                                  setFormData({ ...formData, q21_trainings: updated });
                                }}
                                className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="number"
                                min="0"
                                value={tr.male}
                                placeholder="0"
                                onChange={(e) => {
                                  const updated = [...formData.q21_trainings];
                                  const m = e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0;
                                  const f = typeof updated[idx].female === "number" ? updated[idx].female : 0;
                                  updated[idx].male = m;
                                  updated[idx].total = f + (typeof m === "number" ? m : 0);
                                  setFormData({ ...formData, q21_trainings: updated });
                                }}
                                className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="number"
                                readOnly
                                value={tr.total}
                                className="w-full bg-blue-50 border border-blue-200 rounded px-2 py-1 text-xs font-bold text-blue-900"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={tr.remarks || ""}
                                placeholder="कैफियत..."
                                onChange={(e) => {
                                  const updated = [...formData.q21_trainings];
                                  updated[idx].remarks = e.target.value;
                                  setFormData({ ...formData, q21_trainings: updated });
                                }}
                                className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                              />
                            </td>
                            <td className="p-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formData.q21_trainings.filter((_, i) => i !== idx);
                                  setFormData({ ...formData, q21_trainings: updated });
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Q22 Dynamic Table */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="bg-blue-900 text-white text-xs px-2 py-0.5 rounded-sm font-bold">22</span>
                      <span>स्वरोजगार, साना उद्यम तथा जागिरमा संलग्न अपाङ्गता भएका व्यक्तिको संख्या</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newEmp: EmploymentRow = {
                          type: "",
                          female: "",
                          male: "",
                          total: 0,
                          remarks: "",
                        };
                        setFormData({
                          ...formData,
                          q22_employment: [...formData.q22_employment, newEmp],
                        });
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ अन्य व्यवसाय थप्नुहोस्</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs border border-slate-200 bg-white rounded-lg">
                      <thead className="bg-slate-100 text-slate-800 font-bold">
                        <tr>
                          <th className="p-2 text-left">काम/व्यवसायको प्रकार</th>
                          <th className="p-2 text-left w-24">महिला</th>
                          <th className="p-2 text-left w-24">पुरुष</th>
                          <th className="p-2 text-left w-24">जम्मा (Auto)</th>
                          <th className="p-2 text-left">कैफियत</th>
                          <th className="p-2 text-center w-10">हटाउनुहोस्</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {formData.q22_employment.map((emp, idx) => (
                          <tr key={idx}>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={emp.type}
                                placeholder="व्यवसाय प्रकार..."
                                onChange={(e) => {
                                  const updated = [...formData.q22_employment];
                                  updated[idx].type = e.target.value;
                                  setFormData({ ...formData, q22_employment: updated });
                                }}
                                className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-medium"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="number"
                                min="0"
                                value={emp.female}
                                placeholder="0"
                                onChange={(e) => {
                                  const updated = [...formData.q22_employment];
                                  const f = e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0;
                                  const m = typeof updated[idx].male === "number" ? updated[idx].male : 0;
                                  updated[idx].female = f;
                                  updated[idx].total = (typeof f === "number" ? f : 0) + m;
                                  setFormData({ ...formData, q22_employment: updated });
                                }}
                                className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="number"
                                min="0"
                                value={emp.male}
                                placeholder="0"
                                onChange={(e) => {
                                  const updated = [...formData.q22_employment];
                                  const m = e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0;
                                  const f = typeof updated[idx].female === "number" ? updated[idx].female : 0;
                                  updated[idx].male = m;
                                  updated[idx].total = f + (typeof m === "number" ? m : 0);
                                  setFormData({ ...formData, q22_employment: updated });
                                }}
                                className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="number"
                                readOnly
                                value={emp.total}
                                className="w-full bg-blue-50 border border-blue-200 rounded px-2 py-1 text-xs font-bold text-blue-900"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={emp.remarks || ""}
                                placeholder="कैफियत..."
                                onChange={(e) => {
                                  const updated = [...formData.q22_employment];
                                  updated[idx].remarks = e.target.value;
                                  setFormData({ ...formData, q22_employment: updated });
                                }}
                                className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                              />
                            </td>
                            <td className="p-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formData.q22_employment.filter((_, i) => i !== idx);
                                  setFormData({ ...formData, q22_employment: updated });
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <GenderNumberInput
                  id="q23"
                  questionNumber={23}
                  label="जागिर, स्वरोजगार तथा साना उद्यम सुरु गरेका अपाङ्गता भएका व्यक्तिहरुका परिवारका सदस्य संख्या"
                  value={formData.q23_family_employment}
                  onChange={(val) => setFormData({ ...formData, q23_family_employment: val })}
                />
              </section>
            )}

            {/* SECTION 5: Social Security Q24 - Q27 */}
            {activeSection === 5 && (
              <section aria-labelledby="sec5-heading" className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">खण्ड ५</span>
                  <h2 id="sec5-heading" className="text-xl font-bold text-slate-900 mt-1">
                    सामाजिक सुरक्षा भत्ता सम्बन्धी विवरण (Q24 - Q27)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    पूर्ण असक्त, अति असक्त र अन्य परिचयपत्रबाट प्राप्त भत्ता सम्बन्धी सूचकहरू
                  </p>
                </div>

                <div className="space-y-4">
                  <GenderNumberInput
                    id="q24a"
                    questionNumber="24(क)"
                    label="हालसम्म सामाजिक सुरक्षा भत्ता पाइरहेका पूर्ण असक्त (रातो कार्ड) व्यक्ति संख्या"
                    value={formData.q24_ssa_profound}
                    onChange={(val) => setFormData({ ...formData, q24_ssa_profound: val })}
                  />

                  <GenderNumberInput
                    id="q24b"
                    questionNumber="24(ख)"
                    label="हालसम्म सामाजिक सुरक्षा भत्ता पाइरहेका अति असक्त (निलो कार्ड) व्यक्ति संख्या"
                    value={formData.q24_ssa_severe}
                    onChange={(val) => setFormData({ ...formData, q24_ssa_severe: val })}
                  />

                  <GenderNumberInput
                    id="q25"
                    questionNumber={25}
                    label="पूर्ण/अति असक्त बाहेक अन्य (मध्यम/सामान्य) परिचयपत्रबाट पनि भत्ता पाएका भए कुल संख्या"
                    value={formData.q25_ssa_moderate_mild}
                    onChange={(val) => setFormData({ ...formData, q25_ssa_moderate_mild: val })}
                  />

                  <GenderNumberInput
                    id="q26"
                    questionNumber={26}
                    label="परिचयपत्र स्तर र प्राप्त भत्ताबीच फरक भएको व्यक्तिको संख्या"
                    subLabel="अति असक्तको कार्ड भएर पनि पूर्ण असक्तको भत्ता लिएका वा पूर्ण असक्त भएर अति असक्तको मात्र पाएका"
                    value={formData.q26_ssa_level_mismatch}
                    onChange={(val) => setFormData({ ...formData, q26_ssa_level_mismatch: val })}
                  />

                  <GenderNumberInput
                    id="q27"
                    questionNumber={27}
                    label="अपाङ्गता भएता पनि अन्य शीर्षक (जेष्ठ नागरिक वा एकल महिला आदि) बाट भत्ता पाउने व्यक्ति संख्या"
                    value={formData.q27_ssa_other_schemes}
                    onChange={(val) => setFormData({ ...formData, q27_ssa_other_schemes: val })}
                  />
                </div>
              </section>
            )}

            {/* SECTION 6: Self-Help Groups & Seed Capital Q28 - Q29 */}
            {activeSection === 6 && (
              <section aria-labelledby="sec6-heading" className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">खण्ड ६</span>
                  <h2 id="sec6-heading" className="text-xl font-bold text-slate-900 mt-1">
                    मिलिजुली समूह, बचत तथा बिउपुँजी विवरण (Q28 - Q29)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    समूह सदस्यता, बचत, ब्याज र वित्तीय लगानीको स्वचालित हिसाब
                  </p>
                </div>

                <div className="space-y-4">
                  <GenderNumberInput
                    id="q28a"
                    questionNumber="28(क)"
                    label="मिलिजुली समूहमा आबद्ध अपाङ्गता भएका व्यक्तिको संख्या"
                    value={formData.q28_shg_members}
                    onChange={(val) => setFormData({ ...formData, q28_shg_members: val })}
                  />

                  <GenderNumberInput
                    id="q28b"
                    questionNumber="28(ख)"
                    label="मिलिजुली समूहमा आबद्ध परिवारको संख्या"
                    value={formData.q28_shg_families}
                    onChange={(val) => setFormData({ ...formData, q28_shg_families: val })}
                  />

                  {/* Financial Fields */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="bg-blue-900 text-white text-xs px-2 py-0.5 rounded-sm font-bold">29</span>
                      <span>मिलिजुली समूहको वित्तीय बिउपुँजी तथा ऋण लगानी विवरण (रु.)</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="q29-dprp" className="block text-xs font-semibold text-slate-700 mb-1">
                          क. DPRP कार्यक्रमबाट प्राप्त बिउपुँजी रकम रु.
                        </label>
                        <input
                          id="q29-dprp"
                          type="number"
                          min="0"
                          placeholder="रकम रु..."
                          value={formData.q29_seed_dprp}
                          onChange={(e) => setFormData({ ...formData, q29_seed_dprp: parseFloat(e.target.value) || "" })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                        />
                      </div>

                      <div>
                        <label htmlFor="q29-other" className="block text-xs font-semibold text-slate-700 mb-1">
                          ख. अन्य संस्था/निकायबाट प्राप्त बिउपुँजी रकम रु.
                        </label>
                        <input
                          id="q29-other"
                          type="number"
                          min="0"
                          placeholder="रकम रु..."
                          value={formData.q29_seed_other}
                          onChange={(e) => setFormData({ ...formData, q29_seed_other: parseFloat(e.target.value) || "" })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                        />
                      </div>

                      <div>
                        <label htmlFor="q29-savings" className="block text-xs font-semibold text-slate-700 mb-1">
                          ग. सदस्यहरुको जम्मा बचत रकम रु.
                        </label>
                        <input
                          id="q29-savings"
                          type="number"
                          min="0"
                          placeholder="रकम रु..."
                          value={formData.q29_member_savings}
                          onChange={(e) => setFormData({ ...formData, q29_member_savings: parseFloat(e.target.value) || "" })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                        />
                      </div>

                      <div>
                        <label htmlFor="q29-interest" className="block text-xs font-semibold text-slate-700 mb-1">
                          घ. जम्मा कमाएको ब्याज रकम रु.
                        </label>
                        <input
                          id="q29-interest"
                          type="number"
                          min="0"
                          placeholder="रकम रु..."
                          value={formData.q29_interest_earned}
                          onChange={(e) => setFormData({ ...formData, q29_interest_earned: parseFloat(e.target.value) || "" })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                        <label className="block text-xs font-bold text-blue-950 mb-1">
                          ङ. समूहमा रहेको कुल रकम रु. (स्वचालित: क + ख + ग + घ)
                        </label>
                        <input
                          type="number"
                          readOnly
                          value={formData.q29_total_funds}
                          className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-base font-black text-blue-900 cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label htmlFor="q29-loan" className="block text-xs font-semibold text-slate-700 mb-1">
                          च. ऋण लगानी रकम रु.
                        </label>
                        <input
                          id="q29-loan"
                          type="number"
                          min="0"
                          placeholder="रकम रु..."
                          value={formData.q29_loan_invested}
                          onChange={(e) => setFormData({ ...formData, q29_loan_invested: parseFloat(e.target.value) || "" })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                        />
                      </div>

                      <div>
                        <label htmlFor="q29-bad" className="block text-xs font-semibold text-slate-700 mb-1">
                          छ. खराब ऋण रकम रु. (उठाउन गाह्रो भएको)
                        </label>
                        <input
                          id="q29-bad"
                          type="number"
                          min="0"
                          placeholder="रकम रु..."
                          value={formData.q29_bad_loans}
                          onChange={(e) => setFormData({ ...formData, q29_bad_loans: parseFloat(e.target.value) || "" })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <label className="block text-xs font-bold text-emerald-950 mb-1">
                          ज. उठ्न बाँकी असल ऋण रकम रु. (स्वचालित: ऋण लगानी - खराब ऋण)
                        </label>
                        <input
                          type="number"
                          readOnly
                          value={formData.q29_net_loan_outstanding}
                          className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-2 text-base font-black text-emerald-900 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 7: Institutional & Budget Q30 - Q33 */}
            {activeSection === 7 && (
              <section aria-labelledby="sec7-heading" className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">खण्ड ७</span>
                  <h2 id="sec7-heading" className="text-xl font-bold text-slate-900 mt-1">
                    संस्थागत विकास, बजेट तथा स्वास्थ्य बीमा (Q30 - Q33)
                  </h2>
                </div>

                <div className="space-y-4">
                  <GenderNumberInput
                    id="q30"
                    questionNumber={30}
                    label="OPD (अपाङ्गता भएका व्यक्तिहरुको संस्था) मा आबद्ध जम्मा सदस्य संख्या"
                    value={formData.q30_dpo_members}
                    onChange={(val) => setFormData({ ...formData, q30_dpo_members: val })}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <label htmlFor="q30a" className="text-xs font-bold text-slate-700 block mb-1">
                        ३०(क). OPD ले सञ्चालन गरेको जम्मा बैठक संख्या
                      </label>
                      <input
                        id="q30a"
                        type="number"
                        min="0"
                        value={formData.q30_dpo_meetings_count}
                        onChange={(e) => setFormData({ ...formData, q30_dpo_meetings_count: parseInt(e.target.value, 10) || "" })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <GenderNumberInput
                        id="q30b"
                        questionNumber="30(ख)"
                        label="बैठकमा उपस्थिति भएको जम्मा संख्या"
                        value={formData.q30_dpo_attendance}
                        onChange={(val) => setFormData({ ...formData, q30_dpo_attendance: val })}
                      />
                    </div>
                  </div>

                  {/* Budget Allocation Q31 & Settlement Q32 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <label htmlFor="q31" className="text-xs font-bold text-slate-700 block mb-1">
                        ३१. पालिका भरी अपाङ्गताको क्षेत्रमा विनियोजित रकम रु.
                      </label>
                      <input
                        id="q31"
                        type="number"
                        min="0"
                        placeholder="बजेट रकम रु..."
                        value={formData.q31_budget_allocated}
                        onChange={(e) => setFormData({ ...formData, q31_budget_allocated: parseFloat(e.target.value) || "" })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm mb-2"
                      />
                      <input
                        type="text"
                        placeholder="बजेट सम्बन्धी थप कैफियत..."
                        value={formData.q31_budget_remarks}
                        onChange={(e) => setFormData({ ...formData, q31_budget_remarks: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                      />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <label htmlFor="q32" className="text-xs font-bold text-slate-700 block mb-1">
                        ३२. OPD का लागि अनुदान रकम मध्ये फरफारक भएको रकम रु.
                      </label>
                      <input
                        id="q32"
                        type="number"
                        min="0"
                        placeholder="फरफारक रकम रु..."
                        value={formData.q32_dpo_grant_settled}
                        onChange={(e) => setFormData({ ...formData, q32_dpo_grant_settled: parseFloat(e.target.value) || "" })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm mb-2"
                      />
                      <input
                        type="text"
                        placeholder="फरफारक सम्बन्धी कैफियत..."
                        value={formData.q32_dpo_grant_remarks}
                        onChange={(e) => setFormData({ ...formData, q32_dpo_grant_remarks: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  {/* Health Insurance Q33 */}
                  <GenderNumberInput
                    id="q33a"
                    questionNumber="33(क)"
                    label="निशुल्क स्वास्थ्य बीमामा पहुँच पुगेका पूर्ण अशक्त (रातो कार्ड) व्यक्ति संख्या"
                    value={formData.q33_health_ins_free}
                    onChange={(val) => setFormData({ ...formData, q33_health_ins_free: val })}
                  />

                  <GenderNumberInput
                    id="q33b"
                    questionNumber="33(ख)"
                    label="स्वास्थ्य बीमामा पहुँच पुगेका अति अशक्त, मध्यम र सामान्य व्यक्ति संख्या"
                    value={formData.q33_health_ins_other}
                    onChange={(val) => setFormData({ ...formData, q33_health_ins_other: val })}
                  />
                </div>
              </section>
            )}

            {/* SECTION 8: 10 Disability Types Matrix Q34 */}
            {activeSection === 8 && (
              <section aria-labelledby="sec8-heading" className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">खण्ड ८</span>
                  <h2 id="sec8-heading" className="text-xl font-bold text-slate-900 mt-1">
                    अपाङ्गता वर्गीकरण — १० प्रकारगत विवरण (Q34)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    अपाङ्गता अधिकार ऐन २०७४ अनुसार १० वटै प्रकारगत वर्गीकरणको हालसम्म र यस आ.व. को विवरण
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs border border-slate-200 rounded-lg">
                    <thead className="bg-slate-100 text-slate-800 font-bold">
                      <tr>
                        <th className="p-2.5 text-left">अपाङ्गताको प्रकार</th>
                        <th className="p-2.5 text-center" colSpan={3}>हालसम्म कुल परिचयपत्र (Cumulative)</th>
                        <th className="p-2.5 text-center" colSpan={3}>यस आ.व. मा मात्र वितरण (FY 082/083)</th>
                      </tr>
                      <tr className="bg-slate-200/70 text-slate-700">
                        <th className="p-1 text-left">प्रकारगत नाम</th>
                        <th className="p-1 text-center w-16">महिला</th>
                        <th className="p-1 text-center w-16">पुरुष</th>
                        <th className="p-1 text-center w-16 bg-blue-50">जम्मा</th>
                        <th className="p-1 text-center w-16">महिला</th>
                        <th className="p-1 text-center w-16">पुरुष</th>
                        <th className="p-1 text-center w-16 bg-blue-50">जम्मा</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {DISABILITY_TEN_TYPES.map((dt) => {
                        const cum = formData.q34_cumulative_matrix[dt.id] || { female: "", male: "", total: 0 };
                        const fy = formData.q34_fy_matrix[dt.id] || { female: "", male: "", total: 0 };

                        return (
                          <tr key={dt.id} className="hover:bg-slate-50">
                            <td className="p-2 font-medium text-slate-800">{dt.label}</td>
                            
                            {/* Cumulative F/M/T */}
                            <td className="p-1 text-center">
                              <input
                                type="number"
                                min="0"
                                value={cum.female}
                                onChange={(e) => {
                                  const f = e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0;
                                  const m = typeof cum.male === "number" ? cum.male : 0;
                                  const updated = { ...formData.q34_cumulative_matrix };
                                  updated[dt.id] = { ...cum, female: f, total: (typeof f === "number" ? f : 0) + m };
                                  setFormData({ ...formData, q34_cumulative_matrix: updated });
                                }}
                                className="w-14 border border-slate-300 rounded px-1.5 py-1 text-xs text-center"
                              />
                            </td>
                            <td className="p-1 text-center">
                              <input
                                type="number"
                                min="0"
                                value={cum.male}
                                onChange={(e) => {
                                  const m = e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0;
                                  const f = typeof cum.female === "number" ? cum.female : 0;
                                  const updated = { ...formData.q34_cumulative_matrix };
                                  updated[dt.id] = { ...cum, male: m, total: f + (typeof m === "number" ? m : 0) };
                                  setFormData({ ...formData, q34_cumulative_matrix: updated });
                                }}
                                className="w-14 border border-slate-300 rounded px-1.5 py-1 text-xs text-center"
                              />
                            </td>
                            <td className="p-1 text-center font-bold text-blue-900 bg-blue-50/50">
                              {cum.total}
                            </td>

                            {/* FY F/M/T */}
                            <td className="p-1 text-center">
                              <input
                                type="number"
                                min="0"
                                value={fy.female}
                                onChange={(e) => {
                                  const f = e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0;
                                  const m = typeof fy.male === "number" ? fy.male : 0;
                                  const updated = { ...formData.q34_fy_matrix };
                                  updated[dt.id] = { ...fy, female: f, total: (typeof f === "number" ? f : 0) + m };
                                  setFormData({ ...formData, q34_fy_matrix: updated });
                                }}
                                className="w-14 border border-slate-300 rounded px-1.5 py-1 text-xs text-center"
                              />
                            </td>
                            <td className="p-1 text-center">
                              <input
                                type="number"
                                min="0"
                                value={fy.male}
                                onChange={(e) => {
                                  const m = e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0;
                                  const f = typeof fy.female === "number" ? fy.female : 0;
                                  const updated = { ...formData.q34_fy_matrix };
                                  updated[dt.id] = { ...fy, male: m, total: f + (typeof m === "number" ? m : 0) };
                                  setFormData({ ...formData, q34_fy_matrix: updated });
                                }}
                                className="w-14 border border-slate-300 rounded px-1.5 py-1 text-xs text-center"
                              />
                            </td>
                            <td className="p-1 text-center font-bold text-blue-900 bg-blue-50/50">
                              {fy.total}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <GenderNumberInput
                    id="q34-deceased"
                    questionNumber="34(घ-म)"
                    label="यस आर्थिक वर्षमा मृत्यु भएका जम्मा अपाङ्गता भएका व्यक्तिहरु"
                    value={formData.q34_fy_deceased}
                    onChange={(val) => setFormData({ ...formData, q34_fy_deceased: val })}
                  />
                </div>
              </section>
            )}

            {/* SECTION 9: Card Severity Color Matrix Q35 */}
            {activeSection === 9 && (
              <section aria-labelledby="sec9-heading" className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">खण्ड ९</span>
                  <h2 id="sec9-heading" className="text-xl font-bold text-slate-900 mt-1">
                    अपाङ्गता परिचयपत्र सम्बन्धी विवरण — गाम्भीर्यता / रंग (Q35)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    रातो (पूर्ण), निलो (अति), पहेलो (मध्यम), सेतो (सामान्य) कार्ड अनुसार
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs border border-slate-200 rounded-lg">
                    <thead className="bg-slate-100 text-slate-800 font-bold">
                      <tr>
                        <th className="p-2.5 text-left">परिचयपत्रको रंग तथा गाम्भीर्यता</th>
                        <th className="p-2.5 text-center" colSpan={3}>हालसम्म कुल वितरण (Cumulative)</th>
                        <th className="p-2.5 text-center" colSpan={3}>यस आ.व. मा वितरण (FY 082/083)</th>
                      </tr>
                      <tr className="bg-slate-200/70 text-slate-700">
                        <th className="p-1 text-left">कार्ड वर्ग</th>
                        <th className="p-1 text-center w-16">महिला</th>
                        <th className="p-1 text-center w-16">पुरुष</th>
                        <th className="p-1 text-center w-16 bg-blue-50">जम्मा</th>
                        <th className="p-1 text-center w-16">महिला</th>
                        <th className="p-1 text-center w-16">पुरुष</th>
                        <th className="p-1 text-center w-16 bg-blue-50">जम्मा</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {CARD_COLORS.map((c) => {
                        const cum = formData.q35_cumulative_cards[c.id] || { female: "", male: "", total: 0 };
                        const fy = formData.q35_fy_cards[c.id] || { female: "", male: "", total: 0 };

                        return (
                          <tr key={c.id} className="hover:bg-slate-50">
                            <td className="p-2 font-bold text-slate-800 flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full border ${
                                c.id === "red" ? "bg-red-600 border-red-700" :
                                c.id === "blue" ? "bg-blue-600 border-blue-700" :
                                c.id === "yellow" ? "bg-yellow-400 border-yellow-500" :
                                "bg-slate-100 border-slate-400"
                              }`} />
                              <span>{c.label}</span>
                            </td>

                            {/* Cumulative F/M/T */}
                            <td className="p-1 text-center">
                              <input
                                type="number"
                                min="0"
                                value={cum.female}
                                onChange={(e) => {
                                  const f = e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0;
                                  const m = typeof cum.male === "number" ? cum.male : 0;
                                  const updated = { ...formData.q35_cumulative_cards };
                                  updated[c.id] = { ...cum, female: f, total: (typeof f === "number" ? f : 0) + m };
                                  setFormData({ ...formData, q35_cumulative_cards: updated });
                                }}
                                className="w-14 border border-slate-300 rounded px-1.5 py-1 text-xs text-center"
                              />
                            </td>
                            <td className="p-1 text-center">
                              <input
                                type="number"
                                min="0"
                                value={cum.male}
                                onChange={(e) => {
                                  const m = e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0;
                                  const f = typeof cum.female === "number" ? cum.female : 0;
                                  const updated = { ...formData.q35_cumulative_cards };
                                  updated[c.id] = { ...cum, male: m, total: f + (typeof m === "number" ? m : 0) };
                                  setFormData({ ...formData, q35_cumulative_cards: updated });
                                }}
                                className="w-14 border border-slate-300 rounded px-1.5 py-1 text-xs text-center"
                              />
                            </td>
                            <td className="p-1 text-center font-bold text-blue-900 bg-blue-50/50">
                              {cum.total}
                            </td>

                            {/* FY F/M/T */}
                            <td className="p-1 text-center">
                              <input
                                type="number"
                                min="0"
                                value={fy.female}
                                onChange={(e) => {
                                  const f = e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0;
                                  const m = typeof fy.male === "number" ? fy.male : 0;
                                  const updated = { ...formData.q35_fy_cards };
                                  updated[c.id] = { ...fy, female: f, total: (typeof f === "number" ? f : 0) + m };
                                  setFormData({ ...formData, q35_fy_cards: updated });
                                }}
                                className="w-14 border border-slate-300 rounded px-1.5 py-1 text-xs text-center"
                              />
                            </td>
                            <td className="p-1 text-center">
                              <input
                                type="number"
                                min="0"
                                value={fy.male}
                                onChange={(e) => {
                                  const m = e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0;
                                  const f = typeof fy.female === "number" ? fy.female : 0;
                                  const updated = { ...formData.q35_fy_cards };
                                  updated[c.id] = { ...fy, male: m, total: f + (typeof m === "number" ? m : 0) };
                                  setFormData({ ...formData, q35_fy_cards: updated });
                                }}
                                className="w-14 border border-slate-300 rounded px-1.5 py-1 text-xs text-center"
                              />
                            </td>
                            <td className="p-1 text-center font-bold text-blue-900 bg-blue-50/50">
                              {fy.total}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <GenderNumberInput
                    id="q35-process"
                    questionNumber="35(घ)"
                    label="अपाङ्गता परिचयपत्र बनाउने प्रक्रियामा रहेका व्यक्तिको संख्या"
                    value={formData.q35_card_in_process}
                    onChange={(val) => setFormData({ ...formData, q35_card_in_process: val })}
                  />
                </div>
              </section>
            )}

            {/* SECTION 10: Legal, Circulars & Governance Q36 - Q44 */}
            {activeSection === 10 && (
              <section aria-labelledby="sec10-heading" className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">खण्ड १०</span>
                  <h2 id="sec10-heading" className="text-xl font-bold text-slate-900 mt-1">
                    कानुनी सहायता, नीतिगत परिपत्र तथा कार्यकक्ष प्रबन्ध (Q36 - Q44)
                  </h2>
                </div>

                <div className="space-y-4">
                  <GenderNumberInput
                    id="q36"
                    questionNumber={36}
                    label="हिंसा प्रभावित वा अन्यायमा परेका अपाङ्गता भएका व्यक्तिलाई कानुनी सहायता प्रदान संख्या"
                    value={formData.q36_legal_aid}
                    onChange={(val) => setFormData({ ...formData, q36_legal_aid: val })}
                  />

                  <YesNoRadio
                    id="q37"
                    questionNumber={37}
                    label="पालिकाले अपाङ्गता परिचयपत्र जुनसुकै समयमा वितरण गर्न सुरु गरेको छ वा छैन?"
                    subLabel="परिचयपत्र बनाउन आउँदा तुरुन्तै सेवा उपलब्ध हुने अवस्था"
                    status={formData.q37_instant_id_service.status}
                    remarks={formData.q37_instant_id_service.remarks}
                    onStatusChange={(status) =>
                      setFormData({
                        ...formData,
                        q37_instant_id_service: { ...formData.q37_instant_id_service, status },
                      })
                    }
                    onRemarksChange={(remarks) =>
                      setFormData({
                        ...formData,
                        q37_instant_id_service: { ...formData.q37_instant_id_service, remarks },
                      })
                    }
                  />

                  <YesNoRadio
                    id="q38"
                    questionNumber={38}
                    label="अपाङ्गता सहायता कक्षको आफ्नै टेबल, कुर्सी र कम्प्युटरको व्यवस्था छ वा छैन?"
                    status={formData.q38_desk_setup.status}
                    remarks={formData.q38_desk_setup.remarks}
                    onStatusChange={(status) =>
                      setFormData({
                        ...formData,
                        q38_desk_setup: { ...formData.q38_desk_setup, status },
                      })
                    }
                    onRemarksChange={(remarks) =>
                      setFormData({
                        ...formData,
                        q38_desk_setup: { ...formData.q38_desk_setup, remarks },
                      })
                    }
                  />

                  <YesNoRadio
                    id="q39"
                    questionNumber={39}
                    label="छुट्टै अपाङ्गता सहायता कक्षको लागि कोठा व्यवस्थापन भएको छ वा छैन?"
                    status={formData.q39_dedicated_room.status}
                    remarks={formData.q39_dedicated_room.remarks}
                    onStatusChange={(status) =>
                      setFormData({
                        ...formData,
                        q39_dedicated_room: { ...formData.q39_dedicated_room, status },
                      })
                    }
                    onRemarksChange={(remarks) =>
                      setFormData({
                        ...formData,
                        q39_dedicated_room: { ...formData.q39_dedicated_room, remarks },
                      })
                    }
                  />

                  {/* Q40 Circulars Group */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="bg-blue-900 text-white text-xs px-2 py-0.5 rounded-sm font-bold">40</span>
                      <span>हालसम्म पालिकाले अपाङ्गता सवालमा गरेका परिपत्रहरुको विवरण</span>
                    </span>

                    <YesNoRadio
                      id="q40a"
                      questionNumber="४०(क)"
                      label="निशुल्क शिक्षा बारे परिपत्र गरेको छ वा छैन?"
                      status={formData.q40_circulars.education.status}
                      remarks={formData.q40_circulars.education.remarks}
                      onStatusChange={(st) =>
                        setFormData({
                          ...formData,
                          q40_circulars: {
                            ...formData.q40_circulars,
                            education: { ...formData.q40_circulars.education, status: st },
                          },
                        })
                      }
                      onRemarksChange={(rm) =>
                        setFormData({
                          ...formData,
                          q40_circulars: {
                            ...formData.q40_circulars,
                            education: { ...formData.q40_circulars.education, remarks: rm },
                          },
                        })
                      }
                    />

                    <YesNoRadio
                      id="q40b"
                      questionNumber="४०(ख)"
                      label="स्वास्थ्य बीमामा पहुँच बारे परिपत्र गरेको छ वा छैन?"
                      status={formData.q40_circulars.health_insurance.status}
                      remarks={formData.q40_circulars.health_insurance.remarks}
                      onStatusChange={(st) =>
                        setFormData({
                          ...formData,
                          q40_circulars: {
                            ...formData.q40_circulars,
                            health_insurance: { ...formData.q40_circulars.health_insurance, status: st },
                          },
                        })
                      }
                      onRemarksChange={(rm) =>
                        setFormData({
                          ...formData,
                          q40_circulars: {
                            ...formData.q40_circulars,
                            health_insurance: { ...formData.q40_circulars.health_insurance, remarks: rm },
                          },
                        })
                      }
                    />

                    <YesNoRadio
                      id="q40c"
                      questionNumber="४०(ग)"
                      label="बाल क्लबमा अपाङ्गता भएका बालबालिकाहरुलाई समावेश गराउन परिपत्र गरेको छ?"
                      status={formData.q40_circulars.child_club.status}
                      remarks={formData.q40_circulars.child_club.remarks}
                      onStatusChange={(st) =>
                        setFormData({
                          ...formData,
                          q40_circulars: {
                            ...formData.q40_circulars,
                            child_club: { ...formData.q40_circulars.child_club, status: st },
                          },
                        })
                      }
                      onRemarksChange={(rm) =>
                        setFormData({
                          ...formData,
                          q40_circulars: {
                            ...formData.q40_circulars,
                            child_club: { ...formData.q40_circulars.child_club, remarks: rm },
                          },
                        })
                      }
                    />

                    <YesNoRadio
                      id="q40d"
                      questionNumber="४०(घ)"
                      label="यातायातमा छुटका लागि परिपत्र गरेको छ वा छैन?"
                      status={formData.q40_circulars.transport.status}
                      remarks={formData.q40_circulars.transport.remarks}
                      onStatusChange={(st) =>
                        setFormData({
                          ...formData,
                          q40_circulars: {
                            ...formData.q40_circulars,
                            transport: { ...formData.q40_circulars.transport, status: st },
                          },
                        })
                      }
                      onRemarksChange={(rm) =>
                        setFormData({
                          ...formData,
                          q40_circulars: {
                            ...formData.q40_circulars,
                            transport: { ...formData.q40_circulars.transport, remarks: rm },
                          },
                        })
                      }
                    />

                    <YesNoRadio
                      id="q40e"
                      questionNumber="४०(ङ)"
                      label="पहुँचयुक्त भौतिक संरचना निर्माणको लागि परिपत्र गरेको छ वा छैन?"
                      status={formData.q40_circulars.accessible_infrastructure.status}
                      remarks={formData.q40_circulars.accessible_infrastructure.remarks}
                      onStatusChange={(st) =>
                        setFormData({
                          ...formData,
                          q40_circulars: {
                            ...formData.q40_circulars,
                            accessible_infrastructure: {
                              ...formData.q40_circulars.accessible_infrastructure,
                              status: st,
                            },
                          },
                        })
                      }
                      onRemarksChange={(rm) =>
                        setFormData({
                          ...formData,
                          q40_circulars: {
                            ...formData.q40_circulars,
                            accessible_infrastructure: {
                              ...formData.q40_circulars.accessible_infrastructure,
                              remarks: rm,
                            },
                          },
                        })
                      }
                    />
                  </div>

                  {/* Q41: Fee refund */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                      <span className="bg-blue-900 text-white text-xs px-2 py-0.5 rounded-sm font-bold">41</span>
                      <span>विद्यालयबाट अपाङ्गता भएका बालबालिकाहरुसँग शुल्क फिर्ता गराएको विवरण</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">विद्यालय संख्या</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.q41_fee_refund.schools_count}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              q41_fee_refund: {
                                ...formData.q41_fee_refund,
                                schools_count: parseInt(e.target.value, 10) || "",
                              },
                            })
                          }
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">फिर्ता गराएको रकम रु.</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.q41_fee_refund.refund_amount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              q41_fee_refund: {
                                ...formData.q41_fee_refund,
                                refund_amount: parseFloat(e.target.value) || "",
                              },
                            })
                          }
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">विद्यार्थी संख्या</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.q41_fee_refund.students_count}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              q41_fee_refund: {
                                ...formData.q41_fee_refund,
                                students_count: parseInt(e.target.value, 10) || "",
                              },
                            })
                          }
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Q42: Accessible buildings */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <span className="bg-blue-900 text-white text-xs px-2 py-0.5 rounded-sm font-bold">42</span>
                      <span>पैरवीबाट स्थानीय तहका कति वटा भवनहरुमा र्‍याम्प, शौचालय आदि निर्माण भएको छ?</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">भवन संख्या</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.q42_accessible_buildings.count}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              q42_accessible_buildings: {
                                ...formData.q42_accessible_buildings,
                                count: parseInt(e.target.value, 10) || "",
                              },
                            })
                          }
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-xs font-semibold text-slate-600 block mb-1">विस्तृत विवरण/कैफियत</label>
                        <input
                          type="text"
                          placeholder="कुन कुन भवनमा के कस्ता पहुँचयुक्त संरचना निर्माण भए..."
                          value={formData.q42_accessible_buildings.details}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              q42_accessible_buildings: {
                                ...formData.q42_accessible_buildings,
                                details: e.target.value,
                              },
                            })
                          }
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <YesNoRadio
                    id="q43"
                    questionNumber={43}
                    label="तपाईंले CBRF (पुनर्स्थापना सहजकर्ता) को जिम्मेवारी वहन गर्नु परेको छ वा छैन?"
                    status={formData.q43_cbrf_duty.status}
                    remarks={formData.q43_cbrf_duty.remarks}
                    onStatusChange={(status) =>
                      setFormData({
                        ...formData,
                        q43_cbrf_duty: { ...formData.q43_cbrf_duty, status },
                      })
                    }
                    onRemarksChange={(remarks) =>
                      setFormData({
                        ...formData,
                        q43_cbrf_duty: { ...formData.q43_cbrf_duty, remarks },
                      })
                    }
                  />

                  <YesNoRadio
                    id="q44"
                    questionNumber={44}
                    label="सहजकर्ता बाहेक अन्य जिम्मेवारी दिई सहजकर्ताको जिम्मेवारीमा असर वा प्रभाव पारेको छ?"
                    subLabel="छ भने कुन काममा लगाइएको छ कैफियतमा खुलाउनुहोस्"
                    remarksPlaceholder="कुन काममा लगाइएको छ विवरण..."
                    status={formData.q44_other_duties_impact.status}
                    remarks={formData.q44_other_duties_impact.work_details}
                    onStatusChange={(status) =>
                      setFormData({
                        ...formData,
                        q44_other_duties_impact: { ...formData.q44_other_duties_impact, status },
                      })
                    }
                    onRemarksChange={(work_details) =>
                      setFormData({
                        ...formData,
                        q44_other_duties_impact: { ...formData.q44_other_duties_impact, work_details },
                      })
                    }
                  />
                </div>
              </section>
            )}

            {/* SECTION 11: Annex 1.1 Home Visits */}
            {activeSection === 11 && (
              <section aria-labelledby="sec11-heading" className="space-y-6">
                <HomeVisitTable
                  records={formData.home_visits_records}
                  onChange={(records) => setFormData({ ...formData, home_visits_records: records })}
                />
              </section>
            )}

            {/* SECTION 12: Annex 1.2 Assistive Devices */}
            {activeSection === 12 && (
              <section aria-labelledby="sec12-heading" className="space-y-6">
                <AssistiveDeviceTable
                  records={formData.assistive_device_records}
                  onChange={(records) =>
                    setFormData({ ...formData, assistive_device_records: records })
                  }
                />
              </section>
            )}

            {/* SECTION 13: Final Review & Submit */}
            {activeSection === 13 && (
              <section aria-labelledby="sec13-heading" className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full">खण्ड १३</span>
                  <h2 id="sec13-heading" className="text-xl font-bold text-slate-900 mt-1">
                    समग्र प्रतिवेदन समीक्षा तथा पेश (Final Review & Submission)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    पेश गर्नुअघि सम्पूर्ण तथ्यांक रुजु गर्नुहोस्। पेश गरिसकेपछि प्रतिवेदन आधिकारिक रूपमा दर्ता हुनेछ।
                  </p>
                </div>

                {/* Submitter details */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">प्रतिवेदन भर्ने सहजकर्ताको विवरण:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">सहजकर्ताको पूरा नाम *</label>
                      <input
                        type="text"
                        required
                        placeholder="सहजकर्ताको नाम..."
                        value={formData.submitted_by_name}
                        onChange={(e) => setFormData({ ...formData, submitted_by_name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">सम्पर्क मोबाइल नम्बर *</label>
                      <input
                        type="tel"
                        required
                        placeholder="९८xxxxxxxx..."
                        value={formData.submitted_by_phone}
                        onChange={(e) => setFormData({ ...formData, submitted_by_phone: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Summary Table */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">प्रमुख तथ्यांक सारांश (Quick Summary):</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <span className="text-[11px] text-blue-700 block">परिचयपत्र प्राप्त</span>
                      <span className="text-xl font-bold text-blue-950">{formData.q2_id_cards_issued.total}</span>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <span className="text-[11px] text-emerald-700 block">हाल कायम</span>
                      <span className="text-xl font-bold text-emerald-950">{formData.q9_currently_active.total}</span>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <span className="text-[11px] text-purple-700 block">गृहभेट रेकर्ड</span>
                      <span className="text-xl font-bold text-purple-950">{formData.home_visits_records.length} जना</span>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <span className="text-[11px] text-amber-700 block">सहायक सामग्री</span>
                      <span className="text-xl font-bold text-amber-950">{formData.assistive_device_records.length} थान</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-slate-600" />
                    <span>मस्यौदा सुरक्षित राख्नुहोस्</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitFinal}
                    className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>वार्षिक प्रतिवेदन पेश गर्नुहोस् (Final Submit)</span>
                  </button>
                </div>
              </section>
            )}

            {/* Stepper Navigation Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                disabled={activeSection === 1}
                onClick={() => setActiveSection((s) => Math.max(1, s - 1))}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activeSection === 1
                    ? "text-slate-300 cursor-not-allowed"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>अघिल्लो खण्ड (Previous)</span>
              </button>

              <span className="text-xs font-semibold text-slate-500">
                खण्ड {activeSection} / १३
              </span>

              <button
                type="button"
                disabled={activeSection === 13}
                onClick={() => setActiveSection((s) => Math.min(13, s + 1))}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activeSection === 13
                    ? "text-slate-300 cursor-not-allowed"
                    : "bg-blue-900 hover:bg-blue-800 text-white shadow-xs cursor-pointer"
                }`}
              >
                <span>अर्को खण्ड (Next)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
