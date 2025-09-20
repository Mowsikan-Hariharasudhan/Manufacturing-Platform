const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const workCenterRoutes = require('./routes/workCenters');
const bomRoutes = require('./routes/bom');
const manufacturingOrderRoutes = require('./routes/manufacturingOrders');
const workOrderRoutes = require('./routes/workOrders');
const stockRoutes = require('./routes/stock');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',  // Create React App default
  'http://localhost:8080',  // Vite dev server
  'http://localhost:5173',  // Alternative Vite port
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'ManufactureFlow Backend',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/work-centers', workCenterRoutes);
app.use('/api/bom', bomRoutes);
app.use('/api/manufacturing-orders', manufacturingOrderRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/stock', stockRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'ManufactureFlow API v1.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      workCenters: '/api/work-centers',
      bom: '/api/bom',
      manufacturingOrders: '/api/manufacturing-orders',
      workOrders: '/api/work-orders',
      stock: '/api/stock'
    }
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(400).json({
          success: false,
          message: 'Duplicate entry found'
        });
      case '23503': // Foreign key violation
        return res.status(400).json({
          success: false,
          message: 'Referenced record not found'
        });
      case '23502': // Not null violation
        return res.status(400).json({
          success: false,
          message: 'Required field missing'
        });
      default:
        break;
    }
  }

  // Default error
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler - must be last
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `API endpoint ${req.originalUrl} not found` 
  });
});

module.exports = app;
