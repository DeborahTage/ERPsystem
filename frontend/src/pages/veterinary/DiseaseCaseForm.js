import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vetApi, farmApi, flockApi } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';

const DiseaseCaseForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ farmId: '', flockId: '', dateDetected: '', symptoms: '', suspectedDisease: '', numberAffected: '', numberDead: '', severity: 'LOW' });
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
      await vetApi.createDiseaseCase({
        ...form,
        farmId: Number(form.farmId),
        flockId: Number(form.flockId),
        numberAffected: Number(form.numberAffected),
        numberDead: Number(form.numberDead),
      });
      navigate('/veterinary');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to record disease case.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Record Disease Case</h1>
        <p className="text-sm text-gray-500">Log disease outbreaks and track severity for your flocks.</p>
      </div>

      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Disease Case Details</CardTitle>
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
                label="Date Detected"
                type="date"
                value={form.dateDetected}
                onChange={e => setForm(prev => ({ ...prev, dateDetected: e.target.value }))}
              />
              <Input
                label="Suspected Disease"
                value={form.suspectedDisease}
                onChange={e => setForm(prev => ({ ...prev, suspectedDisease: e.target.value }))}
              />
            </div>
            <Textarea
              label="Symptoms"
              rows={3}
              value={form.symptoms}
              onChange={e => setForm(prev => ({ ...prev, symptoms: e.target.value }))}
            />
            <div className="grid gap-4 lg:grid-cols-3">
              <Input
                label="Affected"
                type="number"
                min="0"
                value={form.numberAffected}
                onChange={e => setForm(prev => ({ ...prev, numberAffected: e.target.value }))}
              />
              <Input
                label="Dead"
                type="number"
                min="0"
                value={form.numberDead}
                onChange={e => setForm(prev => ({ ...prev, numberDead: e.target.value }))}
              />
              <Select
                label="Severity"
                value={form.severity}
                onChange={e => setForm(prev => ({ ...prev, severity: e.target.value }))}
                options={['LOW', 'MODERATE', 'HIGH', 'CRITICAL'].map(value => ({ value, label: value }))}
              />
            </div>
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

export default DiseaseCaseForm;
