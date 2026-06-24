const emailService = require('../services/emailService');

/**
 * Handle Contact Us Form Submissions
 */
exports.submitContactForm = async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    // 1. Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields (name, email, subject, message) are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // 2. Dispatch email to Admin
    await emailService.sendContactFormEmailToAdmin(name, email, subject, message);

    return res.status(200).json({
      message: 'Your message has been sent successfully. Our administrator will contact you soon.'
    });
  } catch (error) {
    console.error('Contact form controller error:', error);
    return res.status(500).json({ error: 'Failed to transmit contact form. Please try again later.' });
  }
};
