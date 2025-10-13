/**
 * CRM Library - Users Module
 * Usage example:
 *   const users = CrmLib.listUsers(spreadsheetId, { page: 1 });
 *   const user = CrmLib.getUser(spreadsheetId, 'u123');
 *   const saved = CrmLib.saveUser(spreadsheetId, { email: 'john@example.com', display_name: 'John Doe', role: 'Admin' });
 *   CrmLib.deleteUser(spreadsheetId, 'u123');
 */

var CrmLib = (function(ns) {
  const self = ns || {};

  /**
   * List users with pagination.
   * Uses Script Cache for improved performance.
   */
  self.listUsers = function(spreadsheetId, params) {
    self.requireRole(spreadsheetId, ['Admin']);
    params = params || {};

    const page = params.page || 1;
    const pageSize = params.pageSize || 100;
    const forceRefresh = params.forceRefresh || false;

    // Try to get from cache first
    const cachedUsers = self.getCachedUsers ? self.getCachedUsers(spreadsheetId, forceRefresh) : null;
    
    let results;
    if (cachedUsers) {
      // Expand cached data to full user objects
      const data = self.getSheetValues(spreadsheetId, 'Users');
      const headers = data.headers;
      results = data.rows.map(r => {
        const o = {};
        headers.forEach((h, i) => o[h] = r[i]);
        return o;
      });
    } else {
      const data = self.getSheetValues(spreadsheetId, 'Users');
      const headers = data.headers;
      results = data.rows.map(r => {
        const o = {};
        headers.forEach((h, i) => o[h] = r[i]);
        return o;
      });
    }

    const total = results.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return { rows: results.slice(start, end), total };
  };

  /**
   * Retrieve a single user by ID.
   */
  self.getUser = function(spreadsheetId, user_id) {
    self.requireRole(spreadsheetId, ['Admin']);

    const data = self.getSheetValues(spreadsheetId, 'Users');
    const headers = data.headers;
    const idIdx = headers.indexOf('user_id');

    for (let i = 0; i < data.rows.length; i++) {
      if (String(data.rows[i][idIdx]) === String(user_id)) {
        const obj = {};
        headers.forEach((h, j) => obj[h] = data.rows[i][j]);
        return obj;
      }
    }

    return null;
  };

  /**
   * Save or update a user record.
   * Invalidates user cache after modification.
   */
  self.saveUser = function(spreadsheetId, userObj) {
    self.requireRole(spreadsheetId, ['Admin']);
    self.requireFields(userObj, ['email', 'display_name', 'role']);

    const data = self.getSheetValues(spreadsheetId, 'Users');
    const headers = data.headers;
    const rows = data.rows;

    const id = userObj.user_id || self.generateUuidV4();
    const now = self.generateTimestampIsoUtc();
    const idIdx = headers.indexOf('user_id');

    let rowIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][idIdx]) === String(id)) {
        rowIdx = i + 2; // header row offset
        break;
      }
    }

    const rowObj = {
      user_id: id,
      email: self.sanitizeString(userObj.email),
      display_name: self.sanitizeString(userObj.display_name),
      role: self.sanitizeString(userObj.role),
      active: userObj.active === true || String(userObj.active).toLowerCase() === 'true',
      created_at: userObj.created_at || now,
      last_login: userObj.last_login || ''
    };

    if (rowIdx === -1) {
      self.writeRowByHeaderMap(spreadsheetId, 'Users', headers, rowObj);
    } else {
      const ss = SpreadsheetApp.openById(spreadsheetId);
      const sh = ss.getSheetByName('Users');
      Object.keys(rowObj).forEach(h => {
        const col = headers.indexOf(h) + 1;
        if (col > 0) sh.getRange(rowIdx, col).setValue(rowObj[h]);
      });
    }

    // Invalidate user-related caches
    if (self.invalidateRelatedCaches) {
      self.invalidateRelatedCaches('user');
    }

    return { success: true, user_id: id };
  };

  /**
   * Delete a user by ID.
   * Invalidates user cache after deletion.
   */
  self.deleteUser = function(spreadsheetId, user_id) {
    self.requireRole(spreadsheetId, ['Admin']);

    const data = self.getSheetValues(spreadsheetId, 'Users');
    const headers = data.headers;
    const rows = data.rows;
    const idIdx = headers.indexOf('user_id');

    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][idIdx]) === String(user_id)) {
        const ss = SpreadsheetApp.openById(spreadsheetId);
        const sh = ss.getSheetByName('Users');
        sh.deleteRow(i + 2); // account for header row
        
        // Invalidate user-related caches
        if (self.invalidateRelatedCaches) {
          self.invalidateRelatedCaches('user');
        }
        
        return { success: true };
      }
    }

    return { success: false, error: 'Not found' };
  };

  return self;
})(typeof CrmLib !== 'undefined' ? CrmLib : {});
