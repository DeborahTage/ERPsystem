import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vetApi } from '../../api';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

const PrescriptionForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ prescriptionNumber: '', drugName: '', quantity: '', dosageInstruction: '', farmId: '', clientId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await vetApi.createPrescription({ ...form, quantity: Number(form.quantity), farmId: form.farmId ? Number(form.farmId) : null, clientId: form.clientId ? Number(form.clientId) : null });
      toast.success('Prescription created');
      navigate('/veterinary');
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">Create Prescription</h5>
      <Card className="border-0 shadow-sm" style={{ maxWidth: 500 }}>
        <Card.Body className="p-4">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Rx Number *</Form.Label><Form.Control value={form.prescriptionNumber} onChange={e => setForm({ ...form, prescriptionNumber: e.target.value })} required /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Drug Name *</Form.Label><Form.Control value={form.drugName} onChange={e => setForm({ ...form, drugName: e.target.value })} required /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Quantity *</Form.Label><Form.Control type="number" min="0.01" step="0.01" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required /></Form.Group></Col>
              <Col xs={12}><Form.Group><Form.Label className="small fw-semibold">Dosage Instructions</Form.Label><Form.Control as="textarea" rows={2} value={form.dosageInstruction} onChange={e => setForm({ ...form, dosageInstruction: e.target.value })} /></Form.Group></Col>
            </Row>
            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="success" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button variant="outline-secondary" onClick={() => navigate('/veterinary')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PrescriptionForm;
