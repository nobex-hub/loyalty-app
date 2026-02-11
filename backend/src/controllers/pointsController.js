const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ValidationError } = require('../utils/errors');

// GET /api/points/get - Get user points balance
const getBalance = asyncHandler(async (req, res) => {
  const userId = req.query.userId || req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, pointsBalance: true, totalPointsEarned: true, tier: true },
  });

  if (!user) throw new NotFoundError('User');

  res.json({
    userId: user.id,
    pointsBalance: user.pointsBalance,
    totalPointsEarned: user.totalPointsEarned,
    tier: user.tier,
  });
});

// POST /api/points/add - Add points from receipt scan
const addPoints = asyncHandler(async (req, res) => {
  const { userId, points } = req.body;
  const targetUserId = userId || req.user.id;

  const user = await prisma.user.update({
    where: { id: targetUserId },
    data: { pointsBalance: { increment: parseInt(points) } },
    select: { id: true, pointsBalance: true },
  });

  res.json({
    message: `${points} points added`,
    userId: user.id,
    newBalance: user.pointsBalance,
  });
});

// POST /api/points/use - Deduct points (webshop purchase)
const usePoints = asyncHandler(async (req, res) => {
  const { userId, points } = req.body;
  const targetUserId = userId || req.user.id;
  const pointsToUse = parseInt(points);

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, pointsBalance: true },
  });

  if (!user) throw new NotFoundError('User');

  if (user.pointsBalance < pointsToUse) {
    throw new ValidationError('Insufficient points', {
      currentBalance: user.pointsBalance,
      requested: pointsToUse,
    });
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { pointsBalance: { decrement: pointsToUse } },
    select: { id: true, pointsBalance: true },
  });

  res.json({
    message: `${pointsToUse} points deducted`,
    userId: updated.id,
    newBalance: updated.pointsBalance,
  });
});

// GET /api/points/history - Get points transaction history
const getHistory = asyncHandler(async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.user.id },
    include: { store: { select: { name: true, location: true } } },
    orderBy: { scannedAt: 'desc' },
  });

  res.json(transactions);
});

module.exports = { getBalance, addPoints, usePoints, getHistory };
