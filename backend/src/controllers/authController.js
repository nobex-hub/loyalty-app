const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError, AuthenticationError, ConflictError } = require('../utils/errors');
const { createNotification } = require('../utils/notify');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    throw new ValidationError('Email, name, and password are required');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, name, password: hashedPassword },
  });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Send welcome notification
  createNotification(user.id, {
    title: 'Welcome to Loyalty Rewards!',
    message: `Hi ${name}! Start scanning receipts to earn points and unlock tier rewards.`,
    type: 'WELCOME',
  }).catch(() => {});

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      pointsBalance: user.pointsBalance,
      tier: user.tier,
      totalPointsEarned: user.totalPointsEarned,
    },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new AuthenticationError('Invalid email or password');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      pointsBalance: user.pointsBalance,
      tier: user.tier,
      totalPointsEarned: user.totalPointsEarned,
    },
  });
});

module.exports = { register, login };
