// backend/src/server.ts

import http from 'http';
import app from './app';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { setSocketServer } from './utils/socket';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const PORT = Number(process.env.PORT || 5000);
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

setSocketServer(io);

io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  socket.on('join-user', (userId: string) => {
    if (userId) {
      socket.join(`user-${userId}`);
      console.log(`⚡ Socket ${socket.id} joined room user-${userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`⚡ Socket disconnected: ${socket.id}`);
  });
});

/**
 * Start the server
 */
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = (signal: string) => {
  console.log(`\n📡 ${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('🛑 HTTP server closed.');
    // Close database connections if needed
    // mongoose.connection.close(false, () => { ... });
    console.log('👋 Process terminated.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if not closed
  setTimeout(() => {
    console.error('⏰ Force shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally, you might want to exit or log to a service
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Graceful shutdown after logging
  gracefulShutdown('uncaughtException');
});

export default server;