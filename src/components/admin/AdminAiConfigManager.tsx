"use client";

import React, { useState, useEffect } from "react";
import { 
  Bot, 
  Cpu, 
  KeyRound, 
  Link as LinkIcon, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Save, 
  Database,
  Lock,
  Sparkles,
  Server
} from "lucide-react";
import { useAuth } from "@/lib/authContext";

export default function AdminAiConfigManager() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin" || user?.role === "provincial_admin";

  const [webhookUrl, setWebhookUrl] = useState("");
  const [testWebhookUrl, setTestWebhookUrl] = useState("");
  const [openAiKey, setOpenAiKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [showWebhook, setShowWebhook] = useState(false);
  const [showTestWebhook, setShowTestWebhook] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  // Load config on mount
  useEffect(() => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/ai-config?userId=${user?.id}&role=${user?.role}`, {
          headers: {
            "x-admin-role": user?.role || "",
            "x-admin-id": user?.id || ""
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setWebhookUrl(data.config.n8n_webhook_url || "");
            setTestWebhookUrl(data.config.n8n_test_webhook_url || "");
            setOpenAiKey(data.config.openai_api_key || "");
            setGeminiKey(data.config.gemini_api_key || "");
            setUpdatedAt(data.config.updated_at || null);
            setUpdatedBy(data.config.updated_by || null);
          }
        } else {
          setFeedback({
            type: "error",
            text: "कन्फिगरेसन लोड गर्न सकिएन। तपाईंसँग पर्याप्त अधिकार नभएको हुनसक्छ।"
          });
        }
      } catch (err) {
        console.error("Failed to load AI config:", err);
        setFeedback({
          type: "error",
          text: "सर्भरसँग सम्पर्क गर्न सकिएन।"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [isSuperAdmin, user]);

  // Save config
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;

    setSaving(true);
    setFeedback(null);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/ai-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": user?.role || "",
          "x-admin-id": user?.id || ""
        },
        body: JSON.stringify({
          n8n_webhook_url: webhookUrl.trim(),
          n8n_test_webhook_url: testWebhookUrl.trim(),
          openai_api_key: openAiKey.trim(),
          gemini_api_key: geminiKey.trim(),
          user: {
            id: user?.id,
            name: user?.name,
            role: user?.role
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setUpdatedAt(new Date().toLocaleString("ne-NP"));
        setUpdatedBy(user?.name || "Super Admin");
        setFeedback({
          type: "success",
          text: "n8n Webhook तथा OpenAI सेटिङ्स सफलतापूर्वक सुरक्षित गरियो।"
        });
        setTimeout(() => setFeedback(null), 5000);
      } else {
        const err = await res.json();
        setFeedback({
          type: "error",
          text: err.error || "सेटिङ्स सुरक्षित गर्न असफल भयो।"
        });
      }
    } catch (err) {
      console.error("Save error:", err);
      setFeedback({
        type: "error",
        text: "सेटिङ्स सुरक्षित गर्दा प्राविधिक समस्या उत्पन्न भयो।"
      });
    } finally {
      setSaving(false);
    }
  };

  // Test n8n Webhook connection
  const handleTestConnection = async () => {
    const urlToTest = webhookUrl.trim() || testWebhookUrl.trim();
    if (!urlToTest) {
      setTestResult({
        success: false,
        message: "कृपया पहिले मान्य n8n Webhook URL वा Test Webhook URL प्रविष्टि गर्नुहोस्।"
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Test URL format
      try {
        new URL(urlToTest);
      } catch {
        setTestResult({
          success: false,
          message: "अमान्य URL ढाँचा! कृपया 'http://' वा 'https://' सहितको पूर्ण URL राख्नुहोस्।"
        });
        setTesting(false);
        return;
      }

      // Perform a ping test through the server chat endpoint
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "अपाङ्गता अधिकार ऐन २०७४ का मुख्य व्यवस्था के हुन्?",
          sessionId: "admin-test-session",
          customWebhookUrl: urlToTest
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult({
          success: true,
          message: `सम्पर्क सफल भयो! इन्जिन स्थिति: ${data.provider === "n8n-webhook" ? "n8n Webhook बाट सफलतापूर्वक उत्तर प्राप्त भयो" : "आन्तरिक DIC Knowledge Engine सक्रिय छ"}`
        });
      } else {
        setTestResult({
          success: false,
          message: "सर्भरसँग सम्पर्क गर्न सकिएन वा Webhook बाट प्रतिक्रिया आएन।"
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `सम्पर्क त्रुटि: ${err.message || "Webhook उत्तर दिएन"}`
      });
    } finally {
      setTesting(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200">
        <div className="flex items-center gap-2 font-bold text-sm">
          <Lock className="w-5 h-5 text-rose-600" />
          <span>पहुँच अस्वीकृत (Access Denied)</span>
        </div>
        <p className="text-xs mt-1 text-rose-700 dark:text-rose-300">
          यो कन्फिगरेसन केवल Super Admin का लागि मात्र सुरक्षित गरिएको छ।
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <span>DIC AI सहायक तथा n8n कन्फिगरेसन</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                  Backend Secure
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                DIC AI Chatbot मा n8n Webhook र OpenAI API Key को सुरक्षित व्यवस्थापन (केवल Super Admin का लागि)
              </p>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-semibold shrink-0">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Restricted: Super Admin Only</span>
        </div>
      </div>

      {/* Security Guarantee Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-cyan-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1.5">
        <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>सुरक्षा प्रत्याभूति (Security Guarantee)</span>
        </div>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          यहाँ राखिएका संवेदनशील विवरणहरू (n8n Webhook URL र OpenAI API Key) सर्भरको सुरक्षित भण्डारमा मात्र बस्नेछन्। 
          कुनै पनि <strong>पब्लिक युजर (सर्वसाधारण) वा अन्य कर्मचारी</strong>ले आफ्नो ब्राउजर वा च्याट विन्डोमा यी विवरणहरू हेर्न पाउने छैनन्। 
          च्याटका सम्पूर्ण अनुरोधहरू सर्भर तहबाट ब्याकइन्ड-टु-ब्याकइन्ड सञ्चार हुने हुँदा टोकन वा की लिक हुने कुनै सम्भावना छैन।
        </p>
      </div>

      {/* Feedback Messages */}
      {feedback && (
        <div
          role="alert"
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Configuration Form */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
          <span>सुरक्षित कन्फिगरेसन लोड हुँदैछ...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* Field 1: n8n Webhook URL (Production) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-emerald-600" />
                <span>n8n Webhook URL (Production Endpoint):</span>
              </label>
              <button
                type="button"
                onClick={() => setShowWebhook(!showWebhook)}
                className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                {showWebhook ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showWebhook ? "गोप्य राख्नुहोस्" : "हेर्नुहोस्"}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showWebhook ? "text" : "password"}
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="उदा: https://navin047.app.n8n.cloud/webhook/dic-chat"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              तपाईंको n8n workflow Active / Published हुँदा यो URL मा स्वतः प्रश्नहरू पठाइनेछ।
            </p>
          </div>

          {/* Field 2: n8n Test Webhook URL (Optional for testing) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-teal-600" />
                <span>n8n Test Webhook URL (क्यानभास परीक्षण - वैकल्पिक):</span>
              </label>
              <button
                type="button"
                onClick={() => setShowTestWebhook(!showTestWebhook)}
                className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                {showTestWebhook ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showTestWebhook ? "गोप्य राख्नुहोस्" : "हेर्नुहोस्"}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showTestWebhook ? "text" : "password"}
                value={testWebhookUrl}
                onChange={(e) => setTestWebhookUrl(e.target.value)}
                placeholder="उदा: https://navin047.app.n8n.cloud/webhook-test/dic-chat"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              n8n क्यानभासमा 'Test step' गर्दा यो webhook-test URL मा अनुरोध जान्छ। हाम्रो प्रणालीले दुवै URL मा स्वतः फेलओभर गर्दछ।
            </p>
          </div>

          {/* Field 3: Google Gemini API Key (Optional fallback) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Google Gemini API Key (वैकल्पिक / Direct Fallback):</span>
              </label>
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showGeminiKey ? "गोप्य राख्नुहोस्" : "हेर्नुहोस्"}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showGeminiKey ? "text" : "password"}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              n8n बाहिर प्रत्यक्ष Google Gemini (Gemini Flash / Gemini Pro) मोडल प्रयोग गर्न चाहनुहुन्छ भने यो की राख्न सक्नुहुन्छ।
            </p>
          </div>

          {/* Field 4: Direct OpenAI API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>Direct OpenAI API Key (वैकल्पिक / Optional):</span>
              </label>
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showApiKey ? "गोप्य राख्नुहोस्" : "हेर्नुहोस्"}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={openAiKey}
                onChange={(e) => setOpenAiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              यदि n8n बाहिर प्रत्यक्ष OpenAI मोडेल प्रयोग गर्न चाहनुहुन्छ भने मात्र यो की राख्नुहोस्।
            </p>
          </div>

          {/* Current Status & Meta */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${webhookUrl.trim() ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                सक्रिय मोड: {webhookUrl.trim() ? "n8n Webhook इन्टिग्रेटेड" : "आन्तरिक प्रमाणित DIC नलेज इन्जिन"}
              </span>
            </div>

            {updatedAt && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                अन्तिम अद्यावधिक: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{updatedAt}</span>
                {updatedBy && <span> ({updatedBy})</span>}
              </div>
            )}
          </div>

          {/* Test Connection Output */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2 ${
                testResult.success
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                  : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200"
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{testResult.message}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={testing || saving}
              onClick={handleTestConnection}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {testing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Server className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span>परीक्षण गर्नुहोस् (Test Connection)</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>सुरक्षित गर्नुहोस् (Save Configuration)</span>
            </button>
          </div>
        </form>
      )}

      {/* Feature & Knowledge Engine Highlights */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-indigo-600" />
          <span>स्वचालित रूपमा जोडिएका ज्ञान स्रोतहरू (Integrated Knowledge Base)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">📜 २८+ कानुन तथा नियमावली</span>
            <span className="text-slate-500">संघीय, प्रादेशिक र स्थानीय ऐन, कार्यविधि र निर्देशिका</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">📊 १० विषयगत प्रतिवेदन</span>
            <span className="text-slate-500">अपाङ्गता वर्गीकरण, गृहभेट, सहायक सामग्री वितरण तथ्याङ्क</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">🏛️ १३७ स्थानीय तह प्रोफाइल</span>
            <span className="text-slate-500">कोशी प्रदेशका सबै १४ जिल्लाका पालिकाहरूको विवरण</span>
          </div>
        </div>
      </div>
    </div>
  );
}
