const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

/**
 * Get or initialize the Nodemailer transporter.
 * Implements fallback to Ethereal Mail and local logger.
 */
async function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;

  const hasCredentials = user && pass && host && port;

  if (hasCredentials) {
    console.log('📬 Initializing SMTP Transporter using .env credentials...');
    transporter = nodemailer.createTransport({
      host: host,
      port: parseInt(port, 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: user,
        pass: pass,
      },
    });
  } else {
    console.log('⚠️ SMTP credentials not fully configured in .env. Creating auto-generated Ethereal Mail test account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log(`✅ Generated Ethereal Test Account:
        User: ${testAccount.user}
        Pass: ${testAccount.pass}
      `);
      
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      // Override EMAIL_FROM to match the generated test user
      process.env.EMAIL_FROM = `"Ethereal Test" <${testAccount.user}>`;
    } catch (err) {
      console.error('❌ Failed to create Ethereal Mail account (possibly offline). Falling back to mock console logger transporter.', err.message);
      
      transporter = {
        sendMail: async (options) => {
          console.log('\n======================================');
          console.log('📬 [OFFLINE MOCK MAIL LOGGER]');
          console.log(`From:    ${options.from}`);
          console.log(`To:      ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log('--------------------------------------');
          console.log('Text body:', options.text || '[No text body]');
          console.log('HTML body preview: HTML output printed below:');
          console.log(options.html ? options.html.substring(0, 1000) + '...' : '[No HTML body]');
          console.log('======================================\n');
          
          return {
            messageId: `mock-offline-id-${Date.now()}`,
            mockUrl: true
          };
        }
      };
      return transporter;
    }
  }

  // Verify connection
  try {
    if (typeof transporter.verify === 'function') {
      await transporter.verify();
      console.log('✅ Mail transporter connection verified and ready.');
    }
  } catch (err) {
    console.error('❌ SMTP verification failed:', err.message);
  }

  return transporter;
}

module.exports = {
  getTransporter
};
