const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../utils/errors');
const { getTierProgress } = require('../utils/tiers');

// GET /api/user/profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      pointsBalance: true,
      totalPointsEarned: true,
      tier: true,
      createdAt: true,
    },
  });

  if (!user) throw new NotFoundError('User');

  const tierProgress = getTierProgress(user.totalPointsEarned);
  res.json({ ...user, tierProgress });
});

// PUT /api/user/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      pointsBalance: true,
      totalPointsEarned: true,
      tier: true,
    },
  });

  res.json({ message: 'Profile updated', user });
});

module.exports = { getProfile, updateProfile };
