/**
 * CRM Library
 * Usage (in bound script):
 *   const user = CrmLib.findUserByEmail(spreadsheetId, 'user@example.com');
 *   const current = CrmLib.requireRole(spreadsheetId, ['Admin', 'Manager']);
 */

var CrmLib = (function() {
  const self = {};

  /**
   * Get sheet headers and rows as an object.
   * (This helper is expected to exist in this library.)
   */
  self.getSheetValues = function(spreadsheetId, sheetName) {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sh = ss.getSheetByName(sheetName);
    const values = sh.getDataRange().getValues();
    const headers = values.shift();
    return { headers, rows: values };
  };

  /**
   * Generate current timestamp in ISO UTC format.
   */
  self.generateTimestampIsoUtc = function() {
    return new Date().toISOString();
  };

  /**
   * Find user record by email (case-insensitive).
   */
  self.findUserByEmail = function(spreadsheetId, email) {
    const data = self.getSheetValues(spreadsheetId, 'Users');
    const h = data.headers, rows = data.rows;

    const idx = {
      user_id: h.indexOf('user_id'),
      email: h.indexOf('email'),
      display_name: h.indexOf('display_name'),
      role: h.indexOf('role'),
      active: h.indexOf('active'),
      created_at: h.indexOf('created_at'),
      last_login: h.indexOf('last_login')
    };

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (String(r[idx.email]).toLowerCase() === String(email).toLowerCase()) {
        return {
          user_id: r[idx.user_id],
          email: r[idx.email],
          display_name: r[idx.display_name],
          role: r[idx.role],
          active: r[idx.active] === true || String(r[idx.active]).toLowerCase() === 'true',
          created_at: r[idx.created_at],
          last_login: r[idx.last_login]
        };
      }
    }
    return null;
  };

  /**
   * Ensure the current user has one of the allowed roles.
   */
  self.requireRole = function(spreadsheetId, allowedRoles) {
    const email = Session.getActiveUser().getEmail();
    if (!email) throw new Error('No active user found.');

    const user = self.findUserByEmail(spreadsheetId, email);
    if (!user || !user.active) throw new Error('Unauthorized user.');

    if (allowedRoles && allowedRoles.length && allowedRoles.indexOf(user.role) === -1) {
      throw new Error('Forbidden: insufficient privileges.');
    }
    return user;
  };

  /**
   * Record login timestamp for the current user.
   */
  self.recordLogin = function(spreadsheetId) {
    const email = Session.getActiveUser().getEmail();
    if (!email) return;

    const data = self.getSheetValues(spreadsheetId, 'Users');
    const headers = data.headers, rows = data.rows;
    const emailIdx = headers.indexOf('email');
    const lastLoginIdx = headers.indexOf('last_login');

    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sh = ss.getSheetByName('Users');

    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][emailIdx]).toLowerCase() === String(email).toLowerCase()) {
        sh.getRange(i + 2, lastLoginIdx + 1).setValue(self.generateTimestampIsoUtc());
        break;
      }
    }
  };

  // Return public API
  return self;
})();
