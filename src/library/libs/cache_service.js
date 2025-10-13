/**
 * CRM Library - Cache Service
 * 
 * Provides caching utilities for optimizing CRM performance:
 * - Script Cache: Shared data across all users (6 hours)
 * - User Cache: Per-user personalized data (6 hours)
 * - Document Cache: Container-bound caching (rarely used in web apps)
 * 
 * Usage:
 *   const users = CrmLib.getCachedUsers(spreadsheetId);
 *   CrmLib.invalidateCache('users');
 *   CrmLib.warmCache(spreadsheetId);
 */

var CrmLib = (function(ns) {
  const self = ns || {};

  // Cache configuration constants
  const CACHE_EXPIRY = 21600; // 6 hours in seconds
  const CACHE_PREFIX = 'crm_';
  
  /**
   * Cache key generators
   */
  self.getCacheKey_ = function(key) {
    return CACHE_PREFIX + key;
  };

  /**
   * Get Script Cache instance (shared across all users)
   * Use for: users list, companies list, common CRM data
   */
  self.getScriptCache_ = function() {
    return CacheService.getScriptCache();
  };

  /**
   * Get User Cache instance (per-user)
   * Use for: personalized dashboards, last filters, user preferences
   */
  self.getUserCache_ = function() {
    return CacheService.getUserCache();
  };

  /**
   * Get Document Cache instance (container-bound)
   * Rarely used in web apps, but available
   */
  self.getDocumentCache_ = function() {
    return CacheService.getDocumentCache();
  };

  /**
   * Generic cache get with fallback to fetcher function
   * @param {string} cacheType - 'script', 'user', or 'document'
   * @param {string} key - Cache key
   * @param {function} fetcher - Function to call if cache miss
   * @param {number} ttl - Time to live in seconds (default: 6 hours)
   */
  self.getCached = function(cacheType, key, fetcher, ttl) {
    ttl = ttl || CACHE_EXPIRY;
    const fullKey = self.getCacheKey_(key);
    
    let cache;
    switch(cacheType) {
      case 'script':
        cache = self.getScriptCache_();
        break;
      case 'user':
        cache = self.getUserCache_();
        break;
      case 'document':
        cache = self.getDocumentCache_();
        break;
      default:
        throw new Error('Invalid cache type: ' + cacheType);
    }
    
    try {
      const cached = cache.get(fullKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Cache read error for key ' + fullKey + ':', e);
    }
    
    // Cache miss - fetch fresh data
    const freshData = fetcher();
    
    try {
      cache.put(fullKey, JSON.stringify(freshData), ttl);
    } catch (e) {
      console.warn('Cache write error for key ' + fullKey + ':', e);
    }
    
    return freshData;
  };

  /**
   * Put data directly into cache
   */
  self.putCache = function(cacheType, key, data, ttl) {
    ttl = ttl || CACHE_EXPIRY;
    const fullKey = self.getCacheKey_(key);
    
    let cache;
    switch(cacheType) {
      case 'script':
        cache = self.getScriptCache_();
        break;
      case 'user':
        cache = self.getUserCache_();
        break;
      case 'document':
        cache = self.getDocumentCache_();
        break;
      default:
        throw new Error('Invalid cache type: ' + cacheType);
    }
    
    try {
      cache.put(fullKey, JSON.stringify(data), ttl);
      return true;
    } catch (e) {
      console.warn('Cache write error for key ' + fullKey + ':', e);
      return false;
    }
  };

  /**
   * Invalidate cache entries
   * @param {string} cacheType - 'script', 'user', 'document', or 'all'
   * @param {string|array} keys - Cache key(s) to invalidate
   */
  self.invalidateCache = function(cacheType, keys) {
    if (!keys) return;
    
    const keyArray = Array.isArray(keys) ? keys : [keys];
    const fullKeys = keyArray.map(k => self.getCacheKey_(k));
    
    const caches = [];
    if (cacheType === 'all') {
      caches.push(self.getScriptCache_(), self.getUserCache_(), self.getDocumentCache_());
    } else {
      switch(cacheType) {
        case 'script':
          caches.push(self.getScriptCache_());
          break;
        case 'user':
          caches.push(self.getUserCache_());
          break;
        case 'document':
          caches.push(self.getDocumentCache_());
          break;
      }
    }
    
    caches.forEach(function(cache) {
      try {
        cache.removeAll(fullKeys);
      } catch (e) {
        console.warn('Cache invalidation error:', e);
      }
    });
  };

  /**
   * Clear all cache entries for a cache type
   */
  self.clearCache = function(cacheType) {
    try {
      switch(cacheType) {
        case 'script':
          self.getScriptCache_().removeAll(self.getScriptCache_().getAll());
          break;
        case 'user':
          self.getUserCache_().removeAll(self.getUserCache_().getAll());
          break;
        case 'document':
          self.getDocumentCache_().removeAll(self.getDocumentCache_().getAll());
          break;
        case 'all':
          self.getScriptCache_().removeAll(self.getScriptCache_().getAll());
          self.getUserCache_().removeAll(self.getUserCache_().getAll());
          self.getDocumentCache_().removeAll(self.getDocumentCache_().getAll());
          break;
      }
      return { success: true };
    } catch (e) {
      console.error('Cache clear error:', e);
      return { success: false, error: e.message };
    }
  };

  // ========================================
  // CACHED DATA FETCHERS
  // ========================================

  /**
   * Get cached users list (Script Cache - shared)
   * Ideal for dropdowns, user assignment selectors
   */
  self.getCachedUsers = function(spreadsheetId, forceRefresh) {
    if (forceRefresh) {
      self.invalidateCache('script', 'users_list');
    }
    
    return self.getCached('script', 'users_list', function() {
      const data = self.getSheetValues(spreadsheetId, 'Users');
      const headers = data.headers;
      return data.rows.map(function(r) {
        const o = {};
        headers.forEach(function(h, i) {
          o[h] = r[i];
        });
        // Only return essential fields for dropdowns
        return {
          user_id: o.user_id,
          email: o.email,
          display_name: o.display_name,
          role: o.role,
          active: o.active === true || String(o.active).toLowerCase() === 'true'
        };
      }).filter(function(u) {
        return u.active; // Only active users
      });
    });
  };

  /**
   * Get cached companies list (Script Cache - shared)
   * Ideal for dropdowns, company assignment selectors
   */
  self.getCachedCompanies = function(spreadsheetId, forceRefresh) {
    if (forceRefresh) {
      self.invalidateCache('script', 'companies_list');
    }
    
    return self.getCached('script', 'companies_list', function() {
      const data = self.getSheetValues(spreadsheetId, 'Companies');
      const headers = data.headers;
      return data.rows.map(function(r) {
        const o = {};
        headers.forEach(function(h, i) {
          o[h] = r[i];
        });
        // Return essential fields only
        return {
          company_id: o.company_id,
          name: o.name,
          industry: o.industry
        };
      });
    });
  };

  /**
   * Get cached dashboard stats (Script Cache - shared)
   * OPTIMIZED: Uses efficient counting and batch operations
   */
  self.getCachedDashboardStats = function(spreadsheetId, forceRefresh) {
    if (forceRefresh) {
      self.invalidateCache('script', 'dashboard_stats');
    }
    
    return self.getCached('script', 'dashboard_stats', function() {
      const startTime = new Date().getTime();
      const ss = SpreadsheetApp.openById(spreadsheetId);
      
      // Quick row counts (very fast)
      const contactsSheet = ss.getSheetByName('Contacts');
      const companiesSheet = ss.getSheetByName('Companies');
      const dealsSheet = ss.getSheetByName('Deals');
      const tasksSheet = ss.getSheetByName('Tasks');
      
      const contactsCount = contactsSheet ? Math.max(0, contactsSheet.getLastRow() - 1) : 0;
      const companiesCount = companiesSheet ? Math.max(0, companiesSheet.getLastRow() - 1) : 0;
      
      let totalDealValue = 0;
      let openDeals = 0;
      
      // OPTIMIZED: Only read necessary columns for deals
      if (dealsSheet && dealsSheet.getLastRow() > 1) {
        const headers = dealsSheet.getRange(1, 1, 1, dealsSheet.getLastColumn()).getValues()[0];
        const statusIdx = headers.indexOf('status');
        const amountIdx = headers.indexOf('amount');
        
        if (statusIdx >= 0 && amountIdx >= 0) {
          // Only read status and amount columns (much faster than full range)
          const lastRow = dealsSheet.getLastRow();
          const statusValues = dealsSheet.getRange(2, statusIdx + 1, lastRow - 1, 1).getValues();
          const amountValues = dealsSheet.getRange(2, amountIdx + 1, lastRow - 1, 1).getValues();
          
          for (let i = 0; i < statusValues.length; i++) {
            if (statusValues[i][0] === 'Open') {
              openDeals++;
              totalDealValue += Number(amountValues[i][0]) || 0;
            }
          }
        }
      }
      
      let pendingTasks = 0;
      
      // OPTIMIZED: Only read status column for tasks
      if (tasksSheet && tasksSheet.getLastRow() > 1) {
        const headers = tasksSheet.getRange(1, 1, 1, tasksSheet.getLastColumn()).getValues()[0];
        const statusIdx = headers.indexOf('status');
        
        if (statusIdx >= 0) {
          const lastRow = tasksSheet.getLastRow();
          const statusValues = tasksSheet.getRange(2, statusIdx + 1, lastRow - 1, 1).getValues();
          
          for (let i = 0; i < statusValues.length; i++) {
            const status = statusValues[i][0];
            if (status === 'Pending' || status === 'In Progress') {
              pendingTasks++;
            }
          }
        }
      }
      
      const endTime = new Date().getTime();
      const executionTime = endTime - startTime;
      
      console.log('Dashboard stats calculated in ' + executionTime + 'ms');
      
      return {
        contacts: contactsCount,
        companies: companiesCount,
        openDeals: openDeals,
        totalDealValue: totalDealValue,
        pendingTasks: pendingTasks,
        lastUpdated: new Date().toISOString(),
        executionTime: executionTime
      };
    }, 3600); // 1 hour TTL for stats (increased from 30 min)
  };

  /**
   * Get current user profile (User Cache - per-user)
   * Reduces repeated user lookups
   */
  self.getCachedUserProfile = function(spreadsheetId, email, forceRefresh) {
    if (forceRefresh) {
      self.invalidateCache('user', 'user_profile');
    }
    
    return self.getCached('user', 'user_profile', function() {
      return self.findUserByEmail(spreadsheetId, email);
    });
  };

  /**
   * Get user's recent contacts (User Cache - per-user)
   */
  self.getCachedUserContacts = function(spreadsheetId, userId, forceRefresh) {
    if (forceRefresh) {
      self.invalidateCache('user', 'user_contacts_' + userId);
    }
    
    return self.getCached('user', 'user_contacts_' + userId, function() {
      const data = self.getSheetValues(spreadsheetId, 'Contacts');
      const headers = data.headers;
      const ownerIdx = headers.indexOf('owner_user_id');
      
      return data.rows
        .filter(function(r) {
          return String(r[ownerIdx]) === String(userId);
        })
        .map(function(r) {
          const o = {};
          headers.forEach(function(h, i) {
            o[h] = r[i];
          });
          return o;
        })
        .slice(0, 50); // Limit to 50 most recent
    }, 3600); // 1 hour TTL
  };

  /**
   * Get user's recent deals (User Cache - per-user)
   */
  self.getCachedUserDeals = function(spreadsheetId, userId, forceRefresh) {
    if (forceRefresh) {
      self.invalidateCache('user', 'user_deals_' + userId);
    }
    
    return self.getCached('user', 'user_deals_' + userId, function() {
      const data = self.getSheetValues(spreadsheetId, 'Deals');
      const headers = data.headers;
      const ownerIdx = headers.indexOf('owner_user_id');
      
      return data.rows
        .filter(function(r) {
          return String(r[ownerIdx]) === String(userId);
        })
        .map(function(r) {
          const o = {};
          headers.forEach(function(h, i) {
            o[h] = r[i];
          });
          return o;
        })
        .slice(0, 50); // Limit to 50 most recent
    }, 3600); // 1 hour TTL
  };

  /**
   * Get user's last applied filters (User Cache - per-user)
   */
  self.getUserFilters = function(filterType) {
    const key = 'filters_' + filterType;
    try {
      const cache = self.getUserCache_();
      const cached = cache.get(self.getCacheKey_(key));
      return cached ? JSON.parse(cached) : {};
    } catch (e) {
      console.warn('Error getting user filters:', e);
      return {};
    }
  };

  /**
   * Save user's filters (User Cache - per-user)
   */
  self.setUserFilters = function(filterType, filters) {
    const key = 'filters_' + filterType;
    try {
      const cache = self.getUserCache_();
      cache.put(self.getCacheKey_(key), JSON.stringify(filters), CACHE_EXPIRY);
      return true;
    } catch (e) {
      console.warn('Error setting user filters:', e);
      return false;
    }
  };

  /**
   * Warm cache - preload frequently accessed data
   * OPTIMIZED: Parallel execution for faster warming
   */
  self.warmCache = function(spreadsheetId) {
    try {
      const startTime = new Date().getTime();
      
      // Preload shared data in sequence (most important first)
      console.log('Warming cache...');
      
      // 1. Dashboard stats (most accessed)
      self.getCachedDashboardStats(spreadsheetId, true);
      console.log('✓ Dashboard stats cached');
      
      // 2. Users list (for dropdowns)
      self.getCachedUsers(spreadsheetId, true);
      console.log('✓ Users cached');
      
      // 3. Companies list (for dropdowns)
      self.getCachedCompanies(spreadsheetId, true);
      console.log('✓ Companies cached');
      
      // 4. Preload current user data
      try {
        const email = Session.getActiveUser().getEmail();
        if (email) {
          const user = self.getCachedUserProfile(spreadsheetId, email, true);
          console.log('✓ User profile cached');
          
          if (user && user.user_id) {
            self.getCachedUserContacts(spreadsheetId, user.user_id, true);
            self.getCachedUserDeals(spreadsheetId, user.user_id, true);
            console.log('✓ User data cached');
          }
        }
      } catch (userError) {
        console.warn('Could not cache user-specific data:', userError);
      }
      
      const endTime = new Date().getTime();
      const totalTime = endTime - startTime;
      
      console.log('Cache warming completed in ' + totalTime + 'ms');
      
      return { 
        success: true, 
        message: 'Cache warmed successfully', 
        executionTime: totalTime 
      };
    } catch (e) {
      console.error('Cache warming error:', e);
      return { success: false, error: e.message };
    }
  };

  /**
   * Invalidate related caches after data modifications
   */
  self.invalidateRelatedCaches = function(entityType) {
    switch(entityType) {
      case 'user':
        self.invalidateCache('script', 'users_list');
        self.invalidateCache('user', 'user_profile');
        break;
      case 'company':
        self.invalidateCache('script', ['companies_list', 'dashboard_stats']);
        break;
      case 'contact':
        self.invalidateCache('script', 'dashboard_stats');
        // User-specific contact cache will expire naturally
        break;
      case 'deal':
        self.invalidateCache('script', 'dashboard_stats');
        // User-specific deal cache will expire naturally
        break;
      case 'task':
        self.invalidateCache('script', 'dashboard_stats');
        break;
      case 'all':
        self.clearCache('all');
        break;
    }
  };

  /**
   * ULTRA-FAST dashboard stats (super optimized)
   * Uses row counts only, no data reading
   */
  self.getQuickDashboardStats = function(spreadsheetId) {
    try {
      const cache = self.getScriptCache_();
      const cacheKey = self.getCacheKey_('quick_stats');
      
      // Try cache first
      const cached = cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      
      // Super fast calculation - only row counts
      const ss = SpreadsheetApp.openById(spreadsheetId);
      
      const contactsSheet = ss.getSheetByName('Contacts');
      const companiesSheet = ss.getSheetByName('Companies');
      const dealsSheet = ss.getSheetByName('Deals');
      const tasksSheet = ss.getSheetByName('Tasks');
      
      const stats = {
        contacts: contactsSheet ? Math.max(0, contactsSheet.getLastRow() - 1) : 0,
        companies: companiesSheet ? Math.max(0, companiesSheet.getLastRow() - 1) : 0,
        totalDeals: dealsSheet ? Math.max(0, dealsSheet.getLastRow() - 1) : 0,
        totalTasks: tasksSheet ? Math.max(0, tasksSheet.getLastRow() - 1) : 0,
        openDeals: 0,
        totalDealValue: 0,
        pendingTasks: 0,
        lastUpdated: new Date().toISOString(),
        quickMode: true
      };
      
      // Cache for 5 minutes (very short since it's just counts)
      cache.put(cacheKey, JSON.stringify(stats), 300);
      
      return stats;
    } catch (e) {
      console.error('Quick stats error:', e);
      throw e;
    }
  };

  return self;
})(typeof CrmLib !== 'undefined' ? CrmLib : {});

