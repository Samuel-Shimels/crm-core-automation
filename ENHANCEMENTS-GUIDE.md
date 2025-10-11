# CRM Core - Enhancement Implementation Guide

## 🎯 Quick Reference: What's Been Enhanced

This guide shows you exactly what enhancements have been made to create a modern, SMB-friendly CRM with all the features from the design document.

---

## ✨ Key Enhancements Added

### 1. 🎨 Modern Branded UI with Dark/Light Mode

**What's New:**
- Dual theme system (Light & Dark modes)
- Purple gradient branding throughout
- Smooth theme transitions (0.3s)
- Theme preference saved in localStorage
- Toggle button in sidebar header

**CSS Variables Added:**
```css
/* Light Theme (Default) */
:root {
  --brand-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1e293b;
  /* ... more */
}

/* Dark Theme */
[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f1f5f9;
  /* ... more */
}
```

**Where to Add:**
- In `index.html` `<style>` section at the top
- All existing colors updated to use CSS variables

**Theme Toggle Button:**
```html
<!-- Add to sidebar header -->
<button class="theme-toggle" onclick="toggleTheme()">
  <i class="bi bi-moon-stars" id="themeIcon"></i>
</button>
```

**JavaScript Function:**
```javascript
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('crm-theme', newTheme);
  
  // Update icon
  const icon = document.getElementById('themeIcon');
  icon.className = newTheme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
}

// Load saved theme on page load
const savedTheme = localStorage.getItem('crm-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
```

---

### 2. 🔔 Custom Alert/Notification System

**What's New:**
- Beautiful toast notifications
- 4 types: Success, Warning, Error, Info
- Auto-dismiss after 5 seconds
- Manual close button
- Slide-in animation from right
- Icon-based visual feedback

**CSS Added:**
```css
.custom-alert {
  position: fixed;
  top: 2rem;
  right: 2rem;
  min-width: 320px;
  background: var(--card-bg);
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 10px 40px var(--shadow);
  animation: slideInRight 0.3s ease;
  z-index: 10000;
}

.custom-alert.alert-success { border-left: 4px solid var(--success); }
.custom-alert.alert-warning { border-left: 4px solid var(--warning); }
.custom-alert.alert-danger { border-left: 4px solid var(--danger); }
.custom-alert.alert-info { border-left: 4px solid var(--info); }
```

**JavaScript Function:**
```javascript
function showAlert(type, title, message) {
  const icons = {
    success: 'bi-check-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    error: 'bi-x-circle-fill',
    info: 'bi-info-circle-fill'
  };
  
  const alert = document.createElement('div');
  alert.className = `custom-alert alert-${type}`;
  alert.innerHTML = `
    <div class="alert-icon"><i class="${icons[type]}"></i></div>
    <div class="alert-content">
      <div class="alert-title">${title}</div>
      <div class="alert-message">${message}</div>
    </div>
    <button class="alert-close" onclick="this.parentElement.remove()">
      <i class="bi bi-x-lg"></i>
    </button>
  `;
  
  document.body.appendChild(alert);
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    alert.style.opacity = '0';
    alert.style.transform = 'translateX(100%)';
    setTimeout(() => alert.remove(), 300);
  }, 5000);
}

// Usage Examples:
// showAlert('success', 'Contact Created', 'John Doe has been added successfully');
// showAlert('error', 'Failed', 'Unable to save contact');
// showAlert('warning', 'Warning', 'Duplicate email detected');
// showAlert('info', 'Info', 'Remember to follow up tomorrow');
```

**Where to Use:**
- Replace all `alert()` calls with `showAlert()`
- After successful CRUD operations
- On validation errors
- For user guidance messages

---

### 3. 📊 Dashboard with Interactive Graphs (Chart.js)

**What's New:**
- Revenue trend line chart
- Deal pipeline funnel chart
- Deal distribution doughnut chart
- Task status bar chart
- Responsive chart sizing
- Theme-aware colors
- Interactive tooltips
- Time period filters

**Library Added:**
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

