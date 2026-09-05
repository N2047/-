"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "@/types/auth";
import { findPalikaById } from "@/lib/koshiGeography";

export interface RegisterParams {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  pass?: string;
  palikaId?: string;
  palika_id?: string;
  palikaName?: string;
  districtId?: string;
  districtName?: string;
  role?: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    phone: string,
    pass: string,
    palikaId: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    nameOrData: string | RegisterParams,
    email?: string,
    phone?: string,
    pass?: string,
    palikaId?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  canEditPalika: (palikaId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default Pre-seeded accounts
const PRE_SEEDED_USERS: (User & { password_hash: string })[] = [
  {
    id: "admin-master-001",
    name: "मुख्य प्रशासक (Super Admin)",
    email: "admin@dic.gov.np",
    password_hash: "admin123",
    role: "provincial_admin",
    created_at: "2026-01-01",
  },
  {
    id: "staff-phidim-002",
    name: "फिदिम सहायता सहजकर्ता",
    email: "phidim.staff@gmail.com",
    password_hash: "phidim123",
    role: "palika_staff",
    palika_id: "phidim_mun",
    palika_name: "फिदिम नगरपालिका",
    district_name: "पाँचथर",
    phone: "९८४१२३४५६७",
    created_at: "2026-01-01",
  },
  {
    id: "staff-dharan-003",
    name: "धरान सहायता सहजकर्ता",
    email: "dharan.staff@gmail.com",
    password_hash: "dharan123",
    role: "palika_staff",
    palika_id: "dharan_submet",
    palika_name: "धरान उपमहानगरपालिका",
    district_name: "सुनसरी",
    phone: "९८५२०००१११",
    created_at: "2026-01-01",
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem("dic_current_user_session");
      if (savedSession) {
        setUser(JSON.parse(savedSession));
      }
    } catch (e) {
      console.error("Failed to load auth session", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper to get all registered users (pre-seeded + registered)
  const getAllUsers = () => {
    try {
      const customUsersJson = localStorage.getItem("dic_custom_registered_users");
      const customUsers = customUsersJson ? JSON.parse(customUsersJson) : [];
      return [...PRE_SEEDED_USERS, ...customUsers];
    } catch {
      return PRE_SEEDED_USERS;
    }
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const allUsers = getAllUsers();
    const found = allUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password_hash === pass
    );

    if (found) {
      const sessionUser: User = {
        id: found.id,
        name: found.name,
        email: found.email,
        phone: found.phone,
        role: found.role,
        palika_id: found.palika_id,
        palika_name: found.palika_name,
        district_name: found.district_name,
        palikaId: found.palika_id,
        palikaName: found.palika_name,
        districtName: found.district_name,
        created_at: found.created_at,
      };
      setUser(sessionUser);
      localStorage.setItem("dic_current_user_session", JSON.stringify(sessionUser));
      return { success: true };
    }

    return {
      success: false,
      error: "इमेल वा पासवर्ड मिलेन। कृपया पुनः जाँच गर्नुहोस्।",
    };
  };

  const signup = async (
    name: string,
    email: string,
    phone: string,
    pass: string,
    palikaId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim()) return { success: false, error: "कृपया आफ्नो पूरा नाम लेख्नुहोस्।" };
    if (!cleanEmail || !cleanEmail.includes("@")) return { success: false, error: "कृपया मान्य इमेल (Gmail) लेख्नुहोस्।" };
    if (pass.length < 6) return { success: false, error: "पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।" };
    if (!palikaId) return { success: false, error: "कृपया आफ्नो स्थानीय तह चयन गर्नुहोस्।" };

    const allUsers = getAllUsers();
    if (allUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: "यो इमेल पहिले नै दर्ता भइसकेको छ। कृपया लगइन गर्नुहोस्।" };
    }

    // Resolve palika metadata
    const palikaData = findPalikaById(palikaId);
    const palikaName = palikaData?.palika.name_ne || palikaId;
    const districtName = palikaData?.district.name_ne || "";

    const newUser = {
      id: "usr-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      password_hash: pass,
      role: "palika_staff" as const,
      palika_id: palikaId,
      palika_name: palikaName,
      district_name: districtName,
      created_at: new Date().toISOString(),
    };

    try {
      const customUsersJson = localStorage.getItem("dic_custom_registered_users");
      const customUsers = customUsersJson ? JSON.parse(customUsersJson) : [];
      customUsers.push(newUser);
      localStorage.setItem("dic_custom_registered_users", JSON.stringify(customUsers));

      const sessionUser: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        palika_id: newUser.palika_id,
        palika_name: newUser.palika_name,
        district_name: newUser.district_name,
        palikaId: newUser.palika_id,
        palikaName: newUser.palika_name,
        districtName: newUser.district_name,
        created_at: newUser.created_at,
      };
      setUser(sessionUser);
      localStorage.setItem("dic_current_user_session", JSON.stringify(sessionUser));
      return { success: true };
    } catch (e) {
      return { success: false, error: "खाता सिर्जना गर्न समस्या भयो। कृपया पुनः प्रयास गर्नुहोस्।" };
    }
  };

  const register = async (
    nameOrData: string | RegisterParams,
    email?: string,
    phone?: string,
    pass?: string,
    palikaId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (typeof nameOrData === "object" && nameOrData !== null) {
      const p = nameOrData;
      return signup(
        p.name || "",
        p.email || "",
        p.phone || "",
        p.password || p.pass || "staff123",
        p.palikaId || p.palika_id || ""
      );
    }
    return signup(
      nameOrData,
      email || "",
      phone || "",
      pass || "",
      palikaId || ""
    );
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("dic_current_user_session");
    } catch {}
  };

  const canEditPalika = (palikaId: string): boolean => {
    if (!user) return false;
    if (user.role === "provincial_admin") return true;
    return user.palika_id === palikaId || user.palikaId === palikaId;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        register,
        logout,
        canEditPalika,
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
