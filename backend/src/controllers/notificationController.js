const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../utils/errors');

const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId: req.user.id } }),
  ]);

  res.json({ notifications, total, page, totalPages: Math.ceil(total / limit) });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await prisma.notification.count({
    where: { userId: req.user.id, read: false },
  });
  res.json({ unreadCount: count });
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await prisma.notification.findFirst({
    where: { id, userId: req.user.id },
  });

  if (!notification) throw new NotFoundError('Notification');

  await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  res.json({ message: 'Notification marked as read' });
});

const markAllRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, read: false },
    data: { read: true },
  });

  res.json({ message: 'All notifications marked as read' });
});

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllRead };
