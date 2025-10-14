/**
 * CRM Core Automation - Enhanced Server-side Code
 * Includes: Email, Calendar, Charts, and all CRUD operations
 */

// ===== CONFIGURATION =====

function getCrmSheetId() {
  const id = PropertiesService.getScriptProperties().getProperty('CRM_SPREADSHEET_ID');
  if (!id) throw new Error('CRM_SPREADSHEET_ID not set in Script Properties');
  return id;
}

// ===== WEB APP ENTRY POINT =====

function doGet(e) {
  try {
    return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('CRM Core - Modern Business Management')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  } catch (error) {
    console.error('doGet error:', error);
    return HtmlService.createHtmlOutput('<h1>Error loading app</h1><p>' + error.message + '</p>');
  }
}

/**
 * OPTIMIZED: XMLHttpRequest API Handler
 * Provides async, non-blocking API for client-side XMLHttpRequest calls
 * Usage from client:
 *   xhr.open('POST', scriptUrl);
 *   xhr.send(JSON.stringify({action: 'listContacts', params: {page: 1}}));
 */
function doPost(e) {
  try {
    let requestData;
    
    // Parse incoming JSON request
    if (e.postData && e.postData.contents) {
      try {
        requestData = JSON.parse(e.postData.contents);
      } catch (parseError) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid JSON in request body'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'No request data provided'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = requestData.action;
    const params = requestData.params || {};
    
    // Route to appropriate handler
    let result;
    switch(action) {
      // Dashboard & Stats
      case 'getStats':
        result = getCachedStatsApi();
        break;
      case 'getQuickStats':
        result = getQuickStatsApi();
        break;
      case 'getChartData':
        result = getChartDataApi(params.chartType);
        break;
        
      // Contacts
      case 'listContacts':
        result = listContactsApi(params);
        break;
      case 'getContact':
        result = getContactApi(params.contactId);
        break;
      case 'saveContact':
        result = saveContactApi(params.contact);
        break;
        
      // Companies
      case 'listCompanies':
        result = listCompaniesApi(params);
        break;
      case 'getCompany':
        result = getCompanyApi(params.companyId);
        break;
      case 'saveCompany':
        result = saveCompanyApi(params.company);
        break;
        
      // Deals
      case 'listDeals':
        result = listDealsApi(params);
        break;
      case 'getDeal':
        result = getDealApi(params.dealId);
        break;
      case 'saveDeal':
        result = saveDealApi(params.deal);
        break;
        
      // Tasks
      case 'listTasks':
        result = listTasksApi(params);
        break;
      case 'getTask':
        result = getTaskApi(params.taskId);
        break;
      case 'saveTask':
        result = saveTaskApi(params.task);
        break;
        
      // Users
      case 'listUsers':
        result = listUsersApi(params);
        break;
      case 'saveUser':
        result = saveUserApi(params.user);
        break;
        
      // Email
      case 'sendEmail':
        result = sendEmailApi(params.emailData);
        break;
      case 'listEmailLog':
        result = listEmailLogApi(params);
        break;
      case 'listEmailTemplates':
        result = listEmailTemplatesApi();
        break;
      case 'getEmailTemplate':
        result = getEmailTemplateApi(params.templateId);
        break;
      case 'saveEmailTemplate':
        result = saveEmailTemplateApi(params.template);
        break;
        
      // Calendar
      case 'listCalendarEvents':
        result = listCalendarEventsApi(params);
        break;
      case 'saveCalendarEvent':
        result = saveCalendarEventApi(params.event);
        break;
        
      // Cache Management
      case 'warmCache':
        result = warmCacheApi();
        break;
      case 'clearCache':
        result = clearCacheApi(params.cacheType);
        break;
      case 'invalidateCache':
        result = invalidateCacheApi(params.entityType);
        break;
        
      // Admin
      case 'initSheets':
        result = initCrmSheetsApi();
        break;
      case 'initDemoData':
        result = initDemoDataApi();
        break;
        
      default:
        result = {
          success: false,
          error: 'Unknown action: ' + action
        };
    }
    
    // Return JSON response
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('doPost error:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message || 'Server error'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== AUTHENTICATION =====

function loginUser(email, password) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Users');
    
    if (!sheet || sheet.getLastRow() < 2) {
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailIdx = headers.indexOf('email');
    const displayNameIdx = headers.indexOf('display_name');
    const roleIdx = headers.indexOf('role');
    const activeIdx = headers.indexOf('active');
    const lastLoginIdx = headers.indexOf('last_login');
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (String(row[emailIdx]).toLowerCase() === email.toLowerCase()) {
        const isActive = row[activeIdx] === true || String(row[activeIdx]).toLowerCase() === 'true';
        
        if (!isActive) {
          return null;
        }
        
        sheet.getRange(i + 1, lastLoginIdx + 1).setValue(new Date().toISOString());
        
        return {
          email: row[emailIdx],
          display_name: row[displayNameIdx] || email,
          role: row[roleIdx] || 'User',
          active: isActive
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('loginUser error:', error);
    return null;
  }
}

// ===== INITIALIZATION API =====

function initCrmSheetsApi() {
  try {
    const spreadsheetId = getCrmSheetId();
    return CrmLib.initCrmSheets(spreadsheetId);
  } catch (error) {
    console.error('initCrmSheetsApi error:', error);
    return { success: false, error: error.message };
  }
}

function initDemoDataApi() {
  try {
    const spreadsheetId = getCrmSheetId();
    const companies = [
      { name: 'Acme Corp', industry: 'Technology', website: 'acme.com', phone: '555-0001' },
      { name: 'Global Tech', industry: 'Software', website: 'globaltech.com', phone: '555-0002' },
      { name: 'Innovate LLC', industry: 'Consulting', website: 'innovate.com', phone: '555-0003' }
    ];
    
    const contacts = [
      { first_name: 'John', last_name: 'Doe', email: 'john@acme.com', phone: '555-1001' },
      { first_name: 'Jane', last_name: 'Smith', email: 'jane@globaltech.com', phone: '555-1002' },
      { first_name: 'Bob', last_name: 'Johnson', email: 'bob@innovate.com', phone: '555-1003' }
    ];
    
    const deals = [
      { title: 'Q4 Enterprise Deal', stage: 'Proposal', amount: 50000, status: 'Open', close_date: '2025-12-31' },
      { title: 'Annual Subscription', stage: 'Negotiation', amount: 25000, status: 'Open', close_date: '2025-11-30' }
    ];
    
    const tasks = [
      { subject: 'Follow up with Acme', priority: 'High', status: 'Pending', due_date: '2025-10-15' },
      { subject: 'Prepare proposal', priority: 'Medium', status: 'In Progress', due_date: '2025-10-20' }
    ];
    
    const ss = SpreadsheetApp.openById(spreadsheetId);
    
    const compSheet = ss.getSheetByName('Companies');
    companies.forEach(function(comp) {
      compSheet.appendRow([
        'comp_' + Utilities.getUuid(),
        comp.name,
        comp.industry,
        comp.website,
        comp.phone,
        '',
        '',
        new Date().toISOString(),
        new Date().toISOString()
      ]);
    });
    
    const contSheet = ss.getSheetByName('Contacts');
    contacts.forEach(function(cont) {
      contSheet.appendRow([
        'cont_' + Utilities.getUuid(),
        '',
        cont.first_name,
        cont.last_name,
        cont.email,
        cont.phone,
        '',
        '',
        '',
        0,
        '',
        new Date().toISOString(),
        new Date().toISOString()
      ]);
    });
    
    const dealSheet = ss.getSheetByName('Deals');
    deals.forEach(function(deal) {
      dealSheet.appendRow([
        'deal_' + Utilities.getUuid(),
        deal.title,
        '',
        '',
        '',
        'Standard',
        deal.stage,
        deal.amount,
        'USD',
        deal.close_date,
        50,
        deal.status,
        new Date().toISOString(),
        new Date().toISOString()
      ]);
    });
    
    const taskSheet = ss.getSheetByName('Tasks');
    tasks.forEach(function(task) {
      taskSheet.appendRow([
        'task_' + Utilities.getUuid(),
        task.subject,
        '',
        '',
        '',
        '',
        task.due_date,
        task.priority,
        task.status,
        false,
        new Date().toISOString(),
        new Date().toISOString()
      ]);
    });
    
    return {
      success: true,
      counts: {
        companies: companies.length,
        contacts: contacts.length,
        deals: deals.length,
        tasks: tasks.length
      }
    };
  } catch (error) {
    console.error('initDemoDataApi error:', error);
    return { success: false, error: error.message };
  }
}

// ===== DASHBOARD API =====

function getStatsApi() {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    
    const contactsSheet = ss.getSheetByName('Contacts');
    const companiesSheet = ss.getSheetByName('Companies');
    const dealsSheet = ss.getSheetByName('Deals');
    const tasksSheet = ss.getSheetByName('Tasks');
    
    const contactsCount = contactsSheet ? Math.max(0, contactsSheet.getLastRow() - 1) : 0;
    const companiesCount = companiesSheet ? Math.max(0, companiesSheet.getLastRow() - 1) : 0;
    const dealsCount = dealsSheet ? Math.max(0, dealsSheet.getLastRow() - 1) : 0;
    const tasksCount = tasksSheet ? Math.max(0, tasksSheet.getLastRow() - 1) : 0;
    
    let totalDealValue = 0;
    let openDeals = 0;
    if (dealsSheet && dealsSheet.getLastRow() > 1) {
      const dealsData = dealsSheet.getDataRange().getValues();
      const headers = dealsData[0];
      const statusIdx = headers.indexOf('status');
      const amountIdx = headers.indexOf('amount');
      
      for (let i = 1; i < dealsData.length; i++) {
        if (dealsData[i][statusIdx] === 'Open') {
          openDeals++;
          totalDealValue += Number(dealsData[i][amountIdx]) || 0;
        }
      }
    }
    
    let pendingTasks = 0;
    if (tasksSheet && tasksSheet.getLastRow() > 1) {
      const tasksData = tasksSheet.getDataRange().getValues();
      const headers = tasksData[0];
      const statusIdx = headers.indexOf('status');
      
      for (let i = 1; i < tasksData.length; i++) {
        if (tasksData[i][statusIdx] === 'Pending' || tasksData[i][statusIdx] === 'In Progress') {
          pendingTasks++;
        }
      }
    }
    
    return {
      contacts: contactsCount,
      companies: companiesCount,
      openDeals: openDeals,
      totalDealValue: totalDealValue,
      pendingTasks: pendingTasks
    };
  } catch (error) {
    console.error('getStatsApi error:', error);
    return { error: error.message };
  }
}

// ===== CONTACTS API =====

/**
 * List contacts with caching for better performance
 */
function listContactsApi(params) {
  try {
    const spreadsheetId = getCrmSheetId();
    
    // Try to use cached full list first
    const cacheKey = 'crm_contacts_full_list';
    const cache = CacheService.getScriptCache();
    let contacts;
    
    const cached = cache.get(cacheKey);
    if (cached && !params.forceRefresh) {
      contacts = JSON.parse(cached);
      console.log('Contacts loaded from cache');
    } else {
      // Fetch from sheet
      const ss = SpreadsheetApp.openById(spreadsheetId);
      const sheet = ss.getSheetByName('Contacts');
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { rows: [], total: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);
      
      contacts = rows.map(function(row) {
        const obj = {};
        headers.forEach(function(header, idx) {
          obj[header] = row[idx];
        });
        return obj;
      });
      
      // Cache for 10 minutes
      try {
        cache.put(cacheKey, JSON.stringify(contacts), 600);
      } catch (e) {
        console.warn('Could not cache contacts:', e);
      }
    }
    
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      rows: contacts.slice(start, end),
      total: contacts.length,
      page: page,
      pageSize: pageSize
    };
  } catch (error) {
    console.error('listContactsApi error:', error);
    return { rows: [], total: 0, error: error.message };
  }
}

function getContactApi(contactId) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Contacts');
    
    if (!sheet || sheet.getLastRow() < 2) {
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const contactIdIdx = headers.indexOf('contact_id');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][contactIdIdx] === contactId) {
        const obj = {};
        headers.forEach(function(header, idx) {
          obj[header] = data[i][idx];
        });
        return obj;
      }
    }
    
    return null;
  } catch (error) {
    console.error('getContactApi error:', error);
    return null;
  }
}

