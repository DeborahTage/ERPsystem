import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dailyRecordApi, farmApi, flockApi } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';

const DailyFarmRecordForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ date: '', farmId: '', flockId: '', openingBirdCount: '', mortality: '0', culledBirds: '0', feedConsumed: '', waterConsumed: '', averageWeight: '', eggProduction: '0', damagedEggs: '0', symptomsOrRemarks: '' });
  const [farms, setFarms] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const farmsRes = await farmApi.getAll();
        setFarms(farmsRes.data.data?.filter(f => f.status === 'ACTIVE') || []);

        if (isEdit) {
          const recordRes = await dailyRecordApi.getById(id);
          const d = recordRes.data.data;
          setForm({
            date: d.date,
            farmId: d.farmId,
            flockId: d.flockId,
            openingBirdCount: d.openingBirdCount || '',
            mortality: d.mortality || '0',
            culledBirds: d.culledBirds || '0',
            feedConsumed: d.feedConsumed || '',
            waterConsumed: d.waterConsumed || '',
            averageWeight: d.averageWeight || '',
            eggProduction: d.eggProduction || '0',
            damagedEggs: d.damagedEggs || '0',
            symptomsOrRemarks: d.symptomsOrRemarks || '',
          });
          const flocksRes = await flockApi.getAll();
          setFlocks(flocksRes.data.data?.filter(f => String(f.farmId) === String(d.farmId) && f.status === 'ACTIVE') || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      }
    };

    loadData();
  }, [id, isEdit]);

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
      const payload = {
        ...form,
        farmId: Number(form.farmId),
        flockId: Number(form.flockId),
        openingBirdCount: Number(form.openingBirdCount),
        mortality: Number(form.mortality),
        culledBirds: Number(form.culledBirds),
        feedConsumed: Number(form.feedConsumed),
        waterConsumed: Number(form.waterConsumed),
        averageWeight: form.averageWeight ? Number(form.averageWeight) : null,
        eggProduction: Number(form.eggProduction),
        damagedEggs: Number(form.damagedEggs),
      };
      if (isEdit) await dailyRecordApi.update(id, payload);
      else await dailyRecordApi.create(payload);
      navigate('/daily-records');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{isEdit ? 'Edit Daily Record' : 'Add Daily Record'}</h1>
        <p className="text-sm text-gray-500">Record daily flock performance and operational metrics in a centralized form.</p>
      </div>

      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Daily Record</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Input
                label="Date"
                type="date"
                value={form.date}
                onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                required
              />
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
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Input label="Opening Bird Count" type="number" min="0" value={form.openingBirdCount} onChange={e => setForm(prev => ({ ...prev, openingBirdCount: e.target.value }))} />
              <Input label="Mortality" type="number" min="0" value={form.mortality} onChange={e => setForm(prev => ({ ...prev, mortality: e.target.value }))} />
              <Input label="Culled Birds" type="number" min="0" value={form.culledBirds} onChange={e => setForm(prev => ({ ...prev, culledBirds: e.target.value }))} />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Input label="Feed Consumed (kg)" type="number" min="0" step="0.01" value={form.feedConsumed} onChange={e => setForm(prev => ({ ...prev, feedConsumed: e.target.value }))} />
              <Input label="Water Consumed (L)" type="number" min="0" step="0.01" value={form.waterConsumed} onChange={e => setForm(prev => ({ ...prev, waterConsumed: e.target.value }))} />
              <Input label="Average Weight (kg)" type="number" min="0" step="0.01" value={form.averageWeight} onChange={e => setForm(prev => ({ ...prev, averageWeight: e.target.value }))} />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Input label="Egg Production" type="number" min="0" value={form.eggProduction} onChange={e => setForm(prev => ({ ...prev, eggProduction: e.target.value }))} />
              <Input label="Damaged Eggs" type="number" min="0" value={form.damagedEggs} onChange={e => setForm(prev => ({ ...prev, damagedEggs: e.target.value }))} />
              <div />
            </div>

            <Textarea
              label="Symptoms / Remarks"
              rows={3}
              value={form.symptomsOrRemarks}
              onChange={e => setForm(prev => ({ ...prev, symptomsOrRemarks: e.target.value }))}
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate('/daily-records')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyFarmRecordForm;
