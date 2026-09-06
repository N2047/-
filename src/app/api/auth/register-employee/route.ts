import { NextResponse } from "next/server";
import { registerEmployee } from "@/lib/authStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body.name || body.full_name;
    const { 
      address, 
      district_id, 
      local_government_id, 
      email, 
      phone, 
      password 
    } = body;

    // 1. Mandatory Validations
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "कृपया पूरा नाम लेख्नुहोस्।" }, { status: 400 });
    }
    if (!address || !address.trim()) {
      return NextResponse.json({ error: "कृपया ठेगाना लेख्नुहोस्।" }, { status: 400 });
    }
    if (!district_id) {
      return NextResponse.json({ error: "कृपया जिल्ला चयन गर्नुहोस्।" }, { status: 400 });
    }
    if (!local_government_id) {
      return NextResponse.json({ error: "कृपया स्थानीय तह चयन गर्नुहोस्।" }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: "कृपया मोबाइल नम्बर लेख्नुहोस्।" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।" }, { status: 400 });
    }

    // 2. Register Employee as PENDING
    const result = registerEmployee({
      name: name.trim(),
      address: address.trim(),
      district_id,
      local_government_id,
      email: email?.trim() || undefined,
      phone: phone.trim(),
      password
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || "कर्मचारी खाता दर्ता गर्न सकिएन।" },
        { status: 400 }
      );
    }

    // 3. Dispatch Automatic Notification Email
    const recipientEmail = result.user.email;
    const adminPhones = "+9779842661754 / +9779827384434";

    const emailSubject = `कर्मचारी खाता दर्ता सम्पन्न — Admin Approval आवश्यक [${result.user.user_id}]`;
    const emailBody = `
अपाङ्गता सूचना केन्द्र (DIC), कोशी प्रदेश

नमस्कार ${result.user.name} ज्यू,

तपाईंको कर्मचारी खाता सफलतापूर्वक दर्ता भएको छ। तर तपाईं थप अघि बढ्नका लागि Admin बाट खाता स्वीकृत हुन आवश्यक छ। 

कृपया थप प्रक्रियाका लागि ${adminPhones} मा Admin लाई सम्पर्क गर्नुहोस्। Admin ले तपाईंको खाता Approve गरेपछि मात्र तपाईं प्रणालीमा पूर्ण रूपमा प्रवेश गरी स्थानीय तह वार्षिक प्रतिवेदन सम्पादन गर्न सक्नुहुनेछ।

कर्मचारी विवरण:
आईडी: ${result.user.user_id}
स्थानीय तह: ${result.user.local_government_name || result.user.palika_name}
जिल्ला: ${result.user.district_name}
मोबाइल: ${result.user.phone}
स्थिति: Pending Approval

धन्यवाद,
अपाङ्गता सूचना केन्द्र (DIC)
    `.trim();

    console.log(`[DIC EMAIL DISPATCH TO EMPLOYEE]`);
    console.log(`To: ${recipientEmail || result.user.phone}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(emailBody);

    return NextResponse.json({
      success: true,
      message: "तपाईंको कर्मचारी खाता सफलतापूर्वक दर्ता भएको छ। Admin बाट स्वीकृति (Approval) भएपछि तपाईंले सेवाहरू प्रयोग गर्न सक्नुहुनेछ।",
      user: result.user,
      pendingNotice: `तपाईंको खाता हाल Pending Approval अवस्थामा छ। थप जानकारीका लागि Admin लाई ${adminPhones} मा सम्पर्क गर्नुहोस्।`
    });

  } catch (err: any) {
    console.error("register-employee error:", err);
    return NextResponse.json(
      { error: "कर्मचारी दर्तामा प्राविधिक समस्या आयो।" },
      { status: 500 }
    );
  }
}
