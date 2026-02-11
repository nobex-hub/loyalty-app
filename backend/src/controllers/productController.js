const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ConflictError } = require('../utils/errors');

// GET /api/products
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(products);
});

// GET /api/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) throw new NotFoundError('Product');
  res.json(product);
});

// POST /api/products (Admin only)
const createProduct = asyncHandler(async (req, res) => {
  const { name, identifier, pointsValue } = req.body;

  const existing = await prisma.product.findUnique({ where: { identifier } });
  if (existing) {
    throw new ConflictError('Product identifier already exists');
  }

  const product = await prisma.product.create({
    data: {
      name,
      identifier,
      pointsValue: parseInt(pointsValue) || 0,
      status: 'KNOWN',
    },
  });

  res.status(201).json({ message: 'Product created', product });
});

// PUT /api/products/:id (Admin only)
const updateProduct = asyncHandler(async (req, res) => {
  const { name, identifier, pointsValue, status } = req.body;

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      ...(name && { name }),
      ...(identifier && { identifier }),
      ...(pointsValue !== undefined && { pointsValue: parseInt(pointsValue) }),
      ...(status && { status }),
    },
  });

  res.json({ message: 'Product updated', product });
});

// DELETE /api/products/:id (Admin only)
const deleteProduct = asyncHandler(async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ message: 'Product deleted' });
});

module.exports = { getAllProducts, getProduct, createProduct, updateProduct, deleteProduct };
