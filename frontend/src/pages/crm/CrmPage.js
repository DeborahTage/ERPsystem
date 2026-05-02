import React, { useEffect, useState } from 'react';
import { Button, Card, Nav, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { crmApi } from '../../api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils';

const CrmPage = () => {
  const [clients, setClients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([crmApi.getClients(), crmApi.getVisits({}), crmApi.getFollowUps()])
      .then(([c, v, f]) => { setClients(c.data.data || []); setVisits(v.data.data || []); setFollowUps(f.data.data || []); })
      .finally(() => setLoading(false));
  }, []);

  const clientCols = [
    { key: 'clientName', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'location', label: 'Location' },
    { key: 'farmType', label: 'Farm Type' },
    { key: 'numberOfBirds', label: 'Birds' },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'assignedExtensionWorkerName', label: 'Extension Worker' },
    { key: 'actions', label: '', render: r => (
      <div className="d-flex gap-1">
        <Button size="sm" variant="outline-primary" onClick={() => navigate(`/crm/clients/${r.id}/edit`)}>Edit</Button>
        <Button size="sm" variant="outline-success" onClick={() => navigate('/crm/visits/new', { state: { clientId: r.id } })}>Visit</Button>
      </div>
    )},
  ];

  const visitCols = [
    { key: 'clientName', label: 'Client' },
    { key: 'visitDate', label: 'Visit Date', render: r => formatDate(r.visitDate) },
    { key: 'visitedBy', label: 'Visited By' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'nextFollowUpDate', label: 'Next Follow-up', render: r => formatDate(r.nextFollowUpDate) },
  ];

  return (
    <div>
      <h5 className="fw-bold mb-3">CRM / Client Records</h5>
      {followUps.length > 0 && (
        <div className="alert alert-warning py-2 small mb-3">
          ⚠️ <strong>{followUps.length}</strong> follow-up(s) are due today or overdue.
        </div>
      )}
      <Tab.Container defaultActiveKey="clients">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item><Nav.Link eventKey="clients">Clients ({clients.length})</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="visits">Farm Visits ({visits.length})</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="followups">Follow-ups <span className="badge bg-warning text-dark">{followUps.length}</span></Nav.Link></Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="clients">
            <div className="d-flex justify-content-end mb-2">
              <Button size="sm" variant="success" onClick={() => navigate('/crm/clients/new')}>+ Add Client</Button>
            </div>
            <Card className="border-0 shadow-sm"><Card.Body><DataTable columns={clientCols} data={clients} loading={loading} /></Card.Body></Card>
          </Tab.Pane>
          <Tab.Pane eventKey="visits">
            <div className="d-flex justify-content-end mb-2">
              <Button size="sm" variant="success" onClick={() => navigate('/crm/visits/new')}>+ Record Visit</Button>
            </div>
            <Card className="border-0 shadow-sm"><Card.Body><DataTable columns={visitCols} data={visits} loading={loading} /></Card.Body></Card>
          </Tab.Pane>
          <Tab.Pane eventKey="followups">
            <Card className="border-0 shadow-sm"><Card.Body><DataTable columns={visitCols} data={followUps} loading={loading} /></Card.Body></Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default CrmPage;
