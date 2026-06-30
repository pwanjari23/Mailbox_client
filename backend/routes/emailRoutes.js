const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const authMiddleware = require('../middleware/auth');

// Apply JWT authentication middleware to all email routes
router.use(authMiddleware);

// POST /api/emails/send
router.post('/send', emailController.sendEmail);

// GET /api/emails/inbox
router.get('/inbox', emailController.getInbox);

// GET /api/emails/sent
router.get('/sent', emailController.getSentbox);

module.exports = router;
