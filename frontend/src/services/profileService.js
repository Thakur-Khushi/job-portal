import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// Helper function to construct proper image URL
export const getImageUrl = (path) => {
  if (!path) return null;

  // If path already starts with http, return as-is
  if (path.startsWith('http')) return path;

  // If path starts with /, it's already relative to backend root
  if (path.startsWith('/')) {
    return `${BACKEND_URL}${path}`;
  }

  // Otherwise assume it's relative to uploads
  return `${BACKEND_URL}/uploads/${path}`;
};

// Get job seeker's profile
export const getProfile = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update job seeker's profile
export const updateProfile = async (profileData, token) => {
  try {
    const response = await axios.put(
      `${API_URL}/users/profile`,
      { profile: profileData },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Upload resume
export const uploadResume = async (file, token) => {
  try {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await axios.post(
      `${API_URL}/users/upload-resume`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Upload profile picture
export const uploadProfilePicture = async (file, token) => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await axios.post(
      `${API_URL}/users/upload-profile-picture`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all job seekers (for recruiters)
export const getAllJobSeekers = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/users/job-seekers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get specific job seeker profile (by ID)
export const getJobSeekerProfile = async (userId, token) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
