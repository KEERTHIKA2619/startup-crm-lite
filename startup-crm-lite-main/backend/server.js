/**
 * @file server.js
 * @description Express application entry point for Startup CRM Lite.
 *
 * Security measures applied (in registration order):
 *   1.  Environment variable validation — fail-fast before any I/O
 *   2.  Helmet            — sets 15+ secure HTTP response headers
 *   3.  Morgan            — request logging (combined in prod, dev in dev)
 *   4.  CORS             — strict allowlist, credentials enabled
 *   5.  General rate limiter  — 100 req / 15 min per IP across all /api/* routes
 *   6.  Auth rate limiter     — 10 req / 15 min per IP on /api/auth/* (brute-force guard)
 *   7.  Body parsers     — JSON + URL-encoded, 10 kb payload cap
 *   8.  mongoSanitize    — strips $ and . from req.body/query/params (NoSQL injection guard)
 *   9.  Application routes
 *  10.  Global error handler
 *
 * Graceful shutdown:
 *   SIGTERM / SIGINT → close HTTP server → close MongoDB connection → exit(0)
 */

import express   from 'express';
import helmet    from 'helmet';
import morgan    from 'morgan';
import cors      from 'cors';
import dotenv    from 'dotenv';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

// Local modules
import connectDB    from './config/database.js';
import authRoutes   from './routes/authRoutes.js';
import leadRoutes   from './routes/leadRoutes.js';
import errorHandler from './middleware/errorHandler.js';

// ─── 0. Load environment variables ────────────────────────────────────────────
// Must run before any process.env access below.
dotenv.config();

// ─── 1. Environment variable validation ───────────────────────────────────────
/**
 * Checks that every variable in `required` exists in process.env.
 * Logs all missing keys in one shot and exits immediately so the developer
 * knows exactly what is misconfigured instead of getting a cryptic runtime crash.
 *
 * @param {string[]} required - Array of env var names that must be set.
 * @returns {void} — Exits with code 1 if any variable is absent.
 */
const checkRequiredEnvVars = (required) => {
  const missing = required.filter(
    (key) => !process.env[key] || process.env[key].trim() === ''
  );

  if (missing.length > 0) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('FATAL: Missing required environment variables:');
    missing.forEach((key) => console.error(`  ✗  ${key}`));
    console.error('Set them in your .env file or deployment environment.');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }
};

// Fail-fast — run before Express or MongoDB are initialised
checkRequiredEnvVars(['MONGODB_URI', 'JWT_SECRET', 'PORT']);

// ─── 2. Express application ───────────────────────────────────────────────────
const app  = express();
const PORT = parseInt(process.env.PORT, 10) || 5000;
const MODE = process.env.NODE_ENV || 'development';
const isProd = MODE === 'production';

// ─── 3. Helmet — secure HTTP headers ──────────────────────────────────────────
// Sets X-Content-Type-Options, X-Frame-Options, HSTS, CSP, and more.
app.use(helmet());

// ─── 4. Request logging ────────────────────────────────────────────────────────
// 'combined' is Apache-style and captures IP, user-agent, referrer — ideal for
// prod log aggregators (Datadog, Papertrail, etc.).
// 'dev'      is concise, colorized — ideal for local development.
if (MODE !== 'test') {
  app.use(morgan(isProd ? 'combined' : 'dev'));
}

// ─── 5. CORS — strict allowlist with production domains ───────────────────────
/**
 * Allowed origins allowlist.
 *
 * FRONTEND_URL    — injected at deployment (Vercel / Render / Railway preview URL).
 * Hardcoded URLs  — permanent production domains that are always permitted.
 *
 * Requests without an Origin header (server-to-server, curl, Postman) are
 * allowed unconditionally so the health-check and internal tools still work.
 */
const allowedOrigins = [
  process.env.FRONTEND_URL,           // e.g. http://localhost:5173 (dev) or Vercel URL (prod)
  'https://your-app.vercel.app',      // ← replace with your actual Vercel domain before deploying
].filter(Boolean);                     // strip undefined/empty if FRONTEND_URL not set

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no Origin (non-browser clients, health checks)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error(`CORS: Origin "${origin}" is not allowed.`));
  },
  credentials: true,   // Allow cookies / Authorization headers cross-origin
  optionsSuccessStatus: 200  // Older browsers (IE11) choke on 204
};

app.use(cors(corsOptions));

// ─── 6. Rate limiters ─────────────────────────────────────────────────────────

/**
 * generalLimiter — blanket protection for all /api/* routes.
 * 100 requests per 15 minutes per IP.
 * Prevents scraping and DDoS amplification without blocking legitimate usage.
 */
