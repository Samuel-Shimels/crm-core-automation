/**
 * CRM Library - UUID and Timestamp Utilities
 * Provides functions for generating UUIDs and UTC timestamps.
 */

var CrmLib = (function(ns) {
  const self = ns || {};

  /**
   * Generate a RFC4122 version 4 UUID.
   */
  self.generateUuidV4 = function() {
    const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return template.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  /**
   * Generate a UTC ISO 8601 timestamp string.
   */
  self.generateTimestampIsoUtc = function() {
    return new Date().toISOString();
  };

  return self;
})(typeof CrmLib !== 'undefined' ? CrmLib : {});
