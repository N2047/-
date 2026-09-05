import { NextResponse } from "next/server";
import { getAllKnowledgeItems, searchKnowledgeBase, KnowledgeCategory } from "@/lib/aiKnowledgeBase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") as KnowledgeCategory | null;
    const limit = parseInt(searchParams.get("limit") || "15", 10);

    let items = query ? searchKnowledgeBase(query, limit) : getAllKnowledgeItems();

    if (category) {
      items = items.filter(item => item.category === category);
    }

    const totalCount = items.length;
    const sliced = items.slice(0, limit);

    return NextResponse.json({
      success: true,
      total: totalCount,
      count: sliced.length,
      query: query || null,
      category: category || null,
      data: sliced
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  } catch (error) {
    console.error("AI Knowledge API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve knowledge items" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}
