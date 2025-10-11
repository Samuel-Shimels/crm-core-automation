/**
 * CRM Library - Error Handling & Logging
 * Provides centralized error handling and logging for the CRM system
 */

var CrmLib = (function(ns) {
  const self = ns || {};

  /**
   * Error types for categorization
   */
  self.ErrorTypes = {
    VALIDATION: 'VALIDATION_ERROR',
    AUTHENTICATION: 'AUTH_ERROR',
    AUTHORIZATION: 'AUTHZ_ERROR',
    NOT_FOUND: 'NOT_FOUND_ERROR',
    DATABASE: 'DATABASE_ERROR',
    EXTERNAL_API: 'EXTERNAL_API_ERROR',
    INTERNAL: 'INTERNAL_ERROR'
  };

  /**
   * Log levels
   */
  self.LogLevels = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
    CRITICAL: 'CRITICAL'
  };

  /**
   * Custom CRM Error class
   */
  self.CrmError = function(message, type, details) {
    this.name = 'CrmError';
    this.message = message;
    this.type = type || self.ErrorTypes.INTERNAL;
    this.details = details || {};
    this.timestamp = new Date().toISOString();
    this.stack = new Error().stack;
  };

  /**
   * Log a message to Stackdriver (Cloud Logging)
   * @param {string} level - Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
   * @param {string} message - Log message
   * @param {object} metadata - Additional metadata to log
   */
  self.log = function(level, message, metadata) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level,
      message: message,
      metadata: metadata || {}
    };

    // Console logging (appears in Stackdriver with severity)
    switch(level) {
      case self.LogLevels.DEBUG:
      case self.LogLevels.INFO:
        console.info(JSON.stringify(logEntry));
        break;
      case self.LogLevels.WARNING:
        console.warn(JSON.stringify(logEntry));
        break;
      case self.LogLevels.ERROR:
      case self.LogLevels.CRITICAL:
        console.error(JSON.stringify(logEntry));
        break;
      default:
        console.log(JSON.stringify(logEntry));
    }

    return logEntry;
  };

  /**
   * Log debug message
   */
  self.logDebug = function(message, metadata) {
    return self.log(self.LogLevels.DEBUG, message, metadata);
  };

  /**
   * Log info message
   */
  self.logInfo = function(message, metadata) {
    return self.log(self.LogLevels.INFO, message, metadata);
  };

  /**
   * Log warning message
   */
  self.logWarning = function(message, metadata) {
    return self.log(self.LogLevels.WARNING, message, metadata);
  };

  /**
   * Log error message
   */
  self.logError = function(message, metadata) {
    return self.log(self.LogLevels.ERROR, message, metadata);
  };

  /**
   * Log critical message
   */
  self.logCritical = function(message, metadata) {
    return self.log(self.LogLevels.CRITICAL, message, metadata);
  };

  /**
   * Handle and log an error
   * @param {Error|CrmError} error - The error to handle
   * @param {string} context - Context where the error occurred
   * @param {object} additionalInfo - Additional information about the error
   * @returns {object} Formatted error response
   */
  self.handleError = function(error, context, additionalInfo) {
    const errorInfo = {
      message: error.message || 'Unknown error',
      type: error.type || self.ErrorTypes.INTERNAL,
      context: context || 'Unknown context',
      timestamp: new Date().toISOString(),
      details: error.details || {},
      additionalInfo: additionalInfo || {},
      stack: error.stack
    };

    // Log the error
    self.logError('Error occurred', errorInfo);

    // Return sanitized error for client (don't expose stack traces)
    return {
      success: false,
      error: {
        message: errorInfo.message,
        type: errorInfo.type,
        timestamp: errorInfo.timestamp
      }
    };
  };

  /**
   * Wrap a function with error handling
   * @param {function} fn - Function to wrap
   * @param {string} context - Context description
   * @returns {function} Wrapped function
   */
  self.withErrorHandling = function(fn, context) {
    return function() {
      try {
        return fn.apply(this, arguments);
      } catch (error) {
        return self.handleError(error, context, {
          arguments: Array.prototype.slice.call(arguments)
        });
      }
    };
  };

  /**
   * Validate required parameters
   * @param {object} params - Parameters to validate
   * @param {array} requiredFields - Array of required field names
   * @throws {CrmError} If validation fails
   */
  self.validateRequired = function(params, requiredFields) {
    const missing = [];
    
    requiredFields.forEach(function(field) {
      if (params[field] === undefined || params[field] === null || params[field] === '') {
        missing.push(field);
      }
    });

    if (missing.length > 0) {
      throw new self.CrmError(
        'Missing required parameters: ' + missing.join(', '),
        self.ErrorTypes.VALIDATION,
        { missingFields: missing, providedParams: Object.keys(params) }
      );
    }
  };

  /**
   * Assert a condition, throw error if false
   * @param {boolean} condition - Condition to check
   * @param {string} message - Error message if condition is false
   * @param {string} errorType - Type of error
   * @throws {CrmError} If condition is false
   */
  self.assert = function(condition, message, errorType) {
    if (!condition) {
      throw new self.CrmError(
        message || 'Assertion failed',
        errorType || self.ErrorTypes.INTERNAL
      );
    }
  };

  /**
   * Create a success response
   * @param {*} data - Data to return
   * @param {string} message - Optional success message
   * @returns {object} Success response
   */
  self.successResponse = function(data, message) {
    return {
      success: true,
      message: message || 'Operation completed successfully',
      data: data,
      timestamp: new Date().toISOString()
    };
  };

  /**
   * Create an error response
   * @param {string} message - Error message
   * @param {string} type - Error type
   * @param {object} details - Additional error details
   * @returns {object} Error response
   */
  self.errorResponse = function(message, type, details) {
    return {
      success: false,
      error: {
        message: message,
        type: type || self.ErrorTypes.INTERNAL,
        details: details || {},
        timestamp: new Date().toISOString()
      }
    };
  };

  /**
   * Log audit event
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {string} entityType - Type of entity (Contact, Deal, etc.)
   * @param {string} entityId - Entity ID
   * @param {string} action - Action performed (CREATE, UPDATE, DELETE, VIEW)
   * @param {string} userId - User ID performing the action
   * @param {string} notes - Optional notes
   */
  self.logAudit = function(spreadsheetId, entityType, entityId, action, userId, notes) {
    try {
      const ss = SpreadsheetApp.openById(spreadsheetId);
      const auditSheet = ss.getSheetByName('Activity_Audit');
      
      if (!auditSheet) {
        self.logWarning('Activity_Audit sheet not found', { spreadsheetId: spreadsheetId });
        return;
      }

      const auditId = 'audit_' + Utilities.getUuid();
      const timestamp = new Date().toISOString();

      auditSheet.appendRow([
        auditId,
        entityType,
        entityId,
        action,
        userId,
        timestamp,
        notes || ''
      ]);

      self.logInfo('Audit event logged', {
        auditId: auditId,
        entityType: entityType,
        entityId: entityId,
        action: action,
        userId: userId
      });

    } catch (error) {
      self.logError('Failed to log audit event', {
        error: error.message,
        entityType: entityType,
        entityId: entityId,
        action: action
      });
    }
  };

  /**
   * Safely execute a function and return result or error
   * @param {function} fn - Function to execute
   * @param {string} operationName - Name of the operation for logging
   * @returns {object} Result object with success flag and data/error
   */
  self.safeExecute = function(fn, operationName) {
    const startTime = new Date().getTime();
    
    try {
      self.logDebug('Starting operation: ' + operationName);
      const result = fn();
      const duration = new Date().getTime() - startTime;
      
      self.logInfo('Operation completed: ' + operationName, {
        duration: duration + 'ms'
      });
      
      return self.successResponse(result);
      
    } catch (error) {
      const duration = new Date().getTime() - startTime;
      
      self.logError('Operation failed: ' + operationName, {
        error: error.message,
        duration: duration + 'ms',
        stack: error.stack
      });
      
      if (error instanceof self.CrmError) {
        return self.errorResponse(error.message, error.type, error.details);
      } else {
        return self.errorResponse(
          error.message || 'Unknown error occurred',
          self.ErrorTypes.INTERNAL
        );
      }
    }
  };

  return self;
})(typeof CrmLib !== 'undefined' ? CrmLib : {});


