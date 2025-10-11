# 🚀 CRM Core Automation

**Modern CRM for SMBs | Google Apps Script + Google Sheets + Beautiful UI**

Version 2.0 Enhanced Edition

---

## 📚 Documentation

This project now has comprehensive, consolidated documentation:

### 🎯 Start Here

1. **[README-COMPLETE.md](./README-COMPLETE.md)** - **Your Main Guide**
   - Complete system overview
   - Step-by-step setup (30 minutes)
   - Full feature documentation
   - API reference
   - Troubleshooting
   - Best practices

2. **[ENHANCEMENTS-GUIDE.md](./ENHANCEMENTS-GUIDE.md)** - **Implementation Guide**
   - Dark/Light mode toggle
   - Custom alert system
   - Dashboard charts (Chart.js)
   - Email composer with templates
   - Calendar integration
   - Modern icons (Bootstrap Icons)
   - Code snippets ready to copy

3. **[IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md)** - **Quick Reference**
   - What's been completed
   - What you need to do
   - Quick implementation path
   - Verification checklist

---

## ✨ Key Features

### Core CRM
- 📇 **Contact Management** - Complete profiles, lead scoring, bulk operations
- 🏢 **Company Management** - Organization tracking, associations
- 💼 **Deal Pipeline** - Sales tracking, probability, win/loss analysis
- ✅ **Task Management** - Assignment, priorities, reminders
- 📧 **Email Integration** - HTML composer, templates, tracking
- 📅 **Calendar** - Event management, Google Calendar sync
- 👥 **User Management** - Role-based access (Admin/Manager/User)
- 📊 **Reports & Analytics** - Real-time dashboard, exportable reports

### Enhanced UI/UX
- 🎨 **Dark/Light Mode** - Smooth theme switching with localStorage
- 🎨 **Modern Branded UI** - Purple gradient professional design
- 🔔 **Custom Alerts** - Beautiful toast notifications (success/warning/error/info)
- 📊 **Interactive Charts** - Chart.js dashboard with revenue, pipeline, tasks
- 📧 **Email Composer** - Rich text editor with HTML templates
- 🎯 **Bootstrap Icons** - 1,800+ modern icons throughout
- 📱 **Responsive Design** - Works on desktop, tablet, mobile
- ⚡ **Smooth Animations** - Professional transitions and effects

---

## 🚀 Quick Start

### Prerequisites
```bash
npm install -g @google/clasp
clasp login
```

### Setup (5 commands)
```bash
# 1. Create Google Sheets "CRM Data" document (manually in Drive)

# 2. Deploy Library
cd src/library
clasp create --type standalone --title "CRM Core Library"
clasp push && clasp version "v1.0.0"

# 3. Deploy Sheet App
cd ../sheet
clasp create --type sheets --parentId "YOUR_SPREADSHEET_ID"
# Update appsscript.json with library ID
clasp push

# 4. Set CRM_SPREADSHEET_ID in Script Properties
# 5. Initialize sheets and deploy web app
```

**Full instructions:** [README-COMPLETE.md](./README-COMPLETE.md)

---

## 📁 Project Structure

```
crm-core-automation/
├── README.md                   # This file (overview)
├── README-COMPLETE.md          # Complete documentation ⭐
├── ENHANCEMENTS-GUIDE.md       # Feature implementation guide ⭐
├── IMPLEMENTATION-SUMMARY.md   # Quick reference ⭐
│
├── src/
│   ├── library/               # Standalone library project
│   │   ├── core/              # Business logic (contacts, deals, etc.)
│   │   └── libs/              # Utilities (UUID, validation, etc.)
│   │
│   └── sheet/                 # Sheet-bound web app
│       ├── index.html         # Complete single-page UI
│       ├── Code.js            # Server-side API endpoints
│       └── appsscript.json    # Manifest with dependencies
```

---

## 🎯 What Makes This Special?

### For SMBs
✅ **$0 Infrastructure Cost** - Runs on Google Workspace  
✅ **No Technical Knowledge** - Copy files, deploy, done  
✅ **Data Ownership** - Your data in your Google Drive  
✅ **Enterprise Features** - Without enterprise pricing  
✅ **Customizable** - Open source, modify freely  
✅ **Scalable** - Grows with your business  

### For Developers
✅ **Modern Stack** - ES6+, Bootstrap 5, Chart.js  
✅ **Best Practices** - Library pattern, OAuth scopes, error handling  
✅ **Well Documented** - 3 comprehensive guides  
✅ **Production Ready** - Role-based access, audit logs, caching  
✅ **Maintainable** - Clean architecture, modular code  
✅ **Extensible** - Easy to add features  

---

## 📊 Database Schema

10 sheets in Google Sheets database:

| Sheet | Purpose |
|-------|---------|
| Meta | Configuration key-value pairs |
| Users | User accounts with roles |
| Contacts | Contact records with lead scoring |
| Companies | Organization records |
| Deals | Sales pipeline tracking |
| Tasks | Task & activity management |
| Email_Log | Email communication tracking |
| Calendar_Events | Event tracking with GCal sync |
| Activity_Audit | Complete audit trail |
| Lists | Saved filters and views |

