-- ====================================================================
-- KOSHI PROVINCE 14 DISTRICTS & 137 LOCAL GOVERNMENTS SEED SCRIPT
-- Disability Information Center (DIC) - अपाङ्गता सूचना केन्द्र
-- ====================================================================

-- 1. Insert Koshi Province
INSERT INTO provinces (id, name_ne, name_en, code)
VALUES (1, 'कोशी प्रदेश', 'Koshi Province', 'KP')
ON CONFLICT (id) DO UPDATE 
SET name_ne = EXCLUDED.name_ne, name_en = EXCLUDED.name_en, code = EXCLUDED.code;

-- 2. Insert 14 Districts
INSERT INTO districts (id, province_id, name_ne, name_en, code) VALUES
(1, 1, 'ताप्लेजुङ', 'Taplejung', 'TAP'),
(2, 1, 'पाँचथर', 'Panchthar', 'PAN'),
(3, 1, 'इलाम', 'Ilam', 'ILA'),
(4, 1, 'झापा', 'Jhapa', 'JHA'),
(5, 1, 'सङ्खुवासभा', 'Sankhuwasabha', 'SAN'),
(6, 1, 'तेह्रथुम', 'Tehrathum', 'TEH'),
(7, 1, 'भोजपुर', 'Bhojpur', 'BHO'),
(8, 1, 'धनकुटा', 'Dhankuta', 'DHA'),
(9, 1, 'खोटाङ', 'Khotang', 'KHO'),
(10, 1, 'सोलुखुम्बु', 'Solukhumbu', 'SOL'),
(11, 1, 'ओखलढुङ्गा', 'Okhaldhunga', 'OKH'),
(12, 1, 'उदयपुर', 'Udayapur', 'UDA'),
(13, 1, 'मोरङ', 'Morang', 'MOR'),
(14, 1, 'सुनसरी', 'Sunsari', 'SUN')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert 137 Local Governments
-- १. ताप्लेजुङ (९)
INSERT INTO local_governments (district_id, name_ne, name_en, type_ne) VALUES
(1, 'फुङलिङ नगरपालिका', 'Phungling Municipality', 'नगरपालिका'),
(1, 'आठराई त्रिवेणी गाउँपालिका', 'Aathrai Triveni Rural Municipality', 'गाउँपालिका'),
(1, 'फक्ताङलुङ गाउँपालिका', 'Phaktanglung Rural Municipality', 'गाउँपालिका'),
(1, 'मिक्वाखोला गाउँपालिका', 'Mikwakhola Rural Municipality', 'गाउँपालिका'),
(1, 'मेरिङदेन गाउँपालिका', 'Meringden Rural Municipality', 'गाउँपालिका'),
(1, 'मैवाखोला गाउँपालिका', 'Maiwakhola Rural Municipality', 'गाउँपालिका'),
(1, 'पाथीभरा याङवरक गाउँपालिका', 'Pathibhara Yangwarak Rural Municipality', 'गाउँपालिका'),
(1, 'सिदिङ्वा गाउँपालिका', 'Sidingba Rural Municipality', 'गाउँपालिका'),
(1, 'सिरिजङ्घा गाउँपालिका', 'Sirijangha Rural Municipality', 'गाउँपालिका'),

-- २. पाँचथर (८)
(2, 'फिदिम नगरपालिका', 'Phidim Municipality', 'नगरपालिका'),
(2, 'फालेलुङ गाउँपालिका', 'Falelung Rural Municipality', 'गाउँपालिका'),
(2, 'फाल्गुनन्द गाउँपालिका', 'Falgunanda Rural Municipality', 'गाउँपालिका'),
(2, 'हिलिहाङ गाउँपालिका', 'Hilihang Rural Municipality', 'गाउँपालिका'),
(2, 'कुम्मायक गाउँपालिका', 'Kummayak Rural Municipality', 'गाउँपालिका'),
(2, 'मिक्लाजुङ गाउँपालिका', 'Miklajung Rural Municipality', 'गाउँपालिका'),
(2, 'तुम्वेवा गाउँपालिका', 'Tumbewa Rural Municipality', 'गाउँपालिका'),
(2, 'याङवरक गाउँपालिका', 'Yangwarak Rural Municipality', 'गाउँपालिका'),

