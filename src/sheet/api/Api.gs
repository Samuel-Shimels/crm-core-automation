function CRM_SHEET_ID_() {
  var id = PropertiesService.getScriptProperties().getProperty('CRM_SPREADSHEET_ID');
  if (!id) throw new Error('CRM_SPREADSHEET_ID not set');
  return id;
}

function recordLoginLocal_() {
  try {
    var sheetId = CRM_SHEET_ID_();
    var email = Session.getActiveUser().getEmail();
    if (!email) return;
    var ss = SpreadsheetApp.openById(sheetId);
    var sh = ss.getSheetByName('Users');
    if (!sh) return;
    var data = sh.getDataRange().getValues();
    if (data.length < 2) return;
    var headers = data[0];
    var emailIdx = headers.indexOf('email');
    var lastLoginIdx = headers.indexOf('last_login');
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][emailIdx]).toLowerCase() === String(email).toLowerCase()) {
        sh.getRange(i + 1, lastLoginIdx + 1).setValue(new Date().toISOString());
        break;
      }
    }
  } catch (e) {}
}

function initCrmSheetsLocal_() {
  var ss = SpreadsheetApp.openById(CRM_SHEET_ID_());
  var specs = [
    {name:'Meta', headers:['key','value']},
    {name:'Users', headers:['user_id','email','display_name','role','active','created_at','last_login']},
    {name:'Contacts', headers:['contact_id','owner_user_id','first_name','last_name','email','phone','company_id','source','status','lead_score','tags','created_at','updated_at']},
    {name:'Companies', headers:['company_id','name','industry','website','phone','address','owner_user_id','created_at','updated_at']},
    {name:'Deals', headers:['deal_id','title','company_id','primary_contact_id','owner_user_id','pipeline','stage','amount','currency','close_date','probability','status','created_at','updated_at']},
    {name:'Tasks', headers:['task_id','subject','description','related_type','related_id','owner_user_id','due_date','priority','status','reminder_sent','created_at','updated_at']},
    {name:'Email_Log', headers:['email_log_id','direction','from','to','subject','snippet','thread_id','related_id','message_id','timestamp']},
    {name:'Calendar_Events', headers:['event_id','title','start_time','end_time','attendees','related_id','created_by','gcal_event_id','created_at']},
    {name:'Activity_Audit', headers:['audit_id','entity_type','entity_id','action','user_id','timestamp','notes']},
    {name:'Lists', headers:['list_id','name','owner_user_id','filter_json','created_at']}
  ];
  specs.forEach(function(spec){
    var sh = ss.getSheetByName(spec.name);
    if (!sh) sh = ss.insertSheet(spec.name);
    sh.getRange(1,1,1,spec.headers.length).setValues([spec.headers]);
  });
  return { success: true };
}

