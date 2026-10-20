import { Server } from 'socket.io';

let ioInstance = null;

export const initSocket = (server, corsOrigin = '*') => {
  ioInstance = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow mobile apps, curl, or server-to-server with no origin
        if (!origin) return callback(null, true);
        if (
          corsOrigin === '*' ||
          origin === corsOrigin ||
          origin.endsWith('.vercel.app') ||
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:')
        ) {
          return callback(null, true);
        }
        return callback(null, true); // Dev & flexible production fallback
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true
    }
  });

  ioInstance.on('connection', (socket) => {
    // console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room based on user role or custom room
    socket.on('join', (room) => {
      socket.join(room);
    });

    socket.on('leave', (room) => {
      socket.leave(room);
    });

    socket.on('disconnect', () => {
      // console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

export const getIO = () => {
  return ioInstance;
};

// Real-time helper emitters
export const emitNewOrder = (order) => {
  if (ioInstance) {
    ioInstance.emit('order:new', order);
  }
};

export const emitOrderStatus = (order) => {
  if (ioInstance) {
    ioInstance.emit('order:status', order);
    ioInstance.to(`order_${order.id}`).emit('order:status', order);
  }
};

export const emitTableUpdate = (table) => {
  if (ioInstance) {
    ioInstance.emit('table:update', table);
  }
};

export const emitLowStock = (ingredient) => {
  if (ioInstance) {
    ioInstance.emit('stock:low', ingredient);
  }
};
