import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { handleApiError } from '../utils/errorHandler';
import ConfirmDialog from '../components/ConfirmDialog';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profile, setProfile] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    phone: '',
    location: '',
  });

  useEffect(() => {
    fetchDashboardData();
    if (user.role === 'jobseeker') {
      fetchProfile();
    }
  }, [user, token]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/profile`, {
        headers: { 'x-auth-token': token },
      });
      setProfile(res.data.profile || {});
      setEditForm({
        title: res.data.profile?.title || '',
        phone: res.data.user?.phone || '',
        location: res.data.profile?.location || '',
      });
    } catch (err) {
      const errorMsg = handleApiError(err);
      console.error('Error fetching profile:', errorMsg);
      setError(errorMsg);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setError('');
      if (user.role === 'jobseeker') {
        const appsRes = await axios.get(
          `${API_URL}/applications/my-applications`,
          {
            headers: { 'x-auth-token': token },
          },
        );
        setApplications(appsRes.data || []);
      } else if (user.role === 'recruiter') {
        const jobsRes = await axios.get(`${API_URL}/jobs/my-jobs`, {
          headers: { 'x-auth-token': token },
        });
        // API returns { jobs: [...], pagination: {...} }
        const jobsList = jobsRes.data?.jobs || jobsRes.data || [];
        // fetch applicant count for each job
        const jobsWithCounts = await Promise.all(
          jobsList.map(async (job) => {
            try {
              const apps = await axios.get(
                `${API_URL}/applications/job/${job._id}`,
                { headers: { 'x-auth-token': token } },
              );
              return { ...job, applicantCount: apps.data?.applications?.length || 0 };
            } catch (err) {
              console.error('Error fetching applicants for job', job._id, err);
              return { ...job, applicantCount: 0 };
            }
          }),
        );
        setPostedJobs(jobsWithCounts);
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      console.error('Error fetching dashboard data:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      await axios.put(
        `${API_URL}/users/profile`,
        {
          phone: editForm.phone,
          profile: {
            ...profile,
            title: editForm.title,
            location: editForm.location,
          },
        },
        { headers: { 'x-auth-token': token } },
      );
      setShowProfileEdit(false);
      fetchProfile();
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error updating profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        Dashboard
      </h1>

      {/* User Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold dark:text-white mb-4">
          Welcome, {user.name}!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 dark:text-gray-200">
              <span className="font-medium dark:text-white">Email:</span>{' '}
              {user.email}
            </p>
            <p className="text-gray-600 dark:text-gray-200">
              <span className="font-medium dark:text-white">Role:</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                {user.role}
              </span>
            </p>
          </div>
          {user.company && (
            <div>
              <p className="text-gray-600 dark:text-gray-200">
                <span className="font-medium dark:text-white">Company:</span>{' '}
                {user.company}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Job Seeker Profile Edit Card */}
      {user.role === 'jobseeker' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold dark:text-white">
              My Profile
            </h2>
            <button
              onClick={() => setShowProfileEdit(!showProfileEdit)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showProfileEdit ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {!showProfileEdit ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600 dark:text-gray-200">
                  <span className="font-medium dark:text-white">Title:</span>{' '}
                  {editForm.title || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-200">
                  <span className="font-medium dark:text-white">Phone:</span>{' '}
                  {editForm.phone || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-200">
                  <span className="font-medium dark:text-white">Location:</span>{' '}
                  {editForm.location || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-200">
                  <span className="font-medium dark:text-white">Skills:</span>{' '}
                  {profile.skills?.length || 0} skills
                </p>
              </div>
              <Link
                to="/profile"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Full Profile
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Professional Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g., Senior Developer"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g., New York, NY"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={updateProfile}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save Changes
                </button>
                <Link
                  to="/profile"
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Full Profile Editor
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">
                Error loading data
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={() => {
                  setError('');
                  fetchDashboardData();
                }}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Seeker View */}
      {user.role === 'jobseeker' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold dark:text-white">
              My Applications
            </h2>
            <button
              onClick={fetchDashboardData}
              className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
              title="Refresh applications"
            >
              🔄 Refresh
            </button>
          </div>

          {applications.length === 0 ? (
            <EmptyState
              icon="📭"
              title="No applications yet"
              description="You haven't applied for any jobs. Start browsing available positions and submit your application!"
              actionText="Browse Jobs"
              actionLink="/jobs"
            />
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="border dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow dark:bg-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg dark:text-white">
                        {app.job?.title || 'Job no longer available'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-200">
                        {app.job?.company}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Applied: {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          app.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                            : app.status === 'reviewed'
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                              : app.status === 'shortlisted'
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recruiter View */}
      {user.role === 'recruiter' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold dark:text-white">
              My Posted Jobs
            </h2>
            <div className="flex gap-3">
              <button
                onClick={fetchDashboardData}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                title="Refresh jobs"
              >
                🔄 Refresh
              </button>
              <Link
                to="/post-job"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                + Post New Job
              </Link>
            </div>
          </div>

          {postedJobs.length === 0 ? (
            <EmptyState
              icon="💼"
              title="No jobs posted yet"
              description="You haven't posted any jobs. Create a job posting to start finding candidates!"
              action={
                <Link to="/post-job" className="btn-modern inline-block">
                  Post Your First Job
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {postedJobs.map((job) => (
                <div
                  key={job._id}
                  className="border dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow dark:bg-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg dark:text-white">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-200">
                        {job.location}
                      </p>
                      {typeof job.applicantCount !== 'undefined' && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {job.applicantCount} applicant
                          {job.applicantCount === 1 ? '' : 's'}
                        </p>
                      )}
                      <div className="flex items-center mt-2 space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            job.status === 'approved'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : job.status === 'pending'
                                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {job.status}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Posted: {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/jobs/${job._id}`}
                      className="ml-4 px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
                    >
                      {job.applicantCount > 0 ? 'View Applicants' : 'View Job'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recruiter Applicants Link */}
      {user.role === 'recruiter' && (
        <div className="mb-8">
          <Link
            to="/recruiter/applicants"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            View All Applicants
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
