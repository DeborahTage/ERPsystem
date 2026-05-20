import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { inventoryApi } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await inventoryApi.stockOut({
        ...form,
        itemId: Number(form.itemId),
        quantity: Number(form.quantity),
      });
      navigate('/inventory');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to record stock out.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Stock Out</h1>
        <p className="text-sm text-gray-500">Capture inventory issuance details for internal or external use.</p>
      </div>

      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Stock Out Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Select
                label="Item"
                value={form.itemId}
                onChange={e => setForm({ ...form, itemId: e.target.value })}
                options={[{ value: '', label: '-- Select Item --' }, ...items.map(item => ({ value: String(item.id), label: `${item.itemName} (Stock: ${item.currentStock})` }))]}
                required
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
              <Select
                label="Issued To"
                value={form.issuedToType}
                onChange={e => setForm({ ...form, issuedToType: e.target.value })}
                options={['FARM', 'DEPARTMENT', 'CUSTOMER', 'INTERNAL'].map(value => ({ value, label: value }))}
              />
              <Input
                label="Department"
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              />
            </div>
            <Textarea
              label="Reason"
              rows={3}
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={loading}>{loading ? 'Saving...' : 'Record Stock Out'}</Button>
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate('/inventory')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockOutForm;
