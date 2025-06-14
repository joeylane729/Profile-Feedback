import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Create a migrations table to track which migrations have been run
async function createMigrationsTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Get all migration files
function getMigrationFiles(): string[] {
  const migrationsDir = path.join(__dirname);
  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.ts') && file !== 'run.ts')
    .sort();
}

// Get executed migrations
async function getExecutedMigrations(pool: Pool): Promise<string[]> {
  const result = await pool.query('SELECT name FROM migrations ORDER BY id');
  return result.rows.map(row => row.name);
}

// Run a single migration
async function runMigration(pool: Pool, migrationFile: string): Promise<void> {
  const migration = require(path.join(__dirname, migrationFile));
  
  try {
    await pool.query('BEGIN');
    await migration.up(pool);
    await pool.query('INSERT INTO migrations (name) VALUES ($1)', [migrationFile]);
    await pool.query('COMMIT');
    console.log(`✅ Executed migration: ${migrationFile}`);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(`❌ Failed to execute migration ${migrationFile}:`, error);
    throw error;
  }
}

// Rollback a single migration
async function rollbackMigration(pool: Pool, migrationFile: string): Promise<void> {
  const migration = require(path.join(__dirname, migrationFile));
  
  try {
    await pool.query('BEGIN');
    await migration.down(pool);
    await pool.query('DELETE FROM migrations WHERE name = $1', [migrationFile]);
    await pool.query('COMMIT');
    console.log(`✅ Rolled back migration: ${migrationFile}`);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(`❌ Failed to rollback migration ${migrationFile}:`, error);
    throw error;
  }
}

// Main function to run migrations
export async function runMigrations(pool: Pool): Promise<void> {
  try {
    await createMigrationsTable(pool);
    const migrationFiles = getMigrationFiles();
    const executedMigrations = await getExecutedMigrations(pool);
    
    for (const file of migrationFiles) {
      if (!executedMigrations.includes(file)) {
        await runMigration(pool, file);
      }
    }
    
    console.log('✨ All migrations completed successfully');
  } catch (error) {
    console.error('Failed to run migrations:', error);
    throw error;
  }
}

// Main function to rollback migrations
export async function rollbackMigrations(pool: Pool, steps: number = 1): Promise<void> {
  try {
    const executedMigrations = await getExecutedMigrations(pool);
    const migrationsToRollback = executedMigrations.slice(-steps);
    
    for (const file of migrationsToRollback.reverse()) {
      await rollbackMigration(pool, file);
    }
    
    console.log('✨ Rollback completed successfully');
  } catch (error) {
    console.error('Failed to rollback migrations:', error);
    throw error;
  }
} 