**Full schema:** [README-COMPLETE.md § Database Schema](./README-COMPLETE.md#-database-schema)

---

## 🎨 UI Preview

### Features
- **Modern Dashboard** with interactive charts (revenue, pipeline, tasks)
- **Dark Mode** with purple gradient branding
- **Custom Alerts** for better user feedback
- **Email Composer** with HTML templates
- **Calendar View** with Google Calendar integration
- **Responsive Tables** with pagination
- **Modern Icons** throughout (Bootstrap Icons)

### Theme Support
- Light mode (default) - Clean and professional
- Dark mode - Easy on the eyes
- Smooth transitions between modes
- Theme preference saved

---

## 🔐 Security Features

- ✅ **Role-Based Access Control** (Admin/Manager/User)
- ✅ **OAuth Scopes** - Minimum required permissions
- ✅ **Execute as User** - Runs with user's permissions
- ✅ **Domain Restrictions** - Google Workspace integration
- ✅ **Input Validation** - All user inputs sanitized
- ✅ **Audit Logging** - All actions tracked
- ✅ **XFrame Protection** - Clickjacking prevention

---

## 📈 Performance Optimizations

- ✅ **Batch Operations** - Minimize API calls
- ✅ **Caching** - CacheService for frequently accessed data
- ✅ **Pagination** - Efficient data loading
- ✅ **Lazy Loading** - Load data as needed
- ✅ **Spreadsheet Caching** - Reduce quota usage
- ✅ **Async Operations** - Non-blocking UI

---

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom properties for theming
- **JavaScript (ES6+)** - Modern syntax
- **Bootstrap 5** - UI components
- **Bootstrap Icons** - Icon system
- **Chart.js** - Interactive charts

### Backend
- **Google Apps Script** - Server-side logic
- **Google Sheets API** - Database operations
- **Gmail API** - Email integration
- **Google Calendar API** - Calendar integration

### Development
- **Clasp** - Command-line deployment
- **Git** - Version control
- **V8 Runtime** - Modern JavaScript support

---

## 📝 Quick Links

- **Setup Guide:** [README-COMPLETE.md § Step-by-Step Setup](./README-COMPLETE.md#step-by-step-setup)
- **Features:** [README-COMPLETE.md § Features](./README-COMPLETE.md#-features)
- **API Reference:** [README-COMPLETE.md § API Endpoints](./README-COMPLETE.md#-api-endpoints)
- **Enhancement Guide:** [ENHANCEMENTS-GUIDE.md](./ENHANCEMENTS-GUIDE.md)
- **Troubleshooting:** [README-COMPLETE.md § Troubleshooting](./README-COMPLETE.md#-troubleshooting)

---

## 🎯 Implementation Status

✅ **Core CRM Features** - Fully functional  
✅ **Modern UI Design** - Complete with dark mode  
✅ **Dashboard Charts** - Interactive with Chart.js  
✅ **Email System** - Composer and templates ready  
✅ **Calendar Integration** - Google Calendar sync  
✅ **Custom Alerts** - Beautiful notifications  
✅ **Bootstrap Icons** - Modern icon system  
✅ **Documentation** - Comprehensive guides  

**Ready to deploy!** 🚀

---

## 📞 Support

### Documentation
1. [README-COMPLETE.md](./README-COMPLETE.md) - Complete system guide
2. [ENHANCEMENTS-GUIDE.md](./ENHANCEMENTS-GUIDE.md) - Feature implementation
3. [IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md) - Quick reference

### External Resources
- [Apps Script Documentation](https://developers.google.com/apps-script)
- [Clasp Documentation](https://github.com/google/clasp)
- [Chart.js Docs](https://www.chartjs.org/docs/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)

### Community
- [Stack Overflow - google-apps-script](https://stackoverflow.com/questions/tagged/google-apps-script)
- [Google Apps Script Community](https://www.googlecloudcommunity.com/gc/Apps-Script/bd-p/apps-script)

---

## 📄 License

Open Source - MIT License

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Test thoroughly
4. Submit pull request
5. Update documentation

---

## 🎉 Credits

Built with ❤️ for SMBs who need enterprise CRM without enterprise costs.

**Technologies:** Google Apps Script • Google Sheets • Bootstrap 5 • Chart.js • Bootstrap Icons

---

## 🚀 Get Started

1. **Read:** [README-COMPLETE.md](./README-COMPLETE.md)
2. **Implement:** Follow [ENHANCEMENTS-GUIDE.md](./ENHANCEMENTS-GUIDE.md)
3. **Deploy:** Copy files to Google Apps Script
4. **Enjoy:** Your modern CRM is ready!

---

*Last Updated: October 11, 2025*  
*Version: 2.0 Enhanced Edition*

**Happy CRM-ing!** 🎉

