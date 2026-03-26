import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ApplicationForm = ({ jobId, onClose, onSubmit }) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentCompany: '',
    currentTitle: '',
    yearsOfExperience: '',
    skills: [],
    expectedSalary: '',
    startDate: '',
    notes: '',
    coverLetter: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [useProfileResume, setUseProfileResume] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchUserProfile();
    // Cleanup function
    return () => {
      // Cleanup if needed
    };
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/profile`, {
        headers: { 'x-auth-token': token },
      });
      setUserProfile(res.data);

      // Pre-fill form with profile data
      if (res.data.profile) {
        setFormData((prev) => ({
          ...prev,
          fullName: user?.name || '',
          email: user?.email || '',
          phone: res.data.phone || '',
          currentTitle: res.data.profile.title || '',
          skills: res.data.profile.skills || [],
        }));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillChange = (e) => {
    const skills = e.target.value.split(',').map((s) => s.trim());
    setFormData((prev) => ({ ...prev, skills }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate file size on frontend before upload
    if (resumeFile && resumeFile.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      setLoading(false);
      return;
    }

    const applicationData = new FormData();
    applicationData.append('jobId', jobId);
    applicationData.append('coverLetter', formData.coverLetter);
    applicationData.append('applicationData', JSON.stringify(formData));

    if (!useProfileResume || !userProfile?.profile?.resume) {
      if (!resumeFile) {
        alert('Please upload your resume');
        setLoading(false);
        return;
      }
      applicationData.append('resume', resumeFile);
    } else {
      applicationData.append('useProfileResume', 'true');
    }

    try {
      const res = await axios.post(`${API_URL}/applications`, applicationData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percentCompleted);
        },
      });

      onSubmit(res.data);
      onClose();
    } catch (err) {
      console.error('Error submitting application:', err);
      alert(err.response?.data?.msg || 'Error submitting application');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-t-3xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Apply for Position</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Summary */}
          {userProfile?.profile && (
            <div className="bg-blue-50 p-4 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">Your Profile</h3>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {user?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {userProfile.profile.title || 'No title set'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {userProfile.profile.skills?.length || 0} skills •{' '}
                    {userProfile.profile.experience?.length || 0} experiences
                  </p>
                  <a
                    href="/profile"
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Update Profile →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="modern-input"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="modern-input"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="modern-input"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Professional Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  Current Company
                </label>
                <input
                  type="text"
                  name="currentCompany"
                  value={formData.currentCompany}
                  onChange={handleChange}
                  className="modern-input"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  Current Title
                </label>
                <input
                  type="text"
                  name="currentTitle"
                  value={formData.currentTitle}
                  onChange={handleChange}
                  className="modern-input"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  className="modern-input"
                  min="0"
                  step="0.5"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills.join(', ')}
                  onChange={handleSkillChange}
                  className="modern-input"
                  placeholder="React, Node.js, Python"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  Expected Salary
                </label>
                <input
                  type="text"
                  name="expectedSalary"
                  value={formData.expectedSalary}
                  onChange={handleChange}
                  className="modern-input"
                  placeholder="$80,000 - $100,000"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  Available Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="modern-input"
                />
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Resume</h3>

            {userProfile?.profile?.resume && (
              <label className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  checked={useProfileResume}
                  onChange={(e) => setUseProfileResume(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="text-gray-700">
                  Use my profile resume:{' '}
                  <span className="font-medium">
                    {userProfile.profile.resumeOriginalName}
                  </span>
                </span>
              </label>
            )}

            {!useProfileResume && (
              <div>
                <label className="block text-gray-700 text-sm mb-2">
                  Upload Resume *
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  className="w-full p-2 border rounded-xl"
                  required={!useProfileResume}
                />
                {uploadProgress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm mb-1">
              Cover Letter
            </label>
            <textarea
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleChange}
              rows="5"
              className="modern-input"
              placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="modern-input"
              placeholder="Any additional information you'd like to share..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-modern"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Application'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
