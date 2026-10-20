import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runDatabaseSetup() {
  console.log('🚀 Starting Database Schema & Seed Runner...');
  const client = await pool.connect();

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const seedPath = path.join(__dirname, 'seeds', 'seed.sql');

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    console.log('📄 Executing schema.sql (tables, types, constraints)...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await client.query(schemaSql);
    console.log('✅ Schema migration completed successfully.');

    if (fs.existsSync(seedPath)) {
      console.log('🌱 Executing seed.sql (default users, categories, menu items, settings)...');
      const seedSql = fs.readFileSync(seedPath, 'utf-8');
      await client.query(seedSql);
      console.log('✅ Default seed data inserted successfully.');
    } else {
      console.warn('⚠️ No seed.sql found, skipping seed data.');
    }

    console.log('🎉 Database initialization complete!');
  } catch (err) {
    console.error('❌ Database migration/seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runDatabaseSetup();
