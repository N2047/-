"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { translations, Language } from "@/lib/translations";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  ShieldCheck, 
  HeartHandshake, 
  Building2, 
  CheckCircle2, 
  HelpCircle, 
  AlertCircle,
  Phone,
  User,
  MessageSquare,
  Sparkles,
  ExternalLink
} from "lucide-react";

export default function ContactPage() {
  const [lang, setLang] = useState<Language>("ne");
  const t = translations[lang];

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("");
  const [category, setCategory] = useState("service_inquiry");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // District Focal Persons for Koshi Province (14 Districts)
  const districtFocalPersons = [
    { district: "मोरङ", name: "रमेश अधिकारी", role: "प्रदेश संयोजक तथा सम्पर्क अधिकृत", phone: "०२१-४६२८००", email: "morang.dic@koshi.gov.np", office: "सामाजिक विकास मन्त्रालय, विराटनगर" },
    { district: "झापा", name: "सुनिता राजवंशी", role: "जिल्ला अपाङ्गता फोकल पर्सन", phone: "०२३-५२०११२", email: "jhapa.dic@koshi.gov.np", office: "सामाजिक विकास कार्यालय, भद्रपुर" },
    { district: "सुनसरी", name: "गोपाल कार्की", role: "जिल्ला सहजकर्ता संयोजक", phone: "०२५-५६०३३४", email: "sunsari.dic@koshi.gov.np", office: "सामाजिक विकास कार्यालय, इनरुवा" },
    { district: "पाँचथर", name: "दिनेश तुम्बापो", role: "जिल्ला अपाङ्गता सहजकर्ता", phone: "०२४-५२०२२१", email: "panchthar.dic@koshi.gov.np", office: "फिदिम, पाँचथर" },
    { district: "इलाम", name: "प्रमिला राई", role: "जिल्ला सम्पर्क अधिकृत", phone: "०२७-५२०१४५", email: "ilam.dic@koshi.gov.np", office: "इलाम बजार" },
    { district: "धनकुटा", name: "हरि श्रेष्ठ", role: "जिल्ला सहजकर्ता अधिकृत", phone: "०२६-५२००९८", email: "dhankuta.dic@koshi.gov.np", office: "धनकुटा" },
    { district: "उदयपुर", name: "कमला दनुवार", role: "जिल्ला अपाङ्गता सहजकर्ता", phone: "०३१-४२०१११", email: "udayapur.dic@koshi.gov.np", office: "त्रियुगा, गाईघाट" },
    { district: "ताप्लेजुङ", name: "मिङमा शेर्पा", role: "जिल्ला सम्पर्क व्यक्ति", phone: "०२४-४६०१२२", email: "taplejung.dic@koshi.gov.np", office: "फुङलिङ, ताप्लेजुङ" },
    { district: "संखुवासभा", name: "राजेन्द्र गुरुङ", role: "जिल्ला सहजकर्ता संयोजक", phone: "०२९-५६०१३३", email: "sankhuwasabha.dic@koshi.gov.np", office: "खाँदबारी" },
    { district: "भोजपुर", name: "सृजना तामाङ", role: "जिल्ला सम्पर्क अधिकृत", phone: "०२९-४२०१४४", email: "bhojpur.dic@koshi.gov.np", office: "भोजपुर बजार" },
    { district: "तेह्रथुम", name: "नारायण लिम्बू", role: "जिल्ला फोकल पर्सन", phone: "०२६-४६०१५५", email: "terhathum.dic@koshi.gov.np", office: "म्याङलुङ" },
    { district: "खोटाङ", name: "मनिषा खत्री", role: "जिल्ला सम्पर्क अधिकृत", phone: "०३६-४२०१६६", email: "khotang.dic@koshi.gov.np", office: "दिक्तेल" },
    { district: "ओखलढुङ्गा", name: "प्रकाश भुजेल", role: "जिल्ला अपाङ्गता सहजकर्ता", phone: "०३७-५२०१७७", email: "okhaldhunga.dic@koshi.gov.np", office: "सिद्धिचरण" },
    { district: "सोलुखुम्बु", name: "दावा लामा", role: "जिल्ला सम्पर्क व्यक्ति", phone: "०३८-५२०१८८", email: "solukhumbu.dic@koshi.gov.np", office: "सल्लेरी" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFullName("");
      setPhone("");
      setEmail("");
      setMessage("");
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header lang={lang} onLanguageChange={setLang} />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-hidden">
        
        {/* Page Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 rounded-full text-xs font-black uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                  <PhoneCall className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                  सम्पर्क तथा सहयोग केन्द्र
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  २४/७ नागरिक सेवा
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                सम्पर्क तथा सहायता कक्ष (Contact & Helpdesk)
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
                अपाङ्गता सम्बन्धी सेवासुविधा, सामाजिक सुरक्षा भत्ता, परिचयपत्र प्राप्ति, वार्षिक प्रतिवेदन प्रणाली वा कानुनी परामर्शका लागि हामीलाई सिधै सम्पर्क गर्नुहोस्।
              </p>
            </div>
          </div>
        </div>

        {/* Emergency & Key Contact Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Card 1: Emergency / Toll-Free Hotline */}
          <div className="bg-linear-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-blue-800/40 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl mb-4 shadow-md">
                <PhoneCall className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">निःशुल्क हटलाइन सेवा</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">११४५ / ०२१-४६२८००</h2>
              <p className="text-xs text-blue-200 mt-2 leading-relaxed">
                अपाङ्गता अधिकार, समस्या उजुरी तथा सहायता सम्बन्धी जानकारीका लागि सिधै कुरा गर्नुहोस्।
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-blue-800/60 flex items-center justify-between text-xs text-blue-200">
              <span className="flex items-center gap-1.5 font-bold text-amber-300">
                <Clock className="w-4 h-4" />
                <span>कार्यालय समय: १०:०० - ५:००</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-800/80 text-blue-100 font-semibold">टोल-फ्री</span>
            </div>
          </div>

          {/* Card 2: Main Ministry Office */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-black text-xl mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">मुख्य प्रशासनिक केन्द्र</span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
                सामाजिक विकास मन्त्रालय
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                कोशी प्रदेश सरकार, विराटनगर (मोरङ), नेपाल। अपाङ्गता सूचना तथा तथ्यांक व्यवस्थापन केन्द्र (DIC)।
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">info.dic@koshi.gov.np</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>विराटनगर, मोरङ</span>
              </div>
            </div>
          </div>

          {/* Card 3: Accessibility Helpdesk */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center font-black text-xl mb-4">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">पहुँचयुक्त सहायता कक्ष</span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
                भौतिक तथा डिजिटल पहुँच
              </h2>
              <ul className="text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>ह्वीलचेयर र्‍याम्प तथा पहुँचयुक्त शौचालय</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>सांकेतिक भाषा दोभाषे सेवा उपलब्ध</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>अडियो स्क्रिन-रिडर तथा ब्रेल सहायता</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <span>WCAG 2.2 AA स्तरको डिजिटल पहुँच</span>
            </div>
          </div>

        </div>

        {/* Two-Column Section: Inquiry Form + Office Map Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Inquiry Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>अनलाइन सोधपुछ तथा गुनासो फारम (Inquiry & Grievance Form)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                कुनै सेवा, परिचयपत्र वा प्राविधिक सहयोग आवश्यक परेमा तलको फारम भरी पठाउनुहोस्।
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xl shadow-md">
                  ✓
                </div>
                <h3 className="text-base font-black text-emerald-900 dark:text-emerald-200">
                  तपाईंको सन्देश सफलतापूर्वक प्राप्त भयो!
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
                  हाम्रो टोलीले यथाशीघ्र तपाईंलाई उपलब्ध गराइएको फोन नम्बर वा इमेलमा सम्पर्क गर्नेछ। धन्यवाद।
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer mt-2"
                >
                  अर्को सन्देश पठाउनुहोस्
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      पूरा नाम (Full Name) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="उदा. रमेश श्रेष्ठ"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      सम्पर्क फोन नम्बर (Mobile No.) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="उदा. ९८XXXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      इमेल ठेगाना (Email Address)
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="उदा. name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-district" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      जिल्ला (District) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="contact-district"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden cursor-pointer"
                    >
                      <option value="">-- जिल्ला छनौट गर्नुहोस् --</option>
                      {KOSHI_DISTRICTS.map((d) => (
                        <option key={d.id} value={d.name_ne}>
                          {d.name_ne} ({d.local_governments.length} स्थानीय तह)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-category" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    विषयको प्रकृति (Inquiry Category) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="contact-category"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden cursor-pointer"
                  >
                    <option value="service_inquiry">सेवासुविधा तथा सहायक सामग्री सोधपुछ</option>
                    <option value="id_card">अपाङ्गता परिचयपत्र तथा भत्ता सम्बन्धी</option>
                    <option value="report_system">वार्षिक प्रतिवेदन पोर्टल सम्बन्धी समस्या</option>
                    <option value="policy_law">कानुन तथा नीतिगत परामर्श</option>
                    <option value="grievance">गुनासो वा सुझाव</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    सन्देश / विवरण (Message / Inquiry) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="तपाईंको जिज्ञासा, समस्या वा सुझाव यहाँ प्रष्ट लेख्नुहोस्..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "सन्देश पठाउँदै..." : "सन्देश पठाउनुहोस् (Submit Inquiry)"}</span>
                </button>
              </form>
            )}
          </div>

          {/* Office Hours & Information Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Operating Hours Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>कार्यालय कार्य समय (Office Hours)</span>
              </h3>
              <ul className="text-xs space-y-2.5 text-slate-700 dark:text-slate-300">
                <li className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-semibold">आइतबार - बिहीबार:</span>
                  <span className="font-bold text-blue-900 dark:text-blue-300">बिहान १०:०० - साँझ ५:००</span>
                </li>
                <li className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-semibold">शुक्रबार:</span>
                  <span className="font-bold text-blue-900 dark:text-blue-300">बिहान १०:०० - दिउँसो ३:००</span>
                </li>
                <li className="flex justify-between text-rose-600 dark:text-rose-400">
                  <span className="font-semibold">शनिबार र सार्वजनिक बिदा:</span>
                  <span className="font-bold">बन्द रहनेछ</span>
                </li>
              </ul>
            </div>

            {/* Quick Access Channels */}
            <div className="bg-slate-100 dark:bg-slate-800/80 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
                सिधै सम्पर्कका माध्यमहरू
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">फोन सम्पर्क</span>
                    <span className="font-bold text-slate-900 dark:text-white">०२१-४६२८००, ०२१-४६२८०१</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">आधिकारिक इमेल</span>
                    <span className="font-bold text-slate-900 dark:text-white">info.dic@koshi.gov.np</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">कार्यालय ठेगाना</span>
                    <span className="font-bold text-slate-900 dark:text-white">विराटनगर-१०, मोरङ, कोशी प्रदेश</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 14 Districts Focal Persons Directory */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-12">
          <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                <span>कोशी प्रदेशका १४ जिल्लाका अपाङ्गता सम्पर्क सहजकर्ता (District Focal Directory)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                आफ्नो जिल्लाका स्थानीय तहहरूसँग समन्वय गर्न वा प्रत्यक्ष परामर्शका लागि जिल्ला फोकल सहजकर्तासँग सम्पर्क गर्नुहोस्।
              </p>
            </div>
            <span className="text-xs font-bold text-blue-900 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-3 py-1 rounded-full">
              १४ वटै जिल्ला
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="min-w-full text-xs text-left">
              <caption className="p-3 font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 text-left border-b border-slate-200 dark:border-slate-700">
                तालिका: कोशी प्रदेशका १४ वटै जिल्लाका अपाङ्गता सूचना तथा सम्पर्क अधिकृतहरूको विवरण
              </caption>
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th scope="col" className="p-3">जिल्ला</th>
                  <th scope="col" className="p-3">सम्पर्क व्यक्ति (Focal Person)</th>
                  <th scope="col" className="p-3">पद / जिम्मेवारी</th>
                  <th scope="col" className="p-3">कार्यालय / स्थान</th>
                  <th scope="col" className="p-3">सम्पर्क फोन</th>
                  <th scope="col" className="p-3">इमेल</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {districtFocalPersons.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-blue-900 dark:text-blue-300">{item.district}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{item.name}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{item.role}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{item.office}</td>
                    <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">{item.phone}</td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{item.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <Footer lang={lang} />
    </div>
  );
}
