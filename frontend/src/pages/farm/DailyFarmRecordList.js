import React, { useEffect, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { dailyRecordApi } from '../../api';
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
      render: r => <Button size="sm" variant="outline-primary" onClick={() => navigate(`/daily-records/${r.id}/edit`)}>Edit</Button>
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Daily Farm Records</h5>
        <Button variant="success" size="sm" onClick={() => navigate('/daily-records/new')}>+ Add Record</Button>
      </div>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <DataTable columns={columns} data={records} loading={loading} />
        </Card.Body>
      </Card>
    </div>
  );
};

export default DailyFarmRecordList;
