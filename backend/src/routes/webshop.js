const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticateWebshop } = require('../middleware/webshopAuth');
const { checkPoints, usePoints, refundPoints } = require('../controllers/webshopController');

const router = express.Router();

// Rate limiting: 100 requests per 15 minutes per API key
const webshopLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.headers['x-api-key'] || 'unknown',
  message: { error: 'Too many requests. Rate limit: 100 per 15 minutes.' },
  validate: false,
});

// All webshop routes require API key + rate limiting
router.use(webshopLimiter);
router.use(authenticateWebshop);

router.get('/points/:userId', checkPoints);
router.post('/points/use', usePoints);
router.post('/points/refund', refundPoints);

module.exports = router;
