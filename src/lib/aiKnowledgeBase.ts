import { LEGAL_DOCUMENTS, LAW_CATEGORIES, LawDocument } from "./lawsData";
import { KOSHI_DISTRICTS, findPalikaById } from "./koshiGeography";
import { DEFAULT_PROVINCE_CONTACTS } from "./contactService";

export type KnowledgeCategory = 
  | "law" 
  | "news" 
  | "report" 
  | "palika" 
  | "form" 
  | "contact" 
  | "guideline";

export interface KnowledgeItem {
  id: string;
  title: string;
  titleEn?: string;
  category: KnowledgeCategory;
  categoryLabel: string;
  summary: string;
  content: string;
  keywords: string[];
  sourceUrl: string;
  metadata?: Record<string, string | number | boolean | undefined>;
}

// 1. STATIC NEWS DATA
export const KNOWLEDGE_NEWS_ARTICLES = [
  {
    id: "news-01",
    title: "आर्थिक वर्ष २०८२/०८३ को अपाङ्गता सहायता सहजकर्ता वार्षिक प्रतिवेदन प्रविष्टि खुला",
    titleEn: "Annual Report Entry Open for Fiscal Year 2082/083",
    dateBs: "२०८२/०५/१५",
    summary: "कोशी प्रदेशका १४ वटै जिल्लाका १३७ स्थानीय तहका अपाङ्गता सहायता सहजकर्ताहरूलाई वार्षिक कार्यसम्पादन तथा प्रगति प्रतिवेदन अनलाइन प्रणाली मार्फत प्रविष्टि गर्न अनुरोध गरिएको छ।",
    content: "कोशी प्रदेश सामाजिक विकास मन्त्रालय तथा अपाङ्गता सूचना केन्द्र (DIC) को संयुक्त आयोजनामा आर्थिक वर्ष २०८२/०८३ को वार्षिक प्रतिवेदन संकलन कार्य सुरु भएको छ। सम्पूर्ण स्थानीय तहका सहजकर्ताहरूले आफ्नो पालिकाको प्रोफाइलमा गई ४४ वटा प्रश्न तथा अनुसूची १.१ (गृहभेट) र १.२ (सहायक सामग्री) अनिवार्य रूपमा भर्नुहुन सूचित गरिन्छ।",
    keywords: ["वार्षिक प्रतिवेदन", "२०८२/०८३", "१३७ स्थानीय तह", "सहजकर्ता", "अनुसूची १.१", "अनुसूची १.२", "प्रविष्टि"],
    sourceUrl: "/news",
  },
  {
    id: "news-02",
    title: "कोशी प्रदेशका ५० स्थानीय तहमा निशुल्क सहायक सामग्री वितरण शिविर सम्पन्न",
    titleEn: "Free Assistive Device Distribution Camps Concluded Across 50 Local Governments",
    dateBs: "२०८२/०४/२८",
    summary: "झापा, मोरङ, सुनसरी र पाँचथर लगायतका जिल्लाहरूमा १,२०० भन्दा बढी अपाङ्गता भएका व्यक्तिहरूलाई ह्वीलचेयर, सेतो छडी र श्रवण यन्त्र वितरण गरिएको छ।",
    content: "स्थानीय तहको बजेट तथा दातृ निकायहरूको सहकार्यमा विपन्न तथा ग्रामीण क्षेत्रका अपाङ्गता भएका नागरिकहरूलाई लक्षित गरी शिविर सञ्चालन गरिएको थियो। शिविरमा नापजाँच गरी आवश्यकता अनुसार आधुनिक सहायक सामग्री उपलब्ध गराइएको छ।",
    keywords: ["सहायक सामग्री", "ह्वीलचेयर", "शिविर", "सेतो छडी", "श्रवण यन्त्र", "झापा", "मोरङ", "सुनसरी"],
    sourceUrl: "/news",
  },
  {
    id: "news-03",
    title: "स्थानीय तह अपाङ्गता समन्वय समिति सुदृढीकरण तथा अभिमुखीकरण कार्यक्रम",
    titleEn: "Local Government Disability Coordination Committee Orientation",
    dateBs: "२०८२/०३/१०",
    summary: "कोशी प्रदेशका ४६ नगरपालिका र ८८ गाउँपालिकाका उपप्रमुख तथा अध्यक्षहरूको सहभागितामा समन्वय समिति प्रभावकारिता सम्बन्धी कार्यशाला सम्पन्न।",
    content: "अपाङ्गता अधिकार ऐन २०७४ बमोजिम स्थानीय तहमा उपाध्यक्ष/उपप्रमुखको संयोजकत्वमा गठित स्थानीय समन्वय समितिलाई थप सक्रिय बनाउन, परिचयपत्र वितरण पारदर्शी बनाउन र बजेट विनियोजन बढाउन मन्त्रालयले मार्गदर्शन जारी गरेको छ।",
    keywords: ["समन्वय समिति", "उपप्रमुख", "उपाध्यक्ष", "परिचयपत्र", "बजेट", "मार्गदर्शन"],
    sourceUrl: "/news",
  },
  {
    id: "news-04",
    title: "अपाङ्गता परिचयपत्र वितरण कार्यविधि २०८२ स्वीकृत",
    titleEn: "Disability Identity Card Distribution Procedure 2082 Approved",
    dateBs: "२०८२/०२/१८",
    summary: "नयाँ कार्यविधिले रातो, निलो, पहेँलो र सेतो परिचयपत्र वितरण प्रक्रियालाई थप वैज्ञानिक र पहुँचयोग्य बनाएको छ।",
    content: "नेपाल सरकार तथा कोशी प्रदेश सामाजिक विकास मन्त्रालयको समन्वयमा नयाँ कार्यविधि स्वीकृत भएको छ। अब चिकित्सकको सिफारिस र स्थानीय समन्वय समितिको निर्णय पश्चात डिजिटल अभिलेखीकरण गरी परिचयपत्र जारी गरिनेछ।",
    keywords: ["परिचयपत्र कार्यविधि", "रातो कार्ड", "निलो कार्ड", "पहेँलो कार्ड", "सेतो कार्ड", "डिजिटल परिचयपत्र"],
    sourceUrl: "/news",
  }
];

