const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all users (admin or recruiter)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'recruiter') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all job seekers (for recruiters)
router.get('/job-seekers', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const jobSeekers = await User.find({ role: 'jobseeker' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(jobSeekers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get current user's profile data (includes extra info) - MOVED BEFORE /:id routes
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Ensure profile exists
    if (!user.profile) {
      user.profile = {};
    }

    // Include top-level phone field in profile object for frontend consistency
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
    res.status(500).json({
      msg: 'Error fetching profile',
      error: err.message,
    });
  }
});

// Get specific job seeker profile (by ID) - non-sensitive fields only
router.get('/:id/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const user = await User.findById(req.params.id).select(
      '-password -email -phone -profile.social.email -profile.social.linkedin',
    );
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.role !== 'jobseeker') {
      return res.status(403).json({ msg: 'This is not a job seeker profile' });
    }

    res.json({
      msg: 'Profile retrieved successfully',
      user: user,
    });
  } catch (err) {
    console.error('Error fetching job seeker profile:', err.message);
    res.status(500).json({
      msg: 'Error fetching profile',
      error: err.message,
    });
  }
});

// --- PROFILE ROUTES FOR JOB SEEKERS ---

// Update profile fields (MOVED BEFORE /:id routes for correct Express routing)
router.put('/profile', auth, async (req, res) => {
  try {
    // Get the user and ensure profile exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Initialize profile if it doesn't exist
    if (!user.profile) {
      user.profile = {};
    }

    // Update profile with incoming data
    if (req.body.profile) {
      // Merge the incoming profile data with existing profile
      user.profile = {
        ...user.profile,
        ...req.body.profile,
      };
    }

    // Update top-level phone field from root or from profile
    if (req.body.phone !== undefined) {
      user.phone = req.body.phone;
    } else if (req.body.profile?.phone) {
      // Also update top-level phone from profile object for consistency
      user.phone = req.body.profile.phone;
    }

    // Save the user document
    await user.save();

    console.log(
      'Profile saved successfully for user:',
      req.user.id,
      'Updated profile:',
      user.profile,
      'Phone:',
      user.phone,
    );

    // Refresh user from database to ensure we return the latest data
    const updatedUser = await User.findById(req.user.id).select('-password');

    // Return both the profile and full user object for frontend consistency
    res.json({
      msg: 'Profile updated successfully',
      profile: updatedUser.profile,
      user: updatedUser,
      success: true,
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({
      msg: 'Error updating profile',
      error: err.message,
    });
  }
});

// Update user role (admin only)
router.put('/:id/role', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { returnDocument: 'after' },
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Upload resume for current user
router.post(
  '/upload-resume',
  auth,
  upload.single('resume'),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: 'User not found' });

      user.profile = user.profile || {};

      // Store path in consistent format: /uploads/filename
      const filename = req.file.filename;
      const resumeUrl = `/uploads/${filename}`;

      user.profile.resume = resumeUrl;
      user.profile.resumeOriginalName = req.file.originalname;
      await user.save();

      console.log('Resume uploaded successfully:', resumeUrl);
      res.json({
        resumeUrl: resumeUrl,
        resume: resumeUrl,
        originalName: req.file.originalname,
        success: true,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        msg: 'Server error',
        error: err.message,
      });
    }
  },
);

// Upload profile picture
router.post(
  '/upload-profile-picture',
  auth,
  upload.single('profilePicture'),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: 'User not found' });

      // Ensure profile object exists
      if (!user.profile) {
        user.profile = {};
      }

      // Store path in consistent format: /uploads/filename
      // req.file.path is like "uploads\profilePicture-xxx.jpg" or "uploads/profilePicture-xxx.jpg"
      const filename = req.file.filename;
      const profilePictureUrl = `/uploads/${filename}`;

      user.profile.profilePicture = profilePictureUrl;
      user.profile.profilePictureOriginalName = req.file.originalname;
      await user.save();

      console.log('Profile picture uploaded successfully:', profilePictureUrl);
      res.json({
        profilePictureUrl: profilePictureUrl,
        profilePicture: profilePictureUrl,
        originalName: req.file.originalname,
        success: true,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        msg: 'Server error',
        error: err.message,
      });
    }
  },
);

module.exports = router;
