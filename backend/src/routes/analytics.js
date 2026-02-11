const express = require('express');
const {
  getDashboardStats,
  getStoreStats,
  getProductStats,
  getUserStats,
  getUnknownProductStats,
} = require('../controllers/analyticsController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticate, isAdmin, getDashboardStats);
router.get('/stats/stores', authenticate, isAdmin, getStoreStats);
router.get('/stats/products', authenticate, isAdmin, getProductStats);
router.get('/stats/users', authenticate, isAdmin, getUserStats);
router.get('/stats/unknown-products', authenticate, isAdmin, getUnknownProductStats);

module.exports = router;
