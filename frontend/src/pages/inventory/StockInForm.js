import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { inventoryApi } from '../../api';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

const StockInForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ itemId: location.state?.itemId || '', batchNumber: '', quantity: '', unitCost: '', supplier: '', expiryDate: '', dateReceived: new Date().toISOString().split('T')[0] });
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
      await inventoryApi.stockIn({ ...form, itemId: Number(form.itemId), quantity: Number(form.quantity), unitCost: form.unitCost ? Number(form.unitCost) : null });
      toast.success('Stock recorded');
      navigate('/inventory');
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording stock');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">Stock In</h5>
      <Card className="border-0 shadow-sm" style={{ maxWidth: 550 }}>
        <Card.Body className="p-4">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={12}><Form.Group><Form.Label className="small fw-semibold">Item *</Form.Label><Form.Select value={form.itemId} onChange={e => setForm({ ...form, itemId: e.target.value })} required><option value="">-- Select Item --</option>{items.map(i => <option key={i.id} value={i.id}>{i.itemName}</option>)}</Form.Select></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Batch Number</Form.Label><Form.Control value={form.batchNumber} onChange={e => setForm({ ...form, batchNumber: e.target.value })} /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Quantity *</Form.Label><Form.Control type="number" min="0.01" step="0.01" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Unit Cost</Form.Label><Form.Control type="number" min="0" step="0.01" value={form.unitCost} onChange={e => setForm({ ...form, unitCost: e.target.value })} /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Supplier</Form.Label><Form.Control value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Expiry Date</Form.Label><Form.Control type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} /></Form.Group></Col>
              <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Date Received</Form.Label><Form.Control type="date" value={form.dateReceived} onChange={e => setForm({ ...form, dateReceived: e.target.value })} /></Form.Group></Col>
            </Row>
            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="success" disabled={loading}>{loading ? 'Saving...' : 'Record Stock In'}</Button>
              <Button variant="outline-secondary" onClick={() => navigate('/inventory')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StockInForm;
