import { NextResponse } from "next/server";
import { generateOtp } from "@/lib/authStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, purpose = "user_signup" } = body;

    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return NextResponse.json(
        { error: "कृपया मान्य Email वा Mobile नम्बर प्रविष्टि गर्नुहोस्।" },
        { status: 400 }
      );
    }

    const clean = identifier.trim();
    const isEmail = clean.includes("@");
    const isMobile = /^[0-9+\s-]{7,15}$/.test(clean);

    if (!isEmail && !isMobile) {
      return NextResponse.json(
        { error: "अमान्य ढाँचा! कृपया सही Email वा फोन नम्बर प्रविष्टि गर्नुहोस्।" },
        { status: 400 }
      );
    }

    const { code, expires_at } = generateOtp(clean, purpose);

    // Simulate SMS / Email Dispatch
    console.log(`[AUTH SERVICE OTP] Code: ${code} sent to ${clean}`);

    return NextResponse.json({
      success: true,
      message: isEmail 
        ? `${clean} मा ६-अंकको OTP कोड पठाइएको छ।` 
        : `${clean} नम्बरमा SMS मार्फत OTP कोड पठाइएको छ।`,
      identifier: clean,
      expires_at,
      // Provide preview code for immediate testing/demo accessibility
      preview_code: code
    });

  } catch (err: any) {
    console.error("send-otp error:", err);
    return NextResponse.json(
      { error: "OTP पठाउन सकिएन। कृपया पुन: प्रयास गर्नुहोस्।" },
      { status: 500 }
    );
  }
}
