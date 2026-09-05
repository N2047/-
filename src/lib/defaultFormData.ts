import { AnnualReportFormData, GenderRow } from "@/types/form";

const emptyGenderRow = (): GenderRow => ({
  female: "",
  male: "",
  total: 0,
  remarks: "",
});

export const DISABILITY_TEN_TYPES = [
  { id: "physical", label: "शारीरिक अपाङ्गता" },
  { id: "vision_low", label: "दृष्टि सम्बन्धी (न्यून दृष्टि)" },
  { id: "vision_blind", label: "दृष्टि सम्बन्धी (दृष्टिबिहीनता)" },
  { id: "hearing_hard", label: "सुनाइ सम्बन्धी (सुस्तश्रवण)" },
  { id: "hearing_deaf", label: "सुनाइ सम्बन्धी (बहिरा)" },
  { id: "deaf_blind", label: "श्रवण-दृष्टिबिहीन" },
  { id: "speech", label: "स्वर र बोलाइ सम्बन्धी" },
  { id: "psychosocial", label: "मानसिक तथा मनोसामाजिक" },
  { id: "intellectual", label: "बौद्धिक अपाङ्गता" },
  { id: "hemophilia", label: "हेमोफिलिया" },
  { id: "autism", label: "अटिज्म" },
  { id: "multiple", label: "बहु-अपाङ्गता" },
];

export const CARD_COLORS = [
  { id: "red", label: "रातो (पूर्ण अशक्त - Profound)" },
  { id: "blue", label: "निलो (अति अशक्त - Severe)" },
  { id: "yellow", label: "पहेलो (मध्यम - Moderate)" },
  { id: "white", label: "सेतो (सामान्य - Mild)" },
];

export const createInitialFormData = (palikaId: string): AnnualReportFormData => {
  const q34_cum: Record<string, GenderRow> = {};
  const q34_fy: Record<string, GenderRow> = {};
  DISABILITY_TEN_TYPES.forEach((t) => {
    q34_cum[t.id] = emptyGenderRow();
    q34_fy[t.id] = emptyGenderRow();
  });

  const q35_cum: Record<string, GenderRow> = {};
  const q35_fy: Record<string, GenderRow> = {};
  CARD_COLORS.forEach((c) => {
    q35_cum[c.id] = emptyGenderRow();
    q35_fy[c.id] = emptyGenderRow();
  });

  return {
    palika_id: palikaId,
    fiscal_year: "२०८२/०८३",
    submitted_by_name: "",
    submitted_by_phone: "",
    status: "draft",

    // Section 1
    q1_census: emptyGenderRow(),
    q2_id_cards_issued: emptyGenderRow(),
    q3_identified_pwd: emptyGenderRow(),
    q4_id_card_pending: emptyGenderRow(),
    q5_profile_completed: emptyGenderRow(),
    q6_profile_pending: emptyGenderRow(),
    q7_migrated_out: emptyGenderRow(),
    q8_deceased: emptyGenderRow(),
    q9_currently_active: emptyGenderRow(),

    // Section 2
    q10_counselling: emptyGenderRow(),
    q11_home_visits: emptyGenderRow(),
    q12_assistive_received: emptyGenderRow(),
    q13_treatment_received: emptyGenderRow(),

    // Section 3
    q14_school_new_admit: emptyGenderRow(),
    q15_school_enrolled_total: emptyGenderRow(),
    q16_scholarship: emptyGenderRow(),
    q17_home_based_edu: emptyGenderRow(),
    q18_out_of_school: emptyGenderRow(),
    q19_child_clubs_total: "",
    q20_child_club_pwd: emptyGenderRow(),

    // Section 4
    q21_trainings: [
      { name: "व्युटिपार्लर", duration: "३ महिना", female: "", male: "", total: 0, remarks: "" },
      { name: "सिलाई कटाई", duration: "३ महिना", female: "", male: "", total: 0, remarks: "" },
      { name: "पशुपालन", duration: "१ महिना", female: "", male: "", total: 0, remarks: "" },
      { name: "कृषि सम्बन्धी", duration: "१ महिना", female: "", male: "", total: 0, remarks: "" },
      { name: "मेकानिकल", duration: "३ महिना", female: "", male: "", total: 0, remarks: "" },
    ],
    q22_employment: [
      { type: "पशुपालन", female: "", male: "", total: 0, remarks: "" },
      { type: "व्यापार", female: "", male: "", total: 0, remarks: "" },
      { type: "जागिर", female: "", male: "", total: 0, remarks: "" },
      { type: "आधुनिक कृषि व्यवसाय", female: "", male: "", total: 0, remarks: "" },
    ],
    q23_family_employment: emptyGenderRow(),

    // Section 5
    q24_ssa_profound: emptyGenderRow(),
    q24_ssa_severe: emptyGenderRow(),
    q25_ssa_moderate_mild: emptyGenderRow(),
    q26_ssa_level_mismatch: emptyGenderRow(),
    q27_ssa_other_schemes: emptyGenderRow(),

    // Section 6
    q28_shg_members: emptyGenderRow(),
    q28_shg_families: emptyGenderRow(),
    q29_seed_dprp: "",
    q29_seed_other: "",
    q29_member_savings: "",
    q29_interest_earned: "",
    q29_total_funds: 0,
    q29_loan_invested: "",
    q29_bad_loans: "",
    q29_net_loan_outstanding: 0,

    // Section 7
    q30_dpo_members: emptyGenderRow(),
    q30_dpo_meetings_count: "",
    q30_dpo_attendance: emptyGenderRow(),
    q31_budget_allocated: "",
    q31_budget_remarks: "",
    q32_dpo_grant_settled: "",
    q32_dpo_grant_remarks: "",
    q33_health_ins_free: emptyGenderRow(),
    q33_health_ins_other: emptyGenderRow(),

    // Section 8
    q34_cumulative_matrix: q34_cum,
    q34_fy_matrix: q34_fy,
    q34_fy_deceased: emptyGenderRow(),

    // Section 9
    q35_cumulative_cards: q35_cum,
    q35_fy_cards: q35_fy,
    q35_card_in_process: emptyGenderRow(),

    // Section 10
    q36_legal_aid: emptyGenderRow(),
    q37_instant_id_service: { status: null, remarks: "" },
    q38_desk_setup: { status: null, remarks: "" },
    q39_dedicated_room: { status: null, remarks: "" },
    q40_circulars: {
      education: { status: false, remarks: "" },
      health_insurance: { status: false, remarks: "" },
      child_club: { status: false, remarks: "" },
      transport: { status: false, remarks: "" },
      accessible_infrastructure: { status: false, remarks: "" },
    },
    q41_fee_refund: {
      schools_count: "",
      refund_amount: "",
      students_count: "",
      remarks: "",
    },
    q42_accessible_buildings: {
      count: "",
      details: "",
    },
    q43_cbrf_duty: { status: null, remarks: "" },
    q44_other_duties_impact: { status: null, work_details: "" },

    // Annexes
    home_visits_records: [],
    assistive_device_records: [],
  };
};
