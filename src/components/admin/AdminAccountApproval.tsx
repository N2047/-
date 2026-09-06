"use client";

import React, { useState, useEffect, useMemo } from "react";
import { User, AccountStatus, AuditLogItem } from "@/types/auth";
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
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";

export default function AdminAccountApproval() {
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<"employees" | "normal_users" | "audit">("employees");
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Approval Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: "approve" | "reject" | "suspend" | "activate";
    user: User | null;
    reason?: string;
  }>({
    isOpen: false,
    action: "approve",
    user: null,
  });

  const [actionSuccessMessage, setActionSuccessMessage] = useState("");
  const [actionErrorMessage, setActionErrorMessage] = useState("");

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

  // Filtered Employees
  const filteredEmployees = useMemo(() => {
    return users.filter((u) => {
      const isEmployee = u.role === "employee" || u.role === "palika_staff";
      if (!isEmployee) return false;

      const matchStatus = employeeStatusFilter === "all" || u.account_status === employeeStatusFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchStatus;

      const matchSearch = 
        u.name.toLowerCase().includes(q) ||
        (u.user_id && u.user_id.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        (u.local_government_name && u.local_government_name.toLowerCase().includes(q)) ||
        (u.district_name && u.district_name.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [users, employeeStatusFilter, searchQuery]);

  // Filtered Normal Users
  const filteredNormalUsers = useMemo(() => {
    return users.filter((u) => {
      const isNormal = u.role === "normal_user";
      if (!isNormal) return false;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        u.name.toLowerCase().includes(q) ||
        (u.user_id && u.user_id.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q))
      );
    });
  }, [users, searchQuery]);

  // Handle Approve / Reject Confirmation Execution
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
      setConfirmModal({ isOpen: false, action: "approve", user: null });
      await loadAccounts();

    } catch (err: any) {
      setActionErrorMessage(err.message || "त्रुटि भयो।");
    }
  };

  // Export Normal Users Backup
  const handleExportUsers = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredNormalUsers, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dic_normal_users_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const pendingCount = users.filter((u) => (u.role === "employee" || u.role === "palika_staff") && u.account_status === "pending").length;
  const approvedCount = users.filter((u) => (u.role === "employee" || u.role === "palika_staff") && u.account_status === "approved").length;

  return (
    <div className="space-y-6 text-xs">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg font-bold">👤 प्रयोगकर्ता खाता तथा कर्मचारी स्वीकृति व्यवस्थापन</h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            स्थानीय तहका कर्मचारीहरूको खाता स्वीकृति (Approval), अस्वीकृति, तथा सम्पूर्ण सामान्य नागरिक खाताहरूको अभिलेख र ब्याकअप।
          </p>
        </div>

        {/* Action Counters */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-center">
            <div className="text-lg font-black">{pendingCount}</div>
            <div className="text-[10px] font-semibold">स्वीकृति बाँकी (Pending)</div>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-center">
            <div className="text-lg font-black">{approvedCount}</div>
            <div className="text-[10px] font-semibold">स्वीकृत (Approved)</div>
          </div>
        </div>
      </div>

      {/* Success / Error Messages */}
      {actionSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage("")} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionErrorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionErrorMessage}</span>
          </div>
          <button onClick={() => setActionErrorMessage("")} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2 font-bold">
          <button
            type="button"
            onClick={() => setActiveSubTab("employees")}
            className={`pb-2 px-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === "employees"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>कर्मचारी Accounts ({users.filter(u => u.role === "employee" || u.role === "palika_staff").length})</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black rounded-full text-[10px]">
                {pendingCount} नयाँ
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("normal_users")}
            className={`pb-2 px-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === "normal_users"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>सामान्य Users ({users.filter(u => u.role === "normal_user").length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("audit")}
            className={`pb-2 px-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === "audit"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Logs ({auditLogs.length})</span>
          </button>
        </div>

        <button
          type="button"
          onClick={loadAccounts}
          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center gap-1 font-semibold"
          title="पुनः लोड गर्नुहोस्"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeSubTab === "employees"
                ? "कर्मचारीको नाम, आईडी (DIC-EMP-...), स्थानीय तह वा फोन खोज्नुहोस्..."
                : "प्रयोगकर्ताको नाम, आईडी वा सम्पर्क खोज्नुहोस्..."
            }
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>

        {activeSubTab === "employees" && (
          <div className="sm:w-60">
            <select
              value={employeeStatusFilter}
              onChange={(e) => setEmployeeStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            >
              <option value="all">सबै स्थिति (All Status)</option>
              <option value="pending">⏳ स्वीकृति बाँकी (Pending Approval)</option>
              <option value="approved">✅ स्वीकृत (Approved)</option>
              <option value="rejected">❌ अस्वीकृत (Rejected)</option>
              <option value="suspended">⚠️ निलम्बित (Suspended)</option>
            </select>
          </div>
        )}

        {activeSubTab === "normal_users" && (
          <button
            type="button"
            onClick={handleExportUsers}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON Backup डाउनलोड</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. EMPLOYEE ACCOUNTS TABLE */}
      {/* ========================================================================= */}
      {activeSubTab === "employees" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">कर्मचारी आईडी</th>
                  <th className="py-3 px-4">नाम र सम्पर्क</th>
                  <th className="py-3 px-4">तोकिएको स्थानीय तह र जिल्ला</th>
                  <th className="py-3 px-4">दर्ता मिति</th>
                  <th className="py-3 px-4 text-center">OTP प्रमाणीकरण</th>
                  <th className="py-3 px-4 text-center">Approval स्थिति</th>
                  <th className="py-3 px-4 text-center">कार्य (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      कुनै कर्मचारी खाता फेला परेन।
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => {
                    const isPending = emp.account_status === "pending";
                    const isApproved = emp.account_status === "approved";
                    const isRejected = emp.account_status === "rejected";

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        {/* ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                          {emp.user_id || emp.id}
                        </td>

                        {/* Name & Contact */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{emp.name}</div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                            {emp.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{emp.phone}</span>
                              </span>
                            )}
                            {emp.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{emp.email}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Palika & District */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{emp.local_government_name || emp.palika_name || "पालिका चयन बाँकी"}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{emp.district_name || "कोशी प्रदेश"}</span>
                          </div>
                        </td>

                        {/* Registered Date */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {emp.created_at ? new Date(emp.created_at).toLocaleDateString("ne-NP") : "उपलब्ध छैन"}
                        </td>

                        {/* OTP Status */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" /> Verified
                          </span>
                        </td>

                        {/* Account Status Badge */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 px-2.5 py-1 rounded-full animate-pulse">
                              <Clock className="w-3 h-3" /> Pending Approval
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Approved
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-200 bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-700 px-2.5 py-1 rounded-full">
                              <XCircle className="w-3 h-3" /> Rejected
                            </span>
                          )}
                          {emp.account_status === "suspended" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                              Suspended
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setConfirmModal({ isOpen: true, action: "approve", user: emp })}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                                  title="कर्मचारी खाता Approve गर्नुहोस्"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmModal({ isOpen: true, action: "reject", user: emp })}
                                  className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 cursor-pointer"
                                  title="अस्वीकृत गर्नुहोस्"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {isApproved && (
                              <button
                                type="button"
                                onClick={() => setConfirmModal({ isOpen: true, action: "suspend", user: emp })}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 hover:text-amber-700 text-slate-600 font-semibold cursor-pointer"
                                title="खाता निलम्बन (Suspend) गर्नुहोस्"
                              >
                                Suspend
                              </button>
                            )}

                            {emp.account_status === "suspended" && (
                              <button
                                type="button"
                                onClick={() => setConfirmModal({ isOpen: true, action: "activate", user: emp })}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 cursor-pointer"
                              >
                                पुनः सक्रिय
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
      {/* 2. NORMAL USERS BACKUP & RECORD TABLE */}
      {/* ========================================================================= */}
      {activeSubTab === "normal_users" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="font-bold text-slate-800 dark:text-slate-200">
              सामान्य नागरिक खाताहरूको सुरक्षित अभिलेख (Normal Users Record)
            </div>
            <div className="text-[11px] text-slate-500">
              यी प्रयोगकर्ताहरूलाई कुनै प्रशासकीय/ब्याकएन्ड अनुमति छैन।
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">प्रयोगकर्ताको नाम</th>
                  <th className="py-3 px-4">Email / Mobile Number</th>
                  <th className="py-3 px-4">ठेगाना</th>
                  <th className="py-3 px-4">दर्ता मिति</th>
                  <th className="py-3 px-4 text-center">खाता स्थिति</th>
                  <th className="py-3 px-4 text-center">अन्तिम लगइन</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredNormalUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      कुनै सामान्य प्रयोगकर्ता फेला परेन।
                    </td>
                  </tr>
                ) : (
                  filteredNormalUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-purple-700 dark:text-purple-400">
                        {u.user_id || u.id}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {u.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {u.email || u.phone || "उपलब्ध छैन"}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {u.address || "नेपाल"}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString("ne-NP") : "उपलब्ध छैन"}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> सक्रिय (Active)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500 text-[11px] whitespace-nowrap">
                        {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString("ne-NP") : "हालै छैन"}
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
      {/* 3. AUDIT LOGS TABLE */}
      {/* ========================================================================= */}
      {activeSubTab === "audit" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <span>प्रशासकीय अडिट लग (Administrative Action Logs)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">समय (Timestamp)</th>
                  <th className="py-3 px-4">कार्य (Action)</th>
                  <th className="py-3 px-4">सम्पादक (Actor)</th>
                  <th className="py-3 px-4">लक्षित खाता/प्रतिवेदन</th>
                  <th className="py-3 px-4">विस्तृत विवरण</th>
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
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("ne-NP")}
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-700 dark:text-blue-400">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {log.performed_by_name}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
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
      {/* APPROVAL / REJECT CONFIRMATION DIALOG (Requirement 26) */}
      {/* ========================================================================= */}
      {confirmModal.isOpen && confirmModal.user && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                {confirmModal.action === "approve" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                )}
                <span>
                  {confirmModal.action === "approve"
                    ? "कर्मचारी खाता Approval पुष्टि गर्नुहोस्"
                    : "कर्मचारी खाता स्थिति परिवर्तन"}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, action: "approve", user: null })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {confirmModal.user.name}
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                आईडी: <strong className="font-mono">{confirmModal.user.user_id}</strong>
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                स्थानीय तह: <strong>{confirmModal.user.local_government_name || confirmModal.user.palika_name}</strong> ({confirmModal.user.district_name})
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                सम्पर्क: {confirmModal.user.phone} / {confirmModal.user.email || "इमेल छैन"}
              </div>
            </div>

            {confirmModal.action === "approve" && (
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                के तपाईं यो कर्मचारी खातालाई <strong>Approve</strong> गर्न निश्चित हुनुहुन्छ? स्वीकृत गरेपछि कर्मचारीलाई स्वचालित रूपमा <strong>Approval Email</strong> प्रेषण हुनेछ र उसले आफ्नो स्थानीय तहको वार्षिक प्रतिवेदन प्रविष्टि गर्न पाउनेछ।
              </p>
            )}

            {confirmModal.action === "reject" && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  अस्वीकृतिको कारण (ऐच्छिक)
                </label>
                <input
                  type="text"
                  placeholder="उदा. तोकिएको आधिकारिक कागजात प्रमाणित नभएको..."
                  onChange={(e) => setConfirmModal({ ...confirmModal, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, action: "approve", user: null })}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold"
              >
                No, Cancel (रद्द गर्नुहोस्)
              </button>

              <button
                type="button"
                onClick={handleExecuteAction}
                className={`px-5 py-2 rounded-xl text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer ${
                  confirmModal.action === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  {confirmModal.action === "approve" ? "Yes, Approve (स्वीकृत गर्नुहोस्)" : "पुष्टि गर्नुहोस्"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
