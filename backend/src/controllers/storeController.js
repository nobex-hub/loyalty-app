const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ConflictError } = require('../utils/errors');

// GET /api/stores
const getAllStores = asyncHandler(async (req, res) => {
  const stores = await prisma.store.findMany({ orderBy: { name: 'asc' } });
  res.json(stores);
});

// POST /api/stores (Admin only)
const createStore = asyncHandler(async (req, res) => {
  const { name, location, fiscalId } = req.body;

  const existing = await prisma.store.findUnique({ where: { fiscalId } });
  if (existing) {
    throw new ConflictError('Store with this fiscal ID already exists');
  }

  const store = await prisma.store.create({
    data: { name, location, fiscalId },
  });

  res.status(201).json({ message: 'Store created', store });
});

// GET /api/stores/favorites
const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await prisma.favoriteStore.findMany({
    where: { userId: req.user.id },
    include: { store: true },
  });

  res.json(favorites.map(f => f.store));
});

// POST /api/stores/favorites
const addFavorite = asyncHandler(async (req, res) => {
  const { storeId } = req.body;

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new NotFoundError('Store');

  const existing = await prisma.favoriteStore.findUnique({
    where: { userId_storeId: { userId: req.user.id, storeId } },
  });
  if (existing) {
    throw new ConflictError('Store already in favorites');
  }

  await prisma.favoriteStore.create({
    data: { userId: req.user.id, storeId },
  });

  res.status(201).json({ message: 'Store added to favorites' });
});

// DELETE /api/stores/favorites/:storeId
const removeFavorite = asyncHandler(async (req, res) => {
  await prisma.favoriteStore.delete({
    where: {
      userId_storeId: {
        userId: req.user.id,
        storeId: req.params.storeId,
      },
    },
  });

  res.json({ message: 'Store removed from favorites' });
});

module.exports = { getAllStores, createStore, getFavorites, addFavorite, removeFavorite };
