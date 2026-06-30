import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SecurityQuestionsVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, questions } = location.state || {};

  const [answers, setAnswers] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if accessed directly without state
  if (!email || !questions) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 animated-bg">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Invalid page access. Please start the password reset process again.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  const handleAnswerChange = (index, value) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!answers[0].trim() || !answers[1].trim()) {
      setError('Please answer both security questions');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/verify-security-answers`, {
        email,
        answers,
      });

      navigate('/reset-password', { state: { resetToken: response.data.resetToken } });
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.msg ||
        'Incorrect answers. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animated-bg">
      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-4">
            <span className="text-white font-bold text-2xl">JP</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Security Questions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Answer your security questions to continue
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((question, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {question}
                </label>
                <input
                  type="password"
                  value={answers[i]}
                  onChange={(e) => handleAnswerChange(i, e.target.value)}
                  className="modern-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="Your answer"
                  required
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 btn-modern font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify Answers</span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
            <Link
              to="/forgot-password"
              className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              ← Back
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityQuestionsVerify;
