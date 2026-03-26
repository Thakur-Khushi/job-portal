// API Error handling utility

export const getErrorMessage = (error) => {
  // Network error
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout - Please check your connection';
    }
    if (error.message === 'Network Error') {
      return 'Network error - Please check your internet connection';
    }
    return 'Connection error - Unable to reach the server';
  }

  // Server responded with error status
  const status = error.response.status;
  const data = error.response.data;

  // Custom error message from server
  if (data?.msg) return data.msg;
  if (data?.error) return data.error;
  if (data?.message) return data.message;

  // Status code specific messages
  switch (status) {
    case 400:
      return 'Bad request - Please check your input';
    case 401:
      return 'Unauthorized - Please login again';
    case 403:
      return 'Forbidden - You do not have permission';
    case 404:
      return 'Not found - The resource does not exist';
    case 409:
      return 'Conflict - The resource already exists or is in use';
    case 422:
      return 'Invalid data - Please check your input';
    case 429:
      return 'Too many requests - Please wait a moment';
    case 500:
      return 'Server error - Please try again later';
    case 502:
      return 'Bad gateway - Server is temporarily unavailable';
    case 503:
      return 'Service unavailable - Please try again later';
    case 504:
      return 'Gateway timeout - Please try again later';
    default:
      return `Error: ${status} - ${error.message || 'Something went wrong'}`;
  }
};

export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  return getErrorMessage(error) || defaultMessage;
};

// For Form-specific errors
export const getFormErrors = (error) => {
  if (!error.response?.data) return {};

  const data = error.response.data;

  // If server returns field-specific errors
  if (data.fieldErrors) {
    return data.fieldErrors;
  }

  // If it's a single message, return as general error
  if (data.msg || data.error) {
    return { general: data.msg || data.error };
  }

  return {};
};
