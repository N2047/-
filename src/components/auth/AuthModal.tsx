"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { KOSHI_DISTRICTS } from "@/lib/koshiGeography";
import {
  Lock,
  X,
  UserCheck,
  UserPlus,
  Mail,
  KeyRound,
  Building2,
  Phone,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
  initialMode?: "login" | "signup";
  targetPalikaId?: string;
  initialPalikaId?: string;
  initialDistrictId?: string;
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultTab = "login",
  initialMode,
  targetPalikaId,
  initialPalikaId,
  initialDistrictId,
  onSuccess,
}: AuthModalProps) {
  const { login, signup } = useAuth();

  const effectiveTab = initialMode || defaultTab;
  const [activeTab, setActiveTab] = useState<"login" | "signup">(effectiveTab);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Login Form
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");

  // Signup Form
  const [fullName, setFullName] = useState<string>("");
  const [signupEmail, setSignupEmail] = useState<string>("");
  const [signupPhone, setSignupPhone] = useState<string>("");
  const [signupPassword, setSignupPassword] = useState<string>("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState<string>("");
  const [selectedPalikaId, setSelectedPalikaId] = useState<string>(
    initialPalikaId || targetPalikaId || "phidim_mun"
  );

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    const res = await login(loginEmail, loginPassword);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg("सफलतापूर्वक लगइन भयो!");
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 600);
    } else {
      setErrorMsg(res.error || "लगइन गर्न सकिएन।");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg("दुवै पासवर्ड मिलेन। कृपया पुनः जाँच्नुहोस्।");
      return;
    }

    setIsLoading(true);
    const res = await signup(
      fullName,
      signupEmail,
      signupPhone,
      signupPassword,
      selectedPalikaId
    );
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg("खाता सफलतापूर्वक दर्ता भई लगइन भयो!");
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 800);
    } else {
      setErrorMsg(res.error || "खाता दर्ता गर्न सकिएन।");
    }
  };

  // Quick Demo Logins
  const handleQuickLogin = async (email: string, pass: string) => {
    setErrorMsg("");
    setIsLoading(true);
    const res = await login(email, pass);
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg("सफलतापूर्वक लगइन भयो!");
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 500);
    } else {
      setErrorMsg(res.error || "लगइन गर्न सकिएन।");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-blue-950 text-white p-4 sm:p-5 border-b-2 border-amber-500 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-base font-bold">
                सुरक्षित पहुँच तथा प्रमाणीकरण
              </h2>
              <p className="text-xs text-blue-200">
                अपाङ्गता सूचना केन्द्र (DIC) — कोशी प्रदेश
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-blue-300 hover:text-white hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
            aria-label="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setErrorMsg("");
            }}
            className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "login"
                ? "border-blue-900 text-blue-900 bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>कर्मचारी / एडमिन लगइन (Sign In)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("signup");
              setErrorMsg("");
            }}
            className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "signup"
                ? "border-blue-900 text-blue-900 bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>नयाँ खाता दर्ता (Sign Up)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  इमेल ठेगाना (Gmail / Email) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="उदा. facilitator@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden min-h-[42px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  गोप्य पासवर्ड (Password) *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden min-h-[42px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
              >
                <Lock className="w-4 h-4" />
                <span>{isLoading ? "प्रमाणीकरण हुँदै..." : "लगइन गर्नुहोस् (Sign In)"}</span>
              </button>

              {/* 1-Click Demo Login Shortcuts for Easy Evaluation */}
              <div className="pt-3 border-t border-slate-200">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>परीक्षणका लागि द्रुत लगइन (1-Click Demo Logins):</span>
                </p>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("admin@dic.gov.np", "admin123")}
                    className="w-full p-2.5 text-left rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-bold text-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span>👑 मुख्य प्रशासक (Super Admin)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">सबै १३७ पालिका नियन्त्रण</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin("phidim.staff@gmail.com", "phidim123")}
                    className="w-full p-2.5 text-left rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold text-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>🏛️ फिदिम पालिका कर्मचारी (Phidim Staff)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">फिदिम प्रतिवेदन भर्ने</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin("dharan.staff@gmail.com", "dharan123")}
                    className="w-full p-2.5 text-left rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <span>🏢 धरान पालिका कर्मचारी (Dharan Staff)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">धरान प्रतिवेदन भर्ने</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: SIGNUP FORM */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  कर्मचारी / सहजकर्ताको पूरा नाम *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="उदा. नविन ढुङ्गेल"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden min-h-[42px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    इमेल ठेगाना (Gmail) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="username@gmail.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden min-h-[42px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    सम्पर्क मोबाइल नम्बर
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      placeholder="९८xxxxxxxx"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden min-h-[42px]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  तपाईं कार्यरत स्थानीय तह (Assigned Palika) *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={selectedPalikaId}
                    onChange={(e) => setSelectedPalikaId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden min-h-[42px]"
                  >
                    {KOSHI_DISTRICTS.map((d) => (
                      <optgroup key={d.id} label={`${d.name_ne} जिल्ला`}>
                        {d.local_governments.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name_ne} ({p.type})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  * तपाईंले छनौट गर्नुभएको स्थानीय तहको मात्र वार्षिक प्रतिवेदन सम्पादन गर्ने अधिकार रहनेछ।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    पासवर्ड (कम्तीमा ६ अक्षर) *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden min-h-[42px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    पासवर्ड पुनः पुष्टि गर्नुहोस् *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden min-h-[42px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isLoading ? "खाता सिर्जना हुँदै..." : "नयाँ खाता दर्ता गर्नुहोस् (Create Account)"}</span>
              </button>
            </form>
          )}

        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-center text-[11px] text-slate-500 shrink-0">
          🔒 राष्ट्रिय अपाङ्गता सूचना प्रणाली डाटा सुरक्षा मापदण्ड अनुरूप सुरक्षित
        </div>

      </div>
    </div>
  );
}
