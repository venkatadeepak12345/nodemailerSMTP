const crypto = require('crypto');
const db = require('../config/db');

/**
 * Generate a cryptographically secure 64-character hexadecimal reset token
 */
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash utility using SHA-256
 */
function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Create a new password reset token for a user, deleting any existing tokens for that user
 */
async function createResetToken(userId) {
  const token = generateResetToken();
  const tokenHash = hashValue(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

  // Clear older reset tokens for the user
  await db.query(
    'DELETE FROM password_reset_tokens WHERE user_id = $1',
    [userId]
  );

  // Insert token
  await db.query(
    'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt]
  );

  return token;
}

/**
 * Verify a reset token. If valid, deletes the token record to prevent reuse and returns the associated user_id.
 */
async function verifyResetToken(token) {
  if (!token) return null;

  const tokenHash = hashValue(token);

  // Retrieve valid active tokens
  const result = await db.query(
    'SELECT * FROM password_reset_tokens WHERE token_hash = $1 AND expires_at > NOW()',
    [tokenHash]
  );

  if (result.rows.length === 0) {
    return null; // Token does not exist or has expired
  }

  const userId = result.rows[0].user_id;

  // Invalidate token immediately to prevent double usage
  await db.query(
    'DELETE FROM password_reset_tokens WHERE token_hash = $1',
    [tokenHash]
  );

  return userId;
}

module.exports = {
  createResetToken,
  verifyResetToken
};
