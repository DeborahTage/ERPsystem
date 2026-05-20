import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dailyRecordApi } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import DataTable from '../../components/common/DataTable';
import { formatDate } from '../../utils';

const DailyFarmRecordList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    dailyRecordApi.getAll().then(r => setRecords(r.data.data)).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'date', label: 'Date', render: r => formatDate(r.date) },
    { key: 'farmName', label: 'Farm' },
    { key: 'batchCode', label: 'Batch' },
    { key: 'openingBirdCount', label: 'Opening' },
    { key: 'mortality', label: 'Mortality' },
    { key: 'feedConsumed', label: 'Feed (kg)' },
    { key: 'eggProduction', label: 'Eggs' },
    { key: 'mortalityRate', label: 'Mortality %', render: r => r.mortalityRate ? `${r.mortalityRate.toFixed(2)}%` : '-' },
    { key: 'recordedBy', label: 'Recorded By' },
    {
      key: 'actions', label: 'Actions',
      render: r => <Button size="sm" variant="secondary" onClick={() => navigate(`/daily-records/${r.id}/edit`)}>Edit</Button>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Daily Farm Records</h1>
          <p className="text-sm text-gray-500">Monitor daily production and health metrics across farms and flocks.</p>
        </div>
        <Button variant="primary" className="w-full sm:w-auto" onClick={() => navigate('/daily-records/new')}>+ Add Record</Button>
      </div>
      <Card>
        <CardContent>
          <DataTable columns={columns} data={records} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyFarmRecordList;
