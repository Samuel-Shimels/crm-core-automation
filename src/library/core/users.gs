var CrmLib = CrmLib || {};

CrmLib.listUsers = function(spreadsheetId, params) {
  CrmLib.requireRole(spreadsheetId, ['Admin']);
  params = params || {};
  var page = params.page || 1;
  var pageSize = params.pageSize || 100;
  var data = CrmLib.getSheetValues(spreadsheetId, 'Users');
  var headers = data.headers;
  var rows = data.rows;
  var results = rows.map(function(r) {
    var o = {};
    headers.forEach(function(h, i) {
      o[h] = r[i];
    });
    return o;
  });
  var total = results.length;
  var start = (page - 1) * pageSize;
  var end = start + pageSize;
  return { rows: results.slice(start, end), total: total };
};

CrmLib.getUser = function(spreadsheetId, user_id) {
  CrmLib.requireRole(spreadsheetId, ['Admin']);
  var data = CrmLib.getSheetValues(spreadsheetId, 'Users');
  var h = data.headers;
  var rows = data.rows;
  var idIdx = h.indexOf('user_id');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(user_id)) {
      var o = {};
      h.forEach(function(k, j) {
        o[k] = rows[i][j];
      });
      return o;
    }
  }
  return null;
};

CrmLib.saveUser = function(spreadsheetId, userObj) {
  CrmLib.requireRole(spreadsheetId, ['Admin']);
  CrmLib.requireFields(userObj, ['email', 'display_name', 'role']);
  var data = CrmLib.getSheetValues(spreadsheetId, 'Users');
  var headers = data.headers;
  var rows = data.rows;
  var id = userObj.user_id || CrmLib.generateUuidV4();
  var now = CrmLib.generateTimestampIsoUtc();
  var idIdx = headers.indexOf('user_id');
  var rowIdx = -1;
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(id)) {
      rowIdx = i + 2;
      break;
    }
  }
  var rowObj = {
    user_id: id,
    email: CrmLib.sanitizeString(userObj.email),
    display_name: CrmLib.sanitizeString(userObj.display_name),
    role: CrmLib.sanitizeString(userObj.role),
    active: userObj.active === true || String(userObj.active).toLowerCase() === 'true',
    created_at: userObj.created_at || now,
    last_login: userObj.last_login || ''
  };
  if (rowIdx === -1) {
    CrmLib.writeRowByHeaderMap(spreadsheetId, 'Users', headers, rowObj);
  } else {
    var ss = SpreadsheetApp.openById(spreadsheetId);
    var sh = ss.getSheetByName('Users');
    Object.keys(rowObj).forEach(function(h) {
      var col = headers.indexOf(h) + 1;
      if (col > 0) sh.getRange(rowIdx, col).setValue(rowObj[h]);
    });
  }
  return { success: true, user_id: id };
};

CrmLib.deleteUser = function(spreadsheetId, user_id) {
  CrmLib.requireRole(spreadsheetId, ['Admin']);
  var data = CrmLib.getSheetValues(spreadsheetId, 'Users');
  var headers = data.headers;
  var rows = data.rows;
  var idIdx = headers.indexOf('user_id');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(user_id)) {
      var ss = SpreadsheetApp.openById(spreadsheetId);
      var sh = ss.getSheetByName('Users');
      sh.deleteRow(i + 2);
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
};
