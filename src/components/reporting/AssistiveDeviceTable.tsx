"use client";

import React from "react";
import { AssistiveDeviceRecord } from "@/types/form";
import { Plus, Trash2, Accessibility, PackageCheck } from "lucide-react";

interface AssistiveDeviceTableProps {
  records: AssistiveDeviceRecord[];
  onChange: (records: AssistiveDeviceRecord[]) => void;
}

const COMMON_DEVICES = [
  "ह्वीलचेयर (Wheelchair)",
  "ट्राइसाइकल (Tricycle)",
  "सेतो छडी (White Cane)",
  "स्मार्ट सेतो छडी",
  "बैशाखी (Crutches)",
  "वाकर (Walker)",
  "श्रवण यन्त्र (Hearing Aid)",
  "कमोड कुर्सी (Commode Chair)",
  "कृत्रिम हात/खुट्टा (Prosthesis)",
  "क्यालिपर/ब्रेस (Orthosis)",
  "कम्पुटर/मोबाइल स्क्रिन रिडर उपकरण",
  "ब्रेल सामग्री",
  "अन्य",
];

const CARD_COLORS = [
  "रातो (पूर्ण अशक्त)",
  "निलो (अति अशक्त)",
  "पहेलो (मध्यम)",
  "सेतो (सामान्य)",
  "परिचयपत्र नभएको",
];

