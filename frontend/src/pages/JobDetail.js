import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { validateFileUpload } from '../utils/validation';
import { getImageUrl } from '../services/profileService';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const JobDetail = () => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  const [useProfileResume, setUseProfileResume] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [error, setError] = useState(''); // global job / fetch error
  const [formError, setFormError] = useState(''); // form-specific messages
  const [similarJobs, setSimilarJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [similarJobsError, setSimilarJobsError] = useState('');
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJob();
    if (user) {
      checkApplication();
    }
    window.scrollTo(0, 0);
  }, [id, user]);

  // determine if current user owns job
  const isOwner =
    user && job && (user.role === 'admin' || job?.postedBy?._id === user.id);

  useEffect(() => {
    if (isOwner) {
      fetchApplicants();
    }
  }, [isOwner, job]);

  const fetchJob = async () => {
    try {
      const res = await axios.get(`${API_URL}/jobs/${id}`);
      setJob(res.data);
      // Fetch similar jobs
      fetchSimilarJobs(res.data?.category, res.data?.location);
    } catch (err) {
      console.error('Error fetching job:', err);
      setError('Job not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarJobs = async (category, location) => {
    try {
      setSimilarJobsError('');
      if (!category) {
        setSimilarJobsError('');
        return;
      }
      const res = await axios.get(
        `${API_URL}/jobs?category=${category}&limit=3`,
      );
      const jobsArray = Array.isArray(res.data)
        ? res.data
        : res.data?.jobs || [];
      setSimilarJobs(
        (jobsArray?.filter((j) => j._id !== id) || []).slice(0, 3),
      );
    } catch (err) {
      console.error('Error fetching similar jobs:', err);
      setSimilarJobsError('Failed to load similar jobs');
    }
  };

  const fetchApplicants = async () => {
    setApplicantsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/applications/job/${id}`, {
        headers: { 'x-auth-token': token },
      });
      setApplicants(res.data?.applications || []);
    } catch (err) {
      console.error('Error fetching applicants:', err);
      setApplicants([]);
    } finally {
      setApplicantsLoading(false);
    }
  };

  const updateApplicantStatus = async (appId, status) => {
    try {
      const res = await axios.put(
        `${API_URL}/applications/${appId}`,
        { status },
        { headers: { 'x-auth-token': token } },
      );
      setApplicants((prev) =>
        prev.map((a) => (a._id === appId ? res.data : a)),
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Unable to update status');
    }
  };

  const checkApplication = async () => {
    try {
      const res = await axios.get(`${API_URL}/applications/my-applications`, {
        headers: { 'x-auth-token': token },
      });
      const applied = (res.data || []).some((app) => app?.job?._id === id);
      setHasApplied(applied);
    } catch (err) {
      console.error('Error checking application:', err);
    }
  };

  const handleApply = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setFormError('');

    if (!user) {
      navigate('/login');
      return;
    }

    if (!id || !token) {
      setFormError('❌ Error: Missing job ID or authentication token');
      return;
    }

    setApplying(true);

    try {
      const formData = new FormData();
      formData.append('jobId', id);
      formData.append('coverLetter', coverLetter);
      formData.append('useProfileResume', useProfileResume);
      if (resume) {
        formData.append('resume', resume);
      }

      const response = await axios.post(`${API_URL}/applications`, formData, {
        headers: { 'x-auth-token': token },
        timeout: 30000,
      });

      setHasApplied(true);
      setShowApplicationForm(false);
      setToastMessage('🎉 Application submitted successfully!');
      setShowToast(true);
      setCoverLetter('');
      setResume(null);
      setUseProfileResume(false);
    } catch (err) {
      console.error('Error applying:', err.message);
      if (err.response?.data) {
        console.error('Response data:', err.response.data);
      }
      setFormError(
        '❌ ' +
          (err.response?.data?.msg ||
            err.response?.data?.error ||
            err.message ||
            'Error applying for job'),
      );
    } finally {
      setApplying(false);
    }
  };

  const handleWithdrawApplication = async () => {
    setWithdrawing(true);
    try {
      const myAppsRes = await axios.get(`${API_URL}/applications/my-applications`, {
        headers: { 'x-auth-token': token },
      });
      const application = (myAppsRes.data || []).find(
        (app) => app?.job?._id === id,
      );
      if (!application) {
        setFormError('❌ Application not found');
        return;
      }
      await axios.delete(`${API_URL}/applications/${application._id}`, {
        headers: { 'x-auth-token': token },
      });
      setHasApplied(false);
      setShowWithdrawConfirm(false);
      setToastMessage('✓ Application withdrawn successfully');
      setShowToast(true);
    } catch (err) {
      console.error('Error withdrawing:', err);
      setFormError('❌ Error withdrawing application');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="modern-spinner"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white/90 p-12 rounded-3xl shadow-2xl">
          <span className="text-6xl mb-4 block">😕</span>
          <p className="text-red-600 text-2xl mb-4">
            {error || 'Job not found'}
          </p>
          <button onClick={() => navigate('/jobs')} className="btn-modern">
            Browse Other Jobs
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
      <ConfirmDialog
        isOpen={showWithdrawConfirm}
        title="Withdraw Application?"
        message="Are you sure you want to withdraw your application for this job? This action cannot be undone."
        confirmText="Withdraw"
        cancelText="Cancel"
        confirmColor="red"
        onConfirm={handleWithdrawApplication}
        onCancel={() => setShowWithdrawConfirm(false)}
        isLoading={withdrawing}
      />
      <div className="container mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-white hover:text-white/80 transition focus:outline-none focus:ring-2 focus:ring-white rounded px-2 py-1"
          aria-label="Go back to previous page"
        >
          <span className="mr-2">←</span> Back to Jobs
        </button>

        {/* Main Job Card */}
        <div className="modern-card hover-lift mb-8 overflow-hidden">
          {/* Company Header */}
          <div className="bg-gray-50 p-8 -m-8 mb-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mr-6 text-white font-bold text-2xl">
                {job.company?.charAt(0) || 'J'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {job.title}
                </h1>
                <p className="text-gray-600 text-lg">
                  {job.company || 'Company'}
                </p>
              </div>
            </div>
          </div>

          {/* Job Details Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1 font-medium">
                  Location
                </p>
                <p className="font-semibold text-gray-900">{job.location}</p>
              </div>
            </div>
            <div className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1 font-medium">Salary</p>
                <p className="font-semibold text-gray-900">
                  {job.salary || 'Not specified'}
                </p>
              </div>
            </div>
            <div className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1 font-medium">
                  Job Type
                </p>
                <p className="font-semibold text-gray-900 capitalize">
                  {job.type}
                </p>
              </div>
            </div>
          </div>

          {/* Description and Requirements */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Job Description
                </h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Requirements
                </h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {job.requirements}
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="bg-gray-50 rounded-lg p-6 sticky top-24 border border-gray-200">
                <h3 className="text-lg font-bold mb-4 text-gray-900">
                  Job Overview
                </h3>
                <div className="space-y-3">
                  <div className="pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600 block mb-1">
                      Posted by
                    </span>
                    <span className="font-semibold text-gray-900">
                      {job.postedBy.name}
                    </span>
                  </div>
                  <div className="pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600 block mb-1">
                      Posted on
                    </span>
                    <span className="font-semibold text-gray-900">
                      {new Date(job.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {job.category && (
                    <div className="pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600 block mb-1">
                        Category
                      </span>
                      <span className="modern-badge badge-primary">
                        {job.category}
                      </span>
                    </div>
                  )}
                  {job.deadline && (
                    <div className="pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600 block mb-1">
                        Deadline
                      </span>
                      <span className="font-semibold text-red-600">
                        {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Apply Button */}
                {user && user.role === 'jobseeker' && (
                  <div className="mt-6">
                    {hasApplied ? (
                      <div className="text-center">
                        <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full mb-3">
                          ✓ Applied Successfully
                        </span>
                        <button
                          onClick={() => setShowWithdrawConfirm(true)}
                          className="w-full px-4 py-3 border-2 border-red-500 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-red-500"
                          aria-label="Withdraw your application"
                        >
                          Withdraw Application
                        </button>
                      </div>
                    ) : !showApplicationForm ? (
                      <button
                        onClick={() => setShowApplicationForm(true)}
                        className="btn-modern w-full group"
                      >
                        Apply Now
                        <span className="ml-2 group-hover:translate-x-1 inline-block transition">
                          →
                        </span>
                      </button>
                    ) : (
                      <form onSubmit={handleApply} className="space-y-4">
                        {formError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm font-medium">
                              {formError}
                            </p>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Resume (Optional)
                          </label>

                          {/* Repository resume option */}
                          {user?.profile?.resume && (
                            <div className="mb-3">
                              <label className="inline-flex items-center">
                                <input
                                  type="checkbox"
                                  checked={useProfileResume}
                                  onChange={(e) =>
                                    setUseProfileResume(e.target.checked)
                                  }
                                  className="form-checkbox h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2 text-sm font-medium">
                                  Use resume from my profile
                                </span>
                              </label>
                              {useProfileResume &&
                                user.profile.resumeOriginalName && (
                                  <p className="text-xs text-green-600 ml-6 mt-1">
                                    ✓ Using: {user.profile.resumeOriginalName}
                                  </p>
                                )}
                            </div>
                          )}

                          {/* File upload input */}
                          {!useProfileResume && (
                            <div>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    setResume(file);
                                    setFormError('');
                                  }
                                }}
                                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              {resume && (
                                <p className="text-xs text-green-600 mt-1">
                                  ✓ File selected: {resume.name}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cover Letter
                          </label>
                          <textarea
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="4"
                            placeholder="Explain why you're a great fit for this role and what interests you about this position..."
                          />
                        </div>

                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={handleApply}
                            disabled={applying}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {applying && (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            )}
                            {applying ? 'Submitting...' : 'Submit Application'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowApplicationForm(false)}
                            className="flex-1 bg-gray-400 text-white py-2 rounded-xl hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {!user && (
                  <div className="mt-6 text-center">
                    <p className="text-gray-600 mb-3">Please login to apply</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="btn-modern w-full"
                    >
                      Login to Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Applicants (visible to recruiter/owner) */}
        {isOwner && (
          <div className="modern-card mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                📋 Applications
              </h2>
              <p className="text-white/90">
                {applicants.length} applicant
                {applicants.length !== 1 ? 's' : ''} for this job
              </p>
            </div>

            {applicantsLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="modern-spinner"></div>
              </div>
            ) : applicants.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 text-lg">
                  No applications yet for this job.
                </p>
              </div>
            ) : (
              <div className="p-6">
                {/* Applicants Table */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="px-4 py-3 text-left font-semibold">
                          Applicant
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Resume
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Applied
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.map((app) => (
                        <tr
                          key={app._id}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              {app.applicant.profile?.profilePicture && (
                                <img
                                  src={getImageUrl(app.applicant.profile.profilePicture)}
                                  alt={app.applicant.name}
                                  className="w-8 h-8 rounded-full mr-2 object-cover"
                                />
                              )}
                              <span className="font-medium">
                                {app.applicant.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {app.applicant.email}
                          </td>
                          <td className="px-4 py-3">
                            {app.resume ? (
                              <a
                                href={getImageUrl(app.resume)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium"
                              >
                                📄 {app.resumeOriginalName || 'View'}
                              </a>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={app.status}
                              onChange={(e) =>
                                updateApplicantStatus(app._id, e.target.value)
                              }
                              className={`px-2 py-1 rounded-lg text-sm font-medium border-0 cursor-pointer transition ${
                                app.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : app.status === 'reviewed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : app.status === 'shortlisted'
                                      ? 'bg-green-100 text-green-800'
                                      : app.status === 'rejected'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              <option value="pending">pending</option>
                              <option value="reviewed">reviewed</option>
                              <option value="shortlisted">shortlisted</option>
                              <option value="rejected">rejected</option>
                              <option value="hired">hired</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setSelectedApplicant(app)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Applicant Detail Panel */}
            {selectedApplicant && (
              <div className="bg-gray-50 border-t p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">Applicant Profile</h3>
                  <button
                    onClick={() => setSelectedApplicant(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column - Basic Info */}
                  <div>
                    {/* Profile Header */}
                    <div className="mb-6 pb-6 border-b">
                      <div className="flex items-start mb-4">
                        {selectedApplicant.applicant.profile?.profilePicture && (
                          <img
                            src={getImageUrl(selectedApplicant.applicant.profile.profilePicture)}
                            alt="avatar"
                            className="w-16 h-16 rounded-full mr-4 object-cover border-2 border-blue-600"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="text-xl font-bold">
                            {selectedApplicant.applicant.name}
                          </h4>
                          {selectedApplicant.applicant.profile?.title && (
                            <p className="text-blue-600 font-medium">
                              {selectedApplicant.applicant.profile.title}
                            </p>
                          )}
                          <p className="text-gray-600 text-sm mt-1">
                            {selectedApplicant.applicant.email}
                          </p>
                          {selectedApplicant.applicant.profile?.visibility
                            ?.showContactInfo &&
                            selectedApplicant.applicant.phone && (
                              <p className="text-gray-600 text-sm">
                                📞 {selectedApplicant.applicant.phone}
                              </p>
                            )}
                        </div>
                      </div>

                      {selectedApplicant.applicant.profile?.location && (
                        <p className="text-gray-700">
                          <span className="font-medium">📍 Location:</span>{' '}
                          {selectedApplicant.applicant.profile.location}
                        </p>
                      )}

                      {selectedApplicant.applicant.profile?.bio && (
                        <p className="text-gray-700 mt-3 leading-relaxed">
                          {selectedApplicant.applicant.profile.bio}
                        </p>
                      )}
                    </div>

                    {/* Skills */}
                    {selectedApplicant.applicant.profile?.skills &&
                      selectedApplicant.applicant.profile.skills.length > 0 && (
                        <div className="mb-6">
                          <h5 className="font-bold text-lg mb-3">🎯 Skills</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedApplicant.applicant.profile.skills.map(
                              (skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                >
                                  {skill}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {/* Languages */}
                    {selectedApplicant.applicant.profile?.languages &&
                      selectedApplicant.applicant.profile.languages.length >
                        0 && (
                        <div className="mb-6">
                          <h5 className="font-bold text-lg mb-3">
                            🗣️ Languages
                          </h5>
                          <div className="space-y-2">
                            {selectedApplicant.applicant.profile.languages.map(
                              (lang, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between text-sm"
                                >
                                  <span>{lang.name}</span>
                                  <span className="text-gray-600">
                                    {lang.proficiency}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {/* Resume */}
                    {selectedApplicant.resume && (
                      <div className="mb-6 p-4 bg-white border border-gray-300 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                          Uploaded Resume:
                        </p>
                        <a
                          href={`${BACKEND_URL}/${selectedApplicant.resume}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                        >
                          📥 Download Resume
                          {selectedApplicant.resumeOriginalName && (
                            <span className="ml-2 text-sm">
                              ({selectedApplicant.resumeOriginalName})
                            </span>
                          )}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Experience, Education, etc. */}
                  <div>
                    {/* Experience */}
                    {selectedApplicant.applicant.profile?.experience &&
                      selectedApplicant.applicant.profile.experience.length >
                        0 && (
                        <div className="mb-6">
                          <h5 className="font-bold text-lg mb-3">
                            💼 Experience
                          </h5>
                          <div className="space-y-4">
                            {selectedApplicant.applicant.profile.experience.map(
                              (exp, idx) => (
                                <div
                                  key={idx}
                                  className="border-l-4 border-blue-600 pl-4"
                                >
                                  <p className="font-semibold">{exp.title}</p>
                                  <p className="text-gray-600 text-sm">
                                    {exp.company}
                                  </p>
                                  {exp.from && (
                                    <p className="text-gray-500 text-xs">
                                      {new Date(exp.from).toLocaleDateString()}{' '}
                                      -{' '}
                                      {exp.to
                                        ? new Date(exp.to).toLocaleDateString()
                                        : exp.current
                                          ? 'Present'
                                          : ''}
                                    </p>
                                  )}
                                  {exp.description && (
                                    <p className="text-gray-700 text-sm mt-1">
                                      {exp.description}
                                    </p>
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {/* Education */}
                    {selectedApplicant.applicant.profile?.education &&
                      selectedApplicant.applicant.profile.education.length >
                        0 && (
                        <div className="mb-6">
                          <h5 className="font-bold text-lg mb-3">
                            🎓 Education
                          </h5>
                          <div className="space-y-4">
                            {selectedApplicant.applicant.profile.education.map(
                              (edu, idx) => (
                                <div
                                  key={idx}
                                  className="border-l-4 border-green-600 pl-4"
                                >
                                  <p className="font-semibold">{edu.degree}</p>
                                  <p className="text-gray-600 text-sm">
                                    {edu.institution}
                                  </p>
                                  {edu.field && (
                                    <p className="text-gray-600 text-sm">
                                      Field: {edu.field}
                                    </p>
                                  )}
                                  {edu.from && (
                                    <p className="text-gray-500 text-xs">
                                      {new Date(edu.from).toLocaleDateString()}{' '}
                                      -{' '}
                                      {edu.to
                                        ? new Date(edu.to).toLocaleDateString()
                                        : ''}
                                    </p>
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {/* Certifications */}
                    {selectedApplicant.applicant.profile?.certifications &&
                      selectedApplicant.applicant.profile.certifications
                        .length > 0 && (
                        <div className="mb-6">
                          <h5 className="font-bold text-lg mb-3">
                            📜 Certifications
                          </h5>
                          <div className="space-y-2">
                            {selectedApplicant.applicant.profile.certifications.map(
                              (cert, idx) => (
                                <div key={idx} className="text-sm">
                                  <p className="font-medium">{cert.name}</p>
                                  {cert.issuer && (
                                    <p className="text-gray-600">
                                      by {cert.issuer}
                                    </p>
                                  )}
                                  {cert.year && (
                                    <p className="text-gray-500">{cert.year}</p>
                                  )}
                                  {cert.link && (
                                    <a
                                      href={cert.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      View Certificate
                                    </a>
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Application Details & Communication */}
                <div className="mt-8 pt-8 border-t">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Application Data */}
                    <div>
                      <h5 className="font-bold text-lg mb-3">
                        📝 Application Details
                      </h5>
                      <div className="space-y-2 text-sm">
                        {selectedApplicant.applicationData?.currentTitle && (
                          <p>
                            <span className="font-medium">Current Title:</span>{' '}
                            {selectedApplicant.applicationData.currentTitle}
                          </p>
                        )}
                        {selectedApplicant.applicationData
                          ?.yearsOfExperience && (
                          <p>
                            <span className="font-medium">
                              Years of Experience:
                            </span>{' '}
                            {
                              selectedApplicant.applicationData
                                .yearsOfExperience
                            }
                            +
                          </p>
                        )}
                        {selectedApplicant.applicationData?.expectedSalary && (
                          <p>
                            <span className="font-medium">
                              Expected Salary:
                            </span>{' '}
                            {selectedApplicant.applicationData.expectedSalary}
                          </p>
                        )}
                        {selectedApplicant.applicationData?.startDate && (
                          <p>
                            <span className="font-medium">
                              Available to Start:
                            </span>{' '}
                            {new Date(
                              selectedApplicant.applicationData.startDate,
                            ).toLocaleDateString()}
                          </p>
                        )}
                        {selectedApplicant.applicationData?.notes && (
                          <div>
                            <p className="font-medium mb-1">
                              Additional Notes:
                            </p>
                            <p className="text-gray-700 bg-white p-2 rounded">
                              {selectedApplicant.applicationData.notes}
                            </p>
                          </div>
                        )}
                        {selectedApplicant.coverLetter && (
                          <div>
                            <p className="font-medium mb-1">Cover Letter:</p>
                            <p className="text-gray-700 bg-white p-2 rounded">
                              {selectedApplicant.coverLetter}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Messages & Communication */}
                    <div>
                      <h5 className="font-bold text-lg mb-3">
                        💬 Communication
                      </h5>
                      <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200 h-48 overflow-y-auto">
                        {selectedApplicant.communication &&
                        selectedApplicant.communication.length > 0 ? (
                          <div className="space-y-3">
                            {selectedApplicant.communication.map((c, idx) => (
                              <div key={idx} className="text-sm border-b pb-2">
                                <p className="font-semibold text-blue-600">
                                  {c.from?.name || 'Unknown'}
                                </p>
                                <p className="text-gray-700">{c.message}</p>
                                <p className="text-gray-500 text-xs">
                                  {new Date(c.date).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No messages yet
                          </p>
                        )}
                      </div>

                      {/* Message Form */}
                      <div>
                        <textarea
                          rows="3"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2"
                          placeholder="Send a message to the applicant..."
                        />
                        <button
                          disabled={!messageText.trim() || sendingMessage}
                          onClick={async () => {
                            if (!selectedApplicant) return;
                            setSendingMessage(true);
                            try {
                              const res = await axios.post(
                                `${API_URL}/applications/${selectedApplicant._id}/message`,
                                { message: messageText, type: 'note' },
                                { headers: { 'x-auth-token': token } },
                              );
                              // update communication in selectedApplicant
                              setSelectedApplicant((prev) => ({
                                ...prev,
                                communication: res.data,
                              }));
                              setMessageText('');
                            } catch (err) {
                              console.error('Error sending message:', err);
                              alert('Failed to send message');
                            } finally {
                              setSendingMessage(false);
                            }
                          }}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sendingMessage ? 'Sending...' : '✓ Send Message'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Similar Jobs */}
        {similarJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Similar Jobs You Might Like
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {similarJobs.map((job) => (
                <div
                  key={job._id}
                  className="modern-card hover-lift cursor-pointer"
                  onClick={() => navigate(`/jobs/${job._id}`)}
                >
                  <h3 className="font-bold text-lg mb-2">{job.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{job.company}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-3">📍 {job.location}</span>
                    <span>⏰ {job.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;
