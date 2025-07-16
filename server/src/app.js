const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const hpp = require('hpp');
const morgan = require('morgan');
const { xss } = require('express-xss-sanitizer');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter, authLimiter, uploadLimiter } = require('./middleware/rateLimiter');
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const blogRouter = require('./routes/blogRoutes');
const { fileRouter, repositoryRouter } = require('./routes/fileRoutes');
const newsRouter = require('./routes/newsRoutes');
const adminRouter = require('./routes/adminRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const chatbotRouter = require('./routes/chatbotRoutes');
const app = express();
const path = require('path');

// Trust proxy in production for secure cookies
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Enhanced Security headers
app.use(helmet());

// Prevent HTTP parameter pollution
app.use(hpp());

// Sanitize input against XSS
app.use(xss());

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_BASE_URL || "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174", // Added for Vite dev server
  "http://127.0.0.1:5174", // Added for Vite dev server
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:8080",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002"
];
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.error('CORS error: Origin not allowed:', origin);
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// Catch-all error handler for CORS errors
app.use((err, req, res, next) => {
  if (err instanceof Error && err.message.includes('CORS')) {
    console.error('CORS error (middleware):', err.message);
    res.status(401).json({ error: err.message });
  } else {
    next(err);
  }
});

// Apply rate limiting middleware
app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// Global middleware configuration
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression()); // Reduce response size
app.use(morgan('dev')); // Request logging

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Routes with specific rate limiting
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", authLimiter, adminRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/files", uploadLimiter, fileRouter);
app.use("/api/repository", uploadLimiter, repositoryRouter);
app.use("/api/news", newsRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/chatbot", chatbotRouter);

// Health check endpoints
app.get("/", (req, res) => {
  res.json({ 
    message: "RUNACOSS Server is running!", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint for frontend to check backend status
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;


