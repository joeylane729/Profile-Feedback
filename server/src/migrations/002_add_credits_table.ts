import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  // Create credits table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS credits (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      balance INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrate existing credit data from users table
  await pool.query(`
    INSERT INTO credits (user_id, balance, created_at, updated_at)
    SELECT id, credits, created_at, updated_at FROM users
  `);

  // Remove credits column from users table
  await pool.query(`
    ALTER TABLE users DROP COLUMN IF EXISTS credits;
  `);

  // Create index for credits table
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_credits_user_id ON credits(user_id);
  `);
}

export async function down(pool: Pool): Promise<void> {
  // Add credits column back to users table
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 0;
  `);

  // Migrate data back from credits table
  await pool.query(`
    UPDATE users 
    SET credits = c.balance 
    FROM credits c 
    WHERE users.id = c.user_id;
  `);

  // Drop credits table
  await pool.query(`
    DROP TABLE IF EXISTS credits;
  `);
} 