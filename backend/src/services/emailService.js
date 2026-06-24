const nodemailer = require('nodemailer');
const { getTransporter } = require('../config/mail');
require('dotenv').config();

// Base responsive HTML template wrapper
const getEmailWrapper = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #334155;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 32px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px 32px;
      line-height: 1.6;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn-primary {
      background-color: #059669;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      display: inline-block;
      box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2), 0 2px 4px -1px rgba(16, 185, 129, 0.10);
    }
    .btn-primary:hover {
      background-color: #047857;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .footer a {
      color: #059669;
      text-decoration: none;
    }
    .otp-code {
      font-size: 32px;
      font-weight: 800;
      color: #059669;
      letter-spacing: 6px;
      background-color: #f0fdf4;
      border: 1px dashed #6ee7b7;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      margin: 24px auto;
      max-width: 240px;
    }
    .alert-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      color: #b45309;
      padding: 12px 16px;
      border-radius: 4px;
      font-size: 14px;
      margin: 20px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }
    th {
      background-color: #f8fafc;
      font-weight: 600;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>${title}</h1>
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        <p>This email was automatically sent. Please do not reply directly to this message.</p>
        <p>&copy; ${new Date().getFullYear()} SmartEco. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

/**
 * Generic mail sender wrapper
 */
async function sendMail({ to, subject, html, text }) {
  try {
    const transporter = await getTransporter();
    const from = process.env.EMAIL_FROM || '"SmartEco Support" <no-reply@example.com>';

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    let previewUrl = null;
    if (nodemailer.getTestMessageUrl) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`✉️ Ethereal Preview URL: ${previewUrl}`);
      }
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}

/**
 * 1. Welcome Email
 */
async function sendWelcomeEmail(to, name) {
  const title = 'Welcome to SmartEco!';
  const html = getEmailWrapper(
    title,
    `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Thanks for signing up for SmartEco! We are absolutely thrilled to have you join our platform.</p>
    <p>Our secure, cloud-enabled environment ensures that your records are kept private, and your actions are verified using the latest cryptography.</p>
    <p>Here is what you can do next:</p>
    <ul>
      <li>Complete your profile dashboard setup.</li>
      <li>Configure two-factor verification options.</li>
      <li>Explore active tools and integrations.</li>
    </ul>
    <div class="button-container">
      <a href="${process.env.CLIENT_URL}/" class="btn-primary">Go to Dashboard</a>
    </div>
    <p>If you have any questions, feel free to contact our support team at any time.</p>
    <p>Best regards,<br>SmartEco Development Team</p>
    `
  );
  const text = `Welcome to SmartEco, ${name}!\n\nThanks for signing up. Please visit ${process.env.CLIENT_URL} to get started.`;
  return sendMail({ to, subject: title, html, text });
}

/**
 * 2. Email Verification OTP
 */
async function sendVerificationOtpEmail(to, name, otp) {
  const title = 'Welcome to SmartEco 🚀';
  const text = `Welcome to SmartEco 🚀\n\nHello,\n\nThank you for registering with SmartEco.\n\nTo complete your registration, please verify your email address using the OTP below:\n\n🔐 Email Verification OTP\n\n${otp}\n\nThis OTP is valid for 5 minutes.\n\nIf you did not request this registration, please ignore this email.\n\nRegards,\n\nSmartEco Development Team`;
  const html = getEmailWrapper(
    title,
    `
    <p>Hello,</p>
    <p>Thank you for registering with SmartEco.</p>
    <p>To complete your registration, please verify your email address using the OTP below:</p>
    <p style="font-size: 16px; font-weight: bold; margin-top: 24px; text-align: center; color: #334155;">🔐 Email Verification OTP</p>
    <div class="otp-code">${otp}</div>
    <p style="text-align: center; color: #64748b; font-size: 14px; margin-top: 16px;">This OTP is valid for 5 minutes.</p>
    <p style="color: #64748b; font-size: 14px; margin-top: 24px;">If you did not request this registration, please ignore this email.</p>
    <p style="margin-top: 32px; line-height: 1.5;">Regards,<br><br>SmartEco Development Team</p>
    `
  );
  return sendMail({ to, subject: title, html, text });
}

/**
 * 3. Login OTP Verification
 */
async function sendLoginOtpEmail(to, name, otp) {
  const title = 'Welcome to SmartEco 🚀';
  const text = `Welcome to SmartEco 🚀\n\nHello,\n\nThank you for registering with SmartEco.\n\nTo complete your registration, please verify your email address using the OTP below:\n\n🔐 Email Verification OTP\n\n${otp}\n\nThis OTP is valid for 5 minutes.\n\nIf you did not request this registration, please ignore this email.\n\nRegards,\n\nSmartEco Development Team`;
  const html = getEmailWrapper(
    title,
    `
    <p>Hello,</p>
    <p>Thank you for registering with SmartEco.</p>
    <p>To complete your registration, please verify your email address using the OTP below:</p>
    <p style="font-size: 16px; font-weight: bold; margin-top: 24px; text-align: center; color: #334155;">🔐 Email Verification OTP</p>
    <div class="otp-code">${otp}</div>
    <p style="text-align: center; color: #64748b; font-size: 14px; margin-top: 16px;">This OTP is valid for 5 minutes.</p>
    <p style="color: #64748b; font-size: 14px; margin-top: 24px;">If you did not request this registration, please ignore this email.</p>
    <p style="margin-top: 32px; line-height: 1.5;">Regards,<br><br>SmartEco Development Team</p>
    `
  );
  return sendMail({ to, subject: title, html, text });
}

