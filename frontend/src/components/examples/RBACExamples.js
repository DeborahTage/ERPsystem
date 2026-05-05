/**
 * RBAC (Role-Based Access Control) Examples
 * 
 * This file demonstrates how to use the RBAC system in React components.
 * Import these patterns into your actual components.
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions, PermissionGuard } from '../../hooks/usePermissions';
import { ROLES } from '../../utils/rbac';
import { Button, Alert } from 'react-bootstrap';

// ==========================================
// EXAMPLE 1: Basic Role Check in Component
// ==========================================

export const ExampleBasicRoleCheck = () => {
  const { hasAnyRole, isAdmin, userRoles } = useAuth();

  return (
    <div>
      <h4>Basic Role Checks</h4>
      
      {/* Check single role */}
      {isAdmin() && (
        <Alert variant="info">You are an Admin!</Alert>
      )}

      {/* Check any of multiple roles */}
      {hasAnyRole(ROLES.FARM_MANAGER, ROLES.VET) && (
        <Button variant="primary">Farm Action</Button>
      )}

      {/* Show roles for debugging */}
      <p className="text-muted mt-2">
        Your roles: {userRoles?.join(', ') || 'None'}
      </p>
    </div>
  );
};

// ==========================================
// EXAMPLE 2: Using usePermissions Hook
// ==========================================

export const ExampleUsePermissions = () => {
  const permissions = usePermissions();

  return (
    <div>
      <h4>Using usePermissions Hook</h4>
      
      {/* Predefined module permissions */}
      <div className="d-flex gap-2 mb-3">
        {permissions.canManageFarms && (
          <Button variant="success">Add Farm</Button>
        )}
        
        {permissions.canViewInventory && (
          <Button variant="info">View Inventory</Button>
        )}
        
        {permissions.canManagePharmacy && (
          <Button variant="warning">Create Sale</Button>
        )}
        
        {permissions.canManageFinance && (
          <Button variant="dark">Add Transaction</Button>
        )}
      </div>

      {/* Using permission methods directly */}
      {permissions.hasAnyRole(ROLES.ADMIN, ROLES.GENERAL_MANAGER) && (
        <Alert variant="success">Manager-level access detected</Alert>
      )}
    </div>
  );
};

// ==========================================
// EXAMPLE 3: PermissionGuard Component
// ==========================================

export const ExamplePermissionGuard = () => {
  return (
    <div>
      <h4>Permission Guard Component</h4>
      
      {/* Only show to admin */}
      <PermissionGuard roles={[ROLES.ADMIN]}>
        <Button variant="danger">Delete System (Admin Only)</Button>
      </PermissionGuard>

      {/* Show to multiple roles with fallback */}
      <PermissionGuard 
        roles={[ROLES.FARM_MANAGER, ROLES.VET]} 
        fallback={<p className="text-muted">Contact farm manager for assistance</p>}
      >
        <Button variant="primary">Manage Farm Records</Button>
      </PermissionGuard>

      {/* Show to all managers */}
      <PermissionGuard roles={[ROLES.ADMIN, ROLES.GENERAL_MANAGER, ROLES.OPERATIONS_MANAGER]}>
        <Alert variant="info">Manager Dashboard Widget</Alert>
      </PermissionGuard>
    </div>
  );
};

// ==========================================
// EXAMPLE 4: Conditional Table Actions
// ==========================================

