import React, { useState } from 'react';
import { Menu, Bell, Search, ChevronDown, User, Shield, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Topbar = ({ onMenuClick, user, userRoles }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="-m-2.5 p-2.5 text-gray-600 hover:text-gray-900 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Search */}
        <div className={`flex-1 max-w-md ${searchOpen ? 'block' : 'hidden sm:block'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search farms, inventory, reports..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Mobile search toggle */}
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100/80 transition-all duration-200 sm:hidden"
          >
            <Search className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100/80 transition-all duration-200 group">
            <Bell className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" strokeWidth={2} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
          </button>

          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setLanguageOpen(!languageOpen)}
              className="flex items-center gap-1 p-2 px-3 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100/80 transition-all duration-200"
              title="Change Language"
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-semibold">{language === 'am' ? 'አ' : 'EN'}</span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${languageOpen ? 'rotate-180' : ''}`} />
            </button>

            {languageOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLanguageOpen(false)} />
                <div className="absolute right-0 mt-2 w-40 rounded-lg bg-white shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => {
                      changeLanguage('en');
                      setLanguageOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage('am');
                      setLanguageOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm ${language === 'am' ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    🇪🇹 አማርኛ
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100/80 transition-all duration-200 group"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-medium text-sm shadow-sm transition-transform duration-200 group-hover:scale-105">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900 leading-none">{user?.fullName || 'User'}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {userRoles?.length > 0 ? userRoles[0].replace(/_/g, ' ') : user?.role?.replace(/_/g, ' ') || 'User'}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 hidden sm:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-gray-200 py-1 z-20">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <a href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="h-4 w-4 text-gray-400" />
                      {language === 'am' ? 'ሙሉ ስም ቅንብሮች' : 'Profile Settings'}
                    </a>
                    <a href="/users" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Shield className="h-4 w-4 text-gray-400" />
                      {language === 'am' ? 'መዳረሻ ቁጥጥር' : 'Access Control'}
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
