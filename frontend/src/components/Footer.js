import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">JP</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-base">JobPortal</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              Connecting talent with opportunity. Find your next role or hire your next great hire.
            </p>
          </div>

          {/* Job Seekers */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Job Seekers
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/jobs" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Employers
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/post-job" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link to="/recruiter/job-seekers" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Browse Candidates
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Recruiter Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-sm text-gray-400 dark:text-gray-600 cursor-default">About Us</span>
              </li>
              <li>
                <span className="text-sm text-gray-400 dark:text-gray-600 cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="text-sm text-gray-400 dark:text-gray-600 cursor-default">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            &copy; {currentYear} JobPortal. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Built with care for job seekers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
