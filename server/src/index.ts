import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import profileRoutes from './routes/profile';
import testRoutes from './routes/test';
import creditRoutes from './routes/credit';
import authRoutes from './routes/auth';
import feedbackRoutes from './routes/feedback';
import { authenticate } from './middleware/auth';
import sequelize from './utils/db';

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const host = process.env.SERVER_HOST || '0.0.0.0';
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:8081';

// Add request logging middleware FIRST
app.use((req, res, next) => {
  console.log('\n=== NEW REQUEST ===');
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Accept:', req.headers.accept);
  console.log('Body length:', req.headers['content-length'] || '0');
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  console.log('==================\n');
  next();
});

// CORS configuration
const corsOptions = {
  origin: clientOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test endpoint
app.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'Server is working!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/test', testRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/feedback', feedbackRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  try {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Server is accessible at http://${host === '0.0.0.0' ? 'YOUR_LOCAL_IP' : host}:${PORT}`);
    
    // Test database connection
    await sequelize.authenticate();
    console.log('Successfully connected to PostgreSQL');

    // Check if users table exists
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `) as [{ exists: boolean }][];
    
    if (results[0].exists) {
      console.log('Users table is ready');
    } else {
      console.log('Users table not found');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}); 