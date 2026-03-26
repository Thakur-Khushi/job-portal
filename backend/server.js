const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer'); // used by error handler for upload errors
const helmet = require('helmet');

dotenv.config();

const app = express();

// Security middleware: Set various HTTP headers (helmet)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:', 'http://localhost:5000', 'blob:'],
      },
    },
  }),
);

// HTTPS redirect middleware (trust proxy for Render, Vercel, Heroku)
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === 'production' &&
    req.header('x-forwarded-proto') !== 'https'
  ) {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// CORS Configuration
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
console.log('CORS allowed origin:', allowedOrigin);
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  }),
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads with proper CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal',
    );
    console.log('MongoDB connected successfully');
    console.log('Registered models:', mongoose.modelNames());
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/users', require('./routes/users'));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ msg: 'Route not found' });
});

// Error handling middleware (this needs 4 parameters)
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // Check if it's a multer error
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ msg: 'File too large. Max size is 5MB' });
    }
    return res.status(400).json({ msg: err.message });
  }

  res.status(500).json({
    msg: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
