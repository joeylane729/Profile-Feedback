const { Sequelize } = require('sequelize');

// Database configuration
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'profile_feedback',
  logging: false
});

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // First check what columns exist
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n=== USERS TABLE COLUMNS ===');
    columns.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type}`);
    });
    console.log('===========================\n');
    
    // Now try to get users with whatever columns exist
    const [results] = await sequelize.query('SELECT * FROM users ORDER BY created_at DESC LIMIT 10');
    console.log('\n=== USERS IN DATABASE ===');
    console.log('Total users found:', results.length);
    
    if (results.length === 0) {
      console.log('No users found in database');
    } else {
      results.forEach((user, index) => {
        console.log(`${index + 1}. User data:`, user);
      });
    }
    console.log('========================\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkUsers(); 