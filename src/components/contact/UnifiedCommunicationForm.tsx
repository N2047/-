"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Send, 
  Building2, 
  Mail, 
  Paperclip, 
  CheckSquare, 
  Square, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  X, 
  MapPin, 
  Phone, 
  Loader2, 
  ShieldCheck, 
  Users, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Download,
  Sparkles,
  Check,
  Search,
  Filter,
  Layers,
  RotateCcw
} from "lucide-react";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import { GovernmentContact } from "@/lib/grievanceService";

interface UnifiedCommunicationFormProps {
  onSuccess?: () => void;
}

export default function UnifiedCommunicationForm({ onSuccess }: UnifiedCommunicationFormProps) {
  // Sender Ministry Info (Locked / Pre-set)
  const [senderMinistry] = useState<string>("सामाजिक विकास मन्त्रालय, कोशी प्रदेश");
  const [ministryEmail, setMinistryEmail] = useState<string>("verified.mosd@koshi.gov.np");
  const [ministryPhone, setMinistryPhone] = useState<string>("०२१-४६२८००");
  const [ministryAddress, setMinistryAddress] = useState<string>("विराटनगर-१०, मोरङ, कोशी प्रदेश");

  // Form Fields
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Recipient Mode: "all" (१३७ वटै पालिका) vs "selective" (निश्चित छानिएका पालिकाहरू)
  const [recipientMode, setRecipientMode] = useState<"all" | "selective">("all");
  const [selectedPalikaIds, setSelectedPalikaIds] = useState<string[]>([]);
  const [filterDistrictId, setFilterDistrictId] = useState<string>("all");
  const [palikaSearchQuery, setPalikaSearchQuery] = useState<string>("");

  // Attachment State (Optional, <= 5MB)
  const [attachment, setAttachment] = useState<{
    file: File | null;
    name: string;
    size: number;
    type: string;
    base64?: string;
  } | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Palika Contacts Cache from DB
  const [palikaContacts, setPalikaContacts] = useState<GovernmentContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // Submission & Receipt State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dispatchReceipt, setDispatchReceipt] = useState<{
    dispatch_number: string;
    created_at_bs: string;
    created_at: string;
    subject: string;
    message: string;
    sender_ministry: string;
    sender_email: string;
    total_recipients: number;
    attachment_name?: string;
    attachment_size?: number;
    recipients: { name_ne: string; email: string }[];
  } | null>(null);

  // Load Ministry & Palika Contacts from Server API
  useEffect(() => {
    let isMounted = true;
    setIsLoadingContacts(true);
    fetch("/api/admin/contacts")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data?.contacts && Array.isArray(data.contacts)) {
          // Ministry info
          const min = data.contacts.find(
            (c: GovernmentContact) => c.organization_type === "ministry" && (c.ministry_id === "mosd_koshi" || c.id === "min_mosd")
          );
          if (min) {
            if (min.official_email) setMinistryEmail(min.official_email);
            if (min.official_phone) setMinistryPhone(min.official_phone);
            if (min.office_address) setMinistryAddress(min.office_address);
          }

          // Local governments
          const lgs = data.contacts.filter((c: GovernmentContact) => c.organization_type === "local_government");
          setPalikaContacts(lgs);
        }
      })
      .catch((err) => console.warn("Failed to load contacts for unified communication:", err))
      .finally(() => {
        if (isMounted) setIsLoadingContacts(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Word Counters
  const countWords = (str: string) => {
    const trimmed = str.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  };

  const subjectWordCount = useMemo(() => countWords(subject), [subject]);
  const messageWordCount = useMemo(() => countWords(message), [message]);

  // Master Flat List of All 137 Palikas in Koshi Province
  const allPalikaList = useMemo(() => {
    return KOSHI_DISTRICTS.flatMap((d) =>
      d.local_governments.map((p) => {
        const matchedContact = palikaContacts.find((c) => c.local_government_id === p.id);
        return {
          id: p.id,
          name_ne: p.name_ne,
          name_en: p.name_en,
          type: p.type,
          district_id: d.id,
          district_name_ne: d.name_ne,
          email: matchedContact?.official_email || `info.${p.id}@koshi.gov.np`,
          phone: matchedContact?.official_phone || "उपलब्ध",
        };
      })
    );
  }, [palikaContacts]);

  // Filtered Palikas based on district filter and search query
  const displayedPalikas = useMemo(() => {
    return allPalikaList.filter((p) => {
      const matchDistrict = filterDistrictId === "all" || p.district_id === filterDistrictId;
      const q = palikaSearchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.name_ne.toLowerCase().includes(q) ||
        p.district_name_ne.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q);
      return matchDistrict && matchSearch;
    });
  }, [allPalikaList, filterDistrictId, palikaSearchQuery]);

  // Toggle selection for a specific Palika
  const togglePalika = (id: string) => {
    setSelectedPalikaIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all currently displayed palikas
  const selectAllDisplayed = () => {
    const ids = displayedPalikas.map((p) => p.id);
    setSelectedPalikaIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  // Deselect all currently displayed palikas
  const deselectAllDisplayed = () => {
    const idsToDeselect = new Set(displayedPalikas.map((p) => p.id));
    setSelectedPalikaIds((prev) => prev.filter((id) => !idsToDeselect.has(id)));
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedPalikaIds([]);
  };

  // Handle File Attachment Selection (Max 5MB)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSizeBytes) {
      setAttachmentError("फाइल साइज बढीमा ५ MB सम्मको मात्र हुनुपर्छ। कृपया ५ MB भन्दा सानो फाइल छनौट गर्नुहोस्।");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        file,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        base64: reader.result as string,
      });
    };
    reader.onerror = () => {
      setAttachmentError("फाइल पढ्न सकिएन, कृपया पुनः प्रयास गर्नुहोस्।");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setAttachmentError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Form Validation
  const effectiveRecipientCount = useMemo(() => {
    return recipientMode === "all" ? 137 : selectedPalikaIds.length;
  }, [recipientMode, selectedPalikaIds]);

  const isFormValid = useMemo(() => {
    const hasSubject = subject.trim().length >= 3;
    const hasMessage = message.trim().length >= 10;
    const hasRecipients = recipientMode === "all" || selectedPalikaIds.length > 0;
    return hasSubject && hasMessage && hasRecipients && !isSubmitting;
  }, [subject, message, recipientMode, selectedPalikaIds, isSubmitting]);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!subject.trim()) {
      setSubmitError("कृपया पत्र वा सूचनाको विषय प्रविष्ट गर्नुहोस्।");
      return;
    }

    if (!message.trim()) {
      setSubmitError("कृपया आधिकारिक सन्देशको विस्तृत व्यहोरा प्रविष्ट गर्नुहोस्।");
      return;
    }

    if (recipientMode === "selective" && selectedPalikaIds.length === 0) {
      setSubmitError("कृपया कम्तिमा एक निश्चित पालिका छनौट गर्नको लागि पालिकाको नामको अन्तिममा राइट लगाउनुहोस्।");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        senderMinistry,
        subject: subject.trim(),
        message: message.trim(),
        sendToAllPalikas: recipientMode === "all",
        selectedPalikaIds: recipientMode === "selective" ? selectedPalikaIds : undefined,
        attachment: attachment
          ? {
              name: attachment.name,
              size: attachment.size,
              type: attachment.type,
              base64: attachment.base64,
            }
          : undefined,
      };

      const res = await fetch("/api/communication/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "सन्देश प्रेषण गर्न सकिएन।");
      }

      setDispatchReceipt(data.dispatch);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setSubmitError(err.message || "प्राविधिक समस्या उत्पन्न भयो।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubject("");
    setMessage("");
    setAttachment(null);
    setRecipientMode("all");
    setSelectedPalikaIds([]);
    setDispatchReceipt(null);
    setSubmitError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Informative Intro Banner */}
      <div className="p-5 rounded-3xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 border border-blue-600/50 text-[11px] font-bold tracking-wide uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>कोशी प्रदेश सरकार — एकीकृत संचार प्रणाली</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              मन्त्रालयबाट स्थानीय तहमा आधिकारिक पत्र तथा सन्देश प्रेषण
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-2xl leading-relaxed">
              सामाजिक विकास मन्त्रालयको प्रमाणित आधिकारिक इमेलबाट कोशी प्रदेशका <strong>सम्पूर्ण १३७ वटै स्थानीय तहहरू</strong> वा <strong>तपाईंले छनौट गर्नुभएका निश्चित पालिकाहरू</strong>को आधिकारिक इमेलमा एकैसाथ ग्रुप मेल पठाउने प्रणाली।
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0">
            <span className="text-[11px] font-bold text-blue-200 block">वर्तमान प्रापक संख्या</span>
            <span className="text-3xl font-black text-amber-300">
              {recipientMode === "all" ? "१३७" : selectedPalikaIds.length}
            </span>
            <span className="text-[10px] text-blue-100 block">
              {recipientMode === "all" ? "सम्पूर्ण पालिकाहरू" : "छानिएका पालिकाहरू"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Broadcast Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Row 1: इमेल पठाउने मन्त्रालयको नाम (Locked to सामाजिक विकास मन्त्रालय) */}
        <div>
          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
            १. इमेल पठाउने मन्त्रालयको नाम (Sender Ministry) <span className="text-rose-500">*</span>
          </label>
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border-2 border-blue-600/50 dark:border-blue-500/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-lg shadow-sm">
                🏛️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {senderMinistry}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>प्रमाणित प्रेषक</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1 font-mono font-bold text-blue-700 dark:text-blue-300">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>{ministryEmail}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>{ministryPhone}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{ministryAddress}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-bold text-blue-900 dark:text-blue-300 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900">
              पूर्वनिर्धारित एकमात्र प्रेषक विकल्प
            </div>
          </div>
        </div>

        {/* Row 2: विषय (Subject - कम्तिमा ३० शब्द सम्मको text) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="comm-subject" className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              २. विषय (Subject) <span className="text-rose-500">*</span>
            </label>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
              subjectWordCount > 0 
                ? "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300" 
                : "text-slate-400"
            }`}>
              शब्द संख्या: <strong>{subjectWordCount}</strong> (कम्तिमा ३० शब्द सम्म लेख्न सकिने)
            </span>
          </div>
          <input
            id="comm-subject"
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="उदा. अपाङ्गता परिचयपत्र वितरण, सहायता कक्ष व्यवस्थापन तथा वार्षिक कार्यसम्पादन प्रतिवेदन प्रविष्टि सम्बन्धमा..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            सबै स्थानीय तहका प्रमुख, उपप्रमुख तथा सहजकर्ताले इमेलको विषयमा यही शीर्षक देख्नेछन्।
          </p>
        </div>

        {/* Row 3: सन्देश (Message - कम्तिमा २०० शब्द सम्मको text) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="comm-message" className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              ३. सन्देश / परिपत्रको व्यहोरा (Official Message Body) <span className="text-rose-500">*</span>
            </label>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
              messageWordCount >= 50 
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}>
              शब्द संख्या: <strong>{messageWordCount}</strong> (कम्तिमा २०० शब्द सम्म)
            </span>
          </div>
          <textarea
            id="comm-message"
            required
            rows={7}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`तपाईंको आधिकारिक परिपत्र वा सूचनाको पूर्ण व्यहोरा यहाँ प्रविष्ट गर्नुहोस् (कम्तिमा २०० शब्द सम्म)...
उदा:
उपरोक्त सम्बन्धमा कोशी प्रदेशका स्थानीय तहहरूमा अपाङ्गता सहायता सहजकर्ता परिचालन तथा सहायता कक्ष व्यवस्थापनका सम्बन्धमा मन्त्रालयको निर्णयानुसार...`}
            className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm leading-relaxed font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            यहाँ टाइप गरिएको सन्देश ढाँचाबद्ध (Formatted HTML Email) रूपमा पालिकाको इमेलमा प्रेषण हुनेछ।
          </p>
        </div>

        {/* Row 4: सम्बन्धित फाइल अपलोड गर्नुहोस् (ऐच्छिक, बढीमा ५ MB सम्म) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              ४. सम्बन्धित फाइल अपलोड गर्नुहोस् (Upload Relevant Document / Letter)
            </label>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              ऐच्छिक (Optional — बढीमा ५ MB सम्म)
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
            {!attachment ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center shrink-0">
                    <Paperclip className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      कुनै पत्र वा परिपत्रको स्क्यान प्रति संलग्न गर्न चाहनुहुन्छ?
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      PDF, DOC, DOCX, JPG, PNG फाइलहरू समर्थित (अधिकतम ५ MB)
                    </span>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="comm-file-upload"
                  />
                  <label
                    htmlFor="comm-file-upload"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Paperclip className="w-4 h-4" />
                    <span>फाइल छनौट गर्नुहोस्</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 shadow-xs">
                <div className="flex items-center gap-3 truncate">
                  <FileText className="w-6 h-6 text-red-500 shrink-0" />
                  <div className="truncate">
                    <span className="text-xs font-black text-slate-900 dark:text-white block truncate">
                      {attachment.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      साइज: {(attachment.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  title="फाइल हटाउनुहोस्"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">हटाउनुहोस्</span>
                </button>
              </div>
            )}

            {attachmentError && (
              <div className="mt-2 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{attachmentError}</span>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* Row 5: प्रापक छनौट (२ विकल्प: सबै १३७ पालिका वा निश्चित पालिकाहरूमा मात्रै) */}
        {/* ================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              ५. प्रापक छनौट गर्नुहोस् (Select Recipient Local Governments) <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300">
              कुल चयन: <strong>{effectiveRecipientCount} वटा पालिका</strong>
            </span>
          </div>

          {/* Mode Selector Radio Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mode 1: सम्पूर्ण १३७ वटै स्थानीय तहहरू */}
            <button
              type="button"
              onClick={() => {
                setRecipientMode("all");
              }}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 ${
                recipientMode === "all"
                  ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-500 shadow-md ring-2 ring-emerald-400/30"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 hover:border-blue-400"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {recipientMode === "all" ? (
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-lg border-2 border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800" />
                )}
              </div>
              <div>
                <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>विकल्प १: सम्पूर्ण स्थानीय तह (१३७ वटै पालिका)</span>
                  {recipientMode === "all" && (
                    <span className="px-2 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                      ✓ सबैमा राइट लाग्यो
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                  कोशी प्रदेशका १४ जिल्लाका <strong>सम्पूर्ण १३७ वटै स्थानीय तहहरू</strong>मा एकैसाथ ग्रुप इमेल प्रेषण हुनेछ।
                </p>
              </div>
            </button>

            {/* Mode 2: निश्चित पालिकाहरू मात्रै छनौट गर्ने */}
            <button
              type="button"
              onClick={() => {
                setRecipientMode("selective");
              }}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 ${
                recipientMode === "selective"
                  ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 shadow-md ring-2 ring-blue-400/30"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 hover:border-blue-400"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {recipientMode === "selective" ? (
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-lg border-2 border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800" />
                )}
              </div>
              <div>
                <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>विकल्प २: निश्चित पालिकाहरू मात्रै छनौट गर्ने</span>
                  {recipientMode === "selective" && (
                    <span className="px-2 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                      {selectedPalikaIds.length} वटा छनौट
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                  आवश्यक परेका पालिकाहरूको <strong>नामको अन्तिममा राइट लगाउँदै</strong> छनौट गरिएका पालिकामा मात्रै इमेल पठाउनुहोस्।
                </p>
              </div>
            </button>
          </div>

          {/* Selective Palikas Checklist View (When Mode 2 is active) */}
          {recipientMode === "selective" && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-2 border-blue-500/40 space-y-4 animate-in fade-in-50">
              
              {/* Header & Filter Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>पालिकाको नामको अन्तिममा राइट लगाई छनौट गर्नुहोस्:</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-900 text-white text-[11px] font-black">
                    {selectedPalikaIds.length} वटा पालिका चयन गरियो
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllDisplayed}
                    className="px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 hover:bg-blue-200 text-blue-900 dark:text-blue-300 text-xs font-bold transition cursor-pointer"
                  >
                    ✓ देखाइएका सबै छान्नुहोस्
                  </button>
                  <button
                    type="button"
                    onClick={clearAllSelections}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-bold transition cursor-pointer"
                  >
                    ✕ सबै हटाउनुहोस्
                  </button>
                </div>
              </div>

              {/* District Filter & Search Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* District Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    जिल्ला अनुसार फिल्टर गर्नुहोस्:
                  </label>
                  <select
                    value={filterDistrictId}
                    onChange={(e) => setFilterDistrictId(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    <option value="all">सबै १४ वटै जिल्लाहरू ({allPalikaList.length} पालिका)</option>
                    {KOSHI_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name_ne} जिल्ला ({d.local_governments.length} पालिका)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Palika Search Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    पालिकाको नाम वा इमेलबाट खोज्नुहोस्:
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="search"
                      value={palikaSearchQuery}
                      onChange={(e) => setPalikaSearchQuery(e.target.value)}
                      placeholder="उदा. विराटनगर, धरान, फिदिम..."
                      className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Interactive Palikas Grid with Checkbox at the end of each palika */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {displayedPalikas.length === 0 ? (
                  <div className="col-span-full p-6 text-center text-xs text-slate-500">
                    कुनै पनि स्थानीय तह फेला परेन। कृपया खोजी शब्द वा जिल्ला परिवर्तन गर्नुहोस्।
                  </div>
                ) : (
                  displayedPalikas.map((palika) => {
                    const isChecked = selectedPalikaIds.includes(palika.id);
                    return (
                      <div
                        key={palika.id}
                        onClick={() => togglePalika(palika.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 select-none ${
                          isChecked
                            ? "bg-blue-50 dark:bg-blue-950/70 border-blue-600 dark:border-blue-400 shadow-xs ring-2 ring-blue-500/30"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isChecked ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                          }`}>
                            🏛️
                          </div>
                          <div className="truncate">
                            <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                              {palika.name_ne}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono truncate">
                              {palika.district_name_ne} | {palika.email}
                            </span>
                          </div>
                        </div>

                        {/* Right-mark Checkbox at the END of the palika's name */}
                        <div className="shrink-0">
                          {isChecked ? (
                            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:border-blue-500" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected Palikas Summary Tag List */}
              {selectedPalikaIds.length > 0 && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    इमेल जाने निश्चित गरिएका पालिकाहरू ({selectedPalikaIds.length} वटा):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {selectedPalikaIds.map((id) => {
                      const item = allPalikaList.find((p) => p.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800"
                        >
                          <span>{item?.name_ne || id}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePalika(id);
                            }}
                            className="p-0.5 hover:bg-blue-200 rounded text-blue-700 cursor-pointer"
                            title="हटाउनुहोस्"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Notification */}
        {submitError && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Submit Actions Bar */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              {recipientMode === "all"
                ? "सबै विवरण भरियो र १३७ वटै स्थानीय तह छनौट भयो। अब सेन्ड गर्नुहोस्।"
                : selectedPalikaIds.length > 0
                ? `${selectedPalikaIds.length} वटा पालिका छनौट भयो। अब सेन्ड गर्नुहोस्।`
                : "कृपया कम्तिमा एक निश्चित पालिकाको नामको अन्तिममा राइट लगाउनुहोस्।"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              रिसेट गर्नुहोस्
            </button>

            <button
              type="submit"
              disabled={!isFormValid}
              className={`px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                isFormValid
                  ? "bg-blue-900 hover:bg-blue-800 text-white ring-2 ring-blue-500/40"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {recipientMode === "all"
                      ? "१३७ वटै स्थानीय तहमा प्रेषण हुँदैछ..."
                      : `${selectedPalikaIds.length} वटा स्थानीय तहमा प्रेषण हुँदैछ...`}
                  </span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {recipientMode === "all"
                      ? "१३७ वटै स्थानीय तहमा एकैसाथ इमेल पठाउनुहोस्"
                      : `छनौट गरिएका ${selectedPalikaIds.length} वटा स्थानीय तहमा इमेल पठाउनुहोस्`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ===================================================================== */}
      {/* DISPATCH RECEIPT MODAL (सफलतापूर्वक प्रेषण भएपछि देखिने डिजिटल रसिद) */}
      {/* ===================================================================== */}
      {dispatchReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full flex flex-col shadow-2xl animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-emerald-50 dark:bg-emerald-950/80 rounded-t-3xl">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    एकीकृत संचार सफलतापूर्वक प्रेषण सम्पन्न भयो
                  </h3>
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold">
                    {dispatchReceipt.total_recipients} वटा स्थानीय तहमा एकैसाथ मेल पठाइयो
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDispatchReceipt(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Official Receipt */}
            <div className="p-6 space-y-4 overflow-y-auto text-xs" id="printable-broadcast-receipt">
              
              {/* Receipt Header */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                  कोशी प्रदेश सरकार | सामाजिक विकास मन्त्रालय
                </span>
                <span className="text-base font-black text-blue-900 dark:text-blue-300 block mt-0.5">
                  आधिकारिक एकीकृत संचार प्रेषण रसिद (Broadcast Dispatch Receipt)
                </span>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 font-mono font-bold text-xs border border-blue-200 dark:border-blue-900">
                  <span>चलानी / प्रेषण नं:</span>
                  <span className="text-sm font-black">{dispatchReceipt.dispatch_number}</span>
                </div>
              </div>

              {/* Grid of Key Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-0.5">प्रेषक निकाय:</span>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {dispatchReceipt.sender_ministry}
                  </span>
                  <span className="text-[11px] font-mono text-blue-700 dark:text-blue-300 block mt-0.5">
                    {dispatchReceipt.sender_email}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-0.5">प्रापक (Recipients):</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 block text-sm">
                    {dispatchReceipt.total_recipients} वटा स्थानीय तहहरू (१००% प्रेषण)
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    कोशी प्रदेशका छनौट गरिएका पालिकाहरू
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 sm:col-span-2">
                  <span className="text-slate-400 block mb-0.5">विषय (Subject):</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm block">
                    {dispatchReceipt.subject}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 sm:col-span-2">
                  <span className="text-slate-400 block mb-1">सन्देश व्यहोरा:</span>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 leading-relaxed font-medium max-h-36 overflow-y-auto whitespace-pre-wrap">
                    {dispatchReceipt.message}
                  </div>
                </div>

                {dispatchReceipt.attachment_name && (
                  <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 sm:col-span-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-5 h-5 text-red-500 shrink-0" />
                      <span className="font-bold text-blue-900 dark:text-blue-200 truncate">
                        संलग्न फाइल: {dispatchReceipt.attachment_name}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-blue-700 dark:text-blue-300 shrink-0">
                      {Math.round((dispatchReceipt.attachment_size || 0) / 1024)} KB
                    </span>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex flex-wrap items-center justify-between gap-2">
                <span>प्रेषण मिति (BS): <strong>{dispatchReceipt.created_at_bs}</strong></span>
                <span>प्रेषण समय (UTC): <strong>{new Date(dispatchReceipt.created_at).toLocaleString("ne-NP")}</strong></span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-slate-50 dark:bg-slate-900/80 rounded-b-3xl">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>रसिद प्रिन्ट गर्नुहोस्</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>+ अर्को नयाँ सन्देश पठाउनुहोस्</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDispatchReceipt(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  बन्द गर्नुहोस्
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
