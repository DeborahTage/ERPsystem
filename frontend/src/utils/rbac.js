/**
 * Role-Based Access Control (RBAC) Utilities
 * 
 * These utilities help manage user permissions based on their assigned roles.
 * The backend now supports multiple roles per user via JWT 'roles' claim.
 */

// Role constants matching backend
export const ROLES = {
  ADMIN: 'ADMIN',
  GENERAL_MANAGER: 'GENERAL_MANAGER',
  OPERATIONS_MANAGER: 'OPERATIONS_MANAGER',
  FARM_MANAGER: 'FARM_MANAGER',
  VETERINARY_OFFICER: 'VETERINARY_OFFICER',
  VET: 'VET',                       // Alias
  STORE_KEEPER: 'STORE_KEEPER',
  STORE: 'STORE',                   // Alias
  PHARMACY_SALES: 'PHARMACY_SALES',
  PHARMACY: 'PHARMACY',             // Alias
  FINANCE_OFFICER: 'FINANCE_OFFICER',
  FINANCE: 'FINANCE',               // Alias
  EXTENSION_WORKER: 'EXTENSION_WORKER',
};

// Role groups for easier permission management
export const ROLE_GROUPS = {
  ADMIN: [ROLES.ADMIN],
  MANAGERS: [ROLES.ADMIN, ROLES.GENERAL_MANAGER, ROLES.OPERATIONS_MANAGER],
  FARM: [ROLES.ADMIN, ROLES.FARM_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.GENERAL_MANAGER],
  VETERINARY: [ROLES.ADMIN, ROLES.VETERINARY_OFFICER, ROLES.VET, ROLES.FARM_MANAGER],
  INVENTORY: [ROLES.ADMIN, ROLES.STORE_KEEPER, ROLES.STORE, ROLES.OPERATIONS_MANAGER, ROLES.FARM_MANAGER],
  PHARMACY: [ROLES.ADMIN, ROLES.PHARMACY_SALES, ROLES.PHARMACY, ROLES.GENERAL_MANAGER],
  FINANCE: [ROLES.ADMIN, ROLES.FINANCE_OFFICER, ROLES.FINANCE, ROLES.GENERAL_MANAGER],
  CRM: [ROLES.ADMIN, ROLES.EXTENSION_WORKER, ROLES.OPERATIONS_MANAGER, ROLES.GENERAL_MANAGER],
  ALL: Object.values(ROLES),
};

// Menu item visibility rules
export const MENU_PERMISSIONS = {
  dashboard: null, // Visible to all
  users: [ROLES.ADMIN],
  farms: [ROLES.ADMIN, ROLES.FARM_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.GENERAL_MANAGER, ROLES.VETERINARY_OFFICER, ROLES.VET, ROLES.STORE_KEEPER, ROLES.STORE],
  flocks: [ROLES.ADMIN, ROLES.FARM_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.GENERAL_MANAGER],
  'daily-records': [ROLES.ADMIN, ROLES.FARM_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.VETERINARY_OFFICER, ROLES.VET],
  inventory: [ROLES.ADMIN, ROLES.STORE_KEEPER, ROLES.STORE, ROLES.OPERATIONS_MANAGER, ROLES.FARM_MANAGER, ROLES.GENERAL_MANAGER, ROLES.PHARMACY_SALES],
  veterinary: [ROLES.ADMIN, ROLES.VETERINARY_OFFICER, ROLES.VET, ROLES.FARM_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.PHARMACY_SALES],
  pharmacy: [ROLES.ADMIN, ROLES.PHARMACY_SALES, ROLES.GENERAL_MANAGER, ROLES.FINANCE_OFFICER],
  finance: [ROLES.ADMIN, ROLES.FINANCE_OFFICER, ROLES.GENERAL_MANAGER],
  crm: [ROLES.ADMIN, ROLES.EXTENSION_WORKER, ROLES.OPERATIONS_MANAGER, ROLES.GENERAL_MANAGER],
  reports: [ROLES.ADMIN, ROLES.GENERAL_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.FINANCE_OFFICER],
  settings: null, // Visible to all
};

/**
 * Check if user has any of the specified roles
 * @param {string[]} userRoles - User's roles from JWT
 * @param {string[]} allowedRoles - Roles to check against
 * @returns {boolean}
 */
export const hasAnyRole = (userRoles, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!userRoles || userRoles.length === 0) return false;
  return allowedRoles.some(role => userRoles.includes(role));
};

/**
 * Check if user has all specified roles
 * @param {string[]} userRoles - User's roles from JWT
 * @param {string[]} requiredRoles - Roles that must all be present
 * @returns {boolean}
 */
export const hasAllRoles = (userRoles, requiredRoles) => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  if (!userRoles || userRoles.length === 0) return false;
  return requiredRoles.every(role => userRoles.includes(role));
};

/**
 * Check if user has a specific role
 * @param {string[]} userRoles - User's roles from JWT
 * @param {string} role - Role to check
 * @returns {boolean}
 */
export const hasRole = (userRoles, role) => {
  if (!userRoles || userRoles.length === 0) return false;
  return userRoles.includes(role);
};

/**
 * Check if user is admin
 * @param {string[]} userRoles - User's roles from JWT
 * @returns {boolean}
 */
export const isAdmin = (userRoles) => hasRole(userRoles, ROLES.ADMIN);

/**
 * Check if user is any type of manager
 * @param {string[]} userRoles - User's roles from JWT
 * @returns {boolean}
 */
export const isManager = (userRoles) => hasAnyRole(userRoles, ROLE_GROUPS.MANAGERS);

/**
 * Check if user can access a specific menu item
 * @param {string[]} userRoles - User's roles from JWT
 * @param {string} menuKey - Key from MENU_PERMISSIONS
 * @returns {boolean}
 */
export const canAccessMenu = (userRoles, menuKey) => {
  const allowedRoles = MENU_PERMISSIONS[menuKey];
  if (allowedRoles === null) return true; // Public menu item
  return hasAnyRole(userRoles, allowedRoles);
};

/**
 * Get visible menu items for user
 * @param {string[]} userRoles - User's roles from JWT
 * @param {Array} menuItems - Array of menu items with 'key' or 'path'
 * @returns {Array} Filtered menu items
 */
export const getVisibleMenuItems = (userRoles, menuItems) => {
  return menuItems.filter(item => {
    const key = item.key || item.path?.replace('/', '') || '';
    return canAccessMenu(userRoles, key);
  });
};

/**
 * Filter routes based on user roles
 * @param {string[]} userRoles - User's roles from JWT
 * @param {Array} routes - Route definitions with 'allowedRoles'
 * @returns {Array} Filtered routes
 */
export const filterRoutesByRole = (userRoles, routes) => {
  return routes.filter(route => {
    if (!route.allowedRoles || route.allowedRoles.length === 0) return true;
    return hasAnyRole(userRoles, route.allowedRoles);
  });
};

/**
 * Parse roles from user object (handles both single role and roles array)
 * @param {Object} user - User object from API
 * @returns {string[]} Array of role strings
 */
export const parseUserRoles = (user) => {
  if (!user) return [];
  // If backend returns roles array (new RBAC)
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles;
  }
  // Fallback to single role (backward compatibility)
  if (user.role) {
    return [user.role];
  }
  return [];
};