// 2. STATISTICAL REPORTS KNOWLEDGE
export const KNOWLEDGE_REPORTS = [
  {
    id: "report-overall",
    title: "कोशी प्रदेश समग्र अपाङ्गता वस्तुस्थिति प्रतिवेदन (Overall Status)",
    titleEn: "Koshi Province Overall Disability Status Report",
    summary: "कोशी प्रदेशका १४ जिल्ला र १३७ स्थानीय तहमा कुल ३२,४५० अपाङ्गता भएका व्यक्तिहरूको पहिचान र प्रोफाइल सम्पन्न भएको छ।",
    content: `कोशी प्रदेशको समग्र तथ्याङ्क:
- कुल पहिचान भएका व्यक्तिहरू: ३२,४५० जना (पुरुष: १८,२४०, महिला: १४,२१०)
- स्थानीय तह कभरेज: १००% (१ महानगरपालिका, २ उपमहानगरपालिका, ४६ नगरपालिका, ८८ गाउँपालिका गरी १३७ वटै स्थानीय तह)
- सक्रिय सहजकर्ता परिचालन दर: ९७.४%
- कुल वडा संख्या: १,१५७ वटा
- प्रमुख जिल्लाहरू: मोरङ (५,८९०), झापा (५,४२०), सुनसरी (४,७३०) मा सबैभन्दा धेरै संख्या।
- सबैभन्दा बढी शारीरिक अपाङ्गता (३६.४%), दृष्टिविहीन तथा न्यूनदृष्टि (१८.२%), र बहिरा/सुस्त श्रवण (१४.६%) रहेका छन्।`,
    keywords: ["समग्र तथ्याङ्क", "३२,४५०", "१४ जिल्ला", "१३७ स्थानीय तह", "कोशी प्रदेश", "कभरेज", "जनसांख्यिकी"],
    sourceUrl: "/reports",
  },
  {
    id: "report-services",
    title: "सेवासुविधा तथा स्वास्थ्य पुनर्स्थापना प्रतिवेदन (Services & Rehabilitation)",
    titleEn: "Services, Rehabilitation, and Health Insurance Report",
    summary: "आर्थिक वर्षमा कुल २२,८६० जना अपाङ्गता भएका नागरिकहरूले परामर्श, थेरापी, उपचार तथा स्वास्थ्य बीमा सुविधा प्राप्त गरेका छन्।",
    content: `सेवासुविधा प्रवाह विवरण:
- मनोसामाजिक तथा व्यक्तिगत परामर्श सेवा: ६,५४० जना
- फिजियोथेरापी तथा पुनर्स्थापना सेवा: ३,८९० जना
- निःशुल्क स्वास्थ्य बीमा आबद्धता: ४,१२० जना (रातो र निलो कार्ड वाहकहरूलाई पूर्ण निःशुल्क)
- विशेषज्ञ स्वास्थ्य शिविर लाभान्वित: ५,३७० जना
- सहायक सामग्री प्राप्तकर्ता: २,९४० जना
- सेवा प्रवाहमा कोशी प्रदेशका ८६ स्थानीय तहमा नियमित फिजियोथेरापी डेस्क स्थापना भएको छ।`,
    keywords: ["सेवासुविधा", "परामर्श", "फिजियोथेरापी", "स्वास्थ्य बीमा", "पुनर्स्थापना", "शिविर", "२२,८६०"],
    sourceUrl: "/reports",
  },
  {
    id: "report-social-security",
    title: "सामाजिक सुरक्षा भत्ता तथा परिचयपत्र वितरण प्रतिवेदन (Social Security & ID Cards)",
    titleEn: "Social Security Allowance and Card Classification Report",
    summary: "कोशी प्रदेशमा १३,९७० जनाले मासिक सामाजिक सुरक्षा भत्ता प्राप्त गरिरहेका छन् र ३२,४५० जनालाई चार प्रकारका कार्ड वितरण गरिएको छ।",
    content: `सामाजिक सुरक्षा तथा कार्ड विवरण:
- 'क' वर्ग (रातो कार्ड - पूर्ण अशक्त): ६,४३० जना (मासिक भत्ता रु. ३,९९०)
- 'ख' वर्ग (निलो कार्ड - अति अशक्त): ७,५४० जना (मासिक भत्ता रु. २,१२८)
- 'ग' वर्ग (पहेँलो कार्ड - मध्यम अपाङ्गता): ११,२१० जना (आरक्षण, भन्सार छुट तथा निःशुल्क शिक्षा/स्वास्थ्य सुविधा)
- 'घ' वर्ग (सेतो कार्ड - सामान्य अपाङ्गता): ७,२७० जना (सहुलियत तथा परिचय)
- कुल मासिक भत्ता प्राप्तकर्ता: १३,९७० जना (रातो + निलो कार्ड वाहक)
- भत्ता वितरण स्थानीय तहका बैंक खाता मार्फत प्रत्यक्ष रूपमा भुक्तानी हुन्छ।`,
    keywords: ["सामाजिक सुरक्षा भत्ता", "रातो कार्ड", "निलो कार्ड", "पहेँलो कार्ड", "सेतो कार्ड", "मासिक भत्ता", "३,९९०", "२,१२८", "परिचयपत्र"],
    sourceUrl: "/reports",
  },
  {
    id: "report-employment",
    title: "रोजगार, सीप विकास तथा बिउपुँजी प्रतिवेदन (Employment & Livelihoods)",
    titleEn: "Employment, Vocational Training, and Seed Capital Report",
    summary: "२,७६० जना अपाङ्गता भएका व्यक्तिहरू रोजगारी तथा स्वरोजगारमा आबद्ध छन् र रु. १.८ करोड बिउपुँजी परिचालन भएको छ।",
    content: `रोजगार तथा उद्यमशीलता तथ्याङ्क:
- रोजगारी तथा स्वरोजगारमा संलग्न: २,७६० जना
- व्यवसायिक तथा प्राविधिक सीप तालिम प्राप्त: १,३४० जना (कम्प्युटर, सिलाई-कटाई, मोबाइल मर्मत, कृषि, बेतबाँस)
- सक्रिय अपाङ्गता आत्मनिर्भर समूह: ८४ वटा
- स्थानीय तह तथा साझेदारद्वारा परिचालन बिउपुँजी: रु. १ करोड ८२ लाख
- सरकारी तथा निजी क्षेत्रको ५% आरक्षण कार्यान्वयन अनुगमन तीव्र पारिएको छ।`,
    keywords: ["रोजगार", "सीप तालिम", "बिउपुँजी", "उद्यमशीलता", "समूह", "आरक्षण"],
    sourceUrl: "/reports",
  },
  {
    id: "report-education",
    title: "शिक्षा, छात्रवृत्ति तथा बाल अधिकार प्रतिवेदन (Education & Children)",
    titleEn: "Education, Scholarships, and Child Rights Report",
    summary: "४,१२० जना बालबालिका तथा विद्यार्थीहरू विद्यालयमा अध्ययनरत छन्, जसमध्ये ३,२१० जनाले छात्रवृत्ति पाएका छन्।",
    content: `शिक्षा तथा बालबालिका सम्बन्धी स्थिति:
- विद्यालयमा अध्ययनरत अपाङ्गता भएका बालबालिका: ४,१२० जना
- नियमित छात्रवृत्ति प्राप्त विद्यार्थी: ३,२१० जना
- घरमै आधारित शिक्षा तथा विशेष शिक्षक सहयोग: ३४० जना बालबालिका
- समावेशी बाल क्लब गठन भएका विद्यालय: १४२ वटा
- ब्रेल पाठ्यपुस्तक तथा साङ्केतिक भाषा शिक्षक व्यवस्था भएका विद्यालय संख्या: ६८ वटा।`,
    keywords: ["शिक्षा", "छात्रवृत्ति", "बालबालिका", "विद्यालय", "घरमै शिक्षा", "बाल क्लब", "ब्रेल"],
    sourceUrl: "/reports",
  },
  {
    id: "report-home-visits",
    title: "गृहभेट सेवा तथा प्रत्यक्ष पहुँच प्रतिवेदन (Home Visits - Schedule 1.1)",
    titleEn: "Home Visits and Field Assessment Report",
    summary: "सहजकर्ताहरूले हालसम्म ८,४२० वटा घरधुरीमा पुगी प्रत्यक्ष अवस्था मूल्यांकन, फारम प्रविष्टि तथा परामर्श सेवा प्रदान गरेका छन्।",
    content: `गृहभेट (Home Visit) तथ्याङ्क:
- कुल सम्पन्न गृहभेट संख्या: ८,४२० पटक
- प्राथमिक पहिचान तथा कागजात संकलन: ४,१२० जना
- अशक्त व्यक्तिको घरमै पुगी परिचयपत्र सिफारिस: १,८५० जना
- नियमित फलोअप तथा परामर्श: २,३१० परिवार
- स्थानीय तह वार्षिक प्रतिवेदनको 'अनुसूची १.१' मा प्रत्येक सहजकर्ताले गृहभेटको मिति, व्यक्तिको नाम, अपाङ्गताको प्रकार, वडा नं र सेवाको प्रकृति अभिलेख राख्नु अनिवार्य छ।`,
    keywords: ["गृहभेट", "अनुसूची १.१", "८,४२०", "सहजकर्ता", "परामर्श", "घरदैलो", "फलोअप"],
    sourceUrl: "/reports",
  },
  {
    id: "report-assistive-devices",
    title: "सहायक सामग्री वितरण प्रतिवेदन (Assistive Devices - Schedule 1.2)",
    titleEn: "Assistive Devices Distribution Report",
    summary: "कोशी प्रदेशका १३७ पालिकामा कुल २,९४० थान आधुनिक सहायक सामग्री निःशुल्क वितरण गरिएको छ।",
    content: `सहायक सामग्री वितरण विवरण:
- कुल वितरित सामग्री: २,९४० थान
- ह्वीलचेयर (मानक तथा सीपी चेयर): ९८० थान
- सेतो छडी (दृष्टिविहीनका लागि): ७२० थान
- डिजिटल श्रवण यन्त्र (Hearing Aids): ५४० थान
- वैशाखी तथा वाकर: ४२० थान
- ट्राइसाइकल: १८० थान
- ब्रेल स्लेट/स्टाइलस: १०० सेट
- स्थानीय तह वार्षिक प्रतिवेदनको 'अनुसूची १.२' मा सामग्रीको नाम, प्राप्तकर्ताको परिचयपत्र नम्बर, फोन र वितरण मिति अनिवार्य प्रविष्टि गरिन्छ।`,
    keywords: ["सहायक सामग्री", "अनुसूची १.२", "ह्वीलचेयर", "सेतो छडी", "श्रवण यन्त्र", "वैशाखी", "२,९४० थान"],
    sourceUrl: "/reports",
  },
  {
    id: "report-demographics",
    title: "१० प्रकारका अपाङ्गता तथा कार्ड रंग विश्लेषण प्रतिवेदन (10 Types & Severity)",
    titleEn: "Demographics, 10 Disability Types, and Card Severity Analysis",
    summary: "नेपालको ऐन अनुसार १० वटै प्रकारका अपाङ्गताको विस्तृत वर्गीकरण र परिचयपत्र गाम्भीर्यताको प्रदेशगत अनुपात।",
    content: `१० प्रकारगत विवरण:
१. शारीरिक अपाङ्गता: ११,८१० जना (३६.४%)
२. दृष्टिविहीन तथा न्यून दृष्टि: ५,९१० जना (१८.२%)
३. बहिरा तथा सुस्त श्रवण: ४,७४० जना (१४.६%)
४. स्वर र बोलाइ सम्बन्धी: २,११० जना (६.५%)
५. मानसिक वा मनोसामाजिक: २,६५० जना (८.२%)
६. बौद्धिक अपाङ्गता: १,९५० जना (६.०%)
७. बहुअपाङ्गता: १,८२० जना (५.६%)
८. अटिजम: ६४० जना (२.०%)
९. अनुवंशीय रक्तश्राव (हेमोफिलिया): ३८० जना (१.२%)
१०. श्रवण-दृष्टिविहीन (Deafblindness): ४४० जना (१.४%)`,
    keywords: ["१० प्रकार", "शारीरिक", "दृष्टिविहीन", "बहिरा", "मनोसामाजिक", "बौद्धिक", "अटिजम", "हेमोफिलिया", "श्रवण-दृष्टिविहीन"],
    sourceUrl: "/reports",
  },
  {
    id: "report-budget",
    title: "स्थानीय तह बजेट, सुशासन तथा समन्वय समिति प्रतिवेदन (Budget & Governance)",
    titleEn: "Local Budget Allocation, Governance, and Committees Report",
    summary: "कोशी प्रदेशका १३७ स्थानीय तहले अपाङ्गता क्षेत्रमा रु. १६.४ करोड बजेट विनियोजन गरी ८१.२% वित्तीय प्रगति हासिल गरेका छन्।",
    content: `बजेट तथा सुशासन स्थिति:
- कुल विनियोजित बजेट: रु. १६ करोड ४० लाख
- खर्च भएको रकम: रु. १३ करोड ३१ लाख (८१.२%)
- स्थानीय अपाङ्गता समन्वय समिति गठन भएका पालिका: १३७ (१००%)
- अपाङ्गता सहायता सहजकर्ता पदस्थापन भएका पालिका: १३३ (९७%)
- स्थानीय तह नीति/कार्यविधि निर्माण गरेका पालिका: ७८ पालिका
- स्थानीय DPO/अपाङ्गता संस्था साझेदारी अनुदान: रु. २.४ करोड`,
    keywords: ["बजेट", "१६.४ करोड", "सुशासन", "समन्वय समिति", "खर्च", "सहजकर्ता पदस्थापन"],
    sourceUrl: "/reports",
  }
];

