/**
 * CRM Library - Core Utilities
 * Provides spreadsheet access, row mapping, and caching helpers.
 */

var CrmLib = (function(ns) {
  const self = ns || {};

  /**
   * Open a spreadsheet by ID.
   */
  self.getSpreadsheet_ = function(spreadsheetId) {
    if (!spreadsheetId) throw new Error('Spreadsheet ID required');
    return SpreadsheetApp.openById(spreadsheetId);
  };

  /**
   * Read sheet values as { headers: [], rows: [[]] }.
   */
  self.getSheetValues = function(spreadsheetId, sheetName) {
    const ss = self.getSpreadsheet_(spreadsheetId);
    const sh = ss.getSheetByName(sheetName);
    if (!sh) throw new Error('Missing sheet: ' + sheetName);

    const values = sh.getDataRange().getValues();
    if (values.length === 0) return { headers: [], rows: [] };

    const headers = values.shift();
    return { headers, rows: values };
  };

  /**
   * Append rows to a sheet.
   */
  self.appendRows = function(spreadsheetId, sheetName, rows) {
    if (!rows || rows.length === 0) return;

    const ss = self.getSpreadsheet_(spreadsheetId);
    const sh = ss.getSheetByName(sheetName);
    if (!sh) throw new Error('Missing sheet: ' + sheetName);

    sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  };

  /**
   * Write a single row to a sheet using a header map.
   */
  self.writeRowByHeaderMap = function(spreadsheetId, sheetName, headerOrder, objectRow) {
    const row = headerOrder.map(h => objectRow[h] === undefined ? '' : objectRow[h]);
    self.appendRows(spreadsheetId, sheetName, [row]);
  };

  /**
   * Fetch and cache a value using ScriptCache.
   */
  self.withCache = function(cacheKey, fetcher, seconds) {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const value = fetcher();
    cache.put(cacheKey, JSON.stringify(value), seconds || 300);
    return value;
  };

  return self;
})(typeof CrmLib !== 'undefined' ? CrmLib : {});
