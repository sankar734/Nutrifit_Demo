const nodemailer = require('nodemailer');

let transporter = null;

const isConfigured = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const getTransporter = () => {
  if (!isConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
    });
  }
  return transporter;
};

const wrapTemplate = (title, bodyHtml) => `
  <div style="font-family: 'Segoe UI', sans-serif; background:#F8F7FC; padding:32px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(139,92,246,0.12);">
      <div style="background:linear-gradient(135deg,#8B5CF6,#A78BFA);padding:24px;color:#fff;">
        <h2 style="margin:0;font-size:20px;">NutriChef</h2>
        <p style="margin:4px 0 0;font-size:13px;opacity:0.9;">${title}</p>
      </div>
      <div style="padding:24px;color:#1F1B2E;font-size:14px;line-height:1.6;">
        ${bodyHtml}
      </div>
    </div>
  </div>
`;

// Sends an email if SMTP is configured; otherwise logs to console so the flow
// still works end-to-end in local/dev environments without real credentials.
const sendEmail = async ({ to, subject, html }) => {
  const t = getTransporter();
  if (!t) {
    console.log(`[emailService] SMTP not configured — would have sent "${subject}" to ${to}`);
    return { sent: false, mock: true };
  }
  try {
    await t.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, html });
    return { sent: true };
  } catch (err) {
    console.error(`[emailService] Failed to send email to ${to}:`, err.message);
    return { sent: false, error: err.message };
  }
};

const sendWelcomeEmail = (user) =>
  sendEmail({
    to: user.email,
    subject: 'Welcome to NutriChef 🥑',
    html: wrapTemplate(
      'Welcome aboard!',
      `<p>Hi ${user.name},</p><p>Welcome to NutriChef — healthy homemade meals from verified home chefs, delivered to your door. Explore nearby chefs and get AI-powered meal recommendations right from your dashboard.</p>`
    ),
  });

const sendOtpEmail = (user, otp) =>
  sendEmail({
    to: user.email,
    subject: 'Your NutriChef verification code',
    html: wrapTemplate(
      'Verification code',
      `<p>Hi ${user.name || ''},</p><p>Your one-time verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px;color:#7C3AED;">${otp}</p><p>This code expires in 5 minutes. If you didn't request this, you can safely ignore this email.</p>`
    ),
  });

const sendOrderConfirmationEmail = (user, order) =>
  sendEmail({
    to: user.email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html: wrapTemplate(
      'Order confirmed',
      `<p>Hi ${user.name},</p><p>Your order <b>${order.orderNumber}</b> has been placed successfully.</p>
       <p><b>Total: ₹${order.totalAmount}</b></p>
       <p>We'll notify you as your meal is prepared and dispatched.</p>`
    ),
  });

const sendOrderStatusEmail = (user, order) =>
  sendEmail({
    to: user.email,
    subject: `Order ${order.orderNumber} — ${order.status.replace('_', ' ')}`,
    html: wrapTemplate(
      'Order update',
      `<p>Hi ${user.name},</p><p>Your order <b>${order.orderNumber}</b> is now: <b>${order.status.replace('_', ' ')}</b>.</p>`
    ),
  });

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOtpEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  isConfigured,
};
