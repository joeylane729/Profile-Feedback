const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = 'xondam-dybwi3-raMbid';
  
  console.log('Testing password:', password);
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hashedPassword);
  
  // Test comparison
  const isValid = await bcrypt.compare(password, hashedPassword);
  console.log('Password comparison result:', isValid);
  
  // Test with the actual hash from database
  const dbHash = '$2b$10$i.P84MeD4d5Hk...'; // This is truncated, we need the full hash
  console.log('Database hash (truncated):', dbHash);
  
  // Let's get the full hash from database
  const { Pool } = require('pg');
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'profile_feedback',
  });
  
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT password FROM users WHERE email = $1', ['jophilane@gmail.com']);
    client.release();
    
    if (result.rows.length > 0) {
      const fullHash = result.rows[0].password;
      console.log('Full database hash:', fullHash);
      
      const dbComparison = await bcrypt.compare(password, fullHash);
      console.log('Database password comparison result:', dbComparison);
    }
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
  }
}

testPassword(); 