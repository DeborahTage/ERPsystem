import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vetApi, farmApi, flockApi } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';

const TreatmentForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ farmId: '', flockId: '', diseaseCaseId: '', drugName: '', dosage: '', route: '', duration: '', startDate: '', endDate: '', outcome: '' });
  const [farms, setFarms] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [cases, setCases] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    farmApi.getAll().then(r => setFarms(r.data.data?.filter(f => f.status === 'ACTIVE') || []));
    vetApi.getDiseaseCases().then(r => setCases(r.data.data?.filter(c => c.status === 'ACTIVE') || []));
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
      await vetApi.createTreatment({
        ...form,
        farmId: Number(form.farmId),
        flockId: Number(form.flockId),
        diseaseCaseId: form.diseaseCaseId ? Number(form.diseaseCaseId) : null,
      });
      navigate('/veterinary');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to record treatment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Record Treatment</h1>
        <p className="text-sm text-gray-500">Document treatment plans and outcomes for veterinary care.</p>
      </div>

      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Treatment Information</CardTitle>
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
              <Select
                label="Disease Case"
                value={form.diseaseCaseId}
                onChange={e => setForm(prev => ({ ...prev, diseaseCaseId: e.target.value }))}
                options={[{ value: '', label: '-- None --' }, ...cases.map(caseItem => ({ value: String(caseItem.id), label: `${caseItem.suspectedDisease} (${caseItem.farmName})` }))]}
              />
              <Input
                label="Drug Name"
                value={form.drugName}
                onChange={e => setForm(prev => ({ ...prev, drugName: e.target.value }))}
                required
              />
              <Input
                label="Dosage"
                value={form.dosage}
                onChange={e => setForm(prev => ({ ...prev, dosage: e.target.value }))}
              />
              <Input
                label="Route"
                value={form.route}
                onChange={e => setForm(prev => ({ ...prev, route: e.target.value }))}
              />
              <Input
                label="Duration"
                value={form.duration}
                onChange={e => setForm(prev => ({ ...prev, duration: e.target.value }))}
              />
              <Input
                label="Outcome"
                value={form.outcome}
                onChange={e => setForm(prev => ({ ...prev, outcome: e.target.value }))}
              />
              <Input
                label="Start Date"
                type="date"
                value={form.startDate}
                onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
              />
              <Input
                label="End Date"
                type="date"
                value={form.endDate}
                onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))}
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

export default TreatmentForm;
