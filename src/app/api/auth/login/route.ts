import { NextResponse } from "next/server";
import { findUserByIdentifier, saveAllUsers, getAllUsers, addAuditLog } from "@/lib/authStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password, admin_only } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "कृपया User ID / Email / Mobile र Password प्रविष्टि गर्नुहोस्।" },
        { status: 400 }
      );
    }

    const user = findUserByIdentifier(identifier);

    if (!user) {
      if (admin_only) {
        return NextResponse.json(
          { error: "Email/User ID वा password गलत छ।" },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: "प्रयोगकर्ता फेला परेन। कृपया आफ्नो User ID, Email वा Mobile नम्बर पुनः जाँच गर्नुहोस्।" },
        { status: 404 }
      );
    }

    // Check Password
    if (user.password_hash !== password) {
      if (admin_only) {
        addAuditLog(
          "ADMIN_LOGIN_FAILED",
          user.id,
          user.name,
          user.id,
          user.name,
          "गलत पासवर्ड प्रविष्टि (Super Admin Login)"
        );
        return NextResponse.json(
          { error: "Email/User ID वा password गलत छ।" },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: "पासवर्ड मिलेन। कृपया पुनः प्रयास गर्नुहोस्।" },
        { status: 401 }
      );
    }

    // 1. Strict Server-Side Check: Blocked Users (Requirement 10 & 11)
    if (user.account_status === "blocked") {
      addAuditLog(
        "BLOCKED_LOGIN_ATTEMPT",
        user.id,
        user.name,
        user.id,
        user.name,
        `ब्लक गरिएको खाताबाट लगइन प्रयास रोकियो (${user.email || user.phone || user.user_id})`
      );
      return NextResponse.json(
        { 
          error: "तपाईंको account Super Admin द्वारा block गरिएको छ। कृपया system administrator सँग सम्पर्क गर्नुहोस्।",
          account_status: "blocked" 
        },
        { status: 403 }
      );
    }

    // 2. Strict Check: Admin Only Portal (Requirement 3 & 22)
    // Only Super Admin or Provincial Admin allowed
    if (admin_only) {
      if (user.role !== "super_admin" && user.role !== "provincial_admin") {
        addAuditLog(
          "ADMIN_LOGIN_UNAUTHORIZED",
          user.id,
          user.name,
          user.id,
          user.name,
          `गैर-सुपर प्रशासक (${user.role}) द्वारा Admin Login प्रयास निषेध गरियो`
        );
        return NextResponse.json(
          { error: "तपाईंलाई Admin Panel मा प्रवेश गर्ने अनुमति छैन।" },
          { status: 403 }
        );
      }
    }

    // 3. Strict Check: Pending Approval (Requirement 9 & 34)
    if (user.account_status === "pending") {
      return NextResponse.json(
        { 
          error: "तपाईंको account हाल Super Admin approval को प्रतीक्षामा छ।",
          account_status: "pending",
          userId: user.id,
          user_id: user.user_id,
          details: "तपाईंको कर्मचारी खाता दर्ता भएको छ तर Super Admin बाट स्वीकृत हुन बाँकी छ। थप जानकारीका लागि Admin सँग सम्पर्क गर्नुहोस्।" 
        },
        { status: 403 }
      );
    }

    // 4. Check Rejected Status
    if (user.account_status === "rejected") {
      return NextResponse.json(
        { 
          error: "तपाईंको कर्मचारी खाता प्रशासकद्वारा अस्वीकृत गरिएको छ।",
          account_status: "rejected" 
        },
        { status: 403 }
      );
    }

    // 5. Check Suspended Status
    if (user.account_status === "suspended") {
      return NextResponse.json(
        { 
          error: "तपाईंको खाता हाल निलम्बन (Suspended) अवस्थामा छ।",
          account_status: "suspended" 
        },
        { status: 403 }
      );
    }

    // Update last login
    user.last_login_at = new Date().toISOString();
    const all = getAllUsers();
    const idx = all.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      all[idx] = user;
      saveAllUsers(all);
    }

    if (admin_only || user.role === "super_admin" || user.role === "provincial_admin") {
      addAuditLog(
        "ADMIN_LOGIN_SUCCESS",
        user.id,
        user.name,
        user.id,
        user.name,
        "Super Admin सफलतापूर्वक Admin Portal मा लगइन हुनुभयो।"
      );
    }

    const { password_hash, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      message: `स्वागत छ, ${safeUser.name}!`,
      user: safeUser
    });

  } catch (err: any) {
    console.error("login error:", err);
    return NextResponse.json(
      { error: "लगइन प्रक्रियामा प्राविधिक त्रुटि आयो।" },
      { status: 500 }
    );
  }
}