-- ३. इलाम (१०)
(3, 'इलाम नगरपालिका', 'Ilam Municipality', 'नगरपालिका'),
(3, 'देउमाई नगरपालिका', 'Deumai Municipality', 'नगरपालिका'),
(3, 'माई नगरपालिका', 'Mai Municipality', 'नगरपालिका'),
(3, 'सूर्योदय नगरपालिका', 'Suryodaya Municipality', 'नगरपालिका'),
(3, 'फाकफोकथुम गाउँपालिका', 'Phakphokthum Rural Municipality', 'गाउँपालिका'),
(3, 'माङसेबुङ गाउँपालिका', 'Mangsebung Rural Municipality', 'गाउँपालिका'),
(3, 'चुलाचुली गाउँपालिका', 'Chulachuli Rural Municipality', 'गाउँपालिका'),
(3, 'सन्दकपुर गाउँपालिका', 'Sandakpur Rural Municipality', 'गाउँपालिका'),
(3, 'रोङ गाउँपालिका', 'Rong Rural Municipality', 'गाउँपालिका'),
(3, 'माईजोगमाई गाउँपालिका', 'Maijogmai Rural Municipality', 'गाउँपालिका'),

-- ४. झापा (१५)
(4, 'अर्जुनधारा नगरपालिका', 'Arjundhara Municipality', 'नगरपालिका'),
(4, 'कन्काई नगरपालिका', 'Kankai Municipality', 'नगरपालिका'),
(4, 'गौरादह नगरपालिका', 'Gauradaha Municipality', 'नगरपालिका'),
(4, 'दमक नगरपालिका', 'Damak Municipality', 'नगरपालिका'),
(4, 'बिर्तामोड नगरपालिका', 'Birtamod Municipality', 'नगरपालिका'),
(4, 'भद्रपुर नगरपालिका', 'Bhadrapur Municipality', 'नगरपालिका'),
(4, 'मेचीनगर नगरपालिका', 'Mechinagar Municipality', 'नगरपालिका'),
(4, 'शिवसताक्षी नगरपालिका', 'Shivasataxi Municipality', 'नगरपालिका'),
(4, 'बाह्रदशी गाउँपालिका', 'Barhadashi Rural Municipality', 'गाउँपालिका'),
(4, 'बुद्धशान्ति गाउँपालिका', 'Buddhashanti Rural Municipality', 'गाउँपालिका'),
(4, 'कमल गाउँपालिका', 'Kamal Rural Municipality', 'गाउँपालिका'),
(4, 'गौरीगञ्ज गाउँपालिका', 'Gourigunj Rural Municipality', 'गाउँपालिका'),
(4, 'झापा गाउँपालिका', 'Jhapa Rural Municipality', 'गाउँपालिका'),
(4, 'कचनकवल गाउँपालिका', 'Kachankawal Rural Municipality', 'गाउँपालिका'),
(4, 'हल्दिबारी गाउँपालिका', 'Haldibari Rural Municipality', 'गाउँपालिका'),

