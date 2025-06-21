const { Pool } = require('pg');
const { runMigrations } = require('./src/migrations/run.ts');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'profile_feedback',
});

async function migrate() {
  try {
    console.log('Starting database migration...');
    await runMigrations(pool);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate(); 