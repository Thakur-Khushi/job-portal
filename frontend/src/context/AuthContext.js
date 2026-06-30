import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
});

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(true);

  // Refs for refresh coordination — avoids stale-closure issues with state
  const isRefreshingRef = useRef(false);
  const refreshSubscribersRef = useRef([]);

  const notifySubscribers = (newToken) => {
    refreshSubscribersRef.current.forEach((cb) => cb(newToken));
    refreshSubscribersRef.current = [];
  };

  const addSubscriber = (cb) => {
    refreshSubscribersRef.current.push(cb);
  };

  // Keep auth header in sync with token state
  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axiosInstance.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  // Axios interceptor for automatic token refresh on 401
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
          originalRequest._retry = true;

          if (isRefreshingRef.current) {
            // Queue this request until the in-flight refresh completes
            return new Promise((resolve) => {
              addSubscriber((newToken) => {
                originalRequest.headers['x-auth-token'] = newToken;
                resolve(axiosInstance(originalRequest));
              });
            });
          }

          isRefreshingRef.current = true;

          try {
            const res = await axiosInstance.post('/auth/refresh-token', { refreshToken });
            const newAccessToken = res.data.accessToken;

            localStorage.setItem('accessToken', newAccessToken);
            setToken(newAccessToken);
            axiosInstance.defaults.headers.common['x-auth-token'] = newAccessToken;

            notifySubscribers(newAccessToken);
            isRefreshingRef.current = false;

            originalRequest.headers['x-auth-token'] = newAccessToken;
            return axiosInstance(originalRequest);
          } catch (refreshErr) {
            isRefreshingRef.current = false;
            refreshSubscribersRef.current = [];
            clearAuth();
            return Promise.reject(refreshErr);
          }
        }

        return Promise.reject(error);
      },
    );

    return () => axiosInstance.interceptors.response.eject(interceptor);
  }, [refreshToken]);

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete axiosInstance.defaults.headers.common['x-auth-token'];
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const loadUser = async () => {
    try {
      const res = await axiosInstance.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error(err);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const res = await axiosInstance.post('/auth/register', userData);
      return { success: true, user: res.data.user, msg: res.data.msg };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.msg || 'Registration failed',
      };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      axiosInstance.defaults.headers.common['x-auth-token'] = res.data.accessToken;
      setToken(res.data.accessToken);
      setRefreshToken(res.data.refreshToken);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.msg || 'Login failed',
      };
    }
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await axiosInstance.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuth();
    }
  };

  const value = { user, token, refreshToken, loading, register, login, logout, axiosInstance };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
