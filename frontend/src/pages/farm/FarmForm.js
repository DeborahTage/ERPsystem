import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { farmApi, userApi } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { toast } from 'react-toastify';
import { Building2, ArrowLeft, Save } from 'lucide-react';

const FarmForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ 
    farmName: '', 
    location: '', 
    farmType: 'BROILER', 
    capacity: '', 
    assignedFarmManagerId: '' 
  });
  const [managers, setManagers] = useState([]);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    userApi.getAll().then(r => setManagers(r.data.data?.filter(u => u.role === 'FARM_MANAGER') || []));
    if (isEdit) {
      farmApi.getById(id).then(r => {
        const f = r.data.data;
        setForm({ 
          farmName: f.farmName, 
          location: f.location || '', 
          farmType: f.farmType, 
          capacity: f.capacity || '', 
          assignedFarmManagerId: f.assignedFarmManagerId || '' 
        });
      });
    }
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.farmName.trim()) e.farmName = 'Farm name is required';
    if (!form.farmType) e.farmType = 'Farm type is required';
    if (form.capacity && Number(form.capacity) < 0) e.capacity = 'Capacity must be positive';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { 
        ...form, 
        capacity: Number(form.capacity) || 0, 
        assignedFarmManagerId: form.assignedFarmManagerId || null 
      };
      if (isEdit) await farmApi.update(id, payload);
      else await farmApi.create(payload);
      toast.success(`Farm ${isEdit ? 'updated' : 'created'} successfully`);
      navigate('/farms');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving farm');
    } finally {
      setLoading(false);
    }
  };

  const managerOptions = [
    { value: '', label: '-- Select Manager --' },
    ...managers.map(m => ({ value: m.id, label: m.fullName }))
  ];

  const typeOptions = [
    { value: 'BROILER', label: 'Broiler' },
    { value: 'LAYER', label: 'Layer' },
    { value: 'MIXED', label: 'Mixed' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Farm' : 'Add New Farm'}
        description={isEdit ? 'Update farm details and assignments.' : 'Register a new poultry farm in the system.'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Farms', href: '/farms' },
          { label: isEdit ? 'Edit' : 'Add New' }
        ]}
        actions={
          <Button variant="secondary" onClick={() => navigate('/farms')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Farms
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {error}
          <button onClick={() => setError('')} className="ml-2 text-red-600 hover:text-red-800 font-medium">Dismiss</button>
        </div>
      )}

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <CardTitle>Farm Information</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">Enter the basic details of the farm</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Input
                    label="Farm Name *"
                    placeholder="e.g., Sunrise Poultry Farm"
                    value={form.farmName}
                    onChange={e => setForm({ ...form, farmName: e.target.value })}
                    error={errors.farmName}
                  />
                </div>
                
                <Input
                  label="Location"
                  placeholder="e.g., Accra, Ghana"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                />
                
                <Select
                  label="Farm Type *"
                  value={form.farmType}
                  onChange={e => setForm({ ...form, farmType: e.target.value })}
                  options={typeOptions}
                  error={errors.farmType}
                />
                
                <Input
                  label="Capacity"
                  type="number"
                  placeholder="e.g., 5000"
                  value={form.capacity}
                  onChange={e => setForm({ ...form, capacity: e.target.value })}
                  helper="Maximum bird capacity"
                  error={errors.capacity}
                />
                
                <Select
                  label="Farm Manager"
                  value={form.assignedFarmManagerId}
                  onChange={e => setForm({ ...form, assignedFarmManagerId: e.target.value })}
                  options={managerOptions}
                  helper="Assign a manager to this farm"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-1.5" />
                  {loading ? 'Saving...' : isEdit ? 'Update Farm' : 'Create Farm'}
                </Button>
                <Button variant="ghost" type="button" onClick={() => navigate('/farms')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FarmForm;
