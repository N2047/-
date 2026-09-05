export interface GenderRow {
  female: number | '';
  male: number | '';
  total: number;
  remarks?: string;
}

export interface TrainingRow {
  name: string;
  duration: string;
  female: number | '';
  male: number | '';
  total: number;
  remarks?: string;
}

export interface EmploymentRow {
  type: string;
  female: number | '';
  male: number | '';
  total: number;
  remarks?: string;
}

export interface HomeVisitRecord {
  id: string;
  row_order: number;
  id_card_number: string;
  beneficiary_name: string;
  gender: 'महिला' | 'पुरुष' | 'अन्य';
  ward_number: number | '';
  contact_number: string;
  disability_type: string;
  disability_severity: string;
  service_provided: string;
  remarks: string;
}

export interface AssistiveDeviceRecord {
  id: string;
  row_order: number;
  id_card_number: string;
  beneficiary_name: string;
  gender: 'महिला' | 'पुरुष' | 'अन्य';
  ward_number: number | '';
  disability_type: string;
  id_card_color: string;
  previously_used: boolean;
  previous_device_name: string;
  distributed_device: string;
  measurement_done: boolean;
  measurement_specs: string;
}

export interface CircularItem {
  status: boolean;
  remarks: string;
}

export interface AnnualReportFormData {
  // Metadata
  palika_id: string;
  fiscal_year: string; // '२०८२/०८३'
  submitted_by_name: string;
  submitted_by_phone: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'returned_for_correction';

  // Section 1: Demographics (Q1 to Q9)
  q1_census: GenderRow;
  q2_id_cards_issued: GenderRow;
  q3_identified_pwd: GenderRow;
  q4_id_card_pending: GenderRow;
  q5_profile_completed: GenderRow;
  q6_profile_pending: GenderRow;
  q7_migrated_out: GenderRow;
  q8_deceased: GenderRow;
  q9_currently_active: GenderRow;

  // Section 2: Service delivery (Q10 to Q13)
  q10_counselling: GenderRow;
  q11_home_visits: GenderRow;
  q12_assistive_received: GenderRow;
  q13_treatment_received: GenderRow;

  // Section 3: Education & Children (Q14 to Q20)
  q14_school_new_admit: GenderRow;
  q15_school_enrolled_total: GenderRow;
  q16_scholarship: GenderRow;
  q17_home_based_edu: GenderRow;
  q18_out_of_school: GenderRow;
  q19_child_clubs_total: number | '';
  q20_child_club_pwd: GenderRow;

  // Section 4: Skills & Livelihood (Q21 to Q23)
  q21_trainings: TrainingRow[];
  q22_employment: EmploymentRow[];
  q23_family_employment: GenderRow;

  // Section 5: Social Security Allowance (Q24 to Q27)
  q24_ssa_profound: GenderRow;
  q24_ssa_severe: GenderRow;
  q25_ssa_moderate_mild: GenderRow;
  q26_ssa_level_mismatch: GenderRow;
  q27_ssa_other_schemes: GenderRow;

  // Section 6: Self-Help Groups & Seed Capital (Q28 to Q29)
  q28_shg_members: GenderRow;
  q28_shg_families: GenderRow;
  q29_seed_dprp: number | '';
  q29_seed_other: number | '';
  q29_member_savings: number | '';
  q29_interest_earned: number | '';
  q29_total_funds: number;
  q29_loan_invested: number | '';
  q29_bad_loans: number | '';
  q29_net_loan_outstanding: number;

  // Section 7: Institutional & Budget (Q30 to Q33)
  q30_dpo_members: GenderRow;
  q30_dpo_meetings_count: number | '';
  q30_dpo_attendance: GenderRow;
  q31_budget_allocated: number | '';
  q31_budget_remarks: string;
  q32_dpo_grant_settled: number | '';
  q32_dpo_grant_remarks: string;
  q33_health_ins_free: GenderRow;
  q33_health_ins_other: GenderRow;

  // Section 8: 10 Disability Types Matrix (Q34)
  q34_cumulative_matrix: Record<string, GenderRow>;
  q34_fy_matrix: Record<string, GenderRow>;
  q34_fy_deceased: GenderRow;

  // Section 9: Card Severity Color Matrix (Q35)
  q35_cumulative_cards: Record<string, GenderRow>;
  q35_fy_cards: Record<string, GenderRow>;
  q35_card_in_process: GenderRow;

  // Section 10: Legal aid, policy, circulars (Q36 to Q44)
  q36_legal_aid: GenderRow;
  q37_instant_id_service: { status: boolean | null; remarks: string };
  q38_desk_setup: { status: boolean | null; remarks: string };
  q39_dedicated_room: { status: boolean | null; remarks: string };
  q40_circulars: {
    education: CircularItem;
    health_insurance: CircularItem;
    child_club: CircularItem;
    transport: CircularItem;
    accessible_infrastructure: CircularItem;
  };
  q41_fee_refund: {
    schools_count: number | '';
    refund_amount: number | '';
    students_count: number | '';
    remarks: string;
  };
  q42_accessible_buildings: {
    count: number | '';
    details: string;
  };
  q43_cbrf_duty: { status: boolean | null; remarks: string };
  q44_other_duties_impact: { status: boolean | null; work_details: string };

  // Annex 1.1: Home Visits
  home_visits_records: HomeVisitRecord[];

  // Annex 1.2: Assistive Devices
  assistive_device_records: AssistiveDeviceRecord[];
}
