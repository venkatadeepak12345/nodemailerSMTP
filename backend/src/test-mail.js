const { getTransporter } = require('./config/mail');
require('dotenv').config();

async function testMail() {
  console.log('📬 Initializing mail transporter...');
  try {
    const transporter = await getTransporter();

    // Verify SMTP settings directly
    if (typeof transporter.verify === 'function') {
      console.log('🔍 Verifying connection with SMTP host...');
      await transporter.verify();
      console.log('✅ SMTP server connection verified successfully.');
    }

    const from = process.env.EMAIL_FROM || '"SecureMail" <no-reply@example.com>';
    const to = 'venkatdeepak314@gmail.com';

    const mailOptions = {
      from,
      to,
      subject: 'SecureMail SMTP Setup Diagnostic',
      text: 'If you receive this, your SMTP configuration is correct!',
      html: '<h2>SMTP Verification Success</h2><p>Your Gmail configuration is correct and active.</p>'
    };

    console.log(`✉️ Sending test mail from "${from}" to "${to}"...`);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Mail delivered successfully!');
    console.log('Message ID:', info.messageId);
    console.log("SMTP_USER:", process.env.SMTP_USER);
    console.log("SMTP_PASS length:", process.env.SMTP_PASS?.length);
  } catch (err) {
    console.error('\n❌ Email delivery test failed!');
    console.error('Error Message:', err.message);
    console.error('Error Code:', err.code);
    console.error('Stack Trace:', err.stack);
  }
}

testMail();
