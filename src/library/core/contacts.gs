var CrmLib = CrmLib || {};

CrmLib.listContacts = function(spreadsheetId, params) {
  CrmLib.requireRole(spreadsheetId, ['Admin','User']);
  params = params || {}; var page = params.page || 1; var pageSize = params.pageSize || 25; var filters = params.filters || {};
  var data = CrmLib.getSheetValues(spreadsheetId, 'Contacts');
  var headers = data.headers; var rows = data.rows;
  var results = rows.map(function(r){ var o = {}; headers.forEach(function(h, i){ o[h] = r[i]; }); return o; });
  if (filters.email) { var needle = String(filters.email).toLowerCase(); results = results.filter(function(o){ return String(o.email||'').toLowerCase().indexOf(needle) !== -1; }); }
  if (filters.owner_user_id) { results = results.filter(function(o){ return String(o.owner_user_id) === String(filters.owner_user_id); }); }
  var total = results.length; var start = (page-1)*pageSize; var end = start+pageSize;
  return { rows: results.slice(start,end), total: total };
};

CrmLib.getContact = function(spreadsheetId, contact_id) {
  CrmLib.requireRole(spreadsheetId, ['Admin','User']);
  var data = CrmLib.getSheetValues(spreadsheetId, 'Contacts'); var h = data.headers; var rows = data.rows; var idIdx = h.indexOf('contact_id');
  for (var i=0;i<rows.length;i++){ if(String(rows[i][idIdx])===String(contact_id)){ var o={}; h.forEach(function(k,j){o[k]=rows[i][j];}); return o; } }
  return null;
};

CrmLib.saveContact = function(spreadsheetId, contactObj) {
  var user = CrmLib.requireRole(spreadsheetId, ['Admin','User']);
  CrmLib.requireFields(contactObj, ['first_name','last_name','email']);
  var data = CrmLib.getSheetValues(spreadsheetId, 'Contacts'); var headers = data.headers; var rows = data.rows;
  var id = contactObj.contact_id || CrmLib.generateUuidV4(); var now = CrmLib.generateTimestampIsoUtc();
  var idIdx = headers.indexOf('contact_id'); var rowIdx=-1; for (var i=0;i<rows.length;i++){ if(String(rows[i][idIdx])===String(id)){ rowIdx=i+2; break; } }
  var rowObj = {
    contact_id: id,
    owner_user_id: contactObj.owner_user_id || user.user_id || '',
    first_name: CrmLib.sanitizeString(contactObj.first_name),
    last_name: CrmLib.sanitizeString(contactObj.last_name),
    email: CrmLib.sanitizeString(contactObj.email),
    phone: CrmLib.sanitizeString(contactObj.phone),
    company_id: contactObj.company_id || '',
    source: CrmLib.sanitizeString(contactObj.source),
    status: CrmLib.sanitizeString(contactObj.status),
    lead_score: CrmLib.toNumber(contactObj.lead_score),
    tags: CrmLib.sanitizeString(contactObj.tags),
    created_at: contactObj.created_at || now,
    updated_at: now
  };
  if (rowIdx === -1) {
    CrmLib.writeRowByHeaderMap(spreadsheetId, 'Contacts', headers, rowObj);
  } else {
    var ss = SpreadsheetApp.openById(spreadsheetId); var sh = ss.getSheetByName('Contacts');
    Object.keys(rowObj).forEach(function(h){ var col = headers.indexOf(h)+1; if(col>0) sh.getRange(rowIdx,col).setValue(rowObj[h]); });
  }
  return { success: true, contact_id: id };
};

CrmLib.deleteContact = function(spreadsheetId, contact_id) {
  CrmLib.requireRole(spreadsheetId, ['Admin']);
  var data = CrmLib.getSheetValues(spreadsheetId, 'Contacts'); var headers = data.headers; var rows = data.rows; var idIdx = headers.indexOf('contact_id');
  for (var i=0;i<rows.length;i++){ if(String(rows[i][idIdx])===String(contact_id)){ var ss = SpreadsheetApp.openById(spreadsheetId); var sh = ss.getSheetByName('Contacts'); sh.deleteRow(i+2); return { success: true }; } }
  return { success: false, error: 'Not found' };
}; 