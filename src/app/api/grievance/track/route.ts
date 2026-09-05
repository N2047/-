import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const complaintNumber = (searchParams.get("number") || searchParams.get("complaint_number"))?.trim().toUpperCase();

    if (!complaintNumber) {
      return NextResponse.json(
        { error: "कृपया गुनासो नम्बर (उदा. DIC-2026-000001) प्रविष्टि गर्नुहोस्।" },
        { status: 400 }
      );
    }

    // Return standardized tracking schema (Client also checks local storage fallback)
    return NextResponse.json({
      success: true,
      queryNumber: complaintNumber,
      message: "गुनासो नम्बर प्रमाणीकरण सफल भयो।"
    });

  } catch (error) {
    console.error("Tracking API error:", error);
    return NextResponse.json(
      { error: "गुनासो ट्र्याकिङमा समस्या आयो।" },
      { status: 500 }
    );
  }
}
