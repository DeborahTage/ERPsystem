import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { crmApi } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';

const FarmVisitForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ clientId: location.state?.clientId || '', visitDate: new Date().toISOString().split('T')[0], purpose: '', observation: '', adviceGiven: '', nextFollowUpDate: '' });
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    crmApi.getClients().then(r => setClients(r.data.data || []));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await crmApi.createVisit({ ...form, clientId: Number(form.clientId) });
      navigate('/crm');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to record visit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Record Farm Visit</h1>
        <p className="text-sm text-gray-500">Log visit details and next follow-up actions for your CRM clients.</p>
      </div>

      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Visit Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Select
                label="Client"
                value={form.clientId}
                onChange={e => setForm({ ...form, clientId: e.target.value })}
                options={[{ value: '', label: '-- Select Client --' }, ...clients.map(client => ({ value: String(client.id), label: client.clientName }))]}
                required
              />
              <Input
                label="Visit Date"
                type="date"
                value={form.visitDate}
                onChange={e => setForm({ ...form, visitDate: e.target.value })}
              />
              <Input
                label="Purpose"
                value={form.purpose}
                onChange={e => setForm({ ...form, purpose: e.target.value })}
              />
              <Input
                label="Next Follow-up Date"
                type="date"
                value={form.nextFollowUpDate}
                onChange={e => setForm({ ...form, nextFollowUpDate: e.target.value })}
              />
            </div>
            <div className="grid gap-4">
              <Textarea
                label="Observation"
                rows={3}
                value={form.observation}
                onChange={e => setForm({ ...form, observation: e.target.value })}
              />
              <Textarea
                label="Advice Given"
                rows={3}
                value={form.adviceGiven}
                onChange={e => setForm({ ...form, adviceGiven: e.target.value })}
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

export default FarmVisitForm;
