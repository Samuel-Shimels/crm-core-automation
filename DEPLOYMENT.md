# CRM Core - Deployment Guide

This guide walks you through deploying the CRM Core web application.

## Prerequisites

- Google account with access to Google Drive, Sheets, and Apps Script
- `@google/clasp` CLI tool (optional, for command-line deployment)
- A Google Spreadsheet to serve as your database

## Option 1: Manual Deployment (Recommended for First-Time Users)

### Step 1: Create the Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "CRM Data"
3. Note the Spreadsheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the `SPREADSHEET_ID` part

### Step 2: Create the Library Script

1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Name it "CRM Core Library"
4. Delete the default `Code.gs` file
5. Add these files from `src/library/`:
   - Create `appsscript.json` → Paste contents from `src/library/appsscript.json`
   - Create `init.gs` → Paste contents from `src/library/core/init.gs`
   - Create `auth.gs` → Paste contents from `src/library/core/auth.gs`
   - Create `contacts.gs` → Paste contents from `src/library/core/contacts.gs`
   - Create `companies.gs` → Paste contents from `src/library/core/companies.gs`
   - Create `deals.gs` → Paste contents from `src/library/core/deals.gs`
   - Create `tasks.gs` → Paste contents from `src/library/core/tasks.gs`
   - Create `users.gs` → Paste contents from `src/library/core/users.gs`
   - Create `sheet_utils.gs` → Paste contents from `src/library/libs/sheet_utils.gs`
   - Create `uuid_lib.gs` → Paste contents from `src/library/libs/uuid_lib.gs`
   - Create `validation.gs` → Paste contents from `src/library/libs/validation.gs`
6. Click **Deploy** → **New deployment**
7. Select type: **Library**
8. Add description: "CRM Core Library v1"
9. Click **Deploy**
10. **Copy the Deployment ID** (you'll need this for the next step)

### Step 3: Create the Sheet-Bound Script

1. Open your "CRM Data" spreadsheet
2. Go to **Extensions** → **Apps Script**
3. Delete the default `Code.gs`
4. Add these files from `src/sheet/`:
   - Create `appsscript.json` → Paste contents from `src/sheet/appsscript.json`
   - Create `Api.gs` → Paste contents from `src/sheet/api/Api.gs`
   - Create `index.html` → Paste contents from `src/sheet/web/index.html`
   - Create `dashboard.html` → Paste contents from `src/sheet/web/dashboard.html`
   - Create `contacts.html` → Paste contents from `src/sheet/web/contacts.html`
   - Create `companies.html` → Paste contents from `src/sheet/web/companies.html`
   - Create `deals.html` → Paste contents from `src/sheet/web/deals.html`
   - Create `tasks.html` → Paste contents from `src/sheet/web/tasks.html`
   - Create `email.html` → Paste contents from `src/sheet/web/email.html`
   - Create `reports.html` → Paste contents from `src/sheet/web/reports.html`
   - Create `admin.html` → Paste contents from `src/sheet/web/admin.html`
   - Create `main.html` → Paste contents from `src/sheet/web/static/main.html`
   - Create `styles.html` → Paste contents from `src/sheet/web/static/styles.html`

5. **Update Library Reference**:
   - Open `appsscript.json`
   - Find the `libraryId` field in the `dependencies.libraries` array
   - Replace with the Deployment ID you copied from Step 2

6. Click **Project Settings** (gear icon)
7. Scroll to **Script Properties**
8. Click **Add script property**
   - Property: `CRM_SPREADSHEET_ID`
   - Value: Your spreadsheet ID from Step 1
9. Click **Save**

### Step 4: Deploy the Web App

1. In the Apps Script editor, click **Deploy** → **New deployment**
2. Click the gear icon next to "Select type"
3. Choose **Web app**
4. Configure:
   - Description: "CRM Core Web App v1"
   - Execute as: **User accessing the web app**
   - Who has access: **Anyone** (or your preferred setting)
5. Click **Deploy**
6. **Authorize access** when prompted
7. Copy the **Web app URL**

### Step 5: Initialize and Test

1. Open the Web app URL in your browser
2. Click the **Admin** tab
3. Click **Initialize Sheets** (creates all database tabs)
4. Click **Load Demo Data** (populates with sample data)
5. Navigate to Dashboard, Contacts, Companies, Deals, and Tasks to explore!

## Option 2: Command-Line Deployment with Clasp

### Prerequisites

```bash
npm install -g @google/clasp
clasp login
```

### Deploy Library

```bash
cd src/library
clasp create --type standalone --title "CRM Core Library"
clasp push
clasp deploy --description "CRM Core Library v1"
```

Note the Script ID and Deployment ID.

### Deploy Sheet-Bound Project

1. Create your spreadsheet manually first
2. Get the Spreadsheet ID
3. Update `src/sheet/appsscript.json` with the library Deployment ID

```bash
cd src/sheet
clasp create --type sheets --title "CRM Sheet App" --parentId "YOUR_SPREADSHEET_ID"
clasp push
```

4. Set script property via UI (Apps Script editor → Project Settings → Script Properties)
5. Deploy web app via UI

## Post-Deployment Configuration

### Add Your User Account

After initialization, you may need to add yourself as an admin user:

1. Open your spreadsheet
2. Go to the "Users" tab
3. Add a row:
   - user_id: (generate a UUID)
   - email: your@email.com
   - display_name: Your Name
   - role: Admin
   - active: TRUE
   - created_at: (current timestamp)

Or use the Admin panel UI to add yourself.

### Update Deployment

When you make changes:

1. Update the code in Apps Script editor
2. Click **Deploy** → **Manage deployments**
3. Click the pencil icon next to your deployment
4. Select **New version**
5. Click **Deploy**

## Security Best Practices

- Start with "Anyone in [your-domain]" access
- Only grant Admin role to trusted users
- Regularly backup your spreadsheet
- Monitor the Activity Audit sheet (when implemented)
- Review user access periodically

## Troubleshooting

### "Authorization Required"
- You need to authorize the script with your Google account
- Follow the authorization prompts carefully
- If blocked, go to Advanced → Go to [App name] (unsafe)

### "Library not found" or "CrmLib is not defined"
- Check that library is properly deployed
- Verify the library ID in `appsscript.json` matches your deployment
- Ensure `developmentMode: true` or specify a version number

### Web App Not Updating
- Create a new deployment version
- Clear browser cache
- Try in incognito mode

### "CRM_SPREADSHEET_ID not set"
- Go to Project Settings → Script Properties
- Add the property with your spreadsheet ID

## Support

For issues or questions:
1. Check the main README.md for detailed documentation
2. Review the Troubleshooting sections
3. Examine browser console for JavaScript errors
4. Check Apps Script execution logs

## Next Steps

- Customize the UI to match your branding
- Add custom fields to entities
- Integrate with other Google services
- Build custom reports
- Add email and calendar integration
