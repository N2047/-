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
  ArrowRight,
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
  Trash2,
  Lock,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  LogIn,
  UserPlus,
  LogOut,
  Sparkles,
  KeyRound,
  Edit3,
  Type,
  Settings,
  RotateCcw,
  FilePlus,
  Undo2,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import UnifiedAuthModal from "@/components/auth/UnifiedAuthModal";
import { getFormConfig, DEFAULT_FORM_CONFIG, FormConfig, FormSection, deleteSection } from "@/lib/formConfig";
import FormConfigModal from "@/components/admin/FormConfigModal";

export default function AnnualReportFormPage({
  params,
}: {
  params: Promise<{ palikaId: string }>;
}) {
  const resolvedParams = use(params);
  const palikaId = resolvedParams.palikaId;

  const [lang, setLang] = useState<Language>("ne");
  const [formConfig, setFormConfig] = useState<FormConfig>(DEFAULT_FORM_CONFIG);
  const [activeSection, setActiveSection] = useState<number>(1);
  const [formData, setFormData] = useState<AnnualReportFormData>(() => createInitialFormData(palikaId));
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [reportSubmissionId, setReportSubmissionId] = useState<string>("");

  // Submit confirmation dialog state (Requirements 41-43)
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);

  // Return for correction dialog state (Requirements 45-46)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnNoteInput, setReturnNoteInput] = useState("");

  // Auto-save feedback state (Requirements 38)
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>("");

  const { user, isAuthenticated, canEditPalika, login, register } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signin");
  const [authModalRole, setAuthModalRole] = useState<"normal_user" | "employee">("employee");

  // Super Admin Form Management Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configModalTab, setConfigModalTab] = useState<"title" | "sections" | "add">("title");
  const [adminCorrectionNotes, setAdminCorrectionNotes] = useState("");

  const hasEditAccess = isAuthenticated ? canEditPalika(palikaId) : false;
  const isSuperAdmin = user?.role === "super_admin" || user?.role === "provincial_admin";
  const isEmployee = user?.role === "employee" || user?.role === "palika_staff";
  const isNormalUser = user?.role === "normal_user";

  const SECTIONS = formConfig.sections;

  // Listen to form config updates
  useEffect(() => {
    setFormConfig(getFormConfig());
    const handleConfigUpdate = () => {
      setFormConfig(getFormConfig());
    };
    window.addEventListener("dic_form_config_updated", handleConfigUpdate);
    return () => window.removeEventListener("dic_form_config_updated", handleConfigUpdate);
  }, []);

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

  // Auto-populate submitter info from authenticated user
  useEffect(() => {
    if (user && user.name) {
      setFormData((prev) => ({
        ...prev,
        submitted_by_name: prev.submitted_by_name || user.name,
        submitted_by_phone: prev.submitted_by_phone || user.phone || "",
      }));
    }
  }, [user]);

  // Auto-Save Draft (Requirements 38)
  useEffect(() => {
    if (!isAuthenticated || !hasEditAccess || formData.status === "submitted") return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(`dic_report_${palikaId}_2082_083`, JSON.stringify(formData));
        const now = new Date();
        const timeStr = now.toLocaleTimeString("ne-NP", { hour: "2-digit", minute: "2-digit" });
        setAutoSaveStatus(`स्वचालित मस्यौदा सुरक्षित भयो (${timeStr})`);
      } catch (e) {
        console.error("Auto save failed", e);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [formData, isAuthenticated, hasEditAccess, palikaId]);

  // Save Draft handler (Requirements 37, 39, 40)
  const handleSaveDraft = async () => {
    if (!isAuthenticated) {
      setAuthModalTab("signin");
      setAuthModalRole("employee");
      setIsAuthModalOpen(true);
      return;
    }
    if (!hasEditAccess) {
      setSaveMessage("सुरक्षा प्रतिबन्ध: तपाईंलाई यो पालिकाको प्रतिवेदन सम्पादन गर्ने अधिकार छैन (Read-Only Mode)।");
      setTimeout(() => setSaveMessage(""), 5000);
      return;
    }
    try {
      localStorage.setItem(`dic_report_${palikaId}_2082_083`, JSON.stringify(formData));
      setSaveMessage("प्रतिवेदनको मस्यौदा सफलतापूर्वक सुरक्षित भयो!");
      setTimeout(() => setSaveMessage(""), 4000);

      // Optionally sync to backend report manager
      fetch("/api/reports/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: `rep_${palikaId}_2082`,
          palika_id: palikaId,
          fiscal_year: "2082/083",
          action: "draft",
          user_id: user?.user_id || user?.id || "EMP",
          user_role: user?.role,
          user_name: user?.name,
          summary_data: {
            q2_total: formData.q2_id_cards_issued.total || 0,
            q9_total: formData.q9_currently_active.total || 0,
            home_visits_count: formData.home_visits_records.length || 0,
            assistive_devices_count: formData.assistive_device_records.length || 0,
          },
        }),
      }).catch((err) => console.error(err));
    } catch (e) {
      console.error(e);
      setSaveMessage("मस्यौदा सुरक्षित गर्न सकिएन।");
    }
  };

  // Submit Final handler - Prompts confirmation dialog (Requirements 41)
  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAuthModalTab("signin");
      setAuthModalRole("employee");
      setIsAuthModalOpen(true);
      return;
    }
    if (!hasEditAccess) {
      alert("सुरक्षा प्रतिबन्ध: तपाईंलाई यो पालिकाको प्रतिवेदन पेश गर्ने अधिकार छैन। केवल आफ्नै पालिकाको फारम पेश गर्न सक्नुहुन्छ।");
      return;
    }
    // Open the mandatory confirmation dialog
    setIsConfirmSubmitOpen(true);
  };

  // Execution when "Yes, Submit" is confirmed (Requirements 42-44)
  const executeFinalSubmit = async () => {
    setIsConfirmSubmitOpen(false);
    const submissionId = "DIC-KP-" + Math.floor(100000 + Math.random() * 900000);
    const updated = {
      ...formData,
      status: "submitted" as const,
    };
    setFormData(updated);
    setReportSubmissionId(submissionId);
    setIsSubmitted(true);
    try {
      localStorage.setItem(`dic_report_${palikaId}_2082_083`, JSON.stringify(updated));
      await fetch("/api/reports/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: `rep_${palikaId}_2082`,
          palika_id: palikaId,
          fiscal_year: "2082/083",
          action: "submit",
          user_id: user?.user_id || user?.id || "EMP",
          user_role: user?.role,
          user_name: user?.name,
          summary_data: {
            q2_total: formData.q2_id_cards_issued.total || 0,
            q9_total: formData.q9_currently_active.total || 0,
            home_visits_count: formData.home_visits_records.length || 0,
            assistive_devices_count: formData.assistive_device_records.length || 0,
          },
        }),
      });
    } catch (e) {
      console.error("Submit API error", e);
    }
  };

  // Super Admin Data Correction Handler (गलत डाटा सच्याउने सुविधा)
  const handleSaveAdminCorrection = (newStatus?: AnnualReportFormData["status"]) => {
    const updated: AnnualReportFormData = {
      ...formData,
      status: newStatus || formData.status,
      admin_corrected_at: new Date().toLocaleDateString("ne-NP") + " " + new Date().toLocaleTimeString("ne-NP", { hour: "2-digit", minute: "2-digit" }),
      admin_corrected_by: user?.name || "कोशी प्रदेश मुख्य प्रशासक",
      admin_notes: adminCorrectionNotes || formData.admin_notes,
    };
    setFormData(updated);
    try {
      localStorage.setItem(`dic_report_${palikaId}_2082_083`, JSON.stringify(updated));
      setSaveMessage("मुख्य प्रशासकद्वारा डाटा सफलतापूर्वक संशोधन तथा सुरक्षित भयो!");
      setTimeout(() => setSaveMessage(""), 5000);
    } catch (e) {
      console.error(e);
      setSaveMessage("डाटा सुरक्षित गर्न सकिएन।");
    }
  };

  // Super Admin Return for Correction (Requirements 45-46)
  const executeReturnForCorrection = async (note: string) => {
    setIsReturnModalOpen(false);
    const updated: AnnualReportFormData = {
      ...formData,
      status: "returned_for_correction" as const,
      admin_notes: note,
      admin_corrected_at: new Date().toLocaleDateString("ne-NP") + " " + new Date().toLocaleTimeString("ne-NP", { hour: "2-digit", minute: "2-digit" }),
      admin_corrected_by: user?.name || "कोशी प्रदेश मुख्य प्रशासक",
    };
    setFormData(updated);
    try {
      localStorage.setItem(`dic_report_${palikaId}_2082_083`, JSON.stringify(updated));
      await fetch("/api/reports/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: `rep_${palikaId}_2082`,
          palika_id: palikaId,
          fiscal_year: "2082/083",
          action: "return_for_correction",
          admin_notes: note,
          user_id: user?.user_id || user?.id || "SUPER_ADMIN",
          user_role: user?.role,
          user_name: user?.name,
        }),
      });
      setSaveMessage("प्रतिवेदन सफलतापूर्वक सच्याउन फिर्ता पठाइयो (Returned for Correction)!");
      setTimeout(() => setSaveMessage(""), 5000);
    } catch (e) {
      console.error("Return for correction error", e);
    }
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
        <Header lang={lang} onLanguageChange={setLang} />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
          <div className="bg-slate-950/95 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-10 text-white shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Top decorative glow */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header: Title and Palika Details */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-slate-800 pb-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 block">
                    डाटा सुरक्षा प्रमाणीकरण (Security Gate)
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    {palikaInfo.name_ne} ({palikaInfo.type})
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-200">
                  {districtInfo.name_ne} जिल्ला, कोशी प्रदेश
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400 text-slate-950">
                  आ.व. २०८२/०८३
                </span>
              </div>
            </div>

            {/* Explanation why security is required */}
            <div className="bg-blue-950/70 border border-blue-800/60 rounded-2xl p-5 sm:p-6 mb-6 space-y-3 relative z-10">
              <div className="flex items-start gap-3.5">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-slate-200 space-y-2.5">
                  <h2 className="font-bold text-white text-base sm:text-lg">
                    अपाङ्गता वार्षिक प्रतिवेदन फारम भर्न आधिकारिक लगइन आवश्यक
                  </h2>
                  <p className="leading-relaxed text-slate-300">
                    स्थानीय तहका अपाङ्गता भएका नागरिकहरूको तथ्याङ्क, परिचयपत्र वितरण तथा बजेट विवरण संवेदनशील, व्यक्तिगत तथा कानुनी रूपमा आधिकारिक दस्तावेज भएकाले अनाधिकृत प्रविष्टि रोक्न सेक्युरिटी प्रणाली लागू गरिएको छ।
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                      <span className="font-bold text-amber-300 block mb-1">
                        👤 पालिका कर्मचारी (Staff):
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        प्रत्येक पालिकाको छुट्टाछुट्टै User ID (Gmail) र पासवर्ड हुनेछ। सम्बन्धित पालिकाको कर्मचारीले मात्र उक्त पालिकाको फारम भर्न, सम्पादन गर्न र पेश गर्न सक्नुहुनेछ।
                      </p>
                    </div>

                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                      <span className="font-bold text-sky-300 block mb-1">
                        🛡️ कोशी प्रदेश मुख्य प्रशासक:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        सामाजिक विकास मन्त्रालय / मुख्य प्रशासक (Super Admin) लाई प्रदेशका सबै १३७ वटै स्थानीय तहको विवरण निरीक्षण, समीक्षा र स्वीकृत गर्ने पूर्ण अधिकार रहनेछ।
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 relative z-10">
              <button
                type="button"
                onClick={() => {
                  setAuthModalTab("signin");
                  setAuthModalRole("employee");
                  setIsAuthModalOpen(true);
                }}
                className="py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-amber-400/20 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <LogIn className="w-5 h-5" />
                <span>🔐 कर्मचारी / प्रशासक लगइन (Sign In)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthModalTab("signup");
                  setAuthModalRole("employee");
                  setIsAuthModalOpen(true);
                }}
                className="py-3.5 px-6 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 border border-blue-600/50 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <UserPlus className="w-5 h-5 text-amber-300" />
                <span>नयाँ कर्मचारी खाता दर्ता (Sign Up)</span>
              </button>
            </div>

            {/* One-Click Quick Evaluation Access for testing */}
            <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 mb-6 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  द्रुत परीक्षण लगइन (Quick Evaluation Access):
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => login("admin@dic.gov.np", "admin123")}
                  className="p-3 rounded-xl bg-blue-950/80 hover:bg-blue-900/80 border border-blue-700/60 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-amber-300">
                      🛡️ Super Admin
                    </span>
                    <span className="text-[10px] bg-blue-800 text-blue-200 px-1.5 py-0.5 rounded font-mono">
                      Universal
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    सबै १३७ पालिकाको पूर्ण पहुँच
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => login("phidim.staff@gmail.com", "phidim123")}
                  className="p-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/60 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                      🏛️ फिदिम कर्मचारी
                    </span>
                    <span className="text-[10px] bg-emerald-900 text-emerald-200 px-1.5 py-0.5 rounded font-mono">
                      Approved
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    आफ्नो पालिकाको प्रतिवेदन पहुँच
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => login("citizen@example.com", "citizen123")}
                  className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/60 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-amber-300">
                      👤 सामान्य नागरिक
                    </span>
                    <span className="text-[10px] bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded font-mono">
                      Normal
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    सार्वजनिक सुविधाहरू (Read Only)
                  </p>
                </button>
              </div>
            </div>

            {/* Public profile and back buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs relative z-10">
              <Link
                href="/local-reporting"
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>स्थानीय तह सूचीमा फर्कनुहोस्</span>
              </Link>

              <Link
                href={`/local-reporting/palika/${palikaId}/profile`}
                className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 underline font-semibold"
              >
                <Building2 className="w-4 h-4" />
                <span>लगइन नगरी सार्वजनिक पालिका प्रोफाइल मात्र हेर्नुहोस्</span>
              </Link>
            </div>
          </div>
        </main>

        <Footer lang={lang} />

        <UnifiedAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialTab={authModalTab}
          initialRole={authModalRole}
        />
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
                <div className="flex items-center gap-2 mt-0.5">
                  <h1 className="text-xl sm:text-2xl font-black">
                    {palikaInfo.name_ne} — {formConfig.mainTitle}
                  </h1>
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setConfigModalTab("title");
                        setIsConfigModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                      title="फारमको मुख्य नाम / शीर्षक सम्पादन गर्नुहोस्"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-blue-200">
                  {formConfig.subtitle} | आर्थिक वर्ष: <strong>{formConfig.fiscalYear}</strong>
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

              {isSuperAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setConfigModalTab("add");
                      setIsConfigModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold border border-purple-500/50 transition-all shadow-xs cursor-pointer"
                    title="नयाँ फारम वा खण्ड थप गर्नुहोस्"
                  >
                    <Plus className="w-4 h-4" />
                    <span>फारम थप</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setConfigModalTab("title");
                      setIsConfigModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-800 hover:bg-blue-700 text-amber-300 text-xs font-bold border border-amber-400/40 transition-all shadow-xs cursor-pointer"
                    title="फारमको नाम सम्पादन गर्नुहोस्"
                  >
                    <Type className="w-4 h-4" />
                    <span>नाम सम्पादन</span>
                  </button>
                </>
              )}

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

      {/* AUTHENTICATED USER SECURITY STATUS RIBBON */}
      {user && (
        <div className={`border-b text-xs py-2.5 px-4 sm:px-6 lg:px-8 shadow-xs ${
          isSuperAdmin 
            ? "bg-blue-950 text-blue-100 border-blue-800" 
            : hasEditAccess 
            ? "bg-emerald-950 text-emerald-100 border-emerald-800" 
            : "bg-amber-950 text-amber-100 border-amber-800"
        }`}>
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isSuperAdmin ? (
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              ) : hasEditAccess ? (
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              )}

              <div>
                {isSuperAdmin ? (
                  <span>
                    <strong>🛡️ कोशी प्रदेश मुख्य प्रशासक (Super Admin):</strong> {user.name} ({user.email}) | तपाईंलाई प्रदेशका सबै १३७ स्थानीय तहको प्रतिवेदन निरीक्षण, परिमार्जन तथा प्रमाणिकरण गर्ने अधिकार छ।
                  </span>
                ) : hasEditAccess ? (
                  <span>
                    <strong>✅ अधिकृत पालिका कर्मचारी:</strong> {user.name} ({palikaInfo.name_ne}) | प्रतिवेदन प्रविष्टि तथा मस्यौदा सुरक्षित गर्ने प्रमाणीकरण सक्रिय छ।
                  </span>
                ) : (
                  <span>
                    <strong>⚠️ पहुँच प्रतिबन्ध (हेर्न मात्र मिल्ने - Read Only):</strong> तपाईं <strong>{user.palikaName || user.palikaId}</strong> को कर्मचारी हुनुहुन्छ। सुरक्षा नीति अनुसार तपाईंले अर्को पालिका (<strong>{palikaInfo.name_ne}</strong>) को विवरण सम्पादन वा पेश गर्न पाउनुहुन्न।
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!hasEditAccess && user.palikaId && (
                <Link
                  href={`/local-reporting/palika/${user.palikaId}`}
                  className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-md font-bold text-[11px] flex items-center gap-1 shadow-xs"
                >
                  <span>मेरो पालिकाको फारममा जानुहोस्</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                isSuperAdmin 
                  ? "bg-amber-400 text-slate-950" 
                  : hasEditAccess 
                  ? "bg-emerald-400 text-slate-950" 
                  : "bg-amber-500/30 text-amber-200 border border-amber-500/40"
              }`}>
                {isSuperAdmin ? "सुपर प्रशासक" : hasEditAccess ? "अधिकृत युजर" : "पहुँच सीमित"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUPER ADMIN DATA CORRECTION CONTROL BAR (कर्मचारीले गलत भरेको खण्डमा डाटा सच्याउने) */}
      {isSuperAdmin && (
        <div className="bg-linear-to-r from-amber-500/15 via-blue-500/10 to-indigo-500/15 border-b-2 border-amber-500 px-4 sm:px-6 lg:px-8 py-3 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-bold">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-900 bg-amber-200/80 border border-amber-400/80 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    सुपर प्रशासक डाटा सच्याउने मोड (Data Correction Mode)
                  </span>
                  {formData.admin_corrected_at && (
                    <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold border border-emerald-300">
                      अन्तिम संशोधन: {formData.admin_corrected_at}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 mt-0.5">
                  कर्मचारीले कुनै तथ्याङ्क गलत भरेको खण्डमा तपाईंले सोझै फिल्डहरूमा सच्याएर <strong>&lsquo;सच्याइएको डाटा सेभ&rsquo;</strong> गर्न सक्नुहुन्छ।
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfigModalTab("title");
                  setIsConfigModalOpen(true);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="फारमको मुख्य नाम वा शीर्षक परिवर्तन गर्नुहोस्"
              >
                <Type className="w-3.5 h-3.5 text-blue-700" />
                <span>फारमको नाम सम्पादन</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfigModalTab("add");
                  setIsConfigModalOpen(true);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="नयाँ फारम वा खण्ड थप गर्नुहोस्"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>फारम थप</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfigModalTab("sections");
                  setIsConfigModalOpen(true);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-purple-800 border border-purple-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="खण्डहरू हटाउने वा नाम सच्याउने"
              >
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <span>खण्ड व्यवस्थापन</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setReturnNoteInput(formData.admin_notes || "");
                  setIsReturnModalOpen(true);
                }}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                title="प्रतिवेदन कर्मचारीलाई सच्याउन फिर्ता पठाउनुहोस्"
              >
                <Undo2 className="w-4 h-4" />
                <span>सच्याउन फिर्ता (Return for Correction)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveAdminCorrection()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md cursor-pointer transition-all transform hover:-translate-y-0.5"
                title="सच्याइएको सम्पूर्ण डाटा सुरक्षित गर्नुहोस्"
              >
                <Save className="w-4 h-4" />
                <span>सच्याइएको डाटा सेभ गर्नुहोस्</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTO-SAVE STATUS FEEDBACK (Requirements 38) */}
      {autoSaveStatus && (
        <div className="bg-slate-900 text-emerald-300 border-b border-slate-800 px-4 py-1 text-right text-[11px] font-medium flex items-center justify-end gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{autoSaveStatus}</span>
        </div>
      )}

      {/* RETURNED FOR CORRECTION URGENT NOTICE (Requirements 45-46) */}
      {formData.status === "returned_for_correction" && (
        <div className="bg-amber-400 border-b-2 border-amber-600 px-4 sm:px-6 lg:px-8 py-3.5 text-slate-950 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-slate-950 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-2 py-0.5 rounded">
                  ⚠️ सच्याउन फिर्ता पठाइएको प्रतिवेदन (Returned for Correction)
                </span>
                <p className="text-xs font-bold text-slate-900 mt-1">
                  <strong>सुपर प्रशासकको सुझाव/कैफियत:</strong> &ldquo;{formData.admin_notes || "कृपया आवश्यक विवरणहरू पुनः जाँच गरी सच्याउनुहोस्।"}&rdquo;
                </p>
                <p className="text-[11px] text-slate-800">
                  कृपया फारमका सम्बन्धित फिल्डहरू सच्याएर मस्यौदा सुरक्षित गर्नुहोस् वा पुनः Submit गर्नुहोस्।
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                💾 सच्याइएको ड्राफ्ट सेभ
              </button>
              <button
                type="button"
                onClick={handleSubmitFinal}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-black shadow-xs cursor-pointer"
              >
                📤 पुनः Submit गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMITTED STATUS NOTICE & LOCK (Requirements 44) */}
      {formData.status === "submitted" && (
        <div className="bg-emerald-950 text-emerald-100 border-b-2 border-emerald-500 px-4 sm:px-6 lg:px-8 py-3 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                  🔒 प्रतिवेदन अन्तिम रूपमा पेश भएको छ (Submitted & Locked)
                </span>
                <p className="text-xs text-emerald-200">
                  यो प्रतिवेदन समीक्षाको पर्खाइमा छ। सामान्य कर्मचारीका लागि थप सम्पादन लक गरिएको छ।
                </p>
              </div>
            </div>
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => {
                  setReturnNoteInput(formData.admin_notes || "");
                  setIsReturnModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-xs cursor-pointer"
              >
                सच्याउन फिर्ता पठाउनुहोस्
              </button>
            )}
          </div>
        </div>
      )}

      {/* SUBMIT CONFIRMATION MODAL (Requirements 41-43) */}
      {isConfirmSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-4 border-amber-500 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white text-center">
              वार्षिक प्रतिवेदन अन्तिम Submit पुष्टि
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 text-center leading-relaxed">
              के तपाईं यो वार्षिक प्रतिवेदन अन्तिम रूपमा Submit गर्न चाहनुहुन्छ? Submit गरेपछि सामान्य कर्मचारीले यसलाई सम्पादन गर्न पाउने छैन।
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={executeFinalSubmit}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md transition-all cursor-pointer"
              >
                Yes, Submit (अन्तिम रूपमा पेश गर्नुहोस्)
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmSubmitOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition-all cursor-pointer"
              >
                No, Keep as Draft (मस्यौदा मै राख्नुहोस्)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPER ADMIN RETURN FOR CORRECTION MODAL (Requirements 45) */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-4 border-amber-500 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
              <Undo2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white text-center">
              प्रतिवेदन सच्याउन फिर्ता पठाउनुहोस्
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 text-center">
              कर्मचारीलाई कुन तथ्याङ्क वा बुँदा सच्याउनुपर्ने हो, सुझाव वा सुधारको कैफियत (Correction Note) लेख्नुहोस्:
            </p>
            <textarea
              rows={4}
              value={returnNoteInput}
              onChange={(e) => setReturnNoteInput(e.target.value)}
              placeholder="उदाहरण: Question 12 को महिला/पुरुष संख्या पुनः जाँच गर्नुहोस्..."
              className="w-full mt-4 p-3 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-400"
            />
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => executeReturnForCorrection(returnNoteInput)}
                disabled={!returnNoteInput.trim()}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
              >
                फिर्ता पठाउनुहोस् (Confirm Return)
              </button>
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                रद्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout: Left Stepper Sidebar + Right Active Section Content */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 lg:pb-8 focus:outline-hidden">
        
        {/* MOBILE SECTION SELECTOR & PROGRESS (block lg:hidden) */}
        <div className="block lg:hidden bg-white rounded-xl p-3 border border-slate-200 shadow-xs mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-blue-900 truncate">
              खण्ड {activeSection}/१३: {SECTIONS.find((s) => s.id === activeSection)?.title}
            </span>
            <span className="text-[11px] font-bold text-slate-500 shrink-0 ml-2">
              {Math.round((activeSection / 13) * 100)}% पूरा
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2.5">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${(activeSection / 13) * 100}%` }}
            />
          </div>
          {/* Dropdown selector */}
          <div className="flex items-center gap-2">
            <select
              aria-label="प्रतिवेदन खण्ड छान्नुहोस्"
              value={activeSection}
              onChange={(e) => setActiveSection(Number(e.target.value))}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 min-h-[42px]"
            >
              {SECTIONS.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.title} ({sec.short})
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={activeSection === 1}
              onClick={() => setActiveSection((s) => Math.max(1, s - 1))}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-40 min-h-[42px] flex items-center justify-center cursor-pointer"
              title="अघिल्लो खण्ड"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={activeSection === 13}
              onClick={() => setActiveSection((s) => Math.min(13, s + 1))}
              className="px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg disabled:opacity-40 min-h-[42px] flex items-center justify-center cursor-pointer"
              title="अर्को खण्ड"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* DESKTOP SECTION STEPPER SIDEBAR (hidden lg:block) */}
          <aside className="hidden lg:block lg:col-span-1 bg-white rounded-2xl p-4 border border-slate-200 shadow-xs sticky top-24">
            <div className="flex items-center justify-between mb-3 px-2">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                प्रतिवेदन खण्डहरू ({SECTIONS.length})
              </h2>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setConfigModalTab("add");
                    setIsConfigModalOpen(true);
                  }}
                  className="p-1 text-emerald-700 hover:text-emerald-900 rounded-md hover:bg-emerald-50 cursor-pointer"
                  title="नयाँ खण्ड थप्नुहोस्"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            <nav aria-label="फारम खण्ड नेभिगेसन" className="space-y-1">
              {SECTIONS.map((sec) => (
                <div key={sec.id} className="relative group/sec">
                  <button
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
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

                  {/* Super Admin quick edit hover shortcut */}
                  {isSuperAdmin && (
                    <div className="absolute right-1 top-1 hidden group-hover/sec:flex items-center gap-0.5 bg-slate-900/90 rounded-md p-0.5 text-white shadow-sm z-20">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfigModalTab("sections");
                          setIsConfigModalOpen(true);
                        }}
                        className="p-1 hover:text-amber-400 cursor-pointer"
                        title="यस खण्डको नाम सम्पादन गर्नुहोस्"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Super Admin Side Tools */}
            {isSuperAdmin && (
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                  प्रशासक फारम औजार:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setConfigModalTab("add");
                    setIsConfigModalOpen(true);
                  }}
                  className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>नयाँ फारम खण्ड थप्नुहोस्</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfigModalTab("sections");
                    setIsConfigModalOpen(true);
                  }}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>खण्डहरूको नाम सम्पादन / हटाउने</span>
                </button>
              </div>
            )}
          </aside>

          {/* ACTIVE SECTION FORM CONTENT */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-3.5 sm:p-6 lg:p-8 border border-slate-200 shadow-xs">
            
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

                  <div className="block lg:hidden text-[11px] text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
                    👉 मोबाइलमा तालिका दायाँ-बायाँ सारेर (Swipe) भर्नुहोस्
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-[640px] w-full text-xs border border-slate-200 bg-white rounded-lg">
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

                  <div className="block lg:hidden text-[11px] text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
                    👉 मोबाइलमा तालिका दायाँ-बायाँ सारेर (Swipe) भर्नुहोस्
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-[640px] w-full text-xs border border-slate-200 bg-white rounded-lg">
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

                <div className="block lg:hidden text-[11px] text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
                  👉 मोबाइलमा तालिका दायाँ-बायाँ सारेर (Swipe) भर्नुहोस्
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-[680px] w-full text-xs border border-slate-200 rounded-lg">
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

                <div className="block lg:hidden text-[11px] text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
                  👉 मोबाइलमा तालिका दायाँ-बायाँ सारेर (Swipe) भर्नुहोस्
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-[680px] w-full text-xs border border-slate-200 rounded-lg">
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
                    {user && (
                      <div className="col-span-1 sm:col-span-2 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <span>प्रमाणीकरण युजर: <strong>{user.name}</strong> ({user.email})</span>
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isSuperAdmin 
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : hasEditAccess 
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-red-100 text-red-900 border border-red-300"
                        }`}>
                          {isSuperAdmin ? "सुपर प्रशासक प्रमाणिकरण" : hasEditAccess ? "अधिकृत पालिका कर्मचारी" : "पहुँच सीमित (सम्पादन नमिल्ने)"}
                        </span>
                      </div>
                    )}
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

                {!hasEditAccess && (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>
                      <strong>सुरक्षा प्रतिबन्ध:</strong> तपाईं {user?.palikaName || "अन्य पालिका"} को कर्मचारी हुनुभएकाले यो पालिकाको प्रतिवेदन मस्यौदा सेभ वा पेश गर्न पाउनुहुन्न (हेर्न मात्र मिल्ने मोड)।
                    </span>
                  </div>
                )}

                {formData.status === "submitted" && !isSuperAdmin ? (
                  <div className="pt-4 p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-950 font-bold text-xs sm:text-sm flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      <span>यो प्रतिवेदन अन्तिम रूपमा Submit भइसकेको छ (समीक्षाको पर्खाइमा)। सामान्य कर्मचारीका लागि थप सम्पादन बन्द गरिएको छ।</span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={!hasEditAccess}
                      className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                        hasEditAccess 
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer" 
                          : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                      }`}
                    >
                      <Save className="w-4 h-4 text-slate-600" />
                      <span>मस्यौदा सुरक्षित राख्नुहोस्</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmitFinal}
                      disabled={!hasEditAccess}
                      className={`w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        hasEditAccess 
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 cursor-pointer transform hover:-translate-y-0.5" 
                          : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {formData.status === "returned_for_correction" 
                          ? "सच्याएर पुनः पेश गर्नुहोस् (Submit Again)" 
                          : "वार्षिक प्रतिवेदन पेश गर्नुहोस् (Final Submit)"}
                      </span>
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* DYNAMIC CUSTOM SECTIONS (मुख्य प्रशासकद्वारा थप गरिएको फारम खण्ड) */}
            {SECTIONS.find((s) => s.id === activeSection)?.isCustom && (
              <section aria-labelledby={`sec-custom-${activeSection}`} className="space-y-6">
                {(() => {
                  const currentCustomSec = SECTIONS.find((s) => s.id === activeSection);
                  if (!currentCustomSec) return null;
                  return (
                    <>
                      <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-full">
                            सुपर प्रशासकद्वारा थप गरिएको फारम खण्ड
                          </span>
                          <h2 id={`sec-custom-${activeSection}`} className="text-xl font-bold text-slate-900 mt-1">
                            {currentCustomSec.title}
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {currentCustomSec.desc}
                          </p>
                        </div>

                        {isSuperAdmin && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setConfigModalTab("sections");
                                setIsConfigModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-bold border border-blue-200 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>खण्डको नाम सच्याउनुहोस्</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`के तपाईं निश्चित हुनुहुन्छ? "${currentCustomSec.title}" खण्ड हटाइनेछ।`)) {
                                  deleteSection(currentCustomSec.id);
                                  setActiveSection(1);
                                }
                              }}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold border border-red-200 flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>यो खण्ड हटाउनुहोस्</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Custom Section Form Content */}
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            १. मुख्य विवरण वा प्रगति प्रतिवेदन
                          </label>
                          <textarea
                            rows={4}
                            value={formData.custom_sections_data?.[`sec_${activeSection}_text`] || ""}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                custom_sections_data: {
                                  ...(formData.custom_sections_data || {}),
                                  [`sec_${activeSection}_text`]: e.target.value,
                                },
                              });
                            }}
                            placeholder="यस खण्डको विस्तृत विवरण, प्रगति वा तथ्याङ्क यहाँ प्रविष्टि गर्नुहोस्..."
                            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              २. संख्यात्मक नतिजा / लाभान्वित संख्या
                            </label>
                            <input
                              type="number"
                              value={formData.custom_sections_data?.[`sec_${activeSection}_number`] || ""}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  custom_sections_data: {
                                    ...(formData.custom_sections_data || {}),
                                    [`sec_${activeSection}_number`]: e.target.value,
                                  },
                                });
                              }}
                              placeholder="०"
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              ३. कैफियत वा विशेष टिप्पणी
                            </label>
                            <input
                              type="text"
                              value={formData.custom_sections_data?.[`sec_${activeSection}_remarks`] || ""}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  custom_sections_data: {
                                    ...(formData.custom_sections_data || {}),
                                    [`sec_${activeSection}_remarks`]: e.target.value,
                                  },
                                });
                              }}
                              placeholder="कैफियत..."
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[11px] text-slate-500">
                          * यो खण्ड मुख्य प्रशासकद्वारा थप गरिएको नयाँ फारम हो।
                        </span>
                        <button
                          type="button"
                          onClick={handleSaveDraft}
                          className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>यस खण्डको डाटा सेभ गर्नुहोस्</span>
                        </button>
                      </div>
                    </>
                  );
                })()}
              </section>
            )}

            {/* Stepper Navigation Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                disabled={activeSection === SECTIONS[0]?.id}
                onClick={() => {
                  const currentIdx = SECTIONS.findIndex((s) => s.id === activeSection);
                  if (currentIdx > 0) {
                    setActiveSection(SECTIONS[currentIdx - 1].id);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activeSection === SECTIONS[0]?.id
                    ? "text-slate-300 cursor-not-allowed"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>अघिल्लो खण्ड (Previous)</span>
              </button>

              <span className="text-xs font-semibold text-slate-500">
                खण्ड {SECTIONS.findIndex((s) => s.id === activeSection) + 1} / {SECTIONS.length}
              </span>

              <button
                type="button"
                disabled={activeSection === SECTIONS[SECTIONS.length - 1]?.id}
                onClick={() => {
                  const currentIdx = SECTIONS.findIndex((s) => s.id === activeSection);
                  if (currentIdx !== -1 && currentIdx < SECTIONS.length - 1) {
                    setActiveSection(SECTIONS[currentIdx + 1].id);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activeSection === SECTIONS[SECTIONS.length - 1]?.id
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

      {/* MOBILE STICKY BOTTOM BAR (block lg:hidden) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-300 px-3 py-2.5 shadow-2xl flex items-center justify-between gap-2 lg:hidden">
        <button
          type="button"
          disabled={activeSection === SECTIONS[0]?.id}
          onClick={() => {
            const currentIdx = SECTIONS.findIndex((s) => s.id === activeSection);
            if (currentIdx > 0) {
              setActiveSection(SECTIONS[currentIdx - 1].id);
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }
          }}
          className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold disabled:opacity-30 flex items-center gap-1 min-h-[42px] cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>अघिल्लो</span>
        </button>

        <button
          type="button"
          onClick={handleSaveDraft}
          className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs min-h-[42px] cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>मस्यौदा सेभ</span>
        </button>

        {activeSection !== SECTIONS[SECTIONS.length - 1]?.id ? (
          <button
            type="button"
            onClick={() => {
              const currentIdx = SECTIONS.findIndex((s) => s.id === activeSection);
              if (currentIdx !== -1 && currentIdx < SECTIONS.length - 1) {
                setActiveSection(SECTIONS[currentIdx + 1].id);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }
            }}
            className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 min-h-[42px] cursor-pointer shadow-xs"
          >
            <span>अर्को खण्ड</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : formData.status === "submitted" && !isSuperAdmin ? (
          <span className="px-3.5 py-2 bg-emerald-900 text-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            <span>पेश भइसकेको</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleSubmitFinal}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md min-h-[42px] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{formData.status === "returned_for_correction" ? "पुनः पेश" : "सबमिट"}</span>
          </button>
        )}
      </div>

      {/* SUPER ADMIN FORM MANAGEMENT MODAL */}
      <FormConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        adminName={user?.name || "कोशी प्रदेश मुख्य प्रशासक"}
        initialTab={configModalTab}
      />

      <Footer lang={lang} />
    </div>
  );
}
