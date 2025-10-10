# CRM Core Automation (Google Apps Script + Sheets)

A fully-functional CRM web application built on Google Apps Script and Google Sheets as the database.

## Features

✨ **Complete CRM Functionality**
- 📇 Contact Management - Track customers and leads with full details
- 🏢 Company Management - Manage organizations and accounts  
- 💰 Deal Pipeline - Track sales opportunities and revenue
- ✅ Task Management - Organize activities and follow-ups
- 📊 Dashboard - Real-time statistics and insights
- 👥 User Management - Role-based access control (Admin/User)

🎨 **Modern UI**
- Responsive design with Bootstrap 5 and Tailwind CSS
- Clean, professional interface
- Smooth animations and transitions
- Easy navigation with sidebar menu

🏗️ **Dual-Project Architecture**
- Library (standalone): Core business logic, utilities, integrations
- Sheet-bound: Web app UI, API layer, thin wrappers calling Library

## Repos & Paths
```
src/
  library/
    appsscript.json
    core/
      auth.gs
      users.gs
      contacts.gs
      companies.gs
      deals.gs
      tasks.gs
      email_integration.gs
      calendar_integration.gs
    libs/
      uuid_lib.gs
      sheet_utils.gs
      validation.gs
  sheet/
    appsscript.json
    api/
      Api.gs
    web/
      index.html
      dashboard.html
      contacts.html
      admin.html
      static/
        main.html
        styles.html
```

## Prerequisites
- Google account with Drive/Sheets/Gmail/Calendar
- `@google/clasp` installed globally

## Drive assets to create
- Spreadsheet `crm-data` (store its ID)
- Optional Drive folder for backups (store its ID)

## Setup — Library project (standalone)
```
cd src/library
clasp create --type standalone --title "CRM Core Library" --rootDir ./
clasp push
```
Note the Script ID (Library ID). You will add this as a dependency in the sheet-bound project.

## Setup — Sheet-bound project
Attach to the `crm-data` spreadsheet:
```
cd ../sheet
clasp create --type sheets --title "CRM Sheet App" --rootDir ./
clasp push
```
Open the bound script (from the spreadsheet or Apps Script editor) and set Script Properties:
- `CRM_SPREADSHEET_ID`: <your crm-data spreadsheet id>
- `LIBRARY_ID`: <the Library Script ID> (used for reference in docs; binding is through manifest dependency)

## Add Library dependency to Sheet-bound manifest
In `src/sheet/appsscript.json`, add the library entry (after you know the Library Script ID):
```json
{
  "timeZone": "Etc/UTC",
  "dependencies": {
    "libraries": [
      {
        "userSymbol": "CrmLib",
        "libraryId": "<LIBRARY_SCRIPT_ID>",
        "version": "1",
        "developmentMode": true
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": { "access": "DOMAIN", "executeAs": "USER_ACCESSING" },
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
Then push:
```
clasp push
```

## Linking to Drive files
- Update the README with links:
  - crm-data sheet: `https://docs.google.com/spreadsheets/d/1ivvmw2sh4fUzyPdR8HRoLibebzhJL3n5lf-LTOp9jYM/edit`
  - backup folder (optional): `https://drive.google.com/drive/folders/<BACKUP_FOLDER_ID>`

## Initialize schema
Run from the Sheet-bound project (UI Admin button or editor):
- `CrmLib.initCrmSheets()` will create tabs and headers in the bound `crm-data`.

## Deploy Web App
- Open the sheet-bound script: Deploy > New deployment > Web app
  - Execute as: User accessing
  - Who has access: Your domain or specific users

## Development notes
- All business logic lives in Library (`src/library/core` and `src/library/libs`).
- The sheet-bound project only hosts UI and forwards calls to `CrmLib.*` methods.
- Version bump the library (Manage versions) and update dependency version when releasing.

## Quick Start for Demo

Once deployed, follow these steps:

1. **Open the Web App**: Click the deployment URL
2. **Initialize Database**: Go to Admin tab → Click "Initialize Sheets"
3. **Load Demo Data**: Click "Load Demo Data" to populate with sample contacts, companies, deals, and tasks
4. **Explore**: Navigate through Dashboard, Contacts, Companies, Deals, and Tasks

## Usage

### Dashboard
- View key metrics: total contacts, companies, open deals, pending tasks
- Quick navigation to all modules

### Contacts
- Add, edit, and view contact details
- Track lead scores and status
- Link contacts to companies
- Pagination for large datasets

### Companies
- Manage company information
- Track industry, website, phone, address
- Link multiple contacts to companies

### Deals
- Create and track sales opportunities
- Multiple pipeline stages: Prospect, Qualified, Proposal, Negotiation, Closed
- Track deal amount, probability, and close dates
- Status tracking: Open, Won, Lost

### Tasks
- Create and manage tasks
- Priority levels: Low, Medium, High
- Status tracking: Pending, In Progress, Completed
- Due date management

### Admin (Admin Role Only)
- Initialize database schema
- Load demo data
- Manage users and permissions
- View all users

## Data Structure

The CRM uses the following Google Sheets tabs:

- **Users**: User accounts and roles
- **Contacts**: Customer and lead information
- **Companies**: Organization records
- **Deals**: Sales pipeline and opportunities
- **Tasks**: Activities and follow-ups
- **Email_Log**: Email activity tracking (future)
- **Calendar_Events**: Meeting records (future)
- **Activity_Audit**: Change history (future)
- **Lists**: Custom filters (future)
- **Meta**: System configuration

## Security

- **Authentication**: Uses Google OAuth via Apps Script
- **Authorization**: Role-based access (Admin/User)
- **Permissions**: Admins can manage users and delete records; Users can create/edit their own records

## Troubleshooting

### Common Issues

**"Unauthorized" error**
- Ensure your email is added in the Users sheet with role Admin and active=TRUE
- Use the Admin panel to add yourself after initialization

**"CRM_SPREADSHEET_ID not set"**
- Go to Project Settings (gear icon) → Script Properties
- Add property: `CRM_SPREADSHEET_ID` with your spreadsheet ID

**Library not found**
- Ensure library is deployed: Deploy → Manage deployments
- Check `developmentMode: true` in appsscript.json
- Verify the library ID matches in both projects

**Invalid container type**
- Use `--type sheets` for sheet-bound project
- Use `--type standalone` for library project

**Changes not reflecting**
- Make a new deployment or update the existing deployment
- Clear browser cache
- Check that you pushed both library and sheet-bound projects

## Development Tips

- **Development Mode**: Keep `developmentMode: true` in library dependency while developing
- **Versioning**: Create new library versions for production deployments
- **Testing**: Test with demo data before using with real data
- **Backups**: Regularly backup your spreadsheet
- **Permissions**: Start with domain-restricted access, expand as needed

## Future Enhancements

- Email integration (send/log emails)
- Calendar integration (schedule meetings)
- Activity audit trail
- Custom list views and filters
- Export/import functionality
- Advanced reporting and analytics
- Mobile-responsive improvements
- Real-time collaboration features 