import { NextResponse } from "next/server";
import { getPublishedAboutSections } from "@/lib/aboutStore";

export async function GET() {
  try {
    const sections = getPublishedAboutSections();
    return NextResponse.json({
      success: true,
      total: sections.length,
      sections
    });
  } catch (err: any) {
    console.error("GET /api/about error:", err);
    return NextResponse.json(
      { error: "हाम्रो बारेमा सामग्री लोड गर्न सकिएन।" },
      { status: 500 }
    );
  }
}
