# 🚀 CRM Core Automation - Complete Implementation Guide

**Modern CRM for SMBs | Google Apps Script + Google Sheets**

Version: 2.0 Enhanced Edition

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [File Structure](#-file-structure)
- [Setup Instructions](#-setup-instructions)
- [Database Schema](#-database-schema)
- [Enhancement Guide](#-enhancement-guide)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)
- [Best Practices](#-best-practices)

---

## 🎯 Overview

**CRM Core Automation** is a full-featured Customer Relationship Management system designed for Small and Medium Businesses (SMBs). Built on Google Apps Script and Google Sheets, it provides enterprise-level CRM features at zero infrastructure cost.

### Why This CRM?

✅ **$0 Infrastructure Cost** - Runs entirely on Google Workspace  
✅ **Enterprise Features** - Complete CRM without enterprise pricing  
✅ **Modern UI/UX** - Dark/light mode, responsive design, beautiful charts  
✅ **Customizable** - Open source, modify as needed  
✅ **Secure** - Role-based access control, audit logging  
✅ **Data Ownership** - Your data stays in your Google Drive  

---

## ✨ Features

### Core CRM Capabilities

- 📇 **Contact Management** - Complete profiles, lead scoring, bulk operations
- 🏢 **Company Management** - Organization tracking, industry classification
- 💼 **Deal Pipeline** - Sales tracking, stages, probability, win/loss analysis
- ✅ **Task Management** - Assignment, priorities, due dates, reminders
- 📧 **Email Integration** - HTML composer, templates, Gmail sync, tracking
- 📅 **Calendar Integration** - Event management, Google Calendar sync
- 👥 **User Management** - Role-based access (Admin/Manager/User)
- 📊 **Reports & Analytics** - Real-time dashboard, interactive charts

### Enhanced UI/UX Features

- 🎨 **Dark/Light Mode** - Smooth theme switching with localStorage persistence
- 🎨 **Modern Branded UI** - Professional purple gradient design
- 🔔 **Custom Alert System** - Beautiful toast notifications (success/warning/error/info)
- 📊 **Interactive Dashboard Charts** - Chart.js graphs for revenue, pipeline, tasks
- 📧 **Rich Email Composer** - HTML editor with formatting toolbar
- 🎯 **Bootstrap Icons** - 1,800+ professional icons throughout
- 📱 **Responsive Design** - Works on desktop, tablet, mobile
- ⚡ **Smooth Animations** - Professional transitions and effects

---

## 🚀 Quick Start

### Prerequisites

1. **Google Account** with Google Workspace (or Gmail)
2. **Google Clasp** CLI tool:
   ```bash
   npm install -g @google/clasp
   clasp login
   ```
3. **Apps Script API** enabled: https://script.google.com/home/usersettings

### 5-Minute Setup

```bash
# 1. Create "CRM Data" spreadsheet in Google Sheets (manual)

# 2. Deploy Library
cd src/library
clasp create --type standalone --title "CRM Core Library"
clasp push
clasp version "v1.0.0"

# 3. Deploy Sheet App
cd ../sheet
clasp create --type sheets --parentId "YOUR_SPREADSHEET_ID"
# Edit appsscript.json to add library ID
clasp push

# 4. Configure Script Properties (CRM_SPREADSHEET_ID)
# 5. Initialize sheets and deploy web app
```

---

## 🏗️ Architecture

**Dual-Project Architecture** (Google Workspace Best Practice):

```
┌─────────────────────────────────┐
│   Sheet-bound Web App (UI)      │
│   - index.html (Single-page)    │
│   - Code.js (API endpoints)     │
│   - Calls CrmLib functions      │
└────────────┬────────────────────┘
             │ (Library Dependency)
             ▼
┌─────────────────────────────────┐
│    Standalone Library           │
│   - Core modules                │
│   - Utilities                   │
│   - Reusable & versioned        │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Google Sheets Database        │
│   - 10 sheets with schemas      │
└─────────────────────────────────┘
```

---

## 📁 File Structure

```
crm-core-automation/
├── README.md                    # This comprehensive guide
├── .gitignore                   # Git ignore rules (excludes .clasp & appsscript files)
├── GIT-SETUP.md                 # Git configuration guide
│
├── src/
│   ├── library/                # ⭐ Standalone Library Project
│   │   ├── .clasp.template.json        # Template (copy to .clasp.json)
│   │   ├── appsscript.template.json    # Template (copy to appsscript.json)
│   │   ├── appsscript.json     # Library manifest (gitignored)
│   │   ├── core/               # Business logic modules
│   │   │   ├── init.js         # Database initialization
│   │   │   ├── auth.js         # Authentication
│   │   │   ├── users.js        # User management
│   │   │   ├── contacts.js     # Contact CRUD
│   │   │   ├── companies.js    # Company CRUD
│   │   │   ├── deals.js        # Deal CRUD
│   │   │   └── tasks.js        # Task CRUD
│   │   └── libs/               # Utility libraries
│   │       ├── uuid_lib.js     # UUID generation
│   │       ├── sheet_utils.js  # Sheet helpers
│   │       ├── validation.js   # Input validation
│   │       └── error_handler.js # Error handling
│   │
│   └── sheet/                  # ⭐ Sheet-bound Project
│       ├── appsscript.json     # Sheet manifest
│       ├── index.html          # Complete web UI
│       └── Code.js             # Server-side API
```

---

## 📝 Setup Instructions

### Step 1: Create Google Sheets Database

1. Go to [Google Sheets](https://sheets.google.com)
2. Create new spreadsheet
3. Name it: **"CRM Data"**
4. Copy the Spreadsheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/[COPY_THIS_ID]/edit
   ```

### Step 2: Deploy Library Project

```bash
cd src/library

# Create standalone Apps Script project
clasp create --type standalone --title "CRM Core Library"

# Push code to Apps Script
clasp push

# Create first version
clasp version "v1.0.0 - Initial release"

# Note the Script ID from .clasp.json
clasp open  # Opens in browser
```

**In Apps Script Editor:**
- Go to **Project Settings** → Copy **Script ID**

### Step 3: Deploy Sheet-bound Project

```bash
cd ../sheet

# Create container-bound script
clasp create --type sheets --parentId "YOUR_SPREADSHEET_ID_FROM_STEP1"
```

**Edit `appsscript.json`** - Add library dependency:

```json
{
  "timeZone": "America/New_York",
  "dependencies": {
    "libraries": [{
      "userSymbol": "CrmLib",
      "libraryId": "YOUR_LIBRARY_SCRIPT_ID_FROM_STEP2",
      "version": "1",
      "developmentMode": true
    }]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_ACCESSING",
    "access": "DOMAIN"
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar"
  ]
}
```

**Push to Apps Script:**

```bash
clasp push
clasp open
```

### Step 4: Configure Script Properties

In Apps Script Editor (sheet-bound project):

1. **Project Settings** (gear icon)
2. **Script Properties** → **Add script property**
3. Add:
   - Property: `CRM_SPREADSHEET_ID`
   - Value: Your spreadsheet ID from Step 1

### Step 5: Initialize Database

In Apps Script Editor:

1. Select `initCrmSheetsApi` from function dropdown
2. Click **Run**
3. Authorize when prompted

This creates 10 sheets:
- Meta, Users, Contacts, Companies, Deals, Tasks, Email_Log, Calendar_Events, Activity_Audit, Lists

### Step 6: Create First Admin User

1. Open "CRM Data" spreadsheet
2. Go to **Users** sheet
3. Add row:

| user_id | email | display_name | role | active | created_at | last_login |
|---------|-------|--------------|------|--------|------------|------------|
| user_001 | your.email@domain.com | Your Name | Admin | TRUE | 2025-10-11T12:00:00.000Z | |

### Step 7: Deploy Web App

In Apps Script Editor:

1. **Deploy** → **New deployment**
2. **Select type** → **Web app**
3. Configure:
   - Description: "CRM Core v1.0"
   - Execute as: `User accessing the web app`
   - Who has access: `Anyone with Google account` or `Anyone within YOUR_DOMAIN`
4. **Deploy**
5. **Copy the Web App URL**

### Step 8: Access Your CRM

1. Open the Web App URL
2. Login with email from Users sheet
3. Go to Admin → Load Demo Data (optional)

---

## 🗄️ Database Schema

### Users Sheet
| Column | Type | Description |
|--------|------|-------------|
| user_id | String (PK) | Unique identifier |
| email | String (Unique) | User email |
| display_name | String | Full name |
| role | Enum | Admin, Manager, User |
| active | Boolean | Account status |
| created_at | Timestamp | Creation date |
| last_login | Timestamp | Last login |

### Contacts Sheet
| Column | Type | Description |
|--------|------|-------------|
| contact_id | String (PK) | Unique identifier |
| owner_user_id | String (FK) | Assigned user |
| first_name | String | First name |
| last_name | String | Last name |
| email | String | Email address |
| phone | String | Phone number |
| company_id | String (FK) | Associated company |
| source | String | Lead source |
| status | Enum | New, Qualified, Customer, Lost |
| lead_score | Number | 0-100 scoring |
| tags | String | Comma-separated |
| created_at | Timestamp | Creation date |
| updated_at | Timestamp | Last update |

### Companies, Deals, Tasks, Email_Log, Calendar_Events, Activity_Audit, Lists

See full schema details in code comments.

---

## 🎨 Enhancement Guide

Your current implementation includes the foundation. Here are the enhancements to add:

### 1. Dark/Light Mode Toggle

**Add to sidebar header** (in `index.html`):

```html
<div class="sidebar-header">
  <div class="sidebar-logo">
    <i class="bi bi-rocket-takeoff"></i> CRM Core
  </div>
  <button class="theme-toggle" onclick="toggleTheme()" title="Toggle theme">
    <i class="bi bi-moon-stars" id="themeIcon"></i>
  </button>
</div>
```

**Add JavaScript** (before closing `</script>`):

```javascript
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('crm-theme', newTheme);
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.className = newTheme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
  }
}

// Load saved theme on page load
const savedTheme = localStorage.getItem('crm-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
```

**Add CSS for toggle button:**

```css
.theme-toggle {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
}

.theme-toggle:hover {
  background: var(--brand);
  color: white;
  border-color: var(--brand);
}
```

### 2. Custom Alert System

**Add CSS:**

```css
.custom-alert {
  position: fixed;
  top: 2rem;
  right: 2rem;
  min-width: 320px;
  max-width: 500px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 10px 40px var(--shadow);
  z-index: 10000;
  animation: slideInRight 0.3s ease;
  display: flex;
  align-items: start;
  gap: 1rem;
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

.custom-alert.alert-success { border-left: 4px solid var(--success); }
.custom-alert.alert-warning { border-left: 4px solid var(--warning); }
.custom-alert.alert-danger { border-left: 4px solid var(--danger); }
.custom-alert.alert-info { border-left: 4px solid var(--info); }

.alert-icon {
  width: 40px;
  height: 40px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.alert-success .alert-icon { background: rgba(16, 185, 129, 0.1); color: var(--success); }
.alert-warning .alert-icon { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
.alert-danger .alert-icon { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
.alert-info .alert-icon { background: rgba(59, 130, 246, 0.1); color: var(--info); }

.alert-content { flex: 1; }
.alert-title { font-weight: 600; font-size: 0.95rem; color: var(--text-primary); margin-bottom: 0.25rem; }
.alert-message { font-size: 0.875rem; color: var(--text-secondary); }
.alert-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}
.alert-close:hover { background: var(--bg-tertiary); color: var(--text-primary); }
```

**Add JavaScript:**

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
    <div class="alert-icon"><i class="bi ${icons[type]}"></i></div>
    <div class="alert-content">
      <div class="alert-title">${title}</div>
      <div class="alert-message">${message}</div>
    </div>
    <button class="alert-close" onclick="this.parentElement.remove()">
      <i class="bi bi-x-lg"></i>
    </button>
  `;
  
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.style.opacity = '0';
    alert.style.transform = 'translateX(100%)';
    setTimeout(() => alert.remove(), 300);
  }, 5000);
}

// Usage:
// showAlert('success', 'Contact Created', 'John Doe added successfully');
// showAlert('error', 'Failed', 'Unable to save contact');
```

### 3. Dashboard Charts with Chart.js

**Add HTML to dashboard view** (after stat cards):

```html
<div class="row g-3 mt-4">
  <div class="col-md-8">
    <div class="chart-card">
      <div class="chart-header">
        <h3 class="chart-title"><i class="bi bi-graph-up"></i> Revenue Trend</h3>
        <div class="chart-filters">
          <button class="chart-filter-btn active">Month</button>
          <button class="chart-filter-btn">Quarter</button>
          <button class="chart-filter-btn">Year</button>
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
        <h3 class="chart-title"><i class="bi bi-pie-chart"></i> Deal Distribution</h3>
      </div>
      <div class="chart-container">
        <canvas id="dealDistChart"></canvas>
      </div>
    </div>
  </div>
</div>

<div class="row g-3 mt-3">
  <div class="col-md-6">
    <div class="chart-card">
      <div class="chart-header">
        <h3 class="chart-title"><i class="bi bi-funnel"></i> Sales Pipeline</h3>
      </div>
      <div class="chart-container">
        <canvas id="pipelineChart"></canvas>
      </div>
    </div>
  </div>
  
  <div class="col-md-6">
    <div class="chart-card">
      <div class="chart-header">
        <h3 class="chart-title"><i class="bi bi-check-square"></i> Task Status</h3>
      </div>
      <div class="chart-container">
        <canvas id="taskStatusChart"></canvas>
      </div>
    </div>
  </div>
</div>
```

**Add CSS for charts:**

```css
.chart-card {
  background: var(--card-bg);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px var(--shadow);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.chart-container {
  position: relative;
  height: 300px;
}
```

**Add JavaScript:**

```javascript
function initDashboardCharts() {
  if (typeof Chart === 'undefined') return;
  
  // Revenue Chart
  const revenueCtx = document.getElementById('revenueChart');
  if (revenueCtx) {
    new Chart(revenueCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue',
          data: [45000, 52000, 48000, 61000, 58000, 67000],
          borderColor: '#6366f1',
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
              label: (ctx) => `Revenue: $${ctx.parsed.y.toLocaleString()}`
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
        labels: ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Won'],
        datasets: [{
          data: [12, 19, 8, 15, 25],
          backgroundColor: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']
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
  
  // Add similar code for pipelineChart and taskStatusChart
}

// Call in your initDashboard() function
function initDashboard() {
  loadDashboardStats();
  initDashboardCharts(); // ADD THIS
}
```

### 4. Email Composer with HTML Templates

**Replace your email view with:**

```html
<div id="view-email" class="view-section">
  <div class="page-header d-flex justify-content-between align-items-center">
    <div>
      <h1 class="page-title"><i class="bi bi-envelope"></i> Email</h1>
      <p class="page-subtitle">Compose and send emails with templates</p>
    </div>
    <button class="btn btn-primary" onclick="showEmailComposer()">
      <i class="bi bi-envelope-plus"></i> Compose Email
    </button>
  </div>

  <!-- Email Composer -->
  <div class="email-composer" id="emailComposer" style="display: none;">
    <div class="composer-header">
      <div class="mb-3">
        <label class="form-label">Template</label>
        <select class="form-select" id="emailTemplate" onchange="loadTemplate()">
          <option value="">-- Select Template --</option>
          <option value="welcome">Welcome Email</option>
          <option value="followup">Follow-up</option>
          <option value="proposal">Proposal</option>
          <option value="thankyou">Thank You</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">To</label>
        <input type="email" class="form-control" id="emailTo" placeholder="recipient@example.com">
      </div>
      <div class="mb-3">
        <label class="form-label">Subject</label>
        <input type="text" class="form-control" id="emailSubject" placeholder="Email subject">
      </div>
    </div>
    
    <div class="composer-toolbar">
      <button class="toolbar-btn" onclick="formatText('bold')"><i class="bi bi-type-bold"></i></button>
      <button class="toolbar-btn" onclick="formatText('italic')"><i class="bi bi-type-italic"></i></button>
      <button class="toolbar-btn" onclick="formatText('underline')"><i class="bi bi-type-underline"></i></button>
      <span class="toolbar-divider"></span>
      <button class="toolbar-btn" onclick="formatText('insertUnorderedList')"><i class="bi bi-list-ul"></i></button>
      <button class="toolbar-btn" onclick="formatText('insertOrderedList')"><i class="bi bi-list-ol"></i></button>
      <span class="toolbar-divider"></span>
      <button class="toolbar-btn" onclick="insertLink()"><i class="bi bi-link-45deg"></i></button>
    </div>
    
    <div contenteditable="true" class="composer-editor" id="emailBody">
      <p>Start typing your email...</p>
    </div>
    
    <div class="composer-footer">
      <button class="btn btn-secondary" onclick="closeEmailComposer()">
        <i class="bi bi-x-lg"></i> Cancel
      </button>
      <button class="btn btn-primary" onclick="sendEmail()">
        <i class="bi bi-send"></i> Send Email
      </button>
    </div>
  </div>

  <!-- Email Log -->
  <div class="data-card mt-4">
    <div class="data-card-header">
      <h3 class="data-card-title">Email Log</h3>
      <button class="btn-sm" onclick="loadEmailLog()"><i class="bi bi-arrow-clockwise"></i> Refresh</button>
    </div>
    <div class="table-container">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Direction</th>
            <th>To/From</th>
            <th>Subject</th>
            <th>Snippet</th>
          </tr>
        </thead>
        <tbody id="emailLogTable">
          <tr><td colspan="5" class="text-center">No emails yet</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
```

**Add CSS for email composer:**

```css
.email-composer {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 2rem;
}

.composer-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.composer-toolbar {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.toolbar-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.toolbar-btn:hover {
  background: var(--brand);
  color: white;
  border-color: var(--brand);
}

.toolbar-divider {
  width: 1px;
  background: var(--border-color);
  margin: 0 0.5rem;
}

.composer-editor {
  min-height: 300px;
  padding: 1.5rem;
  font-family: inherit;
  font-size: 0.9rem;
  color: var(--text-primary);
  background: var(--bg-primary);
  border: none;
  outline: none;
  resize: vertical;
  width: 100%;
}

.composer-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
  display: flex;
  justify-content: space-between;
}
```

**Add JavaScript:**

```javascript
const emailTemplates = {
  welcome: {
    subject: 'Welcome to {{company}}!',
    body: '<p>Hi {{first_name}},</p><p>Welcome to {{company}}!</p>'
  },
  followup: {
    subject: 'Following up',
    body: '<p>Hi {{first_name}},</p><p>Just following up on our conversation...</p>'
  },
  proposal: {
    subject: 'Proposal for {{company}}',
    body: '<p>Hi {{first_name}},</p><p>Please find our proposal attached...</p>'
  },
  thankyou: {
    subject: 'Thank you!',
    body: '<p>Hi {{first_name}},</p><p>Thank you for your business!</p>'
  }
};

function showEmailComposer() {
  document.getElementById('emailComposer').style.display = 'block';
}

function closeEmailComposer() {
  document.getElementById('emailComposer').style.display = 'none';
}

function loadTemplate() {
  const key = document.getElementById('emailTemplate').value;
  if (!key) return;
  const template = emailTemplates[key];
  document.getElementById('emailSubject').value = template.subject;
  document.getElementById('emailBody').innerHTML = template.body;
}

function formatText(cmd) {
  document.execCommand(cmd, false, null);
}

function insertLink() {
  const url = prompt('Enter URL:');
  if (url) document.execCommand('createLink', false, url);
}

function sendEmail() {
  const to = document.getElementById('emailTo').value;
  const subject = document.getElementById('emailSubject').value;
  const body = document.getElementById('emailBody').innerHTML;
  
  if (!to || !subject) {
    showAlert('warning', 'Missing Fields', 'Please fill in recipient and subject');
    return;
  }
  
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
    .sendEmailApi({ to: to, subject: subject, htmlBody: body });
}

function loadEmailLog() {
  google.script.run
    .withSuccessHandler(function(resp) {
      const tbody = document.getElementById('emailLogTable');
      tbody.innerHTML = '';
      if (!resp.rows || resp.rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No emails yet</td></tr>';
        return;
      }
      resp.rows.forEach(function(email) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${new Date(email.timestamp).toLocaleString()}</td>
          <td><span class="badge badge-primary">${email.direction}</span></td>
          <td>${email.direction === 'Outbound' ? email.to : email.from}</td>
          <td>${email.subject}</td>
          <td>${email.snippet}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .listEmailLogApi({page: 1, pageSize: 20});
}
```

### 5. Code.js - Add Email APIs

**Add these functions to Code.js:**

```javascript
// ===== EMAIL API =====

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

// ===== CALENDAR API =====

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
    
    return { success: true, event_id: newId };
  } catch (error) {
    console.error('saveCalendarEventApi error:', error);
    return { success: false, error: error.message };
  }
}
```

### 6. Replace Emoji Icons with Bootstrap Icons

**Find and replace in your navigation:**

```html
<!-- Old -->
<span class="nav-icon">📊</span> Dashboard

<!-- New -->
<i class="bi bi-graph-up"></i> Dashboard
```

**Icon Mapping:**
- 📊 Dashboard → `<i class="bi bi-graph-up"></i>`
- 👥 Contacts → `<i class="bi bi-people"></i>`
- 🏢 Companies → `<i class="bi bi-building"></i>`
- 💼 Deals → `<i class="bi bi-briefcase"></i>`
- ✅ Tasks → `<i class="bi bi-check-square"></i>`
- 📧 Email → `<i class="bi bi-envelope"></i>`
- 📈 Reports → `<i class="bi bi-bar-chart"></i>`
- ⚙️ Admin → `<i class="bi bi-gear"></i>`

---

## 🔌 API Reference

### Dashboard
```javascript
getStatsApi() // Returns: { contacts, companies, openDeals, totalDealValue, pendingTasks }
```

### Contacts
```javascript
listContactsApi({page: 1, pageSize: 10})
getContactApi(contactId)
saveContactApi(contactObject)
```

### Companies
```javascript
listCompaniesApi({page: 1, pageSize: 10})
getCompanyApi(companyId)
saveCompanyApi(companyObject)
```

### Deals
```javascript
listDealsApi({page: 1, pageSize: 10})
getDealApi(dealId)
saveDealApi(dealObject)
```

### Tasks
```javascript
listTasksApi({page: 1, pageSize: 10})
getTaskApi(taskId)
saveTaskApi(taskObject)
```

### Users
```javascript
listUsersApi({page: 1, pageSize: 100})
saveUserApi(userObject)
```

### Email (NEW)
```javascript
sendEmailApi({ to, subject, htmlBody })
listEmailLogApi({page: 1, pageSize: 20})
```

### Calendar (NEW)
```javascript
listCalendarEventsApi({})
saveCalendarEventApi({ title, start_time, end_time, attendees, createInGCal })
```

### System
```javascript
initCrmSheetsApi() // Initialize database schema
initDemoDataApi()  // Load demo data
loginUser(email, password)
```

---

## 🔧 Troubleshooting

### "Library not found" Error

**Solution:**
```bash
cd src/library
clasp versions  # Check versions
clasp version "v1.0.0"  # Create if needed
```

Verify `libraryId` in `src/sheet/appsscript.json` matches library Script ID.

### "Unauthorized" Error

**Solution:**
1. Open CRM Data spreadsheet → Users sheet
2. Verify your email exists with `active=TRUE`
3. Check role is correct (Admin, Manager, User)

### Changes Not Reflecting

**Library:**
```bash
cd src/library
clasp push
```

**Sheet:**
```bash
cd src/sheet
clasp push
```

May need new deployment for web app changes.

### OAuth Authorization Issues

**Solution:**
1. Add missing scope to `appsscript.json`
2. Run `clasp push`
3. Reauthorize when prompted

### Charts Not Showing

**Solution:**
- Verify Chart.js CDN loaded
- Check browser console for errors
- Verify canvas element IDs
- Test with sample data first

### Email Won't Send

**Solution:**
- Verify Gmail scope in `appsscript.json`
- Authorize Gmail permissions
- Check quota limits
- Verify recipient email format

### Icons Showing as Squares

**Solution:**
- Verify Bootstrap Icons CDN loaded
- Clear browser cache
- Check icon class names (bi bi-icon-name)

---

## 📚 Best Practices

### Security
- ✅ Use `executeAs: USER_ACCESSING` not `USER_DEPLOYING`
- ✅ Restrict access to domain when possible
- ✅ Validate all user inputs
- ✅ Log all data modifications

### Performance
- ✅ Batch sheet operations (`setValues` not `setValue` in loops)
- ✅ Cache frequently accessed data
- ✅ Use pagination for large datasets
- ✅ Minimize API calls

### Development
- ✅ Use `developmentMode: true` during development
- ✅ Create library versions for production
- ✅ Test in development before production
- ✅ Keep code in version control (Git)

### Code Quality
- ✅ Use namespace pattern in library
- ✅ Handle errors with try/catch
- ✅ Use structured logging
- ✅ Document complex logic
- ✅ Follow consistent naming conventions

---

## 🛠️ Development Workflow

### Making Changes

```bash
# Pull latest
cd src/library  # or src/sheet
clasp pull

# Make changes locally

# Push changes
clasp push

# Watch for changes (auto-push)
clasp push --watch
```

### Library Versioning

**Development:**
```json
{
  "libraryId": "SCRIPT_ID",
  "developmentMode": true
}
```

**Production:**
```bash
cd src/library
clasp version "v1.1.0 - Feature description"
```

Update sheet `appsscript.json`:
```json
{
  "libraryId": "SCRIPT_ID",
  "version": "2",
  "developmentMode": false
}
```

---

## 📊 Feature Comparison

| Feature | Basic | Enhanced |
|---------|-------|----------|
| Contact Management | ✅ | ✅ |
| Company Management | ✅ | ✅ |
| Deal Pipeline | ✅ | ✅ |
| Task Management | ✅ | ✅ |
| User Management | ✅ | ✅ |
| Dark/Light Mode | ❌ | ✅ |
| Custom Alerts | ❌ | ✅ |
| Dashboard Charts | ❌ | ✅ |
| Email Composer | ❌ | ✅ |
| HTML Templates | ❌ | ✅ |
| Calendar Integration | ❌ | ✅ |
| Bootstrap Icons | ❌ | ✅ |
| Modern Branding | ❌ | ✅ |

---

## 🎨 Design System

### Color Palette

**Brand Colors:**
```
Primary: #6366f1 (Indigo)
Secondary: #8b5cf6 (Violet)
Gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

**Semantic Colors:**
```
Success: #10b981 (Green)
Warning: #f59e0b (Amber)
Danger: #ef4444 (Red)
Info: #3b82f6 (Blue)
```

**Theme Colors:**
```
Light Mode:
  - Background: #ffffff, #f8fafc, #f1f5f9
  - Text: #1e293b, #64748b, #94a3b8
  - Border: #e2e8f0

Dark Mode:
  - Background: #0f172a, #1e293b, #334155
  - Text: #f1f5f9, #cbd5e1, #94a3b8
  - Border: #334155
```

### Typography
- **Font:** Inter, system fonts fallback
- **Headings:** 2rem (page title), 1.25rem (card title)
- **Body:** 0.9rem
- **Small:** 0.85rem

### Spacing
- **Gap:** 0.25rem (gap-1), 0.5rem (gap-2), 1rem (gap-3), 1.5rem (gap-4)
- **Padding:** 1rem (cards), 1.5rem (modals)
- **Border Radius:** 0.75rem (cards), 1rem (modals)

---

## 📈 Roadmap

### Completed ✅
- Core CRM features (Contacts, Companies, Deals, Tasks)
- User management with roles
- Modern UI with dark mode
- Custom alert system
- Dashboard charts
- Email composer with templates
- Bootstrap Icons
- Responsive design

### Planned 🚧
- Advanced filtering and saved views
- Bulk import/export (CSV)
- Email campaigns
- Custom fields
- Mobile Progressive Web App
- Integration APIs (Zapier, Make)
- Workflow automation
- Advanced reporting

---

## 🔐 Git & Version Control

### Gitignore Setup

The `.gitignore` file is configured to exclude sensitive files:

**Excluded (NOT committed):**
- ❌ `.clasp.json` - Contains script IDs
- ❌ `appsscript.json` - Contains library IDs and project settings
- ❌ `.clasprc.json` - Contains OAuth authentication tokens
- ❌ `node_modules/` - NPM dependencies

**Included (Committed):**
- ✅ `.clasp.template.json` - Template for .clasp.json
- ✅ `appsscript.template.json` - Template for appsscript.json
- ✅ All source code (.js, .html files)
- ✅ Documentation (.md files)

### First-Time Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd crm-core-automation

# 2. Create configuration files from templates
cd src/library
cp .clasp.template.json .clasp.json
cp appsscript.template.json appsscript.json

cd ../sheet
cp .clasp.template.json .clasp.json
cp appsscript.template.json appsscript.json

# 3. Edit files with your script IDs
# 4. Never commit the actual .clasp.json or appsscript.json files
```

**Full guide:** See [GIT-SETUP.md](./GIT-SETUP.md)

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch
3. Copy template files to create your configs
4. Make changes
5. Test thoroughly
6. Submit pull request (excluding .clasp.json and appsscript.json)
7. Update documentation

---

## 📞 Support

### Documentation
- This README (complete guide)
- Code comments (inline documentation)
- Apps Script docs: https://developers.google.com/apps-script

### Community
- Stack Overflow: `google-apps-script` tag
- Google Apps Script Community
- GitHub Issues

---

## 📄 License

Open Source - MIT License

---

## 🎉 Credits

Built with ❤️ for SMBs who need enterprise CRM without enterprise costs.

**Technologies:**
- Google Apps Script
- Google Sheets
- Bootstrap 5.3
- Bootstrap Icons 1.11
- Chart.js 4.4
- Modern JavaScript (ES6+)

---

## 🔗 Quick Links

- **Setup Guide:** See [Setup Instructions](#-setup-instructions)
- **Enhancement Guide:** See [Enhancement Guide](#-enhancement-guide)
- **API Reference:** See [API Reference](#-api-reference)
- **Troubleshooting:** See [Troubleshooting](#-troubleshooting)

---

**Last Updated:** October 11, 2025  
**Version:** 2.0 Enhanced Edition  

---

**🚀 Ready to build your modern CRM? Follow the setup instructions above!**

*Questions? Check the troubleshooting section or refer to inline code comments.*
