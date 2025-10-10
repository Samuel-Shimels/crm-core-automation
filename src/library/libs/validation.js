/**
 * CRM Library - Validation and Sanitization Utilities
 * Provides functions to enforce required fields, sanitize strings, and convert values to numbers.
 */

var CrmLib = (function(ns) {
  const self = ns || {};

  /**
   * Ensure that the specified fields exist and are not empty in an object.
   * @param {Object} object - The object to check.
   * @param {Array<string>} fields - Required field names.
   * @throws {Error} If any required fields are missing.
   */
  self.requireFields = function(object, fields) {
    const missing = [];
    fields.forEach(f => {
      if (object[f] === undefined || object[f] === null || object[f] === '') missing.push(f);
    });
    if (missing.length > 0) throw new Error('Missing required fields: ' + missing.join(', '));
  };

  /**
   * Sanitize a value as a trimmed string.
   * @param {*} value - The value to sanitize.
   * @return {string} The sanitized string.
   */
  self.sanitizeString = function(value) {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  };

  /**
   * Convert a value to a number safely.
   * @param {*} value - The value to convert.
   * @return {number} The numeric value or 0 if invalid.
   */
  self.toNumber = function(value) {
    const n = Number(value);
    return isNaN(n) ? 0 : n;
  };

  return self;
})(typeof CrmLib !== 'undefined' ? CrmLib : {});
