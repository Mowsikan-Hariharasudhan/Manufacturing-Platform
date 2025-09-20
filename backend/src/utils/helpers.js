const crypto = require('crypto');

/**
 * Generate a random string of specified length
 * @param {number} length - Length of the random string
 * @returns {string} Random string
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

/**
 * Generate a random 6-digit number
 * @returns {string} 6-digit random number as string
 */
const generateSixDigitCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Format time in minutes to human readable format
 * @param {number} minutes - Time in minutes
 * @returns {string} Formatted time string
 */
const formatTime = (minutes) => {
  if (!minutes || minutes === 0) return '0 minutes';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  } else if (mins === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
  }
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage rounded to 2 decimal places
 */
const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100;
};

/**
 * Validate UUID format
 * @param {string} uuid - UUID string to validate
 * @returns {boolean} True if valid UUID
 */
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Sanitize input string
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .substring(0, 1000); // Limit length
};

/**
 * Generate sequential number for codes
 * @param {string} prefix - Prefix for the code
 * @param {number} currentCount - Current count
 * @param {number} padding - Number of digits for padding
 * @returns {string} Generated code
 */
const generateSequentialCode = (prefix, currentCount, padding = 3) => {
  const year = new Date().getFullYear();
  const paddedCount = (currentCount + 1).toString().padStart(padding, '0');
  return `${prefix}-${year}-${paddedCount}`;
};

/**
 * Parse pagination parameters
 * @param {object} query - Query parameters
 * @returns {object} Parsed pagination object
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Create pagination response
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {object} Pagination object
 */
const createPaginationResponse = (page, limit, total) => {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total: parseInt(total),
    pages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  };
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if date is valid
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date
 */
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

module.exports = {
  generateRandomString,
  generateSixDigitCode,
  formatTime,
  calculatePercentage,
  isValidUUID,
  sanitizeInput,
  generateSequentialCode,
  parsePagination,
  createPaginationResponse,
  formatCurrency,
  deepClone,
  isValidDate
};
