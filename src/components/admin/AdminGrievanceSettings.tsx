"use client";

import React, { useState, useEffect } from "react";
import { 
  GrievanceSettings, 
  getGrievanceSettings, 
  saveGrievanceSettings, 
  DEFAULT_GRIEVANCE_SETTINGS 
} from "@/lib/grievanceService";
import { 
  Settings, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  Save, 
  AlertCircle, 
  FileText, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Lock 
} from "lucide-react";

export default function AdminGrievanceSettings() {
  const [settings, setSettings] = useState<GrievanceSettings>(DEFAULT_GRIEVANCE_SETTINGS);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setSettings(getGrievanceSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveGrievanceSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          <span>गुनासो इमेल तथा प्रणाली सेटिङ्स (Grievance Email & System Settings)</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          कोशी प्रदेश सामाजिक विकास मन्त्रालयको अनिवार्य CC इमेल, बेनामी गुनासो नीति र फाइल अपलोड सीमा व्यवस्थापन।
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Mandatory CC Configuration Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Mail className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              सामाजिक विकास मन्त्रालय — अनिवार्य CC इमेल (Mandatory CC Routing)
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>अनिवार्य नीति (Core Business Logic):</strong> नागरिकले जुनसुकै मन्त्रालय वा १३७ स्थानीय तह मध्ये जहाँसुकै गुनासो दर्ता गरे पनि यस इमेलमा स्वचालित रूपमा <strong>CC</strong> पठाइनेछ।
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                सामाजिक विकास मन्त्रालय आधिकारिक गुनासो Email (Mandatory CC Email) *
              </label>
              <input
                type="email"
                required
                value={settings.mandatory_cc_email}
                onChange={(e) => setSettings({ ...settings, mandatory_cc_email: e.target.value })}
                placeholder="उदा. grievance.mosd@koshi.gov.np"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Mandatory CC सक्रिय राख्नुहोस् (Mandatory CC = ON)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  यो सक्रिय भएपछि प्रत्येक सफल गुनासोमा सामाजिक विकास मन्त्रालयमा स्वतः CC जानेछ।
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.is_mandatory_cc_active}
                  onChange={(e) => setSettings({ ...settings, is_mandatory_cc_active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Anonymous Policy & Upload Limits Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Lock className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              गोपनीयता तथा फाइल अपलोड सीमाहरू (Privacy & Upload Limits)
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  बेनामी गुनासो दर्ता खुला राख्नुहोस् (Allow Anonymous Complaints)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  नागरिकलाई आफ्नो नाम, फोन नम्बर नखुलाई सुरक्षित गुनासो दर्ता गर्न दिने विकल्प।
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allow_anonymous}
                  onChange={(e) => setSettings({ ...settings, allow_anonymous: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>कागजात अधिकतम साइज (MB)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={settings.max_doc_size_mb}
                  onChange={(e) => setSettings({ ...settings, max_doc_size_mb: parseInt(e.target.value, 10) || 10 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>तस्बिर अधिकतम साइज (MB)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={settings.max_img_size_mb}
                  onChange={(e) => setSettings({ ...settings, max_img_size_mb: parseInt(e.target.value, 10) || 8 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                  <VideoIcon className="w-4 h-4 text-purple-600" />
                  <span>भिडियो अधिकतम साइज (MB)</span>
                </label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={settings.max_video_size_mb}
                  onChange={(e) => setSettings({ ...settings, max_video_size_mb: parseInt(e.target.value, 10) || 30 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          {saveSuccess ? (
            <span className="text-emerald-600 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>सेटिङ्स सफलतापूर्वक सुरक्षित गरियो!</span>
            </span>
          ) : (
            <span className="text-slate-400 text-xs">अद्यावधिक गरेपछि सुरक्षित गर्नुहोस् बटन थिच्नुहोस्।</span>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>सेटिङ्स सुरक्षित गर्नुहोस्</span>
          </button>
        </div>
      </form>
    </div>
  );
}
