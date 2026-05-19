import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="pt-16 pb-6 border-t"
      style={{
        background: 'var(--bg-secondary)',
        color: 'var(--text-600)',
        borderColor: 'var(--border-light)'
      }}
    >
      <div className="container mx-auto px-4">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                JP
              </div>
              <span className="font-bold text-xl" style={{color: 'var(--text-900)'}}>JobPortal</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{color: 'var(--text-400)'}}>
              Your gateway to career opportunities. Connect talent with companies.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-base mb-4 uppercase tracking-wider" style={{color: 'var(--text-900)'}}>Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/jobs"
                  className="transition-colors duration-200"
                  style={{color: 'var(--text-400)'}}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--primary-600)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--text-400)'}
                >
                  → Browse Jobs
                </Link>
              </li>
              <li>
                <span className="text-sm" style={{color: 'var(--text-600)'}}>• Companies</span>
              </li>
              <li>
                <span className="text-sm" style={{color: 'var(--text-600)'}}>• About Us</span>
              </li>
              <li>
                <span className="text-sm" style={{color: 'var(--text-600)'}}>• Contact</span>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="font-semibold text-base mb-4 uppercase tracking-wider" style={{color: 'var(--text-900)'}}>For Employers</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/post-job"
                  className="transition-colors duration-200"
                  style={{color: 'var(--text-400)'}}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--primary-600)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--text-400)'}
                >
                  → Post a Job
                </Link>
              </li>
              <li>
                <span className="text-sm" style={{color: 'var(--text-600)'}}>• Pricing</span>
              </li>
              <li>
                <span className="text-sm" style={{color: 'var(--text-600)'}}>• Resources</span>
              </li>
              <li>
                <span className="text-sm" style={{color: 'var(--text-600)'}}>• Analytics</span>
              </li>
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h3 className="font-semibold text-base mb-4 uppercase tracking-wider" style={{color: 'var(--text-900)'}}>Connect With Us</h3>
            <div className="space-y-3">
              <p className="text-sm" style={{color: 'var(--text-400)'}}>Follow us on social media</p>
              <div className="flex space-x-2">
                <button
                  disabled
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-not-allowed opacity-50"
                  style={{background: 'var(--bg-tertiary)', color: 'var(--primary-600)'}}
                  title="Facebook"
                  aria-label="Facebook"
                >
                  f
                </button>
                <button
                  disabled
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-not-allowed opacity-50"
                  style={{background: 'var(--bg-tertiary)', color: 'var(--primary-500)'}}
                  title="Twitter"
                  aria-label="Twitter"
                >
                  𝕏
                </button>
                <button
                  disabled
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-not-allowed opacity-50"
                  style={{background: 'var(--bg-tertiary)', color: 'var(--accent-500)'}}
                  title="Instagram"
                  aria-label="Instagram"
                >
                  📷
                </button>
                <button
                  disabled
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-not-allowed opacity-50"
                  style={{background: 'var(--bg-tertiary)', color: 'var(--primary-700)'}}
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
        <div className="pt-6" style={{borderTop: '1px solid var(--border-light)'}}>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm" style={{color: 'var(--text-400)'}}>
              &copy; {currentYear} JobPortal. All rights reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0 text-sm">
              <a
                href="#privacy"
                className="transition-colors"
                style={{color: 'var(--text-400)'}}
                onMouseOver={e => e.currentTarget.style.color = 'var(--primary-600)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-400)'}
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="transition-colors"
                style={{color: 'var(--text-400)'}}
                onMouseOver={e => e.currentTarget.style.color = 'var(--primary-600)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-400)'}
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
