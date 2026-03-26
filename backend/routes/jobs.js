const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const auth = require('../middleware/auth');

// Get all jobs (with filters and pagination)
router.get('/', async (req, res) => {
  try {
    const {
      category,
      location,
      type,
      status,
      page = 1,
      limit = 10,
    } = req.query;
    let query = {};

    // Show only approved jobs by default
    query.status = 'approved';

    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (type) query.type = type;

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination info
    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .populate('postedBy', 'name company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      jobs,
      pagination: {
        currentPage: pageNum,
        pageSize: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get recruiter's jobs (including all statuses for the recruiter)
router.get('/my-jobs', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments({ postedBy: req.user.id });

    const jobs = await Job.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      jobs,
      pagination: {
        currentPage: pageNum,
        pageSize: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Search jobs (full-text search with advanced filters)
router.get('/search/advanced', async (req, res) => {
  try {
    const {
      keyword = '',
      location,
      type,
      category,
      minSalary,
      maxSalary,
      postedAfter,
      page = 1,
      limit = 10,
      sortBy = 'relevance',
    } = req.query;

    let query = {};
    let sortOptions = {};

    // Always show only approved jobs
    query.status = 'approved';

    // Full-text search on keyword
    if (keyword && keyword.trim()) {
      query.$text = { $search: keyword.trim() };
      // For text search, use text score for relevance
      if (sortBy === 'relevance') {
        sortOptions = { score: { $meta: 'textScore' } };
      }
    }

    // Apply filters
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (type) {
      query.type = type;
    }
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // Salary range filter (if salary is a string like "50000-60000", we parse it)
    if (minSalary || maxSalary) {
      query.$expr = {
        $range: [],
      };
      // Note: Salary filtering is complex with string format
      // Ideally, salary should be numeric fields (minSalary, maxSalary) in schema
      // For now, we'll skip complex salary parsing
    }

    // Filter by posting date
    if (postedAfter) {
      const date = new Date(postedAfter);
      if (!isNaN(date)) {
        query.createdAt = { $gte: date };
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await Job.countDocuments(query);

    // Apply sort based on sortBy parameter
    if (Object.keys(sortOptions).length === 0) {
      if (sortBy === 'newest') {
        sortOptions = { createdAt: -1 };
      } else if (sortBy === 'oldest') {
        sortOptions = { createdAt: 1 };
      } else {
        sortOptions = { createdAt: -1 };
      }
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name company')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      jobs,
      pagination: {
        currentPage: pageNum,
        pageSize: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      searchTerm: keyword,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'postedBy',
      'name company',
    );
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create job (recruiters only) - Automatically approved
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const {
      title,
      company,
      location,
      description,
      requirements,
      salary,
      type,
      category,
      deadline,
    } = req.body;

    const newJob = new Job({
      title,
      company,
      location,
      description,
      requirements,
      salary,
      type,
      category,
      postedBy: req.user.id,
      deadline,
      status: 'approved', // Auto-approve for immediate visibility
    });

    const job = await newJob.save();
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update job
router.put('/:id', auth, async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Check ownership or admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after' },
    );
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete job
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Check ownership or admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    await job.deleteOne();
    res.json({ msg: 'Job removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Admin: Approve job
router.patch('/:id/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    if (job.status === 'approved') {
      return res.status(400).json({ msg: 'Job is already approved' });
    }

    job.status = 'approved';
    await job.save();

    res.json({ msg: 'Job approved successfully', job });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin: Reject job
router.patch('/:id/reject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    if (job.status === 'rejected') {
      return res.status(400).json({ msg: 'Job is already rejected' });
    }

    job.status = 'rejected';
    await job.save();

    res.json({ msg: 'Job rejected successfully', job });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin: Get all jobs (pending, approved, rejected)
router.get('/admin/all-jobs', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    let query = {};

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .populate('postedBy', 'name company email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      jobs,
      pagination: {
        currentPage: pageNum,
        pageSize: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
