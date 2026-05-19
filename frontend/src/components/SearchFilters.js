import React, { useState } from 'react';
import './SearchFilters.css'; // Optional CSS file if needed

const SearchFilters = ({ onSearch, isLoading }) => {
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    type: '',
    category: '',
    sortBy: 'relevance',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      keyword: '',
      location: '',
      type: '',
      category: '',
      sortBy: 'relevance',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <form onSubmit={handleSearch}>
        {/* Main Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
          {/* Keyword Search */}
          <div className="md:col-span-7">
            <label
              htmlFor="keyword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Job Title or Keyword
            </label>
            <div className="relative">
              <svg
                className="search-input-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                id="keyword"
                name="keyword"
                value={filters.keyword}
                onChange={handleInputChange}
                placeholder="Search for jobs, skills, companies..."
                className="w-full pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white with-icon"
                style={{ lineHeight: '1.5rem', height: '2.5rem' }}
              />
            </div>
          </div>

          {/* Location Search */}
          <div className="md:col-span-3">
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Location
            </label>
            <div className="relative">
              <svg
                className="search-input-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <input
                type="text"
                id="location"
                name="location"
                value={filters.location}
                onChange={handleInputChange}
                placeholder="City or region"
                className="w-full pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white with-icon"
                style={{ lineHeight: '1.5rem', height: '2.5rem' }}
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 font-medium text-sm"
          >
            {showAdvanced ? '▼ Hide' : '▶ Show'} Advanced Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
            {/* Job Type */}
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Job Type
              </label>
              <select
                id="type"
                name="type"
                value={filters.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={filters.category}
                onChange={handleInputChange}
                placeholder="e.g., IT, HR, Sales"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
              />
            </div>

            {/* Sort By */}
            <div>
              <label
                htmlFor="sortBy"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Sort By
              </label>
              <select
                id="sortBy"
                name="sortBy"
                value={filters.sortBy}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        )}

        {/* Filter Summary & Reset */}
        {(filters.keyword ||
          filters.location ||
          filters.type ||
          filters.category) && (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Active Filters:</strong>{' '}
              {[
                filters.keyword && `"${filters.keyword}"`,
                filters.location && `Location: ${filters.location}`,
                filters.type && `Type: ${filters.type}`,
                filters.category && `Category: ${filters.category}`,
              ]
                .filter(Boolean)
                .join(' • ')}
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 font-medium ml-4"
            >
              Clear All
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchFilters;
