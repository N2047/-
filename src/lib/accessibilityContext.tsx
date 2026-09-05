"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

export type ColorMode = "normal" | "high-contrast" | "soft";
export type FontSizePercent = 100 | 150 | 180;
export type MotionMode = "normal" | "reduced" | "off";
export type SpeechSpeed = "slow" | "normal" | "fast";
export type SpeechVolume = "low" | "medium" | "high";

export interface AccessibilitySettings {
  colorMode: ColorMode;
  darkMode: boolean;
  fontSize: FontSizePercent;
  audioPin: boolean;
  speechSpeed: SpeechSpeed;
  speechVolume: SpeechVolume;
  focusHighlight: boolean;
  focusZoom: boolean;
  cardZoom: boolean;
  motion: MotionMode;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  colorMode: "normal",
  darkMode: false,
  fontSize: 100,
  audioPin: false,
  speechSpeed: "normal",
  speechVolume: "medium",
  focusHighlight: true,
  focusZoom: true,
  cardZoom: true,
  motion: "normal",
};

interface AccessibilityContextType extends AccessibilitySettings {
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
  setColorMode: (mode: ColorMode) => void;
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;
  setFontSize: (size: FontSizePercent) => void;
  setAudioPin: (enabled: boolean) => void;
  toggleAudioPin: () => void;
  setSpeechSpeed: (speed: SpeechSpeed) => void;
  setSpeechVolume: (volume: SpeechVolume) => void;
  setFocusHighlight: (enabled: boolean) => void;
  setFocusZoom: (enabled: boolean) => void;
  setCardZoom: (enabled: boolean) => void;
  setMotion: (motion: MotionMode) => void;
  resetSettings: () => void;
  announceLive: (message: string, priority?: "polite" | "assertive") => void;
  speakText: (text: string, force?: boolean) => void;
  stopSpeech: () => void;
  liveMessage: { text: string; priority: "polite" | "assertive" } | null;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [liveMessage, setLiveMessage] = useState<{ text: string; priority: "polite" | "assertive" } | null>(null);

  const lastSpokenTextRef = useRef<string>("");
  const hoverDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isKeyboardNavRef = useRef<boolean>(false);

