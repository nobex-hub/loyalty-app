const express = require('express');
const { body } = require('express-validator');
const { scanReceipt } = require('../controllers/receiptController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/scan', authenticate, [
  body('qrData').notEmpty().withMessage('QR data is required'),
  validate,
], scanReceipt);

module.exports = router;
