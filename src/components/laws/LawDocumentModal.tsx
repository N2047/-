"use client";

import React, { useEffect, useRef } from "react";
import { LawDocument } from "@/lib/lawsData";
import { 
  X, 
  Download, 
  Printer, 
  ExternalLink, 
  Calendar, 
  Building2, 
  Tag, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface LawDocumentModalProps {
  document: LawDocument | null;
  onClose: () => void;
}

export default function LawDocumentModal({ document: doc, onClose }: LawDocumentModalProps) {
  const [zoomLevel, setZoomLevel] = React.useState<number>(100);
  const [pdfSearch, setPdfSearch] = React.useState<string>("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!doc) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="law-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-300 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-blue-950 text-white p-5 border-b-2 border-amber-500 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                {doc.category_name_ne}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                doc.gov_level === "federal" ? "bg-emerald-800 text-emerald-100" : "bg-purple-800 text-purple-100"
              }`}>
                {doc.gov_level === "federal" ? "संघीय सरकार" : doc.province_name_ne || "प्रदेश सरकार"}
              </span>
              {doc.is_amended && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-800 text-blue-200 border border-blue-600">
                  संशोधन सहित
                </span>
              )}
            </div>
            <h2 id="law-modal-title" className="text-xl sm:text-2xl font-black text-white leading-snug">
              {doc.title_ne}
            </h2>
            <p className="text-xs sm:text-sm text-blue-200 mt-0.5 font-medium">{doc.title_en}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="दस्तावेज विन्डो बन्द गर्नुहोस्"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body: Metadata Bar + Document Reader */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Metadata Grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block font-semibold">जारी गर्ने निकाय:</span>
              <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span>{doc.issuing_authority}</span>
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">प्रकाशन मिति:</span>
              <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>वि.सं. {doc.publication_date_bs}</span>
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">लागु मिति:</span>
              <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>वि.सं. {doc.effective_date_bs}</span>
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">फाइल विवरण:</span>
              <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <FileText className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>PDF ढाँचा ({doc.file_size})</span>
              </span>
            </div>
          </div>

          {/* Description / Summary */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">दस्तावेजको सार तथा मुख्य व्यवस्था:</h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-blue-50/40 p-4 rounded-xl border border-blue-100">
              {doc.description_ne}
            </p>
          </div>

          {/* Keywords / Tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" aria-hidden="true" />
            <span className="text-xs font-bold text-slate-500 mr-1">मुख्य शब्दहरू:</span>
            {doc.keywords.map((kw, i) => (
              <span key={i} className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                #{kw}
              </span>
            ))}
          </div>

          {/* ACCESSIBLE PDF VIEWER WORKSPACE */}
          <div className="border-2 border-slate-300 rounded-2xl overflow-hidden shadow-inner bg-slate-100">
            {/* PDF Viewer Control Bar */}
            <div className="bg-slate-800 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="font-bold truncate max-w-xs">{doc.title_ne}.pdf</span>
                <span className="text-slate-400">|</span>
                <span>पृष्ठ १ / १२</span>
              </div>

              {/* Zoom & Search Controls */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-slate-700 rounded px-1">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
                    className="p-1 hover:text-amber-300"
                    title="Zoom Out"
                    aria-label="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-1.5 font-mono text-[11px]">{zoomLevel}%</span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                    className="p-1 hover:text-amber-300"
                    title="Zoom In"
                    aria-label="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="hidden sm:flex items-center bg-slate-700 rounded px-2 py-0.5">
                  <Search className="w-3 h-3 text-slate-400 mr-1" />
                  <input
                    type="text"
                    placeholder="दस्तावेज भित्र खोज्नुहोस्..."
                    value={pdfSearch}
                    onChange={(e) => setPdfSearch(e.target.value)}
                    className="bg-transparent border-none text-[11px] text-white focus:outline-hidden w-36"
                  />
                </div>
              </div>
            </div>

            {/* Document Preview Canvas */}
            <div className="p-6 sm:p-10 flex justify-center overflow-x-auto min-h-[360px] bg-slate-200/80">
              <div 
                style={{ width: `${zoomLevel}%`, maxWidth: "750px" }}
                className="bg-white shadow-xl rounded-lg p-8 sm:p-12 text-slate-900 font-serif border border-slate-300 transition-all"
              >
                {/* Simulated Official Seal & Header */}
                <div className="text-center border-b border-slate-300 pb-6 mb-6">
                  <div className="w-12 h-12 mx-auto mb-2 text-red-700 font-black text-2xl border-2 border-red-700 rounded-full flex items-center justify-center">
                    🇳🇵
                  </div>
                  <h4 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                    {doc.issuing_authority}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 font-sans">
                    प्रकाशन मिति: वि.सं. {doc.publication_date_bs} | स्रोत: {doc.source}
                  </p>
                  <h3 className="text-lg font-bold text-slate-900 mt-4 underline underline-offset-4">
                    {doc.title_ne}
                  </h3>
                </div>

                {/* Simulated Statutory Body Paragraphs */}
                <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                  <p className="font-semibold text-justify">
                    <strong>प्रस्तावना:</strong> अपाङ्गता भएका व्यक्तिको मानव अधिकार, सम्मान तथा समानताको आधारमा समाजका सम्पूर्ण क्षेत्रमा अर्थपूर्ण सहभागिता सुनिश्चित गर्न, भेदभाव अन्त्य गर्न र समावेशी समाज निर्माण गर्न यो कानुनी दस्तावेज जारी गरिएको छ।
                  </p>
                  <p className="text-justify">
                    <strong>दफा/नियम १. संक्षिप्त नाम र प्रारम्भ:</strong> यस कानुनको नाम &ldquo;<strong>{doc.title_ne}</strong>&rdquo; रहेको छ। यो तुरुन्त प्रारम्भ हुनेछ।
                  </p>
                  <p className="text-justify">
                    <strong>दफा/नियम २. परिभाषा:</strong> यस दस्तावेजमा विषय वा प्रसङ्गले अर्को अर्थ नलागेमा &ldquo;अपाङ्गता&rdquo; भन्नाले शारीरिक, मानसिक, बौद्धिक वा इन्द्रिय सम्बन्धी दीर्घकालीन समस्या भएका व्यक्ति सम्झनुपर्दछ जसले समाजमा पूर्ण र प्रभावकारी सहभागितामा बाधा पुर्‍याउँछ।
                  </p>
                  <div className="p-3 bg-slate-50 border-l-4 border-blue-900 my-4 text-xs">
                    <em>नोट: सम्पूर्ण पूर्ण दस्तावेज आधिकारिक PDF फाइलमा उपलब्ध छ। कृपया पूर्ण कानुनी पाठका लागि तलको &lsquo;डाउनलोड गर्नुहोस्&rsquo; बटन प्रयोग गर्नुहोस्।</em>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            स्रोत: <strong>{doc.source}</strong> (आधिकारिक राजपत्र)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>प्रिन्ट गर्नुहोस्</span>
            </button>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert(`"${doc.title_ne}" को PDF डाउनलोड सुरु भयो।`);
              }}
              className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>PDF डाउनलोड गर्नुहोस् ({doc.file_size})</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
