import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setProfileDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-lg ${
        scrolled
          ? isDark
            ? 'bg-gray-900/95 shadow-xl border-b border-gray-700'
            : 'bg-white/95 shadow-lg border-b border-gray-100'
          : isDark
            ? 'bg-gradient-to-b from-gray-900/80 to-gray-900/0'
            : 'bg-gradient-to-b from-white/80 to-white/0'
      } ${scrolled ? 'py-3' : 'py-4'}`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center space-x-3 flex-shrink-0 group hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-shadow">
            JP
          </div>
          <span
            className={`font-bold text-xl hidden sm:inline bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent ${
              isDark ? '' : ''
            }`}
          >
            JobPortal
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <Link
            to="/jobs"
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 relative group ${
              isDark
                ? 'text-gray-100 hover:text-blue-300'
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            Browse Jobs
            <span
              className={`absolute bottom-0 left-4 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-8 transition-all duration-300`}
            ></span>
          </Link>

          {user ? (
            <>
              {user.role === 'recruiter' && (
                <>
                  <Link
                    to="/post-job"
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 relative group ${
                      isDark
                        ? 'text-gray-100 hover:text-blue-300'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    Post Job
                    <span
                      className={`absolute bottom-0 left-4 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-8 transition-all duration-300`}
                    ></span>
                  </Link>
                  <Link
                    to="/recruiter/job-seekers"
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 relative group ${
                      isDark
                        ? 'text-gray-100 hover:text-blue-300'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    Browse Profiles
                    <span
                      className={`absolute bottom-0 left-4 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-20 transition-all duration-300`}
                    ></span>
                  </Link>
                </>
              )}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 relative group ${
                    isDark
                      ? 'text-gray-100 hover:text-blue-300'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Admin
                  <span
                    className={`absolute bottom-0 left-4 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-8 transition-all duration-300`}
                  ></span>
                </Link>
              )}
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 relative group ${
                  isDark
                    ? 'text-gray-100 hover:text-blue-300'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Dashboard
                <span
                  className={`absolute bottom-0 left-4 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-16 transition-all duration-300`}
                ></span>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 group ${
                    isDark
                      ? 'text-gray-100 hover:text-blue-300'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                  aria-label={`Profile menu for ${user.name}`}
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="menu"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md transition-all duration-200 group-hover:shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 ${
                      profileDropdownOpen ? 'ring-2 ring-blue-400' : ''
                    }`}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm hidden lg:inline">
                    {user.name.split(' ')[0]}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${profileDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>

                {profileDropdownOpen && (
                  <div
                    className={`absolute right-0 mt-3 w-48 rounded-lg shadow-2xl z-50 backdrop-blur-md border ${
                      isDark
                        ? 'bg-gray-800/95 border-gray-600'
                        : 'bg-white/95 border-gray-200'
                    } animate-slideDown`}
                  >
                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className={`block w-full text-left px-4 py-3 rounded-t-lg transition-all duration-200 font-medium ${
                        isDark
                          ? 'text-gray-100 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-blue-50'
                      }`}
                    >
                      👤 My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={`block w-full text-left px-4 py-3 rounded-b-lg transition-all duration-200 font-medium ${
                        isDark
                          ? 'text-gray-100 hover:bg-red-900/30'
                          : 'text-gray-700 hover:bg-red-50'
                      }`}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`px-5 py-2 rounded-lg font-medium border-2 transition-all duration-200 ${
                  isDark
                    ? 'text-gray-100 border-gradient-to-r from-blue-500 to-purple-600 hover:border-blue-400 hover:text-blue-300'
                    : 'text-gray-700 border-gray-300 hover:border-blue-600 hover:text-blue-600'
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Register
              </Link>
            </>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`ml-3 p-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
              isDark
                ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-yellow-100 hover:from-amber-700 hover:to-amber-800'
                : 'bg-gradient-to-br from-amber-200 to-amber-300 text-amber-900 hover:from-amber-300 hover:to-amber-400'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293a8 8 0 01-11.314-11.314A8 8 0 1017.293 13.293z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a4 4 0 00 5.656 0l2.12 2.12a6 6 0 11-5.656 0zm2.12-10.607a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM9 4a1 1 0 100-2 1 1 0 000 2zm0 16a1 1 0 100-2 1 1 0 000 2zm8-9a1 1 0 11-2 0 1 1 0 012 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Button and Theme Toggle */}
        <div className="md:hidden flex items-center space-x-3">
          {/* Theme Toggle - Mobile */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
              isDark
                ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-yellow-100 hover:from-amber-700 hover:to-amber-800'
                : 'bg-gradient-to-br from-amber-200 to-amber-300 text-amber-900 hover:from-amber-300 hover:to-amber-400'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293a8 8 0 01-11.314-11.314A8 8 0 1017.293 13.293z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a4 4 0 00 5.656 0l2.12 2.12a6 6 0 11-5.656 0zm2.12-10.607a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM9 4a1 1 0 100-2 1 1 0 000 2zm0 16a1 1 0 100-2 1 1 0 000 2zm8-9a1 1 0 11-2 0 1 1 0 012 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md hover:shadow-lg ${
              isDark
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? (
              <svg
                className="w-6 h-6 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className={`md:hidden border-t transition-all duration-300 backdrop-blur-lg ${
            isDark
              ? 'border-gray-700 bg-gray-900/95'
              : 'border-gray-200 bg-white/95'
          } animate-slideDown`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Link
              to="/jobs"
              onClick={closeMobileMenu}
              className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isDark
                  ? 'text-gray-100 hover:bg-gray-800 hover:text-blue-300'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              🔍 Browse Jobs
            </Link>

            {user ? (
              <>
                {user.role === 'recruiter' && (
                  <>
                    <Link
                      to="/post-job"
                      onClick={closeMobileMenu}
                      className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        isDark
                          ? 'text-gray-100 hover:bg-gray-800 hover:text-blue-300'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      ➕ Post Job
                    </Link>
                    <Link
                      to="/recruiter/job-seekers"
                      onClick={closeMobileMenu}
                      className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        isDark
                          ? 'text-gray-100 hover:bg-gray-800 hover:text-blue-300'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      👥 Browse Profiles
                    </Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={closeMobileMenu}
                    className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isDark
                        ? 'text-gray-100 hover:bg-gray-800 hover:text-blue-300'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    ⚙️ Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isDark
                      ? 'text-gray-100 hover:bg-gray-800 hover:text-blue-300'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  📊 Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isDark
                      ? 'text-gray-100 hover:bg-gray-800 hover:text-blue-300'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  👤 My Profile
                </Link>
                <div
                  className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} my-2`}
                ></div>
                <button
                  onClick={handleLogout}
                  className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isDark
                      ? 'text-gray-100 hover:bg-red-900/30 hover:text-red-300'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 rounded-lg font-medium border-2 transition-all duration-200 ${
                    isDark
                      ? 'text-gray-100 border-gray-500 hover:border-blue-400 hover:text-blue-300 hover:bg-gray-800'
                      : 'text-gray-700 border-gray-300 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  🔐 Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg text-center"
                >
                  ✨ Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
