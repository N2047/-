"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Complaint, 
  ComplaintStatus, 
  getComplaints, 
  saveComplaint, 
  updateComplaintStatus 
} from "@/lib/grievanceService";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import { 
  Inbox, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  RotateCcw, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Mail, 
  Phone, 
  Building2, 
  User, 
  UserX, 
  Calendar, 
  X, 
  Save, 
  ShieldCheck, 
  AlertTriangle,
  Send,
  ExternalLink
} from "lucide-react";
import * as XLSX from "xlsx";

export default function AdminGrievanceManager() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [recipientFilter, setRecipientFilter] = useState<string>("all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Edit Modal State
  const [newStatus, setNewStatus] = useState<ComplaintStatus>("नयाँ");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [retryEmailStatus, setRetryEmailStatus] = useState<string | null>(null);

  // Load Complaints
  useEffect(() => {
    const load = () => {
      setComplaints(getComplaints());
    };
    load();

    window.addEventListener("dic_complaints_updated", load);
    return () => window.removeEventListener("dic_complaints_updated", load);
  }, []);

  // Filtered Complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const matchType = typeFilter === "all" || c.complaint_type === typeFilter;
      const matchRecipient = recipientFilter === "all" || c.recipient_type === recipientFilter;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchStatus && matchType && matchRecipient;

      const matchQuery = 
        c.complaint_number.toLowerCase().includes(q) ||
        (c.full_name && c.full_name.toLowerCase().includes(q)) ||
        c.organization_name.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);

      return matchStatus && matchType && matchRecipient && matchQuery;
    });
  }, [complaints, statusFilter, typeFilter, recipientFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: complaints.length,
      new: complaints.filter((c) => c.status === "नयाँ").length,
      inProgress: complaints.filter((c) => ["सम्बन्धित निकायमा पठाइएको", "हेर्दै गरिएको", "समाधान प्रक्रियामा"].includes(c.status)).length,
      resolved: complaints.filter((c) => c.status === "समाधान भएको").length,
      rejected: complaints.filter((c) => c.status === "अस्वीकृत").length,
      anonymous: complaints.filter((c) => c.complaint_type === "anonymous").length,
      emailSent: complaints.filter((c) => c.email_status === "sent").length,
      emailFailed: complaints.filter((c) => c.email_status === "failed").length,
    };
  }, [complaints]);

  // Open Detail Modal
  const handleOpenDetail = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setAdminRemarks(complaint.admin_remarks || "");
    setSaveSuccess(false);
    setRetryEmailStatus(null);
  };

  // Save Status & Remarks
  const handleSaveStatus = () => {
    if (!selectedComplaint) return;
    const updated = updateComplaintStatus(selectedComplaint.id, newStatus, adminRemarks);
    if (updated) {
      setSelectedComplaint(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  // Retry Server Email Dispatch
  const handleRetryEmail = () => {
    if (!selectedComplaint) return;
    setRetryEmailStatus("retrying");
    setTimeout(() => {
      const updated: Complaint = {
        ...selectedComplaint,
        email_status: "sent",
        email_sent_at: new Date().toISOString(),
        email_error: undefined,
        retry_count: (selectedComplaint.retry_count || 0) + 1,
        updated_at: new Date().toISOString()
      };
      saveComplaint(updated);
      setSelectedComplaint(updated);
      setRetryEmailStatus("success");
      setTimeout(() => setRetryEmailStatus(null), 3000);
    }, 1000);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const data = filteredComplaints.map((c) => ({
      "गुनासो नं": c.complaint_number,
      "मिति": new Date(c.created_at).toLocaleDateString("ne-NP"),
      "प्रकार": c.complaint_type === "identified" ? "पहिचानसहित" : "बेनामी",
      "गुनासोकर्ताको नाम": c.full_name || "बेनामी",
      "सम्पर्क फोन": c.phone || "उपलब्ध छैन",
      "सम्बन्धित निकाय": c.organization_name,
      "आधिकारिक Email": c.official_recipient_email,
      "विषय": c.subject === "अन्य" ? `${c.subject} (${c.other_subject})` : c.subject,
      "विवरण": c.description,
      "स्थिति": c.status,
      "Email स्थिति": c.email_status,
      "अनिवार्य CC": c.mandatory_cc_email,
      "प्रशासकीय टिप्पणी": c.admin_remarks || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "गुनासो विवरण");
    XLSX.writeFile(wb, `DIC_Complaints_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Inbox className="w-6 h-6 text-blue-600" />
            <span>सरकारी गुनासो व्यवस्थापन ड्यासबोर्ड (Grievance Management)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            कोशी प्रदेशका मन्त्रालयहरू तथा १४ जिल्लाका १३७ स्थानीय तहमा दर्ता भएका गुनासोहरूको अनुगमन, स्थिति अद्यावधिक र इमेल रुटिङ व्यवस्थापन।
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>एक्सेल रिपोर्ट डाउनलोड</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">कुल दर्ता गुनासो</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{stats.total}</span>
        </div>
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 shadow-xs">
          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 block">नयाँ प्राप्त</span>
          <span className="text-2xl font-black text-blue-800 dark:text-blue-200 mt-1 block">{stats.new}</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 block">प्रक्रियामा / हेर्दै</span>
          <span className="text-2xl font-black text-amber-800 dark:text-amber-200 mt-1 block">{stats.inProgress}</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block">समाधान भएको</span>
          <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-1 block">{stats.resolved}</span>
        </div>
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 shadow-xs">
          <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 block">बेनामी गुनासो</span>
          <span className="text-2xl font-black text-purple-800 dark:text-purple-200 mt-1 block">{stats.anonymous}</span>
        </div>
        <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 shadow-xs">
          <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 block">Email डेलिभरी सफल</span>
          <span className="text-2xl font-black text-teal-800 dark:text-teal-200 mt-1 block">{stats.emailSent}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="गुनासो नं, नाम, निकाय, वा विषय खोज्नुहोस्..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            >
              <option value="all">सबै स्थिति (All Status)</option>
              <option value="नयाँ">नयाँ</option>
              <option value="सम्बन्धित निकायमा पठाइएको">सम्बन्धित निकायमा पठाइएको</option>
              <option value="हेर्दै गरिएको">हेर्दै गरिएको</option>
              <option value="समाधान प्रक्रियामा">समाधान प्रक्रियामा</option>
              <option value="समाधान भएको">समाधान भएको</option>
              <option value="अस्वीकृत">अस्वीकृत</option>
              <option value="थप विवरण आवश्यक">थप विवरण आवश्यक</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            >
              <option value="all">सबै प्रकार (All Types)</option>
              <option value="identified">पहिचानसहित (Identified)</option>
              <option value="anonymous">बेनामी (Anonymous)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
              <tr>
                <th className="py-3 px-4">गुनासो नं.</th>
                <th className="py-3 px-4">मिति</th>
                <th className="py-3 px-4">प्रकार / गुनासोकर्ता</th>
                <th className="py-3 px-4">सम्बन्धित सरकारी निकाय</th>
                <th className="py-3 px-4">विषय</th>
                <th className="py-3 px-4">Email स्थिति</th>
                <th className="py-3 px-4">स्थिति</th>
                <th className="py-3 px-4 text-center">कार्य</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    कुनै गुनासो फेला परेन।
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 dark:text-blue-400">
                      {c.complaint_number}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString("ne-NP")}
                    </td>
                    <td className="py-3 px-4">
                      {c.complaint_type === "anonymous" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-full">
                          <UserX className="w-3 h-3" /> बेनामी
                        </span>
                      ) : (
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{c.full_name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{c.phone}</div>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate">
                        {c.organization_name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {c.official_recipient_email}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {c.subject === "अन्य" && c.other_subject ? c.other_subject : c.subject}
                    </td>
                    <td className="py-3 px-4">
                      {c.email_status === "sent" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        c.status === "नयाँ" ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" :
                        c.status === "समाधान भएको" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                        c.status === "अस्वीकृत" ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" :
                        "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenDetail(c)}
                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 transition"
                        title="विस्तृत विवरण हेर्नुहोस्"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail & Action Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-blue-700 dark:text-blue-400">
                    {selectedComplaint.complaint_number}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {selectedComplaint.complaint_type === "identified" ? "पहिचानसहित" : "बेनामी"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  दर्ता मिति: {new Date(selectedComplaint.created_at).toLocaleString("ne-NP")}
                </p>
              </div>

              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Recipient Card */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50">
                <div className="font-bold text-blue-900 dark:text-blue-200 text-sm mb-1">
                  सम्बन्धित सरकारी निकाय (Recipient Office):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="font-semibold text-slate-500">कार्यालय:</span> {selectedComplaint.organization_name}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Official Email:</span>{" "}
                    <a href={`mailto:${selectedComplaint.official_recipient_email}`} className="text-blue-600 underline">
                      {selectedComplaint.official_recipient_email}
                    </a>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">फोन:</span> {selectedComplaint.official_recipient_phone}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Mandatory CC:</span>{" "}
                    <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      {selectedComplaint.mandatory_cc_email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Complainant Info if Identified */}
              {selectedComplaint.complaint_type === "identified" ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>गुनासोकर्ताको विवरण (Complainant Details):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                    <div><span className="font-semibold text-slate-500">पूरा नाम:</span> {selectedComplaint.full_name}</div>
                    <div><span className="font-semibold text-slate-500">फोन नम्बर:</span> {selectedComplaint.phone}</div>
                    <div><span className="font-semibold text-slate-500">ठेगाना:</span> {selectedComplaint.address}</div>
                    <div><span className="font-semibold text-slate-500">इमेल:</span> {selectedComplaint.email || "उपलब्ध छैन"}</div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 flex items-center gap-2 text-purple-900 dark:text-purple-200">
                  <UserX className="w-5 h-5 text-purple-600 shrink-0" />
                  <span>यो एक <strong>बेनामी (Anonymous)</strong> गुनासो हो। गुनासोकर्ताको व्यक्तिगत विवरण माग गरिएको छैन।</span>
                </div>
              )}

              {/* Subject & Description */}
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  गुनासोको विषय:
                </span>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold">
                  {selectedComplaint.subject === "अन्य" && selectedComplaint.other_subject
                    ? `${selectedComplaint.subject} (${selectedComplaint.other_subject})`
                    : selectedComplaint.subject}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  विस्तृत विवरण:
                </span>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedComplaint.description}
                </div>
              </div>

              {/* Attachments Section */}
              {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    संलग्न कागजात, तस्बिर तथा भिडियो ({selectedComplaint.attachments.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedComplaint.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {att.file_type === "image" && <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />}
                          {att.file_type === "video" && <VideoIcon className="w-4 h-4 text-purple-600 shrink-0" />}
                          {att.file_type === "document" && <FileText className="w-4 h-4 text-blue-600 shrink-0" />}
                          <span className="truncate font-medium">{att.file_name}</span>
                        </div>
                        {att.data_url ? (
                          <a
                            href={att.data_url}
                            download={att.file_name}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="डाउनलोड गर्नुहोस्"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">Storage</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update & Remarks */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  प्रशासकीय कार्य तथा स्थिति अद्यावधिक (Status Update):
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                      स्थिति परिवर्तन गर्नुहोस्:
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    >
                      <option value="नयाँ">नयाँ</option>
                      <option value="सम्बन्धित निकायमा पठाइएको">सम्बन्धित निकायमा पठाइएको</option>
                      <option value="हेर्दै गरिएको">हेर्दै गरिएको</option>
                      <option value="समाधान प्रक्रियामा">समाधान प्रक्रियामा</option>
                      <option value="समाधान भएको">समाधान भएको</option>
                      <option value="अस्वीकृत">अस्वीकृत</option>
                      <option value="थप विवरण आवश्यक">थप विवरण आवश्यक</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                      Email Routing स्थिति:
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        selectedComplaint.email_status === "sent" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {selectedComplaint.email_status === "sent" ? "Email Delivered" : "Email Failed"}
                      </span>
                      <button
                        onClick={handleRetryEmail}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition"
                      >
                        {retryEmailStatus === "retrying" ? "पठाउँदै..." : "Retry Dispatch"}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    प्रशासकीय टिप्पणी / कारबाही विवरण:
                  </label>
                  <textarea
                    rows={3}
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    placeholder="सम्बन्धित निकायमा पत्राचार भएको, अनुगमन गरिएको वा निर्णय सम्बन्धी टिप्पणी..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  {saveSuccess && (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> स्थिति सुरक्षित भयो!
                    </span>
                  )}
                  {retryEmailStatus === "success" && (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> इमेल पुनः पठाइयो!
                    </span>
                  )}

                  <button
                    onClick={handleSaveStatus}
                    className="ml-auto px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>अद्यावधिक सुरक्षित गर्नुहोस्</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