export const ExampleTableWithRBAC = ({ data }) => {
  const { isAdmin, hasAnyRole } = useAuth();

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.status}</td>
            <td>
              {/* View - available to all */}
              <Button size="sm" variant="info" className="me-1">View</Button>
              
              {/* Edit - managers only */}
              {hasAnyRole(ROLES.ADMIN, ROLES.OPERATIONS_MANAGER, ROLES.FARM_MANAGER) && (
                <Button size="sm" variant="primary" className="me-1">Edit</Button>
              )}
              
              {/* Delete - admin only */}
              {isAdmin() && (
                <Button size="sm" variant="danger">Delete</Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// ==========================================
// EXAMPLE 5: Module-Level Access Control
// ==========================================

export const ExampleModuleAccess = () => {
  const { canAccess } = useAuth();

  return (
    <div className="row">
      {/* Dashboard - all users */}
      <div className="col-md-4">
        <div className="card">
          <div className="card-body">
            <h5>📊 Dashboard</h5>
            <p>Always visible to authenticated users</p>
          </div>
        </div>
      </div>

      {/* Finance - restricted */}
      {canAccess('finance') && (
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5>💰 Finance</h5>
              <p>Only for Finance, Admin, General Manager</p>
            </div>
          </div>
        </div>
      )}

      {/* CRM - restricted */}
      {canAccess('crm') && (
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5>🤝 CRM</h5>
              <p>Only for Extension Workers, Operations</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// EXAMPLE 6: Form with Conditional Fields
// ==========================================

export const ExampleConditionalForm = () => {
  const { hasAnyRole, isAdmin } = useAuth();

  return (
    <form>
      <div className="mb-3">
        <label className="form-label">Farm Name</label>
        <input type="text" className="form-control" />
      </div>

      {/* Only managers can set capacity */}
      {hasAnyRole(ROLES.ADMIN, ROLES.OPERATIONS_MANAGER, ROLES.FARM_MANAGER) && (
        <div className="mb-3">
          <label className="form-label">Capacity</label>
          <input type="number" className="form-control" />
        </div>
      )}

      {/* Only admin can change status */}
      {isAdmin() && (
        <div className="mb-3">
          <label className="form-label">Status</label>
          <select className="form-select">
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      )}

      <button type="submit" className="btn btn-primary">Save</button>
    </form>
  );
};

// ==========================================
// EXAMPLE 7: Multi-Role User Display
// ==========================================

export const ExampleMultiRoleDisplay = () => {
  const { user, userRoles } = useAuth();

  return (
    <div className="card">
      <div className="card-header">
        <h5>User Information</h5>
      </div>
      <div className="card-body">
        <p><strong>Name:</strong> {user?.fullName}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p>
          <strong>Roles:</strong>
          {userRoles?.map((role, index) => (
            <span key={role} className="badge bg-primary ms-1">
              {role.replace(/_/g, ' ')}
            </span>
          ))}
        </p>
        
        {/* Show primary role badge differently */}
        <p>
          <strong>Primary Role:</strong>
          <span className="badge bg-success ms-1">
            {user?.role?.replace(/_/g, ' ')}
          </span>
        </p>
      </div>
    </div>
  );
};

// ==========================================
// USAGE SUMMARY
// ==========================================

/*
QUICK REFERENCE:

1. useAuth Hook - Basic checks:
   const { hasAnyRole, hasAllRoles, isAdmin, isManager, userRoles, canAccess } = useAuth();
   
   - hasAnyRole('ADMIN', 'FARM_MANAGER')  // true if user has ANY of these
   - hasAllRoles('ADMIN', 'VET')          // true if user has ALL of these
   - isAdmin()                             // true if user is admin
   - isManager()                           // true if user is any manager
   - canAccess('farms')                    // true if user can access farms module

2. usePermissions Hook - Predefined checks:
   const permissions = usePermissions();
   
   - permissions.canManageFarms
   - permissions.canViewInventory
   - permissions.canManageFinance
   - etc.

3. PermissionGuard Component - JSX conditional rendering:
   <PermissionGuard roles={['ADMIN']}>
     <AdminOnlyComponent />
   </PermissionGuard>

4. Direct conditional rendering:
   {hasAnyRole('ADMIN', 'FARM_MANAGER') && <Button>Edit</Button>}

ROLES AVAILABLE:
- ADMIN
- GENERAL_MANAGER
- OPERATIONS_MANAGER
- FARM_MANAGER
- VETERINARY_OFFICER / VET (aliases)
- STORE_KEEPER / STORE (aliases)
- PHARMACY_SALES / PHARMACY (aliases)
- FINANCE_OFFICER / FINANCE (aliases)
- EXTENSION_WORKER

IMPORT FROM:
import { useAuth } from './context/AuthContext';
import { usePermissions, PermissionGuard } from './hooks/usePermissions';
import { ROLES, ROLE_GROUPS } from './utils/rbac';
*/
