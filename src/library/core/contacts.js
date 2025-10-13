/**
 * CRM Library - Contacts Module
 * Usage example (in bound script):
 *   const contacts = CrmLib.listContacts(spreadsheetId, { filters: { email: 'john@acme.com' } });
 *   const contact = CrmLib.getContact(spreadsheetId, 'ct123');
 *   const saved = CrmLib.saveContact(spreadsheetId, { first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com' });
 *   CrmLib.deleteContact(spreadsheetId, 'ct123');
 */

var CrmLib = (function(ns) {
  const self = ns || {};

  /**
   * List contacts with pagination and optional filters.
   */
  self.listContacts = function(spreadsheetId, params) {
    self.requireRole(spreadsheetId, ['Admin', 'User']);
    params = params || {};

    const page = params.page || 1;
    const pageSize = params.pageSize || 25;
    const filters = params.filters || {};

    const data = self.getSheetValues(spreadsheetId, 'Contacts');
    const headers = data.headers;
    let results = data.rows.map(r => {
      const o = {};
      headers.forEach((h, i) => o[h] = r[i]);
      return o;
    });

    // Filter by email
    if (filters.email) {
      const needle = String(filters.email).toLowerCase();
      results = results.filter(o =>
        String(o.email || '').toLowerCase().includes(needle)
      );
    }

    // Filter by owner_user_id
    if (filters.owner_user_id) {
      results = results.filter(o =>
        String(o.owner_user_id) === String(filters.owner_user_id)
      );
    }

    const total = results.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return { rows: results.slice(start, end), total };
  };

  /**
   * Retrieve a single contact by ID.
   */
  self.getContact = function(spreadsheetId, contact_id) {
    self.requireRole(spreadsheetId, ['Admin', 'User']);

    const data = self.getSheetValues(spreadsheetId, 'Contacts');
    const headers = data.headers;
    const idIdx = headers.indexOf('contact_id');

    for (let i = 0; i < data.rows.length; i++) {
      if (String(data.rows[i][idIdx]) === String(contact_id)) {
        const obj = {};
        headers.forEach((h, j) => obj[h] = data.rows[i][j]);
        return obj;
      }
    }
    return null;
  };

  /**
   * Save or update a contact record.
   */
  self.saveContact = function(spreadsheetId, contactObj) {
    const user = self.requireRole(spreadsheetId, ['Admin', 'User']);
    self.requireFields(contactObj, ['first_name', 'last_name', 'email']);

    const data = self.getSheetValues(spreadsheetId, 'Contacts');
    const headers = data.headers;
    const rows = data.rows;

    const id = contactObj.contact_id || self.generateUuidV4();
    const now = self.generateTimestampIsoUtc();
    const idIdx = headers.indexOf('contact_id');

    let rowIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][idIdx]) === String(id)) {
        rowIdx = i + 2; // account for header row
        break;
      }
    }

    const rowObj = {
      contact_id: id,
      owner_user_id: contactObj.owner_user_id || user.user_id || '',
      first_name: self.sanitizeString(contactObj.first_name),
      last_name: self.sanitizeString(contactObj.last_name),
      email: self.sanitizeString(contactObj.email),
      phone: self.sanitizeString(contactObj.phone),
      company_id: contactObj.company_id || '',
      source: self.sanitizeString(contactObj.source),
      status: self.sanitizeString(contactObj.status),
      lead_score: self.toNumber(contactObj.lead_score),
      tags: self.sanitizeString(contactObj.tags),
      created_at: contactObj.created_at || now,
      updated_at: now
    };

    if (rowIdx === -1) {
      // New contact
      self.writeRowByHeaderMap(spreadsheetId, 'Contacts', headers, rowObj);
    } else {
      // Update existing contact
      const ss = SpreadsheetApp.openById(spreadsheetId);
      const sh = ss.getSheetByName('Contacts');
      Object.keys(rowObj).forEach(h => {
        const col = headers.indexOf(h) + 1;
        if (col > 0) sh.getRange(rowIdx, col).setValue(rowObj[h]);
      });
    }

    return { success: true, contact_id: id };
  };

  /**
   * Delete a contact by ID.
   */
  self.deleteContact = function(spreadsheetId, contact_id) {
    self.requireRole(spreadsheetId, ['Admin']);

    const data = self.getSheetValues(spreadsheetId, 'Contacts');
    const headers = data.headers;
    const rows = data.rows;
    const idIdx = headers.indexOf('contact_id');

    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][idIdx]) === String(contact_id)) {
        const ss = SpreadsheetApp.openById(spreadsheetId);
        const sh = ss.getSheetByName('Contacts');
        sh.deleteRow(i + 2); // adjust for header row
        return { success: true };
      }
    }

    return { success: false, error: 'Not found' };
  };

  // Return the extended namespace
  return self;
})(typeof CrmLib !== 'undefined' ? CrmLib : {});
