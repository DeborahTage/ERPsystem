import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';
import { hasAnyRole, hasAllRoles, hasRole, parseUserRoles, ROLES } from '../utils/rbac';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get user's roles array (supports both single role and multi-role)
  const userRoles = parseUserRoles(user);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi.me()
        .then((res) => setUser(res.data.data))
        .catch(() => localStorage.clear())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token, ...userData } = res.data.data;
    localStorage.setItem('token', token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  /**
   * Check if user has any of the specified roles (legacy - single role check)
   * @param {...string} roles - Roles to check
   * @returns {boolean}
   */
  const hasRoleLegacy = useCallback((...roles) => {
    return hasAnyRole(userRoles, roles);
  }, [userRoles]);

  /**
   * Check if user has any of the specified roles (new multi-role check)
   * @param {...string} roles - Roles to check
   * @returns {boolean}
   */
  const hasAnyRoleCheck = useCallback((...roles) => {
    return hasAnyRole(userRoles, roles);
  }, [userRoles]);

  /**
   * Check if user has all specified roles
   * @param {...string} roles - Roles that must all be present
   * @returns {boolean}
   */
  const hasAllRolesCheck = useCallback((...roles) => {
    return hasAllRoles(userRoles, roles);
  }, [userRoles]);

  /**
   * Check if user is admin
   * @returns {boolean}
   */
  const isAdmin = useCallback(() => {
    return hasRole(userRoles, ROLES.ADMIN);
  }, [userRoles]);

  /**
   * Check if user is any type of manager
   * @returns {boolean}
   */
  const isManager = useCallback(() => {
    const managerRoles = [ROLES.ADMIN, ROLES.GENERAL_MANAGER, ROLES.OPERATIONS_MANAGER];
    return hasAnyRole(userRoles, managerRoles);
  }, [userRoles]);

  /**
   * Check if user can access a specific module
   * @param {string} moduleKey - Module key (e.g., 'farms', 'veterinary', 'finance')
   * @returns {boolean}
   */
  const canAccess = useCallback((moduleKey) => {
    const moduleRoles = {
      users: [ROLES.ADMIN],
      farms: [ROLES.ADMIN, ROLES.FARM_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.GENERAL_MANAGER],
      flocks: [ROLES.ADMIN, ROLES.FARM_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.GENERAL_MANAGER],
      'daily-records': [ROLES.ADMIN, ROLES.FARM_MANAGER, ROLES.OPERATIONS_MANAGER],
      inventory: [ROLES.ADMIN, ROLES.STORE_KEEPER, ROLES.OPERATIONS_MANAGER, ROLES.FARM_MANAGER],
      veterinary: [ROLES.ADMIN, ROLES.VETERINARY_OFFICER, ROLES.VET, ROLES.FARM_MANAGER],
      pharmacy: [ROLES.ADMIN, ROLES.PHARMACY_SALES, ROLES.GENERAL_MANAGER],
      finance: [ROLES.ADMIN, ROLES.FINANCE_OFFICER, ROLES.GENERAL_MANAGER],
      crm: [ROLES.ADMIN, ROLES.EXTENSION_WORKER, ROLES.OPERATIONS_MANAGER],
      reports: [ROLES.ADMIN, ROLES.GENERAL_MANAGER, ROLES.OPERATIONS_MANAGER],
      settings: [], // All users
      dashboard: [], // All users
    };
    const allowedRoles = moduleRoles[moduleKey];
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return hasAnyRole(userRoles, allowedRoles);
  }, [userRoles]);

  const value = {
    user,
    userRoles,
    loading,
    login,
    logout,
    // Legacy compatibility
    hasRole: hasRoleLegacy,
    // New methods
    hasAnyRole: hasAnyRoleCheck,
    hasAllRoles: hasAllRolesCheck,
    isAdmin,
    isManager,
    canAccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