-- ५. सङ्खुवासभा (१०)
(5, 'खाँदबारी नगरपालिका', 'Khandbari Municipality', 'नगरपालिका'),
(5, 'चैनपुर नगरपालिका', 'Chainpur Municipality', 'नगरपालिका'),
(5, 'धर्मदेवी नगरपालिका', 'Dharmadevi Municipality', 'नगरपालिका'),
(5, 'मादी नगरपालिका', 'Madi Municipality', 'नगरपालिका'),
(5, 'पाँचखपन नगरपालिका', 'Panchakhapan Municipality', 'नगरपालिका'),
(5, 'सभापोखरी गाउँपालिका', 'Sabhapokhari Rural Municipality', 'गाउँपालिका'),
(5, 'सिलिचोङ गाउँपालिका', 'Silichong Rural Municipality', 'गाउँपालिका'),
(5, 'चिचिला गाउँपालिका', 'Chichila Rural Municipality', 'गाउँपालिका'),
(5, 'मकालु गाउँपालिका', 'Makalu Rural Municipality', 'गाउँपालिका'),
(5, 'भोटखोला गाउँपालिका', 'Bhotkhola Rural Municipality', 'गाउँपालिका'),

-- ६. तेह्रथुम (६)
(6, 'म्याङलुङ नगरपालिका', 'Myanglung Municipality', 'नगरपालिका'),
(6, 'लालीगुराँस नगरपालिका', 'Laligurans Municipality', 'नगरपालिका'),
(6, 'आठराई गाउँपालिका', 'Aathrai Rural Municipality', 'गाउँपालिका'),
(6, 'छथर गाउँपालिका', 'Chhathar Rural Municipality', 'गाउँपालिका'),
(6, 'फेदाप गाउँपालिका', 'Phedap Rural Municipality', 'गाउँपालिका'),
(6, 'मेन्छयायेम गाउँपालिका', 'Menchhyayem Rural Municipality', 'गाउँपालिका'),

-- ७. भोजपुर (९)
(7, 'भोजपुर नगरपालिका', 'Bhojpur Municipality', 'नगरपालिका'),
(7, 'षडानन्द नगरपालिका', 'Shadananda Municipality', 'नगरपालिका'),
(7, 'टेम्केमैयुङ गाउँपालिका', 'Temkemaiyum Rural Municipality', 'गाउँपालिका'),
(7, 'रामप्रसाद राई गाउँपालिका', 'Ramprasad Rai Rural Municipality', 'गाउँपालिका'),
(7, 'अरुण गाउँपालिका', 'Arun Rural Municipality', 'गाउँपालिका'),
(7, 'पौवादुङमा गाउँपालिका', 'Pauwadungma Rural Municipality', 'गाउँपालिका'),
(7, 'साल्पासिलिछो गाउँपालिका', 'Salpasilichho Rural Municipality', 'गाउँपालिका'),
(7, 'आमचोक गाउँपालिका', 'Aamchok Rural Municipality', 'गाउँपालिका'),
(7, 'हतुवागढी गाउँपालिका', 'Hatuwagadhi Rural Municipality', 'गाउँपालिका'),

-- ८. धनकुटा (७)
(8, 'धनकुटा नगरपालिका', 'Dhankuta Municipality', 'नगरपालिका'),
(8, 'पाख्रिबास नगरपालिका', 'Pakhribas Municipality', 'नगरपालिका'),
(8, 'महालक्ष्मी नगरपालिका', 'Mahalaxmi Municipality', 'नगरपालिका'),
(8, 'साँगुरीगढी गाउँपालिका', 'Sangurigadhi Rural Municipality', 'गाउँपालिका'),
(8, 'सहिदभूमि गाउँपालिका', 'Sahidbhumi Rural Municipality', 'गाउँपालिका'),
(8, 'छथर जोरपाटी गाउँपालिका', 'Chhathar Jorpati Rural Municipality', 'गाउँपालिका'),
(8, 'चौबिसे गाउँपालिका', 'Chaubise Rural Municipality', 'गाउँपालिका'),

