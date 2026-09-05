"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAccessibility } from "@/lib/accessibilityContext";
import {
  MessageSquare,
  Bot,
  User,
  Send,
  X,
  Minimize2,
  Maximize2,
  Settings,
  Volume2,
  VolumeX,
  RotateCcw,
  ExternalLink,
  Sparkles,
  Check,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Database,
  FileText,
  HelpCircle,
  Cpu,
  ChevronRight,
  Loader2,
  AlertCircle
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ title: string; url: string; category: string }>;
  provider?: string;
  timestamp: string;
  isLiked?: boolean;
  isDisliked?: boolean;
}

const QUICK_SUGGESTIONS = [
  "📜 अपाङ्गता अधिकार ऐन २०७४ र नियमावलीका मुख्य व्यवस्था के हुन्?",
  "🪪 रातो र निलो कार्ड पाउनेले कति सामाजिक सुरक्षा भत्ता पाउँछन्?",
  "🦽 सहायक सामग्री (ह्वीलचेयर/सेतो छडी) कसरी प्राप्त गर्न सकिन्छ?",
  "🏠 गृहभेट तथ्याङ्क र अनुसूची १.१ मा के के भर्नुपर्छ?",
  "📝 वार्षिक प्रतिवेदनका ४४ प्रश्न कसरी प्रविष्टि गर्ने?",
  "📊 कोशी प्रदेशमा १० प्रकारका अपाङ्गताको स्थिति कस्तो छ?"
];