function saveContactApi(contact) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Contacts');
    
    if (!sheet) {
      return { success: false, error: 'Contacts sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    if (contact.contact_id) {
      const contactIdIdx = headers.indexOf('contact_id');
      for (let i = 1; i < data.length; i++) {
        if (data[i][contactIdIdx] === contact.contact_id) {
          const updatedAtIdx = headers.indexOf('updated_at');
          sheet.getRange(i + 1, headers.indexOf('first_name') + 1).setValue(contact.first_name || '');
          sheet.getRange(i + 1, headers.indexOf('last_name') + 1).setValue(contact.last_name || '');
          sheet.getRange(i + 1, headers.indexOf('email') + 1).setValue(contact.email || '');
          sheet.getRange(i + 1, headers.indexOf('phone') + 1).setValue(contact.phone || '');
          sheet.getRange(i + 1, updatedAtIdx + 1).setValue(new Date().toISOString());
          return { success: true, contact_id: contact.contact_id };
        }
      }
    } else {
      const newId = 'cont_' + Utilities.getUuid();
      sheet.appendRow([
        newId,
        '',
        contact.first_name || '',
        contact.last_name || '',
        contact.email || '',
        contact.phone || '',
        '',
        '',
        '',
        0,
        '',
        new Date().toISOString(),
        new Date().toISOString()
      ]);
      return { success: true, contact_id: newId };
    }
    
    return { success: false, error: 'Contact not found' };
  } catch (error) {
    console.error('saveContactApi error:', error);
    return { success: false, error: error.message };
  }
}

