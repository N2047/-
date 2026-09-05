"use client";

import React from "react";
import { HomeVisitRecord } from "@/types/form";
import { Plus, Trash2, Home, Users } from "lucide-react";

interface HomeVisitTableProps {
  records: HomeVisitRecord[];
  onChange: (records: HomeVisitRecord[]) => void;
}

const DISABILITY_TYPES = [
  "शारीरिक",
  "दृष्टि सम्बन्धी (न्यून दृष्टि)",
  "दृष्टि सम्बन्धी (दृष्टिबिहीनता)",
  "सुनाइ सम्बन्धी (सुस्तश्रवण)",
  "सुनाइ सम्बन्धी (बहिरा)",
  "श्रवण दृष्टिबिहीन",
  "स्वर र बोलाइ सम्बन्धी",
  "मानसिक तथा मनोसामाजिक",
  "बौद्धिक अपाङ्गता",
  "हेमोफिलिया",
  "अटिज्म",
  "बहु-अपाङ्गता",
  "अन्य",
];

const SEVERITY_LEVELS = [
  "रातो (पूर्ण अशक्त)",
  "निलो (अति अशक्त)",
  "पहेलो (मध्यम)",
  "सेतो (सामान्य)",
  "परिचयपत्र नभएको",
];

export default function HomeVisitTable({ records, onChange }: HomeVisitTableProps) {
  const handleAddRow = () => {
    const newRecord: HomeVisitRecord = {
      id: "hv-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      row_order: records.length + 1,
      id_card_number: "",
      beneficiary_name: "",
      gender: "महिला",
      ward_number: 1,
      contact_number: "",
      disability_type: "शारीरिक",
      disability_severity: "रातो (पूर्ण अशक्त)",
      service_provided: "",
      remarks: "",
    };
    onChange([...records, newRecord]);
  };

  const handleRemoveRow = (index: number) => {
    const updated = records.filter((_, i) => i !== index).map((r, i) => ({
      ...r,
      row_order: i + 1,
    }));
    onChange(updated);
  };

  const handleFieldChange = (index: number, field: keyof HomeVisitRecord, value: any) => {
    const updated = [...records];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Home className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" aria-hidden="true" />
            <span>अनुसूची १.१ — गृहभेट गरिएको विवरण</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            सहजकर्ताले घरमै पुगेर सेवा, परामर्श वा जानकारी दिएका अपाङ्गता भएका व्यक्तिहरूको पंक्तिगत प्रविष्टि
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2.5 py-1 rounded-full">
            जम्मा: {records.length} जना
          </span>
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ नयाँ गृहभेट थप्नुहोस्</span>
          </button>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-4">
          <Users className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700">अहिलेसम्म कुनै गृहभेट विवरण थपिएको छैन।</p>
          <p className="text-xs text-slate-500 mb-3">गृहभेट गरिएको विवरण भर्न तलको बटन थिच्नुहोस्।</p>
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>पहिलो गृहभेट विवरण थप्नुहोस्</span>
          </button>
        </div>
      ) : (
        <>
          {/* MOBILE / TABLET VIEW: Card format (block lg:hidden) */}
          <div className="block lg:hidden space-y-3">
            {records.map((r, idx) => (
              <div key={r.id || idx} className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>गृहभेट विवरण #{idx + 1}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(idx)}
                    className="p-1 text-rose-600 hover:bg-rose-50 rounded-md transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                    aria-label={`पङ्क्ति ${idx + 1} हटाउनुहोस्`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>हटाउनुहोस्</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      नाम / थर *
                    </label>
                    <input
                      type="text"
                      placeholder="लाभग्राहीको नाम"
                      value={r.beneficiary_name}
                      onChange={(e) => handleFieldChange(idx, "beneficiary_name", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-base sm:text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden min-h-[42px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      परिचय पत्र नं.
                    </label>
                    <input
                      type="text"
                      placeholder="परिचय पत्र नं."
                      value={r.id_card_number}
                      onChange={(e) => handleFieldChange(idx, "id_card_number", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-base sm:text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden min-h-[42px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      लिङ्ग *
                    </label>
                    <select
                      value={r.gender}
                      onChange={(e) => handleFieldChange(idx, "gender", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-2 text-base sm:text-xs min-h-[42px]"
                    >
                      <option value="महिला">महिला</option>
                      <option value="पुरुष">पुरुष</option>
                      <option value="अन्य">अन्य</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      वडा नं. *
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="वडा"
                      value={r.ward_number}
                      onChange={(e) => handleFieldChange(idx, "ward_number", parseInt(e.target.value, 10) || "")}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-2 text-base sm:text-xs min-h-[42px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      सम्पर्क नं.
                    </label>
                    <input
                      type="text"
                      placeholder="९८xxxxxxxx"
                      value={r.contact_number}
                      onChange={(e) => handleFieldChange(idx, "contact_number", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-2 text-base sm:text-xs min-h-[42px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      अपाङ्गताको प्रकार *
                    </label>
                    <select
                      value={r.disability_type}
                      onChange={(e) => handleFieldChange(idx, "disability_type", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-2 text-base sm:text-xs min-h-[42px]"
                    >
                      {DISABILITY_TYPES.map((dt) => (
                        <option key={dt} value={dt}>{dt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      गम्भीरता
                    </label>
                    <select
                      value={r.disability_severity}
                      onChange={(e) => handleFieldChange(idx, "disability_severity", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-2 text-base sm:text-xs min-h-[42px]"
                    >
                      {SEVERITY_LEVELS.map((sl) => (
                        <option key={sl} value={sl}>{sl}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    के सेवा वा परामर्श दिइएको *
                  </label>
                  <input
                    type="text"
                    placeholder="परामर्श वा सेवा विवरण..."
                    value={r.service_provided}
                    onChange={(e) => handleFieldChange(idx, "service_provided", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-base sm:text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden min-h-[42px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    कैफियत
                  </label>
                  <input
                    type="text"
                    placeholder="कैफियत भए यहाँ लेख्नुहोस्..."
                    value={r.remarks}
                    onChange={(e) => handleFieldChange(idx, "remarks", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-base sm:text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden min-h-[42px]"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddRow}
              className="w-full py-2.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-bold hover:bg-blue-100 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ अर्को गृहभेट विवरण थप्नुहोस्</span>
            </button>
          </div>

          {/* DESKTOP VIEW: Table format (hidden lg:block) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 text-slate-800 font-bold">
                <tr>
                  <th scope="col" className="px-2.5 py-2.5 text-center w-12">क्र.सं.</th>
                  <th scope="col" className="px-3 py-2.5 text-left">परिचय पत्र नं.</th>
                  <th scope="col" className="px-3 py-2.5 text-left">नाम / थर *</th>
                  <th scope="col" className="px-2 py-2.5 text-left">लिङ्ग *</th>
                  <th scope="col" className="px-2 py-2.5 text-left w-16">वडा नं. *</th>
                  <th scope="col" className="px-3 py-2.5 text-left">सम्पर्क नं.</th>
                  <th scope="col" className="px-3 py-2.5 text-left">अपाङ्गताको प्रकार *</th>
                  <th scope="col" className="px-3 py-2.5 text-left">गम्भीरता</th>
                  <th scope="col" className="px-3 py-2.5 text-left">के सेवा वा परामर्श दिएको *</th>
                  <th scope="col" className="px-3 py-2.5 text-left">कैफियत</th>
                  <th scope="col" className="px-2 py-2.5 text-center w-12">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {records.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-slate-50/80">
                    <td className="px-2.5 py-2 text-center font-bold text-slate-500 bg-slate-50">
                      {idx + 1}
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        placeholder="परिचय पत्र नं."
                        value={r.id_card_number}
                        onChange={(e) => handleFieldChange(idx, "id_card_number", e.target.value)}
                        className="w-24 bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        placeholder="व्यक्तिको नाम"
                        required
                        value={r.beneficiary_name}
                        onChange={(e) => handleFieldChange(idx, "beneficiary_name", e.target.value)}
                        className="w-32 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <select
                        value={r.gender}
                        onChange={(e) => handleFieldChange(idx, "gender", e.target.value)}
                        className="w-20 bg-white border border-slate-300 rounded px-1.5 py-1 text-xs"
                      >
                        <option value="महिला">महिला</option>
                        <option value="पुरुष">पुरुष</option>
                        <option value="अन्य">अन्य</option>
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min="1"
                        placeholder="वडा"
                        value={r.ward_number}
                        onChange={(e) => handleFieldChange(idx, "ward_number", parseInt(e.target.value, 10) || "")}
                        className="w-14 bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        placeholder="९८xxxxxxxx"
                        value={r.contact_number}
                        onChange={(e) => handleFieldChange(idx, "contact_number", e.target.value)}
                        className="w-28 bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <select
                        value={r.disability_type}
                        onChange={(e) => handleFieldChange(idx, "disability_type", e.target.value)}
                        className="w-36 bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                      >
                        {DISABILITY_TYPES.map((dt) => (
                          <option key={dt} value={dt}>{dt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <select
                        value={r.disability_severity}
                        onChange={(e) => handleFieldChange(idx, "disability_severity", e.target.value)}
                        className="w-32 bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                      >
                        {SEVERITY_LEVELS.map((sl) => (
                          <option key={sl} value={sl}>{sl}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        placeholder="के सेवा/परामर्श दिइयो..."
                        required
                        value={r.service_provided}
                        onChange={(e) => handleFieldChange(idx, "service_provided", e.target.value)}
                        className="w-48 bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        placeholder="कैफियत..."
                        value={r.remarks}
                        onChange={(e) => handleFieldChange(idx, "remarks", e.target.value)}
                        className="w-28 bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="हटाउनुहोस्"
                        aria-label={`${r.beneficiary_name || idx + 1} को विवरण हटाउनुहोस्`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
