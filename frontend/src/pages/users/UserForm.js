import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userApi } from '../../api';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ROLES } from '../../utils';

const ROLE_OPTIONS = Object.values(ROLES);

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', role: 'FARM_MANAGER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      userApi.getById(id).then(r => {
        const u = r.data.data;
        setForm({ fullName: u.fullName, email: u.email, phone: u.phone || '', password: '', role: u.role });
      });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) await userApi.update(id, form);
      else await userApi.create(form);
      toast.success(`User ${isEdit ? 'updated' : 'created'} successfully`);
      navigate('/users');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">{isEdit ? 'Edit User' : 'Add User'}</h5>
      <Card className="border-0 shadow-sm" style={{ maxWidth: 600 }}>
        <Card.Body className="p-4">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Full Name *</Form.Label>
                  <Form.Control value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Email *</Form.Label>
                  <Form.Control type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required disabled={isEdit} />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Phone</Form.Label>
                  <Form.Control value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Role *</Form.Label>
                  <Form.Select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</Form.Label>
                  <Form.Control type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!isEdit} />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="success" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button variant="outline-secondary" onClick={() => navigate('/users')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserForm;
