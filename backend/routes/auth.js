const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const auth = require('../middleware/auth');
const { loginLimiter, registerLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

const ALLOWED_SECURITY_QUESTIONS = [
  "What is your favorite color?",
  "What is your favorite food?",
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
];

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
      tokenHash: refreshTokenHash,
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
    let { name, email, password, role, company, securityQuestions } = req.body;

    // Input validation & sanitization
    if (!name || !name.trim())
      return res.status(400).json({ msg: 'Name is required' });
    if (!email || !email.trim())
      return res.status(400).json({ msg: 'Email is required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return res.status(400).json({ msg: 'Invalid email address' });
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

    // Validate security questions
    if (!securityQuestions || securityQuestions.length !== 2)
      return res.status(400).json({ msg: 'Exactly 2 security questions are required' });
    for (const sq of securityQuestions) {
      if (!ALLOWED_SECURITY_QUESTIONS.includes(sq.question))
        return res.status(400).json({ msg: 'Invalid security question' });
      if (!sq.answer || !sq.answer.trim())
        return res.status(400).json({ msg: 'Security question answer is required' });
    }
    if (securityQuestions[0].question === securityQuestions[1].question)
      return res.status(400).json({ msg: 'Security questions must be different' });

    // Sanitize inputs
    name = name.trim();
    email = email.trim().toLowerCase();
    company = company?.trim();

    // Check if user exists
    let user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Hash security question answers
    const hashedQuestions = await Promise.all(
      securityQuestions.map(async (sq) => {
        const answerHash = await bcrypt.hash(sq.answer.trim().toLowerCase(), 10);
        return { question: sq.question, answerHash };
      })
    );

    // Create new user
    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      company,
      securityQuestions: hashedQuestions,
    });

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
    next(err);
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

// Forgot Password - Verify email and return security questions
router.post('/forgot-password', passwordResetLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    // Always return the same shape to prevent email enumeration
    if (!user || !user.securityQuestions || user.securityQuestions.length < 2) {
      return res.json({ questions: null });
    }

    const questions = user.securityQuestions.map((sq) => sq.question);
    res.json({ questions });
  } catch (err) {
    next(err);
  }
});

// Verify security answers and return a short-lived reset token
router.post('/verify-security-answers', passwordResetLimiter, async (req, res, next) => {
  try {
    const { email, answers } = req.body;

    if (!email || !answers || answers.length !== 2) {
      return res.status(400).json({ error: 'Email and 2 answers are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Generic error to avoid leaking account existence
    const genericError = { error: 'Incorrect answers. Please try again.' };

    if (!user || !user.securityQuestions || user.securityQuestions.length < 2) {
      return res.status(400).json(genericError);
    }

    // Compare both answers (case-insensitive)
    const [match1, match2] = await Promise.all([
      bcrypt.compare(answers[0].trim().toLowerCase(), user.securityQuestions[0].answerHash),
      bcrypt.compare(answers[1].trim().toLowerCase(), user.securityQuestions[1].answerHash),
    ]);

    if (!match1 || !match2) {
      return res.status(400).json(genericError);
    }

    // Both answers correct — generate a 15-minute reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    res.json({ resetToken });
  } catch (err) {
    next(err);
  }
});

// Reset Password - Verify token and set new password
router.post('/reset-password', passwordResetLimiter, async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({ msg: 'Password reset successfully! You can now login with your new password.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
