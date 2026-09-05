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
    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
      <div className="mb-3">
        <label htmlFor={`${id}-female`} className="text-sm font-bold text-slate-900 flex items-start gap-2">
          {questionNumber && (
            <span className="bg-blue-900 text-white text-xs px-2 py-0.5 rounded-sm shrink-0 mt-0.5 font-bold">
              {questionNumber}
            </span>
          )}
          <span>{label} {required && <span className="text-red-600" title="अनिवार्य">*</span>}</span>
        </label>
        {subLabel && (
          <p className="text-xs text-slate-500 mt-0.5 ml-6">{subLabel}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Female */}
        <div>
          <label htmlFor={`${id}-female`} className="block text-xs font-semibold text-slate-600 mb-1">
            महिला संख्या
          </label>
          <input
            id={`${id}-female`}
            type="number"
            min="0"
            placeholder="0"
            value={value.female}
            onChange={(e) => handleFemaleChange(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>

        {/* Male */}
        <div>
          <label htmlFor={`${id}-male`} className="block text-xs font-semibold text-slate-600 mb-1">
            पुरुष संख्या
          </label>
          <input
            id={`${id}-male`}
            type="number"
            min="0"
            placeholder="0"
            value={value.male}
            onChange={(e) => handleMaleChange(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>

        {/* Auto Calculated Total */}
        <div>
          <label htmlFor={`${id}-total`} className="block text-xs font-bold text-blue-950 mb-1">
            जम्मा संख्या (स्वचालित)
          </label>
          <input
            id={`${id}-total`}
            type="number"
            readOnly={disabledTotal}
            value={value.total}
            className="w-full bg-blue-50/80 border border-blue-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-900 cursor-not-allowed"
          />
        </div>

        {/* Remarks */}
        <div>
          <label htmlFor={`${id}-remarks`} className="block text-xs font-semibold text-slate-600 mb-1">
            कैफियत
          </label>
          <input
            id={`${id}-remarks`}
            type="text"
            placeholder="कैफियत भए यहाँ लेख्नुहोस्..."
            value={value.remarks || ""}
            onChange={(e) => handleRemarksChange(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>
      </div>
    </div>
  );
}
