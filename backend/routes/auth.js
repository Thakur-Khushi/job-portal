const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const auth = require('../middleware/auth');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');

/**
 * Generate a new refresh token for a user
 * @param {string} userId - User ID
 * @returns {Promise<{token: string, expiresAt: Date}>}
 */
const generateRefreshToken = async (userId) => {
  try {
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    // Refresh token expires in 30 days
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const tokenDoc = new RefreshToken({
      userId,
      token: refreshTokenHash,
      expiresAt,
    });

    await tokenDoc.save();

    return {
      token: refreshToken,
      expiresAt,
    };
  } catch (err) {
    console.error('Error generating refresh token:', err);
    throw err;
  }
};

// Register user
router.post('/register', registerLimiter, async (req, res, next) => {
  try {
    let { name, email, password, role, company } = req.body;

    // Input validation & sanitization
    if (!name || !name.trim())
      return res.status(400).json({ msg: 'Name is required' });
    if (!email || !email.trim())
      return res.status(400).json({ msg: 'Email is required' });
    if (!password || password.length < 6)
      return res
        .status(400)
        .json({ msg: 'Password must be at least 6 characters' });
    if (!role || !['jobseeker', 'recruiter'].includes(role))
      return res.status(400).json({ msg: 'Invalid role' });
    if (role === 'recruiter' && (!company || !company.trim()))
      return res
        .status(400)
        .json({ msg: 'Company name required for recruiters' });

    // Sanitize inputs
    name = name.trim();
    email = email.trim().toLowerCase();
    company = company?.trim();

    // Check if user exists
    let user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role,
      company,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(201).json({
      msg: 'Registration successful! You can now log in.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err); // Pass error to error handler
  }
});

// Login user
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    let { email, password } = req.body;

    // Input validation
    if (!email || !email.trim())
      return res.status(400).json({ msg: 'Email is required' });
    if (!password) return res.status(400).json({ msg: 'Password is required' });

    // Sanitize email
    email = email.trim().toLowerCase();

    // Check if user exists
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create access token (expires in 7 days)
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    // Generate refresh token
    let refreshTokenData;
    try {
      refreshTokenData = await generateRefreshToken(user.id);
    } catch (tokenErr) {
      console.error('Failed to generate refresh token:', tokenErr);
      return res
        .status(500)
        .json({ msg: 'Failed to generate session. Please try again.' });
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, accessToken) => {
        if (err) {
          return next(err);
        }
        res.json({
          accessToken,
          refreshToken: refreshTokenData.token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      },
    );
  } catch (err) {
    next(err);
  }
});

// Get current user
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Refresh access token
router.post('/refresh-token', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ msg: 'Refresh token is required' });
    }

    // Hash the refresh token
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    // Find the refresh token document
    const tokenDoc = await RefreshToken.findOne({
      tokenHash: refreshTokenHash,
      expiresAt: { $gt: new Date() },
    }).populate('userId');

    if (!tokenDoc || !tokenDoc.userId) {
      return res.status(401).json({
        msg: 'Invalid or expired refresh token',
      });
    }

    const user = tokenDoc.userId;

    // Generate new access token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, newAccessToken) => {
        if (err) {
          return next(err);
        }
        res.json({
          accessToken: newAccessToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      },
    );
  } catch (err) {
    next(err);
  }
});

// Logout user
router.post('/logout', auth, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Hash and delete the refresh token
      const refreshTokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      await RefreshToken.deleteOne({ tokenHash: refreshTokenHash });
    }

    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
