"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  GovernmentContact, 
  getGovernmentContacts, 
  saveGovernmentContacts, 
  parseContactsExcel, 
  exportGovernmentContactsToExcel 
} from "@/lib/grievanceService";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Save, 
  ShieldCheck, 
  RotateCcw,
  Check,
  FileSpreadsheet,
  Link as LinkIcon,
  Sparkles,
  Send,
  HelpCircle,
  Layers
} from "lucide-react";

export default function AdminGovernmentContacts() {
  const [contacts, setContacts] = useState<GovernmentContact[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "ministry" | "local_government">("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Post / Quick-Add Form State
  const [postType, setPostType] = useState<"ministry" | "local_government">("ministry");
  const [postMinistryId, setPostMinistryId] = useState<string>("custom_new");
  const [postMinistryName, setPostMinistryName] = useState<string>("");
  const [postDistrictId, setPostDistrictId] = useState<string>("panchthar");
  const [postPalikaId, setPostPalikaId] = useState<string>("");
  const [postPalikaName, setPostPalikaName] = useState<string>("");
  const [postEmail, setPostEmail] = useState<string>("");
  const [postPhone, setPostPhone] = useState<string>("");
  const [postAddress, setPostAddress] = useState<string>("");
  const [postStatusMessage, setPostStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<GovernmentContact | null>(null);
  const [modalForm, setModalForm] = useState({
    organization_name_ne: "",
    organization_name_en: "",
    organization_type: "ministry" as "ministry" | "local_government" | "provincial_office",
    ministry_id: "",
    district_id: "",
    local_government_id: "",
    official_email: "",
    official_phone: "",
    office_address: "",
    is_active: true,
    is_verified: true,
  });
  const [modalError, setModalError] = useState("");

  // Excel Import Modal
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    validContacts: GovernmentContact[];
    errors: string[];
    totalRows: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Contacts from Server API (with localStorage fallback)
  const loadContacts = async () => {
    try {
      const res = await fetch("/api/admin/contacts");
      if (res.ok) {
        const data = await res.json();
        if (data.contacts && Array.isArray(data.contacts)) {
          setContacts(data.contacts);
          saveGovernmentContacts(data.contacts); // sync to client localStorage
          return;
        }
      }
    } catch {
      // fallback to localStorage
    }
    setContacts(getGovernmentContacts());
  };

  useEffect(() => {
    loadContacts();

    const onUpdate = () => loadContacts();
    window.addEventListener("dic_gov_contacts_updated", onUpdate);
    return () => window.removeEventListener("dic_gov_contacts_updated", onUpdate);
  }, []);

  // Filtered Contacts for Table
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchTab = activeTab === "all" || c.organization_type === activeTab;
      const matchDistrict = districtFilter === "all" || c.district_id === districtFilter;
      const q = searchQuery.trim().toLowerCase();

      if (!q) return matchTab && matchDistrict;

      const matchQuery = 
        c.organization_name_ne.toLowerCase().includes(q) ||
        (c.organization_name_en && c.organization_name_en.toLowerCase().includes(q)) ||
        c.official_email.toLowerCase().includes(q) ||
        c.official_phone.includes(q) ||
        (c.office_address && c.office_address.toLowerCase().includes(q));

      return matchTab && matchDistrict && matchQuery;
    });
  }, [contacts, activeTab, districtFilter, searchQuery]);

  // Palikas for selected postDistrictId
  const postDistrictPalikas = useMemo(() => {
    const d = KOSHI_DISTRICTS.find((dist) => dist.id === postDistrictId);
    return d ? d.local_governments : [];
  }, [postDistrictId]);

  // Automatically update email/phone when selecting an existing ministry to edit in quick post
  const handleSelectExistingMinistry = (mId: string) => {
    setPostMinistryId(mId);
    if (mId === "custom_new") {
      setPostMinistryName("");
      setPostEmail("");
      setPostPhone("");
      setPostAddress("विराटनगर, मोरङ, कोशी प्रदेश");
    } else {
      const existing = contacts.find((c) => c.organization_type === "ministry" && (c.ministry_id === mId || c.id === mId));
      if (existing) {
        setPostMinistryName(existing.organization_name_ne);
        setPostEmail(existing.official_email);
        setPostPhone(existing.official_phone);
        setPostAddress(existing.office_address);
      }
    }
  };

  // Automatically update email/phone when selecting a palika in quick post
  const handleSelectExistingPalika = (pId: string) => {
    setPostPalikaId(pId);
    if (pId === "custom_palika") {
      setPostPalikaName("");
      setPostEmail("");
      setPostPhone("");
      setPostAddress("");
    } else {
      const p = postDistrictPalikas.find((item) => item.id === pId);
      const existing = contacts.find((c) => c.organization_type === "local_government" && c.local_government_id === pId);

      if (existing) {
        setPostPalikaName(existing.organization_name_ne);
        setPostEmail(existing.official_email);
        setPostPhone(existing.official_phone);
        setPostAddress(existing.office_address);
      } else if (p) {
        const d = KOSHI_DISTRICTS.find((dist) => dist.id === postDistrictId);
        setPostPalikaName(`${p.name_ne}, ${d?.name_ne || ""}`);
        const cleanSlug = p.name_en
          .toLowerCase()
          .replace(/ rural municipality| municipality| sub-metropolitan city| metropolitan city/g, "")
          .replace(/[^a-z0-9]/g, "");
        setPostEmail(`ito.${cleanSlug}mun@gmail.com`);
        setPostPhone("०२१-५२XXXX, ०२३-४XXXXX");
        setPostAddress(`${p.name_ne}, ${d?.name_ne || ""}, कोशी प्रदेश`);
      }
    }
  };

  // Handle Quick Post & Auto-Link
  const handlePostAndLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostStatusMessage(null);

    // Validation
    if (postType === "ministry") {
      if (!postMinistryName.trim()) {
        setPostStatusMessage({ type: "error", text: "कृपया मन्त्रालय/निकायको नाम प्रविष्टि गर्नुहोस्।" });
        return;
      }
    } else {
      if (!postDistrictId) {
        setPostStatusMessage({ type: "error", text: "कृपया जिल्ला छनौट गर्नुहोस्।" });
        return;
      }
      if (!postPalikaName.trim() && !postPalikaId) {
        setPostStatusMessage({ type: "error", text: "कृपया पालिकाको नाम छनौट वा प्रविष्टि गर्नुहोस्।" });
        return;
      }
    }

    if (!postEmail.trim() || !postEmail.includes("@") || !postEmail.includes(".")) {
      setPostStatusMessage({ type: "error", text: "कृपया मान्य आधिकारिक इमेल (उदा. official@gov.np) प्रविष्टि गर्नुहोस्।" });
      return;
    }

    setIsPosting(true);

    try {
      const orgName = postType === "ministry" 
        ? postMinistryName.trim()
        : postPalikaName.trim() || (postDistrictPalikas.find(p => p.id === postPalikaId)?.name_ne || "");

      const payload = {
        organization_type: postType,
        organization_name_ne: orgName,
        official_email: postEmail.trim(),
        official_phone: postPhone.trim() || "उपलब्ध छैन",
        office_address: postAddress.trim() || (postType === "ministry" ? "विराटनगर, मोरङ" : "कोशी प्रदेश"),
        district_id: postType === "local_government" ? postDistrictId : undefined,
        local_government_id: postType === "local_government" ? (postPalikaId !== "custom_palika" ? postPalikaId : undefined) : undefined,
        ministry_id: postType === "ministry" ? (postMinistryId !== "custom_new" ? postMinistryId : undefined) : undefined,
      };

      const res = await fetch("/api/admin/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "सम्पर्क सुरक्षित गर्न सकिएन।");
      }

      setPostStatusMessage({
        type: "success",
        text: `✅ ${data.message || "सम्पर्क सफलतापूर्वक सुरक्षित र अटो-लिङ्क भयो!"} अब यो इमेल गुनासो दर्ता फारममा तत्काल प्रयोग हुनेछ।`
      });

      // Reload contacts
      await loadContacts();

    } catch (err: any) {
      setPostStatusMessage({
        type: "error",
        text: err.message || "सम्पर्क लिङ्क गर्दा समस्या आयो।"
      });
    } finally {
      setIsPosting(false);
    }
  };

  // Open Edit Modal for a row
  const handleOpenEdit = (contact: GovernmentContact) => {
    setEditingContact(contact);
    setModalForm({
      organization_name_ne: contact.organization_name_ne,
      organization_name_en: contact.organization_name_en || "",
      organization_type: contact.organization_type,
      ministry_id: contact.ministry_id || "",
      district_id: contact.district_id || "",
      local_government_id: contact.local_government_id || "",
      official_email: contact.official_email,
      official_phone: contact.official_phone,
      office_address: contact.office_address,
      is_active: contact.is_active,
      is_verified: contact.is_verified,
    });
    setModalError("");
    setIsModalOpen(true);
  };

  // Save Modal Form
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.organization_name_ne.trim()) {
      setModalError("कार्यालय/मन्त्रालयको नाम अनिवार्य छ।");
      return;
    }
    if (!modalForm.official_email.trim() || !modalForm.official_email.includes("@")) {
      setModalError("कृपया मान्य आधिकारिक इमेल प्रविष्टि गर्नुहोस्।");
      return;
    }

    try {
      const payload = {
        ...modalForm,
        id: editingContact?.id,
      };

      const res = await fetch("/api/admin/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("अपडेट गर्न सकिएन।");

      await loadContacts();
      setIsModalOpen(false);
    } catch (err: any) {
      setModalError(err.message || "अपडेट गर्न सकिएन।");
    }
  };

  // Delete Contact
  const handleDelete = async (id: string) => {
    if (!confirm("के तपाईं यो सम्पर्क विवरण हटाउन चाहनुहुन्छ?")) return;
    try {
      const res = await fetch(`/api/admin/contacts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadContacts();
      } else {
        alert("सम्पर्क हटाउन सकिएन।");
      }
    } catch {
      alert("सम्पर्क हटाउन सकिएन।");
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (contact: GovernmentContact) => {
    const updated = { ...contact, is_active: !contact.is_active };
    await fetch("/api/admin/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });
    await loadContacts();
  };

  // Quick Inline Email Edit Prompt
  const handleQuickEditEmail = (contact: GovernmentContact) => {
    const newEmail = prompt(`'${contact.organization_name_ne}' को नयाँ आधिकारिक इमेल प्रविष्टि गर्नुहोस्:`, contact.official_email);
    if (!newEmail || !newEmail.trim() || newEmail.trim() === contact.official_email) return;

    if (!newEmail.includes("@") || !newEmail.includes(".")) {
      alert("कृपया मान्य इमेल ठेगाना प्रविष्टि गर्नुहोस्।");
      return;
    }

    const updated = { ...contact, official_email: newEmail.trim() };
    fetch("/api/admin/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    }).then(() => {
      loadContacts();
      alert(`✅ '${contact.organization_name_ne}' को इमेल अद्यावधिक भयो: ${newEmail.trim()}\nयो अब सार्वजनिक गुनासो फारममा अटोमेटिक लिङ्क भइसकेको छ।`);
    });
  };

  // Download Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "प्रकार": "मन्त्रालय",
        "जिल्ला": "",
        "स्थानीय तह": "",
        "कार्यालय/मन्त्रालय": "उदाहरण: सामाजिक विकास मन्त्रालय",
        "आधिकारिक Email": "grievance.mosd@koshi.gov.np",
        "आधिकारिक फोन": "०२१-४६२८००"
      },
      {
        "प्रकार": "स्थानीय तह",
        "जिल्ला": "पाँचथर",
        "स्थानीय तह": "फिदिम नगरपालिका",
        "कार्यालय/मन्त्रालय": "फिदिम नगरपालिका कार्यालय",
        "आधिकारिक Email": "ito.phidimmun@gmail.com",
        "आधिकारिक फोन": "०२१-५२०१२३"
      }
    ];

    const worksheet = (window as any).XLSX ? (window as any).XLSX.utils.json_to_sheet(templateData) : null;
    if (worksheet) {
      const workbook = (window as any).XLSX.utils.book_new();
      (window as any).XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
      (window as any).XLSX.writeFile(workbook, "dic_government_contacts_template.xlsx");
    } else {
      exportGovernmentContactsToExcel(contacts);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-linear-to-r from-blue-900 to-indigo-900 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-6 h-6 text-blue-300" />
            <h2 className="text-lg font-bold">सरकारी निकाय सम्पर्क तथा इमेल लिङ्क व्यवस्थापन</h2>
          </div>
          <p className="text-xs text-blue-100/80 leading-relaxed max-w-2xl">
            यहाँ मन्त्रालय र पालिकाको आधिकारिक इमेल र फोन थप वा सम्पादन गर्नुहोस्। पोस्ट गर्नासाथ सार्वजनिक <strong>गुनासो दर्ता फारम</strong> मा सोही इमेल <strong>अटोमेटिक लिङ्क</strong> हुनेछ।
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadTemplate}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Excel Template डाउनलोड"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel Export</span>
          </button>

          <button
            onClick={() => setIsImportOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs flex items-center gap-1.5 shadow-md transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Excel Import</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🚀 QUICK POST & AUTO-LINK BAR (मन्त्रालय र पालिकाको इमेल थप/पोस्ट गर्नुहोस्) */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-500/30 dark:border-blue-500/20 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>नयाँ इमेल थप वा अद्यावधिक (Quick Post & Auto-Link)</span>
                <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <LinkIcon className="w-2.5 h-2.5" /> अटोमेटिक लिङ्क सक्रिय
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                मन्त्रालय वा पालिकाको नाम र इमेल भरेर पोस्ट गर्नुहोस् — गुनासो प्रणालीमा तुरुन्तै लिङ्क हुनेछ।
              </p>
            </div>
          </div>

          {/* Type Toggle: Ministry vs Palika */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setPostType("ministry");
                setPostStatusMessage(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                postType === "ministry"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>मन्त्रालय/प्रदेश निकाय</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPostType("local_government");
                setPostStatusMessage(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                postType === "local_government"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>स्थानीय तह (पालिका)</span>
            </button>
          </div>
        </div>

        {/* Post Form */}
        <form onSubmit={handlePostAndLink} className="space-y-4">
          {postType === "ministry" ? (
            /* MINISTRY FIELDS */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  मन्त्रालय छनौट वा नयाँ *
                </label>
                <select
                  value={postMinistryId}
                  onChange={(e) => handleSelectExistingMinistry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  <option value="custom_new">+ नयाँ मन्त्रालय थप्नुहोस् (New Ministry)</option>
                  {contacts
                    .filter((c) => c.organization_type === "ministry")
                    .map((m) => (
                      <option key={m.id} value={m.ministry_id || m.id}>
                        {m.organization_name_ne}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  मन्त्रालयको पूरा नाम *
                </label>
                <input
                  type="text"
                  value={postMinistryName}
                  onChange={(e) => setPostMinistryName(e.target.value)}
                  placeholder="उदा. सामाजिक विकास मन्त्रालय"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  आधिकारिक Email (Routing Destination) *
                </label>
                <input
                  type="email"
                  value={postEmail}
                  onChange={(e) => setPostEmail(e.target.value)}
                  placeholder="grievance.mosd@koshi.gov.np"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  आधिकारिक फोन नम्बर
                </label>
                <input
                  type="text"
                  value={postPhone}
                  onChange={(e) => setPostPhone(e.target.value)}
                  placeholder="०२१-४६२८००"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>
            </div>
          ) : (
            /* PALIKA FIELDS */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  १. जिल्ला छनौट गर्नुहोस् *
                </label>
                <select
                  value={postDistrictId}
                  onChange={(e) => {
                    setPostDistrictId(e.target.value);
                    setPostPalikaId("");
                    setPostPalikaName("");
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  {KOSHI_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name_ne} ({d.local_governments.length} पालिका)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  २. पालिकाको नाम छनौट वा थप *
                </label>
                <select
                  value={postPalikaId}
                  onChange={(e) => handleSelectExistingPalika(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  <option value="">-- पालिका छनौट गर्नुहोस् --</option>
                  {postDistrictPalikas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name_ne}
                    </option>
                  ))}
                  <option value="custom_palika">+ अन्य नयाँ पालिका प्रविष्टि गर्नुहोस्</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ३. आधिकारिक Email (Routing Destination) *
                </label>
                <input
                  type="email"
                  value={postEmail}
                  onChange={(e) => setPostEmail(e.target.value)}
                  placeholder="ito.phidimmun@gmail.com"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ४. आधिकारिक फोन नम्बर
                </label>
                <input
                  type="text"
                  value={postPhone}
                  onChange={(e) => setPostPhone(e.target.value)}
                  placeholder="०२१-५२XXXX / ९८XXXXXXXX"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* If custom palika selected, show input for custom name */}
          {postType === "local_government" && postPalikaId === "custom_palika" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  नयाँ पालिकाको नाम प्रविष्टि गर्नुहोस् *
                </label>
                <input
                  type="text"
                  value={postPalikaName}
                  onChange={(e) => setPostPalikaName(e.target.value)}
                  placeholder="उदा. नयाँ नगरपालिका, पाँचथर"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  कार्यालयको ठेगाना
                </label>
                <input
                  type="text"
                  value={postAddress}
                  onChange={(e) => setPostAddress(e.target.value)}
                  placeholder="कार्यालय रहेको स्थान"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
            {postStatusMessage && (
              <div className={`text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                postStatusMessage.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800"
              }`}>
                {postStatusMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{postStatusMessage.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isPosting}
              className="ml-auto px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition"
            >
              {isPosting ? (
                <span>सुरक्षित गर्दै...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>इमेल पोस्ट गरी अटो-लिङ्क गर्नुहोस् (Post & Auto-Link)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 📋 MASTER CONTACTS & EMAIL LINKING TABLE (एकीकृत व्यवस्थापन टेबल) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Table Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab("all")}
              className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === "all"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>सबै सरकारी निकायहरू ({contacts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("ministry")}
              className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === "ministry"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>प्रदेश मन्त्रालयहरू ({contacts.filter((c) => c.organization_type === "ministry").length})</span>
            </button>

            <button
              onClick={() => setActiveTab("local_government")}
              className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === "local_government"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>१४ जिल्लाका पालिकाहरू ({contacts.filter((c) => c.organization_type === "local_government").length})</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>इमेल परिवर्तन गर्न तालिकामा रहेको <strong>फेर्नुहोस्</strong> बटन थिच्नुहोस्</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="कार्यालयको नाम, मन्त्रालय, पालिका, जिल्ला वा इमेल खोज्नुहोस्..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>

          {(activeTab === "local_government" || activeTab === "all") && (
            <div className="sm:w-64">
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="all">सबै १४ जिल्ला (All Districts)</option>
                {KOSHI_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name_ne} ({d.local_governments.length} पालिका)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* The Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                <tr>
                  <th className="py-3 px-4">प्रकार</th>
                  <th className="py-3 px-4">जिल्ला / क्षेत्र</th>
                  <th className="py-3 px-4">मन्त्रालय वा पालिकाको नाम</th>
                  <th className="py-3 px-4">आधिकारिक Email (Routing Destination)</th>
                  <th className="py-3 px-4">आधिकारिक फोन</th>
                  <th className="py-3 px-4 text-center">गुनासो अटो-लिङ्क स्थिति</th>
                  <th className="py-3 px-4 text-center">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      कुनै सरकारी निकाय फेला परेन।
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((c) => {
                    const distName = c.district_id 
                      ? KOSHI_DISTRICTS.find(d => d.id === c.district_id)?.name_ne || c.district_id
                      : "कोशी प्रदेश (केन्द्र)";

                    return (
                      <tr key={c.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition group">
                        {/* Type Badge */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {c.organization_type === "ministry" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/70 px-2 py-0.5 rounded-full">
                              <Building2 className="w-3 h-3" /> मन्त्रालय
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full">
                              <MapPin className="w-3 h-3" /> स्थानीय तह
                            </span>
                          )}
                        </td>

                        {/* District */}
                        <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {distName}
                        </td>

                        {/* Name */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{c.organization_name_ne}</div>
                          {c.office_address && (
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-xs">{c.office_address}</div>
                          )}
                        </td>

                        {/* Official Email + Quick Edit */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <a
                              href={`mailto:${c.official_email}`}
                              className="font-mono text-blue-600 dark:text-blue-400 hover:underline font-medium"
                              title="इमेल पठाउनुहोस्"
                            >
                              {c.official_email}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleQuickEditEmail(c)}
                              className="opacity-0 group-hover:opacity-100 transition px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-[10px] font-bold"
                              title="यो इमेल फेर्नुहोस्"
                            >
                              फेर्नुहोस्
                            </button>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {c.official_phone ? (
                            <a href={`tel:${c.official_phone.split(",")[0].trim()}`} className="hover:text-blue-600">
                              {c.official_phone}
                            </a>
                          ) : (
                            <span className="text-slate-400">उपलब्ध छैन</span>
                          )}
                        </td>

                        {/* Link Status */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {c.is_active ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full">
                              <Check className="w-2.5 h-2.5" /> अटो-लिङ्क सक्रिय
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              निष्क्रिय
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(c)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 hover:text-blue-600 text-slate-700 dark:text-slate-300 transition"
                              title="पूरा विवरण सम्पादन गर्नुहोस्"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleActive(c)}
                              className={`p-1.5 rounded-lg transition ${
                                c.is_active 
                                  ? "bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 text-amber-600" 
                                  : "bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-emerald-600"
                              }`}
                              title={c.is_active ? "निष्क्रिय बनाउनुहोस्" : "सक्रिय बनाउनुहोस्"}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>

                            {c.organization_type === "ministry" && (
                              <button
                                type="button"
                                onClick={() => handleDelete(c.id)}
                                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 transition"
                                title="हटाउनुहोस्"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* Edit Contact Modal */}
      {isModalOpen && editingContact && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>सरकारी सम्पर्क विवरण सम्पादन गर्नुहोस्</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveModal} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  कार्यालय / मन्त्रालयको नाम (नेपाली) *
                </label>
                <input
                  type="text"
                  value={modalForm.organization_name_ne}
                  onChange={(e) => setModalForm({ ...modalForm, organization_name_ne: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    आधिकारिक Email (Routing Destination) *
                  </label>
                  <input
                    type="email"
                    value={modalForm.official_email}
                    onChange={(e) => setModalForm({ ...modalForm, official_email: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    आधिकारिक फोन नम्बर
                  </label>
                  <input
                    type="text"
                    value={modalForm.official_phone}
                    onChange={(e) => setModalForm({ ...modalForm, official_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  कार्यालयको ठेगाना
                </label>
                <input
                  type="text"
                  value={modalForm.office_address}
                  onChange={(e) => setModalForm({ ...modalForm, office_address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalForm.is_active}
                    onChange={(e) => setModalForm({ ...modalForm, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">सक्रिय (Active in Grievance Form)</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    रद्द गर्नुहोस्
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>अपडेट गरी लिङ्क गर्नुहोस्</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Excel बाट सरकारी सम्पर्क Import गर्नुहोस्</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsImportOpen(false);
                  setImportPreview(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              सरकारी निकायहरूको आधिकारिक Email र Phone भएको Excel वा CSV फाइल अपलोड गर्नुहोस्। यसले अटोमेटिक रूपमा इमेल भ्यालिडेसन र डुप्लिकेट चेक गर्नेछ।
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const buffer = await file.arrayBuffer();
                const result = await parseContactsExcel(buffer);
                setImportPreview(result);
              }}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-300 mb-4"
            />

            {importPreview && (
              <div className="space-y-3 mb-4">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs flex items-center justify-between">
                  <span>कुल पङ्क्तिहरू: <strong>{importPreview.totalRows}</strong></span>
                  <span className="text-emerald-600 font-bold">मान्य: {importPreview.validContacts.length}</span>
                  {importPreview.errors.length > 0 && (
                    <span className="text-rose-600 font-bold">त्रुटि: {importPreview.errors.length}</span>
                  )}
                </div>

                {importPreview.errors.length > 0 && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 max-h-32 overflow-y-auto text-[11px] text-rose-700 dark:text-rose-300">
                    <div className="font-bold mb-1">त्रुटि विवरण:</div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {importPreview.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsImportOpen(false);
                  setImportPreview(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                रद्द गर्नुहोस्
              </button>

              {importPreview && importPreview.validContacts.length > 0 && (
                <button
                  type="button"
                  onClick={async () => {
                    const res = await fetch("/api/admin/contacts", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ contacts: importPreview.validContacts })
                    });
                    if (res.ok) {
                      await loadContacts();
                      setIsImportOpen(false);
                      setImportPreview(null);
                      alert(`✅ ${importPreview.validContacts.length} वटा सम्पर्क सफलतापूर्वक Import र अटो-लिङ्क गरियो!`);
                    } else {
                      alert("Import असफल भयो।");
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Import पुष्टि गरी लिङ्क गर्नुहोस्</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
