// Sanitization utilities to prevent XSS attacks

/**
 * Basic HTML sanitization by escaping dangerous characters
 * Use this when DOMPurify is not available
 */
export const sanitizeHTML = (str) => {
  if (!str) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * Sanitize user input for safe output
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  return sanitizeHTML(String(input).trim());
};

/**
 * Remove potentially dangerous attributes from HTML
 */
export const removeScriptTags = (html) => {
  if (!html) return '';
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '');
};

/**
 * Validate URL to prevent javascript: protocol
 */
export const isValidURL = (url) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Safe JSON parse with fallback
 */
export const safeJSONParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

/**
 * Sanitize object keys and values recursively
 */
export const sanitizeObject = (obj, maxDepth = 5) => {
  if (maxDepth === 0) return obj;
  if (obj === null || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeInput(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, maxDepth - 1));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Sanitize key
    const sanitizedKey = sanitizeInput(key);
    // Recursively sanitize value
    sanitized[sanitizedKey] = sanitizeObject(value, maxDepth - 1);
  }
  return sanitized;
};
