import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmacyApi, inventoryApi } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
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
    const selected = inventoryItems.find(i => String(i.id) === String(currentItem.inventoryItemId));
    setItems(prev => [
      ...prev,
      {
        ...currentItem,
        itemName: selected?.itemName,
        total: Number(currentItem.quantity) * Number(currentItem.unitPrice),
      },
    ]);
    setCurrentItem({ inventoryItemId: '', quantity: '', unitPrice: '' });
  };

  const removeItem = (index) => setItems(prev => prev.filter((_, idx) => idx !== index));

  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + (item.total || 0), 0), [items]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!items.length) {
      setError('Add at least one item before completing the sale.');
      return;
    }
    setLoading(true);
    try {
      await pharmacyApi.createSale({
        ...form,
        customerId: form.customerId ? Number(form.customerId) : null,
        prescriptionId: form.prescriptionId ? Number(form.prescriptionId) : null,
        items: items.map(item => ({
          inventoryItemId: Number(item.inventoryItemId),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      });
      setError('');
      navigate('/pharmacy');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to complete the sale.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">New Pharmacy Sale</h1>
          <p className="text-sm text-gray-500">Capture sale details and finalize the transaction with a polished checkout form.</p>
        </div>
      </div>

      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 xl:grid-cols-[1.7fr_0.9fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sale Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Receipt #"
                  value={form.receiptNumber}
                  onChange={e => setForm({ ...form, receiptNumber: e.target.value })}
                  required
                />
                <Input
                  label="Sale Date"
                  type="date"
                  value={form.saleDate}
                  onChange={e => setForm({ ...form, saleDate: e.target.value })}
                />
                <Select
                  label="Customer"
                  value={form.customerId}
                  onChange={e => setForm({ ...form, customerId: e.target.value })}
                  options={[{ value: '', label: '-- Walk-in --' }, ...customers.map(c => ({ value: String(c.id), label: c.clientName }))]}
                />
                <Select
                  label="Payment Method"
                  value={form.paymentMethod}
                  onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                  options={['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CREDIT'].map(value => ({ value, label: value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_auto]">
                <Select
                  label="Item"
                  value={currentItem.inventoryItemId}
                  onChange={e => setCurrentItem({ ...currentItem, inventoryItemId: e.target.value })}
                  options={[{ value: '', label: '-- Select Item --' }, ...inventoryItems.map(item => ({ value: String(item.id), label: `${item.itemName} (${item.currentStock} ${item.unit})` }))]}
                />
                <Input
                  label="Quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentItem.quantity}
                  onChange={e => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                />
                <Input
                  label="Unit Price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentItem.unitPrice}
                  onChange={e => setCurrentItem({ ...currentItem, unitPrice: e.target.value })}
                />
                <div className="mt-6">
                  <Button variant="primary" className="w-full" onClick={addItem}>Add</Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Item</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">Qty</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">Unit</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-gray-900">{item.itemName}</td>
                        <td className="px-4 py-3 text-right text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(item.total)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="secondary" size="sm" onClick={() => removeItem(index)}>Remove</Button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-6 text-center text-sm text-gray-500">No sale items added yet.</td>
                      </tr>
                    )}
                  </tbody>
                  {items.length > 0 && (
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-right font-semibold text-gray-900">Total</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(totalAmount)}</td>
                        <td className="px-4 py-3" />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Items</span>
                <span>{items.length}</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xl font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
            <Input
              label="Prescription ID"
              value={form.prescriptionId}
              onChange={e => setForm({ ...form, prescriptionId: e.target.value })}
            />
            <div className="grid gap-3">
              <Button type="button" variant="primary" className="w-full" onClick={handleSubmit} disabled={loading || items.length === 0}>
                {loading ? 'Processing...' : 'Complete Sale'}
              </Button>
              <Button type="button" variant="secondary" className="w-full" onClick={() => navigate('/pharmacy')}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PharmacySaleForm;
