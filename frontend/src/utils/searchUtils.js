/**
 * Search utilities for job portal
 */

/**
 * Build search query parameters from filter object
 * @param {Object} filters - Filter object
 * @returns {URLSearchParams}
 */
export const buildSearchQuery = (filters) => {
  const params = new URLSearchParams();

  if (filters.keyword) {
    params.append('keyword', filters.keyword);
  }
  if (filters.location) {
    params.append('location', filters.location);
  }
  if (filters.type) {
    params.append('type', filters.type);
  }
  if (filters.category) {
    params.append('category', filters.category);
  }
  if (filters.page) {
    params.append('page', filters.page);
  }
  if (filters.limit) {
    params.append('limit', filters.limit);
  }
  if (filters.sortBy) {
    params.append('sortBy', filters.sortBy);
  }
  if (filters.postedAfter) {
    params.append('postedAfter', filters.postedAfter);
  }

  return params;
};

/**
 * Parse salary range from string
 * @param {string} salaryStr - Salary string (e.g., "50000-60000")
 * @returns {Object} {min: number, max: number} or null
 */
export const parseSalaryRange = (salaryStr) => {
  if (!salaryStr) return null;

  const match = salaryStr.match(/(\d+)[^\d]*(\d+)?/);
  if (!match) return null;

  const min = parseInt(match[1]);
  const max = match[2] ? parseInt(match[2]) : min;

  return { min, max };
};

/**
 * Format salary for display
 * @param {string} salary - Salary string
 * @returns {string} Formatted salary
 */
export const formatSalary = (salary) => {
  if (!salary) return 'Not specified';

  const range = parseSalaryRange(salary);
  if (!range) return salary;

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  });

  if (range.min === range.max) {
    return formatter.format(range.min);
  } else {
    return `${formatter.format(range.min)} - ${formatter.format(range.max)}`;
  }
};

/**
 * Get job type label with icon
 * @param {string} type - Job type
 * @returns {Object} {label: string, icon: string, bgColor: string}
 */
export const getJobTypeLabel = (type) => {
  const typeMap = {
    'full-time': {
      label: 'Full Time',
      icon: '💼',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-800 dark:text-blue-200',
    },
    'part-time': {
      label: 'Part Time',
      icon: '⏰',
      bgColor: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-800 dark:text-green-200',
    },
    contract: {
      label: 'Contract',
      icon: '📋',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      textColor: 'text-purple-800 dark:text-purple-200',
    },
    internship: {
      label: 'Internship',
      icon: '🎓',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      textColor: 'text-orange-800 dark:text-orange-200',
    },
  };

  return (
    typeMap[type] || {
      label: type,
      icon: '📌',
      bgColor: 'bg-gray-100 dark:bg-gray-700',
      textColor: 'text-gray-800 dark:text-gray-200',
    }
  );
};

/**
 * Highlight search keyword in text
 * @param {string} text - Text to highlight in
 * @param {string} keyword - Keyword to highlight
 * @returns {string} Text with HTML highlights
 */
export const highlightKeyword = (text, keyword) => {
  if (!text || !keyword) return text;

  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(
    regex,
    '<mark style="background-color: yellow;">$1</mark>',
  );
};

/**
 * Get relative time string
 * @param {Date} date - Date to convert
 * @returns {string} Relative time (e.g., "2 days ago")
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  return 'Just now';
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @param {string} suffix - Suffix to add
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 150, suffix = '...') => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + suffix;
};

/**
 * Filter jobs by multiple criteria
 * @param {Array} jobs - Array of jobs
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered jobs
 */
export const filterJobs = (jobs, filters) => {
  return jobs.filter((job) => {
    // Text search
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      const matchesKeyword =
        job.title.toLowerCase().includes(keyword) ||
        job.description.toLowerCase().includes(keyword) ||
        job.company.toLowerCase().includes(keyword);
      if (!matchesKeyword) return false;
    }

    // Location filter
    if (filters.location) {
      const locationMatch = job.location
        .toLowerCase()
        .includes(filters.location.toLowerCase());
      if (!locationMatch) return false;
    }

    // Job type filter
    if (filters.type && job.type !== filters.type) {
      return false;
    }

    // Category filter
    if (filters.category && job.category !== filters.category) {
      return false;
    }

    return true;
  });
};

export default {
  buildSearchQuery,
  parseSalaryRange,
  formatSalary,
  getJobTypeLabel,
  highlightKeyword,
  getRelativeTime,
  truncateText,
  filterJobs,
};
