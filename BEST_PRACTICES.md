# Google Apps Script Best Practices for CRM Core Automation

This document outlines the Google Workspace deployment best practices implemented in this project and provides guidance for maintaining production-quality Apps Script applications.

## Table of Contents

1. [Architecture Patterns](#architecture-patterns)
2. [Security Best Practices](#security-best-practices)
3. [Development Workflow](#development-workflow)
4. [Performance Optimization](#performance-optimization)
5. [Error Handling & Logging](#error-handling--logging)
6. [Testing Strategies](#testing-strategies)
7. [Deployment & Versioning](#deployment--versioning)
8. [Maintenance & Monitoring](#maintenance--monitoring)

---

## Architecture Patterns

### ✅ Library-Based Architecture (Implemented)

**Why**: Separates business logic from presentation, enables code reuse, and simplifies testing.

**Structure**:
```
Library (Standalone)
├── Core business logic
├── Data access layer
├── Utility functions
└── External integrations

Sheet-bound Script
├── Web app UI
├── API endpoints (doGet/doPost)
└── Thin wrappers calling library
```

**Benefits**:
- **Reusability**: One library serves multiple projects
- **Versioning**: Control which version each project uses
- **Testing**: Library functions can be tested independently
- **Maintenance**: Update logic once, propagate to all consumers

**Implementation**:
```javascript
// In library (src/library/core/contacts.js)
var CrmLib = (function(ns) {
  ns.createContact = function(spreadsheetId, contactData) {
    // Business logic here
  };
  return ns;
})(typeof CrmLib !== 'undefined' ? CrmLib : {});

// In sheet-bound script (src/sheet/api/Api.js)
function createContact(contactData) {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('CRM_SPREADSHEET_ID');
  return CrmLib.createContact(spreadsheetId, contactData);
}
```

### ✅ Namespace Pattern (Implemented)

**Why**: Prevents global namespace pollution and naming conflicts.

**Implementation**:
```javascript
var CrmLib = (function(ns) {
  const self = ns || {};
  
  // Private variables (not exported)
  const privateHelper = function() {
    // ...
  };
  
  // Public API
  self.publicMethod = function() {
    // ...
  };
  
  return self;
})(typeof CrmLib !== 'undefined' ? CrmLib : {});
```

### ✅ Configuration via Script Properties (Implemented)

**Why**: Separates configuration from code, enables environment-specific settings.

**Usage**:
```javascript
// Set properties via Apps Script editor or API
PropertiesService.getScriptProperties().setProperty('CRM_SPREADSHEET_ID', 'abc123');

// Use in code
const spreadsheetId = PropertiesService.getScriptProperties().getProperty('CRM_SPREADSHEET_ID');
```

**Property Types**:
- **Script Properties**: Shared across all users
- **User Properties**: Per-user settings
- **Document Properties**: Per-document (for container-bound scripts)

---

## Security Best Practices

### ✅ OAuth Scope Minimization (Implemented)

**Principle**: Only request OAuth scopes your app actually needs.

**Library Scopes** (minimal for data operations):
```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/userinfo.email"
  ]
}
```

**Sheet-bound Scopes** (includes user-facing features):
```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/calendar"
  ]
}
```

### ✅ Web App Security Settings (Implemented)

**Execute As**:
- ✅ **`USER_ACCESSING`**: Runs with permissions of user accessing app (recommended)
- ❌ **`USER_DEPLOYING`**: Runs with your permissions (security risk)

**Access Control**:
- ✅ **`DOMAIN`**: Restrict to your Google Workspace domain (recommended)
- ⚠️ **`ANYONE`**: Anyone with link (requires Google sign-in)
- ❌ **`ANYONE_ANONYMOUS`**: No authentication (avoid unless public API)

```json
{
  "webapp": {
    "executeAs": "USER_ACCESSING",
    "access": "DOMAIN"
  }
}
```

### ✅ XFrame Protection (Implemented)

**Why**: Prevents clickjacking attacks.

**Implementation**:
```javascript
function doGet(e) {
  return HtmlService.createTemplateFromFile('web/index')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}
```

**Options**:
- `DEFAULT`: X-Frame-Options: DENY (recommended)
- `ALLOWALL`: No protection (only use if embedding in known iframes)

### ✅ Role-Based Access Control (Implemented)

**Why**: Limits what users can do based on their role.

**Implementation**:
```javascript
// Check role before sensitive operations
const user = CrmLib.requireRole(spreadsheetId, ['Admin', 'Manager']);

// Enforce in all data modification functions
self.deleteContact = function(spreadsheetId, contactId) {
  const user = self.requireRole(spreadsheetId, ['Admin']);
  // Proceed with deletion
};
```

### ✅ Input Validation (Implemented)

**Why**: Prevents injection attacks and data corruption.

**Implementation**:
```javascript
CrmLib.validateRequired(params, ['email', 'firstName', 'lastName']);

// Validate email format
if (!CrmLib.isValidEmail(params.email)) {
  throw new CrmLib.CrmError('Invalid email format', CrmLib.ErrorTypes.VALIDATION);
}
```

### ⚠️ Avoid Hardcoding Secrets

**Don't**:
```javascript
const API_KEY = 'abc123secret'; // ❌ Never hardcode
```

**Do**:
```javascript
const API_KEY = PropertiesService.getScriptProperties().getProperty('API_KEY');
```

---

## Development Workflow

### ✅ Use Clasp for Local Development (Implemented)

**Benefits**:
- Version control with Git
- Use your preferred IDE
- Enable collaborative development
- Automate deployments

**Setup**:
```bash
npm install -g @google/clasp
clasp login
cd src/library
clasp create --type standalone --title "CRM Core Library"
clasp push
```

### ✅ Git Ignore Sensitive Files (Implemented)

**`.gitignore`**:
```gitignore
# Clasp authentication
.clasprc.json

# Project-specific script IDs
.clasp.json

# Environment variables
.env
```

### ✅ Development vs Production Library Modes (Implemented)

**Development** (immediate changes):
```json
{
  "libraryId": "SCRIPT_ID",
  "developmentMode": true
}
```

**Production** (versioned, stable):
```json
{
  "libraryId": "SCRIPT_ID",
  "version": "1",
  "developmentMode": false
}
```

### ⚠️ Use TypeScript with @types/google-apps-script

For better type safety (optional):

```bash
npm install --save-dev @types/google-apps-script
```

```typescript
// Code with type hints
function getUser(email: string): GoogleAppsScript.Spreadsheet.Sheet {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName('Users');
}
```

---

## Performance Optimization

### ✅ Batch Operations

**Don't** (multiple individual calls):
```javascript
// ❌ Slow: N calls to setValue
for (let i = 0; i < data.length; i++) {
  sheet.getRange(i + 2, 1).setValue(data[i][0]);
  sheet.getRange(i + 2, 2).setValue(data[i][1]);
}
```

**Do** (single batch operation):
```javascript
// ✅ Fast: 1 call to setValues
sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
```

### ✅ Cache Frequently Accessed Data

**Implementation**:
```javascript
const cache = CacheService.getScriptCache();

function getUsers(spreadsheetId) {
  const cacheKey = 'users_' + spreadsheetId;
  let users = cache.get(cacheKey);
  
  if (!users) {
    // Fetch from sheet
    const data = CrmLib.getSheetValues(spreadsheetId, 'Users');
    users = JSON.stringify(data);
    cache.put(cacheKey, users, 600); // Cache for 10 minutes
  }
  
  return JSON.parse(users);
}
```

**Cache Types**:
- **Script Cache**: Shared across all users (up to 10 MB)
- **User Cache**: Per-user cache (up to 10 MB)
- **Document Cache**: Per-document (up to 10 MB)

### ✅ Limit getDataRange() Usage

**Don't**:
```javascript
// ❌ Reads entire sheet every time
const data = sheet.getDataRange().getValues();
```

**Do** (if you know the range):
```javascript
// ✅ Read only what you need
const lastRow = sheet.getLastRow();
const data = sheet.getRange(1, 1, lastRow, 10).getValues();
```

### ✅ Use Triggers Wisely

**Don't**:
- Set multiple triggers for the same function
- Use time-driven triggers more frequently than needed

**Do**:
- Check for existing triggers before creating new ones
- Use installable triggers (not simple triggers) for reliability
- Clean up old triggers

```javascript
function setupTrigger() {
  // Remove existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'myFunction') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new trigger
  ScriptApp.newTrigger('myFunction')
    .timeBased()
    .everyHours(1)
    .create();
}
```

---

## Error Handling & Logging

### ✅ Centralized Error Handling (Implemented)

**Implementation**:
```javascript
var CrmLib = (function(ns) {
  ns.safeExecute = function(fn, operationName) {
    try {
      const result = fn();
      return { success: true, data: result };
    } catch (error) {
      ns.logError('Operation failed: ' + operationName, {
        error: error.message,
        stack: error.stack
      });
      return { success: false, error: error.message };
    }
  };
  return ns;
})(typeof CrmLib !== 'undefined' ? CrmLib : {});
```

### ✅ Structured Logging (Implemented)

**Use Stackdriver Logging** (enabled in manifest):
```json
{
  "exceptionLogging": "STACKDRIVER"
}
```

**Log with Context**:
```javascript
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'INFO',
  message: 'User logged in',
  userId: 'user_001',
  email: 'user@example.com'
}));
```

**View Logs**:
1. Open Apps Script editor
2. Click **Executions** (left sidebar)
3. Filter by status, date, user

### ✅ Audit Trail (Implemented)

**Log All Data Modifications**:
```javascript
CrmLib.logAudit(spreadsheetId, 'Contact', contactId, 'UPDATE', userId, 'Changed email address');
```

**Audit Sheet Columns**:
- `audit_id`: Unique identifier
- `entity_type`: Contact, Deal, Company, etc.
- `entity_id`: ID of modified record
- `action`: CREATE, UPDATE, DELETE, VIEW
- `user_id`: Who performed the action
- `timestamp`: When it happened
- `notes`: Additional context

---

## Testing Strategies

### Manual Testing

**Use Apps Script Editor**:
1. Select function from dropdown
2. Click **Run**
3. Check logs and results

**Debug with Logger and Breakpoints**:
```javascript
function testCreateContact() {
  Logger.log('Starting test');
  const result = CrmLib.createContact(spreadsheetId, {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com'
  });
  Logger.log('Result: ' + JSON.stringify(result));
}
```

### Unit Testing (Advanced)

Use **gas-unit** or similar frameworks:

```javascript
function testFindUserByEmail() {
  const user = CrmLib.findUserByEmail(spreadsheetId, 'admin@domain.com');
  if (!user) throw new Error('User not found');
  if (user.role !== 'Admin') throw new Error('Wrong role');
  Logger.log('Test passed');
}
```

### Integration Testing

Test end-to-end workflows:

```javascript
function testContactCreationWorkflow() {
  // 1. Create contact
  const contact = CrmLib.createContact(spreadsheetId, testData);
  
  // 2. Verify creation
  const retrieved = CrmLib.getContactById(spreadsheetId, contact.contact_id);
  if (!retrieved) throw new Error('Contact not created');
  
  // 3. Update contact
  CrmLib.updateContact(spreadsheetId, contact.contact_id, { phone: '555-1234' });
  
  // 4. Verify update
  const updated = CrmLib.getContactById(spreadsheetId, contact.contact_id);
  if (updated.phone !== '555-1234') throw new Error('Contact not updated');
  
  Logger.log('Workflow test passed');
}
```

---

## Deployment & Versioning

### ✅ Library Versioning (Implemented)

**Create Versions**:
```bash
cd src/library
clasp version "v1.0.0 - Initial release"
clasp version "v1.1.0 - Added email integration"
clasp version "v1.1.1 - Bug fixes"
```

**Semantic Versioning**:
- **Major** (v2.0.0): Breaking changes
- **Minor** (v1.1.0): New features, backward compatible
- **Patch** (v1.1.1): Bug fixes

**List Versions**:
```bash
clasp versions
```

### ✅ Web App Deployments

**Development Deployments**:
- Used for testing
- Changes reflect immediately
- Don't affect production users

**Production Deployments**:
- Versioned and stable
- Users access via fixed URL
- Create new version for updates

**Create Deployment**:
1. Apps Script editor → **Deploy** → **New deployment**
2. Select type: **Web app**
3. Configure settings
4. Click **Deploy**

**Update Deployment**:
1. **Deploy** → **Manage deployments**
2. Click edit icon
3. Change version
4. Click **Deploy**

### ✅ CI/CD with GitHub Actions (Optional)

**Example Workflow** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to Apps Script

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g @google/clasp
      - name: Authenticate
        run: echo '${{ secrets.CLASPRC_JSON }}' > ~/.clasprc.json
      - name: Deploy Library
        run: |
          cd src/library
          echo '${{ secrets.LIBRARY_CLASP_JSON }}' > .clasp.json
          clasp push
          clasp version "Auto-deploy $(date)"
```

---

## Maintenance & Monitoring

### ✅ Monitor Execution Logs

**Check Regularly**:
1. Apps Script editor → **Executions**
2. Filter by:
   - Status (Success, Failed)
   - Date range
   - User

**Set Up Alerts** (via email):
```javascript
function notifyOnError() {
  const errors = getRecentErrors(); // Custom function to fetch from logs
  if (errors.length > 0) {
    MailApp.sendEmail({
      to: 'admin@domain.com',
      subject: 'CRM Error Alert',
      body: 'Errors detected:\n' + JSON.stringify(errors, null, 2)
    });
  }
}
```

### ✅ Quota Management

**Apps Script Quotas** (Google Workspace):
- Email: 1,500/day (consumer), 10,000/day (Workspace)
- URL Fetch: 20,000/day
- Execution time: 6 min/execution

**Monitor Usage**:
- Apps Script dashboard: https://script.google.com/home/executions
- Google Cloud Console: https://console.cloud.google.com/

### ✅ Regular Maintenance

**Monthly Tasks**:
- Review error logs
- Check quota usage
- Update library versions
- Clean up old data
- Verify backup procedures

**Quarterly Tasks**:
- Review OAuth scopes (remove unused)
- Update documentation
- Conduct security audit
- Performance benchmarking

### ✅ Backup Strategy

**Automate Backups**:
```javascript
function backupData() {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const backupFolder = DriveApp.getFolderById(backupFolderId);
  
  const timestamp = Utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd_HHmmss');
  const backupName = 'CRM_Backup_' + timestamp;
  
  ss.copy(backupName).moveTo(backupFolder);
  
  // Clean up old backups (keep last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const files = backupFolder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    if (file.getDateCreated() < thirtyDaysAgo) {
      file.setTrashed(true);
    }
  }
}
```

**Schedule Backup Trigger**:
```javascript
ScriptApp.newTrigger('backupData')
  .timeBased()
  .atHour(2) // 2 AM
  .everyDays(1)
  .create();
```

---

## Additional Resources

### Official Documentation
- [Apps Script Best Practices](https://developers.google.com/apps-script/guides/support/best-practices)
- [Security Best Practices](https://developers.google.com/apps-script/guides/security)
- [OAuth Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
- [Quota Limits](https://developers.google.com/apps-script/guides/services/quotas)

### Community Resources
- [Stack Overflow - google-apps-script](https://stackoverflow.com/questions/tagged/google-apps-script)
- [Apps Script Community](https://www.googlecloudcommunity.com/gc/Apps-Script/bd-p/apps-script)
- [Clasp GitHub](https://github.com/google/clasp)

### Tools
- [Clasp](https://github.com/google/clasp) - Command-line tool
- [gas-client](https://github.com/enuchi/React-Google-Apps-Script) - Frontend framework integration
- [gas-unit](https://github.com/zaki-yama/gas-unit) - Unit testing framework

---

## Checklist for New Projects

Use this checklist when starting a new Apps Script project:

- [ ] **Architecture**
  - [ ] Separate library from UI/API
  - [ ] Use namespace pattern
  - [ ] Configure Script Properties

- [ ] **Security**
  - [ ] Declare OAuth scopes explicitly
  - [ ] Set `executeAs: USER_ACCESSING`
  - [ ] Restrict access appropriately
  - [ ] Use XFrame protection
  - [ ] Implement role-based access control

- [ ] **Development**
  - [ ] Set up clasp
  - [ ] Create `.gitignore`
  - [ ] Enable V8 runtime
  - [ ] Use development/production library modes

- [ ] **Error Handling**
  - [ ] Implement centralized error handling
  - [ ] Enable Stackdriver logging
  - [ ] Add audit trail
  - [ ] Include input validation

- [ ] **Performance**
  - [ ] Batch operations where possible
  - [ ] Use caching for frequently accessed data
  - [ ] Optimize sheet operations

- [ ] **Deployment**
  - [ ] Create library versions
  - [ ] Document deployment process
  - [ ] Test in development before production

- [ ] **Maintenance**
  - [ ] Set up monitoring
  - [ ] Create backup strategy
  - [ ] Document maintenance procedures

---

This document is a living guide. Update it as you learn new best practices and encounter new scenarios.

