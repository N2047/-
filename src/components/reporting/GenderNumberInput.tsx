"use client";

import React from "react";
import { GenderRow } from "@/types/form";

interface GenderNumberInputProps {
  id: string;
  label: string;
  subLabel?: string;
  questionNumber?: number | string;
  value: GenderRow;
  onChange: (val: GenderRow) => void;
  required?: boolean;
  disabledTotal?: boolean;
}

export default function GenderNumberInput({
  id,
  label,
  subLabel,
  questionNumber,
  value,
  onChange,
  required = false,
  disabledTotal = true,
}: GenderNumberInputProps) {
  const handleFemaleChange = (valStr: string) => {
    const f = valStr === "" ? "" : Math.max(0, parseInt(valStr, 10) || 0);
    const m = typeof value.male === "number" ? value.male : 0;
    const femaleVal = typeof f === "number" ? f : 0;
    onChange({
      ...value,
      female: f,
      total: disabledTotal ? femaleVal + m : value.total,
    });
  };

  const handleMaleChange = (valStr: string) => {
    const m = valStr === "" ? "" : Math.max(0, parseInt(valStr, 10) || 0);
    const f = typeof value.female === "number" ? value.female : 0;
    const maleVal = typeof m === "number" ? m : 0;
    onChange({
      ...value,
      male: m,
      total: disabledTotal ? f + maleVal : value.total,
    });
  };

  const handleRemarksChange = (remarks: string) => {
    onChange({
      ...value,
      remarks,
    });
  };

  return (
    <div className="bg-slate-50/80 p-3 sm:p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
      <div className="mb-2.5">
        <label htmlFor={`${id}-female`} className="text-xs sm:text-sm font-bold text-slate-900 flex items-start gap-2">
          {questionNumber && (
            <span className="bg-blue-900 text-white text-[11px] sm:text-xs px-2 py-0.5 rounded-sm shrink-0 mt-0.5 font-bold">
              {questionNumber}
            </span>
          )}
          <span className="leading-snug">
            {label} {required && <span className="text-red-600" title="अनिवार्य">*</span>}
          </span>
        </label>
        {subLabel && (
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 ml-7">{subLabel}</p>
        )}
      </div>

      {/* Responsive Grid: 2 columns on Mobile, 4 columns on Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {/* Female */}
        <div>
          <label htmlFor={`${id}-female`} className="block text-[11px] sm:text-xs font-semibold text-slate-600 mb-1 truncate">
            महिला संख्या
          </label>
          <input
            id={`${id}-female`}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min="0"
            placeholder="0"
            value={value.female}
            onChange={(e) => handleFemaleChange(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-base sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden min-h-[42px]"
          />
        </div>

        {/* Male */}
        <div>
          <label htmlFor={`${id}-male`} className="block text-[11px] sm:text-xs font-semibold text-slate-600 mb-1 truncate">
            पुरुष संख्या
          </label>
          <input
            id={`${id}-male`}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min="0"
            placeholder="0"
            value={value.male}
            onChange={(e) => handleMaleChange(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-base sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden min-h-[42px]"
          />
        </div>

        {/* Auto Calculated Total */}
        <div>
          <label htmlFor={`${id}-total`} className="block text-[11px] sm:text-xs font-bold text-blue-950 mb-1 truncate">
            जम्मा (स्वचालित)
          </label>
          <input
            id={`${id}-total`}
            type="number"
            readOnly={disabledTotal}
            value={value.total}
            className="w-full bg-blue-50/90 border border-blue-200 rounded-lg px-2.5 py-2 text-base sm:text-sm font-bold text-blue-900 cursor-not-allowed min-h-[42px]"
          />
        </div>

        {/* Remarks */}
        <div className="col-span-1">
          <label htmlFor={`${id}-remarks`} className="block text-[11px] sm:text-xs font-semibold text-slate-600 mb-1 truncate">
            कैफियत
          </label>
          <input
            id={`${id}-remarks`}
            type="text"
            placeholder="कैफियत भए यहाँ..."
            value={value.remarks || ""}
            onChange={(e) => handleRemarksChange(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-base sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden min-h-[42px]"
          />
        </div>
      </div>
    </div>
  );
}
