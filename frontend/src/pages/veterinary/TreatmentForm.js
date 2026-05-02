import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vetApi, farmApi, flockApi } from '../../api';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

const TreatmentForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ farmId: '', flockId: '', diseaseCaseId: '', drugName: '', dosage: '', route: '', duration: '', startDate: '', endDate: '', outcome: '' });
  const [farms, setFarms] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [cases, setCases] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    farmApi.getAll().then(r => setFarms(r.data.data?.filter(f => f.status === 'ACTIVE') || []));
    vetApi.getDiseaseCases().then(r => setCases(r.data.data?.filter(c => c.status === 'ACTIVE') || []));
  }, []);

  const handleFarmChange = (farmId) => {
    setForm(f => ({ ...f, farmId, flockId: '' }));
    if (farmId) flockApi.getAll().then(r => setFlocks(r.data.data?.filter(f => String(f.farmId) === String(farmId) && f.status === 'ACTIVE') || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await vetApi.createTreatment({ ...form, farmId: Number(form.farmId), flockId: Number(form.flockId), diseaseCaseId: form.diseaseCaseId ? Number(form.diseaseCaseId) : null });
      toast.success('Treatment recorded');
      navigate('/veterinary');
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">Record Treatment</h5>
      <Card className="border-0 shadow-sm" style={{ maxWidth: 600 }}>
        <Card.Body className="p-4">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Farm *</Form.Label><Form.Select value={form.farmId} onChange={e => handleFarmChange(e.target.value)} required><option value="">-- Select --</option>{farms.map(f => <option key={f.id} value={f.id}>{f.farmName}</option>)}</Form.Select></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Flock *</Form.Label><Form.Select value={form.flockId} onChange={e => setForm({ ...form, flockId: e.target.value })} required><option value="">-- Select --</option>{flocks.map(f => <option key={f.id} value={f.id}>{f.batchCode}</option>)}</Form.Select></Form.Group></Col>
              <Col xs={12}><Form.Group><Form.Label className="small fw-semibold">Disease Case (optional)</Form.Label><Form.Select value={form.diseaseCaseId} onChange={e => setForm({ ...form, diseaseCaseId: e.target.value })}><option value="">-- None --</option>{cases.map(c => <option key={c.id} value={c.id}>{c.suspectedDisease} - {c.farmName}</option>)}</Form.Select></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Drug Name *</Form.Label><Form.Control value={form.drugName} onChange={e => setForm({ ...form, drugName: e.target.value })} required /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Dosage</Form.Label><Form.Control value={form.dosage} onChange={e => setForm({ ...form, dosage: e.target.value })} /></Form.Group></Col>
              <Col xs={4}><Form.Group><Form.Label className="small fw-semibold">Route</Form.Label><Form.Control value={form.route} onChange={e => setForm({ ...form, route: e.target.value })} /></Form.Group></Col>
              <Col xs={4}><Form.Group><Form.Label className="small fw-semibold">Duration</Form.Label><Form.Control value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} /></Form.Group></Col>
              <Col xs={4}><Form.Group><Form.Label className="small fw-semibold">Outcome</Form.Label><Form.Control value={form.outcome} onChange={e => setForm({ ...form, outcome: e.target.value })} /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Start Date</Form.Label><Form.Control type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">End Date</Form.Label><Form.Control type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></Form.Group></Col>
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

export default TreatmentForm;
