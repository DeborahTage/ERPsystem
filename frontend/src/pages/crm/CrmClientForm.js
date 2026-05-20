import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { crmApi, userApi } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';

const CrmClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ clientName: '', phone: '', location: '', farmType: '', farmSize: '', numberOfBirds: '', status: 'LEAD', assignedExtensionWorkerId: '' });
  const [workers, setWorkers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    userApi.getAll().then(r => setWorkers(r.data.data?.filter(u => u.role === 'EXTENSION_WORKER') || []));
    if (isEdit) {
      crmApi.getClient(id).then(r => {
        const client = r.data.data;
        setForm({
          clientName: client.clientName,
          phone: client.phone || '',
          location: client.location || '',
          farmType: client.farmType || '',
          farmSize: client.farmSize || '',
          numberOfBirds: client.numberOfBirds || '',
          status: client.status,
          assignedExtensionWorkerId: client.assignedExtensionWorkerId || '',
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
        numberOfBirds: form.numberOfBirds ? Number(form.numberOfBirds) : null,
        assignedExtensionWorkerId: form.assignedExtensionWorkerId ? Number(form.assignedExtensionWorkerId) : null,
      };
      if (isEdit) await crmApi.updateClient(id, payload);
      else await crmApi.createClient(payload);
      navigate('/crm');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save client.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{isEdit ? 'Edit Client' : 'Add Client'}</h1>
        <p className="text-sm text-gray-500">Capture the client profile and assign extension support.</p>
      </div>

      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Input
                label="Client Name"
                value={form.clientName}
                onChange={e => setForm({ ...form, clientName: e.target.value })}
                required
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
              <Input
                label="Location"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
              />
              <Input
                label="Farm Type"
                value={form.farmType}
                onChange={e => setForm({ ...form, farmType: e.target.value })}
              />
              <Input
                label="Farm Size"
                value={form.farmSize}
                onChange={e => setForm({ ...form, farmSize: e.target.value })}
              />
              <Input
                label="Number of Birds"
                type="number"
                min="0"
                value={form.numberOfBirds}
                onChange={e => setForm({ ...form, numberOfBirds: e.target.value })}
              />
              <Select
                label="Status"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                options={['LEAD', 'ACTIVE', 'INACTIVE', 'LOST'].map(value => ({ value, label: value }))}
              />
              <Select
                label="Extension Worker"
                value={form.assignedExtensionWorkerId}
                onChange={e => setForm({ ...form, assignedExtensionWorkerId: e.target.value })}
                options={[
                  { value: '', label: '-- None --' },
                  ...workers.map(worker => ({ value: String(worker.id), label: worker.fullName })),
                ]}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate('/crm')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrmClientForm;
