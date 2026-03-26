import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';

export default function CheckEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email] = useState(location.state?.email || '');
  const [resendLoading, setResendLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const handleResendEmail = async () => {
    try {
      if (!email) {
        setToastMessage('Email address not found');
        setToastType('error');
        setShowToast(true);
        return;
      }

      setResendLoading(true);

      await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/resend-verification-email`,
        { email },
      );

      setToastMessage(
        'Verification email sent successfully! Check your inbox.',
      );
      setToastType('success');
      setShowToast(true);
      setResendLoading(false);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to resend email';
      setToastMessage(errorMsg);
      setToastType('error');
      setShowToast(true);
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
            Check Your Email
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            We've sent a verification link to:
          </p>
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 break-all">
            {email || 'your email address'}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            ✓ Check your inbox (and spam folder) for an email from Job Portal
            with verification instructions.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            The verification link expires in <strong>24 hours</strong>.
          </p>

          <button
            onClick={handleResendEmail}
            disabled={resendLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            {resendLoading ? 'Sending...' : 'Resend Verification Email'}
          </button>

          <Link
            to="/login"
            className="block w-full text-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Go to Login
          </Link>
        </div>

        <p className="text-center text-gray-500 dark:text-gray-400 text-xs mt-6">
          You'll need to verify your email before you can log in.
        </p>
      </div>
    </div>
  );
}
