import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-profile-dropdown]')) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const navBase = isDark
    ? 'bg-gray-900 border-gray-800'
    : 'bg-white border-gray-200';

  const navShadow = scrolled ? 'shadow-sm' : '';

  const linkCls = isDark
    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';

  const mobileLinkCls = isDark
    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50';

  return (
    <nav className={`fixed top-0 w-full z-50 border-b transition-shadow duration-200 ${navBase} ${navShadow}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm tracking-tight">JP</span>
            </div>
            <span className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              JobPortal
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/jobs" className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${linkCls}`}>
              Browse Jobs
            </Link>

            {user?.role === 'recruiter' && (
              <>
                <Link to="/post-job" className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${linkCls}`}>
                  Post Job
                </Link>
                <Link to="/recruiter/job-seekers" className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${linkCls}`}>
                  Browse Profiles
                </Link>
              </>
            )}

            {user?.role === 'admin' && (
              <Link to="/admin" className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${linkCls}`}>
                Admin
              </Link>
            )}

            {user && (
              <Link to="/dashboard" className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${linkCls}`}>
                Dashboard
              </Link>
            )}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-150 ${
                isDark
                  ? 'text-gray-400 hover:text-yellow-300 hover:bg-gray-800'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {user ? (
              <div className="relative" data-profile-dropdown>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg transition-colors duration-150 ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="menu"
                  aria-label={`Profile menu for ${user.name}`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className={`text-sm font-medium hidden lg:inline ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {user.name.split(' ')[0]}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isDark ? 'text-gray-500' : 'text-gray-400'} ${profileDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileDropdownOpen && (
                  <div
                    className={`absolute right-0 mt-1.5 w-48 rounded-xl shadow-lg border py-1 z-50 ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                    role="menu"
                  >
                    <div className={`px-4 py-2.5 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                      <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className={`flex items-center px-4 py-2.5 text-sm transition-colors ${
                        isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      role="menuitem"
                    >
                      <svg className="w-4 h-4 mr-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <div className={`my-1 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`} />
                    <button
                      onClick={handleLogout}
                      className={`flex items-center w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        isDark ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-red-50'
                      }`}
                      role="menuitem"
                    >
                      <svg className="w-4 h-4 mr-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                    isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-150"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Theme + Hamburger */}
          <div className="md:hidden flex items-center space-x-1">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'text-gray-400 hover:text-yellow-300 hover:bg-gray-800' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className={`md:hidden border-t ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-3 space-y-1">
            <Link
              to="/jobs"
              onClick={closeMobileMenu}
              className={`block px-3 py-2.5 text-sm font-medium rounded-lg ${mobileLinkCls}`}
            >
              Browse Jobs
            </Link>

            {user ? (
              <>
                {user.role === 'recruiter' && (
                  <>
                    <Link to="/post-job" onClick={closeMobileMenu} className={`block px-3 py-2.5 text-sm font-medium rounded-lg ${mobileLinkCls}`}>
                      Post Job
                    </Link>
                    <Link to="/recruiter/job-seekers" onClick={closeMobileMenu} className={`block px-3 py-2.5 text-sm font-medium rounded-lg ${mobileLinkCls}`}>
                      Browse Profiles
                    </Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={closeMobileMenu} className={`block px-3 py-2.5 text-sm font-medium rounded-lg ${mobileLinkCls}`}>
                    Admin
                  </Link>
                )}
                <Link to="/dashboard" onClick={closeMobileMenu} className={`block px-3 py-2.5 text-sm font-medium rounded-lg ${mobileLinkCls}`}>
                  Dashboard
                </Link>
                <Link to="/profile" onClick={closeMobileMenu} className={`block px-3 py-2.5 text-sm font-medium rounded-lg ${mobileLinkCls}`}>
                  My Profile
                </Link>
                <div className={`my-2 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`} />
                <button
                  onClick={handleLogout}
                  className={`block w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg ${
                    isDark ? 'text-red-400 hover:bg-gray-800' : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMobileMenu} className={`block px-3 py-2.5 text-sm font-medium rounded-lg ${mobileLinkCls}`}>
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700 transition-colors"
                >
                  Get Started
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
