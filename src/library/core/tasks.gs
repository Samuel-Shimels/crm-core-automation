var CrmLib = CrmLib || {};

CrmLib.listTasks = function(spreadsheetId, params) {
  CrmLib.requireRole(spreadsheetId, ['Admin', 'User']);
  params = params || {};
  var page = params.page || 1;
  var pageSize = params.pageSize || 25;
  var filters = params.filters || {};
  var data = CrmLib.getSheetValues(spreadsheetId, 'Tasks');
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
  if (filters.priority) {
    results = results.filter(function(o) {
      return String(o.priority) === String(filters.priority);
    });
  }
  var total = results.length;
  var start = (page - 1) * pageSize;
  var end = start + pageSize;
  return { rows: results.slice(start, end), total: total };
};

CrmLib.getTask = function(spreadsheetId, task_id) {
  CrmLib.requireRole(spreadsheetId, ['Admin', 'User']);
  var data = CrmLib.getSheetValues(spreadsheetId, 'Tasks');
  var h = data.headers;
  var rows = data.rows;
  var idIdx = h.indexOf('task_id');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(task_id)) {
      var o = {};
      h.forEach(function(k, j) {
        o[k] = rows[i][j];
      });
      return o;
    }
  }
  return null;
};

CrmLib.saveTask = function(spreadsheetId, taskObj) {
  var user = CrmLib.requireRole(spreadsheetId, ['Admin', 'User']);
  CrmLib.requireFields(taskObj, ['subject']);
  var data = CrmLib.getSheetValues(spreadsheetId, 'Tasks');
  var headers = data.headers;
  var rows = data.rows;
  var id = taskObj.task_id || CrmLib.generateUuidV4();
  var now = CrmLib.generateTimestampIsoUtc();
  var idIdx = headers.indexOf('task_id');
  var rowIdx = -1;
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(id)) {
      rowIdx = i + 2;
      break;
    }
  }
  var rowObj = {
    task_id: id,
    subject: CrmLib.sanitizeString(taskObj.subject),
    description: CrmLib.sanitizeString(taskObj.description),
    related_type: CrmLib.sanitizeString(taskObj.related_type),
    related_id: taskObj.related_id || '',
    owner_user_id: taskObj.owner_user_id || user.user_id || '',
    due_date: taskObj.due_date || '',
    priority: CrmLib.sanitizeString(taskObj.priority) || 'Medium',
    status: CrmLib.sanitizeString(taskObj.status) || 'Pending',
    reminder_sent: taskObj.reminder_sent || false,
    created_at: taskObj.created_at || now,
    updated_at: now
  };
  if (rowIdx === -1) {
    CrmLib.writeRowByHeaderMap(spreadsheetId, 'Tasks', headers, rowObj);
  } else {
    var ss = SpreadsheetApp.openById(spreadsheetId);
    var sh = ss.getSheetByName('Tasks');
    Object.keys(rowObj).forEach(function(h) {
      var col = headers.indexOf(h) + 1;
      if (col > 0) sh.getRange(rowIdx, col).setValue(rowObj[h]);
    });
  }
  return { success: true, task_id: id };
};

CrmLib.deleteTask = function(spreadsheetId, task_id) {
  CrmLib.requireRole(spreadsheetId, ['Admin', 'User']);
  var data = CrmLib.getSheetValues(spreadsheetId, 'Tasks');
  var headers = data.headers;
  var rows = data.rows;
  var idIdx = headers.indexOf('task_id');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(task_id)) {
      var ss = SpreadsheetApp.openById(spreadsheetId);
      var sh = ss.getSheetByName('Tasks');
      sh.deleteRow(i + 2);
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
};
