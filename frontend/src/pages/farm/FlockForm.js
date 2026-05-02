import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { flockApi, farmApi } from '../../api';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

const FlockForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ batchCode: '', farmId: '', birdType: '', initialBirdCount: '', startDate: '', expectedEndDate: '' });
  const [farms, setFarms] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    farmApi.getAll().then(r => setFarms(r.data.data?.filter(f => f.status === 'ACTIVE') || []));
    if (isEdit) {
      flockApi.getById(id).then(r => {
        const f = r.data.data;
        setForm({ batchCode: f.batchCode, farmId: f.farmId, birdType: f.birdType || '', initialBirdCount: f.initialBirdCount || '', startDate: f.startDate || '', expectedEndDate: f.expectedEndDate || '' });
      });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, farmId: Number(form.farmId), initialBirdCount: Number(form.initialBirdCount) };
      if (isEdit) await flockApi.update(id, payload);
      else await flockApi.create(payload);
      toast.success(`Flock ${isEdit ? 'updated' : 'created'}`);
      navigate('/flocks');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving flock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">{isEdit ? 'Edit Flock' : 'Add Flock'}</h5>
      <Card className="border-0 shadow-sm" style={{ maxWidth: 600 }}>
        <Card.Body className="p-4">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={12} sm={6}><Form.Group><Form.Label className="small fw-semibold">Batch Code *</Form.Label><Form.Control value={form.batchCode} onChange={e => setForm({ ...form, batchCode: e.target.value })} required disabled={isEdit} /></Form.Group></Col>
              <Col xs={12} sm={6}><Form.Group><Form.Label className="small fw-semibold">Farm *</Form.Label><Form.Select value={form.farmId} onChange={e => setForm({ ...form, farmId: e.target.value })} required disabled={isEdit}><option value="">-- Select Farm --</option>{farms.map(f => <option key={f.id} value={f.id}>{f.farmName}</option>)}</Form.Select></Form.Group></Col>
              <Col xs={12} sm={6}><Form.Group><Form.Label className="small fw-semibold">Bird Type</Form.Label><Form.Control value={form.birdType} onChange={e => setForm({ ...form, birdType: e.target.value })} /></Form.Group></Col>
              <Col xs={12} sm={6}><Form.Group><Form.Label className="small fw-semibold">Initial Bird Count</Form.Label><Form.Control type="number" value={form.initialBirdCount} onChange={e => setForm({ ...form, initialBirdCount: e.target.value })} disabled={isEdit} /></Form.Group></Col>
              <Col xs={12} sm={6}><Form.Group><Form.Label className="small fw-semibold">Start Date</Form.Label><Form.Control type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></Form.Group></Col>
              <Col xs={12} sm={6}><Form.Group><Form.Label className="small fw-semibold">Expected End Date</Form.Label><Form.Control type="date" value={form.expectedEndDate} onChange={e => setForm({ ...form, expectedEndDate: e.target.value })} /></Form.Group></Col>
            </Row>
            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="success" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button variant="outline-secondary" onClick={() => navigate('/flocks')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default FlockForm;
