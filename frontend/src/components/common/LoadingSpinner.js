import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="text-center py-4">
    <Spinner animation="border" variant="success" className="mb-2" />
    <div className="text-muted small">{text}</div>
  </div>
);

export default LoadingSpinner;
