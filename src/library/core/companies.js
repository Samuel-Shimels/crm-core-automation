/**
 * CRM Library - Companies Module
 * Usage example (in bound script):
 *   const list = CrmLib.listCompanies(spreadsheetId, { filters: { name: 'Acme' } });
 *   const company = CrmLib.getCompany(spreadsheetId, 'cmp123');
 *   const saved = CrmLib.saveCompany(spreadsheetId, { name: 'New Co' });
 *   CrmLib.deleteCompany(spreadsheetId, 'cmp123');
 */

var CrmLib = (function(ns) {
  const self = ns || {};

  /**
   * List companies with pagination and optional filters.
   */
  self.listCompanies = function(spreadsheetId, params) {
    self.requireRole(spreadsheetId, ['Admin', 'User']);
    params = params || {};

    const page = params.page || 1;
    const pageSize = params.pageSize || 25;
    const filters = params.filters || {};

    const data = self.getSheetValues(spreadsheetId, 'Companies');
    const headers = data.headers;
    let results = data.rows.map(r => {
      const o = {};
      headers.forEach((h, i) => o[h] = r[i]);
      return o;
    });

    // Optional filters
    if (filters.name) {
      const needle = String(filters.name).toLowerCase();
      results = results.filter(o =>
        String(o.name || '').toLowerCase().includes(needle)
      );
    }

    if (filters.industry) {
      const needle = String(filters.industry).toLowerCase();
      results = results.filter(o =>
        String(o.industry || '').toLowerCase().includes(needle)
      );
    }

    const total = results.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return { rows: results.slice(start, end), total };
  };

  /**
   * Retrieve a single company by ID.
   */
  self.getCompany = function(spreadsheetId, company_id) {
    self.requireRole(spreadsheetId, ['Admin', 'User']);
    const data = self.getSheetValues(spreadsheetId, 'Companies');
    const headers = data.headers;
    const idIdx = headers.indexOf('company_id');

    for (let i = 0; i < data.rows.length; i++) {
      if (String(data.rows[i][idIdx]) === String(company_id)) {
        const obj = {};
        headers.forEach((h, j) => obj[h] = data.rows[i][j]);
        return obj;
      }
    }
    return null;
  };

  /**
   * Save or update a company record.
   * Invalidates company cache after modification.
   */
  self.saveCompany = function(spreadsheetId, companyObj) {
    const user = self.requireRole(spreadsheetId, ['Admin', 'User']);
    self.requireFields(companyObj, ['name']);

    const data = self.getSheetValues(spreadsheetId, 'Companies');
    const headers = data.headers;
    const rows = data.rows;

    const id = companyObj.company_id || self.generateUuidV4();
    const now = self.generateTimestampIsoUtc();
    const idIdx = headers.indexOf('company_id');

    let rowIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][idIdx]) === String(id)) {
        rowIdx = i + 2; // header row + 1
        break;
      }
    }

    const rowObj = {
      company_id: id,
      name: self.sanitizeString(companyObj.name),
      industry: self.sanitizeString(companyObj.industry),
      website: self.sanitizeString(companyObj.website),
      phone: self.sanitizeString(companyObj.phone),
      address: self.sanitizeString(companyObj.address),
      owner_user_id: companyObj.owner_user_id || user.user_id || '',
      created_at: companyObj.created_at || now,
      updated_at: now
    };

    if (rowIdx === -1) {
      // Append new row
      self.writeRowByHeaderMap(spreadsheetId, 'Companies', headers, rowObj);
    } else {
      // Update existing row
      const ss = SpreadsheetApp.openById(spreadsheetId);
      const sh = ss.getSheetByName('Companies');
      Object.keys(rowObj).forEach(h => {
        const col = headers.indexOf(h) + 1;
        if (col > 0) sh.getRange(rowIdx, col).setValue(rowObj[h]);
      });
    }

    // Invalidate company-related caches
    if (self.invalidateRelatedCaches) {
      self.invalidateRelatedCaches('company');
    }

    return { success: true, company_id: id };
  };

  /**
   * Delete a company record by ID.
   * Invalidates company cache after deletion.
   */
  self.deleteCompany = function(spreadsheetId, company_id) {
    self.requireRole(spreadsheetId, ['Admin']);

    const data = self.getSheetValues(spreadsheetId, 'Companies');
    const headers = data.headers;
    const rows = data.rows;
    const idIdx = headers.indexOf('company_id');

    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][idIdx]) === String(company_id)) {
        const ss = SpreadsheetApp.openById(spreadsheetId);
        const sh = ss.getSheetByName('Companies');
        sh.deleteRow(i + 2); // adjust for header row
        
        // Invalidate company-related caches
        if (self.invalidateRelatedCaches) {
          self.invalidateRelatedCaches('company');
        }
        
        return { success: true };
      }
    }

    return { success: false, error: 'Not found' };
  };

  // Return augmented namespace
  return self;
})(typeof CrmLib !== 'undefined' ? CrmLib : {});
