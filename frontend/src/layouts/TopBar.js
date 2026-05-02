import React, { useState, useEffect } from 'react';
import { Navbar, Container, Button, Badge } from 'react-bootstrap';
import { notificationApi } from '../api';

const TopBar = ({ onMenuToggle }) => {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationApi.getAll()
      .then(res => setUnread(res.data.data?.filter(n => !n.read).length || 0))
      .catch(() => {});
  }, []);

  return (
    <Navbar bg="white" className="border-bottom px-3 py-2" style={{ marginLeft: 0 }}>
      <Button variant="outline-secondary" size="sm" className="d-lg-none me-2" onClick={onMenuToggle}>
        ☰
      </Button>
      <span className="fw-semibold text-success">Trust Agro Management System</span>
      <div className="ms-auto d-flex align-items-center gap-2">
        <span className="position-relative">
          🔔
          {unread > 0 && (
            <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: 9 }}>
              {unread}
            </Badge>
          )}
        </span>
      </div>
    </Navbar>
  );
};

export default TopBar;
