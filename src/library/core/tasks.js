/**
 * CRM Library - Tasks Module
 * Usage example (in bound script):
 *   const tasks = CrmLib.listTasks(spreadsheetId, { filters: { status: 'Pending' } });
 *   const task = CrmLib.getTask(spreadsheetId, 't123');
 *   const saved = CrmLib.saveTask(spreadsheetId, { subject: 'Follow up', related_type: 'Deal' });
 *   CrmLib.deleteTask(spreadsheetId, 't123');
 */

var CrmLib = (function(ns) {
  const self = ns || {};

  /**
   * List tasks with pagination and optional filters.
   */
  self.listTasks = function(spreadsheetId, params) {
    self.requireRole(spreadsheetId, ['Admin', 'User']);
    params = params || {};

    const page = params.page || 1;
    const pageSize = params.pageSize || 25;
    const filters = params.filters || {};

    const data = self.getSheetValues(spreadsheetId, 'Tasks');
    const headers = data.headers;
    let results = data.rows.map(r => {
      const o = {};
      headers.forEach((h, i) => o[h] = r[i]);
      return o;
    });

    // Apply filters
    if (filters.status) {
      results = results.filter(o => String(o.status) === String(filters.status));
    }

    if (filters.priority) {
      results = results.filter(o => String(o.priority) === String(filters.priority));
    }

    const total = results.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return { rows: results.slice(start, end), total };
  };

  /**
   * Retrieve a single task by ID.
   */
  self.getTask = function(spreadsheetId, task_id) {
    self.requireRole(spreadsheetId, ['Admin', 'User']);

    const data = self.getSheetValues(spreadsheetId, 'Tasks');
    const headers = data.headers;
    const idIdx = headers.indexOf('task_id');

    for (let i = 0; i < data.rows.length; i++) {
      if (String(data.rows[i][idIdx]) === String(task_id)) {
        const obj = {};
        headers.forEach((h, j) => obj[h] = data.rows[i][j]);
        return obj;
      }
    }

    return null;
  };

  /**
   * Save or update a task record.
   */
  self.saveTask = function(spreadsheetId, taskObj) {
    const user = self.requireRole(spreadsheetId, ['Admin', 'User']);
    self.requireFields(taskObj, ['subject']);

    const data = self.getSheetValues(spreadsheetId, 'Tasks');
    const headers = data.headers;
    const rows = data.rows;

    const id = taskObj.task_id || self.generateUuidV4();
    const now = self.generateTimestampIsoUtc();
    const idIdx = headers.indexOf('task_id');

    let rowIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][idIdx]) === String(id)) {
        rowIdx = i + 2; // account for header row
        break;
      }
    }

    const rowObj = {
      task_id: id,
      subject: self.sanitizeString(taskObj.subject),
      description: self.sanitizeString(taskObj.description),
      related_type: self.sanitizeString(taskObj.related_type),
      related_id: taskObj.related_id || '',
      owner_user_id: taskObj.owner_user_id || user.user_id || '',
      due_date: taskObj.due_date || '',
      priority: self.sanitizeString(taskObj.priority) || 'Medium',
      status: self.sanitizeString(taskObj.status) || 'Pending',
      reminder_sent: taskObj.reminder_sent || false,
      created_at: taskObj.created_at || now,
      updated_at: now
    };

    if (rowIdx === -1) {
      self.writeRowByHeaderMap(spreadsheetId, 'Tasks', headers, rowObj);
    } else {
      const ss = SpreadsheetApp.openById(spreadsheetId);
      const sh = ss.getSheetByName('Tasks');
      Object.keys(rowObj).forEach(h => {
        const col = headers.indexOf(h) + 1;
        if (col > 0) sh.getRange(rowIdx, col).setValue(rowObj[h]);
      });
    }

    return { success: true, task_id: id };
  };

  /**
   * Delete a task by ID.
   */
  self.deleteTask = function(spreadsheetId, task_id) {
    self.requireRole(spreadsheetId, ['Admin', 'User']);

    const data = self.getSheetValues(spreadsheetId, 'Tasks');
    const headers = data.headers;
    const rows = data.rows;
    const idIdx = headers.indexOf('task_id');

    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][idIdx]) === String(task_id)) {
        const ss = SpreadsheetApp.openById(spreadsheetId);
        const sh = ss.getSheetByName('Tasks');
        sh.deleteRow(i + 2); // header row offset
        return { success: true };
      }
    }

    return { success: false, error: 'Not found' };
  };

  return self;
})(typeof CrmLib !== 'undefined' ? CrmLib : {});