export default function DicChatbot() {
  const { darkMode, colorMode, speakText, stopSpeech } = useAccessibility();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Settings
  const [webhookUrl, setWebhookUrl] = useState("");
  const [openAiKey, setOpenAiKey] = useState("");
  const [saveStatus, setSaveStatus] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content: `नमस्ते! म **अपाङ्गता सूचना केन्द्र (DIC) AI सहायक** हुँ।

म यस वेब एपमा रहेका **कानुन तथा नीतिगत ऐन-नियम (२८+)**, **१० वटा विषयगत प्रतिवेदनका तथ्याङ्क**, **१४ जिल्ला र १३७ स्थानीय तह प्रोफाइल**, र **४४ वटा वार्षिक प्रतिवेदन प्रश्नहरू** बारे सटिक र आधिकारिक जवाफ दिन सक्छु।

कृपया तलको सुझावबाट छान्नुहोस् वा आफ्नो प्रश्न टाइप गर्नुहोस्:`,
      sources: [
        { title: "कानुन तथा नीतिगत भण्डार", url: "/laws", category: "कानुन" },
        { title: "तथ्याङ्क तथा प्रतिवेदन", url: "/reports", category: "प्रतिवेदन" },
        { title: "१३७ स्थानीय तह पोर्टल", url: "/local-reporting", category: "स्थानीय तह" }
      ],
      timestamp: "अहिले"
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load saved settings & chat history
  useEffect(() => {
    try {
      const savedWebhook = localStorage.getItem("dic_ai_webhook_url");
      if (savedWebhook) setWebhookUrl(savedWebhook);
      const savedKey = localStorage.getItem("dic_ai_openai_key");
      if (savedKey) setOpenAiKey(savedKey);

      const savedChat = localStorage.getItem("dic_ai_chat_history_v1");
      if (savedChat) {
        const parsed = JSON.parse(savedChat);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load AI Chatbot settings", e);
    }
  }, []);

  // Save chat history
  useEffect(() => {
    try {
      if (messages.length > 1) {
        localStorage.setItem("dic_ai_chat_history_v1", JSON.stringify(messages.slice(-20)));
      }
    } catch (e) {
      console.error("Failed to save AI chat history", e);
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Handle Save Settings
  const handleSaveSettings = () => {
    try {
      localStorage.setItem("dic_ai_webhook_url", webhookUrl.trim());
      localStorage.setItem("dic_ai_openai_key", openAiKey.trim());
      setSaveStatus(true);
      setTimeout(() => setSaveStatus(false), 2500);
      setIsSettingsOpen(false);
    } catch (e) {
      console.error("Failed to save webhook settings", e);
    }
  };

  // Clear Chat History
  const handleClearChat = () => {
    stopSpeech();
    setIsSpeaking(false);
    const initialMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: "च्याट इतिहास सफा गरिएको छ। तपाईंलाई आज अपाङ्गता सूचना केन्द्र सम्बन्धी कुन विषयमा सहयोग चाहिएको छ?",
      timestamp: "अहिले"
    };
    setMessages([initialMsg]);
    localStorage.removeItem("dic_ai_chat_history_v1");
  };

  // Text to speech toggle
  const handleToggleSpeech = (text: string) => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      // Strip markdown symbols for clean speech reading
      const cleanText = text
        .replace(/[#*`_~\[\]()]/g, "")
        .replace(/\n+/g, "। ");
      speakText(cleanText, true);
      setIsSpeaking(true);
    }
  };

  // Copy to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Like / Dislike
  const handleFeedback = (id: string, type: "like" | "dislike") => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === id) {
        return {
          ...msg,
          isLiked: type === "like" ? !msg.isLiked : false,
          isDisliked: type === "dislike" ? !msg.isDisliked : false,
        };
      }
      return msg;
    }));
  };

  // Send Message
  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: "dic-client-session",
          conversationHistory: messages.slice(-4).map(m => ({ role: m.role, content: m.content })),
          customWebhookUrl: webhookUrl.trim() || undefined,
          customOpenAiKey: openAiKey.trim() || undefined,
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: data.answer || "माफ गर्नुहोस्, यस विषयमा जवाफ निर्माण गर्न सकिएन।",
        sources: data.sources || [],
        provider: data.provider || "dic-engine",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "माफ गर्नुहोस्, सर्भरसँग सम्पर्क हुन सकेन। कृपया आफ्नो इन्टरनेट वा n8n Webhook सेटिङ्स जाँच गरी पुन: प्रयास गर्नुहोस्।",
        timestamp: "त्रुटि"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Render markdown helper (Headings, bold, bullets, links)
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      // Heading 3
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="font-bold text-base mt-2 mb-1 text-slate-900 dark:text-white flex items-center gap-1.5">
            {line.replace("### ", "")}
          </h4>
        );
      }
      // Heading 2
      if (line.startsWith("## ")) {
        return (
          <h3 key={idx} className="font-bold text-lg mt-2.5 mb-1 text-slate-900 dark:text-white">
            {line.replace("## ", "")}
          </h3>
        );
      }
      // Bullet list
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const text = line.replace(/^[-*]\s+/, "");
        return (
          <div key={idx} className="flex items-start gap-2 my-0.5 ml-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-1 text-xs">•</span>
            <div className="flex-1">{parseInlineFormatting(text)}</div>
          </div>
        );
      }
      // Numbered list
      if (/^\d+\.\s+/.test(line)) {
        const num = line.match(/^(\d+\.)\s+/)?.[1];
        const text = line.replace(/^\d+\.\s+/, "");
        return (
          <div key={idx} className="flex items-start gap-2 my-0.5 ml-2">
            <span className="text-blue-600 dark:text-blue-400 font-bold text-xs mt-0.5">{num}</span>
            <div className="flex-1">{parseInlineFormatting(text)}</div>
          </div>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      // Regular paragraph
      return (
        <p key={idx} className="my-1 leading-relaxed">
          {parseInlineFormatting(line)}
        </p>
      );
    });
  };

  // Helper for bold and markdown links
  const parseInlineFormatting = (text: string) => {
    // Split by markdown links [title](url) and bold **bold**
    const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      // Link: [text](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <Link
            key={i}
            href={linkMatch[2]}
            className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-800 transition inline-flex items-center gap-0.5 mx-0.5"
            onClick={() => setIsOpen(false)}
          >
            {linkMatch[1]}
            <ExternalLink className="w-3 h-3 inline" />
          </Link>
        );
      }
      // Bold: **text**
      const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
      if (boldMatch) {
        return <strong key={i} className="font-semibold text-slate-900 dark:text-white">{boldMatch[1]}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 print:hidden">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI सहायकसँग सोध्नुहोस्</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "AI च्याटबोट बन्द गर्नुहोस्" : "अपाङ्गता सूचना केन्द्र AI च्याटबोट खोल्नुहोस्"}
          className={`relative p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-emerald-400 ${
            isOpen
              ? "bg-slate-700 hover:bg-slate-800 text-white rotate-90"
              : "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white hover:scale-105"
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full animate-ping" />
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </>
          )}
        </button>
      </div>

      {/* Chat Window Modal / Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="अपाङ्गता सूचना केन्द्र AI च्याटबोट"
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-800 ${
            isExpanded
              ? "inset-2 sm:inset-6 rounded-2xl"
              : "bottom-20 right-4 sm:right-6 w-[95vw] sm:w-[440px] h-[580px] max-h-[85vh] rounded-2xl"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white rounded-t-2xl shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Bot className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm sm:text-base leading-none">DIC AI सहायक</h3>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-100 border border-emerald-300/30 px-1.5 py-0.5 rounded font-mono">
                    n8n + OpenAI
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-emerald-100/90">सक्रिय • २८+ कानुन, १० प्रतिवेदन, १३७ पालिका</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Settings Button */}
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                title="n8n Webhook / OpenAI सेटिङ्स"
                className={`p-1.5 rounded-lg hover:bg-white/20 transition ${isSettingsOpen ? "bg-white/25" : ""}`}
                aria-label="सेटिङ्स खोल्नुहोस्"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Clear Chat Button */}
              <button
                onClick={handleClearChat}
                title="च्याट खाली गर्नुहोस्"
                className="p-1.5 rounded-lg hover:bg-white/20 transition"
                aria-label="च्याट खाली गर्नुहोस्"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Expand / Minimize */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "साधारण आकार" : "ठूलो आकार"}
                className="hidden sm:block p-1.5 rounded-lg hover:bg-white/20 transition"
                aria-label={isExpanded ? "साधारण आकार" : "ठूलो आकार"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                title="बन्द गर्नुहोस्"
                className="p-1.5 rounded-lg hover:bg-white/20 transition"
                aria-label="बन्द गर्नुहोस्"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Panel Drawer */}
          {isSettingsOpen && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 text-xs animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200 text-sm">
                  <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>n8n Webhook तथा OpenAI कन्फिगरेसन</span>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-3 text-[11px] leading-relaxed">
                तपाईंको n8n सर्भरमा रहेको Webhook URL यहाँ राख्नुहोस्। यदि खाली छाडिएमा वेब एपको आन्तरिक प्रमाणित DIC नलेज इन्जिन स्वतः सक्रिय रहनेछ।
              </p>

              <div className="space-y-2">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    n8n Webhook URL:
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="उदा: http://localhost:5678/webhook/dic-chat"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Direct OpenAI API Key (वैकल्पिक):
                  </label>
                  <input
                    type="password"
                    value={openAiKey}
                    onChange={(e) => setOpenAiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                    <Database className="w-3 h-3" />
                    <span>जोडिएका स्रोत: २८ कानुन • १० प्रतिवेदन • १३७ पालिका</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {saveStatus && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                        <Check className="w-3.5 h-3.5" /> सुरक्षित भयो!
                      </span>
                    )}
                    <button
                      onClick={handleSaveSettings}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow transition"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed text-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-tr-none shadow-md"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? renderFormattedContent(msg.content) : msg.content}
                  </div>

                  {/* Sources Pills */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> स्रोत:
                      </span>
                      {msg.sources.map((src, idx) => (
                        <Link
                          key={idx}
                          href={src.url}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] bg-slate-200/80 dark:bg-slate-700/80 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 px-2 py-0.5 rounded-full border border-slate-300/50 dark:border-slate-600/50 transition"
                        >
                          <span>{src.title}</span>
                          <ChevronRight className="w-2.5 h-2.5 opacity-60" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Actions (Copy, TTS, Like) */}
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mt-1.5 text-slate-400 dark:text-slate-500 text-xs">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-slate-700 dark:hover:text-slate-300 transition flex items-center gap-1"
                        title="प्रतिलिपि गर्नुहोस्"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[10px]">{copiedId === msg.id ? "कपी भयो" : "कपी"}</span>
                      </button>

                      <button
                        onClick={() => handleToggleSpeech(msg.content)}
                        className="hover:text-slate-700 dark:hover:text-slate-300 transition flex items-center gap-1"
                        title="आवाजमा सुन्नुहोस्"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">सुन्नुहोस्</span>
                      </button>

                      <div className="h-3 w-[1px] bg-slate-300 dark:bg-slate-700 mx-0.5" />

                      <button
                        onClick={() => handleFeedback(msg.id, "like")}
                        className={`hover:text-emerald-600 transition ${msg.isLiked ? "text-emerald-600 font-bold" : ""}`}
                        title="उपयोगी छ"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleFeedback(msg.id, "dislike")}
                        className={`hover:text-rose-500 transition ${msg.isDisliked ? "text-rose-500 font-bold" : ""}`}
                        title="उपयोगी भएन"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>

                      <span className="text-[10px] ml-auto text-slate-400">{msg.timestamp}</span>
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>DIC नलेज बेस र AI एजेन्टबाट जवाफ तयार हुँदैछ...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          {messages.length < 3 && !isLoading && (
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-emerald-600" />
                <span>सुझाव गरिएका विषयगत प्रश्नहरू:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {QUICK_SUGGESTIONS.map((sugg, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(sugg)}
                    className="text-left text-xs bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs transition"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <textarea
                ref={textareaRef}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder="यहाँ आफ्नो प्रश्न टाइप गर्नुहोस् (Enter थिचेर पठाउनुहोस्)..."
                className="flex-1 max-h-24 resize-none px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition leading-relaxed"
              />

              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                aria-label="सन्देश पठाउनुहोस्"
                className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-40 text-white shadow-md transition shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </form>

            <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-slate-400">
              <span>WCAG 2.2 AA पहुँचयुक्त AI • नेपाली/English</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                OpenAI & n8n Linked
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
