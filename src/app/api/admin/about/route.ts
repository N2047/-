import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { 
  getAllAboutSections, 
  getAboutSectionById, 
  createAboutSection, 
  updateAboutSection, 
  softDeleteAboutSection, 
  restoreAboutSection, 
  permanentDeleteAboutSection, 
  reorderAboutSections, 
  resetAboutToDefault 
} from "@/lib/aboutStore";
import { getUserById } from "@/lib/authStore";

// Helper to verify admin role
function isAuthorizedAdmin(request: Request, bodyUser?: { id?: string; role?: string }): boolean {
  // Check authorization header or body passed user
  const authHeader = request.headers.get("x-admin-role");
  if (authHeader === "super_admin" || authHeader === "provincial_admin") return true;

  if (bodyUser?.role === "super_admin" || bodyUser?.role === "provincial_admin") return true;

  if (bodyUser?.id) {
    const user = getUserById(bodyUser.id);
    if (user && (user.role === "super_admin" || user.role === "provincial_admin")) {
      return true;
    }
  }

  // Allow admin-master-001 by default
  if (bodyUser?.id === "admin-master-001") return true;

  return false;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeTrash = searchParams.get("trash") === "true";
    const onlyPublished = searchParams.get("published") === "true";

    const sections = getAllAboutSections({
      includeDeleted: includeTrash,
      onlyPublished
    });

    return NextResponse.json({
      success: true,
      total: sections.length,
      sections
    });
  } catch (err: any) {
    console.error("GET /api/admin/about error:", err);
    return NextResponse.json(
      { error: "About Us सेक्सनहरू लोड गर्न सकिएन।" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user, action, ...data } = body;

    // Verify Admin Permission
    if (!isAuthorizedAdmin(request, user)) {
      return NextResponse.json(
        { error: "यो कार्य केवल अधिकृत Super Admin ले मात्र गर्न सक्दछन्।" },
        { status: 403 }
      );
    }

    // Reset action
    if (action === "reset") {
      const resetList = resetAboutToDefault(user);
      revalidatePath("/about");
      return NextResponse.json({
        success: true,
        message: "हाम्रो बारेमा सेक्सनहरू प्रारम्भिक अवस्थामा रिसेट गरियो।",
        sections: resetList
      });
    }

    // Reorder action
    if (action === "reorder" && Array.isArray(body.orderedIds)) {
      const reordered = reorderAboutSections(body.orderedIds, user);
      revalidatePath("/about");
      return NextResponse.json({
        success: true,
        message: "सेक्सनहरूको क्रम सफलतापूर्वक परिवर्तन गरियो।",
        sections: reordered
      });
    }

    // Restore action
    if (action === "restore" && body.id) {
      const success = restoreAboutSection(body.id, user);
      if (!success) {
        return NextResponse.json(
          { error: "पुनःस्थापना गर्न सेक्सन फेला परेन।" },
          { status: 404 }
        );
      }
      revalidatePath("/about");
      return NextResponse.json({
        success: true,
        message: "सेक्सन सफलतापूर्वक पुनःस्थापना गरियो।"
      });
    }

    // Create New Section
    if (!data.title_ne?.trim() || !data.title_en?.trim()) {
      return NextResponse.json(
        { error: "कृपया सेक्सनको शीर्षक नेपाली र अंग्रेजी दुवै भाषामा प्रविष्ट गर्नुहोस्।" },
        { status: 400 }
      );
    }

    const created = createAboutSection(data, user);
    revalidatePath("/about");

    return NextResponse.json({
      success: true,
      message: "नयाँ सेक्सन सफलतापूर्वक सिर्जना गरियो।",
      section: created
    }, { status: 201 });

  } catch (err: any) {
    console.error("POST /api/admin/about error:", err);
    return NextResponse.json(
      { error: "सेक्सन सिर्जना गर्न समस्या आयो।" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, user, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "सम्पादन गर्नका लागि सेक्सन ID अनिवार्य छ।" },
        { status: 400 }
      );
    }

    if (!isAuthorizedAdmin(request, user)) {
      return NextResponse.json(
        { error: "यो कार्य केवल अधिकृत Super Admin ले मात्र गर्न सक्दछन्।" },
        { status: 403 }
      );
    }

    const updated = updateAboutSection(id, updates, user);
    if (!updated) {
      return NextResponse.json(
        { error: "उक्त ID भएको सेक्सन फेला परेन।" },
        { status: 404 }
      );
    }

    revalidatePath("/about");

    return NextResponse.json({
      success: true,
      message: "सेक्सन विवरण सफलतापूर्वक अद्यावधिक गरियो।",
      section: updated
    });

  } catch (err: any) {
    console.error("PUT /api/admin/about error:", err);
    return NextResponse.json(
      { error: "सेक्सन सम्पादन गर्न समस्या आयो।" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    const isPermanent = searchParams.get("permanent") === "true";
    let bodyUser: any = undefined;

    try {
      const body = await request.json();
      if (!id) id = body.id;
      bodyUser = body.user;
    } catch {
      // URL params used
    }

    if (!id) {
      return NextResponse.json(
        { error: "हटाउनका लागि सेक्सन ID अनिवार्य छ।" },
        { status: 400 }
      );
    }

    if (!isAuthorizedAdmin(request, bodyUser)) {
      return NextResponse.json(
        { error: "यो कार्य केवल अधिकृत Super Admin ले मात्र गर्न सक्दछन्।" },
        { status: 403 }
      );
    }

    if (isPermanent) {
      const success = permanentDeleteAboutSection(id, bodyUser);
      if (!success) {
        return NextResponse.json({ error: "सेक्सन फेला परेन।" }, { status: 404 });
      }
      revalidatePath("/about");
      return NextResponse.json({
        success: true,
        message: "सेक्सन स्थायी रूपमा मेटाइयो (Permanently Deleted)।"
      });
    } else {
      const success = softDeleteAboutSection(id, bodyUser);
      if (!success) {
        return NextResponse.json({ error: "सेक्सन फेला परेन।" }, { status: 404 });
      }
      revalidatePath("/about");
      return NextResponse.json({
        success: true,
        message: "सेक्सन रद्दीटोकरी (Trash) मा सारियो।"
      });
    }

  } catch (err: any) {
    console.error("DELETE /api/admin/about error:", err);
    return NextResponse.json(
      { error: "सेक्सन मेटाउन समस्या आयो।" },
      { status: 500 }
    );
  }
}