  // 1. Load settings from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dic_accessibility_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error("Failed to load accessibility settings", e);
    }
  }, []);

  // 2. Persist settings to localStorage and apply dataset attributes to DOM
  useEffect(() => {
    try {
      localStorage.setItem("dic_accessibility_settings", JSON.stringify(settings));
    } catch {}

    const html = document.documentElement;
    html.setAttribute("data-theme", settings.darkMode ? "dark" : "light");
    html.setAttribute("data-dark-mode", settings.darkMode ? "true" : "false");
    html.setAttribute("data-color-mode", settings.colorMode);
    html.setAttribute("data-font-size", settings.fontSize.toString());
    html.setAttribute("data-focus-highlight", settings.focusHighlight ? "true" : "false");
    html.setAttribute("data-focus-zoom", settings.focusZoom ? "true" : "false");
    html.setAttribute("data-card-zoom", settings.cardZoom ? "true" : "false");
    html.setAttribute("data-motion", settings.motion);
    html.setAttribute("data-audio-pin", settings.audioPin ? "true" : "false");

    // Dynamic Font scaling calculation
    let scaleRem = "1rem";
    if (settings.fontSize === 150) scaleRem = "1.25rem";
    if (settings.fontSize === 180) scaleRem = "1.45rem";
    html.style.setProperty("--font-scale", scaleRem);
  }, [settings]);

  // ARIA Live region dispatcher
  const announceLive = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    if (!message) return;
    setLiveMessage({ text: message, priority });
    const timer = setTimeout(() => {
      setLiveMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Stop active speech
  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Speech Synthesis Engine with Nepali / English detection
  const speakText = useCallback(
    (rawText: string, force = false) => {
      if ((!settings.audioPin && !force) || typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }

      const text = rawText.trim();
      if (!text || text === lastSpokenTextRef.current) return;
      lastSpokenTextRef.current = text;

      stopSpeech();

      try {
        const utterance = new SpeechSynthesisUtterance(text);

        // Speed conversion
        let rate = 1.0;
        if (settings.speechSpeed === "slow") rate = 0.8;
        if (settings.speechSpeed === "fast") rate = 1.25;
        utterance.rate = rate;

        // Volume conversion
        let volume = 1.0;
        if (settings.speechVolume === "low") volume = 0.5;
        if (settings.speechVolume === "medium") volume = 0.85;
        utterance.volume = volume;

        // Language detection: Devanagari range [\u0900-\u097F]
        const isNepali = /[\u0900-\u097F]/.test(text);
        const voices = window.speechSynthesis.getVoices();

        if (isNepali) {
          utterance.lang = "ne-NP";
          // Try to find a Nepali voice or graceful fallback to Hindi / Indian locale
          const nepaliVoice = voices.find(
            (v) => v.lang.startsWith("ne") || v.lang.toLowerCase().includes("nepali")
          );
          const hindiVoice = voices.find(
            (v) => v.lang.startsWith("hi") || v.lang.toLowerCase().includes("hindi")
          );
          if (nepaliVoice) {
            utterance.voice = nepaliVoice;
          } else if (hindiVoice) {
            utterance.voice = hindiVoice;
          }
        } else {
          utterance.lang = "en-US";
          const engVoice = voices.find(
            (v) => v.lang.startsWith("en") && !v.name.includes("whisper")
          );
          if (engVoice) utterance.voice = engVoice;
        }

        utterance.onend = () => {
          setTimeout(() => {
            lastSpokenTextRef.current = "";
          }, 600);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis error", err);
      }
    },
    [settings.audioPin, settings.speechSpeed, settings.speechVolume, stopSpeech]
  );

  // Helper to extract clean accessible text from an element
  const getElementAccessibleText = (el: HTMLElement): string => {
    // 1. Explicit ARIA label or labelledby
    const ariaLabel = el.getAttribute("aria-label");
    if (ariaLabel) return ariaLabel;

    const ariaLabelledBy = el.getAttribute("aria-labelledby");
    if (ariaLabelledBy) {
      const labelElem = document.getElementById(ariaLabelledBy);
      if (labelElem && labelElem.textContent) return labelElem.textContent.trim();
    }

    // 2. Input/Select associated label
    if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
      if (el.id) {
        const label = document.querySelector(`label[for="${el.id}"]`);
        if (label && label.textContent) {
          const typeName = el instanceof HTMLSelectElement ? "ड्रपडाउन" : "इनपुट फिल्ड";
          return `${label.textContent.trim()} — ${typeName}`;
        }
      }
      if (el instanceof HTMLSelectElement) {
        const selectedOption = el.options[el.selectedIndex]?.text;
        return selectedOption ? `छानिएको: ${selectedOption}` : "ड्रपडाउन";
      }
      if (el.placeholder) return el.placeholder;
    }

    // 3. Buttons & Links with role context
    if (el.tagName === "BUTTON" || el.getAttribute("role") === "button") {
      const text = el.innerText || el.textContent || "";
      if (text.trim()) return `${text.trim()} — बटन`;
    }

    if (el.tagName === "A") {
      const text = el.innerText || el.textContent || "";
      if (text.trim()) return `${text.trim()} — लिंक`;
    }

    // 4. Headings
    if (/^H[1-6]$/.test(el.tagName)) {
      const text = el.innerText || el.textContent || "";
      return text.trim();
    }

    // 5. Default text content (first 150 chars max for safety)
    const text = (el.innerText || el.textContent || "").trim();
    return text.length > 150 ? text.substring(0, 150) + "..." : text;
  };

  // Global Keyboard Focus Speech Listener
  useEffect(() => {
    if (!settings.audioPin) return;

    const handleFocusIn = (e: FocusEvent) => {
      isKeyboardNavRef.current = true;
      const target = e.target as HTMLElement;
      if (!target) return;

      const text = getElementAccessibleText(target);
      if (text) {
        speakText(text);
      }
    };

    window.addEventListener("focusin", handleFocusIn);
    return () => window.removeEventListener("focusin", handleFocusIn);
  }, [settings.audioPin, speakText]);

  // Global Mouse Hover Speech Listener with Debounce
  useEffect(() => {
    if (!settings.audioPin) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest(
        "button, a, input, select, textarea, h1, h2, h3, h4, h5, h6, [role='button'], [role='menuitem'], [data-a11y-readable='true']"
      ) as HTMLElement;

      if (!target) return;

      if (hoverDebounceTimerRef.current) {
        clearTimeout(hoverDebounceTimerRef.current);
      }

      hoverDebounceTimerRef.current = setTimeout(() => {
        const text = getElementAccessibleText(target);
        if (text) {
          speakText(text);
        }
      }, 260);
    };

    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mouseover", handleMouseOver);
      if (hoverDebounceTimerRef.current) clearTimeout(hoverDebounceTimerRef.current);
    };
  }, [settings.audioPin, speakText]);

  // Global Keyboard Shortcuts (Alt+A, Alt+D, Alt++, Alt+-)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || "").toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      if (e.altKey) {
        if (e.key === "a" || e.key === "A") {
          e.preventDefault();
          setIsPanelOpen((prev) => !prev);
        } else if (e.key === "d" || e.key === "D") {
          e.preventDefault();
          setSettings((prev) => {
            const nextVal = !prev.darkMode;
            announceLive(nextVal ? "डार्क मोड सक्रिय गरियो।" : "लाइट मोड सक्रिय गरियो।");
            return { ...prev, darkMode: nextVal };
          });
        } else if (e.key === "+" || e.key === "=") {
          e.preventDefault();
          setSettings((prev) => {
            let nextSize: FontSizePercent = 100;
            if (prev.fontSize === 100) nextSize = 150;
            else if (prev.fontSize === 150) nextSize = 180;
            else nextSize = 180;
            announceLive(`अक्षरको आकार ${nextSize}% बनाइयो।`);
            return { ...prev, fontSize: nextSize };
          });
        } else if (e.key === "-" || e.key === "_") {
          e.preventDefault();
          setSettings((prev) => {
            let nextSize: FontSizePercent = 100;
            if (prev.fontSize === 180) nextSize = 150;
            else if (prev.fontSize === 150) nextSize = 100;
            else nextSize = 100;
            announceLive(`अक्षरको आकार ${nextSize}% बनाइयो।`);
            return { ...prev, fontSize: nextSize };
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [announceLive]);

  // Mutators
  const setColorMode = (colorMode: ColorMode) => {
    setSettings((prev) => ({ ...prev, colorMode }));
    announceLive(`रङ मोड परिवर्तन भयो: ${colorMode}`);
  };

  const setDarkMode = (darkMode: boolean) => {
    setSettings((prev) => ({ ...prev, darkMode }));
    announceLive(darkMode ? "डार्क मोड सक्रिय भयो।" : "डार्क मोड बन्द भयो।");
  };

  const toggleDarkMode = () => {
    setSettings((prev) => {
      const next = !prev.darkMode;
      announceLive(next ? "डार्क मोड सक्रिय भयो।" : "डार्क मोड बन्द भयो।");
      return { ...prev, darkMode: next };
    });
  };

  const setFontSize = (fontSize: FontSizePercent) => {
    setSettings((prev) => ({ ...prev, fontSize }));
    announceLive(`अक्षरको आकार ${fontSize}% मा सेट गरियो।`);
  };

  const setAudioPin = (audioPin: boolean) => {
    setSettings((prev) => ({ ...prev, audioPin }));
    if (audioPin) {
      announceLive("अडियो पढ्ने सुविधा (Audio PIN) सक्रिय भयो।");
      speakText("अडियो पढ्ने सुविधा सक्रिय भयो।", true);
    } else {
      announceLive("अडियो पढ्ने सुविधा बन्द भयो।");
      stopSpeech();
    }
  };

  const toggleAudioPin = () => {
    setSettings((prev) => {
      const next = !prev.audioPin;
      if (next) {
        announceLive("अडियो पढ्ने सुविधा (Audio PIN) सक्रिय भयो।");
        speakText("अडियो पढ्ने सुविधा सक्रिय भयो।", true);
      } else {
        announceLive("अडियो पढ्ने सुविधा बन्द भयो।");
        stopSpeech();
      }
      return { ...prev, audioPin: next };
    });
  };

  const setSpeechSpeed = (speechSpeed: SpeechSpeed) => {
    setSettings((prev) => ({ ...prev, speechSpeed }));
    announceLive(`आवाजको गति: ${speechSpeed}`);
  };

  const setSpeechVolume = (speechVolume: SpeechVolume) => {
    setSettings((prev) => ({ ...prev, speechVolume }));
    announceLive(`आवाजको भोल्युम: ${speechVolume}`);
  };

  const setFocusHighlight = (focusHighlight: boolean) => {
    setSettings((prev) => ({ ...prev, focusHighlight }));
    announceLive(focusHighlight ? "फोकस हाइलाइट सक्रिय भयो।" : "फोकस हाइलाइट निष्क्रिय भयो।");
  };

  const setFocusZoom = (focusZoom: boolean) => {
    setSettings((prev) => ({ ...prev, focusZoom }));
    announceLive(focusZoom ? "फोकस जुम सक्रिय भयो।" : "फोकस जुम निष्क्रिय भयो।");
  };

  const setCardZoom = (cardZoom: boolean) => {
    setSettings((prev) => ({ ...prev, cardZoom }));
    announceLive(cardZoom ? "कार्ड जुम प्रभाव सक्रिय भयो।" : "कार्ड जुम प्रभाव निष्क्रिय भयो।");
  };

  const setMotion = (motion: MotionMode) => {
    setSettings((prev) => ({ ...prev, motion }));
    announceLive(`एनिमेसन तथा गति नियन्त्रण: ${motion}`);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    stopSpeech();
    announceLive("पहुँचयुक्तता सेटिङहरू पूर्वनिर्धारित अवस्थामा फर्काइयो।", "assertive");
    speakText("पहुँचयुक्तता सेटिङहरू पूर्वनिर्धारित अवस्थामा फर्काइयो।", true);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        ...settings,
        isPanelOpen,
        setIsPanelOpen,
        setColorMode,
        setDarkMode,
        toggleDarkMode,
        setFontSize,
        setAudioPin,
        toggleAudioPin,
        setSpeechSpeed,
        setSpeechVolume,
        setFocusHighlight,
        setFocusZoom,
        setCardZoom,
        setMotion,
        resetSettings,
        announceLive,
        speakText,
        stopSpeech,
        liveMessage,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
