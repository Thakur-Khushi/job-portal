import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    verifyEmail();
  }, [searchParams]);

  const verifyEmail = async () => {
    try {
      const token = searchParams.get('token');

      if (!token) {
        setError('No verification token found. Please check your email link.');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/verify-email`,
        { token },
      );

      setEmail(response.data.user.email);
      setVerified(true);
      setLoading(false);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.msg ||
        'Failed to verify email. Token may have expired.';
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setResendLoading(true);

      const emailToResend = email || searchParams.get('email') || '';

      if (!emailToResend) {
        setError('Email address not found. Please register again.');
        setResendLoading(false);
        return;
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/resend-verification-email`,
        { email: emailToResend },
      );

      setResendLoading(false);
      // Show success message via toast would be better, but we'll use direct feedback
      alert('Verification email sent! Check your inbox.');
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to resend email';
      setError(errorMsg);
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-8">
        {loading ? (
          <>
            <div className="text-center mb-6">
              <LoadingSpinner />
            </div>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Verifying your email address...
            </p>
          </>
        ) : verified ? (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Email Verified! ✓
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Your email has been successfully verified.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Email:{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {email}
                </span>
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Redirecting to login in 3 seconds...
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              Go to Login Now
            </button>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Verification Failed
              </h1>
            </div>

            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>

            <button
              onClick={handleResendEmail}
              disabled={resendLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200 mb-3"
            >
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>

            <button
              onClick={() => navigate('/register')}
              className="w-full bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              Register Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
