const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addCredits() {
  try {
    // Add 50 credits to user ID 3 (Joey)
    const result = await pool.query(
      'UPDATE credits SET balance = balance + 50 WHERE user_id = 3 RETURNING *'
    );
    
    if (result.rows.length > 0) {
      console.log('Credits updated successfully:', result.rows[0]);
    } else {
      // If no credits record exists, create one
      const insertResult = await pool.query(
        'INSERT INTO credits (user_id, balance) VALUES (3, 50) RETURNING *'
      );
      console.log('Credits record created:', insertResult.rows[0]);
    }
  } catch (error) {
    console.error('Error adding credits:', error);
  } finally {
    await pool.end();
  }
}

addCredits(); 