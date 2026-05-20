import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    userApi.getAll().then(r => setUsers(r.data.data)).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'role', label: 'Role', render: r => <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{r.role}</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'createdAt', label: 'Created', render: r => formatDate(r.createdAt) },
    {
      key: 'actions', label: 'Actions',
      render: r => <Button size="sm" variant="secondary" onClick={() => navigate(`/users/${r.id}/edit`)}>Edit</Button>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-gray-500">Manage system users, roles, and access levels from one place.</p>
        </div>
        <Button variant="primary" className="w-full sm:w-auto" onClick={() => navigate('/users/new')}>+ Add User</Button>
      </div>
      <Card>
        <CardContent>
          <DataTable columns={columns} data={users} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserList;
