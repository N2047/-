"use client";

import React from "react";

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
  remarksPlaceholder = "थप विवरण वा कैफियत...",
}: YesNoRadioProps) {
  return (
    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
      <div className="mb-3">
        <span className="text-sm font-bold text-slate-900 flex items-start gap-2">
          {questionNumber && (
            <span className="bg-blue-900 text-white text-xs px-2 py-0.5 rounded-sm shrink-0 mt-0.5 font-bold">
              {questionNumber}
            </span>
          )}
          <span>{label}</span>
        </span>
        {subLabel && (
          <p className="text-xs text-slate-500 mt-0.5 ml-6">{subLabel}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        <div className="flex items-center space-x-6 sm:col-span-1">
          <label className="flex items-center space-x-2 text-sm font-semibold cursor-pointer">
            <input
              type="radio"
              name={`${id}-radio`}
              checked={status === true}
              onChange={() => onStatusChange(true)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="text-slate-800">हो (छ)</span>
          </label>
          <label className="flex items-center space-x-2 text-sm font-semibold cursor-pointer">
            <input
              type="radio"
              name={`${id}-radio`}
              checked={status === false}
              onChange={() => onStatusChange(false)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="text-slate-800">होइन (छैन)</span>
          </label>
        </div>

        <div className="sm:col-span-2">
          <input
            type="text"
            id={`${id}-remarks`}
            placeholder={remarksPlaceholder}
            value={remarks}
            onChange={(e) => onRemarksChange(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>
      </div>
    </div>
  );
}
