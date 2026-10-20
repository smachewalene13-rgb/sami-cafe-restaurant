import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

let connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/sami_cafe';

// Auto-fix: If user provided the Render Internal URL (dpg-xxxx-a) but backend is in Frankfurt,
// convert it to the External hostname so cross-region networking connects successfully.
if (connectionString.includes('dpg-') && !connectionString.includes('.render.com')) {
  connectionString = connectionString.replace(/@(dpg-[^:/]+)/, (match, host) => {
    return `@${host}.oregon-postgres.render.com`;
  });
}

const isLocal =
  connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

export const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err?.message || err);
});

export const query = (text, params) => pool.query(text, params);

export default { pool, query };
