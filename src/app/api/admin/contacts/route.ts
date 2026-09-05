import { NextResponse } from "next/server";
import { 
  getServerContacts, 
  saveServerContacts, 
  upsertServerContact, 
  deleteServerContact,
  UpsertContactInput 
} from "@/lib/serverContactsStore";

export async function GET() {
  try {
    const contacts = getServerContacts();
    return NextResponse.json({
      success: true,
      total: contacts.length,
      contacts
    });
  } catch (error) {
    console.error("GET /api/admin/contacts error:", error);
    return NextResponse.json(
      { error: "सरकारी सम्पर्क विवरण लोड गर्न सकिएन।" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Check if bulk update
    if (body.contacts && Array.isArray(body.contacts)) {
      saveServerContacts(body.contacts);
      return NextResponse.json({
        success: true,
        message: `${body.contacts.length} वटा सम्पर्क विवरण सफलतापूर्वक सुरक्षित गरियो।`,
        total: body.contacts.length
      });
    }

    // 2. Single contact upsert
    const { 
      organization_type, 
      organization_name_ne, 
      organization_name_en,
      official_email, 
      official_phone, 
      office_address, 
      district_id, 
      local_government_id, 
      ministry_id 
    } = body;

    if (!organization_type || !["ministry", "local_government", "provincial_office"].includes(organization_type)) {
      return NextResponse.json(
        { error: "कृपया संस्थाको प्रकार (मन्त्रालय वा स्थानीय तह) खुलाउनुहोस्।" },
        { status: 400 }
      );
    }

    if (!organization_name_ne || !organization_name_ne.trim()) {
      return NextResponse.json(
        { error: "मन्त्रालय वा पालिकाको नाम अनिवार्य छ।" },
        { status: 400 }
      );
    }

    if (!official_email || !official_email.trim() || !official_email.includes("@")) {
      return NextResponse.json(
        { error: "कृपया मान्य आधिकारिक इमेल (उदा. official@gov.np) प्रविष्टि गर्नुहोस्।" },
        { status: 400 }
      );
    }

    const input: UpsertContactInput = {
      organization_type,
      organization_name_ne: organization_name_ne.trim(),
      organization_name_en: organization_name_en?.trim(),
      official_email: official_email.trim(),
      official_phone: official_phone?.trim(),
      office_address: office_address?.trim(),
      district_id,
      local_government_id,
      ministry_id
    };

    const result = upsertServerContact(input);

    return NextResponse.json({
      success: true,
      isNew: result.isNew,
      message: result.isNew 
        ? `नयाँ सम्पर्क '${result.contact.organization_name_ne}' सफलतापूर्वक थप र अटो-लिङ्क गरियो।`
        : `'${result.contact.organization_name_ne}' को सम्पर्क इमेल (${result.contact.official_email}) सफलतापूर्वक अद्यावधिक र अटो-लिङ्क गरियो।`,
      contact: result.contact
    });

  } catch (error) {
    console.error("POST /api/admin/contacts error:", error);
    return NextResponse.json(
      { error: "सम्पर्क विवरण सुरक्षित गर्न सकिएन।" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "हटाउनुपर्ने सम्पर्कको ID आवश्यक छ।" },
        { status: 400 }
      );
    }

    const ok = deleteServerContact(id);
    if (!ok) {
      return NextResponse.json(
        { error: "सम्पर्क फेला परेन वा हटाउन सकिएन।" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "सम्पर्क सफलतापूर्वक हटाइयो।"
    });
  } catch (error) {
    console.error("DELETE /api/admin/contacts error:", error);
    return NextResponse.json(
      { error: "सम्पर्क हटाउन सकिएन।" },
      { status: 500 }
    );
  }
}
