import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';
import { runMigrations, rollbackMigrations } from './migrations/run';

console.log('Running migration with config:', {
  connectionString: process.env.DATABASE_URL,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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