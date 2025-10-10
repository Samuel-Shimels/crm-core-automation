var CrmLib = CrmLib || {};

CrmLib.listDeals = function(spreadsheetId, params) {
  CrmLib.requireRole(spreadsheetId, ['Admin', 'User']);
  params = params || {};
  var page = params.page || 1;
  var pageSize = params.pageSize || 25;
  var filters = params.filters || {};
  var data = CrmLib.getSheetValues(spreadsheetId, 'Deals');
  var headers = data.headers;
  var rows = data.rows;
  var results = rows.map(function(r) {
    var o = {};
    headers.forEach(function(h, i) {
      o[h] = r[i];
    });
    return o;
  });
  if (filters.status) {
    results = results.filter(function(o) {
      return String(o.status) === String(filters.status);
    });
  }
  if (filters.stage) {
    results = results.filter(function(o) {
      return String(o.stage) === String(filters.stage);
    });
  }
  var total = results.length;
  var start = (page - 1) * pageSize;
  var end = start + pageSize;
  return { rows: results.slice(start, end), total: total };
};

CrmLib.getDeal = function(spreadsheetId, deal_id) {
  CrmLib.requireRole(spreadsheetId, ['Admin', 'User']);
  var data = CrmLib.getSheetValues(spreadsheetId, 'Deals');
  var h = data.headers;
  var rows = data.rows;
  var idIdx = h.indexOf('deal_id');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(deal_id)) {
      var o = {};
      h.forEach(function(k, j) {
        o[k] = rows[i][j];
      });
      return o;
    }
  }
  return null;
};

CrmLib.saveDeal = function(spreadsheetId, dealObj) {
  var user = CrmLib.requireRole(spreadsheetId, ['Admin', 'User']);
  CrmLib.requireFields(dealObj, ['title']);
  var data = CrmLib.getSheetValues(spreadsheetId, 'Deals');
  var headers = data.headers;
  var rows = data.rows;
  var id = dealObj.deal_id || CrmLib.generateUuidV4();
  var now = CrmLib.generateTimestampIsoUtc();
  var idIdx = headers.indexOf('deal_id');
  var rowIdx = -1;
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(id)) {
      rowIdx = i + 2;
      break;
    }
  }
  var rowObj = {
    deal_id: id,
    title: CrmLib.sanitizeString(dealObj.title),
    company_id: dealObj.company_id || '',
    primary_contact_id: dealObj.primary_contact_id || '',
    owner_user_id: dealObj.owner_user_id || user.user_id || '',
    pipeline: CrmLib.sanitizeString(dealObj.pipeline) || 'Sales',
    stage: CrmLib.sanitizeString(dealObj.stage) || 'Prospect',
    amount: CrmLib.toNumber(dealObj.amount),
    currency: CrmLib.sanitizeString(dealObj.currency) || 'USD',
    close_date: dealObj.close_date || '',
    probability: CrmLib.toNumber(dealObj.probability),
    status: CrmLib.sanitizeString(dealObj.status) || 'Open',
    created_at: dealObj.created_at || now,
    updated_at: now
  };
  if (rowIdx === -1) {
    CrmLib.writeRowByHeaderMap(spreadsheetId, 'Deals', headers, rowObj);
  } else {
    var ss = SpreadsheetApp.openById(spreadsheetId);
    var sh = ss.getSheetByName('Deals');
    Object.keys(rowObj).forEach(function(h) {
      var col = headers.indexOf(h) + 1;
      if (col > 0) sh.getRange(rowIdx, col).setValue(rowObj[h]);
    });
  }
  return { success: true, deal_id: id };
};

CrmLib.deleteDeal = function(spreadsheetId, deal_id) {
  CrmLib.requireRole(spreadsheetId, ['Admin']);
  var data = CrmLib.getSheetValues(spreadsheetId, 'Deals');
  var headers = data.headers;
  var rows = data.rows;
  var idIdx = headers.indexOf('deal_id');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(deal_id)) {
      var ss = SpreadsheetApp.openById(spreadsheetId);
      var sh = ss.getSheetByName('Deals');
      sh.deleteRow(i + 2);
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
};
