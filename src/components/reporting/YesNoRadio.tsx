"use client";

import React from "react";
import { Check, X } from "lucide-react";

interface YesNoRadioProps {
  id: string;
  questionNumber?: number | string;
  label: string;
  subLabel?: string;
  status: boolean | null;
  remarks: string;
  onStatusChange: (val: boolean) => void;
  onRemarksChange: (remarks: string) => void;
  remarksPlaceholder?: string;
}

export default function YesNoRadio({
  id,
  questionNumber,
  label,
  subLabel,
  status,
  remarks,
  onStatusChange,
  onRemarksChange,
  remarksPlaceholder = "थप विवरण वा कैफियत भए यहाँ लेख्नुहोस्...",
}: YesNoRadioProps) {
  return (
    <div className="bg-slate-50/80 p-3 sm:p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
      <div className="mb-2.5">
        <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-start gap-2">
          {questionNumber && (
            <span className="bg-blue-900 text-white text-[11px] sm:text-xs px-2 py-0.5 rounded-sm shrink-0 mt-0.5 font-bold">
              {questionNumber}
            </span>
          )}
          <span className="leading-snug">{label}</span>
        </span>
        {subLabel && (
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 ml-7">{subLabel}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 items-center">
        {/* Mobile touch-friendly segmented pills */}
        <div className="grid grid-cols-2 gap-2 sm:col-span-1">
          <button
            type="button"
            onClick={() => onStatusChange(true)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all min-h-[42px] cursor-pointer ${
              status === true
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
            }`}
          >
            <Check className="w-4 h-4" />
            <span>हो (छ)</span>
          </button>

          <button
            type="button"
            onClick={() => onStatusChange(false)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all min-h-[42px] cursor-pointer ${
              status === false
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
            }`}
          >
            <X className="w-4 h-4" />
            <span>होइन (छैन)</span>
          </button>
        </div>

        {/* Remarks Input */}
        <div className="sm:col-span-2">
          <input
            type="text"
            id={`${id}-remarks`}
            placeholder={remarksPlaceholder}
            value={remarks}
            onChange={(e) => onRemarksChange(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-base sm:text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden min-h-[42px]"
          />
        </div>
      </div>
    </div>
  );
}
