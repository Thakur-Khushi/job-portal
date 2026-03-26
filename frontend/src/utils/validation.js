// Form validation utilities

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // At least 6 characters
  return password.length >= 6;
};

export const getPasswordStrength = (password) => {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 1) return { level: 'Weak', color: 'text-red-500' };
  if (strength <= 2) return { level: 'Fair', color: 'text-yellow-500' };
  if (strength <= 3) return { level: 'Good', color: 'text-blue-500' };
  if (strength <= 4) return { level: 'Strong', color: 'text-green-500' };
  return { level: 'Very Strong', color: 'text-green-600' };
};

export const validateForm = (formData, requiredFields) => {
  const errors = {};

  requiredFields.forEach((field) => {
    if (!formData[field] || formData[field].trim() === '') {
      errors[field] =
        `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateJobForm = (formData) => {
  const errors = {};

  if (!formData.title?.trim()) errors.title = 'Job title is required';
  if (!formData.company?.trim()) errors.company = 'Company name is required';
  if (!formData.location?.trim()) errors.location = 'Location is required';
  if (!formData.description?.trim())
    errors.description = 'Description is required';
  if (!formData.requirements?.trim())
    errors.requirements = 'Requirements are required';
  if (!formData.type) errors.type = 'Job type is required';

  // Salary validation - if provided, must be valid format
  if (formData.salary?.trim()) {
    const salaryStr = formData.salary.trim();
    // Accept formats like: "50000", "50000-60000", "50k-60k", "$50000-$60000"
    const salaryPattern =
      /^[\$]?(\d+[k]?|\d+)([\\s]*-[\\s]*[\$]?(\d+[k]?|\d+))?$/i;
    if (!salaryPattern.test(salaryStr)) {
      errors.salary =
        'Invalid salary format. Use: 50000 or 50000-60000 or 50k-60k';
    }
  }

  if (formData.deadline && new Date(formData.deadline) < new Date()) {
    errors.deadline = 'Deadline cannot be in the past';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateFileUpload = (
  file,
  allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  maxSizeInMB = 5,
) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeInMB}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only PDF and DOC/DOCX files are allowed' };
  }

  return { isValid: true, error: null };
};
