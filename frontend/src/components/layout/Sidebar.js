import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Stethoscope, Package, 
  Pill, DollarSign, Users, BarChart3, Settings, 
  ChevronLeft, LogOut, HeartHandshake, Briefcase, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/farms', label: 'Farm Management', icon: Building2 },
  { path: '/veterinary', label: 'Veterinary', icon: Stethoscope },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/pharmacy', label: 'Pharmacy', icon: Pill },
  { path: '/finance', label: 'Finance', icon: DollarSign },
  { path: '/crm', label: 'CRM', icon: HeartHandshake },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ isOpen, onClose, user, userRoles, onLogout }) => {
  const location = useLocation();
  const { hasAnyRole } = useAuth();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col h-full bg-sidebar-bg border-r border-sidebar-border">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center gap-3 px-6 border-b border-sidebar-border">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-white font-semibold text-sm tracking-tight">Trust Agro</span>
              <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Management</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-hide">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-out ${
                    active 
                      ? 'text-white bg-sidebar-active shadow-sm' 
                      : 'text-gray-400 hover:text-white hover:bg-sidebar-hover hover:translate-x-0.5'
                  }`}
                >
                  {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-full bg-brand-500 transition-all duration-300" />}
                  <item.icon className={`h-5 w-5 shrink-0 transition-all duration-200 ${active ? 'text-brand-400' : 'text-gray-400 group-hover:text-gray-200'}`} strokeWidth={active ? 2.5 : 2} />
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">{item.label}</span>
                  {active && <ChevronRight className="ml-auto h-4 w-4 text-brand-400/70 transition-transform duration-200 group-hover:translate-x-0.5" />}
                </NavLink>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-brand-600 flex items-center justify-center text-white font-medium text-sm">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.fullName || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">
                  {userRoles?.length > 0 
                    ? userRoles.map(r => r.replace(/_/g, ' ')).join(', ')
                    : user?.role?.replace(/_/g, ' ') || 'User'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="group flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-sidebar-hover rounded-lg transition-all duration-200"
            >
              <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-bg transform transition-transform duration-300 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-white font-semibold text-sm">Trust Agro</span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <ChevronLeft className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    active 
                      ? 'text-white bg-sidebar-active' 
                      : 'text-gray-400 hover:text-white hover:bg-sidebar-hover'
                  }`}
                >
                  <item.icon className={`h-5 w-5 shrink-0 ${active ? 'text-brand-400' : 'text-gray-400 group-hover:text-gray-300'}`} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Mobile user */}
          <div className="border-t border-sidebar-border p-4">
            <button
              onClick={() => { onLogout(); onClose(); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-sidebar-hover rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