// ===== COMPANIES API =====

/**
 * List companies with caching for better performance
 */
function listCompaniesApi(params) {
  try {
    const spreadsheetId = getCrmSheetId();
    
    // Try to use cached full list first
    const cacheKey = 'crm_companies_full_list';
    const cache = CacheService.getScriptCache();
    let companies;
    
    const cached = cache.get(cacheKey);
    if (cached && !params.forceRefresh) {
      companies = JSON.parse(cached);
      console.log('Companies loaded from cache');
    } else {
      // Fetch from sheet
      const ss = SpreadsheetApp.openById(spreadsheetId);
      const sheet = ss.getSheetByName('Companies');
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { rows: [], total: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);
      
      companies = rows.map(function(row) {
        const obj = {};
        headers.forEach(function(header, idx) {
          obj[header] = row[idx];
        });
        return obj;
      });
      
      // Cache for 10 minutes
      try {
        cache.put(cacheKey, JSON.stringify(companies), 600);
      } catch (e) {
        console.warn('Could not cache companies:', e);
      }
    }
    
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      rows: companies.slice(start, end),
      total: companies.length,
      page: page,
      pageSize: pageSize
    };
  } catch (error) {
    console.error('listCompaniesApi error:', error);
    return { rows: [], total: 0, error: error.message };
  }
}

function getCompanyApi(companyId) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Companies');
    
    if (!sheet || sheet.getLastRow() < 2) {
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const companyIdIdx = headers.indexOf('company_id');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][companyIdIdx] === companyId) {
        const obj = {};
        headers.forEach(function(header, idx) {
          obj[header] = data[i][idx];
        });
        return obj;
      }
    }
    
    return null;
  } catch (error) {
    console.error('getCompanyApi error:', error);
    return null;
  }
}

