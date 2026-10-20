import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { limiter } from './middleware/rateLimiter.js';

const app = express();

// Trust reverse proxy (Render, Cloudflare, Vercel)
app.set('trust proxy', 1);

// Security headers with cross-origin resource policy for uploaded images
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS configuration - support development, configured client, and Vercel domains
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or postman)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback for all preview & production deployments
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Explicit preflight handler for all routes
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads directory
app.use('/uploads', express.static(path.resolve('uploads')));

// Root landing endpoint for backend API
app.get('/', (req, res) => {
  res.json({
    name: 'Sami Cafe and Restaurant API',
    status: 'online',
    version: '1.0.0',
    health: '/api/health',
    endpoints: {
      categories: '/api/v1/categories',
      menu: '/api/v1/menu',
      tables: '/api/v1/tables',
      orders: '/api/v1/orders',
      reservations: '/api/v1/reservations',
    },
    frontend: process.env.CLIENT_URL || 'https://sami-cafe-restaurant.vercel.app'
  });
});

// Health check endpoint with database status
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let menuCount = 0;
  let categoryCount = 0;

  try {
    const { pool } = await import('./config/db.js');
    await pool.query('SELECT 1');
    dbStatus = 'connected';

    const menuRes = await pool.query('SELECT count(*)::int as count FROM menu_items').catch(() => ({ rows: [{ count: 0 }] }));
    const catRes = await pool.query('SELECT count(*)::int as count FROM categories').catch(() => ({ rows: [{ count: 0 }] }));
    menuCount = menuRes.rows[0].count;
    categoryCount = catRes.rows[0].count;
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Sami Cafe and Restaurant API',
    database: dbStatus,
    dataSummary: {
      categories: categoryCount,
      menuItems: menuCount,
      seeded: menuCount > 0
    }
  });
});

// Mount API v1 routes with rate limiter
app.use('/api/v1', limiter, routes);

// Central error handler
app.use(errorHandler);

export default app;
