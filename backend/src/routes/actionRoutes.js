const express = require('express');
const router = express.Router();
const actionController = require('../controllers/actionController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected route to trigger order / transactional action notifications
router.post('/confirm-action', authMiddleware, actionController.sendActionConfirmation);

module.exports = router;
