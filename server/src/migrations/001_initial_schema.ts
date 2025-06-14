import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  // Create users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      google_id VARCHAR(255) UNIQUE,
      credits INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  // Create profiles table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      bio TEXT,
      status VARCHAR(20) CHECK (status IN ('not_tested', 'testing', 'complete')),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id)
    );
  `);

  // Create photos table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS photos (
      id SERIAL PRIMARY KEY,
      profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
      url VARCHAR(255) NOT NULL,
      order_index INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create prompts table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS prompts (
      id SERIAL PRIMARY KEY,
      profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create tests table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(20) CHECK (type IN ('full_profile', 'single_photo', 'single_prompt')),
      status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'complete')),
      cost INTEGER NOT NULL,
      started_at TIMESTAMP WITH TIME ZONE,
      completed_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create test_items table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS test_items (
      id SERIAL PRIMARY KEY,
      test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
      item_type VARCHAR(20) CHECK (item_type IN ('photo', 'prompt')),
      item_id INTEGER NOT NULL,
      original_item_id INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create ratings table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ratings (
      id SERIAL PRIMARY KEY,
      test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
      rater_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      item_type VARCHAR(20) CHECK (item_type IN ('photo', 'prompt', 'bio')),
      item_id INTEGER NOT NULL,
      rating INTEGER CHECK (rating IN (1, 2, 3, 4, 5)),
      feedback TEXT,
      is_anonymous BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create credit_transactions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS credit_transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      amount INTEGER NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'test', 'refund')),
      description VARCHAR(255) NOT NULL,
      reference_id INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  // Create indexes
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
    CREATE INDEX IF NOT EXISTS idx_photos_profile_id ON photos(profile_id);
    CREATE INDEX IF NOT EXISTS idx_prompts_profile_id ON prompts(profile_id);
    CREATE INDEX IF NOT EXISTS idx_tests_user_id ON tests(user_id);
    CREATE INDEX IF NOT EXISTS idx_tests_status ON tests(status);
    CREATE INDEX IF NOT EXISTS idx_test_items_test_id ON test_items(test_id);
    CREATE INDEX IF NOT EXISTS idx_ratings_test_id ON ratings(test_id);
    CREATE INDEX IF NOT EXISTS idx_ratings_rater_id ON ratings(rater_id);
    CREATE INDEX IF NOT EXISTS idx_ratings_item_type_item_id ON ratings(item_type, item_id);
    CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);
  `);
}

export async function down(pool: Pool): Promise<void> {
  // Drop tables in reverse order
  await pool.query(`
    DROP TABLE IF EXISTS credit_transactions;
    DROP TABLE IF EXISTS ratings;
    DROP TABLE IF EXISTS test_items;
    DROP TABLE IF EXISTS tests;
    DROP TABLE IF EXISTS prompts;
    DROP TABLE IF EXISTS photos;
    DROP TABLE IF EXISTS profiles;
    DROP TABLE IF EXISTS users;
  `);
} 