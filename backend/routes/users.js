const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const VALID_ROLES = ['jobseeker', 'recruiter', 'admin'];

// Get all users (admin only sees all; recruiters see only jobseekers)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'recruiter') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    // Recruiters may only see jobseekers, not other recruiters or admins
    const filter = req.user.role === 'admin' ? {} : { role: 'jobseeker' };

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      users,
      pagination: {
        currentPage: page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all job seekers (for recruiters) — with pagination
router.get('/job-seekers', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const total = await User.countDocuments({ role: 'jobseeker' });
    const jobSeekers = await User.find({ role: 'jobseeker' })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      jobSeekers,
      pagination: {
        currentPage: page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get current user's profile data — MUST be before /:id routes
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!user.profile) {
      user.profile = {};
    }

    if (user.phone && !user.profile.phone) {
      user.profile.phone = user.phone;
    }

    res.json({
      msg: 'Profile retrieved successfully',
      profile: user.profile,
      user: user,
      success: true,
    });
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).json({ msg: 'Error fetching profile' });
  }
});

// Get specific job seeker profile (by ID) — recruiters and admins only
router.get('/:id/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const user = await User.findById(req.params.id).select(
      '-password -email -phone',
    );
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.role !== 'jobseeker') {
      return res.status(403).json({ msg: 'This is not a job seeker profile' });
    }

    res.json({ msg: 'Profile retrieved successfully', user });
  } catch (err) {
    console.error('Error fetching job seeker profile:', err.message);
    res.status(500).json({ msg: 'Error fetching profile' });
  }
});

// Update profile fields — MUST be before /:id routes
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!user.profile) {
      user.profile = {};
    }

    if (req.body.profile) {
      user.profile = { ...user.profile, ...req.body.profile };
    }

    if (req.body.phone !== undefined) {
      user.phone = req.body.phone;
    } else if (req.body.profile?.phone) {
      user.phone = req.body.profile.phone;
    }

    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password');

    res.json({
      msg: 'Profile updated successfully',
      profile: updatedUser.profile,
      user: updatedUser,
      success: true,
    });
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ msg: 'Error updating profile' });
  }
});

// Update user role (admin only) — validates role value
router.put('/:id/role', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    if (!VALID_ROLES.includes(req.body.role)) {
      return res.status(400).json({ msg: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { returnDocument: 'after' },
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Upload resume for current user
router.post('/upload-resume', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.profile = user.profile || {};
    const resumeUrl = `/uploads/${req.file.filename}`;
    user.profile.resume = resumeUrl;
    user.profile.resumeOriginalName = req.file.originalname;
    await user.save();

    res.json({
      resumeUrl,
      resume: resumeUrl,
      originalName: req.file.originalname,
      success: true,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Upload profile picture
router.post('/upload-profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.profile = user.profile || {};
    const profilePictureUrl = `/uploads/${req.file.filename}`;
    user.profile.profilePicture = profilePictureUrl;
    user.profile.profilePictureOriginalName = req.file.originalname;
    await user.save();

    res.json({
      profilePictureUrl,
      profilePicture: profilePictureUrl,
      originalName: req.file.originalname,
      success: true,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