function saveCompanyApi(company) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Companies');
    
    if (!sheet) {
      return { success: false, error: 'Companies sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    if (company.company_id) {
      const companyIdIdx = headers.indexOf('company_id');
      for (let i = 1; i < data.length; i++) {
        if (data[i][companyIdIdx] === company.company_id) {
          const updatedAtIdx = headers.indexOf('updated_at');
          sheet.getRange(i + 1, headers.indexOf('name') + 1).setValue(company.name || '');
          sheet.getRange(i + 1, headers.indexOf('industry') + 1).setValue(company.industry || '');
          sheet.getRange(i + 1, headers.indexOf('website') + 1).setValue(company.website || '');
          sheet.getRange(i + 1, headers.indexOf('phone') + 1).setValue(company.phone || '');
          sheet.getRange(i + 1, headers.indexOf('address') + 1).setValue(company.address || '');
          sheet.getRange(i + 1, updatedAtIdx + 1).setValue(new Date().toISOString());
          return { success: true, company_id: company.company_id };
        }
      }
    } else {
      const newId = 'comp_' + Utilities.getUuid();
      sheet.appendRow([
        newId,
        company.name || '',
        company.industry || '',
        company.website || '',
        company.phone || '',
        company.address || '',
        '',
        new Date().toISOString(),
        new Date().toISOString()
      ]);
      return { success: true, company_id: newId };
    }
    
    return { success: false, error: 'Company not found' };
  } catch (error) {
    console.error('saveCompanyApi error:', error);
    return { success: false, error: error.message };
  }
}

// ===== DEALS API =====

/**
 * List deals with caching for better performance
 */
function listDealsApi(params) {
  try {
    const spreadsheetId = getCrmSheetId();
    
    // Try to use cached full list first
    const cacheKey = 'crm_deals_full_list';
    const cache = CacheService.getScriptCache();
    let deals;
    
    const cached = cache.get(cacheKey);
    if (cached && !params.forceRefresh) {
      deals = JSON.parse(cached);
      console.log('Deals loaded from cache');
    } else {
      // Fetch from sheet
      const ss = SpreadsheetApp.openById(spreadsheetId);
      const sheet = ss.getSheetByName('Deals');
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { rows: [], total: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);
      
      deals = rows.map(function(row) {
        const obj = {};
        headers.forEach(function(header, idx) {
          obj[header] = row[idx];
        });
        return obj;
      });
      
      // Cache for 10 minutes
      try {
        cache.put(cacheKey, JSON.stringify(deals), 600);
      } catch (e) {
        console.warn('Could not cache deals:', e);
      }
    }
    
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      rows: deals.slice(start, end),
      total: deals.length,
      page: page,
      pageSize: pageSize
    };
  } catch (error) {
    console.error('listDealsApi error:', error);
    return { rows: [], total: 0, error: error.message };
  }
}

function getDealApi(dealId) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Deals');
    
    if (!sheet || sheet.getLastRow() < 2) {
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const dealIdIdx = headers.indexOf('deal_id');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][dealIdIdx] === dealId) {
        const obj = {};
        headers.forEach(function(header, idx) {
          obj[header] = data[i][idx];
        });
        return obj;
      }
    }
    
    return null;
  } catch (error) {
    console.error('getDealApi error:', error);
    return null;
  }
}

function saveDealApi(deal) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Deals');
    
    if (!sheet) {
      return { success: false, error: 'Deals sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    if (deal.deal_id) {
      const dealIdIdx = headers.indexOf('deal_id');
      for (let i = 1; i < data.length; i++) {
        if (data[i][dealIdIdx] === deal.deal_id) {
          const updatedAtIdx = headers.indexOf('updated_at');
          sheet.getRange(i + 1, headers.indexOf('title') + 1).setValue(deal.title || '');
          sheet.getRange(i + 1, headers.indexOf('stage') + 1).setValue(deal.stage || '');
          sheet.getRange(i + 1, headers.indexOf('amount') + 1).setValue(deal.amount || 0);
          sheet.getRange(i + 1, headers.indexOf('status') + 1).setValue(deal.status || 'Open');
          sheet.getRange(i + 1, headers.indexOf('close_date') + 1).setValue(deal.close_date || '');
          sheet.getRange(i + 1, updatedAtIdx + 1).setValue(new Date().toISOString());
          return { success: true, deal_id: deal.deal_id };
        }
      }
    } else {
      const newId = 'deal_' + Utilities.getUuid();
      sheet.appendRow([
        newId,
        deal.title || '',
        '',
        '',
        '',
        'Standard',
        deal.stage || 'Prospect',
        deal.amount || 0,
        'USD',
        deal.close_date || '',
        50,
        deal.status || 'Open',
        new Date().toISOString(),
        new Date().toISOString()
      ]);
      return { success: true, deal_id: newId };
    }
    
    return { success: false, error: 'Deal not found' };
  } catch (error) {
    console.error('saveDealApi error:', error);
    return { success: false, error: error.message };
  }
}

// ===== TASKS API =====

/**
 * List tasks with caching for better performance
 */
