var CrmLib = CrmLib || {};

CrmLib.getSpreadsheet_ = function(spreadsheetId) {
  if (!spreadsheetId) throw new Error('Spreadsheet ID required');
  return SpreadsheetApp.openById(spreadsheetId);
};

CrmLib.getSheetValues = function(spreadsheetId, sheetName) {
  var ss = CrmLib.getSpreadsheet_(spreadsheetId);
  var sh = ss.getSheetByName(sheetName);
  if (!sh) throw new Error('Missing sheet: ' + sheetName);
  var values = sh.getDataRange().getValues();
  if (values.length === 0) return { headers: [], rows: [] };
  var headers = values.shift();
  return { headers: headers, rows: values };
};

CrmLib.appendRows = function(spreadsheetId, sheetName, rows) {
  if (!rows || rows.length === 0) return;
  var ss = CrmLib.getSpreadsheet_(spreadsheetId);
  var sh = ss.getSheetByName(sheetName);
  if (!sh) throw new Error('Missing sheet: ' + sheetName);
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
};

CrmLib.writeRowByHeaderMap = function(spreadsheetId, sheetName, headerOrder, objectRow) {
  var row = headerOrder.map(function(h) { return objectRow[h] === undefined ? '' : objectRow[h]; });
  CrmLib.appendRows(spreadsheetId, sheetName, [row]);
};

CrmLib.withCache = function(cacheKey, fetcher, seconds) {
  var cache = CacheService.getScriptCache();
  var cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);
  var value = fetcher();
  cache.put(cacheKey, JSON.stringify(value), seconds || 300);
  return value;
}; 