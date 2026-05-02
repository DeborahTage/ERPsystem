import React from 'react';
import { Card } from 'react-bootstrap';

const StatCard = ({ title, value, icon, color = 'success', subtitle }) => (
  <Card className="h-100 border-0 shadow-sm">
    <Card.Body className="d-flex align-items-center">
      <div className={`rounded-circle bg-${color} bg-opacity-10 p-3 me-3`}>
        <span className={`text-${color} fs-4`}>{icon}</span>
      </div>
      <div>
        <div className="text-muted small">{title}</div>
        <div className="fw-bold fs-5">{value}</div>
        {subtitle && <div className="text-muted small">{subtitle}</div>}
      </div>
    </Card.Body>
  </Card>
);

export default StatCard;
