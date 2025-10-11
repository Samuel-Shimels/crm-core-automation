# Git Setup & Configuration Files Guide

## 🔒 What's Gitignored

Your `.gitignore` file now properly excludes sensitive and project-specific files:

### Files NOT Committed to Git

✅ **`.clasp.json`** - Contains your Apps Script project IDs (sensitive)  
✅ **`appsscript.json`** - Contains your library IDs and project settings  
✅ **`.clasprc.json`** - Your Google authentication credentials  
✅ **`.clasp.*.json`** - Deployment-specific configurations  

### Why These Are Gitignored

1. **Security** - Script IDs can be used to access your projects
2. **Environment-Specific** - Each developer has different project IDs
3. **Flexibility** - Dev, staging, and production use different IDs
4. **Privacy** - Authentication tokens should never be committed

---

## 📋 Template Files (Committed to Git)

Instead of actual configuration files, we provide **templates**:

✅ `.clasp.template.json` - Shows structure for `.clasp.json`  
✅ `appsscript.template.json` - Shows structure for `appsscript.json`  

These are **safe to commit** because they contain placeholders, not real IDs.

---

## 🚀 Setup for New Developers

When someone clones your repository:

### Step 1: Create Library Configuration

```bash
cd src/library

# Copy template to create actual file
cp .clasp.template.json .clasp.json
cp appsscript.template.json appsscript.json

# Edit .clasp.json - add your library script ID
# Edit appsscript.json - verify OAuth scopes (usually no changes needed)
```

### Step 2: Create Sheet Configuration

```bash
cd ../sheet

# Copy templates
cp .clasp.template.json .clasp.json
cp appsscript.template.json appsscript.json

# Edit .clasp.json - add your sheet-bound script ID
# Edit appsscript.json - add your library ID
```

### Step 3: Deploy

```bash
# If creating new projects
cd src/library
clasp create --type standalone --title "CRM Core Library"
# This creates .clasp.json automatically

cd ../sheet
clasp create --type sheets --parentId "YOUR_SPREADSHEET_ID"
# This creates .clasp.json automatically

# If using existing projects, manually edit .clasp.json with your script IDs
```

---

## 📁 File Organization

```
crm-core-automation/
├── .gitignore                          ✅ Committed
│
├── src/library/
│   ├── .clasp.json                     ❌ NOT committed (gitignored)
│   ├── .clasp.template.json            ✅ Committed (template)
│   ├── appsscript.json                 ❌ NOT committed (gitignored)
│   ├── appsscript.template.json        ✅ Committed (template)
│   └── core/*.js                       ✅ Committed (source code)
│
└── src/sheet/
    ├── .clasp.json                     ❌ NOT committed (gitignored)
    ├── .clasp.template.json            ✅ Committed (template)
    ├── appsscript.json                 ❌ NOT committed (gitignored)
    ├── appsscript.template.json        ✅ Committed (template)
    ├── index.html                      ✅ Committed (source code)
    └── Code.js                         ✅ Committed (source code)
```

---

## 🔧 Working with Multiple Environments

You can maintain different configurations for dev, staging, and production:

### Option 1: Multiple .clasp Files

```bash
# Development
.clasp.dev.json
.clasp.staging.json
.clasp.prod.json

# Use specific config
clasp push --config .clasp.dev.json
clasp push --config .clasp.prod.json
```

### Option 2: Branch-Specific Configs

```bash
# development branch
git checkout development
# Use dev library ID in appsscript.json

# main branch
git checkout main
# Use production library ID in appsscript.json
```

---

## ⚠️ Important Notes

### DO Commit:
- ✅ Source code (.js, .html files)
- ✅ Template files (.template.json)
- ✅ Documentation (.md files)
- ✅ .gitignore file

### DON'T Commit:
- ❌ .clasp.json (contains script IDs)
- ❌ appsscript.json (contains library IDs)
- ❌ .clasprc.json (contains auth tokens)
- ❌ node_modules/ (if using npm)
- ❌ .env files (environment variables)

---

## 🔐 Security Best Practices

1. **Never commit script IDs** - They can be used to access your projects
2. **Never commit .clasprc.json** - Contains OAuth tokens
3. **Use template files** - Provide structure without secrets
4. **Document setup** - Help new developers configure correctly
5. **Review commits** - Check what you're pushing before committing

---

## 📝 Quick Setup Checklist

When setting up the project:

- [ ] Clone repository
- [ ] Copy `.clasp.template.json` → `.clasp.json` in both directories
- [ ] Copy `appsscript.template.json` → `appsscript.json` in both directories
- [ ] Run `clasp create` or manually add script IDs
- [ ] Update library ID in sheet's `appsscript.json`
- [ ] Verify files are gitignored (run `git status`)
- [ ] Never commit actual .clasp.json or appsscript.json files

---

## 🧪 Verify Your Setup

Check that sensitive files are properly gitignored:

```bash
# List what would be committed
git status

# Should NOT see:
# ❌ .clasp.json
# ❌ appsscript.json
# ❌ .clasprc.json

# Should see:
# ✅ .clasp.template.json
# ✅ appsscript.template.json
# ✅ .gitignore
# ✅ Source code files (.js, .html)
```

---

## 💡 Pro Tips

1. **Always use templates** - When adding new projects, create templates first
2. **Document IDs separately** - Keep script IDs in password manager or docs
3. **Multiple developers** - Each has their own .clasp.json (not shared)
4. **CI/CD** - Use GitHub Secrets for automation
5. **Backup** - Keep backup of .clasp.json in secure location

---

## 🆘 Troubleshooting

### "File already exists" when creating .clasp.json

**Solution:** The template file exists, that's normal. Just edit it with your script ID.

### Accidentally committed .clasp.json

**Solution:**
```bash
# Remove from git (keeps local file)
git rm --cached src/library/.clasp.json
git rm --cached src/sheet/.clasp.json

# Commit the removal
git commit -m "Remove sensitive .clasp.json files"

# Verify .gitignore is working
git status  # Should not show .clasp.json
```

### Need to share project with team

**Solution:**
1. Commit code and templates
2. Share spreadsheet ID separately (email/docs)
3. Share library script ID separately
4. Each developer creates their own .clasp.json files
5. Or use clasp create for new deployments

---

## ✅ Your .gitignore is Now Secure

With the updated `.gitignore`:

✅ Sensitive files protected  
✅ Template files available for reference  
✅ Clean git history  
✅ Team collaboration ready  
✅ CI/CD compatible  

**Your project is now properly configured for version control!** 🎉

