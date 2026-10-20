import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import app from './app.js';
import { initSocket } from './sockets/index.js';
import { pool } from './config/db.js';
import { startLowStockCronJob } from './jobs/lowStockCheck.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server, process.env.CLIENT_URL || 'http://localhost:5173');

// Start background cron jobs
startLowStockCronJob();

// 1. Start HTTP Server immediately so cloud platforms (Render) bind the port instantly
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Sami Cafe & Restaurant Server running on port ${PORT}`);
  console.log(`📡 REST API endpoint: http://localhost:${PORT}/api/v1`);
  console.log(`⚡ Socket.IO listening for live updates`);
  console.log(`===================================================`);
});

// 2. Verify Database Connection asynchronously without blocking server startup
async function verifyDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ WARNING: DATABASE_URL is not set! Using default local PostgreSQL URL.');
    } else {
      const masked = process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@');
      console.log(`[DB Info] Attempting connection with: ${masked}`);
    }

    const res = await pool.query('SELECT NOW() as current_time, current_database() as db');
    console.log(`✅ [DB Connected] Connected to PostgreSQL '${res.rows[0].db}' at ${res.rows[0].current_time}`);

    // Auto-initialize schema & seed data if database is fresh
    try {
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'categories'
        ) as exists;
      `);

      if (!tableCheck.rows[0]?.exists) {
        console.log('🌱 Fresh database detected! Auto-running schema.sql & seed.sql...');
        const schemaPath = path.join(__dirname, 'db', 'schema.sql');
        const seedPath = path.join(__dirname, 'db', 'seeds', 'seed.sql');

        if (fs.existsSync(schemaPath)) {
          await pool.query(fs.readFileSync(schemaPath, 'utf-8'));
          console.log('✅ Auto-migration: Schema tables created successfully.');
        }

        if (fs.existsSync(seedPath)) {
          await pool.query(fs.readFileSync(seedPath, 'utf-8'));
          console.log('✅ Auto-seed: Default menu items & categories populated successfully.');
        }
      }
    } catch (autoInitErr) {
      console.warn('⚠️ Auto-init check note:', autoInitErr.message);
    }
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL database:', err?.message || err);
    if (!process.env.DATABASE_URL) {
      console.error('👉 TIP: Please set the DATABASE_URL environment variable in your Render service settings!');
    }
  }
}

verifyDatabase();
