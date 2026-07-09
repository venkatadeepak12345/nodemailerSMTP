const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s/g, "");

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP configuration missing. Check SMTP_HOST, SMTP_USER and SMTP_PASS."
    );
  }

  console.log("📬 Initializing Gmail SMTP...");
  console.log("Host:", host);
  console.log("Port:", port);
  console.log("User:", user);
  console.log("Password loaded:", pass ? "YES" : "NO");

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,

    auth: {
      user,
      pass,
    },

    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  try {
    await transporter.verify();

    console.log("✅ Gmail SMTP connected successfully");
  } catch (error) {
    console.error("❌ Gmail SMTP verification failed");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Response:", error.response);

    transporter = null;

    throw error;
  }

  return transporter;
}

module.exports = {
  getTransporter,
};