function listTasksApi(params) {
  try {
    const spreadsheetId = getCrmSheetId();
    
    // Try to use cached full list first
    const cacheKey = 'crm_tasks_full_list';
    const cache = CacheService.getScriptCache();
    let tasks;
    
    const cached = cache.get(cacheKey);
    if (cached && !params.forceRefresh) {
      tasks = JSON.parse(cached);
      console.log('Tasks loaded from cache');
    } else {
      // Fetch from sheet
      const ss = SpreadsheetApp.openById(spreadsheetId);
      const sheet = ss.getSheetByName('Tasks');
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { rows: [], total: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);
      
      tasks = rows.map(function(row) {
        const obj = {};
        headers.forEach(function(header, idx) {
          obj[header] = row[idx];
        });
        return obj;
      });
      
      // Cache for 10 minutes
      try {
        cache.put(cacheKey, JSON.stringify(tasks), 600);
      } catch (e) {
        console.warn('Could not cache tasks:', e);
      }
    }
    
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      rows: tasks.slice(start, end),
      total: tasks.length,
      page: page,
      pageSize: pageSize
    };
  } catch (error) {
    console.error('listTasksApi error:', error);
    return { rows: [], total: 0, error: error.message };
  }
}

function getTaskApi(taskId) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Tasks');
    
    if (!sheet || sheet.getLastRow() < 2) {
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const taskIdIdx = headers.indexOf('task_id');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][taskIdIdx] === taskId) {
        const obj = {};
        headers.forEach(function(header, idx) {
          obj[header] = data[i][idx];
        });
        return obj;
      }
    }
    
    return null;
  } catch (error) {
    console.error('getTaskApi error:', error);
    return null;
  }
}

function saveTaskApi(task) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Tasks');
    
    if (!sheet) {
      return { success: false, error: 'Tasks sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    if (task.task_id) {
      const taskIdIdx = headers.indexOf('task_id');
      for (let i = 1; i < data.length; i++) {
        if (data[i][taskIdIdx] === task.task_id) {
          const updatedAtIdx = headers.indexOf('updated_at');
          sheet.getRange(i + 1, headers.indexOf('subject') + 1).setValue(task.subject || '');
          sheet.getRange(i + 1, headers.indexOf('description') + 1).setValue(task.description || '');
          sheet.getRange(i + 1, headers.indexOf('priority') + 1).setValue(task.priority || 'Medium');
          sheet.getRange(i + 1, headers.indexOf('status') + 1).setValue(task.status || 'Pending');
          sheet.getRange(i + 1, headers.indexOf('due_date') + 1).setValue(task.due_date || '');
          sheet.getRange(i + 1, updatedAtIdx + 1).setValue(new Date().toISOString());
          return { success: true, task_id: task.task_id };
        }
      }
    } else {
      const newId = 'task_' + Utilities.getUuid();
      sheet.appendRow([
        newId,
        task.subject || '',
        task.description || '',
        '',
        '',
        '',
        task.due_date || '',
        task.priority || 'Medium',
        task.status || 'Pending',
        false,
        new Date().toISOString(),
        new Date().toISOString()
      ]);
      return { success: true, task_id: newId };
    }
    
    return { success: false, error: 'Task not found' };
  } catch (error) {
    console.error('saveTaskApi error:', error);
    return { success: false, error: error.message };
  }
}

// ===== USERS API ===== optimized

function listUsersApi(params) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Users');
    
    if (!sheet || sheet.getLastRow() < 2) {
      return { rows: [], total: 0 };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const users = rows.map(function(row) {
      const obj = {};
      headers.forEach(function(header, idx) {
        obj[header] = row[idx];
      });
      obj.active = obj.active === true || String(obj.active).toLowerCase() === 'true';
      return obj;
    });
    
    const page = params.page || 1;
    const pageSize = params.pageSize || 100;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      rows: users.slice(start, end),
      total: users.length,
      page: page,
      pageSize: pageSize
    };
  } catch (error) {
    console.error('listUsersApi error:', error);
    return { rows: [], total: 0, error: error.message };
  }
}

function saveUserApi(user) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Users');
    
    if (!sheet) {
      return { success: false, error: 'Users sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailIdx = headers.indexOf('email');
    
    let userExists = false;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][emailIdx]).toLowerCase() === String(user.email).toLowerCase()) {
        sheet.getRange(i + 1, headers.indexOf('display_name') + 1).setValue(user.display_name || '');
        sheet.getRange(i + 1, headers.indexOf('role') + 1).setValue(user.role || 'User');
        sheet.getRange(i + 1, headers.indexOf('active') + 1).setValue(user.active ? 'TRUE' : 'FALSE');
        userExists = true;
        break;
      }
    }
    
    if (!userExists) {
      const newId = 'user_' + Utilities.getUuid();
      sheet.appendRow([
        newId,
        user.email || '',
        user.display_name || '',
        user.role || 'User',
        user.active ? 'TRUE' : 'FALSE',
        new Date().toISOString(),
        ''
      ]);
    }
    
    return { success: true };
  } catch (error) {
    console.error('saveUserApi error:', error);
    return { success: false, error: error.message };
  }
}

// ===== EMAIL API (NEW) =====

function sendEmailApi(emailData) {
  try {
    GmailApp.sendEmail(emailData.to, emailData.subject, '', {
      htmlBody: emailData.htmlBody
    });
    
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Email_Log');
    
    if (sheet) {
      sheet.appendRow([
        'email_' + Utilities.getUuid(),
        'Outbound',
        Session.getActiveUser().getEmail(),
        emailData.to,
        emailData.subject,
        emailData.htmlBody.replace(/<[^>]*>/g, '').substring(0, 200),
        '',
        '',
        '',
        new Date().toISOString()
      ]);
    }
    
    return { success: true };
  } catch (error) {
    console.error('sendEmailApi error:', error);
    return { success: false, error: error.message };
  }
}

