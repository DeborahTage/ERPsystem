import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { inventoryApi } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await inventoryApi.stockIn({
        ...form,
        itemId: Number(form.itemId),
        quantity: Number(form.quantity),
        unitCost: form.unitCost ? Number(form.unitCost) : null,
      });
      navigate('/inventory');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to record stock in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Stock In</h1>
        <p className="text-sm text-gray-500">Log incoming inventory with batch, supplier, and expiry details.</p>
      </div>

      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Stock In Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Select
                label="Item"
                value={form.itemId}
                onChange={e => setForm({ ...form, itemId: e.target.value })}
                options={[{ value: '', label: '-- Select Item --' }, ...items.map(item => ({ value: String(item.id), label: item.itemName }))]}
                required
              />
              <Input
                label="Batch Number"
                value={form.batchNumber}
                onChange={e => setForm({ ...form, batchNumber: e.target.value })}
              />
              <Input
                label="Quantity"
                type="number"
                min="0"
                step="0.01"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                required
              />
              <Input
                label="Unit Cost"
                type="number"
                min="0"
                step="0.01"
                value={form.unitCost}
                onChange={e => setForm({ ...form, unitCost: e.target.value })}
              />
              <Input
                label="Supplier"
                value={form.supplier}
                onChange={e => setForm({ ...form, supplier: e.target.value })}
              />
              <Input
                label="Expiry Date"
                type="date"
                value={form.expiryDate}
                onChange={e => setForm({ ...form, expiryDate: e.target.value })}
              />
              <Input
                label="Date Received"
                type="date"
                value={form.dateReceived}
                onChange={e => setForm({ ...form, dateReceived: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={loading}>{loading ? 'Saving...' : 'Record Stock In'}</Button>
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate('/inventory')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockInForm;