function uuid4_() {
  var template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return template.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function sanitize_(v){ return v == null ? '' : String(v).trim(); }
function toNum_(v){ var n = Number(v); return isNaN(n) ? 0 : n; }

function listContactsLocal_(params) {
  params = params || {}; var page = params.page || 1; var pageSize = params.pageSize || 25; var filters = params.filters || {};
  var ss = SpreadsheetApp.openById(CRM_SHEET_ID_());
  var sh = ss.getSheetByName('Contacts');
  if (!sh) return { rows: [], total: 0 };
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return { rows: [], total: 0 };
  var headers = data.shift();
  var results = data.map(function(r){ var o={}; headers.forEach(function(h,i){ o[h]=r[i]; }); return o; });
  if (filters.email) { var needle = String(filters.email).toLowerCase(); results = results.filter(function(o){ return String(o.email||'').toLowerCase().indexOf(needle)!==-1; }); }
  if (filters.owner_user_id) { results = results.filter(function(o){ return String(o.owner_user_id)===String(filters.owner_user_id); }); }
  var total = results.length; var start=(page-1)*pageSize; var end=start+pageSize;
  return { rows: results.slice(start,end), total: total };
}

function getContactLocal_(id) {
  var ss = SpreadsheetApp.openById(CRM_SHEET_ID_());
  var sh = ss.getSheetByName('Contacts');
  if (!sh) return null;
  var data = sh.getDataRange().getValues(); if (data.length < 2) return null;
  var h = data[0]; var idIdx = h.indexOf('contact_id');
  for (var i=1;i<data.length;i++){ if(String(data[i][idIdx])===String(id)){ var o={}; h.forEach(function(k,j){ o[k]=data[i][j]; }); return o; } }
  return null;
}

function saveContactLocal_(obj) {
  var ss = SpreadsheetApp.openById(CRM_SHEET_ID_());
  var sh = ss.getSheetByName('Contacts'); if (!sh) throw new Error('Contacts sheet missing');
  var data = sh.getDataRange().getValues(); if (data.length === 0) return { success:false, error:'Schema missing' };
  var headers = data[0]; var rows = data.slice(1);
  var id = obj.contact_id || uuid4_(); var now = new Date().toISOString();
  var idIdx = headers.indexOf('contact_id'); var rowIdx = -1;
  for (var i=0;i<rows.length;i++){ if(String(rows[i][idIdx])===String(id)){ rowIdx = i + 2; break; } }
  var rowObj = {
    contact_id: id,
    owner_user_id: obj.owner_user_id || '',
    first_name: sanitize_(obj.first_name),
    last_name: sanitize_(obj.last_name),
    email: sanitize_(obj.email),
    phone: sanitize_(obj.phone),
    company_id: obj.company_id || '',
    source: sanitize_(obj.source),
    status: sanitize_(obj.status),
    lead_score: toNum_(obj.lead_score),
    tags: sanitize_(obj.tags),
    created_at: obj.created_at || now,
    updated_at: now
  };
  if (rowIdx === -1) {
    var row = headers.map(function(h){ return rowObj[h] === undefined ? '' : rowObj[h]; });
    sh.getRange(sh.getLastRow()+1,1,1,row.length).setValues([row]);
  } else {
    Object.keys(rowObj).forEach(function(h){ var col = headers.indexOf(h)+1; if(col>0) sh.getRange(rowIdx,col).setValue(rowObj[h]); });
  }
  return { success: true, contact_id: id };
}

function deleteContactLocal_(id) {
  var ss = SpreadsheetApp.openById(CRM_SHEET_ID_());
  var sh = ss.getSheetByName('Contacts'); if (!sh) return { success:false, error:'Contacts sheet missing' };
  var data = sh.getDataRange().getValues(); if (data.length < 2) return { success:false, error:'Not found' };
  var h = data[0]; var idIdx = h.indexOf('contact_id');
  for (var i=1;i<data.length;i++){ if(String(data[i][idIdx])===String(id)){ sh.deleteRow(i+1); return { success:true }; } }
  return { success:false, error:'Not found' };
}

function doGet() {
  recordLoginLocal_();
  return HtmlService.createTemplateFromFile('web/index').evaluate()
    .setTitle('CRM Core App')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include_(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function initCrmSheetsApi() {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.initCrmSheets === 'function') {
      return CrmLib.initCrmSheets(CRM_SHEET_ID_());
    }
  } catch (e) {}
  return initCrmSheetsLocal_();
}

function listContactsApi(params) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.listContacts === 'function') {
      return CrmLib.listContacts(CRM_SHEET_ID_(), params || {});
    }
  } catch (e) {}
  return listContactsLocal_(params || {});
}

function getContactApi(id) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.getContact === 'function') {
      return CrmLib.getContact(CRM_SHEET_ID_(), id);
    }
  } catch (e) {}
  return getContactLocal_(id);
}

function saveContactApi(obj) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.saveContact === 'function') {
      return CrmLib.saveContact(CRM_SHEET_ID_(), obj);
    }
  } catch (e) {}
  return saveContactLocal_(obj || {});
}

function deleteContactApi(id) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.deleteContact === 'function') {
      return CrmLib.deleteContact(CRM_SHEET_ID_(), id);
    }
  } catch (e) {}
  return deleteContactLocal_(id);
}

// ===== Users API =====
function listUsersApi(params) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.listUsers === 'function') {
      return CrmLib.listUsers(CRM_SHEET_ID_(), params || {});
    }
  } catch (e) {
    return { rows: [], total: 0, error: e.message };
  }
  return { rows: [], total: 0 };
}

function getUserApi(id) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.getUser === 'function') {
      return CrmLib.getUser(CRM_SHEET_ID_(), id);
    }
  } catch (e) {
    return null;
  }
  return null;
}

function saveUserApi(obj) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.saveUser === 'function') {
      return CrmLib.saveUser(CRM_SHEET_ID_(), obj);
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
  return { success: false, error: 'API not available' };
}

function deleteUserApi(id) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.deleteUser === 'function') {
      return CrmLib.deleteUser(CRM_SHEET_ID_(), id);
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
  return { success: false, error: 'Not found' };
}

