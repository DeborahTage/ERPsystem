import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmacyApi, inventoryApi } from '../../api';
import { Card, Form, Button, Row, Col, Alert, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils';

const PharmacySaleForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ receiptNumber: '', customerId: '', saleDate: new Date().toISOString().split('T')[0], paymentMethod: 'CASH', prescriptionId: '' });
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ inventoryItemId: '', quantity: '', unitPrice: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    pharmacyApi.getCustomers().then(r => setCustomers(r.data.data || []));
    inventoryApi.getItems().then(r => setInventoryItems(r.data.data?.filter(i => i.status === 'ACTIVE') || []));
  }, []);

  const addItem = () => {
    if (!currentItem.inventoryItemId || !currentItem.quantity || !currentItem.unitPrice) return;
    const inv = inventoryItems.find(i => String(i.id) === String(currentItem.inventoryItemId));
    setItems(prev => [...prev, { ...currentItem, itemName: inv?.itemName, total: Number(currentItem.quantity) * Number(currentItem.unitPrice) }]);
    setCurrentItem({ inventoryItemId: '', quantity: '', unitPrice: '' });
  };

  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const total = items.reduce((sum, i) => sum + i.total, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) { setError('Add at least one item'); return; }
    setLoading(true);
    try {
      await pharmacyApi.createSale({
        ...form,
        customerId: form.customerId ? Number(form.customerId) : null,
        prescriptionId: form.prescriptionId ? Number(form.prescriptionId) : null,
        items: items.map(i => ({ inventoryItemId: Number(i.inventoryItemId), quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) }))
      });
      toast.success('Sale completed');
      navigate('/pharmacy');
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing sale');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">New Pharmacy Sale</h5>
      {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
      <Row className="g-3">
        <Col xs={12} lg={7}>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Body className="p-4">
              <h6 className="fw-semibold mb-3">Sale Details</h6>
              <Row className="g-3">
                <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Receipt # *</Form.Label><Form.Control value={form.receiptNumber} onChange={e => setForm({ ...form, receiptNumber: e.target.value })} required /></Form.Group></Col>
                <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Date</Form.Label><Form.Control type="date" value={form.saleDate} onChange={e => setForm({ ...form, saleDate: e.target.value })} /></Form.Group></Col>
                <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Customer</Form.Label><Form.Select value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}><option value="">-- Walk-in --</option>{customers.map(c => <option key={c.id} value={c.id}>{c.customerName}</option>)}</Form.Select></Form.Group></Col>
                <Col xs={6}><Form.Group><Form.Label className="small fw-semibold">Payment Method</Form.Label><Form.Select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>{['CASH','BANK_TRANSFER','MOBILE_MONEY','CREDIT'].map(m => <option key={m}>{m}</option>)}</Form.Select></Form.Group></Col>
              </Row>
            </Card.Body>
          </Card>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h6 className="fw-semibold mb-3">Add Items</h6>
              <Row className="g-2 align-items-end">
                <Col xs={5}><Form.Select value={currentItem.inventoryItemId} onChange={e => setCurrentItem({ ...currentItem, inventoryItemId: e.target.value })}><option value="">-- Select Item --</option>{inventoryItems.map(i => <option key={i.id} value={i.id}>{i.itemName} ({i.currentStock} {i.unit})</option>)}</Form.Select></Col>
                <Col xs={3}><Form.Control type="number" min="0.01" step="0.01" placeholder="Qty" value={currentItem.quantity} onChange={e => setCurrentItem({ ...currentItem, quantity: e.target.value })} /></Col>
                <Col xs={3}><Form.Control type="number" min="0.01" step="0.01" placeholder="Unit Price" value={currentItem.unitPrice} onChange={e => setCurrentItem({ ...currentItem, unitPrice: e.target.value })} /></Col>
                <Col xs={1}><Button variant="success" onClick={addItem}>+</Button></Col>
              </Row>
              {items.length > 0 && (
                <Table size="sm" className="mt-3">
                  <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th><th></th></tr></thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.itemName}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.unitPrice)}</td>
                        <td>{formatCurrency(item.total)}</td>
                        <td><Button size="sm" variant="outline-danger" onClick={() => removeItem(i)}>×</Button></td>
                      </tr>
                    ))}
                    <tr className="fw-bold"><td colSpan={3}>Total</td><td>{formatCurrency(total)}</td><td></td></tr>
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={5}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h6 className="fw-semibold mb-3">Summary</h6>
              <div className="d-flex justify-content-between mb-2"><span>Items:</span><span>{items.length}</span></div>
              <div className="d-flex justify-content-between mb-3 fw-bold fs-5"><span>Total:</span><span className="text-success">{formatCurrency(total)}</span></div>
              <Button variant="success" className="w-100" onClick={handleSubmit} disabled={loading || items.length === 0}>
                {loading ? 'Processing...' : 'Complete Sale'}
              </Button>
              <Button variant="outline-secondary" className="w-100 mt-2" onClick={() => navigate('/pharmacy')}>Cancel</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PharmacySaleForm;
