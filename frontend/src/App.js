import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import Dashboard from './pages/Dashboard';
import PostJob from './pages/PostJob';
import AdminPanel from './pages/AdminPanel';
import JobSeekerProfile from './pages/JobSeekerProfile';
import JobSeekerProfileView from './pages/JobSeekerProfileView';
import RecruiterJobSeekers from './pages/RecruiterJobSeekers';
import RecruiterApplicants from './pages/RecruiterApplicants';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="modern-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Add top padding to avoid overlap with fixed Navbar */}
      <div className="flex-grow pt-20 md:pt-24">
        <Routes>
          <Route path="/" element={<Navigate to="/jobs" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['jobseeker']}>
                <JobSeekerProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter/job-seekers"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                <RecruiterJobSeekers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter/job-seeker/:userId"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                <JobSeekerProfileView />
              </ProtectedRoute>
            }
          />

          <Route
            path="/post-job"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                <PostJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter/applicants"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                <RecruiterApplicants />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
