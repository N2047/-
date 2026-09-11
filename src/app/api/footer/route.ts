import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getFooterConfig, updateFooterConfig, resetFooterConfig } from "@/lib/footerStore";
import { getUserById } from "@/lib/authStore";

function isAuthorizedAdmin(request: Request, bodyUser?: { id?: string; role?: string }): boolean {
  const authHeader = request.headers.get("x-admin-role");
  if (authHeader === "super_admin" || authHeader === "provincial_admin") return true;

  if (bodyUser?.role === "super_admin" || bodyUser?.role === "provincial_admin") return true;

  if (bodyUser?.id) {
    const user = getUserById(bodyUser.id);
    if (user && (user.role === "super_admin" || user.role === "provincial_admin")) {
      return true;
    }
  }

  // Master admin ID fallback
  if (bodyUser?.id === "admin-master-001" || bodyUser?.id === "admin-001") return true;

  return false;
}

export async function GET() {
  try {
    const config = getFooterConfig();
    return NextResponse.json({
      success: true,
      config,
    });
  } catch (err: any) {
    console.error("GET /api/footer error:", err);
    return NextResponse.json(
      { error: "फुटर विवरण लोड गर्न सकिएन।" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user, action, config } = body;

    // Verify Admin Permission
    if (!isAuthorizedAdmin(request, user)) {
      return NextResponse.json(
        { error: "यो कार्य केवल अधिकृत Super Admin वा Provincial Admin ले मात्र गर्न सक्दछन्।" },
        { status: 403 }
      );
    }

    if (action === "reset") {
      const reset = resetFooterConfig(user);
      revalidatePath("/");
      return NextResponse.json({
        success: true,
        message: "फुटर विवरण सफलतापूर्वक पूर्वनिर्धारित अवस्थामा रिसेट गरियो।",
        config: reset,
      });
    }

    if (!config || typeof config !== "object") {
      return NextResponse.json(
        { error: "अवैध फुटर डाटा।" },
        { status: 400 }
      );
    }

    const updated = updateFooterConfig(config, user);
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "वेबसाइट फुटर (तलको भाग) सफलतापूर्वक सुरक्षित गरियो।",
      config: updated,
    });
  } catch (err: any) {
    console.error("POST /api/footer error:", err);
    return NextResponse.json(
      { error: "फुटर अपडेट गर्न सकिएन।" },
      { status: 500 }
    );
  }
}
