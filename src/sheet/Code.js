/**
 * CRM Core Automation - Sheet-bound Script
 * Single-file server-side code for Google Apps Script
 * All business logic is in the CrmLib library
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
    
    // Find user by email (case-insensitive)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (String(row[emailIdx]).toLowerCase() === email.toLowerCase()) {
        const isActive = row[activeIdx] === true || String(row[activeIdx]).toLowerCase() === 'true';
        
        if (!isActive) {
          return null; // Inactive user
        }
        
        // Update last login
        sheet.getRange(i + 1, lastLoginIdx + 1).setValue(new Date().toISOString());
        
        // Return user object
        return {
          email: row[emailIdx],
          display_name: row[displayNameIdx] || email,
          role: row[roleIdx] || 'User',
          active: isActive
        };
      }
    }
    
    return null; // User not found
  } catch (error) {
    console.error('loginUser error:', error);
    return null;
  }
}

function recordLogin() {
  try {
    const email = Session.getActiveUser().getEmail();
    if (!email) return;
    
    const spreadsheetId = getCrmSheetId();
    CrmLib.recordLogin(spreadsheetId);
  } catch (error) {
    console.error('recordLogin error:', error);
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
    
    // Create demo companies
    const companies = [
      { name: 'Acme Corp', industry: 'Technology', website: 'acme.com', phone: '555-0001' },
      { name: 'Global Tech', industry: 'Software', website: 'globaltech.com', phone: '555-0002' },
      { name: 'Innovate LLC', industry: 'Consulting', website: 'innovate.com', phone: '555-0003' }
    ];
    
    // Create demo contacts
    const contacts = [
      { first_name: 'John', last_name: 'Doe', email: 'john@acme.com', phone: '555-1001' },
      { first_name: 'Jane', last_name: 'Smith', email: 'jane@globaltech.com', phone: '555-1002' },
      { first_name: 'Bob', last_name: 'Johnson', email: 'bob@innovate.com', phone: '555-1003' }
    ];
    
    // Create demo deals
    const deals = [
      { title: 'Q4 Enterprise Deal', stage: 'Proposal', amount: 50000, status: 'Open', close_date: '2025-12-31' },
      { title: 'Annual Subscription', stage: 'Negotiation', amount: 25000, status: 'Open', close_date: '2025-11-30' }
    ];
    
    // Create demo tasks
    const tasks = [
      { subject: 'Follow up with Acme', priority: 'High', status: 'Pending', due_date: '2025-10-15' },
      { subject: 'Prepare proposal', priority: 'Medium', status: 'In Progress', due_date: '2025-10-20' }
    ];
    
    // Insert demo data (simplified - in real implementation would use CrmLib methods)
    const ss = SpreadsheetApp.openById(spreadsheetId);
    
    // Insert companies
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
    
    // Insert contacts
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
    
    // Insert deals
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
    
    // Insert tasks
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
    
    // Get counts from each sheet
    const contactsSheet = ss.getSheetByName('Contacts');
    const companiesSheet = ss.getSheetByName('Companies');
    const dealsSheet = ss.getSheetByName('Deals');
    const tasksSheet = ss.getSheetByName('Tasks');
    
    const contactsCount = contactsSheet ? Math.max(0, contactsSheet.getLastRow() - 1) : 0;
    const companiesCount = companiesSheet ? Math.max(0, companiesSheet.getLastRow() - 1) : 0;
    const dealsCount = dealsSheet ? Math.max(0, dealsSheet.getLastRow() - 1) : 0;
    const tasksCount = tasksSheet ? Math.max(0, tasksSheet.getLastRow() - 1) : 0;
    
    // Calculate deal value (simplified)
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
    
    // Count pending tasks
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

function listContactsApi(params) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Contacts');
    
    if (!sheet || sheet.getLastRow() < 2) {
      return { rows: [], total: 0 };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    // Map to objects
    const contacts = rows.map(function(row) {
      const obj = {};
      headers.forEach(function(header, idx) {
        obj[header] = row[idx];
      });
      return obj;
    });
    
    // Pagination
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
    
    // Update existing or create new
    if (contact.contact_id) {
      // Update existing
      const contactIdIdx = headers.indexOf('contact_id');
      for (let i = 1; i < data.length; i++) {
        if (data[i][contactIdIdx] === contact.contact_id) {
          // Update row
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
      // Create new
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

function listCompaniesApi(params) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Companies');
    
    if (!sheet || sheet.getLastRow() < 2) {
      return { rows: [], total: 0 };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const companies = rows.map(function(row) {
      const obj = {};
      headers.forEach(function(header, idx) {
        obj[header] = row[idx];
      });
      return obj;
    });
    
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

function listDealsApi(params) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Deals');
    
    if (!sheet || sheet.getLastRow() < 2) {
      return { rows: [], total: 0 };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const deals = rows.map(function(row) {
      const obj = {};
      headers.forEach(function(header, idx) {
        obj[header] = row[idx];
      });
      return obj;
    });
    
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

function listTasksApi(params) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Tasks');
    
    if (!sheet || sheet.getLastRow() < 2) {
      return { rows: [], total: 0 };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const tasks = rows.map(function(row) {
      const obj = {};
      headers.forEach(function(header, idx) {
        obj[header] = row[idx];
      });
      return obj;
    });
    
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

// ===== USERS API =====

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
      // Convert active to boolean
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
    
    // Check if user exists
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailIdx = headers.indexOf('email');
    
    let userExists = false;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][emailIdx]).toLowerCase() === String(user.email).toLowerCase()) {
        // Update existing user
        sheet.getRange(i + 1, headers.indexOf('display_name') + 1).setValue(user.display_name || '');
        sheet.getRange(i + 1, headers.indexOf('role') + 1).setValue(user.role || 'User');
        sheet.getRange(i + 1, headers.indexOf('active') + 1).setValue(user.active ? 'TRUE' : 'FALSE');
        userExists = true;
        break;
      }
    }
    
    if (!userExists) {
      // Create new user
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

