const express = require('express');
const { body } = require('express-validator');
const { getBalance, addPoints, usePoints, getHistory } = require('../controllers/pointsController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/get', authenticate, getBalance);
router.get('/history', authenticate, getHistory);

router.post('/add', authenticate, [
  body('points').isInt({ min: 1 }).withMessage('Points must be a positive number'),
  validate,
], addPoints);

router.post('/use', authenticate, [
  body('points').isInt({ min: 1 }).withMessage('Points must be a positive number'),
  validate,
], usePoints);

module.exports = router;