-- ९. खोटाङ (१०)
(9, 'दिक्तेल रुपाकोट मझुवागढी नगरपालिका', 'Diktel Rupakot Majhuwagadhi Municipality', 'नगरपालिका'),
(9, 'हलेसी तुवाचुङ नगरपालिका', 'Halesi Tuwachung Municipality', 'नगरपालिका'),
(9, 'ऐसेलुखर्क गाउँपालिका', 'Aiselukharak Rural Municipality', 'गाउँपालिका'),
(9, 'रावाबेँसी गाउँपालिका', 'Rawa Besi Rural Municipality', 'गाउँपालिका'),
(9, 'केपिलासगढी गाउँपालिका', 'Kepilasgadhi Rural Municipality', 'गाउँपालिका'),
(9, 'दिप्रुङ चुइचुम्मा गाउँपालिका', 'Diprung Chuichumma Rural Municipality', 'गाउँपालिका'),
(9, 'साकेला गाउँपालिका', 'Sakela Rural Municipality', 'गाउँपालिका'),
(9, 'जन्तेढुङ्गा गाउँपालिका', 'Jantedhunga Rural Municipality', 'गाउँपालिका'),
(9, 'खोटेहाङ गाउँपालिका', 'Khotehang Rural Municipality', 'गाउँपालिका'),
(9, 'बराहपोखरी गाउँपालिका', 'Barahpokhari Rural Municipality', 'गाउँपालिका'),

-- १०. सोलुखुम्बु (८)
(10, 'सोलुदुधकुण्ड नगरपालिका', 'Solududhkunda Municipality', 'नगरपालिका'),
(10, 'खुम्बु पासाङल्हामु गाउँपालिका', 'Khumbu Pasanglhamu Rural Municipality', 'गाउँपालिका'),
(10, 'माप्य दुधकोशी गाउँपालिका', 'Mapya Dudhkoshi Rural Municipality', 'गाउँपालिका'),
(10, 'थुलुङ दूधकोशी गाउँपालिका', 'Thulung Dudhkoshi Rural Municipality', 'गाउँपालिका'),
(10, 'नेचासल्यान गाउँपालिका', 'Nechasalyan Rural Municipality', 'गाउँपालिका'),
(10, 'महाकुलुङ गाउँपालिका', 'Mahakulung Rural Municipality', 'गाउँपालिका'),
(10, 'सोताङ गाउँपालिका', 'Sotang Rural Municipality', 'गाउँपालिका'),
(10, 'लिखुपिके गाउँपालिका', 'Likhupike Rural Municipality', 'गाउँपालिका'),

-- ११. ओखलढुङ्गा (८)
(11, 'सिद्धिचरण नगरपालिका', 'Siddhicharan Municipality', 'नगरपालिका'),
(11, 'खिजिदेम्बा गाउँपालिका', 'Khijidemba Rural Municipality', 'गाउँपालिका'),
(11, 'चिशंखुगढी गाउँपालिका', 'Chisankhugadhi Rural Municipality', 'गाउँपालिका'),
(11, 'मानेभञ्ज्याङ गाउँपालिका', 'Manebhanjyang Rural Municipality', 'गाउँपालिका'),
(11, 'मोलुङ गाउँपालिका', 'Molung Rural Municipality', 'गाउँपालिका'),
(11, 'लिखु गाउँपालिका', 'Likhu Rural Municipality', 'गाउँपालिका'),
(11, 'सुनकोशी गाउँपालिका', 'Sunkoshi Rural Municipality', 'गाउँपालिका'),
(11, 'चम्पादेवी गाउँपालिका', 'Champadevi Rural Municipality', 'गाउँपालिका'),

-- १२. उदयपुर (८)
(12, 'त्रियुगा नगरपालिका', 'Triyuga Municipality', 'नगरपालिका'),
(12, 'कटारी नगरपालिका', 'Katari Municipality', 'नगरपालिका'),
(12, 'चौदण्डीगढी नगरपालिका', 'Chaudandigadhi Municipality', 'नगरपालिका'),
(12, 'बेलका नगरपालिका', 'Belaka Municipality', 'नगरपालिका'),
(12, 'उदयपुरगढी गाउँपालिका', 'Udayapurgadhi Rural Municipality', 'गाउँपालिका'),
(12, 'रौतामाई गाउँपालिका', 'Rautamai Rural Municipality', 'गाउँपालिका'),
(12, 'लिम्चुङबुङ गाउँपालिका', 'Limchungbung Rural Municipality', 'गाउँपालिका'),
(12, 'ताप्ली गाउँपालिका', 'Tapli Rural Municipality', 'गाउँपालिका'),

