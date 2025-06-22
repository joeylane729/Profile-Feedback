import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  // First, create the new enum type
  await pool.query(`
    CREATE TYPE rating_value AS ENUM ('keep', 'neutral', 'delete');
  `);

  // Add the new column
  await pool.query(`
    ALTER TABLE ratings ADD COLUMN rating_value rating_value;
  `);

  // Convert existing numeric ratings to enum values
  await pool.query(`
    UPDATE ratings 
    SET rating_value = CASE 
      WHEN rating >= 4 THEN 'keep'::rating_value
      WHEN rating = 3 THEN 'neutral'::rating_value
      WHEN rating <= 2 THEN 'delete'::rating_value
    END;
  `);

  // Make the new column not null
  await pool.query(`
    ALTER TABLE ratings ALTER COLUMN rating_value SET NOT NULL;
  `);

  // Drop the old rating column
  await pool.query(`
    ALTER TABLE ratings DROP COLUMN rating;
  `);
}

export async function down(pool: Pool): Promise<void> {
  // Add back the old rating column
  await pool.query(`
    ALTER TABLE ratings ADD COLUMN rating INTEGER;
  `);

  // Convert enum values back to numeric ratings
  await pool.query(`
    UPDATE ratings 
    SET rating = CASE 
      WHEN rating_value = 'keep' THEN 4
      WHEN rating_value = 'neutral' THEN 3
      WHEN rating_value = 'delete' THEN 2
    END;
  `);

  // Make the rating column not null
  await pool.query(`
    ALTER TABLE ratings ALTER COLUMN rating SET NOT NULL;
  `);

  // Drop the new column
  await pool.query(`
    ALTER TABLE ratings DROP COLUMN rating_value;
  `);

  // Drop the enum type
  await pool.query(`
    DROP TYPE rating_value;
  `);
} 