**HTML Structure:**
```html
<div class="row g-3 mt-4">
  <div class="col-md-8">
    <div class="chart-card">
      <div class="chart-header">
        <h3 class="chart-title">Revenue Trend</h3>
        <div class="chart-filters">
          <button class="chart-filter-btn active" data-period="month">Month</button>
          <button class="chart-filter-btn" data-period="quarter">Quarter</button>
          <button class="chart-filter-btn" data-period="year">Year</button>
        </div>
      </div>
      <div class="chart-container">
        <canvas id="revenueChart"></canvas>
      </div>
    </div>
  </div>
  
  <div class="col-md-4">
    <div class="chart-card">
      <div class="chart-header">
        <h3 class="chart-title">Deal Distribution</h3>
      </div>
      <div class="chart-container">
        <canvas id="dealDistChart"></canvas>
      </div>
    </div>
  </div>
</div>
```

**JavaScript - Chart Initialization:**
```javascript
function initDashboardCharts() {
  // Get theme colors
  const getThemeColor = (colorName) => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--${colorName}`).trim();
  };
  
  // Revenue Trend Chart
  const revenueCtx = document.getElementById('revenueChart');
  if (revenueCtx) {
    new Chart(revenueCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue',
          data: [45000, 52000, 48000, 61000, 58000, 67000],
          borderColor: getThemeColor('brand'),
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Revenue: $${context.parsed.y.toLocaleString()}`
            }
          }
        }
      }
    });
  }
  
  // Deal Distribution Chart
  const dealCtx = document.getElementById('dealDistChart');
  if (dealCtx) {
    new Chart(dealCtx, {
      type: 'doughnut',
      data: {
        labels: ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'],
        datasets: [{
          data: [12, 19, 8, 15, 25],
          backgroundColor: [
            '#6366f1',
            '#8b5cf6',
            '#10b981',
            '#f59e0b',
            '#ef4444'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
}

// Call in dashboard initialization
function initDashboard() {
  loadDashboardStats();
  initDashboardCharts();
}
```

**API Enhancement - Get Chart Data:**

Add to `Code.js`:
```javascript
function getChartDataApi(chartType, period) {
  try {
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    
    switch(chartType) {
      case 'revenue':
        return getRevenueChartData(ss, period);
      case 'dealDistribution':
        return getDealDistributionData(ss);
      case 'taskStatus':
        return getTaskStatusData(ss);
      default:
        return { success: false, error: 'Unknown chart type' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function getRevenueChartData(ss, period) {
  const dealsSheet = ss.getSheetByName('Deals');
  if (!dealsSheet) return { labels: [], data: [] };
  
  const data = dealsSheet.getDataRange().getValues();
  const headers = data[0];
  const statusIdx = headers.indexOf('status');
  const amountIdx = headers.indexOf('amount');
  const closeDateIdx = headers.indexOf('close_date');
  
  // Group by month and sum won deals
  const monthlyRevenue = {};
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][statusIdx] === 'Won' && data[i][closeDateIdx]) {
      const date = new Date(data[i][closeDateIdx]);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (Number(data[i][amountIdx]) || 0);
    }
  }
  
  // Format for Chart.js
  const sortedMonths = Object.keys(monthlyRevenue).sort();
  return {
    labels: sortedMonths.map(m => {
      const [year, month] = m.split('-');
      const date = new Date(year, month - 1);
      return date.toLocaleDateString('en-US', { month: 'short' });
    }),
    data: sortedMonths.map(m => monthlyRevenue[m])
  };
}

function getDealDistributionData(ss) {
  const dealsSheet = ss.getSheetByName('Deals');
  if (!dealsSheet) return { labels: [], data: [] };
  
  const data = dealsSheet.getDataRange().getValues();
  const headers = data[0];
  const stageIdx = headers.indexOf('stage');
  
  const stageCounts = {};
  for (let i = 1; i < data.length; i++) {
    const stage = data[i][stageIdx];
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  }
  
  return {
    labels: Object.keys(stageCounts),
    data: Object.values(stageCounts)
  };
}
```

**Update JavaScript to Load Chart Data:**
```javascript
google.script.run
  .withSuccessHandler(function(chartData) {
    // Update chart with real data
    revenueChart.data.labels = chartData.labels;
    revenueChart.data.datasets[0].data = chartData.data;
    revenueChart.update();
  })
  .getChartDataApi('revenue', 'month');
```

---

### 4. ✉️ Email Composer with HTML Templates

**What's New:**
- Rich text editor with formatting toolbar
- Pre-built email templates
- Variable substitution {{first_name}}, {{company}}
- HTML preview mode
- Send via Gmail API
- Template management

**HTML Structure:**
```html
<!-- Add to Email View -->
<div id="view-email" class="view-section">
  <div class="page-header d-flex justify-content-between align-items-center">
    <div>
      <h1 class="page-title">Email</h1>
      <p class="page-subtitle">Compose and send emails with templates</p>
    </div>
    <button class="btn btn-primary" onclick="showEmailComposer()">
      <i class="bi bi-envelope-plus"></i> Compose Email
    </button>
  </div>

  <!-- Email Composer -->
  <div class="email-composer" id="emailComposer" style="display: none;">
    <div class="composer-header p-3 border-bottom">
      <div class="mb-2">
        <label class="form-label">Template</label>
        <select class="form-select" id="emailTemplate" onchange="loadTemplate()">
          <option value="">-- Select Template --</option>
          <option value="welcome">Welcome Email</option>
          <option value="followup">Follow-up</option>
          <option value="proposal">Proposal</option>
          <option value="thankyou">Thank You</option>
        </select>
      </div>
      <div class="mb-2">
        <label class="form-label">To</label>
        <input type="email" class="form-control" id="emailTo" placeholder="recipient@example.com">
      </div>
      <div class="mb-2">
        <label class="form-label">Subject</label>
        <input type="text" class="form-control" id="emailSubject" placeholder="Email subject">
      </div>
    </div>
    
    <div class="composer-toolbar">
      <button class="toolbar-btn" onclick="formatText('bold')">
        <i class="bi bi-type-bold"></i>
      </button>
      <button class="toolbar-btn" onclick="formatText('italic')">
        <i class="bi bi-type-italic"></i>
      </button>
      <button class="toolbar-btn" onclick="formatText('underline')">
        <i class="bi bi-type-underline"></i>
      </button>
      <span class="toolbar-divider">|</span>
      <button class="toolbar-btn" onclick="formatText('insertUnorderedList')">
        <i class="bi bi-list-ul"></i>
      </button>
      <button class="toolbar-btn" onclick="formatText('insertOrderedList')">
        <i class="bi bi-list-ol"></i>
      </button>
      <span class="toolbar-divider">|</span>
      <button class="toolbar-btn" onclick="insertLink()">
        <i class="bi bi-link-45deg"></i>
      </button>
      <button class="toolbar-btn" onclick="togglePreview()">
        <i class="bi bi-eye"></i> Preview
      </button>
    </div>
    
    <div contenteditable="true" class="composer-editor" id="emailBody">
      <p>Start typing your email...</p>
    </div>
    
    <div class="composer-footer p-3 border-top d-flex justify-content-between">
      <button class="btn btn-secondary" onclick="closeEmailComposer()">
        <i class="bi bi-x-lg"></i> Cancel
      </button>
      <button class="btn btn-primary" onclick="sendEmail()">
        <i class="bi bi-send"></i> Send Email
      </button>
    </div>
  </div>

  <!-- Email Log Table -->
  <div class="data-card mt-4">
    <div class="data-card-header">
      <h3 class="data-card-title">Email Log</h3>
    </div>
    <div class="table-container">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Direction</th>
            <th>To/From</th>
            <th>Subject</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="emailLogTable"></tbody>
      </table>
    </div>
  </div>
</div>
```

**JavaScript - Email Templates:**
```javascript
const emailTemplates = {
  welcome: {
    subject: 'Welcome to {{company}}!',
    body: `<p>Hi {{first_name}},</p>
           <p>Welcome to {{company}}! We're excited to have you on board.</p>
           <p>If you have any questions, feel free to reach out.</p>
           <p>Best regards,<br>The {{company}} Team</p>`
  },
  followup: {
    subject: 'Following up on our conversation',
    body: `<p>Hi {{first_name}},</p>
           <p>I wanted to follow up on our recent conversation about {{topic}}.</p>
           <p>Do you have time this week to discuss further?</p>
           <p>Best regards,<br>{{sender_name}}</p>`
  },
  proposal: {
    subject: 'Proposal for {{company}}',
    body: `<p>Hi {{first_name}},</p>
           <p>Thank you for your interest in our services. Please find our proposal attached.</p>
           <p>We look forward to working with you!</p>
           <p>Best regards,<br>{{sender_name}}</p>`
  },
  thankyou: {
    subject: 'Thank you!',
    body: `<p>Hi {{first_name}},</p>
           <p>Thank you for choosing {{company}}. We appreciate your business!</p>
           <p>Best regards,<br>The {{company}} Team</p>`
  }
};

function showEmailComposer() {
  document.getElementById('emailComposer').style.display = 'block';
}

function closeEmailComposer() {
  document.getElementById('emailComposer').style.display = 'none';
  // Clear fields
  document.getElementById('emailTemplate').value = '';
  document.getElementById('emailTo').value = '';
  document.getElementById('emailSubject').value = '';
  document.getElementById('emailBody').innerHTML = '<p>Start typing your email...</p>';
}

function loadTemplate() {
  const templateKey = document.getElementById('emailTemplate').value;
  if (!templateKey) return;
  
  const template = emailTemplates[templateKey];
  document.getElementById('emailSubject').value = template.subject;
  document.getElementById('emailBody').innerHTML = template.body;
}

function formatText(command) {
  document.execCommand(command, false, null);
  document.getElementById('emailBody').focus();
}

function insertLink() {
  const url = prompt('Enter URL:');
  if (url) {
    document.execCommand('createLink', false, url);
  }
}

function sendEmail() {
  const to = document.getElementById('emailTo').value;
  const subject = document.getElementById('emailSubject').value;
  const body = document.getElementById('emailBody').innerHTML;
  
  if (!to || !subject) {
    showAlert('warning', 'Missing Fields', 'Please fill in recipient and subject');
    return;
  }
  
  // Replace variables
  const processedBody = replaceVariables(body);
  
  google.script.run
    .withSuccessHandler(function(result) {
      if (result.success) {
        showAlert('success', 'Email Sent', `Email sent to ${to}`);
        closeEmailComposer();
        loadEmailLog();
      } else {
        showAlert('error', 'Send Failed', result.error);
      }
    })
    .sendEmailApi({
      to: to,
      subject: replaceVariables(subject),
      htmlBody: processedBody
    });
}

function replaceVariables(text) {
  // Replace {{first_name}}, {{company}}, etc. with actual values
  return text
    .replace(/\{\{first_name\}\}/g, currentContact ? currentContact.first_name : '')
    .replace(/\{\{company\}\}/g, currentUser ? currentUser.company : 'Our Company')
    .replace(/\{\{sender_name\}\}/g, currentUser ? currentUser.display_name : '');
}
```

**Code.js - Send Email API:**
```javascript
function sendEmailApi(emailData) {
  try {
    GmailApp.sendEmail(emailData.to, emailData.subject, '', {
      htmlBody: emailData.htmlBody
    });
    
    // Log to Email_Log sheet
    const spreadsheetId = getCrmSheetId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Email_Log');
    
    sheet.appendRow([
      'email_' + Utilities.getUuid(),
      'Outbound',
      Session.getActiveUser().getEmail(),
      emailData.to,
      emailData.subject,
      emailData.htmlBody.substring(0, 200),
      '',
      '',
      '',
      new Date().toISOString()
    ]);
    
    return { success: true };
  } catch (error) {
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
    
    // Sort by timestamp descending
    emails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const start = (page - 1) * pageSize;
    
    return {
      rows: emails.slice(start, start + pageSize),
      total: emails.length
    };
  } catch (error) {
    return { rows: [], total: 0, error: error.message };
  }
}
```

---

### 5. 📅 Calendar Events View

**HTML Structure:**
```html
<div id="view-calendar" class="view-section">
  <div class="page-header d-flex justify-content-between align-items-center">
    <div>
      <h1 class="page-title">Calendar</h1>
      <p class="page-subtitle">Manage events and meetings</p>
    </div>
    <button class="btn btn-primary" onclick="showNewEventModal()">
      <i class="bi bi-calendar-plus"></i> New Event
    </button>
  </div>

  <div class="row g-3">
    <div class="col-md-8">
      <!-- Calendar view would go here -->
      <div class="data-card">
        <div class="data-card-header">
          <h3 class="data-card-title">Upcoming Events</h3>
        </div>
        <div class="p-4">
          <div id="eventsCalendar">
            <!-- Simple list view for now -->
            <div id="eventsList"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="col-md-4">
      <div class="data-card">
        <div class="data-card-header">
          <h3 class="data-card-title">Today's Events</h3>
        </div>
        <div class="p-3" id="todayEvents">
          <div class="text-center text-muted py-4">
            <i class="bi bi-calendar-check" style="font-size: 2rem;"></i>
            <p class="mt-2">No events today</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Code.js - Calendar API:**
```javascript
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
    
    // Filter upcoming events
    const now = new Date();
    const upcomingEvents = events.filter(e => new Date(e.start_time) >= now);
    upcomingEvents.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    
    return {
      rows: upcomingEvents,
      total: upcomingEvents.length
    };
  } catch (error) {
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
    
    // Optionally create in Google Calendar
    let gcalEventId = '';
    if (event.createInGCal) {
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
    
    return { success: true, event_id: newId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

---

### 6. 🎯 Modern Icons (Bootstrap Icons)

**Library Added:**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
```

**Icon Replacements:**

| Old Emoji | New Bootstrap Icon | Usage |
|-----------|-------------------|-------|
| 🚀 | `<i class="bi bi-rocket-takeoff"></i>` | Logo, loading |
| 📊 | `<i class="bi bi-graph-up"></i>` | Dashboard |
| 👥 | `<i class="bi bi-people"></i>` | Contacts |
| 🏢 | `<i class="bi bi-building"></i>` | Companies |
| 💼 | `<i class="bi bi-briefcase"></i>` | Deals |
| ✅ | `<i class="bi bi-check-square"></i>` | Tasks |
| 📧 | `<i class="bi bi-envelope"></i>` | Email |
| 📅 | `<i class="bi bi-calendar"></i>` | Calendar |
| 📈 | `<i class="bi bi-bar-chart"></i>` | Reports |
| ⚙️ | `<i class="bi bi-gear"></i>` | Settings |
| 🔔 | `<i class="bi bi-bell"></i>` | Notifications |
| 🔍 | `<i class="bi bi-search"></i>` | Search |
| + | `<i class="bi bi-plus-lg"></i>` | Add new |
| ✏️ | `<i class="bi bi-pencil"></i>` | Edit |
| 🗑️ | `<i class="bi bi-trash"></i>` | Delete |
| 🔒 | `<i class="bi bi-lock"></i>` | Security |
| 👤 | `<i class="bi bi-person-circle"></i>` | User profile |

**Update Navigation:**
```html
<a class="nav-item active" data-page="dashboard">
  <i class="bi bi-graph-up nav-icon"></i>
  Dashboard
</a>
<a class="nav-item" data-page="contacts">
  <i class="bi bi-people nav-icon"></i>
  Contacts
</a>
<!-- etc. -->
```

---

## 🎯 Implementation Checklist

### Phase 1: Basic Enhancements (30 minutes)
- [x] Add Bootstrap Icons CDN
- [x] Add Chart.js CDN
- [ ] Update CSS variables for theming
- [ ] Add theme toggle button
- [ ] Replace emoji icons with Bootstrap icons

### Phase 2: Custom Alerts (15 minutes)
- [ ] Add custom alert CSS
- [ ] Create showAlert() JavaScript function
- [ ] Replace all alert() calls with showAlert()
- [ ] Test all alert types

### Phase 3: Dashboard Charts (45 minutes)
- [ ] Add chart HTML containers
- [ ] Create chart initialization functions
- [ ] Add getChartDataApi() to Code.js
- [ ] Connect charts to real data
- [ ] Add time period filters
- [ ] Test chart responsiveness

### Phase 4: Email Composer (60 minutes)
- [ ] Add email composer HTML
- [ ] Create email templates object
- [ ] Implement formatting toolbar
- [ ] Add sendEmailApi() to Code.js
- [ ] Add listEmailLogApi() to Code.js
- [ ] Test email sending
- [ ] Test template loading

### Phase 5: Calendar View (30 minutes)
- [ ] Add calendar view HTML
- [ ] Add listCalendarEventsApi() to Code.js
- [ ] Add saveCalendarEventApi() to Code.js
- [ ] Integrate with Google Calendar API
- [ ] Test event creation

### Phase 6: Final Polish (30 minutes)
- [ ] Test dark/light mode on all pages
- [ ] Verify all icons display correctly
- [ ] Test responsiveness on mobile
- [ ] Check console for errors
- [ ] Performance testing
- [ ] Update README-COMPLETE.md

---

## 📦 Files to Copy to Google Apps Script

### 1. index.html
- Location: `src/sheet/index.html`
- Copy entire file with all enhancements
- This is your complete UI

### 2. Code.js
- Location: `src/sheet/Code.js`
- Add new API endpoints:
  - `getChartDataApi()`
  - `sendEmailApi()`
  - `listEmailLogApi()`
  - `listCalendarEventsApi()`
  - `saveCalendarEventApi()`

### 3. Library Files (if enhancing)
- Location: `src/library/core/*.js`
- No changes required for basic enhancements
- For advanced features, you may add helper functions

---

## 🎨 Color Palette Reference

### Brand Colors
```
Primary Purple: #6366f1 (Indigo)
Secondary Purple: #8b5cf6 (Violet)
Gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

### Semantic Colors
```
Success: #10b981 (Green)
Warning: #f59e0b (Amber)
Danger: #ef4444 (Red)
Info: #3b82f6 (Blue)
```

### Theme Colors
```
Light Mode:
  - Background: #ffffff, #f8fafc
  - Text: #1e293b, #64748b
  - Border: #e2e8f0

Dark Mode:
  - Background: #0f172a, #1e293b
  - Text: #f1f5f9, #cbd5e1
  - Border: #334155
```

---

## 🚀 Quick Start for Enhancements

1. **Backup Current Files**
   - Copy your current `index.html` and `Code.js` to backup files

2. **Update index.html**
   - Replace entire file OR apply sections incrementally
   - Start with CSS variables and theme system
   - Add new HTML sections (charts, email composer)
   - Update JavaScript functions

3. **Update Code.js**
   - Add new API endpoints
   - Test each endpoint individually
   - Verify error handling

4. **Test in Apps Script**
   - Run `clasp push` to upload changes
   - Deploy web app
   - Test each feature
   - Fix any issues

5. **Iterate and Refine**
   - Adjust colors to match your brand
   - Customize templates
   - Add more chart types
   - Enhance email templates

---

## 💡 Tips & Best Practices

1. **Development Mode**
   - Use library `developmentMode: true` during development
   - Switch to versioned releases for production

2. **Testing**
   - Test on multiple browsers (Chrome, Firefox, Safari)
   - Test on mobile devices
   - Check dark mode on all pages
   - Verify all alert types

3. **Performance**
   - Charts load data asynchronously
   - Use pagination for large datasets
   - Cache frequently accessed data
   - Minimize API calls

4. **Accessibility**
   - High contrast in dark mode
   - Keyboard navigation support
   - Screen reader friendly
   - Clear focus indicators

5. **Security**
   - Validate all user inputs
   - Sanitize email content
   - Use OAuth scopes properly
   - Log all actions

---

## 🎓 Learning Resources

- **Chart.js Documentation**: https://www.chartjs.org/docs/
- **Bootstrap Icons**: https://icons.getbootstrap.com/
- **CSS Variables**: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- **Apps Script Gmail API**: https://developers.google.com/apps-script/reference/gmail
- **Apps Script Calendar API**: https://developers.google.com/apps-script/reference/calendar

---

## 🆘 Troubleshooting

### Charts Not Displaying
- Verify Chart.js CDN loaded
- Check browser console for errors
- Ensure canvas elements exist
- Verify data format is correct

### Theme Toggle Not Working
- Check `data-theme` attribute on `<html>`
- Verify CSS variables defined
- Check localStorage access
- Clear browser cache

### Email Sending Fails
- Verify Gmail API scope in `appsscript.json`
- Check OAuth authorization
- Verify recipient email format
- Check quota limits

### Icons Not Showing
- Verify Bootstrap Icons CDN loaded
- Check icon class names (bi bi-*)
- Clear browser cache
- Try different CDN version

---

**Ready to enhance your CRM? Start with Phase 1 and work through incrementally!** 🚀

*Questions? Check README-COMPLETE.md for detailed documentation.*

