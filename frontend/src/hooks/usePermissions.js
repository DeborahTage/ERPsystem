import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasAnyRole, hasAllRoles, hasRole, canAccessMenu, ROLES, ROLE_GROUPS } from '../utils/rbac';

/**
 * usePermissions Hook
 * 
 * Provides granular permission checking for React components.
 * Use this hook to conditionally render UI elements based on user roles.
 * 
 * @returns {Object} Permission check functions and helpers
 */
export const usePermissions = () => {
  const { userRoles, isAdmin, isManager, canAccess } = useAuth();

  /**
   * Check if user has a specific role
   * @param {string} role - Role to check
   * @returns {boolean}
   */
  const checkRole = useCallback((role) => {
    return hasRole(userRoles, role);
  }, [userRoles]);

  /**
   * Check if user has any of the specified roles
   * @param {...string} roles - Roles to check
   * @returns {boolean}
   */
  const checkAnyRole = useCallback((...roles) => {
    return hasAnyRole(userRoles, roles);
  }, [userRoles]);

  /**
   * Check if user has all specified roles
   * @param {...string} roles - Roles that must all be present
   * @returns {boolean}
   */
  const checkAllRoles = useCallback((...roles) => {
    return hasAllRoles(userRoles, roles);
  }, [userRoles]);

  /**
   * Check if user can access a menu/module
   * @param {string} moduleKey - Module key (e.g., 'farms', 'veterinary')
   * @returns {boolean}
   */
  const checkAccess = useCallback((moduleKey) => {
    return canAccess(moduleKey);
  }, [canAccess]);

  /**
   * Check if user can perform a specific action
   * Predefined action groups for common operations
   */
  const permissions = {
    // Module access
    canViewUsers: checkRole(ROLES.ADMIN),
    canManageUsers: checkRole(ROLES.ADMIN),
    
    canViewFarms: checkAnyRole(ROLES.ADMIN, ROLES.FARM_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.GENERAL_MANAGER, ROLES.VET, ROLES.VETERINARY_OFFICER, ROLES.STORE, ROLES.STORE_KEEPER),
    canManageFarms: checkAnyRole(ROLES.ADMIN, ROLES.FARM_MANAGER, ROLES.OPERATIONS_MANAGER),
    
    canViewInventory: checkAnyRole(ROLES.ADMIN, ROLES.STORE_KEEPER, ROLES.STORE, ROLES.OPERATIONS_MANAGER, ROLES.FARM_MANAGER),
    canManageInventory: checkAnyRole(ROLES.ADMIN, ROLES.STORE_KEEPER, ROLES.STORE, ROLES.OPERATIONS_MANAGER),
    canStockIn: checkAnyRole(ROLES.ADMIN, ROLES.STORE_KEEPER, ROLES.STORE),
    canStockOut: checkAnyRole(ROLES.ADMIN, ROLES.STORE_KEEPER, ROLES.STORE, ROLES.FARM_MANAGER),
    
    canViewVeterinary: checkAnyRole(ROLES.ADMIN, ROLES.VETERINARY_OFFICER, ROLES.VET, ROLES.FARM_MANAGER),
    canManageVeterinary: checkAnyRole(ROLES.ADMIN, ROLES.VETERINARY_OFFICER, ROLES.VET),
    
    canViewPharmacy: checkAnyRole(ROLES.ADMIN, ROLES.PHARMACY_SALES, ROLES.PHARMACY, ROLES.GENERAL_MANAGER, ROLES.FINANCE_OFFICER),
    canManagePharmacy: checkAnyRole(ROLES.ADMIN, ROLES.PHARMACY_SALES, ROLES.PHARMACY),
    canDispense: checkAnyRole(ROLES.ADMIN, ROLES.PHARMACY_SALES, ROLES.PHARMACY),
    
    canViewFinance: checkAnyRole(ROLES.ADMIN, ROLES.FINANCE_OFFICER, ROLES.FINANCE, ROLES.GENERAL_MANAGER),
    canManageFinance: checkAnyRole(ROLES.ADMIN, ROLES.FINANCE_OFFICER, ROLES.FINANCE, ROLES.GENERAL_MANAGER),
    
    canViewCRM: checkAnyRole(ROLES.ADMIN, ROLES.EXTENSION_WORKER, ROLES.OPERATIONS_MANAGER, ROLES.GENERAL_MANAGER),
    canManageCRM: checkAnyRole(ROLES.ADMIN, ROLES.EXTENSION_WORKER, ROLES.OPERATIONS_MANAGER),
    canRecordVisit: checkAnyRole(ROLES.ADMIN, ROLES.EXTENSION_WORKER),
    
    canViewReports: checkAnyRole(ROLES.ADMIN, ROLES.GENERAL_MANAGER, ROLES.OPERATIONS_MANAGER),
    
    // Role shortcuts
    isAdmin: isAdmin(),
    isManager: isManager(),
    
    // Generic checks
    hasRole: checkRole,
    hasAnyRole: checkAnyRole,
    hasAllRoles: checkAllRoles,
    canAccess: checkAccess,
  };

  return permissions;
};

/**
 * Higher-Order Component for wrapping components with permission checks
 * 
 * @param {React.Component} Component - Component to wrap
 * @param {string[]} requiredRoles - Roles required to view the component
 * @returns {React.Component} Wrapped component
 */
export const withPermission = (Component, requiredRoles) => {
  return function WithPermissionWrapper(props) {
    const { hasAnyRole } = useAuth();
    
    if (!hasAnyRole(...requiredRoles)) {
      return null; // Or return a "No permission" placeholder
    }
    
    return <Component {...props} />;
  };
};

/**
 * Conditional render component for permission-based UI
 * 
 * @param {Object} props - Component props
 * @param {string[]} props.roles - Allowed roles
 * @param {ReactNode} props.children - Content to render if authorized
 * @param {ReactNode} props.fallback - Content to render if not authorized (optional)
 */
export const PermissionGuard = ({ roles, children, fallback = null }) => {
  const { hasAnyRole } = useAuth();
  
  if (hasAnyRole(...roles)) {
    return children;
  }
  
  return fallback;
};

export default usePermissions;
