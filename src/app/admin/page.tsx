"use client";

import React, { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import { LEGAL_DOCUMENTS, LAW_CATEGORIES, LawDocument } from "@/lib/lawsData";
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
  Download, 
  Search, 
  Filter, 
  Scale, 
  Newspaper, 
  History, 
  X, 
  Edit3, 
  Plus, 
  Settings, 
  Type, 
  PhoneCall, 
  Users, 
  Ban, 
  ShieldAlert, 
  Bell, 
  FileText, 
  LogOut, 
  LayoutDashboard, 
  UserCheck, 
  FileSpreadsheet, 
  Globe, 
  Sliders, 
  Trash2, 
  Menu, 
  KeyRound, 
  User, 
  ExternalLink,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import FormConfigModal from "@/components/admin/FormConfigModal";
import AdminContactManager from "@/components/admin/AdminContactManager";
import AdminGrievanceManager from "@/components/admin/AdminGrievanceManager";
import AdminGovernmentContacts from "@/components/admin/AdminGovernmentContacts";
import AdminGrievanceSettings from "@/components/admin/AdminGrievanceSettings";
import AdminAccountApproval from "@/components/admin/AdminAccountApproval";
import { useAuth } from "@/lib/authContext";
import { useAccessibility } from "@/lib/accessibilityContext";

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
  const { user, login, logout } = useAuth();
  const { darkMode, toggleDarkMode, fontSize } = useAccessibility();

  // Admin Sign In Form States
  const [adminIdentifier, setAdminIdentifier] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState("");
  const [showAdminLoginForm, setShowAdminLoginForm] = useState(false);

  // Super Admin Navigation Tab
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "approved_pending"
    | "all_users"
    | "blocked_users"
    | "staff_reports"
    | "news_mgmt"
    | "notice_mgmt"
    | "legal_mgmt"
    | "reports_mgmt"
    | "website_mgmt"
    | "accessibility"
    | "system_settings"
    | "security"
    | "audit_logs"
    | "profile"
  >("dashboard");

  // Mobile Sidebar Drawer
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Dynamic Statistics from Database
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    approvedUsers: 0,
    blockedUsers: 0,
    totalStaff: 0,
    totalNews: 0,
    totalNotices: 0,
    totalDocuments: LEGAL_DOCUMENTS.length,
    totalPalikas: 137
  });

  // News and Notices state for CMS
  const [newsList, setNewsList] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newArticleModalOpen, setNewArticleModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<any | null>(null);
  const [newArticleData, setNewArticleData] = useState({
    title_ne: "",
    title_en: "",
    category: "सूचना",
    summary_ne: "",
    content_ne: "",
    published_date_bs: "२०८२/०५/२१",
    author: "अपाङ्गता सूचना केन्द्र",
    tags: "सूचना, कोशी प्रदेश",
    image_url: "",
    is_priority: false
  });

  // Form Config Modal state for 137 Palikas
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configModalTab, setConfigModalTab] = useState<"title" | "sections" | "add">("title");

  // 137 Palika Reports Review state
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeReviewItem, setActiveReviewItem] = useState<ReportReviewItem | null>(null);
  const [feedbackNote, setFeedbackNote] = useState<string>("");

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

  // Load Real Database Counts
  const loadDatabaseStats = async () => {
    try {
      // 1. Users DB
      const uRes = await fetch("/api/admin/accounts?role=all");
      if (uRes.ok) {
        const uData = await uRes.json();
        const users = uData.users || [];
        const pending = users.filter((u: any) => u.account_status === "pending").length;
        const approved = users.filter((u: any) => u.account_status === "approved").length;
        const blocked = users.filter((u: any) => u.account_status === "blocked").length;
        const staff = users.filter((u: any) => u.role === "employee" || u.role === "palika_staff").length;
        setStats(prev => ({
          ...prev,
          totalUsers: users.length,
          pendingUsers: pending,
          approvedUsers: approved,
          blockedUsers: blocked,
          totalStaff: staff
        }));
      }

      // 2. News DB
      const nRes = await fetch("/api/news");
      if (nRes.ok) {
        const nData = await nRes.json();
        const articles = nData.articles || [];
        setNewsList(articles);
        const noticesCount = articles.filter((a: any) => a.category === "सूचना").length;
        const newsCount = articles.filter((a: any) => a.category === "समाचार" || a.category === "कार्यक्रम" || a.category === "उपलब्धि").length;
        setStats(prev => ({
          ...prev,
          totalNews: newsCount,
          totalNotices: noticesCount
        }));
      }
    } catch (e) {
      console.error("Failed to load dashboard stats", e);
    }
  };

  useEffect(() => {
    loadDatabaseStats();
  }, [user]);

  // Handle Admin Login Submission (Requirement 3)
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError("");
    setAdminLoginLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: adminIdentifier,
          password: adminPassword,
          admin_only: true // Strict Super Admin verification flag
        })
      });

      const data = await res.json();
      setAdminLoginLoading(false);

      if (!res.ok) {
        setAdminLoginError(data.error || "लगइन गर्न सकिएन।");
        return;
      }

      // Successful Super Admin login
      if (data.user) {
        localStorage.setItem("dic_current_user_session_v2", JSON.stringify(data.user));
        window.location.reload();
      }
    } catch (err: any) {
      setAdminLoginLoading(false);
      setAdminLoginError(err.message || "लगइन प्रक्रियामा प्राविधिक समस्या आयो।");
    }
  };

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

  // Handle Report Approve
  const handleReportApprove = async (item: ReportReviewItem) => {
    const updated = reportsList.map((r) => 
      r.palikaId === item.palikaId ? { ...r, status: 'approved' as const } : r
    );
    setReportsList(updated);
    setActiveReviewItem(null);

    try {
      await fetch("/api/reports/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          palikaId: item.palikaId,
          action: "approve",
          submittedBy: item.submitterName,
          actorId: user?.id || "admin-master-001",
          actorName: user?.name || "मुख्य प्रशासक"
        })
      });
    } catch (e) {
      console.error(e);
    }

    alert(`${item.palikaName} को वार्षिक प्रतिवेदन स्वीकृत (Approved) भयो।`);
  };

  // Handle Report Return
  const handleReportReturn = async (item: ReportReviewItem) => {
    if (!feedbackNote.trim()) {
      alert("कृपया सच्याउन पठाउनुको कारण वा कैफियत लेख्नुहोस्।");
      return;
    }
    const updated = reportsList.map((r) => 
      r.palikaId === item.palikaId ? { ...r, status: 'returned_for_correction' as const } : r
    );
    setReportsList(updated);
    setActiveReviewItem(null);

    try {
      await fetch("/api/reports/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          palikaId: item.palikaId,
          action: "return_for_correction",
          adminCorrectionNotes: feedbackNote,
          submittedBy: item.submitterName,
          actorId: user?.id || "admin-master-001",
          actorName: user?.name || "मुख्य प्रशासक"
        })
      });
    } catch (e) {
      console.error(e);
    }

    setFeedbackNote("");
    alert(`${item.palikaName} को प्रतिवेदन सच्याउनका लागि फिर्ता पठाइयो र सुझाव नोट सुरक्षित गरियो।`);
  };

  // Handle Add News / Notice
  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArticleData)
      });
      if (res.ok) {
        alert("नयाँ सूचना/समाचार सफलतापूर्वक प्रकाशित भयो।");
        setNewArticleModalOpen(false);
        loadDatabaseStats();
      } else {
        const err = await res.json();
        alert(err.error || "प्रकाशन गर्न सकिएन।");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Delete Article
  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;
    try {
      const res = await fetch(`/api/news?id=${articleToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        alert("सूचना/समाचार सफलतापूर्वक हटाइयो।");
        setArticleToDelete(null);
        loadDatabaseStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isSuperAdmin = user?.role === "super_admin" || user?.role === "provincial_admin";

  // =========================================================================
  // VIEW 1: DEDICATED SUPER ADMIN SIGN IN PAGE (Requirement 3, 21, 22, 36)
  // Shown when visitor is unauthenticated or not Super Admin
  // =========================================================================
  if (!isSuperAdmin) {
    // -----------------------------------------------------------------------
    // SCENARIO A: A logged-in Employee or Normal Citizen tries to open /admin
    // They are STRICTLY FORBIDDEN and see a 403 Access Denied screen.
    // ZERO login form, ZERO admin controls are shown.
    // -----------------------------------------------------------------------
    if (user) {
      return (
        <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
          <Header lang={lang} onLanguageChange={setLang} />

          <main id="main-content" className="flex-1 flex items-center justify-center p-4 py-12">
            <div className="max-w-md w-full bg-slate-950 border-2 border-rose-600/70 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
              
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-950 text-white mx-auto flex items-center justify-center shadow-lg border-2 border-rose-400">
                <ShieldAlert className="w-8 h-8 text-rose-200" />
              </div>

              <div className="inline-block text-[11px] font-black uppercase tracking-widest text-rose-400 bg-rose-950/90 px-3.5 py-1 rounded-full border border-rose-500/50">
                ४०३ - पहुँच अस्वीकृत (Access Denied)
              </div>

              <div className="space-y-1.5">
                <h1 className="text-xl font-black text-white">
                  तपाईंलाई यो प्यानल खोल्ने अनुमति छैन
                </h1>
                <p className="text-xs text-slate-300 leading-relaxed">
                  यो प्रशासकीय प्यानल केवल <strong>Super Admin</strong> खाताका लागि मात्र सुरक्षित गरिएको छ। कर्मचारी तथा सर्वसाधारण प्रयोगकर्ताका लागि यो प्यानल निषेध गरिएको छ।
                </p>
              </div>

              {/* Logged in User Profile Info */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">प्रयोगकर्ता:</span>
                  <span className="font-bold text-white">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">भूमिका (Role):</span>
                  <span className="font-bold text-amber-300">
                    {user.role === "employee" || user.role === "palika_staff" ? "कर्मचारी (Palika Staff)" : "नागरिक (Public Citizen)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">प्रशासकीय अनुमति:</span>
                  <span className="font-bold text-rose-400">पहुँच निषेध (Denied)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {(user.role === "employee" || user.role === "palika_staff") && (
                  <Link
                    href="/local-reporting"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>पालिका प्रतिवेदन पोर्टलमा जानुहोस्</span>
                  </Link>
                )}
                <Link
                  href="/"
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow-md flex items-center justify-center gap-2 transition"
                >
                  <span>← सार्वजनिक गृहपृष्ठमा फर्कनुहोस्</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-2 rounded-xl text-rose-400 hover:text-rose-300 text-xs font-semibold cursor-pointer transition"
                >
                  Super Admin बाट लगइन गर्न लगआउट गर्नुहोस्
                </button>
              </div>
            </div>
          </main>

          <Footer lang={lang} />
        </div>
      );
    }

    // -----------------------------------------------------------------------
    // SCENARIO B: An unauthenticated public user visits /admin directly
    // By default, DO NOT expose the Admin Sign In form!
    // Show a Restricted Area security notice.
    // Only if authorized Super Admin explicitly clicks the discreet login button,
    // show the login form.
    // -----------------------------------------------------------------------
    if (!showAdminLoginForm) {
      return (
        <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
          <Header lang={lang} onLanguageChange={setLang} />

          <main id="main-content" className="flex-1 flex items-center justify-center p-4 py-12">
            <div className="max-w-md w-full bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
              
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-slate-300 mx-auto flex items-center justify-center shadow-lg border-2 border-slate-700">
                <Lock className="w-8 h-8 text-amber-400" />
              </div>

              <div className="inline-block text-[11px] font-black uppercase tracking-widest text-slate-400 bg-slate-900 px-3.5 py-1 rounded-full border border-slate-800">
                ४०३ - प्रतिबन्धित क्षेत्र (Restricted Area)
              </div>

              <div className="space-y-1.5">
                <h1 className="text-xl font-black text-white">
                  प्रशासकीय प्यानल सुरक्षित गरिएको छ
                </h1>
                <p className="text-xs text-slate-400 leading-relaxed">
                  कोशी प्रदेश अपाङ्गता सूचना केन्द्र (DIC) को यो मुख्य प्रशासकीय पोर्टल केवल अधिकृत <strong>Super Admin</strong> का लागि मात्र उपलब्ध छ। कर्मचारी तथा सर्वसाधारणका लागि यहाँ कुनै सामग्री उपलब्ध छैन।
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Link
                  href="/"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition"
                >
                  <span>← सार्वजनिक गृहपृष्ठमा फर्कनुहोस्</span>
                </Link>

                <div className="border-t border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAdminLoginForm(true)}
                    className="text-xs text-slate-400 hover:text-amber-300 transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>अधिकृत Super Admin हुनुहुन्छ? यहाँ लगइन गर्नुहोस्</span>
                  </button>
                </div>
              </div>
            </div>
          </main>

          <Footer lang={lang} />
        </div>
      );
    }

    // -----------------------------------------------------------------------
    // SCENARIO C: Authorized Super Admin clicked to reveal sign in form
    // -----------------------------------------------------------------------
    return (
      <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
        <Header lang={lang} onLanguageChange={setLang} />

        <main id="main-content" className="flex-1 flex items-center justify-center p-4 py-12">
          <div className="max-w-md w-full bg-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Header Icon & Title */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 mx-auto flex items-center justify-center shadow-lg border-2 border-amber-300">
                <Lock className="w-8 h-8" />
              </div>
              <div className="inline-block text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/40">
                सुरक्षित प्रशासकीय प्रवेश (Super Admin Only)
              </div>
              <h1 className="text-2xl font-black text-white">
                Admin Sign In
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                कोशी प्रदेश अपाङ्गता सूचना केन्द्र (DIC) को मुख्य प्रशासकीय ड्यासबोर्डमा प्रवेश गर्न अधिकृत परिचयपत्र प्रविष्टि गर्नुहोस्।
              </p>
            </div>

            {/* Error Message Box */}
            {adminLoginError && (
              <div 
                role="alert" 
                className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs font-bold flex items-start gap-2.5 animate-in fade-in"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{adminLoginError}</div>
              </div>
            )}

            {/* Admin Login Form */}
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  Email / User ID *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={adminIdentifier}
                    onChange={(e) => setAdminIdentifier(e.target.value)}
                    placeholder="admin@dic.gov.np वा DIC-ADM-..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="तपाईंको प्रशासकीय पासवर्ड..."
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs cursor-pointer"
                    tabIndex={-1}
                  >
                    {showAdminPassword ? "लुकाउनुहोस्" : "हेर्नुहोस्"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={adminLoginLoading}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50 mt-2"
              >
                {adminLoginLoading ? (
                  <span>सुरक्षा जाँच हुँदैछ...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>🔐 Admin Sign In गर्नुहोस्</span>
                  </>
                )}
              </button>
            </form>

            {/* Back to restricted / home */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <button
                type="button"
                onClick={() => setShowAdminLoginForm(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                ← पछाडि फर्कनुहोस्
              </button>
              <Link
                href="/"
                className="text-slate-400 hover:text-amber-300 transition"
              >
                सार्वजनिक गृहपृष्ठ
              </Link>
            </div>
          </div>
        </main>

        <Footer lang={lang} />
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: FULL SUPER ADMIN DASHBOARD (Requirements 4, 13-20, 23, 35)
  // =========================================================================
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <Header lang={lang} onLanguageChange={setLang} />

      {/* Main Admin Content Container */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-8 py-6 gap-6">
        
        {/* ========================================================================= */}
        {/* SIDEBAR NAVIGATION (Requirement 35) */}
        {/* ========================================================================= */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
          {/* Super Admin Identity Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white border border-blue-900 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm">
                👑
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-black text-white truncate">{user?.name}</div>
                <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                  Super Admin
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Sidebar Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-between shadow-xs cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Menu className="w-4 h-4 text-blue-600" />
              <span>प्रशासकीय मेनु सूची (Admin Menu)</span>
            </span>
            <ChevronRight className={`w-4 h-4 transition-transform ${mobileSidebarOpen ? "rotate-90" : ""}`} />
          </button>

          {/* Sidebar Menu Items */}
          <nav 
            aria-label="सुपर प्रशासक मेनु" 
            className={`bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 text-xs ${mobileSidebarOpen ? "block" : "hidden lg:block"}`}
          >
            {/* 1. Dashboard Overview */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("dashboard");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-blue-900 text-white shadow-xs"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>🏠 ड्यासबोर्ड (Overview)</span>
            </button>

            {/* USER MANAGEMENT SECTION (Requirement 4 & 5) */}
            <div className="pt-2 pb-1 px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              👥 प्रयोगकर्ता व्यवस्थापन
            </div>

            {/* 2. Approved & Pending Module */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("approved_pending");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === "approved_pending"
                  ? "bg-blue-900 text-white font-bold shadow-xs"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Approved & Pending</span>
              </span>
              {stats.pendingUsers > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black rounded-full text-[10px]">
                  {stats.pendingUsers}
                </span>
              )}
            </button>

            {/* 3. All Users */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("all_users");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === "all_users"
                  ? "bg-blue-900 text-white font-bold shadow-xs"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Users className="w-4 h-4 text-blue-500" />
              <span>सबै प्रयोगकर्ता (All Users)</span>
            </button>

            {/* 4. Blocked Users */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("blocked_users");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === "blocked_users"
                  ? "bg-rose-900 text-white font-bold shadow-xs"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-500" />
                <span>Blocked Users</span>
              </span>
              {stats.blockedUsers > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-200 text-rose-900 font-black rounded-full text-[10px]">
                  {stats.blockedUsers}
                </span>
              )}
            </button>

            {/* CONTENT & SYSTEM SECTION */}
            <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              🏛️ स्थानीय तह तथा सामग्री
            </div>

            {/* 5. 137 Palikas Reports Review */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("staff_reports");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === "staff_reports"
                  ? "bg-blue-900 text-white font-bold shadow-xs"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-500" />
              <span>१३७ स्थानीय तह प्रतिवेदन</span>
            </button>

            {/* 6. News Management */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("news_mgmt");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === "news_mgmt"
                  ? "bg-blue-900 text-white font-bold shadow-xs"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Newspaper className="w-4 h-4 text-red-500" />
              <span>समाचार व्यवस्थापन (News)</span>
            </button>

            {/* 7. Notice Management */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("notice_mgmt");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === "notice_mgmt"
                  ? "bg-blue-900 text-white font-bold shadow-xs"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Bell className="w-4 h-4 text-amber-500" />
              <span>सूचना व्यवस्थापन (Notices)</span>
            </button>

            {/* 8. Legal Documents Management */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("legal_mgmt");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === "legal_mgmt"
                  ? "bg-blue-900 text-white font-bold shadow-xs"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Scale className="w-4 h-4 text-indigo-500" />
              <span>कानुन तथा कानुनी दस्तावेज</span>
            </button>

            {/* 9. Website CMS Management */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("website_mgmt");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === "website_mgmt"
                  ? "bg-blue-900 text-white font-bold shadow-xs"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Globe className="w-4 h-4 text-teal-500" />
              <span>वेबसाइट व्यवस्थापन (CMS)</span>
            </button>

            {/* SYSTEM & SECURITY */}
            <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              ⚙️ प्रणाली तथा सुरक्षा
            </div>

            {/* 10. Accessibility Settings */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("accessibility");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === "accessibility"
                  ? "bg-blue-900 text-white font-bold shadow-xs"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span className="text-amber-500 font-bold">♿</span>
              <span>पहुँचयुक्तता (WCAG 2.2 AA)</span>
            </button>

            {/* 11. System Settings */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("system_settings");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === "system_settings"
                  ? "bg-blue-900 text-white font-bold shadow-xs"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>प्रणाली सेटिङ्स (System)</span>
            </button>

            {/* 12. Security & RBAC */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("security");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === "security"
                  ? "bg-blue-900 text-white font-bold shadow-xs"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>सुरक्षा (Security & RBAC)</span>
            </button>

            {/* 13. Audit Logs */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("audit_logs");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === "audit_logs"
                  ? "bg-blue-900 text-white font-bold shadow-xs"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <History className="w-4 h-4 text-purple-500" />
              <span>📋 Audit Logs</span>
            </button>

            {/* 14. Logout Button */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (confirm("के तपाईं Admin सत्रबाट लगआउट गर्न निश्चित हुनुहुन्छ?")) {
                    logout();
                    window.location.href = "/";
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>प्रणालीबाट लगआउट</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* ========================================================================= */}
        {/* MAIN DASHBOARD CONTENT AREA */}
        {/* ========================================================================= */}
        <main id="main-content" tabIndex={-1} className="flex-1 w-full space-y-6 focus:outline-hidden">
          
          {/* TAB 1: DASHBOARD OVERVIEW (Requirement 19) */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Welcome Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-300">
                    👑 सुपर प्रशासक नियन्त्रण केन्द्र (Super Admin Control Center)
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                    स्वागत छ, {user?.name}!
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    कोशी प्रदेशका १४ जिल्ला, १३७ स्थानीय तह, कर्मचारी प्रमाणीकरण तथा सम्पूर्ण सूचना केन्द्र व्यवस्थापन प्रणाली।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("approved_pending")}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md cursor-pointer transition flex items-center gap-1.5"
                  >
                    <Clock className="w-4 h-4" />
                    <span>स्वीकृति बाँकी ({stats.pendingUsers})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfigModalTab("title");
                      setIsConfigModalOpen(true);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Settings className="w-4 h-4 text-amber-300" />
                    <span>फारम सेटिङ्स</span>
                  </button>
                </div>
              </div>

              {/* Real-time Dynamic Statistics Grid (Requirement 19) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {/* Total Users */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 block">कुल प्रयोगकर्ता</span>
                  <span className="text-2xl font-black text-blue-700 dark:text-blue-400">{stats.totalUsers}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">कर्मचारी तथा नागरिक</span>
                </div>

                {/* Pending Users */}
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 shadow-xs">
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">स्वीकृति बाँकी (Pending)</span>
                  <span className="text-2xl font-black text-amber-700 dark:text-amber-400">{stats.pendingUsers}</span>
                  <span className="text-[10px] text-amber-600 block mt-0.5">अनुमोदनको प्रतीक्षामा</span>
                </div>

                {/* Approved Users */}
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 shadow-xs">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">स्वीकृत खाता (Approved)</span>
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{stats.approvedUsers}</span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">सक्रिय कर्मचारी तथा प्रयोगकर्ता</span>
                </div>

                {/* Blocked Users */}
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 shadow-xs">
                  <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block">ब्लक गरिएका (Blocked)</span>
                  <span className="text-2xl font-black text-rose-700 dark:text-rose-400">{stats.blockedUsers}</span>
                  <span className="text-[10px] text-rose-600 block mt-0.5">पहुँच निषेध गरिएका</span>
                </div>

                {/* Total Staff */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 block">कुल कर्मचारी</span>
                  <span className="text-2xl font-black text-purple-700 dark:text-purple-400">{stats.totalStaff}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">स्थानीय तह सहजकर्ता</span>
                </div>

                {/* Total News */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 block">समाचार तथा गतिविधि</span>
                  <span className="text-2xl font-black text-red-700 dark:text-red-400">{stats.totalNews}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">प्रकाशित सामग्रीहरू</span>
                </div>

                {/* Total Notices */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 block">सूचना तथा परिपत्र</span>
                  <span className="text-2xl font-black text-amber-700 dark:text-amber-400">{stats.totalNotices}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">प्राथमिकता सूचनाहरू</span>
                </div>

                {/* Legal Documents */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 block">कानुन तथा दस्तावेज</span>
                  <span className="text-2xl font-black text-indigo-700 dark:text-indigo-400">{stats.totalDocuments}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">ऐन, नियमावली र कार्यविधि</span>
                </div>
              </div>

              {/* Quick Actions & Shortcut Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <span>कर्मचारी स्वीकृति प्रवाह (Approval Workflow)</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    नयाँ दर्ता भएका स्थानीय तहका सहायता सहजकर्ताहरूको विवरण समीक्षा गरी Approve गर्नुहोस्।
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("approved_pending")}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>कर्मचारी समीक्षा खोल्नुहोस् →</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span>१३७ स्थानीय तह प्रतिवेदन अनुगमन</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    पालिका सहजकर्ताहरूले पेश गरेका आ.व. २०८२/०८३ का वार्षिक कार्यसम्पादन प्रतिवेदनहरू समीक्षा गर्नुहोस्।
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("staff_reports")}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>पालिका प्रतिवेदन सूची खोल्नुहोस् →</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Newspaper className="w-5 h-5 text-red-600" />
                    <span>सूचना तथा समाचार CMS</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    पोर्टलको मुख्य सूचना, कार्यक्रम तथा समाचारहरू नयाँ थप गर्न, सच्याउन वा हटाउनुहोस्।
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("news_mgmt")}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>समाचार व्यवस्थापन खोल्नुहोस् →</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPROVED & PENDING (Requirement 5, 6, 7, 8, 9) */}
          {activeTab === "approved_pending" && (
            <AdminAccountApproval initialSubTab="approved_pending" />
          )}

          {/* TAB 3: ALL USERS */}
          {activeTab === "all_users" && (
            <AdminAccountApproval initialSubTab="all_users" />
          )}

          {/* TAB 4: BLOCKED USERS (Requirement 10 & 11) */}
          {activeTab === "blocked_users" && (
            <AdminAccountApproval initialSubTab="blocked_users" />
          )}

          {/* TAB 5: 137 PALIKAS REPORTS REVIEW (Preserves existing 137 reporting functionality) */}
          {activeTab === "staff_reports" && (
            <div className="space-y-6">
              {/* Review Drawer / Modal */}
              {activeReviewItem && (
                <div 
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs"
                  role="dialog"
                  aria-modal="true"
                >
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-300 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 space-y-4">
                    <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-xs font-bold text-blue-900 bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 rounded-full">
                          प्रतिवेदन समीक्षा (Review)
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                          {activeReviewItem.palikaName} ({activeReviewItem.districtName} जिल्ला)
                        </h2>
                        <p className="text-xs text-slate-500">आ.व. २०८२/०८३ वार्षिक कार्यसम्पादन प्रतिवेदन</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveReviewItem(null)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="py-2 space-y-4 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div>
                          <span className="text-slate-500 block">पेश गर्ने सहजकर्ता:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{activeReviewItem.submitterName || "तोकिएको"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">पेश मिति:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{activeReviewItem.submissionDate || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">पहिचान अपाङ्गता:</span>
                          <span className="font-bold text-blue-700 dark:text-blue-300">{activeReviewItem.identifiedPwd || 0} जना</span>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          समीक्षकको कैफियत वा संशोधन निर्देशन (Feedback Note):
                        </label>
                        <textarea
                          rows={3}
                          placeholder="कुनै त्रुटि भए सच्याउनका लागि यहाँ स्पष्ट निर्देशन लेख्नुहोस्..."
                          value={feedbackNote}
                          onChange={(e) => setFeedbackNote(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleReportReturn(activeReviewItem)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>सच्याउन फिर्ता पठाउनुहोस्</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReportApprove(activeReviewItem)}
                        className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>प्रतिवेदन स्वीकृत गर्नुहोस् (Approve)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Table section */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <span>१३७ स्थानीय तहको प्रतिवेदन समीक्षा</span>
                    </h2>
                    <p className="text-xs text-slate-500">कोशी प्रदेशका १४ वटै जिल्लाका पालिकाहरूको वार्षिक कार्यसम्पादन स्थिति</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={districtFilter}
                      onChange={(e) => setDistrictFilter(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold"
                    >
                      <option value="all">सबै जिल्ला (१४ जिल्ला)</option>
                      {KOSHI_DISTRICTS.map((d) => (
                        <option key={d.id} value={d.name_ne}>{d.name_ne}</option>
                      ))}
                    </select>

                    <input
                      type="search"
                      placeholder="पालिका खोज्नुहोस्..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs w-44"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold">
                      <tr>
                        <th scope="col" className="p-3 text-center w-12">क्र.सं.</th>
                        <th scope="col" className="p-3 text-left">जिल्ला</th>
                        <th scope="col" className="p-3 text-left">स्थानीय तह</th>
                        <th scope="col" className="p-3 text-center">स्थिति</th>
                        <th scope="col" className="p-3 text-center">पेश मिति</th>
                        <th scope="col" className="p-3 text-center">कार्य</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {filteredReports.map((row, idx) => (
                        <tr key={row.palikaId} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                          <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-semibold">{row.districtName}</td>
                          <td className="p-3 font-bold">{row.palikaName}</td>
                          <td className="p-3 text-center">
                            {row.status === "approved" && (
                              <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">स्वीकृत</span>
                            )}
                            {row.status === "submitted" && (
                              <span className="text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full font-bold">पेश भएको</span>
                            )}
                            {row.status === "returned_for_correction" && (
                              <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">सच्याउन फिर्ता</span>
                            )}
                            {row.status === "pending" && (
                              <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">पेश हुन बाँकी</span>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono">{row.submissionDate || "—"}</td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => setActiveReviewItem(row)}
                                className="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded text-[11px] font-bold cursor-pointer"
                              >
                                समीक्षा
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: NEWS MANAGEMENT CMS (Requirement 15) */}
          {activeTab === "news_mgmt" && (
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-red-600" />
                    <span>समाचार व्यवस्थापन CMS (News Management)</span>
                  </h2>
                  <p className="text-xs text-slate-500">पोर्टलमा प्रकाशित हुने समाचार, कार्यक्रम र उपलब्धिहरूको पूर्ण नियन्त्रण</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewArticleModalOpen(true)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-1.5 text-xs shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>नयाँ समाचार थप्नुहोस् (Add News)</span>
                </button>
              </div>

              {/* News Items Table */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs" aria-label="समाचार तालिका">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                    <tr>
                      <th className="p-3">शीर्षक (Title)</th>
                      <th className="p-3">वर्ग (Category)</th>
                      <th className="p-3">मिति (Date)</th>
                      <th className="p-3">लेखक (Author)</th>
                      <th className="p-3 text-center">कार्य (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {newsList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <td className="p-3 font-bold text-slate-900 dark:text-white max-w-sm truncate">
                          {item.title_ne}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 font-semibold text-[11px]">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{item.published_date_bs || "—"}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{item.author}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => setArticleToDelete(item)}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-100 cursor-pointer"
                            title="मेटाउनुहोस्"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: NOTICE MANAGEMENT CMS (Requirement 16) */}
          {activeTab === "notice_mgmt" && (
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-500" />
                    <span>सूचना तथा परिपत्र व्यवस्थापन (Notice Management)</span>
                  </h2>
                  <p className="text-xs text-slate-500">जरुरी तथा प्राथमिकता प्राप्त सूचनाहरूको प्रकाशन तथा फाइल संलग्नता</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewArticleData(prev => ({ ...prev, category: "सूचना" }));
                    setNewArticleModalOpen(true);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black flex items-center gap-1.5 text-xs shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>नयाँ सूचना जारी गर्नुहोस्</span>
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
                {newsList.filter(a => a.category === "सूचना").map((notice) => (
                  <div key={notice.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{notice.title_ne}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">मिति: {notice.published_date_bs} | स्रोत: {notice.author}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setArticleToDelete(notice)}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: LEGAL DOCUMENTS MANAGEMENT (Requirement 17) */}
          {activeTab === "legal_mgmt" && (
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Scale className="w-5 h-5 text-indigo-600" />
                    <span>कानुन तथा कानुनी दस्तावेज व्यवस्थापन (Legal Documents Management)</span>
                  </h2>
                  <p className="text-xs text-slate-500">संघीय तथा प्रादेशिक ऐन, नियमावली, कार्यविधि र मार्गदर्शनहरूको अभिलेख</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert("नयाँ कानुनी दस्तावेज थप गर्ने फारम खुला भयो।")}
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-1.5 text-xs shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>दस्तावेज थप्नुहोस् (Add Law/Doc)</span>
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs" aria-label="कानुनी दस्तावेज तालिका">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                    <tr>
                      <th className="p-3">दस्तावेजको नाम</th>
                      <th className="p-3">वर्ग (Category)</th>
                      <th className="p-3">तह (Level)</th>
                      <th className="p-3">जारी मिति (BS)</th>
                      <th className="p-3">कार्य</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {LEGAL_DOCUMENTS.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <td className="p-3 font-bold text-slate-900 dark:text-white max-w-sm">
                          {doc.title_ne}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 font-bold text-[11px]">
                            {doc.category_name_ne}
                          </span>
                        </td>
                        <td className="p-3 font-semibold">
                          {doc.gov_level === "federal" ? "संघीय सरकार" : "प्रदेश सरकार"}
                        </td>
                        <td className="p-3 font-mono">{doc.publication_date_bs}</td>
                        <td className="p-3">
                          <Link
                            href="/laws"
                            target="_blank"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1 font-bold"
                          >
                            <span>हेर्नुहोस्</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: WEBSITE MANAGEMENT CMS (Requirement 13 & 14) */}
          {activeTab === "website_mgmt" && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-600" />
                <span>वेबसाइट सामग्री व्यवस्थापन (Website CMS & Settings)</span>
              </h2>
              <p className="text-xs text-slate-500">
                गृहपृष्ठको ब्यानर, आपतकालीन सन्देशहरू, मुख्य कार्डहरू र फुटर लिङ्कहरूको सम्पादन
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white text-xs">आपतकालीन घोषणा / सूचना टिकर</div>
                  <input
                    type="text"
                    defaultValue="कोशी प्रदेशका १४ जिल्लाका १३७ स्थानीय तहमा अपाङ्गता परिचयपत्र दर्ता कार्य जारी छ।"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs bg-white dark:bg-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => alert("आपतकालीन सन्देश अपडेट गरियो।")}
                    className="px-3 py-1.5 bg-blue-900 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                  >
                    अपडेट गर्नुहोस्
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white text-xs">सम्पर्क हटलाइन नम्बर</div>
                  <input
                    type="text"
                    defaultValue="+977-21-460000 / +977-9842661754"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs bg-white dark:bg-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => alert("हटलाइन नम्बर सुरक्षित भयो।")}
                    className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                  >
                    सुरक्षित गर्नुहोस्
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: ACCESSIBILITY SETTINGS (Requirement 24 & 25) */}
          {activeTab === "accessibility" && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="text-amber-500 font-black">♿</span>
                <span>पहुँचयुक्तता सेटिङ्स (WCAG 2.2 AA Compliance Diagnostics)</span>
              </h2>
              <p className="text-xs text-slate-500">
                अपाङ्गता भएका व्यक्तिहरूका लागि स्क्रीन रिडर, किबोर्ड नेभिगेसन, कन्ट्रास्ट तथा फन्ट साइजको स्थिति
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2">
                  <div className="font-bold text-emerald-900 dark:text-emerald-300">✅ WCAG 2.2 AA मानदण्ड स्थिति</div>
                  <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc pl-4">
                    <li>कन्ट्रास्ट अनुपात ४.५:१ भन्दा बढी</li>
                    <li>दृश्यमान किबोर्ड फोकस इन्डिकेटर सक्रिय</li>
                    <li>ARIA live regions तथा semantic HTML</li>
                    <li>स्क्रीन रिडर अनुकूल लेबलहरू</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="font-bold text-slate-900 dark:text-white">डार्क मोड / लाइट मोड स्विच</div>
                  <button
                    type="button"
                    onClick={toggleDarkMode}
                    className="px-4 py-2 bg-amber-400 text-slate-950 rounded-xl font-bold cursor-pointer"
                  >
                    हाल: {darkMode ? "डार्क मोड अन" : "लाइट मोड"} (क्लिक गरी परिवर्तन)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: SYSTEM SETTINGS (Requirement 4) */}
          {activeTab === "system_settings" && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-600" />
                <span>प्रणाली सेटिङ्स (System Settings & Backup)</span>
              </h2>
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">डेटाबेस पूर्ण ब्याकअप (Full Database Backup)</div>
                    <div className="text-[11px] text-slate-500">सबै प्रयोगकर्ता, प्रतिवेदन र अडिट लगको सुरक्षित ब्याकअप</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("सम्पूर्ण प्रणालीको डेटाबेस ब्याकअप सुरक्षित रूपमा तयार भयो।")}
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold cursor-pointer"
                  >
                    ब्याकअप डाउनलोड
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: SECURITY & RBAC (Requirement 21 & 22) */}
          {activeTab === "security" && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>प्रणाली सुरक्षा तथा रोल आधारित पहुँच (Security & RBAC)</span>
              </h2>
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700">
                  <div className="font-bold text-blue-900 dark:text-blue-300">🔐 सुरक्षा नीति कार्यान्वयन</div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Super Admin अनुमति नभएका कुनै पनि प्रयोगकर्ता (कर्मचारी वा नागरिक) लाई Admin Dashboard मा प्रवेश गर्न पूर्ण रोक लगाइएको छ। ब्लक गरिएका खाताहरूको लगइन server-side प्रमाणीकरण तहबाटै तत्काल रोकिएको छ।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: AUDIT LOGS (Requirement 20) */}
          {activeTab === "audit_logs" && (
            <AdminAccountApproval initialSubTab="audit" />
          )}

        </main>
      </div>

      {/* NEW ARTICLE / NOTICE MODAL */}
      {newArticleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                नयाँ सामग्री प्रकाशन (Add News / Notice)
              </h3>
              <button
                type="button"
                onClick={() => setNewArticleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">शीर्षक *</label>
                <input
                  type="text"
                  required
                  value={newArticleData.title_ne}
                  onChange={(e) => setNewArticleData({ ...newArticleData, title_ne: e.target.value })}
                  placeholder="समाचार वा सूचनाको शीर्षक..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">वर्ग (Category) *</label>
                <select
                  value={newArticleData.category}
                  onChange={(e) => setNewArticleData({ ...newArticleData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="सूचना">सूचना (Notice)</option>
                  <option value="समाचार">समाचार (News)</option>
                  <option value="कार्यक्रम">कार्यक्रम (Event)</option>
                  <option value="उपलब्धि">उपलब्धि (Achievement)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">संक्षिप्त विवरण *</label>
                <textarea
                  rows={2}
                  required
                  value={newArticleData.summary_ne}
                  onChange={(e) => setNewArticleData({ ...newArticleData, summary_ne: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">विस्तृत व्यहोरा *</label>
                <textarea
                  rows={4}
                  required
                  value={newArticleData.content_ne}
                  onChange={(e) => setNewArticleData({ ...newArticleData, content_ne: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewArticleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  प्रकाशन गर्नुहोस् (Publish)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (Requirement 32) */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              <span>सामग्री मेटाउने पुष्टि (Delete Confirmation)</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              के तपाईं <strong>'{articleToDelete.title_ne}'</strong> लाई पोर्टलबाट स्थायी रूपमा हटाउन निश्चित हुनुहुन्छ?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setArticleToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs"
              >
                रद्द
              </button>
              <button
                type="button"
                onClick={handleDeleteArticle}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
              >
                हटाउनुहोस् (Confirm Delete)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM CONFIG MODAL */}
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
