"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { translations, Language } from "@/lib/translations";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import { 
  getProvinceContacts, 
  getLocalGovernmentContacts, 
  ProvinceContact, 
  LocalGovernmentContact 
} from "@/lib/contactService";
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
  EyeOff
} from "lucide-react";
import GovernmentGrievanceForm from "@/components/grievance/GovernmentGrievanceForm";

export default function ContactPage() {
  const [lang, setLang] = useState<Language>("ne");
  const { announceLive, speakText, audioPin } = useAccessibility();

  // Province and Local Contacts State
  const [provinceContacts, setProvinceContacts] = useState<ProvinceContact[]>([]);
  const [localContacts, setLocalContacts] = useState<LocalGovernmentContact[]>([]);

  // Dependent Dropdown State
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [selectedPalikaId, setSelectedPalikaId] = useState<string>("");

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Load Contacts and listen for updates
  useEffect(() => {
    const loadData = () => {
      setProvinceContacts(getProvinceContacts());
      setLocalContacts(getLocalGovernmentContacts());
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
                  सम्पर्क निर्देशिका (Contact Directory)
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  १४ जिल्ला र १३७ स्थानीय तह
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                सम्पर्क निर्देशिका तथा सहायता कक्ष (Contact Directory)
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
                सामाजिक विकास मन्त्रालय, राष्ट्रिय अपाङ्ग महासंघ र कोशी प्रदेशका सम्पूर्ण १३७ स्थानीय तहका अपाङ्गता सहायता सहजकर्ता, सामाजिक शाखा र उपप्रमुखहरूको आधिकारिक सम्पर्क विवरण।
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
              if (audioPin) speakText("सामाजिक विकास मन्त्रालय, कोशी प्रदेश सम्पर्क विवरण।");
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-black text-xl shadow-xs">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  खण्ड १: प्रदेश मन्त्रालय
                </span>
              </div>

              <h2 id="ministry-contact-heading" className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                {ministryContact.organization_name_ne}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                अपाङ्गता सूचना तथा तथ्यांक व्यवस्थापन केन्द्र (DIC) मुख्य प्रशासनिक निकाय
              </p>

              {/* Fields */}
              <div className="mt-5 space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                    सम्पर्क व्यक्ति:
                  </span>
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{ministryContact.contact_person_name ? ministryContact.contact_person_name : "[सम्पर्क व्यक्तिको नाम उपलब्ध हुन बाँकी]"}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                    सम्पर्क व्यक्तिको मोबाइल नं.:
                  </span>
                  {ministryContact.contact_person_mobile ? (
                    <div className="flex items-center justify-between mt-1">
                      <a 
                        href={`tel:${ministryContact.contact_person_mobile}`}
                        className="font-bold text-base text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1.5 font-mono"
                        aria-label={`सम्पर्क व्यक्तिको मोबाइल ${ministryContact.contact_person_mobile} मा कल गर्नुहोस्`}
                      >
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span>{ministryContact.contact_person_mobile}</span>
                      </a>
                      <a
                        href={`tel:${ministryContact.contact_person_mobile}`}
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
                    <span>फोन: {ministryContact.office_phone || "०२१-४६२८००"}</span>
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
                <span>{ministryContact.address_ne || "विराटनगर-१०, मोरङ"}</span>
              </span>
              <span className="text-[11px]">अद्यावधिक: {ministryContact.updated_at || "२०८२/०५/०१"}</span>
            </div>
          </section>

          {/* SECTION 2: राष्ट्रिय अपाङ्ग महासंघ नेपाल, कोशी प्रदेश */}
          <section 
            aria-labelledby="nfdn-contact-heading"
            className="a11y-card bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all"
            tabIndex={0}
            onFocus={() => {
              if (audioPin) speakText("राष्ट्रिय अपाङ्ग महासंघ नेपाल, कोशी प्रदेश सम्पर्क विवरण।");
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center font-black text-xl shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                  खण्ड २: महासंघ प्रदेश कार्यालय
                </span>
              </div>

              <h2 id="nfdn-contact-heading" className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                {nfdnContact.organization_name_ne}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                अपाङ्गता अधिकार, पैरवी तथा नागरिक सरोकार प्रदेश समन्वय समिति
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
                    खण्ड ३
                  </span>
                </div>
                <h2 id="local-contact-heading" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  स्थानीय तहमा सम्पर्क गर्नको लागि
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  पहिले जिल्ला छनौट गर्नुहोस् र त्यसपछि स्थानीय तह चयन गरी आधिकारिक सम्पर्क विवरण प्राप्त गर्नुहोस्।
                </p>
              </div>

              {/* Quick Search Input */}
              <div className="w-full sm:w-80 relative">
                <label htmlFor="contact-search" className="sr-only">सम्पर्क खोज्नुहोस्</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
                  <input
                    id="contact-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="जिल्ला, पालिका, नाम वा नम्बर खोज्नुहोस्..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* SEARCH RESULTS DROPDOWN / LIST (When user types search query) */}
            {searchQuery.trim() && (
              <div className="mb-6 p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                    खोज नतिजा: {searchResults.length} वटा स्थानीय तह फेला पर्यो
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold"
                  >
                    बन्द गर्नुहोस्
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
