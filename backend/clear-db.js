// Script to clear all collections in the database
const mongoose = require('mongoose');
const Application = require('./models/Application');
const Job = require('./models/Job');
const RefreshToken = require('./models/RefreshToken');
const User = require('./models/User');

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/jobportal';

async function clearDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    await Promise.all([
      Application.deleteMany({}),
      Job.deleteMany({}),
      RefreshToken.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log('All collections cleared.');
  } catch (err) {
    console.error('Error clearing database:', err);
  } finally {
    await mongoose.disconnect();
  }
}

clearDatabase();
