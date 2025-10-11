# CRM Core Automation - Complete Implementation Guide
**Modern CRM for SMBs | Google Apps Script + Google Sheets**

Version: 2.0 Enhanced Edition

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Quick Start](#quick-start)
5. [Step-by-Step Setup](#step-by-step-setup)
6. [File Structure](#file-structure)
7. [Configuration](#configuration)
8. [Database Schema](#database-schema)
9. [API Endpoints](#api-endpoints)
10. [UI Features](#ui-features)
11. [Development Workflow](#development-workflow)
12. [Troubleshooting](#troubleshooting)
13. [Best Practices](#best-practices)

---

## 🎯 Overview

**CRM Core Automation** is a full-featured Customer Relationship Management system built specifically for Small and Medium Businesses (SMBs) using Google Apps Script and Google Sheets as the database. This solution provides enterprise-level CRM features without the enterprise price tag.

### Why This CRM?

- ✅ **Zero Infrastructure Cost** - Runs on Google Workspace
- ✅ **Modern UI/UX** - Dark/Light mode, responsive design
- ✅ **Full-Featured** - Contacts, Companies, Deals, Tasks, Email, Calendar
- ✅ **Customizable** - Open source, modify as needed
- ✅ **Secure** - Role-based access control, audit logging
- ✅ **Data Ownership** - Your data stays in your Google Drive

---

## ✨ Features

### Core CRM Features

#### 📇 Contact Management
- Complete contact profiles with custom fields
- Lead scoring and status tracking
- Company associations
- Activity history
- Bulk import/export

#### 🏢 Company Management
- Company profiles with industry classification
- Website and contact information
- Associated contacts and deals
- Activity tracking

#### 💼 Deal Pipeline
- Customizable deal stages
- Probability tracking
- Amount and currency support
- Win/loss tracking
- Pipeline visualization with charts

#### ✅ Task Management
- Task assignment and tracking
- Priority levels (High, Medium, Low)
- Due dates and reminders
- Related entity linking
- Status workflow

#### 📧 Email Integration
- Email logging and tracking
- HTML email composer with templates
- Thread tracking
- Contact association
- Email analytics

#### 📅 Calendar Events
- Event creation and tracking
- Google Calendar integration
- Attendee management
- Related entity linking

###  Enhanced UI/UX Features

#### 🎨 Modern Interface
- **Dark/Light Mode Toggle** - Accessibility-first design
- **Branded Gradient Theme** - Professional purple gradient branding
- **Modern Icons** - Bootstrap Icons for better UX
- **Responsive Design** - Works on desktop, tablet, mobile
- **Smooth Animations** - Professional transitions and effects

#### 📊 Dashboard & Analytics
- **Interactive Charts** (Chart.js)
  - Sales pipeline funnel
  - Revenue trends
  - Deal stage distribution
  - Task completion rates
  - Contact growth over time
- **Real-time Statistics Cards**
  - Total contacts with growth indicators
  - Active companies
  - Open deals value
  - Pending tasks
- **Quick Actions Panel**
- **Recent Activity Feed**

#### 🔔 Custom Alert System
- **Beautiful Toast Notifications**
  - Success messages (green)
  - Warning alerts (yellow)
  - Error notifications (red)
  - Info messages (blue)
- **Auto-dismiss** with manual close option
- **Icon-based** visual feedback
- **Slide-in animations**

#### ✉️ Email Composer
- **Rich Text Editor** with formatting toolbar
  - Bold, italic, underline
  - Lists (bullet, numbered)
  - Links and images
  - Text alignment
- **HTML Template System**
  - Pre-built templates
  - Custom template creation
  - Variable substitution
  - Preview mode
- **Recipient Management**
  - To, CC, BCC fields
  - Contact picker
  - Group selection

### Administration Features

#### 👥 User Management
- Role-based access control (Admin, Manager, User)
- Active/inactive user status
- Last login tracking
- Permission management

#### 🔧 System Administration
- One-click sheet initialization
- Demo data loader
- System configuration
- Audit log viewer

#### 📈 Reporting
- Export to CSV/Excel
- Custom report builder
- Scheduled reports
- Dashboard widgets

---

## 🏗️ Architecture

This project follows Google Workspace best practices with a **dual-project architecture**:

```
┌─────────────────────────────────────┐
│     Sheet-bound Web App (UI)       │
│  - index.html (Single-page app)    │
│  - Code.js (API endpoints)          │
│  - Calls CrmLib functions           │
└──────────────┬──────────────────────┘
               │
               │ (Library Dependency)
               │
┌──────────────▼──────────────────────┐
│      Standalone Library             │
│  - Core modules (contacts, deals)   │
│  - Utility functions (UUID, etc)    │
│  - Reusable across projects         │
│  - Version controlled               │
└─────────────────────────────────────┘
               │
               │
┌──────────────▼──────────────────────┐
│        Google Sheets Database       │
│  - Users, Contacts, Companies       │
│  - Deals, Tasks, Email_Log          │
│  - Calendar_Events, Audit_Trail     │
└─────────────────────────────────────┘
```

### Why This Architecture?

1. **Separation of Concerns** - Business logic separate from UI
2. **Reusability** - Library can be used in multiple projects
3. **Maintainability** - Update library once, all projects benefit
4. **Testing** - Library functions can be tested independently
5. **Version Control** - Production uses stable versions, dev uses latest

---

## 🚀 Quick Start

### Prerequisites

1. **Google Account** with Google Workspace (or personal Gmail)
2. **Google Clasp** CLI tool
   ```bash
   npm install -g @google/clasp
   ```
3. **Apps Script API** enabled: https://script.google.com/home/usersettings

### 5-Minute Setup

```bash
# 1. Clone or download this repository
cd crm-core-automation

# 2. Login to Google via Clasp
clasp login

# 3. Create Google Sheets document
# (Do this manually in Google Drive, name it "CRM Data")

# 4. Deploy Library
cd src/library
clasp create --type standalone --title "CRM Core Library"
clasp push
clasp version "v1.0.0"
# Note the Script ID from .clasp.json

# 5. Deploy Sheet-bound App
cd ../sheet
clasp create --type sheets --parentId "YOUR_SPREADSHEET_ID"
# Edit appsscript.json to add library ID
clasp push

# 6. Configure and Initialize
# Open Apps Script editor: clasp open
# Set CRM_SPREADSHEET_ID in Script Properties
# Run initCrmSheetsApi() to create sheets

# 7. Deploy Web App
# In Apps Script: Deploy > New deployment > Web app
# Copy the URL and access your CRM!
```

---

## 📝 Step-by-Step Setup

### Step 1: Create Google Sheets Database

1. Go to [Google Sheets](https://sheets.google.com)
2. Create new spreadsheet
3. Name it: **"CRM Data"**
4. Copy the Spreadsheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/[COPY_THIS_ID]/edit
   ```
5. Save this ID - you'll need it later

### Step 2: Deploy Library Project

The library contains all business logic and can be reused across multiple projects.

```bash
cd src/library

# Create standalone Apps Script project
clasp create --type standalone --title "CRM Core Library"

# This creates .clasp.json with your script ID
# Example: {"scriptId":"SCRIPT_ID_HERE","rootDir":"./"}

# Push code to Apps Script
clasp push

# Create first version
clasp version "v1.0.0 - Initial release"

# View versions
clasp versions

# Open in browser to verify
clasp open
```

**In the Apps Script Editor:**
1. Go to **Project Settings** (gear icon)
2. Copy the **Script ID** - you'll need this for the sheet-bound project
3. Verify all files uploaded correctly

### Step 3: Deploy Sheet-bound Project

The sheet-bound project contains the web UI and API endpoints.

```bash
cd ../sheet

# Create container-bound script attached to your spreadsheet
clasp create --type sheets --parentId "YOUR_SPREADSHEET_ID_FROM_STEP1"

# This creates .clasp.json
```

**Edit `appsscript.json`:**

```json
{
  "timeZone": "America/New_York",
  "dependencies": {
    "libraries": [
      {
        "userSymbol": "CrmLib",
        "libraryId": "YOUR_LIBRARY_SCRIPT_ID_FROM_STEP2",
        "version": "1",
        "developmentMode": true
      }
    ]
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

In the Apps Script editor for the **sheet-bound project**:

1. Click **Project Settings** (gear icon)
2. Scroll to **Script Properties**
3. Click **Add script property**
4. Add:
   - **Property:** `CRM_SPREADSHEET_ID`
   - **Value:** Your spreadsheet ID from Step 1

### Step 5: Initialize Database Schema

Option A: **Via Apps Script Editor**

1. In the editor, select `initCrmSheetsApi` from function dropdown
2. Click **Run**
3. Authorize the script when prompted
4. Check execution log for success

Option B: **Via Debug Console**

```javascript
// Run in Apps Script debugger
function testInit() {
  const result = initCrmSheetsApi();
  Logger.log(result);
}
```

**This creates 10 sheets:**
- Meta (configuration)
- Users
- Contacts
- Companies
- Deals
- Tasks
- Email_Log
- Calendar_Events
- Activity_Audit
- Lists (saved filters)

### Step 6: Create First Admin User

1. Open your "CRM Data" spreadsheet
2. Go to **Users** sheet
3. Add a row with your data:

| user_id | email | display_name | role | active | created_at | last_login |
|---------|-------|--------------|------|--------|------------|------------|
| user_001 | your.email@domain.com | Your Name | Admin | TRUE | 2025-10-11T12:00:00.000Z | |

### Step 7: Deploy Web App

In the Apps Script editor:

1. Click **Deploy** → **New deployment**
2. Click **Select type** → **Web app**
3. Configure:
   - **Description:** "CRM Core v1.0"
   - **Execute as:** `User accessing the web app`
   - **Who has access:** 
     - `Anyone with Google account` (public)
     - `Anyone within YOUR_DOMAIN` (for Workspace)
4. Click **Deploy**
5. **Copy the Web App URL**
6. Authorize permissions when prompted

### Step 8: Access Your CRM

1. Open the Web App URL in your browser
2. Log in with the email you added to Users sheet
3. Explore the interface!

**Optional: Load Demo Data**

1. In the app, go to **Admin** section
2. Click **Load Demo Data**
3. This creates sample:
   - 3 Companies
   - 3 Contacts
   - 2 Deals
   - 2 Tasks

---

## 📁 File Structure

```
crm-core-automation/
├── README-COMPLETE.md         # This file - complete guide
├── .gitignore                 # Git ignore rules
│
├── src/
│   ├── library/               # ⭐ Standalone Library Project
│   │   ├── appsscript.json    # Library manifest with OAuth scopes
│   │   ├── .clasp.json        # Clasp configuration (gitignored)
│   │   │
│   │   ├── core/              # Core business logic modules
│   │   │   ├── init.js        # Database initialization
│   │   │   ├── auth.js        # Authentication & authorization
│   │   │   ├── users.js       # User management CRUD
│   │   │   ├── contacts.js    # Contact management CRUD
│   │   │   ├── companies.js   # Company management CRUD
│   │   │   ├── deals.js       # Deal pipeline CRUD
│   │   │   └── tasks.js       # Task management CRUD
│   │   │
│   │   └── libs/              # Utility libraries
│   │       ├── uuid_lib.js    # UUID v4 generation
│   │       ├── sheet_utils.js # Sheet operations helpers
│   │       ├── validation.js  # Input validation functions
│   │       └── error_handler.js # Error handling & logging
│   │
│   └── sheet/                 # ⭐ Sheet-bound Project (Web App)
│       ├── appsscript.json    # Sheet manifest (includes library dependency)
│       ├── .clasp.json        # Clasp configuration (gitignored)
│       ├── Code.js            # Server-side API endpoints
│       └── index.html         # Single-file web application
│
└── docs/                      # Documentation (optional)
    ├── API.md                 # API endpoint documentation
    ├── SCHEMA.md              # Database schema details
    └── DEVELOPMENT.md         # Development guide
```

### Key Files Explained

#### `src/library/appsscript.json`
Library manifest defining OAuth scopes and runtime:
- Minimum scopes for library functions
- V8 runtime enabled
- Stackdriver logging

#### `src/library/core/*.js`
Business logic modules using namespace pattern:
```javascript
var CrmLib = (function(ns) {
  const self = ns || {};
  
  self.functionName = function(params) {
    // Implementation
  };
  
  return self;
})(typeof CrmLib !== 'undefined' ? CrmLib : {});
```

#### `src/sheet/Code.js`
Thin API wrapper calling library functions:
```javascript
function listContactsApi(params) {
  try {
    const spreadsheetId = getCrmSheetId();
    // ... implementation calling CrmLib
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

#### `src/sheet/index.html`
Complete single-page web application:
- Embedded CSS (theme system, responsive design)
- HTML structure (login, dashboard, all CRM views)
- JavaScript (SPA router, API calls via google.script.run)

---

## ⚙️ Configuration

### OAuth Scopes

**Library Scopes** (`src/library/appsscript.json`):
```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/userinfo.email"
  ]
}
```

**Sheet-bound Scopes** (`src/sheet/appsscript.json`):
```json
{
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

### Web App Security

```json
{
  "webapp": {
    "executeAs": "USER_ACCESSING",
    "access": "DOMAIN"
  }
}
```

**Execute As Options:**
- `USER_ACCESSING` ✅ Recommended - Runs with user's permissions
- `USER_DEPLOYING` ⚠️ Runs with owner's permissions (security risk)

**Access Options:**
- `MYSELF` - Only you can access
- `DOMAIN` ✅ Recommended - Anyone in your Google Workspace
- `ANYONE` - Anyone with link (requires Google sign-in)
- `ANYONE_ANONYMOUS` - No authentication (not recommended)

### Script Properties

Set in: Apps Script Editor → Project Settings → Script Properties

| Property | Value | Required |
|----------|-------|----------|
| `CRM_SPREADSHEET_ID` | Your Google Sheets ID | Yes |
| `ENABLE_DEBUG_LOGGING` | `true` or `false` | No |
| `DEFAULT_TIMEZONE` | e.g., `America/New_York` | No |

---

## 🗄️ Database Schema

### Users Sheet

Stores user accounts with role-based access control.

| Column | Type | Description |
|--------|------|-------------|
| user_id | String (PK) | Unique identifier (UUID) |
| email | String (Unique) | User's email address |
| display_name | String | Full name for display |
| role | Enum | Admin, Manager, User |
| active | Boolean | Account status |
| created_at | Timestamp | Account creation date |
| last_login | Timestamp | Last successful login |

**Roles:**
- **Admin** - Full system access, user management
- **Manager** - View all data, limited admin functions
- **User** - View/edit own records only

### Contacts Sheet

Central contact database with lead scoring.

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
| tags | String | Comma-separated tags |
| created_at | Timestamp | Record creation |
| updated_at | Timestamp | Last modification |

### Companies Sheet

Organization records.

| Column | Type | Description |
|--------|------|-------------|
| company_id | String (PK) | Unique identifier |
| name | String | Company name |
| industry | String | Industry classification |
| website | String | Company website |
| phone | String | Main phone number |
| address | Text | Full address |
| owner_user_id | String (FK) | Assigned user |
| created_at | Timestamp | Record creation |
| updated_at | Timestamp | Last modification |

### Deals Sheet

Sales pipeline and opportunity tracking.

| Column | Type | Description |
|--------|------|-------------|
| deal_id | String (PK) | Unique identifier |
| title | String | Deal name/title |
| company_id | String (FK) | Associated company |
| primary_contact_id | String (FK) | Main contact |
| owner_user_id | String (FK) | Deal owner |
| pipeline | String | Pipeline name |
| stage | Enum | Prospect, Qualified, Proposal, Negotiation, Closed Won/Lost |
| amount | Number | Deal value |
| currency | String | USD, EUR, etc. |
| close_date | Date | Expected close date |
| probability | Number | 0-100% win probability |
| status | Enum | Open, Won, Lost |
| created_at | Timestamp | Deal creation |
| updated_at | Timestamp | Last modification |

### Tasks Sheet

Task and activity tracking.

| Column | Type | Description |
|--------|------|-------------|
| task_id | String (PK) | Unique identifier |
| subject | String | Task title |
| description | Text | Detailed description |
| related_type | String | Contact, Company, Deal |
| related_id | String (FK) | Related entity ID |
| owner_user_id | String (FK) | Assigned user |
| due_date | Date | Due date |
| priority | Enum | Low, Medium, High |
| status | Enum | Pending, In Progress, Completed |
| reminder_sent | Boolean | Email reminder status |
| created_at | Timestamp | Task creation |
| updated_at | Timestamp | Last modification |

### Email_Log Sheet

Email communication tracking.

| Column | Type | Description |
|--------|------|-------------|
| email_log_id | String (PK) | Unique identifier |
| direction | Enum | Inbound, Outbound |
| from | String | Sender email |
| to | String | Recipient email(s) |
| subject | String | Email subject |
| snippet | Text | First 200 chars of body |
| thread_id | String | Email thread ID |
| related_id | String (FK) | Related contact/company/deal |
| message_id | String | Gmail message ID |
| timestamp | Timestamp | Send/receive time |

### Calendar_Events Sheet

Calendar integration tracking.

| Column | Type | Description |
|--------|------|-------------|
| event_id | String (PK) | Unique identifier |
| title | String | Event title |
| start_time | Timestamp | Event start |
| end_time | Timestamp | Event end |
| attendees | String | Comma-separated emails |
| related_id | String (FK) | Related entity |
| created_by | String (FK) | User who created |
| gcal_event_id | String | Google Calendar event ID |
| created_at | Timestamp | Record creation |

### Activity_Audit Sheet

Comprehensive audit trail.

| Column | Type | Description |
|--------|------|-------------|
| audit_id | String (PK) | Unique identifier |
| entity_type | String | Contact, Deal, etc. |
| entity_id | String (FK) | Entity identifier |
| action | Enum | CREATE, UPDATE, DELETE, VIEW |
| user_id | String (FK) | User who performed action |
| timestamp | Timestamp | When action occurred |
| notes | Text | Additional context |

---

## 🔌 API Endpoints

All API endpoints are defined in `src/sheet/Code.js` and call library functions.

### Authentication

#### `loginUser(email, password)`

Authenticate user and return profile.

**Parameters:**
- `email` (string) - User email
- `password` (string) - User password (currently bypassed for demo)

**Returns:**
```json
{
  "email": "user@example.com",
  "display_name": "John Doe",
  "role": "Admin",
  "active": true
}
```

### Dashboard

#### `getStatsApi()`

Get dashboard statistics.

**Returns:**
```json
{
  "contacts": 45,
  "companies": 12,
  "openDeals": 8,
  "totalDealValue": 125000,
  "pendingTasks": 15
}
```

### Contacts

#### `listContactsApi(params)`

List contacts with pagination.

**Parameters:**
```javascript
{
  page: 1,
  pageSize: 10,
  filters: { email: "search_term" } // optional
}
```

**Returns:**
```json
{
  "rows": [
    {
      "contact_id": "cont_uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "555-0123",
      "company_id": "comp_uuid",
      "status": "Qualified",
      "created_at": "2025-10-01T10:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 10
}
```

#### `getContactApi(contactId)`

Get single contact by ID.

**Parameters:**
- `contactId` (string)

**Returns:** Contact object or `null`

#### `saveContactApi(contact)`

Create or update contact.

**Parameters:**
```javascript
{
  contact_id: "cont_uuid", // omit for new
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  phone: "555-0123",
  company_id: "comp_uuid"
}
```

**Returns:**
```json
{
  "success": true,
  "contact_id": "cont_uuid"
}
```

### Companies

#### `listCompaniesApi(params)`

List companies with pagination.

#### `getCompanyApi(companyId)`

Get single company by ID.

#### `saveCompanyApi(company)`

Create or update company.

### Deals

#### `listDealsApi(params)`

List deals with pagination.

#### `getDealApi(dealId)`

Get single deal by ID.

#### `saveDealApi(deal)`

Create or update deal.

### Tasks

#### `listTasksApi(params)`

List tasks with pagination.

#### `getTaskApi(taskId)`

Get single task by ID.

#### `saveTaskApi(task)`

Create or update task.

### Users

#### `listUsersApi(params)`

List users (Admin only).

#### `saveUserApi(user)`

Create or update user (Admin only).

### System

#### `initCrmSheetsApi()`

Initialize database schema.

**Returns:**
```json
{
  "success": true
}
```

#### `initDemoDataApi()`

Load demo data.

**Returns:**
```json
{
  "success": true,
  "counts": {
    "companies": 3,
    "contacts": 3,
    "deals": 2,
    "tasks": 2
  }
}
```

---

## 🎨 UI Features

### Dark/Light Mode Toggle

**Location:** Sidebar header

**Usage:**
- Click theme toggle button to switch modes
- Preference saved in localStorage
- Applies to all pages instantly

**Implementation:**
```javascript
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}
```

### Custom Alert System

**Types:**
- **Success** (green) - Operation successful
- **Warning** (yellow) - Caution needed
- **Error** (red) - Operation failed
- **Info** (blue) - General information

**Usage:**
```javascript
showAlert('success', 'Contact Created', 'John Doe has been added successfully');
showAlert('error', 'Failed', 'Unable to save contact');
showAlert('warning', 'Warning', 'Duplicate email detected');
showAlert('info', 'Info', 'Remember to follow up');
```

**Features:**
- Auto-dismiss after 5 seconds
- Manual close button
- Slide-in animation
- Icon-based visual feedback
- Stacks multiple alerts

### Dashboard Charts

**Chart Types:**

1. **Sales Pipeline (Funnel Chart)**
   - Shows deal progression through stages
   - Color-coded by stage
   - Interactive tooltips

2. **Revenue Trend (Line Chart)**
   - Monthly revenue over time
   - Forecast line
   - Data points on hover

3. **Deal Distribution (Doughnut Chart)**
   - Deals by stage
   - Percentage breakdown
   - Clickable segments

4. **Task Status (Bar Chart)**
   - Pending vs completed tasks
   - By priority level
   - Horizontal bars

**Chart Configuration:**
- Responsive sizing
- Theme-aware colors (dark/light mode)
- Interactive legends
- Export to PNG
- Time period filters (Week, Month, Quarter, Year)

### Email Composer

**Features:**
- Rich text editing toolbar
- HTML template selection
- Variable substitution `{{first_name}}`, `{{company}}`, etc.
- Preview mode
- Send to contacts/groups
- Attachment support (via Gmail API)

**Template System:**
```javascript
const templates = {
  welcome: {
    subject: 'Welcome to {{company}}',
    body: '<p>Hi {{first_name}},</p><p>Welcome aboard!</p>'
  },
  followup: {
    subject: 'Following up on our conversation',
    body: '<p>Hi {{first_name}},</p><p>Just wanted to follow up...</p>'
  }
};
```

**Usage:**
1. Click "Compose Email" button
2. Select template (optional)
3. Fill in recipient(s)
4. Edit content with toolbar
5. Send via Gmail API

---

## 💻 Development Workflow

### Local Development

```bash
# Pull latest from Apps Script
cd src/library  # or src/sheet
clasp pull

# Make changes locally

# Push changes
clasp push

# Watch for changes (auto-push)
clasp push --watch

# Open in browser
clasp open
```

### Library Versioning

**Development Mode** (changes reflect immediately):
```json
{
  "libraryId": "SCRIPT_ID",
  "developmentMode": true
}
```

**Production Mode** (use stable versions):

1. Create version:
```bash
cd src/library
clasp version "v1.1.0 - Added email templates"
```

2. Update sheet-bound `appsscript.json`:
```json
{
  "libraryId": "SCRIPT_ID",
  "version": "2",
  "developmentMode": false
}
```

3. Push changes:
```bash
cd src/sheet
clasp push
```

### Testing

#### Manual Testing
1. Use Apps Script editor debugger
2. Add breakpoints
3. Inspect variables
4. Check logs

#### Unit Testing
```javascript
function testContactCreation() {
  const spreadsheetId = getCrmSheetId();
  const contact = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com'
  };
  
  const result = CrmLib.createContact(spreadsheetId, contact);
  console.log('Test result:', result);
  
  if (!result.success) {
    throw new Error('Contact creation failed');
  }
}
```

### Debugging

**View Logs:**
1. Apps Script Editor → **Executions** tab
2. Filter by:
   - Status (Success/Failed)
   - Date range
   - User
   - Function name

**Common Issues:**
- Check OAuth authorization
- Verify Script Properties set
- Confirm library version
- Review quota usage

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/email-templates

# Make changes
# Test locally with clasp

# Commit changes
git add .
git commit -m "Add email template system"

# Push to remote
git push origin feature/email-templates

# Create pull request
# After approval, merge to main
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Library not found" Error

**Cause:** Library not deployed or incorrect script ID

**Solution:**
```bash
cd src/library
clasp versions  # Check if versions exist
clasp version "v1.0.0"  # Create version if needed
```

Verify `libraryId` in `src/sheet/appsscript.json` matches library Script ID.

#### 2. "Unauthorized" Error

**Cause:** User not in Users sheet or inactive

**Solution:**
1. Open CRM Data spreadsheet → `Users` sheet
2. Verify your email exists with `active=TRUE` and appropriate role
3. Check role spelling (Admin, Manager, User - case sensitive)

#### 3. Changes Not Reflecting

**Library changes:**
```bash
cd src/library
clasp push
```

If using `developmentMode: false`, create new version:
```bash
clasp version "Description"
```

**Sheet changes:**
```bash
cd src/sheet
clasp push
```

May need to create new deployment for web app changes.

#### 4. OAuth Authorization Issues

**Solution:**
1. Identify missing scope from error message
2. Add to `oauthScopes` in `appsscript.json`
3. Push changes: `clasp push`
4. Reauthorize when prompted

#### 5. Quota Exceeded

**Solution:**
- Check usage: https://script.google.com/home/executions
- Google Workspace limits:
  - Email: 10,000/day
  - URL Fetch: 20,000/day
  - Execution time: 6 min/execution
- Implement caching
- Batch operations
- Add exponential backoff

#### 6. Script Timeout

**Solution:**
- Break large operations into smaller chunks
- Use time-driven triggers for long operations
- Implement continuation tokens
- Optimize sheet operations (batch reads/writes)

### Debug Checklist

- [ ] Script Properties set correctly (`CRM_SPREADSHEET_ID`)
- [ ] Library version created (`clasp versions`)
- [ ] Library ID correct in sheet `appsscript.json`
- [ ] OAuth scopes declared for all APIs used
- [ ] User exists in Users sheet with correct role
- [ ] Spreadsheet ID accessible by user
- [ ] Web app deployed with correct settings
- [ ] Browser cache cleared (for UI issues)
- [ ] Executions log checked for errors

---

## 📚 Best Practices

### Security

1. **OAuth Scopes** - Only request what you need
2. **Execute As** - Use `USER_ACCESSING` not `USER_DEPLOYING`
3. **Access Control** - Restrict to domain when possible
4. **Input Validation** - Validate all user inputs
5. **Role-Based Access** - Enforce permissions in all functions
6. **Audit Logging** - Log all data modifications

### Performance

1. **Batch Operations** - Use `setValues()` not `setValue()` in loops
2. **Caching** - Cache frequently accessed data
3. **Minimize Reads** - Read sheets once, process in memory
4. **Lazy Loading** - Load data as needed, not upfront
5. **Pagination** - Limit API responses to reasonable sizes
6. **Indexes** - Use appropriate data structures for lookups

### Code Quality

1. **Namespace Pattern** - Prevent global pollution
2. **Error Handling** - Try/catch all API calls
3. **Logging** - Use structured logging with context
4. **Documentation** - Comment complex logic
5. **Consistency** - Follow naming conventions
6. **DRY Principle** - Don't repeat yourself

### Maintenance

1. **Version Control** - Use Git for code
2. **Library Versions** - Tag releases semantically
3. **Backup Data** - Regular spreadsheet backups
4. **Monitor Logs** - Check executions regularly
5. **Update Dependencies** - Keep libraries current
6. **Test Changes** - Use development mode first

---

## 📈 Roadmap

### Version 2.1 (Next Release)
- [ ] Advanced filtering and saved views
- [ ] Bulk operations (import/export CSV)
- [ ] Email campaign management
- [ ] Custom fields per entity
- [ ] Mobile app (Progressive Web App)

### Version 2.2
- [ ] Integrations (Zapier, Make.com)
- [ ] Workflow automation
- [ ] Advanced reporting with pivot tables
- [ ] Document generation (PDF contracts)
- [ ] Team collaboration features

### Version 3.0
- [ ] AI-powered lead scoring
- [ ] Predictive deal closing
- [ ] Natural language search
- [ ] Voice commands
- [ ] Real-time collaboration

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

**Guidelines:**
- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and well-described

---

## 📄 License

This project is open source and available under the MIT License.

---

## 💬 Support

### Documentation
- [Apps Script Docs](https://developers.google.com/apps-script)
- [Clasp Documentation](https://github.com/google/clasp)
- [Chart.js Docs](https://www.chartjs.org/docs/)

### Community
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-apps-script)
- [Google Apps Script Community](https://www.googlecloudcommunity.com/gc/Apps-Script/bd-p/apps-script)

### Issues
For bugs or feature requests, please open an issue on GitHub.

---

## 🎉 Credits

Built with ❤️ for SMBs who need enterprise features without enterprise costs.

**Technologies:**
- Google Apps Script
- Google Sheets
- Bootstrap 5
- Bootstrap Icons
- Chart.js
- Modern JavaScript (ES6+)

---

**Last Updated:** October 11, 2025  
**Version:** 2.0 Enhanced Edition  
**Maintainer:** CRM Core Team

---

*Happy CRM-ing! 🚀*

