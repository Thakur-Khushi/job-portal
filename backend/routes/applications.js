const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Apply for job - handle both JSON and FormData with optional file
router.post('/', auth, upload.single('resume'), async (req, res) => {
  try {
    const { jobId, coverLetter, useProfileResume } = req.body;

    if (!jobId) {
      return res.status(400).json({ msg: 'Job ID is required' });
    }

    let job;
    try {
      job = await Job.findById(jobId);
    } catch (dbErr) {
      return res.status(400).json({ msg: 'Invalid job ID' });
    }

    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    if (job.status !== 'approved') {
      return res.status(400).json({ msg: 'This job is not open for applications' });
    }

    const existing = await Application.findOne({
      job: jobId,
      applicant: req.user.id,
    });

    if (existing) {
      return res.status(400).json({ msg: 'Already applied for this job' });
    }

    let resumePath = '';
    if (useProfileResume === 'true' || useProfileResume === true) {
      const user = await User.findById(req.user.id);
      if (user && user.profile && user.profile.resume) {
        resumePath = user.profile.resume;
      }
    } else if (req.file) {
      // Store path in consistent format: /uploads/filename
      resumePath = `/uploads/${req.file.filename}`;
    }

    const application = new Application({
      job: jobId,
      applicant: req.user.id,
      resume: resumePath,
      coverLetter,
    });

    await application.save();
    res.json(application);
  } catch (err) {
    console.error('Application error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get user's applications
router.get('/my-applications', auth, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job')
      .sort({ appliedAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get applications for recruiter's jobs
router.get('/recruiter', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // Add pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 per page
    const skip = (page - 1) * limit;

    // Use aggregation pipeline to avoid N+1 queries
    const jobs = await Job.find({ postedBy: req.user.id }).select('_id');
    const jobIds = jobs.map((job) => job._id);

    // Get total count for pagination
    const total = await Application.countDocuments({ job: { $in: jobIds } });

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('applicant', 'name email phone profile')
      .populate('job', 'title company')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      applications,
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

// Get applications for a specific job (recruiter only)
router.get('/job/:jobId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    // Ensure requester owns the job (or admin)
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Application.countDocuments({ job: job._id });

    const applications = await Application.find({ job: job._id })
      .populate({
        path: 'applicant',
        select: 'name email phone profile',
      })
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-communication'); // Exclude communication array for main list

    res.json({
      applications,
      pagination: {
        currentPage: page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching applications:', err.message);
    res.status(500).json({
      msg: 'Error fetching applications',
      error: err.message,
    });
  }
});

// Update application status
router.put('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate(
      'job',
    );

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    // Check if user is the job poster or admin
    if (
      application.job.postedBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const VALID_STATUSES = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];
    if (!VALID_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ msg: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    application.status = req.body.status;
    await application.save();

    res.json(application);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Send a message (note/email) related to an application
router.post('/:id/message', auth, async (req, res) => {
  try {
    const { message, type = 'note' } = req.body;
    const application = await Application.findById(req.params.id).populate(
      'job',
    );
    if (!application)
      return res.status(404).json({ msg: 'Application not found' });

    // only recruiter/admin or applicant themselves can send
    const isOwner = application.job
      ? application.job.postedBy.toString() === req.user.id
      : false;
    if (
      !isOwner &&
      application.applicant.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    application.communication.push({
      type,
      from: req.user.id,
      to:
        application.applicant.toString() === req.user.id
          ? application.job.postedBy
          : application.applicant,
      message,
    });
    await application.save();

    const populated = await Application.findById(req.params.id)
      .populate('communication.from', 'name email')
      .populate('communication.to', 'name email');

    res.json(populated.communication);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Withdraw application
router.delete('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    // Only applicant can withdraw
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    await application.deleteOne();
    res.json({ msg: 'Application withdrawn' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
