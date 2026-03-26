import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../services/profileService';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RecruiterJobSeekers = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [jobSeekers, setJobSeekers] = useState([]);
  const [filteredSeekers, setFilteredSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [allSkills, setAllSkills] = useState([]);

  useEffect(() => {
    if (user?.role !== 'recruiter' && user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchJobSeekers();
  }, [token, user, navigate]);

  useEffect(() => {
    filterJobSeekers();
  }, [searchTerm, filterSkill, jobSeekers]);

  const fetchJobSeekers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter only job seekers with profiles
      const seekers = (
        Array.isArray(response.data) ? response.data : response.data.users || []
      ).filter((u) => u.role === 'jobseeker' && u.profile);

      setJobSeekers(seekers);

      // Extract all unique skills
      const skillsSet = new Set();
      seekers.forEach((seeker) => {
        if (seeker.profile?.skills) {
          seeker.profile.skills.forEach((skill) => skillsSet.add(skill));
        }
      });
      setAllSkills(Array.from(skillsSet).sort());
      setError('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load job seekers');
      console.error('Error fetching job seekers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterJobSeekers = () => {
    let filtered = jobSeekers;

    // Search by name, email, title, or location
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (seeker) =>
          seeker.name?.toLowerCase().includes(term) ||
          seeker.email?.toLowerCase().includes(term) ||
          seeker.profile?.title?.toLowerCase().includes(term) ||
          seeker.profile?.location?.toLowerCase().includes(term),
      );
    }

    // Filter by skill
    if (filterSkill) {
      filtered = filtered.filter((seeker) =>
        seeker.profile?.skills?.includes(filterSkill),
      );
    }

    setFilteredSeekers(filtered);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job seekers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Job Seekers</h1>
          <p className="text-gray-600 text-lg">
            Browse and review job seeker profiles
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            {error}
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, email, title, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Skill Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Skill
              </label>
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="">All Skills</option>
                {allSkills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Found{' '}
            <span className="font-semibold text-gray-900">
              {filteredSeekers.length}
            </span>{' '}
            job seeker{filteredSeekers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Job Seekers Grid */}
        {filteredSeekers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSeekers.map((seeker) => (
              <div
                key={seeker._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
              >
                {/* Profile Picture */}
                <div className="h-40 bg-gradient-to-r from-blue-100 to-blue-50 flex items-center justify-center overflow-hidden">
                  {seeker.profile?.profilePicture ? (
                    <img
                      src={getImageUrl(seeker.profile.profilePicture)}
                      alt={seeker.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23E5E7EB"/%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-lg">No Photo</span>
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {seeker.name}
                  </h3>
                  {seeker.profile?.title && (
                    <p className="text-blue-600 font-semibold text-sm mb-2">
                      {seeker.profile.title}
                    </p>
                  )}

                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    {seeker.profile?.location && (
                      <p>
                        <span className="font-semibold">Location:</span>{' '}
                        {seeker.profile.location}
                      </p>
                    )}
                    <p>
                      <span className="font-semibold">Email:</span>{' '}
                      <a
                        href={`mailto:${seeker.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {seeker.email}
                      </a>
                    </p>
                    {seeker.phone && (
                      <p>
                        <span className="font-semibold">Phone:</span>{' '}
                        {seeker.phone}
                      </p>
                    )}
                  </div>

                  {/* Skills Preview */}
                  {seeker.profile?.skills &&
                    seeker.profile.skills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                          Skills
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {seeker.profile.skills
                            .slice(0, 3)
                            .map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold"
                              >
                                {skill}
                              </span>
                            ))}
                          {seeker.profile.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                              +{seeker.profile.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Bio Preview */}
                  {seeker.profile?.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {seeker.profile.bio}
                    </p>
                  )}

                  {/* View Profile Button */}
                  <button
                    onClick={() =>
                      navigate(`/recruiter/job-seeker/${seeker._id}`)
                    }
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg">No job seekers found</p>
            <p className="text-gray-500 mt-2">
              Try adjusting your search filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterJobSeekers;
