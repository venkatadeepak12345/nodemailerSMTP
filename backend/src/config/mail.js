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
  let host = process.env.SMTP_HOST;
  let port = process.env.SMTP_PORT;
  let secure = process.env.SMTP_SECURE === 'true';

  // Automatically force port 465 (SSL) on Render/production to bypass port 587 block
  if ((process.env.RENDER || process.env.DATABASE_URL) && host === 'smtp.gmail.com' && port === '587') {
    console.log('🔄 Production environment detected: Automatically switching Gmail SMTP port from 587 to 465 (SSL) to bypass Render firewall blocks.');
    port = '465';
    secure = true;
  }

  const hasCredentials = user && pass && host && port;

  if (hasCredentials) {
    console.log(`📬 Initializing SMTP Transporter using credentials (Host: ${host}, Port: ${port}, Secure: ${secure})...`);
    transporter = nodemailer.createTransport({
      host: host,
      port: parseInt(port, 10),
      secure: secure,
      auth: {
        user: user,
        pass: pass,
      },
      connectionTimeout: 5000, // 5 seconds connection timeout
      greetingTimeout: 5000,   // 5 seconds greeting timeout
      socketTimeout: 5000,     // 5 seconds socket timeout
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
