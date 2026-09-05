"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import { 
  getProvinceContacts, 
  saveProvinceContacts, 
  getLocalGovernmentContacts, 
  saveLocalGovernmentContacts, 
  updateLocalContact, 
  updateProvinceContact, 
  exportContactsToExcel, 
  importContactsFromExcelRows,
  validateNepalMobileNumber,
  ProvinceContact, 
  LocalGovernmentContact 
} from "@/lib/contactService";
import * as XLSX from "xlsx";
import { 
  PhoneCall, 
  Building2, 
  Users, 
  Search, 
  Edit3, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Upload, 
  Eye, 
  EyeOff, 
  Filter, 
  FileSpreadsheet,
  Phone,
  ShieldCheck,
  RotateCcw
} from "lucide-react";

export default function AdminContactManager() {
  const [activeSubTab, setActiveSubTab] = useState<"local" | "province" | "import_export">("local");
  const [provinceContacts, setProvinceContacts] = useState<ProvinceContact[]>([]);
  const [localContacts, setLocalContacts] = useState<LocalGovernmentContact[]>([]);

  // Filters
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Editing State for Local Palika
  const [editingContact, setEditingContact] = useState<LocalGovernmentContact | null>(null);
  const [editForm, setEditForm] = useState({
    disability_facilitator_name: "",
    disability_facilitator_mobile: "",
    women_children_social_branch_name: "",
    women_children_social_branch_mobile: "",
    deputy_mayor_chairperson_name: "",
    deputy_mayor_chairperson_mobile: "",
    is_public: true,
  });
  const [formError, setFormError] = useState<string>("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>("");

  // Editing State for Province Contacts
  const [editingProvinceId, setEditingProvinceId] = useState<"ministry_koshi" | "nfdn_koshi" | null>(null);
  const [provinceEditForm, setProvinceEditForm] = useState({
    contact_person_name: "",
    contact_person_mobile: "",
    office_phone: "",
    email: "",
    address_ne: "",
    is_public: true,
  });

  // Import State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importResult, setImportResult] = useState<{
    successCount: number;
    skippedCount: number;
    errors: string[];
  } | null>(null);

  // Load Contacts
  useEffect(() => {
    const load = () => {
      setProvinceContacts(getProvinceContacts());
      setLocalContacts(getLocalGovernmentContacts());
    };
    load();

    window.addEventListener("dic_contacts_updated", load);
    return () => window.removeEventListener("dic_contacts_updated", load);
  }, []);

  // Filtered Local Contacts
  const filteredLocalContacts = useMemo(() => {
    return localContacts.filter((c) => {
      const matchDistrict = selectedDistrictFilter === "all" || c.district_id === selectedDistrictFilter;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchDistrict;

      const matchText = 
        c.local_government_name_ne.toLowerCase().includes(q) ||
        c.district_name_ne.toLowerCase().includes(q) ||
        (c.disability_facilitator_name || "").toLowerCase().includes(q) ||
        (c.disability_facilitator_mobile || "").includes(q) ||
        (c.women_children_social_branch_name || "").toLowerCase().includes(q) ||
        (c.women_children_social_branch_mobile || "").includes(q) ||
        (c.deputy_mayor_chairperson_name || "").toLowerCase().includes(q) ||
        (c.deputy_mayor_chairperson_mobile || "").includes(q);

      return matchDistrict && matchText;
    });
  }, [localContacts, selectedDistrictFilter, searchQuery]);

  // Open Edit Modal for a Palika
  const handleOpenEdit = (contact: LocalGovernmentContact) => {
    setEditingContact(contact);
    setEditForm({
      disability_facilitator_name: contact.disability_facilitator_name || "",
      disability_facilitator_mobile: contact.disability_facilitator_mobile || "",
      women_children_social_branch_name: contact.women_children_social_branch_name || "",
      women_children_social_branch_mobile: contact.women_children_social_branch_mobile || "",
      deputy_mayor_chairperson_name: contact.deputy_mayor_chairperson_name || "",
      deputy_mayor_chairperson_mobile: contact.deputy_mayor_chairperson_mobile || "",
      is_public: contact.is_public ?? true,
    });
    setFormError("");
  };

  // Save Palika Edit
  const handleSaveLocalContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;

    // Validate mobile numbers
    const v1 = validateNepalMobileNumber(editForm.disability_facilitator_mobile);
    if (!v1.isValid) {
      setFormError(`सहजकर्ता मोबाइल त्रुटि: ${v1.message}`);
      return;
    }
    const v2 = validateNepalMobileNumber(editForm.women_children_social_branch_mobile);
    if (!v2.isValid) {
      setFormError(`सामाजिक शाखा मोबाइल त्रुटि: ${v2.message}`);
      return;
    }
    const v3 = validateNepalMobileNumber(editForm.deputy_mayor_chairperson_mobile);
    if (!v3.isValid) {
      setFormError(`उपप्रमुख मोबाइल त्रुटि: ${v3.message}`);
      return;
    }

    updateLocalContact(editingContact.local_government_id, editForm);
    setEditingContact(null);
    setSaveSuccessMsg(`${editingContact.local_government_name_ne} को सम्पर्क विवरण सुरक्षित भयो।`);
    setTimeout(() => setSaveSuccessMsg(""), 4000);
  };

  // Open Province Contact Edit
  const handleOpenProvinceEdit = (contact: ProvinceContact) => {
    setEditingProvinceId(contact.id);
    setProvinceEditForm({
      contact_person_name: contact.contact_person_name || "",
      contact_person_mobile: contact.contact_person_mobile || "",
      office_phone: contact.office_phone || "",
      email: contact.email || "",
      address_ne: contact.address_ne || "",
      is_public: contact.is_public ?? true,
    });
    setFormError("");
  };

  // Save Province Contact Edit
  const handleSaveProvinceContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvinceId) return;

    const v = validateNepalMobileNumber(provinceEditForm.contact_person_mobile);
    if (!v.isValid) {
      setFormError(`सम्पर्क व्यक्ति मोबाइल त्रुटि: ${v.message}`);
      return;
    }

    updateProvinceContact(editingProvinceId, provinceEditForm);
    setEditingProvinceId(null);
    setSaveSuccessMsg("प्रदेशस्तरीय निकाय सम्पर्क विवरण अद्यावधिक भयो।");
    setTimeout(() => setSaveSuccessMsg(""), 4000);
  };

  // Toggle Single Palika Public Status directly
  const handleTogglePublic = (contact: LocalGovernmentContact) => {
    const nextStatus = !contact.is_public;
    updateLocalContact(contact.local_government_id, { is_public: nextStatus });
  };

  // Excel File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });

        const res = importContactsFromExcelRows(data);
        setImportResult(res);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (err) {
        console.error("Excel import error", err);
        setImportResult({
          successCount: 0,
          skippedCount: 0,
          errors: ["Excel फाइल पढ्न सकिएन। कृपया फाइल ढाँचा जाँच गर्नुहोस्।"]
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Module Top Bar with Sub-tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>सम्पर्क व्यवस्थापन मोड्युल (Contact Management)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            प्रदेशस्तरीय मन्त्रालय, महासंघ तथा १३७ वटै स्थानीय तहका आधिकारिक सम्पर्क विवरण, सहजकर्ता र मोबाइल नम्बर व्यवस्थापन।
          </p>
        </div>

        {/* Sub-tab Pills */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setActiveSubTab("local")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeSubTab === "local"
                ? "bg-blue-900 text-white shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            स्थानीय तह सम्पर्क (१३७)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("province")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeSubTab === "province"
                ? "bg-blue-900 text-white shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            प्रदेशस्तरीय निकाय सम्पर्क
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("import_export")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeSubTab === "import_export"
                ? "bg-blue-900 text-white shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            Excel Import / Export
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* SUBTAB 1: LOCAL GOVERNMENT CONTACTS (137 Palikas) */}
      {/* ============================================================= */}
      {activeSubTab === "local" && (
        <div className="space-y-4">
          
          {/* Filters & Actions Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            
            {/* District Filter */}
            <div className="sm:col-span-4">
              <label htmlFor="admin-dist-filter" className="sr-only">जिल्ला अनुसार फिल्टर</label>
              <select
                id="admin-dist-filter"
                value={selectedDistrictFilter}
                onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-hidden cursor-pointer"
              >
                <option value="all">कोशी प्रदेश समग्र (१४ वटै जिल्ला - १३७ स्थानीय तह)</option>
                {KOSHI_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name_ne} जिल्ला ({d.local_governments.length} स्थानीय तह)
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <label htmlFor="admin-search-palika" className="sr-only">स्थानीय तह वा नाम खोज्नुहोस्</label>
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="admin-search-palika"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="स्थानीय तह, सहजकर्ता, शाखा प्रमुख वा नम्बर खोज्नुहोस्..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            {/* Export Button */}
            <div className="sm:col-span-3 flex sm:justify-end">
              <button
                type="button"
                onClick={exportContactsToExcel}
                className="w-full sm:w-auto px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                title="१३७ वटै स्थानीय तहको सम्पर्क विवरण Excel मा डाउनलोड गर्नुहोस्"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel Export (१३७)</span>
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>जम्मा {filteredLocalContacts.length} स्थानीय तह देखाइएको छ</span>
            <span>Public / Hidden स्थिति प्रत्येक तालिकाबाटै नियन्त्रण गर्न सकिन्छ</span>
          </div>

          {/* Contacts Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th scope="col" className="p-3">स्थानीय तह / जिल्ला</th>
                  <th scope="col" className="p-3">(क) अपाङ्गता सहायता सहजकर्ता</th>
                  <th scope="col" className="p-3">(ख) सामाजिक शाखा प्रमुख</th>
                  <th scope="col" className="p-3">(ग) उपप्रमुख / उपाध्यक्ष</th>
                  <th scope="col" className="p-3 text-center">दृश्यता (Public)</th>
                  <th scope="col" className="p-3 text-right">कार्य (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {filteredLocalContacts.map((c) => (
                  <tr key={c.local_government_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    
                    {/* Palika & District */}
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">
                        {c.local_government_name_ne}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {c.district_name_ne} जिल्ला
                      </span>
                    </td>

                    {/* (क) सहजकर्ता */}
                    <td className="p-3">
                      {c.disability_facilitator_name ? (
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {c.disability_facilitator_name}
                          </span>
                          <span className="text-[11px] font-mono text-blue-700 dark:text-blue-400">
                            {c.disability_facilitator_mobile || "-"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">[उपलब्ध हुन बाँकी]</span>
                      )}
                    </td>

                    {/* (ख) सामाजिक शाखा */}
                    <td className="p-3">
                      {c.women_children_social_branch_name ? (
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {c.women_children_social_branch_name}
                          </span>
                          <span className="text-[11px] font-mono text-purple-700 dark:text-purple-400">
                            {c.women_children_social_branch_mobile || "-"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">[उपलब्ध हुन बाँकी]</span>
                      )}
                    </td>

                    {/* (ग) उपप्रमुख */}
                    <td className="p-3">
                      {c.deputy_mayor_chairperson_name ? (
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {c.deputy_mayor_chairperson_name}
                          </span>
                          <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
                            {c.deputy_mayor_chairperson_mobile || "-"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">[उपलब्ध हुन बाँकी]</span>
                      )}
                    </td>

                    {/* Public Status Toggle */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePublic(c)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                          c.is_public
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                            : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                        }`}
                        title={c.is_public ? "सार्वजनिक छ (क्लिक गरी गोप्य बनाउनुहोस्)" : "गोप्य छ (क्लिक गरी सार्वजनिक बनाउनुहोस्)"}
                      >
                        {c.is_public ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{c.is_public ? "सार्वजनिक" : "गोप्य"}</span>
                      </button>
                    </td>

                    {/* Edit Action Button */}
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(c)}
                        className="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer ml-auto"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>सम्पादन</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ============================================================= */}
      {/* SUBTAB 2: PROVINCE CONTACTS (Ministry & NFDN) */}
      {/* ============================================================= */}
      {activeSubTab === "province" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {provinceContacts.map((contact) => (
            <div 
              key={contact.id} 
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                    {contact.id === "ministry_koshi" ? "सामाजिक विकास मन्त्रालय" : "राष्ट्रिय अपाङ्ग महासंघ"}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    contact.is_public 
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}>
                    {contact.is_public ? "सार्वजनिक (Public)" : "गोप्य (Hidden)"}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {contact.organization_name_ne}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {contact.organization_name_en}
                </p>

                <div className="mt-5 space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-500 block">सम्पर्क व्यक्ति:</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {contact.contact_person_name || "[नाम उपलब्ध हुन बाँकी]"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-500 block">सम्पर्क व्यक्तिको मोबाइल नं.:</span>
                    <span className="font-bold text-sm font-mono text-blue-900 dark:text-blue-300">
                      {contact.contact_person_mobile || "[मोबाइल नम्बर उपलब्ध हुन बाँकी]"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400 pt-1">
                    <div>
                      <span className="text-[11px] text-slate-500 block">कार्यालय फोन:</span>
                      <span className="font-semibold">{contact.office_phone || "-"}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">इमेल:</span>
                      <span className="font-semibold truncate">{contact.email || "-"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  अन्तिम अद्यावधिक: {contact.updated_at || "२०८२/०५/०१"}
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenProvinceEdit(contact)}
                  className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>विवरण सम्पादन गर्नुहोस्</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================= */}
      {/* SUBTAB 3: EXCEL IMPORT & EXPORT ARCHITECTURE */}
      {/* ============================================================= */}
      {activeSubTab === "import_export" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Export Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black text-xl mb-4">
                  <Download className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  १. सम्पर्क विवरण Excel Export (डाउनलोड)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  कोशी प्रदेशका १४ जिल्ला र १३७ वटै स्थानीय तहको हालको सम्पर्क विवरण तथा प्रदेशस्तरीय निकायहरूको डेटा Excel फाइल (.xlsx) मा डाउनलोड गर्नुहोस्।
                </p>
                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 space-y-1">
                  <div>✓ १३७ स्थानीय तहका सबै ३ ओटै पदका विवरणहरू</div>
                  <div>✓ Excel Import का लागि उपयुक्त मानक हेडर टेम्प्लेट</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={exportContactsToExcel}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>पूर्ण सम्पर्क Excel डाउनलोड गर्नुहोस्</span>
                </button>
              </div>
            </div>

            {/* Import Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-black text-xl mb-4">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  २. सम्पर्क विवरण Excel Import (अपलोड)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  १३७ स्थानीय तहको सम्पर्क विवरण Excel फाइलबाट एकैपटक प्रणालीमा प्रविष्टि वा अद्यावधिक (Batch Update) गर्नुहोस्।
                </p>

                <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-xs text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900 space-y-1">
                  <div>✓ जिल्ला तथा स्थानीय तह ID स्वतः प्रमाणीकरण (Validation)</div>
                  <div>✓ १० अंकको मोबाइल नम्बर प्रमाणीकरण</div>
                  <div>✓ दोहोरिएको पत्ता लगाउने (Duplicate Detection)</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="excel-contact-upload"
                />
                <label
                  htmlFor="excel-contact-upload"
                  className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Excel फाइल छनौट गरी Import गर्नुहोस्</span>
                </label>
              </div>
            </div>

          </div>

          {/* Import Result Notification */}
          {importResult && (
            <div className={`p-6 rounded-2xl border ${
              importResult.errors.length === 0 
                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-900 dark:text-emerald-200"
                : "bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-900 dark:text-amber-200"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-black text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Excel Import नतिजा सारांश:</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setImportResult(null)}
                  className="text-xs font-bold hover:underline"
                >
                  बन्द गर्नुहोस्
                </button>
              </div>
              <div className="text-xs space-y-1">
                <div>✓ सफलतापूर्वक अद्यावधिक भएका स्थानीय तह: <span className="font-bold font-mono">{importResult.successCount}</span></div>
                {importResult.skippedCount > 0 && (
                  <div>ℹ️ फेला नपरेका / स्किप गरिएका पङ्क्ति: <span className="font-mono">{importResult.skippedCount}</span></div>
                )}
                {importResult.errors.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-amber-300 text-rose-700 dark:text-rose-400">
                    <span className="font-bold block mb-1">जाँच गर्दा फेला परेका त्रुटि वा चेतावनीहरू:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {importResult.errors.slice(0, 5).map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li>...र अन्य {importResult.errors.length - 5} वटा</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 1: EDIT LOCAL PALIKA CONTACT */}
      {/* ============================================================= */}
      {editingContact && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border-2 border-blue-600 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 rounded-full">
                  सम्पर्क विवरण सम्पादन
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {editingContact.local_government_name_ne}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {editingContact.district_name_ne} जिल्ला, कोशी प्रदेश (ID: {editingContact.local_government_id})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingContact(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 text-xs font-bold border border-rose-300 dark:border-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveLocalContact} className="py-5 space-y-5 text-xs">
              
              {/* Role 1: अपाङ्गता सहायता सहजकर्ता */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-3">
                <span className="font-black text-blue-900 dark:text-blue-300 text-xs uppercase tracking-wide block">
                  (क) अपाङ्गता सहायता सहजकर्ता
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      सहजकर्ताको नाम:
                    </label>
                    <input
                      type="text"
                      value={editForm.disability_facilitator_name}
                      onChange={(e) => setEditForm({ ...editForm, disability_facilitator_name: e.target.value })}
                      placeholder="उदा. रमेश खतिवडा"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      सहजकर्ताको मोबाइल नं.:
                    </label>
                    <input
                      type="tel"
                      value={editForm.disability_facilitator_mobile}
                      onChange={(e) => setEditForm({ ...editForm, disability_facilitator_mobile: e.target.value })}
                      placeholder="उदा. 98XXXXXXXX"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium font-mono focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Role 2: महिला, बालबालिका / सामाजिक शाखा प्रमुख वा प्रतिनिधि */}
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 space-y-3">
                <span className="font-black text-purple-900 dark:text-purple-300 text-xs uppercase tracking-wide block">
                  (ख) महिला, बालबालिका / सामाजिक शाखा प्रमुख वा प्रतिनिधि
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      शाखा प्रमुखको नाम:
                    </label>
                    <input
                      type="text"
                      value={editForm.women_children_social_branch_name}
                      onChange={(e) => setEditForm({ ...editForm, women_children_social_branch_name: e.target.value })}
                      placeholder="उदा. सीता देवी गुरुङ"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      शाखा प्रमुखको मोबाइल नं.:
                    </label>
                    <input
                      type="tel"
                      value={editForm.women_children_social_branch_mobile}
                      onChange={(e) => setEditForm({ ...editForm, women_children_social_branch_mobile: e.target.value })}
                      placeholder="उदा. 98XXXXXXXX"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium font-mono focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Role 3: उपप्रमुख / उपाध्यक्ष */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-3">
                <span className="font-black text-amber-900 dark:text-amber-300 text-xs uppercase tracking-wide block">
                  (ग) उपप्रमुख / उपाध्यक्ष
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      उपप्रमुख/उपाध्यक्षको नाम:
                    </label>
                    <input
                      type="text"
                      value={editForm.deputy_mayor_chairperson_name}
                      onChange={(e) => setEditForm({ ...editForm, deputy_mayor_chairperson_name: e.target.value })}
                      placeholder="उदा. राधाकृष्ण न्यौपाने"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      उपप्रमुखको सम्पर्क नं.:
                    </label>
                    <input
                      type="tel"
                      value={editForm.deputy_mayor_chairperson_mobile}
                      onChange={(e) => setEditForm({ ...editForm, deputy_mayor_chairperson_mobile: e.target.value })}
                      placeholder="उदा. 98XXXXXXXX"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium font-mono focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Public Visibility Control */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    सार्वजनिक प्रदर्शन स्थिति (Public Visibility)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    यस स्थानीय तहको फोन नम्बर सार्वजनिक सम्पर्क पृष्ठमा नागरिकले हेर्न मिल्ने बनाउनुहोस्।
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, is_public: !editForm.is_public })}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    editForm.is_public
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {editForm.is_public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>{editForm.is_public ? "सार्वजनिक (Public)" : "गोप्य (Hidden)"}</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>सम्पर्क विवरण सुरक्षित गर्नुहोस्</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 2: EDIT PROVINCE CONTACT */}
      {/* ============================================================= */}
      {editingProvinceId && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 border-blue-600">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  प्रदेशस्तरीय निकाय सम्पर्क सम्पादन
                </h3>
                <p className="text-xs text-slate-500">
                  {editingProvinceId === "ministry_koshi" ? "सामाजिक विकास मन्त्रालय, कोशी प्रदेश" : "राष्ट्रिय अपाङ्ग महासंघ नेपाल, कोशी प्रदेश"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProvinceId(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-100 text-rose-900 text-xs font-bold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProvinceContact} className="py-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">सम्पर्क व्यक्तिको नाम:</label>
                <input
                  type="text"
                  value={provinceEditForm.contact_person_name}
                  onChange={(e) => setProvinceEditForm({ ...provinceEditForm, contact_person_name: e.target.value })}
                  placeholder="उदा. रमेश अधिकारी"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">सम्पर्क व्यक्तिको मोबाइल नम्बर:</label>
                <input
                  type="tel"
                  value={provinceEditForm.contact_person_mobile}
                  onChange={(e) => setProvinceEditForm({ ...provinceEditForm, contact_person_mobile: e.target.value })}
                  placeholder="उदा. 98XXXXXXXX"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">कार्यालय फोन:</label>
                  <input
                    type="text"
                    value={provinceEditForm.office_phone}
                    onChange={(e) => setProvinceEditForm({ ...provinceEditForm, office_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">इमेल ठेगाना:</label>
                  <input
                    type="email"
                    value={provinceEditForm.email}
                    onChange={(e) => setProvinceEditForm({ ...provinceEditForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">ठेगाना:</label>
                <input
                  type="text"
                  value={provinceEditForm.address_ne}
                  onChange={(e) => setProvinceEditForm({ ...provinceEditForm, address_ne: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProvinceId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 text-white font-bold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>सुरक्षित गर्नुहोस्</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
