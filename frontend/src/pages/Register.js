import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  validateEmail,
  validatePassword,
  getPasswordStrength,
} from '../utils/validation';
import Toast from '../components/Toast';

const SECURITY_QUESTIONS = [
  "What is your favorite color?",
  "What is your favorite food?",
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'jobseeker',
    company: '',
  });
  const [securityQuestions, setSecurityQuestions] = useState([
    { question: '', answer: '' },
    { question: '', answer: '' },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    setError('');
  };

  const handleSecurityQuestionChange = (index, field, value) => {
    setSecurityQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setFieldErrors((prev) => ({ ...prev, [`sq_${index}_${field}`]: '' }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate step 3 fields
    const sqErrors = {};
    if (!securityQuestions[0].question) sqErrors.sq_0_question = 'Please select a question';
    if (!securityQuestions[0].answer.trim()) sqErrors.sq_0_answer = 'Answer is required';
    if (!securityQuestions[1].question) sqErrors.sq_1_question = 'Please select a question';
    if (!securityQuestions[1].answer.trim()) sqErrors.sq_1_answer = 'Answer is required';
    if (
      securityQuestions[0].question &&
      securityQuestions[1].question &&
      securityQuestions[0].question === securityQuestions[1].question
    ) {
      sqErrors.sq_1_question = 'Please choose a different question';
    }
    if (Object.keys(sqErrors).length > 0) {
      setFieldErrors(sqErrors);
      setLoading(false);
      return;
    }

    const result = await register({ ...formData, securityQuestions });

    if (result.success) {
      setToastMessage('✨ Account created successfully! You can now log in.');
      setShowToast(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const nextStep = () => {
    if (step === 1) {
      const errors = {};
      if (!formData.name.trim()) errors.name = 'Full name is required';
      if (!formData.email.trim()) errors.email = 'Email is required';
      if (!validateEmail(formData.email))
        errors.email = 'Please enter a valid email';
      if (!formData.password) errors.password = 'Password is required';
      if (!validatePassword(formData.password))
        errors.password = 'Password must be at least 6 characters';

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setError('');
        return;
      }
      setFieldErrors({});
      setStep(2);
    } else if (step === 2) {
      if (formData.role === 'recruiter' && !formData.company.trim()) {
        setFieldErrors({ company: 'Company name is required for recruiters' });
        return;
      }
      setFieldErrors({});
      setStep(3);
    }
  };

  const prevStep = () => {
    setStep((s) => s - 1);
    setError('');
  };

  const passwordStrength = formData.password
    ? getPasswordStrength(formData.password)
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animated-bg">
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
      <div className="max-w-md w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div
              className={`flex-1 h-2 rounded-l-full ${step >= 1 ? 'bg-green-500' : 'bg-gray-300'}`}
            ></div>
            <div
              className={`flex-1 h-2 mx-0.5 ${step >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}
            ></div>
            <div
              className={`flex-1 h-2 rounded-r-full ${step >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-white">
            <span>Account</span>
            <span>Profile</span>
            <span>Security</span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500 dark:bg-gray-900/70 dark:backdrop-blur-sm dark:shadow-none">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold gradient-text">
              Join JobPortal
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Create your account in seconds</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-5 animate__animated animate__fadeInLeft">
                <div>
                  <label
                    htmlFor="name-input"
                    className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200"
                  >
                    <span className="flex items-center">
                      <span className="mr-2">👤</span> Full Name
                    </span>
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`modern-input ${fieldErrors.name ? 'border-red-500' : ''} dark:placeholder:text-blue-200`}
                    placeholder="John Doe or Jane Smith"
                    required
                    aria-label="Full name"
                    aria-describedby="name-error"
                  />
                  {fieldErrors.name && (
                    <p id="name-error" className="mt-1 text-sm text-red-600">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email-input"
                    className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200"
                  >
                    <span className="flex items-center">
                      <span className="mr-2">📧</span> Email Address
                    </span>
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`modern-input ${fieldErrors.email ? 'border-red-500' : ''} dark:placeholder:text-blue-200`}
                    placeholder="you@company.com"
                    required
                    aria-label="Email address"
                    aria-describedby="email-error"
                  />
                  {fieldErrors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-600">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">
                    <span className="flex items-center">
                      <span className="mr-2">🔒</span> Password
                    </span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`modern-input ${fieldErrors.password ? 'border-red-500' : ''} dark:placeholder:text-blue-200`}
                    placeholder="Min 6 characters"
                  />
                  {fieldErrors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {fieldErrors.password}
                    </p>
                  )}
                  {passwordStrength && (
                    <div className="mt-2 flex items-center gap-2">
                      <p className="text-xs text-gray-600">Strength:</p>
                      <p
                        className={`text-xs font-semibold ${passwordStrength.color}`}
                      >
                        {passwordStrength.level}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-modern w-full group"
                >
                  Next Step
                  <span className="ml-2 group-hover:translate-x-1 inline-block transition">
                    →
                  </span>
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate__animated animate__fadeInRight">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">
                    <span className="flex items-center">
                      <span className="mr-2">🎯</span> I am a
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, role: 'jobseeker' })
                      }
                      className={`p-4 rounded-xl border-2 transition-all ${
                          formData.role === 'jobseeker'
                            ? 'border-blue-600 bg-blue-50 scale-105 dark:bg-blue-900/40 dark:border-blue-400'
                            : 'border-gray-200 hover:border-blue-300 dark:border-gray-600 dark:hover:border-blue-400'
                        }`}
                    >
                      <span className="text-3xl mb-2 block">👨‍💼</span>
                      <span className="font-medium">Job Seeker</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, role: 'recruiter' })
                      }
                      className={`p-4 rounded-xl border-2 transition-all ${
                          formData.role === 'recruiter'
                            ? 'border-blue-600 bg-blue-50 scale-105 dark:bg-blue-900/40 dark:border-blue-400'
                            : 'border-gray-200 hover:border-blue-300 dark:border-gray-600 dark:hover:border-blue-400'
                        }`}
                    >
                      <span className="text-3xl mb-2 block">🏢</span>
                      <span className="font-medium">Recruiter</span>
                    </button>
                  </div>
                </div>

                {formData.role === 'recruiter' && (
                  <div className="animate__animated animate__fadeIn">
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">
                      <span className="flex items-center">
                        <span className="mr-2">🏢</span> Company Name
                      </span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className={`modern-input dark:placeholder:text-blue-200 ${fieldErrors.company ? 'border-red-500' : ''}`}
                      placeholder="e.g. Tech Corp Inc."
                      required
                    />
                    {fieldErrors.company && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.company}</p>
                    )}
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 btn-modern"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate__animated animate__fadeInRight">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Choose 2 security questions. You'll need to answer these to reset your password.
                </p>

                {[0, 1].map((i) => (
                  <div key={i} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Question {i + 1}
                    </label>
                    <select
                      value={securityQuestions[i].question}
                      onChange={(e) => handleSecurityQuestionChange(i, 'question', e.target.value)}
                      className={`modern-input ${fieldErrors[`sq_${i}_question`] ? 'border-red-500' : ''}`}
                    >
                      <option value="">-- Select a question --</option>
                      {SECURITY_QUESTIONS.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                    {fieldErrors[`sq_${i}_question`] && (
                      <p className="text-sm text-red-600">{fieldErrors[`sq_${i}_question`]}</p>
                    )}
                    <input
                      type="password"
                      placeholder="Your answer"
                      value={securityQuestions[i].answer}
                      onChange={(e) => handleSecurityQuestionChange(i, 'answer', e.target.value)}
                      className={`modern-input ${fieldErrors[`sq_${i}_answer`] ? 'border-red-500' : ''}`}
                    />
                    {fieldErrors[`sq_${i}_answer`] && (
                      <p className="text-sm text-red-600">{fieldErrors[`sq_${i}_answer`]}</p>
                    )}
                  </div>
                ))}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-modern"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      'Create Account ✨'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-500 transition"
            >
              Already have an account?{' '}
              <span className="font-semibold underline">Sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
