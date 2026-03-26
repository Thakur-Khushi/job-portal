import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sanitizeHTML } from '../utils/sanitization';
import SearchFilters from '../components/SearchFilters';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    if (currentPage === 1) {
      fetchJobs();
    } else {
      setCurrentPage(1);
    }
  }, []);

  const fetchJobs = async (searchParams = {}) => {
    try {
      setLoading(true);
      setError('');
      setCurrentPage(1); // Reset to page 1 when searching

      // Build query string with search parameters
      const queryParams = new URLSearchParams({
        ...searchParams,
        page: 1,
        limit: 10,
      }).toString();

      // Use new /search/advanced endpoint
      const res = await axios.get(
        `${API_URL}/jobs/search/advanced?${queryParams}`,
      );
      setJobs(res.data.jobs || []);
      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(
        err.response?.data?.msg || 'Failed to load jobs. Please try again.',
      );
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchParams) => {
    fetchJobs(searchParams);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="modern-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 animated-bg">
      <div className="container mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Find Your Dream Job
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover opportunities with top companies
          </p>
        </div>

        {/* Search and Filter Section */}
        <SearchFilters onSearch={handleSearch} isLoading={loading} />

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Job Listings */}
        {jobs.length === 0 ? (
          <div className="text-center py-16 glass-effect rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-gray-900 dark:text-white text-2xl font-semibold mb-2">
              No jobs found
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 mb-8">
              {jobs.map((job) => (
                <div key={job._id} className="modern-card hover-lift">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4 text-white font-bold text-lg">
                          {job.company?.charAt(0) || 'J'}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {job.title}
                          </h2>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {job.company || 'Company'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="modern-badge badge-primary">
                          {job.location}
                        </span>
                        <span className="modern-badge badge-success">
                          {job.type}
                        </span>
                        {job.category && (
                          <span className="modern-badge badge-warning">
                            {job.category}
                          </span>
                        )}
                        {job.salary && (
                          <span className="modern-badge badge-primary">
                            {job.salary}
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {sanitizeHTML(job.description)}
                      </p>

                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          Posted{' '}
                          {new Date(job.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/jobs/${job._id}`}
                      className="md:whitespace-nowrap px-6 py-2 btn-modern text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                >
                  ← Previous
                </button>

                <div className="flex gap-1">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1,
                  )
                    .slice(
                      Math.max(0, currentPage - 2),
                      Math.min(pagination.totalPages, currentPage + 2),
                    )
                    .map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg transition ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(pagination.totalPages, currentPage + 1),
                    )
                  }
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                >
                  Next →
                </button>

                <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobList;
