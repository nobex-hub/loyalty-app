const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { AppError } = require('./utils/errors');

dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const storeRoutes = require('./routes/store');
const pointsRoutes = require('./routes/points');
const reviewRoutes = require('./routes/review');
const receiptRoutes = require('./routes/receipt');
const analyticsRoutes = require('./routes/analytics');
const webshopRoutes = require('./routes/webshop');
const notificationRoutes = require('./routes/notification');
const pushRoutes = require('./routes/push');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Loyalty App API is running',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      user: '/api/user',
      products: '/api/products',
      stores: '/api/stores',
      points: '/api/points',
      review: '/api/review',
      receipt: '/api/receipt',
      admin: '/api/admin',
      notifications: '/api/notifications',
      push: '/api/push',
    },
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/receipt', receiptRoutes);
app.use('/api/admin', analyticsRoutes);
app.use('/api/webshop', webshopRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/push', pushRoutes);

// Global error handler
app.use((err, req, res, next) => {
  // Handle known operational errors
  if (err instanceof AppError) {
    console.error(`[${err.code}] ${err.message}`);
    const response = { error: err.message, code: err.code };
    if (err.details) response.details = err.details;
    return res.status(err.statusCode).json(response);
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    console.error(`[PRISMA] Unique constraint violation on ${field}`);
    return res.status(409).json({
      error: `A record with this ${field} already exists`,
      code: 'CONFLICT',
    });
  }

  if (err.code === 'P2025') {
    console.error('[PRISMA] Record not found');
    return res.status(404).json({
      error: 'Record not found',
      code: 'NOT_FOUND',
    });
  }

  // Handle JSON parse errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON in request body',
      code: 'INVALID_JSON',
    });
  }

  // Unknown errors
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', code: 'ROUTE_NOT_FOUND' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('  POST /api/auth/register');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/user/profile');
  console.log('  GET  /api/products');
  console.log('  GET  /api/stores');
  console.log('  GET  /api/points/get');
  console.log('  POST /api/receipt/scan');
  console.log('  POST /api/review/request');
  console.log('  GET  /api/admin/stats');
  console.log('  GET  /api/notifications');
  console.log('  POST /api/push/subscribe');
});
