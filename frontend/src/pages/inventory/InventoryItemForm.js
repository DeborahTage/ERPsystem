import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { inventoryApi } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';

const InventoryItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ itemName: '', category: 'FEED', unit: 'KG', minimumStockLevel: '', expiryRequired: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      inventoryApi.getItem(id).then(r => {
        const item = r.data.data;
        setForm({
          itemName: item.itemName,
          category: item.category,
          unit: item.unit,
          minimumStockLevel: item.minimumStockLevel || '',
          expiryRequired: item.expiryRequired,
        });
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        minimumStockLevel: form.minimumStockLevel ? Number(form.minimumStockLevel) : null,
      };
      if (isEdit) await inventoryApi.updateItem(id, payload);
      else await inventoryApi.createItem(payload);
      navigate('/inventory');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{isEdit ? 'Edit Item' : 'Add Inventory Item'}</h1>
        <p className="text-sm text-gray-500">Manage inventory item details with a modern, clean form.</p>
      </div>

      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Input
                label="Item Name"
                value={form.itemName}
                onChange={e => setForm({ ...form, itemName: e.target.value })}
                required
              />
              <Select
                label="Category"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                options={['FEED', 'DRUG', 'VACCINE', 'EQUIPMENT', 'MATERIAL'].map(value => ({ value, label: value }))}
              />
              <Select
                label="Unit"
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value })}
                options={['KG', 'SACK', 'BOTTLE', 'VIAL', 'PIECE', 'LITER'].map(value => ({ value, label: value }))}
              />
              <Input
                label="Minimum Stock Level"
                type="number"
                min="0"
                value={form.minimumStockLevel}
                onChange={e => setForm({ ...form, minimumStockLevel: e.target.value })}
              />
            </div>
            <div className="grid gap-4">
              <div className="flex items-center justify-between rounded-3xl border border-gray-200 bg-gray-50 p-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Expiry Required</p>
                  <p className="text-sm text-gray-500">Toggle whether the item needs an expiry date to be tracked.</p>
                </div>
                <Switch
                  checked={form.expiryRequired}
                  onCheckedChange={value => setForm(prev => ({ ...prev, expiryRequired: value }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate('/inventory')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryItemForm;
