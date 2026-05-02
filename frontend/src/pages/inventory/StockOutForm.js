import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { inventoryApi } from '../../api';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

const StockOutForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ itemId: location.state?.itemId || '', quantity: '', reason: '', issuedToType: 'INTERNAL', department: '' });
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    inventoryApi.getItems().then(r => setItems(r.data.data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await inventoryApi.stockOut({ ...form, itemId: Number(form.itemId), quantity: Number(form.quantity) });
      toast.success('Stock out recorded');
      navigate('/inventory');
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording stock out');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">Stock Out</h5>
      <Card className="border-0 shadow-sm" style={{ maxWidth: 500 }}>
        <Card.Body className="p-4">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={12}><Form.Group><Form.Label className="small fw-semibold">Item *</Form.Label><Form.Select value={form.itemId} onChange={e => setForm({ ...form, itemId: e.target.value })} required><option value="">-- Select Item --</option>{items.map(i => <option key={i.id} value={i.id}>{i.itemName} (Stock: {i.currentStock})</option>)}</Form.Select></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Quantity *</Form.Label><Form.Control type="number" min="0.01" step="0.01" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Issued To</Form.Label><Form.Select value={form.issuedToType} onChange={e => setForm({ ...form, issuedToType: e.target.value })}>{['FARM','DEPARTMENT','CUSTOMER','INTERNAL'].map(t => <option key={t}>{t}</option>)}</Form.Select></Form.Group></Col>
              <Col xs={12}><Form.Group><Form.Label className="small fw-semibold">Reason</Form.Label><Form.Control value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></Form.Group></Col>
            </Row>
            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="warning" disabled={loading}>{loading ? 'Saving...' : 'Record Stock Out'}</Button>
              <Button variant="outline-secondary" onClick={() => navigate('/inventory')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StockOutForm;
