const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { createNotification } = require('../utils/notify');
const { getTierMultiplier } = require('../utils/tiers');

// POST /api/review/request
const submitReview = asyncHandler(async (req, res) => {
  const { productName, productIdentifier } = req.body;

  if (!productName) {
    throw new ValidationError('Product name is required');
  }

  const existing = await prisma.reviewRequest.findFirst({
    where: { productIdentifier: productIdentifier || productName, status: 'PENDING' },
  });

  if (existing) {
    return res.json({ message: 'Review already requested for this product', review: existing });
  }

  const review = await prisma.reviewRequest.create({
    data: {
      productName,
      productIdentifier: productIdentifier || productName,
      submittedByUserId: req.user.id,
    },
  });

  res.status(201).json({ message: 'Review request submitted', review });
});

// GET /api/review/queue (admin)
const getQueue = asyncHandler(async (req, res) => {
  const reviews = await prisma.reviewRequest.findMany({
    where: { status: 'PENDING' },
    include: { submittedBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(reviews);
});

// GET /api/review/all (admin)
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await prisma.reviewRequest.findMany({
    include: { submittedBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(reviews);
});

// POST /api/review/:id/approve (admin)
const approveReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { pointsValue, adminNotes } = req.body;

  if (!pointsValue || pointsValue <= 0) {
    throw new ValidationError('Points value is required and must be positive');
  }

  const review = await prisma.reviewRequest.findUnique({ where: { id } });
  if (!review) throw new NotFoundError('Review');
  if (review.status !== 'PENDING') {
    throw new ValidationError('Review already processed');
  }

  const updatedReview = await prisma.reviewRequest.update({
    where: { id },
    data: { status: 'APPROVED', pointsValue: parseInt(pointsValue), adminNotes: adminNotes || null },
  });

  const product = await prisma.product.create({
    data: {
      name: review.productName,
      identifier: review.productIdentifier,
      pointsValue: parseInt(pointsValue),
      status: 'KNOWN',
    },
  });

  // Notify the submitter that their review was approved
  createNotification(review.submittedByUserId, {
    title: 'Product Approved!',
    message: `"${review.productName}" has been approved and is now worth ${pointsValue} points per item.`,
    type: 'REVIEW_APPROVED',
    data: { productId: product.id, pointsValue: parseInt(pointsValue) },
  }).catch(() => {});

  // RETROACTIVE POINTS: Find all transactions with this item in unmatched
  const allTransactions = await prisma.transaction.findMany({
    select: { id: true, userId: true, totalPoints: true, items: true },
  });

  let retroCount = 0;
  for (const txn of allTransactions) {
    const items = txn.items;
    if (!items || !items.unmatched) continue;

    const unmatchedItem = items.unmatched.find(u =>
      u.name && (
        u.name.toLowerCase() === review.productName.toLowerCase() ||
        u.name.toLowerCase() === review.productIdentifier.toLowerCase() ||
        u.name.toLowerCase().includes(review.productName.toLowerCase()) ||
        review.productName.toLowerCase().includes(u.name.toLowerCase())
      )
    );

    if (unmatchedItem) {
      const qty = unmatchedItem.quantity || 1;

      // Get user's tier for multiplier
      const txnUser = await prisma.user.findUnique({
        where: { id: txn.userId },
        select: { tier: true },
      });
      const multiplier = getTierMultiplier(txnUser?.tier || 'BRONZE');
      const earnedPoints = Math.round(parseInt(pointsValue) * qty * multiplier);

      const newUnmatched = items.unmatched.filter(u => u !== unmatchedItem);
      const newMatched = [...(items.matched || []), {
        ...unmatchedItem,
        productId: product.id,
        productName: product.name,
        pointsValue: parseInt(pointsValue),
        totalPoints: earnedPoints,
      }];

      await prisma.transaction.update({
        where: { id: txn.id },
        data: {
          totalPoints: txn.totalPoints + earnedPoints,
          items: { matched: newMatched, unmatched: newUnmatched },
        },
      });

      await prisma.user.update({
        where: { id: txn.userId },
        data: {
          pointsBalance: { increment: earnedPoints },
          totalPointsEarned: { increment: earnedPoints },
        },
      });

      // Notify user about retroactive points
      createNotification(txn.userId, {
        title: 'Retroactive Points Earned!',
        message: `You earned ${earnedPoints} points for "${review.productName}" from a previous receipt.`,
        type: 'POINTS_EARNED',
        data: { points: earnedPoints, productName: review.productName },
      }).catch(() => {});

      retroCount++;
      console.log(`Retroactive: +${earnedPoints} pts to user ${txn.userId} for "${review.productName}"`);
    }
  }

  res.json({
    message: `Product approved. ${retroCount > 0 ? `Retroactive points awarded to ${retroCount} transaction(s).` : ''}`,
    review: updatedReview,
    product,
    retroactiveUpdates: retroCount,
  });
});

// POST /api/review/:id/reject (admin)
const rejectReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { adminNotes } = req.body;

  const review = await prisma.reviewRequest.findUnique({ where: { id } });
  if (!review) throw new NotFoundError('Review');
  if (review.status !== 'PENDING') {
    throw new ValidationError('Review already processed');
  }

  const updatedReview = await prisma.reviewRequest.update({
    where: { id },
    data: { status: 'REJECTED', adminNotes: adminNotes || null },
  });

  // Notify the submitter that their review was rejected
  createNotification(review.submittedByUserId, {
    title: 'Product Review Update',
    message: `"${review.productName}" was not approved.${adminNotes ? ` Note: ${adminNotes}` : ''}`,
    type: 'REVIEW_REJECTED',
    data: { productName: review.productName, adminNotes },
  }).catch(() => {});

  res.json({ message: 'Review rejected', review: updatedReview });
});

module.exports = { submitReview, getQueue, getAllReviews, approveReview, rejectReview };
