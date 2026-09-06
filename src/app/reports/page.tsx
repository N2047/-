"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import { translations, Language } from "@/lib/translations";
import { 
  getCompiledPalikaReports, 
  calculateCompiledGrandTotals, 
  exportCompiledPalikasToExcel, 
  CompiledPalikaData 
} from "@/lib/compiledPalikaReports";
import * as XLSX from "xlsx";
import { 
  BarChart3, 
  Home, 
  PackageCheck, 
  Users, 
  GitCompare, 
  Printer, 
  Table as TableIcon,
  CheckCircle2, 
  FileSpreadsheet, 
  Building2, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  GraduationCap, 
  Coins, 
  HeartPulse, 
  Award, 
  ArrowRight, 
  TrendingUp, 
  Activity, 
  Layers, 
  Check,
  Search,
  FileText,
  Filter,
  DownloadCloud,
  Clock,
  RotateCcw
} from "lucide-react";

export type ReportSubject = 
  | 'overall' 
  | 'services' 
  | 'social_security' 
  | 'employment' 
  | 'education' 
  | 'home_visits' 
  | 'assistive_devices' 
  | 'demographics' 
  | 'budget_governance' 
  | 'comparison';

export default function ReportsPage() {
  const [lang, setLang] = useState<Language>("ne");
  const [activeSubject, setActiveSubject] = useState<ReportSubject>("overall");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("all");
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("2082_083");
  const [viewTableMode, setViewTableMode] = useState<boolean>(false);

  // Primary Mode: 'compiled_palikas' (सबै १३७ स्थानीय तहको कम्पाइल प्रतिवेदन) vs 'analytics' (१० विषयगत समग्र विश्लेषण)
  const [mainReportView, setMainReportView] = useState<"compiled_palikas" | "analytics">("compiled_palikas");
  const [compiledPalikaSearch, setCompiledPalikaSearch] = useState<string>("");
  const [compiledTypeFilter, setCompiledTypeFilter] = useState<string>("all");

  // Compiled Data across all 137 Palikas of Koshi Province
  const allCompiledPalikas = useMemo(() => getCompiledPalikaReports(), []);

  const filteredCompiledPalikas = useMemo(() => {
    return allCompiledPalikas.filter((p) => {
      const matchesDistrict = selectedDistrictId === "all" || p.districtId === selectedDistrictId;
      const matchesType = compiledTypeFilter === "all" || p.type === compiledTypeFilter;
      const matchesSearch =
        !compiledPalikaSearch.trim() ||
        p.name_ne.toLowerCase().includes(compiledPalikaSearch.toLowerCase()) ||
        p.name_en.toLowerCase().includes(compiledPalikaSearch.toLowerCase()) ||
        p.districtName_ne.toLowerCase().includes(compiledPalikaSearch.toLowerCase());
      return matchesDistrict && matchesType && matchesSearch;
    });
  }, [allCompiledPalikas, selectedDistrictId, compiledTypeFilter, compiledPalikaSearch]);

  const compiledGrandTotals = useMemo(() => {
    return calculateCompiledGrandTotals(filteredCompiledPalikas);
  }, [filteredCompiledPalikas]);

  // Palika Comparison state
  const [comparisonPalikas, setComparisonPalikas] = useState<string[]>([
    "phidim_mun", 
    "falelung_rm", 
    "biratnagar_met",
    "dharan_submet",
    "damak_mun"
  ]);

  const t = translations[lang];

  // Subject-wise Tabs: All 10 core areas filled at the local level
  const subjectTabs = [
    { 
      id: 'overall' as ReportSubject, 
      label: '१. समग्र प्रतिवेदन', 
      icon: BarChart3, 
      short: 'समग्र सारांश',
      desc: 'कोशी प्रदेशको समग्र तथ्यांक तथा स्थिति',
      badge: '३२,४५० पहिचान'
    },
    { 
      id: 'services' as ReportSubject, 
      label: '२. सेवासुविधाहरू', 
      icon: HeartPulse, 
      short: 'सेवा प्रवाह',
      desc: 'परामर्श, थेरापी, उपचार र स्वास्थ्य बीमा',
      badge: '२२,८६० लाभान्वित'
    },
    { 
      id: 'social_security' as ReportSubject, 
      label: '३. सामाजिक सुरक्षा', 
      icon: ShieldCheck, 
      short: 'सुरक्षा भत्ता',
      desc: 'रातो/निलो कार्ड भत्ता, परिचयपत्र र वर्ग मिलान',
      badge: '१३,९७० भत्ता प्राप्त'
    },
    { 
      id: 'employment' as ReportSubject, 
      label: '४. रोजगार तथा उद्यम', 
      icon: Briefcase, 
      short: 'रोजगार/सीप',
      desc: 'सीप तालिम, रोजगारी, समूह र बिउपुँजी परिचालन',
      badge: '२,७६० कार्यरत'
    },
    { 
      id: 'education' as ReportSubject, 
      label: '५. शिक्षा र बालबालिका', 
      icon: GraduationCap, 
      short: 'शिक्षा/बालबालिका',
      desc: 'भर्ना, छात्रवृत्ति, घरमै शिक्षा र बाल क्लब',
      badge: '४,१२० अध्ययनरत'
    },
    { 
      id: 'home_visits' as ReportSubject, 
      label: '६. गृहभेट तथ्यांक', 
      icon: Home, 
      short: 'गृहभेट सेवा',
      desc: 'सहजकर्ताद्वारा घरमै पुगी गरिएको प्रत्यक्ष सेवा',
      badge: '८,४२० गृहभेट'
    },
    { 
      id: 'assistive_devices' as ReportSubject, 
      label: '७. सहायक सामग्री', 
      icon: PackageCheck, 
      short: 'सामग्री वितरण',
      desc: 'ह्वीलचेयर, सेतो छडी, श्रवण यन्त्र वितरण',
      badge: '२,९४० थान'
    },
    { 
      id: 'demographics' as ReportSubject, 
      label: '८. लैङ्गिक तथा प्रकारगत', 
      icon: Users, 
      short: '१० प्रकार वर्गीकरण',
      desc: '१० प्रकारका अपाङ्गता तथा कार्ड रंग विवरण',
      badge: '१० प्रकारगत'
    },
    { 
      id: 'budget_governance' as ReportSubject, 
      label: '९. संस्थागत र बजेट', 
      icon: Coins, 
      short: 'बजेट/सुशासन',
      desc: 'पालिका बजेट, खर्च, DPO अनुदान र नीति प्रबन्ध',
      badge: 'रु. १६.४ करोड बजेट'
    },
    { 
      id: 'comparison' as ReportSubject, 
      label: '१०. स्थानीय तहगत तुलना', 
      icon: GitCompare, 
      short: 'पालिका तुलना',
      desc: 'पालिकाहरूबीच बहु-सूचक तुलनात्मक विश्लेषण',
      badge: '१३७ पालिका'
    },
  ];

  // Dynamic Multiplier based on district filter
  const filterMultiplier = useMemo(() => {
    if (selectedDistrictId === "all") return 1.0;
    const d = KOSHI_DISTRICTS.find((dist) => dist.id === selectedDistrictId);
    if (!d) return 1.0;
    return Number((d.local_governments.length / 137).toFixed(3));
  }, [selectedDistrictId]);

  // Current District Label
  const currentDistrictName = useMemo(() => {
    if (selectedDistrictId === "all") return "कोशी प्रदेश समग्र (१४ वटै जिल्ला)";
    const d = KOSHI_DISTRICTS.find((dist) => dist.id === selectedDistrictId);
    return d ? `${d.name_ne} जिल्ला (${d.local_governments.length} स्थानीय तह)` : "कोशी प्रदेश";
  }, [selectedDistrictId]);

  // Scaled Data for District / Province
  const scale = (val: number) => Math.round(val * filterMultiplier);

  // 1. Overall Macro Indicators
  const overallStats = {
    totalIdentified: scale(32450),
    femaleIdentified: scale(14602),
    maleIdentified: scale(17848),
    activeBeneficiaries: scale(29840),
    deceased: scale(1420),
    migratedOut: scale(1190),
    totalHomeVisits: scale(8420),
    totalAssistiveDistributed: scale(2940),
    totalServicesBeneficiaries: scale(22860),
    totalSocialSecurityAllowance: scale(13970),
    totalEmployedAndEnterprise: scale(2760),
    totalEnrolledStudents: scale(4120),
    totalScholarshipReceived: scale(3680),
    totalShgMembers: scale(6850),
    totalSeedCapitalNPR: filterMultiplier === 1.0 ? "४,८५,००,०००" : `${Math.round(485 * filterMultiplier).toLocaleString("ne-NP")},००,०००`,
    totalAllocatedBudgetNPR: filterMultiplier === 1.0 ? "१६,४०,००,०००" : `${Math.round(1640 * filterMultiplier).toLocaleString("ne-NP")},००,०००`,
  };

  // 2. Services & Health Rehabilitation Data (Q10 to Q13, Q33)
  const servicesData = [
    { name: "व्यक्तिगत तथा पारिवारिक परामर्श सेवा (Counselling)", female: scale(4520), male: scale(4900), total: scale(9420), pct: 29.0, note: "मनोसामाजिक र पुनर्स्थापना परामर्श" },
    { name: "स्वास्थ्य उपचार, थेरापी तथा पुनःस्थापना सेवा", female: scale(2610), male: scale(3230), total: scale(5840), pct: 18.0, note: "फिजियोथेरापी, अकुपेशनल र मेडिकल सेवा" },
    { name: "निःशुल्क स्वास्थ्य बीमा सुविधा प्राप्त व्यक्ति", female: scale(5890), male: scale(6510), total: scale(12400), pct: 38.2, note: "सरकारद्वारा प्रिमियम भुक्तानी" },
    { name: "सहुलियतपूर्ण स्वास्थ्य बीमा सुविधा प्राप्त", female: scale(2780), male: scale(3070), total: scale(5850), pct: 18.0, note: "५०% सहुलियत योजना" },
    { name: "सहायक सामग्री प्राप्त गरेका लाभग्राही", female: scale(1365), male: scale(1575), total: scale(2940), pct: 9.1, note: "निःशुल्क सामग्री हस्तान्तरण" },
  ];

  // 3. Social Security & ID Cards (Q24 to Q27, Q2 to Q6)
  const socialSecurityData = [
    { scheme: "पूर्ण अशक्त अपाङ्गता भत्ता (रातो कार्ड - 'क' वर्ग)", rate: "रु. ४,३००/महिना", female: scale(2120), male: scale(2700), total: scale(4820), annualAmount: filterMultiplier === 1.0 ? "२४.८ करोड" : `${(24.8 * filterMultiplier).toFixed(1)} करोड` },
    { scheme: "अति अशक्त अपाङ्गता भत्ता (निलो कार्ड - 'ख' वर्ग)", rate: "रु. २,१२८/महिना", female: scale(4110), male: scale(5040), total: scale(9150), annualAmount: filterMultiplier === 1.0 ? "२३.४ करोड" : `${(23.4 * filterMultiplier).toFixed(1)} करोड` },
    { scheme: "मध्यम अपाङ्गता भएका व्यक्ति (पहेलो कार्ड - 'ग' वर्ग)", rate: "सेवा सहुलियत", female: scale(5080), male: scale(6200), total: scale(11280), annualAmount: "सहुलियत सेवा" },
    { scheme: "सामान्य अपाङ्गता भएका व्यक्ति (सेतो कार्ड - 'घ' वर्ग)", rate: "प्राथमिकता", female: scale(3292), male: scale(3908), total: scale(7200), annualAmount: "प्राथमिकता सेवा" },
  ];

  const idCardStatusSummary = [
    { title: "कुल परिचयपत्र वितरण भएको", count: scale(32450), pct: "१००%" },
    { title: "विस्तृत व्यक्तिगत प्रोफाइल संकलन सम्पन्न", count: scale(28600), pct: "८८.१%" },
    { title: "परिचयपत्र लिन वा नवीकरण गर्न बाँकी", count: scale(1840), pct: "५.७%" },
    { title: "भत्ता र परिचयपत्र वर्ग नमिलेका (समस्या पहिचान)", count: scale(640), pct: "२.०%" },
  ];

  // 4. Employment, Skills & Enterprise (Q21 to Q23, Q28-Q29)
  const trainingSkillsData = [
    { trade: "सिलाइकटाइ तथा बुनाइ तालिम", duration: "३ महिना", female: scale(620), male: scale(80), total: scale(700) },
    { trade: "कम्प्युटर, डिजिटल सीप तथा डाटा एन्ट्री", duration: "६ महिना", female: scale(310), male: scale(390), total: scale(700) },
    { trade: "बाख्रापालन, कुखुरापालन तथा तरकारी खेती", duration: "१ महिना", female: scale(340), male: scale(460), total: scale(800) },
    { trade: "बेकरी, कुकिङ तथा खाद्य प्रशोधन", duration: "४५ दिन", female: scale(240), male: scale(180), total: scale(420) },
    { trade: "हस्तकला, मुढा तथा बाँसका सामग्री", duration: "१ महिना", female: scale(210), male: scale(290), total: scale(500) },
    { trade: "मोबाइल तथा घरायसी उपकरण मर्मत", duration: "३ महिना", female: scale(60), male: scale(240), total: scale(300) },
  ];

  const employmentTypeData = [
    { type: "घरेलु उद्यम, खुद्रा व्यापार तथा किराना", female: scale(540), male: scale(680), total: scale(1220), pct: 44.2 },
    { type: "कृषि, बाख्रापालन, डेरी तथा तरकारी", female: scale(310), male: scale(310), total: scale(620), pct: 22.5 },
    { type: "निजी कम्पनी, कारखाना तथा सेवा क्षेत्र", female: scale(180), male: scale(360), total: scale(540), pct: 19.6 },
    { type: "सरकारी सेवा, शिक्षक तथा स्थानीय तह", female: scale(110), male: scale(270), total: scale(380), pct: 13.7 },
  ];

  // 5. Education & Children (Q14 to Q20)
  const educationData = [
    { indicator: "यस आ.व. मा विद्यालयमा नयाँ भर्ना भएका बालबालिका", female: scale(310), male: scale(370), total: scale(680) },
    { indicator: "हाल विद्यालयमा अध्ययनरत कुल अपाङ्गता भएका विद्यार्थी", female: scale(1890), male: scale(2230), total: scale(4120) },
    { indicator: "नियमित छात्रवृत्ति प्राप्त गरिरहेका विद्यार्थी", female: scale(1690), male: scale(1990), total: scale(3680) },
    { indicator: "घरमै आधारित शिक्षा (Home-based Education) पाउने बालबालिका", female: scale(210), male: scale(240), total: scale(450) },
    { indicator: "विद्यालय उमेरका तर विद्यालय बाहिर रहेका (पहिचान भएका)", female: scale(350), male: scale(410), total: scale(760) },
    { indicator: "स्थानीय बाल क्लबहरूमा आबद्ध बालबालिका", female: scale(440), male: scale(540), total: scale(980) },
  ];

  // 6. Home Visits (Q11 & Schedule 1.1)
  const homeVisitsBySeverity = [
    { label: "रातो (पूर्ण अशक्त)", female: scale(1420), male: scale(1680), total: scale(3100), pct: 36.8, desc: "दैनिक जीवनयापनका लागि अरूकै सहारा चाहिने" },
    { label: "निलो (अति अशक्त)", female: scale(1250), male: scale(1530), total: scale(2780), pct: 33.0, desc: "सहयोगी सामग्री वा व्यक्तिगत सहयोग आवश्यक" },
    { label: "पहेलो (मध्यम)", female: scale(890), male: scale(1020), total: scale(1910), pct: 22.7, desc: "दैनिक कार्य सामान्य सहयोगबाट गर्न सक्ने" },
    { label: "सेतो (सामान्य)", female: scale(280), male: scale(350), total: scale(630), pct: 7.5, desc: "सामान्य सामाजिक तथा भौतिक अवरोध भएको" },
  ];

  // 7. Assistive Devices (Q12 & Schedule 1.2)
  const assistiveDevicesData = [
    { name: "ह्वीलचेयर (Wheelchair)", count: scale(780), female: scale(360), male: scale(420) },
    { name: "सेतो छडी (White Cane)", count: scale(620), female: scale(290), male: scale(330) },
    { name: "बैशाखी तथा एल्बो क्रच (Crutches)", count: scale(480), female: scale(210), male: scale(270) },
    { name: "श्रवण यन्त्र (Hearing Aid)", count: scale(430), female: scale(200), male: scale(230) },
    { name: "कमोड कुर्सी (Commode Chair)", count: scale(290), female: scale(140), male: scale(150) },
    { name: "ट्राइसाइकल (Tricycle)", count: scale(190), female: scale(70), male: scale(120) },
    { name: "अन्य सहायक सामग्री (वाकर, कुसन आदि)", count: scale(150), female: scale(65), male: scale(85) },
  ];

  // 8. 10 Disability Types (Q34)
  const disabilityTypesData = [
    { type: "शारीरिक अपाङ्गता", count: scale(11240), pct: 34.6 },
    { type: "दृष्टि सम्बन्धी (न्यून दृष्टि / दृष्टिबिहीनता)", count: scale(6420), pct: 19.8 },
    { type: "सुनाइ सम्बन्धी (सुस्तश्रवण / बहिरा)", count: scale(5180), pct: 16.0 },
    { type: "मानसिक तथा मनोसामाजिक अपाङ्गता", count: scale(2840), pct: 8.8 },
    { type: "बौद्धिक अपाङ्गता", count: scale(2350), pct: 7.2 },
    { type: "स्वर र बोलाइ सम्बन्धी", count: scale(1420), pct: 4.4 },
    { type: "बहु-अपाङ्गता (Multiple Disabilities)", count: scale(1380), pct: 4.3 },
    { type: "हेमोफिलिया", count: scale(640), pct: 2.0 },
    { type: "अटिज्म (Autism Spectrum)", count: scale(520), pct: 1.6 },
    { type: "श्रवण-दृष्टिबिहीन (Deafblind)", count: scale(460), pct: 1.4 },
  ];

  // 9. Institutional Budget & Governance (Q30-Q33, Q36-Q44)
  const governanceData = [
    { metric: "स्थानीय तहहरूबाट अपाङ्गता क्षेत्रमा विनियोजित कुल बजेट", value: `रु. ${overallStats.totalAllocatedBudgetNPR}`, status: "१३७ वटै पालिका" },
    { metric: "औषत बजेट खर्च प्रगति प्रतिशत", value: "७८.४%", status: "सन्तोषजनक" },
    { metric: "अपाङ्गता समन्वय समिति (DPO) बैठक संख्या", value: `${scale(548)} पटक`, status: "नियमित बैठक" },
    { metric: "DPO संस्थागत अनुदान रकम वितरण", value: filterMultiplier === 1.0 ? "रु. २,४५,००,०००" : `रु. ${Math.round(245 * filterMultiplier).toLocaleString("ne-NP")},००,०००`, status: "सञ्चालन अनुदान" },
    { metric: "अपाङ्गतामैत्री पहुँचयुक्त कार्यकक्ष तथा र्‍याम्प भएका पालिका", value: `${scale(84)} वटा पालिका (६१%)`, status: "भौतिक पहुँच" },
    { metric: "अपाङ्गता सम्बन्धी स्थानीय कार्यविधि/निर्देशिका जारी", value: `${scale(72)} वटा पालिका (५३%)`, status: "नीतिगत प्रबन्ध" },
  ];

  // 10. Sample Cross-Palika Comparison Dataset
  const samplePalikaComparisons = [
    { id: "phidim_mun", name: "फिदिम न.पा.", district: "पाँचथर", identified: 840, services: 620, ssa: 380, employed: 94, homeVisits: 320, assistive: 115, budget: "१५,००,०००" },
    { id: "falelung_rm", name: "फालेलुङ गा.पा.", district: "पाँचथर", identified: 520, services: 390, ssa: 240, employed: 62, homeVisits: 210, assistive: 78, budget: "१०,००,०००" },
    { id: "falgunanda_rm", name: "फाल्गुनन्द गा.पा.", district: "पाँचथर", identified: 490, services: 350, ssa: 215, employed: 58, homeVisits: 185, assistive: 64, budget: "८,५०,०००" },
    { id: "biratnagar_met", name: "विराटनगर म.न.पा.", district: "मोरङ", identified: 2840, services: 2120, ssa: 1280, employed: 340, homeVisits: 890, assistive: 380, budget: "४५,००,०००" },
    { id: "dharan_submet", name: "धरान उप.म.न.पा.", district: "सुनसरी", identified: 1950, services: 1480, ssa: 890, employed: 230, homeVisits: 640, assistive: 240, budget: "३२,००,०००" },
    { id: "damak_mun", name: "दमक न.पा.", district: "झापा", identified: 1420, services: 1080, ssa: 640, employed: 180, homeVisits: 490, assistive: 195, budget: "२४,००,०००" },
    { id: "bhadrapur_mun", name: "भद्रपुर न.पा.", district: "झापा", identified: 1150, services: 860, ssa: 520, employed: 140, homeVisits: 380, assistive: 155, budget: "१८,००,०००" },
    { id: "ilam_mun", name: "इलाम न.पा.", district: "इलाम", identified: 920, services: 690, ssa: 410, employed: 115, homeVisits: 340, assistive: 125, budget: "१६,००,०००" },
    { id: "dhankuta_mun", name: "धनकुटा न.पा.", district: "धनकुटा", identified: 780, services: 580, ssa: 360, employed: 98, homeVisits: 280, assistive: 105, budget: "१२,००,०००" },
    { id: "triyuga_mun", name: "त्रियुगा न.पा.", district: "उदयपुर", identified: 1280, services: 940, ssa: 580, employed: 155, homeVisits: 420, assistive: 170, budget: "२२,००,०००" },
  ];

  // Multi-Sheet Comprehensive Excel Export
  const handleExportFullReportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: समग्र सारांश
      const summaryRows = [
        ["अपाङ्गता सूचना केन्द्र (Disability Information Center - DIC)"],
        ["कोशी प्रदेश - एकीकृत विषयगत वार्षिक प्रतिवेदन"],
        ["जिल्ला:", currentDistrictName, "आर्थिक वर्ष:", selectedFiscalYear === "2082_083" ? "२०८२/०८३" : "२०८१/०८२"],
        [],
        ["सि.नं.", "प्रमुख परिसूचक (Key Indicator)", "विवरण / संख्या", "कैफियत"],
        ["१", "कुल पहिचान भएका अपाङ्गता भएका व्यक्ति", overallStats.totalIdentified, "महिला: " + overallStats.femaleIdentified + ", पुरुष: " + overallStats.maleIdentified],
        ["२", "हाल पालिकामा कायम लाभग्राही संख्या", overallStats.activeBeneficiaries, "मृत्यु तथा बसाइँसराइ कट्टा पश्चात"],
        ["३", "सेवासुविधा प्राप्त कुल लाभग्राही संख्या", overallStats.totalServicesBeneficiaries, "परामर्श, थेरापी, उपचार र बीमा"],
        ["४", "सामाजिक सुरक्षा भत्ता प्राप्त लाभग्राही", overallStats.totalSocialSecurityAllowance, "रातो र निलो कार्ड वाहक"],
        ["५", "रोजगार, उद्यम तथा स्वरोजगारमा आबद्ध", overallStats.totalEmployedAndEnterprise, "घरेलु, कृषि तथा नियमित सेवा"],
        ["६", "विद्यालयमा अध्ययनरत अपाङ्गता भएका विद्यार्थी", overallStats.totalEnrolledStudents, "छात्रवृत्ति: " + overallStats.totalScholarshipReceived],
        ["७", "सहजकर्ताद्वारा गृहभेट गरिएका लाभग्राही", overallStats.totalHomeVisits, "अनुसूची १.१"],
        ["८", "वितरण गरिएको कुल सहायक सामग्री", overallStats.totalAssistiveDistributed, "थान (ह्वीलचेयर, सेतो छडी आदि)"],
        ["९", "मिलिजुली समूहमा आबद्ध सदस्य संख्या", overallStats.totalShgMembers, "३४२ समूह"],
        ["१०", "समूहमा परिचालित कुल बिउपुँजी तथा बचत", "रु. " + overallStats.totalSeedCapitalNPR, "ऋण लगानी तथा उद्यम"],
        ["११", "स्थानीय तहहरूबाट विनियोजित कुल अपाङ्गता बजेट", "रु. " + overallStats.totalAllocatedBudgetNPR, "औषत प्रगति: ७८.४%"],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(wb, ws1, "समग्र सारांश");

      // Sheet 2: सेवासुविधा र पुनःस्थापना
      const servicesRows = [
        ["खण्ड २: सेवासुविधा तथा स्वास्थ्य पुनःस्थापना विवरण"],
        ["सेवाको नाम", "महिला", "पुरुष", "जम्मा", "कैफियत"],
        ...servicesData.map(s => [s.name, s.female, s.male, s.total, s.note])
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(servicesRows);
      XLSX.utils.book_append_sheet(wb, ws2, "सेवासुविधा");

      // Sheet 3: सामाजिक सुरक्षा
      const ssaRows = [
        ["खण्ड ३: सामाजिक सुरक्षा भत्ता तथा परिचयपत्र"],
        ["योजनाको नाम / कार्ड वर्ग", "मासिक दर", "महिला", "पुरुष", "जम्मा संख्या", "वार्षिक बजेट भार"],
        ...socialSecurityData.map(s => [s.scheme, s.rate, s.female, s.male, s.total, s.annualAmount])
      ];
      const ws3 = XLSX.utils.aoa_to_sheet(ssaRows);
      XLSX.utils.book_append_sheet(wb, ws3, "सामाजिक सुरक्षा");

      // Sheet 4: रोजगार र उद्यम
      const empRows = [
        ["खण्ड ४.१: व्यवसायिक सीप तालिम विवरण"],
        ["तालिमको विषय", "अवधि", "महिला", "पुरुष", "जम्मा"],
        ...trainingSkillsData.map(t => [t.trade, t.duration, t.female, t.male, t.total]),
        [],
        ["खण्ड ४.२: रोजगारी तथा उद्यममा संलग्नता"],
        ["रोजगारीको क्षेत्र", "महिला", "पुरुष", "जम्मा", "प्रतिशत"],
        ...employmentTypeData.map(e => [e.type, e.female, e.male, e.total, e.pct + "%"])
      ];
      const ws4 = XLSX.utils.aoa_to_sheet(empRows);
      XLSX.utils.book_append_sheet(wb, ws4, "रोजगार र उद्यम");

      // Sheet 5: शिक्षा र बालबालिका
      const eduRows = [
        ["खण्ड ५: शिक्षा र बालबालिका सम्बन्धी परिसूचक"],
        ["परिसूचक", "महिला/बालिका", "पुरुष/बालक", "जम्मा संख्या"],
        ...educationData.map(e => [e.indicator, e.female, e.male, e.total])
      ];
      const ws5 = XLSX.utils.aoa_to_sheet(eduRows);
      XLSX.utils.book_append_sheet(wb, ws5, "शिक्षा र बालबालिका");

      // Sheet 6: गृहभेट
      const homeVisitRows = [
        ["खण्ड ६: परिचयपत्रको गाम्भीर्यता अनुसार गृहभेट विवरण"],
        ["गाम्भीर्यता / परिचयपत्र रंग", "महिला", "पुरुष", "जम्मा संख्या", "प्रतिशत भार"],
        ...homeVisitsBySeverity.map(h => [h.label, h.female, h.male, h.total, h.pct + "%"])
      ];
      const ws6 = XLSX.utils.aoa_to_sheet(homeVisitRows);
      XLSX.utils.book_append_sheet(wb, ws6, "गृहभेट तथ्यांक");

      // Sheet 7: सहायक सामग्री
      const devRows = [
        ["खण्ड ७: सहायक सामग्री वितरण विवरण"],
        ["सामग्रीको नाम", "महिला", "पुरुष", "जम्मा वितरण"],
        ...assistiveDevicesData.map(d => [d.name, d.female, d.male, d.count])
      ];
      const ws7 = XLSX.utils.aoa_to_sheet(devRows);
      XLSX.utils.book_append_sheet(wb, ws7, "सहायक सामग्री");

      // Sheet 8: प्रकारगत वर्गीकरण
      const typesRows = [
        ["खण्ड ८: अपाङ्गताका १० प्रकारगत वर्गीकरण"],
        ["क्र.सं.", "प्रकारगत वर्गीकरण", "लाभग्राही संख्या", "प्रतिशत भार"],
        ...disabilityTypesData.map((d, i) => [i + 1, d.type, d.count, d.pct + "%"])
      ];
      const ws8 = XLSX.utils.aoa_to_sheet(typesRows);
      XLSX.utils.book_append_sheet(wb, ws8, "१० प्रकार वर्गीकरण");

      // Sheet 9: पालिका तुलना
      const compRows = [
        ["खण्ड १०: स्थानीय तहगत तुलनात्मक विश्लेषण"],
        ["स्थानीय तह", "जिल्ला", "पहिचान संख्या", "सेवा प्रवाह", "सामाजिक सुरक्षा", "रोजगार", "गृहभेट", "सामग्री", "बजेट रु."],
        ...samplePalikaComparisons.map(p => [p.name, p.district, p.identified, p.services, p.ssa, p.employed, p.homeVisits, p.assistive, p.budget])
      ];
      const ws9 = XLSX.utils.aoa_to_sheet(compRows);
      XLSX.utils.book_append_sheet(wb, ws9, "स्थानीय तह तुलना");

      // Write workbook and trigger download
      const fileName = `Koshi_Province_Disability_Report_${selectedDistrictId}_${selectedFiscalYear}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (e) {
      console.error("Excel generation error", e);
      alert("Excel फाइल डाउनलोड गर्दा समस्या आयो।");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header lang={lang} onLanguageChange={setLang} />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-hidden">
        
        {/* DUAL REPORT NAVIGATION SWITCHER: १. पालिका प्रतिवेदन vs २. समग्र प्रतिवेदन */}
        <div className="flex items-center justify-center p-1.5 bg-slate-200/90 dark:bg-slate-800 rounded-2xl max-w-2xl mx-auto mb-8 shadow-xs border border-slate-300 dark:border-slate-700">
          <Link
            href="/local-reporting"
            className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-900 hover:bg-white/60 dark:hover:bg-slate-700 transition-all"
          >
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>१. पालिका प्रतिवेदन (स्थानीय तहगत)</span>
          </Link>
          <Link
            href="/reports"
            className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 bg-emerald-700 text-white shadow-sm transition-all"
            aria-current="page"
          >
            <BarChart3 className="w-4 h-4 text-amber-300 shrink-0" />
            <span>२. समग्र प्रतिवेदन (सबै १३७ पालिका कम्पाइल)</span>
          </Link>
        </div>

        {/* Page Hero Header with Export Options */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                  कोशी प्रदेश एकीकृत डिजिटल केन्द्र
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">
                  <Activity className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  १४ जिल्लाका १३७ वटै स्थानीय तहको एकीकृत तथ्याङ्क
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                अपाङ्गता सम्बन्धी समग्र प्रतिवेदन (कोशी प्रदेश)
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
                कोशी प्रदेशका १४ जिल्लाका १३७ वटै स्थानीय तहको एकीकृत कम्पाइल प्रतिवेदन, जिल्लागत विवरण र १० वटा मुख्य विषयगत परिसूचकहरूको विस्तृत विश्लेषण।
              </p>
            </div>

            {/* Export Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => exportCompiledPalikasToExcel(filteredCompiledPalikas, currentDistrictName)}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-2 shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                title="सबै १३७ स्थानीय तहको कम्पाइल डाटा Excel मा डाउनलोड गर्नुहोस्"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                <span>📥 १३७ पालिका कम्पाइल Excel डाउनलोड</span>
              </button>
              <button
                type="button"
                onClick={handleExportFullReportExcel}
                className="px-3.5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                title="१० वटै विषयगत सिटसहित Excel डाउनलोड गर्नुहोस्"
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-200" />
                <span>१० विषयगत Excel</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                title="प्रिन्ट गर्नुहोस् वा PDF मा सेभ गर्नुहोस्"
              >
                <Printer className="w-4 h-4 text-slate-300" />
                <span>प्रिन्ट</span>
              </button>
            </div>
          </div>
        </div>

        {/* PRIMARY VIEW SWITCHER: COMPILED 137 PALIKAS REPORT VS 10 SUBJECT-WISE ANALYTICS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-600/40 shadow-sm mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800">
              📊 समग्र प्रतिवेदन दृश्य छनौट:
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setMainReportView("compiled_palikas")}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mainReportView === "compiled_palikas"
                  ? "bg-emerald-700 text-white shadow-md ring-2 ring-amber-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              <span>सबै १३७ स्थानीय तहको कम्पाइल प्रतिवेदन</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-100">
                तालिका दृश्य
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMainReportView("analytics")}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mainReportView === "analytics"
                  ? "bg-blue-900 text-white shadow-md ring-2 ring-amber-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-300" />
              <span>१० विषयगत समग्र विश्लेषण</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-950 text-blue-200">
                ग्राफिक्स दृश्य
              </span>
            </button>
          </div>
        </div>

        {/* ============================================================= */}
        {/* VIEW 1: ALL 137 LOCAL GOVERNMENTS MASTER COMPILED REPORT */}
        {/* ============================================================= */}
        {mainReportView === "compiled_palikas" && (
          <section aria-labelledby="compiled-palikas-heading" className="space-y-6 animate-in fade-in">
            
            {/* Search & Filter Toolbar */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-300 dark:border-emerald-800 mb-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    कोशी प्रदेशका सबै १३७ स्थानीय तह
                  </span>
                  <h2 id="compiled-palikas-heading" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    स्थानीय तहहरूको एकीकृत कम्पाइल प्रतिवेदन तालिका
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    १४ वटै जिल्लाका महानगर, उपमहानगर, नगर र गाउँपालिकाको वार्षिक तथ्याङ्क तथा कार्यसम्पादन
                  </p>
                </div>

                {/* Action Buttons: Excel Download & Print */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportCompiledPalikasToExcel(filteredCompiledPalikas, currentDistrictName)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-2 shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                    title="सबै १३७ पालिकाको कम्पाइल डाटा Excel मा डाउनलोड गर्नुहोस्"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                    <span>📥 १३७ पालिका कम्पाइल Excel (.xlsx) डाउनलोड</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 border border-slate-700 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-slate-300" />
                    <span>प्रिन्ट</span>
                  </button>
                </div>
              </div>

              {/* Filter Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-4 items-end">
                {/* District Filter */}
                <div>
                  <label htmlFor="compiled-district-filter" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    १. जिल्ला छनौट ({KOSHI_DISTRICTS.length} जिल्ला)
                  </label>
                  <select
                    id="compiled-district-filter"
                    value={selectedDistrictId}
                    onChange={(e) => setSelectedDistrictId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                  >
                    <option value="all">कोशी प्रदेश समग्र (१४ वटै जिल्ला - १३७ स्थानीय तह)</option>
                    {KOSHI_DISTRICTS.map((d, i) => (
                      <option key={d.id} value={d.id}>
                        {i + 1}. {d.name_ne} जिल्ला ({d.local_governments.length} स्थानीय तह)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Municipality Type Filter */}
                <div>
                  <label htmlFor="compiled-type-filter" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    २. स्थानीय तहको प्रकार
                  </label>
                  <select
                    id="compiled-type-filter"
                    value={compiledTypeFilter}
                    onChange={(e) => setCompiledTypeFilter(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                  >
                    <option value="all">सबै प्रकार (महानगर, उपमहानगर, नगर, गाउँ)</option>
                    <option value="महानगरपालिका">महानगरपालिका</option>
                    <option value="उपमहानगरपालिका">उपमहानगरपालिका</option>
                    <option value="नगरपालिका">नगरपालिका</option>
                    <option value="गाउँपालिका">गाउँपालिका</option>
                  </select>
                </div>

                {/* Search by Palika Name */}
                <div>
                  <label htmlFor="compiled-search-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    ३. पालिकाको नामबाट खोजी
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      id="compiled-search-input"
                      type="search"
                      placeholder="पालिका वा जिल्लाको नाम..."
                      value={compiledPalikaSearch}
                      onChange={(e) => setCompiledPalikaSearch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Clear Filter */}
                <div className="flex items-center gap-2">
                  {(selectedDistrictId !== "all" || compiledTypeFilter !== "all" || compiledPalikaSearch) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDistrictId("all");
                        setCompiledTypeFilter("all");
                        setCompiledPalikaSearch("");
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>फिल्टर हटाउनुहोस्</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Aggregate KPI Summary Cards for Compiled View */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">कुल स्थानीय तह</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block">
                  {filteredCompiledPalikas.length}
                </span>
                <span className="text-[10px] text-slate-400 block">१३७ मध्ये</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 block">कुल पहिचान</span>
                <span className="text-lg font-black text-blue-900 dark:text-blue-300 mt-1 block">
                  {compiledGrandTotals.identifiedTotal.toLocaleString("ne-NP")}
                </span>
                <span className="text-[10px] text-slate-400 block">म: {compiledGrandTotals.identifiedFemale.toLocaleString("ne-NP")} | पु: {compiledGrandTotals.identifiedMale.toLocaleString("ne-NP")}</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 block">रातो कार्ड ('क')</span>
                <span className="text-lg font-black text-rose-900 dark:text-rose-300 mt-1 block">
                  {compiledGrandTotals.cardRed.toLocaleString("ne-NP")}
                </span>
                <span className="text-[10px] text-rose-600 block">पूर्ण अशक्त</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block">निलो कार्ड ('ख')</span>
                <span className="text-lg font-black text-blue-800 dark:text-blue-300 mt-1 block">
                  {compiledGrandTotals.cardBlue.toLocaleString("ne-NP")}
                </span>
                <span className="text-[10px] text-blue-600 block">अति अशक्त</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">भत्ता पाउने (SSA)</span>
                <span className="text-lg font-black text-emerald-900 dark:text-emerald-300 mt-1 block">
                  {compiledGrandTotals.ssaBeneficiaries.toLocaleString("ne-NP")}
                </span>
                <span className="text-[10px] text-emerald-600 block">रु. {compiledGrandTotals.ssaBudgetLakh.toFixed(1)} लाख/म.</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 block">गृहभेट संख्या</span>
                <span className="text-lg font-black text-purple-900 dark:text-purple-300 mt-1 block">
                  {compiledGrandTotals.homeVisits.toLocaleString("ne-NP")}
                </span>
                <span className="text-[10px] text-purple-600 block">सहजकर्ता सेवा</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 block">सहायक सामग्री</span>
                <span className="text-lg font-black text-teal-900 dark:text-teal-300 mt-1 block">
                  {compiledGrandTotals.assistiveDevices.toLocaleString("ne-NP")}
                </span>
                <span className="text-[10px] text-teal-600 block">थान वितरण</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block">विनियोजित बजेट</span>
                <span className="text-sm font-black text-amber-900 dark:text-amber-300 mt-1 block truncate" title={`रु. ${compiledGrandTotals.allocatedBudgetNPR.toLocaleString("ne-NP")}`}>
                  रु. {(compiledGrandTotals.allocatedBudgetNPR / 10000000).toFixed(1)} करोड
                </span>
                <span className="text-[10px] text-amber-600 block">स्थानीय बजेट</span>
              </div>
            </div>

            {/* Master Compiled Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  देखाउँदै: <strong>{filteredCompiledPalikas.length}</strong> स्थानीय तहहरू (कोशी प्रदेशका कुल १३७ मध्ये)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  * कुनै पनि स्थानीय तहको विस्तृत विवरण हेर्न दायाँपट्टिको <strong>[ 📄 प्रतिवेदन ]</strong> बटन थिच्नुहोस्
                </div>
              </div>

              <div className="overflow-x-auto max-h-[750px] overflow-y-auto">
                <table className="min-w-full text-xs text-left border-collapse">
                  <thead className="bg-blue-950 text-white font-bold sticky top-0 z-20 shadow-xs">
                    <tr>
                      <th scope="col" className="p-3 text-center w-12 border-b border-blue-900">सि.नं.</th>
                      <th scope="col" className="p-3 min-w-[190px] border-b border-blue-900">स्थानीय तहको नाम</th>
                      <th scope="col" className="p-3 border-b border-blue-900">जिल्ला</th>
                      <th scope="col" className="p-3 text-center border-b border-blue-900">वडा</th>
                      <th scope="col" className="p-3 text-right bg-blue-900/60 border-b border-blue-900">कुल पहिचान</th>
                      <th scope="col" className="p-3 text-right border-b border-blue-900 text-rose-300">रातो ('क')</th>
                      <th scope="col" className="p-3 text-right border-b border-blue-900 text-blue-300">निलो ('ख')</th>
                      <th scope="col" className="p-3 text-right border-b border-blue-900 text-amber-300">पहेलो ('ग')</th>
                      <th scope="col" className="p-3 text-right border-b border-blue-900 text-slate-200">सेतो ('घ')</th>
                      <th scope="col" className="p-3 text-right bg-emerald-950/70 border-b border-blue-900 text-emerald-300">भत्ता पाउने (SSA)</th>
                      <th scope="col" className="p-3 text-right border-b border-blue-900">सेवासुविधा</th>
                      <th scope="col" className="p-3 text-right border-b border-blue-900">रोजगार/उद्यम</th>
                      <th scope="col" className="p-3 text-right border-b border-blue-900">गृहभेट</th>
                      <th scope="col" className="p-3 text-right border-b border-blue-900">सहायक सामग्री</th>
                      <th scope="col" className="p-3 text-right border-b border-blue-900">बजेट (रु.)</th>
                      <th scope="col" className="p-3 text-center border-b border-blue-900">स्थिति</th>
                      <th scope="col" className="p-3 text-center min-w-[140px] sticky right-0 bg-blue-950 border-b border-blue-900 z-10">कार्य</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredCompiledPalikas.length === 0 ? (
                      <tr>
                        <td colSpan={17} className="p-8 text-center text-slate-500">
                          कुनै पनि स्थानीय तह फेला परेन। कृपया फिल्टर वा सर्च सच्याउनुहोस्।
                        </td>
                      </tr>
                    ) : (
                      filteredCompiledPalikas.map((p, idx) => (
                        <tr
                          key={p.id}
                          className="hover:bg-blue-50/70 dark:hover:bg-slate-800/60 transition-colors group"
                        >
                          <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-1.5">
                              <span>{p.name_ne}</span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                                p.type === "महानगरपालिका" 
                                  ? "bg-purple-100 text-purple-900" 
                                  : p.type === "उपमहानगरपालिका"
                                  ? "bg-blue-100 text-blue-900"
                                  : p.type === "नगरपालिका"
                                  ? "bg-emerald-100 text-emerald-900"
                                  : "bg-slate-100 text-slate-700"
                              }`}>
                                {p.type === "महानगरपालिका" ? "म.न.पा." : p.type === "उपमहानगरपालिका" ? "उप.म.न.पा." : p.type === "नगरपालिका" ? "न.पा." : "गा.पा."}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-normal block">{p.name_en}</span>
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400 font-medium">
                            {p.districtName_ne}
                          </td>
                          <td className="p-3 text-center font-mono text-slate-500">
                            {p.total_wards}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-blue-950 dark:text-blue-200 bg-blue-50/40 dark:bg-blue-950/20">
                            {p.identifiedTotal.toLocaleString("ne-NP")}
                            <span className="block text-[9px] text-slate-400 font-normal">म:{p.identifiedFemale} पु:{p.identifiedMale}</span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-rose-700 dark:text-rose-400">
                            {p.cardRed}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-blue-700 dark:text-blue-400">
                            {p.cardBlue}
                          </td>
                          <td className="p-3 text-right font-mono text-amber-700 dark:text-amber-400 font-medium">
                            {p.cardYellow}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-500 font-medium">
                            {p.cardWhite}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20">
                            {p.ssaBeneficiaries}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">
                            {p.servicesCount}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">
                            {p.employedCount}
                          </td>
                          <td className="p-3 text-right font-mono text-purple-700 dark:text-purple-400 font-bold">
                            {p.homeVisits}
                          </td>
                          <td className="p-3 text-right font-mono text-teal-700 dark:text-teal-400 font-bold">
                            {p.assistiveDevices}
                          </td>
                          <td className="p-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {p.allocatedBudgetNPR.toLocaleString("ne-NP")}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.submissionStatus === 'submitted'
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {p.submissionStatus === 'submitted' ? 'पेश' : 'मस्यौदा'}
                            </span>
                          </td>
                          <td className="p-3 text-center sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-blue-50/90 dark:group-hover:bg-slate-800 transition-colors shadow-l">
                            <Link
                              href={`/local-reporting/palika/${p.id}/profile`}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition-colors"
                              title={`${p.name_ne} को व्यक्तिगत प्रतिवेदन हेर्नुहोस्`}
                            >
                              <FileText className="w-3 h-3 text-amber-400" />
                              <span>प्रतिवेदन</span>
                              <ArrowRight className="w-3 h-3 text-blue-200" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-900 text-white font-black sticky bottom-0 z-20 shadow-md">
                    <tr>
                      <td colSpan={4} className="p-3 text-center font-bold uppercase tracking-wider text-amber-400">
                        जम्मा कुल योगफल ({filteredCompiledPalikas.length} स्थानीय तह)
                      </td>
                      <td className="p-3 text-right font-mono text-amber-300">
                        {compiledGrandTotals.identifiedTotal.toLocaleString("ne-NP")}
                      </td>
                      <td className="p-3 text-right font-mono text-rose-300">
                        {compiledGrandTotals.cardRed.toLocaleString("ne-NP")}
                      </td>
                      <td className="p-3 text-right font-mono text-blue-300">
                        {compiledGrandTotals.cardBlue.toLocaleString("ne-NP")}
                      </td>
                      <td className="p-3 text-right font-mono text-amber-200">
                        {compiledGrandTotals.cardYellow.toLocaleString("ne-NP")}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-300">
                        {compiledGrandTotals.cardWhite.toLocaleString("ne-NP")}
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-300">
                        {compiledGrandTotals.ssaBeneficiaries.toLocaleString("ne-NP")}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-200">
                        {compiledGrandTotals.servicesCount.toLocaleString("ne-NP")}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-200">
                        {compiledGrandTotals.employedCount.toLocaleString("ne-NP")}
                      </td>
                      <td className="p-3 text-right font-mono text-purple-300">
                        {compiledGrandTotals.homeVisits.toLocaleString("ne-NP")}
                      </td>
                      <td className="p-3 text-right font-mono text-teal-300">
                        {compiledGrandTotals.assistiveDevices.toLocaleString("ne-NP")}
                      </td>
                      <td className="p-3 text-right font-mono text-amber-300">
                        रु. {compiledGrandTotals.allocatedBudgetNPR.toLocaleString("ne-NP")}
                      </td>
                      <td className="p-3 text-center text-xs text-emerald-400 font-bold">
                        {compiledGrandTotals.submittedCount} पेश
                      </td>
                      <td className="p-3 text-center sticky right-0 bg-slate-900 text-slate-400 text-[10px]">
                        -
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* VIEW 2: 10 SUBJECT-WISE OVERALL PROVINCIAL ANALYTICS */}
        {/* ============================================================= */}
        {mainReportView === "analytics" && (
          <div className="space-y-6">

        {/* Global Filter Bar */}
        <section aria-labelledby="report-filter-heading" className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs mb-6">
          <h2 id="report-filter-heading" className="sr-only">रिपोर्ट फिल्टरहरू</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            
            {/* District Filter */}
            <div>
              <label htmlFor="report-district" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                जिल्ला छनौट
              </label>
              <select
                id="report-district"
                value={selectedDistrictId}
                onChange={(e) => setSelectedDistrictId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="all">कोशी प्रदेश समग्र (१४ वटै जिल्ला - १३७ स्थानीय तह)</option>
                {KOSHI_DISTRICTS.map((d, i) => (
                  <option key={d.id} value={d.id}>
                    {i + 1}. {d.name_ne} जिल्ला ({d.local_governments.length} स्थानीय तह)
                  </option>
                ))}
              </select>
            </div>

            {/* Fiscal Year Filter */}
            <div>
              <label htmlFor="report-fy" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                आर्थिक वर्ष
              </label>
              <select
                id="report-fy"
                value={selectedFiscalYear}
                onChange={(e) => setSelectedFiscalYear(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="2082_083">२०८२/०८३ (हालको आ.व. - चालु)</option>
                <option value="2081_082">२०८१/०८२ (अघिल्लो आ.व. - अन्तिम)</option>
              </select>
            </div>

            {/* Accessible Table View Toggle */}
            <div className="flex sm:justify-end items-end pt-2 sm:pt-0">
              <button
                type="button"
                onClick={() => setViewTableMode(!viewTableMode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                  viewTableMode
                    ? "bg-blue-900 text-white border-blue-900 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
                aria-pressed={viewTableMode}
              >
                <TableIcon className="w-4 h-4 text-amber-400" />
                <span>{viewTableMode ? "ग्राफिक्स / कार्ड दृश्यमा फर्कनुहोस्" : "पहुँचयुक्त डाटा तालिका (Table View)"}</span>
              </button>
            </div>

          </div>
        </section>

        {/* 10 Core Subject-Wise Tabs Navigation */}
        <nav aria-label="१० विषयगत रिपोर्टहरू" className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {subjectTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubject === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSubject(tab.id)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${
                    isActive
                      ? "bg-blue-950 text-white border-blue-900 shadow-lg ring-2 ring-amber-400 transform -translate-y-0.5"
                      : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isActive ? "bg-amber-400 text-slate-950" : "bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400 group-hover:scale-105 transition-transform"
                    }`}>
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? "bg-blue-800 text-amber-300" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}>
                      {tab.badge}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-black block leading-snug">{tab.label}</span>
                    <span className={`text-[11px] block mt-0.5 line-clamp-1 ${
                      isActive ? "text-blue-200" : "text-slate-500 dark:text-slate-400"
                    }`}>
                      {tab.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* ============================================================= */}
        {/* SUBJECT 1: OVERALL INTEGRATED PROVINCE REPORT */}
        {/* ============================================================= */}
        {activeSubject === "overall" && (
          <section aria-labelledby="overall-heading" className="space-y-8 animate-fadeIn">
            
            {/* Top Macro Metric Cards */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 id="overall-heading" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {currentDistrictName} - समग्र वार्षिक कार्यसम्पादन सारांश
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    स्थानीय तहबाट संकलित १० वटै मुख्य विषयगत परिसूचकहरूको एकीकृत प्रगति स्थिति (आ.व. {selectedFiscalYear === "2082_083" ? "२०८२/०८३" : "२०८१/०८२"})
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                  प्रगति दर: ८८.४%
                </span>
              </div>

              {/* 4 Key Macro KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-bold block">कुल पहिचान संख्या</span>
                  <span className="text-2xl sm:text-3xl font-black text-blue-900 dark:text-blue-300">{overallStats.totalIdentified.toLocaleString("ne-NP")}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">महिला: {overallStats.femaleIdentified.toLocaleString("ne-NP")} | पुरुष: {overallStats.maleIdentified.toLocaleString("ne-NP")}</span>
                </div>
                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-bold block">हाल कायम लाभग्राही</span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-900 dark:text-emerald-300">{overallStats.activeBeneficiaries.toLocaleString("ne-NP")}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">मृत्यु: {overallStats.deceased.toLocaleString("ne-NP")} | बसाइँ: {overallStats.migratedOut.toLocaleString("ne-NP")}</span>
                </div>
                <div className="bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-2xl p-4">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-bold block">सामाजिक सुरक्षा भत्ता प्राप्त</span>
                  <span className="text-2xl sm:text-3xl font-black text-purple-900 dark:text-purple-300">{overallStats.totalSocialSecurityAllowance.toLocaleString("ne-NP")} जना</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">रातो तथा निलो कार्ड भत्ता</span>
                </div>
                <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-bold block">रोजगार तथा उद्यममा आबद्ध</span>
                  <span className="text-2xl sm:text-3xl font-black text-amber-900 dark:text-amber-300">{overallStats.totalEmployedAndEnterprise.toLocaleString("ne-NP")} जना</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">स्वरोजगार, कृषि तथा सेवा</span>
                </div>
              </div>

              {/* CORE TOPICS EXECUTIVE SUMMARY GRID (All Local Level Topics) */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>स्थानीय तह प्रतिवेदनका मूल मूल विषयहरूको सारांश (Core Topics Overview)</span>
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                    कुनै पनि कार्ड क्लिक गरी विस्तृत विवरण हेर्नुहोस्
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Card 1: सेवासुविधा */}
                  <div 
                    onClick={() => setActiveSubject("services")}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold">
                          <HeartPulse className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                          Q10-Q13
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">१. सेवासुविधाहरू</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        परामर्श, उपचार/थेरापी र स्वास्थ्य बीमा सेवा
                      </p>
                      <div className="mt-3 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>परामर्श सेवा:</span>
                          <span className="font-bold">{scale(9420).toLocaleString("ne-NP")}</span>
                        </div>
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>स्वास्थ्य बीमा:</span>
                          <span className="font-bold">{scale(18250).toLocaleString("ne-NP")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                      <span>विस्तृत हेर्नुहोस्</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card 2: सामाजिक सुरक्षा */}
                  <div 
                    onClick={() => setActiveSubject("social_security")}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                          Q24-Q27
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">२. सामाजिक सुरक्षा</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        रातो तथा निलो कार्ड भत्ता र परिचयपत्र
                      </p>
                      <div className="mt-3 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>रातो कार्ड भत्ता:</span>
                          <span className="font-bold">{scale(4820).toLocaleString("ne-NP")}</span>
                        </div>
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>निलो कार्ड भत्ता:</span>
                          <span className="font-bold">{scale(9150).toLocaleString("ne-NP")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                      <span>विस्तृत हेर्नुहोस्</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card 3: रोजगार तथा उद्यम */}
                  <div 
                    onClick={() => setActiveSubject("employment")}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                          Q21-Q23, Q29
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">३. रोजगार तथा उद्यम</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        सीप तालिम, स्वरोजगार, समूह र बिउपुँजी
                      </p>
                      <div className="mt-3 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>तालिम प्राप्त:</span>
                          <span className="font-bold">{scale(3420).toLocaleString("ne-NP")}</span>
                        </div>
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>समूह बिउपुँजी:</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">रु. {overallStats.totalSeedCapitalNPR}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                      <span>विस्तृत हेर्नुहोस्</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card 4: शिक्षा र बालबालिका */}
                  <div 
                    onClick={() => setActiveSubject("education")}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                          Q14-Q20
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">४. शिक्षा र बालबालिका</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        विद्यालय भर्ना, छात्रवृत्ति र बाल क्लब
                      </p>
                      <div className="mt-3 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>अध्ययनरत विद्यार्थी:</span>
                          <span className="font-bold">{overallStats.totalEnrolledStudents.toLocaleString("ne-NP")}</span>
                        </div>
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>छात्रवृत्ति प्राप्त:</span>
                          <span className="font-bold text-indigo-700 dark:text-indigo-400">{overallStats.totalScholarshipReceived.toLocaleString("ne-NP")} (८९%)</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                      <span>विस्तृत हेर्नुहोस्</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card 5: गृहभेट सेवा */}
                  <div 
                    onClick={() => setActiveSubject("home_visits")}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                          <Home className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                          अनुसूची १.१
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">५. गृहभेट सेवा</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        सहजकर्ताद्वारा घरमै पुगेर प्रत्यक्ष भेटघाट
                      </p>
                      <div className="mt-3 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>कुल गृहभेट:</span>
                          <span className="font-bold">{overallStats.totalHomeVisits.toLocaleString("ne-NP")} जना</span>
                        </div>
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>पूर्ण अशक्त भेट:</span>
                          <span className="font-bold">{scale(3100).toLocaleString("ne-NP")} जना</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                      <span>विस्तृत हेर्नुहोस्</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card 6: सहायक सामग्री */}
                  <div 
                    onClick={() => setActiveSubject("assistive_devices")}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
                          <PackageCheck className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
                          अनुसूची १.२
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">६. सहायक सामग्री</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        ह्वीलचेयर, सेतो छडी, बैशाखी र यन्त्र वितरण
                      </p>
                      <div className="mt-3 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>कुल वितरण:</span>
                          <span className="font-bold">{overallStats.totalAssistiveDistributed.toLocaleString("ne-NP")} थान</span>
                        </div>
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>ह्वीलचेयर वितरण:</span>
                          <span className="font-bold">{scale(780).toLocaleString("ne-NP")} थान</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                      <span>विस्तृत हेर्नुहोस्</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card 7: १० प्रकारगत स्थिति */}
                  <div 
                    onClick={() => setActiveSubject("demographics")}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                          Q34-Q35
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">७. प्रकारगत स्थिति</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        ऐन अनुसार १० प्रकार तथा कार्ड रंग स्थिति
                      </p>
                      <div className="mt-3 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>शारीरिक अपाङ्गता:</span>
                          <span className="font-bold">{scale(11240).toLocaleString("ne-NP")} (३४%)</span>
                        </div>
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>दृष्टि / सुनाइ:</span>
                          <span className="font-bold">{scale(11600).toLocaleString("ne-NP")} (३५%)</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                      <span>विस्तृत हेर्नुहोस्</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card 8: बजेट तथा सुशासन */}
                  <div 
                    onClick={() => setActiveSubject("budget_governance")}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                          <Coins className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                          Q30-Q33, Q36+
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">८. बजेट र सुशासन</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        पालिका बजेट, खर्च, DPO अनुदान र नीति
                      </p>
                      <div className="mt-3 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>विनियोजित बजेट:</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">रु. {overallStats.totalAllocatedBudgetNPR}</span>
                        </div>
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>DPO समन्वय बैठक:</span>
                          <span className="font-bold">{scale(548)} पटक</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                      <span>विस्तृत हेर्नुहोस्</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                </div>
              </div>

              {/* Accessible Summary Table */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="min-w-full text-xs text-left">
                  <caption className="p-3 font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 text-left border-b border-slate-200 dark:border-slate-700">
                    तालिका १.१: स्थानीय तह वार्षिक प्रतिवेदनका प्रमुख परिसूचकहरूको एकीकृत प्रगति सारांश
                  </caption>
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th scope="col" className="p-3">क्षेत्र / विषय</th>
                      <th scope="col" className="p-3">सम्बन्धित प्रश्न</th>
                      <th scope="col" className="p-3 text-right">महिला संख्या</th>
                      <th scope="col" className="p-3 text-right">पुरुष संख्या</th>
                      <th scope="col" className="p-3 text-right font-bold text-blue-900 dark:text-blue-300">कुल जम्मा</th>
                      <th scope="col" className="p-3">प्रमुख उपलब्धि तथा स्थिति</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">कुल पहिचान तथा दर्ता</td>
                      <td className="p-3 text-slate-500 font-mono">Q3, Q9</td>
                      <td className="p-3 text-right font-mono">{overallStats.femaleIdentified.toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-right font-mono">{overallStats.maleIdentified.toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-right font-mono font-bold text-blue-900 dark:text-blue-300">{overallStats.totalIdentified.toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">८८% विस्तृत प्रोफाइल प्रविष्टि सम्पन्न</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">सेवासुविधा तथा पुनःस्थापना</td>
                      <td className="p-3 text-slate-500 font-mono">Q10-Q13</td>
                      <td className="p-3 text-right font-mono">{scale(10290).toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-right font-mono">{scale(12570).toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-right font-mono font-bold text-blue-900 dark:text-blue-300">{overallStats.totalServicesBeneficiaries.toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">परामर्श, उपचार, बीमा तथा सामग्री</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">सामाजिक सुरक्षा भत्ता</td>
                      <td className="p-3 text-slate-500 font-mono">Q24, Q25</td>
                      <td className="p-3 text-right font-mono">{scale(6230).toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-right font-mono">{scale(7740).toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-right font-mono font-bold text-blue-900 dark:text-blue-300">{overallStats.totalSocialSecurityAllowance.toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">रातो कार्ड (४,८२०) र निलो कार्ड (९,१५०)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">रोजगार तथा सीप तालिम</td>
                      <td className="p-3 text-slate-500 font-mono">Q21-Q23</td>
                      <td className="p-3 text-right font-mono">{scale(1140).toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-right font-mono">{scale(1620).toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-right font-mono font-bold text-blue-900 dark:text-blue-300">{overallStats.totalEmployedAndEnterprise.toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">घरेलु उद्यम, कृषि तथा सेवा क्षेत्र</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">शिक्षा र बालबालिका</td>
                      <td className="p-3 text-slate-500 font-mono">Q14-Q20</td>
                      <td className="p-3 text-right font-mono">{scale(1890).toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-right font-mono">{scale(2230).toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-right font-mono font-bold text-blue-900 dark:text-blue-300">{overallStats.totalEnrolledStudents.toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">८९.३% बालबालिकालाई छात्रवृत्ति वितरण</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">गृहभेट सेवा प्रवाह</td>
                      <td className="p-3 text-slate-500 font-mono">अनुसूची १.१</td>
                      <td className="p-3 text-right font-mono">{scale(3840).toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-right font-mono">{scale(4580).toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-right font-mono font-bold text-blue-900 dark:text-blue-300">{overallStats.totalHomeVisits.toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">घरमै पुगेर कार्ड नवीकरण, औषधि र सल्लाह</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">सहायक सामग्री वितरण</td>
                      <td className="p-3 text-slate-500 font-mono">अनुसूची १.२</td>
                      <td className="p-3 text-right font-mono">{scale(1365).toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-right font-mono">{scale(1575).toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-right font-mono font-bold text-blue-900 dark:text-blue-300">{overallStats.totalAssistiveDistributed.toLocaleString("ne-NP")}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">ह्वीलचेयर, सेतो छडी, श्रवण यन्त्र आदि</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* SUBJECT 2: SERVICES, HEALTH & REHABILITATION (Q10-Q13, Q33) */}
        {/* ============================================================= */}
        {activeSubject === "services" && (
          <section aria-labelledby="services-heading" className="space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 id="services-heading" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <HeartPulse className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    <span>२. सेवासुविधाहरू तथा पुनःस्थापना सम्बन्धी रिपोर्ट (Services & Health Facilities)</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    फारमको प्रश्न १० देखि १३ र प्रश्न ३३ अनुसार परामर्श, स्वास्थ्य उपचार, थेरापी तथा निःशुल्क स्वास्थ्य बीमाको अवस्था
                  </p>
                </div>
                <span className="text-xs font-bold text-rose-900 dark:text-rose-300 bg-rose-100 dark:bg-rose-950 px-3 py-1 rounded-full border border-rose-300 dark:border-rose-800">
                  कुल लाभान्वित: {overallStats.totalServicesBeneficiaries.toLocaleString("ne-NP")} जना
                </span>
              </div>

              {/* Service Macro Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">परामर्श सेवा (Q10)</span>
                  <span className="text-2xl font-black text-rose-900 dark:text-rose-300">{scale(9420).toLocaleString("ne-NP")} जना</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">व्यक्तिगत तथा पारिवारिक</span>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">उपचार तथा थेरापी (Q13)</span>
                  <span className="text-2xl font-black text-blue-900 dark:text-blue-300">{scale(5840).toLocaleString("ne-NP")} जना</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">फिजियो तथा मेडिकल सेवा</span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">निःशुल्क स्वास्थ्य बीमा (Q33)</span>
                  <span className="text-2xl font-black text-emerald-900 dark:text-emerald-300">{scale(12400).toLocaleString("ne-NP")} जना</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">सरकारद्वारा प्रिमियम भुक्तानी</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">सहायक सामग्री (Q12)</span>
                  <span className="text-2xl font-black text-amber-900 dark:text-amber-300">{scale(2940).toLocaleString("ne-NP")} जना</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">निःशुल्क हस्तान्तरण</span>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="min-w-full text-xs text-left">
                  <caption className="p-3 font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 text-left border-b border-slate-200 dark:border-slate-700">
                    तालिका २.१: सेवासुविधा तथा स्वास्थ्य पुनःस्थापना सेवा प्राप्त लाभग्राहीको लैङ्गिक विवरण
                  </caption>
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th scope="col" className="p-3">सेवा प्रवाहको क्षेत्र तथा सूचक</th>
                      <th scope="col" className="p-3 text-right">महिला</th>
                      <th scope="col" className="p-3 text-right">पुरुष</th>
                      <th scope="col" className="p-3 text-right font-bold text-rose-900 dark:text-rose-300">कुल जम्मा</th>
                      <th scope="col" className="p-3">सेवाको प्रभाव तथा विवरण</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {servicesData.map((s, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{s.name}</td>
                        <td className="p-3 text-right font-mono">{s.female.toLocaleString("ne-NP")}</td>
                        <td className="p-3 text-right font-mono">{s.male.toLocaleString("ne-NP")}</td>
                        <td className="p-3 text-right font-mono font-bold text-rose-900 dark:text-rose-300">{s.total.toLocaleString("ne-NP")}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{s.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* SUBJECT 3: SOCIAL SECURITY ALLOWANCES & CARDS (Q24-Q27, Q2-Q6) */}
        {/* ============================================================= */}
        {activeSubject === "social_security" && (
          <section aria-labelledby="social-security-heading" className="space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 id="social-security-heading" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <span>३. सामाजिक सुरक्षा भत्ता तथा परिचयपत्र सम्बन्धी प्रतिवेदन</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    फारमको प्रश्न २४ देखि २७ अनुसार रातो र निलो कार्ड भत्ता, परिचयपत्र स्थिति र वर्ग मिलान विश्लेषण
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-3 py-1 rounded-full border border-blue-300 dark:border-blue-800">
                  कुल भत्ता प्राप्त: {overallStats.totalSocialSecurityAllowance.toLocaleString("ne-NP")} जना
                </span>
              </div>

              {/* SSA Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-rose-800 dark:text-rose-300">पूर्ण अशक्त (रातो कार्ड)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 font-bold">रु. ४,३००/महिना</span>
                  </div>
                  <span className="text-2xl font-black text-rose-950 dark:text-rose-100">{scale(4820).toLocaleString("ne-NP")} जना</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block mt-1">वार्षिक बजेट: रु. २४.८ करोड</span>
                </div>

                <div className="p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-blue-800 dark:text-blue-300">अति अशक्त (निलो कार्ड)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-bold">रु. २,१२८/महिना</span>
                  </div>
                  <span className="text-2xl font-black text-blue-950 dark:text-blue-100">{scale(9150).toLocaleString("ne-NP")} जना</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block mt-1">वार्षिक बजेट: रु. २३.४ करोड</span>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300">मध्यम (पहेलो कार्ड)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold">सेवा सहुलियत</span>
                  </div>
                  <span className="text-2xl font-black text-amber-950 dark:text-amber-100">{scale(11280).toLocaleString("ne-NP")} जना</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block mt-1">यातायात, उपचार सहुलियत</span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-300">सामान्य (सेतो कार्ड)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold">प्राथमिकता</span>
                  </div>
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{scale(7200).toLocaleString("ne-NP")} जना</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block mt-1">सीप र अवसर प्राथमिकता</span>
                </div>
              </div>

              {/* ID Cards and Profile Status Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {idCardStatusSummary.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">{item.title}</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-lg font-black text-slate-900 dark:text-white">{item.count.toLocaleString("ne-NP")}</span>
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{item.pct}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Allowance Matrix Table */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="min-w-full text-xs text-left">
                  <caption className="p-3 font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 text-left border-b border-slate-200 dark:border-slate-700">
                    तालिका ३.१: सामाजिक सुरक्षा भत्ता वितरण तथा कार्ड वर्गीकरण विवरण
                  </caption>
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th scope="col" className="p-3">परिचयपत्र वर्ग / योजना</th>
                      <th scope="col" className="p-3">मासिक भत्ता दर</th>
                      <th scope="col" className="p-3 text-right">महिला</th>
                      <th scope="col" className="p-3 text-right">पुरुष</th>
                      <th scope="col" className="p-3 text-right font-bold text-blue-900 dark:text-blue-300">जम्मा संख्या</th>
                      <th scope="col" className="p-3 text-right">वार्षिक अनुमानित बजेट</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {socialSecurityData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{row.scheme}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400 font-semibold">{row.rate}</td>
                        <td className="p-3 text-right font-mono">{row.female.toLocaleString("ne-NP")}</td>
                        <td className="p-3 text-right font-mono">{row.male.toLocaleString("ne-NP")}</td>
                        <td className="p-3 text-right font-mono font-bold text-blue-900 dark:text-blue-300">{row.total.toLocaleString("ne-NP")}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">रु. {row.annualAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* SUBJECT 4: EMPLOYMENT, SKILLS & ENTERPRISE (Q21-Q23, Q28-Q29) */}
        {/* ============================================================= */}
        {activeSubject === "employment" && (
          <section aria-labelledby="employment-heading" className="space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 id="employment-heading" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <span>४. रोजगार, व्यवसायिक सीप तथा उद्यम सम्बन्धी रिपोर्ट</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    फारमको प्रश्न २१ देखि २३ र प्रश्न २८-२९ अनुसार व्यवसायिक तालिम, रोजगारी, मिलिजुली समूह र बिउपुँजी परिचालन
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                  कुल कार्यरत: {overallStats.totalEmployedAndEnterprise.toLocaleString("ne-NP")} जना
                </span>
              </div>

              {/* Livelihood Macro Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">सीप तालिम प्राप्त (Q21)</span>
                  <span className="text-2xl font-black text-emerald-900 dark:text-emerald-300">{scale(3420).toLocaleString("ne-NP")} जना</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">महिला: {scale(1680)} | पुरुष: {scale(1740)}</span>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">रोजगार / स्वरोजगार (Q22)</span>
                  <span className="text-2xl font-black text-blue-900 dark:text-blue-300">{scale(2760).toLocaleString("ne-NP")} जना</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">घरेलु, कृषि तथा नियमित सेवा</span>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">मिलिजुली समूह (SHGs - Q28)</span>
                  <span className="text-2xl font-black text-purple-900 dark:text-purple-300">{scale(6850).toLocaleString("ne-NP")} सदस्य</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">{scale(342)} वटा क्रियाशील समूह</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">परिचालित बिउपुँजी (Q29)</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-300">रु. {overallStats.totalSeedCapitalNPR}</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">ऋण लगानी: रु. {filterMultiplier === 1.0 ? "३.९२ करोड" : `${(3.92 * filterMultiplier).toFixed(2)} करोड`}</span>
                </div>
              </div>

              {/* Two Column Layout: Training Table & Employment Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                
                {/* Table 1: Vocational Trainings */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200">
                    तालिका ४.१: व्यवसायिक सीप तालिम विधागत विवरण (Q21)
                  </div>
                  <table className="min-w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th scope="col" className="p-2.5">तालिमको विधा</th>
                        <th scope="col" className="p-2.5">अवधि</th>
                        <th scope="col" className="p-2.5 text-right">महिला</th>
                        <th scope="col" className="p-2.5 text-right">पुरुष</th>
                        <th scope="col" className="p-2.5 text-right font-bold text-emerald-900 dark:text-emerald-300">जम्मा</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {trainingSkillsData.map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-2.5 font-bold text-slate-900 dark:text-white">{t.trade}</td>
                          <td className="p-2.5 text-slate-500 dark:text-slate-400">{t.duration}</td>
                          <td className="p-2.5 text-right font-mono">{t.female.toLocaleString("ne-NP")}</td>
                          <td className="p-2.5 text-right font-mono">{t.male.toLocaleString("ne-NP")}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-900 dark:text-emerald-300">{t.total.toLocaleString("ne-NP")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table 2: Employment Engagements */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200">
                    तालिका ४.२: रोजगारी तथा उद्यम संलग्नताको प्रकृति (Q22)
                  </div>
                  <table className="min-w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th scope="col" className="p-2.5">क्षेत्र / प्रकृति</th>
                        <th scope="col" className="p-2.5 text-right">महिला</th>
                        <th scope="col" className="p-2.5 text-right">पुरुष</th>
                        <th scope="col" className="p-2.5 text-right font-bold text-blue-900 dark:text-blue-300">जम्मा</th>
                        <th scope="col" className="p-2.5 text-right">प्रतिशत</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {employmentTypeData.map((e, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-2.5 font-bold text-slate-900 dark:text-white">{e.type}</td>
                          <td className="p-2.5 text-right font-mono">{e.female.toLocaleString("ne-NP")}</td>
                          <td className="p-2.5 text-right font-mono">{e.male.toLocaleString("ne-NP")}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-blue-900 dark:text-blue-300">{e.total.toLocaleString("ne-NP")}</td>
                          <td className="p-2.5 text-right font-mono font-semibold">{e.pct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* SUBJECT 5: EDUCATION & CHILDREN (Q14 to Q20) */}
        {/* ============================================================= */}
        {activeSubject === "education" && (
          <section aria-labelledby="education-heading" className="space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 id="education-heading" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    <span>५. शिक्षा र बालबालिका सम्बन्धी प्रतिवेदन</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    फारमको प्रश्न १४ देखि २० अनुसार विद्यालय भर्ना, छात्रवृत्ति, गृहकेन्द्रित शिक्षा र बाल क्लब सहभागिता
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950 px-3 py-1 rounded-full border border-indigo-300 dark:border-indigo-800">
                  कुल विद्यार्थी: {overallStats.totalEnrolledStudents.toLocaleString("ne-NP")} जना
                </span>
              </div>

              {/* Education Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">कुल अध्ययनरत विद्यार्थी (Q15)</span>
                  <span className="text-2xl font-black text-indigo-900 dark:text-indigo-300">{overallStats.totalEnrolledStudents.toLocaleString("ne-NP")} जना</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">बालिका: {scale(1890)} | बालक: {scale(2230)}</span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">छात्रवृत्ति प्राप्त (Q16)</span>
                  <span className="text-2xl font-black text-emerald-900 dark:text-emerald-300">{overallStats.totalScholarshipReceived.toLocaleString("ne-NP")} जना</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">८९.३% कभरेज</span>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">घरमै शिक्षा पाउने (Q17)</span>
                  <span className="text-2xl font-black text-purple-900 dark:text-purple-300">{scale(450).toLocaleString("ne-NP")} बालबालिका</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">पूर्ण तथा अति अशक्त</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">बाल क्लब सहभागिता (Q20)</span>
                  <span className="text-2xl font-black text-amber-900 dark:text-amber-300">{scale(980).toLocaleString("ne-NP")} बालबालिका</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">{scale(245)} बाल क्लबहरूमा</span>
                </div>
              </div>

              {/* Education Table */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="min-w-full text-xs text-left">
                  <caption className="p-3 font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 text-left border-b border-slate-200 dark:border-slate-700">
                    तालिका ५.१: शिक्षा तथा बालबालिका सम्बन्धी प्रमुख सूचकहरूको विस्तृत विवरण
                  </caption>
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th scope="col" className="p-3">सूचक तथा विवरण</th>
                      <th scope="col" className="p-3 text-right">महिला / बालिका</th>
                      <th scope="col" className="p-3 text-right">पुरुष / बालक</th>
                      <th scope="col" className="p-3 text-right font-bold text-indigo-900 dark:text-indigo-300">जम्मा संख्या</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {educationData.map((e, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{e.indicator}</td>
                        <td className="p-3 text-right font-mono">{e.female.toLocaleString("ne-NP")}</td>
                        <td className="p-3 text-right font-mono">{e.male.toLocaleString("ne-NP")}</td>
                        <td className="p-3 text-right font-mono font-bold text-indigo-900 dark:text-indigo-300">{e.total.toLocaleString("ne-NP")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* SUBJECT 6: HOME VISITS REPORT (Q11 & SCHEDULE 1.1) */}
        {/* ============================================================= */}
        {activeSubject === "home_visits" && (
          <section aria-labelledby="home-visits-heading" className="space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 id="home-visits-heading" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Home className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    <span>६. गृहभेट सम्बन्धी तथ्यांक तथा विश्लेषण (Home Visits Analytics)</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    अनुसूची १.१ को तथ्यांक अनुसार गाम्भीर्यता, लिङ्ग र घरमै पुगेर प्रदान गरिएका सेवाहरूको विवरण
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-900 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-3 py-1 rounded-full border border-purple-300 dark:border-purple-800">
                  कुल गृहभेट: {overallStats.totalHomeVisits.toLocaleString("ne-NP")} जना
                </span>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl mb-8">
                <table className="min-w-full text-xs">
                  <caption className="text-left font-bold text-slate-800 dark:text-slate-200 p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    तालिका ६.१: परिचयपत्रको गाम्भीर्यता अनुसार गृहभेट विवरण
                  </caption>
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th scope="col" className="p-3 text-left">गाम्भीर्यता / परिचयपत्र रंग</th>
                      <th scope="col" className="p-3 text-right">महिला</th>
                      <th scope="col" className="p-3 text-right">पुरुष</th>
                      <th scope="col" className="p-3 text-right font-bold text-blue-900 dark:text-blue-300">जम्मा संख्या</th>
                      <th scope="col" className="p-3 text-right">प्रतिशत भार</th>
                      <th scope="col" className="p-3 text-left">विवरण</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {homeVisitsBySeverity.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{row.label}</td>
                        <td className="p-3 text-right font-mono">{row.female.toLocaleString("ne-NP")}</td>
                        <td className="p-3 text-right font-mono">{row.male.toLocaleString("ne-NP")}</td>
                        <td className="p-3 text-right font-mono font-bold text-blue-900 dark:text-blue-300">{row.total.toLocaleString("ne-NP")}</td>
                        <td className="p-3 text-right font-mono font-semibold">{row.pct}%</td>
                        <td className="p-3 text-slate-500 dark:text-slate-400">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Visual Bars */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">गाम्भीर्यता अनुसार गृहभेट तुलनात्मक अनुपात</h3>
                <div className="space-y-4">
                  {homeVisitsBySeverity.map((row, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        <span>{row.label}</span>
                        <span>{row.total.toLocaleString("ne-NP")} जना ({row.pct}%)</span>
                      </div>
                      <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-600 rounded-full transition-all" 
                          style={{ width: `${row.pct}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* SUBJECT 7: ASSISTIVE DEVICES REPORT (Q12 & SCHEDULE 1.2) */}
        {/* ============================================================= */}
        {activeSubject === "assistive_devices" && (
          <section aria-labelledby="devices-heading" className="space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 id="devices-heading" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <PackageCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    <span>७. सहायक सामग्री वितरण सम्बन्धी तथ्यांक (Assistive Devices Analytics)</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    अनुसूची १.२ को तथ्यांक अनुसार वितरण गरिएका सामग्रीहरूको विधागत तथा लैङ्गिक वर्गीकरण
                  </p>
                </div>
                <span className="text-xs font-bold text-teal-900 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 px-3 py-1 rounded-full border border-teal-300 dark:border-teal-800">
                  कुल वितरण: {overallStats.totalAssistiveDistributed.toLocaleString("ne-NP")} थान
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Bar Chart */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                    सामग्रीको नाम अनुसार वितरण संख्या (Distribution Chart)
                  </h3>
                  <div className="space-y-3.5">
                    {assistiveDevicesData.map((d, i) => {
                      const maxCount = assistiveDevicesData[0].count || 1;
                      const pct = Math.round((d.count / maxCount) * 100);
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                            <span>{d.name}</span>
                            <span className="font-bold text-slate-900 dark:text-white">{d.count.toLocaleString("ne-NP")} थान</span>
                          </div>
                          <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-teal-600 rounded-full transition-all" 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Accessible Data Table */}
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <table className="min-w-full text-xs text-left">
                    <caption className="text-left font-bold text-slate-800 dark:text-slate-200 p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      तालिका ७.१: सहायक सामग्रीको प्रकार र लैङ्गिक वितरण
                    </caption>
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th scope="col" className="p-3">सामग्रीको नाम</th>
                        <th scope="col" className="p-3 text-right">महिला</th>
                        <th scope="col" className="p-3 text-right">पुरुष</th>
                        <th scope="col" className="p-3 text-right font-bold text-teal-900 dark:text-teal-300">जम्मा</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {assistiveDevicesData.map((d, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{d.name}</td>
                          <td className="p-3 text-right font-mono">{d.female.toLocaleString("ne-NP")}</td>
                          <td className="p-3 text-right font-mono">{d.male.toLocaleString("ne-NP")}</td>
                          <td className="p-3 text-right font-bold font-mono text-teal-900 dark:text-teal-300">{d.count.toLocaleString("ne-NP")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* SUBJECT 8: 10 DISABILITY TYPES MATRIX (Q34 & Q35) */}
        {/* ============================================================= */}
        {activeSubject === "demographics" && (
          <section aria-labelledby="types-heading" className="space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 id="types-heading" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <span>८. १० प्रकारगत अपाङ्गता तथा लैङ्गिक विवरण (Classification Matrix)</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    अपाङ्गता अधिकार ऐन २०७४ अनुसार {currentDistrictName} को कुल पहिचान वर्गीकरण
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-900 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-3 py-1 rounded-full border border-purple-300 dark:border-purple-800">
                  कुल पहिचान: {overallStats.totalIdentified.toLocaleString("ne-NP")} जना
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="min-w-full text-xs text-left">
                  <caption className="text-left font-bold text-slate-800 dark:text-slate-200 p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    तालिका ८.१: अपाङ्गताका १० प्रकार अनुसार लाभग्राही संख्या र प्रतिशत भार
                  </caption>
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th scope="col" className="p-3 text-center w-12">क्र.सं.</th>
                      <th scope="col" className="p-3">अपाङ्गताको प्रकारगत वर्गीकरण</th>
                      <th scope="col" className="p-3 text-right">कुल लाभग्राही संख्या</th>
                      <th scope="col" className="p-3 text-right">प्रतिशत भार</th>
                      <th scope="col" className="p-3 text-left w-48">तुलनात्मक ग्राफ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {disabilityTypesData.map((d, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 text-center text-slate-400 font-bold">{i + 1}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{d.type}</td>
                        <td className="p-3 text-right font-mono font-bold text-blue-900 dark:text-blue-300">{d.count.toLocaleString("ne-NP")}</td>
                        <td className="p-3 text-right font-mono font-semibold">{d.pct}%</td>
                        <td className="p-3">
                          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-600 rounded-full" style={{ width: `${d.pct * 2.5}%` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* SUBJECT 9: BUDGET, DPO & GOVERNANCE (Q30-Q33, Q36-Q44) */}
        {/* ============================================================= */}
        {activeSubject === "budget_governance" && (
          <section aria-labelledby="governance-heading" className="space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 id="governance-heading" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Coins className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    <span>९. संस्थागत बजेट, DPO सहभागिता र सुशासन सम्बन्धी प्रतिवेदन</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    फारमको प्रश्न ३० देखि ३३ र ३६ देखि ४४ अनुसार बजेट विनियोजन, खर्च प्रगति, DPO समन्वय र नीतिगत प्रबन्ध
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                  कुल बजेट: रु. {overallStats.totalAllocatedBudgetNPR}
                </span>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="min-w-full text-xs text-left">
                  <caption className="p-3 font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 text-left border-b border-slate-200 dark:border-slate-700">
                    तालिका ९.१: स्थानीय तहगत संस्थागत बजेट, खर्च तथा सुशासन परिसूचकहरू
                  </caption>
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th scope="col" className="p-3">परिसूचक (Indicator)</th>
                      <th scope="col" className="p-3">प्रगति / संख्या</th>
                      <th scope="col" className="p-3">स्थिति तथा मूल्याङ्कन</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {governanceData.map((g, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{g.metric}</td>
                        <td className="p-3 font-bold text-blue-900 dark:text-blue-300 font-mono text-sm">{g.value}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {g.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* SUBJECT 10: LOCAL GOVERNMENT COMPARISON TOOL */}
        {/* ============================================================= */}
        {activeSubject === "comparison" && (
          <section aria-labelledby="comparison-heading" className="space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 id="comparison-heading" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <GitCompare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <span>१०. स्थानीय तहगत तुलनात्मक विश्लेषण (Cross-Palika Comparison)</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    कोशी प्रदेशका पालिकाहरू छानेर सेवासुविधा, सामाजिक सुरक्षा, रोजगार, गृहभेट र बजेट सूचकहरूको तुलना गर्नुहोस्
                  </p>
                </div>
              </div>

              {/* Multi-Palika Selection Chips */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  तुलनाका लागि पालिकाहरू छनौट गर्नुहोस् (क्लिक गरी थप्नुहोस् वा हटाउनुहोस्):
                </span>
                <div className="flex flex-wrap gap-2">
                  {samplePalikaComparisons.map((p) => {
                    const isSelected = comparisonPalikas.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (comparisonPalikas.length > 1) {
                              setComparisonPalikas(comparisonPalikas.filter((id) => id !== p.id));
                            }
                          } else {
                            setComparisonPalikas([...comparisonPalikas, p.id]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-blue-900 text-white shadow-xs border border-blue-950"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? "text-amber-400" : "opacity-30"}`} />
                        <span>{p.name} ({p.district})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comparison Data Table with ALL Core Topics */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="min-w-full text-xs text-left">
                  <caption className="text-left font-bold text-slate-800 dark:text-slate-200 p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    तालिका १०.१: छानिएका स्थानीय तहहरूको बहु-विषयगत कार्यसम्पादन तुलना
                  </caption>
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th scope="col" className="p-3">स्थानीय तह</th>
                      <th scope="col" className="p-3">जिल्ला</th>
                      <th scope="col" className="p-3 text-right">कुल पहिचान</th>
                      <th scope="col" className="p-3 text-right">सेवासुविधा</th>
                      <th scope="col" className="p-3 text-right">सामाजिक सुरक्षा</th>
                      <th scope="col" className="p-3 text-right">रोजगार/उद्यम</th>
                      <th scope="col" className="p-3 text-right">गृहभेट संख्या</th>
                      <th scope="col" className="p-3 text-right">सहायक सामग्री</th>
                      <th scope="col" className="p-3 text-right">अपाङ्गता बजेट रु.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {samplePalikaComparisons
                      .filter((p) => comparisonPalikas.includes(p.id))
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3 font-bold text-blue-900 dark:text-blue-300">{p.name}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-400 font-medium">{p.district}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">{p.identified}</td>
                          <td className="p-3 text-right font-mono text-rose-700 dark:text-rose-400 font-bold">{p.services}</td>
                          <td className="p-3 text-right font-mono text-blue-700 dark:text-blue-400 font-bold">{p.ssa}</td>
                          <td className="p-3 text-right font-mono text-emerald-700 dark:text-emerald-400 font-bold">{p.employed}</td>
                          <td className="p-3 text-right font-mono text-purple-700 dark:text-purple-400 font-bold">{p.homeVisits}</td>
                          <td className="p-3 text-right font-mono text-teal-700 dark:text-teal-400 font-bold">{p.assistive}</td>
                          <td className="p-3 text-right font-mono text-amber-700 dark:text-amber-400 font-bold">रु. {p.budget}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

            </div>
          </section>
        )}
        </div>
        )}

      </main>

      <Footer lang={lang} />
    </div>
  );
}
