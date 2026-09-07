"use client";

import React, { useState, useRef } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Link as LinkIcon, 
  Eye, 
  Edit3,
  AlignLeft,
  AlignCenter
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  lang?: "ne" | "en";
  minHeight?: string;
}

/**
 * Basic safe HTML renderer for markdown & allowed semantic tags
 */
export function renderSanitizedContent(text: string) {
  if (!text) return null;

  // Basic markdown conversion
  let html = text
    // Headings
    .replace(/^### (.*$)/gim, '<h4 class="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 class="text-lg font-black text-slate-900 dark:text-white mt-4 mb-2">$1</h3>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
    // Quotes
    .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-blue-600 pl-4 py-1 italic my-2 bg-blue-50/50 dark:bg-blue-950/30 rounded-r-lg">$1</blockquote>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300 leading-relaxed">$1</li>')
    .replace(/^\d+\.\s(.*$)/gim, '<li class="ml-4 list-decimal text-slate-700 dark:text-slate-300 leading-relaxed">$1</li>')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline font-semibold hover:text-blue-800">$1</a>')
    // Paragraphs / Linebreaks
    .replace(/\n\n/gim, '</p><p class="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">')
    .replace(/\n/gim, '<br/>');

  // Strip dangerous scripts and event handlers
  html = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/javascript:/gi, "");

  return (
    <div 
      className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-slate-700 dark:text-slate-300"
      dangerouslySetInnerHTML={{ __html: `<p class="leading-relaxed">${html}</p>` }} 
    />
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "सामग्री प्रविष्ट गर्नुहोस्...",
  label,
  lang = "ne",
  minHeight = "min-h-[160px]"
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (prefix: string, suffix = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = prefix + (selectedText || (lang === "ne" ? "पाठ" : "text")) + suffix;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || (lang === "ne" ? 3 : 4))
      );
    }, 10);
  };

  const insertLink = () => {
    const url = prompt(lang === "ne" ? "वेब लिङ्क (URL) प्रविष्ट गर्नुहोस्:" : "Enter Web Link (URL):", "https://");
    if (!url) return;
    const text = prompt(lang === "ne" ? "लिङ्कको नाम (Text):" : "Link Text:", "यहाँ क्लिक गर्नुहोस्");
    insertFormatting(`[${text || url}](`, `${url})`);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>{label}</span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                activeTab === "edit"
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>{lang === "ne" ? "सम्पादन (Edit)" : "Edit"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                activeTab === "preview"
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>{lang === "ne" ? "पूर्वावलोकन (Preview)" : "Preview"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Editor Container */}
      <div className="rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-600 transition">
        
        {/* Formatting Toolbar */}
        {activeTab === "edit" && (
          <div className="flex items-center flex-wrap gap-1 p-1.5 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <button
              type="button"
              title="Bold (**text**)"
              onClick={() => insertFormatting("**", "**")}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Italic (*text*)"
              onClick={() => insertFormatting("*", "*")}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Underline (<u>text</u>)"
              onClick={() => insertFormatting("<u>", "</u>")}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-0.5" />

            <button
              type="button"
              title="Heading 2 (## Title)"
              onClick={() => insertFormatting("## ")}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Heading 3 (### Subtitle)"
              onClick={() => insertFormatting("### ")}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-0.5" />

            <button
              type="button"
              title="Bullet List (- item)"
              onClick={() => insertFormatting("- ")}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Numbered List (1. item)"
              onClick={() => insertFormatting("1. ")}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Quote (> quote)"
              onClick={() => insertFormatting("> ")}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-0.5" />

            <button
              type="button"
              title="Insert Link"
              onClick={insertLink}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
            </button>
          </div>
        )}

        {/* Edit Area or Preview Area */}
        {activeTab === "edit" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full p-3 text-xs bg-transparent border-none focus:outline-hidden resize-y ${minHeight} leading-relaxed font-sans`}
          />
        ) : (
          <div className={`p-3 bg-slate-50 dark:bg-slate-950/40 ${minHeight} overflow-y-auto`}>
            {value ? (
              renderSanitizedContent(value)
            ) : (
              <span className="text-xs text-slate-400 italic">
                {lang === "ne" ? "पूर्वावलोकन गर्न केही पाठ लेख्नुहोस्..." : "Write some content to see preview..."}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