function listEmailLogApi(params) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Email_Log');
    
    if (!sheet || sheet.getLastRow() < 2) {
      return { rows: [], total: 0 };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const emails = rows.map(function(row) {
      const obj = {};
      headers.forEach(function(header, idx) {
        obj[header] = row[idx];
      });
      return obj;
    });
    
    emails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const start = (page - 1) * pageSize;
    
    return {
      rows: emails.slice(start, start + pageSize),
      total: emails.length
    };
  } catch (error) {
    console.error('listEmailLogApi error:', error);
    return { rows: [], total: 0, error: error.message };
  }
}

/**
 * OPTIMIZED: Email Templates API
 * Store and manage email templates in Email_Templates sheet
 */
function listEmailTemplatesApi() {
  try {
    const spreadsheetId = getCrmSheetId();
    
    return CrmLib.withCache('email_templates_list', function() {
      const ss = SpreadsheetApp.openById(spreadsheetId);
      let sheet = ss.getSheetByName('Email_Templates');
      
      // Create sheet if it doesn't exist
      if (!sheet) {
        sheet = ss.insertSheet('Email_Templates');
        sheet.appendRow(['template_id', 'name', 'subject', 'body_html', 'category', 'created_at', 'updated_at']);
        
        // Add default templates
        const now = new Date().toISOString();
        const defaultTemplates = [
          ['tpl_welcome', 'Welcome Email', 'Welcome to {{company}}!', 
           '<p>Hi {{first_name}},</p><p>Welcome to {{company}}! We\'re excited to have you on board.</p><p>Best regards,<br>The {{company}} Team</p>',
           'Onboarding', now, now],
          ['tpl_followup', 'Follow-up', 'Following up on our conversation',
           '<p>Hi {{first_name}},</p><p>I wanted to follow up on our recent conversation.</p><p>Do you have time this week to discuss further?</p><p>Best regards,<br>{{sender_name}}</p>',
           'Sales', now, now],
          ['tpl_proposal', 'Proposal', 'Proposal for {{company}}',
           '<p>Hi {{first_name}},</p><p>Thank you for your interest. Please find our proposal attached.</p><p>We look forward to working with you!</p><p>Best regards,<br>{{sender_name}}</p>',
           'Sales', now, now],
          ['tpl_thankyou', 'Thank You', 'Thank you!',
           '<p>Hi {{first_name}},</p><p>Thank you for choosing {{company}}. We appreciate your business!</p><p>Best regards,<br>The {{company}} Team</p>',
           'General', now, now]
        ];
        
        defaultTemplates.forEach(function(tpl) {
          sheet.appendRow(tpl);
        });
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);
      
      return rows.map(function(row) {
        const obj = {};
        headers.forEach(function(header, idx) {
          obj[header] = row[idx];
        });
        return obj;
      });
    }, 3600); // Cache for 1 hour
  } catch (error) {
    console.error('listEmailTemplatesApi error:', error);
    return [];
  }
}

function getEmailTemplateApi(templateId) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Email_Templates');
    
    if (!sheet || sheet.getLastRow() < 2) {
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const templateIdIdx = headers.indexOf('template_id');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][templateIdIdx] === templateId) {
        const obj = {};
        headers.forEach(function(header, idx) {
          obj[header] = data[i][idx];
        });
        return obj;
      }
    }
    
    return null;
  } catch (error) {
    console.error('getEmailTemplateApi error:', error);
    return null;
  }
}

function saveEmailTemplateApi(template) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    let sheet = ss.getSheetByName('Email_Templates');
    
    if (!sheet) {
      // Initialize sheet if it doesn't exist
      listEmailTemplatesApi();
      sheet = ss.getSheetByName('Email_Templates');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const templateId = template.template_id || 'tpl_' + Utilities.getUuid();
    const now = new Date().toISOString();
    
    // Check if template exists
    const templateIdIdx = headers.indexOf('template_id');
    for (let i = 1; i < data.length; i++) {
      if (data[i][templateIdIdx] === templateId) {
        // Update existing template
        sheet.getRange(i + 1, headers.indexOf('name') + 1).setValue(template.name || '');
        sheet.getRange(i + 1, headers.indexOf('subject') + 1).setValue(template.subject || '');
        sheet.getRange(i + 1, headers.indexOf('body_html') + 1).setValue(template.body_html || '');
        sheet.getRange(i + 1, headers.indexOf('category') + 1).setValue(template.category || 'General');
        sheet.getRange(i + 1, headers.indexOf('updated_at') + 1).setValue(now);
        
        // Invalidate cache
        CrmLib.invalidateCache('script', 'email_templates_list');
        
        return { success: true, template_id: templateId };
      }
    }
    
    // New template
    sheet.appendRow([
      templateId,
      template.name || '',
      template.subject || '',
      template.body_html || '',
      template.category || 'General',
      now,
      now
    ]);
    
    // Invalidate cache
    CrmLib.invalidateCache('script', 'email_templates_list');
    
    return { success: true, template_id: templateId };
  } catch (error) {
    console.error('saveEmailTemplateApi error:', error);
    return { success: false, error: error.message };
  }
}

