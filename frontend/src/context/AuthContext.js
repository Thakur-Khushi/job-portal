import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure axios for CORS requests with timeout
const axiosInstance = axios.create({
  timeout: 30000, // 30 second timeout
  withCredentials: true,
});

// DEPRECATED: Keep for backward compatibility, but use axiosInstance for new code
axios.defaults.withCredentials = true;
axios.defaults.timeout = 30000;

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem('refreshToken'),
  );
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSubscribers, setRefreshSubscribers] = useState([]);

  // Set axios default header
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  }

  // Subscribe to token refresh
  const onRefreshed = (newToken) => {
    refreshSubscribers.forEach((callback) => callback(newToken));
  };

  // Axios interceptor for automatic token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't already retried
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          refreshToken
        ) {
          originalRequest._retry = true;

          try {
            if (!isRefreshing) {
              setIsRefreshing(true);

              // Attempt to refresh token
              const res = await axios.post(`${API_URL}/auth/refresh-token`, {
                refreshToken,
              });

              const newAccessToken = res.data.accessToken;
              localStorage.setItem('accessToken', newAccessToken);
              setToken(newAccessToken);
              axios.defaults.headers.common['x-auth-token'] = newAccessToken;

              setIsRefreshing(false);
              onRefreshed(newAccessToken);
            }

            // Retry original request with new token
            const newToken = localStorage.getItem('accessToken');
            originalRequest.headers['x-auth-token'] = newToken;
            return axios(originalRequest);
          } catch (refreshErr) {
            // Refresh failed, logout user
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setToken(null);
            setRefreshToken(null);
            setUser(null);
            delete axios.defaults.headers.common['x-auth-token'];
            setIsRefreshing(false);
            return Promise.reject(refreshErr);
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token, refreshToken, isRefreshing]);

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`);
      setUser(res.data);
    } catch (err) {
      console.error(err);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setRefreshToken(null);
      delete axios.defaults.headers.common['x-auth-token'];
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      // Registration now requires email verification, so don't set token yet
      // Just return success with user info
      return {
        success: true,
        user: res.data.user,
        msg: res.data.msg,
      };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.msg || 'Registration failed',
      };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      // Store both access and refresh tokens
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      axios.defaults.headers.common['x-auth-token'] = res.data.accessToken;
      setToken(res.data.accessToken);
      setRefreshToken(res.data.refreshToken);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      // Check if error is due to unverified email
      if (err.response?.status === 403 && err.response?.data?.unverifiedEmail) {
        return {
          success: false,
          error: err.response?.data?.msg || 'Email not verified',
          unverifiedEmail: true,
          email: err.response?.data?.email,
        };
      }
      return {
        success: false,
        error: err.response?.data?.msg || 'Login failed',
      };
    }
  };

  const logout = async () => {
    try {
      // Notify backend to revoke refresh token
      if (refreshToken) {
        await axios.post(
          `${API_URL}/auth/logout`,
          { refreshToken },
          {
            headers: {
              'x-auth-token': token,
            },
          },
        );
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      delete axios.defaults.headers.common['x-auth-token'];
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    refreshToken,
    loading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
