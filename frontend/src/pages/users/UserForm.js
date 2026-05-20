import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userApi } from '../../api';
import { ROLES } from '../../utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';

const ROLE_OPTIONS = Object.values(ROLES);

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', role: 'FARM_MANAGER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      userApi.getById(id).then(r => {
        const u = r.data.data;
        setForm({ fullName: u.fullName, email: u.email, phone: u.phone || '', password: '', role: u.role });
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) await userApi.update(id, form);
      else await userApi.create(form);
      navigate('/users');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{isEdit ? 'Edit User' : 'Add User'}</h1>
        <p className="text-sm text-gray-500">Manage system users and assign the appropriate role for access.</p>
      </div>

      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Input
                label="Full Name"
                value={form.fullName}
                onChange={e => setForm(prev => ({ ...prev, fullName: e.target.value }))}
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={isEdit}
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
              />
              <Select
                label="Role"
                value={form.role}
                onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                options={ROLE_OPTIONS.map(value => ({ value, label: value.replace(/_/g, ' ') }))}
              />
              <Input
                label={isEdit ? 'New Password (leave blank to keep)' : 'Password'}
                type="password"
                value={form.password}
                onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                required={!isEdit}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate('/users')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserForm;
