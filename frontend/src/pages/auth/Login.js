import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';

const Login = () => {
  const { t } = useTranslation();
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
        setError(t('auth.cannotReachBackend'));
      } else {
        setError(err.response?.data?.message || t('auth.invalidCredentials'));
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
              <h4 className="fw-bold text-success">{t('common.appName')}</h4>
              <p className="text-muted small">{t('common.tagline')}</p>
            </div>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4">
                <h5 className="mb-4 fw-semibold">{t('auth.login')}</h5>
                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold">{t('auth.email')}</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder={t('auth.email')}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold">{t('auth.password')}</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder={t('auth.password')}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Button type="submit" variant="success" className="w-100" disabled={loading}>
                    {loading ? t('auth.signingIn') : t('auth.login')}
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
