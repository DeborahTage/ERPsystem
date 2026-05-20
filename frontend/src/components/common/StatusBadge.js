import React from 'react';
import { Badge } from '../ui/Badge';

const getVariant = (status) => {
  const map = {
    ACTIVE: 'success', INACTIVE: 'default', CLOSED: 'danger',
    PENDING: 'warning', DISPENSED: 'success', CANCELLED: 'danger',
    SCHEDULED: 'primary', COMPLETED: 'success', MISSED: 'danger',
    LEAD: 'info', LOST: 'danger', LOW: 'warning', MODERATE: 'warning',
    HIGH: 'danger', CRITICAL: 'danger', CONTROLLED: 'success', RESOLVED: 'success',
  };
  return map[status] || 'default';
};

const StatusBadge = ({ status }) => (
  <Badge variant={getVariant(status)} size="sm">
    {status?.replace(/_/g, ' ') || 'Unknown'}
  </Badge>
);

export default StatusBadge;
