import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-300 pt-16 pb-6 border-t border-slate-700">
      <div className="container mx-auto px-4">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                JP
              </div>
              <span className="font-bold text-white text-xl">JobPortal</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Your gateway to career opportunities. Connect talent with
              companies.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white text-base mb-4 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/jobs"
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                >
                  → Browse Jobs
                </Link>
              </li>
              <li>
                <span className="text-gray-600 text-sm">• Companies</span>
              </li>
              <li>
                <span className="text-gray-600 text-sm">• About Us</span>
              </li>
              <li>
                <span className="text-gray-600 text-sm">• Contact</span>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="font-semibold text-white text-base mb-4 uppercase tracking-wider">
              For Employers
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/post-job"
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                >
                  → Post a Job
                </Link>
              </li>
              <li>
                <span className="text-gray-600 text-sm">• Pricing</span>
              </li>
              <li>
                <span className="text-gray-600 text-sm">• Resources</span>
              </li>
              <li>
                <span className="text-gray-600 text-sm">• Analytics</span>
              </li>
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h3 className="font-semibold text-white text-base mb-4 uppercase tracking-wider">
              Connect With Us
            </h3>
            <div className="space-y-3">
              <p className="text-gray-400 text-sm">Follow us on social media</p>
              <div className="flex space-x-2">
                <button
                  disabled
                  className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center text-blue-400 transition-colors duration-200 cursor-not-allowed opacity-50"
                  title="Facebook"
                  aria-label="Facebook"
                >
                  f
                </button>
                <button
                  disabled
                  className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center text-blue-300 transition-colors duration-200 cursor-not-allowed opacity-50"
                  title="Twitter"
                  aria-label="Twitter"
                >
                  𝕏
                </button>
                <button
                  disabled
                  className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center text-pink-400 transition-colors duration-200 cursor-not-allowed opacity-50"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  📷
                </button>
                <button
                  disabled
                  className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center text-blue-500 transition-colors duration-200 cursor-not-allowed opacity-50"
                  title="LinkedIn"
                  aria-label="LinkedIn"
                >
                  in
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} JobPortal. All rights reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0 text-sm">
              <a
                href="#privacy"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
