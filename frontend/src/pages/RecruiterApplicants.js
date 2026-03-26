import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getImageUrl } from '../services/profileService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RecruiterApplicants = () => {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || (user.role !== 'recruiter' && user.role !== 'admin')) return;
    fetchApplicants();
    // eslint-disable-next-line
  }, [user, token]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/applications/recruiter`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Handle both array and object response formats
      const applicationsData = response.data?.applications || response.data || [];
      setApplications(Array.isArray(applicationsData) ? applicationsData : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load applicants');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applicants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Applicants for Your Jobs
        </h1>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            {error}
          </div>
        )}
        {applications.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg">No applicants found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead>
                <tr>
                  <th className="py-3 px-4 border-b text-left">Job Title</th>
                  <th className="py-3 px-4 border-b text-left">Applicant</th>
                  <th className="py-3 px-4 border-b text-left">Email</th>
                  <th className="py-3 px-4 border-b text-left">Applied At</th>
                  <th className="py-3 px-4 border-b text-left">Resume</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {app.job?.title || 'N/A'}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {app.applicant?.name || 'N/A'}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {app.applicant?.email || 'N/A'}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {new Date(app.appliedAt).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {app.resume ? (
                        <a
                          href={getImageUrl(app.resume)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Resume
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterApplicants;
