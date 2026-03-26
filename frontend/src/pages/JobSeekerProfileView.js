import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../services/profileService';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const JobSeekerProfileView = () => {
  const { userId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [jobSeeker, setJobSeeker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.role !== 'recruiter' && user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchJobSeekerProfile();
  }, [userId, token, user, navigate]);

  const fetchJobSeekerProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users/${userId}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobSeeker(response.data.user || response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load profile');
      console.error('Error fetching job seeker profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !jobSeeker) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-20">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <h2 className="font-semibold text-lg mb-2">Error</h2>
          <p>{error || 'Profile not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const profile = jobSeeker.profile || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex gap-6 items-start">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {profile.profilePicture ? (
                <img
                  src={getImageUrl(profile.profilePicture)}
                  alt={jobSeeker.name}
                  className="w-32 h-32 rounded-lg object-cover border-4 border-blue-100"
                  onError={(e) => {
                    e.target.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23E5E7EB"/%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center border-4 border-blue-100">
                  <span className="text-gray-500 text-xl">No Photo</span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {jobSeeker.name}
              </h1>
              {profile.title && (
                <p className="text-xl text-blue-600 font-semibold mb-2">
                  {profile.title}
                </p>
              )}
              <p className="text-gray-600 mb-4">
                <span className="font-semibold">Email:</span> {jobSeeker.email}
              </p>
              {jobSeeker.phone && (
                <p className="text-gray-600 mb-4">
                  <span className="font-semibold">Phone:</span>{' '}
                  {jobSeeker.phone}
                </p>
              )}
              {profile.location && (
                <p className="text-gray-600">
                  <span className="font-semibold">Location:</span>{' '}
                  {profile.location}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            {['overview', 'experience', 'education', 'skills', 'resume'].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-4 text-center font-semibold transition ${
                    activeTab === tab
                      ? 'border-b-4 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ),
            )}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                {profile.bio && (
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      About
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {profile.social &&
                  Object.values(profile.social).some((v) => v) && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        Social Links
                      </h3>
                      <div className="space-y-2">
                        {profile.social.linkedin && (
                          <p>
                            <span className="font-semibold">LinkedIn:</span>{' '}
                            <a
                              href={profile.social.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {profile.social.linkedin}
                            </a>
                          </p>
                        )}
                        {profile.social.github && (
                          <p>
                            <span className="font-semibold">GitHub:</span>{' '}
                            <a
                              href={profile.social.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {profile.social.github}
                            </a>
                          </p>
                        )}
                        {profile.social.portfolio && (
                          <p>
                            <span className="font-semibold">Portfolio:</span>{' '}
                            <a
                              href={profile.social.portfolio}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {profile.social.portfolio}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                {profile.preferences && (
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Job Preferences
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      {profile.preferences.desiredJobTypes?.length > 0 && (
                        <p>
                          <span className="font-semibold">Job Types:</span>{' '}
                          {profile.preferences.desiredJobTypes.join(', ')}
                        </p>
                      )}
                      {profile.preferences.desiredLocations?.length > 0 && (
                        <p>
                          <span className="font-semibold">
                            Desired Locations:
                          </span>{' '}
                          {profile.preferences.desiredLocations.join(', ')}
                        </p>
                      )}
                      {profile.preferences.expectedSalary && (
                        <p>
                          <span className="font-semibold">
                            Expected Salary:
                          </span>{' '}
                          {profile.preferences.expectedSalary}
                        </p>
                      )}
                      <p>
                        <span className="font-semibold">Remote Only:</span>{' '}
                        {profile.preferences.remoteOnly ? 'Yes' : 'No'}
                      </p>
                      <p>
                        <span className="font-semibold">
                          Open to Relocation:
                        </span>{' '}
                        {profile.preferences.openToRelocation ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Experience Tab */}
            {activeTab === 'experience' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Work Experience
                </h3>
                {profile.experience && profile.experience.length > 0 ? (
                  <div className="space-y-4">
                    {profile.experience.map((exp, idx) => (
                      <div
                        key={idx}
                        className="border-l-4 border-blue-600 pl-4"
                      >
                        <h4 className="text-lg font-semibold text-gray-900">
                          {exp.title}
                        </h4>
                        <p className="text-blue-600 font-semibold">
                          {exp.company}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {exp.location && <span>{exp.location} • </span>}
                          {exp.from &&
                            new Date(exp.from).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                            })}{' '}
                          -{' '}
                          {exp.current
                            ? 'Present'
                            : exp.to &&
                              new Date(exp.to).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                              })}
                        </p>
                        {exp.description && (
                          <p className="text-gray-700 mt-2">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No experience added yet</p>
                )}
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Education
                </h3>
                {profile.education && profile.education.length > 0 ? (
                  <div className="space-y-4">
                    {profile.education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="border-l-4 border-green-600 pl-4"
                      >
                        <h4 className="text-lg font-semibold text-gray-900">
                          {edu.degree}
                        </h4>
                        <p className="text-green-600 font-semibold">
                          {edu.institution}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {edu.field && <span>{edu.field} • </span>}
                          {edu.from &&
                            new Date(edu.from).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                            })}{' '}
                          -{' '}
                          {edu.to &&
                            new Date(edu.to).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                            })}
                        </p>
                        {edu.description && (
                          <p className="text-gray-700 mt-2">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No education added yet</p>
                )}
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Skills</h3>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No skills added yet</p>
                )}

                {profile.languages && profile.languages.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Languages
                    </h4>
                    <div className="space-y-2">
                      {profile.languages.map((lang, idx) => (
                        <p key={idx} className="text-gray-700">
                          <span className="font-semibold">{lang.name}:</span>{' '}
                          {lang.proficiency}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {profile.certifications &&
                  profile.certifications.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        Certifications
                      </h4>
                      <div className="space-y-2">
                        {profile.certifications.map((cert, idx) => (
                          <div key={idx} className="text-gray-700">
                            <p className="font-semibold">{cert.name}</p>
                            <p className="text-sm text-gray-600">
                              {cert.issuer} • {cert.year}
                            </p>
                            {cert.link && (
                              <a
                                href={cert.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                View Certificate
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Resume Tab */}
            {activeTab === 'resume' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Resume</h3>
                {profile.resume ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-700 mb-4">
                      <span className="font-semibold">Resume File:</span>{' '}
                      {profile.resumeOriginalName || 'Resume'}
                    </p>
                    <a
                      href={getImageUrl(profile.resume)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      Download Resume
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-500">No resume uploaded yet</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
          >
            Go Back
          </button>
          <button
            onClick={() => {
              window.location.href = `mailto:${jobSeeker.email}`;
            }}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerProfileView;
