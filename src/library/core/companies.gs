var CrmLib = CrmLib || {};

CrmLib.listCompanies = function(spreadsheetId, params) {
  CrmLib.requireRole(spreadsheetId, ['Admin', 'User']);
  params = params || {};
  var page = params.page || 1;
  var pageSize = params.pageSize || 25;
  var filters = params.filters || {};
  var data = CrmLib.getSheetValues(spreadsheetId, 'Companies');
  var headers = data.headers;
  var rows = data.rows;
  var results = rows.map(function(r) {
    var o = {};
    headers.forEach(function(h, i) {
      o[h] = r[i];
    });
    return o;
  });
  if (filters.name) {
    var needle = String(filters.name).toLowerCase();
    results = results.filter(function(o) {
      return String(o.name || '').toLowerCase().indexOf(needle) !== -1;
    });
  }
  if (filters.industry) {
    var industryNeedle = String(filters.industry).toLowerCase();
    results = results.filter(function(o) {
      return String(o.industry || '').toLowerCase().indexOf(industryNeedle) !== -1;
    });
  }
  var total = results.length;
  var start = (page - 1) * pageSize;
  var end = start + pageSize;
  return { rows: results.slice(start, end), total: total };
};

CrmLib.getCompany = function(spreadsheetId, company_id) {
  CrmLib.requireRole(spreadsheetId, ['Admin', 'User']);
  var data = CrmLib.getSheetValues(spreadsheetId, 'Companies');
  var h = data.headers;
  var rows = data.rows;
  var idIdx = h.indexOf('company_id');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(company_id)) {
      var o = {};
      h.forEach(function(k, j) {
        o[k] = rows[i][j];
      });
      return o;
    }
  }
  return null;
};

CrmLib.saveCompany = function(spreadsheetId, companyObj) {
  var user = CrmLib.requireRole(spreadsheetId, ['Admin', 'User']);
  CrmLib.requireFields(companyObj, ['name']);
  var data = CrmLib.getSheetValues(spreadsheetId, 'Companies');
  var headers = data.headers;
  var rows = data.rows;
  var id = companyObj.company_id || CrmLib.generateUuidV4();
  var now = CrmLib.generateTimestampIsoUtc();
  var idIdx = headers.indexOf('company_id');
  var rowIdx = -1;
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(id)) {
      rowIdx = i + 2;
      break;
    }
  }
  var rowObj = {
    company_id: id,
    name: CrmLib.sanitizeString(companyObj.name),
    industry: CrmLib.sanitizeString(companyObj.industry),
    website: CrmLib.sanitizeString(companyObj.website),
    phone: CrmLib.sanitizeString(companyObj.phone),
    address: CrmLib.sanitizeString(companyObj.address),
    owner_user_id: companyObj.owner_user_id || user.user_id || '',
    created_at: companyObj.created_at || now,
    updated_at: now
  };
  if (rowIdx === -1) {
    CrmLib.writeRowByHeaderMap(spreadsheetId, 'Companies', headers, rowObj);
  } else {
    var ss = SpreadsheetApp.openById(spreadsheetId);
    var sh = ss.getSheetByName('Companies');
    Object.keys(rowObj).forEach(function(h) {
      var col = headers.indexOf(h) + 1;
      if (col > 0) sh.getRange(rowIdx, col).setValue(rowObj[h]);
    });
  }
  return { success: true, company_id: id };
};

CrmLib.deleteCompany = function(spreadsheetId, company_id) {
  CrmLib.requireRole(spreadsheetId, ['Admin']);
  var data = CrmLib.getSheetValues(spreadsheetId, 'Companies');
  var headers = data.headers;
  var rows = data.rows;
  var idIdx = headers.indexOf('company_id');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(company_id)) {
      var ss = SpreadsheetApp.openById(spreadsheetId);
      var sh = ss.getSheetByName('Companies');
      sh.deleteRow(i + 2);
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
};