// ===== Companies API =====
function listCompaniesApi(params) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.listCompanies === 'function') {
      return CrmLib.listCompanies(CRM_SHEET_ID_(), params || {});
    }
  } catch (e) {
    return { rows: [], total: 0, error: e.message };
  }
  return { rows: [], total: 0 };
}

function getCompanyApi(id) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.getCompany === 'function') {
      return CrmLib.getCompany(CRM_SHEET_ID_(), id);
    }
  } catch (e) {
    return null;
  }
  return null;
}

function saveCompanyApi(obj) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.saveCompany === 'function') {
      return CrmLib.saveCompany(CRM_SHEET_ID_(), obj);
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
  return { success: false, error: 'API not available' };
}

function deleteCompanyApi(id) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.deleteCompany === 'function') {
      return CrmLib.deleteCompany(CRM_SHEET_ID_(), id);
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
  return { success: false, error: 'Not found' };
}

// ===== Deals API =====
function listDealsApi(params) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.listDeals === 'function') {
      return CrmLib.listDeals(CRM_SHEET_ID_(), params || {});
    }
  } catch (e) {
    return { rows: [], total: 0, error: e.message };
  }
  return { rows: [], total: 0 };
}

function getDealApi(id) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.getDeal === 'function') {
      return CrmLib.getDeal(CRM_SHEET_ID_(), id);
    }
  } catch (e) {
    return null;
  }
  return null;
}

function saveDealApi(obj) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.saveDeal === 'function') {
      return CrmLib.saveDeal(CRM_SHEET_ID_(), obj);
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
  return { success: false, error: 'API not available' };
}

function deleteDealApi(id) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.deleteDeal === 'function') {
      return CrmLib.deleteDeal(CRM_SHEET_ID_(), id);
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
  return { success: false, error: 'Not found' };
}

// ===== Tasks API =====
function listTasksApi(params) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.listTasks === 'function') {
      return CrmLib.listTasks(CRM_SHEET_ID_(), params || {});
    }
  } catch (e) {
    return { rows: [], total: 0, error: e.message };
  }
  return { rows: [], total: 0 };
}

function getTaskApi(id) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.getTask === 'function') {
      return CrmLib.getTask(CRM_SHEET_ID_(), id);
    }
  } catch (e) {
    return null;
  }
  return null;
}

function saveTaskApi(obj) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.saveTask === 'function') {
      return CrmLib.saveTask(CRM_SHEET_ID_(), obj);
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
  return { success: false, error: 'API not available' };
}

function deleteTaskApi(id) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib && typeof CrmLib.deleteTask === 'function') {
      return CrmLib.deleteTask(CRM_SHEET_ID_(), id);
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
  return { success: false, error: 'Not found' };
}

// ===== Stats API =====
function getStatsApi() {
  try {
    var contactsData = listContactsApi({ page: 1, pageSize: 1000 });
    var companiesData = listCompaniesApi({ page: 1, pageSize: 1000 });
    var dealsData = listDealsApi({ page: 1, pageSize: 1000 });
    var tasksData = listTasksApi({ page: 1, pageSize: 1000 });
    
    var openDeals = 0;
    var totalDealValue = 0;
    (dealsData.rows || []).forEach(function(d) {
      if (d.status === 'Open') {
        openDeals++;
        totalDealValue += Number(d.amount) || 0;
      }
    });
    
    var pendingTasks = 0;
    (tasksData.rows || []).forEach(function(t) {
      if (t.status === 'Pending' || t.status === 'In Progress') {
        pendingTasks++;
      }
    });
    
    return {
      contacts: contactsData.total || 0,
      companies: companiesData.total || 0,
      deals: dealsData.total || 0,
      openDeals: openDeals,
      totalDealValue: totalDealValue,
      tasks: tasksData.total || 0,
      pendingTasks: pendingTasks
    };
  } catch (e) {
    return { error: e.message };
  }
}

function pingEmailApi() { return { ok: true, feature: 'email', count: 0 }; }
function pingReportsApi() { return { ok: true, feature: 'reports', count: 0 }; }

// ===== Demo Data Initialization =====
function initDemoDataApi() {
  try {
    // First initialize sheets
    initCrmSheetsApi();
    
    // Add demo user (current user as admin)
    var email = Session.getActiveUser().getEmail();
    saveUserApi({
      email: email,
      display_name: 'Demo Admin',
      role: 'Admin',
      active: true
    });
    
    // Add sample companies
    var comp1 = saveCompanyApi({
      name: 'Acme Corporation',
      industry: 'Technology',
      website: 'https://acme.com',
      phone: '555-0100',
      address: '123 Main St, San Francisco, CA'
    });
    
    var comp2 = saveCompanyApi({
      name: 'Global Industries',
      industry: 'Manufacturing',
      website: 'https://globalindustries.com',
      phone: '555-0200',
      address: '456 Industrial Blvd, Chicago, IL'
    });
    
    var comp3 = saveCompanyApi({
      name: 'Tech Solutions Inc',
      industry: 'Software',
      website: 'https://techsolutions.com',
      phone: '555-0300',
      address: '789 Tech Drive, Austin, TX'
    });
    
    // Add sample contacts
    var contact1 = saveContactApi({
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@acme.com',
      phone: '555-1001',
      company_id: comp1.company_id,
      status: 'Active',
      lead_score: 85
    });
    
    saveContactApi({
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@globalindustries.com',
      phone: '555-2001',
      company_id: comp2.company_id,
      status: 'Active',
      lead_score: 90
    });
    
    saveContactApi({
      first_name: 'Michael',
      last_name: 'Davis',
      email: 'michael.davis@techsolutions.com',
      phone: '555-3001',
      company_id: comp3.company_id,
      status: 'Lead',
      lead_score: 70
    });
    
    saveContactApi({
      first_name: 'Emily',
      last_name: 'Brown',
      email: 'emily.brown@acme.com',
      phone: '555-1002',
      company_id: comp1.company_id,
      status: 'Active',
      lead_score: 75
    });
    
    saveContactApi({
      first_name: 'David',
      last_name: 'Wilson',
      email: 'david.wilson@example.com',
      phone: '555-4001',
      status: 'Prospect',
      lead_score: 60
    });
    
    // Add sample deals
    var today = new Date();
    var nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    var nextQuarter = new Date(today);
    nextQuarter.setMonth(today.getMonth() + 3);
    
    saveDealApi({
      title: 'Enterprise Software License',
      company_id: comp1.company_id,
      primary_contact_id: contact1.contact_id,
      stage: 'Negotiation',
      amount: 50000,
      currency: 'USD',
      status: 'Open',
      close_date: nextMonth.toISOString().split('T')[0],
      probability: 75
    });
    
    saveDealApi({
      title: 'Manufacturing Equipment',
      company_id: comp2.company_id,
      stage: 'Proposal',
      amount: 120000,
      currency: 'USD',
      status: 'Open',
      close_date: nextQuarter.toISOString().split('T')[0],
      probability: 50
    });
    
    saveDealApi({
      title: 'Cloud Services Annual Contract',
      company_id: comp3.company_id,
      stage: 'Qualified',
      amount: 35000,
      currency: 'USD',
      status: 'Open',
      close_date: nextMonth.toISOString().split('T')[0],
      probability: 60
    });
    
    saveDealApi({
      title: 'Consulting Services',
      company_id: comp1.company_id,
      stage: 'Closed Won',
      amount: 25000,
      currency: 'USD',
      status: 'Won',
      probability: 100
    });
    
    // Add sample tasks
    var tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    var nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    saveTaskApi({
      subject: 'Follow up with John Smith',
      description: 'Discuss enterprise license renewal',
      priority: 'High',
      status: 'Pending',
      due_date: tomorrow.toISOString().split('T')[0]
    });
    
    saveTaskApi({
      subject: 'Prepare proposal for Global Industries',
      description: 'Draft comprehensive equipment proposal',
      priority: 'High',
      status: 'In Progress',
      due_date: nextWeek.toISOString().split('T')[0]
    });
    
    saveTaskApi({
      subject: 'Schedule demo with Tech Solutions',
      description: 'Product demonstration for cloud services',
      priority: 'Medium',
      status: 'Pending',
      due_date: nextWeek.toISOString().split('T')[0]
    });
    
    saveTaskApi({
      subject: 'Send quote to Emily Brown',
      description: 'Additional modules pricing',
      priority: 'Medium',
      status: 'Completed'
    });
    
    saveTaskApi({
      subject: 'Monthly report preparation',
      description: 'Compile sales metrics for Q4',
      priority: 'Low',
      status: 'Pending',
      due_date: nextMonth.toISOString().split('T')[0]
    });
    
    return { 
      success: true, 
      message: 'Demo data initialized successfully',
      counts: {
        users: 1,
        companies: 3,
        contacts: 5,
        deals: 4,
        tasks: 5
      }
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
} 