# ⚡ Performance Testing & Verification

## Test Your Cache Performance

Use these methods to verify your cache is working and measure improvements.

---

## 🧪 Quick Test (In Browser Console)

### 1. Check Dashboard Load Time

Open your CRM web app, open browser console (F12), and navigate to Dashboard.

**You should see:**
```
⚡ Dashboard loaded in 234ms (from cache)
```

**Expected times:**
- **First load (cache miss):** 1000-2000ms
- **Cached load (cache hit):** 100-500ms
- **Quick stats load:** 50-200ms

---

## 🔍 Verify Cache is Working

### Method 1: Console Logs

After deploying, check console for these messages:

```javascript
// After login:
✅ Cache preloaded in 1523ms
Warming cache...
✓ Dashboard stats cached
✓ Users cached
✓ Companies cached
✓ User profile cached
✓ User data cached
Cache warming completed in 1523ms

// On dashboard load:
⚡ Dashboard loaded in 234ms (from cache)

// On contacts page:
Contacts loaded from cache

// On companies page:
Companies loaded from cache

// On deals page:
Deals loaded from cache

// On tasks page:
Tasks loaded from cache
```

### Method 2: Network Tab

1. Open DevTools → Network tab
2. Navigate to Dashboard
3. Check the `getQuickStatsApi` or `getCachedStatsApi` call
4. **Time should be < 500ms**

---

## 📊 Performance Comparison

### Test Scenario: Dashboard Load

**Before Caching:**
```
Request to getStatsApi:
- Sheet opens: 200ms
- Read Contacts: 300ms
- Read Companies: 300ms
- Read Deals: 800ms
- Read Tasks: 600ms
- Process data: 200ms
Total: ~2400ms (2.4 seconds)
```

**After Caching (First Load):**
```
Request to getQuickStatsApi:
- Check cache: MISS
- Row counts only: 150ms
- Store in cache: 50ms
Total: ~200ms (0.2 seconds)
Background full stats: 1000ms
```

**After Caching (Subsequent Loads):**
```
Request to getQuickStatsApi:
- Check cache: HIT
- Return cached data: 50ms
Total: ~50ms (0.05 seconds)
```

**Improvement: 95-98% faster!** ⚡

---

## 🎯 Benchmark Tests

### Run in Apps Script Console

```javascript
function benchmarkCache() {
  const spreadsheetId = PropertiesService.getScriptProperties()
    .getProperty('CRM_SPREADSHEET_ID');
  
  Logger.log('=== Cache Performance Benchmark ===');
  Logger.log('');
  
  // Test 1: Quick Stats (ultra-fast)
  const quickStart = new Date().getTime();
  const quickStats = CrmLib.getQuickDashboardStats(spreadsheetId);
  const quickTime = new Date().getTime() - quickStart;
  Logger.log('Quick Stats: ' + quickTime + 'ms');
  Logger.log('  contacts: ' + quickStats.contacts);
  Logger.log('  companies: ' + quickStats.companies);
  
  // Test 2: Cached Stats (optimized)
  const cachedStart = new Date().getTime();
  const cachedStats = CrmLib.getCachedDashboardStats(spreadsheetId, false);
  const cachedTime = new Date().getTime() - cachedStart;
  Logger.log('');
  Logger.log('Cached Stats: ' + cachedTime + 'ms');
  Logger.log('  openDeals: ' + cachedStats.openDeals);
  Logger.log('  totalDealValue: $' + cachedStats.totalDealValue);
  Logger.log('  pendingTasks: ' + cachedStats.pendingTasks);
  
  // Test 3: Warm Cache
  const warmStart = new Date().getTime();
  const warmResult = CrmLib.warmCache(spreadsheetId);
  const warmTime = new Date().getTime() - warmStart;
  Logger.log('');
  Logger.log('Cache Warming: ' + warmTime + 'ms');
  
  // Test 4: Cached Users
  const usersStart = new Date().getTime();
  const users = CrmLib.getCachedUsers(spreadsheetId, false);
  const usersTime = new Date().getTime() - usersStart;
  Logger.log('');
  Logger.log('Cached Users: ' + usersTime + 'ms (' + users.length + ' users)');
  
  // Test 5: Cached Companies
  const companiesStart = new Date().getTime();
  const companies = CrmLib.getCachedCompanies(spreadsheetId, false);
  const companiesTime = new Date().getTime() - companiesStart;
  Logger.log('Cached Companies: ' + companiesTime + 'ms (' + companies.length + ' companies)');
  
  Logger.log('');
  Logger.log('=== Benchmark Complete ===');
  Logger.log('Quick Stats: ' + quickTime + 'ms');
  Logger.log('Cached Stats: ' + cachedTime + 'ms');
  Logger.log('Cache Warm: ' + warmTime + 'ms');
  Logger.log('Cached Users: ' + usersTime + 'ms');
  Logger.log('Cached Companies: ' + companiesTime + 'ms');
}
```

**Expected Results:**
```
=== Cache Performance Benchmark ===

Quick Stats: 150-300ms (first time)
Quick Stats: 10-50ms (cached)
Cached Stats: 500-1500ms (first time)
Cached Stats: 10-50ms (cached)
Cache Warm: 2000-4000ms
Cached Users: 10-50ms (cached)
Cached Companies: 10-50ms (cached)
```

---

## ✅ Success Criteria

### Dashboard Performance
- [ ] **First load:** < 2 seconds
- [ ] **Cached load:** < 500ms
- [ ] **Quick stats load:** < 300ms

