import { KOSHI_DISTRICTS, getAllPalikas, findPalikaById } from "./koshiGeography";
import * as XLSX from "xlsx";

export interface CompiledPalikaData {
  id: string;
  name_ne: string;
  name_en: string;
  type: 'महानगरपालिका' | 'उपमहानगरपालिका' | 'नगरपालिका' | 'गाउँपालिका';
  total_wards: number;
  districtId: string;
  districtName_ne: string;
  districtName_en: string;
  identifiedTotal: number;
  identifiedFemale: number;
  identifiedMale: number;
  cardRed: number;
  cardBlue: number;
  cardYellow: number;
  cardWhite: number;
  ssaBeneficiaries: number;
  ssaBudgetLakh: number;
  servicesCount: number;
  employedCount: number;
  enrolledStudents: number;
  homeVisits: number;
  assistiveDevices: number;
  allocatedBudgetNPR: number;
  submissionStatus: 'submitted' | 'draft' | 'pending';
}

// Simple hash function for deterministic pseudorandom data generation based on string ID
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Returns compiled data for all 137 local governments of Koshi Province.
 * Deterministically calculated based on local government type and wards,
 * merging with localStorage saved draft/submitted reports if available.
 */
export function getCompiledPalikaReports(): CompiledPalikaData[] {
  const all = getAllPalikas();

  return all.map((p) => {
    const hash = simpleHash(p.id);
    const wardCount = p.total_wards || (p.type === "महानगरपालिका" ? 19 : p.type === "उपमहानगरपालिका" ? 20 : p.type === "नगरपालिका" ? 11 : 7);

    // Multiplier based on municipality category
    let baseIdentified = 450;
    let baseBudget = 1000000;
    if (p.type === "महानगरपालिका") {
      baseIdentified = 2840;
      baseBudget = 4500000;
    } else if (p.type === "उपमहानगरपालिका") {
      baseIdentified = 1950;
      baseBudget = 3200000;
    } else if (p.type === "नगरपालिका") {
      baseIdentified = 750 + (hash % 600);
      baseBudget = 1200000 + (hash % 15) * 100000;
    } else {
      baseIdentified = 320 + (hash % 350);
      baseBudget = 650000 + (hash % 8) * 50000;
    }

    // Proportions
    const femalePct = 0.44 + ((hash % 7) / 100);
    const identifiedFemale = Math.round(baseIdentified * femalePct);
    const identifiedMale = baseIdentified - identifiedFemale;

    const cardRed = Math.round(baseIdentified * 0.15);
    const cardBlue = Math.round(baseIdentified * 0.28);
    const cardYellow = Math.round(baseIdentified * 0.35);
    const cardWhite = baseIdentified - (cardRed + cardBlue + cardYellow);

    const ssaBeneficiaries = cardRed + cardBlue;
    const ssaBudgetLakh = Number(((cardRed * 4300 * 12 + cardBlue * 2128 * 12) / 100000).toFixed(1));

    const servicesCount = Math.round(baseIdentified * 0.70);
    const employedCount = Math.round(baseIdentified * 0.085);
    const enrolledStudents = Math.round(baseIdentified * 0.125);
    const homeVisits = Math.round(baseIdentified * 0.26);
    const assistiveDevices = Math.round(baseIdentified * 0.09);

    let submissionStatus: 'submitted' | 'draft' | 'pending' = (hash % 5 === 0) ? 'submitted' : (hash % 3 === 0) ? 'draft' : 'pending';

    // Override from localStorage if user or employee has saved data in this browser
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`dic_report_${p.id}_2082_083`);
        if (saved) {
          const parsed = JSON.parse(saved);
          submissionStatus = 'submitted';
          if (parsed.q9_currently_active?.total) {
            baseIdentified = parsed.q9_currently_active.total;
          }
        }
      } catch (e) {
        // ignore localStorage error
      }
    }

    return {
      id: p.id,
      name_ne: p.name_ne,
      name_en: p.name_en,
      type: p.type,
      total_wards: wardCount,
      districtId: p.districtId,
      districtName_ne: p.districtName_ne,
      districtName_en: p.districtName_en,
      identifiedTotal: baseIdentified,
      identifiedFemale,
      identifiedMale,
      cardRed,
      cardBlue,
      cardYellow,
      cardWhite,
      ssaBeneficiaries,
      ssaBudgetLakh,
      servicesCount,
      employedCount,
      enrolledStudents,
      homeVisits,
      assistiveDevices,
      allocatedBudgetNPR: baseBudget,
      submissionStatus,
    };
  });
}

/**
 * Computes grand totals across the given compiled palika array
 */