-- १३. मोरङ (१७)
(13, 'विराटनगर महानगरपालिका', 'Biratnagar Metropolitan City', 'महानगरपालिका'),
(13, 'बेलबारी नगरपालिका', 'Belbari Municipality', 'नगरपालिका'),
(13, 'बूढीगंगा गाउँपालिका', 'Budhiganga Rural Municipality', 'गाउँपालिका'),
(13, 'धनपालथान गाउँपालिका', 'Dhanpalthan Rural Municipality', 'गाउँपालिका'),
(13, 'ग्रामथान गाउँपालिका', 'Gramthan Rural Municipality', 'गाउँपालिका'),
(13, 'जहदा गाउँपालिका', 'Jahada Rural Municipality', 'गाउँपालिका'),
(13, 'कानेपोखरी गाउँपालिका', 'Kanepokhari Rural Municipality', 'गाउँपालिका'),
(13, 'कटहरी गाउँपालिका', 'Katahari Rural Municipality', 'गाउँपालिका'),
(13, 'केराबारी गाउँपालिका', 'Kerabari Rural Municipality', 'गाउँपालिका'),
(13, 'लेटाङ नगरपालिका', 'Letang Municipality', 'नगरपालिका'),
(13, 'मिक्लाजुङ गाउँपालिका', 'Miklajung Rural Municipality', 'गाउँपालिका'),
(13, 'पथरीशनिश्चरे नगरपालिका', 'Pathari Shanishchare Municipality', 'नगरपालिका'),
(13, 'रंगेली नगरपालिका', 'Rangeli Municipality', 'नगरपालिका'),
(13, 'रतुवामाई नगरपालिका', 'Ratuwamai Municipality', 'नगरपालिका'),
(13, 'सुन्दरहरैँचा नगरपालिका', 'Sundarharaicha Municipality', 'नगरपालिका'),
(13, 'सुनवर्षी नगरपालिका', 'Sunwarshi Municipality', 'नगरपालिका'),
(13, 'उर्लाबारी नगरपालिका', 'Urlabari Municipality', 'नगरपालिका'),

-- १४. सुनसरी (१२)
(14, 'धरान उपमहानगरपालिका', 'Dharan Sub-Metropolitan City', 'उपमहानगरपालिका'),
(14, 'इटहरी उपमहानगरपालिका', 'Itahari Sub-Metropolitan City', 'उपमहानगरपालिका'),
(14, 'इनरुवा नगरपालिका', 'Inaruwa Municipality', 'नगरपालिका'),
(14, 'दुहबी नगरपालिका', 'Duhabi Municipality', 'नगरपालिका'),
(14, 'बराहक्षेत्र नगरपालिका', 'Barahachhetra Municipality', 'नगरपालिका'),
(14, 'रामधुनी नगरपालिका', 'Ramdhuni Municipality', 'नगरपालिका'),
(14, 'कोशी गाउँपालिका', 'Koshi Rural Municipality', 'गाउँपालिका'),
(14, 'गढी गाउँपालिका', 'Gadhi Rural Municipality', 'गाउँपालिका'),
(14, 'देवानगञ्ज गाउँपालिका', 'Dewanganj Rural Municipality', 'गाउँपालिका'),
(14, 'बर्जु गाउँपालिका', 'Barju Rural Municipality', 'गाउँपालिका'),
(14, 'भोक्राहा नरसिंह गाउँपालिका', 'Bhokraha Narsingh Rural Municipality', 'गाउँपालिका'),
(14, 'हरिनगर गाउँपालिका', 'Harinagar Rural Municipality', 'गाउँपालिका');
