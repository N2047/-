"use client";

import React, { useState, useEffect } from "react";
import { 
  FormConfig, 
  FormSection, 
  DEFAULT_FORM_CONFIG,
  getFormConfig, 
  updateMainTitle, 
  renameSection, 
  addSection, 
  deleteSection, 
  resetFormConfig 
} from "@/lib/formConfig";
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  FileText,
  AlertTriangle,
  Type
} from "lucide-react";

interface FormConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminName?: string;
  initialTab?: "title" | "sections" | "add";
}

export default function FormConfigModal({
  isOpen,
  onClose,
  adminName = "कोशी प्रदेश मुख्य प्रशासक",
  initialTab = "title",
}: FormConfigModalProps) {
  const [config, setConfig] = useState<FormConfig>(DEFAULT_FORM_CONFIG);
  const [activeTab, setActiveTab] = useState<"title" | "sections" | "add">(initialTab);
  const [message, setMessage] = useState<string>("");

  // Title form state
  const [mainTitle, setMainTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [fiscalYear, setFiscalYear] = useState("");

  // Add section form state
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionShort, setNewSectionShort] = useState("");
  const [newSectionDesc, setNewSectionDesc] = useState("");
  const [newSectionType, setNewSectionType] = useState<"text" | "number" | "table">("text");

  // Edit section state
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editShort, setEditShort] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    if (isOpen) {
      const cfg = getFormConfig();
      setConfig(cfg);
      setMainTitle(cfg.mainTitle);
      setSubtitle(cfg.subtitle);
      setFiscalYear(cfg.fiscalYear);
      setActiveTab(initialTab);
      setMessage("");
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  // Save Main Title / Subtitle
  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainTitle.trim()) {
      showNotification("फारमको मुख्य शीर्षक खाली राख्न पाइँदैन।");
      return;
    }
    const updated = updateMainTitle(mainTitle, subtitle, fiscalYear, adminName);
    setConfig(updated);
    showNotification("फारमको नाम तथा विवरण सफलतापूर्वक परिवर्तन भयो!");
  };

  // Add New Section
  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) {
      showNotification("कृपया नयाँ फारम / खण्डको शीर्षक लेख्नुहोस्।");
      return;
    }
    const updated = addSection(
      newSectionTitle,
      newSectionShort || `नयाँ-${config.sections.length + 1}`,
      newSectionDesc || "थप गरिएको फारम खण्ड",
      newSectionType,
      adminName
    );
    setConfig(updated);
    setNewSectionTitle("");
    setNewSectionShort("");
    setNewSectionDesc("");
    showNotification("नयाँ फारम खण्ड सफलतापूर्वक थप भयो!");
    setActiveTab("sections");
  };

  // Start editing a section
  const handleStartEditSection = (sec: FormSection) => {
    setEditingSectionId(sec.id);
    setEditTitle(sec.title);
    setEditShort(sec.short);
    setEditDesc(sec.desc);
  };

  // Save renamed section
  const handleSaveEditedSection = (secId: number) => {
    if (!editTitle.trim()) {
      showNotification("खण्डको शीर्षक खाली राख्न पाइँदैन।");
      return;
    }
    const updated = renameSection(secId, editTitle, editShort, editDesc, adminName);
    setConfig(updated);
    setEditingSectionId(null);
    showNotification("फारम खण्डको नाम सफलतापूर्वक संशोधन गरियो!");
  };

  // Delete a section
  const handleDeleteSection = (sec: FormSection) => {
    if (confirm(`के तपाईं निश्चित हुनुहुन्छ? "${sec.title}" खण्ड फारमबाट हटाइनेछ।`)) {
      const updated = deleteSection(sec.id, adminName);
      setConfig(updated);
      showNotification(`"${sec.title}" फारम सफलतापूर्वक हटाइयो।`);
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (confirm("के तपाईं फारमलाई सुरुवाती पूर्वनिर्धारित सरकारी ढाँचामा फर्काउन चाहनुहुन्छ? सबै थपिएका खण्डहरू रिसेट हुनेछन्।")) {
      const def = resetFormConfig();
      setConfig(def);
      setMainTitle(def.mainTitle);
      setSubtitle(def.subtitle);
      setFiscalYear(def.fiscalYear);
      showNotification("फारम पूर्वनिर्धारित सरकारी ढाँचामा रिसेट भयो।");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                  सुपर प्रशासक नियन्त्रण
                </span>
                <span className="text-xs text-slate-300">
                  {adminName}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                फारम थप, नाम सम्पादन तथा संरचना व्यवस्थापन
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOTIFICATION MESSAGE */}
        {message && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-900 px-5 py-2.5 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* TABS HEADER */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("title")}
            className={`pb-3 px-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "title"
                ? "border-blue-900 text-blue-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Type className="w-4 h-4" />
            <span>फारमको मुख्य नाम सम्पादन</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sections")}
            className={`pb-3 px-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "sections"
                ? "border-blue-900 text-blue-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>खण्डहरूको नाम सम्पादन / हटाउने ({config.sections.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className={`pb-3 px-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "add"
                ? "border-blue-900 text-blue-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>नयाँ फारम / खण्ड थप गर्नुहोस्</span>
          </button>
        </div>

        {/* TAB BODY (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: EDIT FORM MAIN TITLE */}
          {activeTab === "title" && (
            <form onSubmit={handleSaveTitle} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
                <strong>💡 नाम संशोधन सुविधा:</strong> यदि कुनै फारमको मुख्य शीर्षक वा नाम मिस्टेक छ भने तपाईं (मुख्य प्रशासक) ले यहाँबाट तत्काल सच्याउन सक्नुहुन्छ। यो परिवर्तन वेबसाइटका सबै फारम र पोर्टलहरूमा लागू हुनेछ।
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  फारमको मुख्य नाम / शीर्षक (Main Form Title) *
                </label>
                <input
                  type="text"
                  required
                  value={mainTitle}
                  onChange={(e) => setMainTitle(e.target.value)}
                  placeholder="फारमको नाम लेख्नुहोस्..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  सहायक विवरण वा ढाँचा (Subtitle / Description)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="सहायक विवरण..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  लागू हुने आर्थिक वर्ष (Fiscal Year)
                </label>
                <input
                  type="text"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  placeholder="२०८२/०८३..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-xs text-slate-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>पूर्वनिर्धारित नाममा फर्काउनुहोस्</span>
                </button>

                <button
                  type="submit"
                  className="py-2.5 px-5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>फारमको नयाँ नाम सुरक्षित गर्नुहोस्</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SECTIONS LIST / RENAME / DELETE */}
          {activeTab === "sections" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  फारमका विद्यमान खण्डहरू ({config.sections.length} वटा)। कुनै खण्डको नाम मिस्टेक भएमा <strong>&lsquo;सम्पादन&rsquo;</strong> मा थिचेर सच्याउनुहोस् वा अनावश्यक खण्ड <strong>&lsquo;हटाउनुहोस्&rsquo;</strong>:
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("add")}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>नयाँ खण्ड थप्नुहोस्</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {config.sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {editingSectionId === sec.id ? (
                      /* Inline edit form */
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="खण्डको नाम..."
                            className="col-span-2 bg-white border border-blue-400 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-hidden"
                          />
                          <input
                            type="text"
                            value={editShort}
                            onChange={(e) => setEditShort(e.target.value)}
                            placeholder="संकेत (Short)..."
                            className="bg-white border border-blue-400 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden"
                          />
                        </div>
                        <input
                          type="text"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          placeholder="विवरण वा व्याख्या..."
                          className="w-full bg-white border border-blue-400 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-hidden"
                        />
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEditedSection(sec.id)}
                            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Save className="w-3 h-3" />
                            <span>सुरक्षित</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSectionId(null)}
                            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-xs font-medium cursor-pointer"
                          >
                            रद्द
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Normal view */
                      <>
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 text-xs font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                                {sec.title}
                              </h4>
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                                {sec.short}
                              </span>
                              {sec.isCustom && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-300">
                                  थप गरिएको
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{sec.desc}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditSection(sec)}
                            className="p-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-800 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="खण्डको नाम सम्पादन गर्नुहोस्"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>नाम सच्याउनुहोस्</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSection(sec)}
                            className="p-1.5 rounded-lg bg-white hover:bg-red-50 text-red-700 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="यो खण्ड हटाउनुहोस्"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">हटाउनुहोस्</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ADD NEW FORM / SECTION */}
          {activeTab === "add" && (
            <form onSubmit={handleAddSection} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950">
                <strong>➕ नयाँ फारम / खण्ड थप्ने सुविधा:</strong> मुख्य प्रशासकले प्रदेश वा स्थानीय तहका लागि आवश्यक नयाँ विषयगत फारम, अनुसूची वा खण्ड यहाँबाट तुरुन्तै थप गर्न सक्नुहुन्छ।
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  नयाँ फारम / खण्डको पूरा शीर्षक (Section Title) *
                </label>
                <input
                  type="text"
                  required
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="उदा. १४. विपद् व्यवस्थापन तथा उद्धार तयारी"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    संक्षिप्त कोड (Short Tab Code)
                  </label>
                  <input
                    type="text"
                    value={newSectionShort}
                    onChange={(e) => setNewSectionShort(e.target.value)}
                    placeholder="उदा. Q45 वा विपद्"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    फारमको प्रविष्टि प्रकार (Entry Type)
                  </label>
                  <select
                    value={newSectionType}
                    onChange={(e: any) => setNewSectionType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    <option value="text">विवरण तथा कैफियत प्रविष्टि (Text & Remarks)</option>
                    <option value="number">संख्यात्मक तथ्याङ्क प्रविष्टि (Numeric Indicators)</option>
                    <option value="table">विस्तृत बहु-सूचक तालिका (Table Matrix)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  फारमको व्याख्या वा निर्देशन (Description / Guidance)
                </label>
                <textarea
                  rows={3}
                  value={newSectionDesc}
                  onChange={(e) => setNewSectionDesc(e.target.value)}
                  placeholder="यस फारम खण्डमा के-कस्ता तथ्याङ्क भर्ने हो, सोको विवरण..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-700/20 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>फारममा नयाँ खण्ड थप्नुहोस् (Add Section)</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            अन्तिम परिमार्जन: <strong>{config.lastModifiedAt || "हालै"}</strong> ({config.lastModifiedBy || adminName})
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold cursor-pointer transition-colors"
          >
            बन्द गर्नुहोस्
          </button>
        </div>

      </div>
    </div>
  );
}
