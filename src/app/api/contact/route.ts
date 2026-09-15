import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabaseClient";
import { getServerProvinceContacts, findServerContactByRecipient } from "@/lib/serverContactsStore";
import { sendGrievanceNotificationEmail } from "@/lib/emailService";

export interface ContactSubmissionBody {
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  subject?: string;
  message?: string;
  description?: string;
  local_level?: string;
  local_government_id?: string;
  district?: string;
  district_id?: string;
  recipient_type?: "ministry" | "local_government";
  recipient_email?: string;
  is_anonymous?: boolean;
}

export async function POST(request: Request) {
  try {
    const body: ContactSubmissionBody = await request.json();

    const name = (body.name || body.full_name || "").trim();
    const email = (body.email || "").trim();
    const phone = (body.phone || "").trim();
    const address = (body.address || "").trim();
    const subject = (body.subject || "अपाङ्गता सम्बन्धी सोधपुछ तथा गुनासो").trim();
    const message = (body.message || body.description || "").trim();
    const localLevel = (body.local_level || body.local_government_id || "स्थानीय तह").trim();
    const isAnonymous = Boolean(body.is_anonymous);

    // 1. Basic validation
    if (!isAnonymous && !name) {
      return NextResponse.json(
        { error: "कृपया आफ्नो पूरा नाम प्रविष्ट गर्नुहोस्।" },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: "कृपया सन्देश वा गुनासोको विवरण लेख्नुहोस्।" },
        { status: 400 }
      );
    }

    // 2. Resolve Recipient & Automatic CC Emails
    // Primary recipient
    let officialRecipientEmail = body.recipient_email?.trim();
    let orgName = localLevel;

    if (!officialRecipientEmail && body.local_government_id) {
      const matched = findServerContactByRecipient("local_government", body.local_government_id, body.district_id);
      if (matched) {
        officialRecipientEmail = matched.official_email;
        orgName = matched.organization_name_ne;
      }
    }

    if (!officialRecipientEmail) {
      officialRecipientEmail = "info.dic@koshi.gov.np";
    }

    // Automatic CC: Ministry of Social Development & NFDN Koshi Province
    const provinceData = getServerProvinceContacts();
    const ministryEmail = provinceData.ministryEmail || "info.dic@koshi.gov.np";
    const nfdnEmail = provinceData.nfdnEmail || "koshi@nfdn.org.np";
    const ccEmails = [ministryEmail, nfdnEmail].filter(Boolean);

    // 3. Unique Complaint / Contact Tracking Number
    const year = new Date().getFullYear();
    const randomSeq = Math.floor(100000 + Math.random() * 900000);
    const complaintNumber = `DIC-${year}-${randomSeq}`;

    // 4. Save to Supabase Database
    let supabaseSaved = false;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
        const { error: dbError } = await supabase
          .from("complaints")
          .insert([
            {
              complaint_number: complaintNumber,
              complaint_type: isAnonymous ? "anonymous" : "identified",
              full_name: isAnonymous ? null : name,
              phone: isAnonymous ? null : phone,
              email: isAnonymous ? null : email,
              address: isAnonymous ? null : address,
              recipient_type: body.recipient_type || "local_government",
              local_government_id: body.local_government_id || null,
              district_id: body.district_id || null,
              organization_name: orgName,
              official_recipient_email: officialRecipientEmail,
              official_recipient_phone: "उपलब्ध छैन",
              subject: subject,
              description: message,
              status: "नयाँ",
              mandatory_cc_email: ccEmails.join(", "),
              email_status: "sent",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

        if (!dbError) {
          supabaseSaved = true;
        } else {
          console.warn("Supabase insert notice (fallback to memory/log):", dbError.message);
        }
      }
    } catch (dbErr: any) {
      console.warn("Supabase connection skipped, using standard response:", dbErr.message);
    }

    // 5. Send Email via Resend API (with automatic Dual CC)
    let emailSent = false;
    let emailProvider = "none";

    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL || "Koshi DIC <onboarding@resend.dev>";

    if (resendApiKey && resendApiKey.startsWith("re_")) {
      try {
        const resend = new Resend(resendApiKey);

        const emailHtml = `
          <!DOCTYPE html>
          <html lang="ne">
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
              .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
              .header { background: #1e3a8a; color: #ffffff; padding: 20px; text-align: center; }
              .header h2 { margin: 0; font-size: 18px; }
              .header p { margin: 4px 0 0 0; font-size: 12px; opacity: 0.9; }
              .cc-banner { background: #fef3c7; border-bottom: 1px solid #fde68a; padding: 12px 20px; font-size: 12px; color: #92400e; font-weight: 600; }
              .body { padding: 24px; }
              .row { margin-bottom: 10px; font-size: 13px; }
              .label { font-weight: 700; color: #64748b; }
              .value { color: #0f172a; font-weight: 600; }
              .message-box { background: #f1f5f9; padding: 16px; border-radius: 8px; margin-top: 14px; font-size: 13px; line-height: 1.6; white-space: pre-wrap; }
              .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <h2>कोशी प्रदेश सरकार — अपाङ्गता सूचना केन्द्र (DIC)</h2>
                <p>नयाँ सम्पर्क तथा गुनासो दर्ता — दर्ता नं: <strong>${complaintNumber}</strong></p>
              </div>
              <div class="cc-banner">
                🛡️ <strong>स्वचालित CC लिंकेज:</strong> यो सन्देश मुख्य प्रापकका साथै सामाजिक विकास मन्त्रालय र राष्ट्रिय अपाङ्ग महासंघ, कोशी प्रदेशमा समेत स्वतः प्रतिलिपि (CC) गरिएको छ।
              </div>
              <div class="body">
                <div class="row"><span class="label">प्रापक निकाय (TO):</span> <span class="value">${orgName} (${officialRecipientEmail})</span></div>
                <div class="row"><span class="label">स्वचालित CC:</span> <span class="value">${ccEmails.join(", ")}</span></div>
                <div class="row"><span class="label">विषय:</span> <span class="value">${subject}</span></div>
                <div class="row"><span class="label">प्रेषक / गुनासोकर्ता:</span> <span class="value">${isAnonymous ? "बेनामी (Anonymous)" : `${name} (${phone || "फोन छैन"}, ${email || "इमेल छैन"})`}</span></div>
                ${address ? `<div class="row"><span class="label">ठेगाना:</span> <span class="value">${address}</span></div>` : ""}
                <div class="message-box">
                  <strong>व्यहोरा:</strong><br />
                  ${message}
                </div>
              </div>
              <div class="footer">
                अपाङ्गता सूचना तथा तथ्यांक व्यवस्थापन केन्द्र (DIC), कोशी प्रदेश | https://koshi-dic.vercel.app
              </div>
            </div>
          </body>
          </html>
        `;

        await resend.emails.send({
          from: resendFromEmail,
          to: [officialRecipientEmail],
          cc: ccEmails,
          subject: `[DIC नयाँ सम्पर्क/गुनासो - ${complaintNumber}] ${subject} — ${orgName}`,
          html: emailHtml
        });

        emailSent = true;
        emailProvider = "resend";
      } catch (resendErr: any) {
        console.warn("Resend API dispatch failed, trying nodemailer fallback:", resendErr.message);
      }
    }

    // 6. Fallback to Nodemailer if Resend was not configured or failed
    if (!emailSent) {
      const emailResult = await sendGrievanceNotificationEmail({
        complaintNumber,
        complaintType: isAnonymous ? "anonymous" : "identified",
        subject,
        description: message,
        toEmail: officialRecipientEmail,
        toOrgName: orgName,
        ccEmails,
        complainantName: isAnonymous ? undefined : name,
        complainantPhone: isAnonymous ? undefined : phone,
        complainantAddress: isAnonymous ? undefined : address,
        complainantEmail: isAnonymous ? undefined : email
      });

      emailSent = emailResult.success;
      emailProvider = emailResult.simulated ? "simulated" : "nodemailer";
    }

    return NextResponse.json({
      success: true,
      message: "तपाईंको सम्पर्क तथा गुनासो विवरण सफलतापूर्वक दर्ता भयो।",
      complaint_number: complaintNumber,
      supabase_synced: supabaseSaved,
      email_provider: emailProvider,
      routing: {
        to: officialRecipientEmail,
        organization: orgName,
        cc: ccEmails,
        ministry_cc: ministryEmail,
        nfdn_cc: nfdnEmail
      }
    });

  } catch (error: any) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json(
      { error: "फारम सब्मिट गर्दा प्राविधिक समस्या आयो। कृपया पुन: प्रयास गर्नुहोस्।" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "Koshi DIC Contact & Grievance API",
    features: [
      "Supabase Database Persistence",
      "Resend API Email Delivery with Dual CC",
      "Automatic CC to Ministry (info.dic@koshi.gov.np) & NFDN (koshi@nfdn.org.np)",
      "Nodemailer fallback"
    ],
    timestamp: new Date().toISOString()
  });
}