// ===== CALENDAR API (NEW) =====

function listCalendarEventsApi(params) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Calendar_Events');
    
    if (!sheet || sheet.getLastRow() < 2) {
      return { rows: [], total: 0 };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const events = rows.map(function(row) {
      const obj = {};
      headers.forEach(function(header, idx) {
        obj[header] = row[idx];
      });
      return obj;
    });
    
    const now = new Date();
    const upcomingEvents = events.filter(e => new Date(e.start_time) >= now);
    upcomingEvents.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    
    return {
      rows: upcomingEvents,
      total: upcomingEvents.length
    };
  } catch (error) {
    console.error('listCalendarEventsApi error:', error);
    return { rows: [], total: 0, error: error.message };
  }
}

function saveCalendarEventApi(event) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Calendar_Events');
    
    if (!sheet) {
      return { success: false, error: 'Calendar_Events sheet not found' };
    }
    
    const newId = 'event_' + Utilities.getUuid();
    
    let gcalEventId = '';
    if (event.createInGCal) {
      try {
        const cal = CalendarApp.getDefaultCalendar();
        const gcalEvent = cal.createEvent(
          event.title,
          new Date(event.start_time),
          new Date(event.end_time),
          {
            description: event.description || '',
            guests: event.attendees || ''
          }
        );
        gcalEventId = gcalEvent.getId();
      } catch (calError) {
        console.error('Calendar creation error:', calError);
      }
    }
    
    sheet.appendRow([
      newId,
      event.title || '',
      event.start_time || '',
      event.end_time || '',
      event.attendees || '',
      event.related_id || '',
      Session.getActiveUser().getEmail(),
      gcalEventId,
      new Date().toISOString()
    ]);
    
    return { success: true, event_id: newId, gcal_event_id: gcalEventId };
  } catch (error) {
    console.error('saveCalendarEventApi error:', error);
    return { success: false, error: error.message };
  }
}

// ===== CACHE MANAGEMENT API =====

/**
 * Get cached users list for dropdowns (much faster than listUsersApi)
 */
