"use client";

import React, { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import { translations, Language } from "@/lib/translations";
import { 
  BarChart3, 
  PieChart, 
  Home, 
  PackageCheck, 
  Users, 
  GitCompare, 
  Download, 
  Printer, 
  Filter, 
  Table as TableIcon,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Building2,
  MapPin,
  HelpCircle
} from "lucide-react";

type ReportSubject = 'overall' | 'home_visits' | 'assistive_devices' | 'demographics' | 'comparison';

export default function ReportsPage() {
  const [lang, setLang] = useState<Language>("ne");
  const [activeSubject, setActiveSubject] = useState<ReportSubject>("overall");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("all");
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("2082_083");
  const [viewTableMode, setViewTableMode] = useState<boolean>(false);

  // Palika Comparison state
  const [comparisonPalikas, setComparisonPalikas] = useState<string[]>(["phidim_mun", "falelung_rm", "falgunanda_rm"]);

  const t = translations[lang];

  // Subject-wise Tab configuration
  const subjectTabs = [
    { id: 'overall', label: '१. समग्र प्रतिवेदन', icon: BarChart3, desc: 'कोशी प्रदेशको समग्र तथ्यांक तथा स्थिति' },
    { id: 'home_visits', label: '२. गृहभेट तथ्यांक', icon: Home, desc: 'सहजकर्ताद्वारा गरिएको घरमै भेट सम्बन्धी' },
    { id: 'assistive_devices', label: '३. सहायक सामग्री', icon: PackageCheck, desc: 'ह्वीलचेयर, सेतो छडी, श्रवण यन्त्र वितरण' },
    { id: 'demographics', label: '४. लैङ्गिक तथा प्रकारगत', icon: Users, desc: '१० प्रकारका अपाङ्गता तथा कार्ड रंग' },
    { id: 'comparison', label: '५. स्थानीय तहगत तुलना', icon: GitCompare, desc: 'पालिकाहरूबीच तुलनात्मक विश्लेषण' },
  ];

  // Mock aggregated dataset based on actual reporting indicators
  const overallStats = {
    totalIdentified: 32450,
    femaleIdentified: 14602,
    maleIdentified: 17848,
    activeBeneficiaries: 29840,
    deceased: 1420,
    migratedOut: 1190,
    totalHomeVisits: 8420,
    totalAssistiveDistributed: 2940,
    totalEnrolledStudents: 4120,
    totalScholarshipReceived: 3680,
    totalShgMembers: 6850,
    totalSeedCapitalNPR: "४,८५,००,०००",
  };

  const homeVisitsBySeverity = [
    { label: "रातो (पूर्ण अशक्त)", female: 1420, male: 1680, total: 3100, pct: 36.8 },
    { label: "निलो (अति अशक्त)", female: 1250, male: 1530, total: 2780, pct: 33.0 },
    { label: "पहेलो (मध्यम)", female: 890, male: 1020, total: 1910, pct: 22.7 },
    { label: "सेतो (सामान्य)", female: 280, male: 350, total: 630, pct: 7.5 },
  ];

  const assistiveDevicesData = [
    { name: "ह्वीलचेयर (Wheelchair)", count: 780, female: 360, male: 420 },
    { name: "सेतो छडी (White Cane)", count: 620, female: 290, male: 330 },
    { name: "बैशाखी (Crutches)", count: 480, female: 210, male: 270 },
    { name: "श्रवण यन्त्र (Hearing Aid)", count: 430, female: 200, male: 230 },
    { name: "कमोड कुर्सी (Commode Chair)", count: 290, female: 140, male: 150 },
    { name: "ट्राइसाइकल (Tricycle)", count: 190, female: 70, male: 120 },
    { name: "अन्य सहायक सामग्री", count: 150, female: 65, male: 85 },
  ];

  const disabilityTypesData = [
    { type: "शारीरिक अपाङ्गता", count: 11240, pct: 34.6 },
    { type: "दृष्टि सम्बन्धी (न्यून दृष्टि/बिहीनता)", count: 6420, pct: 19.8 },
    { type: "सुनाइ सम्बन्धी (सुस्तश्रवण/बहिरा)", count: 5180, pct: 16.0 },
    { type: "मानसिक तथा मनोसामाजिक", count: 2840, pct: 8.8 },
    { type: "बौद्धिक अपाङ्गता", count: 2350, pct: 7.2 },
    { type: "स्वर र बोलाइ सम्बन्धी", count: 1420, pct: 4.4 },
    { type: "बहु-अपाङ्गता", count: 1380, pct: 4.3 },
    { type: "हेमोफिलिया", count: 640, pct: 2.0 },
    { type: "अटिज्म", count: 520, pct: 1.6 },
    { type: "श्रवण-दृष्टिबिहीन", count: 460, pct: 1.4 },
  ];

  const samplePalikaComparisons = [
    { id: "phidim_mun", name: "फिदिम न.पा.", district: "पाँचथर", identified: 840, homeVisits: 320, assistive: 115, budget: "१५,००,०००" },
    { id: "falelung_rm", name: "फालेलुङ गा.पा.", district: "पाँचथर", identified: 520, homeVisits: 210, assistive: 78, budget: "१०,००,०००" },
    { id: "falgunanda_rm", name: "फाल्गुनन्द गा.पा.", district: "पाँचथर", identified: 490, homeVisits: 185, assistive: 64, budget: "८,५०,०००" },
    { id: "biratnagar_met", name: "विराटनगर म.न.पा.", district: "मोरङ", identified: 2840, homeVisits: 890, assistive: 380, budget: "४५,००,०००" },
    { id: "dharan_submet", name: "धरान उप.म.न.पा.", district: "सुनसरी", identified: 1950, homeVisits: 640, assistive: 240, budget: "३२,००,०००" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header lang={lang} onLanguageChange={setLang} />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-hidden">
        
        {/* Page Hero Header with Export Options */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-900 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-purple-200">
                <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
                विषयगत तथ्यांक तथा विश्लेषण केन्द्र
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                अपाङ्गता सम्बन्धी विषयगत रिपोर्ट (Analytics & Reports)
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-3xl leading-relaxed">
                कोशी प्रदेशका १३७ स्थानीय तहबाट प्राप्त तथ्यांकको विषयगत छुट्टाछुट्टै विश्लेषण। यहाँ समग्र प्रतिवेदन, गृहभेट, सहायक सामग्री, लैङ्गिक विवरण र पालिका तुलनात्मक चार्टहरू उपलब्ध छन्।
              </p>
            </div>

            {/* Export Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => alert("कोशी प्रदेश वार्षिक समग्र प्रतिवेदन (Excel ढाँचा) डाउनलोड सुरु भयो।")}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel रिपोर्ट डाउनलोड</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>PDF / छाप्नुहोस्</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Filter Bar */}
        <section aria-labelledby="report-filter-heading" className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-6">
          <h2 id="report-filter-heading" className="sr-only">रिपोर्ट फिल्टरहरू</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            
            {/* District Filter */}
            <div>
              <label htmlFor="report-district" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                जिल्ला छनौट
              </label>
              <select
                id="report-district"
                value={selectedDistrictId}
                onChange={(e) => setSelectedDistrictId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">कोशी प्रदेश समग्र (१४ वटै जिल्ला)</option>
                {KOSHI_DISTRICTS.map((d, i) => (
                  <option key={d.id} value={d.id}>
                    {i + 1}. {d.name_ne} जिल्ला ({d.local_governments.length} स्थानीय तह)
                  </option>
                ))}
              </select>
            </div>

            {/* Fiscal Year Filter */}
            <div>
              <label htmlFor="report-fy" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                आर्थिक वर्ष
              </label>
              <select
                id="report-fy"
                value={selectedFiscalYear}
                onChange={(e) => setSelectedFiscalYear(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
              >
                <option value="2082_083">२०८२/०८३ (हालको आ.व.)</option>
                <option value="2081_082">२०८१/०८२ (अघिल्लो आ.व.)</option>
              </select>
            </div>

            {/* Accessible Table View Toggle */}
            <div className="flex sm:justify-end items-end pt-4 sm:pt-0">
              <button
                type="button"
                onClick={() => setViewTableMode(!viewTableMode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                  viewTableMode
                    ? "bg-blue-900 text-white border-blue-900 shadow-xs"
                    : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                }`}
                aria-pressed={viewTableMode}
              >
                <TableIcon className="w-4 h-4" />
                <span>{viewTableMode ? "चार्ट दृश्यमा फर्कनुहोस्" : "पहुँचयुक्त डाटा तालिका (Table View)"}</span>
              </button>
            </div>

          </div>
        </section>

        {/* Subject-Wise Tabs Bar (5 Distinct Subjects) */}
        <nav aria-label="विषयगत रिपोर्टहरू" className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
          {subjectTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubject === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubject(tab.id as ReportSubject)}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isActive
                    ? "bg-blue-900 text-white border-blue-900 shadow-md transform -translate-y-0.5"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                  {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold block leading-tight">{tab.label}</span>
                  <span className={`text-[10px] block mt-0.5 line-clamp-1 ${isActive ? "text-blue-200" : "text-slate-400"}`}>
                    {tab.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* ------------------------------------------------------------- */}
        {/* SUBJECT 1: OVERALL PROVINCE REPORT */}
        {/* ------------------------------------------------------------- */}
        {activeSubject === "overall" && (
          <section aria-labelledby="overall-heading" className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                <div>
                  <h2 id="overall-heading" className="text-xl font-bold text-slate-900">
                    कोशी प्रदेश अपाङ्गता समग्र वार्षिक प्रतिवेदन सारांश
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    १४ जिल्लाका १३७ वटै स्थानीय तहबाट संकलित प्रमुख परिसूचकहरूको एकीकृत स्थिति
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  आ.व. २०८२/०८३
                </span>
              </div>

              {/* Top Macro Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
                  <span className="text-xs text-slate-600 font-semibold block">कुल पहिचान संख्या</span>
                  <span className="text-2xl font-black text-blue-900">{overallStats.totalIdentified.toLocaleString("ne-NP")}</span>
                  <span className="text-[11px] text-slate-500 block mt-1">महिला: {overallStats.femaleIdentified} | पुरुष: {overallStats.maleIdentified}</span>
                </div>
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
                  <span className="text-xs text-slate-600 font-semibold block">हाल कायम लाभग्राही</span>
                  <span className="text-2xl font-black text-emerald-900">{overallStats.activeBeneficiaries.toLocaleString("ne-NP")}</span>
                  <span className="text-[11px] text-slate-500 block mt-1">मृत्यु/बसाइँसराइ कट्टा पश्चात</span>
                </div>
                <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4">
                  <span className="text-xs text-slate-600 font-semibold block">कुल गृहभेट गरिएको</span>
                  <span className="text-2xl font-black text-purple-900">{overallStats.totalHomeVisits.toLocaleString("ne-NP")} जना</span>
                  <span className="text-[11px] text-slate-500 block mt-1">सहजकर्ताहरूद्वारा सेवा प्रवाह</span>
                </div>
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
                  <span className="text-xs text-slate-600 font-semibold block">सहायक सामग्री वितरण</span>
                  <span className="text-2xl font-black text-amber-900">{overallStats.totalAssistiveDistributed.toLocaleString("ne-NP")} थान</span>
                  <span className="text-[11px] text-slate-500 block mt-1">ह्वीलचेयर, सेतो छडी आदि</span>
                </div>
              </div>

              {/* Accessible Interactive Visuals / Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Visual Chart: Gender Breakdown */}
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                    <span>लैङ्गिक वितरण (Gender Disaggregation)</span>
                    <span className="text-xs text-slate-500 font-normal">कुल: ३२,४५० जना</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-rose-700">महिला (Female)</span>
                        <span>१४,६०२ जना (४५%)</span>
                      </div>
                      <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-600 rounded-full" style={{ width: "45%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-blue-700">पुरुष (Male)</span>
                        <span>१७,८४८ जना (५५%)</span>
                      </div>
                      <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-700 rounded-full" style={{ width: "55%" }} />
                      </div>
                    </div>
                  </div>

                  {/* Equivalent Table for Accessibility */}
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <table className="w-full text-xs text-left border border-slate-200 bg-white rounded-lg">
                      <caption className="sr-only">लैङ्गिक वितरण तथ्यांक</caption>
                      <thead className="bg-slate-100 text-slate-800 font-bold">
                        <tr>
                          <th scope="col" className="p-2">लिङ्ग</th>
                          <th scope="col" className="p-2 text-right">संख्या</th>
                          <th scope="col" className="p-2 text-right">प्रतिशत</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="p-2">महिला</td>
                          <td className="p-2 text-right">१४,६०२</td>
                          <td className="p-2 text-right">४५%</td>
                        </tr>
                        <tr>
                          <td className="p-2">पुरुष</td>
                          <td className="p-2 text-right">१७,८४८</td>
                          <td className="p-2 text-right">५५%</td>
                        </tr>
                        <tr className="font-bold bg-slate-50">
                          <td className="p-2">जम्मा</td>
                          <td className="p-2 text-right">३२,४५०</td>
                          <td className="p-2 text-right">१००%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Macro Financial & Group Insights */}
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">
                    मिलिजुली समूह, बचत तथा शिक्षा परिसूचक
                  </h3>

                  <ul className="space-y-3 text-xs">
                    <li className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-700">मिलिजुली समूहमा आबद्ध सदस्य संख्या:</span>
                      <span className="font-bold text-slate-900">{overallStats.totalShgMembers} जना</span>
                    </li>
                    <li className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-700">समूहमा परिचालित कुल बिउपुँजी तथा बचत:</span>
                      <span className="font-bold text-emerald-700">रु. {overallStats.totalSeedCapitalNPR}</span>
                    </li>
                    <li className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-700">विद्यालयमा अध्ययनरत अपाङ्गता भएका बालबालिका:</span>
                      <span className="font-bold text-slate-900">{overallStats.totalEnrolledStudents} जना</span>
                    </li>
                    <li className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-700">छात्रवृत्ति प्राप्त बालबालिका संख्या:</span>
                      <span className="font-bold text-blue-900">{overallStats.totalScholarshipReceived} जना (८९%)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUBJECT 2: HOME VISITS REPORT */}
        {/* ------------------------------------------------------------- */}
        {activeSubject === "home_visits" && (
          <section aria-labelledby="home-visits-heading" className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                <div>
                  <h2 id="home-visits-heading" className="text-xl font-bold text-slate-900">
                    गृहभेट सम्बन्धी तथ्यांक तथा विश्लेषण (Home Visits Analytics)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    अनुसूची १.१ को तथ्यांक अनुसार गाम्भीर्यता, लिङ्ग र सेवा प्रवाहको अवस्था
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-900 bg-purple-100 px-3 py-1 rounded-full">
                  कुल गृहभेट: ८,४२० जना
                </span>
              </div>

              {/* Accessible Data Table for Home Visits */}
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full text-xs border border-slate-200 rounded-lg">
                  <caption className="text-left font-bold text-slate-800 p-2 bg-slate-100 border-b border-slate-200">
                    तालिका २.१: परिचयपत्रको गाम्भीर्यता अनुसार गृहभेट विवरण
                  </caption>
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th scope="col" className="p-3 text-left">गाम्भीर्यता / परिचयपत्र रंग</th>
                      <th scope="col" className="p-3 text-right">महिला</th>
                      <th scope="col" className="p-3 text-right">पुरुष</th>
                      <th scope="col" className="p-3 text-right">जम्मा संख्या</th>
                      <th scope="col" className="p-3 text-right">प्रतिशत भार</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {homeVisitsBySeverity.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{row.label}</td>
                        <td className="p-3 text-right font-mono">{row.female}</td>
                        <td className="p-3 text-right font-mono">{row.male}</td>
                        <td className="p-3 text-right font-bold text-blue-900 font-mono">{row.total}</td>
                        <td className="p-3 text-right font-mono">{row.pct}%</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-bold text-slate-900">
                      <td className="p-3">कुल जम्मा</td>
                      <td className="p-3 text-right font-mono">३,८४०</td>
                      <td className="p-3 text-right font-mono">४,५८०</td>
                      <td className="p-3 text-right font-mono text-blue-900">८,४२०</td>
                      <td className="p-3 text-right font-mono">१००%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Visual Bars for Home Visits */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-4">गाम्भीर्यता अनुसार गृहभेट तुलनात्मक चार्ट</h3>
                <div className="space-y-3">
                  {homeVisitsBySeverity.map((row, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                        <span>{row.label}</span>
                        <span>{row.total} जना ({row.pct}%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-700 rounded-full" 
                          style={{ width: `${row.pct}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUBJECT 3: ASSISTIVE DEVICES REPORT */}
        {/* ------------------------------------------------------------- */}
        {activeSubject === "assistive_devices" && (
          <section aria-labelledby="devices-heading" className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                <div>
                  <h2 id="devices-heading" className="text-xl font-bold text-slate-900">
                    सहायक सामग्री वितरण सम्बन्धी तथ्यांक (Assistive Devices Analytics)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    अनुसूची १.२ को तथ्यांक अनुसार वितरण गरिएका सामग्रीहरूको वर्गीकरण
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-900 bg-blue-100 px-3 py-1 rounded-full">
                  कुल वितरण: २,९४० थान
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Horizontal Column Chart */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">
                    सामग्रीको नाम अनुसार वितरण संख्या (Bar Chart)
                  </h3>
                  <div className="space-y-3">
                    {assistiveDevicesData.map((d, i) => {
                      const pct = Math.round((d.count / 780) * 100);
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                            <span>{d.name}</span>
                            <span className="font-bold text-slate-900">{d.count} थान</span>
                          </div>
                          <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden flex">
                            <div 
                              className="h-full bg-blue-700 rounded-full" 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Accessible Data Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs border border-slate-200 rounded-lg">
                    <caption className="text-left font-bold text-slate-800 p-2.5 bg-slate-100 border-b border-slate-200">
                      तालिका ३.१: सहायक सामग्रीको प्रकार र लैङ्गिक वितरण
                    </caption>
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th scope="col" className="p-2.5 text-left">सामग्रीको नाम</th>
                        <th scope="col" className="p-2.5 text-right">महिला</th>
                        <th scope="col" className="p-2.5 text-right">पुरुष</th>
                        <th scope="col" className="p-2.5 text-right">जम्मा वितरण</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {assistiveDevicesData.map((d, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2.5 font-semibold text-slate-800">{d.name}</td>
                          <td className="p-2.5 text-right font-mono">{d.female}</td>
                          <td className="p-2.5 text-right font-mono">{d.male}</td>
                          <td className="p-2.5 text-right font-bold text-blue-900 font-mono">{d.count}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold text-slate-900">
                        <td className="p-2.5">जम्मा</td>
                        <td className="p-2.5 text-right font-mono">१,३६५</td>
                        <td className="p-2.5 text-right font-mono">१,५७५</td>
                        <td className="p-2.5 text-right font-mono text-blue-900">२,९४०</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUBJECT 4: DEMOGRAPHICS & 10 TYPES REPORT */}
        {/* ------------------------------------------------------------- */}
        {activeSubject === "demographics" && (
          <section aria-labelledby="types-heading" className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                <div>
                  <h2 id="types-heading" className="text-xl font-bold text-slate-900">
                    १० प्रकारगत अपाङ्गता तथा लैङ्गिक विवरण (Classification Matrix)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    अपाङ्गता अधिकार ऐन २०७४ अनुसार कोशी प्रदेशको कुल पहिचान वर्गीकरण
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full">
                  कुल: ३२,४५० जना
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-xs border border-slate-200 rounded-lg">
                  <caption className="text-left font-bold text-slate-800 p-2.5 bg-slate-100 border-b border-slate-200">
                    तालिका ४.१: अपाङ्गताका १० प्रकार अनुसार लाभग्राही संख्या र प्रतिशत
                  </caption>
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th scope="col" className="p-3 text-center w-12">क्र.सं.</th>
                      <th scope="col" className="p-3 text-left">अपाङ्गताको प्रकारगत वर्गीकरण</th>
                      <th scope="col" className="p-3 text-right">कुल लाभग्राही संख्या</th>
                      <th scope="col" className="p-3 text-right">प्रतिशत भार</th>
                      <th scope="col" className="p-3 text-left w-48">तुलनात्मक रेखा</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {disabilityTypesData.map((d, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3 text-center text-slate-400 font-bold">{i + 1}</td>
                        <td className="p-3 font-semibold text-slate-900">{d.type}</td>
                        <td className="p-3 text-right font-bold text-blue-900 font-mono">{d.count.toLocaleString("ne-NP")}</td>
                        <td className="p-3 text-right font-mono">{d.pct}%</td>
                        <td className="p-3">
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-700 rounded-full" style={{ width: `${d.pct * 2.5}%` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUBJECT 5: LOCAL GOVERNMENT COMPARISON TOOL */}
        {/* ------------------------------------------------------------- */}
        {activeSubject === "comparison" && (
          <section aria-labelledby="comparison-heading" className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                <div>
                  <h2 id="comparison-heading" className="text-xl font-bold text-slate-900">
                    स्थानीय तहगत तुलनात्मक विश्लेषण (Local Government Comparison)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    २ वा सोभन्दा बढी स्थानीय तहहरू छानेर प्रमुख सूचकहरूको तुलना गर्नुहोस् (उदा. फिदिम vs फालेलुङ vs फाल्गुनन्द)
                  </p>
                </div>
              </div>

              {/* Comparison Selector Chips */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  तुलनाका लागि स्थानीय तहहरू थप्नुहोस् वा हटाउनुहोस्:
                </span>
                <div className="flex flex-wrap gap-2">
                  {samplePalikaComparisons.map((p) => {
                    const isSelected = comparisonPalikas.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (comparisonPalikas.length > 1) {
                              setComparisonPalikas(comparisonPalikas.filter((id) => id !== p.id));
                            }
                          } else {
                            setComparisonPalikas([...comparisonPalikas, p.id]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-blue-900 text-white shadow-xs"
                            : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? "text-amber-400" : "opacity-30"}`} />
                        <span>{p.name} ({p.district})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comparison Data Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs border border-slate-200 rounded-lg">
                  <caption className="text-left font-bold text-slate-800 p-2.5 bg-slate-100 border-b border-slate-200">
                    तालिका ५.१: छानिएका स्थानीय तहहरूको सूचक तुलना
                  </caption>
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th scope="col" className="p-3 text-left">स्थानीय तह</th>
                      <th scope="col" className="p-3 text-left">जिल्ला</th>
                      <th scope="col" className="p-3 text-right">पहिचान भएको अपाङ्गता</th>
                      <th scope="col" className="p-3 text-right">गृहभेट संख्या</th>
                      <th scope="col" className="p-3 text-right">सहायक सामग्री वितरण</th>
                      <th scope="col" className="p-3 text-right">अपाङ्गता बजेट रु.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {samplePalikaComparisons
                      .filter((p) => comparisonPalikas.includes(p.id))
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-blue-900">{p.name}</td>
                          <td className="p-3 text-slate-600">{p.district}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">{p.identified}</td>
                          <td className="p-3 text-right font-mono text-purple-700 font-bold">{p.homeVisits}</td>
                          <td className="p-3 text-right font-mono text-amber-700 font-bold">{p.assistive}</td>
                          <td className="p-3 text-right font-mono text-emerald-700 font-bold">रु. {p.budget}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

            </div>
          </section>
        )}

      </main>

      <Footer lang={lang} />
    </div>
  );
}
