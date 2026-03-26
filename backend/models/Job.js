const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: String, required: true },
  salary: { type: String },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    default: 'full-time',
  },
  category: { type: String },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  }, // Default pending, admin approval required
  createdAt: { type: Date, default: Date.now },
  deadline: { type: Date },
});

// Create text indexes for full-text search
jobSchema.index({
  title: 'text',
  description: 'text',
  company: 'text',
  category: 'text',
});

// Create index for filtering
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ type: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ postedBy: 1 });

module.exports = mongoose.model('Job', jobSchema);
