import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminPanel = () => {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const { token, user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch pending jobs (admin-only endpoint that respects status filter)
      const jobsRes = await axios.get(`${API_URL}/jobs/admin/all-jobs?status=pending`, {
        headers: { 'x-auth-token': token },
      });
      setPendingJobs(jobsRes.data?.jobs || []);

      // Fetch all users
      const usersRes = await axios.get(`${API_URL}/users`, {
        headers: { 'x-auth-token': token },
      });
      setUsers(usersRes.data?.users || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJobApproval = async (jobId, status) => {
    try {
      const endpoint = status === 'approved' ? 'approve' : 'reject';
      await axios.patch(
        `${API_URL}/jobs/${jobId}/${endpoint}`,
        {},
        { headers: { 'x-auth-token': token } },
      );
      fetchData();
    } catch (err) {
      console.error('Error updating job status:', err);
      alert('Error updating job status');
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      await axios.put(
        `${API_URL}/users/${userId}/role`,
        { role: newRole },
        { headers: { 'x-auth-token': token } },
      );
      fetchData();
    } catch (err) {
      console.error('Error updating user role:', err);
      alert('Error updating user role');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Access denied. Admin only.</p>
          <button
            onClick={() => (window.location.href = '/')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'jobs'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pending Jobs ({pendingJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Manage Users ({users.length})
        </button>
      </div>

      {/* Pending Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Pending Job Approvals</h2>

          {pendingJobs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No pending jobs for approval.
            </p>
          ) : (
            <div className="space-y-4">
              {pendingJobs.map((job) => (
                <div key={job._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <p className="text-gray-600">
                        {job.company} - {job.location}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          {job.type}
                        </span>
                        {job.category && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {job.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Posted by: {job.postedBy?.name || 'Unknown'} on{' '}
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleJobApproval(job._id, 'approved')}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleJobApproval(job._id, 'rejected')}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Manage Users</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Current Role</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'recruiter'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        onChange={(e) =>
                          handleUserRoleChange(user._id, e.target.value)
                        }
                        value={user.role}
                        className="px-2 py-1 border rounded-md text-sm"
                      >
                        <option value="jobseeker">Job Seeker</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
