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
