const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const otpService = require('../services/otpService');
const tokenService = require('../services/tokenService');
const emailService = require('../services/emailService');
require('dotenv').config();

// Helper to sign JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Regex for validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 1. Register User
 */
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields (name, email, password) are required.' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // 2. Check if email already exists
    const userExist = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userExist.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Save User in Database
    const newUser = await db.query(
      'INSERT INTO users (name, email, password, is_verified) VALUES ($1, $2, $3, FALSE) RETURNING id, name, email, is_verified',
      [name, email.toLowerCase(), hashedPassword]
    );

    const user = newUser.rows[0];

    // 5. Generate and Send Verification OTP
    const otp = await otpService.createOtp(user.email, 'email_verification');

    // Send email asynchronously (non-blocking)
    emailService.sendVerificationOtpEmail(user.email, user.name, otp)
      .catch(err => console.error(`Failed to send signup OTP email to ${user.email}:`, err.message));

    return res.status(201).json({
      message: 'Registration successful. A verification OTP has been sent to your email.',
      email: user.email,
      requiresVerification: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'An unexpected database error occurred during registration.' });
  }
};

/**
 * 2. Verify Email OTP (Completes Registration)
 */
exports.verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP code are required.' });
    }

    // Check if user exists
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const user = userResult.rows[0];

    // Validate OTP
    const isValid = await otpService.verifyOtp(email.toLowerCase(), otp, 'email_verification');
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired verification OTP.' });
    }

    // Update user to verified status
    await db.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [user.id]);

    // Send Welcome Email asynchronously
    emailService.sendWelcomeEmail(user.email, user.name)
      .catch(err => console.error(`Failed to send Welcome email to ${user.email}:`, err.message));

    // Sign JWT and return
    const token = generateToken({ id: user.id, name: user.name, email: user.email });

    return res.status(200).json({
      message: 'Email verified successfully. Welcome to SmartEco!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_verified: true
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ error: 'An unexpected database error occurred during verification.' });
  }
};

/**
 * 3. Resend Verification OTP
 */
exports.resendVerificationOtp = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const user = userResult.rows[0];
    if (user.is_verified) {
      return res.status(400).json({ error: 'This email is already verified.' });
    }

    const otp = await otpService.createOtp(user.email, 'email_verification');

    // Send OTP asynchronously
    emailService.sendVerificationOtpEmail(user.email, user.name, otp)
      .catch(err => console.error(`Failed to send signup OTP email to ${user.email}:`, err.message));

    return res.status(200).json({ message: 'A new verification OTP has been sent to your email.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ error: 'Failed to generate verification OTP.' });
  }
};

/**
 * 4. Login (Password Step)
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Check user
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // If not verified, force OTP registration completion
    if (!user.is_verified) {
      const otp = await otpService.createOtp(user.email, 'email_verification');
      emailService.sendVerificationOtpEmail(user.email, user.name, otp)
        .catch(err => console.error(`Failed to resend verification OTP to ${user.email}:`, err.message));

      return res.status(403).json({
        error: 'Your email address is not verified. A new OTP verification code has been sent.',
        email: user.email,
        requiresVerification: true
      });
    }

    // Generate and Send Login Verification OTP (2FA Step)
    const otp = await otpService.createOtp(user.email, 'login_otp');
    emailService.sendLoginOtpEmail(user.email, user.name, otp)
      .catch(err => console.error(`Failed to send login OTP email to ${user.email}:`, err.message));

    return res.status(200).json({
      message: 'Password correct. Please enter the Login OTP sent to your email.',
      email: user.email,
      requiresOtp: true
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An unexpected database error occurred during login.' });
  }
};

/**
 * 5. Verify Login OTP (Completes Login)
 */
exports.verifyLoginOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP code are required.' });
    }

    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const user = userResult.rows[0];

    // Validate OTP
    const isValid = await otpService.verifyOtp(email.toLowerCase(), otp, 'login_otp');
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired login OTP.' });
    }

    // Sign JWT and return
    const token = generateToken({ id: user.id, name: user.name, email: user.email });

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_verified: true
      }
    });
  } catch (error) {
    console.error('Login OTP verification error:', error);
    return res.status(500).json({ error: 'An unexpected database error occurred during login OTP verification.' });
  }
};

/**
 * 6. Forgot Password (Request Reset Link)
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userResult.rows.length === 0) {
      // Security practice: Don't explicitly reveal that the email doesn't exist
      return res.status(200).json({ message: 'If that email address exists in our database, we have sent a reset password link.' });
    }

    const user = userResult.rows[0];

    // Create password reset token
    const resetToken = await tokenService.createResetToken(user.id);

    // Send reset password link email
    emailService.sendForgotPasswordEmail(user.email, user.name, resetToken)
      .catch(err => console.error(`Failed to send password reset email to ${user.email}:`, err.message));

    return res.status(200).json({
      message: 'If that email address exists in our database, we have sent a reset password link.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Failed to process forgot password request.' });
  }
};

/**
 * 7. Reset Password (Use Link Token)
 */
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Verify token and get user ID
    const userId = await tokenService.verifyResetToken(token);
    if (!userId) {
      return res.status(400).json({ error: 'Your password reset link is invalid or has expired.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password in DB
    await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

    return res.status(200).json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
};
