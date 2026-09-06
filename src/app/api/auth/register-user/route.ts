import { NextResponse } from "next/server";
import { registerNormalUser } from "@/lib/authStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body.name || body.full_name;
    const { identifier, password, address } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "कृपया आफ्नो पूरा नाम प्रविष्टि गर्नुहोस्।" },
        { status: 400 }
      );
    }

    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return NextResponse.json(
        { error: "कृपया मान्य Email वा Mobile नम्बर प्रविष्टि गर्नुहोस्।" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।" },
        { status: 400 }
      );
    }

    const result = registerNormalUser({
      name: name.trim(),
      identifier: identifier.trim(),
      password,
      address: address?.trim()
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "खाता दर्ता गर्न सकिएन।" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "तपाईंको खाता सफलतापूर्वक सिर्जना भयो। अब तपाईं लगइन गर्न सक्नुहुन्छ।",
      user: result.user
    });

  } catch (err: any) {
    console.error("register-user error:", err);
    return NextResponse.json(
      { error: "दर्ता प्रक्रियामा प्राविधिक समस्या आयो।" },
      { status: 500 }
    );
  }
}
