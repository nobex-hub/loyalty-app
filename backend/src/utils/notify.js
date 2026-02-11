const prisma = require('./prisma');
const { sendPushToUser } = require('./pushService');

const createNotification = async (userId, { title, message, type, data = null }) => {
  const notification = await prisma.notification.create({
    data: { userId, title, message, type, data },
  });

  // Send push notification (non-blocking, don't fail if push fails)
  sendPushToUser(userId, { title, body: message, data: { type, notificationId: notification.id } })
    .catch((err) => console.error('Push notification failed:', err.message));

  return notification;
};

module.exports = { createNotification };