// 3. ANNUAL REPORTING FORM STRUCTURE
export const KNOWLEDGE_FORM_STRUCTURE = [
  {
    id: "form-guidance",
    title: "स्थानीय तह अपाङ्गता सहायता सहजकर्ता वार्षिक प्रतिवेदन फारम (४४ प्रश्न र अनुसूचीहरू)",
    titleEn: "Annual Reporting Form Guide (44 Questions and Schedules)",
    summary: "स्थानीय तहका सहजकर्ताहरूले आर्थिक वर्षको अन्त्यमा भर्नुपर्ने राष्ट्रिय ढाँचाको वार्षिक प्रतिवेदन फारम निर्देशिका।",
    content: `वार्षिक प्रतिवेदन फारम संरचना:
खण्ड १: सामान्य विवरण (Q1 देखि Q9) - पालिकाको नाम, सहजकर्ता विवरण, जनसांख्यिकी, कार्ड वितरण संख्या।
खण्ड २: सेवा प्रवाह (Q10 देखि Q13) - परामर्श, थेरापी, गृहभेट र सहायक सामग्री वितरण विवरण।
खण्ड ३: शिक्षा र बालबालिका (Q14 देखि Q20) - विद्यालय भर्ना, छात्रवृत्ति, घरमै शिक्षा र बाल क्लब।
खण्ड ४: तालिम र उद्यम (Q21 देखि Q23) - सीप तालिम, रोजगारी, स्वरोजगार र बजार सहजीकरण।
खण्ड ५: सामाजिक सुरक्षा (Q24 देखि Q27) - भत्ता प्राप्त संख्या, रातो र निलो कार्ड वितरण र बैंक भुक्तानी।
खण्ड ६: समूह र बिउपुँजी (Q28 देखि Q29) - मिलिजुली समूह, बचत तथा ऋण र बिउपुँजी परिचालन।
खण्ड ७: संस्थागत र बजेट (Q30 देखि Q33) - OPD सेवा, पालिका बजेट, स्वास्थ्य बीमा र भवन पहुँचयुक्तता।
खण्ड ८: १० प्रकारगत वर्गीकरण (Q34) - १० वटै प्रकारका अपाङ्गता अनुसार पुरुष/महिला/अन्यको तालिका।
खण्ड ९: कार्ड रंग र गाम्भीर्यता (Q35) - रातो, निलो, पहेँलो र सेतो कार्डको लिङ्गगत संख्या।
खण्ड १०: नीति र प्रबन्ध (Q36 देखि Q44) - कानुनी सहायता, कार्यविधि निर्माण, बैठक संख्या, कार्यकक्ष र गुनासो।
अनुसूची १.१: गृहभेट विवरण तालिका (१० स्तम्भ) - घरदैलो पुगेको मिति, व्यक्तिको नाम, उमेर, समस्या र प्रदान गरिएको सेवा।
अनुसूची १.२: सहायक सामग्री वितरण तालिका (१२ स्तम्भ) - वितरित सामग्री, प्राप्तकर्ता विवरण, वितरण मिति र स्रोत।
समीक्षा र पेश: फारम सबमिट गर्ने र ३ वटै पाना भएको Excel (.xlsx) वा PDF डाउनलोड गर्ने सुविधा।`,
    keywords: ["वार्षिक प्रतिवेदन", "४४ प्रश्न", "अनुसूची १.१", "अनुसूची १.२", "फारम", "सहजकर्ता प्रतिवेदन", "एक्सेल डाउनलोड"],
    sourceUrl: "/local-reporting",
  }
];

// Helper: Convert all documents, geography, reports into indexed Knowledge items
let _cachedKnowledgeBase: KnowledgeItem[] | null = null;

export function getAllKnowledgeItems(): KnowledgeItem[] {
  if (_cachedKnowledgeBase) return _cachedKnowledgeBase;

  const items: KnowledgeItem[] = [];

  // 1. Legal Documents
  LEGAL_DOCUMENTS.forEach((doc) => {
    items.push({
      id: doc.id,
      title: doc.title_ne,
      titleEn: doc.title_en,
      category: "law",
      categoryLabel: doc.category_name_ne || "कानुन/ऐन",
      summary: doc.description_ne,
      content: `${doc.title_ne} (${doc.title_en}):
- प्रकार: ${doc.category_name_ne} (${doc.gov_level === 'federal' ? 'संघीय' : doc.province_name_ne || 'प्रादेशिक'})
- जारी गर्ने निकाय: ${doc.issuing_authority}
- प्रकाशन मिति: ${doc.publication_date_bs} (लागु: ${doc.effective_date_bs})
${doc.is_amended ? `- संशोधन मिति: ${doc.amendment_date_bs}` : ''}
- मुख्य व्यवस्था: ${doc.description_ne}
- मुख्य शब्दहरू: ${doc.keywords.join(", ")}`,
      keywords: [...doc.keywords, doc.title_ne, doc.title_en, doc.category_name_ne, doc.issuing_authority],
      sourceUrl: `/laws#${doc.id}`,
      metadata: {
        category: doc.category,
        gov_level: doc.gov_level,
        publication_date: doc.publication_date_bs
      }
    });
  });

  // 2. News Articles
  KNOWLEDGE_NEWS_ARTICLES.forEach((news) => {
    items.push({
      id: news.id,
      title: news.title,
      titleEn: news.titleEn,
      category: "news",
      categoryLabel: "समाचार/परिपत्र",
      summary: news.summary,
      content: `${news.title} (${news.dateBs}):\n${news.content}\nसारांश: ${news.summary}`,
      keywords: [...news.keywords, news.title, news.dateBs],
      sourceUrl: news.sourceUrl,
      metadata: { dateBs: news.dateBs }
    });
  });

  // 3. Statistical Reports
  KNOWLEDGE_REPORTS.forEach((rep) => {
    items.push({
      id: rep.id,
      title: rep.title,
      titleEn: rep.titleEn,
      category: "report",
      categoryLabel: "तथ्याङ्क प्रतिवेदन",
      summary: rep.summary,
      content: `${rep.title}:\n${rep.content}`,
      keywords: [...rep.keywords, rep.title, rep.titleEn || ""],
      sourceUrl: rep.sourceUrl,
    });
  });

  // 4. Form Guidelines
  KNOWLEDGE_FORM_STRUCTURE.forEach((form) => {
    items.push({
      id: form.id,
      title: form.title,
      titleEn: form.titleEn,
      category: "form",
      categoryLabel: "वार्षिक प्रतिवेदन फारम",
      summary: form.summary,
      content: `${form.title}:\n${form.content}`,
      keywords: [...form.keywords, form.title, "वार्षिक प्रतिवेदन"],
      sourceUrl: form.sourceUrl,
    });
  });

  // 5. Districts & Palikas Information (Summarized by district and major palikas)
  KOSHI_DISTRICTS.forEach((district) => {
    const palikaNames = district.local_governments.map(p => `${p.name_ne} (${p.type})`).join(", ");
    items.push({
      id: `district-${district.id}`,
      title: `${district.name_ne} जिल्ला (${district.name_en}) - स्थानीय तह विवरण`,
      titleEn: `${district.name_en} District Disability & Palika Profile`,
      category: "palika",
      categoryLabel: "जिल्ला तथा पालिका",
      summary: `${district.name_ne} जिल्लामा कुल ${district.local_governments.length} स्थानीय तहहरू रहेका छन्।`,
      content: `${district.name_ne} जिल्ला प्रोफाइल:
- सदरमुकाम/जिल्ला: ${district.name_ne} (${district.name_en})
- स्थानीय तह संख्या: ${district.local_governments.length} वटा
- स्थानीय तहहरूको नामावली: ${palikaNames}
- सबै पालिकाहरूमा अपाङ्गता सहायता सहजकर्ता तथा स्थानीय समन्वय समिति गठन भई सेवा प्रवाह तथा वार्षिक प्रतिवेदन प्रविष्टि कार्य भइरहेको छ।`,
      keywords: [district.name_ne, district.name_en, "जिल्ला", ...district.local_governments.map(p => p.name_ne)],
      sourceUrl: `/local-reporting`,
      metadata: { districtId: district.id, count: district.local_governments.length }
    });

    // Add prominent Palikas as distinct knowledge items
    district.local_governments.forEach((p) => {
      items.push({
        id: `palika-${p.id}`,
        title: `${p.name_ne} - अपाङ्गता वस्तुस्थिति तथा प्रोफाइल`,
        titleEn: `${p.name_en} (${district.name_en})`,
        category: "palika",
        categoryLabel: "स्थानीय तह प्रोफाइल",
        summary: `${district.name_ne} जिल्ला अन्तर्गत ${p.name_ne} (${p.type}) को प्रोफाइल, सहजकर्ता सम्पर्क र वार्षिक प्रतिवेदन प्रविष्टि।`,
        content: `${p.name_ne} (${district.name_ne} जिल्ला):
- प्रकार: ${p.type}
- प्रदेश: कोशी प्रदेश
- वार्षिक प्रतिवेदन प्रविष्टि: उपलब्ध (४४ प्रश्न तथा अनुसूची १.१ र १.२)
- सेवाहरू: परिचयपत्र वितरण, सहायता सहजकर्ता परामर्श, गृहभेट सेवा, सहायक सामग्री वितरण सिफारिस।
- प्रोफाइल र फारम हेर्न: /local-reporting/palika/${p.id}`,
        keywords: [p.name_ne, p.name_en, district.name_ne, p.type, "सहजकर्ता", "प्रोफाइल"],
        sourceUrl: `/local-reporting/palika/${p.id}/profile`,
        metadata: { palikaId: p.id, districtId: district.id }
      });
    });
  });

  // 6. Province Contacts
  DEFAULT_PROVINCE_CONTACTS.forEach((contact) => {
    items.push({
      id: contact.id,
      title: `${contact.organization_name_ne} - सम्पर्क विवरण`,
      titleEn: contact.organization_name_en,
      category: "contact",
      categoryLabel: "सम्पर्क निर्देशिका",
      summary: `${contact.organization_name_ne} को फोन, इमेल र ठेगाना।`,
      content: `${contact.organization_name_ne} (${contact.organization_name_en}):
- फोन: ${contact.office_phone}
- इमेल: ${contact.email}
- ठेगाना: ${contact.address_ne}
- भूमिका: अपाङ्गता नीति निर्माण, बजेट व्यवस्थापन, समन्वय र अनुगमन।`,
      keywords: [contact.organization_name_ne, contact.organization_name_en, "सम्पर्क", "फोन", "इमेल", "मन्त्रालय", "महासंघ"],
      sourceUrl: "/contact",
    });
  });

  _cachedKnowledgeBase = items;
  return items;
}

