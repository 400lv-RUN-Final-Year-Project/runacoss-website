const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// POST /api/payments/verify
router.post('/verify', paymentController.verifyPayment);

// POST /api/payments/send-receipt
router.post('/send-receipt', paymentController.sendReceipt);

module.exports = router; 

