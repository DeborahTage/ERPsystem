import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vetApi } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';

const PrescriptionForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ prescriptionNumber: '', drugName: '', quantity: '', dosageInstruction: '', farmId: '', clientId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await vetApi.createPrescription({
        ...form,
        quantity: Number(form.quantity),
        farmId: form.farmId ? Number(form.farmId) : null,
        clientId: form.clientId ? Number(form.clientId) : null,
      });
      navigate('/veterinary');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create prescription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create Prescription</h1>
        <p className="text-sm text-gray-500">Issue a prescription with dosing and quantity details.</p>
      </div>

      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Prescription Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Input
                label="Rx Number"
                value={form.prescriptionNumber}
                onChange={e => setForm({ ...form, prescriptionNumber: e.target.value })}
                required
              />
              <Input
                label="Drug Name"
                value={form.drugName}
                onChange={e => setForm({ ...form, drugName: e.target.value })}
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
            </div>
            <Textarea
              label="Dosage Instructions"
              rows={3}
              value={form.dosageInstruction}
              onChange={e => setForm({ ...form, dosageInstruction: e.target.value })}
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate('/veterinary')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrescriptionForm;
