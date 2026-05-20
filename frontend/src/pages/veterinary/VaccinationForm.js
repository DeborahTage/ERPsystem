import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vetApi, farmApi, flockApi } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';

const VaccinationForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ farmId: '', flockId: '', vaccineName: '', diseaseProtectedAgainst: '', scheduledDate: '', remarks: '' });
  const [farms, setFarms] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    farmApi.getAll().then(r => setFarms(r.data.data?.filter(f => f.status === 'ACTIVE') || []));
  }, []);

  const handleFarmChange = (farmId) => {
    setForm(prev => ({ ...prev, farmId, flockId: '' }));
    if (farmId) {
      flockApi.getAll().then(r => setFlocks(r.data.data?.filter(f => String(f.farmId) === String(farmId) && f.status === 'ACTIVE') || []));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await vetApi.createVaccination({ ...form, farmId: Number(form.farmId), flockId: Number(form.flockId) });
      navigate('/veterinary');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to schedule vaccination.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Schedule Vaccination</h1>
        <p className="text-sm text-gray-500">Create a veterinary vaccination record for flock health planning.</p>
      </div>

      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Vaccination Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Select
                label="Farm"
                value={form.farmId}
                onChange={e => handleFarmChange(e.target.value)}
                options={[{ value: '', label: '-- Select Farm --' }, ...farms.map(farm => ({ value: String(farm.id), label: farm.farmName }))]}
                required
              />
              <Select
                label="Flock"
                value={form.flockId}
                onChange={e => setForm(prev => ({ ...prev, flockId: e.target.value }))}
                options={[{ value: '', label: '-- Select Flock --' }, ...flocks.map(flock => ({ value: String(flock.id), label: flock.batchCode }))]}
                required
              />
              <Input
                label="Vaccine Name"
                value={form.vaccineName}
                onChange={e => setForm(prev => ({ ...prev, vaccineName: e.target.value }))}
                required
              />
              <Input
                label="Disease Protected Against"
                value={form.diseaseProtectedAgainst}
                onChange={e => setForm(prev => ({ ...prev, diseaseProtectedAgainst: e.target.value }))}
              />
              <Input
                label="Scheduled Date"
                type="date"
                value={form.scheduledDate}
                onChange={e => setForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                required
              />
            </div>
            <Textarea
              label="Remarks"
              rows={3}
              value={form.remarks}
              onChange={e => setForm(prev => ({ ...prev, remarks: e.target.value }))}
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={loading}>{loading ? 'Scheduling...' : 'Save'}</Button>
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate('/veterinary')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VaccinationForm;