/**
 * 4. Forgot Password Email (Token-based link)
 */
async function sendForgotPasswordEmail(to, name, resetToken) {
  const title = 'Reset Your Password';
  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  const html = getEmailWrapper(
    title,
    `
    <p>Hi <strong>${name}</strong>,</p>
    <p>We received a request to reset the password associated with your account. Click the button below to specify a new password:</p>
    <div class="button-container">
      <a href="${resetLink}" class="btn-primary" target="_blank">Reset Password</a>
    </div>
    <div class="alert-box">
      ⚠️ This reset link is valid for **15 minutes**. If you did not make this request, you can safely ignore this email; your password will remain secure.
    </div>
    <p>If you cannot click the button above, copy and paste this link into your browser:</p>
    <p><a href="${resetLink}">${resetLink}</a></p>
    <p>Thanks,<br>SmartEco Development Team</p>
    `
  );
  const text = `Reset Password: Click this link to reset your password: ${resetLink}. Valid for 15 minutes.`;
  return sendMail({ to, subject: title, html, text });
}

/**
 * 5. Contact Us Form Email to Admin
 */
async function sendContactFormEmailToAdmin(senderName, senderEmail, senderSubject, messageText) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const title = `New Contact Form Submission: ${senderSubject}`;
  const html = getEmailWrapper(
    title,
    `
    <p>Hello Admin,</p>
    <p>You have received a new contact submission from the Contact Us form:</p>
    <table>
      <tr>
        <th>Field</th>
        <th>Details</th>
      </tr>
      <tr>
        <td><strong>Name</strong></td>
        <td>${senderName}</td>
      </tr>
      <tr>
        <td><strong>Email</strong></td>
        <td>${senderEmail}</td>
      </tr>
      <tr>
        <td><strong>Subject</strong></td>
        <td>${senderSubject}</td>
      </tr>
      <tr>
        <td><strong>Date</strong></td>
        <td>${new Date().toLocaleString()}</td>
      </tr>
    </table>
    <p><strong>Message Content:</strong></p>
    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 6px; border: 1px solid #cbd5e1; white-space: pre-wrap;">${messageText}</div>
    `
  );
  const text = `New Contact Form Submission:\n\nName: ${senderName}\nEmail: ${senderEmail}\nSubject: ${senderSubject}\n\nMessage:\n${messageText}`;
  return sendMail({ to: adminEmail, subject: title, html, text });
}

/**
 * 6. Order / Action Confirmation Email
 */
async function sendActionConfirmationEmail(to, name, actionName, actionDetails = {}) {
  const title = `Action Confirmed: ${actionName}`;

  // Format items table if items are provided, otherwise show action properties
  let detailsHtml = '';
  if (actionDetails.items && Array.isArray(actionDetails.items)) {
    detailsHtml += `
      <p>Here is your action transaction breakdown:</p>
      <table>
        <thead>
          <tr>
            <th>Item Description</th>
            <th>Quantity</th>
            <th style="text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${actionDetails.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td style="text-align: right;">$${parseFloat(item.price).toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr>
            <td colspan="2" style="text-align: right; border-top: 2px solid #cbd5e1; font-weight: bold;">Subtotal</td>
            <td style="text-align: right; border-top: 2px solid #cbd5e1; font-weight: bold;">$${parseFloat(actionDetails.subtotal || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="text-align: right; font-weight: bold;">Tax (10%)</td>
            <td style="text-align: right; font-weight: bold;">$${parseFloat(actionDetails.tax || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="text-align: right; font-weight: bold; font-size: 16px; color: #4f46e5;">Total Paid</td>
            <td style="text-align: right; font-weight: bold; font-size: 16px; color: #4f46e5;">$${parseFloat(actionDetails.total || 0).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    `;
  } else {
    detailsHtml += `
      <p>Your request has been successfully processed in our system.</p>
      <table>
        <tr>
          <th>Details</th>
          <th>Status</th>
        </tr>
        <tr>
          <td>Transaction ID</td>
          <td>${actionDetails.transactionId || 'N/A'}</td>
        </tr>
        <tr>
          <td>Reference Code</td>
          <td>${actionDetails.referenceCode || 'N/A'}</td>
        </tr>
        <tr>
          <td>Completion Status</td>
          <td style="color: #10b981; font-weight: bold;">SUCCESS</td>
        </tr>
      </table>
    `;
  }

  const html = getEmailWrapper(
    title,
    `
    <p>Hi <strong>${name}</strong>,</p>
    <p>We are writing to confirm that your recent request/order <strong>${actionName}</strong> has been successfully processed.</p>
    ${detailsHtml}
    <p>You can view full details in your personal account portal.</p>
    <div class="button-container">
      <a href="${process.env.CLIENT_URL}/" class="btn-primary">View Account Activity</a>
    </div>
    <p>Thank you for using our secure platform!</p>
    <p>Warmly,<br>SmartEco Development Team</p>
    `
  );

  const text = `Order/Action Confirmation: ${actionName} was processed. Total: $${actionDetails.total || 0}. Thank you!`;
  return sendMail({ to, subject: title, html, text });
}

module.exports = {
  sendWelcomeEmail,
  sendVerificationOtpEmail,
  sendLoginOtpEmail,
  sendForgotPasswordEmail,
  sendContactFormEmailToAdmin,
  sendActionConfirmationEmail,
};
