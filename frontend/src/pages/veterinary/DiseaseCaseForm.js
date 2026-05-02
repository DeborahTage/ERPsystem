import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vetApi, farmApi, flockApi } from '../../api';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

const DiseaseCaseForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ farmId: '', flockId: '', dateDetected: '', symptoms: '', suspectedDisease: '', numberAffected: '', numberDead: '', severity: 'LOW' });
  const [farms, setFarms] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    farmApi.getAll().then(r => setFarms(r.data.data?.filter(f => f.status === 'ACTIVE') || []));
  }, []);

  const handleFarmChange = (farmId) => {
    setForm(f => ({ ...f, farmId, flockId: '' }));
    if (farmId) flockApi.getAll().then(r => setFlocks(r.data.data?.filter(f => String(f.farmId) === String(farmId) && f.status === 'ACTIVE') || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await vetApi.createDiseaseCase({ ...form, farmId: Number(form.farmId), flockId: Number(form.flockId), numberAffected: Number(form.numberAffected), numberDead: Number(form.numberDead) });
      toast.success('Disease case recorded');
      navigate('/veterinary');
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">Record Disease Case</h5>
      <Card className="border-0 shadow-sm" style={{ maxWidth: 600 }}>
        <Card.Body className="p-4">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Farm *</Form.Label><Form.Select value={form.farmId} onChange={e => handleFarmChange(e.target.value)} required><option value="">-- Select --</option>{farms.map(f => <option key={f.id} value={f.id}>{f.farmName}</option>)}</Form.Select></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Flock *</Form.Label><Form.Select value={form.flockId} onChange={e => setForm({ ...form, flockId: e.target.value })} required><option value="">-- Select --</option>{flocks.map(f => <option key={f.id} value={f.id}>{f.batchCode}</option>)}</Form.Select></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Date Detected</Form.Label><Form.Control type="date" value={form.dateDetected} onChange={e => setForm({ ...form, dateDetected: e.target.value })} /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Suspected Disease</Form.Label><Form.Control value={form.suspectedDisease} onChange={e => setForm({ ...form, suspectedDisease: e.target.value })} /></Form.Group></Col>
              <Col xs={12}><Form.Group><Form.Label className="small fw-semibold">Symptoms</Form.Label><Form.Control as="textarea" rows={2} value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })} /></Form.Group></Col>
              <Col xs={4}><Form.Group><Form.Label className="small fw-semibold">Affected</Form.Label><Form.Control type="number" min="0" value={form.numberAffected} onChange={e => setForm({ ...form, numberAffected: e.target.value })} /></Form.Group></Col>
              <Col xs={4}><Form.Group><Form.Label className="small fw-semibold">Dead</Form.Label><Form.Control type="number" min="0" value={form.numberDead} onChange={e => setForm({ ...form, numberDead: e.target.value })} /></Form.Group></Col>
              <Col xs={4}><Form.Group><Form.Label className="small fw-semibold">Severity</Form.Label><Form.Select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>{['LOW','MODERATE','HIGH','CRITICAL'].map(s => <option key={s}>{s}</option>)}</Form.Select></Form.Group></Col>
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

export default DiseaseCaseForm;
