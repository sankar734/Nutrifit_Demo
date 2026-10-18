const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

// @desc Get my notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30);
  return success(res, 'Notifications fetched', { notifications });
});

// @desc Mark a single notification as read
const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
  return success(res, 'Notification marked as read');
});

// @desc Mark all notifications as read
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  return success(res, 'All notifications marked as read');
});

// Helper used internally by other controllers to create + push a notification in real time
const createNotification = async (io, { userId, title, body, type = 'system', data = {} }) => {
  const notification = await Notification.create({ user: userId, title, body, type, data });
  if (io) io.to(`user_${userId}`).emit('notification', notification);
  return notification;
};

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification };
