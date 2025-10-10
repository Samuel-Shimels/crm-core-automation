var CrmLib = CrmLib || {};

CrmLib.findUserByEmail = function(spreadsheetId, email) {
  var data = CrmLib.getSheetValues(spreadsheetId, 'Users');
  var h = data.headers; var rows = data.rows;
  var idx = { user_id: h.indexOf('user_id'), email: h.indexOf('email'), display_name: h.indexOf('display_name'), role: h.indexOf('role'), active: h.indexOf('active'), created_at: h.indexOf('created_at'), last_login: h.indexOf('last_login') };
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (String(r[idx.email]).toLowerCase() === String(email).toLowerCase()) {
      return { user_id: r[idx.user_id], email: r[idx.email], display_name: r[idx.display_name], role: r[idx.role], active: r[idx.active] === true || String(r[idx.active]).toLowerCase() === 'true', created_at: r[idx.created_at], last_login: r[idx.last_login] };
    }
  }
  return null;
};

CrmLib.requireRole = function(spreadsheetId, allowedRoles) {
  var email = Session.getActiveUser().getEmail();
  if (!email) throw new Error('No active user');
  var user = CrmLib.findUserByEmail(spreadsheetId, email);
  if (!user || !user.active) throw new Error('Unauthorized');
  if (allowedRoles && allowedRoles.length && allowedRoles.indexOf(user.role) === -1) throw new Error('Forbidden');
  return user;
};

CrmLib.recordLogin = function(spreadsheetId) {
  var email = Session.getActiveUser().getEmail();
  if (!email) return;
  var data = CrmLib.getSheetValues(spreadsheetId, 'Users');
  var headers = data.headers; var rows = data.rows;
  var emailIdx = headers.indexOf('email');
  var lastLoginIdx = headers.indexOf('last_login');
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var sh = ss.getSheetByName('Users');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][emailIdx]).toLowerCase() === String(email).toLowerCase()) {
      sh.getRange(i + 2, lastLoginIdx + 1).setValue(CrmLib.generateTimestampIsoUtc());
      break;
    }
  }
}; 