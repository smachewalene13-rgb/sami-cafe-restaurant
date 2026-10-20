import http from 'http';
import 'dotenv/config';
import app from './app.js';
import { initSocket } from './sockets/index.js';
import { pool } from './config/db.js';
import { startLowStockCronJob } from './jobs/lowStockCheck.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server, process.env.CLIENT_URL || 'http://localhost:5173');

// Start background cron jobs
startLowStockCronJob();

// Verify Database Connection and start server
async function startServer() {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ WARNING: DATABASE_URL is not set! Using default local PostgreSQL URL.');
    } else {
      const masked = process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@');
      console.log(`[DB Info] Attempting connection with: ${masked}`);
    }

    const res = await pool.query('SELECT NOW() as current_time, current_database() as db');
    console.log(`[DB Connected] Connected to PostgreSQL '${res.rows[0].db}' at ${res.rows[0].current_time}`);

    server.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`🚀 Sami Cafe & Restaurant Server running on port ${PORT}`);
      console.log(`📡 REST API endpoint: http://localhost:${PORT}/api/v1`);
      console.log(`⚡ Socket.IO listening for live updates`);
      console.log(`===================================================`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL database:', err?.message || err);
    if (!process.env.DATABASE_URL) {
      console.error('👉 TIP: Please set the DATABASE_URL environment variable in your Render service settings!');
    }
    process.exit(1);
  }
}

startServer();
