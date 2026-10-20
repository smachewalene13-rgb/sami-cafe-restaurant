import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const isProduction =
  process.env.NODE_ENV === 'production' ||
  (Boolean(process.env.DATABASE_URL) &&
    !process.env.DATABASE_URL.includes('localhost') &&
    !process.env.DATABASE_URL.includes('127.0.0.1'));

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/sami_cafe',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

export const query = (text, params) => pool.query(text, params);

export default { pool, query };