// Tokenize text for semantic/lexical matching
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[,\.?!;:'"()\[\]{}\\/।॥\-–_]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 1)
    .map(t => {
      // Remove common Nepali grammatical suffixes
      return t
        .replace(/(हरू|हरु|को|का|की|मा|ले|लाई|लाइ|बाट|देखि|संग|सँग|द्वारा|भित्र)$/, "");
    })
    .filter(t => t.length > 1);
}

// Search Knowledge Base
export function searchKnowledgeBase(query: string, limit = 5): KnowledgeItem[] {
  const allItems = getAllKnowledgeItems();
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return allItems.slice(0, limit);

  const queryTokens = tokenize(cleanQuery);

  const scored = allItems.map((item) => {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const contentLower = item.content.toLowerCase();
    const summaryLower = item.summary.toLowerCase();

    // Exact phrase match in title
    if (titleLower.includes(cleanQuery)) score += 50;
    // Exact phrase match in summary
    if (summaryLower.includes(cleanQuery)) score += 30;
    // Exact phrase match in content
    if (contentLower.includes(cleanQuery)) score += 20;

    // Token matches
    queryTokens.forEach((token) => {
      if (titleLower.includes(token)) score += 15;
      if (summaryLower.includes(token)) score += 8;
      if (item.keywords.some(k => k.toLowerCase().includes(token))) score += 12;
      if (contentLower.includes(token)) score += 4;
    });

    // Category boosts for specific intent
    if (cleanQuery.includes("ऐन") || cleanQuery.includes("कानुन") || cleanQuery.includes("नियमावली") || cleanQuery.includes("कार्यविधि")) {
      if (item.category === "law") score += 25;
    }
    if (cleanQuery.includes("तथ्याङ्क") || cleanQuery.includes("प्रतिवेदन") || cleanQuery.includes("संख्या") || cleanQuery.includes("कति") || cleanQuery.includes("बजेट")) {
      if (item.category === "report") score += 25;
    }
    if (cleanQuery.includes("गृहभेट") || cleanQuery.includes("अनुसूची")) {
      if (item.id.includes("home-visits") || item.id.includes("form")) score += 30;
    }
    if (cleanQuery.includes("सामग्री") || cleanQuery.includes("ह्वीलचेयर") || cleanQuery.includes("छडी")) {
      if (item.id.includes("assistive") || item.category === "report") score += 30;
    }
    if (cleanQuery.includes("कार्ड") || cleanQuery.includes("रातो") || cleanQuery.includes("निलो") || cleanQuery.includes("भत्ता")) {
      if (item.id.includes("social-security") || item.id.includes("demographics")) score += 30;
    }

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Return top results that meet minimum threshold, or fallback to top general items
  const filtered = scored.filter(s => s.score > 5).map(s => s.item);
  return filtered.length > 0 ? filtered.slice(0, limit) : allItems.slice(0, limit);
}

// Generate Direct Intelligent Nepali Response when running locally or if n8n is offline
export function generateDirectAnswer(query: string, relevantItems: KnowledgeItem[]): {
  answer: string;
  sources: Array<{ title: string; url: string; category: string }>;
} {
  const q = query.trim().toLowerCase();
  const sources = relevantItems.map(item => ({
    title: item.title,
    url: item.sourceUrl,
    category: item.categoryLabel
  }));

  // Greeting check
  if (/^(नमस्ते|नमस्कार|हेलो|hello|hi|good morning)/i.test(q)) {
    return {
      answer: `नमस्ते! म **अपाङ्गता सूचना केन्द्र (DIC) AI सहायक** हुँ। 

म तपाईंलाई यस वेब एपमा रहेका निम्न विषयहरूमा आधिकारिक सूचना र तथ्याङ्क उपलब्ध गराउन सक्छु:
- 📜 **ऐन तथा कानुनी व्यवस्था:** अपाङ्गता अधिकार ऐन २०७४, नियमावली २०७७ र कोशी प्रदेशका नीतिहरू।
- 🪪 **परिचयपत्र तथा सामाजिक सुरक्षा:** रातो, निलो, पहेँलो र सेतो कार्डको मापदण्ड र मासिक भत्ता।
- 📊 **विषयगत तथ्याङ्क:** गृहभेट, सहायक सामग्री वितरण, १० प्रकारका अपाङ्गता, शिक्षा तथा बजेट।
- 🏛️ **स्थानीय तह प्रोफाइल:** कोशी प्रदेशका १४ जिल्ला र १३७ वटै पालिकाको वस्तुस्थिति र सहजकर्ता सम्पर्क।
- 📝 **वार्षिक प्रतिवेदन फारम:** ४४ वटा प्रश्न तथा अनुसूची १.१ (गृहभेट) र १.२ (सामग्री) प्रविष्टि।

कृपया आफ्नो जिज्ञासा तल टाइप गर्नुहोस्!`,
      sources: [
        { title: "कानुन तथा नीतिगत भण्डार", url: "/laws", category: "कानुन" },
        { title: "तथ्याङ्क तथा प्रतिवेदन", url: "/reports", category: "प्रतिवेदन" },
        { title: "१३७ स्थानीय तह पोर्टल", url: "/local-reporting", category: "पालिका" }
      ]
    };
  }

  // 1. Laws & Acts query
  if (q.includes("ऐन") || q.includes("कानुन") || q.includes("नियमावली") || q.includes("अधिकार")) {
    const lawItem = relevantItems.find(i => i.category === "law") || relevantItems[0];
    return {
      answer: `### 📜 अपाङ्गता सम्बन्धी कानुनी तथा नीतिगत व्यवस्था

नेपालमा अपाङ्गता भएका व्यक्तिको अधिकार संरक्षणका लागि **अपाङ्गता भएका व्यक्तिको अधिकार सम्बन्धी ऐन, २०७४** र **अपाङ्गता नियमावली, २०७७** मूल कानुनी आधार हुन्।

**प्रमुख कानुनी व्यवस्थाहरू:**
1. **परिचयपत्र वर्गीकरण:** गाम्भीर्यताका आधारमा ४ प्रकार (रातो, निलो, पहेँलो र सेतो कार्ड) को व्यवस्था।
2. **१० प्रकारका अपाङ्गता:** शारीरिक, दृष्टिविहीन, बहिरा, श्रवण-दृष्टिविहीन, स्वर/बोलाइ, मानसिक, बौद्धिक, हेमोफेलिया, अटिजम र बहुअपाङ्गता।
3. **स्थानीय समन्वय समिति:** प्रत्येक स्थानीय तहमा उपप्रमुख/उपाध्यक्षको संयोजकत्वमा समिति गठन हुने र परिचयपत्र वितरण गर्ने कानुनी अधिकार छ।
4. **आरक्षण तथा सुविधा:** सरकारी सेवामा ५% आरक्षण, निःशुल्क आधारभूत स्वास्थ्य/शिक्षा, र सार्वजनिक यातायातमा ५०% छुट।

थप विस्तृत ऐन, नियमावली र परिपत्रहरू हाम्रो [कानुन तथा नीतिगत भण्डार](/laws) मा हेर्न र डाउनलोड गर्न सक्नुहुन्छ।`,
      sources
    };
  }

  // 2. Identity Cards & Allowance
  if (q.includes("कार्ड") || q.includes("परिचयपत्र") || q.includes("भत्ता") || q.includes("रातो") || q.includes("निलो")) {
    return {
      answer: `### 🪪 अपाङ्गता परिचयपत्र तथा सामाजिक सुरक्षा भत्ता विवरण

अपाङ्गताको गाम्भीर्यताका आधारमा ४ प्रकारका परिचयपत्र वितरण गरिन्छ:

1. **'क' वर्ग (रातो कार्ड - पूर्ण अशक्त अपाङ्गता):**
   - **मापदण्ड:** दैनिक क्रियाकलाप गर्न अरूको पूर्ण सहारा चाहिने व्यक्तिहरू।
   - **मासिक भत्ता:** रु. **३,९९०** (सामाजिक सुरक्षा कोषबाट प्रत्यक्ष बैंक खातामा)।
2. **'ख' वर्ग (निलो कार्ड - अति अशक्त अपाङ्गता):**
   - **मापदण्ड:** अरूको आंशिक सहारा चाहिने वा दैनिक कार्य कठिन हुने व्यक्तिहरू।
   - **मासिक भत्ता:** रु. **२,१२८** प्रति महिना।
3. **'ग' वर्ग (पहेँलो कार्ड - मध्यम अपाङ्गता):**
   - **मापदण्ड:** दैनिक जीवनका क्रियाकलाप आफैं गर्न सक्ने तर सामाजिक बाधा सामना गर्ने व्यक्तिहरू।
   - **सुविधा:** निःशुल्क शिक्षा, स्वास्थ्य उपचारमा छुट, सरकारी रोजगारीमा ५०% सिट आरक्षण र कर सहुलियत।
4. **'घ' वर्ग (सेतो कार्ड - सामान्य अपाङ्गता):**
   - **मापदण्ड:** सामान्य शारीरिक वा मानसिक कठिनाइ भएका नागरिकहरू।
   - **सुविधा:** पहिचान तथा प्राथमिकता सुविधा।

**हालको तथ्याङ्क:** कोशी प्रदेशमा हालसम्म ६,४३० रातो कार्ड र ७,५४० निलो कार्ड गरी कुल **१३,९७० जना**ले मासिक भत्ता प्राप्त गरिरहेका छन्।`,
      sources
    };
  }

  // 3. Assistive Devices
  if (q.includes("सामग्री") || q.includes("ह्वीलचेयर") || q.includes("छडी") || q.includes("श्रवण") || q.includes("उपकरण")) {
    return {
      answer: `### 🦽 सहायक सामग्री वितरण तथा प्राप्त गर्ने विधि

कोशी प्रदेशका १३७ वटै स्थानीय तहमा अपाङ्गता सहायता सहजकर्ता र सामाजिक विकास शाखाको समन्वयमा निःशुल्क सहायक सामग्री वितरण गरिन्छ।

**हालसम्मको वितरण तथ्याङ्क (कुल २,९४० थान):**
- **ह्वीलचेयर (Wheelchairs):** ९८० थान (मानक तथा सिपि चेयर)
- **सेतो छडी (White Canes):** ७२० थान (दृष्टिविहीनका लागि)
- **डिजिटल श्रवण यन्त्र (Hearing Aids):** ५४० थान
- **वैशाखी र वाकर (Crutches/Walkers):** ४२० थान
- **ट्राइसाइकल (Tricycles):** १८० थान
- **ब्रेल स्लेट तथा स्टाइलस:** १०० सेट

**सहायक सामग्री कसरी प्राप्त गर्ने?**
१. आफ्नो पालिकाको महिला, बालबालिका तथा सामाजिक विकास शाखा वा अपाङ्गता सहायता सहजकर्तासँग सम्पर्क गर्नुहोस्।
२. अपाङ्गता परिचयपत्रको प्रतिलिपि र चिकित्सक/विशेषज्ञको आवश्यकता सिफारिस पेश गर्नुहोस्।
३. पालिकाले 'अनुसूची १.२' मा नाम दर्ता गरी निःशुल्क वितरण गर्दछ।`,
      sources
    };
  }

  // 4. Home Visits
  if (q.includes("गृहभेट") || q.includes("अनुसूची १.१") || q.includes("घरदैलो")) {
    return {
      answer: `### 🏠 गृहभेट (Home Visit) सेवा तथ्याङ्क तथा अनुसूची १.१

स्थानीय तहका अपाङ्गता सहायता सहजकर्ताहरूले भौगोलिक विकटता तथा अशक्तताका कारण पालिका केन्द्रसम्म आउन नसक्ने व्यक्तिहरूलाई घरमै पुगेर सेवा दिँदै आएका छन्।

**मुख्य तथ्याङ्क:**
- **सम्पन्न कुल गृहभेट:** **८,४२० पटक**
- **प्राथमिक पहिचान तथा विवरण संकलन:** ४,१२० जना
- **घरमै पुगी परिचयपत्र सिफारिस:** १,८५० जना
- **नियमित फलोअप तथा परामर्श:** २,३१० परिवार

**अनुसूची १.१ प्रविष्टि सम्बन्धी:**
सहजकर्ताले वार्षिक प्रतिवेदन भर्दा 'अनुसूची १.१ गृहभेट विवरण तालिका' मा गृहभेट गरिएको मिति, सेवाग्राहीको नाम, उमेर, लिङ्ग, वडा नं, अपाङ्गताको प्रकार, परिचयपत्र नम्बर र प्रदान गरिएको सेवा विवरण अनिवार्य भर्नुपर्छ।`,
      sources
    };
  }

  // 5. Reporting Form
  if (q.includes("प्रतिवेदन") || q.includes("फारम") || q.includes("४४ प्रश्न") || q.includes("कसरी भर्ने")) {
    return {
      answer: `### 📝 वार्षिक कार्यसम्पादन प्रतिवेदन फारम (४४ प्रश्न निर्देशिका)

कोशी प्रदेश अन्तर्गतका सम्पूर्ण १३७ स्थानीय तहका अपाङ्गता सहायता सहजकर्ताहरूले आर्थिक वर्ष २०८२/०८३ को कार्यसम्पादन प्रतिवेदन डिजिटल प्रणाली मार्फत प्रविष्टि गर्नुपर्ने व्यवस्था छ।

**फारमका मुख्य १३ खण्डहरू:**
1. **Q1-Q9:** सामान्य विवरण तथा जनसांख्यिकी
2. **Q10-Q13:** परामर्श, थेरापी, गृहभेट र सहायक सामग्री सेवा
3. **Q14-Q20:** शिक्षा, भर्ना, छात्रवृत्ति र बाल क्लब
4. **Q21-Q23:** सीप तालिम, रोजगारी र उद्यमशीलता
5. **Q24-Q27:** सामाजिक सुरक्षा भत्ता र कार्ड वितरण
6. **Q28-Q29:** मिलिजुली समूह र बिउपुँजी परिचालन
7. **Q30-Q33:** बजेट, स्वास्थ्य बीमा र OPD सेवा
8. **Q34:** १० प्रकारका अपाङ्गता वर्गीकरण तालिका
9. **Q35:** कार्ड रंग (रातो, निलो, पहेँलो, सेतो) अनुसार संख्या
10. **Q36-Q44:** नीति, कार्यविधि, समन्वय समिति बैठक र गुनासो
11. **अनुसूची १.१:** गृहभेट विवरण (Dynamic Table)
12. **अनुसूची १.२:** सहायक सामग्री वितरण (Dynamic Table)
13. **समीक्षा तथा पेश:** ३-पाने Excel (.xlsx) वा PDF डाउनलोड

तपाईं आफ्नो पालिकाको प्रतिवेदन [स्थानीय तह पोर्टल](/local-reporting) बाट सुरु गर्न सक्नुहुन्छ।`,
      sources
    };
  }

  // General factual response synthesised from matched items
  const bestItem = relevantItems[0];
  const secondaryItem = relevantItems[1];

  let answerText = `### ℹ️ ${bestItem.title}\n\n`;
  answerText += `${bestItem.summary}\n\n`;
  answerText += `**विस्तृत विवरण:**\n${bestItem.content.split("\n").slice(0, 8).join("\n")}\n\n`;

  if (secondaryItem && secondaryItem.id !== bestItem.id) {
    answerText += `**थप सान्दर्भिक सूचना (${secondaryItem.categoryLabel}):**\n${secondaryItem.summary}\n\n`;
  }

  answerText += `यस विषयमा थप जानकारीका लागि सम्बन्धित पृष्ठमा जान सक्नुहुन्छ।`;

  return {
    answer: answerText,
    sources
  };
}

// System Prompt for n8n AI Agent / OpenAI
export function getDicAgentSystemPrompt(): string {
  return `तपाईं नेपालको 'अपाङ्गता सूचना केन्द्र (Disability Information Center - DIC)' को आधिकारिक तथा बौद्धिक AI सहायक (DIC AI Agent) हुनुहुन्छ।

तपाईंको मुख्य जिम्मेवारी:
१. कोशी प्रदेशका १४ वटा जिल्ला र १३७ वटै स्थानीय तहका नागरिक, अपाङ्गता भएका व्यक्ति, परिवार, सहजकर्ता तथा कर्मचारीहरूलाई अपाङ्गता सम्बन्धी आधिकारिक, कानुनी, तथ्यपरक र मानवीय जवाफ दिनु हो।
२. जवाफ सधैं शिष्ट, सम्मानजनक र WCAG पहुँचयुक्त नेपाली भाषामा दिनुहोस्। (प्रयोगकर्ताले अंग्रेजीमा सोधेमा अंग्रेजीमै दिनुहोस्)।
३. तपाईंलाई उपलब्ध गराइएका 'Relevant Knowledge Context' (कानुन, समाचार, १० वटा विषयगत प्रतिवेदनका तथ्याङ्क, १३७ पालिका प्रोफाइल, र ४४ वटा वार्षिक प्रतिवेदन प्रश्नहरू) का आधारमा मात्र प्रमाणित जवाफ दिनुहोस्।
४. जवाफ दिँदा मुख्य बुँदाहरूलाई बोल्ड, नम्बरिङ वा बुलेट पोइन्टमा स्पष्ट देखाउनुहोस्।
५. प्रयोगकर्तालाई आवश्यक परेमा सम्बन्धित वेब एपका लिङ्कहरू जस्तै /laws, /reports, /local-reporting, /news दिनुहोस्।
६. परिचयपत्र रंग (रातो, निलो, पहेँलो, सेतो), १० प्रकारका अपाङ्गता, सामाजिक सुरक्षा भत्ता रकम (रातो: रु. ३,९९०, निलो: रु. २,१२८), र वार्षिक प्रतिवेदनका अनुसूची १.१ र १.२ को ढाँचाबारे सधैं स्पष्ट पार्नुहोस्।`;
}
