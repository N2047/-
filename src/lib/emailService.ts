import nodemailer from "nodemailer";

interface SendOtpEmailParams {
  to: string;
  code: string;
  recipientName?: string;
  purpose?: string;
}

/**
 * Creates nodemailer transporter using Gmail SMTP or custom SMTP settings
 */
function getTransporter() {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  // Check generic SMTP host
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  return null;
}

/**
 * Sends OTP Email to user's Gmail / Email address
 */
export async function sendOtpEmail({
  to,
  code,
  recipientName = "आदरणीय सेवाग्राही",
  purpose = "कर्मचारी दर्ता तथा प्रमाणीकरण",
}: SendOtpEmailParams): Promise<{ success: boolean; error?: string; simulated?: boolean }> {
  const cleanEmail = to.trim();

  const subject = `[DIC] तपाईंको OTP प्रमाणीकरण कोड: ${code} — अपाङ्गता सूचना केन्द्र`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ne">
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #b91c1c, #1e3a8a); color: white; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
        .header p { margin: 4px 0 0 0; font-size: 12px; opacity: 0.9; }
        .body { padding: 32px 24px; text-align: center; }
        .greeting { font-size: 15px; font-weight: 600; text-align: left; margin-bottom: 16px; color: #0f172a; }
        .instructions { font-size: 13px; color: #475569; text-align: left; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { background: #f1f5f9; border: 2px dashed #2563eb; border-radius: 12px; padding: 18px 24px; display: inline-block; margin: 12px 0 24px 0; }
        .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #dc2626; font-family: 'Courier New', Courier, monospace; }
        .expiry { font-size: 12px; color: #dc2626; font-weight: 700; margin-top: 6px; }
        .warning { background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 12px; font-size: 12px; color: #991b1b; text-align: left; margin-top: 16px; }
        .footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>नेपाल सरकार / कोशी प्रदेश सरकार</h1>
          <p>सामाजिक विकास मन्त्रालय — अपाङ्गता सूचना केन्द्र (DIC)</p>
        </div>
        <div class="body">
          <div class="greeting">नमस्कार ${recipientName} ज्यू,</div>
          <div class="instructions">
            अपाङ्गता सूचना केन्द्र (DIC) प्रणालीमा <strong>${purpose}</strong> का लागि तपाईंको एक पटक प्रयोग हुने सुरक्षा कोड (OTP) निम्नानुसार छ:
          </div>
          
          <div class="otp-box">
            <div class="otp-code">${code}</div>
            <div class="expiry">⏱️ यो कोड १० मिनेटका लागि मात्र मान्य हुनेछ।</div>
          </div>

          <div class="warning">
            ⚠️ <strong>सुरक्षा सतर्कता:</strong> यो OTP कोड अत्यन्त गोप्य राख्नुहोस् र कसैसँग सेयर नगर्नुहोस्। यदि तपाईंले यो अनुरोध गर्नुभएको होइन भने कृपया तुरुन्तै यसलाई बेवास्ता गर्नुहोस्।
          </div>
        </div>
        <div class="footer">
          © २०८२/०८३ अपाङ्गता सूचना केन्द्र (DIC), कोशी प्रदेश | सम्पर्क: +977-9842661754 | https://kosi-dic.vercel.app
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[EMAIL DISPATCH SIMULATION] No SMTP configured. Real OTP for ${cleanEmail}: ${code}`);
    return {
      success: true,
      simulated: true,
      error: "SMTP credentials (GMAIL_USER, GMAIL_APP_PASSWORD) not configured in .env.local"
    };
  }

  try {
    const sender = process.env.GMAIL_USER || process.env.SMTP_USER || "noreply.dic.koshi@gmail.com";
    const info = await transporter.sendMail({
      from: `"अपाङ्गता सूचना केन्द्र (DIC)" <${sender}>`,
      to: cleanEmail,
      subject,
      html: htmlContent,
      text: `अपाङ्गता सूचना केन्द्र (DIC) - तपाईंको OTP कोड: ${code} हो। यो कोड १० मिनेटका लागि मान्य छ।`,
    });

    console.log(`[EMAIL DISPATCH SUCCESS] Real OTP ${code} sent to ${cleanEmail}. MessageId: ${info.messageId}`);
    return { success: true, simulated: false };
  } catch (err: any) {
    console.error(`[EMAIL DISPATCH FAILED] Error sending to ${cleanEmail}:`, err.message);
    return { success: false, error: err.message, simulated: true };
  }
}

export interface SendGrievanceEmailParams {
  complaintNumber: string;
  complaintType: "identified" | "anonymous";
  subject: string;
  description: string;
  toEmail: string;
  toOrgName: string;
  ccEmails: string[];
  ministryName?: string;
  nfdnName?: string;
  complainantName?: string;
  complainantPhone?: string;
  complainantAddress?: string;
  complainantEmail?: string;
  attachmentsCount?: number;
}

/**
 * Sends official Grievance Notification Email to Primary Recipient (Palika / Ministry)
 * with mandatory CC to Ministry of Social Development and NFDN Koshi Province.
 */
export async function sendGrievanceNotificationEmail({
  complaintNumber,
  complaintType,
  subject,
  description,
  toEmail,
  toOrgName,
  ccEmails,
  ministryName = "सामाजिक विकास मन्त्रालय, कोशी प्रदेश",
  nfdnName = "राष्ट्रिय अपाङ्ग महासंघ नेपाल, कोशी प्रदेश",
  complainantName,
  complainantPhone,
  complainantAddress,
  complainantEmail,
  attachmentsCount = 0,
}: SendGrievanceEmailParams): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const cleanTo = toEmail.trim();
  const cleanCc = Array.from(new Set(ccEmails.map((e) => e.trim()).filter(Boolean)));

  const emailSubject = `[DIC नयाँ गुनासो दर्ता - ${complaintNumber}] ${subject} — ${toOrgName}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ne">
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #0f172a; }
        .container { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #cbd5e1; }
        .header { background: linear-gradient(135deg, #1e3a8a, #0f172a); color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 19px; font-weight: 800; letter-spacing: 0.5px; }
        .header p { margin: 6px 0 0 0; font-size: 13px; color: #93c5fd; }
        .badge-bar { background: #e0e7ff; padding: 12px 24px; border-bottom: 1px solid #c7d2fe; display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #1e3a8a; }
        .content { padding: 28px 24px; }
        .cc-notice { background: #fef3c7; border: 1px solid #fde68a; border-radius: 12px; padding: 14px 18px; margin-bottom: 22px; font-size: 12px; color: #92400e; line-height: 1.6; }
        .routing-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 13px; }
        .routing-row { margin-bottom: 8px; display: flex; gap: 8px; }
        .routing-label { font-weight: 700; color: #475569; min-width: 140px; }
        .routing-value { color: #0f172a; font-weight: 600; word-break: break-all; }
        .desc-box { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; margin-top: 14px; font-size: 13px; line-height: 1.7; color: #1e293b; white-space: pre-wrap; }
        .footer { background: #f8fafc; padding: 18px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>नेपाल सरकार / कोशी प्रदेश सरकार</h1>
          <p>अपाङ्गता सूचना तथा तथ्यांक व्यवस्थापन केन्द्र (DIC) — एकीकृत अनलाइन गुनासो व्यवस्थापन प्रणाली</p>
        </div>

        <div class="badge-bar">
          <span>गुनासो दर्ता नम्बर: <strong>${complaintNumber}</strong></span>
          <span>प्रकार: <strong>${complaintType === "identified" ? "पहिचानसहित" : "बेनामी (गोप्य)"}</strong></span>
        </div>

        <div class="content">
          <!-- Mandatory CC Notice -->
          <div class="cc-notice">
            <strong>🛡️ स्वचालित प्रतिलिपि (Automatic CC) लिंकेज:</strong><br />
            यो गुनासो मुख्य प्रापक निकायका साथै कोशी प्रदेश <strong>${ministryName}</strong> र <strong>${nfdnName}</strong> को आधिकारिक इमेलमा अनुगमन, समन्वय तथा सहजीकरणका लागि स्वतः <strong>CC</strong> गरिएको छ।
          </div>

          <!-- Routing Details -->
          <div class="routing-box">
            <div class="routing-row">
              <span class="routing-label">मुख्य प्रापक (TO):</span>
              <span class="routing-value">${toOrgName} (${cleanTo})</span>
            </div>
            <div class="routing-row">
              <span class="routing-label">स्वचालित CC (मन्त्रालय):</span>
              <span class="routing-value">${ministryName} (${cleanCc[0] || "info.dic@koshi.gov.np"})</span>
            </div>
            <div class="routing-row">
              <span class="routing-label">स्वचालित CC (महासंघ):</span>
              <span class="routing-value">${nfdnName} (${cleanCc[1] || "koshi@nfdn.org.np"})</span>
            </div>
            <div class="routing-row">
              <span class="routing-label">गुनासोको विषय:</span>
              <span class="routing-value" style="color: #b91c1c; font-size: 14px;">${subject}</span>
            </div>
            <div class="routing-row">
              <span class="routing-label">संलग्न फाइल संख्या:</span>
              <span class="routing-value">${attachmentsCount} वटा</span>
            </div>
          </div>

          <!-- Complainant Details -->
          <div class="routing-box" style="background: #f0fdf4; border-color: #bbf7d0;">
            <div style="font-weight: 700; color: #166534; margin-bottom: 8px; font-size: 13px;">
              👤 गुनासोकर्ताको विवरण:
            </div>
            ${
              complaintType === "identified"
                ? `
              <div class="routing-row"><span class="routing-label">पूरा नाम:</span><span class="routing-value">${complainantName || "उल्लेख नभएको"}</span></div>
              <div class="routing-row"><span class="routing-label">सम्पर्क फोन:</span><span class="routing-value">${complainantPhone || "उल्लेख नभएको"}</span></div>
              <div class="routing-row"><span class="routing-label">ठेगाना:</span><span class="routing-value">${complainantAddress || "उल्लेख नभएको"}</span></div>
              <div class="routing-row"><span class="routing-label">इमेल:</span><span class="routing-value">${complainantEmail || "उपलब्ध छैन"}</span></div>
            `
                : `
              <div style="color: #166534; font-size: 12px;">यो एक बेनामी (Anonymous) गुनासो हो। सेवाग्राहीको गोपनीयता सुरक्षित राखिएको छ।</div>
            `
            }
          </div>

          <!-- Detailed Grievance Description -->
          <div style="margin-top: 18px;">
            <div style="font-weight: 700; color: #334155; font-size: 13px;">📝 गुनासोको विस्तृत विवरण:</div>
            <div class="desc-box">${description}</div>
          </div>

          <div style="margin-top: 20px; font-size: 12px; color: #475569; line-height: 1.6;">
            💡 <strong>सम्बन्धित स्थानीय तह / निकायलाई अनुरोध:</strong> कृपया यस गुनासो उपर कानुन बमोजिम आवश्यक छानबिन तथा कारबाही गरी सेवाग्राहीलाई समयमै सेवा उपलब्ध गराउनुहोला। सामाजिक विकास मन्त्रालय तथा महासंघले यसको अनुगमन गर्नेछन्।
          </div>
        </div>

        <div class="footer">
          अपाङ्गता सूचना तथा तथ्यांक व्यवस्थापन केन्द्र (DIC), कोशी प्रदेश | https://kosi-dic.vercel.app<br />
          सामाजिक विकास मन्त्रालय, विराटनगर-१०, मोरङ | राष्ट्रिय अपाङ्ग महासंघ नेपाल, कोशी प्रदेश
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[GRIEVANCE EMAIL DISPATCH SIMULATED - NO SMTP KEY]`);
    console.log(`Complaint No: ${complaintNumber}`);
    console.log(`TO: ${cleanTo} (${toOrgName})`);
    console.log(`CC: ${cleanCc.join(", ")}`);
    console.log(`Subject: ${emailSubject}`);
    return {
      success: true,
      simulated: true,
      error: "SMTP credentials not configured in environment. Recorded in log.",
    };
  }

  try {
    const sender = process.env.GMAIL_USER || process.env.SMTP_USER || "noreply.dic.koshi@gmail.com";
    const info = await transporter.sendMail({
      from: `"अपाङ्गता सूचना केन्द्र (DIC)" <${sender}>`,
      to: cleanTo,
      cc: cleanCc,
      subject: emailSubject,
      html: htmlContent,
      text: `नयाँ गुनासो दर्ता: [${complaintNumber}] - विषय: ${subject}\n\nप्रापक: ${toOrgName} (${cleanTo})\nCC: ${cleanCc.join(", ")}\n\nविवरण:\n${description}`,
    });

    console.log(`[GRIEVANCE EMAIL DISPATCH SUCCESS] Real email sent for ${complaintNumber}. MessageId: ${info.messageId}`);
    return { success: true, simulated: false };
  } catch (err: any) {
    console.error(`[GRIEVANCE EMAIL DISPATCH ERROR] Failed to send email for ${complaintNumber}:`, err.message);
    return { success: false, error: err.message, simulated: true };
  }
}

