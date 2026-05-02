import React from 'react';
import { Badge } from 'react-bootstrap';
import { statusBadge } from '../../utils';

const StatusBadge = ({ status }) => (
  <Badge bg={statusBadge(status)}>{status}</Badge>
);

export default StatusBadge;
