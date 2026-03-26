const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['jobseeker', 'recruiter', 'admin'],
    default: 'jobseeker',
  },
  company: { type: String },
  phone: { type: String },

  // Job Seeker Profile Fields
  profile: {
    profilePicture: { type: String },
    profilePictureOriginalName: { type: String },
    title: { type: String },
    bio: { type: String },
    location: { type: String },
    experience: [
      {
        title: { type: String },
        company: { type: String },
        location: { type: String },
        from: { type: Date },
        to: { type: Date },
        current: { type: Boolean, default: false },
        description: { type: String },
      },
    ],
    education: [
      {
        degree: { type: String },
        institution: { type: String },
        field: { type: String },
        from: { type: Date },
        to: { type: Date },
        description: { type: String },
      },
    ],
    skills: [{ type: String }],
    languages: [
      {
        name: { type: String },
        proficiency: {
          type: String,
          enum: ['Basic', 'Conversational', 'Fluent', 'Native'],
        },
      },
    ],
    certifications: [
      {
        name: { type: String },
        issuer: { type: String },
        year: { type: String },
        link: { type: String },
      },
    ],
    resume: { type: String },
    resumeOriginalName: { type: String },
    social: {
      linkedin: { type: String },
      github: { type: String },
      portfolio: { type: String },
      twitter: { type: String },
    },
    preferences: {
      desiredJobTypes: [
        {
          type: String,
          enum: ['full-time', 'part-time', 'contract', 'internship'],
        },
      ],
      desiredLocations: [{ type: String }],
      expectedSalary: { type: String },
      remoteOnly: { type: Boolean, default: false },
      openToRelocation: { type: Boolean, default: false },
    },
    visibility: {
      showProfile: { type: Boolean, default: true },
      showContactInfo: { type: Boolean, default: false },
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update timestamp on save
// using a plain function without `next` to avoid mongoose middleware issues
userSchema.pre('save', function () {
  // Mongoose will wait for this synchronous middleware to complete
  this.updatedAt = Date.now();
});

// Create and export the model
const User = mongoose.model('User', userSchema);
module.exports = User;
