import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      toast.success('Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Failed to update password');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">Settings</h5>
      <Row className="g-3">
        <Col xs={12} md={5}>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Body className="p-4">
              <h6 className="fw-semibold mb-3">Profile</h6>
              <div className="mb-2"><span className="text-muted small">Name:</span><div className="fw-semibold">{user?.fullName}</div></div>
              <div className="mb-2"><span className="text-muted small">Email:</span><div>{user?.email}</div></div>
              <div className="mb-2"><span className="text-muted small">Role:</span><div><span className="badge bg-success">{user?.role?.replace(/_/g, ' ')}</span></div></div>
            </Card.Body>
          </Card>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h6 className="fw-semibold mb-3">Change Password</h6>
              {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
              <Form onSubmit={handlePasswordChange}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold">Current Password</Form.Label>
                  <Form.Control type="password" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold">New Password</Form.Label>
                  <Form.Control type="password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold">Confirm New Password</Form.Label>
                  <Form.Control type="password" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} required />
                </Form.Group>
                <Button type="submit" variant="success" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Settings;
