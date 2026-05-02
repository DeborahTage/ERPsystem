import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { inventoryApi } from '../../api';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

const InventoryItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ itemName: '', category: 'FEED', unit: 'KG', minimumStockLevel: '', expiryRequired: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) inventoryApi.getItem(id).then(r => {
      const i = r.data.data;
      setForm({ itemName: i.itemName, category: i.category, unit: i.unit, minimumStockLevel: i.minimumStockLevel || '', expiryRequired: i.expiryRequired });
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, minimumStockLevel: Number(form.minimumStockLevel) };
      if (isEdit) await inventoryApi.updateItem(id, payload);
      else await inventoryApi.createItem(payload);
      toast.success('Item saved');
      navigate('/inventory');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving item');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">{isEdit ? 'Edit Item' : 'Add Inventory Item'}</h5>
      <Card className="border-0 shadow-sm" style={{ maxWidth: 500 }}>
        <Card.Body className="p-4">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={12}><Form.Group><Form.Label className="small fw-semibold">Item Name *</Form.Label><Form.Control value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} required /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Category *</Form.Label><Form.Select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{['FEED','DRUG','VACCINE','EQUIPMENT','MATERIAL'].map(c => <option key={c}>{c}</option>)}</Form.Select></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Unit *</Form.Label><Form.Select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>{['KG','SACK','BOTTLE','VIAL','PIECE','LITER'].map(u => <option key={u}>{u}</option>)}</Form.Select></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Min Stock Level</Form.Label><Form.Control type="number" min="0" value={form.minimumStockLevel} onChange={e => setForm({ ...form, minimumStockLevel: e.target.value })} /></Form.Group></Col>
              <Col xs={6} className="d-flex align-items-end"><Form.Check type="checkbox" label="Expiry Required" checked={form.expiryRequired} onChange={e => setForm({ ...form, expiryRequired: e.target.checked })} /></Col>
            </Row>
            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="success" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button variant="outline-secondary" onClick={() => navigate('/inventory')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default InventoryItemForm;
