import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dailyRecordApi, farmApi, flockApi } from '../../api';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

const DailyFarmRecordForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ date: '', farmId: '', flockId: '', openingBirdCount: '', mortality: 0, culledBirds: 0, feedConsumed: '', waterConsumed: '', averageWeight: '', eggProduction: 0, damagedEggs: 0, symptomsOrRemarks: '' });
  const [farms, setFarms] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const farmsRes = await farmApi.getAll();
        setFarms(farmsRes.data.data?.filter(f => f.status === 'ACTIVE') || []);
        
        if (isEdit) {
          const recordRes = await dailyRecordApi.getById(id);
          const d = recordRes.data.data;
          setForm({ 
            date: d.date, 
            farmId: d.farmId, 
            flockId: d.flockId, 
            openingBirdCount: d.openingBirdCount || '', 
            mortality: d.mortality || 0, 
            culledBirds: d.culledBirds || 0, 
            feedConsumed: d.feedConsumed || '', 
            waterConsumed: d.waterConsumed || '', 
            averageWeight: d.averageWeight || '', 
            eggProduction: d.eggProduction || 0, 
            damagedEggs: d.damagedEggs || 0, 
            symptomsOrRemarks: d.symptomsOrRemarks || '' 
          });
          const flocksRes = await flockApi.getAll();
          setFlocks(flocksRes.data.data?.filter(f => f.farmId === d.farmId) || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      }
    };
    loadData();
  }, [id]);

  const handleFarmChange = (farmId) => {
    setForm(f => ({ ...f, farmId, flockId: '' }));
    if (farmId) flockApi.getAll().then(r => setFlocks(r.data.data?.filter(f => String(f.farmId) === String(farmId) && f.status === 'ACTIVE') || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, farmId: Number(form.farmId), flockId: Number(form.flockId), openingBirdCount: Number(form.openingBirdCount), mortality: Number(form.mortality), culledBirds: Number(form.culledBirds), feedConsumed: Number(form.feedConsumed), waterConsumed: Number(form.waterConsumed), averageWeight: form.averageWeight ? Number(form.averageWeight) : null, eggProduction: Number(form.eggProduction), damagedEggs: Number(form.damagedEggs) };
      if (isEdit) await dailyRecordApi.update(id, payload);
      else await dailyRecordApi.create(payload);
      toast.success('Record saved');
      navigate('/daily-records');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">{isEdit ? 'Edit Daily Record' : 'Add Daily Record'}</h5>
      <Card className="border-0 shadow-sm" style={{ maxWidth: 700 }}>
        <Card.Body className="p-4">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={12} sm={4}><Form.Group><Form.Label className="small fw-semibold">Date *</Form.Label><Form.Control type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></Form.Group></Col>
              <Col xs={12} sm={4}><Form.Group><Form.Label className="small fw-semibold">Farm *</Form.Label><Form.Select value={form.farmId} onChange={e => handleFarmChange(e.target.value)} required><option value="">-- Select --</option>{farms.map(f => <option key={f.id} value={f.id}>{f.farmName}</option>)}</Form.Select></Form.Group></Col>
              <Col xs={12} sm={4}><Form.Group><Form.Label className="small fw-semibold">Flock *</Form.Label><Form.Select value={form.flockId} onChange={e => setForm({ ...form, flockId: e.target.value })} required><option value="">-- Select --</option>{flocks.map(f => <option key={f.id} value={f.id}>{f.batchCode}</option>)}</Form.Select></Form.Group></Col>
              <Col xs={6} sm={3}><Form.Group><Form.Label className="small fw-semibold">Opening Count</Form.Label><Form.Control type="number" value={form.openingBirdCount} onChange={e => setForm({ ...form, openingBirdCount: e.target.value })} /></Form.Group></Col>
              <Col xs={6} sm={3}><Form.Group><Form.Label className="small fw-semibold">Mortality</Form.Label><Form.Control type="number" min="0" value={form.mortality} onChange={e => setForm({ ...form, mortality: e.target.value })} /></Form.Group></Col>
              <Col xs={6} sm={3}><Form.Group><Form.Label className="small fw-semibold">Culled Birds</Form.Label><Form.Control type="number" min="0" value={form.culledBirds} onChange={e => setForm({ ...form, culledBirds: e.target.value })} /></Form.Group></Col>
              <Col xs={6} sm={3}><Form.Group><Form.Label className="small fw-semibold">Feed Consumed (kg)</Form.Label><Form.Control type="number" min="0" step="0.01" value={form.feedConsumed} onChange={e => setForm({ ...form, feedConsumed: e.target.value })} /></Form.Group></Col>
              <Col xs={6} sm={3}><Form.Group><Form.Label className="small fw-semibold">Water (L)</Form.Label><Form.Control type="number" min="0" step="0.01" value={form.waterConsumed} onChange={e => setForm({ ...form, waterConsumed: e.target.value })} /></Form.Group></Col>
              <Col xs={6} sm={3}><Form.Group><Form.Label className="small fw-semibold">Avg Weight (kg)</Form.Label><Form.Control type="number" min="0" step="0.01" value={form.averageWeight} onChange={e => setForm({ ...form, averageWeight: e.target.value })} /></Form.Group></Col>
              <Col xs={6} sm={3}><Form.Group><Form.Label className="small fw-semibold">Egg Production</Form.Label><Form.Control type="number" min="0" value={form.eggProduction} onChange={e => setForm({ ...form, eggProduction: e.target.value })} /></Form.Group></Col>
              <Col xs={6} sm={3}><Form.Group><Form.Label className="small fw-semibold">Damaged Eggs</Form.Label><Form.Control type="number" min="0" value={form.damagedEggs} onChange={e => setForm({ ...form, damagedEggs: e.target.value })} /></Form.Group></Col>
              <Col xs={12}><Form.Group><Form.Label className="small fw-semibold">Symptoms / Remarks</Form.Label><Form.Control as="textarea" rows={2} value={form.symptomsOrRemarks} onChange={e => setForm({ ...form, symptomsOrRemarks: e.target.value })} /></Form.Group></Col>
            </Row>
            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="success" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button variant="outline-secondary" onClick={() => navigate('/daily-records')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DailyFarmRecordForm;
