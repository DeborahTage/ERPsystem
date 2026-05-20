import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { flockApi, farmApi } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';

const FlockForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ batchCode: '', farmId: '', birdType: '', initialBirdCount: '', startDate: '', expectedEndDate: '' });
  const [farms, setFarms] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    farmApi.getAll().then(r => setFarms(r.data.data?.filter(f => f.status === 'ACTIVE') || []));
    if (isEdit) {
      flockApi.getById(id).then(r => {
        const f = r.data.data;
        setForm({ batchCode: f.batchCode, farmId: f.farmId, birdType: f.birdType || '', initialBirdCount: f.initialBirdCount || '', startDate: f.startDate || '', expectedEndDate: f.expectedEndDate || '' });
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, farmId: Number(form.farmId), initialBirdCount: Number(form.initialBirdCount) };
      if (isEdit) await flockApi.update(id, payload);
      else await flockApi.create(payload);
      navigate('/flocks');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving flock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{isEdit ? 'Edit Flock' : 'Add Flock'}</h1>
        <p className="text-sm text-gray-500">Create or update a flock batch for the farm operation.</p>
      </div>

      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Flock Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Input
                label="Batch Code"
                value={form.batchCode}
                onChange={e => setForm(prev => ({ ...prev, batchCode: e.target.value }))}
                required
                disabled={isEdit}
              />
              <Select
                label="Farm"
                value={form.farmId}
                onChange={e => setForm(prev => ({ ...prev, farmId: e.target.value }))}
                options={[{ value: '', label: '-- Select Farm --' }, ...farms.map(farm => ({ value: String(farm.id), label: farm.farmName }))]}
                required
                disabled={isEdit}
              />
              <Input
                label="Bird Type"
                value={form.birdType}
                onChange={e => setForm(prev => ({ ...prev, birdType: e.target.value }))}
              />
              <Input
                label="Initial Bird Count"
                type="number"
                min="0"
                value={form.initialBirdCount}
                onChange={e => setForm(prev => ({ ...prev, initialBirdCount: e.target.value }))}
                disabled={isEdit}
              />
              <Input
                label="Start Date"
                type="date"
                value={form.startDate}
                onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
              />
              <Input
                label="Expected End Date"
                type="date"
                value={form.expectedEndDate}
                onChange={e => setForm(prev => ({ ...prev, expectedEndDate: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate('/flocks')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlockForm;
