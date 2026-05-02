import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils';
import { Navbar, Nav, Container, Button, Badge, Offcanvas } from 'react-bootstrap';

const menuItems = [
  { path: '/dashboard', label: '📊 Dashboard', roles: null },
  { path: '/users', label: '👥 Users', roles: [ROLES.ADMIN, ROLES.GENERAL_MANAGER] },
  { path: '/farms', label: '🏡 Farms', roles: [ROLES.ADMIN, ROLES.GENERAL_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.FARM_MANAGER] },
  { path: '/flocks', label: '🐔 Flocks', roles: [ROLES.ADMIN, ROLES.GENERAL_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.FARM_MANAGER] },
  { path: '/daily-records', label: '📋 Daily Records', roles: [ROLES.ADMIN, ROLES.FARM_MANAGER, ROLES.OPERATIONS_MANAGER] },
  { path: '/inventory', label: '📦 Inventory', roles: [ROLES.ADMIN, ROLES.STORE_KEEPER, ROLES.OPERATIONS_MANAGER, ROLES.GENERAL_MANAGER] },
  { path: '/veterinary', label: '💉 Veterinary', roles: [ROLES.ADMIN, ROLES.VETERINARY_OFFICER, ROLES.FARM_MANAGER] },
  { path: '/pharmacy', label: '💊 Pharmacy', roles: [ROLES.ADMIN, ROLES.PHARMACY_SALES, ROLES.GENERAL_MANAGER] },
  { path: '/finance', label: '💰 Finance', roles: [ROLES.ADMIN, ROLES.FINANCE_OFFICER, ROLES.GENERAL_MANAGER] },
  { path: '/crm', label: '🤝 CRM', roles: [ROLES.ADMIN, ROLES.EXTENSION_WORKER, ROLES.OPERATIONS_MANAGER, ROLES.GENERAL_MANAGER] },
  { path: '/reports', label: '📈 Reports', roles: [ROLES.ADMIN, ROLES.GENERAL_MANAGER, ROLES.OPERATIONS_MANAGER] },
  { path: '/settings', label: '⚙️ Settings', roles: null },
];

const Sidebar = ({ show, onHide }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const visibleItems = menuItems.filter(item => !item.roles || hasRole(...item.roles));

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
        <div className="small text-muted mb-1">{user?.fullName}</div>
        <div className="small text-muted mb-2">{user?.role?.replace('_', ' ')}</div>
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
