import * as XLSX from 'xlsx';
import { AnnualReportFormData } from '@/types/form';

export function exportReportToExcel(
  formData: AnnualReportFormData,
  palikaName: string,
  districtName: string
) {
  const wb = XLSX.utils.book_new();

  // Helper to extract numeric or empty
  const val = (v: any) => (v === '' || v === undefined || v === null ? '-' : v);

  // ----------------------------------------------------
  // SHEET 1: प्रश्न (वार्षिक प्रतिवेदन मुख्य फारम)
  // ----------------------------------------------------
  const qSheetData: (string | number)[][] = [
    ['अपाङ्गता सूचना केन्द्र (Disability Information Center - DIC)'],
    ['अपाङ्गता सहायता सहजकर्ता वार्षिक प्रतिवेदन'],
    ['आर्थिक वर्ष:', formData.fiscal_year || '२०८२/०८३'],
    ['जिल्ला:', districtName, 'स्थानीय तह:', palikaName],
    ['सहजकर्ताको नाम:', val(formData.submitted_by_name), 'सम्पर्क नं.:', val(formData.submitted_by_phone)],
    ['स्थिति:', formData.status === 'approved' ? 'स्वीकृत (Approved)' : formData.status === 'submitted' ? 'पेश गरिएको (Submitted)' : 'मस्यौदा (Draft)'],
    [],
    ['सि.नं.', 'प्रश्न / सूचकको विवरण', 'महिला', 'पुरुष', 'जम्मा', 'कैफियत'],

    // खण्ड १: जनसांख्यिकीय विवरण
    ['खण्ड १: जनसांख्यिकीय विवरण (Demographics)'],
    ['१', 'राष्ट्रिय जनगणना २०७८ अनुसार अपाङ्गता भएका व्यक्तिको संख्या', val(formData.q1_census?.female), val(formData.q1_census?.male), val(formData.q1_census?.total), val(formData.q1_census?.remarks)],
    ['२', 'पालिकामा हालसम्म अपाङ्गता परिचयपत्र वितरण भएको संख्या (कुल)', val(formData.q2_id_cards_issued?.female), val(formData.q2_id_cards_issued?.male), val(formData.q2_id_cards_issued?.total), val(formData.q2_id_cards_issued?.remarks)],
    ['३', 'पालिकामा पहिचान भएका अपाङ्गता भएका व्यक्तिको संख्या', val(formData.q3_identified_pwd?.female), val(formData.q3_identified_pwd?.male), val(formData.q3_identified_pwd?.total), val(formData.q3_identified_pwd?.remarks)],
    ['४', 'पहिचान भएकामध्ये परिचयपत्र लिन बाँकी रहेका व्यक्तिको संख्या', val(formData.q4_id_card_pending?.female), val(formData.q4_id_card_pending?.male), val(formData.q4_id_card_pending?.total), val(formData.q4_id_card_pending?.remarks)],
    ['५', 'पालिकामा विस्तृत व्यक्तिगत विवरण (Profile) संकलन भएका व्यक्ति', val(formData.q5_profile_completed?.female), val(formData.q5_profile_completed?.male), val(formData.q5_profile_completed?.total), val(formData.q5_profile_completed?.remarks)],
    ['६', 'विस्तृत व्यक्तिगत विवरण (Profile) संकलन हुन बाँकी व्यक्ति', val(formData.q6_profile_pending?.female), val(formData.q6_profile_pending?.male), val(formData.q6_profile_pending?.total), val(formData.q6_profile_pending?.remarks)],
    ['७', 'आ.व. भित्र पालिकाबाट बसाई सरी अन्यत्र गएका व्यक्ति संख्या', val(formData.q7_migrated_out?.female), val(formData.q7_migrated_out?.male), val(formData.q7_migrated_out?.total), val(formData.q7_migrated_out?.remarks)],
    ['८', 'आ.व. भित्र मृत्यु भएका अपाङ्गता भएका व्यक्तिको संख्या', val(formData.q8_deceased?.female), val(formData.q8_deceased?.male), val(formData.q8_deceased?.total), val(formData.q8_deceased?.remarks)],
    ['९', 'हाल पालिकामा बसोबास गरिरहेका अपाङ्गता भएका व्यक्ति संख्या [Q2-(Q7+Q8)]', val(formData.q9_currently_active?.female), val(formData.q9_currently_active?.male), val(formData.q9_currently_active?.total), val(formData.q9_currently_active?.remarks)],
    [],

    // खण्ड २: सेवा प्रवाह तथा परामर्श
    ['खण्ड २: सेवा प्रवाह तथा परामर्श'],
    ['१०', 'व्यक्तिगत तथा पारिवारिक परामर्श सेवा प्राप्त गरेका व्यक्ति संख्या', val(formData.q10_counselling?.female), val(formData.q10_counselling?.male), val(formData.q10_counselling?.total), val(formData.q10_counselling?.remarks)],
    ['११', 'गृहभेट सेवा प्राप्त गरेका अपाङ्गता भएका व्यक्ति संख्या', val(formData.q11_home_visits?.female), val(formData.q11_home_visits?.male), val(formData.q11_home_visits?.total), val(formData.q11_home_visits?.remarks)],
    ['१२', 'सहायक सामग्री प्राप्त गरेका अपाङ्गता भएका व्यक्ति संख्या', val(formData.q12_assistive_received?.female), val(formData.q12_assistive_received?.male), val(formData.q12_assistive_received?.total), val(formData.q12_assistive_received?.remarks)],
    ['१३', 'स्वास्थ्य उपचार तथा पुनर्स्थापना सेवा प्राप्त गरेका व्यक्ति संख्या', val(formData.q13_treatment_received?.female), val(formData.q13_treatment_received?.male), val(formData.q13_treatment_received?.total), val(formData.q13_treatment_received?.remarks)],
    [],

    // खण्ड ३: शिक्षा तथा बालबालिका
    ['खण्ड ३: शिक्षा तथा बालबालिका'],
    ['१४', 'यस आ.व. मा विद्यालय भर्ना भएका नयाँ बालबालिका संख्या', val(formData.q14_school_new_admit?.female), val(formData.q14_school_new_admit?.male), val(formData.q14_school_new_admit?.total), val(formData.q14_school_new_admit?.remarks)],
    ['१५', 'हाल विद्यालयमा अध्ययनरत कुल बालबालिका संख्या', val(formData.q15_school_enrolled_total?.female), val(formData.q15_school_enrolled_total?.male), val(formData.q15_school_enrolled_total?.total), val(formData.q15_school_enrolled_total?.remarks)],
    ['१६', 'छात्रवृत्ति प्राप्त गरिरहेका विद्यार्थी संख्या', val(formData.q16_scholarship?.female), val(formData.q16_scholarship?.male), val(formData.q16_scholarship?.total), val(formData.q16_scholarship?.remarks)],
    ['१७', 'गृहकेन्द्रित शिक्षा (Home-based Education) प्राप्त गरेका बालबालिका', val(formData.q17_home_based_edu?.female), val(formData.q17_home_based_edu?.male), val(formData.q17_home_based_edu?.total), val(formData.q17_home_based_edu?.remarks)],
    ['१८', 'विद्यालय उमेर समूहका विद्यालय बाहिर रहेका बालबालिका संख्या', val(formData.q18_out_of_school?.female), val(formData.q18_out_of_school?.male), val(formData.q18_out_of_school?.total), val(formData.q18_out_of_school?.remarks)],
    ['१९', 'पालिकामा गठन भएका कुल बाल क्लब संख्या', '-', '-', val(formData.q19_child_clubs_total), 'कुल बाल क्लब'],
    ['२०', 'बाल क्लबहरूमा आबद्ध अपाङ्गता भएका बालबालिका संख्या', val(formData.q20_child_club_pwd?.female), val(formData.q20_child_club_pwd?.male), val(formData.q20_child_club_pwd?.total), val(formData.q20_child_club_pwd?.remarks)],
    [],

    // खण्ड ४: सीपमूलक तालिम तथा रोजगारी
    ['खण्ड ४: सीपमूलक तालिम तथा रोजगारी'],
    ['२१', 'सीपमूलक तालिम प्राप्त गरेका व्यक्ति संख्या (कुल तालिम कार्यक्रम संख्या: ' + (formData.q21_trainings?.length || 0) + ')'],
    ...((formData.q21_trainings || []).map((t, idx) => [
      `२१.${idx + 1}`,
      `तालिम: ${t.name || '-'} (अवधि: ${t.duration || '-'})`,
      val(t.female),
      val(t.male),
      val(t.total),
      val(t.remarks)
    ])),
    ['२२', 'रोजगारी/आयआर्जनमा संलग्न व्यक्ति संख्या (कुल क्षेत्र: ' + (formData.q22_employment?.length || 0) + ')'],
    ...((formData.q22_employment || []).map((e, idx) => [
      `२२.${idx + 1}`,
      `रोजगारी क्षेत्र: ${e.type || '-'}`,
      val(e.female),
      val(e.male),
      val(e.total),
      val(e.remarks)
    ])),
    ['२३', 'अपाङ्गता भएका व्यक्तिका परिवारका सदस्य रोजगारीमा संलग्न संख्या', val(formData.q23_family_employment?.female), val(formData.q23_family_employment?.male), val(formData.q23_family_employment?.total), val(formData.q23_family_employment?.remarks)],
    [],

    // खण्ड ५: सामाजिक सुरक्षा भत्ता
    ['खण्ड ५: सामाजिक सुरक्षा भत्ता'],
    ['२४', 'पूर्ण अशक्त (रातो कार्ड - "क" वर्ग) भत्ता प्राप्त गर्ने संख्या', val(formData.q24_ssa_profound?.female), val(formData.q24_ssa_profound?.male), val(formData.q24_ssa_profound?.total), val(formData.q24_ssa_profound?.remarks)],
    ['२४.१', 'अति अशक्त (नीलो कार्ड - "ख" वर्ग) भत्ता प्राप्त गर्ने संख्या', val(formData.q24_ssa_severe?.female), val(formData.q24_ssa_severe?.male), val(formData.q24_ssa_severe?.total), val(formData.q24_ssa_severe?.remarks)],
    ['२५', 'मध्यम र सामान्य (पहेंलो/सेतो) अवस्था भई भत्ता नपाउने संख्या', val(formData.q25_ssa_moderate_mild?.female), val(formData.q25_ssa_moderate_mild?.male), val(formData.q25_ssa_moderate_mild?.total), val(formData.q25_ssa_moderate_mild?.remarks)],
    ['२६', 'अपाङ्गताको वास्तविक अवस्था र परिचयपत्र वर्ग नमिलेका संख्या', val(formData.q26_ssa_level_mismatch?.female), val(formData.q26_ssa_level_mismatch?.male), val(formData.q26_ssa_level_mismatch?.total), val(formData.q26_ssa_level_mismatch?.remarks)],
    ['२७', 'अन्य सामाजिक सुरक्षा योजनाबाट लाभान्वित व्यक्ति संख्या', val(formData.q27_ssa_other_schemes?.female), val(formData.q27_ssa_other_schemes?.male), val(formData.q27_ssa_other_schemes?.total), val(formData.q27_ssa_other_schemes?.remarks)],
    [],

    // खण्ड ६: स्वावलम्बन समूह तथा बिउपुँजी
    ['खण्ड ६: स्वावलम्बन समूह तथा बिउपुँजी'],
    ['२८', 'स्वावलम्बन समूहमा आबद्ध अपाङ्गता भएका सदस्य संख्या', val(formData.q28_shg_members?.female), val(formData.q28_shg_members?.male), val(formData.q28_shg_members?.total), val(formData.q28_shg_members?.remarks)],
    ['२८.१', 'स्वावलम्बन समूहमा आबद्ध परिवारका सदस्य संख्या', val(formData.q28_shg_families?.female), val(formData.q28_shg_families?.male), val(formData.q28_shg_families?.total), val(formData.q28_shg_families?.remarks)],
    ['२९', 'बिउपुँजी (Seed Capital) वित्तीय विवरण'],
    ['२९.१', 'DPRP बाट प्राप्त बिउपुँजी (रु.)', '-', '-', val(formData.q29_seed_dprp), ''],
    ['२९.२', 'अन्य निकायबाट प्राप्त बिउपुँजी (रु.)', '-', '-', val(formData.q29_seed_other), ''],
    ['२९.३', 'सदस्यहरूको नियमित बचत रकम (रु.)', '-', '-', val(formData.q29_member_savings), ''],
    ['२९.४', 'बिउपुँजी परिचालनबाट आर्जित व्याज (रु.)', '-', '-', val(formData.q29_interest_earned), ''],
    ['२९.५', 'कुल बिउपुँजी कोष मौज्दात (रु.)', '-', '-', val(formData.q29_total_funds), 'कुल कोष'],
    ['२९.६', 'हाल लगानीमा रहेको ऋण रकम (रु.)', '-', '-', val(formData.q29_loan_invested), ''],
    ['२९.७', 'खराब/उठन नसकेको ऋण रकम (रु.)', '-', '-', val(formData.q29_bad_loans), ''],
    ['२९.८', 'खुद लगानीमा रहेको ऋण (रु.)', '-', '-', val(formData.q29_net_loan_outstanding), 'लगानी मौज्दात'],
    [],

    // खण्ड ७: संस्थागत समन्वय तथा बजेट
    ['खण्ड ७: संस्थागत समन्वय तथा बजेट'],
    ['३०', 'अपाङ्गता भएका व्यक्तिको संस्था (DPO) मा आबद्ध सदस्य संख्या', val(formData.q30_dpo_members?.female), val(formData.q30_dpo_members?.male), val(formData.q30_dpo_members?.total), val(formData.q30_dpo_members?.remarks)],
    ['३०.१', 'यस आ.व. मा सम्पन्न DPO बैठक संख्या', '-', '-', val(formData.q30_dpo_meetings_count), 'बैठक पटक'],
    ['३०.२', 'DPO बैठकहरूमा सदस्यहरूको औसत उपस्थिति', val(formData.q30_dpo_attendance?.female), val(formData.q30_dpo_attendance?.male), val(formData.q30_dpo_attendance?.total), val(formData.q30_dpo_attendance?.remarks)],
    ['३१', 'पालिकाद्वारा अपाङ्गता क्षेत्रका लागि विनियोजित कुल बजेट (रु.)', '-', '-', val(formData.q31_budget_allocated), val(formData.q31_budget_remarks)],
    ['३२', 'DPO लाई पालिकाबाट प्रदान गरिएको अनुदान फरफारक रकम (रु.)', '-', '-', val(formData.q32_dpo_grant_settled), val(formData.q32_dpo_grant_remarks)],
    ['३३', 'पालिकाबाट निःशुल्क स्वास्थ्य बिमा गराइएका व्यक्ति संख्या', val(formData.q33_health_ins_free?.female), val(formData.q33_health_ins_free?.male), val(formData.q33_health_ins_free?.total), val(formData.q33_health_ins_free?.remarks)],
    ['३३.१', 'अन्य स्रोतबाट स्वास्थ्य बिमा गराइएका व्यक्ति संख्या', val(formData.q33_health_ins_other?.female), val(formData.q33_health_ins_other?.male), val(formData.q33_health_ins_other?.total), val(formData.q33_health_ins_other?.remarks)],
    [],

    // खण्ड ८: १० प्रकारका अपाङ्गता वर्गीकरण विवरण
    ['खण्ड ८: १० प्रकारका अपाङ्गता वर्गीकरण विवरण (Q34)'],
    ['३४', '१० प्रकारका अपाङ्गताको विवरण (हालसम्मको कुल र यस आ.व.)'],
    ...Object.entries(formData.q34_cumulative_matrix || {}).map(([key, row], idx) => [
      `३४.${idx + 1}`,
      `अपाङ्गता प्रकार: ${key} (हालसम्मको संकलित)`,
      val(row?.female),
      val(row?.male),
      val(row?.total),
      val(row?.remarks)
    ]),
    [],

    // खण्ड ९: परिचयपत्रको वर्ग विवरण
    ['खण्ड ९: परिचयपत्रको वर्ग (गम्भीरता) विवरण (Q35)'],
    ['३५', 'परिचयपत्र वर्ग विवरण (हालसम्मको कुल र यस आ.व.)'],
    ...Object.entries(formData.q35_cumulative_cards || {}).map(([key, row], idx) => [
      `३५.${idx + 1}`,
      `वर्ग: ${key} (हालसम्मको संकलित)`,
      val(row?.female),
      val(row?.male),
      val(row?.total),
      val(row?.remarks)
    ]),
    [],

    // खण्ड १०: नीतिगत, कानुनी तथा संस्थागत व्यवस्था
    ['खण्ड १०: नीतिगत, कानुनी तथा संस्थागत व्यवस्था (Q36 - Q44)'],
    ['३६', 'न्यायिक समिति वा कानुनी सहायता प्राप्त गरेका व्यक्ति संख्या', val(formData.q36_legal_aid?.female), val(formData.q36_legal_aid?.male), val(formData.q36_legal_aid?.total), val(formData.q36_legal_aid?.remarks)],
    ['३७', 'पालिकामा नियमित तत्काल परिचयपत्र वितरण सेवा सञ्चालन भए/नभएको', formData.q37_instant_id_service?.status === true ? 'छ (भएको)' : formData.q37_instant_id_service?.status === false ? 'छैन (नभएको)' : '-', '-', '-', val(formData.q37_instant_id_service?.remarks)],
    ['३८', 'नागरिक सहायता कक्ष (Help Desk) स्थापना भए/नभएको', formData.q38_desk_setup?.status === true ? 'छ' : formData.q38_desk_setup?.status === false ? 'छैन' : '-', '-', '-', val(formData.q38_desk_setup?.remarks)],
    ['३९', 'सहजकर्ताका लागि छुट्टै कार्यकक्ष/कोठा व्यवस्था भएको/नभएको', formData.q39_dedicated_room?.status === true ? 'छ' : formData.q39_dedicated_room?.status === false ? 'छैन' : '-', '-', '-', val(formData.q39_dedicated_room?.remarks)],
    ['४०.१', 'परिपत्र: शिक्षा सम्बन्धी परिपत्र जारी भएको/नभएको', formData.q40_circulars?.education?.status ? 'छ' : 'छैन', '-', '-', val(formData.q40_circulars?.education?.remarks)],
    ['४०.२', 'परिपत्र: स्वास्थ्य बिमा सम्बन्धी परिपत्र जारी भएको/नभएको', formData.q40_circulars?.health_insurance?.status ? 'छ' : 'छैन', '-', '-', val(formData.q40_circulars?.health_insurance?.remarks)],
    ['४०.३', 'परिपत्र: बाल क्लब सम्बन्धी परिपत्र जारी भएको/नभएको', formData.q40_circulars?.child_club?.status ? 'छ' : 'छैन', '-', '-', val(formData.q40_circulars?.child_club?.remarks)],
    ['४०.४', 'परिपत्र: सार्वजनिक यातायात छुट सम्बन्धी परिपत्र जारी भएको', formData.q40_circulars?.transport?.status ? 'छ' : 'छैन', '-', '-', val(formData.q40_circulars?.transport?.remarks)],
    ['४०.५', 'परिपत्र: पहुँचयुक्त भौतिक संरचना सम्बन्धी मापदण्ड परिपत्र', formData.q40_circulars?.accessible_infrastructure?.status ? 'छ' : 'छैन', '-', '-', val(formData.q40_circulars?.accessible_infrastructure?.remarks)],
    ['४१', 'अपाङ्गता भएका बालबालिकाबाट लिइएको शुल्क फिर्ता विवरण', '-', '-', `विद्यार्थी: ${val(formData.q41_fee_refund?.students_count)}, विद्यालय: ${val(formData.q41_fee_refund?.schools_count)}, रकम रु.: ${val(formData.q41_fee_refund?.refund_amount)}`, val(formData.q41_fee_refund?.remarks)],
    ['४२', 'पहुँचयुक्त बनेका सार्वजनिक भौतिक संरचनाको संख्या', '-', '-', val(formData.q42_accessible_buildings?.count), val(formData.q42_accessible_buildings?.details)],
    ['४३', 'सहजकर्ताको दैनिक कार्य विवरण (CBRF Duty) पालना भएको', formData.q43_cbrf_duty?.status === true ? 'छ' : formData.q43_cbrf_duty?.status === false ? 'छैन' : '-', '-', '-', val(formData.q43_cbrf_duty?.remarks)],
    ['४४', 'सहजकर्तालाई अन्य काममा खटाइँदा अपाङ्गता कार्यमा असर परे/नपरेको', formData.q44_other_duties_impact?.status === true ? 'असर परेको छ' : formData.q44_other_duties_impact?.status === false ? 'असर परेको छैन' : '-', '-', '-', val(formData.q44_other_duties_impact?.work_details)]
  ];

  const wsQuestions = XLSX.utils.aoa_to_sheet(qSheetData);
  // Set column widths
  wsQuestions['!cols'] = [
    { wch: 8 },  // सि.नं.
    { wch: 55 }, // विवरण
    { wch: 10 }, // महिला
    { wch: 10 }, // पुरुष
    { wch: 16 }, // जम्मा
    { wch: 30 }  // कैफियत
  ];
  XLSX.utils.book_append_sheet(wb, wsQuestions, 'प्रश्न (वार्षिक प्रतिवेदन)');

  // ----------------------------------------------------
  // SHEET 2: अनुसूचि १.१ गृहभेट विवरण
  // ----------------------------------------------------
  const homeVisitsData: (string | number)[][] = [
    ['अपाङ्गता सूचना केन्द्र (DIC)'],
    ['अनुसूचि १.१: गृहभेट सेवा प्राप्त विवरण'],
    ['स्थानीय तह:', palikaName, 'जिल्ला:', districtName, 'आर्थिक वर्ष:', formData.fiscal_year || '२०८२/०८३'],
    [],
    [
      'सि.नं.',
      'परिचयपत्र नं.',
      'लाभग्राहीको नाम, थर',
      'लिङ्ग',
      'वडा नं.',
      'सम्पर्क नम्बर',
      'अपाङ्गताको प्रकार',
      'गम्भीरता (क/ख/ग/घ)',
      'गृहभेटमा प्रदान सेवा / परामर्श विवरण',
      'कैफियत'
    ]
  ];

  if (formData.home_visits_records && formData.home_visits_records.length > 0) {
    formData.home_visits_records.forEach((row, idx) => {
      homeVisitsData.push([
        idx + 1,
        val(row.id_card_number),
        val(row.beneficiary_name),
        val(row.gender),
        val(row.ward_number),
        val(row.contact_number),
        val(row.disability_type),
        val(row.disability_severity),
        val(row.service_provided),
        val(row.remarks)
      ]);
    });
  } else {
    homeVisitsData.push(['१', '-', '-', '-', '-', '-', '-', '-', '-', 'कुनै विवरण दाखिला भएको छैन']);
  }

  const wsHomeVisits = XLSX.utils.aoa_to_sheet(homeVisitsData);
  wsHomeVisits['!cols'] = [
    { wch: 6 },  // S.N.
    { wch: 14 }, // Card No
    { wch: 25 }, // Name
    { wch: 10 }, // Gender
    { wch: 8 },  // Ward
    { wch: 14 }, // Contact
    { wch: 20 }, // Type
    { wch: 16 }, // Severity
    { wch: 35 }, // Service
    { wch: 20 }  // Remarks
  ];
  XLSX.utils.book_append_sheet(wb, wsHomeVisits, 'अनुसूचि १.१ गृहभेट');

  // ----------------------------------------------------
  // SHEET 3: अनुसूचि १.२ सहायक सामग्री विवरण
  // ----------------------------------------------------
  const assistiveData: (string | number)[][] = [
    ['अपाङ्गता सूचना केन्द्र (DIC)'],
    ['अनुसूचि १.२: सहायक सामग्री वितरण विवरण'],
    ['स्थानीय तह:', palikaName, 'जिल्ला:', districtName, 'आर्थिक वर्ष:', formData.fiscal_year || '२०८२/०८३'],
    [],
    [
      'सि.नं.',
      'परिचयपत्र नं.',
      'लाभग्राहीको नाम, थर',
      'लिङ्ग',
      'वडा नं.',
      'अपाङ्गता प्रकार',
      'परिचयपत्र वर्ग (रङ)',
      'पहिले प्रयोग गरेको थियो?',
      'पहिलेको सामग्री',
      'वितरण गरिएको सहायक सामग्री',
      'नापजाँच गरिएको थियो?',
      'नाप / कैफियत'
    ]
  ];

  if (formData.assistive_device_records && formData.assistive_device_records.length > 0) {
    formData.assistive_device_records.forEach((row, idx) => {
      assistiveData.push([
        idx + 1,
        val(row.id_card_number),
        val(row.beneficiary_name),
        val(row.gender),
        val(row.ward_number),
        val(row.disability_type),
        val(row.id_card_color),
        row.previously_used ? 'हो' : 'होइन',
        val(row.previous_device_name),
        val(row.distributed_device),
        row.measurement_done ? 'हो' : 'होइन',
        val(row.measurement_specs)
      ]);
    });
  } else {
    assistiveData.push(['१', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', 'कुनै विवरण दाखिला भएको छैन']);
  }

  const wsAssistive = XLSX.utils.aoa_to_sheet(assistiveData);
  wsAssistive['!cols'] = [
    { wch: 6 },  // S.N.
    { wch: 14 }, // Card No
    { wch: 25 }, // Name
    { wch: 10 }, // Gender
    { wch: 8 },  // Ward
    { wch: 18 }, // Type
    { wch: 16 }, // Color
    { wch: 12 }, // Prev used
    { wch: 20 }, // Prev device
    { wch: 25 }, // Distributed
    { wch: 12 }, // Measurement
    { wch: 25 }  // Specs
  ];
  XLSX.utils.book_append_sheet(wb, wsAssistive, 'अनुसूचि १.२ सहायक सामग्री');

  // Generate file name and download
  const cleanPalikaName = palikaName.replace(/\s+/g, '_');
  const fileName = `अपाङ्गता_वार्षिक_प्रतिवेदन_${cleanPalikaName}_२०८२_०८३.xlsx`;
  XLSX.writeFile(wb, fileName);
}
