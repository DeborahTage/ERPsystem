import React, { useEffect, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { farmApi } from '../../api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';

const FarmList = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    farmApi.getAll().then(r => setFarms(r.data.data)).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'farmName', label: 'Farm Name' },
    { key: 'location', label: 'Location' },
    { key: 'farmType', label: 'Type' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'assignedFarmManagerName', label: 'Manager' },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: 'Actions',
      render: r => (
        <Button size="sm" variant="outline-primary" onClick={() => navigate(`/farms/${r.id}/edit`)}>Edit</Button>
      )
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Farms</h5>
        <Button variant="success" size="sm" onClick={() => navigate('/farms/new')}>+ Add Farm</Button>
      </div>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <DataTable columns={columns} data={farms} loading={loading} />
        </Card.Body>
      </Card>
    </div>
  );
};

export default FarmList;
