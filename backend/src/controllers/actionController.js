const emailService = require('../services/emailService');

/**
 * Handle Order / Action Confirmation Emails
 * Route is protected by authMiddleware
 */
exports.sendActionConfirmation = async (req, res) => {
  const { actionName, actionDetails } = req.body;
  const { email, name } = req.user; // Appended by JWT auth middleware

  try {
    if (!actionName) {
      return res.status(400).json({ error: 'Action / Order description name is required.' });
    }

    // Prepare default items structure if none supplied
    const details = actionDetails || {
      transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      referenceCode: `REF-${Date.now().toString().slice(-6)}`,
      items: [
        { name: 'Standard Subscription License', quantity: 1, price: 49.00 },
        { name: 'Priority Integration Services', quantity: 2, price: 25.00 }
      ],
      subtotal: 99.00,
      tax: 9.90,
      total: 108.90
    };

    // Send order confirmation email
    await emailService.sendActionConfirmationEmail(email, name, actionName, details);

    return res.status(200).json({
      message: `Action/Order Confirmation email for "${actionName}" sent successfully.`
    });
  } catch (error) {
    console.error('Action confirmation controller error:', error);
    return res.status(500).json({ error: 'Failed to transmit action/order confirmation email.' });
  }
};
