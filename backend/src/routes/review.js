const express = require('express');
const { body } = require('express-validator');
const { submitReview, getQueue, getAllReviews, approveReview, rejectReview } = require('../controllers/reviewController');
const { authenticate, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/request', authenticate, [
  body('productName').notEmpty().withMessage('Product name is required'),
  body('productIdentifier').notEmpty().withMessage('Product identifier is required'),
  validate,
], submitReview);

router.get('/queue', authenticate, isAdmin, getQueue);
router.get('/all', authenticate, isAdmin, getAllReviews);

router.post('/:id/approve', authenticate, isAdmin, [
  body('pointsValue').isInt({ min: 0 }).withMessage('Points value required'),
  validate,
], approveReview);

router.post('/:id/reject', authenticate, isAdmin, rejectReview);

module.exports = router;
