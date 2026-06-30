/**
 * Thin Express app for testing — same routes as server.js
 * but WITHOUT mongoose.connect() or app.listen().
 * Tests connect/disconnect via mongodb-memory-server.
 */
const express = require('express');
const multer = require('multer');

// Bypass rate limiters so tests can make many requests freely
const noopMiddleware = (req, res, next) => next();
jest.mock('../middleware/rateLimiter', () => ({
  loginLimiter: (req, res, next) => next(),
  registerLimiter: (req, res, next) => next(),
  passwordResetLimiter: (req, res, next) => next(),
  generalLimiter: (req, res, next) => next(),
}));

// Set required env vars before routes load
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jest';
process.env.NODE_ENV = 'test';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('../routes/auth'));
app.use('/api/jobs', require('../routes/jobs'));
app.use('/api/applications', require('../routes/applications'));
app.use('/api/users', require('../routes/users'));

// 404 handler
app.use((req, res) => res.status(404).json({ msg: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ msg: err.message });
  }
  res.status(500).json({ msg: err.message || 'Something went wrong!' });
});

module.exports = app;
