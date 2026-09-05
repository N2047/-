export interface LocalGovernment {
  id: string;
  name_ne: string;
  name_en: string;
  type: 'महानगरपालिका' | 'उपमहानगरपालिका' | 'नगरपालिका' | 'गाउँपालिका';
  total_wards?: number;
}

export interface District {
  id: string;
  name_ne: string;
  name_en: string;
  local_governments: LocalGovernment[];
}

export const KOSHI_DISTRICTS: District[] = [
  {
    id: "taplejung",
    name_ne: "ताप्लेजुङ",
    name_en: "Taplejung",
    local_governments: [
      { id: "phungling_mun", name_ne: "फुङलिङ नगरपालिका", name_en: "Phungling Municipality", type: "नगरपालिका" },
      { id: "aathraitriveni_rm", name_ne: "आठराई त्रिवेणी गाउँपालिका", name_en: "Aathrai Triveni Rural Municipality", type: "गाउँपालिका" },
      { id: "phaktanglung_rm", name_ne: "फक्ताङलुङ गाउँपालिका", name_en: "Phaktanglung Rural Municipality", type: "गाउँपालिका" },
      { id: "mikwakhola_rm", name_ne: "मिक्वाखोला गाउँपालिका", name_en: "Mikwakhola Rural Municipality", type: "गाउँपालिका" },
      { id: "meringden_rm", name_ne: "मेरिङदेन गाउँपालिका", name_en: "Meringden Rural Municipality", type: "गाउँपालिका" },
      { id: "maiwakhola_rm", name_ne: "मैवाखोला गाउँपालिका", name_en: "Maiwakhola Rural Municipality", type: "गाउँपालिका" },
      { id: "pathibharayangwarak_rm", name_ne: "पाथीभरा याङवरक गाउँपालिका", name_en: "Pathibhara Yangwarak Rural Municipality", type: "गाउँपालिका" },
      { id: "sidingba_rm", name_ne: "सिदिङ्वा गाउँपालिका", name_en: "Sidingba Rural Municipality", type: "गाउँपालिका" },
      { id: "sirijangha_rm", name_ne: "सिरिजङ्घा गाउँपालिका", name_en: "Sirijangha Rural Municipality", type: "गाउँपालिका" }
    ]
  },
  {
    id: "panchthar",
    name_ne: "पाँचथर",
    name_en: "Panchthar",
    local_governments: [
      { id: "phidim_mun", name_ne: "फिदिम नगरपालिका", name_en: "Phidim Municipality", type: "नगरपालिका" },
      { id: "falelung_rm", name_ne: "फालेलुङ गाउँपालिका", name_en: "Falelung Rural Municipality", type: "गाउँपालिका" },
      { id: "falgunanda_rm", name_ne: "फाल्गुनन्द गाउँपालिका", name_en: "Falgunanda Rural Municipality", type: "गाउँपालिका" },
      { id: "hilihang_rm", name_ne: "हिलिहाङ गाउँपालिका", name_en: "Hilihang Rural Municipality", type: "गाउँपालिका" },
      { id: "kummayak_rm", name_ne: "कुम्मायक गाउँपालिका", name_en: "Kummayak Rural Municipality", type: "गाउँपालिका" },
      { id: "miklajung_panchthar_rm", name_ne: "मिक्लाजुङ गाउँपालिका", name_en: "Miklajung Rural Municipality", type: "गाउँपालिका" },
      { id: "tumbewa_rm", name_ne: "तुम्वेवा गाउँपालिका", name_en: "Tumbewa Rural Municipality", type: "गाउँपालिका" },
      { id: "yangwarak_panchthar_rm", name_ne: "याङवरक गाउँपालिका", name_en: "Yangwarak Rural Municipality", type: "गाउँपालिका" }
    ]
  },
  {
    id: "ilam",
    name_ne: "इलाम",
    name_en: "Ilam",
    local_governments: [
      { id: "ilam_mun", name_ne: "इलाम नगरपालिका", name_en: "Ilam Municipality", type: "नगरपालिका" },
      { id: "deumai_mun", name_ne: "देउमाई नगरपालिका", name_en: "Deumai Municipality", type: "नगरपालिका" },
      { id: "mai_mun", name_ne: "माई नगरपालिका", name_en: "Mai Municipality", type: "नगरपालिका" },
      { id: "suryodaya_mun", name_ne: "सूर्योदय नगरपालिका", name_en: "Suryodaya Municipality", type: "नगरपालिका" },
      { id: "phakphokthum_rm", name_ne: "फाकफोकथुम गाउँपालिका", name_en: "Phakphokthum Rural Municipality", type: "गाउँपालिका" },
      { id: "mangsebung_rm", name_ne: "माङसेबुङ गाउँपालिका", name_en: "Mangsebung Rural Municipality", type: "गाउँपालिका" },
      { id: "chulachuli_rm", name_ne: "चुलाचुली गाउँपालिका", name_en: "Chulachuli Rural Municipality", type: "गाउँपालिका" },
      { id: "sandakpur_rm", name_ne: "सन्दकपुर गाउँपालिका", name_en: "Sandakpur Rural Municipality", type: "गाउँपालिका" },
      { id: "rong_rm", name_ne: "रोङ गाउँपालिका", name_en: "Rong Rural Municipality", type: "गाउँपालिका" },
      { id: "maijogmai_rm", name_ne: "माईजोगमाई गाउँपालिका", name_en: "Maijogmai Rural Municipality", type: "गाउँपालिका" }
    ]
  },
  {
    id: "jhapa",
    name_ne: "झापा",
    name_en: "Jhapa",
    local_governments: [
      { id: "arjundhara_mun", name_ne: "अर्जुनधारा नगरपालिका", name_en: "Arjundhara Municipality", type: "नगरपालिका" },
      { id: "kankai_mun", name_ne: "कन्काई नगरपालिका", name_en: "Kankai Municipality", type: "नगरपालिका" },
      { id: "gauradaha_mun", name_ne: "गौरादह नगरपालिका", name_en: "Gauradaha Municipality", type: "नगरपालिका" },
      { id: "damak_mun", name_ne: "दमक नगरपालिका", name_en: "Damak Municipality", type: "नगरपालिका" },
      { id: "birtamod_mun", name_ne: "बिर्तामोड नगरपालिका", name_en: "Birtamod Municipality", type: "नगरपालिका" },
      { id: "bhadrapur_mun", name_ne: "भद्रपुर नगरपालिका", name_en: "Bhadrapur Municipality", type: "नगरपालिका" },
      { id: "mechinagar_mun", name_ne: "मेचीनगर नगरपालिका", name_en: "Mechinagar Municipality", type: "नगरपालिका" },
      { id: "shivasataxi_mun", name_ne: "शिवसताक्षी नगरपालिका", name_en: "Shivasataxi Municipality", type: "नगरपालिका" },
      { id: "barhadashi_rm", name_ne: "बाह्रदशी गाउँपालिका", name_en: "Barhadashi Rural Municipality", type: "गाउँपालिका" },
      { id: "buddhashanti_rm", name_ne: "बुद्धशान्ति गाउँपालिका", name_en: "Buddhashanti Rural Municipality", type: "गाउँपालिका" },
      { id: "kamal_rm", name_ne: "कमल गाउँपालिका", name_en: "Kamal Rural Municipality", type: "गाउँपालिका" },
      { id: "gourigunj_rm", name_ne: "गौरीगञ्ज गाउँपालिका", name_en: "Gourigunj Rural Municipality", type: "गाउँपालिका" },
      { id: "jhapa_rm", name_ne: "झापा गाउँपालिका", name_en: "Jhapa Rural Municipality", type: "गाउँपालिका" },
      { id: "kachankawal_rm", name_ne: "कचनकवल गाउँपालिका", name_en: "Kachankawal Rural Municipality", type: "गाउँपालिका" },
      { id: "haldibari_rm", name_ne: "हल्दिबारी गाउँपालिका", name_en: "Haldibari Rural Municipality", type: "गाउँपालिका" }
    ]
  },
  {
    id: "sankhuwasabha",
    name_ne: "सङ्खुवासभा",
    name_en: "Sankhuwasabha",
    local_governments: [
      { id: "khandbari_mun", name_ne: "खाँदबारी नगरपालिका", name_en: "Khandbari Municipality", type: "नगरपालिका" },
      { id: "chainpur_mun", name_ne: "चैनपुर नगरपालिका", name_en: "Chainpur Municipality", type: "नगरपालिका" },
      { id: "dharmadevi_mun", name_ne: "धर्मदेवी नगरपालिका", name_en: "Dharmadevi Municipality", type: "नगरपालिका" },
      { id: "madi_mun", name_ne: "मादी नगरपालिका", name_en: "Madi Municipality", type: "नगरपालिका" },
      { id: "panchakhapan_mun", name_ne: "पाँचखपन नगरपालिका", name_en: "Panchakhapan Municipality", type: "नगरपालिका" },
      { id: "sabhapokhari_rm", name_ne: "सभापोखरी गाउँपालिका", name_en: "Sabhapokhari Rural Municipality", type: "गाउँपालिका" },
      { id: "silichong_rm", name_ne: "सिलिचोङ गाउँपालिका", name_en: "Silichong Rural Municipality", type: "गाउँपालिका" },
      { id: "chichila_rm", name_ne: "चिचिला गाउँपालिका", name_en: "Chichila Rural Municipality", type: "गाउँपालिका" },
      { id: "makalu_rm", name_ne: "मकालु गाउँपालिका", name_en: "Makalu Rural Municipality", type: "गाउँपालिका" },
      { id: "bhotkhola_rm", name_ne: "भोटखोला गाउँपालिका", name_en: "Bhotkhola Rural Municipality", type: "गाउँपालिका" }
    ]
  },
  {
    id: "tehrathum",
    name_ne: "तेह्रथुम",
    name_en: "Tehrathum",
    local_governments: [
      { id: "myanglung_mun", name_ne: "म्याङलुङ नगरपालिका", name_en: "Myanglung Municipality", type: "नगरपालिका" },
      { id: "laligurans_mun", name_ne: "लालीगुराँस नगरपालिका", name_en: "Laligurans Municipality", type: "नगरपालिका" },
      { id: "aathrai_rm", name_ne: "आठराई गाउँपालिका", name_en: "Aathrai Rural Municipality", type: "गाउँपालिका" },
      { id: "chhathar_rm", name_ne: "छथर गाउँपालिका", name_en: "Chhathar Rural Municipality", type: "गाउँपालिका" },
      { id: "phedap_rm", name_ne: "फेदाप गाउँपालिका", name_en: "Phedap Rural Municipality", type: "गाउँपालिका" },
      { id: "menchhyayem_rm", name_ne: "मेन्छयायेम गाउँपालिका", name_en: "Menchhyayem Rural Municipality", type: "गाउँपालिका" }
    ]
  },
  {
    id: "bhojpur",
    name_ne: "भोजपुर",
    name_en: "Bhojpur",
    local_governments: [
      { id: "bhojpur_mun", name_ne: "भोजपुर नगरपालिका", name_en: "Bhojpur Municipality", type: "नगरपालिका" },
      { id: "shadananda_mun", name_ne: "षडानन्द नगरपालिका", name_en: "Shadananda Municipality", type: "नगरपालिका" },
      { id: "temkemaiyum_rm", name_ne: "टेम्केमैयुङ गाउँपालिका", name_en: "Temkemaiyum Rural Municipality", type: "गाउँपालिका" },
      { id: "ramprasadrai_rm", name_ne: "रामप्रसाद राई गाउँपालिका", name_en: "Ramprasad Rai Rural Municipality", type: "गाउँपालिका" },
      { id: "arun_rm", name_ne: "अरुण गाउँपालिका", name_en: "Arun Rural Municipality", type: "गाउँपालिका" },
      { id: "pauwadungma_rm", name_ne: "पौवादुङमा गाउँपालिका", name_en: "Pauwadungma Rural Municipality", type: "गाउँपालिका" },
      { id: "salpasilichho_rm", name_ne: "साल्पासिलिछो गाउँपालिका", name_en: "Salpasilichho Rural Municipality", type: "गाउँपालिका" },
      { id: "aamchok_rm", name_ne: "आमचोक गाउँपालिका", name_en: "Aamchok Rural Municipality", type: "गाउँपालिका" },
      { id: "hatuwagadhi_rm", name_ne: "हतुवागढी गाउँपालिका", name_en: "Hatuwagadhi Rural Municipality", type: "गाउँपालिका" }
    ]
  },
  {
    id: "dhankuta",
    name_ne: "धनकुटा",
    name_en: "Dhankuta",
    local_governments: [
      { id: "dhankuta_mun", name_ne: "धनकुटा नगरपालिका", name_en: "Dhankuta Municipality", type: "नगरपालिका" },
      { id: "pakhribas_mun", name_ne: "पाख्रिबास नगरपालिका", name_en: "Pakhribas Municipality", type: "नगरपालिका" },
      { id: "mahalaxmi_mun", name_ne: "महालक्ष्मी नगरपालिका", name_en: "Mahalaxmi Municipality", type: "नगरपालिका" },
      { id: "sangurigadhi_rm", name_ne: "साँगुरीगढी गाउँपालिका", name_en: "Sangurigadhi Rural Municipality", type: "गाउँपालिका" },
      { id: "sahidbhumi_rm", name_ne: "सहिदभूमि गाउँपालिका", name_en: "Sahidbhumi Rural Municipality", type: "गाउँपालिका" },
      { id: "chharjorpati_rm", name_ne: "छथर जोरपाटी गाउँपालिका", name_en: "Chhathar Jorpati Rural Municipality", type: "गाउँपालिका" },
      { id: "chaubise_rm", name_ne: "चौबिसे गाउँपालिका", name_en: "Chaubise Rural Municipality", type: "गाउँपालिका" }
    ]
  },
  {
    id: "khotang",
    name_ne: "खोटाङ",
    name_en: "Khotang",
    local_governments: [
      { id: "diktel_mun", name_ne: "दिक्तेल रुपाकोट मझुवागढी नगरपालिका", name_en: "Diktel Rupakot Majhuwagadhi Municipality", type: "नगरपालिका" },
      { id: "halesi_mun", name_ne: "हलेसी तुवाचुङ नगरपालिका", name_en: "Halesi Tuwachung Municipality", type: "नगरपालिका" },
      { id: "aiselukharak_rm", name_ne: "ऐसेलुखर्क गाउँपालिका", name_en: "Aiselukharak Rural Municipality", type: "गाउँपालिका" },
      { id: "rawabesi_rm", name_ne: "रावाबेँसी गाउँपालिका", name_en: "Rawa Besi Rural Municipality", type: "गाउँपालिका" },
      { id: "kepilasgadhi_rm", name_ne: "केपिलासगढी गाउँपालिका", name_en: "Kepilasgadhi Rural Municipality", type: "गाउँपालिका" },
      { id: "diprung_rm", name_ne: "दिप्रुङ चुइचुम्मा गाउँपालिका", name_en: "Diprung Chuichumma Rural Municipality", type: "गाउँपालिका" },
      { id: "sakela_rm", name_ne: "साकेला गाउँपालिका", name_en: "Sakela Rural Municipality", type: "गाउँपालिका" },
      { id: "jantedhunga_rm", name_ne: "जन्तेढुङ्गा गाउँपालिका", name_en: "Jantedhunga Rural Municipality", type: "गाउँपालिका" },
      { id: "khotehang_rm", name_ne: "खोटेहाङ गाउँपालिका", name_en: "Khotehang Rural Municipality", type: "गाउँपालिका" },
      { id: "barahpokhari_rm", name_ne: "बराहपोखरी गाउँपालिका", name_en: "Barahpokhari Rural Municipality", type: "गाउँपालिका" }
    ]
  },
  {
    id: "solukhumbu",
    name_ne: "सोलुखुम्बु",
    name_en: "Solukhumbu",
    local_governments: [
      { id: "solududhkunda_mun", name_ne: "सोलुदुधकुण्ड नगरपालिका", name_en: "Solududhkunda Municipality", type: "नगरपालिका" },
      { id: "khumbupasanglhamu_rm", name_ne: "खुम्बु पासाङल्हामु गाउँपालिका", name_en: "Khumbu Pasanglhamu Rural Municipality", type: "गाउँपालिका" },
      { id: "mapyadudhkoshi_rm", name_ne: "माप्य दुधकोशी गाउँपालिका", name_en: "Mapya Dudhkoshi Rural Municipality", type: "गाउँपालिका" },
      { id: "thulungdudhkoshi_rm", name_ne: "थुलुङ दूधकोशी गाउँपालिका", name_en: "Thulung Dudhkoshi Rural Municipality", type: "गाउँपालिका" },
      { id: "nechasalyan_rm", name_ne: "नेचासल्यान गाउँपालिका", name_en: "Nechasalyan Rural Municipality", type: "गाउँपालिका" },
      { id: "mahakulung_rm", name_ne: "महाकुलुङ गाउँपालिका", name_en: "Mahakulung Rural Municipality", type: "गाउँपालिका" },
      { id: "sotang_rm", name_ne: "सोताङ गाउँपालिका", name_en: "Sotang Rural Municipality", type: "गाउँपालिका" },
      { id: "likhupike_rm", name_ne: "लिखुपिके गाउँपालिका", name_en: "Likhupike Rural Municipality", type: "गाउँपालिका" }
    ]
  },
  {
    id: "okhaldhunga",
    name_ne: "ओखलढुङ्गा",
    name_en: "Okhaldhunga",
    local_governments: [
      { id: "siddhicharan_mun", name_ne: "सिद्धिचरण नगरपालिका", name_en: "Siddhicharan Municipality", type: "नगरपालिका" },
      { id: "khijidemba_rm", name_ne: "खिजिदेम्बा गाउँपालिका", name_en: "Khijidemba Rural Municipality", type: "गाउँपालिका" },
      { id: "chisankhugadhi_rm", name_ne: "चिशंखुगढी गाउँपालिका", name_en: "Chisankhugadhi Rural Municipality", type: "गाउँपालिका" },
      { id: "manebhanjyang_rm", name_ne: "मानेभञ्ज्याङ गाउँपालिका", name_en: "Manebhanjyang Rural Municipality", type: "गाउँपालिका" },
      { id: "molung_rm", name_ne: "मोलुङ गाउँपालिका", name_en: "Molung Rural Municipality", type: "गाउँपालिका" },
      { id: "likhu_okhaldhunga_rm", name_ne: "लिखु गाउँपालिका", name_en: "Likhu Rural Municipality", type: "गाउँपालिका" },
      { id: "sunkoshi_rm", name_ne: "सुनकोशी गाउँपालिका", name_en: "Sunkoshi Rural Municipality", type: "गाउँपालिका" },
      { id: "champadevi_rm", name_ne: "चम्पादेवी गाउँपालिका", name_en: "Champadevi Rural Municipality", type: "गाउँपालिका" }
    ]
  },
  {
    id: "udayapur",
    name_ne: "उदयपुर",
    name_en: "Udayapur",
    local_governments: [
      { id: "triyuga_mun", name_ne: "त्रियुगा नगरपालिका", name_en: "Triyuga Municipality", type: "नगरपालिका" },
      { id: "katari_mun", name_ne: "कटारी नगरपालिका", name_en: "Katari Municipality", type: "नगरपालिका" },
      { id: "chaudandigadhi_mun", name_ne: "चौदण्डीगढी नगरपालिका", name_en: "Chaudandigadhi Municipality", type: "नगरपालिका" },
      { id: "belaka_mun", name_ne: "बेलका नगरपालिका", name_en: "Belaka Municipality", type: "नगरपालिका" },
      { id: "udayapurgadhi_rm", name_ne: "उदयपुरगढी गाउँपालिका", name_en: "Udayapurgadhi Rural Municipality", type: "गाउँपालिका" },
      { id: "rautamai_rm", name_ne: "रौतामाई गाउँपालिका", name_en: "Rautamai Rural Municipality", type: "गाउँपालिका" },
      { id: "limchungbung_rm", name_ne: "लिम्चुङबुङ गाउँपालिका", name_en: "Limchungbung Rural Municipality", type: "गाउँपालिका" },
      { id: "tapli_rm", name_ne: "ताप्ली गाउँपालिका", name_en: "Tapli Rural Municipality", type: "गाउँपालिका" }
    ]
  },
  {
    id: "morang",
    name_ne: "मोरङ",
    name_en: "Morang",
    local_governments: [
      { id: "biratnagar_met", name_ne: "विराटनगर महानगरपालिका", name_en: "Biratnagar Metropolitan City", type: "महानगरपालिका" },
      { id: "belbari_mun", name_ne: "बेलबारी नगरपालिका", name_en: "Belbari Municipality", type: "नगरपालिका" },
      { id: "budhiganga_rm", name_ne: "बूढीगंगा गाउँपालिका", name_en: "Budhiganga Rural Municipality", type: "गाउँपालिका" },
      { id: "dhanpalthan_rm", name_ne: "धनपालथान गाउँपालिका", name_en: "Dhanpalthan Rural Municipality", type: "गाउँपालिका" },
      { id: "gramthan_rm", name_ne: "ग्रामथान गाउँपालिका", name_en: "Gramthan Rural Municipality", type: "गाउँपालिका" },
      { id: "jahada_rm", name_ne: "जहदा गाउँपालिका", name_en: "Jahada Rural Municipality", type: "गाउँपालिका" },
      { id: "kanepokhari_rm", name_ne: "कानेपोखरी गाउँपालिका", name_en: "Kanepokhari Rural Municipality", type: "गाउँपालिका" },
      { id: "katahari_rm", name_ne: "कटहरी गाउँपालिका", name_en: "Katahari Rural Municipality", type: "गाउँपालिका" },
      { id: "kerabari_rm", name_ne: "केराबारी गाउँपालिका", name_en: "Kerabari Rural Municipality", type: "गाउँपालिका" },
      { id: "letang_mun", name_ne: "लेटाङ नगरपालिका", name_en: "Letang Municipality", type: "नगरपालिका" },
      { id: "miklajung_morang_rm", name_ne: "मिक्लाजुङ गाउँपालिका", name_en: "Miklajung Rural Municipality", type: "गाउँपालिका" },
      { id: "patharishanishchare_mun", name_ne: "पथरीशनिश्चरे नगरपालिका", name_en: "Pathari Shanishchare Municipality", type: "नगरपालिका" },
      { id: "rangeli_mun", name_ne: "रंगेली नगरपालिका", name_en: "Rangeli Municipality", type: "नगरपालिका" },
      { id: "ratuwamai_mun", name_ne: "रतुवामाई नगरपालिका", name_en: "Ratuwamai Municipality", type: "नगरपालिका" },
      { id: "sundarharaicha_mun", name_ne: "सुन्दरहरैँचा नगरपालिका", name_en: "Sundarharaicha Municipality", type: "नगरपालिका" },
      { id: "sunwarshi_mun", name_ne: "सुनवर्षी नगरपालिका", name_en: "Sunwarshi Municipality", type: "नगरपालिका" },
      { id: "urlabari_mun", name_ne: "उर्लाबारी नगरपालिका", name_en: "Urlabari Municipality", type: "नगरपालिका" }
    ]
  },
  {
    id: "sunsari",
    name_ne: "सुनसरी",
    name_en: "Sunsari",
    local_governments: [
      { id: "dharan_submet", name_ne: "धरान उपमहानगरपालिका", name_en: "Dharan Sub-Metropolitan City", type: "उपमहानगरपालिका" },
      { id: "itahari_submet", name_ne: "इटहरी उपमहानगरपालिका", name_en: "Itahari Sub-Metropolitan City", type: "उपमहानगरपालिका" },
      { id: "inaruwa_mun", name_ne: "इनरुवा नगरपालिका", name_en: "Inaruwa Municipality", type: "नगरपालिका" },
      { id: "duhabi_mun", name_ne: "दुहबी नगरपालिका", name_en: "Duhabi Municipality", type: "नगरपालिका" },
      { id: "barahachhetra_mun", name_ne: "बराहक्षेत्र नगरपालिका", name_en: "Barahachhetra Municipality", type: "नगरपालिका" },
      { id: "ramdhuni_mun", name_ne: "रामधुनी नगरपालिका", name_en: "Ramdhuni Municipality", type: "नगरपालिका" },
      { id: "koshi_rm", name_ne: "कोशी गाउँपालिका", name_en: "Koshi Rural Municipality", type: "गाउँपालिका" },
      { id: "gadhi_rm", name_ne: "गढी गाउँपालिका", name_en: "Gadhi Rural Municipality", type: "गाउँपालिका" },
      { id: "dewanganj_rm", name_ne: "देवानगञ्ज गाउँपालिका", name_en: "Dewanganj Rural Municipality", type: "गाउँपालिका" },
      { id: "barju_rm", name_ne: "बर्जु गाउँपालिका", name_en: "Barju Rural Municipality", type: "गाउँपालिका" },
      { id: "bhokrahanarsingh_rm", name_ne: "भोक्राहा नरसिंह गाउँपालिका", name_en: "Bhokraha Narsingh Rural Municipality", type: "गाउँपालिका" },
      { id: "harinagar_rm", name_ne: "हरिनगर गाउँपालिका", name_en: "Harinagar Rural Municipality", type: "गाउँपालिका" }
    ]
  }
];

export const TOTAL_KOSHI_PALIKAS = KOSHI_DISTRICTS.reduce((sum, d) => sum + d.local_governments.length, 0); // 137

export function findPalikaById(id: string) {
  for (const d of KOSHI_DISTRICTS) {
    const found = d.local_governments.find((p) => p.id === id);
    if (found) {
      return { palika: found, district: d };
    }
  }
  return null;
}

export function getAllPalikas() {
  const list = [];
  for (const d of KOSHI_DISTRICTS) {
    for (const p of d.local_governments) {
      list.push({
        ...p,
        districtId: d.id,
        districtName_ne: d.name_ne,
        districtName_en: d.name_en,
      });
    }
  }
  return list;
}
