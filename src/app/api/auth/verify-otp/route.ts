import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/authStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = body.identifier;
    const code = body.code || body.otp;
    const purpose = body.purpose || "user_signup";

    if (!identifier || !code) {
      return NextResponse.json(
        { error: "Identifier र OTP कोड दुवै अनिवार्य छन्।" },
        { status: 400 }
      );
    }

    const result = verifyOtp(identifier, code, purpose);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "OTP मिलेन।" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: "OTP प्रमाणीकरण सफल भयो।"
    });

  } catch (err: any) {
    console.error("verify-otp error:", err);
    return NextResponse.json(
      { error: "OTP प्रमाणीकरणमा समस्या आयो।" },
      { status: 500 }
    );
  }
}
