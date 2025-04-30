import pool from './utils/db';

async function dropTables() {
  try {
    await pool.query(`
      DROP TABLE IF EXISTS feedback;
      DROP TABLE IF EXISTS users;
    `);
    console.log('Tables dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error);
    process.exit(1);
  }
}

dropTables(); 