import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/sami_cafe';
const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

export const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000, // Never hang infinitely: timeout after 10s
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err?.message || err);
});

export const query = (text, params) => pool.query(text, params);

export default { pool, query };
