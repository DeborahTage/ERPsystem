import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { crmApi, userApi } from '../../api';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

const CrmClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ clientName: '', phone: '', location: '', farmType: '', farmSize: '', numberOfBirds: '', status: 'LEAD', assignedExtensionWorkerId: '' });
  const [workers, setWorkers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    userApi.getAll().then(r => setWorkers(r.data.data?.filter(u => u.role === 'EXTENSION_WORKER') || []));
    if (isEdit) crmApi.getClient(id).then(r => {
      const c = r.data.data;
      setForm({ clientName: c.clientName, phone: c.phone || '', location: c.location || '', farmType: c.farmType || '', farmSize: c.farmSize || '', numberOfBirds: c.numberOfBirds || '', status: c.status, assignedExtensionWorkerId: c.assignedExtensionWorkerId || '' });
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, numberOfBirds: form.numberOfBirds ? Number(form.numberOfBirds) : null, assignedExtensionWorkerId: form.assignedExtensionWorkerId ? Number(form.assignedExtensionWorkerId) : null };
      if (isEdit) await crmApi.updateClient(id, payload);
      else await crmApi.createClient(payload);
      toast.success(`Client ${isEdit ? 'updated' : 'created'}`);
      navigate('/crm');
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">{isEdit ? 'Edit Client' : 'Add Client'}</h5>
      <Card className="border-0 shadow-sm" style={{ maxWidth: 600 }}>
        <Card.Body className="p-4">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={12}><Form.Group><Form.Label className="small fw-semibold">Client Name *</Form.Label><Form.Control value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} required /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Phone</Form.Label><Form.Control value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Location</Form.Label><Form.Control value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Farm Type</Form.Label><Form.Control value={form.farmType} onChange={e => setForm({ ...form, farmType: e.target.value })} /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Farm Size</Form.Label><Form.Control value={form.farmSize} onChange={e => setForm({ ...form, farmSize: e.target.value })} /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Number of Birds</Form.Label><Form.Control type="number" min="0" value={form.numberOfBirds} onChange={e => setForm({ ...form, numberOfBirds: e.target.value })} /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Status</Form.Label><Form.Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{['LEAD','ACTIVE','INACTIVE','LOST'].map(s => <option key={s}>{s}</option>)}</Form.Select></Form.Group></Col>
              <Col xs={12}><Form.Group><Form.Label className="small fw-semibold">Extension Worker</Form.Label><Form.Select value={form.assignedExtensionWorkerId} onChange={e => setForm({ ...form, assignedExtensionWorkerId: e.target.value })}><option value="">-- None --</option>{workers.map(w => <option key={w.id} value={w.id}>{w.fullName}</option>)}</Form.Select></Form.Group></Col>
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

export default CrmClientForm;