### List Pages
- [ ] **Contacts:** < 1 second
- [ ] **Companies:** < 1 second
- [ ] **Deals:** < 1 second
- [ ] **Tasks:** < 1 second

### Console Messages
- [ ] "Cache preloaded" after login
- [ ] "Dashboard loaded from cache" on dashboard
- [ ] "loaded from cache" for lists
- [ ] No cache errors

---

## 🐛 If Performance is Still Slow

### Diagnostic Steps

1. **Check Cache is Enabled:**
   ```javascript
   // In Apps Script console
   function testCache() {
     const spreadsheetId = PropertiesService.getScriptProperties()
       .getProperty('CRM_SPREADSHEET_ID');
     
     const stats = CrmLib.getCachedDashboardStats(spreadsheetId, false);
     Logger.log('Cache test: ' + JSON.stringify(stats));
   }
   ```

2. **Check Browser Console:**
   - Should see "loaded from cache" messages
   - Should NOT see multiple sheet read operations
   - Time stamps should be < 500ms

3. **Force Clear Cache:**
   ```javascript
   // In browser console
   google.script.run.clearCacheApi('all');
   // Then reload page
   ```

4. **Check Library Version:**
   - Ensure library v2.0.0 is deployed
   - Verify `appsscript.json` has correct version
   - Try `developmentMode: true` to test latest code

---

## 📈 Performance Monitoring

### Add to index.html for ongoing monitoring:

```javascript
// Add this function to track performance
function logPerformance(operation, startTime) {
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  
  const color = duration < 500 ? 'green' : duration < 1000 ? 'orange' : 'red';
  console.log('%c⚡ ' + operation + ': ' + duration + 'ms', 'color: ' + color + '; font-weight: bold');
  
  return duration;
}

// Usage:
function initDashboard() {
  const start = performance.now();
  google.script.run
    .withSuccessHandler(function(stats) {
      logPerformance('Dashboard load', start);
      // ... display stats
    })
    .getQuickStatsApi();
}
```

---

## 🎯 Expected Improvements

| Operation | Before | After (Cached) | Improvement |
|-----------|--------|----------------|-------------|
| Dashboard | 2-4s | 0.1-0.5s | **90-95%** ⚡ |
| Contact List | 1-2s | 0.1-0.3s | **85-90%** ⚡ |
| Company List | 1-2s | 0.1-0.3s | **85-90%** ⚡ |
| Deal List | 1-2s | 0.1-0.3s | **85-90%** ⚡ |
| Task List | 1-2s | 0.1-0.3s | **85-90%** ⚡ |

---

## 🔧 Troubleshooting Slow Performance

### Issue: Still Taking 4+ Seconds

**Possible Causes:**

1. **Cache not deployed:** Library doesn't have cache_service.js
   - Solution: Run `clasp push` in library folder

2. **Library version outdated:** Sheet using old version
   - Solution: Update `appsscript.json` version to 2

3. **Cache not being hit:** Check console for cache messages
   - Solution: Run `warmCacheApi()` manually

4. **Large dataset:** Too much data to cache efficiently
   - Solution: Data is being cached now, should be faster after first load

5. **Network latency:** Slow connection to Google servers
   - Cannot be fixed with cache, but subsequent loads will be faster

### Diagnostic Commands

```javascript
// In Apps Script console
function diagnosePerformance() {
  const spreadsheetId = PropertiesService.getScriptProperties()
    .getProperty('CRM_SPREADSHEET_ID');
  
  // Test 1: Check cache service exists
  if (typeof CrmLib === 'undefined') {
    Logger.log('❌ CrmLib not available');
    return;
  }
  Logger.log('✅ CrmLib available');
  
  if (!CrmLib.getCachedDashboardStats) {
    Logger.log('❌ Cache functions missing');
    return;
  }
  Logger.log('✅ Cache functions available');
  
  // Test 2: Measure performance
  const start = new Date().getTime();
  const stats = CrmLib.getQuickDashboardStats(spreadsheetId);
  const time = new Date().getTime() - start;
  
  Logger.log('Quick stats time: ' + time + 'ms');
  if (time < 300) {
    Logger.log('✅ EXCELLENT performance');
  } else if (time < 1000) {
    Logger.log('⚠️  ACCEPTABLE performance');
  } else {
    Logger.log('❌ SLOW - needs optimization');
  }
  
  // Test 3: Check data size
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const contacts = ss.getSheetByName('Contacts').getLastRow() - 1;
  const companies = ss.getSheetByName('Companies').getLastRow() - 1;
  const deals = ss.getSheetByName('Deals').getLastRow() - 1;
  const tasks = ss.getSheetByName('Tasks').getLastRow() - 1;
  
  Logger.log('');
  Logger.log('Data size:');
  Logger.log('  Contacts: ' + contacts);
  Logger.log('  Companies: ' + companies);
  Logger.log('  Deals: ' + deals);
  Logger.log('  Tasks: ' + tasks);
  
  const total = contacts + companies + deals + tasks;
  Logger.log('  Total rows: ' + total);
  
  if (total > 10000) {
    Logger.log('⚠️  Large dataset - consider archiving old data');
  }
}
```

---

## ✅ Verification Checklist

After deployment:

- [ ] Dashboard loads in < 500ms (check console)
- [ ] Console shows "loaded from cache" messages
- [ ] List pages load in < 1 second
- [ ] Save operations show cache invalidation
- [ ] No cache errors in console
- [ ] Run `benchmarkCache()` - all tests pass
- [ ] Run `diagnosePerformance()` - shows EXCELLENT

---

**If all checks pass, your cache is working optimally!** 🚀

**If checks fail, follow troubleshooting steps above.**

