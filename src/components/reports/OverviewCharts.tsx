"use client";

import React, { useRef } from "react";
import { Download, PieChart as PieIcon, BarChart2, CheckCircle2, TrendingUp } from "lucide-react";

interface OverviewChartsProps {
  grandTotals: any;
  titleSuffix?: string;
}

/**
 * Utility to download an SVG element as PNG
 */
function downloadSvgAsPng(svgElementId: string, fileName: string) {
  try {
    const svg = document.getElementById(svgElementId) as unknown as SVGSVGElement | null;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgSize = svg.getBoundingClientRect();
    canvas.width = svgSize.width * 2 || 800;
    canvas.height = svgSize.height * 2 || 600;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const a = document.createElement("a");
      a.download = `${fileName}_${Date.now()}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = url;
  } catch (e) {
    console.error("Chart download error", e);
    alert("तस्बिर डाउनलोड गर्दा प्राविधिक समस्या आयो।");
  }
}

/**
 * 1. वृत्त चित्र (Donut/Pie Chart) - परिचयपत्र ४ वर्ग
 */
export function CardColorsPieChart({ grandTotals, titleSuffix = "" }: OverviewChartsProps) {
  const chartId = "chart-card-colors-pie";

  const red = grandTotals.cardRedTotal || grandTotals.cardRed || 0;
  const blue = grandTotals.cardBlueTotal || grandTotals.cardBlue || 0;
  const yellow = grandTotals.cardYellowTotal || grandTotals.cardYellow || 0;
  const white = grandTotals.cardWhiteTotal || grandTotals.cardWhite || 0;
  const total = red + blue + yellow + white || 1;

  const redPct = Math.round((red / total) * 100);
  const bluePct = Math.round((blue / total) * 100);
  const yellowPct = Math.round((yellow / total) * 100);
  const whitePct = 100 - (redPct + bluePct + yellowPct);

  // SVG Donut calculation
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  const strokeRed = (red / total) * circumference;
  const strokeBlue = (blue / total) * circumference;
  const strokeYellow = (yellow / total) * circumference;
  const strokeWhite = (white / total) * circumference;

  const offsetRed = 0;
  const offsetBlue = -strokeRed;
  const offsetYellow = -(strokeRed + strokeBlue);
  const offsetWhite = -(strokeRed + strokeBlue + strokeYellow);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 flex items-center justify-center">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              वृत्त चित्र: परिचयपत्र ४ वर्ग वितरण {titleSuffix}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              गाम्भीर्यता अनुसार कार्डको अनुपात तथा हिस्सा
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => downloadSvgAsPng(chartId, "Card_Colors_Pie_Chart")}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="यो वृत्त चित्र तस्बिर (PNG) का रूपमा डाउनलोड गर्नुहोस्"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">PNG डाउनलोड</span>
        </button>
      </div>

      {/* Chart Canvas Area */}
      <div className="py-6 flex flex-col md:flex-row items-center justify-around gap-6">
        <div className="relative flex items-center justify-center">
          <svg id={chartId} width="220" height="220" viewBox="0 0 200 200" className="transform -rotate-90">
            {/* Background ring */}
            <circle cx="100" cy="100" r={radius} fill="transparent" stroke="#e2e8f0" strokeWidth="26" />
            {/* Red Arc */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="#e11d48"
              strokeWidth="26"
              strokeDasharray={`${strokeRed} ${circumference}`}
              strokeDashoffset={offsetRed}
              className="transition-all duration-700 hover:opacity-90"
            />
            {/* Blue Arc */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="#2563eb"
              strokeWidth="26"
              strokeDasharray={`${strokeBlue} ${circumference}`}
              strokeDashoffset={offsetBlue}
              className="transition-all duration-700 hover:opacity-90"
            />
            {/* Yellow Arc */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="#eab308"
              strokeWidth="26"
              strokeDasharray={`${strokeYellow} ${circumference}`}
              strokeDashoffset={offsetYellow}
              className="transition-all duration-700 hover:opacity-90"
            />
            {/* White/Gray Arc */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="#94a3b8"
              strokeWidth="26"
              strokeDasharray={`${strokeWhite} ${circumference}`}
              strokeDashoffset={offsetWhite}
              className="transition-all duration-700 hover:opacity-90"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[10px] uppercase font-bold text-slate-400">कुल परिचयपत्र</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {total.toLocaleString("ne-NP")}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold">१००% कभरेज</span>
          </div>
        </div>

        {/* Legend Table */}
        <div className="w-full md:w-60 space-y-2.5">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-600 inline-block shadow-xs" />
              <div>
                <span className="text-xs font-bold text-rose-950 dark:text-rose-200 block">रातो ('क') पूर्ण अशक्त</span>
                <span className="text-[10px] text-rose-700 dark:text-rose-400">SSA भत्ता मासिक रु. ४,३००</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black font-mono text-rose-950 dark:text-rose-200 block">{red.toLocaleString("ne-NP")}</span>
              <span className="text-[10px] font-bold text-rose-600">{redPct}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-600 inline-block shadow-xs" />
              <div>
                <span className="text-xs font-bold text-blue-950 dark:text-blue-200 block">निलो ('ख') अति अशक्त</span>
                <span className="text-[10px] text-blue-700 dark:text-blue-400">SSA भत्ता मासिक रु. २,१२८</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black font-mono text-blue-950 dark:text-blue-200 block">{blue.toLocaleString("ne-NP")}</span>
              <span className="text-[10px] font-bold text-blue-600">{bluePct}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block shadow-xs" />
              <div>
                <span className="text-xs font-bold text-amber-950 dark:text-amber-200 block">पहेँलो ('ग') मध्यम</span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400">सहुलियत तथा सीप सेवा</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black font-mono text-amber-950 dark:text-amber-200 block">{yellow.toLocaleString("ne-NP")}</span>
              <span className="text-[10px] font-bold text-amber-600">{yellowPct}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-400 inline-block shadow-xs" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">सेतो ('घ') सामान्य</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">पहिचान तथा सहायता</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black font-mono text-slate-900 dark:text-slate-100 block">{white.toLocaleString("ne-NP")}</span>
              <span className="text-[10px] font-bold text-slate-500">{whitePct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 2. स्तम्भ चित्र (Bar Chart) - १० प्रकारका अपाङ्गता वर्गीकरण
 */
export function DisabilityTypesBarChart({ grandTotals, titleSuffix = "" }: OverviewChartsProps) {
  const chartId = "chart-disability-types-bar";

  const types = [
    { name: "शारीरिक अपाङ्गता", count: grandTotals.typePhysical || 0, color: "#2563eb", bg: "bg-blue-600" },
    { name: "दृष्टिसम्बन्धी अपाङ्गता", count: grandTotals.typeVisual || 0, color: "#059669", bg: "bg-emerald-600" },
    { name: "सुनाइसम्बन्धी अपाङ्गता", count: grandTotals.typeHearing || 0, color: "#d97706", bg: "bg-amber-600" },
    { name: "मानसिक/मनोसामाजिक", count: grandTotals.typeMentalPsychosocial || 0, color: "#7c3aed", bg: "bg-purple-600" },
    { name: "बौद्धिक अपाङ्गता", count: grandTotals.typeIntellectual || 0, color: "#db2777", bg: "bg-pink-600" },
    { name: "स्वर र बोलाइसम्बन्धी", count: grandTotals.typeSpeech || 0, color: "#0891b2", bg: "bg-cyan-600" },
    { name: "बहु-अपाङ्गता", count: grandTotals.typeMultiple || 0, color: "#e11d48", bg: "bg-rose-600" },
    { name: "अटिजम सम्बन्धी", count: grandTotals.typeAutism || 0, color: "#4f46e5", bg: "bg-indigo-600" },
    { name: "श्रवणदृष्टिविहीन", count: grandTotals.typeDeafblind || 0, color: "#ea580c", bg: "bg-orange-600" },
    { name: "हेमोफेलिया", count: grandTotals.typeHemophilia || 0, color: "#dc2626", bg: "bg-red-600" },
  ];

  const maxCount = Math.max(...types.map((t) => t.count), 1);
  const totalCount = types.reduce((s, t) => s + t.count, 0) || 1;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              स्तम्भ चित्र: १० प्रकारका अपाङ्गता तुलना {titleSuffix}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              प्रदेशभर पहिचान भएका १० प्रकृतिका अपाङ्गताको स्तम्भ अनुपात
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => downloadSvgAsPng(chartId, "Disability_10_Types_Bar_Chart")}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="यो स्तम्भ चित्र तस्बिर (PNG) का रूपमा डाउनलोड गर्नुहोस्"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">PNG डाउनलोड</span>
        </button>
      </div>

      {/* SVG Container for crisp export & rendering */}
      <div className="py-4 overflow-x-auto">
        <svg id={chartId} width="100%" height="280" viewBox="0 0 650 280" className="min-w-[550px]">
          {/* Background gridlines */}
          <line x1="160" y1="20" x2="630" y2="20" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="160" y1="70" x2="630" y2="70" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="160" y1="120" x2="630" y2="120" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="160" y1="170" x2="630" y2="170" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="160" y1="220" x2="630" y2="220" stroke="#f1f5f9" strokeWidth="1" />

          {/* Bars */}
          {types.map((t, idx) => {
            const y = 20 + idx * 24;
            const barWidth = Math.max(8, (t.count / maxCount) * 410);
            const pct = ((t.count / totalCount) * 100).toFixed(1);

            return (
              <g key={idx} className="cursor-pointer group">
                <text x="150" y={y + 13} textAnchor="end" fontSize="11" fontWeight="bold" fill="#334155">
                  {t.name}
                </text>
                {/* Background track */}
                <rect x="160" y={y + 2} width="410" height="15" rx="4" fill="#f8fafc" />
                {/* Value Bar */}
                <rect
                  x="160"
                  y={y + 2}
                  width={barWidth}
                  height="15"
                  rx="4"
                  fill={t.color}
                  className="transition-all duration-500 hover:opacity-85"
                />
                {/* Numeric Label */}
                <text x={168 + barWidth} y={y + 13} fontSize="10" fontWeight="bold" fill="#0f172a">
                  {t.count.toLocaleString("ne-NP")} ({pct}%)
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
        <span>* सर्वोच्च संख्या: शारीरिक अपाङ्गता ({Math.round(((grandTotals.typePhysical || 0) / totalCount) * 100)}%)</span>
        <span>कुल प्रकारगत योग: {totalCount.toLocaleString("ne-NP")} जना</span>
      </div>
    </div>
  );
}

/**
 * 3. तुलनात्मक स्तम्भ चित्र - सामाजिक सुरक्षा भत्ता & बजेट
 */
export function SsaAndBudgetComparisonChart({ grandTotals, titleSuffix = "" }: OverviewChartsProps) {
  const chartId = "chart-ssa-budget-bar";

  const totalBudgetLakh = Number(((grandTotals.allocatedBudgetNPR || 0) / 100000).toFixed(1));
  const ssaAnnualLakh = Number(((grandTotals.ssaBudgetNPR || 0) / 100000).toFixed(1));
  const dpoGrantLakh = Number(((grandTotals.dpoGrantSettledNPR || 0) / 100000).toFixed(1));
  const seedFundLakh = Number(((grandTotals.totalFundsNPR || 0) / 100000).toFixed(1));

  const items = [
    { label: "वार्षिक SSA भत्ता बजेट", value: ssaAnnualLakh, unit: "लाख रु.", color: "#059669" },
    { label: "स्थानीय अपाङ्गता बजेट", value: totalBudgetLakh, unit: "लाख रु.", color: "#d97706" },
    { label: "संस्थागत अनुदान फर्छ्यौट", value: dpoGrantLakh, unit: "लाख रु.", color: "#2563eb" },
    { label: "घुम्ती कोष परिचालन", value: seedFundLakh, unit: "लाख रु.", color: "#7c3aed" },
  ];

  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              स्तम्भ चित्र: बजेट, भत्ता र कोष तुलना {titleSuffix}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              सामाजिक सुरक्षा भत्ता तथा स्थानीय तहहरूबाट विनियोजित रकम (रु. लाखमा)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => downloadSvgAsPng(chartId, "Budget_SSA_Comparison_Chart")}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="यो स्तम्भ चित्र तस्बिर (PNG) का रूपमा डाउनलोड गर्नुहोस्"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">PNG डाउनलोड</span>
        </button>
      </div>

      <div className="py-6 overflow-x-auto">
        <svg id={chartId} width="100%" height="220" viewBox="0 0 550 220" className="min-w-[450px]">
          {/* Horizontal Grid */}
          <line x1="50" y1="30" x2="520" y2="30" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="50" y1="80" x2="520" y2="80" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="50" y1="130" x2="520" y2="130" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="50" y1="180" x2="520" y2="180" stroke="#cbd5e1" strokeWidth="2" />

          {/* Vertical Columns */}
          {items.map((item, idx) => {
            const colWidth = 64;
            const x = 80 + idx * 115;
            const barHeight = Math.max(12, (item.value / maxValue) * 140);
            const y = 180 - barHeight;

            return (
              <g key={idx} className="cursor-pointer">
                {/* Column */}
                <rect
                  x={x}
                  y={y}
                  width={colWidth}
                  height={barHeight}
                  rx="8"
                  fill={item.color}
                  className="transition-all duration-500 hover:opacity-85"
                />
                {/* Value on top */}
                <text
                  x={x + colWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill={item.color}
                >
                  रु. {item.value.toLocaleString("ne-NP")} L
                </text>
                {/* Label on bottom */}
                <text
                  x={x + colWidth / 2}
                  y="200"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#475569"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
        {items.map((i, idx) => (
          <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-500 block truncate">{i.label}</span>
            <span className="text-xs font-black text-slate-900 dark:text-white" style={{ color: i.color }}>
              रु. {i.value.toLocaleString("ne-NP")} {i.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 4. लैंगिक अनुपात (महिला vs पुरुष) - वृत्त चित्र
 */
export function GenderBreakdownPieChart({ grandTotals, titleSuffix = "" }: OverviewChartsProps) {
  const chartId = "chart-gender-pie";

  const female = grandTotals.identifiedFemale || 0;
  const male = grandTotals.identifiedMale || 0;
  const total = female + male || 1;

  const femalePct = Math.round((female / total) * 100);
  const malePct = 100 - femalePct;

  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const strokeFemale = (female / total) * circumference;
  const strokeMale = (male / total) * circumference;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              वृत्त चित्र: लैंगिक अनुपात (महिला / पुरुष) {titleSuffix}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              पहिचान भएका कुल अपाङ्गता व्यक्तिहरूमा लैंगिक हिस्सा
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => downloadSvgAsPng(chartId, "Gender_Breakdown_Pie_Chart")}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="यो वृत्त चित्र तस्बिर (PNG) का रूपमा डाउनलोड गर्नुहोस्"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">PNG डाउनलोड</span>
        </button>
      </div>

      <div className="py-6 flex flex-col sm:flex-row items-center justify-around gap-6">
        <div className="relative flex items-center justify-center">
          <svg id={chartId} width="200" height="200" viewBox="0 0 180 180" className="transform -rotate-90">
            <circle cx="90" cy="90" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="24" />
            {/* Female Arc */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="transparent"
              stroke="#ec4899"
              strokeWidth="24"
              strokeDasharray={`${strokeFemale} ${circumference}`}
              strokeDashoffset="0"
              className="transition-all duration-700"
            />
            {/* Male Arc */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="transparent"
              stroke="#3b82f6"
              strokeWidth="24"
              strokeDasharray={`${strokeMale} ${circumference}`}
              strokeDashoffset={-strokeFemale}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[10px] text-slate-400 font-bold uppercase">जम्मा</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">{total.toLocaleString("ne-NP")}</span>
          </div>
        </div>

        <div className="w-full sm:w-48 space-y-3">
          <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-900 dark:text-pink-200">महिला लाभग्राही</span>
              <span className="text-xs font-black text-pink-700">{femalePct}%</span>
            </div>
            <span className="text-base font-black font-mono text-pink-950 dark:text-pink-100 block mt-1">
              {female.toLocaleString("ne-NP")}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-200">पुरुष लाभग्राही</span>
              <span className="text-xs font-black text-blue-700">{malePct}%</span>
            </div>
            <span className="text-base font-black font-mono text-blue-950 dark:text-blue-100 block mt-1">
              {male.toLocaleString("ne-NP")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
