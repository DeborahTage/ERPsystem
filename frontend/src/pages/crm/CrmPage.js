import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crmApi } from '../../api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { KpiCard } from '../../components/ui/KpiCard';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { DataTable, TableHead, TableHeader, TableBody, TableRow, TableCell, EmptyState, LoadingState } from '../../components/ui/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils';
import { Users, CalendarDays, Activity, ClipboardList, Clock3, TrendingUp } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CrmPage = () => {
  const [clients, setClients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('clients');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([crmApi.getClients(), crmApi.getVisits({}), crmApi.getFollowUps()])
      .then(([clientsRes, visitsRes, followUpsRes]) => {
        setClients(clientsRes.data.data || []);
        setVisits(visitsRes.data.data || []);
        setFollowUps(followUpsRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => ({
    totalClients: clients.length,
    upcomingVisits: visits.filter(x => new Date(x.visitDate) >= new Date()).length,
    activeFollowUps: followUps.length,
    averageBirds: clients.length ? Math.round(clients.reduce((sum, c) => sum + (c.numberOfBirds || 0), 0) / clients.length) : 0,
  }), [clients, visits, followUps]);

  const pipelineData = useMemo(() => {
    const statusMap = clients.reduce((acc, client) => {
      const key = client.status || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(statusMap).map(([status, value]) => ({ status, value }));
  }, [clients]);

  const filteredClients = useMemo(() => {
    if (!search) return clients;
    const q = search.toLowerCase();
    return clients.filter(item =>
      item.clientName?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q) ||
      item.farmType?.toLowerCase().includes(q) ||
      item.assignedExtensionWorkerName?.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const filteredVisits = useMemo(() => {
    if (!search) return visits;
    const q = search.toLowerCase();
    return visits.filter(item =>
      item.clientName?.toLowerCase().includes(q) ||
      item.purpose?.toLowerCase().includes(q) ||
      item.visitedBy?.toLowerCase().includes(q)
    );
  }, [visits, search]);

  const filteredFollowUps = useMemo(() => {
    if (!search) return followUps;
    const q = search.toLowerCase();
    return followUps.filter(item =>
      item.clientName?.toLowerCase().includes(q) ||
      item.purpose?.toLowerCase().includes(q)
    );
  }, [followUps, search]);

  const dataForView = useMemo(() => {
    if (view === 'clients') return filteredClients;
    if (view === 'visits') return filteredVisits;
    return filteredFollowUps;
  }, [view, filteredClients, filteredVisits, filteredFollowUps]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM Operations"
        description="Manage clients, schedule farm visits, and keep follow-ups on track with an enterprise-grade CRM experience."
        actions={<Button variant="primary" onClick={() => navigate('/crm/clients/new')}>Add Client</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Clients" value={summary.totalClients} icon={Users} trend="up" trendValue="7%" />
        <KpiCard title="Upcoming Visits" value={summary.upcomingVisits} icon={CalendarDays} subtitle="Next 30 days" />
        <KpiCard title="Follow-ups" value={summary.activeFollowUps} icon={Clock3} trend="down" trendValue="5%" />
        <KpiCard title="Avg Birds" value={summary.averageBirds} icon={Activity} subtitle="per client" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Client Pipeline</CardTitle>
              <p className="text-sm text-gray-500">Current client distribution by status.</p>
            </div>
            <Badge variant="info">Live</Badge>
          </CardHeader>
          <CardContent className="h-[320px]">
            {pipelineData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="status" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', backgroundColor: '#fff' }} />
                  <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">No pipeline data available.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Action Board</CardTitle>
              <p className="text-sm text-gray-500">Quick CRM tasks and next steps.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="secondary" size="md" onClick={() => navigate('/crm/visits/new')}>Schedule Visit</Button>
            <Button variant="secondary" size="md" onClick={() => navigate('/crm/clients/new')}>Create Client</Button>
            <Button variant="secondary" size="md" onClick={() => navigate('/crm/clients')}>Review Lead Pipeline</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>CRM Workbench</CardTitle>
            <p className="text-sm text-gray-500">Filter active client interactions and visits.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input placeholder="Search clients or visits..." value={search} onChange={e => setSearch(e.target.value)} className="min-w-[220px]" />
            <Select
              value={view}
              onChange={e => setView(e.target.value)}
              options={[
                { value: 'clients', label: 'Clients' },
                { value: 'visits', label: 'Visits' },
                { value: 'followups', label: 'Follow-ups' },
              ]}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <DataTable>
              <TableHead>
                {view === 'clients' ? (
                  <>
                    <TableHeader>Client</TableHeader>
                    <TableHeader>Phone</TableHeader>
                    <TableHeader>Location</TableHeader>
                    <TableHeader>Farm Type</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader className="text-right">Actions</TableHeader>
                  </>
                ) : view === 'visits' ? (
                  <>
                    <TableHeader>Client</TableHeader>
                    <TableHeader>Date</TableHeader>
                    <TableHeader>Visited By</TableHeader>
                    <TableHeader>Purpose</TableHeader>
                    <TableHeader>Next Follow-up</TableHeader>
                  </>
                ) : (
                  <>
                    <TableHeader>Client</TableHeader>
                    <TableHeader>Purpose</TableHeader>
                    <TableHeader>Next Follow-up</TableHeader>
                    <TableHeader>Status</TableHeader>
                  </>
                )}
              </TableHead>
              {loading ? (
                <LoadingState cols={view === 'clients' ? 6 : 5} />
              ) : dataForView.length === 0 ? (
                <TableBody>
                  <tr><td colSpan={view === 'clients' ? 6 : 5}><EmptyState title="No records available" description="Try a different filter or add new CRM data." /></td></tr>
                </TableBody>
              ) : (
                <TableBody>
                  {view === 'clients' ? dataForView.map(client => (
                    <TableRow key={client.id}>
                      <TableCell>{client.clientName}</TableCell>
                      <TableCell>{client.phone || '—'}</TableCell>
                      <TableCell>{client.location || '—'}</TableCell>
                      <TableCell>{client.farmType || '—'}</TableCell>
                      <TableCell><StatusBadge status={client.status} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="secondary" size="sm" onClick={() => navigate(`/crm/clients/${client.id}/edit`)}>Edit</Button>
                          <Button variant="primary" size="sm" onClick={() => navigate('/crm/visits/new', { state: { clientId: client.id } })}>Visit</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : view === 'visits' ? dataForView.map(visit => (
                    <TableRow key={visit.id}>
                      <TableCell>{visit.clientName}</TableCell>
                      <TableCell>{formatDate(visit.visitDate)}</TableCell>
                      <TableCell>{visit.visitedBy || '—'}</TableCell>
                      <TableCell>{visit.purpose || '—'}</TableCell>
                      <TableCell>{formatDate(visit.nextFollowUpDate)}</TableCell>
                    </TableRow>
                  )) : dataForView.map(task => (
                    <TableRow key={task.id}>
                      <TableCell>{task.clientName}</TableCell>
                      <TableCell>{task.purpose || '—'}</TableCell>
                      <TableCell>{formatDate(task.nextFollowUpDate)}</TableCell>
                      <TableCell><StatusBadge status={task.status || 'PENDING'} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              )}
            </DataTable>
          </div>
        </CardContent>
        <CardFooter>
          <span className="text-sm text-gray-500">Showing {dataForView.length} records in the CRM workbench.</span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CrmPage;
