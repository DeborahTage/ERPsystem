import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmacyApi } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';

const CustomerForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ customerName: '', phone: '', location: '', customerType: 'FARMER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await pharmacyApi.createCustomer(form);
      navigate('/pharmacy');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add Customer</h1>
        <p className="text-sm text-gray-500">Create a customer record for pharmacy sales and follow-up.</p>
      </div>

      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Customer Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Name"
                value={form.customerName}
                onChange={e => setForm({ ...form, customerName: e.target.value })}
                required
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
              <Select
                label="Type"
                value={form.customerType}
                onChange={e => setForm({ ...form, customerType: e.target.value })}
                options={['FARMER', 'COMPANY', 'INTERNAL_FARM', 'CONSULTING_CLIENT'].map(value => ({ value, label: value }))}
              />
              <Input
                label="Location"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate('/pharmacy')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerForm;
