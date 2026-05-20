import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { financeApi } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';

const INCOME_CATS = ['PHARMACY_SALES', 'EGG_SALES', 'CHICKEN_SALES', 'CONSULTING_SERVICE', 'TRAINING_FEE', 'OTHER_INCOME'];
const EXPENSE_CATS = ['FEED_PURCHASE', 'DRUG_PURCHASE', 'VACCINE_PURCHASE', 'LABOR', 'TRANSPORT', 'UTILITIES', 'EQUIPMENT', 'MAINTENANCE', 'MARKETING', 'OTHER_EXPENSE'];

const TransactionForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ transactionType: 'INCOME', category: 'OTHER_INCOME', amount: '', paymentMethod: 'CASH', description: '', transactionDate: new Date().toISOString().split('T')[0] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = form.transactionType === 'INCOME' ? INCOME_CATS : EXPENSE_CATS;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await financeApi.create({ ...form, amount: Number(form.amount) });
      navigate('/finance');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to record transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Record Transaction</h1>
        <p className="text-sm text-gray-500">Log income and expense data with finance-grade controls.</p>
      </div>

      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Select
                label="Type"
                value={form.transactionType}
                onChange={e => setForm({ ...form, transactionType: e.target.value, category: e.target.value === 'INCOME' ? 'OTHER_INCOME' : 'OTHER_EXPENSE' })}
                options={['INCOME', 'EXPENSE'].map(value => ({ value, label: value }))}
              />
              <Select
                label="Category"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                options={categories.map(value => ({ value, label: value }))}
              />
              <Input
                label="Amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                required
              />
              <Select
                label="Payment Method"
                value={form.paymentMethod}
                onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                options={['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CREDIT'].map(value => ({ value, label: value }))}
              />
              <Input
                label="Date"
                type="date"
                value={form.transactionDate}
                onChange={e => setForm({ ...form, transactionDate: e.target.value })}
              />
              <Textarea
                label="Description"
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate('/finance')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionForm;
