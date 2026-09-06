"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  ShieldAlert,
  Send,
  HelpCircle,
  RotateCcw,
  Check,
  Smartphone
} from "lucide-react";

interface UnifiedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "signin" | "signup";
  initialRole?: "normal_user" | "employee";
  onSuccess?: () => void;
}

export default function UnifiedAuthModal({
  isOpen,
  onClose,
  initialTab = "signin",
  initialRole = "normal_user",
  onSuccess,
}: UnifiedAuthModalProps) {
  const { login, signupUser, signupEmployee, sendOtp, verifyOtp } = useAuth();

  // Modal Navigation State
  const [mainTab, setMainTab] = useState<"signin" | "signup">(initialTab);
  const [signupTarget, setSignupTarget] = useState<"choose" | "normal_user" | "employee">("choose");

  // Step progression in Signup: 1: Info, 2: OTP, 3: Password, 4: Done
  const [signupStep, setSignupStep] = useState<1 | 2 | 3 | 4>(1);

  // Common UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [signInIdentifier, setSignInIdentifier] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [pendingAccountNotice, setPendingAccountNotice] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  // Normal User Signup State
  const [userName, setUserName] = useState("");
  const [userIdentifier, setUserIdentifier] = useState(""); // Email or Mobile

  // Employee Signup State
  const [empName, setEmpName] = useState("");
  const [empAddress, setEmpAddress] = useState("");
  const [empDistrictId, setEmpDistrictId] = useState("panchthar");
  const [empPalikaId, setEmpPalikaId] = useState("phidim_mun");
  const [empEmail, setEmpEmail] = useState("");
  const [empPhone, setEmpPhone] = useState("");
  const [empOtpChannel, setEmpOtpChannel] = useState<"email" | "phone">("email");

  // OTP Verification State
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpPreview, setOtpPreview] = useState<string | null>(null);

  // Password creation state
  const [createPassword, setCreatePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP input refs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setMainTab(initialTab);
      setSignupTarget(initialRole === "employee" ? "employee" : "choose");
      setSignupStep(1);
      setErrorMessage("");
      setSuccessMessage("");
      setPendingAccountNotice(null);
      setPendingUserId(null);
    }
  }, [isOpen, initialTab, initialRole]);

  // OTP Countdown timer
  useEffect(() => {
    if (otpTimer > 0) {
      const t = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [otpTimer]);

  if (!isOpen) return null;

  // Selected district palikas for employee
  const selectedDistrict = KOSHI_DISTRICTS.find((d) => d.id === empDistrictId);
  const availablePalikas = selectedDistrict ? selectedDistrict.local_governments : [];

  // --------------------------------------------------------------------------
  // 1. SIGN IN HANDLER
  // --------------------------------------------------------------------------
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setPendingAccountNotice(null);

    if (!signInIdentifier.trim() || !signInPassword) {
      setErrorMessage("कृपया User ID / Email / Phone र Password प्रविष्टि गर्नुहोस्।");
      return;
    }

    setIsLoading(true);
    const res = await login(signInIdentifier.trim(), signInPassword);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage(`स्वागत छ, ${res.user?.name}!`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 600);
    } else {
      if (res.account_status === "pending") {
        setPendingAccountNotice(res.details || res.error || "तपाईंको खाता हाल Pending Approval अवस्थामा छ।");
        setPendingUserId(res.userId || res.user_id || null);
      } else {
        setErrorMessage(res.error || "लगइन गर्न सकिएन।");
      }
    }
  };

  // Quick Approve Pending Staff for Testing
  const handleQuickApprovePending = async () => {
    if (!pendingUserId) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", userId: pendingUserId })
      });
      const data = await res.json();
      if (data.success) {
        setPendingAccountNotice(null);
        setSuccessMessage("खाता सफलतापूर्वक स्वीकृत भयो! अब लगइन गरिँदैछ...");
        setTimeout(() => {
          login(signInIdentifier.trim(), signInPassword);
        }, 800);
      } else {
        setErrorMessage(data.error || "खाता स्वीकृत गर्न सकिएन।");
      }
    } catch {
      setErrorMessage("खाता स्वीकृतिमा समस्या आयो।");
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // 2. SEND OTP HANDLER
  // --------------------------------------------------------------------------
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    let targetIdentifier = "";
    let recipientName = "";
    if (signupTarget === "normal_user") {
      if (!userIdentifier.trim()) {
        setErrorMessage("कृपया Email वा Mobile नम्बर प्रविष्टि गर्नुहोस्।");
        return;
      }
      targetIdentifier = userIdentifier.trim();
      recipientName = userName.trim() || "नागरिक";
    } else {
      // Employee registration: send to Email (Gmail) or Phone based on selected channel
      if (empOtpChannel === "email") {
        if (!empEmail.trim() || !empEmail.includes("@")) {
          setErrorMessage("कृपया कर्मचारीको आधिकारिक Gmail / Email ठेगाना अनिवार्य प्रविष्टि गर्नुहोस्।");
          return;
        }
        targetIdentifier = empEmail.trim();
      } else {
        if (!empPhone.trim()) {
          setErrorMessage("कृपया कर्मचारीको मोबाइल नम्बर अनिवार्य प्रविष्टि गर्नुहोस्।");
          return;
        }
        targetIdentifier = empPhone.trim();
      }
      recipientName = empName.trim() || "कर्मचारी";
    }

    setIsLoading(true);
    const res = await sendOtp(targetIdentifier, signupTarget === "employee" ? "employee_signup" : "user_signup", recipientName);
    setIsLoading(false);

    if (res.success) {
      setOtpTimer(60); // 60s cooldown
      setSignupStep(2);
      setOtpPreview(res.preview_code || null);
      setSuccessMessage(res.message || (empOtpChannel === "email" ? `${targetIdentifier} Gmail मा OTP कोड पठाइएको छ।` : "OTP कोड पठाइएको छ।"));
    } else {
      setErrorMessage(res.error || "OTP पठाउन सकिएन।");
    }
  };

  // --------------------------------------------------------------------------
  // 3. VERIFY OTP HANDLER
  // --------------------------------------------------------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const fullCode = otpCode.join("");
    if (fullCode.length < 6) {
      setErrorMessage("कृपया ६-अंकको पूरा OTP कोड प्रविष्टि गर्नुहोस्।");
      return;
    }

    const identifier = signupTarget === "normal_user" 
      ? userIdentifier.trim() 
      : (empOtpChannel === "email" ? empEmail.trim() : empPhone.trim());

    setIsLoading(true);
    const res = await verifyOtp(identifier, fullCode, signupTarget === "employee" ? "employee_signup" : "user_signup");
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage("OTP प्रमाणीकरण सफल भयो!");
      setSignupStep(3); // Proceed to password creation
    } else {
      setErrorMessage(res.error || "OTP मिलेन।");
    }
  };

  // Handle OTP individual digit change & paste
  const handleOtpDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      // Handle Paste
      const pasted = val.replace(/\D/g, "").slice(0, 6);
      const newArr = [...otpCode];
      for (let i = 0; i < 6; i++) {
        newArr[i] = pasted[i] || "";
      }
      setOtpCode(newArr);
      const nextIdx = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
      return;
    }

    const newArr = [...otpCode];
    newArr[index] = val;
    setOtpCode(newArr);

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // --------------------------------------------------------------------------
  // 4. CREATE PASSWORD & COMPLETE SIGNUP
  // --------------------------------------------------------------------------
  const handleFinalPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (createPassword.length < 6) {
      setErrorMessage("पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।");
      return;
    }

    if (createPassword !== confirmPassword) {
      setErrorMessage("दुवै पासवर्ड मिलेन। कृपया पुनः जाँच्नुहोस्।");
      return;
    }

    setIsLoading(true);

    if (signupTarget === "normal_user") {
      const res = await signupUser({
        name: userName.trim() || "नागरिक",
        identifier: userIdentifier.trim(),
        password: createPassword
      });
      setIsLoading(false);

      if (res.success) {
        setSignupStep(4);
        setSuccessMessage("खाता सफलतापूर्वक सिर्जना भयो!");
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1200);
      } else {
        setErrorMessage(res.error || "खाता सिर्जना गर्न सकिएन।");
      }
    } else {
      // Employee Signup: automatically compute office address from chosen palika and district
      const palikaObj = availablePalikas.find(p => p.id === empPalikaId);
      const districtObj = KOSHI_DISTRICTS.find(d => d.id === empDistrictId);
      const autoAddress = `${palikaObj?.name_ne || "स्थानीय तह कार्यालय"}, ${districtObj?.name_ne || "पाँचथर"}`;

      const res = await signupEmployee({
        name: empName.trim(),
        address: autoAddress,
        district_id: empDistrictId,
        local_government_id: empPalikaId,
        email: empEmail.trim() || undefined,
        phone: empPhone.trim(),
        password: createPassword
      });
      setIsLoading(false);

      if (res.success) {
        setSignupStep(4);
        setSuccessMessage("कर्मचारी खाता सफलतापूर्वक दर्ता भयो! (Pending Approval)");
      } else {
        setErrorMessage(res.error || "कर्मचारी खाता दर्ता गर्न सकिएन।");
      }
    }
  };

  // Demo Quick Logins for Testing
  const handleQuickLogin = async (id: string, pass: string) => {
    setSignInIdentifier(id);
    setSignInPassword(pass);
    setErrorMessage("");
    setPendingAccountNotice(null);
    setIsLoading(true);
    const res = await login(id, pass);
    setIsLoading(false);
    if (res.success) {
      setSuccessMessage(`स्वागत छ, ${res.user?.name}!`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 500);
    } else {
      if (res.account_status === "pending") {
        setPendingAccountNotice(res.details || res.error || "खाता हाल Pending Approval अवस्थामा छ।");
      } else {
        setErrorMessage(res.error || "लगइन असफल भयो।");
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="unified-auth-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="bg-linear-to-r from-blue-950 to-indigo-950 text-white p-5 border-b-2 border-amber-500 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="unified-auth-title" className="font-black text-base text-white flex items-center gap-2">
                <span>अपाङ्गता सूचना केन्द्र (DIC)</span>
              </h2>
              <p className="text-xs text-blue-200/80 font-medium">
                सुरक्षित प्रमाणीकरण तथा पहुँच प्रणाली
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Mode Tabs: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1.5 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMainTab("signin");
              setErrorMessage("");
              setPendingAccountNotice(null);
            }}
            className={`py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mainTab === "signin"
                ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In (लगइन)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMainTab("signup");
              setSignupTarget("choose");
              setSignupStep(1);
              setErrorMessage("");
              setPendingAccountNotice(null);
            }}
            className={`py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mainTab === "signup"
                ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up (नयाँ खाता बनाउनुहोस्)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Pending Account Notice (Requirement 20) */}
          {pendingAccountNotice && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border-2 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Clock className="w-5 h-5 text-amber-600 animate-spin" />
                <span>तपाईंको कर्मचारी खाता हाल Pending Approval अवस्थामा छ!</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                तपाईंको खाता दर्ता सम्पन्न भइसकेको छ तर प्रशासकबाट अनुमोदन (Approval) हुन बाँकी छ।
              </p>
              <div className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 font-semibold text-xs border border-amber-200 dark:border-amber-800">
                📞 खाता स्वीकृतिका लागि सम्पर्क गर्नुहोस्: <br />
                <a href="tel:+9779842661754" className="text-blue-600 font-mono font-bold">+977-9842661754</a> वा{" "}
                <a href="tel:+9779827384434" className="text-blue-600 font-mono font-bold">+977-9827384434</a>
              </div>

              {pendingUserId && (
                <button
                  type="button"
                  onClick={handleQuickApprovePending}
                  disabled={isLoading}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition disabled:opacity-50 mt-1"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>⚡ परीक्षणका लागि Admin बाट तत्काल Approve गर्नुहोस्</span>
                </button>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* A. SIGN IN TAB */}
          {/* ========================================================================= */}
          {mainTab === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  User ID / Email / Mobile Number *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    placeholder="DIC-EMP-000002 वा email@example.com वा ९८XXXXXXXX"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    पासवर्ड *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      alert("पासवर्ड रिसेट गर्न आफ्नो आधिकारिक Email वा Mobile नम्बर प्रयोग गर्नुहोस्। OTP मार्फत नयाँ पासवर्ड सेट गर्न सकिन्छ।");
                    }}
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    पासवर्ड बिर्सनुभयो?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="तपाईंको पासवर्ड..."
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span>जाँच हुँदैछ...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In गर्नुहोस्</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* B. SIGN UP TAB */}
          {/* ========================================================================= */}
          {mainTab === "signup" && (
            <div>
              {/* STEP 0: CHOOSE SIGNUP TYPE */}
              {signupTarget === "choose" && (
                <div className="space-y-4 py-2">
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      खाताको प्रकार छनौट गर्नुहोस्
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">
                      तपाईं कुन रूपमा अपाङ्गता सूचना केन्द्रमा दर्ता हुन चाहनुहुन्छ?
                    </p>
                  </div>

                  {/* Option A: Employee */}
                  <button
                    type="button"
                    onClick={() => {
                      setSignupTarget("employee");
                      setSignupStep(1);
                      setErrorMessage("");
                    }}
                    className="w-full p-4 rounded-2xl border-2 border-blue-500/30 hover:border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 text-left transition hover:shadow-md flex items-start gap-3.5 group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                        <span>कर्मचारीका लागि Sign Up</span>
                        <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        स्थानीय तहका अपाङ्गता सहायता सहजकर्ता वा फोकल पर्सन। वार्षिक प्रतिवेदन प्रविष्टि तथा स्थानीय सेवा व्यवस्थापनका लागि।
                      </p>
                      <span className="inline-block mt-2 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                        ⏳ दर्तापछि Admin Approval आवश्यक पर्दछ
                      </span>
                    </div>
                  </button>

                  {/* Option B: Normal User */}
                  <button
                    type="button"
                    onClick={() => {
                      setSignupTarget("normal_user");
                      setSignupStep(1);
                      setErrorMessage("");
                    }}
                    className="w-full p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-600 bg-slate-50 dark:bg-slate-800 text-left transition hover:shadow-md flex items-start gap-3.5 group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                        <span>सम्पूर्ण सामान्य Users का लागि Sign Up</span>
                        <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        अपाङ्गता भएका व्यक्ति, अभिभावक, अनुसन्धानकर्ता वा आम नागरिक। कानुन, प्रतिवेदन, AI च्याटबोट तथा गुनासो सेवाका लागि।
                      </p>
                      <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        ⚡ OTP प्रमाणीकरणपछि तुरुन्त सक्रिय (Immediate Access)
                      </span>
                    </div>
                  </button>
                </div>
              )}

              {/* STEP 1: FILL INFORMATION */}
              {signupTarget !== "choose" && signupStep === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSignupTarget("choose")}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 flex items-center gap-1 font-semibold text-xs cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>प्रकार फेर्नुहोस्</span>
                    </button>
                    <span className="font-bold text-blue-600 text-xs">
                      {signupTarget === "employee" ? "🏛️ कर्मचारी दर्ता फारम" : "👤 सामान्य नागरिक दर्ता"}
                    </span>
                  </div>

                  {signupTarget === "normal_user" ? (
                    /* NORMAL USER FIELDS */
                    <>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          पूरा नाम (ऐच्छिक)
                        </label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="तपाईंको नाम (उदा. रमेश श्रेष्ठ)"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Gmail / Email वा Mobile Number *
                        </label>
                        <input
                          type="text"
                          value={userIdentifier}
                          onChange={(e) => setUserIdentifier(e.target.value)}
                          placeholder="name@example.com वा ९८XXXXXXXX"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">
                          यस ठेगानामा ६-अंकको OTP कोड पठाइनेछ।
                        </p>
                      </div>
                    </>
                  ) : (
                    /* EMPLOYEE FIELDS (Requirement 13 & 14) */
                    <>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          पूरा नाम *
                        </label>
                        <input
                          type="text"
                          value={empName}
                          onChange={(e) => setEmpName(e.target.value)}
                          placeholder="सहायता सहजकर्ताको नाम"
                          required
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                            जिल्ला चयन गर्नुहोस् *
                          </label>
                          <select
                            value={empDistrictId}
                            onChange={(e) => {
                              setEmpDistrictId(e.target.value);
                              const dist = KOSHI_DISTRICTS.find(d => d.id === e.target.value);
                              if (dist && dist.local_governments.length > 0) {
                                setEmpPalikaId(dist.local_governments[0].id);
                              }
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                          >
                            {KOSHI_DISTRICTS.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name_ne}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                            स्थानीय तह चयन गर्नुहोस् *
                          </label>
                          <select
                            value={empPalikaId}
                            onChange={(e) => setEmpPalikaId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                          >
                            {availablePalikas.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name_ne}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                            <span>आधिकारिक Gmail / Email *</span>
                            {empOtpChannel === "email" && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                ✓ OTP यहाँ आउनेछ
                              </span>
                            )}
                          </label>
                          <input
                            type="email"
                            value={empEmail}
                            onChange={(e) => setEmpEmail(e.target.value)}
                            placeholder="yourname@gmail.com"
                            required={empOtpChannel === "email"}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                            <span>सम्पर्क मोबाइल नम्बर *</span>
                            {empOtpChannel === "phone" && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                ✓ OTP यहाँ आउनेछ
                              </span>
                            )}
                          </label>
                          <input
                            type="text"
                            value={empPhone}
                            onChange={(e) => setEmpPhone(e.target.value)}
                            placeholder="९८XXXXXXXX"
                            required
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      {/* OTP Delivery Channel Selector */}
                      <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                        <label className="block text-[11px] font-bold text-blue-950 dark:text-blue-200 mb-1.5">
                          सुरक्षा OTP पठाउने माध्यम छनौट गर्नुहोस् (OTP Delivery Channel) *:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setEmpOtpChannel("email")}
                            className={`p-2 rounded-xl border text-left cursor-pointer transition flex items-center gap-2 ${
                              empOtpChannel === "email"
                                ? "bg-blue-900 text-white border-blue-900 shadow-xs"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <Mail className={`w-4 h-4 shrink-0 ${empOtpChannel === "email" ? "text-amber-300" : "text-blue-600"}`} />
                            <div>
                              <div className="text-xs font-bold">Gmail मा (द्रुत)</div>
                              <div className={`text-[10px] ${empOtpChannel === "email" ? "text-blue-200" : "text-slate-500"}`}>
                                इमेलमा कोड आउने
                              </div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEmpOtpChannel("phone")}
                            className={`p-2 rounded-xl border text-left cursor-pointer transition flex items-center gap-2 ${
                              empOtpChannel === "phone"
                                ? "bg-blue-900 text-white border-blue-900 shadow-xs"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <Smartphone className={`w-4 h-4 shrink-0 ${empOtpChannel === "phone" ? "text-emerald-400" : "text-slate-600"}`} />
                            <div>
                              <div className="text-xs font-bold">मोबाइल SMS मा</div>
                              <div className={`text-[10px] ${empOtpChannel === "phone" ? "text-blue-200" : "text-slate-500"}`}>
                                फोन म्यासेजमा आउने
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>OTP पठाउँदै...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>OTP पठाउनुहोस् (Send OTP)</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: ENTER OTP (Accessible 6-digit box) */}
              {signupTarget !== "choose" && signupStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
                  <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                    <div className="font-bold text-blue-900 dark:text-blue-200 text-xs flex items-center justify-center gap-1.5">
                      {signupTarget === "employee" && empOtpChannel === "email" ? (
                        <>
                          <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span>Gmail मा OTP द्रुत गतिमा पठाइएको छ</span>
                        </>
                      ) : (
                        <span>६-अंकको OTP कोड प्रविष्टि गर्नुहोस्</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                      {signupTarget === "normal_user" ? (
                        <>{userIdentifier} मा पठाइएको कोड हाल्नुहोस्।</>
                      ) : empOtpChannel === "email" ? (
                        <>तपाईंको आधिकारिक Gmail <strong className="text-blue-700 dark:text-blue-300 font-mono">{empEmail}</strong> मा पठाइएको सुरक्षा कोड हाल्नुहोस्।</>
                      ) : (
                        <>तपाईंको मोबाइल नम्बर <strong className="text-blue-700 dark:text-blue-300 font-mono">{empPhone}</strong> मा पठाइएको कोड हाल्नुहोस्।</>
                      )}
                    </p>
                    {otpPreview && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-700 space-y-1.5 text-center">
                        <div className="text-amber-900 dark:text-amber-200 font-mono text-xs font-bold flex items-center justify-center gap-2">
                          <span>द्रुत परीक्षण OTP कोड:</span>
                          <span className="text-base font-black text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-amber-300 shadow-xs">
                            {otpPreview}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const digits = otpPreview.split("").slice(0, 6);
                            setOtpCode(digits);
                            otpInputRefs.current[5]?.focus();
                          }}
                          className="w-full text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-black px-3 py-1.5 rounded-xl cursor-pointer shadow-xs transition active:scale-98 flex items-center justify-center gap-1.5"
                        >
                          <span>⚡ यो कोड स्वतः भर्नुहोस् (Auto-fill OTP)</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 6 Digit Input Boxes */}
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5 my-3" role="group" aria-label="OTP का ६ अंकहरू">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpInputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-10 h-12 text-center text-lg font-bold rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
                        aria-label={`अंक ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <button
                      type="button"
                      onClick={() => setSignupStep(1)}
                      className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                    >
                      ← विवरण सच्याउनुहोस्
                    </button>

                    <button
                      type="button"
                      disabled={otpTimer > 0}
                      onClick={handleSendOtp}
                      className="text-blue-600 font-bold hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      {otpTimer > 0 ? `पुन: पठाउन (${otpTimer}s)` : "OTP पुन: पठाउनुहोस्"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.join("").length < 6}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {isLoading ? <span>जाँचिँदैछ...</span> : <span>OTP प्रमाणीकरण गर्नुहोस् (Verify)</span>}
                  </button>
                </form>
              )}

              {/* STEP 3: CREATE PASSWORD */}
              {signupTarget !== "choose" && signupStep === 3 && (
                <form onSubmit={handleFinalPasswordSubmit} className="space-y-3.5">
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>OTP प्रमाणीकरण सफल भयो। अब सुरक्षित पासवर्ड बनाउनुहोस्।</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      नयाँ पासवर्ड बनाउनुहोस् * (कम्तीमा ६ अक्षर)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={createPassword}
                        onChange={(e) => setCreatePassword(e.target.value)}
                        placeholder="नयाँ पासवर्ड..."
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      पासवर्ड पुनः प्रविष्टि गर्नुहोस् (Confirm) *
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="पासवर्ड दोहोर्‍याउनुहोस्..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>खाता सिर्जना गर्दै...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>खाता सिर्जना पूरा गर्नुहोस् (Complete Sign Up)</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 4: REGISTRATION COMPLETE CONFIRMATION (Employee Pending Notice) */}
              {signupTarget === "employee" && signupStep === 4 && (
                <div className="text-center space-y-4 py-2">
                  <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8" />
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    कर्मचारी खाता सफलतापूर्वक दर्ता भयो!
                  </h3>

                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-left text-xs text-amber-900 dark:text-amber-200 space-y-2">
                    <p className="font-bold">
                      ⚠️ तपाईंको खाता हाल <strong>Pending Approval</strong> अवस्थामा छ।
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      तपाईंको कर्मचारी खाता सफलतापूर्वक दर्ता भएको छ। तर तपाईं थप अघि बढ्नका लागि Admin बाट खाता स्वीकृत हुन आवश्यक छ। कृपया थप प्रक्रियाका लागि <strong>+9779842661754</strong> वा <strong>+9779827384434</strong> मा Admin लाई सम्पर्क गर्नुहोस्। Admin ले तपाईंको खाता Approve गरेपछि मात्र तपाईं प्रणालीमा प्रवेश गरी स्थानीय सरकार वार्षिक प्रतिवेदन सम्पादन गर्न सक्नुहुनेछ।
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMainTab("signin");
                      setSignupStep(1);
                      setSignupTarget("choose");
                    }}
                    className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700"
                  >
                    Sign In पृष्ठमा जानुहोस्
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
