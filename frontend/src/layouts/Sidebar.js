import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_GROUPS } from '../utils/rbac';
import { Nav, Button, Offcanvas } from 'react-bootstrap';

/**
 * Menu items with RBAC permissions
 * roles: null = visible to all, string[] = visible to any of these roles
 */
const menuItems = [
  { path: '/dashboard', label: '📊 Dashboard', key: 'dashboard', roles: null },
  { path: '/users', label: '👥 Users', key: 'users', roles: [ROLES.ADMIN] },
  { path: '/farms', label: '🏡 Farms', key: 'farms', roles: [ROLES.ADMIN, ROLES.GENERAL_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.FARM_MANAGER, ROLES.VET, ROLES.VETERINARY_OFFICER, ROLES.STORE, ROLES.STORE_KEEPER] },
  { path: '/flocks', label: '🐔 Flocks', key: 'flocks', roles: [ROLES.ADMIN, ROLES.GENERAL_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.FARM_MANAGER] },
  { path: '/daily-records', label: '📋 Daily Records', key: 'daily-records', roles: [ROLES.ADMIN, ROLES.FARM_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.VET, ROLES.VETERINARY_OFFICER] },
  { path: '/inventory', label: '📦 Inventory', key: 'inventory', roles: [ROLES.ADMIN, ROLES.STORE_KEEPER, ROLES.STORE, ROLES.OPERATIONS_MANAGER, ROLES.FARM_MANAGER, ROLES.PHARMACY_SALES] },
  { path: '/veterinary', label: '💉 Veterinary', key: 'veterinary', roles: [ROLES.ADMIN, ROLES.VETERINARY_OFFICER, ROLES.VET, ROLES.FARM_MANAGER] },
  { path: '/pharmacy', label: '💊 Pharmacy', key: 'pharmacy', roles: [ROLES.ADMIN, ROLES.PHARMACY_SALES, ROLES.PHARMACY, ROLES.GENERAL_MANAGER, ROLES.FINANCE_OFFICER] },
  { path: '/finance', label: '💰 Finance', key: 'finance', roles: [ROLES.ADMIN, ROLES.FINANCE_OFFICER, ROLES.FINANCE, ROLES.GENERAL_MANAGER] },
  { path: '/crm', label: '🤝 CRM', key: 'crm', roles: [ROLES.ADMIN, ROLES.EXTENSION_WORKER, ROLES.OPERATIONS_MANAGER, ROLES.GENERAL_MANAGER] },
  { path: '/reports', label: '📈 Reports', key: 'reports', roles: ROLE_GROUPS.MANAGERS },
  { path: '/settings', label: '⚙️ Settings', key: 'settings', roles: null },
];

/**
 * Sidebar Component
 * Displays navigation menu filtered by user roles
 */
const Sidebar = ({ show, onHide }) => {
  const { user, userRoles, logout, hasAnyRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { 
    logout(); 
    navigate('/login'); 
  };

  // Filter menu items based on user's roles
  const visibleItems = menuItems.filter(item => {
    if (!item.roles) return true; // Public menu item
    return hasAnyRole(...item.roles);
  });

  const sidebarContent = (
    <div className="d-flex flex-column h-100">
      <div className="p-3 border-bottom">
        <div className="fw-bold text-success fs-6">🌿 Trust Agro</div>
        <div className="text-muted small">Consulting & Farming</div>
      </div>
      <Nav className="flex-column flex-grow-1 p-2 overflow-auto">
        {visibleItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onHide}
            className={({ isActive }) =>
              `nav-link rounded mb-1 px-3 py-2 ${isActive ? 'bg-success text-white' : 'text-dark'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </Nav>
      <div className="p-3 border-top">
        <div className="small fw-semibold text-dark mb-1">{user?.fullName}</div>
        <div className="small text-muted mb-2" style={{ fontSize: '0.75rem' }}>
          {userRoles?.length > 0 
            ? userRoles.map(r => r.replace(/_/g, ' ')).join(', ')
            : user?.role?.replace(/_/g, ' ')
          }
        </div>
        <Button variant="outline-danger" size="sm" className="w-100" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="d-none d-lg-flex flex-column bg-white border-end" style={{ width: 240, minHeight: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100 }}>
        {sidebarContent}
      </div>
      {/* Mobile offcanvas */}
      <Offcanvas show={show} onHide={onHide} className="d-lg-none" style={{ width: 240 }}>
        <Offcanvas.Body className="p-0">{sidebarContent}</Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Sidebar;
