"use client";

import React, { useEffect, useRef } from "react";
import { useAccessibility, ColorMode, FontSizePercent, MotionMode, SpeechSpeed, SpeechVolume } from "@/lib/accessibilityContext";
import { 
  X, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  Eye, 
  ZoomIn, 
  RotateCcw, 
  Keyboard, 
  Sparkles, 
  Check, 
  Layers, 
  ShieldCheck, 
  Activity, 
  HelpCircle,
  Sliders,
  Type
} from "lucide-react";

export default function AccessibilityPanel() {
  const {
    isPanelOpen,
    setIsPanelOpen,
    colorMode,
    setColorMode,
    darkMode,
    setDarkMode,
    toggleDarkMode,
    fontSize,
    setFontSize,
    audioPin,
    toggleAudioPin,
    speechSpeed,
    setSpeechSpeed,
    speechVolume,
    setSpeechVolume,
    focusHighlight,
    setFocusHighlight,
    focusZoom,
    setFocusZoom,
    cardZoom,
    setCardZoom,
    motion,
    setMotion,
    resetSettings,
    speakText
  } = useAccessibility();

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap & Escape key handling
  useEffect(() => {
    if (!isPanelOpen) return;

    // Focus close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsPanelOpen(false);
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElem = focusableElements[0];
        const lastElem = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElem) {
            e.preventDefault();
            lastElem.focus();
          }
        } else {
          if (document.activeElement === lastElem) {
            e.preventDefault();
            firstElem.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPanelOpen, setIsPanelOpen]);

  if (!isPanelOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-panel-title"
      aria-describedby="a11y-panel-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-fadeIn"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-amber-500 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-blue-950 dark:bg-slate-950 text-white p-4 sm:p-5 border-b-2 border-amber-500 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
              ♿
            </div>
            <div>
              <h2 id="a11y-panel-title" className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>पहुँचयुक्तता सेटिङ्स (Accessibility Panel)</span>
              </h2>
              <p id="a11y-panel-desc" className="text-xs text-blue-200 dark:text-slate-400">
                सबै नागरिक तथा अपाङ्गता भएका व्यक्तिहरूका लागि सहज बनाइएको डिजिटल इन्टरफेस
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setIsPanelOpen(false)}
            className="p-2 text-slate-300 hover:text-white hover:bg-blue-900 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer focus:ring-2 focus:ring-amber-400"
            aria-label="पहुँचयुक्तता प्यानल बन्द गर्नुहोस् (Esc)"
            title="बन्द गर्नुहोस् (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Settings Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-sm">
          
          {/* SECTION 1: AUDIO PIN / TEXT TO SPEECH (TOP PRIORITY) */}
          <section className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400/80 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-amber-300 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  <span>🔊 अडियो पिन (Text-to-Speech / Audio PIN)</span>
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                  माउसले छोएको वा किबोर्ड (Tab/Arrow) ले फोकस गरेको अक्षर, लिंक वा बटनलाई आवाजमा सुन्न सकिने सुविधा।
                </p>
              </div>

              <button
                type="button"
                onClick={toggleAudioPin}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shrink-0 ${
                  audioPin
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                }`}
                aria-pressed={audioPin}
              >
                {audioPin ? (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>सक्रिय (ON)</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>निष्क्रिय (OFF)</span>
                  </>
                )}
              </button>
            </div>

            {/* Sub-controls for speech when ON */}
            {audioPin && (
              <div className="pt-3 border-t border-amber-200 dark:border-amber-900/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    आवाजको गति (Speech Speed):
                  </label>
                  <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="आवाजको गति">
                    {(["slow", "normal", "fast"] as SpeechSpeed[]).map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => setSpeechSpeed(spd)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          speechSpeed === spd
                            ? "bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-xs"
                            : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                        aria-checked={speechSpeed === spd}
                        role="radio"
                      >
                        {spd === "slow" ? "धीमो" : spd === "normal" ? "सामान्य" : "छिटो"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    आवाजको भोल्युम (Volume):
                  </label>
                  <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="आवाजको भोल्युम">
                    {(["low", "medium", "high"] as SpeechVolume[]).map((vol) => (
                      <button
                        key={vol}
                        type="button"
                        onClick={() => setSpeechVolume(vol)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          speechVolume === vol
                            ? "bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-xs"
                            : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                        aria-checked={speechVolume === vol}
                        role="radio"
                      >
                        {vol === "low" ? "न्यून" : vol === "medium" ? "मध्यम" : "उच्च"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* SECTION 2: FONT SIZE CONTROLS (100%, 150%, 180%) */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Type className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <span>अक्षरको आकार (Font Size Scaling)</span>
              </h3>
              <span className="text-xs font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                {fontSize}%
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              कम्ती दृष्टि भएका व्यक्तिहरूका लागि सम्पूर्ण प्रणालीको अक्षर ठूलो बनाउनुहोस्।
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1" role="radiogroup" aria-label="अक्षरको आकार">
              {[
                { size: 100 as FontSizePercent, label: "A 100%", desc: "पूर्वनिर्धारित" },
                { size: 150 as FontSizePercent, label: "A 150%", desc: "ठूलो (Large)" },
                { size: 180 as FontSizePercent, label: "A 180%", desc: "धेरै ठूलो (XL)" },
              ].map((item) => (
                <button
                  key={item.size}
                  type="button"
                  onClick={() => setFontSize(item.size)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    fontSize === item.size
                      ? "bg-blue-900 text-white border-blue-950 shadow-md ring-2 ring-amber-400"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-500"
                  }`}
                  aria-checked={fontSize === item.size}
                  role="radio"
                >
                  <div className="font-black text-base sm:text-lg">{item.label}</div>
                  <div className="text-[11px] opacity-80 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </section>

          {/* SECTION 3: DARK MODE & COLOR MODE */}
          <section className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
              <span>रङ तथा कन्ट्रास्ट मोड (Color & Dark Mode)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Dark mode toggle */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5 text-slate-900 dark:text-white">
                    {darkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-600" />}
                    <span>डार्क मोड (Dark Mode)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    आँखालाई सहज हुने कालो पृष्ठभूमिको मोड
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    darkMode
                      ? "bg-amber-400 text-slate-950 shadow-xs"
                      : "bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                  }`}
                  aria-pressed={darkMode}
                >
                  {darkMode ? "अन (ON)" : "अफ (OFF)"}
                </button>
              </div>

              {/* Color Presentation Mode */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-xs text-slate-900 dark:text-white mb-2">
                  रङ प्रस्तुति (Color Contrast):
                </div>
                <div className="grid grid-cols-3 gap-1" role="radiogroup" aria-label="रङ कन्ट्रास्ट">
                  {[
                    { mode: "normal" as ColorMode, label: "सामान्य" },
                    { mode: "high-contrast" as ColorMode, label: "उच्च कन्ट्रास्ट" },
                    { mode: "soft" as ColorMode, label: "नरम (Soft)" },
                  ].map((m) => (
                    <button
                      key={m.mode}
                      type="button"
                      onClick={() => setColorMode(m.mode)}
                      className={`py-1 px-1.5 rounded-md text-[11px] font-bold border transition-all cursor-pointer ${
                        colorMode === m.mode
                          ? "bg-purple-700 text-white border-purple-900 shadow-xs"
                          : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                      aria-checked={colorMode === m.mode}
                      role="radio"
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: FOCUS HIGHLIGHT, TEXT ZOOM & CARD ZOOM */}
          <section className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>फोकस दृश्यता तथा जुम प्रभाव (Focus & Interactive Zoom)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setFocusHighlight(!focusHighlight)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  focusHighlight
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
                aria-pressed={focusHighlight}
              >
                <div>
                  <div className="font-bold text-xs">स्पष्ट फोकस रिङ</div>
                  <div className="text-[10px] opacity-80">पहेँलो/गाढा बोर्डर</div>
                </div>
                {focusHighlight && <Check className="w-4 h-4 shrink-0 text-emerald-600" />}
              </button>

              <button
                type="button"
                onClick={() => setFocusZoom(!focusZoom)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  focusZoom
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
                aria-pressed={focusZoom}
              >
                <div>
                  <div className="font-bold text-xs">फोकस टेक्स्ट जुम</div>
                  <div className="text-[10px] opacity-80">१०५% देखिने</div>
                </div>
                {focusZoom && <Check className="w-4 h-4 shrink-0 text-emerald-600" />}
              </button>

              <button
                type="button"
                onClick={() => setCardZoom(!cardZoom)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  cardZoom
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
                aria-pressed={cardZoom}
              >
                <div>
                  <div className="font-bold text-xs">कार्ड जुम प्रभाव</div>
                  <div className="text-[10px] opacity-80">१०२% हल्का उचाइ</div>
                </div>
                {cardZoom && <Check className="w-4 h-4 shrink-0 text-emerald-600" />}
              </button>
            </div>
          </section>

          {/* SECTION 5: MOTION & ANIMATION CONTROL */}
          <section className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
              <span>एनिमेसन तथा गति नियन्त्रण (Motion & Animation Control)</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              चक्कर लाग्ने वा संवेदनशीलता हुने व्यक्तिहरूका लागि अनावश्यक हलचल र एनिमेसन बन्द गर्नुहोस्।
            </p>

            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="एनिमेसन तथा गति नियन्त्रण">
              {[
                { m: "normal" as MotionMode, label: "सामान्य (Normal)" },
                { m: "reduced" as MotionMode, label: "न्यून (Reduced)" },
                { m: "off" as MotionMode, label: "पूर्ण बन्द (Off)" },
              ].map((item) => (
                <button
                  key={item.m}
                  type="button"
                  onClick={() => setMotion(item.m)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    motion === item.m
                      ? "bg-cyan-700 text-white border-cyan-900 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                  aria-checked={motion === item.m}
                  role="radio"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          {/* SECTION 6: KEYBOARD SHORTCUTS REFERENCE */}
          <section className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span>द्रुत किबोर्ड सर्टकटहरू (Keyboard Shortcuts Guide):</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <kbd className="font-mono font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-900 dark:text-amber-300">
                  Alt + A
                </kbd>
                <div className="mt-1 text-slate-600 dark:text-slate-400">पहुँचयुक्तता प्यानल</div>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <kbd className="font-mono font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-900 dark:text-amber-300">
                  Alt + D
                </kbd>
                <div className="mt-1 text-slate-600 dark:text-slate-400">डार्क मोड अन/अफ</div>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <kbd className="font-mono font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-900 dark:text-amber-300">
                  Alt + +
                </kbd>
                <div className="mt-1 text-slate-600 dark:text-slate-400">अक्षर बढाउने (Zoom In)</div>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <kbd className="font-mono font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-900 dark:text-amber-300">
                  Alt + -
                </kbd>
                <div className="mt-1 text-slate-600 dark:text-slate-400">अक्षर घटाउने (Zoom Out)</div>
              </div>
            </div>
          </section>

        </div>

        {/* Modal Footer with Reset Button */}
        <div className="p-3.5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={resetSettings}
            className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>पूर्वनिर्धारित अवस्थामा फर्काउनुहोस् (Reset)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPanelOpen(false)}
            className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            सम्पन्न (Done)
          </button>
        </div>

      </div>
    </div>
  );
}
