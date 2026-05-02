import React, { useEffect, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../api';
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
    { key: 'role', label: 'Role', render: r => <span className="badge bg-primary">{r.role}</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'createdAt', label: 'Created', render: r => formatDate(r.createdAt) },
    {
      key: 'actions', label: 'Actions',
      render: r => (
        <Button size="sm" variant="outline-primary" onClick={() => navigate(`/users/${r.id}/edit`)}>
          Edit
        </Button>
      )
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Users</h5>
        <Button variant="success" size="sm" onClick={() => navigate('/users/new')}>+ Add User</Button>
      </div>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <DataTable columns={columns} data={users} loading={loading} />
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserList;
