"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  ComplaintType, 
  RecipientType, 
  ComplaintSubject, 
  COMPLAINT_SUBJECTS, 
  GovernmentContact, 
  AttachmentData, 
  Complaint, 
  getGrievanceSettings, 
  getGovernmentContacts, 
  saveComplaint, 
  findComplaintByNumber 
} from "@/lib/grievanceService";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import { useAccessibility } from "@/lib/accessibilityContext";
import { 
  ShieldCheck, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  User, 
  UserX, 
  Search, 
  RotateCcw, 
  Printer, 
  Copy, 
  Check, 
  X, 
  Clock, 
  ExternalLink,
  HelpCircle,
  Loader2
} from "lucide-react";

export default function GovernmentGrievanceForm() {
  const { announceLive, speakText, audioPin } = useAccessibility();

  // Active Main Tab: Submit vs Track
  const [activeTab, setActiveTab] = useState<"submit" | "track">("submit");

  // Form State
  const [complaintType, setComplaintType] = useState<ComplaintType | "">("");
  
  // Identified Fields
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Recipient Agency State
  const [recipientType, setRecipientType] = useState<RecipientType>("ministry");
  const [selectedMinistryId, setSelectedMinistryId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedPalikaId, setSelectedPalikaId] = useState("");

  // Content
  const [subject, setSubject] = useState<ComplaintSubject>("अपाङ्गता परिचयपत्र");
  const [otherSubject, setOtherSubject] = useState("");
  const [description, setDescription] = useState("");

  // Attachments State
  const [attachments, setAttachments] = useState<AttachmentData[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Anti-spam math challenge (Accessible)
  const [mathChallenge, setMathChallenge] = useState<{ num1: number; num2: number; answer: number }>({ num1: 4, num2: 3, answer: 7 });
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState(false);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Tracking State
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackedComplaint, setTrackedComplaint] = useState<Complaint | null | "not_found">(null);
  const [isTracking, setIsTracking] = useState(false);

  // Master Contacts & Settings
  const [govContacts, setGovContacts] = useState<GovernmentContact[]>([]);
  const [settings, setSettings] = useState(() => getGrievanceSettings());

  // Load Contacts & Settings
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/contacts");
        if (res.ok) {
          const data = await res.json();
          if (data.contacts && Array.isArray(data.contacts)) {
            setGovContacts(data.contacts);
            setSettings(getGrievanceSettings());
            return;
          }
        }
      } catch {
        // fallback
      }
      setGovContacts(getGovernmentContacts());
      setSettings(getGrievanceSettings());
    };
    load();

    window.addEventListener("dic_gov_contacts_updated", load);
    window.addEventListener("dic_grievance_settings_updated", load);
    return () => {
      window.removeEventListener("dic_gov_contacts_updated", load);
      window.removeEventListener("dic_grievance_settings_updated", load);
    };
  }, []);

  // Generate new math captcha on load
  useEffect(() => {
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 8) + 1;
    setMathChallenge({ num1: n1, num2: n2, answer: n1 + n2 });
  }, []);

  // Ministries list
  const ministries = useMemo(() => {
    return govContacts.filter((c) => c.organization_type === "ministry" && c.is_active);
  }, [govContacts]);

  // Selected District & Palikas (dynamically merged with admin contacts)
  const selectedDistrict = useMemo(() => {
    return KOSHI_DISTRICTS.find((d) => d.id === selectedDistrictId);
  }, [selectedDistrictId]);

  const availablePalikas = useMemo(() => {
    if (!selectedDistrictId) return [];
    const fromGeography = selectedDistrict ? selectedDistrict.local_governments.map(p => ({
      id: p.id,
      name_ne: p.name_ne,
      name_en: p.name_en,
      type: p.type
    })) : [];

    // Also get all active local governments from govContacts for this district
    const fromContacts = govContacts.filter(
      c => c.organization_type === "local_government" && c.district_id === selectedDistrictId && c.is_active
    );

    const map = new Map<string, { id: string; name_ne: string; name_en: string; type?: string }>();
    
    fromGeography.forEach(p => {
      map.set(p.id, { id: p.id, name_ne: p.name_ne, name_en: p.name_en, type: p.type });
    });

    fromContacts.forEach(c => {
      const key = c.local_government_id || c.id;
      const existing = map.get(key);
      if (existing) {
        map.set(key, {
          ...existing,
          name_ne: c.organization_name_ne.split(",")[0].trim() || existing.name_ne,
        });
      } else {
        map.set(key, {
          id: key,
          name_ne: c.organization_name_ne.split(",")[0].trim(),
          name_en: c.organization_name_en?.split(",")[0].trim() || key,
          type: "municipality"
        });
      }
    });

    return Array.from(map.values());
  }, [selectedDistrictId, selectedDistrict, govContacts]);

  // Handle District Change (resets Palika)
  const handleDistrictChange = (dId: string) => {
    setSelectedDistrictId(dId);
    setSelectedPalikaId("");
    if (audioPin && dId) {
      const d = KOSHI_DISTRICTS.find((item) => item.id === dId);
      if (d) speakText(`${d.name_ne} जिल्ला छनौट गरियो। अब स्थानीय तह छनौट गर्नुहोस्।`);
    }
  };

  // Selected Recipient Contact Record
  const activeRecipientContact = useMemo(() => {
    if (recipientType === "ministry") {
      if (!selectedMinistryId) return null;
      return govContacts.find((c) => c.organization_type === "ministry" && (c.ministry_id === selectedMinistryId || c.id === selectedMinistryId)) || null;
    } else {
      if (!selectedPalikaId) return null;
      return govContacts.find((c) => c.organization_type === "local_government" && (c.local_government_id === selectedPalikaId || c.id === selectedPalikaId)) || null;
    }
  }, [recipientType, selectedMinistryId, selectedPalikaId, govContacts]);

  // File Upload Handlers
  const handleFileUpload = (type: "document" | "image" | "video", files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const maxMb = type === "video" 
        ? settings.max_video_size_mb 
        : type === "image" 
          ? settings.max_img_size_mb 
          : settings.max_doc_size_mb;

      if (file.size > maxMb * 1024 * 1024) {
        alert(`${file.name} को साइज ${maxMb} MB भन्दा धेरै छ। कृपया सानो फाइल छान्नुहोस्।`);
        continue;
      }

      setUploadProgress(40);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(null), 500);

        const newAtt: AttachmentData = {
          id: `att_${Date.now()}_${i}`,
          file_type: type,
          file_name: file.name,
          mime_type: file.type,
          file_size: file.size,
          data_url: e.target?.result as string,
        };

        setAttachments((prev) => [...prev, newAtt]);
        announceLive(`${file.name} सफलतापूर्वक संलग्न गरियो।`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove attachment
  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Handle Submit Complaint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!complaintType) {
      setFormError("कृपया पहिले गुनासोको प्रकार (पहिचानसहित वा बेनामी) छनौट गर्नुहोस्।");
      return;
    }

    if (complaintType === "identified") {
      if (!fullName.trim() || !address.trim() || !phone.trim()) {
        setFormError("कृपया पूरा नाम, ठेगाना र सम्पर्क फोन नम्बर अनिवार्य भर्नुहोस्।");
        return;
      }
    }

    if (recipientType === "ministry" && !selectedMinistryId) {
      setFormError("कृपया सम्बन्धित मन्त्रालय/निकाय छनौट गर्नुहोस्।");
      return;
    }

    if (recipientType === "local_government" && (!selectedDistrictId || !selectedPalikaId)) {
      setFormError("कृपया सम्बन्धित जिल्ला तथा स्थानीय तह छनौट गर्नुहोस्।");
      return;
    }

    if (subject === "अन्य" && !otherSubject.trim()) {
      setFormError("कृपया 'अन्य' विषय खुलाउनुहोस्।");
      return;
    }

    if (!description.trim()) {
      setFormError("कृपया गुनासोको विस्तृत विवरण लेख्नुहोस्।");
      return;
    }

    // Check Math Captcha
    if (parseInt(captchaInput.trim(), 10) !== mathChallenge.answer) {
      setCaptchaError(true);
      setFormError("सुरक्षा प्रमाणीकरण अंक मिलेन। कृपया पुन: प्रयास गर्नुहोस्।");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        complaint_type: complaintType,
        full_name: complaintType === "identified" ? fullName.trim() : undefined,
        address: complaintType === "identified" ? address.trim() : undefined,
        phone: complaintType === "identified" ? phone.trim() : undefined,
        email: complaintType === "identified" && email.trim() ? email.trim() : undefined,
        recipient_type: recipientType,
        ministry_id: recipientType === "ministry" ? selectedMinistryId : undefined,
        district_id: recipientType === "local_government" ? selectedDistrictId : undefined,
        local_government_id: recipientType === "local_government" ? selectedPalikaId : undefined,
        subject,
        other_subject: subject === "अन्य" ? otherSubject.trim() : undefined,
        description: description.trim(),
        attachments: attachments.map((a) => ({
          file_type: a.file_type,
          file_name: a.file_name,
          mime_type: a.mime_type,
          file_size: a.file_size,
          data_url: a.data_url,
        })),
      };

      const res = await fetch("/api/grievance/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "सर्भर त्रुटि");
      }

      const data = await res.json();
      const savedRecord: Complaint = data.complaint;

      // Save locally as backup
      saveComplaint(savedRecord);

      setSubmittedComplaint(savedRecord);
      announceLive(`गुनासो सफलतापूर्वक दर्ता भयो। गुनासो नम्बर ${savedRecord.complaint_number}`);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setFormError(err.message || "गुनासो दर्ता हुन सकेन। कृपया आफ्नो इन्टरनेट जडान जाँच गर्नुहोस्।");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset for new complaint
  const handleResetForm = () => {
    setSubmittedComplaint(null);
    setComplaintType("");
    setFullName("");
    setAddress("");
    setPhone("");
    setEmail("");
    setSelectedMinistryId("");
    setSelectedDistrictId("");
    setSelectedPalikaId("");
    setSubject("अपाङ्गता परिचयपत्र");
    setOtherSubject("");
    setDescription("");
    setAttachments([]);
    setCaptchaInput("");
    setFormError(null);
    setCaptchaError(false);

    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 8) + 1;
    setMathChallenge({ num1: n1, num2: n2, answer: n1 + n2 });
  };

  // Handle Track Complaint Search
  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setIsTracking(true);
    const found = findComplaintByNumber(trackingNumber.trim());

    setTimeout(() => {
      setIsTracking(false);
      if (found) {
        setTrackedComplaint(found);
        announceLive(`गुनासो नम्बर ${found.complaint_number} को अवस्था लोड गरियो: ${found.status}`);
      } else {
        setTrackedComplaint("not_found");
        announceLive("गुनासो फेला परेन। कृपया सही नम्बर प्रविष्टि गर्नुहोस्।");
      }
    }, 400);
  };

  return (
    <section 
      aria-labelledby="grievance-heading" 
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-12 transition-all"
    >
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 id="grievance-heading" className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            <span>अनलाइन सरकारी गुनासो दर्ता प्रणाली (Government Grievance System)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            कोशी प्रदेश सरकारका मन्त्रालयहरू तथा १४ जिल्लाका १३७ वटै स्थानीय तहका लागि आधिकारिक, सुरक्षित र पहुँचयुक्त गुनासो दर्ता तथा अनुगमन।
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl self-start sm:self-auto border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab("submit")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "submit"
                ? "bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            गुनासो दर्ता फारम
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("track")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "track"
                ? "bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>गुनासोको अवस्था हेर्नुहोस् (Track)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: COMPLAINT SUBMISSION */}
      {/* ========================================================================= */}
      {activeTab === "submit" && (
        <>
          {submittedComplaint ? (
            /* SUCCESS CONFIRMATION RECEIPT */
            <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-slate-100 space-y-6 animate-in zoom-in-95">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-2xl shadow-lg">
                  ✓
                </div>
                <h3 className="text-xl font-black text-emerald-950 dark:text-emerald-200">
                  तपाईंको गुनासो सफलतापूर्वक दर्ता भएको छ!
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
                  सम्बन्धित निकायको आधिकारिक इमेलमा गुनासो सम्प्रेषण गरिएको छ। साथै कोशी प्रदेश सामाजिक विकास मन्त्रालयमा समेत सुरक्षित प्रतिलिपि (Mandatory CC) पठाइएको छ।
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="max-w-xl mx-auto p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 shadow-sm space-y-3 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">आधिकारिक गुनासो नम्बर (Unique Complaint No.)</span>
                    <span className="font-mono text-lg font-black text-blue-700 dark:text-blue-400">
                      {submittedComplaint.complaint_number}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(submittedComplaint.complaint_number);
                      setCopiedId(true);
                      setTimeout(() => setCopiedId(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold transition flex items-center gap-1"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId ? "कपी भयो" : "नम्बर कपी"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="font-semibold text-slate-500">दर्ता मिति:</span>{" "}
                    {new Date(submittedComplaint.created_at).toLocaleString("ne-NP")}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">गुनासोको प्रकार:</span>{" "}
                    {submittedComplaint.complaint_type === "identified" ? "पहिचानसहित" : "बेनामी (Anonymous)"}
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-slate-500">सम्बन्धित निकाय:</span>{" "}
                    <strong>{submittedComplaint.organization_name}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-slate-500">प्रापक आधिकारिक Email:</span>{" "}
                    <span className="font-mono text-blue-600 dark:text-blue-400">{submittedComplaint.official_recipient_email}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-slate-500">सामाजिक विकास मन्त्रालयमा CC:</span>{" "}
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                      {submittedComplaint.mandatory_cc_email} (सम्प्रेषित)
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-slate-500">विषय:</span>{" "}
                    {submittedComplaint.subject === "अन्य" ? submittedComplaint.other_subject : submittedComplaint.subject}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-100 text-xs font-bold transition flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>रसिद प्रिन्ट गर्नुहोस्</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-md transition"
                >
                  अर्को नयाँ गुनासो दर्ता गर्नुहोस्
                </button>
              </div>
            </div>
          ) : (
            /* COMPLAINT SUBMISSION FORM */
            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {formError && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. COMPLAINT TYPE SELECTION */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  १. गुनासोको प्रकार छनौट गर्नुहोस् (Complaint Type) <span className="text-rose-500">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      complaintType === "identified"
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-600 ring-2 ring-blue-600/30 text-blue-950 dark:text-blue-200"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="complaint_type"
                      checked={complaintType === "identified"}
                      onChange={() => setComplaintType("identified")}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        <User className="w-4 h-4 text-blue-600" />
                        <span>पहिचानसहित गुनासो गर्ने</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        तपाईंको नाम, ठेगाना र फोन नम्बर उल्लेख गरिनेछ। सम्बन्धित निकायले प्रत्यक्ष सम्पर्क गरी प्रतिक्रिया दिनेछ।
                      </p>
                    </div>
                  </label>

                  <label
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      complaintType === "anonymous"
                        ? "bg-purple-50 dark:bg-purple-950/60 border-purple-600 ring-2 ring-purple-600/30 text-purple-950 dark:text-purple-200"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="complaint_type"
                      checked={complaintType === "anonymous"}
                      onChange={() => setComplaintType("anonymous")}
                      className="mt-0.5 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        <UserX className="w-4 h-4 text-purple-600" />
                        <span>बेनामी गुनासो गर्ने (Anonymous)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        तपाईंको व्यक्तिगत परिचय पूर्ण रूपमा गोप्य रहनेछ। कुनै नाम वा फोन नराखी समस्या दर्ता गर्न सकिनेछ।
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* 2. IDENTIFIED DETAILS vs ANONYMOUS BANNER */}
              {complaintType === "identified" && (
                <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-3 animate-in fade-in">
                  <div className="font-bold text-blue-950 dark:text-blue-200 text-xs flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>गुनासोकर्ताको व्यक्तिगत विवरण (Complainant Details)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        पूरा नाम <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="उदा. रमेश श्रेष्ठ"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        सम्पर्क फोन नम्बर <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="उदा. ९८XXXXXXXX"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        ठेगाना (गाउँ/सहर, वडा नं) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="उदा. धरान-१२, सुनसरी"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        इमेल (Email - ऐच्छिक)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="उदा. citizen@example.com"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {complaintType === "anonymous" && (
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 leading-relaxed flex items-start gap-2.5 animate-in fade-in">
                  <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>बेनामी गुनासो सूचना:</strong> बेनामी गुनासो गर्दा तपाईंको व्यक्तिगत परिचय मागिने छैन। कृपया गुनासो पठाउन चाहेको सम्बन्धित मन्त्रालय वा स्थानीय तह छनौट गरी गुनासोको विवरण मात्र पठाउनुहोस्।
                  </div>
                </div>
              )}

              {/* 3. RECIPIENT AGENCY SELECTION (WHERE TO FILE) */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  २. गुनासो सम्बन्धित निकाय छनौट गर्नुहोस् <span className="text-rose-500">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRecipientType("ministry");
                      setSelectedDistrictId("");
                      setSelectedPalikaId("");
                    }}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                      recipientType === "ministry"
                        ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>A. प्रदेश सरकारको मन्त्रालय/निकाय</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRecipientType("local_government");
                      setSelectedMinistryId("");
                    }}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                      recipientType === "local_government"
                        ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>B. स्थानीय तह (१३७ पालिका)</span>
                  </button>
                </div>

                {/* Case A: Ministry Dropdown */}
                {recipientType === "ministry" && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        मन्त्रालय/निकाय छनौट गर्नुहोस् <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={selectedMinistryId}
                        onChange={(e) => setSelectedMinistryId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-hidden cursor-pointer"
                      >
                        <option value="">-- मन्त्रालय/निकाय छनौट गर्नुहोस् --</option>
                        {ministries.map((m) => (
                          <option key={m.id} value={m.ministry_id || m.id}>
                            {m.organization_name_ne}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Case B: District -> Local Government Dependent Dropdowns */}
                {recipientType === "local_government" && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          जिल्ला छनौट गर्नुहोस् <span className="text-rose-500">*</span>
                        </label>
                        <select
                          required
                          value={selectedDistrictId}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-hidden cursor-pointer"
                        >
                          <option value="">-- जिल्ला छनौट गर्नुहोस् --</option>
                          {KOSHI_DISTRICTS.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name_ne} जिल्ला ({d.local_governments.length} पालिका)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          स्थानीय तह छनौट गर्नुहोस् <span className="text-rose-500">*</span>
                        </label>
                        <select
                          required
                          disabled={!selectedDistrictId}
                          value={selectedPalikaId}
                          onChange={(e) => setSelectedPalikaId(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-hidden cursor-pointer disabled:opacity-50"
                        >
                          <option value="">-- पहिले जिल्ला छान्नुहोस् --</option>
                          {availablePalikas.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name_ne} ({p.type})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Real-time Display of Selected Office's Official Phone & Email */}
                {activeRecipientContact && (
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs animate-in zoom-in-95">
                    <div>
                      <span className="font-bold text-blue-950 dark:text-blue-200 block text-sm">
                        {activeRecipientContact.organization_name_ne}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {activeRecipientContact.office_address}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <a
                        href={`tel:${activeRecipientContact.official_phone.split(",")[0].trim()}`}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-bold flex items-center gap-1.5 shadow-xs hover:bg-blue-100 transition"
                        title="फोन गर्नुहोस्"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>{activeRecipientContact.official_phone}</span>
                      </a>

                      <a
                        href={`mailto:${activeRecipientContact.official_email}`}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-mono text-[11px] flex items-center gap-1.5 shadow-xs hover:bg-blue-100 transition"
                        title="इमेल पठाउनुहोस्"
                      >
                        <Mail className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{activeRecipientContact.official_email}</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. COMPLAINT SUBJECT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    ३. गुनासोको विषय <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as ComplaintSubject)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-hidden cursor-pointer"
                  >
                    {COMPLAINT_SUBJECTS.map((sub, idx) => (
                      <option key={idx} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                {subject === "अन्य" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      अन्य विषय उल्लेख गर्नुहोस् <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={otherSubject}
                      onChange={(e) => setOtherSubject(e.target.value)}
                      placeholder="विषय यहाँ लेख्नुहोस्..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              {/* 5. DETAILED DESCRIPTION */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  ४. गुनासोको विस्तृत विवरण <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="तपाईंको गुनासो वा समस्या विस्तृत रूपमा लेख्नुहोस्..."
                  className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* 6. OPTIONAL ATTACHMENTS (DOC, PHOTO, VIDEO) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                    ५. सम्बन्धित प्रमाण (कागजात, तस्बिर वा भिडियो) — ऐच्छिक
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    गुनासोसँग सम्बन्धित कुनै प्रमाण भए मात्र अपलोड गर्नुहोस्। कुनै फाइल नभए पनि गुनासो दर्ता हुनेछ।
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Doc Upload */}
                  <label className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-center cursor-pointer transition">
                    <FileText className="w-6 h-6 text-blue-600 mb-1" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">सम्बन्धित कागजात</span>
                    <span className="text-[10px] text-slate-400">PDF, DOC, XLS, JPG (Max {settings.max_doc_size_mb}MB)</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload("document", e.target.files)}
                      className="hidden"
                    />
                  </label>

                  {/* Photo Upload */}
                  <label className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-center cursor-pointer transition">
                    <ImageIcon className="w-6 h-6 text-emerald-600 mb-1" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">सम्बन्धित तस्बिर</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WEBP (Max {settings.max_img_size_mb}MB)</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload("image", e.target.files)}
                      className="hidden"
                    />
                  </label>

                  {/* Video Upload */}
                  <label className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-center cursor-pointer transition">
                    <VideoIcon className="w-6 h-6 text-purple-600 mb-1" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">सम्बन्धित भिडियो</span>
                    <span className="text-[10px] text-slate-400">MP4, MOV, WEBM (Max {settings.max_video_size_mb}MB)</span>
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm"
                      onChange={(e) => handleFileUpload("video", e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadProgress !== null && (
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-1.5 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}

                {/* Uploaded Items List */}
                {attachments.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                      संलग्न गरिएका फाइलहरू ({attachments.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {attachments.map((att) => (
                        <div
                          key={att.id}
                          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {att.file_type === "image" && <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />}
                            {att.file_type === "video" && <VideoIcon className="w-4 h-4 text-purple-600 shrink-0" />}
                            {att.file_type === "document" && <FileText className="w-4 h-4 text-blue-600 shrink-0" />}
                            <span className="truncate text-[11px]">{att.file_name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(att.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            title="हटाउनुहोस्"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 7. ACCESSIBLE ANTI-SPAM & MANDATORY CC NOTICE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    सुरक्षा प्रमाणीकरण (Anti-Spam Challenge) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 font-bold text-sm border border-slate-300 dark:border-slate-700">
                      {mathChallenge.num1} + {mathChallenge.num2} = ?
                    </span>
                    <input
                      type="number"
                      required
                      value={captchaInput}
                      onChange={(e) => {
                        setCaptchaInput(e.target.value);
                        setCaptchaError(false);
                      }}
                      placeholder="जवाफ"
                      className={`w-24 px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 text-xs font-bold focus:ring-2 focus:outline-hidden ${
                        captchaError ? "border-rose-500 ring-rose-500/20" : "border-slate-300 dark:border-slate-700 focus:ring-blue-600"
                      }`}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 sm:pl-4 pt-2 sm:pt-0">
                  <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>अनिवार्य CC सुरक्षा (Automatic CC Policy):</span>
                  </div>
                  प्रत्येक गुनासोको प्रतिलिपि सामाजिक विकास मन्त्रालय, कोशी प्रदेशको गुनासो शाखामा स्वचालित रूपमा पठाइनेछ।
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>गुनासो दर्ता तथा इमेल पठाउँदै (Submitting & Routing)...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>गुनासो आधिकारिक रूपमा दर्ता गर्नुहोस् (Submit Grievance)</span>
                  </>
                )}
              </button>
            </form>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: COMPLAINT TRACKING */}
      {/* ========================================================================= */}
      {activeTab === "track" && (
        <div className="max-w-xl mx-auto space-y-6 text-xs">
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              गुनासोको पछिल्लो अवस्था पत्ता लगाउनुहोस्
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              दर्ता गर्दा प्राप्त भएको गुनासो नम्बर (उदा: DIC-2026-000001) प्रविष्टि गरी स्थिति हेर्नुहोस्।
            </p>
          </div>

          <form onSubmit={handleTrackSearch} className="flex gap-2">
            <input
              type="text"
              required
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="उदा. DIC-2026-000001"
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={isTracking}
              className="px-6 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              {isTracking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>खोज्नुहोस्</span>
            </button>
          </form>

          {/* Tracking Result */}
          {trackedComplaint === "not_found" && (
            <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-center space-y-1">
              <AlertCircle className="w-5 h-5 mx-auto text-rose-600" />
              <div className="font-bold">कुनै विवरण फेला परेन</div>
              <p className="text-[11px]">कृपया गुनासो नम्बर पुनः जाँच गरी सही रूपमा प्रविष्टि गर्नुहोस्।</p>
            </div>
          )}

          {trackedComplaint && trackedComplaint !== "not_found" && (
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-mono text-base font-black text-blue-700 dark:text-blue-400 block">
                    {trackedComplaint.complaint_number}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    दर्ता: {new Date(trackedComplaint.created_at).toLocaleDateString("ne-NP")}
                  </span>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  trackedComplaint.status === "नयाँ" ? "bg-blue-100 text-blue-800" :
                  trackedComplaint.status === "समाधान भएको" ? "bg-emerald-100 text-emerald-800" :
                  trackedComplaint.status === "अस्वीकृत" ? "bg-rose-100 text-rose-800" :
                  "bg-amber-100 text-amber-800"
                }`}>
                  {trackedComplaint.status}
                </span>
              </div>

              <div className="space-y-2 text-slate-700 dark:text-slate-300">
                <div>
                  <span className="font-semibold text-slate-500">सम्बन्धित निकाय:</span>{" "}
                  <strong>{trackedComplaint.organization_name}</strong>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">विषय:</span>{" "}
                  {trackedComplaint.subject === "अन्य" ? trackedComplaint.other_subject : trackedComplaint.subject}
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Email Routing:</span>{" "}
                  <span className="text-emerald-600 font-semibold font-mono text-[11px]">सम्प्रेषित (Sent)</span>
                </div>
                {trackedComplaint.admin_remarks && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mt-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                      प्रशासकीय कारबाही तथा टिप्पणी:
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{trackedComplaint.admin_remarks}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
