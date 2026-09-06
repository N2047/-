import { NextResponse } from "next/server";
import { getReportsMeta, saveReportMeta, addAuditLog } from "@/lib/authStore";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const palikaId = searchParams.get("palikaId");

    const meta = getReportsMeta();

    if (palikaId) {
      return NextResponse.json({
        success: true,
        palikaId,
        report: meta[palikaId] || { status: "draft", updated_at: new Date().toISOString() }
      });
    }

    return NextResponse.json({
      success: true,
      reports: meta
    });

  } catch (err: any) {
    console.error("GET /api/reports/manage error:", err);
    return NextResponse.json(
      { error: "प्रतिवेदन स्थिति लोड गर्न सकिएन।" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const palikaId = body.palikaId || body.palika_id;
    const action = body.action; // 'draft' | 'submit' | 'return_for_correction' | 'approve'
    const adminCorrectionNotes = body.adminCorrectionNotes || body.admin_notes || body.notes;
    const submittedBy = body.submittedBy || body.user_name || "कर्मचारी";
    const actorId = body.actorId || body.user_id || "usr-001";
    const actorName = body.actorName || body.user_name || "प्रशासक";
    const fiscalYear = body.fiscalYear || body.fiscal_year || "2082/083";

    if (!palikaId || !action) {
      return NextResponse.json(
        { error: "palikaId र action दुवै अनिवार्य छन्।" },
        { status: 400 }
      );
    }

    if (action === "draft") {
      saveReportMeta(palikaId, "draft", adminCorrectionNotes, submittedBy);
      const allMeta = getReportsMeta();
      const report = allMeta[palikaId] || {
        status: "draft",
        palika_id: palikaId,
        fiscal_year: fiscalYear,
        updated_at: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        status: "draft",
        report,
        message: "प्रतिवेदन मस्यौदा (Draft) मा सुरक्षित गरियो।"
      });
    }

    if (action === "submit") {
      saveReportMeta(palikaId, "submitted", undefined, submittedBy);
      addAuditLog(
        "REPORT_SUBMITTED",
        actorId,
        submittedBy,
        palikaId,
        palikaId,
        `वार्षिक प्रतिवेदन अन्तिम रूपमा Submit गरियो (स्थानीय तह: ${palikaId})`
      );
      const allMeta = getReportsMeta();
      const report = allMeta[palikaId] || {
        status: "submitted",
        palika_id: palikaId,
        fiscal_year: fiscalYear,
        updated_at: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        status: "submitted",
        report,
        message: "वार्षिक प्रतिवेदन सफलतापूर्वक Submit गरियो। अब सामान्य कर्मचारीले सम्पादन गर्न पाउने छैन।"
      });
    }

    if (action === "return_for_correction") {
      if (!adminCorrectionNotes || !adminCorrectionNotes.trim()) {
        return NextResponse.json(
          { error: "कृपया सच्याउनुपर्ने विवरण (Correction Note) खुलाउनुहोस्।" },
          { status: 400 }
        );
      }

      saveReportMeta(palikaId, "returned_for_correction", adminCorrectionNotes.trim(), submittedBy);
      addAuditLog(
        "REPORT_RETURNED_FOR_CORRECTION",
        actorId,
        actorName,
        palikaId,
        palikaId,
        `प्रतिवेदन सच्याउन फिर्ता पठाइयो। सुझाव: ${adminCorrectionNotes.trim()}`
      );
      const allMeta = getReportsMeta();
      const report = allMeta[palikaId] || {
        status: "returned_for_correction",
        admin_notes: adminCorrectionNotes.trim(),
        adminCorrectionNotes: adminCorrectionNotes.trim(),
        palika_id: palikaId,
        fiscal_year: fiscalYear,
        updated_at: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        status: "returned_for_correction",
        report,
        message: "प्रतिवेदन सच्याउनका लागि फिर्ता पठाइयो र सुझाव नोट सुरक्षित गरियो।",
        adminCorrectionNotes: adminCorrectionNotes.trim(),
        admin_notes: adminCorrectionNotes.trim()
      });
    }

    if (action === "approve") {
      saveReportMeta(palikaId, "approved", undefined, submittedBy);
      addAuditLog(
        "REPORT_APPROVED",
        actorId,
        actorName,
        palikaId,
        palikaId,
        `वार्षिक प्रतिवेदन स्वीकृत गरियो (स्थानीय तह: ${palikaId})`
      );
      const allMeta = getReportsMeta();
      const report = allMeta[palikaId] || {
        status: "approved",
        palika_id: palikaId,
        fiscal_year: fiscalYear,
        updated_at: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        status: "approved",
        report,
        message: "वार्षिक प्रतिवेदन स्वीकृत (Approved) गरियो।"
      });
    }

    return NextResponse.json({ error: "अमान्य कार्य।" }, { status: 400 });

  } catch (err: any) {
    console.error("POST /api/reports/manage error:", err);
    return NextResponse.json(
      { error: "प्रतिवेदन व्यवस्थापनमा समस्या आयो।" },
      { status: 500 }
    );
  }
}
