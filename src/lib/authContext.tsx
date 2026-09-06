"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState, UserRole, AccountStatus } from "@/types/auth";
import { findPalikaById } from "@/lib/koshiGeography";

export interface RegisterUserParams {
  name: string;
  identifier: string; // email or mobile
  password: string;
  address?: string;
}

export interface RegisterEmployeeParams {
  name: string;
  address: string;
  district_id: string;
  local_government_id: string;
  email?: string;
  phone: string;
  password: string;
}

interface AuthContextType extends AuthState {
  login: (identifier: string, pass: string) => Promise<{ success: boolean; user?: User; error?: string; account_status?: string; details?: string; userId?: string; user_id?: string }>;
  signupUser: (params: RegisterUserParams) => Promise<{ success: boolean; user?: User; error?: string }>;
  signupEmployee: (params: RegisterEmployeeParams) => Promise<{ success: boolean; user?: User; error?: string; pendingNotice?: string }>;
  sendOtp: (identifier: string, purpose?: "user_signup" | "employee_signup" | "forgot_password", name?: string) => Promise<{ success: boolean; message?: string; expires_at?: number; preview_code?: string; error?: string }>;
  verifyOtp: (identifier: string, code: string, purpose: "user_signup" | "employee_signup" | "forgot_password") => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  canEditPalika: (palikaId: string) => boolean;
  refreshUser: () => Promise<void>;
  
  // Backward compatibility methods
  signup: (name: string, email: string, phone: string, pass: string, palikaId: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem("dic_current_user_session_v2") || localStorage.getItem("dic_current_user_session");
      if (savedSession) {
        setUser(JSON.parse(savedSession));
      }
    } catch (e) {
      console.error("Failed to load auth session", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh user data from server
  const refreshUser = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/admin/accounts?role=all`);
      if (res.ok) {
        const data = await res.json();
        const fresh = data.users?.find((u: User) => u.id === user.id || u.user_id === user.user_id);
        if (fresh) {
          setUser(fresh);
          localStorage.setItem("dic_current_user_session_v2", JSON.stringify(fresh));
        }
      }
    } catch {
      // ignore
    }
  };

  // 1. Send OTP
  const sendOtp = async (
    identifier: string, 
    purpose: "user_signup" | "employee_signup" | "forgot_password" = "user_signup",
    name?: string
  ): Promise<{ success: boolean; message?: string; expires_at?: number; preview_code?: string; error?: string }> => {
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, purpose, name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP पठाउन सकिएन।");
      return data;
    } catch (err: any) {
      return { success: false, error: err.message || "OTP पठाउन समस्या आयो।" };
    }
  };

  // 2. Verify OTP
  const verifyOtp = async (
    identifier: string, 
    code: string, 
    purpose: "user_signup" | "employee_signup" | "forgot_password" = "user_signup"
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, code, purpose })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP मिलेन।");
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "OTP प्रमाणीकरण असफल भयो।" };
    }
  };

  // 3. Register Normal User
  const signupUser = async (params: RegisterUserParams): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const res = await fetch("/api/auth/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "दर्ता गर्न सकिएन।");

      // Auto login newly registered normal user
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("dic_current_user_session_v2", JSON.stringify(data.user));
      }
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || "खाता दर्ता गर्न समस्या भयो।" };
    }
  };

  // 4. Register Employee
  const signupEmployee = async (params: RegisterEmployeeParams): Promise<{ success: boolean; user?: User; error?: string; pendingNotice?: string }> => {
    try {
      const res = await fetch("/api/auth/register-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "कर्मचारी दर्ता गर्न सकिएन।");

      // Note: Employee is PENDING, so do NOT set active session until Super Admin approves!
      return { success: true, user: data.user, pendingNotice: data.pendingNotice };
    } catch (err: any) {
      return { success: false, error: err.message || "कर्मचारी दर्तामा समस्या आयो।" };
    }
  };

  // 5. Login
  const login = async (
    identifier: string, 
    pass: string
  ): Promise<{ 
    success: boolean; 
    user?: User; 
    error?: string; 
    account_status?: string; 
    details?: string;
    userId?: string;
    user_id?: string;
  }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password: pass })
      });
      const data = await res.json();

      if (!res.ok) {
        return { 
          success: false, 
          error: data.error || "लगइन गर्न सकिएन।",
          account_status: data.account_status,
          userId: data.userId || data.user_id,
          user_id: data.user_id || data.userId,
          details: data.details
        };
      }

      const loggedUser = data.user;
      setUser(loggedUser);
      localStorage.setItem("dic_current_user_session_v2", JSON.stringify(loggedUser));
      return { success: true, user: loggedUser };

    } catch (err: any) {
      return { success: false, error: err.message || "लगइन प्रक्रियामा समस्या आयो।" };
    }
  };

  // 6. Logout
  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("dic_current_user_session_v2");
      localStorage.removeItem("dic_current_user_session");
      window.dispatchEvent(new CustomEvent("dic_auth_changed", { detail: null }));
    } catch {}
  };

  // 7. Strict Palika Edit Permission (Requirement 33)
  const canEditPalika = (palikaId: string): boolean => {
    if (!user) return false;

    // Super Admin has universal review/management access
    if (user.role === "super_admin" || user.role === "provincial_admin") {
      return true;
    }

    // Approved Employee can ONLY edit their own assigned local government
    if (user.role === "employee" || user.role === "palika_staff") {
      if (user.account_status !== "approved") return false;
      const assigned = user.local_government_id || user.palika_id || user.palikaId;
      return assigned === palikaId;
    }

    // Normal users have NO edit access
    return false;
  };

  // Backward compatibility alias methods
  const signup = async (name: string, email: string, phone: string, pass: string, palikaId: string) => {
    return signupEmployee({
      name,
      address: "कोशी प्रदेश",
      district_id: "panchthar",
      local_government_id: palikaId,
      email,
      phone,
      password: pass
    });
  };

  const register = async (data: any) => {
    if (typeof data === "object" && data.role === "normal_user") {
      return signupUser({
        name: data.name || "",
        identifier: data.email || data.phone || "",
        password: data.password || data.pass || "123456",
        address: data.address
      });
    }
    return signupEmployee({
      name: data.name || "",
      address: data.address || "कोशी प्रदेश",
      district_id: data.district_id || data.districtId || "panchthar",
      local_government_id: data.local_government_id || data.palikaId || data.palika_id || "phidim_mun",
      email: data.email,
      phone: data.phone || "",
      password: data.password || data.pass || "123456"
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signupUser,
        signupEmployee,
        sendOtp,
        verifyOtp,
        logout,
        canEditPalika,
        refreshUser,
        signup,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
