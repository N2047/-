"use client";

import React, { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import { translations, Language } from "@/lib/translations";
import { 
  Lock, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Eye, 
  RotateCcw, 
  Printer, 
  Download, 
  Search, 
  Filter, 
  Scale, 
  Newspaper,
  UserCheck,
  History,
  FileCheck2,
  X,
  Edit3,
  Plus,
  Settings,
  Type,
  PhoneCall
} from "lucide-react";
import Link from "next/link";
import FormConfigModal from "@/components/admin/FormConfigModal";
import AdminContactManager from "@/components/admin/AdminContactManager";

interface ReportReviewItem {
  palikaId: string;
  palikaName: string;
  districtName: string;
  fiscalYear: string;
  status: 'submitted' | 'under_review' | 'approved' | 'returned_for_correction' | 'pending';
  submissionDate?: string;
  submitterName?: string;
  identifiedPwd?: number;
  homeVisits?: number;
  assistiveDevices?: number;
}

export default function AdminPage() {
  const [lang, setLang] = useState<Language>("ne");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Simulated authenticated reviewer state
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeReviewItem, setActiveReviewItem] = useState<ReportReviewItem | null>(null);
  const [feedbackNote, setFeedbackNote] = useState<string>("");

  // Main Dashboard Tab: reports review or contact management
  const [activeAdminTab, setActiveAdminTab] = useState<"reports" | "contacts">("reports");

  // Form Config Modal state for Super Admin
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configModalTab, setConfigModalTab] = useState<"title" | "sections" | "add">("title");

  // Seed sample statuses across 137 palikas
  const [reportsList, setReportsList] = useState<ReportReviewItem[]>(() => {
    const list: ReportReviewItem[] = [];
    let idx = 0;
    KOSHI_DISTRICTS.forEach((d) => {
      d.local_governments.forEach((p) => {
        idx++;
        let st: ReportReviewItem['status'] = 'pending';
        let subDate: string | undefined = undefined;
        let submitter: string | undefined = undefined;
        let identified = 0;
        let hv = 0;
        let ad = 0;

        if (idx % 3 === 0) {
          st = 'submitted';
          subDate = "२०८२/०५/१२";
          submitter = "सहजकर्ता रामबहादुर राई";
          identified = 450 + (idx * 5);
          hv = 120 + (idx * 2);
          ad = 45 + idx;
        } else if (idx % 5 === 0) {
          st = 'approved';
          subDate = "२०८२/०५/०८";
          submitter = "सहजकर्ता सीता लिम्बु";
          identified = 620 + (idx * 4);
          hv = 210 + idx;
          ad = 70 + idx;
        } else if (idx === 7) {
          st = 'returned_for_correction';
          subDate = "२०८२/०५/१०";
          submitter = "सहजकर्ता हरि श्रेष्ठ";
          identified = 310;
          hv = 60;
          ad = 15;
        }

        list.push({
          palikaId: p.id,
          palikaName: p.name_ne,
          districtName: d.name_ne,
          fiscalYear: "२०८२/०८३",
          status: st,
          submissionDate: subDate,
          submitterName: submitter,
          identifiedPwd: identified,
          homeVisits: hv,
          assistiveDevices: ad,
        });
      });
    });
    return list;
  });

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reportsList.filter((r) => {
      const matchesDistrict = districtFilter === "all" || r.districtName === districtFilter;
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        r.palikaName.toLowerCase().includes(q) ||
        r.districtName.toLowerCase().includes(q);
      return matchesDistrict && matchesStatus && matchesSearch;
    });
  }, [reportsList, districtFilter, statusFilter, searchQuery]);

  // Handle Approve
  const handleApprove = (item: ReportReviewItem) => {
    const updated = reportsList.map((r) => 
      r.palikaId === item.palikaId ? { ...r, status: 'approved' as const } : r
    );
    setReportsList(updated);
    setActiveReviewItem(null);
    alert(`${item.palikaName} को वार्षिक प्रतिवेदन स्वीकृत (Approved) भयो।`);
  };

  // Handle Return
  const handleReturn = (item: ReportReviewItem) => {
    if (!feedbackNote.trim()) {
      alert("कृपया सच्याउन पठाउनुको कारण वा कैफियत लेख्नुहोस्।");
      return;
    }
    const updated = reportsList.map((r) => 
      r.palikaId === item.palikaId ? { ...r, status: 'returned_for_correction' as const } : r
    );
    setReportsList(updated);
    setActiveReviewItem(null);
    setFeedbackNote("");
    alert(`${item.palikaName} को प्रतिवेदन संशोधनका लागि फिर्ता पठाइयो।`);
  };

  const totalSubmitted = reportsList.filter((r) => r.status === 'submitted' || r.status === 'approved').length;
  const totalApproved = reportsList.filter((r) => r.status === 'approved').length;
  const totalReturned = reportsList.filter((r) => r.status === 'returned_for_correction').length;
  const totalPending = reportsList.filter((r) => r.status === 'pending').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header lang={lang} onLanguageChange={setLang} />

      {/* REVIEW & APPROVAL DRAWER / MODAL */}
      {activeReviewItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-300 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  प्रतिवेदन समीक्षा (Review)
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {activeReviewItem.palikaName} ({activeReviewItem.districtName} जिल्ला)
                </h2>
                <p className="text-xs text-slate-500">आ.व. २०८२/०८३ वार्षिक कार्यसम्पादन प्रतिवेदन</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveReviewItem(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">पेश गर्ने सहजकर्ता:</span>
                  <span className="font-bold text-slate-900">{activeReviewItem.submitterName || "तोकिएको"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">पेश मिति:</span>
                  <span className="font-bold text-slate-900">{activeReviewItem.submissionDate || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">पहिचान अपाङ्गता:</span>
                  <span className="font-bold text-blue-900">{activeReviewItem.identifiedPwd || 0} जना</span>
                </div>
                <div>
                  <span className="text-slate-500 block">गृहभेट सम्पन्न:</span>
                  <span className="font-bold text-purple-900">{activeReviewItem.homeVisits || 0} जना</span>
                </div>
                <div>
                  <span className="text-slate-500 block">सहायक सामग्री:</span>
                  <span className="font-bold text-amber-900">{activeReviewItem.assistiveDevices || 0} थान</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  समीक्षकको कैफियत वा संशोधन निर्देशन (Feedback Note):
                </label>
                <textarea
                  rows={3}
                  placeholder="कुनै त्रुटि भए सच्याउनका लागि यहाँ स्पष्ट निर्देशन लेख्नुहोस्..."
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Link
                  href={`/local-reporting/palika/${activeReviewItem.palikaId}`}
                  target="_blank"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold flex items-center gap-1.5 shadow-xs text-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>फारमको डाटा सच्याउनुहोस् (Edit & Correct Data)</span>
                </Link>

                <Link
                  href={`/local-reporting/palika/${activeReviewItem.palikaId}`}
                  target="_blank"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center gap-1.5 text-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>फारमको पूर्ण विवरण हेर्नुहोस्</span>
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleReturn(activeReviewItem)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>सच्याउन फिर्ता पठाउनुहोस् (Return)</span>
              </button>

              <button
                type="button"
                onClick={() => handleApprove(activeReviewItem)}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>प्रतिवेदन स्वीकृत गर्नुहोस् (Approve)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-hidden">
        
        {/* Admin Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-300">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                प्रशासकीय तथा समीक्षा पोर्टल (Admin & Reviewer Portal)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              कोशी प्रदेश अपाङ्गता सूचना केन्द्र - प्रशासकीय ड्यासबोर्ड
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              स्थानीय तहहरूको प्रतिवेदन अनुगमन, फारम सम्पादन, तथा प्रदेश र स्थानीय तहको सम्पर्क व्यवस्थापन।
            </p>
          </div>

          {activeAdminTab === "reports" && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfigModalTab("title");
                  setIsConfigModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="फारमको मुख्य नाम सम्पादन गर्नुहोस्"
              >
                <Type className="w-3.5 h-3.5 text-amber-300" />
                <span>फारमको नाम सम्पादन</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfigModalTab("add");
                  setIsConfigModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="नयाँ फारम वा खण्ड थप गर्नुहोस्"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>फारम थप (Add Form)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfigModalTab("sections");
                  setIsConfigModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-purple-800 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="खण्डहरूको नाम सच्याउने वा हटाउने"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>खण्ड व्यवस्थापन</span>
              </button>

              <button
                type="button"
                onClick={() => alert("डाटाबेसको पूर्ण तथ्यांक सुरक्षित रूपमा ब्याकअप भयो।")}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          )}
        </div>

        {/* Top-Level Admin Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveAdminTab("reports")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all ${
              activeAdminTab === "reports"
                ? "bg-blue-900 text-white shadow-md ring-2 ring-blue-700/50"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>१३७ स्थानीय तह प्रतिवेदन समीक्षा</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
              activeAdminTab === "reports" ? "bg-blue-800 text-blue-100" : "bg-slate-100 text-slate-700"
            }`}>
              १३७
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab("contacts")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all ${
              activeAdminTab === "contacts"
                ? "bg-blue-900 text-white shadow-md ring-2 ring-blue-700/50"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
            }`}
          >
            <PhoneCall className={`w-4 h-4 ${activeAdminTab === "contacts" ? "text-emerald-300" : "text-emerald-600"}`} />
            <span>सम्पर्क व्यवस्थापन (Contact Management)</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
              नयाँ
            </span>
          </button>
        </div>

        {/* Tab 1: Reports Dashboard */}
        {activeAdminTab === "reports" && (
          <>
            {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">कुल स्थानीय तह</span>
            <span className="text-3xl font-black text-blue-950">१३७</span>
            <span className="text-[11px] text-blue-600 block mt-1">कोशी प्रदेशका १४ जिल्ला</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">प्रतिवेदन पेश भएका</span>
            <span className="text-3xl font-black text-emerald-800">{totalSubmitted}</span>
            <span className="text-[11px] text-emerald-600 block mt-1">{totalApproved} स्वीकृत</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">सच्याउन पठाइएका</span>
            <span className="text-3xl font-black text-amber-700">{totalReturned}</span>
            <span className="text-[11px] text-amber-600 block mt-1">पुनरावलोकन आवश्यक</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-300 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">प्रविष्टि बाँकी</span>
            <span className="text-3xl font-black text-slate-700">{totalPending}</span>
            <span className="text-[11px] text-slate-500 block mt-1">प्रतिवेदन संकलन चरणमा</span>
          </div>
        </div>

        {/* Section 44: REPORT STATUS DASHBOARD TABLE */}
        <section aria-labelledby="status-table-heading" className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <h2 id="status-table-heading" className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-700" />
                <span>१३७ स्थानीय तहको प्रतिवेदन स्थिति तालिका</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                रंग र आइकन दुवैको प्रयोग गरी पहुँचयुक्त बनाइएको स्थिति सूची
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
              >
                <option value="all">सबै जिल्ला (१४ जिल्ला)</option>
                {KOSHI_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.name_ne}>{d.name_ne}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
              >
                <option value="all">सबै स्थिति (All Status)</option>
                <option value="submitted">पेश भएको (Submitted)</option>
                <option value="approved">स्वीकृत (Approved)</option>
                <option value="returned_for_correction">सच्याउन फिर्ता (Returned)</option>
                <option value="pending">पेश हुन बाँकी (Pending)</option>
              </select>

              <input
                type="search"
                placeholder="पालिका खोज्नुहोस्..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 w-44"
              />
            </div>
          </div>

          {/* Accessible Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 text-slate-800 font-bold">
                <tr>
                  <th scope="col" className="p-3 text-center w-12">क्र.सं.</th>
                  <th scope="col" className="p-3 text-left">जिल्ला</th>
                  <th scope="col" className="p-3 text-left">स्थानीय तह</th>
                  <th scope="col" className="p-3 text-center">आर्थिक वर्ष</th>
                  <th scope="col" className="p-3 text-center">स्थिति (Status)</th>
                  <th scope="col" className="p-3 text-center">पेश मिति</th>
                  <th scope="col" className="p-3 text-center w-36">कार्य (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredReports.map((row, idx) => (
                  <tr key={row.palikaId} className="hover:bg-slate-50">
                    <td className="p-3 text-center font-semibold text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-700">{row.districtName}</td>
                    <td className="p-3 font-bold text-slate-900">{row.palikaName}</td>
                    <td className="p-3 text-center font-mono">{row.fiscalYear}</td>
                    
                    {/* Status Badge with Icon + Text */}
                    <td className="p-3 text-center">
                      {row.status === "approved" && (
                        <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>स्वीकृत</span>
                        </span>
                      )}
                      {row.status === "submitted" && (
                        <span className="inline-flex items-center gap-1 text-blue-800 bg-blue-100 px-2.5 py-1 rounded-full font-bold">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>पेश भएको (समीक्षाधीन)</span>
                        </span>
                      )}
                      {row.status === "returned_for_correction" && (
                        <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>सच्याउन फिर्ता</span>
                        </span>
                      )}
                      {row.status === "pending" && (
                        <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full font-semibold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>पेश हुन बाँकी</span>
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center text-slate-600 font-mono">
                      {row.submissionDate || "—"}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/local-reporting/palika/${row.palikaId}`}
                          className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded text-[11px] font-bold flex items-center gap-1 shadow-xs"
                          title="डाटा सच्याउनुहोस् वा सम्पादन गर्नुहोस्"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>सच्याउनुहोस्</span>
                        </Link>

                        {row.status !== "pending" && (
                          <button
                            type="button"
                            onClick={() => setActiveReviewItem(row)}
                            className="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>समीक्षा</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        </>
      )}

      {/* Tab 2: Contact Directory Management */}
      {activeAdminTab === "contacts" && (
        <AdminContactManager />
      )}

      </main>

      <FormConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        adminName="कोशी प्रदेश मुख्य प्रशासक"
        initialTab={configModalTab}
      />

      <Footer lang={lang} />
    </div>
  );
}
