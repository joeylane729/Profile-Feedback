import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';
import { runMigrations, rollbackMigrations } from './migrations/run';

console.log('Running migration with config:', {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function main() {
  const command = process.argv[2];
  const steps = parseInt(process.argv[3] || '1');

  try {
    if (command === 'up') {
      await runMigrations(pool);
    } else if (command === 'down') {
      await rollbackMigrations(pool, steps);
    } else {
      console.error('Invalid command. Use "up" to run migrations or "down" to rollback.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main(); 