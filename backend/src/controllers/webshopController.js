const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ValidationError } = require('../utils/errors');

// GET /api/webshop/points/:userId - Check user points balance
const checkPoints = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, pointsBalance: true },
  });

  if (!user) throw new NotFoundError('User');

  res.json({
    userId: user.id,
    name: user.name,
    email: user.email,
    pointsBalance: user.pointsBalance,
    webshop: req.webshop.name,
  });
});

// POST /api/webshop/points/use - Deduct points during purchase
const usePoints = asyncHandler(async (req, res) => {
  const { userId, points, orderId } = req.body;
  const pointsToUse = parseInt(points);

  if (!userId || !points || !orderId) {
    throw new ValidationError('userId, points, and orderId are required');
  }

  if (pointsToUse <= 0) {
    throw new ValidationError('Points must be a positive number');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
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
    where: { id: userId },
    data: { pointsBalance: { decrement: pointsToUse } },
    select: { id: true, pointsBalance: true },
  });

  console.log(`[Webshop: ${req.webshop.name}] Deducted ${pointsToUse} points from user ${userId} for order ${orderId}`);

  res.json({
    success: true,
    message: `${pointsToUse} points deducted`,
    userId: updated.id,
    previousBalance: user.pointsBalance,
    pointsUsed: pointsToUse,
    newBalance: updated.pointsBalance,
    orderId,
    webshop: req.webshop.name,
    timestamp: new Date().toISOString(),
  });
});

// POST /api/webshop/points/refund - Refund points (e.g., order cancelled)
const refundPoints = asyncHandler(async (req, res) => {
  const { userId, points, orderId, reason } = req.body;
  const pointsToRefund = parseInt(points);

  if (!userId || !points || !orderId) {
    throw new ValidationError('userId, points, and orderId are required');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User');

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { pointsBalance: { increment: pointsToRefund } },
    select: { id: true, pointsBalance: true },
  });

  console.log(`[Webshop: ${req.webshop.name}] Refunded ${pointsToRefund} points to user ${userId} for order ${orderId}`);

  res.json({
    success: true,
    message: `${pointsToRefund} points refunded`,
    userId: updated.id,
    pointsRefunded: pointsToRefund,
    newBalance: updated.pointsBalance,
    orderId,
    reason: reason || 'No reason provided',
    webshop: req.webshop.name,
    timestamp: new Date().toISOString(),
  });
});

module.exports = { checkPoints, usePoints, refundPoints };
