"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { translations } from "@/lib/translations";
import { useLanguage } from "@/lib/languageContext";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import { 
  getProvinceContacts, 
  getLocalGovernmentContacts, 
  updateLocalContact,
  ProvinceContact, 
  LocalGovernmentContact 
} from "@/lib/contactService";
import { useAuth } from "@/lib/authContext";
import { useAccessibility } from "@/lib/accessibilityContext";
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Search, 
  User, 
  Phone, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Lock,
  EyeOff,
  Edit3,
  Save,
  RotateCcw
} from "lucide-react";
import GovernmentGrievanceForm from "@/components/grievance/GovernmentGrievanceForm";
import UnifiedCommunicationForm from "@/components/contact/UnifiedCommunicationForm";

export default function ContactPage() {
  const { lang, setLang } = useLanguage();
  const t = translations[lang];
  const { announceLive, speakText, audioPin } = useAccessibility();
  const { user, isAuthenticated } = useAuth();

  // Admin access check: Hidden from public, visible when accessed by admin or via admin panel
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // Active Feature in Section 3: "broadcast" | "directory" | "edit_palika"
  const [activeFeature, setActiveFeature] = useState<"broadcast" | "directory" | "edit_palika">("broadcast");

  // Palika Edit State for Tab 3
  const [editDistrictId, setEditDistrictId] = useState<string>("");
  const [editPalikaId, setEditPalikaId] = useState<string>("");
  const [editForm, setEditForm] = useState({
    official_phone: "",
    official_email: "",
    disability_facilitator_name: "",
    disability_facilitator_mobile: "",
    women_children_social_branch_name: "",
    women_children_social_branch_mobile: "",
    deputy_mayor_chairperson_name: "",
    deputy_mayor_chairperson_mobile: "",
    is_public: true,
  });
  const [editSaveStatus, setEditSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [editSaveMessage, setEditSaveMessage] = useState<string>("");

  // Province and Local Contacts State
  const [provinceContacts, setProvinceContacts] = useState<ProvinceContact[]>([]);
  const [localContacts, setLocalContacts] = useState<LocalGovernmentContact[]>([]);

  // Dependent Dropdown State for Directory
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [selectedPalikaId, setSelectedPalikaId] = useState<string>("");

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Detect Admin session and URL parameters
  useEffect(() => {
    const adminRole = Boolean(
      user && (
        user.role === "super_admin" ||
        user.role === "provincial_admin" ||
        (user.role as string) === "admin" ||
        user.role === "palika_staff" ||
        user.role === "employee"
      )
    );
    const hasAdminSession = typeof window !== "undefined" && (
      Boolean(localStorage.getItem("admin_token")) ||
      Boolean(localStorage.getItem("dic_admin_session")) ||
      Boolean(localStorage.getItem("dic_current_user_session_v2")) ||
      window.location.search.includes("admin=true") ||
      window.location.search.includes("tab=edit_palika")
    );
    const adminAllowed = Boolean(isAuthenticated && adminRole) || hasAdminSession;
    setIsAdminMode(adminAllowed);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "edit_palika" || tabParam === "edit") {
        if (adminAllowed) {
          setActiveFeature("edit_palika");
        }
      } else if (tabParam === "directory") {
        setActiveFeature("directory");
      }
    }
  }, [user, isAuthenticated]);

  // Pre-fill Edit Form when editPalikaId changes in Tab 3
  useEffect(() => {
    if (!editPalikaId) {
      setEditForm({
        official_phone: "",
        official_email: "",
        disability_facilitator_name: "",
        disability_facilitator_mobile: "",
        women_children_social_branch_name: "",
        women_children_social_branch_mobile: "",
        deputy_mayor_chairperson_name: "",
        deputy_mayor_chairperson_mobile: "",
        is_public: true,
      });
      return;
    }

    const currentContact = localContacts.find((c) => c.local_government_id === editPalikaId);
    if (currentContact) {
      setEditForm({
        official_phone: currentContact.official_phone || "",
        official_email: currentContact.official_email || "",
        disability_facilitator_name: currentContact.disability_facilitator_name || "",
        disability_facilitator_mobile: currentContact.disability_facilitator_mobile || "",
        women_children_social_branch_name: currentContact.women_children_social_branch_name || "",
        women_children_social_branch_mobile: currentContact.women_children_social_branch_mobile || "",
        deputy_mayor_chairperson_name: currentContact.deputy_mayor_chairperson_name || "",
        deputy_mayor_chairperson_mobile: currentContact.deputy_mayor_chairperson_mobile || "",
        is_public: currentContact.is_public ?? true,
      });
    }
  }, [editPalikaId, localContacts]);

  // Load Contacts and listen for updates
  useEffect(() => {
    const loadData = () => {
      setProvinceContacts(getProvinceContacts());
      setLocalContacts(getLocalGovernmentContacts());

      fetch("/api/contacts/province")
        .then((res) => res.json())
        .then((data) => {
          if (data.contacts && Array.isArray(data.contacts)) {
            setProvinceContacts(data.contacts);
          }
        })
        .catch(() => {});
    };
    loadData();

    window.addEventListener("dic_contacts_updated", loadData);
    return () => window.removeEventListener("dic_contacts_updated", loadData);
  }, []);

  // Ministry & NFDN Contacts
  const ministryContact = useMemo(() => {
    return provinceContacts.find((c) => c.id === "ministry_koshi") || {
      id: "ministry_koshi" as const,
      organization_name_ne: "सामाजिक विकास मन्त्रालय, कोशी प्रदेश",
      organization_name_en: "Ministry of Social Development, Koshi Province",
      contact_person_name: "",
      contact_person_mobile: "",
      office_phone: "०२१-४६२८००, ०२१-४६२८०१",
      email: "info.dic@koshi.gov.np",
      address_ne: "विराटनगर-१०, मोरङ, कोशी प्रदेश",
      is_public: true,
    };
  }, [provinceContacts]);

  const nfdnContact = useMemo(() => {
    return provinceContacts.find((c) => c.id === "nfdn_koshi") || {
      id: "nfdn_koshi" as const,
      organization_name_ne: "राष्ट्रिय अपाङ्ग महासंघ नेपाल, कोशी प्रदेश",
      organization_name_en: "National Federation of the Disabled Nepal (NFDN) Koshi Province",
      contact_person_name: "",
      contact_person_mobile: "",
      office_phone: "०२१-४६२८५०",
      email: "koshi@nfdn.org.np",
      address_ne: "विराटनगर, मोरङ, कोशी प्रदेश",
      is_public: true,
    };
  }, [provinceContacts]);

  // Selected District & its Palikas
  const selectedDistrict = useMemo(() => {
    return KOSHI_DISTRICTS.find((d) => d.id === selectedDistrictId);
  }, [selectedDistrictId]);

  const availablePalikas = useMemo(() => {
    return selectedDistrict ? selectedDistrict.local_governments : [];
  }, [selectedDistrict]);

  // Handle District Change (Resets Palika selection)
  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrictId(districtId);
    setSelectedPalikaId(""); // Reset old Palika selection as requested

    if (audioPin && districtId) {
      const d = KOSHI_DISTRICTS.find((item) => item.id === districtId);
      if (d) speakText(`${d.name_ne} जिल्ला छनौट गरियो। अब स्थानीय तह छनौट गर्नुहोस्।`);
    }
  };

  // Handle Palika Change
  const handlePalikaChange = (palikaId: string) => {
    setSelectedPalikaId(palikaId);
    if (audioPin && palikaId) {
      const p = availablePalikas.find((item) => item.id === palikaId);
      if (p) speakText(`${p.name_ne} छनौट गरियो।`);
    }
  };

  // Current Selected Palika Contact Record
  const selectedPalikaContact = useMemo(() => {
    if (!selectedPalikaId) return null;
    return localContacts.find((c) => c.local_government_id === selectedPalikaId) || null;
  }, [selectedPalikaId, localContacts]);

  // Tab 3 Edit Selected District & Palikas
  const editSelectedDistrict = useMemo(() => {
    return KOSHI_DISTRICTS.find((d) => d.id === editDistrictId);
  }, [editDistrictId]);

  const editAvailablePalikas = useMemo(() => {
    return editSelectedDistrict ? editSelectedDistrict.local_governments : [];
  }, [editSelectedDistrict]);

  const selectedEditPalikaObj = useMemo(() => {
    return editAvailablePalikas.find((p) => p.id === editPalikaId);
  }, [editAvailablePalikas, editPalikaId]);

  // Tab 3 Save Palika Contact
  const handleSavePalikaContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPalikaId) return;

    setEditSaveStatus("saving");
    setEditSaveMessage("");

    try {
      // 1. Update contact locally & in localStorage
      updateLocalContact(editPalikaId, {
        official_phone: editForm.official_phone.trim(),
        official_email: editForm.official_email.trim(),
        disability_facilitator_name: editForm.disability_facilitator_name.trim(),
        disability_facilitator_mobile: editForm.disability_facilitator_mobile.trim(),
        women_children_social_branch_name: editForm.women_children_social_branch_name.trim(),
        women_children_social_branch_mobile: editForm.women_children_social_branch_mobile.trim(),
        deputy_mayor_chairperson_name: editForm.deputy_mayor_chairperson_name.trim(),
        deputy_mayor_chairperson_mobile: editForm.deputy_mayor_chairperson_mobile.trim(),
        is_public: editForm.is_public,
      });

      // 2. Sync to server DB for broadcast & grievance routing
      const palikaObj = KOSHI_DISTRICTS.flatMap((d) => d.local_governments).find((p) => p.id === editPalikaId);
      if (palikaObj) {
        await fetch("/api/admin/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organization_type: "local_government",
            organization_name_ne: palikaObj.name_ne,
            official_email: editForm.official_email.trim() || `${editPalikaId}@koshi.gov.np`,
            official_phone: editForm.official_phone.trim() || "उपलब्ध छैन",
            district_id: editDistrictId,
            local_government_id: editPalikaId,
          }),
        }).catch(() => {});
      }

      // Update local list
      setLocalContacts(getLocalGovernmentContacts());
      window.dispatchEvent(new Event("dic_contacts_updated"));

      setEditSaveStatus("saved");
      setEditSaveMessage("पालिकाको आधिकारिक सम्पर्क विवरण सफलतापूर्वक सेभ गरियो!");
      announceLive("पालिकाको आधिकारिक सम्पर्क विवरण सफलतापूर्वक सेभ गरियो।");
      if (audioPin) speakText("पालिकाको सम्पर्क विवरण सुरक्षित गरियो।");

      setTimeout(() => {
        setEditSaveStatus("idle");
      }, 4000);
    } catch (err) {
      console.error("Failed to save palika contact:", err);
      setEditSaveStatus("error");
      setEditSaveMessage("विवरण सेभ गर्दा त्रुटि भयो। कृपया पुन: प्रयास गर्नुहोस्।");
    }
  };

  // Search Results across all 137 Palikas
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return localContacts.filter((c) => {
      const districtMatch = c.district_name_ne.toLowerCase().includes(q);
      const palikaMatch = c.local_government_name_ne.toLowerCase().includes(q);
      const facilitatorNameMatch = (c.disability_facilitator_name || "").toLowerCase().includes(q);
      const facilitatorPhoneMatch = (c.disability_facilitator_mobile || "").includes(q);
      const branchNameMatch = (c.women_children_social_branch_name || "").toLowerCase().includes(q);
      const branchPhoneMatch = (c.women_children_social_branch_mobile || "").includes(q);
      const deputyNameMatch = (c.deputy_mayor_chairperson_name || "").toLowerCase().includes(q);
      const deputyPhoneMatch = (c.deputy_mayor_chairperson_mobile || "").includes(q);

      return (
        districtMatch ||
        palikaMatch ||
        facilitatorNameMatch ||
        facilitatorPhoneMatch ||
        branchNameMatch ||
        branchPhoneMatch ||
        deputyNameMatch ||
        deputyPhoneMatch
      );
    });
  }, [searchQuery, localContacts]);

  // Select Search Result directly
  const handleSelectSearchResult = (contact: LocalGovernmentContact) => {
    setSelectedDistrictId(contact.district_id);
    setSelectedPalikaId(contact.local_government_id);
    setSearchQuery("");
    announceLive(`${contact.local_government_name_ne}, ${contact.district_name_ne} को सम्पर्क विवरण लोड गरियो।`);
  };



  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header lang={lang} onLanguageChange={setLang} />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-hidden">
        
        {/* Module Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs mb-8 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 rounded-full text-xs font-black uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                  <PhoneCall className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                  {t.contact.badge}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  {lang === "ne" ? "१४ जिल्ला र १३७ स्थानीय तह" : "14 Districts & 137 Local Governments"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {t.contact.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
                {t.contact.description}
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* SECTION 1 & 2: PROVINCE-LEVEL CONTACTS (MINISTRY & NFDN) */}
        {/* ============================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          
          {/* SECTION 1: सामाजिक विकास मन्त्रालय, कोशी प्रदेश */}
          <section 
            aria-labelledby="ministry-contact-heading"
            className="a11y-card bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all"
            tabIndex={0}
            onFocus={() => {
              if (audioPin) speakText(lang === "ne" ? "सामाजिक विकास मन्त्रालय, कोशी प्रदेश सम्पर्क विवरण।" : "Ministry of Social Development, Koshi Province contact details.");
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-black text-xl shadow-xs">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  {lang === "ne" ? "खण्ड १: प्रदेश मन्त्रालय" : "Section 1: Provincial Ministry"}
                </span>
              </div>

              <h2 id="ministry-contact-heading" className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                {lang === "ne" ? ministryContact.organization_name_ne : (ministryContact.organization_name_en || ministryContact.organization_name_ne)}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === "ne" ? "अपाङ्गता सूचना तथा तथ्यांक व्यवस्थापन केन्द्र (DIC) मुख्य प्रशासनिक निकाय" : "Disability Information Center (DIC) Core Administrative Agency"}
              </p>

              {/* Fields */}
              <div className="mt-5 space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                    {lang === "ne" ? "सम्पर्क व्यक्ति:" : "Contact Person:"}
                  </span>
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{ministryContact.contact_person_name ? ministryContact.contact_person_name : (lang === "ne" ? "[सम्पर्क व्यक्तिको नाम उपलब्ध हुन बाँकी]" : "[Name to be updated]")}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                    {lang === "ne" ? "सम्पर्क व्यक्तिको मोबाइल नं.:" : "Mobile Number:"}
                  </span>
                  {ministryContact.contact_person_mobile ? (
                    <div className="flex items-center justify-between mt-1">
                      <a 
                        href={`tel:${ministryContact.contact_person_mobile}`}
                        className="font-bold text-base text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1.5 font-mono"
                        aria-label={`Call mobile ${ministryContact.contact_person_mobile}`}
                      >
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span>{ministryContact.contact_person_mobile}</span>
                      </a>
                      <a
                        href={`tel:${ministryContact.contact_person_mobile}`}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{lang === "ne" ? "कल गर्नुहोस्" : "Call"}</span>
                      </a>
                    </div>
                  ) : (
                    <div className="text-slate-400 dark:text-slate-500 font-medium">
                      {lang === "ne" ? "[मोबाइल नम्बर उपलब्ध हुन बाँकी]" : "[Mobile number to be updated]"}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{lang === "ne" ? `फोन: ${ministryContact.office_phone || "०२१-४६२८००"}` : `Phone: ${ministryContact.office_phone || "021-462800"}`}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{ministryContact.email || "info.dic@koshi.gov.np"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{lang === "ne" ? (ministryContact.address_ne || "विराटनगर-१०, मोरङ") : "Biratnagar-10, Morang"}</span>
              </span>
              <span className="text-[11px]">{lang === "ne" ? `अद्यावधिक: ${ministryContact.updated_at || "२०८२/०५/०१"}` : `Updated: ${ministryContact.updated_at || "2025/08/17"}`}</span>
            </div>
          </section>

          {/* SECTION 2: राष्ट्रिय अपाङ्ग महासंघ नेपाल, कोशी प्रदेश */}
          <section 
            aria-labelledby="nfdn-contact-heading"
            className="a11y-card bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all"
            tabIndex={0}
            onFocus={() => {
              if (audioPin) speakText(lang === "ne" ? "राष्ट्रिय अपाङ्ग महासंघ नेपाल, कोशी प्रदेश सम्पर्क विवरण।" : "National Federation of the Disabled Nepal, Koshi Province contact details.");
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center font-black text-xl shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                  {lang === "ne" ? "खण्ड २: महासंघ प्रदेश कार्यालय" : "Section 2: Federation (NFDN)"}
                </span>
              </div>

              <h2 id="nfdn-contact-heading" className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                {lang === "ne" ? nfdnContact.organization_name_ne : (nfdnContact.organization_name_en || nfdnContact.organization_name_ne)}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === "ne" ? "अपाङ्गता अधिकार, पैरवी तथा नागरिक सरोकार प्रदेश समन्वय समिति" : "Disability Rights, Advocacy & Coordination Committee"}
              </p>

              {/* Fields */}
              <div className="mt-5 space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                    सम्पर्क व्यक्ति:
                  </span>
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{nfdnContact.contact_person_name ? nfdnContact.contact_person_name : "[सम्पर्क व्यक्तिको नाम उपलब्ध हुन बाँकी]"}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                    सम्पर्क व्यक्तिको मोबाइल नम्बर:
                  </span>
                  {nfdnContact.contact_person_mobile ? (
                    <div className="flex items-center justify-between mt-1">
                      <a 
                        href={`tel:${nfdnContact.contact_person_mobile}`}
                        className="font-bold text-base text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1.5 font-mono"
                        aria-label={`महासंघ सम्पर्क व्यक्तिको मोबाइल ${nfdnContact.contact_person_mobile} मा कल गर्नुहोस्`}
                      >
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span>{nfdnContact.contact_person_mobile}</span>
                      </a>
                      <a
                        href={`tel:${nfdnContact.contact_person_mobile}`}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>कल गर्नुहोस्</span>
                      </a>
                    </div>
                  ) : (
                    <div className="text-slate-400 dark:text-slate-500 font-medium">
                      [मोबाइल नम्बर उपलब्ध हुन बाँकी]
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>कार्यालय फोन: {nfdnContact.office_phone || "०२१-XXXXXX"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{nfdnContact.email || "koshi@nfdn.org.np"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{nfdnContact.address_ne || "विराटनगर, मोरङ"}</span>
              </span>
              <span className="text-[11px]">अद्यावधिक: {nfdnContact.updated_at || "२०८२/०५/०१"}</span>
            </div>
          </section>

        </div>

        {/* ============================================================= */}
        {/* SECTION 3: स्थानीय तहमा सम्पर्क गर्नको लागि */}
        {/* ============================================================= */}
        <section aria-labelledby="local-contact-heading" className="space-y-6 mb-12">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            
            {/* Heading & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                    {lang === "ne" ? "खण्ड ३" : "Section 3"}
                  </span>
                </div>
                <h2 id="local-contact-heading" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {lang === "ne" ? "स्थानीय तहमा सम्पर्क गर्नको लागि" : "Local Government Contact Directory"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {lang === "ne" 
                    ? "पहिले जिल्ला छनौट गर्नुहोस् र त्यसपछि स्थानीय तह चयन गरी आधिकारिक सम्पर्क विवरण प्राप्त गर्नुहोस्।"
                    : "Select a district first, then choose your local government to view official contact details."}
                </p>
              </div>

              {/* Quick Search Input (Active only in directory mode) */}
              {activeFeature === "directory" && (
                <div className="w-full sm:w-80 relative">
                  <label htmlFor="contact-search" className="sr-only">
                    {lang === "ne" ? "सम्पर्क खोज्नुहोस्" : "Search Contacts"}
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
                    <input
                      id="contact-search"
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={lang === "ne" ? "जिल्ला, पालिका, नाम वा नम्बर खोज्नुहोस्..." : "Search district, municipality, name or phone..."}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Feature Switcher Tabs: १. एकीकृत संचार vs २. पालिकागत सम्पर्क निर्देशिका */}
            <div className="flex flex-wrap border-b-2 border-slate-200 dark:border-slate-800 mb-6 gap-2" role="tablist" aria-label="स्थानीय तह सम्पर्क सुविधाहरू">
              <button
                type="button"
                role="tab"
                aria-selected={activeFeature === "broadcast"}
                onClick={() => setActiveFeature("broadcast")}
                className={`py-3.5 px-6 font-black text-xs sm:text-sm rounded-t-2xl transition-all flex items-center gap-2 border-t-2 border-x-2 -mb-0.5 cursor-pointer ${
                  activeFeature === "broadcast"
                    ? "bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-400 border-blue-900 dark:border-blue-500 border-b-white dark:border-b-slate-900 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Send className="w-4 h-4 text-blue-600" />
                <span>१. एकीकृत संचार (मन्त्रालय ➔ १३७ वटै स्थानीय तह)</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeFeature === "directory"}
                onClick={() => setActiveFeature("directory")}
                className={`py-3.5 px-6 font-black text-xs sm:text-sm rounded-t-2xl transition-all flex items-center gap-2 border-t-2 border-x-2 -mb-0.5 cursor-pointer ${
                  activeFeature === "directory"
                    ? "bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-400 border-blue-900 dark:border-blue-500 border-b-white dark:border-b-slate-900 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>२. पालिकागत सम्पर्क निर्देशिका (जिल्ला र पालिका छनौट)</span>
              </button>

              {isAdminMode && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeFeature === "edit_palika"}
                  onClick={() => setActiveFeature("edit_palika")}
                  className={`py-3.5 px-6 font-black text-xs sm:text-sm rounded-t-2xl transition-all flex items-center gap-2 border-t-2 border-x-2 -mb-0.5 cursor-pointer ${
                    activeFeature === "edit_palika"
                      ? "bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 border-amber-600 dark:border-amber-500 border-b-white dark:border-b-slate-900 shadow-xs"
                      : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-transparent hover:bg-amber-100 dark:hover:bg-amber-950/70"
                  }`}
                >
                  <Edit3 className="w-4 h-4 text-amber-600" />
                  <span>(३) पालिका सम्पादन</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold">
                    Admin Only
                  </span>
                </button>
              )}
            </div>

            {/* TAB CONTENT 1: UNIFIED COMMUNICATION */}
            {activeFeature === "broadcast" ? (
              <UnifiedCommunicationForm />
            ) : activeFeature === "directory" ? (
              <div>
                {/* SEARCH RESULTS DROPDOWN / LIST (When user types search query) */}
                {searchQuery.trim() && (
                  <div className="mb-6 p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                        {lang === "ne" ? `खोज नतिजा: ${searchResults.length} वटा स्थानीय तह फेला पर्यो` : `Search Results: ${searchResults.length} local governments found`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold cursor-pointer"
                      >
                        {lang === "ne" ? "बन्द गर्नुहोस्" : "Close"}
                      </button>
                    </div>

                {searchResults.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
                    &quot;{searchQuery}&quot; सँग मेल खाने कुनै स्थानीय तह वा सम्पर्क व्यक्ति फेला परेन।
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {searchResults.map((item) => (
                      <button
                        key={item.local_government_id}
                        type="button"
                        onClick={() => handleSelectSearchResult(item)}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-blue-500 transition-all flex items-center justify-between cursor-pointer group"
                      >
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block group-hover:text-blue-600">
                            {item.local_government_name_ne}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.district_name_ne} जिल्ला
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DEPENDENT DROPDOWNS: DISTRICT -> LOCAL GOVERNMENT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 mb-8">
              
              {/* Dropdown 1: जिल्ला छनौट गर्नुहोस् */}
              <div>
                <label 
                  htmlFor="district-dropdown" 
                  className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5"
                >
                  १. जिल्ला छनौट गर्नुहोस् <span className="text-rose-500">*</span>
                </label>
                <select
                  id="district-dropdown"
                  value={selectedDistrictId}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  onFocus={() => {
                    if (audioPin) speakText("जिल्ला छनौट गर्नुहोस्");
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:outline-hidden cursor-pointer shadow-xs"
                >
                  <option value="">-- जिल्ला छनौट गर्नुहोस् (१४ वटै जिल्ला) --</option>
                  {KOSHI_DISTRICTS.map((d, i) => (
                    <option key={d.id} value={d.id}>
                      {i + 1}. {d.name_ne} ({d.local_governments.length} स्थानीय तह)
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  कोशी प्रदेशका १४ जिल्लामध्ये आफ्नो जिल्ला छान्नुहोस्।
                </span>
              </div>

              {/* Dropdown 2: स्थानीय तह छनौट गर्नुहोस् (Dependent) */}
              <div>
                <label 
                  htmlFor="palika-dropdown" 
                  className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5"
                >
                  २. स्थानीय तह छनौट गर्नुहोस् <span className="text-rose-500">*</span>
                </label>
                <select
                  id="palika-dropdown"
                  disabled={!selectedDistrictId}
                  value={selectedPalikaId}
                  onChange={(e) => handlePalikaChange(e.target.value)}
                  onFocus={() => {
                    if (audioPin) {
                      if (!selectedDistrictId) speakText("पहिले जिल्ला छनौट गर्नुहोस्।");
                      else speakText("स्थानीय तह छनौट गर्नुहोस्");
                    }
                  }}
                  className={`w-full border rounded-xl px-4 py-3 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-hidden shadow-xs ${
                    !selectedDistrictId
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 cursor-not-allowed"
                      : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 cursor-pointer"
                  }`}
                >
                  <option value="">
                    {!selectedDistrictId 
                      ? "पहिले जिल्ला छनौट गर्नुहोस्।" 
                      : `-- स्थानीय तह छनौट गर्नुहोस् (${availablePalikas.length} वटा स्थानीय तह) --`}
                  </option>
                  {availablePalikas.map((p, i) => (
                    <option key={p.id} value={p.id}>
                      {i + 1}. {p.name_ne} ({p.type})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  {!selectedDistrictId 
                    ? "पहिले जिल्ला चयन गरेपछि मात्र स्थानीय तह देखिनेछ।" 
                    : `${selectedDistrict?.name_ne} जिल्लाभित्रका स्थानीय तहहरू।`}
                </span>
              </div>

            </div>

            {/* ========================================================= */}
            {/* LOCAL GOVERNMENT CONTACT CARD DISPLAY */}
            {/* ========================================================= */}
            {!selectedDistrictId ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  पहिले जिल्ला छनौट गर्नुहोस्।
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  माथि दिइएको ड्रपडाउनबाट जिल्ला चयन गरेपछि सम्बन्धित स्थानीय तहको सम्पर्क विवरण खुल्नेछ।
                </p>
              </div>
            ) : !selectedPalikaId ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-blue-300 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20">
                <Sparkles className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300">
                  {selectedDistrict?.name_ne} जिल्ला चयन भयो। अब स्थानीय तह छनौट गर्नुहोस्।
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  दोस्रो ड्रपडाउनबाट कुनै एक स्थानीय तह छान्नुहोस्।
                </p>
              </div>
            ) : selectedPalikaContact ? (
              <div 
                className="a11y-card bg-linear-to-br from-slate-50 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/40 rounded-3xl p-6 sm:p-8 border-2 border-blue-600/60 dark:border-blue-500/60 shadow-xl transition-all"
                tabIndex={0}
                onFocus={() => {
                  if (audioPin && selectedPalikaContact) {
                    speakText(
                      `${selectedPalikaContact.local_government_name_ne}, ${selectedPalikaContact.district_name_ne}। ` +
                      `अपाङ्गता सहायता सहजकर्ता ${selectedPalikaContact.disability_facilitator_name || "उपलब्ध हुन बाँकी"}। ` +
                      `महिला तथा सामाजिक शाखा ${selectedPalikaContact.women_children_social_branch_name || "उपलब्ध हुन बाँकी"}। ` +
                      `उपप्रमुख ${selectedPalikaContact.deputy_mayor_chairperson_name || "उपलब्ध हुन बाँकी"}।`
                    );
                  }
                }}
              >
                {/* Card Title Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-xl shadow-md">
                      🏛️
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {selectedPalikaContact.local_government_name_ne}
                      </h3>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>{selectedPalikaContact.district_name_ne} जिल्ला, कोशी प्रदेश</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedPalikaContact.is_public ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>सार्वजनिक सम्पर्क (Verified Public)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-300 dark:border-amber-800">
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>गोप्य / सुरक्षित (Internal Only)</span>
                      </span>
                    )}

                    {/* Admin quick edit shortcut */}
                    {isAdminMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditDistrictId(selectedPalikaContact.district_id);
                          setEditPalikaId(selectedPalikaContact.local_government_id);
                          setActiveFeature("edit_palika");
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full text-xs font-black shadow-xs cursor-pointer transition-all"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>सम्पादन गर्नुहोस्</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Official Palika Phone & Email Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6 p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/60 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <PhoneCall className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                          पालिकाको आधिकारिक फोन / मोबाइल:
                        </span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white font-mono block">
                          {selectedPalikaContact.official_phone || "उपलब्ध हुन बाँकी"}
                        </span>
                      </div>
                    </div>
                    {selectedPalikaContact.official_phone && (
                      <a
                        href={`tel:${selectedPalikaContact.official_phone}`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs shrink-0 cursor-pointer"
                        aria-label={`पालिका आधिकारिक फोन ${selectedPalikaContact.official_phone} मा कल गर्नुहोस्`}
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>कल</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/60 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                          पालिकाको आधिकारिक इमेल एड्रेस:
                        </span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white font-mono block truncate max-w-[170px] sm:max-w-[210px]">
                          {selectedPalikaContact.official_email || `${selectedPalikaContact.local_government_id}@koshi.gov.np`}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`mailto:${selectedPalikaContact.official_email || `${selectedPalikaContact.local_government_id}@koshi.gov.np`}`}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs shrink-0 cursor-pointer"
                      aria-label="पालिका आधिकारिक इमेलमा सन्देश पठाउनुहोस्"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>इमेल</span>
                    </a>
                  </div>
                </div>

                {/* 3 Core Roles: (क), (ख), (ग) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* (क) अपाङ्गता सहायता सहजकर्ता */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider block mb-1">
                        (क) अपाङ्गता सहायता सहजकर्ता
                      </span>
                      <div className="mt-3">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">नाम:</span>
                        <div className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                          {selectedPalikaContact.disability_facilitator_name 
                            ? selectedPalikaContact.disability_facilitator_name 
                            : "[अपाङ्गता सहायता सहजकर्ताको नाम उपलब्ध हुन बाँकी]"}
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">मोबाइल नं.:</span>
                        {!selectedPalikaContact.is_public ? (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold block mt-1">
                            [सार्वजनिक गर्न अनुमति नभएको]
                          </span>
                        ) : selectedPalikaContact.disability_facilitator_mobile ? (
                          <div className="mt-1">
                            <span className="font-bold text-base font-mono text-blue-900 dark:text-blue-300 block">
                              {selectedPalikaContact.disability_facilitator_mobile}
                            </span>
                            <a
                              href={`tel:${selectedPalikaContact.disability_facilitator_mobile}`}
                              className="mt-2.5 w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                              aria-label={`सहजकर्तालाई ${selectedPalikaContact.disability_facilitator_mobile} मा फोन गर्नुहोस्`}
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>📞 फोन गर्नुहोस्</span>
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block mt-1">
                            [मोबाइल नम्बर उपलब्ध हुन बाँकी]
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* (ख) महिला, बालबालिका / सामाजिक शाखा प्रमुख वा प्रतिनिधि */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-black text-purple-700 dark:text-purple-400 uppercase tracking-wider block mb-1">
                        (ख) महिला, बालबालिका / सामाजिक शाखा
                      </span>
                      <div className="mt-3">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">नाम (प्रमुख वा प्रतिनिधि):</span>
                        <div className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                          {selectedPalikaContact.women_children_social_branch_name 
                            ? selectedPalikaContact.women_children_social_branch_name 
                            : "[सामाजिक शाखा प्रमुखको नाम उपलब्ध हुन बाँकी]"}
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">मोबाइल नं.:</span>
                        {!selectedPalikaContact.is_public ? (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold block mt-1">
                            [सार्वजनिक गर्न अनुमति नभएको]
                          </span>
                        ) : selectedPalikaContact.women_children_social_branch_mobile ? (
                          <div className="mt-1">
                            <span className="font-bold text-base font-mono text-purple-900 dark:text-purple-300 block">
                              {selectedPalikaContact.women_children_social_branch_mobile}
                            </span>
                            <a
                              href={`tel:${selectedPalikaContact.women_children_social_branch_mobile}`}
                              className="mt-2.5 w-full py-2.5 px-3 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                              aria-label={`सामाजिक शाखा प्रमुखलाई ${selectedPalikaContact.women_children_social_branch_mobile} मा फोन गर्नुहोस्`}
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>📞 फोन गर्नुहोस्</span>
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block mt-1">
                            [मोबाइल नम्बर उपलब्ध हुन बाँकी]
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* (ग) उपप्रमुख / उपाध्यक्ष */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
                        (ग) उपप्रमुख / उपाध्यक्ष
                      </span>
                      <div className="mt-3">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">नाम:</span>
                        <div className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                          {selectedPalikaContact.deputy_mayor_chairperson_name 
                            ? selectedPalikaContact.deputy_mayor_chairperson_name 
                            : "[उपप्रमुख / उपाध्यक्षको नाम उपलब्ध हुन बाँकी]"}
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">सम्पर्क नं.:</span>
                        {!selectedPalikaContact.is_public ? (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold block mt-1">
                            [सार्वजनिक गर्न अनुमति नभएको]
                          </span>
                        ) : selectedPalikaContact.deputy_mayor_chairperson_mobile ? (
                          <div className="mt-1">
                            <span className="font-bold text-base font-mono text-amber-900 dark:text-amber-300 block">
                              {selectedPalikaContact.deputy_mayor_chairperson_mobile}
                            </span>
                            <a
                              href={`tel:${selectedPalikaContact.deputy_mayor_chairperson_mobile}`}
                              className="mt-2.5 w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                              aria-label={`उपप्रमुखलाई ${selectedPalikaContact.deputy_mayor_chairperson_mobile} मा फोन गर्नुहोस्`}
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>📞 फोन गर्नुहोस्</span>
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block mt-1">
                            [सम्पर्क नम्बर उपलब्ध हुन बाँकी]
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer link to full palika profile */}
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    यस पालिकाको अपाङ्गता प्रतिवेदन तथा तथ्यांक हेर्नुहोस्:
                  </span>
                  <a
                    href={`/local-reporting/palika/${selectedPalikaContact.local_government_id}/profile`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span>पालिका प्रोफाइल तथा रिपोर्ट खोल्नुहोस्</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                  यस स्थानीय तहको सम्पर्क विवरण हाल उपलब्ध छैन।
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  सम्बन्धित स्थानीय तह वा जिल्ला सम्पर्क सहजकर्ताबाट विवरण प्राप्त हुनासाथ प्रणालीमा अद्यावधिक गरिनेछ।
                </p>
              </div>
            )}
          </div>
        ) : (
          /* TAB CONTENT 3: PALIKA EDIT (ADMIN ONLY) */
          <div className="space-y-6">
            {/* Admin Status Notice Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xs">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-amber-950 dark:text-amber-200">
                      (३) स्थानीय तह आधिकारिक सम्पर्क सम्पादन
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-black uppercase">
                      Admin Only
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 max-w-2xl">
                    यहाँबाट सेभ गरिएको पालिकाको आधिकारिक फोन वा मोबाइल नम्बर र इमेल एड्रेस पालिकागत सम्पर्क निर्देशिका, एकीकृत सूचना र गुनासो दर्ता प्रणालीमा स्वतः लागु हुनेछ।
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (editPalikaId) {
                    setSelectedDistrictId(editDistrictId);
                    setSelectedPalikaId(editPalikaId);
                  }
                  setActiveFeature("directory");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 shadow-2xs cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>निर्देशिका हेर्नुहोस्</span>
              </button>
            </div>

            {/* Dependent Dropdowns: १. जिल्ला छनौट ➔ २. पालिका छनौट */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70">
              {/* Select District */}
              <div>
                <label 
                  htmlFor="tab3-district-select"
                  className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5"
                >
                  १. जिल्ला छनौट गर्नुहोस् <span className="text-rose-500">*</span>
                </label>
                <select
                  id="tab3-district-select"
                  value={editDistrictId}
                  onChange={(e) => {
                    setEditDistrictId(e.target.value);
                    setEditPalikaId("");
                    setEditSaveMessage("");
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden cursor-pointer shadow-xs"
                >
                  <option value="">-- जिल्ला छनौट गर्नुहोस् (१४ जिल्ला) --</option>
                  {KOSHI_DISTRICTS.map((d, i) => (
                    <option key={d.id} value={d.id}>
                      {i + 1}. {d.name_ne} ({d.local_governments.length} स्थानीय तह)
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  सम्पादन गर्न चाहेको पालिका रहेको जिल्ला छान्नुहोस्।
                </span>
              </div>

              {/* Select Palika */}
              <div>
                <label 
                  htmlFor="tab3-palika-select"
                  className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5"
                >
                  २. पालिका छनौट गर्नुहोस् <span className="text-rose-500">*</span>
                </label>
                <select
                  id="tab3-palika-select"
                  disabled={!editDistrictId}
                  value={editPalikaId}
                  onChange={(e) => {
                    setEditPalikaId(e.target.value);
                    setEditSaveMessage("");
                  }}
                  className={`w-full border rounded-xl px-4 py-3 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden shadow-xs ${
                    !editDistrictId
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 cursor-not-allowed"
                      : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 cursor-pointer"
                  }`}
                >
                  <option value="">
                    {!editDistrictId 
                      ? "पहिले जिल्ला छनौट गर्नुहोस्" 
                      : `-- स्थानीय तह छनौट गर्नुहोस् (${editAvailablePalikas.length} वटा) --`}
                  </option>
                  {editAvailablePalikas.map((p, i) => (
                    <option key={p.id} value={p.id}>
                      {i + 1}. {p.name_ne} ({p.type})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  {!editDistrictId 
                    ? "पहिले जिल्ला चयन गरेपछि मात्र स्थानीय तह देखिनेछ।" 
                    : `${editSelectedDistrict?.name_ne} जिल्लाभित्रका स्थानीय तहहरू।`}
                </span>
              </div>
            </div>

            {/* Form Body: Shows when Palika is selected */}
            {!editDistrictId ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  माथि दिइएको ड्रपडाउनबाट पहिले जिल्ला छान्नुहोस्।
                </h3>
              </div>
            ) : !editPalikaId ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20">
                <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  {editSelectedDistrict?.name_ne} जिल्ला चयन भयो। अब स्थानीय तह छनौट गर्नुहोस्।
                </h3>
              </div>
            ) : (
              <form onSubmit={handleSavePalikaContact} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-400/60 dark:border-amber-500/40 shadow-lg space-y-6">
                {/* Header of selected palika */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-xs">
                      🏛️
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {selectedEditPalikaObj?.name_ne} ({selectedEditPalikaObj?.type})
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span>{editSelectedDistrict?.name_ne} जिल्ला, कोशी प्रदेश</span>
                      </span>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                    सम्पादन मोड सक्रिय
                  </span>
                </div>

                {/* Section 1: Core Official Contacts (Requested by user: Official Phone/Mobile & Official Email) */}
                <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                      १. पालिकाको आधिकारिक सम्पर्क (फोन/मोबाइल र आधिकारिक इमेल एड्रेस)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Official Phone / Mobile */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                        पालिकाको आधिकारिक फोन वा मोबाइल नम्बर <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={editForm.official_phone}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, official_phone: e.target.value }))}
                          placeholder="उदा: ०२१-४६२८०० वा ९८५२०XXXXX"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden shadow-2xs"
                          required
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                        यो नम्बर पालिकाको सम्पर्क निर्देशिकामा नागरिक तथा संस्थाले कल गर्नका लागि देखिनेछ।
                      </span>
                    </div>

                    {/* Official Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                        पालिकाको आधिकारिक इमेल एड्रेस <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          value={editForm.official_email}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, official_email: e.target.value }))}
                          placeholder="उदा: info@palikaname.gov.np"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden shadow-2xs"
                          required
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                        यो इमेलमा एकीकृत सूचना (Mass Email) र नागरिकका गुनासोहरू स्वतः पठाइनेछ।
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Roles (Facilitator, Social Branch, Deputy) */}
                <div>
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                    २. सम्बन्धित जिम्मेवार पदाधिकारीहरूको विवरण (ऐच्छिक)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Facilitator */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block">
                        (क) अपाङ्गता सहायता सहजकर्ता
                      </span>
                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">नाम:</label>
                        <input
                          type="text"
                          value={editForm.disability_facilitator_name}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, disability_facilitator_name: e.target.value }))}
                          placeholder="सहजकर्ताको नाम"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">मोबाइल नं.:</label>
                        <input
                          type="text"
                          value={editForm.disability_facilitator_mobile}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, disability_facilitator_mobile: e.target.value }))}
                          placeholder="९८XXXXXXXX"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Social Branch */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-400 block">
                        (ख) महिला, बालबालिका / सामाजिक शाखा
                      </span>
                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">नाम (प्रमुख / प्रतिनिधि):</label>
                        <input
                          type="text"
                          value={editForm.women_children_social_branch_name}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, women_children_social_branch_name: e.target.value }))}
                          placeholder="शाखा प्रमुखको नाम"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">मोबाइल नं.:</label>
                        <input
                          type="text"
                          value={editForm.women_children_social_branch_mobile}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, women_children_social_branch_mobile: e.target.value }))}
                          placeholder="९८XXXXXXXX"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    {/* Deputy Mayor */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block">
                        (ग) उपप्रमुख / उपाध्यक्ष
                      </span>
                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">नाम:</label>
                        <input
                          type="text"
                          value={editForm.deputy_mayor_chairperson_name}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, deputy_mayor_chairperson_name: e.target.value }))}
                          placeholder="उपप्रमुखको नाम"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">सम्पर्क नं.:</label>
                        <input
                          type="text"
                          value={editForm.deputy_mayor_chairperson_mobile}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, deputy_mayor_chairperson_mobile: e.target.value }))}
                          placeholder="९८XXXXXXXX"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Visibility Status */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">सार्वजनिक स्थिति:</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {editForm.is_public ? "नागरिकहरूले पोर्टलमा प्रत्यक्ष हेर्न तथा कल गर्न पाउनेछन्।" : "यो विवरण आन्तरिक प्रशासनका लागि मात्र सुरक्षित रहनेछ।"}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.is_public}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, is_public: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Success or Error Notice */}
                {editSaveMessage && (
                  <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                    editSaveStatus === "saved" 
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800" 
                      : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                  }`}>
                    {editSaveStatus === "saved" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                    <span>{editSaveMessage}</span>
                  </div>
                )}

                {/* Submit Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDistrictId(editDistrictId);
                      setSelectedPalikaId(editPalikaId);
                      setActiveFeature("directory");
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>निर्देशिकामा हेर्नुहोस् (View in Directory)</span>
                  </button>

                  <button
                    type="submit"
                    disabled={editSaveStatus === "saving"}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editSaveStatus === "saving" ? "सेभ हुँदैछ..." : "सम्पर्क विवरण सुरक्षित गर्नुहोस् (Save)"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </section>

        {/* ============================================================= */}
        {/* GOVERNMENT GRIEVANCE & COMPLAINT SUBMISSION SYSTEM */}
        {/* ============================================================= */}
        <GovernmentGrievanceForm />

      </main>

      <Footer lang={lang} />
    </div>
  );
}
