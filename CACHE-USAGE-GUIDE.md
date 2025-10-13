# 📘 Cache Service Usage Guide

## Overview

The cache service is now available as a **utility library** that you can use when and where you need it, without automatic integration into core modules.

---

## ✅ Design Philosophy

### Opt-In Approach

The cache service provides powerful caching utilities, but **you decide** when and how to use them:

- ✅ **Core modules stay clean** - No built-in cache dependencies
- ✅ **Developer control** - Use cache where it makes sense
- ✅ **Flexible integration** - Add caching to custom APIs as needed
- ✅ **No forced overhead** - Cache only what benefits from it

---

## 🎯 When to Use Caching

### Good Use Cases ✅

| Scenario | Why Cache | TTL |
|----------|-----------|-----|
| User dropdowns | Rarely changes, frequently accessed | 6 hours |
| Company dropdowns | Rarely changes, frequently accessed | 6 hours |
| Dashboard stats | Expensive aggregations, can be slightly stale | 30 min |
| Filter preferences | User-specific, persist across sessions | 6 hours |
| Reports data | Slow queries, acceptable to be cached | 1-6 hours |

### Poor Use Cases ❌

| Scenario | Why NOT Cache |
|----------|---------------|
| Real-time updates | Users expect immediate reflection |
| Admin operations | Admins need current data |
| Recent activity | Freshness is critical |
| Small datasets | No performance benefit |
| Frequently changing data | Cache always stale |

---

## 💡 Implementation Patterns

### Pattern 1: Cached API Endpoint

Create separate cached versions of APIs:

```javascript
// Code.js

// Regular API (existing)
function listUsersApi(params) {
  const spreadsheetId = getCrmSheetId();
  const ss = SpreadsheetApp.openById(spreadsheetId);
  // ... regular implementation
}

// NEW: Cached version for dropdowns
function getCachedUsersForDropdownApi() {
  try {
    const spreadsheetId = getCrmSheetId();
    const users = CrmLib.getCachedUsers(spreadsheetId, false);
    return { success: true, users: users };
  } catch (error) {
    console.error('Cache error:', error);
    // Fallback to regular API
    return listUsersApi({ pageSize: 100 });
  }
}
```

### Pattern 2: Cache with Fallback

Always provide fallback to direct reads:

```javascript
function getDashboardStatsWithCache() {
  try {
    const spreadsheetId = getCrmSheetId();
    
    // Try cache first
    if (typeof CrmLib !== 'undefined' && CrmLib.getCachedDashboardStats) {
      return CrmLib.getCachedDashboardStats(spreadsheetId, false);
    }
    
    // Fallback to direct calculation
    return calculateStatsDirectly(spreadsheetId);
  } catch (error) {
    console.error('Error:', error);
    return calculateStatsDirectly(spreadsheetId);
  }
}
```

### Pattern 3: Manual Invalidation

Invalidate cache when data changes:

