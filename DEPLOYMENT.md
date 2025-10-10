# CRM Core Automation - Deployment Guide

This guide follows Google Workspace Apps Script best practices for library-based architecture.

## Architecture Overview

This project uses a **dual-project architecture**:

1. **Library Project** (`src/library/`) - Standalone script containing:
   - Core business logic (auth, contacts, companies, deals, tasks)
   - Utility functions (UUID generation, sheet operations, validation)
   - Reusable across multiple bound scripts

2. **Sheet-bound Project** (`src/sheet/`) - Container-bound script:
   - Web app UI (HTML files)
   - API endpoints (doGet, doPost)
   - Thin wrapper calling library functions
   - Bound to a specific Google Sheets document

## Prerequisites

### 1. Install Google Clasp CLI

```bash
npm install -g @google/clasp
```

### 2. Authenticate with Google

```bash
clasp login
```

This opens a browser for OAuth authorization and creates `~/.clasprc.json`.

### 3. Enable Apps Script API

Visit: https://script.google.com/home/usersettings

Enable the **Google Apps Script API**.

## Setup Instructions

### Step 1: Create Google Sheets Document

1. Create a new Google Sheets document
2. Name it: **CRM Data**
3. Copy the spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
4. Save this ID for later configuration

### Step 2: Deploy Library Project

```bash
cd src/library
```

#### Create new Apps Script project:

```bash
clasp create --type standalone --title "CRM Core Library"
```

This generates `.clasp.json` with your script ID.

#### Push the library code:

```bash
clasp push
```

#### Create a version for production:

```bash
clasp version "v1.0.0 - Initial release"
```

#### Note the Script ID:

Open `.clasp.json` and copy the `scriptId`. You'll need this for the sheet-bound project dependency.

Alternatively, run:
```bash
clasp open
```

In the Apps Script editor:
- Go to **Project Settings** (gear icon)
- Copy the **Script ID**

### Step 3: Deploy Sheet-bound Project

```bash
cd ../sheet
```

#### Create container-bound script:

```bash
clasp create --type sheets --parentId "YOUR_SPREADSHEET_ID"
```

Replace `YOUR_SPREADSHEET_ID` with the ID from Step 1.

#### Update Library Dependency:

Edit `src/sheet/appsscript.json` and update the `libraryId`:

```json
{
  "dependencies": {
    "libraries": [
      {
        "userSymbol": "CrmLib",
        "libraryId": "YOUR_LIBRARY_SCRIPT_ID",
        "version": "1",
        "developmentMode": true
      }
    ]
  }
}
```

For development, use `"developmentMode": true`.
For production, set to `false` and specify the version number.

#### Push the sheet-bound code:

```bash
clasp push
```

### Step 4: Configure Script Properties

Open the sheet-bound script:

```bash
clasp open
```

In the Apps Script editor:

1. Go to **Project Settings** (gear icon)
2. Scroll to **Script Properties**
3. Add the following properties:

| Property Name | Value |
|---------------|-------|
| `CRM_SPREADSHEET_ID` | Your spreadsheet ID from Step 1 |
| `LIBRARY_ID` | Your library script ID (for documentation) |

### Step 5: Initialize Database Schema

In the Apps Script editor (sheet-bound project):

1. Open `api/Api.js`
2. Run the initialization function:
   - Click on function dropdown
   - Select a function to run initialization (create one if needed)
   - Or run from Debug console:
     ```javascript
     CrmLib.initCrmSheets(PropertiesService.getScriptProperties().getProperty('CRM_SPREADSHEET_ID'))
     ```

This creates the following sheets with headers:
- Meta
- Users
- Contacts
- Companies
- Deals
- Tasks
- Email_Log
- Calendar_Events
- Activity_Audit
- Lists

### Step 6: Set Up Initial User

1. Open the **CRM Data** spreadsheet
2. Go to the **Users** sheet
3. Add your user record manually:

| user_id | email | display_name | role | active | created_at | last_login |
|---------|-------|--------------|------|--------|------------|------------|
| user_001 | your.email@domain.com | Your Name | Admin | TRUE | 2025-10-10T00:00:00.000Z | |

### Step 7: Deploy Web App

In the sheet-bound Apps Script editor:

1. Click **Deploy** > **New deployment**
2. Click **Select type** > **Web app**
3. Configure:
   - **Description**: "CRM Core App v1.0"
   - **Execute as**: `User accessing the web app` (USER_ACCESSING)
   - **Who has access**: `Anyone with Google account` or `Only domain users`
4. Click **Deploy**
5. Copy the **Web app URL**

### Step 8: Test the Web App

Visit the web app URL. You should see the CRM interface.

## Development Workflow

### Making Changes to Library

```bash
cd src/library
clasp push
```

If using `developmentMode: false`, create a new version:

```bash
clasp version "Description of changes"
```

Then update the version number in `src/sheet/appsscript.json`.

