import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

// Import database connection configuration
import { connectDB } from './config/database.js';

// Import route modules
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';

// Import global error handling middleware
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables from .env file
dotenv.config();

/**
 * 4. Environment validation on startup:
 * Checks that MONGODB_URI, JWT_SECRET, and PORT are present.
 * If any are missing, logs which ones are missing and exits with process.exit(1).
 */
const checkRequiredEnvVars = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
  const missing = required.filter((envVar) => !process.env[envVar]);
  if (missing.length > 0) {
    console.error(`CRITICAL ERROR: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};

// Validate environment variables on startup
checkRequiredEnvVars();

// Initialize the Express application
const app = express();

// ==========================================
// Security & Request Logging Middleware
// ==========================================

// Use Helmet to set secure HTTP headers (protects against common vulnerabilities)
app.use(helmet());

// 2. MongoDB Injection Protection:
// Redefine req.query to be mutable for express-mongo-sanitize compatibility in Express v5
app.use((req, res, next) => {
  if (req.query) {
    Object.defineProperty(req, 'query', {
      value: { ...req.query },
      writable: true,
      configurable: true,
      enumerable: true
    });
  }
  next();
});
// Sanitizes req.body, req.query, and req.params to prevent MongoDB Operator Injection
app.use(mongoSanitize());

// 6. Request logging improvement:
// In production: use morgan('combined') format (more detail)
// In development: use morgan('dev') format (concise, colorized)
const NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// 1. Rate Limiting:
// General rate limit: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});

// Auth rate limit (stricter): 10 requests per 15 minutes for /api/auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many auth attempts.',
});

// Apply rate limiting middleware
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// 3. Update CORS for production:
const allowedOrigins = [process.env.FRONTEND_URL, 'https://your-app.vercel.app'];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Limit JSON request payloads to 10kb to prevent Denial of Service (DoS) attacks
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

// ==========================================
// Application Routes
// ==========================================

// Register route handlers
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date(),
  });
});

// ==========================================
// Error Handling Middleware
// ==========================================

// Global error handler (must be registered last)
app.use(errorHandler);

// ==========================================
// Server Initialization & Graceful Shutdown
// ==========================================

const PORT = process.env.PORT || 5000;

// Connect to DB and start the server
const startServer = async () => {
  try {
    // Establish Mongoose connection
    await connectDB();

    // Start Express listening
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
    });

    /**
     * 5. Graceful shutdown:
     * Handle process.SIGTERM and process.SIGINT signals.
     * On shutdown: close the MongoDB connection cleanly, log 'Server shutting down gracefully'
     */
    const handleGracefulShutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Server shutting down gracefully`);
      server.close(async () => {
        try {
          await mongoose.connection.close();
          console.log('MongoDB connection closed.');
          process.exit(0);
        } catch (error) {
          console.error(`Error closing MongoDB connection: ${error.message}`);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));

  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

