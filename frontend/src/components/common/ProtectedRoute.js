import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from 'react-bootstrap';

/**
 * ProtectedRoute Component
 * 
 * Wraps routes to require authentication and optionally specific roles.
 * 
 * @param {ReactNode} children - Component to render if authorized
 * @param {string[]} roles - Allowed roles (any of these roles grants access)
 * @param {string[]} requireAllRoles - All these roles must be present (optional)
 * @param {string} redirectTo - Path to redirect if unauthorized (default: /login or /dashboard)
 * @param {boolean} requireAuth - Whether authentication is required (default: true)
 * 
 * Examples:
 *   // Any authenticated user
 *   <ProtectedRoute><Dashboard /></ProtectedRoute>
 * 
 *   // Specific roles only
 *   <ProtectedRoute roles={['ADMIN', 'FARM_MANAGER']}><FarmForm /></ProtectedRoute>
 * 
 *   // Admin only
 *   <ProtectedRoute roles={['ADMIN']} redirectTo="/unauthorized"><UserForm /></ProtectedRoute>
 */
const ProtectedRoute = ({ 
  children, 
  roles, 
  requireAllRoles,
  redirectTo = '/login',
  fallbackRedirect = '/dashboard',
  requireAuth = true 
}) => {
  const { user, loading, hasAnyRole, hasAllRoles } = useAuth();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
        <span className="ms-2 text-muted">Loading...</span>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role permissions if roles are specified
  if (roles && roles.length > 0) {
    const hasRequiredRole = hasAnyRole(...roles);
    if (!hasRequiredRole) {
      return <Navigate to={fallbackRedirect} replace />;
    }
  }

  // Check if all required roles are present
  if (requireAllRoles && requireAllRoles.length > 0) {
    const hasAllRequiredRoles = hasAllRoles(...requireAllRoles);
    if (!hasAllRequiredRoles) {
      return <Navigate to={fallbackRedirect} replace />;
    }
  }

  // Authorized - render children
  return children;
};

export default ProtectedRoute;