const generalLimiter = rateLimit({
  windowMs:          15 * 60 * 1000,   // 15 minutes
  max:               100,
  standardHeaders:   true,             // Return RateLimit-* headers (RFC 6585)
  legacyHeaders:     false,            // Disable X-RateLimit-* legacy headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

/**
 * authLimiter — stricter limit applied only to /api/auth/* routes.
 * 10 requests per 15 minutes per IP.
 * Prevents brute-force password and token attacks.
 */
const authLimiter = rateLimit({
  windowMs:          15 * 60 * 1000,   // 15 minutes
  max:               10,
  standardHeaders:   true,
  legacyHeaders:     false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  }
});

// Apply general limiter to all /api/* routes
app.use('/api/', generalLimiter);

// Apply stricter limiter to auth routes only.
// NOTE: authLimiter is registered after generalLimiter so auth requests
// consume from BOTH buckets (correct layered behaviour).
app.use('/api/auth/', authLimiter);

// ─── 7. Body parsing ──────────────────────────────────────────────────────────
// 10 kb payload cap prevents large-body DoS attacks on JSON endpoints.
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── 8. MongoDB injection sanitization ───────────────────────────────────────
/**
 * express-mongo-sanitize strips keys that start with `$` or contain `.`
 * from req.body, req.query, and req.params before they reach controllers.
 * This prevents NoSQL injection attacks like { "$gt": "" } in query fields.
 *
 * Must run AFTER body parsers so the parsed body is available to sanitize.
 */
// Redefine req.query to be writable in Express 5 before mongoSanitize runs
app.use((req, res, next) => {
  if (req.query) {
    Object.defineProperty(req, 'query', {
      value: { ...req.query },
      writable: true,
      enumerable: true,
      configurable: true
    });
  }
  next();
});

app.use(mongoSanitize({
  replaceWith: '_',     // Replace forbidden chars with _ instead of removing the key entirely
                        // so validation errors are still triggered downstream
  allowDots:   false,   // Disallow dot-notation keys in body/query
  onSanitize: ({ req, key }) => {
    // Log sanitization events in development to aid debugging
    if (!isProd) {
      console.warn(`[mongoSanitize] Sanitized key "${key}" in request from ${req.ip}`);
    }
  }
}));

// ─── 9. Health check ──────────────────────────────────────────────────────────
/**
 * GET /api/health
 * Public endpoint used by load balancers, uptime monitors, and deployment
 * pipelines to verify the service is up and responding.
 * Not rate-limited individually (covered by generalLimiter).
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status:    'OK',
    env:       MODE,
    timestamp: new Date().toISOString()
  });
});

// ─── 10. Application routes ───────────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/leads', leadRoutes);

// ─── 11. Global error handler (must be last) ──────────────────────────────────
app.use(errorHandler);

// ─── 12. Server startup + graceful shutdown ───────────────────────────────────
/**
 * Starts the Express HTTP server after a successful MongoDB connection.
 * Returns the http.Server instance so shutdown handlers can close it cleanly.
 *
 * @async
 * @returns {Promise<import('http').Server>}
 */
const startServer = async () => {
  // Connect to MongoDB Atlas — will exit(1) on failure (handled inside connectDB)
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  🚀  Server running on port ${PORT} [${MODE}]`);
    console.log(`  🔒  Rate limits: 100 req/15 min (global) | 10 req/15 min (auth)`);
    console.log(`  🌐  CORS origins: ${allowedOrigins.join(', ')}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });

  return server;
};

/**
 * Graceful shutdown handler.
 *
 * On SIGTERM (sent by PaaS platforms like Heroku/Render when stopping a dyno)
 * or SIGINT (Ctrl-C in a terminal), we:
 *   1. Stop accepting new HTTP connections.
 *   2. Wait for in-flight requests to complete (server.close callback).
 *   3. Close the MongoDB connection cleanly.
 *   4. Exit with code 0.
 *
 * Without this, abrupt process termination can leave:
 *   - Incomplete writes / dangling transactions in MongoDB.
 *   - Active client sockets in a half-open state.
 *
 * @param {import('http').Server} server - The running Express HTTP server.
 * @param {string} signal - The signal name that triggered the shutdown.
 */
const setupGracefulShutdown = (server, signal) => {
  process.on(signal, async () => {
    console.log(`\n[${signal}] Server shutting down gracefully…`);

    // Stop accepting new connections; wait for in-flight requests to finish
    server.close(async () => {
      try {
        const mongoose = (await import('mongoose')).default;
        await mongoose.connection.close(false); // false = don't force-close cursors
        console.log('MongoDB connection closed cleanly.');
      } catch (err) {
        console.error('Error closing MongoDB connection:', err.message);
      } finally {
        console.log('Shutdown complete. Goodbye. 👋');
        process.exit(0);
      }
    });

    // Safety net: force-kill if requests don't drain within 10 seconds
    setTimeout(() => {
      console.error('Graceful shutdown timed out — forcing exit.');
      process.exit(1);
    }, 10_000);
  });
};

// Bootstrap
startServer().then((server) => {
  setupGracefulShutdown(server, 'SIGTERM');
  setupGracefulShutdown(server, 'SIGINT');
}).catch((err) => {
  console.error('Fatal startup error:', err.message);
  process.exit(1);
});
