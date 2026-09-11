"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { FooterConfig } from "@/types/footer";
import { DEFAULT_FOOTER_CONFIG } from "./footerConstants";
import { useAuth } from "./authContext";

interface FooterContextType {
  footerConfig: FooterConfig;
  isLoading: boolean;
  isSaving: boolean;
  saveFooterConfig: (newConfig: FooterConfig) => Promise<{ success: boolean; error?: string; message?: string }>;
  resetFooterConfigToDefault: () => Promise<{ success: boolean; error?: string; message?: string }>;
  refreshFooter: () => Promise<void>;
}

const FooterContext = createContext<FooterContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "dic_footer_cache_v1";

export function FooterProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize from localStorage cache if available
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object" && parsed.app_name_ne) {
          setFooterConfig(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed to read footer cache:", e);
    }
  }, []);

  // Fetch from API
  const refreshFooter = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/footer", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.config) {
          setFooterConfig(data.config);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.config));
          } catch (e) {
            console.warn("Failed to cache footer config:", e);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to fetch footer config from server, using cached/default:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFooter();

    // Listen to custom cross-tab or in-page update events
    const handleFooterUpdated = () => {
      refreshFooter();
    };

    window.addEventListener("dic_footer_updated", handleFooterUpdated);
    window.addEventListener("storage", (e) => {
      if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
        try {
          setFooterConfig(JSON.parse(e.newValue));
        } catch {}
      }
    });

    return () => {
      window.removeEventListener("dic_footer_updated", handleFooterUpdated);
    };
  }, [refreshFooter]);

  // Save footer changes (Admin only)
  const saveFooterConfig = async (newConfig: FooterConfig) => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/footer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": user?.role || "",
          "x-admin-id": user?.id || "",
        },
        body: JSON.stringify({
          user: user ? { id: user.id, name: user.name, role: user.role } : undefined,
          action: "update",
          config: newConfig,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "फुटर सुरक्षित गर्न सकिएन।" };
      }

      setFooterConfig(data.config);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.config));
      } catch {}

      // Broadcast event so any open component updates immediately
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("dic_footer_updated"));
      }

      return { success: true, message: data.message || "फुटर सफलतापूर्वक सुरक्षित गरियो।" };
    } catch (err: any) {
      console.error("saveFooterConfig error:", err);
      return { success: false, error: err.message || "नेटवर्क समस्या आयो।" };
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const resetFooterConfigToDefault = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/footer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": user?.role || "",
          "x-admin-id": user?.id || "",
        },
        body: JSON.stringify({
          user: user ? { id: user.id, name: user.name, role: user.role } : undefined,
          action: "reset",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "रिसेट गर्न सकिएन।" };
      }

      setFooterConfig(data.config);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.config));
      } catch {}

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("dic_footer_updated"));
      }

      return { success: true, message: data.message || "फुटर रिसेट गरियो।" };
    } catch (err: any) {
      console.error("resetFooterConfigToDefault error:", err);
      return { success: false, error: err.message || "नेटवर्क समस्या आयो।" };
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FooterContext.Provider
      value={{
        footerConfig,
        isLoading,
        isSaving,
        saveFooterConfig,
        resetFooterConfigToDefault,
        refreshFooter,
      }}
    >
      {children}
    </FooterContext.Provider>
  );
}

export function useFooter(): FooterContextType {
  const context = useContext(FooterContext);
  if (!context) {
    // If used outside FooterProvider, provide graceful fallback
    return {
      footerConfig: DEFAULT_FOOTER_CONFIG,
      isLoading: false,
      isSaving: false,
      saveFooterConfig: async () => ({ success: false, error: "FooterProvider not found", message: undefined }),
      resetFooterConfigToDefault: async () => ({ success: false, error: "FooterProvider not found", message: undefined }),
      refreshFooter: async () => {},
    };
  }
  return context;
}
