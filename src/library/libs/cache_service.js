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
   * Reduces repeated aggregation queries
   */
  self.getCachedDashboardStats = function(spreadsheetId, forceRefresh) {
    if (forceRefresh) {
      self.invalidateCache('script', 'dashboard_stats');
    }
    
    return self.getCached('script', 'dashboard_stats', function() {
      const ss = SpreadsheetApp.openById(spreadsheetId);
      
      const contactsSheet = ss.getSheetByName('Contacts');
      const companiesSheet = ss.getSheetByName('Companies');
      const dealsSheet = ss.getSheetByName('Deals');
      const tasksSheet = ss.getSheetByName('Tasks');
      
      const contactsCount = contactsSheet ? Math.max(0, contactsSheet.getLastRow() - 1) : 0;
      const companiesCount = companiesSheet ? Math.max(0, companiesSheet.getLastRow() - 1) : 0;
      
      let totalDealValue = 0;
      let openDeals = 0;
      if (dealsSheet && dealsSheet.getLastRow() > 1) {
        const dealsData = dealsSheet.getDataRange().getValues();
        const headers = dealsData[0];
        const statusIdx = headers.indexOf('status');
        const amountIdx = headers.indexOf('amount');
        
        for (let i = 1; i < dealsData.length; i++) {
          if (dealsData[i][statusIdx] === 'Open') {
            openDeals++;
            totalDealValue += Number(dealsData[i][amountIdx]) || 0;
          }
        }
      }
      
      let pendingTasks = 0;
      if (tasksSheet && tasksSheet.getLastRow() > 1) {
        const tasksData = tasksSheet.getDataRange().getValues();
        const headers = tasksData[0];
        const statusIdx = headers.indexOf('status');
        
        for (let i = 1; i < tasksData.length; i++) {
          if (tasksData[i][statusIdx] === 'Pending' || tasksData[i][statusIdx] === 'In Progress') {
            pendingTasks++;
          }
        }
      }
      
      return {
        contacts: contactsCount,
        companies: companiesCount,
        openDeals: openDeals,
        totalDealValue: totalDealValue,
        pendingTasks: pendingTasks,
        lastUpdated: new Date().toISOString()
      };
    }, 1800); // 30 minutes TTL for stats
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
   * Call this after data updates to prepare cache
   */
  self.warmCache = function(spreadsheetId) {
    try {
      // Preload shared data
      self.getCachedUsers(spreadsheetId, true);
      self.getCachedCompanies(spreadsheetId, true);
      self.getCachedDashboardStats(spreadsheetId, true);
      
      // Preload current user data
      const email = Session.getActiveUser().getEmail();
      if (email) {
        const user = self.getCachedUserProfile(spreadsheetId, email, true);
        if (user && user.user_id) {
          self.getCachedUserContacts(spreadsheetId, user.user_id, true);
          self.getCachedUserDeals(spreadsheetId, user.user_id, true);
        }
      }
      
      return { success: true, message: 'Cache warmed successfully' };
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

  return self;
})(typeof CrmLib !== 'undefined' ? CrmLib : {});