function getCachedUsersApi() {
  try {
    const spreadsheetId = getCrmSheetId();
    if (typeof CrmLib !== 'undefined' && CrmLib.getCachedUsers) {
      const users = CrmLib.getCachedUsers(spreadsheetId, false);
      return { success: true, users: users };
    }
    return listUsersApi({ pageSize: 100 });
  } catch (error) {
    console.error('getCachedUsersApi error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get cached companies list for dropdowns (much faster than listCompaniesApi)
 */
function getCachedCompaniesApi() {
  try {
    const spreadsheetId = getCrmSheetId();
    if (typeof CrmLib !== 'undefined' && CrmLib.getCachedCompanies) {
      const companies = CrmLib.getCachedCompanies(spreadsheetId, false);
      return { success: true, companies: companies };
    }
    return listCompaniesApi({ pageSize: 100 });
  } catch (error) {
    console.error('getCachedCompaniesApi error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get cached dashboard stats (1-hour cache, much faster than getStatsApi)
 */
function getCachedStatsApi() {
  try {
    const spreadsheetId = getCrmSheetId();
    if (typeof CrmLib !== 'undefined' && CrmLib.getCachedDashboardStats) {
      const stats = CrmLib.getCachedDashboardStats(spreadsheetId, false);
      console.log('Stats loaded (execution time: ' + (stats.executionTime || 0) + 'ms)');
      return stats;
    }
    return getStatsApi();
  } catch (error) {
    console.error('getCachedStatsApi error:', error);
    return getStatsApi();
  }
}

/**
 * ULTRA-FAST stats - only row counts (instant!)
 * Use this for initial dashboard load, then load full stats in background
 */
function getQuickStatsApi() {
  try {
    const spreadsheetId = getCrmSheetId();
    if (typeof CrmLib !== 'undefined' && CrmLib.getQuickDashboardStats) {
      return CrmLib.getQuickDashboardStats(spreadsheetId);
    }
    return getCachedStatsApi();
  } catch (error) {
    console.error('getQuickStatsApi error:', error);
    return getCachedStatsApi();
  }
}

/**
 * Warm cache - preload frequently accessed data for instant performance
 * COMPREHENSIVE: Warms both library and list caches
 */
function warmCacheApi() {
  try {
    const startTime = new Date().getTime();
    const spreadsheetId = getCrmSheetId();
    
    console.log('Warming all caches...');
    
    // Warm library caches (dashboard stats, users, companies)
    if (typeof CrmLib !== 'undefined' && CrmLib.warmCache) {
      CrmLib.warmCache(spreadsheetId);
    }
    
    // Preload list caches by calling each list API once
    listContactsApi({ page: 1, pageSize: 10 });
    console.log('✓ Contacts list cached');
    
    listCompaniesApi({ page: 1, pageSize: 10 });
    console.log('✓ Companies list cached');
    
    listDealsApi({ page: 1, pageSize: 10 });
    console.log('✓ Deals list cached');
    
    listTasksApi({ page: 1, pageSize: 10 });
    console.log('✓ Tasks list cached');
    
    const endTime = new Date().getTime();
    const totalTime = endTime - startTime;
    
    console.log('All caches warmed in ' + totalTime + 'ms');
    
    return { 
      success: true, 
      message: 'All caches warmed successfully', 
      executionTime: totalTime 
    };
  } catch (error) {
    console.error('warmCacheApi error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clear cache by type
 */
function clearCacheApi(cacheType) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib.clearCache) {
      return CrmLib.clearCache(cacheType || 'all');
    }
    return { success: false, error: 'Cache service not available' };
  } catch (error) {
    console.error('clearCacheApi error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save user filters to cache
 */
function saveUserFiltersApi(filterType, filters) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib.setUserFilters) {
      CrmLib.setUserFilters(filterType, filters);
      return { success: true };
    }
    return { success: false, error: 'Cache service not available' };
  } catch (error) {
    console.error('saveUserFiltersApi error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get saved user filters from cache
 */
function getUserFiltersApi(filterType) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib.getUserFilters) {
      const filters = CrmLib.getUserFilters(filterType);
      return { success: true, filters: filters };
    }
    return { success: false, filters: {} };
  } catch (error) {
    console.error('getUserFiltersApi error:', error);
    return { success: false, filters: {} };
  }
}

/**
 * Invalidate cache after data changes
 * Also clears list caches for immediate freshness
 */
function invalidateCacheApi(entityType) {
  try {
    // Clear related list caches
    const cache = CacheService.getScriptCache();
    
    switch(entityType) {
      case 'contact':
        cache.remove('crm_contacts_full_list');
        break;
      case 'company':
        cache.remove('crm_companies_full_list');
        break;
      case 'deal':
        cache.remove('crm_deals_full_list');
        break;
      case 'task':
        cache.remove('crm_tasks_full_list');
        break;
      case 'user':
        cache.remove('crm_users_full_list');
        break;
      case 'all':
        cache.remove('crm_contacts_full_list');
        cache.remove('crm_companies_full_list');
        cache.remove('crm_deals_full_list');
        cache.remove('crm_tasks_full_list');
        cache.remove('crm_users_full_list');
        break;
    }
    
    // Also invalidate CrmLib caches
    if (typeof CrmLib !== 'undefined' && CrmLib.invalidateRelatedCaches) {
      CrmLib.invalidateRelatedCaches(entityType);
    }
    
    console.log('✓ Cache invalidated for: ' + entityType);
    return { success: true };
  } catch (error) {
    console.error('invalidateCacheApi error:', error);
    return { success: false, error: error.message };
  }
}

// ===== CHART DATA API (NEW) =====

function getChartDataApi(chartType) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    
    switch(chartType) {
      case 'revenue':
        return getRevenueData(ss);
      case 'dealDistribution':
        return getDealDistributionData(ss);
      case 'pipeline':
        return getPipelineData(ss);
      case 'tasks':
        return getTaskStatusData(ss);
      default:
        return { labels: [], data: [] };
    }
  } catch (error) {
    console.error('getChartDataApi error:', error);
    return { labels: [], data: [], error: error.message };
  }
}

function getRevenueData(ss) {
  const sheet = ss.getSheetByName('Deals');
  if (!sheet || sheet.getLastRow() < 2) {
    return { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], data: [0, 0, 0, 0, 0, 0] };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const statusIdx = headers.indexOf('status');
  const amountIdx = headers.indexOf('amount');
  const closeDateIdx = headers.indexOf('close_date');
  
  const monthlyRevenue = {};
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][statusIdx] === 'Won' && data[i][closeDateIdx]) {
      const date = new Date(data[i][closeDateIdx]);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (Number(data[i][amountIdx]) || 0);
    }
  }
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const values = months.map(m => monthlyRevenue[m] || 0);
  
  return { labels: months, data: values };
}

function getDealDistributionData(ss) {
  const sheet = ss.getSheetByName('Deals');
  if (!sheet || sheet.getLastRow() < 2) {
    return { labels: [], data: [] };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const stageIdx = headers.indexOf('stage');
  
  const stageCounts = {};
  for (let i = 1; i < data.length; i++) {
    const stage = data[i][stageIdx] || 'Unknown';
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  }
  
  return {
    labels: Object.keys(stageCounts),
    data: Object.values(stageCounts)
  };
}

function getPipelineData(ss) {
  const sheet = ss.getSheetByName('Deals');
  if (!sheet || sheet.getLastRow() < 2) {
    return { labels: [], data: [] };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const stageIdx = headers.indexOf('stage');
  
  const stages = ['Prospect', 'Qualified', 'Proposal', 'Negotiation'];
  const counts = stages.map(stage => {
    let count = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i][stageIdx] === stage) count++;
    }
    return count;
  });
  
  return { labels: stages, data: counts };
}

function getTaskStatusData(ss) {
  const sheet = ss.getSheetByName('Tasks');
  if (!sheet || sheet.getLastRow() < 2) {
    return { labels: ['Pending', 'In Progress', 'Completed'], data: [0, 0, 0] };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const statusIdx = headers.indexOf('status');
  
  const statusCounts = { 'Pending': 0, 'In Progress': 0, 'Completed': 0 };
  for (let i = 1; i < data.length; i++) {
    const status = data[i][statusIdx];
    if (statusCounts.hasOwnProperty(status)) {
      statusCounts[status]++;
    }
  }
  
  return {
    labels: Object.keys(statusCounts),
    data: Object.values(statusCounts)
  };
}

