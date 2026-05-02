import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'ECONNABORTED' || !err.response) {
        setError('Cannot reach the backend server. Make sure the backend is running on the expected port.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={8} md={5} lg={4}>
            <div className="text-center mb-4">
              <div className="fs-1">🌿</div>
              <h4 className="fw-bold text-success">Trust Agro</h4>
              <p className="text-muted small">Consulting & Farming Management System</p>
            </div>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4">
                <h5 className="mb-4 fw-semibold">Sign In</h5>
                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold">Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold">Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Button type="submit" variant="success" className="w-100" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
