const express = require('express');
const { Resend } = require('resend');
const router = express.Router();
const EMAIL_TEMPLATE_VERSION = 'modern-table-v3';

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeText(value = '', max = 3000) {
  return String(value).trim().slice(0, max);
}

function formatReceivedTime(date = new Date()) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: 'Asia/Kolkata'
  }).format(date);
}

function buildAdminEmail({ name, email, company, inquiryType, source, message, receivedAt }) {
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
  const safeCompany = escapeHtml(company || 'Not provided');
  const preview = escapeHtml(message.slice(0, 120));

  return `
    <!doctype html>
    <html>
      <body style="margin:0;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
        <span style="display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${preview}</span>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6fb;padding:34px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:760px;background:#ffffff;border:1px solid #dbe4f0;border-radius:20px;overflow:hidden;box-shadow:0 22px 58px rgba(15,23,42,0.12);">
                <tr>
                  <td style="background:#0f1720;padding:30px 34px;color:#ffffff;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;">
                          <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#c9ff3d;font-weight:800;">Ashraful Alom Portfolio</p>
                          <h1 style="margin:0;font-size:28px;line-height:1.22;font-weight:800;">New contact form submission</h1>
                          <p style="margin:10px 0 0;color:#aab7c8;font-size:14px;line-height:1.6;">Modern row and column summary of the visitor inquiry.</p>
                        </td>
                        <td align="right" style="vertical-align:top;width:130px;">
                          <span style="display:inline-block;background:#c9ff3d;color:#101821;border-radius:999px;padding:9px 14px;font-size:12px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;">New</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px 34px 34px;background:#ffffff;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #dbe4f0;border-radius:16px;overflow:hidden;border-collapse:separate;border-spacing:0;">
                      <tr>
                        <td colspan="2" style="background:#f8fafc;padding:16px 20px;border-bottom:1px solid #e7edf5;">
                          <p style="margin:0;color:#111827;font-size:16px;font-weight:800;">Inquiry details</p>
                        </td>
                      </tr>
                      <tr>
                        <td width="32%" style="padding:15px 20px;background:#fbfdff;border-bottom:1px solid #e7edf5;color:#667085;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;">Name</td>
                        <td style="padding:15px 20px;border-bottom:1px solid #e7edf5;color:#111827;font-size:15px;font-weight:700;">${escapeHtml(name)}</td>
                      </tr>
                      <tr>
                        <td width="32%" style="padding:15px 20px;background:#fbfdff;border-bottom:1px solid #e7edf5;color:#667085;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;">Email</td>
                        <td style="padding:15px 20px;border-bottom:1px solid #e7edf5;color:#111827;font-size:15px;font-weight:700;"><a href="mailto:${escapeHtml(email)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(email)}</a></td>
                      </tr>
                      <tr>
                        <td width="32%" style="padding:15px 20px;background:#fbfdff;border-bottom:1px solid #e7edf5;color:#667085;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;">Company</td>
                        <td style="padding:15px 20px;border-bottom:1px solid #e7edf5;color:#111827;font-size:15px;font-weight:700;">${safeCompany}</td>
                      </tr>
                      <tr>
                        <td width="32%" style="padding:15px 20px;background:#fbfdff;border-bottom:1px solid #e7edf5;color:#667085;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;">Inquiry Type</td>
                        <td style="padding:15px 20px;border-bottom:1px solid #e7edf5;color:#111827;font-size:15px;font-weight:700;">${escapeHtml(inquiryType)}</td>
                      </tr>
                      <tr>
                        <td width="32%" style="padding:15px 20px;background:#fbfdff;border-bottom:1px solid #e7edf5;color:#667085;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;">Source</td>
                        <td style="padding:15px 20px;border-bottom:1px solid #e7edf5;color:#111827;font-size:15px;font-weight:700;">${escapeHtml(source)}</td>
                      </tr>
                      <tr>
                        <td width="32%" style="padding:15px 20px;background:#fbfdff;border-bottom:1px solid #e7edf5;color:#667085;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;">Received</td>
                        <td style="padding:15px 20px;border-bottom:1px solid #e7edf5;color:#111827;font-size:15px;font-weight:700;">${escapeHtml(receivedAt)}</td>
                      </tr>
                      <tr>
                        <td width="32%" style="padding:18px 20px;background:#fbfdff;color:#667085;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;">Message</td>
                        <td style="padding:18px 20px;color:#111827;font-size:16px;line-height:1.75;">${safeMessage}</td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;background:#0f1720;border-radius:16px;">
                      <tr>
                        <td style="padding:20px 22px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="vertical-align:middle;">
                                <p style="margin:0;color:#ffffff;font-size:15px;font-weight:800;">Next step</p>
                                <p style="margin:7px 0 0;color:#aab7c8;font-size:13px;line-height:1.6;">Reply directly to continue the conversation with ${escapeHtml(name)}.</p>
                              </td>
                              <td align="right" style="vertical-align:middle;width:140px;">
                                <a href="mailto:${escapeHtml(email)}" style="display:inline-block;background:#c9ff3d;color:#101821;border-radius:12px;padding:12px 16px;font-size:13px;font-weight:900;text-decoration:none;">Send reply</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function buildConfirmationEmail({ name, message, receivedAt }) {
  return `
    <!doctype html>
    <html>
      <body style="margin:0;background:#0b1117;font-family:Arial,Helvetica,sans-serif;color:#172033;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1117;padding:34px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:660px;background:#ffffff;border:1px solid #263343;border-radius:24px;overflow:hidden;box-shadow:0 26px 70px rgba(0,0,0,0.35);">
                <tr>
                  <td style="background:#0f1720;padding:34px 34px 30px;color:#ffffff;">
                    <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#c9ff3d;font-weight:800;">Message received</p>
                    <h1 style="margin:0;font-size:30px;line-height:1.18;font-weight:800;">Thanks for reaching out, ${escapeHtml(name)}.</h1>
                    <p style="margin:12px 0 0;color:#9fb0c3;font-size:14px;line-height:1.7;">Your message was submitted successfully on ${escapeHtml(receivedAt)}.</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f5f7fb;padding:30px 34px 34px;">
                    <div style="background:#ffffff;border:1px solid #e6ebf2;border-radius:18px;padding:22px;">
                      <p style="margin:0 0 10px;color:#111827;font-size:17px;font-weight:800;">I received your note.</p>
                      <p style="margin:0;color:#475467;font-size:15px;line-height:1.7;">I will review it and get back to you as soon as possible. Your original message is saved below for reference.</p>
                    </div>
                    <div style="margin-top:18px;background:#ffffff;border:1px solid #e6ebf2;border-radius:18px;overflow:hidden;">
                      <div style="padding:18px 22px;border-bottom:1px solid #edf1f7;">
                        <p style="margin:0;color:#667085;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;font-weight:800;">Your message</p>
                      </div>
                      <div style="padding:22px;color:#111827;font-size:16px;line-height:1.75;">${escapeHtml(message).replace(/\n/g, '<br>')}</div>
                    </div>
                    <div style="margin-top:22px;background:#101821;border-radius:18px;padding:22px;">
                      <p style="margin:0;color:#ffffff;font-size:15px;line-height:1.7;">Best regards,<br><strong>Ashraful Alom</strong><br><span style="color:#9fb0c3;">Full Stack Developer</span></p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

// Contact form endpoint
router.post('/contact', async (req, res) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Email service is not configured yet.'
      });
    }

    const name = normalizeText(req.body.name, 120);
    const email = normalizeText(req.body.email, 160).toLowerCase();
    const message = normalizeText(req.body.message, 3000);
    const company = normalizeText(req.body.company, 160);
    const inquiryType = normalizeText(req.body.inquiryType || 'Portfolio contact', 80);
    const source = normalizeText(req.body.source || 'Portfolio contact form', 80);
    const receivedDate = new Date();
    const receivedAt = formatReceivedTime(receivedDate);

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    const resend = getResendClient();

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: process.env.CONTACT_EMAIL || 'ashraful.abh@gmail.com',
      reply_to: email,
      subject: `New ${inquiryType} from ${name} - Portfolio [${EMAIL_TEMPLATE_VERSION}]`,
      html: buildAdminEmail({ name, email, company, inquiryType, source, message, receivedAt }),
      text: [
        'New contact form submission',
        `Received: ${receivedAt}`,
        `Name: ${name}`,
        `Email: ${email}`,
        `Company: ${company || 'Not provided'}`,
        `Inquiry Type: ${inquiryType}`,
        `Source: ${source}`,
        '',
        'Message:',
        message
      ].join('\n')
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send message. Please try again later.' 
      });
    }

    // Send confirmation to the user
    await resend.emails.send({
      from: 'Ashraful Alom <onboarding@resend.dev>',
      to: email,
      subject: `Thank you for contacting me! [${EMAIL_TEMPLATE_VERSION}]`,
      html: buildConfirmationEmail({ name, message, receivedAt }),
      text: `Thanks for reaching out, ${name}.\n\nI received your message on ${receivedAt} and will get back to you as soon as possible.\n\nYour message:\n${message}\n\nBest regards,\nAshraful Alom\nFull Stack Developer`
    });

    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully!' 
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.' 
    });
  }
});

module.exports = router;
