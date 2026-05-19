import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../services/profileService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const JobSeekerProfile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [profile, setProfile] = useState({
    title: '',
    bio: '',
    location: '',
    phone: '',
    skills: [],
    languages: [],
    experience: [],
    education: [],
    certifications: [],
    social: {
      linkedin: '',
      github: '',
      portfolio: '',
      twitter: '',
    },
    preferences: {
      desiredJobTypes: [],
      desiredLocations: [],
      expectedSalary: '',
      remoteOnly: false,
      openToRelocation: false,
    },
    visibility: {
      showProfile: true,
      showContactInfo: false,
    },
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState({
    name: '',
    proficiency: 'Fluent',
  });
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    location: '',
    from: '',
    to: '',
    current: false,
    description: '',
  });
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    field: '',
    from: '',
    to: '',
    description: '',
  });
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    year: '',
    link: '',
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Log whenever profile state changes
  useEffect(() => {
    console.log('Profile state updated:', profile);
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('fetchProfile response:', res.data);

      // Handle both response formats - new format with profile property and legacy format
      if (res.data.profile) {
        console.log('Setting profile from res.data.profile:', res.data.profile);
        // Create new object reference to ensure React detects the change
        let profileData = { ...res.data.profile };

        // Merge phone from top-level user object if it exists
        if (res.data.user?.phone && !profileData.phone) {
          profileData.phone = res.data.user.phone;
        }

        setProfile(profileData);

        // Load profile picture from profile object with cache buster
        if (res.data.profile.profilePicture) {
          console.log(
            'Updating profile picture:',
            res.data.profile.profilePicture,
          );
          // Add cache-busting query parameter to prevent stale cache
          const picturePath = res.data.profile.profilePicture;
          const cacheParam = picturePath.includes('?') ? '&' : '?';
          const pictureWithCache = `${picturePath}${cacheParam}t=${Date.now()}`;
          setProfilePicture(pictureWithCache);
        }
      } else if (res.data.user && res.data.user.profile) {
        console.log(
          'Setting profile from res.data.user.profile:',
          res.data.user.profile,
        );
        // Create new object reference to ensure React detects the change
        let profileData = { ...res.data.user.profile };

        // Merge phone from top-level user object
        if (res.data.user?.phone && !profileData.phone) {
          profileData.phone = res.data.user.phone;
        }

        setProfile(profileData);

        // Load profile picture from profile object with cache buster
        if (res.data.user.profile.profilePicture) {
          console.log(
            'Updating profile picture:',
            res.data.user.profile.profilePicture,
          );
          // Add cache-busting query parameter to prevent stale cache
          const picturePath = res.data.user.profile.profilePicture;
          const cacheParam = picturePath.includes('?') ? '&' : '?';
          const pictureWithCache = `${picturePath}${cacheParam}t=${Date.now()}`;
          setProfilePicture(pictureWithCache);
        }
      }

      console.log('Profile loaded successfully');
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayInputChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value.split(',').map((item) => item.trim()),
    }));
  };

  const addSkill = () => {
    if (newSkill && !profile.skills.includes(newSkill)) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill],
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const addLanguage = () => {
    if (newLanguage.name) {
      setProfile((prev) => ({
        ...prev,
        languages: [...prev.languages, newLanguage],
      }));
      setNewLanguage({ name: '', proficiency: 'Fluent' });
    }
  };

  const removeLanguage = (index) => {
    setProfile((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  const addExperience = () => {
    if (newExperience.title && newExperience.company) {
      setProfile((prev) => ({
        ...prev,
        experience: [...prev.experience, newExperience],
      }));
      setNewExperience({
        title: '',
        company: '',
        location: '',
        from: '',
        to: '',
        current: false,
        description: '',
      });
    }
  };

  const removeExperience = (index) => {
    setProfile((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const addEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      setProfile((prev) => ({
        ...prev,
        education: [...prev.education, newEducation],
      }));
      setNewEducation({
        degree: '',
        institution: '',
        field: '',
        from: '',
        to: '',
        description: '',
      });
    }
  };

  const removeEducation = (index) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const addCertification = () => {
    if (newCertification.name) {
      setProfile((prev) => ({
        ...prev,
        certifications: [...prev.certifications, newCertification],
      }));
      setNewCertification({
        name: '',
        issuer: '',
        year: '',
        link: '',
      });
    }
  };

  const removeCertification = (index) => {
    setProfile((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    const fileInput = e.target;

    if (file) {
      setResumeFile(file);
      const formData = new FormData();
      formData.append('resume', file);

      try {
        const res = await axios.post(
          `${API_URL}/users/upload-resume`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setUploadProgress(percentCompleted);
            },
          },
        );

        // Add cache-busting query parameter
        const resumeUrl = `${res.data.resumeUrl}?t=${Date.now()}`;

        setProfile((prev) => ({
          ...prev,
          resume: resumeUrl,
          resumeOriginalName: file.name,
        }));
        setUploadProgress(0);

        // Refresh profile from backend to ensure sync
        await fetchProfile();

        alert('Resume uploaded successfully!');
      } catch (err) {
        console.error('Error uploading resume:', err);
        alert('Error uploading resume');
      } finally {
        // Reset file input so same file can be uploaded again
        fileInput.value = '';
      }
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    const fileInput = e.target;

    if (file) {
      const formData = new FormData();
      formData.append('profilePicture', file);

      try {
        const res = await axios.post(
          `${API_URL}/users/upload-profile-picture`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        // Add cache-busting query parameter to prevent browser caching
        const imageUrl = `${res.data.profilePictureUrl}?t=${Date.now()}`;

        // Update profile state with new picture (with cache buster)
        setProfile((prev) => ({
          ...prev,
          profilePicture: imageUrl,
          profilePictureOriginalName: file.name,
        }));
        setProfilePicture(imageUrl);

        // Refresh profile from backend to ensure sync
        await fetchProfile();

        alert('Profile picture uploaded successfully!');
      } catch (err) {
        console.error('Error uploading profile picture:', err);
        alert('Error uploading profile picture');
      } finally {
        // Reset file input so same file can be uploaded again
        fileInput.value = '';
      }
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      console.log('Sending profile update to:', `${API_URL}/users/profile`);
      console.log('Profile data being saved:', profile);

      // Send phone at both root level and in profile for compatibility with User schema
      const response = await axios.put(
        `${API_URL}/users/profile`,
        {
          profile,
          phone: profile.phone, // Also send phone at root level for user.phone field
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log('Profile save response:', response.data);

      // Merge the returned user phone field back into profile state
      const updatedProfile = {
        ...response.data.profile,
        phone: response.data.user?.phone || profile.phone, // Ensure phone is in local profile state
      };

      // Update local state with the complete profile data
      console.log('Updating profile state from response:', updatedProfile);
      setProfile(updatedProfile);

      // Also update profile picture if it exists
      if (updatedProfile.profilePicture) {
        setProfilePicture(updatedProfile.profilePicture);
      }

      console.log('Profile saved successfully:', response.data.msg);
      alert(
        '✓ Profile saved successfully! Your changes have been stored in the database.',
      );
    } catch (err) {
      console.error('Error saving profile - Full error:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg =
        err.response?.data?.msg ||
        err.response?.data?.error ||
        'Failed to save profile. Please try again.';
      alert(`✗ Error saving profile: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 animated-bg">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            My Professional Profile
          </h1>
          <p className="text-gray-600 text-lg">
            Showcase your skills and experience to employers
          </p>
        </div>
        {/* two-column profile layout */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* sidebar: wider on larger screens to avoid text overlap */}
          <div className="w-full lg:w-80 bg-white/10 backdrop-blur-lg rounded-xl p-6">
            {/* Profile Header Card */}
            <div className="modern-card mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-3xl opacity-20"></div>

              {/* stack avatar and info vertically so picture is always on top */}
              <div className="relative z-10 flex flex-col items-center gap-5">
                {/* Profile Picture */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-1 overflow-hidden">
                    {profilePicture ? (
                      <img
                        src={getImageUrl(profilePicture)}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.target.src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23E5E7EB"/%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full">
                        <span className="text-4xl text-gray-400">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                    />
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </label>
                </div>

                {/* Basic Info */}
                {/* make text centered since layout is vertical */}
                <div className="flex-1 text-center w-full">
                  <h2 className="text-3xl font-bold text-gray-800 mb-1">
                    {user?.name}
                  </h2>
                  <p className="text-lg text-gray-600 mb-4">
                    {profile.title || 'Add your professional title'}
                  </p>
                  <div className="flex flex-col gap-2 text-sm">
                    <span className="flex items-center justify-center text-gray-600 whitespace-normal break-words">
                      <svg
                        className="w-4 h-4 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="truncate">{user?.email}</span>
                    </span>
                    {profile.phone && (
                      <span className="flex items-center justify-center text-gray-600">
                        <svg
                          className="w-4 h-4 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        {profile.phone}
                      </span>
                    )}
                    {profile.location && (
                      <span className="flex items-center justify-center text-gray-600">
                        <svg
                          className="w-4 h-4 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {profile.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Resume Section */}
                <div className="text-center md:text-right">
                  <div className="mb-3">
                    <label className="btn-modern inline-block cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                        className="hidden"
                      />
                      <span className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                        Upload Resume
                      </span>
                    </label>
                  </div>
                  {profile.resume && (
                    <a
                      href={getImageUrl(profile.resume)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Current Resume: {profile.resumeOriginalName}
                    </a>
                  )}
                  {uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:flex-1">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: 'basic', label: 'Basic Info', icon: '👤' },
                { id: 'skills', label: 'Skills & Languages', icon: '🎯' },
                { id: 'experience', label: 'Experience', icon: '💼' },
                { id: 'education', label: 'Education', icon: '🎓' },
                { id: 'certifications', label: 'Certifications', icon: '📜' },
                { id: 'preferences', label: 'Job Preferences', icon: '⚙️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
            {/* Tab Content */}
            <div className="modern-card">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6 animate__animated animate__fadeIn">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Basic Information
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Professional Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={profile.title || ''}
                        onChange={handleInputChange}
                        className="modern-input"
                        placeholder="e.g., Senior Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={profile.location || ''}
                        onChange={handleInputChange}
                        className="modern-input"
                        placeholder="e.g., New York, NY"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone || ''}
                        onChange={handleInputChange}
                        className="modern-input"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Bio / Summary
                    </label>
                    <textarea
                      name="bio"
                      value={profile.bio || ''}
                      onChange={handleInputChange}
                      rows="5"
                      className="modern-input"
                      placeholder="Write a brief summary about yourself, your experience, and career goals..."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-4">
                      Social Links
                    </label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          name="social.linkedin"
                          value={profile.social?.linkedin || ''}
                          onChange={handleInputChange}
                          className="modern-input"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          GitHub
                        </label>
                        <input
                          type="url"
                          name="social.github"
                          value={profile.social?.github || ''}
                          onChange={handleInputChange}
                          className="modern-input"
                          placeholder="https://github.com/username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Portfolio
                        </label>
                        <input
                          type="url"
                          name="social.portfolio"
                          value={profile.social?.portfolio || ''}
                          onChange={handleInputChange}
                          className="modern-input"
                          placeholder="https://yourportfolio.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Twitter
                        </label>
                        <input
                          type="url"
                          name="social.twitter"
                          value={profile.social?.twitter || ''}
                          onChange={handleInputChange}
                          className="modern-input"
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Tab */}
              {activeTab === 'skills' && (
                <div className="space-y-6 animate__animated animate__fadeIn">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Skills & Languages
                  </h3>

                  {/* Skills */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Skills
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {profile.skills?.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center group dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-blue-600 hover:text-red-600 transition dark:text-blue-300 dark:hover:text-red-400"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="modern-input flex-1 dark:bg-gray-800 dark:text-blue-100 dark:placeholder:text-blue-300"
                        placeholder="Add a skill (e.g., React, Python)"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <button
                        onClick={addSkill}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Languages
                    </label>
                    <div className="space-y-2 mb-3">
                      {profile.languages?.map((lang, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-800"
                        >
                          <div>
                            <span className="font-medium dark:text-blue-100">{lang.name}</span>
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                              - {lang.proficiency}
                            </span>
                          </div>
                          <button
                            onClick={() => removeLanguage(index)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={newLanguage.name}
                        onChange={(e) =>
                          setNewLanguage({
                            ...newLanguage,
                            name: e.target.value,
                          })
                        }
                        className="modern-input dark:bg-gray-800 dark:text-blue-100 dark:placeholder:text-blue-300"
                        placeholder="Language"
                      />
                      <select
                        value={newLanguage.proficiency}
                        onChange={(e) =>
                          setNewLanguage({
                            ...newLanguage,
                            proficiency: e.target.value,
                          })
                        }
                        className="modern-input dark:bg-gray-800 dark:text-blue-100"
                      >
                        <option value="Basic">Basic</option>
                        <option value="Conversational">Conversational</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Native">Native</option>
                      </select>
                      <button
                        onClick={addLanguage}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white"
                      >
                        Add Language
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Experience Tab */}
              {activeTab === 'experience' && (
                <div className="space-y-6 animate__animated animate__fadeIn">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Work Experience
                  </h3>

                  {/* Experience List */}
                  <div className="space-y-4 mb-6">
                    {profile.experience?.map((exp, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg relative group"
                      >
                        <button
                          onClick={() => removeExperience(index)}
                          className="absolute top-2 right-2 text-red-600 opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                        <h4 className="font-bold text-lg">{exp.title}</h4>
                        <p className="text-gray-600">
                          {exp.company} • {exp.location}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(exp.from).toLocaleDateString()} -{' '}
                          {exp.current
                            ? 'Present'
                            : new Date(exp.to).toLocaleDateString()}
                        </p>
                        <p className="mt-2 text-gray-700">{exp.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Experience Form */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-lg mb-4">
                      Add Experience
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Job Title"
                        value={newExperience.title}
                        onChange={(e) =>
                          setNewExperience({
                            ...newExperience,
                            title: e.target.value,
                          })
                        }
                        className="modern-input"
                      />
                      <input
                        type="text"
                        placeholder="Company"
                        value={newExperience.company}
                        onChange={(e) =>
                          setNewExperience({
                            ...newExperience,
                            company: e.target.value,
                          })
                        }
                        className="modern-input"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={newExperience.location}
                        onChange={(e) =>
                          setNewExperience({
                            ...newExperience,
                            location: e.target.value,
                          })
                        }
                        className="modern-input"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="month"
                          placeholder="From"
                          value={newExperience.from}
                          onChange={(e) =>
                            setNewExperience({
                              ...newExperience,
                              from: e.target.value,
                            })
                          }
                          className="modern-input"
                        />
                        <input
                          type="month"
                          placeholder="To"
                          value={newExperience.to}
                          onChange={(e) =>
                            setNewExperience({
                              ...newExperience,
                              to: e.target.value,
                            })
                          }
                          className="modern-input"
                          disabled={newExperience.current}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newExperience.current}
                            onChange={(e) =>
                              setNewExperience({
                                ...newExperience,
                                current: e.target.checked,
                              })
                            }
                            className="rounded border-gray-300"
                          />
                          <span>I currently work here</span>
                        </label>
                      </div>
                      <div className="md:col-span-2">
                        <textarea
                          placeholder="Description"
                          value={newExperience.description}
                          onChange={(e) =>
                            setNewExperience({
                              ...newExperience,
                              description: e.target.value,
                            })
                          }
                          rows="3"
                          className="modern-input"
                        />
                      </div>
                    </div>
                    <button
                      onClick={addExperience}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                    >
                      Add Experience
                    </button>
                  </div>
                </div>
              )}

              {/* Education Tab */}
              {activeTab === 'education' && (
                <div className="space-y-6 animate__animated animate__fadeIn">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Education
                  </h3>

                  {/* Education List */}
                  <div className="space-y-4 mb-6">
                    {profile.education?.map((edu, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg relative group"
                      >
                        <button
                          onClick={() => removeEducation(index)}
                          className="absolute top-2 right-2 text-red-600 opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                        <h4 className="font-bold text-lg">{edu.degree}</h4>
                        <p className="text-gray-600">
                          {edu.institution} • {edu.field}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(edu.from).toLocaleDateString()} -{' '}
                          {edu.to
                            ? new Date(edu.to).toLocaleDateString()
                            : 'Present'}
                        </p>
                        <p className="mt-2 text-gray-700">{edu.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Education Form */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-lg mb-4">
                      Add Education
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Degree"
                        value={newEducation.degree}
                        onChange={(e) =>
                          setNewEducation({
                            ...newEducation,
                            degree: e.target.value,
                          })
                        }
                        className="modern-input"
                      />
                      <input
                        type="text"
                        placeholder="Institution"
                        value={newEducation.institution}
                        onChange={(e) =>
                          setNewEducation({
                            ...newEducation,
                            institution: e.target.value,
                          })
                        }
                        className="modern-input"
                      />
                      <input
                        type="text"
                        placeholder="Field of Study"
                        value={newEducation.field}
                        onChange={(e) =>
                          setNewEducation({
                            ...newEducation,
                            field: e.target.value,
                          })
                        }
                        className="modern-input"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="month"
                          placeholder="From"
                          value={newEducation.from}
                          onChange={(e) =>
                            setNewEducation({
                              ...newEducation,
                              from: e.target.value,
                            })
                          }
                          className="modern-input"
                        />
                        <input
                          type="month"
                          placeholder="To"
                          value={newEducation.to}
                          onChange={(e) =>
                            setNewEducation({
                              ...newEducation,
                              to: e.target.value,
                            })
                          }
                          className="modern-input"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <textarea
                          placeholder="Description"
                          value={newEducation.description}
                          onChange={(e) =>
                            setNewEducation({
                              ...newEducation,
                              description: e.target.value,
                            })
                          }
                          rows="3"
                          className="modern-input"
                        />
                      </div>
                    </div>
                    <button
                      onClick={addEducation}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                    >
                      Add Education
                    </button>
                  </div>
                </div>
              )}

              {/* Certifications Tab */}
              {activeTab === 'certifications' && (
                <div className="space-y-6 animate__animated animate__fadeIn">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Certifications
                  </h3>

                  {/* Certifications List */}
                  <div className="space-y-4 mb-6">
                    {profile.certifications?.map((cert, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg relative group"
                      >
                        <button
                          onClick={() => removeCertification(index)}
                          className="absolute top-2 right-2 text-red-600 opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                        <h4 className="font-bold text-lg">{cert.name}</h4>
                        <p className="text-gray-600">
                          {cert.issuer} • {cert.year}
                        </p>
                        {cert.link && (
                          <a
                            href={cert.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm"
                          >
                            View Certificate
                          </a>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Certification Form */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-lg mb-4">
                      Add Certification
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Certification Name"
                        value={newCertification.name}
                        onChange={(e) =>
                          setNewCertification({
                            ...newCertification,
                            name: e.target.value,
                          })
                        }
                        className="modern-input"
                      />
                      <input
                        type="text"
                        placeholder="Issuing Organization"
                        value={newCertification.issuer}
                        onChange={(e) =>
                          setNewCertification({
                            ...newCertification,
                            issuer: e.target.value,
                          })
                        }
                        className="modern-input"
                      />
                      <input
                        type="text"
                        placeholder="Year"
                        value={newCertification.year}
                        onChange={(e) =>
                          setNewCertification({
                            ...newCertification,
                            year: e.target.value,
                          })
                        }
                        className="modern-input"
                      />
                      <input
                        type="url"
                        placeholder="Certificate Link (optional)"
                        value={newCertification.link}
                        onChange={(e) =>
                          setNewCertification({
                            ...newCertification,
                            link: e.target.value,
                          })
                        }
                        className="modern-input"
                      />
                    </div>
                    <button
                      onClick={addCertification}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                    >
                      Add Certification
                    </button>
                  </div>
                </div>
              )}

              {/* Job Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6 animate__animated animate__fadeIn">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Job Preferences
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Desired Job Types
                      </label>
                      <select
                        multiple
                        value={profile.preferences?.desiredJobTypes || []}
                        onChange={(e) => {
                          const values = Array.from(
                            e.target.selectedOptions,
                            (option) => option.value,
                          );
                          setProfile((prev) => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              desiredJobTypes: values,
                            },
                          }));
                        }}
                        className="modern-input h-32"
                      >
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>
                      <p className="text-sm text-gray-500 mt-1">
                        Hold Ctrl to select multiple
                      </p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Desired Locations
                      </label>
                      <input
                        type="text"
                        value={
                          profile.preferences?.desiredLocations?.join(', ') ||
                          ''
                        }
                        onChange={(e) => {
                          const locations = e.target.value
                            .split(',')
                            .map((loc) => loc.trim());
                          setProfile((prev) => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              desiredLocations: locations,
                            },
                          }));
                        }}
                        className="modern-input"
                        placeholder="New York, Remote, London (comma separated)"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Expected Salary
                      </label>
                      <input
                        type="text"
                        name="preferences.expectedSalary"
                        value={profile.preferences?.expectedSalary || ''}
                        onChange={handleInputChange}
                        className="modern-input"
                        placeholder="e.g., $80,000 - $100,000"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="preferences.remoteOnly"
                        checked={profile.preferences?.remoteOnly || false}
                        onChange={handleInputChange}
                        className="w-5 h-5 rounded border-gray-300"
                      />
                      <span className="text-gray-700">
                        Remote only positions
                      </span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="preferences.openToRelocation"
                        checked={profile.preferences?.openToRelocation || false}
                        onChange={handleInputChange}
                        className="w-5 h-5 rounded border-gray-300"
                      />
                      <span className="text-gray-700">Open to relocation</span>
                    </label>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-lg mb-4">
                      Privacy Settings
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="visibility.showProfile"
                          checked={profile.visibility?.showProfile || false}
                          onChange={handleInputChange}
                          className="w-5 h-5 rounded border-gray-300"
                        />
                        <span className="text-gray-700">
                          Make my profile visible to recruiters
                        </span>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="visibility.showContactInfo"
                          checked={profile.visibility?.showContactInfo || false}
                          onChange={handleInputChange}
                          className="w-5 h-5 rounded border-gray-300"
                        />
                        <span className="text-gray-700">
                          Show contact information to recruiters
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={loading}
                  className="btn-modern px-8 py-3"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Profile'
                  )}
                </button>
              </div>
            </div>{' '}
            {/* end modern-card tab content */}
          </div>{' '}
          {/* end main column */}
        </div>{' '}
        {/* end two-col wrapper */}
      </div>
    </div>
  );
};

export default JobSeekerProfile;
