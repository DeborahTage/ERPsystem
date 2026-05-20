import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { flockApi } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils';

const FlockList = () => {
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    flockApi.getAll().then(r => setFlocks(r.data.data)).finally(() => setLoading(false));
  }, []);

  const handleClose = async (id) => {
    await flockApi.close(id);
    setFlocks(prev => prev.map(item => item.id === id ? { ...item, status: 'CLOSED' } : item));
  };

  const columns = [
    { key: 'batchCode', label: 'Batch Code' },
    { key: 'farmName', label: 'Farm' },
    { key: 'birdType', label: 'Bird Type' },
    { key: 'initialBirdCount', label: 'Initial Count' },
    { key: 'currentBirdCount', label: 'Current Count' },
    { key: 'startDate', label: 'Start Date', render: r => formatDate(r.startDate) },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: 'Actions',
      render: r => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => navigate(`/flocks/${r.id}/edit`)}>Edit</Button>
          {r.status === 'ACTIVE' && <Button size="sm" variant="danger" onClick={() => handleClose(r.id)}>Close</Button>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Flocks / Batches</h1>
          <p className="text-sm text-gray-500">Manage flock batches and review current status at a glance.</p>
        </div>
        <Button variant="primary" className="w-full sm:w-auto" onClick={() => navigate('/flocks/new')}>+ Add Flock</Button>
      </div>
      <Card>
        <CardContent>
          <DataTable columns={columns} data={flocks} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
};

export default FlockList;
