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
      id: "ad-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
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
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-purple-700" aria-hidden="true" />
            <span>अनुसूची १.२ — सहायक सामग्री वितरण गरिएको विवरण</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            पालिकाबाट वितरण गरिएका ह्वीलचेयर, सेतो छडी, श्रवण यन्त्र लगायतका सहायक सामग्रीको पंक्तिगत विवरण
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-purple-900 bg-purple-100 px-3 py-1 rounded-full">
            कुल वितरण: {records.length} थान/जना
          </span>
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ नयाँ सामग्री वितरण थप्नुहोस्</span>
          </button>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <Accessibility className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700">अहिलेसम्म कुनै सहायक सामग्री वितरण विवरण थपिएको छैन।</p>
          <p className="text-xs text-slate-500 mb-3">विवरण भर्न माथिको &lsquo;+ नयाँ सामग्री वितरण थप्नुहोस्&rsquo; बटनमा क्लिक गर्नुहोस्।</p>
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>पहिलो सामग्री वितरण प्रविष्टि थप्नुहोस्</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
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
                <th scope="col" className="px-2 py-2.5 text-center w-10">हटाउनुहोस्</th>
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
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
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
      )}
    </div>
  );
}
