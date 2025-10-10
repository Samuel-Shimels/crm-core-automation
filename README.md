# CRM Core Automation - Google Apps Script

A production-ready CRM system built with Google Apps Script, following Google Workspace deployment best practices.

## 🏗️ Architecture

**Dual-project Apps Script architecture** aligned with Google Workspace standards:

1. **Library Project** (`src/library/`) - Standalone script:
   - Core business logic (auth, contacts, companies, deals, tasks, users)
   - Utility functions (UUID, sheet operations, validation, error handling)
   - Reusable across multiple projects
   - Properly versioned for production use

2. **Sheet-bound Project** (`src/sheet/`) - Container-bound script:
   - Web app UI (HTML/CSS/JavaScript)
   - API endpoints (`doGet`, `doPost`)
   - Thin wrapper calling library functions
   - Attached to Google Sheets database

## 📁 Project Structure

```
crm-core-automation/
├── DEPLOYMENT.md              # Comprehensive deployment guide
├── README.md                  # This file
├── .gitignore                 # Git ignore rules (includes .clasp.json)
│
├── src/
│   ├── library/               # Standalone library project
│   │   ├── appsscript.json    # Library manifest with OAuth scopes
│   │   ├── .clasp.json.template
│   │   ├── core/
│   │   │   ├── auth.js        # Authentication & authorization
│   │   │   ├── users.js       # User management
│   │   │   ├── contacts.js    # Contact CRUD operations
│   │   │   ├── companies.js   # Company management
│   │   │   ├── deals.js       # Deal pipeline
│   │   │   ├── tasks.js       # Task management
│   │   │   └── init.js        # Database initialization
│   │   └── libs/
│   │       ├── uuid_lib.js    # UUID generation
│   │       ├── sheet_utils.js # Sheet helper functions
│   │       ├── validation.js  # Input validation
│   │       └── error_handler.js # Error handling & logging
│   │
│   └── sheet/                 # Sheet-bound project (SIMPLIFIED - 2 files!)
│       ├── appsscript.json    # Sheet manifest with security settings
│       ├── index.html         # Complete single-page web app (all views, CSS, JS)
│       └── Code.js            # All server-side functions and API endpoints
```

## ✅ Google Workspace Best Practices Implemented

### Security
- ✅ **OAuth Scopes**: Explicitly declared in both projects
- ✅ **Web App Security**: `executeAs: USER_ACCESSING` (runs as current user)
- ✅ **Access Control**: Domain-restricted access (`access: DOMAIN`)
- ✅ **XFrame Protection**: Using `DEFAULT` mode (prevents clickjacking)
- ✅ **Role-Based Access**: User roles (Admin, Manager, User) with permissions

### Development
- ✅ **Library Versioning**: Proper version management for production
- ✅ **Development Mode**: Switch between dev and production library versions
- ✅ **Error Handling**: Centralized error handling with Stackdriver logging
- ✅ **Audit Logging**: All operations logged to Activity_Audit sheet
- ✅ **V8 Runtime**: Modern JavaScript features enabled

### Deployment
- ✅ **Clasp Integration**: Full clasp support with templates
- ✅ **Environment Separation**: Dev vs. production configurations
- ✅ **Script Properties**: Configuration via Script Properties Service
- ✅ **Gitignore**: Sensitive files excluded from version control

## 🚀 Quick Start

### Prerequisites

1. **Google Account** with access to:
   - Google Drive
   - Google Sheets
   - Gmail (for email features)
   - Google Calendar (for calendar features)

2. **Install Google Clasp**:
   ```bash
   npm install -g @google/clasp
   ```

3. **Authenticate Clasp**:
   ```bash
   clasp login
   ```

4. **Enable Apps Script API**:
   Visit: https://script.google.com/home/usersettings

### Setup (5 minutes)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for comprehensive step-by-step instructions.

**Quick summary**:

1. Create Google Sheets "CRM Data" document
2. Deploy library:
   ```bash
cd src/library
   clasp create --type standalone --title "CRM Core Library"
clasp push
   clasp version "v1.0.0"
   ```
3. Deploy sheet-bound app:
   ```bash
cd ../sheet
   clasp create --type sheets --parentId "YOUR_SPREADSHEET_ID"
   # Update libraryId in appsscript.json
clasp push
```
4. Configure Script Properties (CRM_SPREADSHEET_ID)
5. Initialize database schema
6. Deploy web app

## 🔧 Configuration

### Library OAuth Scopes (`src/library/appsscript.json`)

```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/script.external_request"
  ]
}
```

### Sheet-bound OAuth Scopes (`src/sheet/appsscript.json`)

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

### Web App Security Settings

```json
{
  "webapp": {
    "executeAs": "USER_ACCESSING",
    "access": "DOMAIN"
  }
}
```

**Access Levels**:
- `MYSELF` - Only you
- `DOMAIN` - Anyone in your Google Workspace (recommended)
- `ANYONE` - Anyone with link (requires Google sign-in)
- `ANYONE_ANONYMOUS` - No authentication (not recommended)

## 📊 Database Schema

