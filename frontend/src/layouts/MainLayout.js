import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const MainLayout = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="d-flex">
      <Sidebar show={showSidebar} onHide={() => setShowSidebar(false)} />
      <div className="flex-grow-1" style={{ marginLeft: 240, minHeight: '100vh', background: '#f8f9fa' }}>
        <TopBar onMenuToggle={() => setShowSidebar(true)} />
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
