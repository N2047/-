import { NextResponse } from "next/server";
import { generateOtp } from "@/lib/authStore";
import { sendOtpEmail } from "@/lib/emailService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, purpose = "user_signup", name } = body;

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

    let emailSent = false;
    let emailNotice = "";

    if (isEmail) {
      const emailResult = await sendOtpEmail({
        to: clean,
        code,
        recipientName: name || "कर्मचारी / सेवाग्राही",
        purpose: purpose === "employee_signup" ? "कर्मचारी खाता दर्ता तथा प्रमाणीकरण" : "नागरिक खाता दर्ता तथा प्रमाणीकरण"
      });

      emailSent = emailResult.success && !emailResult.simulated;
      if (emailResult.simulated) {
        emailNotice = "(परीक्षण मोड: SMTP कन्फिगर नभएकोले स्क्रिनमा कोड उपलब्ध गराइएको छ)";
      }
    }

    console.log(`[AUTH SERVICE OTP] Code: ${code} generated for ${clean} (Email sent: ${emailSent})`);

    return NextResponse.json({
      success: true,
      message: isEmail 
        ? `${clean} मा ६-अंकको OTP कोड पठाइएको छ। ${emailNotice}`.trim()
        : `${clean} नम्बरमा SMS मार्फत OTP कोड पठाइएको छ।`,
      identifier: clean,
      expires_at,
      email_sent: emailSent,
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