```javascript
function saveContactWithInvalidation(contact) {
  try {
    const spreadsheetId = getCrmSheetId();
    
    // Save the contact (regular operation)
    const result = saveContactApi(contact);
    
    if (result.success) {
      // Invalidate affected caches
      if (typeof CrmLib !== 'undefined' && CrmLib.invalidateRelatedCaches) {
        CrmLib.invalidateRelatedCaches('contact');
      }
    }
    
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Pattern 4: User Preferences

Cache user-specific settings:

```javascript
// Save user filters
function saveUserFilters(filterType, filters) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib.setUserFilters) {
      CrmLib.setUserFilters(filterType, filters);
      return { success: true };
    }
    return { success: false, error: 'Cache not available' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Load user filters
function getUserFilters(filterType) {
  try {
    if (typeof CrmLib !== 'undefined' && CrmLib.getUserFilters) {
      const filters = CrmLib.getUserFilters(filterType);
      return { success: true, filters: filters };
    }
    return { success: false, filters: {} };
  } catch (error) {
    return { success: false, filters: {} };
  }
}
```

---

## 🔧 Available Cache Functions

### Script Cache (Shared)

```javascript
// Get cached users list
const users = CrmLib.getCachedUsers(spreadsheetId, forceRefresh);

// Get cached companies list
const companies = CrmLib.getCachedCompanies(spreadsheetId, forceRefresh);

// Get cached dashboard stats (30-min TTL)
const stats = CrmLib.getCachedDashboardStats(spreadsheetId, forceRefresh);
```

### User Cache (Per-User)

```javascript
// Get user profile
const profile = CrmLib.getCachedUserProfile(spreadsheetId, email, forceRefresh);

// Get user's contacts
const contacts = CrmLib.getCachedUserContacts(spreadsheetId, userId, forceRefresh);

// Get user's deals
const deals = CrmLib.getCachedUserDeals(spreadsheetId, userId, forceRefresh);

// Save/load filters
CrmLib.setUserFilters(filterType, filters);
const filters = CrmLib.getUserFilters(filterType);
```

### Cache Management

```javascript
// Warm cache (preload frequently accessed data)
CrmLib.warmCache(spreadsheetId);

// Invalidate specific caches
CrmLib.invalidateRelatedCaches('user');
CrmLib.invalidateRelatedCaches('company');
CrmLib.invalidateRelatedCaches('contact');

// Clear all caches
CrmLib.clearCache('script');  // Script cache only
CrmLib.clearCache('user');    // User cache only
CrmLib.clearCache('all');     // All caches
```

### Generic Cache Operations

```javascript
// Get cached data with custom fetcher
const data = CrmLib.getCached('script', 'my_key', function() {
  // Fetch fresh data
  return fetchMyData();
}, 3600); // 1 hour TTL

// Put data directly into cache
CrmLib.putCache('user', 'my_key', myData, 3600);

// Invalidate specific keys
CrmLib.invalidateCache('script', 'my_key');
CrmLib.invalidateCache('script', ['key1', 'key2']);
```

---

## 📋 Implementation Checklist

### For Each Cached Feature

- [ ] Identify what data to cache
- [ ] Determine appropriate cache type (Script vs User)
- [ ] Choose TTL based on data freshness needs
- [ ] Create cached API endpoint
- [ ] Add fallback to direct read
- [ ] Add cache invalidation on updates (if needed)
- [ ] Test cache hit and miss scenarios
- [ ] Document usage for other developers

---

## 🎯 Example: Adding Cache to Dashboard

### Step 1: Create Cached Stats API

```javascript
// Code.js

function getCachedDashboardStatsApi() {
  try {
    const spreadsheetId = getCrmSheetId();
    
    // Try cache first
    const stats = CrmLib.getCachedDashboardStats(spreadsheetId, false);
    return stats;
  } catch (error) {
    console.error('Cache error:', error);
    // Fallback to regular stats
    return getStatsApi();
  }
}
```

### Step 2: Update Frontend

```javascript
// index.html

function loadDashboard() {
  // Use cached version for faster load
  google.script.run
    .withSuccessHandler(function(stats) {
      updateDashboardUI(stats);
    })
    .withFailureHandler(function(error) {
      console.error('Error:', error);
      // Fallback to regular API
      google.script.run
        .withSuccessHandler(updateDashboardUI)
        .getStatsApi();
    })
    .getCachedDashboardStatsApi();
}
```

### Step 3: Add Refresh Button

```html
<button onclick="refreshDashboard()">
  <i class="bi bi-arrow-clockwise"></i> Refresh
</button>
```

```javascript
function refreshDashboard() {
  // Force refresh from source
  google.script.run
    .withSuccessHandler(function(stats) {
      updateDashboardUI(stats);
      
      // Also invalidate cache
      google.script.run.invalidateDashboardCacheApi();
    })
    .getStatsApi();
}

// Add to Code.js
function invalidateDashboardCacheApi() {
  try {
    CrmLib.invalidateCache('script', 'dashboard_stats');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

---

## 🔍 Debugging Cache

### Check Cache Status

```javascript
function debugCache() {
  const spreadsheetId = getCrmSheetId();
  
  Logger.log('=== Cache Debug ===');
  
  // Test Script Cache
  try {
    const users = CrmLib.getCachedUsers(spreadsheetId, false);
    Logger.log('Users cached: ' + users.length);
  } catch (e) {
    Logger.log('Users cache error: ' + e.message);
  }
  
  // Test User Cache
  try {
    const email = Session.getActiveUser().getEmail();
    const profile = CrmLib.getCachedUserProfile(spreadsheetId, email, false);
    Logger.log('Profile cached: ' + profile.display_name);
  } catch (e) {
    Logger.log('Profile cache error: ' + e.message);
  }
  
  Logger.log('=== Debug Complete ===');
}
```

### Clear Cache for Testing

```javascript
function clearAllCacheForTesting() {
  try {
    CrmLib.clearCache('all');
    Logger.log('All caches cleared');
    return { success: true };
  } catch (error) {
    Logger.log('Clear cache error: ' + error.message);
    return { success: false, error: error.message };
  }
}
```

---

## 📊 Performance Tips

### 1. Cache Expensive Operations

```javascript
// Before: Slow aggregation every time
function getCompanyStats(companyId) {
  // ... expensive calculations
}

// After: Cache the result
function getCompanyStats(companyId) {
  const cacheKey = 'company_stats_' + companyId;
  
  return CrmLib.getCached('script', cacheKey, function() {
    // ... expensive calculations
    return calculatedStats;
  }, 1800); // 30 minutes
}
```

### 2. Batch Cache Loading

```javascript
// Warm multiple caches at once
function warmDashboardCaches() {
  const spreadsheetId = getCrmSheetId();
  
  CrmLib.getCachedUsers(spreadsheetId, true);
  CrmLib.getCachedCompanies(spreadsheetId, true);
  CrmLib.getCachedDashboardStats(spreadsheetId, true);
  
  return { success: true, message: 'Caches warmed' };
}
```

### 3. Smart TTL Selection

```javascript
// Frequently changing: Short TTL
CrmLib.putCache('script', 'recent_activity', data, 300); // 5 min

// Rarely changing: Long TTL
CrmLib.putCache('script', 'company_list', data, 21600); // 6 hours

// User preferences: Long TTL
CrmLib.putCache('user', 'preferences', prefs, 86400); // 24 hours
```

---

## ✅ Best Practices

### DO ✅

- Use cache for expensive operations
- Always provide fallback to direct reads
- Choose appropriate TTL for each data type
- Cache shared data in Script Cache
- Cache personal data in User Cache
- Test both cache hit and miss scenarios

### DON'T ❌

- Cache sensitive data (passwords, tokens)
- Cache data that must be real-time
- Cache without fallback
- Forget to invalidate after updates
- Use overly long TTLs for changing data
- Cache data larger than 100KB

---

## 🎓 Summary

The cache service is a **powerful utility** that you can use when and where it makes sense:

1. **Identify** what would benefit from caching
2. **Create** cached API endpoints as needed
3. **Add** fallback to regular APIs
4. **Invalidate** cache when data changes
5. **Test** thoroughly with both cache hit and miss

**You're in control!** Use caching strategically for maximum benefit. 🚀

---

**Questions?** Check [CACHE-IMPLEMENTATION.md](CACHE-IMPLEMENTATION.md) for full API reference.

