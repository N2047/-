import { NextResponse } from "next/server";
import { 
  getAllNews, 
  createNews, 
  updateNews, 
  deleteNews, 
  resetNewsToDefault,
  NewsArticle 
} from "@/lib/newsStore";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const query = searchParams.get("q");

    let articles = getAllNews();

    if (category && category !== "all") {
      articles = articles.filter(a => a.category === category);
    }

    if (query) {
      const q = query.toLowerCase();
      articles = articles.filter(a => 
        a.title_ne.toLowerCase().includes(q) ||
        a.summary_ne.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      success: true,
      total: articles.length,
      articles
    });
  } catch (err: any) {
    console.error("GET /api/news error:", err);
    return NextResponse.json(
      { error: "समाचार तथा सूचनाहरू लोड गर्न सकिएन।" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Support reset if requested
    if (body.action === "reset") {
      const resetArticles = resetNewsToDefault();
      return NextResponse.json({
        success: true,
        message: "सूचना तथा समाचार सूची प्रारम्भिक अवस्थामा रिसेट गरियो।",
        articles: resetArticles
      });
    }

    const {
      title_ne,
      title_en,
      category,
      summary_ne,
      content_ne,
      published_date_bs,
      author,
      tags,
      image_url,
      video_url,
      attachment_name,
      attachment_size
    } = body;

    if (!title_ne || !category || !summary_ne || !content_ne) {
      return NextResponse.json(
        { error: "शीर्षक, वर्ग, संक्षिप्त विवरण र पूर्ण व्यहोरा अनिवार्य छन्।" },
        { status: 400 }
      );
    }

    const newArticle = createNews({
      title_ne: title_ne.trim(),
      title_en: title_en ? title_en.trim() : undefined,
      category: category,
      summary_ne: summary_ne.trim(),
      content_ne: content_ne.trim(),
      published_date_bs: published_date_bs ? published_date_bs.trim() : "२०८२/०५/२१",
      author: author ? author.trim() : "अपाङ्गता सूचना केन्द्र",
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map(s => s.trim()).filter(Boolean) : ["सूचना"],
      image_url: image_url ? image_url.trim() : undefined,
      video_url: video_url ? video_url.trim() : undefined,
      attachment_name: attachment_name ? attachment_name.trim() : undefined,
      attachment_size: attachment_size ? attachment_size.trim() : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "नयाँ सूचना / समाचार सफलतापूर्वक प्रकाशित भयो।",
      article: newArticle
    }, { status: 201 });

  } catch (err: any) {
    console.error("POST /api/news error:", err);
    return NextResponse.json(
      { error: "सूचना / समाचार सिर्जना गर्न समस्या आयो।" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "सच्याउनका लागि सूचनाको ID अनिवार्य छ।" },
        { status: 400 }
      );
    }

    if (updates.tags && typeof updates.tags === "string") {
      updates.tags = updates.tags.split(",").map((s: string) => s.trim()).filter(Boolean);
    }

    const updated = updateNews(id, updates);
    if (!updated) {
      return NextResponse.json(
        { error: "उक्त ID भएको सूचना फेला परेन।" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "सूचना / समाचार सफलतापूर्वक सच्याइयो (Updated)।",
      article: updated
    });

  } catch (err: any) {
    console.error("PUT /api/news error:", err);
    return NextResponse.json(
      { error: "सूचना / समाचार सच्याउन समस्या आयो।" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // query param was used
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "हटाउनका लागि सूचनाको ID अनिवार्य छ।" },
        { status: 400 }
      );
    }

    const deleted = deleteNews(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "उक्त सूचना फेला परेन वा पहिले नै हटाइएको छ।" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "सूचना / समाचार सफलतापूर्वक हटाइयो।"
    });

  } catch (err: any) {
    console.error("DELETE /api/news error:", err);
    return NextResponse.json(
      { error: "सूचना / समाचार मेटाउन समस्या आयो।" },
      { status: 500 }
    );
  }
}
