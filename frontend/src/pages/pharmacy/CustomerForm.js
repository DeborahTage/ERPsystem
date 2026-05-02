import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmacyApi } from '../../api';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

const CustomerForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ customerName: '', phone: '', location: '', customerType: 'FARMER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await pharmacyApi.createCustomer(form);
      toast.success('Customer added');
      navigate('/pharmacy');
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">Add Customer</h5>
      <Card className="border-0 shadow-sm" style={{ maxWidth: 450 }}>
        <Card.Body className="p-4">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={12}><Form.Group><Form.Label className="small fw-semibold">Name *</Form.Label><Form.Control value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} required /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Phone</Form.Label><Form.Control value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Type</Form.Label><Form.Select value={form.customerType} onChange={e => setForm({ ...form, customerType: e.target.value })}>{['FARMER','COMPANY','INTERNAL_FARM','CONSULTING_CLIENT'].map(t => <option key={t}>{t}</option>)}</Form.Select></Form.Group></Col>
              <Col xs={12}><Form.Group><Form.Label className="small fw-semibold">Location</Form.Label><Form.Control value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></Form.Group></Col>
            </Row>
            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="success" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button variant="outline-secondary" onClick={() => navigate('/pharmacy')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CustomerForm;