export default function AssistiveDeviceTable({ records, onChange }: AssistiveDeviceTableProps) {
  const handleAddRow = () => {
    const newRecord: AssistiveDeviceRecord = {
      id: "ad-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      row_order: records.length + 1,
      id_card_number: "",
      beneficiary_name: "",
      gender: "महिला",
      ward_number: 1,
      disability_type: "शारीरिक",
      id_card_color: "रातो (पूर्ण अशक्त)",
      previously_used: false,
      previous_device_name: "",
      distributed_device: "ह्वीलचेयर (Wheelchair)",
      measurement_done: true,
      measurement_specs: "",
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

  const handleFieldChange = (index: number, field: keyof AssistiveDeviceRecord, value: any) => {
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
            <PackageCheck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700" aria-hidden="true" />
            <span>अनुसूची १.२ — सहायक सामग्री वितरण विवरण</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            पालिकाबाट वितरण गरिएका ह्वीलचेयर, सेतो छडी, श्रवण यन्त्र लगायतका सामग्रीहरूको पंक्तिगत प्रविष्टि
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs font-bold text-purple-900 bg-purple-100 px-2.5 py-1 rounded-full">
            कुल: {records.length} थान/जना
          </span>
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ नयाँ सामग्री थप्नुहोस्</span>
          </button>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-4">
          <Accessibility className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700">अहिलेसम्म कुनै सहायक सामग्री वितरण विवरण थपिएको छैन।</p>
          <p className="text-xs text-slate-500 mb-3">सामग्री वितरण विवरण भर्न तलको बटन थिच्नुहोस्।</p>
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>पहिलो सामग्री वितरण विवरण थप्नुहोस्</span>
          </button>
        </div>
      ) : (
        <>
          {/* MOBILE / TABLET VIEW: Card format (block lg:hidden) */}
          <div className="block lg:hidden space-y-3">
            {records.map((r, idx) => (
              <div key={r.id || idx} className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-900 text-white flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>सामग्री वितरण विवरण #{idx + 1}</span>
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
                      लाभग्राहीको नाम *
                    </label>
                    <input
                      type="text"
                      placeholder="नाम/थर"
                      value={r.beneficiary_name}
                      onChange={(e) => handleFieldChange(idx, "beneficiary_name", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-base sm:text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:outline-hidden min-h-[42px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      परिचय पत्र नं.
                    </label>
                    <input
                      type="text"
                      placeholder="कार्ड नं."
                      value={r.id_card_number}
                      onChange={(e) => handleFieldChange(idx, "id_card_number", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-base sm:text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden min-h-[42px]"
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
                      कार्डको रंग
                    </label>
                    <select
                      value={r.id_card_color}
                      onChange={(e) => handleFieldChange(idx, "id_card_color", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-2 text-base sm:text-xs min-h-[42px]"
                    >
                      {CARD_COLORS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    वितरण गरिएको सामग्री *
                  </label>
                  <select
                    value={r.distributed_device}
                    onChange={(e) => handleFieldChange(idx, "distributed_device", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-base sm:text-xs font-medium min-h-[42px]"
                  >
                    {COMMON_DEVICES.map((cd) => (
                      <option key={cd} value={cd}>{cd}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={r.previously_used}
                        onChange={(e) => handleFieldChange(idx, "previously_used", e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span>पहिले प्रयोग गरेको थियो?</span>
                    </label>
                    {r.previously_used && (
                      <input
                        type="text"
                        placeholder="पहिलेको सामग्री..."
                        value={r.previous_device_name}
                        onChange={(e) => handleFieldChange(idx, "previous_device_name", e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-base sm:text-xs min-h-[38px]"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={r.measurement_done}
                        onChange={(e) => handleFieldChange(idx, "measurement_done", e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span>नापजाँच गरिएको?</span>
                    </label>
                    <input
                      type="text"
                      placeholder="साइज / विवरण..."
                      value={r.measurement_specs}
                      onChange={(e) => handleFieldChange(idx, "measurement_specs", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-base sm:text-xs min-h-[38px]"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddRow}
              className="w-full py-2.5 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl text-xs font-bold hover:bg-purple-100 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ अर्को सामग्री वितरण विवरण थप्नुहोस्</span>
            </button>
          </div>

          {/* DESKTOP VIEW: Table format (hidden lg:block) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 text-slate-800 font-bold">
                <tr>
                  <th scope="col" className="px-2 py-2.5 text-center w-10">क्र.सं.</th>
                  <th scope="col" className="px-2.5 py-2.5 text-left">परिचय पत्र नं.</th>
                  <th scope="col" className="px-3 py-2.5 text-left">व्यक्तिको नाम *</th>
                  <th scope="col" className="px-2 py-2.5 text-left">लिङ्ग *</th>
                  <th scope="col" className="px-2 py-2.5 text-left w-14">वडा *</th>
                  <th scope="col" className="px-2.5 py-2.5 text-left">कार्डको रंग</th>
                  <th scope="col" className="px-2 py-2.5 text-center">पहिला प्रयोग?</th>
                  <th scope="col" className="px-2.5 py-2.5 text-left">पहिलेको नाम</th>
                  <th scope="col" className="px-3 py-2.5 text-left">वितरण गरिएको सामग्री *</th>
                  <th scope="col" className="px-2 py-2.5 text-center">नापजाँच?</th>
                  <th scope="col" className="px-3 py-2.5 text-left">साइज / स्पेसिफिकेसन</th>
                  <th scope="col" className="px-2 py-2.5 text-center w-10">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {records.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-slate-50/80">
                    <td className="px-2 py-2 text-center font-bold text-slate-500 bg-slate-50">
                      {idx + 1}
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        placeholder="कार्ड नं."
                        value={r.id_card_number}
                        onChange={(e) => handleFieldChange(idx, "id_card_number", e.target.value)}
                        className="w-20 bg-white border border-slate-300 rounded px-1.5 py-1 text-xs"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        placeholder="नाम/थर"
                        required
                        value={r.beneficiary_name}
                        onChange={(e) => handleFieldChange(idx, "beneficiary_name", e.target.value)}
                        className="w-28 bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-medium"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <select
                        value={r.gender}
                        onChange={(e) => handleFieldChange(idx, "gender", e.target.value)}
                        className="w-18 bg-white border border-slate-300 rounded px-1 py-1 text-xs"
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
                        className="w-12 bg-white border border-slate-300 rounded px-1.5 py-1 text-xs"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <select
                        value={r.id_card_color}
                        onChange={(e) => handleFieldChange(idx, "id_card_color", e.target.value)}
                        className="w-28 bg-white border border-slate-300 rounded px-1.5 py-1 text-xs"
                      >
                        {CARD_COLORS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={r.previously_used}
                        onChange={(e) => handleFieldChange(idx, "previously_used", e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        disabled={!r.previously_used}
                        placeholder={r.previously_used ? "पहिलेको नाम" : "छैन"}
                        value={r.previous_device_name}
                        onChange={(e) => handleFieldChange(idx, "previous_device_name", e.target.value)}
                        className={`w-24 bg-white border rounded px-1.5 py-1 text-xs ${
                          r.previously_used ? "border-slate-300" : "bg-slate-100 border-slate-200 cursor-not-allowed"
                        }`}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <select
                        value={r.distributed_device}
                        onChange={(e) => handleFieldChange(idx, "distributed_device", e.target.value)}
                        className="w-36 bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-medium"
                      >
                        {COMMON_DEVICES.map((cd) => (
                          <option key={cd} value={cd}>{cd}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={r.measurement_done}
                        onChange={(e) => handleFieldChange(idx, "measurement_done", e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        placeholder="साइज/स्पेसिफिकेसन..."
                        value={r.measurement_specs}
                        onChange={(e) => handleFieldChange(idx, "measurement_specs", e.target.value)}
                        className="w-32 bg-white border border-slate-300 rounded px-1.5 py-1 text-xs"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="हटाउनुहोस्"
                        aria-label={`${r.beneficiary_name || idx + 1} को सामग्री विवरण हटाउनुहोस्`}
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