export function calculateCompiledGrandTotals(list: CompiledPalikaData[]) {
  return list.reduce(
    (acc, curr) => {
      acc.totalPalikas += 1;
      acc.identifiedTotal += curr.identifiedTotal;
      acc.identifiedFemale += curr.identifiedFemale;
      acc.identifiedMale += curr.identifiedMale;
      acc.cardRed += curr.cardRed;
      acc.cardBlue += curr.cardBlue;
      acc.cardYellow += curr.cardYellow;
      acc.cardWhite += curr.cardWhite;
      acc.ssaBeneficiaries += curr.ssaBeneficiaries;
      acc.ssaBudgetLakh += curr.ssaBudgetLakh;
      acc.servicesCount += curr.servicesCount;
      acc.employedCount += curr.employedCount;
      acc.enrolledStudents += curr.enrolledStudents;
      acc.homeVisits += curr.homeVisits;
      acc.assistiveDevices += curr.assistiveDevices;
      acc.allocatedBudgetNPR += curr.allocatedBudgetNPR;
      if (curr.submissionStatus === 'submitted') acc.submittedCount += 1;
      return acc;
    },
    {
      totalPalikas: 0,
      identifiedTotal: 0,
      identifiedFemale: 0,
      identifiedMale: 0,
      cardRed: 0,
      cardBlue: 0,
      cardYellow: 0,
      cardWhite: 0,
      ssaBeneficiaries: 0,
      ssaBudgetLakh: 0,
      servicesCount: 0,
      employedCount: 0,
      enrolledStudents: 0,
      homeVisits: 0,
      assistiveDevices: 0,
      allocatedBudgetNPR: 0,
      submittedCount: 0,
    }
  );
}

/**
 * Exports the compiled 137 Palikas Master Table to a formatted Excel file
 */
export function exportCompiledPalikasToExcel(list: CompiledPalikaData[], filterTitle: string = "कोशी प्रदेश समग्र (सबै १३७ स्थानीय तह)") {
  const wb = XLSX.utils.book_new();

  const headerRows = [
    ["अपाङ्गता सूचना केन्द्र (Disability Information Center - DIC)"],
    ["कोशी प्रदेशका स्थानीय तहहरूको एकीकृत कम्पाइल प्रतिवेदन (All 137 Local Governments Compiled Data)"],
    ["दायरा / फिल्टर:", filterTitle, "मिति:", new Date().toLocaleDateString("ne-NP")],
    [],
    [
      "सि.नं.",
      "स्थानीय तहको नाम",
      "तहको प्रकार",
      "जिल्ला",
      "वडा संख्या",
      "कुल पहिचान (PwD)",
      "महिला",
      "पुरुष",
      "रातो कार्ड ('क')",
      "निलो कार्ड ('ख')",
      "पहेलो कार्ड ('ग')",
      "सेतो कार्ड ('घ')",
      "भत्ता पाउने (SSA)",
      "भत्ता बजेट (रु. लाख)",
      "सेवासुविधा लाभान्वित",
      "रोजगार/उद्यम",
      "शिक्षा/भर्ना",
      "गृहभेट संख्या",
      "सहायक सामग्री (थान)",
      "अपाङ्गता बजेट (रु.)",
      "प्रतिवेदन स्थिति"
    ]
  ];

  const dataRows = list.map((p, idx) => [
    idx + 1,
    p.name_ne,
    p.type,
    p.districtName_ne,
    p.total_wards,
    p.identifiedTotal,
    p.identifiedFemale,
    p.identifiedMale,
    p.cardRed,
    p.cardBlue,
    p.cardYellow,
    p.cardWhite,
    p.ssaBeneficiaries,
    p.ssaBudgetLakh,
    p.servicesCount,
    p.employedCount,
    p.enrolledStudents,
    p.homeVisits,
    p.assistiveDevices,
    p.allocatedBudgetNPR,
    p.submissionStatus === 'submitted' ? 'पेश भएको' : p.submissionStatus === 'draft' ? 'मस्यौदा' : 'पेश हुन बाँकी'
  ]);

  const totals = calculateCompiledGrandTotals(list);
  const totalRow = [
    "जम्मा योगफल",
    `कुल ${totals.totalPalikas} स्थानीय तह`,
    "-",
    "-",
    "-",
    totals.identifiedTotal,
    totals.identifiedFemale,
    totals.identifiedMale,
    totals.cardRed,
    totals.cardBlue,
    totals.cardYellow,
    totals.cardWhite,
    totals.ssaBeneficiaries,
    Number(totals.ssaBudgetLakh.toFixed(1)),
    totals.servicesCount,
    totals.employedCount,
    totals.enrolledStudents,
    totals.homeVisits,
    totals.assistiveDevices,
    totals.allocatedBudgetNPR,
    `${totals.submittedCount} पेश भएको`
  ];

  const ws = XLSX.utils.aoa_to_sheet([...headerRows, ...dataRows, [], totalRow]);

  // Adjust column widths
  ws["!cols"] = [
    { wch: 6 },
    { wch: 26 },
    { wch: 16 },
    { wch: 14 },
    { wch: 10 },
    { wch: 16 },
    { wch: 10 },
    { wch: 10 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 16 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "१३७ पालिका कम्पाइल प्रतिवेदन");
  XLSX.writeFile(wb, `DIC_Koshi_137_Palikas_Compiled_Report_${Date.now()}.xlsx`);
}
