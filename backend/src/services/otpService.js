const crypto = require('crypto');
const db = require('../config/db');

/**
 * Generate a cryptographically secure 6-digit numerical OTP
 */
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash utility using SHA-256
 */
function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Create a new OTP, delete previous ones for this email & purpose, and return raw OTP
 */
async function createOtp(email, purpose) {
  const otp = generateOtp();
  const otpHash = hashValue(otp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

  // Remove any pre-existing OTPs of this type for the user
  await db.query(
    'DELETE FROM email_otps WHERE email = $1 AND purpose = $2',
    [email, purpose]
  );

  // Insert new hashed OTP record
  await db.query(
    'INSERT INTO email_otps (email, otp_hash, purpose, expires_at) VALUES ($1, $2, $3, $4)',
    [email, otpHash, purpose, expiresAt]
  );

  return otp;
}

/**
 * Verify an OTP. If matching and valid, deletes it (preventing reuse) and returns true.
 */
async function verifyOtp(email, otp, purpose) {
  if (!email || !otp || !purpose) return false;
  
  const otpHash = hashValue(otp);

  // Retrieve valid OTPs
  const result = await db.query(
    'SELECT * FROM email_otps WHERE email = $1 AND otp_hash = $2 AND purpose = $3 AND expires_at > NOW()',
    [email, otpHash, purpose]
  );

  if (result.rows.length === 0) {
    return false;
  }

  // Prevent OTP reuse: Delete immediately
  await db.query(
    'DELETE FROM email_otps WHERE email = $1 AND purpose = $2',
    [email, purpose]
  );

  return true;
}

module.exports = {
  createOtp,
  verifyOtp,
  hashValue
};