### Making Changes to Sheet-bound Script

```bash
cd src/sheet
clasp push
```

For web app changes to take effect:
- **Development deployments**: Changes reflect immediately
- **Production deployments**: Create a new deployment version

### Pulling Changes from Apps Script Editor

If you make changes directly in the online editor:

```bash
clasp pull
```

**Warning**: This overwrites local files. Commit your changes first!

## Production Deployment Best Practices

### 1. Library Versioning

Always use versioned library dependencies in production:

```json
{
  "libraryId": "YOUR_LIBRARY_SCRIPT_ID",
  "version": "1",
  "developmentMode": false
}
```

To create a version:
```bash
cd src/library
clasp version "v1.0.0 - Production release"
```

### 2. Web App Access Control

In `src/sheet/appsscript.json`:

```json
{
  "webapp": {
    "executeAs": "USER_ACCESSING",
    "access": "DOMAIN"
  }
}
```

**Security Levels**:
- `MYSELF`: Only you
- `DOMAIN`: Anyone in your Google Workspace domain
- `ANYONE`: Anyone with the link (use with caution)
- `ANYONE_ANONYMOUS`: Anyone, no sign-in required (not recommended)

**Execute As**:
- `USER_ACCESSING`: Run as the user accessing the app (recommended)
- `USER_DEPLOYING`: Run as you (owner) - use only if needed

### 3. OAuth Scopes

Both projects declare required OAuth scopes in `appsscript.json`.

**Library scopes** (`src/library/appsscript.json`):
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

**Sheet-bound scopes** (`src/sheet/appsscript.json`):
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

### 4. Error Logging

Both projects use Stackdriver (Cloud Logging):

```json
{
  "exceptionLogging": "STACKDRIVER"
}
```

View logs in the Apps Script editor: **Executions** tab.

### 5. Time Zone Configuration

Set appropriate time zones in `appsscript.json`:

```json
{
  "timeZone": "America/New_York"
}
```

Find your time zone: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

## Troubleshooting

### "Library not found" Error

**Cause**: Library not deployed or incorrect script ID

**Solution**:
1. Ensure library has at least one version:
   ```bash
   cd src/library
   clasp versions
   ```
2. If no versions exist:
   ```bash
   clasp version "Initial version"
   ```
3. Verify `libraryId` in `src/sheet/appsscript.json` matches library script ID

### "Unauthorized" or "Forbidden" Errors

**Cause**: User not in Users sheet or incorrect role

**Solution**:
1. Open the CRM Data spreadsheet
2. Go to **Users** sheet
3. Verify your email exists with:
   - `active` = TRUE
   - `role` = Admin (or appropriate role)

### Changes Not Reflecting

**Cause**: Need to push changes or redeploy

**Library changes**:
```bash
cd src/library
clasp push
```

If `developmentMode: false`, create new version and update sheet manifest.

**Sheet changes**:
```bash
cd src/sheet
clasp push
```

Web app changes may require creating a new deployment or using test deployments.

### "Script has attempted to perform an action that is not allowed" Error

**Cause**: Missing OAuth scope

**Solution**:
1. Identify the required scope from error message
2. Add to `oauthScopes` in `appsscript.json`
3. Push changes: `clasp push`
4. Reauthorize the script when prompted

### Clasp Authentication Issues

**Cause**: Expired or missing credentials

**Solution**:
```bash
clasp logout
clasp login
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Apps Script

on:
  push:
    branches: [main]

jobs:
  deploy-library:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g @google/clasp
      - name: Authenticate
        run: echo '${{ secrets.CLASPRC_JSON }}' > ~/.clasprc.json
      - name: Deploy Library
        run: |
          cd src/library
          echo '${{ secrets.LIBRARY_CLASP_JSON }}' > .clasp.json
          clasp push
          clasp version "Auto-deploy $(date)"

  deploy-sheet:
    runs-on: ubuntu-latest
    needs: deploy-library
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g @google/clasp
      - name: Authenticate
        run: echo '${{ secrets.CLASPRC_JSON }}' > ~/.clasprc.json
      - name: Deploy Sheet App
        run: |
          cd src/sheet
          echo '${{ secrets.SHEET_CLASP_JSON }}' > .clasp.json
          clasp push
```

**Required GitHub Secrets**:
- `CLASPRC_JSON`: Contents of `~/.clasprc.json`
- `LIBRARY_CLASP_JSON`: Contents of `src/library/.clasp.json`
- `SHEET_CLASP_JSON`: Contents of `src/sheet/.clasp.json`

## Resources

- [Apps Script Documentation](https://developers.google.com/apps-script)
- [Clasp Documentation](https://github.com/google/clasp)
- [Apps Script Best Practices](https://developers.google.com/apps-script/guides/support/best-practices)
- [OAuth Scopes Reference](https://developers.google.com/identity/protocols/oauth2/scopes)

## Support

For issues or questions, refer to the main README.md or project documentation.

