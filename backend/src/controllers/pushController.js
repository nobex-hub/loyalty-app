const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError } = require('../utils/errors');

const subscribe = asyncHandler(async (req, res) => {
  const { endpoint, keys } = req.body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    throw new ValidationError('Invalid push subscription data');
  }

  // Upsert: update if endpoint exists, create if not
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId: req.user.id, p256dh: keys.p256dh, auth: keys.auth },
    create: { userId: req.user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
  });

  res.status(201).json({ message: 'Push subscription registered' });
});

const unsubscribe = asyncHandler(async (req, res) => {
  const { endpoint } = req.body;

  if (!endpoint) {
    throw new ValidationError('Endpoint is required');
  }

  await prisma.pushSubscription.deleteMany({
    where: { endpoint, userId: req.user.id },
  });

  res.json({ message: 'Push subscription removed' });
});

const getVapidKey = asyncHandler(async (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || '' });
});

module.exports = { subscribe, unsubscribe, getVapidKey };
