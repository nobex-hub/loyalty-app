const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/admin/stats - Dashboard overview
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalTransactions,
    totalProducts,
    pendingReviews,
    totalPointsIssued,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.count(),
    prisma.product.count(),
    prisma.reviewRequest.count({ where: { status: 'PENDING' } }),
    prisma.transaction.aggregate({ _sum: { totalPoints: true } }),
  ]);

  res.json({
    totalUsers,
    totalTransactions,
    totalProducts,
    pendingReviews,
    totalPointsIssued: totalPointsIssued._sum.totalPoints || 0,
  });
});

// GET /api/admin/stats/stores - Most successful stores
const getStoreStats = asyncHandler(async (req, res) => {
  const stores = await prisma.store.findMany({
    include: {
      transactions: {
        select: { totalPoints: true, scannedAt: true },
      },
      favoritedBy: { select: { id: true } },
    },
  });

  const storeStats = stores.map(store => ({
    id: store.id,
    name: store.name,
    location: store.location,
    totalScans: store.transactions.length,
    totalPointsGenerated: store.transactions.reduce((sum, t) => sum + t.totalPoints, 0),
    favoriteCount: store.favoritedBy.length,
    lastScan: store.transactions.length > 0
      ? store.transactions.sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt))[0].scannedAt
      : null,
  }));

  storeStats.sort((a, b) => b.totalScans - a.totalScans);

  res.json(storeStats);
});

// GET /api/admin/stats/products - Most scanned products
const getProductStats = asyncHandler(async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    select: { items: true },
  });

  const productCounts = {};
  transactions.forEach(t => {
    const items = t.items;
    if (items.matched) {
      items.matched.forEach(item => {
        const key = item.productName || item.name;
        if (!productCounts[key]) {
          productCounts[key] = { name: key, scanCount: 0, totalPoints: 0 };
        }
        productCounts[key].scanCount++;
        productCounts[key].totalPoints += item.totalPoints || 0;
      });
    }
  });

  const stats = Object.values(productCounts).sort((a, b) => b.scanCount - a.scanCount);

  res.json(stats);
});

// GET /api/admin/stats/users - User activity trends
const getUserStats = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      pointsBalance: true,
      totalPointsEarned: true,
      tier: true,
      createdAt: true,
      transactions: {
        select: { totalPoints: true, scannedAt: true },
        orderBy: { scannedAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const userStats = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    pointsBalance: user.pointsBalance,
    totalPointsEarned: user.totalPointsEarned,
    tier: user.tier,
    totalScans: user.transactions.length,
    lastActivity: user.transactions[0]?.scannedAt || user.createdAt,
    joinedAt: user.createdAt,
  }));

  res.json(userStats);
});

// GET /api/admin/stats/unknown-products - Frequency of unknown products
const getUnknownProductStats = asyncHandler(async (req, res) => {
  const reviews = await prisma.reviewRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      submittedBy: { select: { name: true } },
    },
  });

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'PENDING').length,
    approved: reviews.filter(r => r.status === 'APPROVED').length,
    rejected: reviews.filter(r => r.status === 'REJECTED').length,
    recent: reviews.slice(0, 20),
  };

  res.json(stats);
});

module.exports = {
  getDashboardStats,
  getStoreStats,
  getProductStats,
  getUserStats,
  getUnknownProductStats,
};
