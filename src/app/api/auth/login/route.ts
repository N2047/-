import { NextResponse } from "next/server";
import { findUserByIdentifier, saveAllUsers, getAllUsers } from "@/lib/authStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "कृपया User ID / Email / Mobile र Password प्रविष्टि गर्नुहोस्।" },
        { status: 400 }
      );
    }

    const user = findUserByIdentifier(identifier);

    if (!user) {
      return NextResponse.json(
        { error: "प्रयोगकर्ता फेला परेन। कृपया आफ्नो User ID, Email वा Mobile नम्बर पुनः जाँच गर्नुहोस्।" },
        { status: 404 }
      );
    }

    // Check Password
    if (user.password_hash !== password) {
      return NextResponse.json(
        { error: "पासवर्ड मिलेन। कृपया पुनः प्रयास गर्नुहोस्।" },
        { status: 401 }
      );
    }

    // 1. Check Pending Status for Employees (Requirement 20)
    if (user.role === "employee" && user.account_status === "pending") {
      return NextResponse.json(
        { 
          error: "तपाईंको कर्मचारी खाता हाल Pending Approval अवस्थामा छ।",
          account_status: "pending",
          details: "तपाईंको कर्मचारी खाता दर्ता भएको छ तर Admin बाट स्वीकृत हुन बाँकी छ। थप प्रक्रियाका लागि Admin लाई +9779842661754 वा +9779827384434 मा सम्पर्क गर्नुहोस्।" 
        },
        { status: 403 }
      );
    }

    // 2. Check Rejected Status
    if (user.account_status === "rejected") {
      return NextResponse.json(
        { 
          error: "तपाईंको कर्मचारी खाता प्रशासकद्वारा अस्वीकृत गरिएको छ।",
          account_status: "rejected" 
        },
        { status: 403 }
      );
    }

    // 3. Check Suspended Status
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
