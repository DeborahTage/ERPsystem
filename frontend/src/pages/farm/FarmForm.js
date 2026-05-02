import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { farmApi, userApi } from '../../api';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

const FarmForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ farmName: '', location: '', farmType: 'BROILER', capacity: '', assignedFarmManagerId: '' });
  const [managers, setManagers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    userApi.getAll().then(r => setManagers(r.data.data?.filter(u => u.role === 'FARM_MANAGER') || []));
    if (isEdit) {
      farmApi.getById(id).then(r => {
        const f = r.data.data;
        setForm({ farmName: f.farmName, location: f.location || '', farmType: f.farmType, capacity: f.capacity || '', assignedFarmManagerId: f.assignedFarmManagerId || '' });
      });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, capacity: Number(form.capacity), assignedFarmManagerId: form.assignedFarmManagerId || null };
      if (isEdit) await farmApi.update(id, payload);
      else await farmApi.create(payload);
      toast.success(`Farm ${isEdit ? 'updated' : 'created'}`);
      navigate('/farms');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving farm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">{isEdit ? 'Edit Farm' : 'Add Farm'}</h5>
      <Card className="border-0 shadow-sm" style={{ maxWidth: 600 }}>
        <Card.Body className="p-4">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={12}><Form.Group><Form.Label className="small fw-semibold">Farm Name *</Form.Label><Form.Control value={form.farmName} onChange={e => setForm({ ...form, farmName: e.target.value })} required /></Form.Group></Col>
              <Col xs={12} sm={6}><Form.Group><Form.Label className="small fw-semibold">Location</Form.Label><Form.Control value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></Form.Group></Col>
              <Col xs={12} sm={6}><Form.Group><Form.Label className="small fw-semibold">Farm Type *</Form.Label><Form.Select value={form.farmType} onChange={e => setForm({ ...form, farmType: e.target.value })}><option value="BROILER">Broiler</option><option value="LAYER">Layer</option><option value="MIXED">Mixed</option></Form.Select></Form.Group></Col>
              <Col xs={12} sm={6}><Form.Group><Form.Label className="small fw-semibold">Capacity</Form.Label><Form.Control type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} /></Form.Group></Col>
              <Col xs={12} sm={6}><Form.Group><Form.Label className="small fw-semibold">Farm Manager</Form.Label><Form.Select value={form.assignedFarmManagerId} onChange={e => setForm({ ...form, assignedFarmManagerId: e.target.value })}><option value="">-- Select --</option>{managers.map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}</Form.Select></Form.Group></Col>
            </Row>
            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="success" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button variant="outline-secondary" onClick={() => navigate('/farms')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default FarmForm;
