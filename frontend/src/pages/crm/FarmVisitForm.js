import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { crmApi } from '../../api';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

const FarmVisitForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ clientId: location.state?.clientId || '', visitDate: new Date().toISOString().split('T')[0], purpose: '', observation: '', adviceGiven: '', nextFollowUpDate: '' });
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    crmApi.getClients().then(r => setClients(r.data.data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await crmApi.createVisit({ ...form, clientId: Number(form.clientId) });
      toast.success('Visit recorded');
      navigate('/crm');
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">Record Farm Visit</h5>
      <Card className="border-0 shadow-sm" style={{ maxWidth: 600 }}>
        <Card.Body className="p-4">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Client *</Form.Label><Form.Select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} required><option value="">-- Select --</option>{clients.map(c => <option key={c.id} value={c.id}>{c.clientName}</option>)}</Form.Select></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Visit Date</Form.Label><Form.Control type="date" value={form.visitDate} onChange={e => setForm({ ...form, visitDate: e.target.value })} /></Form.Group></Col>
              <Col xs={12}><Form.Group><Form.Label className="small fw-semibold">Purpose</Form.Label><Form.Control value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} /></Form.Group></Col>
              <Col xs={12}><Form.Group><Form.Label className="small fw-semibold">Observation</Form.Label><Form.Control as="textarea" rows={2} value={form.observation} onChange={e => setForm({ ...form, observation: e.target.value })} /></Form.Group></Col>
              <Col xs={12}><Form.Group><Form.Label className="small fw-semibold">Advice Given</Form.Label><Form.Control as="textarea" rows={2} value={form.adviceGiven} onChange={e => setForm({ ...form, adviceGiven: e.target.value })} /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Next Follow-up Date</Form.Label><Form.Control type="date" value={form.nextFollowUpDate} onChange={e => setForm({ ...form, nextFollowUpDate: e.target.value })} /></Form.Group></Col>
            </Row>
            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="success" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button variant="outline-secondary" onClick={() => navigate('/crm')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default FarmVisitForm;
