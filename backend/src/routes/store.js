const express = require('express');
const { body } = require('express-validator');
const { getAllStores, createStore, getFavorites, addFavorite, removeFavorite } = require('../controllers/storeController');
const { authenticate, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', authenticate, getAllStores);

router.post('/', authenticate, isAdmin, [
  body('name').notEmpty().withMessage('Store name is required'),
  body('fiscalId').notEmpty().withMessage('Fiscal ID is required'),
  validate,
], createStore);

router.get('/favorites', authenticate, getFavorites);
router.post('/favorites', authenticate, [
  body('storeId').notEmpty().withMessage('Store ID is required'),
  validate,
], addFavorite);
router.delete('/favorites/:storeId', authenticate, removeFavorite);

module.exports = router;
