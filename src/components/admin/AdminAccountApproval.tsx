"use client";

import React, { useState, useEffect, useMemo } from "react";
import { User, AccountStatus, AuditLogItem } from "@/types/auth";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import { 
  Users, 
  Building2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  RotateCcw, 
  Check, 
  X, 
  History, 
  AlertCircle,
  Eye,
  Ban,
  ShieldAlert,
  Briefcase,
  Lock,
  UserX,
  UserCheck
} from "lucide-react";

interface AdminAccountApprovalProps {
  initialSubTab?: "approved_pending" | "all_users" | "blocked_users" | "audit";
}

export default function AdminAccountApproval({ initialSubTab = "approved_pending" }: AdminAccountApprovalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<"approved_pending" | "all_users" | "blocked_users" | "audit">(initialSubTab);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [palikaFilter, setPalikaFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Selected User for Full Details Review Modal
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);

  // Confirmation Modal State (Requirement 32)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: "approve" | "reject" | "block" | "unblock";
    user: User | null;
    reason?: string;
  }>({
    isOpen: false,
    action: "approve",
    user: null,
  });

  const [actionSuccessMessage, setActionSuccessMessage] = useState("");
  const [actionErrorMessage, setActionErrorMessage] = useState("");

  // Sync initialSubTab if prop changes
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Load Accounts from API
  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/accounts");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setAuditLogs(data.audit_logs || []);
      }
    } catch (e) {
      console.error("Failed to load accounts:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // Districts and local governments list for dynamic filter
  const availablePalikas = useMemo(() => {
    if (districtFilter === "all") {
      return [];
    }
    const d = KOSHI_DISTRICTS.find((dist) => dist.name_ne === districtFilter || dist.id === districtFilter);
    return d ? d.local_governments : [];
  }, [districtFilter]);

  // Filtered Users based on Active Sub-Tab
  const displayedUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Tab Specific Filter
      if (activeSubTab === "approved_pending") {
        const isEmployee = u.role === "employee" || u.role === "palika_staff";
        if (!isEmployee) return false;
        // In approved & pending tab, show all employees or filter by status
        if (statusFilter !== "all" && u.account_status !== statusFilter) return false;
      } else if (activeSubTab === "blocked_users") {
        if (u.account_status !== "blocked") return false;
      } else if (activeSubTab === "all_users") {
        if (statusFilter !== "all" && u.account_status !== statusFilter) return false;
      }

      // 2. District Filter
      if (districtFilter !== "all") {
        const matchDist = u.district_name === districtFilter || u.district_id === districtFilter;
        if (!matchDist) return false;
      }

      // 3. Palika Filter
      if (palikaFilter !== "all") {
        const matchPalika = 
          u.local_government_name === palikaFilter || 
          u.palika_name === palikaFilter || 
          u.local_government_id === palikaFilter ||
          u.palika_id === palikaFilter;
        if (!matchPalika) return false;
      }

      // 4. Search Query (Name, Email, Mobile, User ID, Palika)
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        u.name.toLowerCase().includes(q) ||
        (u.user_id && u.user_id.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        (u.local_government_name && u.local_government_name.toLowerCase().includes(q)) ||
        (u.district_name && u.district_name.toLowerCase().includes(q)) ||
        (u.designation && u.designation.toLowerCase().includes(q))
      );
    });
  }, [users, activeSubTab, statusFilter, districtFilter, palikaFilter, searchQuery]);

  // Counters
  const pendingCount = users.filter((u) => (u.role === "employee" || u.role === "palika_staff") && u.account_status === "pending").length;
  const approvedCount = users.filter((u) => (u.role === "employee" || u.role === "palika_staff") && u.account_status === "approved").length;
  const blockedCount = users.filter((u) => u.account_status === "blocked").length;
  const totalEmployees = users.filter((u) => u.role === "employee" || u.role === "palika_staff").length;
  const totalCitizens = users.filter((u) => u.role === "normal_user").length;

  // Execute Action (Approve, Reject, Block, Unblock)
  const handleExecuteAction = async () => {
    if (!confirmModal.user) return;
    const { action, user, reason } = confirmModal;

    setActionErrorMessage("");
    setActionSuccessMessage("");

    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          userId: user.id,
          reason,
          adminId: "admin-master-001",
          adminName: "मुख्य प्रशासक (Super Admin)"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "कार्य सम्पादन हुन सकेन।");

      setActionSuccessMessage(data.message || "कार्य सफलतापूर्वक सम्पन्न भयो।");
      
      // Update selectedUserDetail if it's currently open
      if (selectedUserDetail && selectedUserDetail.id === user.id) {
        setSelectedUserDetail(data.user || null);
      }

      setConfirmModal({ isOpen: false, action: "approve", user: null });
      await loadAccounts();

    } catch (err: any) {
      setActionErrorMessage(err.message || "त्रुटि भयो।");
    }
  };

  // Export Users Backup
  const handleExportUsers = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(displayedUsers, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dic_users_export_${activeSubTab}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Top Banner with Key Statistics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg font-bold">👤 प्रयोगकर्ता व्यवस्थापन तथा कर्मचारी स्वीकृति (User Management & Approval)</h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            नयाँ कर्मचारी दर्ताको पूर्ण विवरण समीक्षा, खाता स्वीकृति (Approve), प्रयोगकर्ता ब्लक/अनब्लक (Block/Unblock), तथा सम्पूर्ण प्रणाली अडिट लग।
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-center min-w-[100px]">
            <div className="text-lg font-black">{pendingCount}</div>
            <div className="text-[10px] font-bold">स्वीकृति बाँकी (Pending)</div>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-center min-w-[100px]">
            <div className="text-lg font-black">{approvedCount}</div>
            <div className="text-[10px] font-bold">स्वीकृत (Approved)</div>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-300 text-center min-w-[100px]">
            <div className="text-lg font-black">{blockedCount}</div>
            <div className="text-[10px] font-bold">ब्लक गरिएका (Blocked)</div>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 text-center min-w-[100px]">
            <div className="text-lg font-black">{users.length}</div>
            <div className="text-[10px] font-bold">कुल प्रयोगकर्ता</div>
          </div>
        </div>
      </div>

      {/* Success / Error Messages with Accessibility ARIA Live */}
      {actionSuccessMessage && (
        <div 
          role="status" 
          aria-live="polite"
          className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-semibold flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setActionSuccessMessage("")} 
            className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
            aria-label="सूचना बन्द गर्नुहोस्"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionErrorMessage && (
        <div 
          role="alert" 
          aria-live="assertive"
          className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 font-semibold flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionErrorMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setActionErrorMessage("")} 
            className="text-rose-600 hover:text-rose-800 cursor-pointer"
            aria-label="सूचना बन्द गर्नुहोस्"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs (Requirement 4 & 5) */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2 font-bold flex-wrap" role="tablist">
          {/* 1. Approved & Pending */}
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === "approved_pending"}
            onClick={() => {
              setActiveSubTab("approved_pending");
              setStatusFilter("all");
            }}
            className={`pb-2 px-3 border-b-2 flex items-center gap-2 transition cursor-pointer text-xs sm:text-sm ${
              activeSubTab === "approved_pending"
                ? "border-blue-600 text-blue-700 dark:text-blue-400 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>⏳ Approved & Pending ({totalEmployees})</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-full text-[10px] animate-pulse">
                {pendingCount} नयाँ
              </span>
            )}
          </button>

          {/* 2. All Users */}
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === "all_users"}
            onClick={() => {
              setActiveSubTab("all_users");
              setStatusFilter("all");
            }}
            className={`pb-2 px-3 border-b-2 flex items-center gap-2 transition cursor-pointer text-xs sm:text-sm ${
              activeSubTab === "all_users"
                ? "border-blue-600 text-blue-700 dark:text-blue-400 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>👥 सबै प्रयोगकर्ता (All Users - {users.length})</span>
          </button>

          {/* 3. Blocked Users (Requirement 10 & 11) */}
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === "blocked_users"}
            onClick={() => {
              setActiveSubTab("blocked_users");
              setStatusFilter("all");
            }}
            className={`pb-2 px-3 border-b-2 flex items-center gap-2 transition cursor-pointer text-xs sm:text-sm ${
              activeSubTab === "blocked_users"
                ? "border-rose-600 text-rose-700 dark:text-rose-400 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Ban className="w-4 h-4 text-rose-600" />
            <span>🚫 Blocked Users ({blockedCount})</span>
            {blockedCount > 0 && (
              <span className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-black rounded-full text-[10px] border border-rose-300">
                {blockedCount}
              </span>
            )}
          </button>

          {/* 4. Audit Logs */}
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === "audit"}
            onClick={() => setActiveSubTab("audit")}
            className={`pb-2 px-3 border-b-2 flex items-center gap-2 transition cursor-pointer text-xs sm:text-sm ${
              activeSubTab === "audit"
                ? "border-purple-600 text-purple-700 dark:text-purple-400 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <History className="w-4 h-4 text-purple-600" />
            <span>📋 Audit Logs ({auditLogs.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportUsers}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1 font-bold cursor-pointer transition border border-slate-300 dark:border-slate-700"
            title="JSON ढाँचामा डाटा निर्यात गर्नुहोस्"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          <button
            type="button"
            onClick={loadAccounts}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1 font-bold cursor-pointer transition"
            title="ताजा डाटा पुनः लोड गर्नुहोस्"
            aria-label="पुनः लोड गर्नुहोस्"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Multi-Level Filters Bar (Requirement 8) */}
      {activeSubTab !== "audit" && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 min-w-[220px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="नाम, इमेल, मोबाइल, कर्मचारी आईडी वा स्थानीय तह खोज्नुहोस्..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>

          {/* Status Filter */}
          {activeSubTab !== "blocked_users" && (
            <div className="w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="all">सबै स्थिति (All Status)</option>
                <option value="pending">⏳ Pending (स्वीकृति बाँकी)</option>
                <option value="approved">✅ Approved (स्वीकृत)</option>
                <option value="blocked">🚫 Blocked (ब्लक गरिएको)</option>
                <option value="rejected">❌ Rejected (अस्वीकृत)</option>
              </select>
            </div>
          )}

          {/* District Filter */}
          <div className="w-44">
            <select
              value={districtFilter}
              onChange={(e) => {
                setDistrictFilter(e.target.value);
                setPalikaFilter("all");
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            >
              <option value="all">सबै जिल्ला (१४ जिल्ला)</option>
              {KOSHI_DISTRICTS.map((d) => (
                <option key={d.id} value={d.name_ne}>{d.name_ne}</option>
              ))}
            </select>
          </div>

          {/* Palika Filter (Conditional if district selected) */}
          {districtFilter !== "all" && availablePalikas.length > 0 && (
            <div className="w-48">
              <select
                value={palikaFilter}
                onChange={(e) => setPalikaFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="all">सबै स्थानीय तह ({availablePalikas.length})</option>
                {availablePalikas.map((p) => (
                  <option key={p.id} value={p.name_ne}>{p.name_ne}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. APPROVED & PENDING / ALL USERS / BLOCKED USERS TABLE (Requirement 8) */}
      {/* ========================================================================= */}
      {activeSubTab !== "audit" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="font-bold text-slate-800 dark:text-slate-200">
              {activeSubTab === "approved_pending" && "स्थानीय तह कर्मचारी खाता सूची (Employee Accounts)"}
              {activeSubTab === "all_users" && "सम्पूर्ण प्रयोगकर्ता सूची (All System Users - Staff & Citizens)"}
              {activeSubTab === "blocked_users" && "सुरक्षा नीति अनुसार ब्लक गरिएका खाताहरू (Blocked Accounts)"}
              <span className="ml-2 font-normal text-slate-500">
                (कुल {displayedUsers.length} फेला परे)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left" aria-label="कर्मचारी तथा प्रयोगकर्ता खाता तालिका">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th scope="col" className="py-3 px-4">क्र.सं. / ID</th>
                  <th scope="col" className="py-3 px-4">नाम र पद</th>
                  <th scope="col" className="py-3 px-4">सम्पर्क (Email / Mobile)</th>
                  <th scope="col" className="py-3 px-4">तोकिएको पालिका र जिल्ला</th>
                  <th scope="col" className="py-3 px-4">दर्ता मिति</th>
                  <th scope="col" className="py-3 px-4 text-center">स्थिति (Status)</th>
                  <th scope="col" className="py-3 px-4 text-center">कार्य (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {displayedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-500">
                      <div className="max-w-sm mx-auto space-y-2">
                        <Users className="w-8 h-8 mx-auto text-slate-400" />
                        <div className="font-bold text-slate-700 dark:text-slate-300">
                          {activeSubTab === "blocked_users" 
                            ? "हाल कुनै पनि प्रयोगकर्ता Block गरिएको छैन।" 
                            : activeSubTab === "approved_pending" && statusFilter === "pending"
                            ? "हाल कुनै Pending Staff छैन।"
                            : "कुनै प्रयोगकर्ता फेला परेन।"}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          खोज वा फिल्टर मापदण्ड परिवर्तन गरी पुनः प्रयास गर्नुहोस्।
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedUsers.map((emp, index) => {
                    const isPending = emp.account_status === "pending";
                    const isApproved = emp.account_status === "approved";
                    const isBlocked = emp.account_status === "blocked";
                    const isRejected = emp.account_status === "rejected";

                    return (
                      <tr 
                        key={emp.id} 
                        className={`transition ${isPending ? "bg-amber-50/40 dark:bg-amber-950/20" : isBlocked ? "bg-rose-50/30 dark:bg-rose-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                      >
                        {/* ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                          <div className="text-[10px] text-slate-400 font-sans">#{index + 1}</div>
                          <div>{emp.user_id || emp.id}</div>
                        </td>

                        {/* Name & Designation */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{emp.name}</span>
                            {emp.role === "super_admin" && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">Super Admin</span>
                            )}
                            {emp.role === "normal_user" && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 font-semibold">नागरिक</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{emp.designation || (emp.role === "employee" ? "सहायता सहजकर्ता" : "प्रयोगकर्ता")}</span>
                          </div>
                        </td>

                        {/* Contact (Email & Phone) */}
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          {emp.email && (
                            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[180px]">{emp.email}</span>
                            </div>
                          )}
                          {emp.phone && (
                            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{emp.phone}</span>
                            </div>
                          )}
                          {!emp.email && !emp.phone && <span className="text-slate-400">—</span>}
                        </td>

                        {/* Palika & District */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{emp.local_government_name || emp.palika_name || "पालिका तोकिएको छैन"}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{emp.district_name || emp.address || "कोशी प्रदेश"}</span>
                          </div>
                        </td>

                        {/* Registered Date */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap text-[11px]">
                          {emp.created_at ? new Date(emp.created_at).toLocaleDateString("ne-NP") : "—"}
                        </td>

                        {/* Account Status Badge (Accessible text + icon + color) */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 border border-amber-400 px-2.5 py-1 rounded-full animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>प्रतीक्षारत (Pending)</span>
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400 px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>स्वीकृत (Approved)</span>
                            </span>
                          )}
                          {isBlocked && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-900 dark:text-rose-200 bg-rose-100 dark:bg-rose-950/80 border border-rose-400 px-2.5 py-1 rounded-full">
                              <Ban className="w-3.5 h-3.5 text-rose-600" />
                              <span>ब्लक (Blocked)</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-300 px-2.5 py-1 rounded-full">
                              <XCircle className="w-3.5 h-3.5 text-slate-500" />
                              <span>अस्वीकृत (Rejected)</span>
                            </span>
                          )}
                        </td>

                        {/* Actions (View Details, Approve, Block/Unblock) */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View Details Button (Requirement 8) */}
                            <button
                              type="button"
                              onClick={() => setSelectedUserDetail(emp)}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 font-bold flex items-center gap-1 border border-blue-200 dark:border-slate-700 cursor-pointer shadow-xs"
                              title="कर्मचारीको सम्पूर्ण विवरण हेर्नुहोस्"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>विवरण</span>
                            </button>

                            {/* Direct Quick Approve for Pending Employees */}
                            {isPending && (
                              <button
                                type="button"
                                onClick={() => setConfirmModal({ isOpen: true, action: "approve", user: emp })}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                                title="कर्मचारी खाता स्वीकृत (Approve) गर्नुहोस्"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}

                            {/* Direct Unblock for Blocked Users */}
                            {isBlocked && (
                              <button
                                type="button"
                                onClick={() => setConfirmModal({ isOpen: true, action: "unblock", user: emp })}
                                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                                title="खाता Unblock गरी पुनः सक्रिय बनाउनुहोस्"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Unblock</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. AUDIT LOGS SECTION (Requirement 20) */}
      {/* ========================================================================= */}
      {activeSubTab === "audit" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-purple-600" />
              <span>प्रशासकीय अडिट लग अभिलेख (Administrative Audit Logs)</span>
            </div>
            <span className="text-[11px] font-normal text-slate-500">
              Super Admin द्वारा सम्पादन गरिएका सुरक्षा तथा अनुमोदन कार्यहरू
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left" aria-label="अडिट लग तालिका">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th scope="col" className="py-3 px-4">समय (Timestamp)</th>
                  <th scope="col" className="py-3 px-4">कार्य (Action)</th>
                  <th scope="col" className="py-3 px-4">सम्पादक (Actor)</th>
                  <th scope="col" className="py-3 px-4">लक्षित खाता/प्रयोगकर्ता</th>
                  <th scope="col" className="py-3 px-4">विस्तृत विवरण</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      कुनै अडिट लग भेटिएन।
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString("ne-NP")}
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-700 dark:text-blue-400">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {log.performed_by_name}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-mono">
                        {log.target_user_name || log.target_user_id || "-"}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-md">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DETAILED EMPLOYEE REVIEW MODAL (Requirement 6, 7, 8, 10) */}
      {/* ========================================================================= */}
      {selectedUserDetail && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="employee-detail-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 sm:p-8 animate-in zoom-in-95 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-blue-800 bg-blue-100 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-300">
                  कर्मचारी दर्ता फारम पुनरावलोकन (Employee Review)
                </span>
                <h3 id="employee-detail-modal-title" className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
                  {selectedUserDetail.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  आईडी: {selectedUserDetail.user_id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                aria-label="बन्द गर्नुहोस्"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Registration Data Grid (Requirement 6) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">पूरा नाम:</span>
                <strong className="text-slate-900 dark:text-white text-sm">{selectedUserDetail.name}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">मोबाइल नम्बर:</span>
                <strong className="text-slate-900 dark:text-white font-mono">{selectedUserDetail.phone || "उपलब्ध छैन"}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">ईमेल ठेगाना:</span>
                <strong className="text-slate-900 dark:text-white font-mono">{selectedUserDetail.email || "उपलब्ध छैन"}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">प्रदेश:</span>
                <strong className="text-slate-900 dark:text-white">{selectedUserDetail.province || "कोशी प्रदेश"}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">जिल्ला:</span>
                <strong className="text-slate-900 dark:text-white">{selectedUserDetail.district_name || selectedUserDetail.districtId || "तोकिएको छैन"}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">स्थानीय तह (पालिका):</span>
                <strong className="text-blue-700 dark:text-blue-300 font-bold">
                  {selectedUserDetail.local_government_name || selectedUserDetail.palika_name || "तोकिएको छैन"}
                </strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">पद / भूमिका (Designation):</span>
                <strong className="text-slate-900 dark:text-white">{selectedUserDetail.designation || "अपाङ्गता सहायता सहजकर्ता"}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">कार्यालय / संस्था:</span>
                <strong className="text-slate-900 dark:text-white">{selectedUserDetail.organization || selectedUserDetail.local_government_name || "स्थानीय सरकार"}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">दर्ता मिति:</span>
                <strong className="text-slate-900 dark:text-white font-mono">
                  {selectedUserDetail.created_at ? new Date(selectedUserDetail.created_at).toLocaleString("ne-NP") : "—"}
                </strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">वर्तमान खाता अवस्था:</span>
                <div className="mt-1">
                  {selectedUserDetail.account_status === "pending" && (
                    <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold rounded-full border border-amber-300">
                      ⏳ Pending (स्वीकृति बाँकी)
                    </span>
                  )}
                  {selectedUserDetail.account_status === "approved" && (
                    <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold rounded-full border border-emerald-300">
                      ✅ Approved (स्वीकृत)
                    </span>
                  )}
                  {selectedUserDetail.account_status === "blocked" && (
                    <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 font-bold rounded-full border border-rose-300">
                      🚫 Blocked (ब्लक गरिएको)
                    </span>
                  )}
                  {selectedUserDetail.account_status === "rejected" && (
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-full border border-slate-300">
                      ❌ Rejected (अस्वीकृत)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* PASSWORD SECURITY BADGE (Requirement 7 & 31) */}
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-slate-800/80 border border-blue-200 dark:border-blue-900/50 flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-blue-900 dark:text-blue-300 block font-bold">
                  🔐 पासवर्ड सुरक्षा नीति (Password Security)
                </strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  कर्मचारीले दर्ता गर्दा राखेको पासवर्ड सुरक्षित एकतर्फी (One-way hashed) गरिएको छ। प्रणाली सुरक्षा तथा सरकारी डेटा गोपनीयता नीतिअनुसार यो पासवर्ड मुख्य प्रशासक (Super Admin) लगायत कसैलाई पनि देखाउने अनुमति छैन।
                </p>
              </div>
            </div>

            {/* BLOCK USER SWITCH (Requirement 10, 11, 24, 33) */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Block User (खाता ब्लक नियन्त्रण)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  यदि यो खातालाई ब्लक गरिएमा प्रयोगकर्ताले आफ्नो इमेल वा मोबाइलबाट प्रणालीमा कुनै पनि हालतमा लगइन गर्न पाउने छैन।
                </p>
              </div>

              {/* Accessible Toggle Button with Visible Text State */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={selectedUserDetail.account_status === "blocked"}
                  aria-label="प्रयोगकर्ता ब्लक गर्ने स्विच"
                  onClick={() => {
                    if (selectedUserDetail.account_status === "blocked") {
                      // Switch from ON (Blocked) -> OFF (Active/Unblock)
                      setConfirmModal({
                        isOpen: true,
                        action: "unblock",
                        user: selectedUserDetail
                      });
                    } else {
                      // Switch from OFF (Active) -> ON (Block)
                      setConfirmModal({
                        isOpen: true,
                        action: "block",
                        user: selectedUserDetail
                      });
                    }
                  }}
                  className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 shadow-sm transition cursor-pointer border ${
                    selectedUserDetail.account_status === "blocked"
                      ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-700"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700"
                  }`}
                >
                  {selectedUserDetail.account_status === "blocked" ? (
                    <>
                      <Ban className="w-4 h-4" />
                      <span>ON — Blocked (ब्लक गरिएको)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>OFF — Active (सक्रिय)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Actions: Approve / Reject / Close */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
              >
                बन्द गर्नुहोस् (Close)
              </button>

              <div className="flex items-center gap-2">
                {selectedUserDetail.account_status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setConfirmModal({ isOpen: true, action: "reject", user: selectedUserDetail })}
                      className="px-4 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/80 hover:bg-rose-200 text-rose-800 dark:text-rose-200 font-bold border border-rose-300 cursor-pointer"
                    >
                      अस्वीकृत (Reject)
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmModal({ isOpen: true, action: "approve", user: selectedUserDetail })}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>खाता Approve गर्नुहोस्</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CONFIRMATION DIALOG (Requirement 9, 10, 32, 33) */}
      {/* ========================================================================= */}
      {confirmModal.isOpen && confirmModal.user && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 id="confirm-modal-title" className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                {confirmModal.action === "approve" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {confirmModal.action === "block" && <Ban className="w-5 h-5 text-rose-600" />}
                {confirmModal.action === "unblock" && <UserCheck className="w-5 h-5 text-emerald-600" />}
                {confirmModal.action === "reject" && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                <span>
                  {confirmModal.action === "approve" && "खाता Approval पुष्टि गर्नुहोस्"}
                  {confirmModal.action === "block" && "खाता Block गर्ने पुष्टि"}
                  {confirmModal.action === "unblock" && "खाता Unblock गर्ने पुष्टि"}
                  {confirmModal.action === "reject" && "खाता अस्वीकृत (Reject) गर्ने पुष्टि"}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, action: "approve", user: null })}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="रद्द गर्नुहोस्"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target User Snapshot */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {confirmModal.user.name}
              </div>
              <div className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                आईडी: {confirmModal.user.user_id} | सम्पर्क: {confirmModal.user.phone || confirmModal.user.email}
              </div>
              <div className="text-slate-600 dark:text-slate-300 text-[11px]">
                स्थानीय तह: {confirmModal.user.local_government_name || confirmModal.user.palika_name || "कोशी प्रदेश"}
              </div>
            </div>

            {/* Explicit Confirmation Messages according to Requirements */}
            {confirmModal.action === "approve" && (
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                के तपाईं यो कर्मचारीको account approve गर्न निश्चित हुनुहुन्छ? स्वीकृत गरेपछि कर्मचारीले आफ्नो स्थानीय तहको वार्षिक प्रतिवेदन पोर्टलमा सुरक्षित लगइन गरी विवरण प्रविष्टि गर्न सक्नेछन्।
              </p>
            )}

            {confirmModal.action === "block" && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-900">
                <p className="text-xs text-rose-900 dark:text-rose-200 font-bold leading-relaxed">
                  यो account block गरेपछि उक्त user ले login गर्न सक्ने छैन। के तपाईं निश्चित हुनुहुन्छ?
                </p>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-1">
                  उक्त प्रयोगकर्ताले आफ्नो registered email वा फोनबाट लगइन गर्न खोज्दा प्रणालीले तत्काल पहुँच निषेध (Blocked) सन्देश देखाउनेछ।
                </p>
              </div>
            )}

            {confirmModal.action === "unblock" && (
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                के तपाईं यो खातालाई <strong>Unblock</strong> गरी पुनः सक्रिय बनाउन निश्चित हुनुहुन्छ? Unblock गरेपछि उक्त प्रयोगकर्ताले साविक बमोजिम प्रणालीमा लगइन गर्न पाउनेछ।
              </p>
            )}

            {confirmModal.action === "reject" && (
              <div className="space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  यो कर्मचारी खातालाई अस्वीकृत गर्न चाहनुहुन्छ? आवश्यक परे कारण उल्लेख गर्नुहोस्:
                </p>
                <input
                  type="text"
                  placeholder="उदा. आधिकारिक कागजात नपुगेको..."
                  onChange={(e) => setConfirmModal({ ...confirmModal, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, action: "approve", user: null })}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
              >
                रद्द (Cancel)
              </button>

              <button
                type="button"
                onClick={handleExecuteAction}
                className={`px-5 py-2 rounded-xl text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer ${
                  confirmModal.action === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : confirmModal.action === "unblock"
                    ? "bg-emerald-700 hover:bg-emerald-600"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  {confirmModal.action === "approve" && "स्वीकृत गर्नुहोस् (Approve)"}
                  {confirmModal.action === "block" && "ब्लक गर्नुहोस् (Confirm Block)"}
                  {confirmModal.action === "unblock" && "अनब्लक गर्नुहोस् (Confirm Unblock)"}
                  {confirmModal.action === "reject" && "अस्वीकृत गर्नुहोस् (Reject)"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
