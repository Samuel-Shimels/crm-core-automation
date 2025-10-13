/**
 * CRM Library - Deals Module
 * Usage example (in bound script):
 *   const deals = CrmLib.listDeals(spreadsheetId, { filters: { stage: 'Prospect' } });
 *   const deal = CrmLib.getDeal(spreadsheetId, 'dl123');
 *   const saved = CrmLib.saveDeal(spreadsheetId, { title: 'New Deal', amount: 5000 });
 *   CrmLib.deleteDeal(spreadsheetId, 'dl123');
 */

var CrmLib = (function(ns) {
  const self = ns || {};

  /**
   * List deals with pagination and optional filters.
   */
  self.listDeals = function(spreadsheetId, params) {
    self.requireRole(spreadsheetId, ['Admin', 'User']);
    params = params || {};

    const page = params.page || 1;
    const pageSize = params.pageSize || 25;
    const filters = params.filters || {};

    const data = self.getSheetValues(spreadsheetId, 'Deals');
    const headers = data.headers;
    let results = data.rows.map(r => {
      const o = {};
      headers.forEach((h, i) => o[h] = r[i]);
      return o;
    });

    // Optional filters
    if (filters.status) {
      results = results.filter(o =>
        String(o.status) === String(filters.status)
      );
    }

    if (filters.stage) {
      results = results.filter(o =>
        String(o.stage) === String(filters.stage)
      );
    }

    const total = results.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return { rows: results.slice(start, end), total };
  };

  /**
   * Retrieve a single deal by ID.
   */
  self.getDeal = function(spreadsheetId, deal_id) {
    self.requireRole(spreadsheetId, ['Admin', 'User']);

    const data = self.getSheetValues(spreadsheetId, 'Deals');
    const headers = data.headers;
    const idIdx = headers.indexOf('deal_id');

    for (let i = 0; i < data.rows.length; i++) {
      if (String(data.rows[i][idIdx]) === String(deal_id)) {
        const obj = {};
        headers.forEach((h, j) => obj[h] = data.rows[i][j]);
        return obj;
      }
    }

    return null;
  };

  /**
   * Save or update a deal record.
   */
  self.saveDeal = function(spreadsheetId, dealObj) {
    const user = self.requireRole(spreadsheetId, ['Admin', 'User']);
    self.requireFields(dealObj, ['title']);

    const data = self.getSheetValues(spreadsheetId, 'Deals');
    const headers = data.headers;
    const rows = data.rows;

    const id = dealObj.deal_id || self.generateUuidV4();
    const now = self.generateTimestampIsoUtc();
    const idIdx = headers.indexOf('deal_id');

    let rowIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][idIdx]) === String(id)) {
        rowIdx = i + 2; // header row offset
        break;
      }
    }

    const rowObj = {
      deal_id: id,
      title: self.sanitizeString(dealObj.title),
      company_id: dealObj.company_id || '',
      primary_contact_id: dealObj.primary_contact_id || '',
      owner_user_id: dealObj.owner_user_id || user.user_id || '',
      pipeline: self.sanitizeString(dealObj.pipeline) || 'Sales',
      stage: self.sanitizeString(dealObj.stage) || 'Prospect',
      amount: self.toNumber(dealObj.amount),
      currency: self.sanitizeString(dealObj.currency) || 'USD',
      close_date: dealObj.close_date || '',
      probability: self.toNumber(dealObj.probability),
      status: self.sanitizeString(dealObj.status) || 'Open',
      created_at: dealObj.created_at || now,
      updated_at: now
    };

    if (rowIdx === -1) {
      // New deal → append row
      self.writeRowByHeaderMap(spreadsheetId, 'Deals', headers, rowObj);
    } else {
      // Update existing deal
      const ss = SpreadsheetApp.openById(spreadsheetId);
      const sh = ss.getSheetByName('Deals');
      Object.keys(rowObj).forEach(h => {
        const col = headers.indexOf(h) + 1;
        if (col > 0) sh.getRange(rowIdx, col).setValue(rowObj[h]);
      });
    }

    // Invalidate deal-related caches
    if (self.invalidateRelatedCaches) {
      self.invalidateRelatedCaches('deal');
    }

    return { success: true, deal_id: id };
  };

  /**
   * Delete a deal record by ID.
   */
  self.deleteDeal = function(spreadsheetId, deal_id) {
    self.requireRole(spreadsheetId, ['Admin']);

    const data = self.getSheetValues(spreadsheetId, 'Deals');
    const headers = data.headers;
    const rows = data.rows;
    const idIdx = headers.indexOf('deal_id');

    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][idIdx]) === String(deal_id)) {
        const ss = SpreadsheetApp.openById(spreadsheetId);
        const sh = ss.getSheetByName('Deals');
        sh.deleteRow(i + 2); // +2 for header row
        
        // Invalidate deal-related caches
        if (self.invalidateRelatedCaches) {
          self.invalidateRelatedCaches('deal');
        }
        
        return { success: true };
      }
    }

    return { success: false, error: 'Not found' };
  };

  // Return the extended namespace
  return self;
})(typeof CrmLib !== 'undefined' ? CrmLib : {});
