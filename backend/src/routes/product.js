const express = require('express');
const { body } = require('express-validator');
const { getAllProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { authenticate, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', authenticate, getAllProducts);
router.get('/:id', authenticate, getProduct);

router.post('/', authenticate, isAdmin, [
  body('name').notEmpty().withMessage('Product name is required'),
  body('identifier').notEmpty().withMessage('Product identifier is required'),
  body('pointsValue').isInt({ min: 0 }).withMessage('Points value must be a positive number'),
  validate,
], createProduct);

router.put('/:id', authenticate, isAdmin, updateProduct);
router.delete('/:id', authenticate, isAdmin, deleteProduct);

module.exports = router;
