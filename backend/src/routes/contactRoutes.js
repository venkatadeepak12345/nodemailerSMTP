const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const rateLimiter = require('../middleware/rateLimiter');

// Rate limiting: Max 3 contact submissions per hour per IP to block email bot storms
const contactLimiter = rateLimiter(60 * 60 * 1000, 3);

router.post('/submit', contactLimiter, contactController.submitContactForm);

module.exports = router;
