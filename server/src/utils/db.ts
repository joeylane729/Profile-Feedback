import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false, // Set to console.log to see SQL queries
  define: {
    timestamps: true,
    underscored: true,
  },
});

// Test connection
sequelize.authenticate().then(() => {
  console.log('Successfully connected to PostgreSQL');
}).catch((err) => {
  console.error('Error connecting to PostgreSQL:', err);
  process.exit(1);
});

// Run migrations
const runMigrations = async () => {
  try {
    // Create users table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        google_id VARCHAR(255) UNIQUE,
        profile_picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Users table is ready');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
};

runMigrations();

export default sequelize; 