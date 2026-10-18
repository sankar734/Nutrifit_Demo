const initSockets = (io) => {
  io.on('connection', (socket) => {
    // Customer/chef joins order-specific room to receive live status updates
    socket.on('join_order', (orderId) => {
      socket.join(`order_${orderId}`);
    });

    // Chef joins their own room to receive new order notifications
    socket.on('join_chef', (chefId) => {
      socket.join(`chef_${chefId}`);
    });

    // Delivery partners join a shared room to receive "order ready for pickup" notifications
    socket.on('join_delivery_pool', () => {
      socket.join('delivery_pool');
    });

    // Admin joins admin_room for real-time order tracking and stats
    socket.on('join_admin', () => {
      socket.join('admin_room');
    });

    // Every logged-in user joins their own room to receive personal real-time notifications
    socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
    });

    // Delivery partner broadcasts live GPS location
    socket.on('delivery_location_update', ({ orderId, lat, lng }) => {
      io.to(`order_${orderId}`).emit('delivery_location', { lat, lng });
    });

    socket.on('disconnect', () => {});
  });
};

module.exports = initSockets;
