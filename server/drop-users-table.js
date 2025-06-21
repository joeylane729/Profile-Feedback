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

async function dropUsersTable() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    await sequelize.query('DROP TABLE IF EXISTS users CASCADE;');
    console.log('Dropped users table.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

dropUsersTable(); 