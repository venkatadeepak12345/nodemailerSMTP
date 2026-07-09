const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const rateLimiter = require('../middleware/rateLimiter');

// Instantiate security limiters
// Strict Limiter: Max 5 actions per 15 minutes (protects email delivery costs and spam)
const strictLimiter = rateLimiter(15 * 60 * 1000, 5);
// Login Limiter: Max 10 attempts per 15 minutes (combats password brute-forcing)
const loginLimiter = rateLimiter(15 * 60 * 1000, 10);

// Registration & Verification
router.post('/register', strictLimiter, authController.register);
router.post('/verify-email', authController.verifyEmailOtp);
router.post('/resend-verify-otp', strictLimiter, authController.resendVerificationOtp);

// Logins & MFA OTP
router.post('/login', loginLimiter, authController.login);
router.post('/verify-login-otp', authController.verifyLoginOtp);

// Password Management
router.post('/forgot-password', strictLimiter, authController.forgotPassword);
router.post('/reset-password', strictLimiter, authController.resetPassword);

// SMTP configuration diagnostic route
const { getTransporter } = require('../config/mail');
router.get('/test-smtp', async (req, res) => {
  try {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const from = process.env.EMAIL_FROM;

    const hasCredentials = !!(user && pass && host && port);
    const transporter = await getTransporter();
    
    let isVerified = false;
    let verifyError = null;

    if (transporter && typeof transporter.verify === 'function') {
      try {
        await transporter.verify();
        isVerified = true;
      } catch (err) {
        verifyError = err.message;
      }
    } else {
      isVerified = true; // Offline mock logger
    }

    res.status(200).json({
      status: 'success',
      configuredInEnv: hasCredentials,
      smtpUser: user ? `${user.substring(0, 3)}***@${user.split('@')[1]}` : null,
      smtpHost: host,
      smtpPort: port,
      emailFrom: from,
      isVerified,
      verifyError,
      isEthereal: transporter && transporter.options && transporter.options.host === 'smtp.ethereal.email'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
