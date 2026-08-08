import nodemailer from 'nodemailer';

export async function sendEmailReply({ to, subject, replyText, originalName }) {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

  const emailSubject = subject ? `Re: ${subject}` : 'Response from AD Legal Counsel';

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0c2839; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
      <div style="background: #0c2839; padding: 18px 24px; border-radius: 12px; margin-bottom: 20px; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px; letter-spacing: 0.04em;">AD LEGAL COUNSEL</h2>
        <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.8; text-transform: uppercase;">Law, Finance & Corporate Advisory</p>
      </div>

      <p style="font-size: 15px;">Dear <strong>${originalName || 'Client'}</strong>,</p>

      <div style="background: #f8fafc; border-left: 4px solid #ffbd59; padding: 16px; margin: 18px 0; border-radius: 4px; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
${replyText}
      </div>

      <p style="font-size: 14px; color: #4a5568; line-height: 1.5;">
        If you have further questions, feel free to reply to this email or send us a message through our website.
      </p>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

      <div style="font-size: 12px; color: #718096; line-height: 1.4;">
        <strong>AD Legal</strong><br />
        428/4 Hoang Ngan St, Phu Dinh Ward, Ho Chi Minh City, Vietnam<br />
        Phone: +84 878 447 664 | Email: counsel@adlegal.vn
      </div>
    </div>
  `;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"AD Legal Counsel" <${smtpUser}>`,
        to,
        subject: emailSubject,
        text: replyText,
        html: htmlBody,
      });

      console.log(`Email successfully dispatched to ${to} (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`SMTP Dispatch Error to ${to}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  // Fallback logging when SMTP credentials are not yet configured in environment variables
  console.log(`[MAIL SIMULATION] Reply to ${to} (${emailSubject}):\n${replyText}`);
  return { success: true, simulated: true };
}
