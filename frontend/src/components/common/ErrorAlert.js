import React from 'react';
import { Alert } from 'react-bootstrap';

const ErrorAlert = ({ message, onDismiss }) => {
  if (!message) return null;
  
  return (
    <Alert variant="danger" className="py-2 small" dismissible={!!onDismiss} onClose={onDismiss}>
      {message}
    </Alert>
  );
};

export default ErrorAlert;
