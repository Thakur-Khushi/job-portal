const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resume: { type: String },
  resumeOriginalName: { type: String },
  coverLetter: { type: String },

  // Application details
  applicationData: {
    fullName: { type: String },
    email: { type: String },
    phone: { type: String },
    currentCompany: { type: String },
    currentTitle: { type: String },
    yearsOfExperience: { type: Number },
    skills: [{ type: String }],
    expectedSalary: { type: String },
    startDate: { type: Date },
    notes: { type: String },
  },

  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'pending',
  },

  // Recruiter actions
  recruiterNotes: { type: String },
  rating: { type: Number, min: 1, max: 5 },

  // Interview tracking
  interviews: [
    {
      type: { type: String, enum: ['phone', 'video', 'onsite', 'technical'] },
      scheduledDate: { type: Date },
      duration: { type: Number }, // in minutes
      location: { type: String },
      notes: { type: String },
      feedback: { type: String },
      status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      },
    },
  ],

  // Communication history
  communication: [
    {
      type: { type: String, enum: ['email', 'phone', 'note'] },
      from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],

  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

applicationSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Application', applicationSchema);
