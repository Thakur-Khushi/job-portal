import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { validateJobForm } from '../utils/validation';
import Toast from '../components/Toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PostJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    salary: '',
    type: 'full-time',
    category: '',
    deadline: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      await axios.post(`${API_URL}/jobs`, formData, {
        headers: { 'x-auth-token': token },
      });
      setToastMessage('🌟 Job posted successfully!');
      setShowToast(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error posting job');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      const validation = validateJobForm(formData);
      const step1Fields = ['title', 'company', 'location', 'description'];
      const step1Errors = {};
      step1Fields.forEach((field) => {
        if (validation.errors[field]) {
          step1Errors[field] = validation.errors[field];
        }
      });

      if (Object.keys(step1Errors).length > 0) {
        setFieldErrors(step1Errors);
        return;
      }
    }

    setFieldErrors({});
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  if (!user || (user.role !== 'recruiter' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white/90 p-12 rounded-3xl shadow-2xl">
          <span className="text-6xl mb-4 block">🔒</span>
          <p className="text-red-600 text-2xl mb-4">Access Denied</p>
          <p className="text-gray-600 mb-6">Only recruiters can post jobs</p>
          <button onClick={() => navigate('/')} className="btn-modern">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 animated-bg">
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Post a New Job</h1>
          <p className="text-white/90 text-lg">
            Find the perfect candidate for your position
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 px-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex-1 text-center">
              <div className={`relative`}>
                <div
                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-white ${
                    currentStep >= step ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                >
                  {step}
                </div>
                <div
                  className={`h-1 absolute top-5 -right-1/2 w-full ${
                    step < 3
                      ? currentStep > step
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                      : 'hidden'
                  }`}
                ></div>
              </div>
              <p className="mt-2 text-sm text-white">
                {step === 1 && 'Basic Info'}
                {step === 2 && 'Job Details'}
                {step === 3 && 'Requirements'}
              </p>
            </div>
          ))}
        </div>

        {/* Main Form */}
        <div className="modern-card">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate__animated animate__fadeIn">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      <span className="flex items-center">
                        <span className="text-2xl mr-2">📋</span> Job Title *
                      </span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`modern-input ${fieldErrors.title ? 'border-red-500' : ''}`}
                      placeholder="e.g., Senior React Developer"
                    />
                    {fieldErrors.title && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      <span className="flex items-center">
                        <span className="text-2xl mr-2">🏢</span> Company Name *
                      </span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="modern-input"
                      placeholder="e.g. Tech Corp Inc."
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      <span className="flex items-center">
                        <span className="text-2xl mr-2">📍</span> Location *
                      </span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      placeholder="e.g. New York, NY or Remote/Hybrid"
                      value={formData.location}
                      onChange={handleChange}
                      className="modern-input"
                      placeholder="e.g., New York, Remote"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      <span className="flex items-center">
                        <span className="text-2xl mr-2">⏰</span> Job Type *
                      </span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="modern-input"
                      required
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      <span className="flex items-center">
                        <span className="text-2xl mr-2">💰</span> Salary Range
                      </span>
                    </label>
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      className="modern-input"
                      placeholder="e.g., $50,000 - $70,000"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      <span className="flex items-center">
                        <span className="text-2xl mr-2">🏷️</span> Category
                      </span>
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="modern-input"
                      placeholder="e.g., Technology, Healthcare"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    <span className="flex items-center">
                      <span className="text-2xl mr-2">📅</span> Application
                      Deadline
                    </span>
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="modern-input"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Job Description */}
            {currentStep === 2 && (
              <div className="space-y-6 animate__animated animate__fadeIn">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    <span className="flex items-center">
                      <span className="text-2xl mr-2">📝</span> Job Description
                      *
                    </span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="8"
                    className="modern-input"
                    placeholder="Describe the role, responsibilities, benefits, and any other relevant information..."
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Minimum 100 characters. Be detailed about the role.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Requirements */}
            {currentStep === 3 && (
              <div className="space-y-6 animate__animated animate__fadeIn">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    <span className="flex items-center">
                      <span className="text-2xl mr-2">📋</span> Requirements *
                    </span>
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows="8"
                    className="modern-input"
                    placeholder="List required skills, experience, education, certifications..."
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Include both must-have and nice-to-have requirements.
                  </p>
                </div>

                {/* Preview Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold mb-4">✨ Job Preview</h3>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-bold text-xl">
                      {formData.title || 'Job Title'}
                    </h4>
                    <p className="text-gray-600">
                      {formData.company || 'Company Name'}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {formData.location || 'Location'}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {formData.type || 'Job Type'}
                      </span>
                      {formData.salary && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                          {formData.salary}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className={`px-6 py-2 rounded-lg font-medium ${
                  currentStep === 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                disabled={currentStep === 1}
              >
                ← Previous
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2 btn-modern"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Posting...
                    </div>
                  ) : (
                    'Post Job 🚀'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl text-white">
            <span className="text-3xl mb-2 block">💡</span>
            <h3 className="font-bold mb-2">Write Clear Title</h3>
            <p className="text-sm text-white/80">
              Use specific job titles that candidates search for
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl text-white">
            <span className="text-3xl mb-2 block">💰</span>
            <h3 className="font-bold mb-2">Include Salary</h3>
            <p className="text-sm text-white/80">
              Jobs with salary ranges get more applications
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl text-white">
            <span className="text-3xl mb-2 block">📝</span>
            <h3 className="font-bold mb-2">Be Detailed</h3>
            <p className="text-sm text-white/80">
              Detailed descriptions attract better candidates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
