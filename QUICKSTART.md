# CRM Core - Quick Start Guide

Get your CRM up and running in 10 minutes!

## What You'll Build

A fully-functional CRM web app with:
- 📇 Contact & Company Management
- 💰 Sales Pipeline (Deals)
- ✅ Task Management  
- 📊 Real-time Dashboard
- 👥 User Management

## Prerequisites

- Google account
- 10 minutes of your time

## Step-by-Step Setup

### 1️⃣ Create Your Database (1 min)

1. Go to [Google Sheets](https://sheets.google.com)
2. Create new spreadsheet: **"CRM Data"**
3. Copy the Spreadsheet ID from URL
   - Look for: `docs.google.com/spreadsheets/d/`**`YOUR_ID_HERE`**`/edit`

### 2️⃣ Deploy the Library (3 min)

1. Go to [Google Apps Script](https://script.google.com)
2. New Project → Name: **"CRM Core Library"**
3. Delete default `Code.gs`
4. Copy files from `src/library/` folder:
   ```
   📁 src/library/
   ├── appsscript.json
   ├── 📁 core/
   │   ├── init.gs
   │   ├── auth.gs
   │   ├── contacts.gs
   │   ├── companies.gs
   │   ├── deals.gs
   │   ├── tasks.gs
   │   └── users.gs
   └── 📁 libs/
       ├── sheet_utils.gs
       ├── uuid_lib.gs
       └── validation.gs
   ```
5. **Deploy** → **New deployment** → Type: **Library**
6. **Copy the Deployment ID** (you'll need this!)

### 3️⃣ Deploy the Web App (4 min)

1. Open your "CRM Data" spreadsheet
2. **Extensions** → **Apps Script**
3. Delete default `Code.gs`
4. Copy all files from `src/sheet/` folder:
   ```
   📁 src/sheet/
   ├── appsscript.json (⚠️ Update library ID here!)
   ├── 📁 api/
   │   └── Api.gs
   └── 📁 web/
       ├── index.html
       ├── dashboard.html
       ├── contacts.html
       ├── companies.html
       ├── deals.html
       ├── tasks.html
       ├── email.html
       ├── reports.html
       ├── admin.html
       └── 📁 static/
           ├── main.html
           └── styles.html
   ```

5. **Important:** Edit `appsscript.json`:
   - Find `"libraryId":`
   - Replace with your Library Deployment ID from Step 2

6. **Project Settings** (⚙️) → **Script Properties** → Add:
   - Property: `CRM_SPREADSHEET_ID`
   - Value: Your Spreadsheet ID from Step 1

7. **Deploy** → **New deployment** → Type: **Web app**
   - Execute as: **User accessing**
   - Access: **Anyone** (or your preference)
   - Click **Deploy**

8. **Authorize** when prompted

9. **Copy the Web App URL** 🎉

### 4️⃣ Initialize & Enjoy! (2 min)

1. Open the Web App URL
2. Go to **Admin** tab
3. Click **"Initialize Sheets"** ✅
4. Click **"Load Demo Data"** 📊
5. Explore!
   - **Dashboard** - See your stats
   - **Contacts** - 5 sample contacts
   - **Companies** - 3 sample companies
   - **Deals** - 4 sample deals ($230K pipeline!)
   - **Tasks** - 5 sample tasks

## 🎯 What to Try First

### Add Your First Contact
1. Go to **Contacts** tab
2. Click **"New Contact"**
3. Fill in details
4. Save!

### Create a Deal
1. Go to **Deals** tab  
2. Click **"New Deal"**
3. Enter deal details
4. Track it through stages!

### Manage Tasks
1. Go to **Tasks** tab
2. Create your first task
3. Set priority and due date
4. Mark it complete when done!

## 🎨 Customize Your CRM

### Change Colors
Edit `src/sheet/web/static/styles.html`:
```css
:root { 
  --brand: #0ea5e9;  /* Change this! */
}
```

### Add Your Logo
Edit `src/sheet/web/index.html`:
```html
<div class="text-xl font-semibold">CRM Core</div>
<!-- Replace with your logo -->
```

### Modify Fields
Add fields to entities in:
- `src/library/core/contacts.gs` (or companies.gs, deals.gs, tasks.gs)
- Update the `rowObj` structure
- Update UI forms in corresponding HTML files

## 🚀 Next Steps

### Invite Your Team
1. Go to **Admin** tab
2. Click **"New User"**
3. Enter email, name, role
4. Share the Web App URL

### Clean Up Demo Data
1. Open your spreadsheet
2. Manually delete demo rows (or clear sheets)
3. Start fresh!

### Backup Regularly
1. **File** → **Make a copy** (in Google Sheets)
2. Rename with date: "CRM Data - 2024-01-15"
3. Store safely

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Unauthorized" error | Add yourself in Users sheet as Admin |
| "Library not found" | Check library ID in appsscript.json |
| Changes not showing | Create new deployment version |
| "CRM_SPREADSHEET_ID not set" | Add it in Script Properties |

## 📚 Full Documentation

- **README.md** - Complete feature documentation
- **DEPLOYMENT.md** - Detailed deployment guide
- **CHANGES.md** - What's new and what's changed

## 💡 Pro Tips

✨ **Use Keyboard Shortcuts:**
- Navigate tabs with sidebar clicks
- Use Tab key in forms
- Press Enter to save in modals

✨ **Stay Organized:**
- Use consistent naming for companies
- Set realistic due dates on tasks
- Update deal stages regularly

✨ **Leverage Sheets:**
- Your data lives in Google Sheets
- Use Sheets' powerful features (filters, formulas, charts)
- Export data anytime via Sheets

## 🎉 You're Done!

You now have a fully-functional CRM running in your Google account!

**Share your success:**
- Show your team
- Customize it to your needs
- Build something amazing!

---

**Need Help?** Check the full documentation or troubleshooting guides.

**Want More?** See CHANGES.md for future enhancement ideas.
