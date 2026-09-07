import { NextResponse } from "next/server";
import { getAiConfig, saveAiConfig } from "@/lib/aiConfigStore";
import { getUserById } from "@/lib/authStore";

// Helper to verify Super Admin role
function isAuthorizedAdmin(request: Request, bodyUser?: { id?: string; role?: string }): boolean {
  const roleHeader = request.headers.get("x-admin-role");
  if (roleHeader === "super_admin" || roleHeader === "provincial_admin") return true;

  const idHeader = request.headers.get("x-admin-id");
  if (idHeader) {
    const user = getUserById(idHeader);
    if (user && (user.role === "super_admin" || user.role === "provincial_admin")) {
      return true;
    }
  }

  if (bodyUser?.role === "super_admin" || bodyUser?.role === "provincial_admin") return true;

  if (bodyUser?.id) {
    const user = getUserById(bodyUser.id);
    if (user && (user.role === "super_admin" || user.role === "provincial_admin")) {
      return true;
    }
  }

  return false;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;
    const userRole = searchParams.get("role") || undefined;

    if (!isAuthorizedAdmin(request, { id: userId, role: userRole })) {
      return NextResponse.json(
        { error: "यो सेटिङ हेर्ने अधिकार केवल Super Admin लाई मात्र छ। (Access Denied)" },
        { status: 403 }
      );
    }

    const config = getAiConfig();

    return NextResponse.json({
      success: true,
      config: {
        n8n_webhook_url: config.n8n_webhook_url,
        n8n_test_webhook_url: config.n8n_test_webhook_url || "",
        openai_api_key: config.openai_api_key,
        gemini_api_key: config.gemini_api_key || "",
        updated_at: config.updated_at,
        updated_by: config.updated_by
      }
    });
  } catch (err: any) {
    console.error("GET /api/admin/ai-config error:", err);
    return NextResponse.json(
      { error: "AI सेटिङ्स लोड गर्न सकिएन।" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { n8n_webhook_url, n8n_test_webhook_url, openai_api_key, gemini_api_key, user } = body;

    if (!isAuthorizedAdmin(request, user)) {
      return NextResponse.json(
        { error: "यो सेटिङ सम्पादन गर्ने अधिकार केवल Super Admin लाई मात्र छ। (Access Denied)" },
        { status: 403 }
      );
    }

    const updated = saveAiConfig({
      n8n_webhook_url: typeof n8n_webhook_url === "string" ? n8n_webhook_url.trim() : "",
      n8n_test_webhook_url: typeof n8n_test_webhook_url === "string" ? n8n_test_webhook_url.trim() : "",
      openai_api_key: typeof openai_api_key === "string" ? openai_api_key.trim() : "",
      gemini_api_key: typeof gemini_api_key === "string" ? gemini_api_key.trim() : ""
    }, user);

    return NextResponse.json({
      success: true,
      message: "n8n Webhook, Gemini तथा OpenAI सेटिङ्स सफलतापूर्वक सुरक्षित गरियो।",
      config: updated
    });
  } catch (err: any) {
    console.error("POST /api/admin/ai-config error:", err);
    return NextResponse.json(
      { error: "AI सेटिङ्स सुरक्षित गर्न सकिएन।" },
      { status: 500 }
    );
  }
}
