import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { 
  getAllLaws, 
  getLawById, 
  createLaw, 
  updateLaw, 
  deleteLaw, 
  resetLawsToDefault 
} from "@/lib/lawsStore";
import { LawCategory, GovLevel } from "@/lib/lawsData";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const gov_level = searchParams.get("level") || searchParams.get("gov_level") || undefined;
    const query = searchParams.get("q") || undefined;

    const laws = getAllLaws({ category, gov_level, query });

    return NextResponse.json({
      success: true,
      total: laws.length,
      laws
    });
  } catch (err: any) {
    console.error("GET /api/laws error:", err);
    return NextResponse.json(
      { error: "कानुनी दस्तावेजहरू लोड गर्न सकिएन।" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Reset action
    if (body.action === "reset") {
      const resetList = resetLawsToDefault(body.user);
      revalidatePath("/laws");
      return NextResponse.json({
        success: true,
        message: "कानुनी दस्तावेजहरू प्रारम्भिक अवस्थामा रिसेट गरियो।",
        laws: resetList
      });
    }

    const {
      title_ne,
      title_en,
      category,
      gov_level,
      province_id,
      province_name_ne,
      issuing_authority,
      publication_date_bs,
      effective_date_bs,
      is_amended,
      amendment_date_bs,
      description_ne,
      keywords,
      pdf_url,
      file_size,
      source,
      user
    } = body;

    if (!title_ne?.trim()) {
      return NextResponse.json(
        { error: "कृपया कानुन दस्तावेजको नाम (नेपाली) अनिवार्य लेख्नुहोस्।" },
        { status: 400 }
      );
    }

    if (!category || !["act", "rule", "procedure", "directive", "guideline", "circular"].includes(category)) {
      return NextResponse.json(
        { error: "कृपया कानुनको वर्ग (ऐन, नियमावली, कार्यविधि आदि) चयन गर्नुहोस्।" },
        { status: 400 }
      );
    }

    if (!gov_level || !["federal", "provincial"].includes(gov_level)) {
      return NextResponse.json(
        { error: "कृपया कानुनको तह (संघीय वा प्रदेश कानुन) चयन गर्नुहोस्।" },
        { status: 400 }
      );
    }

    // Map Category Nepali Label
    const categoryMap: Record<LawCategory, string> = {
      act: "ऐन",
      rule: "नियमावली",
      procedure: "कार्यविधि",
      directive: "निर्देशिका",
      guideline: "मार्गदर्शन",
      circular: "परिपत्र"
    };

    const newDoc = createLaw({
      title_ne: title_ne.trim(),
      title_en: title_en ? title_en.trim() : title_ne.trim(),
      category: category as LawCategory,
      category_name_ne: categoryMap[category as LawCategory] || "दस्तावेज",
      gov_level: gov_level as GovLevel,
      province_id: gov_level === "provincial" ? (province_id || "koshi") : undefined,
      province_name_ne: gov_level === "provincial" ? (province_name_ne || "कोशी प्रदेश") : undefined,
      issuing_authority: issuing_authority?.trim() || (gov_level === "federal" ? "नेपाल सरकार" : "कोशी प्रदेश सरकार"),
      publication_date_bs: publication_date_bs?.trim() || "२०८२/०५/२१",
      effective_date_bs: effective_date_bs?.trim() || publication_date_bs?.trim() || "२०८२/०५/२१",
      is_amended: Boolean(is_amended),
      amendment_date_bs: is_amended ? amendment_date_bs?.trim() : undefined,
      description_ne: description_ne?.trim() || "",
      keywords: Array.isArray(keywords) 
        ? keywords 
        : typeof keywords === "string" 
          ? keywords.split(",").map((s: string) => s.trim()).filter(Boolean) 
          : ["कानुन", "अपाङ्गता"],
      pdf_url: pdf_url?.trim() || "#",
      file_size: file_size?.trim() || "१.२ MB",
      source: source?.trim() || "राजपत्र / आधिकारिक अभिलेख"
    }, user);

    revalidatePath("/laws");

    return NextResponse.json({
      success: true,
      message: "नयाँ कानुन दस्तावेज सफलतापूर्वक थप गरियो।",
      law: newDoc
    }, { status: 201 });

  } catch (err: any) {
    console.error("POST /api/laws error:", err);
    return NextResponse.json(
      { error: "कानुन दस्तावेज सिर्जना गर्न समस्या आयो।" },
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
        { error: "सम्पादन गर्न कानुन दस्तावेजको ID अनिवार्य छ।" },
        { status: 400 }
      );
    }

    if (updates.keywords && typeof updates.keywords === "string") {
      updates.keywords = updates.keywords.split(",").map((s: string) => s.trim()).filter(Boolean);
    }

    const updated = updateLaw(id, updates, user);
    if (!updated) {
      return NextResponse.json(
        { error: "उक्त दस्तावेज फेला परेन।" },
        { status: 404 }
      );
    }

    revalidatePath("/laws");

    return NextResponse.json({
      success: true,
      message: "कानुन दस्तावेज सफलतापूर्वक सच्याइयो।",
      law: updated
    });
  } catch (err: any) {
    console.error("PUT /api/laws error:", err);
    return NextResponse.json(
      { error: "कानुन सम्पादन गर्न समस्या आयो।" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    let user: any = undefined;

    try {
      const body = await request.json();
      if (!id) id = body.id;
      user = body.user;
    } catch {
      // Query param used
    }

    if (!id) {
      return NextResponse.json(
        { error: "हटाउनका लागि कानुनको ID अनिवार्य छ।" },
        { status: 400 }
      );
    }

    const deleted = deleteLaw(id, user);
    if (!deleted) {
      return NextResponse.json(
        { error: "उक्त दस्तावेज फेला परेन।" },
        { status: 404 }
      );
    }

    revalidatePath("/laws");

    return NextResponse.json({
      success: true,
      message: "कानुन दस्तावेज सफलतापूर्वक हटाइयो।"
    });
  } catch (err: any) {
    console.error("DELETE /api/laws error:", err);
    return NextResponse.json(
      { error: "कानुन मेटाउन समस्या आयो।" },
      { status: 500 }
    );
  }
}
