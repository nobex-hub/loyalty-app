const { processReceipt } = require('../services/receiptService');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError, ConflictError } = require('../utils/errors');

// POST /api/receipt/scan
const scanReceipt = asyncHandler(async (req, res) => {
  const { qrData } = req.body;

  if (!qrData) {
    throw new ValidationError('QR data is required');
  }

  try {
    const result = await processReceipt(qrData, req.user.id);

    res.status(201).json({
      message: 'Receipt scanned successfully',
      transaction: result.transaction,
      store: result.store,
      matchedProducts: result.matched,
      unmatchedProducts: result.unmatched,
      totalPointsEarned: result.totalPoints,
      tierMultiplier: result.tierMultiplier,
      tierBonusPoints: result.tierBonusPoints,
    });
  } catch (error) {
    if (error.message === 'DUPLICATE_RECEIPT') {
      throw new ConflictError('This receipt has already been scanned');
    }
    throw error;
  }
});

module.exports = { scanReceipt };