The system creates the following sheets in your CRM Data spreadsheet:

| Sheet Name | Purpose |
|------------|---------|
| `Meta` | Configuration key-value pairs |
| `Users` | User accounts with roles & permissions |
| `Contacts` | Contact records with lead scoring |
| `Companies` | Company/organization records |
| `Deals` | Sales pipeline & opportunities |
| `Tasks` | Task management & reminders |
| `Email_Log` | Email integration history |
| `Calendar_Events` | Calendar event tracking |
| `Activity_Audit` | Audit trail for all operations |
| `Lists` | Saved contact/company filters |

## 🔐 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full access: manage users, view all data, configure system |
| **Manager** | View/edit all data, create reports, limited admin |
| **User** | View/edit own records, create contacts/deals/tasks |

Set up your first admin user:
1. Open CRM Data spreadsheet
2. Go to `Users` sheet
3. Add row: `user_001 | your.email@domain.com | Your Name | Admin | TRUE | [timestamp] |`

## 🛠️ Development Workflow

### Local Development

```bash
# Pull latest from Apps Script
cd src/library  # or src/sheet
clasp pull

# Make changes locally, then push
clasp push

# Watch for changes (auto-push)
clasp push --watch
```

### Library Versioning

**Development** (changes reflected immediately):
```json
{
  "libraryId": "SCRIPT_ID",
  "developmentMode": true
}
```

**Production** (use versioned library):
```bash
cd src/library
clasp version "v1.1.0 - Bug fixes"
```

Update `src/sheet/appsscript.json`:
```json
{
  "libraryId": "SCRIPT_ID",
  "version": "2",
  "developmentMode": false
}
```

### Error Handling & Logging

The library includes comprehensive error handling:

```javascript
// Wrap functions with error handling
const result = CrmLib.safeExecute(function() {
  // Your code here
  return data;
}, 'Operation name');

// Log levels
CrmLib.logDebug('Debug message', { details: 'info' });
CrmLib.logInfo('Info message');
CrmLib.logWarning('Warning message');
CrmLib.logError('Error message');
CrmLib.logCritical('Critical error');

// Audit logging
CrmLib.logAudit(spreadsheetId, 'Contact', contactId, 'UPDATE', userId, 'Updated email');
```

View logs in Apps Script editor: **Executions** tab.

## 📝 API Usage Examples

```javascript
// Initialize database
CrmLib.initCrmSheets(spreadsheetId);

// User authentication
const user = CrmLib.findUserByEmail(spreadsheetId, 'user@domain.com');
const currentUser = CrmLib.requireRole(spreadsheetId, ['Admin', 'Manager']);

// Error handling
try {
  CrmLib.validateRequired(params, ['email', 'firstName', 'lastName']);
  // Process request
} catch (error) {
  return CrmLib.handleError(error, 'createContact');
}

// Success/error responses
return CrmLib.successResponse(data, 'Contact created successfully');
return CrmLib.errorResponse('Contact not found', CrmLib.ErrorTypes.NOT_FOUND);
```

## 🔍 Troubleshooting

### "Library not found" Error

**Cause**: Library not deployed or incorrect script ID

**Solution**:
```bash
cd src/library
clasp versions  # Check if versions exist
clasp version "v1.0.0"  # Create version if needed
```

Verify `libraryId` in `src/sheet/appsscript.json` matches library Script ID.

### "Unauthorized" Error

**Cause**: User not in Users sheet or inactive

**Solution**:
1. Open CRM Data spreadsheet → `Users` sheet
2. Verify your email exists with `active=TRUE` and appropriate role

### Changes Not Reflecting

**Library changes**:
```bash
cd src/library
clasp push
```

If using `developmentMode: false`, create new version:
```bash
clasp version "Description"
```

**Sheet changes**:
```bash
cd src/sheet
clasp push
```

May need to create new deployment for web app changes.

### OAuth Authorization Issues

**Solution**:
1. Identify missing scope from error message
2. Add to `oauthScopes` in `appsscript.json`
3. Push changes: `clasp push`
4. Reauthorize when prompted

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide with step-by-step instructions
- [Apps Script Documentation](https://developers.google.com/apps-script)
- [Clasp Documentation](https://github.com/google/clasp)
- [Apps Script Best Practices](https://developers.google.com/apps-script/guides/support/best-practices)

## 🔗 Related Resources

- [OAuth Scopes Reference](https://developers.google.com/identity/protocols/oauth2/scopes)
- [V8 Runtime Guide](https://developers.google.com/apps-script/guides/v8-runtime)
- [Stackdriver Logging](https://cloud.google.com/logging/docs)

## 📄 License

This project follows Google Workspace development standards and best practices.

## 🤝 Contributing

When contributing:
1. Follow Google Apps Script style guide
2. Test with both development and production library modes
3. Update documentation for API changes
4. Add error handling with appropriate logging
5. Include audit logging for data modifications

## 📧 Support

For issues:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
2. Review Apps Script execution logs
3. Verify OAuth scopes are correct
4. Check Activity_Audit sheet for operation history 